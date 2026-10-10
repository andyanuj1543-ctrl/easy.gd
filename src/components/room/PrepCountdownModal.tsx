import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Edit3, ArrowRight, Lightbulb } from 'lucide-react';
import { GDTopic } from '../../types/gd';

interface PrepCountdownModalProps {
  topic: GDTopic;
  onFinishPrep: (notes: string) => void;
}

export const PrepCountdownModal: React.FC<PrepCountdownModalProps> = ({ topic, onFinishPrep }) => {
  const [secondsLeft, setSecondsLeft] = useState(60);
  const [scratchpad, setScratchpad] = useState('');

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header with timer */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Silent Preparation Phase</h2>
              <p className="text-xs text-slate-400">Organize your thoughts before the discussion opens</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 border border-amber-500/30 px-3.5 py-1.5 rounded-xl">
            <span className="text-xs text-slate-400">Time:</span>
            <span className="text-lg font-mono font-bold text-amber-400">
              {secondsLeft}s
            </span>
          </div>
        </div>

        {/* Topic Card */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-2">
          <div className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">{topic.category}</div>
          <h3 className="text-base sm:text-lg font-bold text-slate-100">{topic.title}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{topic.description}</p>
        </div>

        {/* Suggested Perspectives */}
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

        {/* Scratchpad */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Quick Notepad / Framework Draft</span>
          </label>
          <textarea
            value={scratchpad}
            onChange={(e) => setScratchpad(e.target.value)}
            placeholder="Jot bullet points (e.g., 1. Define scope, 2. Economic trade-off, 3. Consumer perspective)..."
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">Auto-starts when timer reaches 0s</p>
          <button
            onClick={() => onFinishPrep(scratchpad)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 transition-colors shadow-lg shadow-amber-500/20"
          >
            <span>Ready, Begin GD</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
