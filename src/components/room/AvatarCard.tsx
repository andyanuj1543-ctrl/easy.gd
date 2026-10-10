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
      if (isUser) return 'border-emerald-500 glow-emerald ring-2 ring-emerald-500/50';
      if (roleType === 'dominator') return 'border-red-500 glow-red ring-2 ring-red-500/50';
      if (roleType === 'analyst') return 'border-cyan-500 glow-blue ring-2 ring-cyan-500/50';
      if (roleType === 'moderator') return 'border-indigo-500 ring-2 ring-indigo-500/50';
      return 'border-amber-500 glow-amber ring-2 ring-amber-500/50';
    }
    if (isUser) return 'border-emerald-500/30';
    if (roleType === 'moderator') return 'border-indigo-500/30';
    return 'border-slate-800';
  };

  return (
    <div
      className={`relative rounded-2xl bg-slate-900/90 border transition-all duration-300 flex flex-col items-center justify-between p-3.5 sm:p-4 text-center ${getBorderColor()} ${
        compact ? 'w-32 sm:w-36' : 'w-40 sm:w-48'
      }`}
    >
      {/* Hand raised indicator */}
      {hasHandRaised && (
        <div className="absolute -top-3 -right-2 bg-amber-500 text-slate-950 p-1 rounded-full shadow-lg animate-bounce">
          <Hand className="w-4 h-4 fill-slate-950" />
        </div>
      )}

      {/* Interrupted badge */}
      {isInterrupted && (
        <div className="absolute -top-2.5 left-2 bg-rose-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1 animate-pulse">
          <AlertCircle className="w-3 h-3" /> Cut Off
        </div>
      )}

      {/* Avatar Emoji Container */}
      <div className="relative my-1">
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl shadow-inner transition-transform duration-300 ${
            isSpeaking ? 'scale-110 bg-slate-800' : 'bg-slate-950/80'
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

      {/* Name & Archetype */}
      <div className="mt-2 w-full">
        <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate flex items-center justify-center gap-1">
          <span>{name}</span>
          {isUser ? (
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-mono">YOU</span>
          ) : (
            <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 rounded font-mono">AI</span>
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
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
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
