import React, { useState } from 'react';
import { Sparkles, X, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

interface SilentCoachHUDProps {
  currentHint: string;
}

export const SilentCoachHUD: React.FC<SilentCoachHUDProps> = ({ currentHint }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!currentHint || isDismissed) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-8 z-40 max-w-sm sm:max-w-md w-full animate-bounce-subtle">
      <div className="bg-slate-900/95 border border-emerald-500/40 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md glow-emerald text-xs space-y-2">
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
          <div className="flex items-center gap-2 font-semibold text-emerald-400">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>AI Placement Coach (Live Nudge)</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              {isCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="flex items-start gap-2.5 pt-1 text-slate-200 leading-relaxed font-medium">
            <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-[13px]">{currentHint}</p>
          </div>
        )}
      </div>
    </div>
  );
};
