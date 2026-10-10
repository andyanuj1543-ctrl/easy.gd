import React from 'react';
import { Mic, MicOff, Hand, Zap, CheckCircle, Volume2 } from 'lucide-react';

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
    <div className="fixed bottom-5 inset-x-0 z-40 px-4 flex justify-center pointer-events-none">
      <div className="bg-slate-900/90 border border-slate-700/60 rounded-3xl p-2 sm:p-2.5 shadow-2xl backdrop-blur-xl flex items-center gap-2 sm:gap-3 pointer-events-auto ring-1 ring-white/10">
        
        {/* Fishbowl Tag In */}
        {isFishbowlMode && !isInsideCircle && (
          <button
            onClick={onTagInCircle}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-amber-500/25 transform hover:-translate-y-0.5"
          >
            <span>Tag Into Circle</span>
          </button>
        )}

        {/* Primary Mic Toggle */}
        <button
          onClick={onToggleMute}
          className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-lg ${
            !isMuted
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30 ring-2 ring-emerald-400/50'
              : 'bg-rose-950/70 text-rose-300 border border-rose-800/80 hover:bg-rose-900/70 shadow-rose-950/40'
          }`}
          title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
        >
          {!isMuted ? <Mic className="w-4 h-4 animate-pulse" /> : <MicOff className="w-4 h-4" />}
          <span>{!isMuted ? 'Mic Active' : 'Mic Muted'}</span>
        </button>

        {/* Sub-300ms Barge-In / Interrupt Button */}
        {isAiSpeaking && (
          <button
            onClick={onInterruptBargeIn}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white text-xs font-bold shadow-lg shadow-amber-600/30 ring-2 ring-amber-400/50 animate-bounce transition-all transform hover:-translate-y-0.5"
            title="Interrupt AI speaker politely and claim the floor"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Interrupt & Claim Floor</span>
          </button>
        )}

        {/* Raise Hand Button */}
        <button
          onClick={onToggleHand}
          className={`flex items-center gap-2 px-3.5 py-2.5 rounded-2xl text-xs font-semibold border transition-all ${
            hasHandRaised
              ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-md shadow-amber-500/20'
              : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700'
          }`}
          title="Signal to moderator that you want to speak"
        >
          <Hand className="w-4 h-4" />
          <span className="hidden sm:inline">{hasHandRaised ? 'Hand Raised' : 'Raise Hand'}</span>
        </button>

        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

        {/* Finish & Evaluate Button */}
        <button
          onClick={onEndDiscussion}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
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
