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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-5 pb-28 animate-fade-in">
      
      {/* Topic Header & Status Bar */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded border border-blue-500/20 uppercase tracking-wider">
                {settings.topic.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {settings.sessionType || 'Practice Session'} · Level: {settings.difficulty || 'Beginner'}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
              {settings.topic.title}
            </h2>
          </div>

          {/* Student Mic Status Indicator */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-xl self-start md:self-auto">
            <div className="flex items-center gap-2 text-xs">
              <Mic className={`w-3.5 h-3.5 ${!isMuted ? 'text-blue-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-slate-300 font-medium">Mic Input:</span>
              <AudioVisualizer volume={userVolume} isSpeaking={isUserSpeaking} />
            </div>
          </div>
        </div>

        {/* Quiet AI Notice */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
          <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          <span>
            You are in a live room with {participants.length} AI peers and 1 HR moderator. Speak out loud through your microphone to claim the floor.
          </span>
        </div>
      </div>

      {/* Main Grid: Virtual Discussion Table + Live Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column: Virtual Meeting Room Grid (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-6">
          
          <div className="space-y-6">
            
            {/* Top: Moderator at Head of Table */}
            <div className="flex justify-center">
              <AvatarCard
                persona={MODERATOR_PERSONA}
                isSpeaking={activeSpeakerId === MODERATOR_PERSONA.id}
                speakingTimeSec={calculateSpeakingSec(MODERATOR_PERSONA.id)}
              />
            </div>

            {/* Middle: AI Peers around the Table */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 justify-items-center">
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
            <div className="flex justify-center pt-1 border-t border-slate-800/80">
              <AvatarCard
                isUser
                userName={settings.studentName}
                isSpeaking={isUserSpeaking}
                hasHandRaised={hasHandRaised}
                speakingTimeSec={userSpeakingSec}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Live Transcript Stream (5 cols) */}
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
