import React from 'react';
import { Settings, Users, Sparkles, BrainCircuit } from 'lucide-react';
import { GDStage } from '../../types/gd';
import { SelfUpgradeEngine } from '../../services/selfUpgradeEngine';

interface NavbarProps {
  stage: GDStage;
  remainingSec?: number;
  onOpenSettings: () => void;
  onRestartSession: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stage,
  remainingSec = 0,
  onOpenSettings,
  onRestartSession,
}) => {
  const profile = SelfUpgradeEngine.getProfile();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getStageBadge = () => {
    switch (stage) {
      case 'setup':
        return <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium border border-slate-700/60">Lobby</span>;
      case 'prep':
        return <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md text-xs font-medium">Silent Prep (60s)</span>;
      case 'opening':
        return <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-md text-xs font-medium">Moderator Opening</span>;
      case 'open_discussion':
        return (
          <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live Round</span>
          </span>
        );
      case 'warning':
        return <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-md text-xs font-medium">2-Min Warning</span>;
      case 'closing':
        return <span className="bg-purple-500/10 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-md text-xs font-medium">Closing Round</span>;
      case 'evaluating':
        return <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-md text-xs font-medium">Recruiter Scoring...</span>;
      case 'report':
        return <span className="bg-blue-600/15 text-blue-400 border border-blue-500/30 px-2.5 py-1 rounded-md text-xs font-medium">Evaluation Dossier</span>;
      default:
        return null;
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button 
          onClick={onRestartSession}
          className="flex items-center gap-2.5 group text-left"
          title="Return to lobby"
        >
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-blue-500 transition-colors">
            GD
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight text-white">GD Arena</span>
              <span className="bg-slate-800 text-slate-300 text-[10px] px-1.5 py-0.5 rounded border border-slate-700 font-mono font-medium">
                v3.0 Adaptive
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal hidden sm:block">Campus Placement GD Simulator</p>
          </div>
        </button>

        <div className="hidden md:flex items-center ml-2 pl-4 border-l border-slate-800 gap-2">
          {getStageBadge()}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-800/60 border border-slate-700/50 px-2.5 py-1 rounded-md">
            <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
            <span>AI Level: <strong className="text-slate-200">{profile.currentDifficulty}</strong></span>
            <span className="text-slate-500">·</span>
            <span>Session #{profile.totalSessions + 1}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {stage !== 'setup' && stage !== 'report' && stage !== 'evaluating' && (
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-lg text-sm font-mono font-medium text-slate-100">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{formatTime(remainingSec)}</span>
          </div>
        )}

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
          title="Configure API Keys (Grok / Sarvam / Groq / Gemini)"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Settings</span>
        </button>
      </div>
    </header>
  );
};
