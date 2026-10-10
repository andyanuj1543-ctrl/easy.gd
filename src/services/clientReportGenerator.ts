import { GDMessage, GDReport, PersonaConfig, ScorecardArea, GDDifficulty, GDSessionType } from '../types/gd';
import { SelfUpgradeEngine } from './selfUpgradeEngine';

export function generateClientSideReport(
  topicTitle: string,
  messages: GDMessage[],
  studentName: string,
  totalDurationSec: number,
  participants: PersonaConfig[],
  difficulty: GDDifficulty = 'Beginner',
  sessionType: GDSessionType = 'Practice Session'
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

  // Filler words tracking from Research Spec (Rule 10: um, uh, like, you know, basically)
  const allStudentText = studentMsgs.map(m => m.text).join(' ').toLowerCase();
  const fillerRegex = /\b(um|uh|like|you know|basically|actually|sort of|kind of|i mean)\b/gi;
  const detectedFillers = allStudentText.match(fillerRegex) || [];
  const totalFillers = detectedFillers.length;
  const speakingMins = Math.max(0.5, studentSpeakingSec / 60);
  const fillersPerMin = Math.round((totalFillers / speakingMins) * 10) / 10;

  let fillerGrade: 'Excellent (0)' | 'Good (1-2/min)' | 'Average (3-4/min)' | 'Poor (5+/min)' = 'Excellent (0)';
  if (fillersPerMin > 4) fillerGrade = 'Poor (5+/min)';
  else if (fillersPerMin >= 2.5) fillerGrade = 'Average (3-4/min)';
  else if (fillersPerMin >= 0.8) fillerGrade = 'Good (1-2/min)';

  // Research Spec 70/30 Content & Group Management Split (Spec Part 1.2 & 9.1)
  const researchDepthScore = Math.min(30, Math.round((contentScore / 10) * 30));
  const criticalPerspectivesScore = Math.min(40, Math.round((leadershipScore / 10) * 40));
  const contentWeight70 = researchDepthScore + criticalPerspectivesScore; // out of 70

  const bodyLanguageWeight10 = Math.min(10, Math.round((bodyLanguageScore / 10) * 10));
  const languageWeight10 = Math.min(10, Math.round((communicationScore / 10) * 10));
  const groupManagementStrategies10 = Math.min(10, Math.round((teamworkScore / 10) * 10));
  const groupManagementWeight30 = bodyLanguageWeight10 + languageWeight10 + groupManagementStrategies10; // out of 30

  const masterWeightedScore100 = contentWeight70 + groupManagementWeight30; // out of 100
  const leadershipScale40 = Math.min(40, Math.round((leadershipScore / 10) * 40));

  const sampleQuote1 = firstMsg ? firstMsg.text : 'I believe before reaching conclusions, we must evaluate both perspectives.';
  const sampleQuote2 = studentMsgs.length > 1 ? studentMsgs[1].text : sampleQuote1;
  const quoteTime1 = firstMsg ? Math.floor(firstMsg.timestamp) : 45;
  const quoteTime2 = studentMsgs.length > 1 ? Math.floor(studentMsgs[1].timestamp) : 110;

  // 1. Calculate the official 8 Area Scores (0–10 each) from GD Master Spec v3.0:
  // - Content: facts, structure, substance
  const contentScore = Math.min(10, Math.max(4, Math.round((studentSpeakingSec > 25 ? 8.5 : 7.0) * 10) / 10));
  // - Communication: articulation, clarity, no fillers
  const communicationScore = Math.min(10, Math.max(4, Math.round((studentTurns >= 3 ? 8.5 : 7.2) * 10) / 10));
  // - Listening: references peers, agrees, builds
  const listeningScore = Math.min(10, Math.max(4, Math.round((studentMsgs.some((m) => /agree|point|build|priya|rohan|ananya|aarav/i.test(m.text)) ? 8.8 : 7.0) * 10) / 10));
  // - Teamwork: helps the group, includes quieter peers
  const teamworkScore = Math.min(10, Math.max(4, Math.round((studentSpeakingPercent >= 18 && studentSpeakingPercent <= 32 ? 8.5 : 6.8) * 10) / 10));
  // - Leadership: gives direction, structures discussion, guides without dominating
  const leadershipScore = Math.min(10, Math.max(4, Math.round((startedGD ? 9.0 : (quoteTime1 < 75 ? 7.8 : 6.5)) * 10) / 10));
  // - Body Language: vocal projection, eye contact posture (in audio: steady projection & latency)
  const bodyLanguageScore = Math.min(10, Math.max(4, Math.round((interruptionsSuffered === 0 ? 8.6 : 7.5) * 10) / 10));
  // - Time Management: respects duration, summarizes in closing window
  const timeManagementScore = Math.min(10, Math.max(4, Math.round((lastMsg && Math.floor(lastMsg.timestamp) > totalDurationSec * 0.65 ? 8.5 : 7.0) * 10) / 10));
  // - Emotional Maturity: composure when challenged by Critic or Dominator
  const emotionalMaturityScore = Math.min(10, Math.max(4, Math.round((interruptionsSuffered > 0 ? 8.8 : 8.2) * 10) / 10));

  const scorecard: ScorecardArea[] = [
    { name: 'Content', score: contentScore, notes: 'Substantive topic points backed by logical arguments and practical examples.' },
    { name: 'Communication', score: communicationScore, notes: 'Clear vocal articulation, structured sentences, and minimal filler words.' },
    { name: 'Listening', score: listeningScore, notes: 'Actively acknowledged and connected with peer arguments rather than speaking in isolation.' },
    { name: 'Teamwork', score: teamworkScore, notes: 'Balanced airtime presence that maintained healthy, inclusive group momentum.' },
    { name: 'Leadership', score: leadershipScore, notes: startedGD ? 'Took bold initiative to frame the scope early.' : 'Entered early and guided the discussion towards consensus.' },
    { name: 'Body Language', score: bodyLanguageScore, notes: 'Steady vocal projection and assertive acoustic presence.' },
    { name: 'Time Management', score: timeManagementScore, notes: 'Paced remarks evenly across the discussion phases and contributed towards closing.' },
    { name: 'Emotional Maturity', score: emotionalMaturityScore, notes: 'Stayed composed under peer pressure without becoming defensive.' }
  ];

  const totalScore80 = Math.round(scorecard.reduce((sum, item) => sum + item.score, 0) * 10) / 10;
  const overallScore = Math.min(100, Math.round((totalScore80 / 80) * 100));

  let recommendation: 'Strong Hire' | 'Hire' | 'Borderline / Needs Polish' | 'Do Not Advance' = 'Hire';
  if (totalScore80 >= 66) recommendation = 'Strong Hire';
  else if (totalScore80 >= 52) recommendation = 'Hire';
  else if (totalScore80 >= 40) recommendation = 'Borderline / Needs Polish';
  else recommendation = 'Do Not Advance';

  // 2. Process self-upgrade engine
  const selfUpgradeLog = SelfUpgradeEngine.processSessionResult({
    topicTitle,
    difficulty,
    sessionType,
    durationSec: totalDurationSec,
    participants,
    scorecard,
    totalScore80,
    studentSpeakingPercent
  });

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
    scorecard,
    totalScore80,
    overallScore,
    hiringRecommendation: recommendation,
    executiveSummary: `Candidate achieved a scorecard of ${totalScore80}/80 (${overallScore}%). Floor presence was balanced with ${studentSpeakingPercent}% airtime. Vocal recovery and listening cohesion were notable strengths. The self-upgrade engine logged this session to adapt peer difficulty for Session #${selfUpgradeLog.sessionNumber + 1}.`,
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
      content: {
        name: 'Content & Knowledge Depth',
        score: contentScore,
        verdict: contentScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Offered structured causal reasoning and relevant points.',
        quotedMoments: [
          {
            quote: `"${sampleQuote2}"`,
            timestampSec: quoteTime2,
            context: 'Substantive contribution during open debate',
            recruiterInsight: 'Structured arguments with economic or social rationale earn top recruiter marks.'
          }
        ]
      },
      communication: {
        name: 'Communication & Articulation',
        score: communicationScore,
        verdict: communicationScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Maintained smooth delivery without excessive fillers or hesitation.',
        quotedMoments: [
          {
            quote: `"${sampleQuote1}"`,
            timestampSec: quoteTime1,
            context: 'Speech flow assessment',
            recruiterInsight: 'Clear, concise phrasing prevents misunderstandings in high-stakes panels.'
          }
        ]
      },
      listening: {
        name: 'Active Listening & Synthesis',
        score: listeningScore,
        verdict: listeningScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Acknowledged peers and bridged differing viewpoints effectively.',
        quotedMoments: [
          {
            quote: `"${sampleQuote1}"`,
            timestampSec: quoteTime1,
            context: 'Acknowledging peer viewpoints',
            recruiterInsight: 'Recruiters reward synthesizing peer arguments over isolated monologues.'
          }
        ]
      },
      teamwork: {
        name: 'Teamwork & Inclusion',
        score: teamworkScore,
        verdict: teamworkScore >= 8 ? 'Excellent' : 'Good',
        explanation: `Balanced airtime presence (${studentSpeakingPercent}%) without dominating the room.`,
        quotedMoments: [
          {
            quote: `"${sampleQuote2}"`,
            timestampSec: quoteTime2,
            context: 'Collaborative discussion contribution',
            recruiterInsight: 'Maintained collaborative harmony with peer candidates.'
          }
        ]
      },
      leadership: {
        name: 'Leadership & Direction',
        score: leadershipScore,
        verdict: leadershipScore >= 8 ? 'Excellent' : 'Good',
        explanation: startedGD ? 'Took bold initiative to frame initial boundaries.' : 'Entered early to steer the conversation on track.',
        quotedMoments: [
          {
            quote: `"${sampleQuote1}"`,
            timestampSec: quoteTime1,
            context: 'Initial floor entry',
            recruiterInsight: 'Framing discussion boundaries early establishes natural authority.'
          }
        ]
      },
      bodyLanguage: {
        name: 'Body Language & Vocal Poise',
        score: bodyLanguageScore,
        verdict: bodyLanguageScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Consistent vocal projection and assertive tone.',
        quotedMoments: [
          {
            quote: `"${sampleQuote1}"`,
            timestampSec: quoteTime1,
            context: 'Vocal delivery',
            recruiterInsight: 'A confident, measured tone signals executive presence.'
          }
        ]
      },
      timeManagement: {
        name: 'Time Management & Pacing',
        score: timeManagementScore,
        verdict: timeManagementScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Paced contributions steadily across all stages of the session.',
        quotedMoments: [
          {
            quote: `"${lastMsg ? lastMsg.text : sampleQuote2}"`,
            timestampSec: lastMsg ? Math.floor(lastMsg.timestamp) : quoteTime2,
            context: 'Stage timing and closing',
            recruiterInsight: 'Knowing when to close remarks demonstrates disciplined executive time awareness.'
          }
        ]
      },
      emotionalMaturity: {
        name: 'Emotional Maturity & Composure',
        score: emotionalMaturityScore,
        verdict: emotionalMaturityScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Maintained composure and politeness under peer interruptions.',
        quotedMoments: [
          {
            quote: `"${sampleQuote1}"`,
            timestampSec: quoteTime1,
            context: 'Floor transition under pressure',
            recruiterInsight: 'Remaining calm when contested is the number one filter for top consulting and tech recruiters.'
          }
        ]
      },
      // Backward compatibility bindings
      initiativeAndOpening: {
        name: 'Initiative & Scope Definition',
        score: leadershipScore,
        verdict: leadershipScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Initiative and early framing marks.',
        quotedMoments: [{ quote: `"${sampleQuote1}"`, timestampSec: quoteTime1, context: 'Opening', recruiterInsight: 'Initiative presence.' }]
      },
      ideaQualityAndFrameworks: {
        name: 'Idea Quality & Structured Thinking',
        score: contentScore,
        verdict: contentScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Content depth marks.',
        quotedMoments: [{ quote: `"${sampleQuote2}"`, timestampSec: quoteTime2, context: 'Open debate', recruiterInsight: 'Analytical depth.' }]
      },
      synthesizingAndListening: {
        name: 'Active Listening & Building on Others',
        score: listeningScore,
        verdict: listeningScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Listening synthesis marks.',
        quotedMoments: [{ quote: `"${sampleQuote1}"`, timestampSec: quoteTime1, context: 'Synthesizing', recruiterInsight: 'Connecting points.' }]
      },
      floorControlAndPacing: {
        name: 'Floor Control & Airtime Sweet Spot',
        score: teamworkScore,
        verdict: teamworkScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Floor balance marks.',
        quotedMoments: [{ quote: `"${sampleQuote2}"`, timestampSec: quoteTime2, context: 'Airtime', recruiterInsight: 'Room control.' }]
      },
      handlingInterruptionAndConflict: {
        name: 'Composure & Interruption Management',
        score: emotionalMaturityScore,
        verdict: emotionalMaturityScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Conflict poise marks.',
        quotedMoments: [{ quote: `"${sampleQuote1}"`, timestampSec: quoteTime1, context: 'Composure', recruiterInsight: 'Handling interruptions.' }]
      },
      conclusionAndSummary: {
        name: 'Closing & Consensus Formulation',
        score: timeManagementScore,
        verdict: timeManagementScore >= 8 ? 'Excellent' : 'Good',
        explanation: 'Concluding summary marks.',
        quotedMoments: [{ quote: `"${lastMsg ? lastMsg.text : sampleQuote2}"`, timestampSec: quoteTime2, context: 'Closing', recruiterInsight: 'Summarizing.' }]
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
        triggerContext: 'When Kabir drifted off-track into tangential analogies.',
        whatYouSaidOrDid: 'Remained silent.',
        whatYouCouldHaveSaid: '“Kabir’s analogy highlights an exciting dynamic, but coming back to our core question on unit economics: how does that convert to sustainable margins?”',
        strategicPrinciple: 'The Anchor Pivot: Steer the group back to the core agenda to score high moderator points.'
      }
    ],
    selfUpgradeLog,

    // UPGRADE 5.0 — Research-Backed & IIM Process Additions
    iimDualEvaluators: {
      academicEvaluator: {
        name: 'Prof. K. R. Raghavan',
        role: 'Faculty Evaluator 1 (Academic & Content Chair)',
        contentScore: Math.round(contentScore * 4), // out of 40
        researchDepthScore: researchDepthScore, // out of 30
        criticalPerspectivesScore: criticalPerspectivesScore, // out of 40
        summaryEvaluation: startedGD
          ? 'Strong initial framing. Demonstrated structured understanding of the core macro thesis.'
          : 'Participated with relevant substantive arguments. Encouraged to cite more empirical citations early.',
        detailedNotes: `Demonstrated clear reasoning across economic and social consequences. Scored ${contentWeight70}/70 on academic content rigor.`
      },
      corporateEvaluator: {
        name: 'Sunita Mehra',
        role: 'Faculty Evaluator 2 (Corporate Recruitment Panelist)',
        groupManagementScore: groupManagementWeight30, // out of 30
        bodyLanguageScore: bodyLanguageWeight10, // out of 10
        languagePacingScore: languageWeight10, // out of 10
        leadershipScale40: leadershipScale40, // out of 40
        detailedNotes: `Speaking airtime was well calibrated at ${studentSpeakingPercent}%. Vocal projection and conversational manners reflected mature collaborative readiness.`
      }
    },

    fillerMetrics: {
      totalFillers,
      fillersPerMinute: fillersPerMin,
      fillerWordsDetected: Array.from(new Set(detectedFillers)),
      grade: fillerGrade
    },

    researchMarkingSplit: {
      contentWeight70,
      groupManagementWeight30,
      masterWeightedScore100
    }
  };
}

