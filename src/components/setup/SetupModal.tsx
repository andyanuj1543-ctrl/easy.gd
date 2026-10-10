import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageSquare, Clock, Globe2, Mic, Play, 
  Sparkles, Layers, BookOpen, AlertCircle, CheckCircle2, ChevronRight, Volume2 
} from 'lucide-react';
import { GDFormat, GDLanguageMode, GDTopic, RoomSettings, PersonaConfig } from '../../types/gd';
import { TOPIC_COLLECTION } from '../../data/topics';
import { AI_CANDIDATE_PERSONAS, MODERATOR_PERSONA } from '../../data/personas';

interface SetupModalProps {
  onStartRoom: (settings: RoomSettings, selectedPersonas: PersonaConfig[]) => void;
  onOpenSettings: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ onStartRoom, onOpenSettings }) => {
  const [studentName, setStudentName] = useState('Abhishek');
  const [selectedTopic, setSelectedTopic] = useState<GDTopic>(TOPIC_COLLECTION[0]);
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const [panelSize, setPanelSize] = useState<number>(4);
  const [format, setFormat] = useState<GDFormat>('placement_classic');
  const [languageMode, setLanguageMode] = useState<GDLanguageMode>('en-IN');
  const [durationMins, setDurationMins] = useState<number>(5);
  const [patienceMs, setPatienceMs] = useState<number>(1200);

  // Live microphone test with volume meter
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

      // Automatically declare success after 3.5 seconds of live metering
      setTimeout(() => {
        stopMicTest();
        setMicStatus('success');
      }, 3500);
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
        }
      : selectedTopic;

    const chosenPersonas = AI_CANDIDATE_PERSONAS.slice(0, panelSize);

    const settings: RoomSettings = {
      topic: finalTopic,
      format,
      languageMode,
      panelSize,
      durationMins,
      studentName: studentName.trim() || 'Candidate',
      patienceLatencyMs: patienceMs,
      fishbowlSpectatorMode: format === 'fishbowl',
    };

    onStartRoom(settings, chosenPersonas);
  };

  const filteredTopics = categoryFilter === 'All' 
    ? TOPIC_COLLECTION 
    : TOPIC_COLLECTION.filter(t => t.category === categoryFilter);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      {/* Hero Welcome */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Campus Placement Group Discussion Simulator</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Enter the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">GD Arena</span>
        </h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Practice speaking, floor-reclaiming, and handling aggressive participants with AI candidates. Powered by Grok AI, Sarvam AI & live speech synthesis.
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-2xl space-y-8 backdrop-blur-md">
        
        {/* Step 1: Candidate Profile & Live Mic Readiness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              1. Candidate Name
            </label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Your Name (e.g. Abhishek)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
              2. Hardware Audio Check
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={startMicTest}
                disabled={micStatus === 'testing'}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border transition-all ${
                  micStatus === 'testing'
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50 animate-pulse'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                }`}
              >
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>{micStatus === 'testing' ? 'Listening...' : 'Test Microphone'}</span>
              </button>

              {/* Live VU Meter during test */}
              {micStatus === 'testing' && (
                <div className="flex items-center gap-1.5 flex-1 max-w-[140px] bg-slate-950 px-2 py-2 rounded-xl border border-slate-800">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full transition-all duration-75"
                      style={{ width: `${micVolume}%` }}
                    />
                  </div>
                </div>
              )}

              {micStatus === 'success' && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" /> Ready!
                </span>
              )}

              {micStatus === 'error' && (
                <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium bg-rose-950/30 px-3 py-1.5 rounded-xl border border-rose-800/40">
                  <AlertCircle className="w-4 h-4" /> Permission Denied
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Topic Selection */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Choose Topic</span>
              </h3>
              <p className="text-xs text-slate-400">Select real placement GD prompts or create a custom scenario</p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setIsCustomTopic(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !isCustomTopic
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Curated Topics
              </button>
              <button
                type="button"
                onClick={() => setIsCustomTopic(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isCustomTopic
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                + Custom Topic
              </button>
            </div>
          </div>

          {!isCustomTopic ? (
            <div className="space-y-3">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Placement Classic', 'Tech & AI', 'Case Study', 'Controversial', 'Abstract'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      categoryFilter === cat
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 border border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Topic Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto pr-1">
                {filteredTopics.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTopic(t)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                      selectedTopic.id === t.id
                        ? 'border-emerald-500 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/50 transform -translate-y-0.5'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-semibold text-emerald-400">{t.category}</span>
                      <span className="font-mono text-slate-500">~{t.suggestedDurationMins} mins</span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-100 line-clamp-2">{t.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{t.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Custom Topic Title</label>
                <input
                  type="text"
                  placeholder="e.g. Electric Vehicles vs Hydrogen: The Future of Mobility in India"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Context & Background (Optional)</label>
                <textarea
                  placeholder="State constraints or background for the panel..."
                  rows={2}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Panel Size & Behavioral Archetypes */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Panel Setup & Behavioral Personas</span>
              </h3>
              <p className="text-xs text-slate-400">Different psychological profiles designed to challenge your room presence</p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[3, 4, 5].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPanelSize(size)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    panelSize === size
                      ? 'bg-emerald-600 text-white font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size} AI + Mod
                </button>
              ))}
            </div>
          </div>

          {/* Participant Persona Preview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {/* Moderator */}
            <div className="p-3 rounded-2xl border border-indigo-500/40 bg-indigo-950/20 text-center space-y-1.5 flex flex-col justify-between">
              <div>
                <div className="text-2xl">{MODERATOR_PERSONA.avatar}</div>
                <div className="text-xs font-bold text-indigo-300 mt-1">{MODERATOR_PERSONA.name}</div>
                <div className="text-[10px] text-slate-400">Moderator / HR</div>
              </div>
              <span className="text-[9px] bg-indigo-500/10 text-indigo-300 py-0.5 px-1.5 rounded-full border border-indigo-500/20 font-mono">
                Rule Keeper
              </span>
            </div>

            {/* AI Candidates */}
            {AI_CANDIDATE_PERSONAS.slice(0, panelSize).map(p => {
              const tagMap: Record<string, string> = {
                dominator: 'Fast Interrupter',
                analyst: 'Demands Data',
                quiet: 'Ethical Nuance',
                drifter: 'Hinglish Diverger',
                diplomat: 'Consensus Maker'
              };
              return (
                <div key={p.id} className="p-3 rounded-2xl border border-slate-800 bg-slate-950/60 text-center space-y-1.5 flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="text-2xl">{p.avatar}</div>
                    <div className="text-xs font-bold text-slate-200 mt-1">{p.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{p.archetype.replace('The ', '')}</div>
                  </div>
                  <span className="text-[9px] bg-slate-800 text-slate-300 py-0.5 px-1.5 rounded-full font-mono">
                    {tagMap[p.role] || 'Panelist'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 4: GD Format & Language & Session Duration */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Discussion Format</span>
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as GDFormat)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="placement_classic">Standard Placement GD</option>
              <option value="case_study">Case-Study GD (Framework Heavy)</option>
              <option value="abstract">Abstract Lateral GD</option>
              <option value="controversial">Controversial / Policy Debate</option>
              <option value="fishbowl">Fishbowl Mode (Observe Round 1)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Language Cadence</span>
            </label>
            <select
              value={languageMode}
              onChange={(e) => setLanguageMode(e.target.value as GDLanguageMode)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="en-IN">Indian English (Formal Campus)</option>
              <option value="hinglish">Hinglish (Colloquial Campus)</option>
              <option value="en-US">Global / Neutral English</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Session Duration</span>
            </label>
            <select
              value={durationMins}
              onChange={(e) => setDurationMins(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value={3}>3 Minutes (Sprint Practice)</option>
              <option value={5}>5 Minutes (Recommended)</option>
              <option value={8}>8 Minutes (Full Placement Round)</option>
              <option value={10}>10 Minutes (Extended Round)</option>
            </select>
          </div>
        </div>

        {/* Footer Action Bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Ready: 1 Moderator + {panelSize} AI Peers • {durationMins} Mins Discussion</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onOpenSettings}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors w-1/3 sm:w-auto text-center"
            >
              API Keys
            </button>
            <button
              type="button"
              onClick={handleStart}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Enter GD Room</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
