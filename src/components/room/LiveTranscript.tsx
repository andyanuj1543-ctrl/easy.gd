import React, { useEffect, useRef } from 'react';
import { MessageSquare, Volume2, AlertCircle, Quote } from 'lucide-react';
import { GDMessage } from '../../types/gd';

interface LiveTranscriptProps {
  messages: GDMessage[];
  interimText?: string;
  userName?: string;
  isUserSpeaking?: boolean;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  messages,
  interimText = '',
  userName = 'Candidate',
  isUserSpeaking = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, interimText]);

  const formatTimestamp = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getSpeakerColor = (role: string, senderId: string) => {
    if (senderId === 'user') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (role === 'moderator') return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    if (role === 'dominator') return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (role === 'analyst') return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (role === 'quiet') return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col h-[480px] shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <h3 className="font-semibold text-sm text-slate-100">Live GD Transcript</h3>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          {messages.length} utterances
        </div>
      </div>

      {/* Message List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-3.5 pr-1.5">
        {messages.length === 0 && !interimText && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-6 space-y-2">
            <Quote className="w-6 h-6 text-slate-600" />
            <p>The moderator is preparing to open the discussion...</p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.senderId === 'user';
          return (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl border text-xs space-y-1.5 transition-all ${
                isUser
                  ? 'bg-emerald-950/20 border-emerald-500/30 ml-4'
                  : 'bg-slate-950/60 border-slate-800 mr-2'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded-md border text-[10px] ${getSpeakerColor(
                      msg.senderRole,
                      msg.senderId
                    )}`}
                  >
                    {msg.senderName}
                  </span>
                  <span className="text-slate-500 text-[10px] capitalize font-mono">
                    [{msg.senderRole}]
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  +{formatTimestamp(msg.timestamp)}
                </span>
              </div>

              <p className="text-slate-200 leading-relaxed font-sans text-xs sm:text-[13px]">
                {msg.text}
              </p>

              {/* Interruption Indicator */}
              {msg.isInterrupted && (
                <div className="flex items-center gap-1 text-[10px] font-semibold text-rose-400 pt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>[Interrupted & floor claimed by {msg.interruptedBy || 'peer'}]</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Live User Interim Transcript Bubble */}
        {isUserSpeaking && interimText && (
          <div className="p-3 rounded-2xl border border-emerald-500/50 bg-emerald-950/40 ml-4 space-y-1 animate-pulse">
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{userName} (Transcribing Live...)</span>
            </div>
            <p className="text-xs sm:text-[13px] text-emerald-200 font-mono italic">
              "{interimText}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
