import React from 'react';
import { 
  Users, Layers, Award, BarChart3, Settings, Play, 
  BrainCircuit, BookOpen, Flame, Compass, History, Sparkles
} from 'lucide-react';
import { GDStage } from '../../types/gd';
import { SelfUpgradeEngine } from '../../services/selfUpgradeEngine';

interface SidebarProps {
  currentTab: 'lobby' | 'history' | 'topics' | 'analytics' | 'settings';
  onSelectTab: (tab: 'lobby' | 'history' | 'topics' | 'analytics' | 'settings') => void;
  stage: GDStage;
  onRestart: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  stage,
  onRestart,
  onOpenSettings
}) => {
  const profile = SelfUpgradeEngine.getProfile();

  const navItems = [
    { id: 'lobby', label: 'GD Arena Arena', icon: Play, badge: stage === 'open_discussion' ? 'LIVE' : null },
    { id: 'topics', label: 'Topic Library', icon: BookOpen },
    { id: 'analytics', label: 'Scorecard & Matrix', icon: Award },
    { id: 'history', label: 'Upgrade Logs', icon: History, count: profile.totalSessions },
  ] as const;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between shrink-0 select-none h-screen sticky top-0 z-40 shadow-[1px_0_3px_rgba(0,0,0,0.02)]">
      {/* Brand Header */}
      <div>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <button 
            onClick={onRestart}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-sm group-hover:bg-indigo-700 transition-colors">
              GD
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-sm">GD Arena</span>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded font-mono">
                  v3.0
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-normal">Placement Simulator</p>
            </div>
          </button>
        </div>

        {/* AI Model Intelligence Pill */}
        <div className="mx-3 my-3 p-3 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <BrainCircuit className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Current Level</div>
              <div className="text-xs font-bold text-slate-800">{profile.currentDifficulty}</div>
            </div>
          </div>
          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
            Adaptive
          </span>
        </div>

        {/* Navigation Section */}
        <div className="px-3 space-y-1 pt-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
            Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'lobby' && stage !== 'setup') {
                    // don't interrupt live round accidentally
                  }
                  onSelectTab(item.id as any);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-rose-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-mono">
                    #{item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Training Modules List */}
        <div className="px-3 space-y-1 pt-4">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
            <span>Special Drills</span>
            <span className="text-[9px] text-indigo-600 font-semibold">Spec Part Q</span>
          </div>
          <div className="space-y-0.5 text-xs text-slate-600">
            <div className="px-2.5 py-1.5 rounded-md hover:bg-slate-50 flex items-center justify-between cursor-pointer text-[11px]">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                First Entry Timing Drill
              </span>
              <span className="text-[10px] text-slate-400">&lt; 30s</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-md hover:bg-slate-50 flex items-center justify-between cursor-pointer text-[11px]">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Reclaim from Dominator
              </span>
              <span className="text-[10px] text-slate-400">Firm</span>
            </div>
            <div className="px-2.5 py-1.5 rounded-md hover:bg-slate-50 flex items-center justify-between cursor-pointer text-[11px]">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                Consensus Summary Drill
              </span>
              <span className="text-[10px] text-slate-400">Synthesis</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Profile & Settings */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <Settings className="w-4 h-4 text-slate-400" />
          <span>API & Audio Settings</span>
        </button>

        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
            {profile.totalSessions > 0 ? '🏆' : '🎓'}
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-800 truncate">Candidate Dashboard</div>
            <div className="text-[10px] text-slate-400 truncate">{profile.totalSessions} Total Sessions Logged</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
