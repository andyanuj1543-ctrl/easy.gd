import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, MessageSquare, Clock, Globe2, Mic, Play, 
  Sparkles, Layers, BookOpen, AlertCircle, CheckCircle2, Volume2,
  BrainCircuit, ShieldAlert, Award, Compass, Zap, ArrowRight, Check
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

  // Adaptive difficulty & session type
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
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
      
      {/* HERO SECTION: PRIMARY ACTION STANDS OUT */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-600 rounded-xl p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-indigo-100 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Placement Simulator · Spec v3.0 Master Engine</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Ready for your placement Group Discussion?
          </h1>
          <p className="text-xs text-indigo-100 leading-relaxed">
            Practice live floor-reclaiming, active synthesis, and handling dominant peers. Evaluated against the strict 8-part recruiter rubric (/80).
          </p>
        </div>

        {/* Big Stand-Out Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <button
            type="button"
            onClick={handleStart}
            className="w-full md:w-auto px-6 py-3 rounded-lg bg-white text-indigo-700 font-bold text-sm shadow-md hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Play className="w-4 h-4 fill-indigo-700" />
            <span>Launch Discussion Round</span>
          </button>
        </div>
      </div>

      {/* 2-COLUMN COMPACT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Setup Configuration (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Card 1: Candidate & Quick Audio Check */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>1. Candidate Profile & Audio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="e.g. Abhishek"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">
                  Microphone Test
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startMicTest}
                    disabled={micStatus === 'testing'}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                      micStatus === 'testing'
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{micStatus === 'testing' ? 'Listening...' : 'Test Mic'}</span>
                  </button>

                  {micStatus === 'testing' && (
                    <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full transition-all duration-75"
                        style={{ width: `${micVolume}%` }}
                      />
                    </div>
                  )}

                  {micStatus === 'success' && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Working
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Difficulty & Training Mode */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              <span>2. Adaptive Training Mode</span>
            </h3>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-600">
                    AI Opposition Level
                  </label>
                  <span className="text-[10px] text-indigo-600 font-semibold">
                    Auto-shifts based on score
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced', 'Brutal'] as GDDifficulty[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setDifficulty(lvl)}
                      className={`py-1.5 px-1 text-center rounded-lg text-xs font-medium border transition-colors ${
                        difficulty === lvl
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Session Focus
                  </label>
                  <select
                    value={sessionType}
                    onChange={(e) => setSessionType(e.target.value as GDSessionType)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Practice Session">Practice Session (Full /80 Scorecard)</option>
                    <option value="Drill Session">Drill Session (Floor Entry & Interruption)</option>
                    <option value="Pressure Session">Pressure Session (Aggressive Counter)</option>
                    <option value="Leadership Session">Leadership Session (Consensus & Synthesis)</option>
                    <option value="Summary Session">Summary Session (Closing Focus)</option>
                    <option value="Evaluation Session">Evaluation Session (Placement Mock)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Round Duration
                  </label>
                  <select
                    value={durationMins}
                    onChange={(e) => setDurationMins(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
                  >
                    <option value={3}>3 Minutes (Rapid Sprint)</option>
                    <option value={5}>5 Minutes (Standard Practice)</option>
                    <option value={8}>8 Minutes (Full Placement Round)</option>
                    <option value={10}>10 Minutes (Extended Round)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: AI Panel Roster */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>3. Selected AI Panel ({panelSize} AI Peers + 1 HR Chair)</span>
              </h3>
              <div className="flex items-center gap-1">
                {[3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setPanelSize(num)}
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                      panelSize === num
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
              {/* HR Moderator */}
              <div className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/50 text-center">
                <div className="text-lg">👨‍💼</div>
                <div className="text-xs font-bold text-indigo-900 mt-1">Vikram Iyer</div>
                <div className="text-[10px] text-indigo-600 font-medium">HR Panel Chair</div>
              </div>

              {/* Dynamic Candidate Personas */}
              {AI_CANDIDATE_PERSONAS.slice(0, panelSize).map(p => (
                <div key={p.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-center">
                  <div className="text-lg">{p.avatar}</div>
                  <div className="text-xs font-semibold text-slate-800 mt-1 truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{p.archetype.replace('The ', '')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Topic Selection Library (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Discussion Topic Library</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Real placement questions from Indian campus drives</p>
            </div>

            <button
              type="button"
              onClick={() => setIsCustomTopic(!isCustomTopic)}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100"
            >
              {isCustomTopic ? 'Curated' : '+ Custom'}
            </button>
          </div>

          {!isCustomTopic ? (
            <div className="space-y-3">
              {/* Category Filter Chips */}
              <div className="flex flex-wrap gap-1">
                {['All', 'Placement Classic', 'Tech & AI', 'Case Study', 'Controversial', 'Abstract'].map(cat => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Scrollable Topic Cards */}
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {filteredTopics.map((topic) => {
                  const isSelected = selectedTopic.id === topic.id;
                  return (
                    <div
                      key={topic.id}
                      onClick={() => setSelectedTopic(topic)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                          : 'border-slate-200 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[9px] font-semibold text-indigo-700 bg-indigo-100/60 px-1.5 py-0.5 rounded">
                          {topic.category}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] text-indigo-700 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-indigo-700" /> Active
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-semibold text-slate-900 leading-snug">{topic.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{topic.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Topic Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Is Moonlighting ethical in Indian IT?"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Scenario Background</label>
                <textarea
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  placeholder="Give background context or specific questions for the panel..."
                  rows={4}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
