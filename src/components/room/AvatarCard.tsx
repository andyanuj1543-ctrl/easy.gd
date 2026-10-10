import React from 'react';
import { Volume2, AlertCircle, Hand } from 'lucide-react';
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
  const role = isUser ? 'Candidate (You)' : (persona?.archetype || 'Participant');
  const avatar = isUser ? '🎓' : (persona?.avatar || '👤');
  const roleType = isUser ? 'user' : (persona?.role || 'candidate');

  const getCardBorder = () => {
    if (isSpeaking) {
      if (isUser) return 'border-blue-500 ring-2 ring-blue-500/40 bg-slate-900';
      if (roleType === 'moderator') return 'border-indigo-500 ring-2 ring-indigo-500/40 bg-slate-900';
      return 'border-blue-400 ring-2 ring-blue-400/30 bg-slate-900';
    }
    if (isUser) return 'border-slate-800 bg-slate-900/90';
    if (roleType === 'moderator') return 'border-indigo-500/30 bg-slate-900/90';
    return 'border-slate-800 bg-slate-900/80';
  };

  return (
    <div
      className={`relative rounded-2xl border transition-all duration-200 flex flex-col items-center justify-between p-3.5 text-center shadow-sm ${getCardBorder()} ${
        compact ? 'w-32 sm:w-36' : 'w-40 sm:w-44'
      }`}
    >
      {/* Hand raised indicator */}
      {hasHandRaised && (
        <div className="absolute -top-2.5 -right-2 bg-amber-500 text-slate-950 p-1 rounded-full shadow-md">
          <Hand className="w-3.5 h-3.5 fill-slate-950" />
        </div>
      )}

      {/* Interrupted badge */}
      {isInterrupted && (
        <div className="absolute -top-2.5 left-2 bg-rose-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
          <AlertCircle className="w-3 h-3" /> Cut Off
        </div>
      )}

      {/* Avatar Display */}
      <div className="relative my-1">
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-transform ${
            isSpeaking ? 'bg-slate-800 ring-1 ring-blue-500/50 scale-105' : 'bg-slate-950'
          }`}
        >
          <span>{avatar}</span>
        </div>

        {/* Live Audio Activity Bars */}
        {isSpeaking && (
          <div className="absolute -bottom-1.5 inset-x-0 flex items-center justify-center gap-1">
            <span className="w-1 bg-blue-500 rounded-full animate-sound-wave" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-1 bg-blue-500 rounded-full animate-sound-wave" style={{ animationDelay: '0.3s' }}></span>
            <span className="w-1 bg-blue-500 rounded-full animate-sound-wave" style={{ animationDelay: '0.2s' }}></span>
          </div>
        )}
      </div>

      {/* Name & Role */}
      <div className="mt-2 w-full">
        <div className="flex items-center justify-center gap-1.5">
          <h4 className="text-xs font-semibold text-slate-100 truncate">{name}</h4>
          {isUser ? (
            <span className="text-[9px] bg-blue-500/15 text-blue-400 px-1.5 py-0.2 rounded font-mono font-medium">YOU</span>
          ) : (
            <span className="text-[9px] bg-slate-800 text-slate-400 px-1 py-0.2 rounded font-mono">AI</span>
          )}
        </div>
        <p className="text-[10px] text-slate-400 truncate mt-0.5">
          {role}
        </p>
      </div>

      {/* Speaking status footer */}
      <div className="mt-2 pt-2 border-t border-slate-800/80 w-full flex items-center justify-between text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          {isSpeaking ? (
            <span className="flex items-center gap-1 text-blue-400 font-medium">
              <Volume2 className="w-3 h-3" /> Active
            </span>
          ) : (
            <span>Listening</span>
          )}
        </span>
        <span className="font-mono">{speakingTimeSec}s</span>
      </div>
    </div>
  );
};
