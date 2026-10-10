import React from 'react';
import { Mic, MicOff, Hand, Zap, CheckCircle, LogOut } from 'lucide-react';

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
    <div className="fixed bottom-4 inset-x-0 z-40 px-4 flex justify-center pointer-events-none">
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-2xl backdrop-blur-md flex items-center gap-2 sm:gap-4 pointer-events-auto">
        
        {/* Fishbowl Tag In */}
        {isFishbowlMode && !isInsideCircle && (
          <button
            onClick={onTagInCircle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            <span>Tag Into Circle</span>
          </button>
        )}

        {/* Mic Toggle */}
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            !isMuted
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-500/50'
              : 'bg-rose-950/70 text-rose-300 border border-rose-800/80 hover:bg-rose-900/70'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {!isMuted ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
          <span className="hidden sm:inline">{!isMuted ? 'Mic Active' : 'Mic Muted'}</span>
        </button>

        {/* Barge-In / Interrupt Button */}
        {isAiSpeaking && (
          <button
            onClick={onInterruptBargeIn}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 ring-2 ring-amber-400/50 animate-bounce"
            title="Interrupt current AI speaker politely and claim floor"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Interrupt / Claim Floor</span>
          </button>
        )}

        {/* Raise Hand Button */}
        <button
          onClick={onToggleHand}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
            hasHandRaised
              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
              : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
          }`}
          title="Signal to the moderator you want to speak"
        >
          <Hand className="w-4 h-4" />
          <span className="hidden sm:inline">{hasHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
        </button>

        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

        {/* Finish & Evaluate Button */}
        <button
          onClick={onEndDiscussion}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
          title="Conclude early and view recruiter diagnostic report"
        >
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">End & Generate Report</span>
          <span className="md:hidden">Finish</span>
        </button>
      </div>
    </div>
  );
};
