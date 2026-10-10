import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Edit3, ArrowRight, Lightbulb, Sparkles, Check } from 'lucide-react';
import { GDTopic } from '../../types/gd';

interface PrepCountdownModalProps {
  topic: GDTopic;
  onFinishPrep: (notes: string) => void;
}

export const PrepCountdownModal: React.FC<PrepCountdownModalProps> = ({ topic, onFinishPrep }) => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [scratchpad, setScratchpad] = useState('');
  const [appliedFramework, setAppliedFramework] = useState<string | null>(null);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onFinishPrep(scratchpad);
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onFinishPrep, scratchpad]);

  // Quick 1-click Framework Template Inserters
  const applyFrameworkTemplate = (name: string, template: string) => {
    setAppliedFramework(name);
    setScratchpad((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed}\n\n${template}` : template;
    });
    setTimeout(() => setAppliedFramework(null), 1200);
  };

  // SVG Circular progress math
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (secondsLeft / 60) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        
        {/* Header with Circular Radial Timer */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Silent Preparation Phase</h2>
              <p className="text-xs text-slate-400">Structure your opening points before the floor opens</p>
            </div>
          </div>

          {/* SVG Radial Countdown Ring */}
          <div className="flex items-center gap-2.5 bg-slate-950 border border-slate-800 px-3.5 py-1.5 rounded-2xl">
            <div className="relative w-9 h-9 flex items-center justify-center">
              <svg className="w-9 h-9 transform -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="18"
                  cy="18"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="text-amber-400 transition-all duration-1000 ease-linear"
                  fill="transparent"
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-bold text-amber-400">
                {secondsLeft}s
              </span>
            </div>
            <span className="text-xs font-semibold text-slate-300 hidden sm:inline">Prep Time</span>
          </div>
        </div>

        {/* Topic Card */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-1.5">
          <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">{topic.category}</div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100">{topic.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{topic.description}</p>
        </div>

        {/* Suggested Strategic Perspectives */}
        <div className="space-y-1.5">
          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Consider These Angles:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {topic.keyPerspectives?.map((kp, idx) => (
              <div key={idx} className="bg-slate-950/40 border border-slate-800/60 rounded-xl px-3 py-2 text-xs text-slate-300">
                • {kp}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Framework Helper Chips */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive Notepad (Insert Framework):</span>
            </label>
            {appliedFramework && (
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <Check className="w-3 h-3" /> Template inserted!
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 pb-1">
            <button
              type="button"
              onClick={() => applyFrameworkTemplate('PESTEL', 'PESTEL Analysis:\n- Political & Legal:\n- Economic / ROI:\n- Social & Human Impact:\n- Technological Feasibility:')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-indigo-300 border border-slate-700 transition-colors"
            >
              + PESTEL
            </button>
            <button
              type="button"
              onClick={() => applyFrameworkTemplate('Pros/Cons', 'Balanced View:\n- Arguments For (Upside):\n- Arguments Against (Downside):\n- Synthesis / Common Ground:')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-emerald-300 border border-slate-700 transition-colors"
            >
              + Pros & Cons
            </button>
            <button
              type="button"
              onClick={() => applyFrameworkTemplate('Timeline', 'Timeline Horizon:\n- Short-Term Execution (0-6 mo):\n- Long-Term Industry Shift (2-5 yr):')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-amber-300 border border-slate-700 transition-colors"
            >
              + Short vs Long Term
            </button>
          </div>

          <textarea
            value={scratchpad}
            onChange={(e) => setScratchpad(e.target.value)}
            placeholder="Jot down your 3 core bullet points here..."
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono transition-colors"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-500 font-mono">Floor opens automatically at 0s</p>
          <button
            onClick={() => onFinishPrep(scratchpad)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition-all shadow-lg shadow-amber-500/20 transform hover:-translate-y-0.5"
          >
            <span>Ready, Begin Discussion</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
