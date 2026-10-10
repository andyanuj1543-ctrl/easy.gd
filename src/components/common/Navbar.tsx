import React from 'react';
import { Mic, Settings, Users, Sparkles } from 'lucide-react';
import { GDStage } from '../../types/gd';

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
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getStageBadge = () => {
    switch (stage) {
      case 'setup':
        return <span className="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full text-xs font-medium">Room Setup</span>;
      case 'prep':
        return <span className="bg-amber-900/40 text-amber-300 border border-amber-600/40 px-2.5 py-1 rounded-full text-xs font-medium animate-pulse">Silent Prep (1 min)</span>;
      case 'opening':
        return <span className="bg-indigo-900/40 text-indigo-300 border border-indigo-600/40 px-2.5 py-1 rounded-full text-xs font-medium">Moderator Opening</span>;
      case 'open_discussion':
        return <span className="bg-emerald-900/40 text-emerald-300 border border-emerald-600/40 px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span> Live Discussion</span>;
      case 'warning':
        return <span className="bg-orange-900/40 text-orange-300 border border-orange-600/40 px-2.5 py-1 rounded-full text-xs font-medium">2-Min Warning</span>;
      case 'closing':
        return <span className="bg-purple-900/40 text-purple-300 border border-purple-600/40 px-2.5 py-1 rounded-full text-xs font-medium">Closing Round</span>;
      case 'evaluating':
        return <span className="bg-blue-900/40 text-blue-300 border border-blue-600/40 px-2.5 py-1 rounded-full text-xs font-medium">Evaluating with Recruiter AI...</span>;
      case 'report':
        return <span className="bg-emerald-800/50 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-medium">Recruiter Report</span>;
      default:
        return null;
    }
  };

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button 
          onClick={onRestartSession}
          className="flex items-center gap-2 group text-left"
          title="Return to lobby"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">easy<span className="text-emerald-400">.gd</span></span>
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/20 font-mono uppercase">AI Simulator</span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">Campus Placement GD Practice</p>
          </div>
        </button>

        <div className="hidden sm:flex items-center ml-4 pl-4 border-l border-slate-800">
          {getStageBadge()}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {stage !== 'setup' && stage !== 'report' && stage !== 'evaluating' && (
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-sm font-mono font-semibold text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{formatTime(remainingSec)}</span>
          </div>
        )}

        <button
          onClick={onOpenSettings}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
          title="Configure API Keys (Grok / Sarvam / Groq / Gemini)"
        >
          <Settings className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden md:inline">API Config</span>
        </button>
      </div>
    </header>
  );
};
