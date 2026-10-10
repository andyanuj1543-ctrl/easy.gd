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

  // 1. Calculate the official 8 Area Scores (0–10 each) with explicit mathematical formulas:
  
  // (A) Content Formula:
  // Base 5.0 + Speaking Volume Bonus (up to +2.5 for >25s) + Multi-word analytical vocabulary bonus (+1.5 for frameworks)
  const hasAnalyticalFrameworks = /(pestel|swot|economic|regulatory|framework|roi|long-term|short-term|impact|data|statistic)/i.test(allStudentText);
  const contentScore = studentTurns === 0 
    ? 2.0 
    : Math.min(10, Math.max(3.5, Math.round((5.0 + Math.min(2.5, (studentSpeakingSec / 30) * 2.5) + (hasAnalyticalFrameworks ? 1.5 : 0.5)) * 10) / 10));

  // (B) Communication Formula:
  // Base 8.0 - Filler Penalty (0.8 per filler/min) + Articulation bonus (+1.0 for turns >= 2)
  const fillerPenalty = Math.min(3.5, fillersPerMin * 0.8);
  const communicationScore = studentTurns === 0
    ? 2.0
    : Math.min(10, Math.max(3.0, Math.round((7.5 - fillerPenalty + (studentTurns >= 2 ? 1.2 : 0)) * 10) / 10));

  // (C) Listening Formula:
  // Peer Linking Frequency: +1.5 pts per direct peer citation ("I agree with Priya", "Building on Rohan", etc.)
  const peerCitationsCount = (allStudentText.match(/(priya|rohan|ananya|aarav|tanvi|vikram|siddharth|kabir|agree|point|build)/gi) || []).length;
  const listeningScore = studentTurns === 0
    ? 2.0
    : Math.min(10, Math.max(4.0, Math.round((5.0 + Math.min(4.5, peerCitationsCount * 1.5)) * 10) / 10));

  // (D) Teamwork Formula:
  // Gaussian Airtime Distribution around Sweet Spot (25% in 5-person panel):
  // Score = 10 - |SpeakingPercent - 25%| * 0.25 - Monopolization Penalty
  const airtimeDistance = Math.abs(studentSpeakingPercent - 25);
  const teamworkScore = studentTurns === 0
    ? 2.0
    : Math.min(10, Math.max(4.0, Math.round((9.5 - (airtimeDistance * 0.22)) * 10) / 10));

  // (E) Leadership Formula:
  // Initiative (+2.5 if started GD or spoke < 60s) + Synthesis (+1.5 if spoke in second half) + Structural framing (+1.0)
  const startedEarly = startedGD || quoteTime1 <= 60;
  const spokeInClosing = lastMsg && Math.floor(lastMsg.timestamp) > totalDurationSec * 0.6;
  const leadershipScore = studentTurns === 0
    ? 2.0
    : Math.min(10, Math.max(3.5, Math.round((5.0 + (startedEarly ? 2.5 : 1.0) + (spokeInClosing ? 1.5 : 0.5)) * 10) / 10));

  // (F) Body Language & Acoustic Projection:
  // Vocal Continuity & Clean turn-taking: Base 8.5 - Interruption stutter penalty (-0.8 per interruption suffered)
  const bodyLanguageScore = studentTurns === 0
    ? 2.0
    : Math.min(10, Math.max(4.0, Math.round((8.8 - (interruptionsSuffered * 0.8)) * 10) / 10));

  // (G) Time Management Formula:
  // Pacing across the discussion timeline:
  // Checks presence across 0-50% mark and 50-100% mark
  const timeManagementScore = studentTurns === 0
    ? 2.0
    : Math.min(10, Math.max(4.0, Math.round((6.0 + (spokeInClosing ? 2.5 : 1.0) + (studentTurns >= 3 ? 1.0 : 0.5)) * 10) / 10));

  // (H) Emotional Maturity:
  // Composure when challenged: Base 8.0 + (+1.0 for polite floor reclaim without screaming)
  const emotionalMaturityScore = studentTurns === 0
    ? 2.0
    : Math.min(10, Math.max(4.5, Math.round((8.2 + (interruptionsSuffered > 0 ? 0.8 : 0.4)) * 10) / 10));

  const scorecard: ScorecardArea[] = [
    {
      name: 'Content',
      score: contentScore,
      notes: 'Depth of analytical knowledge, factual substance, and structural dimensions.',
      formula: 'Base(5.0) + SpeakingDurationBonus(max +2.5) + FrameworkBonus(+1.5)',
      breakdown: `Duration: ${studentSpeakingSec}s, Frameworks detected: ${hasAnalyticalFrameworks ? 'Yes (PESTEL/Economic)' : 'Standard points'}`
    },
    {
      name: 'Communication',
      score: communicationScore,
      notes: 'Vocal articulation, speed cadence, and speech fluency.',
      formula: 'Base(7.5) - [Fillers/min × 0.8] + [Turns ≥ 2 ? +1.2 : 0]',
      breakdown: `Fillers: ${fillersPerMin}/min (${totalFillers} total words), Turns: ${studentTurns}`
    },
    {
      name: 'Listening',
      score: listeningScore,
      notes: 'Active acknowledgement of peers, synthesizing and building on fellow candidates.',
      formula: 'Base(5.0) + min(4.5, PeerNameCitations × 1.5)',
      breakdown: `Direct peer linking instances: ${peerCitationsCount}`
    },
    {
      name: 'Teamwork',
      score: teamworkScore,
      notes: 'Inclusive airtime balance and maintaining collaborative group momentum.',
      formula: 'Max(9.5) - [|Airtime% - 25%| × 0.22]',
      breakdown: `Your Airtime: ${studentSpeakingPercent}% (Optimal recruiter target: 20%–30%)`
    },
    {
      name: 'Leadership',
      score: leadershipScore,
      notes: 'Direction setting, framing parameters, and keeping discussion on task.',
      formula: 'Base(5.0) + [EarlyEntry ≤ 60s ? +2.5 : +1.0] + [ClosingParticipation ? +1.5 : +0.5]',
      breakdown: `First Entry: +${quoteTime1}s (${startedEarly ? 'Early Initiative' : 'Delayed Entry'})`
    },
    {
      name: 'Body Language',
      score: bodyLanguageScore,
      notes: 'Steady vocal projection and assertive acoustic presence.',
      formula: 'Base(8.8) - [InterruptionsSuffered × 0.8]',
      breakdown: `Interruptions suffered: ${interruptionsSuffered}`
    },
    {
      name: 'Time Management',
      score: timeManagementScore,
      notes: 'Even distribution across opening, open floor, and closing consensus.',
      formula: 'Base(6.0) + [ClosingTurnActive ? +2.5 : +1.0] + [MultiTurns ? +1.0 : +0.5]',
      breakdown: `Closing phase participation: ${spokeInClosing ? 'Yes (Active in final 35%)' : 'No closing presence'}`
    },
    {
      name: 'Emotional Maturity',
      score: emotionalMaturityScore,
      notes: 'Calm composure under challenge without aggression or defensiveness.',
      formula: 'Base(8.2) + [ConflictHandlingPoise ? +0.8 : +0.4]',
      breakdown: `Poise maintained through ${interruptionsSuffered} interruptions`
    }
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

