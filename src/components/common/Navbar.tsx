import React from 'react';
import { Settings, BrainCircuit } from 'lucide-react';
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
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs font-medium">Lobby Setup</span>;
      case 'prep':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-xs font-medium">Silent Prep (60s)</span>;
      case 'opening':
        return <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded text-xs font-medium">Moderator Opening</span>;
      case 'open_discussion':
        return (
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Live Discussion</span>
          </span>
        );
      case 'warning':
        return <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-xs font-medium">2-Min Warning</span>;
      case 'closing':
        return <span className="bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-xs font-medium">Closing Round</span>;
      case 'evaluating':
        return <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-xs font-medium">Recruiter Scoring...</span>;
      case 'report':
        return <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded text-xs font-medium">Recruiter Dossier</span>;
      default:
        return null;
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 px-6 py-2.5 flex items-center justify-between shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-3">
        {getStageBadge()}
        <span className="text-slate-300">·</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>AI Placement Simulator</span>
          <span className="text-slate-300">|</span>
          <span className="text-indigo-600 font-semibold">{profile.currentDifficulty} Level</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {stage !== 'setup' && stage !== 'report' && stage !== 'evaluating' && (
          <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md text-xs font-mono font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{formatTime(remainingSec)}</span>
          </div>
        )}

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700 transition-colors"
          title="Configure API Keys (Grok / Sarvam / Groq / Gemini)"
        >
          <Settings className="w-3.5 h-3.5 text-slate-500" />
          <span>Config</span>
        </button>
      </div>
    </header>
  );
};
