import React from 'react';
import { 
  Users, AlertCircle, Info, Sparkles, Volume2, Mic 
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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-28 animate-fade-in">
      
      {/* Topic Header & AI Disclosure Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-wide">
                {settings.topic.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Format: {settings.format.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {settings.topic.title}
            </h2>
          </div>

          {/* Student Mic Status Chip */}
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-3.5 py-2 rounded-2xl self-start md:self-auto shadow-inner">
            <div className="flex items-center gap-2 text-xs">
              <Mic className={`w-3.5 h-3.5 ${!isMuted ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="text-slate-300 font-semibold">Your Voice:</span>
              <AudioVisualizer volume={userVolume} isSpeaking={isUserSpeaking} />
            </div>
          </div>
        </div>

        {/* Clear AI Disclosure */}
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-950/30 border border-indigo-900/40 text-[11px] text-indigo-300">
          <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span>
            <strong>AI Disclosure:</strong> All other members at this round table are AI participants with distinct behavioral instructions. Speak out loud to participate!
          </span>
        </div>
      </div>

      {/* Main Grid: Virtual Discussion Table + Live Transcript */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Virtual GD Table (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-md">
          
          {/* Subtle Ambient Conference Table Lighting */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            <div className="w-96 h-96 rounded-full border border-emerald-500/20 bg-emerald-500/5 blur-xl"></div>
            <div className="w-72 h-72 rounded-full border border-slate-700/60"></div>
          </div>

          <div className="relative z-10 space-y-6">
            
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
            <div className="flex justify-center pt-2">
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
