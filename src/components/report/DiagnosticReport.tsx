import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, TrendingUp, Clock, CheckCircle2, AlertTriangle, 
  Quote, Lightbulb, RefreshCw, Printer, Shield, ChevronRight, UserCheck, 
  BrainCircuit, ArrowUpRight, Check, ListChecks
} from 'lucide-react';
import { GDReport } from '../../types/gd';

interface DiagnosticReportProps {
  report: GDReport;
  onRestart: () => void;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({ report, onRestart }) => {
  useEffect(() => {
    if (report.overallScore >= 70 || (report.totalScore80 && report.totalScore80 >= 56)) {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [report.overallScore, report.totalScore80]);

  const getVerdictBadge = (rec: string) => {
    switch (rec) {
      case 'Strong Hire':
        return <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">Strong Hire (Top Tier)</span>;
      case 'Hire':
        return <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">Hire (Advancing to PI)</span>;
      case 'Borderline / Needs Polish':
        return <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">Borderline / Needs Polish</span>;
      default:
        return <span className="bg-rose-500/10 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider">Do Not Advance</span>;
    }
  };

  const formatTimestamp = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const selfLog = report.selfUpgradeLog;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6 animate-fade-in print:p-0">
      
      {/* Top Banner: Dossier Overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Campus Placement Evaluation Dossier · Spec v3.0</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              {report.studentName}'s Recruiter Report
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Topic: <strong className="text-slate-200">"{report.topicTitle}"</strong>
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5">
            {getVerdictBadge(report.hiringRecommendation)}
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-bold font-mono text-white">
                {report.totalScore80 ?? Math.round(report.overallScore * 0.8)}
              </span>
              <span className="text-slate-500 text-sm font-semibold">/80</span>
              <span className="text-xs text-slate-400 block font-mono">({report.overallScore}%)</span>
            </div>
          </div>
        </div>

        {/* Executive Recruiter Summary */}
        <div className="pt-5 space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span>Recruiter Panel Feedback</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/70 p-4 rounded-xl border border-slate-800/80">
            {report.executiveSummary}
          </p>
        </div>
      </div>

      {/* Official 8-Part Scorecard Matrix (/80) - PART B3 & D3 of Spec */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-blue-400" />
              <span>Placement Scorecard (8 Dimensions · 0 to 10 Each)</span>
            </h3>
            <p className="text-xs text-slate-400">
              Evaluated strictly according to the Master Group Discussion Rubric.
            </p>
          </div>
          <div className="text-xs font-mono font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg">
            Total: {report.totalScore80 ?? Math.round(report.overallScore * 0.8)} / 80
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {report.scorecard?.map((area, idx) => {
            const isTop = area.score >= 8;
            const isLow = area.score < 6;
            return (
              <div 
                key={idx}
                className="bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{area.name}</span>
                    <span className={`text-sm font-bold font-mono ${isTop ? 'text-emerald-400' : isLow ? 'text-rose-400' : 'text-blue-400'}`}>
                      {area.score}/10
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-normal mt-1.5">
                    {area.notes}
                  </p>
                </div>
                {/* Visual score bar */}
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${isTop ? 'bg-emerald-500' : isLow ? 'bg-rose-500' : 'bg-blue-500'}`}
                    style={{ width: `${Math.min(100, area.score * 10)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Self-Upgrade Log: SESSION LOG #___ (PART E & Rule 1-10 of Spec) */}
      {selfLog && (
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-blue-400" />
              <h3 className="text-base font-semibold text-white">
                Self-Upgrade Log #00{selfLog.sessionNumber}
              </h3>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Next Level: <strong className="text-blue-400">{selfLog.difficulty}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left: What Worked & What Failed */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div>
                <span className="font-semibold text-emerald-400 uppercase tracking-wider text-[10px] block mb-1">
                  What Worked (Strengths Observed)
                </span>
                <ul className="space-y-1 text-slate-300">
                  {selfLog.whatWorked.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="font-semibold text-rose-400 uppercase tracking-wider text-[10px] block mb-1">
                  What Failed (Identified Weaknesses)
                </span>
                <ul className="space-y-1 text-slate-300">
                  {selfLog.whatFailed.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: AI Upgrades Applied & Next Session Plan */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
              <div>
                <span className="font-semibold text-blue-400 uppercase tracking-wider text-[10px] block mb-1">
                  AI Model Adaptation Applied
                </span>
                <ul className="space-y-1 text-slate-300">
                  {selfLog.aiUpgradeApplied.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <span className="font-semibold text-amber-400 uppercase tracking-wider text-[10px] block mb-1">
                  Recommended Next Session
                </span>
                <p className="text-slate-300 leading-relaxed">
                  {selfLog.nextSessionPlan}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Speaking Airtime & Floor Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Airtime & Floor Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">
              Target placement benchmark: <strong>20% – 30%</strong> in a 5-person panel.
            </p>
          </div>

          <div className="text-xs font-mono font-semibold text-slate-200 bg-slate-800 px-3 py-1.5 rounded-lg">
            Your Airtime: {report.studentSpeakingPercent}% ({report.studentSpeakingSec}s)
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          {report.participantBreakdown?.map((p, idx) => {
            const colors = ['bg-blue-500', 'bg-rose-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-indigo-500'];
            const color = colors[idx % colors.length];
            return (
              <div
                key={p.id}
                style={{ width: `${Math.max(4, p.speakingPercent)}%` }}
                className={`${color} h-full transition-all`}
                title={`${p.name}: ${p.speakingPercent}%`}
              />
            );
          })}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
          {report.participantBreakdown?.map((p) => (
            <div key={p.id} className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl text-center space-y-0.5">
              <div className="text-xs font-semibold text-slate-200 truncate">{p.name}</div>
              <div className="text-[10px] text-slate-400">{p.speakingPercent}% airtime</div>
              <div className="text-[10px] text-slate-500 font-mono">{p.turnCount} turns</div>
            </div>
          ))}
        </div>
      </div>

      {/* "What You Could Have Said" Replay Section */}
      {report.missedOpportunities && report.missedOpportunities.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[11px] font-semibold">
              <Lightbulb className="w-3.5 h-3.5" /> High-Impact Placement Replay
            </div>
            <h3 className="text-base font-semibold text-white mt-1">
              "What You Could Have Said" — Reclaiming Key Openings
            </h3>
            <p className="text-xs text-slate-400">
              Moments where an elite candidate would have intervened to guide the group.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {report.missedOpportunities.map((opp, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2.5 text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-300">
                    Situation at +{formatTimestamp(opp.timestampSec)}
                  </span>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-semibold">
                    {opp.strategicPrinciple || (opp as any).strategicPivot || 'The Strategic Pivot'}
                  </span>
                </div>

                <div className="text-slate-400 space-y-0.5">
                  <p><strong>Trigger:</strong> {opp.triggerContext}</p>
                  <p><strong>Observed:</strong> {opp.whatYouSaidOrDid}</p>
                </div>

                <div className="bg-blue-950/20 border border-blue-500/30 rounded-lg p-3 space-y-1">
                  <div className="text-[11px] font-semibold text-blue-400 uppercase tracking-wide">
                    Suggested High-Impact Script:
                  </div>
                  <p className="text-slate-200 font-mono italic leading-relaxed">
                    {opp.whatYouCouldHaveSaid}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Save / Print PDF Report</span>
        </button>

        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Practice Next Round</span>
        </button>
      </div>
    </div>
  );
};
