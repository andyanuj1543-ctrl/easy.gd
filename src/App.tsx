import React, { useState, useEffect, useRef } from 'react';
import { 
  GDStage, RoomSettings, PersonaConfig, GDMessage, GDReport, ApiKeysConfig 
} from './types/gd';
import { TOPIC_COLLECTION } from './data/topics';
import { AI_CANDIDATE_PERSONAS } from './data/personas';
import { Navbar } from './components/common/Navbar';
import { SetupModal } from './components/setup/SetupModal';
import { ApiKeyConfigModal } from './components/setup/ApiKeyConfigModal';
import { PrepCountdownModal } from './components/room/PrepCountdownModal';
import { GDRoomView } from './components/room/GDRoomView';
import { DiagnosticReport } from './components/report/DiagnosticReport';
import { AudioEngine } from './services/audioEngine';
import { GDOrchestrator } from './services/gdOrchestrator';
import { generateClientSideReport } from './services/clientReportGenerator';
import { Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [stage, setStage] = useState<GDStage>('setup');
  const [settings, setSettings] = useState<RoomSettings | null>(null);
  const [participants, setParticipants] = useState<PersonaConfig[]>(AI_CANDIDATE_PERSONAS.slice(0, 4));
  const [messages, setMessages] = useState<GDMessage[]>([]);
  
  // Audio & Speaker States
  const [activeSpeakerId, setActiveSpeakerId] = useState<string | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [hasHandRaised, setHasHandRaised] = useState(false);
  const [userVolume, setUserVolume] = useState(0);
  const [currentCoachHint, setCurrentCoachHint] = useState('');
  const [remainingSec, setRemainingSec] = useState(300);

  // Fishbowl mode
  const [isFishbowlInside, setIsFishbowlInside] = useState(true);

  // Evaluation & Report
  const [report, setReport] = useState<GDReport | null>(null);

  // API Keys
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [apiKeys, setApiKeys] = useState<ApiKeysConfig>(() => {
    const saved = localStorage.getItem('easy_gd_api_keys');
    return saved ? JSON.parse(saved) : {
      grokApiKey: '',
      sarvamApiKey: '',
      groqApiKey: '',
      geminiApiKey: ''
    };
  });

  const audioEngineRef = useRef<AudioEngine | null>(null);
  const orchestratorRef = useRef<GDOrchestrator | null>(null);

  const saveApiKeys = (keys: ApiKeysConfig) => {
    setApiKeys(keys);
    localStorage.setItem('easy_gd_api_keys', JSON.stringify(keys));
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngineRef.current?.cleanup();
      orchestratorRef.current?.stop();
    };
  }, []);

  // 1. Setup -> Prep
  const handleStartRoom = (roomSettings: RoomSettings, chosenPersonas: PersonaConfig[]) => {
    setSettings(roomSettings);
    setParticipants(chosenPersonas);
    setRemainingSec(roomSettings.durationMins * 60);
    setIsFishbowlInside(!roomSettings.fishbowlSpectatorMode);
    setMessages([]);
    setReport(null);

    // Transition to 60-second silent prep
    setStage('prep');
  };

  // 2. Prep -> Live GD Room
  const handleFinishPrep = async (scratchpadNotes: string) => {
    if (!settings) return;

    setStage('opening');

    // Initialize Audio Engine
    const audioEngine = new AudioEngine({
      onInterimTranscript: (text) => {
        setInterimTranscript(text);
      },
      onFinalTranscript: (text) => {
        setInterimTranscript('');
        orchestratorRef.current?.registerStudentSpeech(text, false);
      },
      onUserBargeIn: () => {
        // Immediate interruption handling
        setIsAiSpeaking(false);
        setActiveSpeakerId(null);
        orchestratorRef.current?.registerStudentSpeech('...', true);
      },
      onStudentSpeechStart: () => {
        setIsUserSpeaking(true);
      },
      onStudentSpeechEnd: () => {
        setIsUserSpeaking(false);
      },
      onAiSpeechStart: (personaId) => {
        setIsAiSpeaking(true);
        setActiveSpeakerId(personaId);
      },
      onAiSpeechEnd: () => {
        setIsAiSpeaking(false);
        setActiveSpeakerId(null);
      },
      onVolumeChange: (vol) => {
        setUserVolume(vol);
      },
      onError: (err) => {
        console.warn('Audio Engine Notice:', err);
      }
    }, settings.patienceLatencyMs);

    audioEngineRef.current = audioEngine;
    await audioEngine.startMicrophone();

    // Determine Provider
    const provider = apiKeys.grokApiKey ? 'grok' : (apiKeys.groqApiKey ? 'groq' : (apiKeys.geminiApiKey ? 'gemini' : undefined));
    const activeKey = apiKeys.grokApiKey || apiKeys.groqApiKey || apiKeys.geminiApiKey;

    // Initialize GD Orchestrator
    const orchestrator = new GDOrchestrator(
      settings,
      participants,
      {
        onStageChange: (newStage) => {
          setStage(newStage);
          if (newStage === 'evaluating') {
            generateEvaluationReport();
          }
        },
        onNewMessage: async (msg) => {
          setMessages((prev) => [...prev, msg]);

          // If AI spoke, speak audio out loud!
          if (msg.senderId !== 'user') {
            const persona = participants.find((p) => p.id === msg.senderId) || {
              id: 'moderator',
              name: 'Vikram Iyer',
              role: 'moderator',
              archetype: 'Corporate Placement Director',
              avatar: '👨‍💼',
              color: '#6366f1',
              voiceGender: 'male',
              sarvamVoice: 'arvind',
              pitch: 0.95,
              rate: 0.95,
              instructions: '',
              dominanceWeight: 0.2
            } as PersonaConfig;

            await audioEngine.speakAI(msg.text, persona, apiKeys.sarvamApiKey);
          }
        },
        onSpeakerActive: (personaId) => {
          setActiveSpeakerId(personaId);
        },
        onTimeTick: (remSec) => {
          setRemainingSec(remSec);
        },
        onCoachHint: (hint) => {
          setCurrentCoachHint(hint);
        }
      },
      activeKey,
      provider
    );

    orchestratorRef.current = orchestrator;
    orchestrator.start();
  };

  // Toggle Microphone Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngineRef.current?.setMuted(nextMuted);
  };

  // Instant Interruption / Barge-In Button
  const handleInterruptBargeIn = () => {
    audioEngineRef.current?.handleBargeIn();
    setIsMuted(false);
    audioEngineRef.current?.setMuted(false);
    setIsAiSpeaking(false);
    setActiveSpeakerId(null);
  };

  // Raise Hand
  const handleToggleHand = () => {
    setHasHandRaised(!hasHandRaised);
  };

  // End Discussion Early & Generate Report
  const handleEndDiscussion = () => {
    audioEngineRef.current?.stopSpeaking();
    orchestratorRef.current?.stop();
    setStage('evaluating');
    generateEvaluationReport();
  };

  // Generate Recruiter Report
  const generateEvaluationReport = async () => {
    audioEngineRef.current?.stopSpeaking();
    orchestratorRef.current?.stop();

    const currentMsgs = orchestratorRef.current?.getMessages() || messages;
    const provider = apiKeys.grokApiKey ? 'grok' : (apiKeys.groqApiKey ? 'groq' : (apiKeys.geminiApiKey ? 'gemini' : undefined));
    const activeKey = apiKeys.grokApiKey || apiKeys.groqApiKey || apiKeys.geminiApiKey;

    try {
      const res = await fetch('/api/report/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: settings?.topic,
          messages: currentMsgs,
          studentId: 'user',
          studentName: settings?.studentName || 'Candidate',
          totalDurationSec: (settings?.durationMins || 5) * 60,
          participants,
          apiKey: activeKey,
          provider
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        throw new Error('Backend evaluation endpoint returned status ' + res.status);
      }
    } catch (e) {
      console.warn('Backend report evaluation offline, generating client-side report dossier:', e);
      const fallbackReport = generateClientSideReport(
        settings?.topic?.title || 'Group Discussion',
        currentMsgs,
        settings?.studentName || 'Candidate',
        (settings?.durationMins || 5) * 60,
        participants
      );
      setReport(fallbackReport);
    } finally {
      setStage('report');
    }
  };

  // Reset to Lobby
  const handleRestart = () => {
    audioEngineRef.current?.cleanup();
    orchestratorRef.current?.stop();
    setStage('setup');
    setMessages([]);
    setReport(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        stage={stage}
        remainingSec={remainingSec}
        onOpenSettings={() => setIsApiKeyModalOpen(true)}
        onRestartSession={handleRestart}
      />

      {/* Main Content Areas */}
      <main className="flex-1 flex flex-col justify-center">
        {stage === 'setup' && (
          <SetupModal
            onStartRoom={handleStartRoom}
            onOpenSettings={() => setIsApiKeyModalOpen(true)}
          />
        )}

        {stage === 'prep' && settings && (
          <PrepCountdownModal
            topic={settings.topic}
            onFinishPrep={handleFinishPrep}
          />
        )}

        {(stage === 'opening' || stage === 'open_discussion' || stage === 'warning' || stage === 'closing') && settings && (
          <GDRoomView
            settings={settings}
            participants={participants}
            messages={messages}
            activeSpeakerId={activeSpeakerId}
            isAiSpeaking={isAiSpeaking}
            isUserSpeaking={isUserSpeaking}
            interimTranscript={interimTranscript}
            isMuted={isMuted}
            hasHandRaised={hasHandRaised}
            currentCoachHint={currentCoachHint}
            userVolume={userVolume}
            onToggleMute={handleToggleMute}
            onInterruptBargeIn={handleInterruptBargeIn}
            onToggleHand={handleToggleHand}
            onEndDiscussion={handleEndDiscussion}
            isFishbowlInside={isFishbowlInside}
            onTagInFishbowl={() => setIsFishbowlInside(true)}
          />
        )}

        {stage === 'evaluating' && (
          <div className="flex flex-col items-center justify-center p-12 text-center space-y-4 max-w-md mx-auto animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Analyzing Placement Performance</h3>
              <p className="text-xs text-slate-400">
                Evaluating airtime distribution, idea novelty, active listening, and linking quoted moments...
              </p>
            </div>
          </div>
        )}

        {stage === 'report' && report && (
          <DiagnosticReport
            report={report}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* API Key Modal */}
      <ApiKeyConfigModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        config={apiKeys}
        onSave={saveApiKeys}
      />
    </div>
  );
};

export default App;
