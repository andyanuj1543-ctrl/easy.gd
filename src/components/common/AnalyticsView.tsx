import React from 'react';
import { Award, BrainCircuit, History, BookOpen } from 'lucide-react';
import { SelfUpgradeEngine } from '../../services/selfUpgradeEngine';

interface AnalyticsViewProps {
  onBackToLobby: () => void;
  activeView: 'analytics' | 'history';
}

const RUBRIC_CRITERIA_80 = [
  { name: 'Content & Knowledge', maxScore: 10, criteria: 'Depth of domain knowledge, structure of arguments, facts, case precedents, and business viability.' },
  { name: 'Communication & Delivery', maxScore: 10, criteria: 'Clear vocal articulation, fluency, structured frameworks, and minimal vocal fillers.' },
  { name: 'Active Listening & Linking', maxScore: 10, criteria: 'Synthesizing previous speaker points, quoting peer arguments, and avoiding disconnected monologues.' },
  { name: 'Teamwork & Inclusivity', maxScore: 10, criteria: 'Balanced floor time, passing the mic to quiet members, avoiding hostility, and building consensus.' },
  { name: 'Leadership & Floor Framing', maxScore: 10, criteria: 'Early floor entry, framing discussion dimensions, defining scopes, and steering derailments.' },
  { name: 'Acoustic / Vocal Presence', maxScore: 10, criteria: 'Firm vocal projection, calibrated pitch, absence of hesitations, and steady speech cadence.' },
  { name: 'Time & Pacing Management', maxScore: 10, criteria: 'Pacing remarks evenly across opening, open floor, 2-minute warning, and synthesizing during closing.' },
  { name: 'Emotional Maturity & Composure', maxScore: 10, criteria: 'Firm, graceful floor reclaiming against dominant speakers without aggression or defensiveness.' }
];

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ onBackToLobby, activeView }) => {
  const profile = SelfUpgradeEngine.getProfile();
  const sessionLogs = SelfUpgradeEngine.getSessionLogs();

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            {activeView === 'analytics' ? (
              <>
                <Award className="w-5 h-5 text-indigo-600" />
                <span>Placement 8-Part Scorecard Rubric (/80) & Profile</span>
              </>
            ) : (
              <>
                <History className="w-5 h-5 text-indigo-600" />
                <span>Adaptive Self-Upgrade Logs (Spec Part L)</span>
              </>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {activeView === 'analytics'
              ? 'Based on Indian Campus Placement criteria: 8 pillars scored out of 10 points each.'
              : 'Permanent tracking logs generated automatically after every completed discussion.'}
          </p>
        </div>

        <button
          onClick={onBackToLobby}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
        >
          &larr; Back to GD Arena
        </button>
      </div>

      {activeView === 'analytics' && (
        <div className="space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Level</div>
              <div className="text-base font-bold text-indigo-600 mt-1">{profile.currentDifficulty}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Auto-advances at &ge; 64/80</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Sessions</div>
              <div className="text-base font-bold text-slate-800 mt-1">{profile.totalSessions} Rounds</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Logged with full transcripts</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Top Strength</div>
              <div className="text-xs font-bold text-emerald-600 mt-1 truncate">
                {profile.identifiedStrengths[0] || 'Composure'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Calm under interruption</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Target Weakness</div>
              <div className="text-xs font-bold text-amber-600 mt-1 truncate">
                {profile.identifiedWeaknesses[0] || 'Early Entry Timing'}
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">Target +1.5 pts in next drill</div>
            </div>
          </div>

          {/* 8-Part Rubric Grid */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-indigo-600" />
                <span>The 8-Part Recruiter Evaluation Matrix (Spec Part K)</span>
              </h3>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded">
                Total Max: 80 Points
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {RUBRIC_CRITERIA_80.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">
                      {idx + 1}. {item.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      / {item.maxScore} pts
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{item.criteria}</p>
                </div>
              ))}
            </div>
          </div>

          {/* High-Impact Tactical Phrases */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <span>Learned Placement Power Phrases (Spec Part M)</span>
            </h3>
            <p className="text-xs text-slate-500">
              High-impact phrases recommended for steering discussions, reclaiming the floor, or synthesizing peer points:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {profile.learnedPhrases.map((phrase, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-indigo-50/50 border border-indigo-100 text-xs text-slate-700 flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">&ldquo;</span>
                  <span className="italic">{phrase}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeView === 'history' && (
        <div className="space-y-4">
          {sessionLogs.length === 0 ? (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Session Logs Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Complete your first placement GD simulation in the arena. Your session log dossier, audio metrics, and /80 scorecard will automatically save here.
              </p>
              <button
                onClick={onBackToLobby}
                className="mt-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
              >
                Launch First Session
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {sessionLogs.map((log) => (
                <div
                  key={log.sessionNumber}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                          SESSION LOG #{log.sessionNumber}
                        </span>
                        <span className="text-xs text-slate-400">{log.timestamp}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{log.topic}</h4>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-bold text-indigo-600 font-mono">
                          {log.totalScore80}/80
                        </div>
                        <div className="text-[10px] text-slate-400">{log.difficulty} Level</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-emerald-50/50 border border-emerald-100 p-2.5 rounded-lg">
                      <div className="text-[10px] font-bold uppercase text-emerald-800 mb-1">Top Strengths</div>
                      <ul className="space-y-0.5 text-slate-700 text-[11px]">
                        {log.strengthsIdentified.map((s, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="text-emerald-600">&bull;</span> {s}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 p-2.5 rounded-lg">
                      <div className="text-[10px] font-bold uppercase text-amber-800 mb-1">Areas to Improve</div>
                      <ul className="space-y-0.5 text-slate-700 text-[11px]">
                        {log.weaknessesIdentified.map((w, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="text-amber-600">&bull;</span> {w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Candidate Airtime: {log.speakingPercentage}%</span>
                    <span className="text-indigo-600 font-semibold">{log.aiAdjustmentsMade}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
