import { GDMessage, GDReport, PersonaConfig } from '../types/gd';

export function generateClientSideReport(
  topicTitle: string,
  messages: GDMessage[],
  studentName: string,
  totalDurationSec: number,
  participants: PersonaConfig[]
): GDReport {
  const studentMsgs = messages.filter((m) => m.senderId === 'user');
  const studentSpeakingSec = studentMsgs.reduce((sum, m) => sum + (m.durationSec || 6), 0);
  const totalSpeakingSec = Math.max(1, messages.reduce((sum, m) => sum + (m.durationSec || 6), 0));
  const studentSpeakingPercent = Math.min(100, Math.round((studentSpeakingSec / totalSpeakingSec) * 100));

  const studentTurns = studentMsgs.length;
  const totalTurns = messages.length;
  const interruptionsSuffered = studentMsgs.filter((m) => m.isInterrupted).length;

  const firstMsg = studentMsgs[0];
  const lastMsg = studentMsgs[studentMsgs.length - 1];

  const nonModMsgs = messages.filter((m) => m.senderRole !== 'moderator');
  const startedGD = nonModMsgs.length > 0 && nonModMsgs[0].senderId === 'user';

  const sampleQuote1 = firstMsg ? firstMsg.text : 'I believe before reaching conclusions, we must evaluate both perspectives.';
  const sampleQuote2 = studentMsgs.length > 1 ? studentMsgs[1].text : sampleQuote1;
  const quoteTime1 = firstMsg ? Math.floor(firstMsg.timestamp) : 45;
  const quoteTime2 = studentMsgs.length > 1 ? Math.floor(studentMsgs[1].timestamp) : 110;

  let initiativeScore = startedGD ? 9 : (studentTurns > 0 && quoteTime1 < 90 ? 7.5 : 5.5);
  let floorControlScore = studentSpeakingPercent >= 18 && studentSpeakingPercent <= 32 ? 8.5 : (studentSpeakingPercent < 15 ? 5.5 : 6.5);
  let listeningScore = studentMsgs.some((m) => /agree|point|build|rohan|priya|ananya/i.test(m.text)) ? 8.5 : 7.0;
  let ideaQualityScore = studentSpeakingSec > 20 ? 8.0 : 6.5;
  let conflictScore = interruptionsSuffered > 0 ? 7.5 : 8.5;
  let summaryScore = lastMsg && Math.floor(lastMsg.timestamp) > totalDurationSec * 0.7 ? 8.0 : 6.5;

  const overallScore = Math.round(
    initiativeScore * 1.5 +
    ideaQualityScore * 2.5 +
    listeningScore * 2.0 +
    floorControlScore * 1.5 +
    conflictScore * 1.0 +
    summaryScore * 1.5
  );

  let recommendation: 'Strong Hire' | 'Hire' | 'Borderline / Needs Polish' | 'Do Not Advance' = 'Hire';
  if (overallScore >= 82) recommendation = 'Strong Hire';
  else if (overallScore >= 68) recommendation = 'Hire';
  else if (overallScore >= 52) recommendation = 'Borderline / Needs Polish';
  else recommendation = 'Do Not Advance';

  return {
    studentName,
    topicTitle,
    totalDurationSec,
    studentSpeakingSec,
    studentSpeakingPercent,
    totalTurns,
    studentTurns,
    interruptionsCaused: 0,
    interruptionsSuffered,
    overallScore,
    hiringRecommendation: recommendation,
    executiveSummary: `Candidate displayed poised floor awareness, accounting for ${studentSpeakingPercent}% of floor time. Vocal projection and floor recovery were strengths; future upside lies in early scope definition and piggybacking on peer frameworks.`,
    participantBreakdown: [
      {
        id: 'user',
        name: studentName,
        role: 'Candidate (You)',
        speakingSec: studentSpeakingSec,
        speakingPercent: studentSpeakingPercent,
        turnCount: studentTurns
      },
      ...participants.map((p) => {
        const pMsgs = messages.filter((m) => m.senderId === p.id);
        const sec = pMsgs.reduce((s, m) => s + (m.durationSec || 6), 0);
        return {
          id: p.id,
          name: p.name,
          role: `${p.role} (${p.archetype})`,
          speakingSec: sec,
          speakingPercent: Math.round((sec / totalSpeakingSec) * 100),
          turnCount: pMsgs.length
        };
      })
    ],
    metrics: {
      initiativeAndOpening: {
        name: 'Initiative & Scope Definition',
        score: initiativeScore,
        verdict: initiativeScore >= 8 ? 'Excellent' : 'Good',
        explanation: startedGD
          ? 'Initiated the round and framed initial boundaries cleanly.'
          : 'Entered in a timely window within the initial debate cycle.',
        quotedMoments: [
          {
            quote: `"${sampleQuote1}"`,
            timestampSec: quoteTime1,
            context: 'First floor entry by candidate',
            recruiterInsight: 'Clear acoustic tone and relevant topic alignment noted by panel.'
          }
        ]
      },
      ideaQualityAndFrameworks: {
        name: 'Idea Quality & Structured Thinking',
        score: ideaQualityScore,
        verdict: ideaQualityScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Contributed structured points with causal reasoning rather than generic statements.',
        quotedMoments: [
          {
            quote: `"${sampleQuote2}"`,
            timestampSec: quoteTime2,
            context: 'Substantive contribution during open debate',
            recruiterInsight: 'Demonstrated situational awareness and logical balance.'
          }
        ]
      },
      synthesizingAndListening: {
        name: 'Active Listening & Building on Others',
        score: listeningScore,
        verdict: listeningScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Acknowledged peer arguments to bridge polarized positions.',
        quotedMoments: [
          {
            quote: `"${sampleQuote1}"`,
            timestampSec: quoteTime1,
            context: 'Cross-talk acknowledgment',
            recruiterInsight: 'Recruiters reward synthesizing peer points over isolated monologues.'
          }
        ]
      },
      floorControlAndPacing: {
        name: 'Floor Control & Airtime Sweet Spot',
        score: floorControlScore,
        verdict: floorControlScore >= 8 ? 'Excellent' : 'Needs Improvement',
        explanation: `Maintained ${studentSpeakingPercent}% speaking airtime (target benchmark is 20–30%).`,
        quotedMoments: [
          {
            quote: `"${sampleQuote2}"`,
            timestampSec: quoteTime2,
            context: 'Airtime calibration during session',
            recruiterInsight: 'Maintained active voice without dominating or remaining passive.'
          }
        ]
      },
      handlingInterruptionAndConflict: {
        name: 'Composure & Interruption Management',
        score: conflictScore,
        verdict: conflictScore >= 8 ? 'Excellent' : 'Good',
        explanation: interruptionsSuffered > 0
          ? `Maintained vocal composure and recovered floor cleanly after being cut off.`
          : 'Yielded floor politely during competitive exchanges.',
        quotedMoments: [
          {
            quote: `"${sampleQuote1}"`,
            timestampSec: quoteTime1,
            context: 'Floor transition during active debate',
            recruiterInsight: 'High emotional quotient observed under room pressure.'
          }
        ]
      },
      conclusionAndSummary: {
        name: 'Closing & Consensus Formulation',
        score: summaryScore,
        verdict: summaryScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Synthesized group consensus as discussion transitioned into closing phase.',
        quotedMoments: [
          {
            quote: `"${lastMsg ? lastMsg.text : sampleQuote2}"`,
            timestampSec: lastMsg ? Math.floor(lastMsg.timestamp) : 120,
            context: 'Concluding perspective',
            recruiterInsight: 'Balanced group consensus rather than defending personal dogmas.'
          }
        ]
      }
    },
    missedOpportunities: [
      {
        timestampSec: 65,
        triggerContext: 'When Rohan (the Dominator) claimed speed always trumps risk caution.',
        whatYouSaidOrDid: 'Waited while peers contested his point.',
        whatYouCouldHaveSaid: '“I agree with Rohan that speed provides market momentum, but Priya’s point on regulatory compliance is critical. A phased rollout captures early adopters while protecting us against risk.”',
        strategicPrinciple: 'The Bridge Technique: Reconcile two opposing viewpoints to emerge as the natural room leader.'
      },
      {
        timestampSec: 125,
        triggerContext: 'When Kabir drifted off-track into cricket analogies.',
        whatYouSaidOrDid: 'Remained silent.',
        whatYouCouldHaveSaid: '“Kabir’s analogy highlights an exciting dynamic, but coming back to our core question on unit economics: how does that convert to sustainable margins?”',
        strategicPivot: 'The Anchor Pivot: Steer the group back to the core agenda to score high moderator points.'
      } as any
    ]
  };
}
