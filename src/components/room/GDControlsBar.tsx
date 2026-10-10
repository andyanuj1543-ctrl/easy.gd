import React from 'react';
import { Mic, MicOff, Hand, Zap, CheckCircle } from 'lucide-react';

interface GDControlsBarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onInterruptBargeIn: () => void;
  isAiSpeaking: boolean;
  hasHandRaised: boolean;
  onToggleHand: () => void;
  onEndDiscussion: () => void;
  isFishbowlMode?: boolean;
  isInsideCircle?: boolean;
  onTagInCircle?: () => void;
}

export const GDControlsBar: React.FC<GDControlsBarProps> = ({
  isMuted,
  onToggleMute,
  onInterruptBargeIn,
  isAiSpeaking,
  hasHandRaised,
  onToggleHand,
  onEndDiscussion,
  isFishbowlMode = false,
  isInsideCircle = true,
  onTagInCircle,
}) => {
  return (
    <div className="fixed bottom-6 inset-x-0 z-40 px-4 flex justify-center pointer-events-none">
      <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-lg flex items-center gap-2 pointer-events-auto">
        
        {/* Fishbowl Tag In */}
        {isFishbowlMode && !isInsideCircle && (
          <button
            onClick={onTagInCircle}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs transition-colors"
          >
            <span>Tag Into Circle</span>
          </button>
        )}

        {/* Primary Mic Toggle */}
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors ${
            !isMuted
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
              : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {!isMuted ? <Mic className="w-3.5 h-3.5 animate-pulse" /> : <MicOff className="w-3.5 h-3.5" />}
          <span>{!isMuted ? 'Mic On' : 'Muted'}</span>
        </button>

        {/* Sub-300ms Barge-In / Interrupt Button */}
        {isAiSpeaking && (
          <button
            onClick={onInterruptBargeIn}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition-colors animate-pulse"
            title="Politely interrupt AI speaker and claim the floor"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>Interrupt & Speak</span>
          </button>
        )}

        {/* Raise Hand Button */}
        <button
          onClick={onToggleHand}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
            hasHandRaised
              ? 'bg-amber-50 border-amber-300 text-amber-800'
              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
          title="Signal to moderator that you want to speak"
        >
          <Hand className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{hasHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Conclude & Generate Report Button */}
        <button
          onClick={onEndDiscussion}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
          title="Conclude early and view recruiter diagnostic report"
        >
          <CheckCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span className="hidden sm:inline">End & View Report</span>
          <span className="sm:hidden">Finish</span>
        </button>
      </div>
    </div>
  );
};
