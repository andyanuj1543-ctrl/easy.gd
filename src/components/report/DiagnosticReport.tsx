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
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [report.overallScore, report.totalScore80]);

  const getVerdictBadge = (rec: string) => {
    switch (rec) {
      case 'Strong Hire':
        return <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Strong Hire (Top Tier)</span>;
      case 'Hire':
        return <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Hire (Advancing to PI)</span>;
      case 'Borderline / Needs Polish':
        return <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Borderline / Needs Polish</span>;
      default:
        return <span className="bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">Do Not Advance</span>;
    }
  };

  const formatTimestamp = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const selfLog = report.selfUpgradeLog;

  return (
    <div className="max-w-6xl mx-auto px-6 py-6 space-y-6 print:p-0">
      
      {/* Top Banner: Dossier Overview */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              <span>Campus Placement Evaluation Dossier · Spec v3.0</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {report.studentName}'s Recruiter Scorecard
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Topic: <strong className="text-slate-800">"{report.topicTitle}"</strong>
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2.5">
            {getVerdictBadge(report.hiringRecommendation)}
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black font-mono text-slate-900">
                {report.totalScore80 ?? Math.round(report.overallScore * 0.8)}
              </span>
              <span className="text-slate-400 text-sm font-semibold">/80</span>
              <span className="text-xs text-slate-500 block font-mono">({report.overallScore}%)</span>
            </div>
          </div>
        </div>

        {/* Executive Recruiter Summary */}
        <div className="pt-4 space-y-1.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-indigo-600" />
            <span>Recruiter Panel Feedback</span>
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            {report.executiveSummary}
          </p>
        </div>
        {/* IIM Dual Evaluator Panel Assessment (Spec Part 1.1 & 8.2 #12) */}
        {report.iimDualEvaluators && (
          <div className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span>IIM-Standard 2-Evaluator Panel Assessment (Part 1.1)</span>
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">2 Faculty Chairs</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Evaluator 1: Academic Chair */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {report.iimDualEvaluators.academicEvaluator.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {report.iimDualEvaluators.academicEvaluator.role}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                    Content: {report.iimDualEvaluators.academicEvaluator.contentScore}/40
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed italic">
                  &ldquo;{report.iimDualEvaluators.academicEvaluator.summaryEvaluation}&rdquo;
                </p>
                <div className="text-[11px] text-slate-500">
                  {report.iimDualEvaluators.academicEvaluator.detailedNotes}
                </div>
              </div>

              {/* Evaluator 2: Corporate HR Chair */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {report.iimDualEvaluators.corporateEvaluator.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      {report.iimDualEvaluators.corporateEvaluator.role}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                    Group Mgmt: {report.iimDualEvaluators.corporateEvaluator.groupManagementScore}/30
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-600">
                  <div className="bg-white border border-slate-200 rounded p-1.5">
                    Body Language: <strong>{report.iimDualEvaluators.corporateEvaluator.bodyLanguageScore}/10</strong>
                  </div>
                  <div className="bg-white border border-slate-200 rounded p-1.5">
                    Leadership Scale: <strong>{report.iimDualEvaluators.corporateEvaluator.leadershipScale40}/40</strong>
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">
                  {report.iimDualEvaluators.corporateEvaluator.detailedNotes}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Research-Backed Marking Breakdown (70% Content / 30% Group Management) & Filler Tracking */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {/* 70/30 Split Card */}
          {report.researchMarkingSplit && (
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider">
                  Research 70/30 Marking Split
                </span>
                <span className="text-xs font-mono font-bold text-indigo-700">
                  {report.researchMarkingSplit.masterWeightedScore100}/100
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Content & Rigor (70% weight):</span>
                <strong className="font-mono">{report.researchMarkingSplit.contentWeight70}/70</strong>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Group Management (30% weight):</span>
                <strong className="font-mono">{report.researchMarkingSplit.groupManagementWeight30}/30</strong>
              </div>
            </div>
          )}

          {/* Filler Word Tracking Card */}
          {report.fillerMetrics && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Speech Filler Tracking (Spec Rule 10)
                </span>
                <span className="text-xs font-semibold text-slate-700">
                  {report.fillerMetrics.grade}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-700">
                <span>Fillers Detected ({report.fillerMetrics.totalFillers} total):</span>
                <span className="font-mono font-bold text-indigo-600">
                  {report.fillerMetrics.fillersPerMinute} per min
                </span>
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {report.fillerMetrics.fillerWordsDetected.length > 0
                  ? `Identified words: ${report.fillerMetrics.fillerWordsDetected.join(', ')}`
                  : 'Zero vocal filler words detected — clean delivery.'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Official 8-Part Scorecard Matrix (/80) - PART B3 & D3 of Spec */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ListChecks className="w-4 h-4 text-indigo-600" />
              <span>Placement Scorecard (8 Dimensions · 0 to 10 Each)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Evaluated strictly according to the Master Group Discussion Rubric.
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg">
            Total: {report.totalScore80 ?? Math.round(report.overallScore * 0.8)} / 80
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {report.scorecard?.map((area, idx) => {
            const isTop = area.score >= 8;
            const isLow = area.score < 6;
            return (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">{area.name}</span>
                    <span className={`text-xs font-bold font-mono ${isTop ? 'text-emerald-600' : isLow ? 'text-rose-600' : 'text-indigo-600'}`}>
                      {area.score}/10
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-normal mt-1">
                    {area.notes}
                  </p>
                  {area.formula && (
                    <div className="mt-2 pt-1.5 border-t border-slate-200/80 space-y-1">
                      <div className="text-[9px] font-mono text-indigo-700 bg-indigo-50/80 px-1.5 py-0.5 rounded border border-indigo-100">
                        Formula: {area.formula}
                      </div>
                      {area.breakdown && (
                        <div className="text-[9px] text-slate-500 font-mono">
                          {area.breakdown}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Visual score bar */}
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                  <div 
                    className={`h-full ${isTop ? 'bg-emerald-500' : isLow ? 'bg-rose-500' : 'bg-indigo-600'}`}
                    style={{ width: `${Math.min(100, area.score * 10)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Self-Upgrade Log: SESSION LOG #___ */}
      {selfLog && (
        <div className="bg-white border border-indigo-200 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Self-Upgrade Log #00{selfLog.sessionNumber}
              </h3>
            </div>
            <div className="text-xs text-slate-500 font-mono">
              Next Adaptive Level: <strong className="text-indigo-600">{selfLog.difficulty}</strong>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left: What Worked & What Failed */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-emerald-700 uppercase tracking-wider text-[10px] block mb-1">
                  What Worked (Strengths)
                </span>
                <ul className="space-y-1 text-slate-700">
                  {selfLog.whatWorked.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-rose-700 uppercase tracking-wider text-[10px] block mb-1">
                  What Failed (Identified Weaknesses)
                </span>
                <ul className="space-y-1 text-slate-700">
                  {selfLog.whatFailed.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right: AI Upgrades Applied & Next Session Plan */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div>
                <span className="font-bold text-indigo-700 uppercase tracking-wider text-[10px] block mb-1">
                  AI Model Adaptation Applied
                </span>
                <ul className="space-y-1 text-slate-700">
                  {selfLog.aiUpgradeApplied.map((item, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-amber-700 uppercase tracking-wider text-[10px] block mb-1">
                  Recommended Next Session
                </span>
                <p className="text-slate-700 leading-relaxed">
                  {selfLog.nextSessionPlan}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Airtime & Floor Distribution */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Airtime & Floor Distribution</span>
            </h3>
            <p className="text-xs text-slate-500">
              Target placement benchmark: <strong>20% – 30%</strong> in a 5-person panel.
            </p>
          </div>

          <div className="text-xs font-mono font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-md">
            Your Airtime: {report.studentSpeakingPercent}% ({report.studentSpeakingSec}s)
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
          {report.participantBreakdown?.map((p, idx) => {
            const colors = ['bg-indigo-600', 'bg-rose-500', 'bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-blue-400'];
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
            <div key={p.id} className="bg-slate-50 border border-slate-200 p-2 rounded-lg text-center space-y-0.5">
              <div className="text-xs font-bold text-slate-800 truncate">{p.name}</div>
              <div className="text-[10px] text-slate-500">{p.speakingPercent}% airtime</div>
              <div className="text-[10px] text-slate-400 font-mono">{p.turnCount} turns</div>
            </div>
          ))}
        </div>
      </div>

      {/* "What You Could Have Said" Replay Section */}
      {report.missedOpportunities && report.missedOpportunities.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600" /> High-Impact Placement Replay
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1">
              "What You Could Have Said" — Reclaiming Key Openings
            </h3>
            <p className="text-xs text-slate-500">
              Moments where an elite candidate would have intervened to guide the group.
            </p>
          </div>

          <div className="space-y-3 pt-1">
            {report.missedOpportunities.map((opp, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                  <span className="font-bold text-slate-700">
                    Situation at +{formatTimestamp(opp.timestampSec)}
                  </span>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 font-bold">
                    {opp.strategicPrinciple || (opp as any).strategicPivot || 'The Strategic Pivot'}
                  </span>
                </div>

                <div className="text-slate-600 space-y-0.5">
                  <p><strong>Trigger:</strong> {opp.triggerContext}</p>
                  <p><strong>Observed:</strong> {opp.whatYouSaidOrDid}</p>
                </div>

                <div className="bg-indigo-50 border border-indigo-200 rounded-md p-2.5 space-y-1">
                  <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide">
                    Suggested High-Impact Script:
                  </div>
                  <p className="text-slate-800 font-mono italic leading-relaxed">
                    {opp.whatYouCouldHaveSaid}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 print:hidden">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Save / Print PDF Report</span>
        </button>

        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Practice Next Round</span>
        </button>
      </div>
    </div>
  );
};
