import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, TrendingUp, Clock, MessageSquare, CheckCircle, AlertTriangle, 
  Quote, Lightbulb, RefreshCw, Printer, Shield, ChevronRight, UserCheck 
} from 'lucide-react';
import { GDReport } from '../../types/gd';

interface DiagnosticReportProps {
  report: GDReport;
  onRestart: () => void;
}

export const DiagnosticReport: React.FC<DiagnosticReportProps> = ({ report, onRestart }) => {
  useEffect(() => {
    if (report.overallScore >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [report.overallScore]);

  const getVerdictBadge = (rec: string) => {
    switch (rec) {
      case 'Strong Hire':
        return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Strong Hire (Top 10%)</span>;
      case 'Hire':
        return <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Hire (Advancing to PI)</span>;
      case 'Borderline / Needs Polish':
        return <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Borderline / Needs Polish</span>;
      default:
        return <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Do Not Advance</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400';
    if (score >= 6) return 'text-amber-400';
    return 'text-rose-400';
  };

  const metricsList = [
    report.metrics.initiativeAndOpening,
    report.metrics.ideaQualityAndFrameworks,
    report.metrics.synthesizingAndListening,
    report.metrics.floorControlAndPacing,
    report.metrics.handlingInterruptionAndConflict,
    report.metrics.conclusionAndSummary,
  ].filter(Boolean);

  const formatTimestamp = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-fade-in print:p-0">
      
      {/* Top Banner & Verdict Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-1">
              Campus Placement Evaluation Dossier
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {report.studentName}'s Recruiter Report
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Topic: <strong className="text-slate-200">"{report.topicTitle}"</strong>
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2">
            {getVerdictBadge(report.hiringRecommendation)}
            <div className="text-right">
              <span className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                {report.overallScore}
              </span>
              <span className="text-slate-500 text-sm font-semibold">/100</span>
            </div>
          </div>
        </div>

        {/* Executive Recruiter Summary */}
        <div className="pt-6 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
            <span>Recruiter Panel Feedback</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            {report.executiveSummary}
          </p>
        </div>
      </div>

      {/* Speaking Airtime & Participation Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Airtime & Floor Distribution</span>
            </h3>
            <p className="text-xs text-slate-400">
              Recommended placement sweet spot is <strong>20% – 30%</strong> in a 5-person panel.
            </p>
          </div>

          <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
            Your Airtime: {report.studentSpeakingPercent}% ({report.studentSpeakingSec}s)
          </div>
        </div>

        {/* Multi-segment participation progress bar */}
        <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          {report.participantBreakdown.map((p, idx) => {
            const colors = ['bg-emerald-500', 'bg-red-500', 'bg-cyan-500', 'bg-teal-500', 'bg-amber-500', 'bg-indigo-500'];
            const color = colors[idx % colors.length];
            return (
              <div
                key={p.id}
                style={{ width: `${Math.max(5, p.speakingPercent)}%` }}
                className={`${color} h-full transition-all`}
                title={`${p.name}: ${p.speakingPercent}%`}
              />
            );
          })}
        </div>

        {/* Participant Legend Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
          {report.participantBreakdown.map((p, idx) => (
            <div key={p.id} className="bg-slate-950/60 border border-slate-800 p-2.5 rounded-xl text-center space-y-0.5">
              <div className="text-xs font-bold text-slate-200 truncate">{p.name}</div>
              <div className="text-[10px] text-slate-400">{p.speakingPercent}% airtime</div>
              <div className="text-[10px] text-slate-500 font-mono">{p.turnCount} turns</div>
            </div>
          ))}
        </div>
      </div>

      {/* The 6 Core Placement Evaluation Metrics (With Direct Quoted Links) */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span>Placement Competency Matrix & Quoted Evidence</span>
          </h3>
          <p className="text-xs text-slate-400">
            Every evaluation score is grounded in an exact quoted moment from the discussion transcript.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metricsList.map((m, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                  <span className="font-bold text-xs sm:text-sm text-slate-100">{m.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">{m.verdict}</span>
                    <span className={`text-base font-black font-mono ${getScoreColor(m.score)}`}>
                      {m.score}/10
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mt-2.5">
                  {m.explanation}
                </p>
              </div>

              {/* Linked Quote Moment */}
              {m.quotedMoments && m.quotedMoments.length > 0 && (
                <div className="space-y-2 pt-2">
                  {m.quotedMoments.map((q, qIdx) => (
                    <div
                      key={qIdx}
                      className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-medium text-emerald-400 flex items-center gap-1">
                          <Quote className="w-3 h-3" /> Quoted Transcript Moment
                        </span>
                        <span className="font-mono">+{formatTimestamp(q.timestampSec)}</span>
                      </div>
                      <p className="text-xs text-slate-200 font-mono italic">
                        {q.quote}
                      </p>
                      <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/50">
                        <strong className="text-slate-300">Recruiter Take:</strong> {q.recruiterInsight}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* "What You Could Have Said" Replay Section */}
      {report.missedOpportunities && report.missedOpportunities.length > 0 && (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-7 shadow-xl space-y-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-semibold">
              <Lightbulb className="w-3.5 h-3.5" /> High-Impact Placement Replay
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1">
              "What You Could Have Said" — Reclaiming Missed Openings
            </h3>
            <p className="text-xs text-slate-400">
              Moments where an elite McKinsey/Amazon candidate would have intervened to capture the room.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            {report.missedOpportunities.map((opp, idx) => (
              <div
                key={idx}
                className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                  <span className="font-semibold text-slate-300">
                    Situation at +{formatTimestamp(opp.timestampSec)}
                  </span>
                  <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {opp.strategicPrinciple}
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <p><strong>Trigger:</strong> {opp.triggerContext}</p>
                  <p><strong>What Happened:</strong> {opp.whatYouSaidOrDid}</p>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-3 text-xs space-y-1">
                  <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">
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
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Practice Another GD Room</span>
        </button>
      </div>
    </div>
  );
};
