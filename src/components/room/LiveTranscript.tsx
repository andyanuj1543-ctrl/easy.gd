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
    if (senderId === 'user') return 'text-indigo-700 bg-indigo-50 border-indigo-200';
    if (senderId === 'moderator') return 'text-blue-700 bg-blue-50 border-blue-200';
    return 'text-slate-700 bg-slate-100 border-slate-200';
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col h-[520px] shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wide">Live Discussion Stream</h3>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          {messages.length} utterances
        </div>
      </div>

      {/* Message Stream */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1">
        {messages.length === 0 && !interimText && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs text-center p-6 space-y-2">
            <Quote className="w-5 h-5 text-slate-300" />
            <p>The moderator is preparing to open the discussion...</p>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.senderId === 'user';
          return (
            <div
              key={msg.id}
              className={`p-3 rounded-lg border text-xs space-y-1 transition-colors ${
                isUser
                  ? 'bg-indigo-50/40 border-indigo-200 ml-3'
                  : 'bg-slate-50 border-slate-200 mr-2'
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-semibold px-1.5 py-0.5 rounded text-[10px] border ${getBadgeStyle(
                      msg.senderId
                    )}`}
                  >
                    {msg.senderName}
                  </span>
                  <span className="text-slate-400 text-[10px] capitalize font-mono">
                    [{msg.senderRole}]
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  +{formatTimestamp(msg.timestamp)}
                </span>
              </div>

              <p className="text-slate-800 leading-relaxed text-xs">
                {msg.text}
              </p>

              {/* Interruption Marker */}
              {msg.isInterrupted && (
                <div className="flex items-center gap-1 text-[10px] font-medium text-rose-600 pt-0.5">
                  <AlertCircle className="w-3 h-3" />
                  <span>[Interrupted by {msg.interruptedBy || 'peer'}]</span>
                </div>
              )}
            </div>
          );
        })}

        {/* Live Interim Transcript Bubble */}
        {isUserSpeaking && interimText && (
          <div className="p-3 rounded-lg border border-indigo-300 bg-indigo-50 ml-3 space-y-1">
            <div className="flex items-center gap-2 text-[10px] text-indigo-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>
              <span>{userName} (Transcribing Live...)</span>
            </div>
            <p className="text-xs text-indigo-900 font-mono italic">
              "{interimText}"
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
