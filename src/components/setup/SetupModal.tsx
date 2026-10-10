import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageSquare, Clock, Globe2, Mic, Play, 
  Sparkles, Layers, BookOpen, AlertCircle, CheckCircle2, Volume2,
  BrainCircuit, ShieldAlert, Award, Compass, Zap
} from 'lucide-react';
import { GDFormat, GDLanguageMode, GDTopic, RoomSettings, PersonaConfig, GDDifficulty, GDSessionType } from '../../types/gd';
import { TOPIC_COLLECTION } from '../../data/topics';
import { AI_CANDIDATE_PERSONAS } from '../../data/personas';
import { SelfUpgradeEngine } from '../../services/selfUpgradeEngine';

interface SetupModalProps {
  onStartRoom: (settings: RoomSettings, selectedPersonas: PersonaConfig[]) => void;
  onOpenSettings: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ onStartRoom, onOpenSettings }) => {
  const profile = SelfUpgradeEngine.getProfile();

  const [studentName, setStudentName] = useState('Abhishek');
  const [selectedTopic, setSelectedTopic] = useState<GDTopic>(TOPIC_COLLECTION[0]);
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Adaptive difficulty & session type from Master Spec v3.0
  const [difficulty, setDifficulty] = useState<GDDifficulty>(profile.currentDifficulty || 'Beginner');
  const [sessionType, setSessionType] = useState<GDSessionType>('Practice Session');

  const [panelSize, setPanelSize] = useState<number>(4);
  const [format, setFormat] = useState<GDFormat>('placement_classic');
  const [languageMode, setLanguageMode] = useState<GDLanguageMode>('en-IN');
  const [durationMins, setDurationMins] = useState<number>(5);
  const [patienceMs, setPatienceMs] = useState<number>(1200);

  // Live microphone test
  const [micStatus, setMicStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [micVolume, setMicVolume] = useState<number>(0);
  const micStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const startMicTest = async () => {
    setMicStatus('testing');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicVolume(Math.min(100, Math.round((avg / 80) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();

      setTimeout(() => {
        stopMicTest();
        setMicStatus('success');
      }, 3000);
    } catch (err) {
      setMicStatus('error');
    }
  };

  const stopMicTest = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    if (audioContextRef.current) {
      try { audioContextRef.current.close(); } catch (e) {}
      audioContextRef.current = null;
    }
    setMicVolume(0);
  };

  useEffect(() => {
    return () => stopMicTest();
  }, []);

  const handleStart = () => {
    stopMicTest();
    const finalTopic: GDTopic = isCustomTopic
      ? {
          id: 'custom-' + Date.now(),
          title: customTitle.trim() || 'Custom Group Discussion Topic',
          description: customDesc.trim() || 'Custom topic discussion defined by the candidate.',
          category: 'Placement Classic',
          keyPerspectives: ['Economic impact', 'Operational feasibility', 'Ethical considerations'],
          suggestedDurationMins: durationMins,
          difficulty
        }
      : { ...selectedTopic, difficulty };

    const chosenPersonas = AI_CANDIDATE_PERSONAS.slice(0, panelSize);

    const settings: RoomSettings = {
      topic: finalTopic,
      format,
      difficulty,
      sessionType,
      languageMode,
      panelSize,
      durationMins,
      studentName: studentName.trim() || 'Candidate',
      patienceLatencyMs: patienceMs,
      fishbowlSpectatorMode: format === 'fishbowl',
    };

    onStartRoom(settings, chosenPersonas);
  };

  // Combine curated topics with any dynamically learned topics from profile
  const dynamicTopics: GDTopic[] = (profile.dynamicTopicsAdded || []).map((t, idx) => ({
    id: `dynamic-${idx}`,
    title: t,
    category: 'Follow-up Drill',
    description: 'Dynamic topic synthesized by the self-upgrade engine based on your previous discussion performance.',
    keyPerspectives: ['Causal impact', 'Strategic roadmap', 'Implementation challenges'],
    suggestedDurationMins: 5,
    difficulty
  }));

  const allAvailableTopics = [...dynamicTopics, ...TOPIC_COLLECTION];
  const filteredTopics = categoryFilter === 'All' 
    ? allAvailableTopics 
    : allAvailableTopics.filter(t => t.category === categoryFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      
      {/* Header Banner - Linear inspired */}
      <div className="border border-slate-800 bg-slate-900/90 rounded-2xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Self-Upgrading Engine · Session #{profile.totalSessions + 1}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Placement GD Arena
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Practice live group discussions against adaptive AI participants. Built for campus placements and competitive rounds.
          </p>
        </div>

        {/* Quick Stats Pill */}
        <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-xl self-start sm:self-auto">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Current Level</div>
            <div className="text-sm font-semibold text-slate-200">{difficulty}</div>
          </div>
          <div className="h-7 w-px bg-slate-800"></div>
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Completed</div>
            <div className="text-sm font-semibold text-blue-400">{profile.totalSessions} Sessions</div>
          </div>
        </div>
      </div>

      {/* Main Configuration Card */}
      <div className="border border-slate-800 bg-slate-900/90 rounded-2xl p-6 sm:p-7 space-y-7">
        
        {/* Row 1: Candidate Name & Live Mic Test */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6 border-b border-slate-800/80">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Candidate Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Your Name (e.g. Abhishek)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Microphone Check
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={startMicTest}
                disabled={micStatus === 'testing'}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                  micStatus === 'testing'
                    ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Mic className="w-3.5 h-3.5 text-blue-400" />
                <span>{micStatus === 'testing' ? 'Listening...' : 'Test Mic'}</span>
              </button>

              {micStatus === 'testing' && (
                <div className="flex items-center gap-1.5 flex-1 max-w-[140px] bg-slate-950 px-2 py-2 rounded-xl border border-slate-800">
                  <Volume2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-500 h-full transition-all duration-75"
                      style={{ width: `${micVolume}%` }}
                    />
                  </div>
                </div>
              )}

              {micStatus === 'success' && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mic Ready
                </span>
              )}

              {micStatus === 'error' && (
                <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium bg-rose-500/10 px-3 py-2 rounded-xl border border-rose-500/20">
                  <AlertCircle className="w-3.5 h-3.5" /> Blocked
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Row 2: Adaptive Difficulty & Session Type (Master Spec v3.0) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pb-6 border-b border-slate-800/80">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              AI Participant Difficulty (Auto-adapts from scores)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Beginner', 'Intermediate', 'Advanced', 'Brutal'] as GDDifficulty[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setDifficulty(lvl)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium border transition-colors ${
                    difficulty === lvl
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {difficulty === 'Beginner' && 'Polite, calm pace, ample space to practice speaking.'}
              {difficulty === 'Intermediate' && 'Competitive, interrupts occasionally, challenges claims.'}
              {difficulty === 'Advanced' && 'Fast-paced, data-heavy, tests calm under high pressure.'}
              {difficulty === 'Brutal' && 'Dominating, chaotic cross-talk, tests elite floor reclaiming.'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Session Training Mode
            </label>
            <select
              value={sessionType}
              onChange={(e) => setSessionType(e.target.value as GDSessionType)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="Practice Session">Practice Session (Standard GD + 8-Part Scorecard)</option>
              <option value="Drill Session">Drill Session (Targeted Floor Entry & Reclaiming)</option>
              <option value="Pressure Session">Pressure Session (Brutal Resistance & Interruption)</option>
              <option value="Leadership Session">Leadership Session (Consensus & Synthesis Focus)</option>
              <option value="Summary Session">Summary Session (Closing Round Specialization)</option>
              <option value="Evaluation Session">Evaluation Session (Full Placement Benchmark Test)</option>
            </select>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {sessionType === 'Practice Session' && 'Simulates real corporate placement panel with post-round scorecard.'}
              {sessionType === 'Drill Session' && 'Tests rapid turn-taking and jumping into active conversation.'}
              {sessionType === 'Pressure Session' && 'AI participants will aggressively contest your points.'}
              {sessionType === 'Leadership Session' && 'Focus on drawing in quiet peers and building consensus.'}
              {sessionType === 'Summary Session' && 'Trains synthesizing multiple perspectives before time runs out.'}
              {sessionType === 'Evaluation Session' && 'Official mock assessment scored against corporate hiring rubrics.'}
            </p>
          </div>
        </div>

        {/* Row 3: Topic Selection */}
        <div className="space-y-3 pb-6 border-b border-slate-800/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Discussion Topic
              </h3>
              <p className="text-xs text-slate-400">Select real placement GD prompts or create a custom scenario</p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setIsCustomTopic(false)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  !isCustomTopic
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Curated Topics
              </button>
              <button
                type="button"
                onClick={() => setIsCustomTopic(true)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  isCustomTopic
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                + Custom Topic
              </button>
            </div>
          </div>

          {!isCustomTopic ? (
            <div className="space-y-3">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Placement Classic', 'Tech & AI', 'Case Study', 'Controversial', 'Follow-up Drill'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      categoryFilter === cat
                        ? 'bg-slate-800 text-blue-400 border-blue-500/40'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Topics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {filteredTopics.map((topic) => {
                  const isSelected = selectedTopic.id === topic.id;
                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-950/20 shadow-sm'
                          : 'border-slate-800/90 bg-slate-950/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-medium text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {topic.category}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Selected
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">{topic.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{topic.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Topic Title (e.g. Is Hybrid Work Sustainable for Indian IT?)"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
              <textarea
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                placeholder="Background context or specific question prompt..."
                rows={2}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}
        </div>

        {/* Row 4: AI Panelists Selection & Size */}
        <div className="space-y-3 pb-6 border-b border-slate-800/80">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                AI Participant Roster ({panelSize} AI Peers + 1 HR Moderator)
              </h3>
              <p className="text-xs text-slate-400">Diverse behavioral personas calibrated for placement simulation</p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[3, 4, 5, 6].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setPanelSize(num)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    panelSize === num
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {num} AI
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2.5">
            {/* Moderator */}
            <div className="p-2.5 rounded-xl border border-blue-500/30 bg-blue-950/15 text-center flex flex-col justify-between">
              <div>
                <div className="text-xl">👨‍💼</div>
                <div className="text-xs font-semibold text-slate-200 mt-1">Vikram Iyer</div>
                <div className="text-[10px] text-blue-400">HR Moderator</div>
              </div>
              <span className="text-[9px] bg-blue-500/10 text-blue-300 py-0.5 px-1.5 rounded font-mono mt-1 border border-blue-500/20">
                Panel Chair
              </span>
            </div>

            {/* AI Candidates */}
            {AI_CANDIDATE_PERSONAS.slice(0, panelSize).map(p => (
              <div key={p.id} className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-center flex flex-col justify-between hover:border-slate-700 transition-colors">
                <div>
                  <div className="text-xl">{p.avatar}</div>
                  <div className="text-xs font-semibold text-slate-200 mt-1">{p.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{p.archetype}</div>
                </div>
                <span className="text-[9px] bg-slate-800 text-slate-300 py-0.5 px-1.5 rounded font-mono mt-1">
                  {p.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Row 5: Format, Language, Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Format
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as GDFormat)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="placement_classic">Placement GD (Open Round)</option>
              <option value="case_study">Case-Study GD (Frameworks)</option>
              <option value="abstract">Abstract Lateral GD</option>
              <option value="controversial">Controversial / Policy Debate</option>
              <option value="fishbowl">Fishbowl Mode (Observe First)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Language Cadence
            </label>
            <select
              value={languageMode}
              onChange={(e) => setLanguageMode(e.target.value as GDLanguageMode)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value="en-IN">Indian English (Formal Campus)</option>
              <option value="hinglish">Hinglish (Colloquial Campus)</option>
              <option value="en-US">Global English</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Duration
            </label>
            <select
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-blue-500"
            >
              <option value={3}>3 Minutes (Rapid Sprint)</option>
              <option value={5}>5 Minutes (Standard Practice)</option>
              <option value={8}>8 Minutes (Full Round)</option>
              <option value={10}>10 Minutes (Extended Round)</option>
            </select>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            <span>Ready: 1 Moderator + {panelSize} AI Peers • {durationMins} Mins • Level: {difficulty}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors w-1/3 sm:w-auto text-center"
            >
              API Keys
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-sm transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Start Discussion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
