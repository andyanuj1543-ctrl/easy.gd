import React from 'react';
import { Volume2, Mic, AlertCircle, Hand } from 'lucide-react';
import { PersonaConfig } from '../../types/gd';

interface AvatarCardProps {
  persona?: PersonaConfig;
  isUser?: boolean;
  userName?: string;
  isSpeaking: boolean;
  isInterrupted?: boolean;
  hasHandRaised?: boolean;
  speakingTimeSec?: number;
  compact?: boolean;
}

export const AvatarCard: React.FC<AvatarCardProps> = ({
  persona,
  isUser = false,
  userName = 'Candidate',
  isSpeaking,
  isInterrupted = false,
  hasHandRaised = false,
  speakingTimeSec = 0,
  compact = false,
}) => {
  const name = isUser ? userName : (persona?.name || 'Participant');
  const role = isUser ? 'You (Candidate)' : (persona?.archetype || 'Participant');
  const avatar = isUser ? '🎓' : (persona?.avatar || '👤');
  const roleType = isUser ? 'user' : (persona?.role || 'candidate');

  const getBorderColor = () => {
    if (isSpeaking) {
      if (isUser) return 'border-emerald-400 glow-emerald ring-2 ring-emerald-400/60 shadow-lg shadow-emerald-500/20';
      if (roleType === 'dominator') return 'border-red-400 glow-red ring-2 ring-red-400/60 shadow-lg shadow-red-500/20';
      if (roleType === 'analyst') return 'border-cyan-400 glow-blue ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-500/20';
      if (roleType === 'moderator') return 'border-indigo-400 ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-500/20';
      return 'border-amber-400 glow-amber ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20';
    }
    if (isUser) return 'border-emerald-500/40 bg-emerald-950/20';
    if (roleType === 'moderator') return 'border-indigo-500/40 bg-indigo-950/20';
    return 'border-slate-800 bg-slate-900/80';
  };

  return (
    <div
      className={`relative rounded-3xl border transition-all duration-300 flex flex-col items-center justify-between p-3.5 sm:p-4 text-center backdrop-blur-md shadow-xl ${getBorderColor()} ${
        compact ? 'w-32 sm:w-36' : 'w-40 sm:w-48'
      }`}
    >
      {/* Hand raised indicator */}
      {hasHandRaised && (
        <div className="absolute -top-3 -right-2 bg-amber-500 text-slate-950 p-1.5 rounded-full shadow-lg shadow-amber-500/30 animate-bounce">
          <Hand className="w-3.5 h-3.5 fill-slate-950" />
        </div>
      )}

      {/* Interrupted badge */}
      {isInterrupted && (
        <div className="absolute -top-2.5 left-2 bg-rose-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-lg shadow-rose-500/30 flex items-center gap-1 animate-pulse">
          <AlertCircle className="w-3 h-3" /> Cut Off
        </div>
      )}

      {/* Avatar Emoji Container */}
      <div className="relative my-1">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-inner transition-transform duration-300 ${
            isSpeaking ? 'scale-110 bg-slate-800 ring-2 ring-white/20' : 'bg-slate-950/90'
          }`}
        >
          <span>{avatar}</span>
        </div>

        {/* Live Audio Waves */}
        {isSpeaking && (
          <div className="absolute -bottom-2 inset-x-0 flex items-center justify-center gap-0.5">
            <span className="w-1 bg-emerald-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.3s' }}></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.2s' }}></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-sound-wave" style={{ animationDelay: '0.4s' }}></span>
          </div>
        )}
      </div>

      {/* Name & Archetype with explicit AI label */}
      <div className="mt-2 w-full">
        <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate flex items-center justify-center gap-1.5">
          <span>{name}</span>
          {isUser ? (
            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono font-bold">YOU</span>
          ) : (
            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 py-0.2 rounded font-mono">AI</span>
          )}
        </h4>
        <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
          {isUser ? role : `${role} (AI)`}
        </p>
      </div>

      {/* Speaking status footer */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          {isSpeaking ? (
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
            </span>
          ) : (
            <span className="text-slate-500">Listening</span>
          )}
        </span>
        <span className="font-mono text-slate-400">{speakingTimeSec}s</span>
      </div>
    </div>
  );
};
