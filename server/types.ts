export interface GDMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: number; // relative seconds from start
  durationSec: number;
  isInterrupted?: boolean;
  interruptedBy?: string;
  quotedFrom?: {
    speakerName: string;
    textSnippet: string;
  };
}

export interface PersonaConfig {
  id: string;
  name: string;
  role: 'moderator' | 'dominator' | 'analyst' | 'quiet' | 'drifter' | 'diplomat';
  archetype: string;
  avatar: string;
  color: string;
  voiceGender: 'male' | 'female';
  sarvamVoice: string; // e.g. 'arvind', 'meera', 'pavithra', 'amol'
  browserVoiceMatch?: string;
  pitch: number;
  rate: number;
  instructions: string;
  dominanceWeight: number; // 0 to 1 likelihood to claim floor
}

export interface GDTopic {
  id: string;
  title: string;
  category: 'Placement Classic' | 'Case Study' | 'Abstract' | 'Controversial' | 'Tech & AI';
  description: string;
  keyPerspectives: string[];
  suggestedDurationMins: number;
}

export interface FeedbackMetric {
  name: string;
  score: number; // 1 to 10
  verdict: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical Concern';
  explanation: string;
  quotedMoments: Array<{
    quote: string;
    timestampSec: number;
    context: string;
    recruiterInsight: string;
  }>;
}

export interface MissedOpportunity {
  timestampSec: number;
  triggerContext: string;
  whatYouSaidOrDid: string;
  whatYouCouldHaveSaid: string;
  strategicPrinciple: string;
}

export interface GDReport {
  studentName: string;
  topicTitle: string;
  totalDurationSec: number;
  studentSpeakingSec: number;
  studentSpeakingPercent: number;
  totalTurns: number;
  studentTurns: number;
  interruptionsCaused: number;
  interruptionsSuffered: number;
  overallScore: number; // out of 100
  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Borderline / Needs Polish' | 'Do Not Advance';
  executiveSummary: string;
  metrics: {
    initiativeAndOpening: FeedbackMetric;
    ideaQualityAndFrameworks: FeedbackMetric;
    synthesizingAndListening: FeedbackMetric;
    floorControlAndPacing: FeedbackMetric;
    handlingInterruptionAndConflict: FeedbackMetric;
    conclusionAndSummary: FeedbackMetric;
  };
  missedOpportunities: MissedOpportunity[];
  participantBreakdown: Array<{
    id: string;
    name: string;
    role: string;
    speakingSec: number;
    speakingPercent: number;
    turnCount: number;
  }>;
}
