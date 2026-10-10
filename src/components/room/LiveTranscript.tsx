import React, { useEffect, useRef } from 'react';
import { MessageSquare, AlertCircle, Quote } from 'lucide-react';
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

  const getBadgeStyle = (senderId: string) => {
    if (senderId === 'user') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (senderId === 'moderator') return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
    return 'text-slate-300 bg-slate-800 border-slate-700/80';
  };

  return (
    <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 flex flex-col h-[490px] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-xs text-slate-200 uppercase tracking-wide">Live Transcript</h3>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          {messages.length} utterances
        </div>
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-3 pr-1.5">
        {messages.length === 0 && !interimText && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs text-center p-6 space-y-2">
            <Quote className="w-5 h-5 text-slate-600" />
            <p>The moderator is framing the round topic...</p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.senderId === 'user';
          return (
            <div
              key={msg.id}
              className={`p-3 rounded-xl border text-xs space-y-1.5 transition-colors ${
                isUser
                  ? 'bg-blue-950/20 border-blue-500/30 ml-4'
                  : 'bg-slate-950/70 border-slate-800/80 mr-2'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-semibold px-2 py-0.5 rounded text-[10px] border ${getBadgeStyle(
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

              <p className="text-slate-200 leading-relaxed text-xs">
                {msg.text}
              </p>

              {/* Interruption Marker */}
              {msg.isInterrupted && (
                <div className="flex items-center gap-1 text-[10px] font-medium text-rose-400 pt-0.5">
                  <AlertCircle className="w-3 h-3" />
                  <span>[Interrupted by {msg.interruptedBy || 'peer'}]</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Live Interim Transcript Bubble */}
        {isUserSpeaking && interimText && (
          <div className="p-3 rounded-xl border border-blue-500/40 bg-blue-950/30 ml-4 space-y-1">
            <div className="flex items-center gap-2 text-[10px] text-blue-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping"></span>
              <span>{userName} (Transcribing Live...)</span>
            </div>
            <p className="text-xs text-blue-200 font-mono italic">
              "{interimText}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
