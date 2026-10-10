import React from 'react';
import { 
  Users, AlertCircle, Info, Mic 
} from 'lucide-react';
import { 
  GDMessage, GDTopic, PersonaConfig, RoomSettings 
} from '../../types/gd';
import { AvatarCard } from './AvatarCard';
import { LiveTranscript } from './LiveTranscript';
import { SilentCoachHUD } from './SilentCoachHUD';
import { GDControlsBar } from './GDControlsBar';
import { AudioVisualizer } from './AudioVisualizer';
import { MODERATOR_PERSONA } from '../../data/personas';

interface GDRoomViewProps {
  settings: RoomSettings;
  participants: PersonaConfig[];
  messages: GDMessage[];
  activeSpeakerId: string | null;
  isAiSpeaking: boolean;
  isUserSpeaking: boolean;
  interimTranscript: string;
  isMuted: boolean;
  hasHandRaised: boolean;
  currentCoachHint: string;
  userVolume: number;
  onToggleMute: () => void;
  onInterruptBargeIn: () => void;
  onToggleHand: () => void;
  onEndDiscussion: () => void;
  isFishbowlInside: boolean;
  onTagInFishbowl: () => void;
}

export const GDRoomView: React.FC<GDRoomViewProps> = ({
  settings,
  participants,
  messages,
  activeSpeakerId,
  isAiSpeaking,
  isUserSpeaking,
  interimTranscript,
  isMuted,
  hasHandRaised,
  currentCoachHint,
  userVolume,
  onToggleMute,
  onInterruptBargeIn,
  onToggleHand,
  onEndDiscussion,
  isFishbowlInside,
  onTagInFishbowl,
}) => {
  const calculateSpeakingSec = (speakerId: string) => {
    return messages
      .filter((m) => m.senderId === speakerId)
      .reduce((sum, m) => sum + (m.durationSec || 6), 0);
  };

  const userSpeakingSec = calculateSpeakingSec('user');

  return (
    <div className="max-w-7xl mx-auto px-6 py-6 space-y-5 pb-24">
      
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
              {settings.topic.category}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {settings.sessionType} · Level: {settings.difficulty}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            {settings.topic.title}
          </h2>
        </div>

        {/* Student Mic Status Indicator */}
        <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg self-start md:self-auto">
          <Mic className={`w-3.5 h-3.5 ${!isMuted ? 'text-indigo-600 animate-pulse' : 'text-slate-400'}`} />
          <span className="text-xs text-slate-700 font-medium">Mic:</span>
          <AudioVisualizer volume={userVolume} isSpeaking={isUserSpeaking} />
        </div>
      </div>

      {/* Main Discussion Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left: Meeting Floor (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Conference Floor</span>
            <span className="text-[11px] text-slate-500 font-medium">{participants.length} AI Candidates + 1 HR Chair</span>
          </div>

          {/* Top: Moderator at Head of Table */}
          <div className="flex justify-center">
            <AvatarCard
              persona={MODERATOR_PERSONA}
              isSpeaking={activeSpeakerId === MODERATOR_PERSONA.id}
              speakingTimeSec={calculateSpeakingSec(MODERATOR_PERSONA.id)}
            />
          </div>

          {/* Middle: AI Peers around the Table */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 justify-items-center">
            {participants.map((p) => {
              const isSpeaking = activeSpeakerId === p.id;
              const lastMsg = messages[messages.length - 1];
              const wasCutOff = lastMsg && lastMsg.senderId === p.id && lastMsg.isInterrupted;
              return (
                <AvatarCard
                  key={p.id}
                  persona={p}
                  isSpeaking={isSpeaking}
                  isInterrupted={Boolean(wasCutOff)}
                  speakingTimeSec={calculateSpeakingSec(p.id)}
                  compact
                />
              );
            })}
          </div>

          {/* Bottom: Candidate (You) */}
          <div className="flex justify-center pt-2 border-t border-slate-100">
            <AvatarCard
              isUser
              userName={settings.studentName}
              isSpeaking={isUserSpeaking}
              hasHandRaised={hasHandRaised}
              speakingTimeSec={userSpeakingSec}
            />
          </div>
        </div>

        {/* Right: Live Transcript Stream (5 Cols) */}
        <div className="lg:col-span-5">
          <LiveTranscript
            messages={messages}
            interimText={interimTranscript}
            userName={settings.studentName}
            isUserSpeaking={isUserSpeaking}
          />
        </div>
      </div>

      {/* Floating Silent Coach HUD */}
      <SilentCoachHUD currentHint={currentCoachHint} />

      {/* Floating Controls Bar */}
      <GDControlsBar
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onInterruptBargeIn={onInterruptBargeIn}
        isAiSpeaking={isAiSpeaking}
        hasHandRaised={hasHandRaised}
        onToggleHand={onToggleHand}
        onEndDiscussion={onEndDiscussion}
        isFishbowlMode={settings.format === 'fishbowl'}
        isInsideCircle={isFishbowlInside}
        onTagInCircle={onTagInFishbowl}
      />
    </div>
  );
};
