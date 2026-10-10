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
      if (isUser) return 'border-indigo-600 ring-2 ring-indigo-500/20 bg-indigo-50/40 shadow-sm';
      if (roleType === 'moderator') return 'border-indigo-500 ring-2 ring-indigo-400/20 bg-indigo-50/40 shadow-sm';
      return 'border-indigo-500 ring-2 ring-indigo-400/20 bg-indigo-50/30 shadow-sm';
    }
    if (isUser) return 'border-slate-200 bg-white hover:border-slate-300';
    if (roleType === 'moderator') return 'border-indigo-100 bg-indigo-50/30';
    return 'border-slate-200 bg-white hover:border-slate-300';
  };

  return (
    <div
      className={`relative rounded-xl border transition-all duration-200 flex flex-col items-center justify-between p-3.5 text-center ${getCardBorder()} ${
        compact ? 'w-32 sm:w-36' : 'w-40 sm:w-44'
      }`}
    >
      {/* Hand raised indicator */}
      {hasHandRaised && (
        <div className="absolute -top-2.5 -right-2 bg-amber-500 text-white p-1 rounded-full shadow-sm">
          <Hand className="w-3 h-3 fill-white" />
        </div>
      )}

      {/* Interrupted badge */}
      {isInterrupted && (
        <div className="absolute -top-2 left-2 bg-rose-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
          <AlertCircle className="w-2.5 h-2.5" /> Cut Off
        </div>
      )}

      {/* Avatar Container */}
      <div className="relative my-1">
        <div
          className={`w-13 h-13 rounded-xl flex items-center justify-center text-2xl transition-transform ${
            isSpeaking ? 'bg-indigo-50 scale-105' : 'bg-slate-50'
          }`}
        >
          <span>{avatar}</span>
        </div>

        {/* Live Audio Visualizer Dots */}
        {isSpeaking && (
          <div className="absolute -bottom-1 inset-x-0 flex items-center justify-center gap-0.5">
            <span className="w-1 bg-indigo-600 rounded-full animate-sound-wave" style={{ animationDelay: '0.1s' }}></span>
            <span className="w-1 bg-indigo-600 rounded-full animate-sound-wave" style={{ animationDelay: '0.3s' }}></span>
            <span className="w-1 bg-indigo-600 rounded-full animate-sound-wave" style={{ animationDelay: '0.2s' }}></span>
          </div>
        )}
      </div>

      {/* Name & Role */}
      <div className="mt-2 w-full">
        <div className="flex items-center justify-center gap-1">
          <h4 className="text-xs font-bold text-slate-800 truncate">{name}</h4>
          {isUser ? (
            <span className="text-[8px] bg-indigo-100 text-indigo-700 px-1 py-0.2 rounded font-mono font-bold">YOU</span>
          ) : (
            <span className="text-[8px] bg-slate-100 text-slate-500 px-1 py-0.2 rounded font-mono">AI</span>
          )}
        </div>
        <p className="text-[10px] text-slate-500 truncate mt-0.5">
          {role}
        </p>
      </div>

      {/* Speaking status footer */}
      <div className="mt-2 pt-2 border-t border-slate-100 w-full flex items-center justify-between text-[10px] text-slate-400">
        <span className="flex items-center gap-1">
          {isSpeaking ? (
            <span className="flex items-center gap-1 text-indigo-600 font-semibold">
              <Volume2 className="w-3 h-3" /> Active
            </span>
          ) : (
            <span>Listening</span>
          )}
        </span>
        <span className="font-mono text-slate-500">{speakingTimeSec}s</span>
      </div>
    </div>
  );
};
