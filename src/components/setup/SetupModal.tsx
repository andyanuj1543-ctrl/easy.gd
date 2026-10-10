import React, { useState } from 'react';
import { 
  Users, MessageSquare, Clock, Globe2, Mic, Play, 
  Sparkles, Layers, BookOpen, AlertCircle, CheckCircle2 
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

  const [panelSize, setPanelSize] = useState<number>(4); // 4 AI participants
  const [format, setFormat] = useState<GDFormat>('placement_classic');
  const [languageMode, setLanguageMode] = useState<GDLanguageMode>('en-IN');
  const [durationMins, setDurationMins] = useState<number>(5);
  const [patienceMs, setPatienceMs] = useState<number>(1200);

  const [micTested, setMicTested] = useState<boolean | null>(null);
  const [testingMic, setTestingMic] = useState<boolean>(false);

  // Test microphone
  const testMicrophone = async () => {
    setTestingMic(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicTested(true);
    } catch (e) {
      setMicTested(false);
    } finally {
      setTestingMic(false);
    }
  };

  const handleStart = () => {
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

    // Pick panel personas based on panel size
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
        <p className="text-sm text-slate-400">
          Practice speaking, floor-reclaiming, and handling aggressive participants with AI candidates. Powered by Grok AI, Sarvam AI & live speech synthesis.
        </p>
      </div>

      {/* Main Configuration Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xl space-y-8 backdrop-blur-md">
        
        {/* Step 1: Candidate Profile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-6 border-b border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Candidate Name</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="Your Name (e.g. Abhishek)"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">Hardware Check (Microphone)</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={testMicrophone}
                disabled={testingMic}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition-colors"
              >
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>{testingMic ? 'Testing...' : 'Test Microphone'}</span>
              </button>
              {micTested === true && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-4 h-4" /> Mic Ready!
                </span>
              )}
              {micTested === false && (
                <span className="flex items-center gap-1.5 text-xs text-rose-400 font-medium">
                  <AlertCircle className="w-4 h-4" /> Denied / Not Found
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Step 2: Topic Selection */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Choose Topic</span>
              </h3>
              <p className="text-xs text-slate-400">Select from real campus placement GD topics or create your own</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCustomTopic(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  !isCustomTopic
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Curated Topics
              </button>
              <button
                type="button"
                onClick={() => setIsCustomTopic(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isCustomTopic
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
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
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      categoryFilter === cat
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
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
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedTopic.id === t.id
                        ? 'border-emerald-500 bg-emerald-950/20 shadow-md ring-1 ring-emerald-500/50'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-medium text-emerald-400">{t.category}</span>
                      <span>~{t.suggestedDurationMins} mins</span>
                    </div>
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-100 line-clamp-2">{t.title}</h4>
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
                  placeholder="Briefly state background constraints or context for the discussion..."
                  rows={2}
                  value={customDesc}
                  onChange={(e) => setCustomDesc(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 3: Panelists & Room Personality */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Panel Size & Personalities</span>
              </h3>
              <p className="text-xs text-slate-400">Configure how many AI participants debate alongside you and the moderator</p>
            </div>

            {/* Panel size selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {[3, 4, 5].map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setPanelSize(size)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    panelSize === size
                      ? 'bg-emerald-600 text-white font-semibold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {size} AI + Mod
                </button>
              ))}
            </div>
          </div>

          {/* Participant preview badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {/* Moderator */}
            <div className="p-2.5 rounded-xl border border-indigo-500/40 bg-indigo-950/20 text-center space-y-1">
              <div className="text-xl">{MODERATOR_PERSONA.avatar}</div>
              <div className="text-xs font-semibold text-indigo-300">{MODERATOR_PERSONA.name}</div>
              <div className="text-[10px] text-slate-400">Moderator / HR</div>
            </div>

            {/* AI Candidates */}
            {AI_CANDIDATE_PERSONAS.slice(0, panelSize).map(p => (
              <div key={p.id} className="p-2.5 rounded-xl border border-slate-800 bg-slate-950/60 text-center space-y-1">
                <div className="text-xl">{p.avatar}</div>
                <div className="text-xs font-semibold text-slate-200">{p.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{p.archetype.replace('The ', '')}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 4: GD Format & Language & Latency */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
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
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Language Flavor</span>
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
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
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
              <option value={8}>8 Minutes (Standard Placement Round)</option>
              <option value={10}>10 Minutes (Intense Endurance)</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Room contains 1 Moderator + {panelSize} AI candidates with unique voices</span>
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
              className="flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
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
