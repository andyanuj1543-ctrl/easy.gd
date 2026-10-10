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
      <div className="bg-slate-900/95 border border-slate-700/80 rounded-2xl p-2 shadow-xl backdrop-blur-md flex items-center gap-2 pointer-events-auto">
        
        {/* Fishbowl Tag In */}
        {isFishbowlMode && !isInsideCircle && (
          <button
            onClick={onTagInCircle}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors"
          >
            <span>Tag Into Circle</span>
          </button>
        )}

        {/* Primary Mic Toggle */}
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
            !isMuted
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
              : 'bg-rose-900/40 text-rose-300 border border-rose-700/60 hover:bg-rose-900/60'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {!isMuted ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
          <span>{!isMuted ? 'Mic On' : 'Muted'}</span>
        </button>

        {/* Sub-300ms Barge-In / Interrupt Button */}
        {isAiSpeaking && (
          <button
            onClick={onInterruptBargeIn}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-sm transition-colors animate-pulse"
            title="Politely interrupt AI speaker and claim the floor"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Interrupt & Speak</span>
          </button>
        )}

        {/* Raise Hand Button */}
        <button
          onClick={onToggleHand}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
            hasHandRaised
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700/80'
          }`}
          title="Signal to moderator that you want to speak"
        >
          <Hand className="w-4 h-4" />
          <span className="hidden sm:inline">{hasHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
        </button>

        <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block"></div>

        {/* Conclude & Generate Report Button */}
        <button
          onClick={onEndDiscussion}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          title="Conclude early and view recruiter diagnostic report"
        >
          <CheckCircle className="w-4 h-4 text-blue-400" />
          <span className="hidden sm:inline">End & View Report</span>
          <span className="sm:hidden">Finish</span>
        </button>
      </div>
    </div>
  );
};
