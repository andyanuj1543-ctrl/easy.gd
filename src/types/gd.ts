export type GDStage = 
  | 'setup' 
  | 'prep' 
  | 'opening' 
  | 'open_discussion' 
  | 'warning' 
  | 'closing' 
  | 'evaluating' 
  | 'report';

export type GDFormat = 
  | 'placement_classic' 
  | 'case_study' 
  | 'abstract' 
  | 'controversial' 
  | 'fishbowl';

export type GDLanguageMode = 'en-IN' | 'hinglish' | 'en-US';

export interface PersonaConfig {
  id: string;
  name: string;
  role: 'moderator' | 'dominator' | 'analyst' | 'quiet' | 'drifter' | 'diplomat';
  archetype: string;
  avatar: string;
  color: string;
  voiceGender: 'male' | 'female';
  sarvamVoice: string; // 'arvind' | 'meera' | 'pavithra' | 'amol' | 'amartya'
  pitch: number;
  rate: number;
  instructions: string;
  dominanceWeight: number;
}

export interface GDTopic {
  id: string;
  title: string;
  category: 'Placement Classic' | 'Case Study' | 'Abstract' | 'Controversial' | 'Tech & AI';
  description: string;
  keyPerspectives: string[];
  suggestedDurationMins: number;
}

export interface GDMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: number; // seconds from start
  durationSec: number;
  isInterrupted?: boolean;
  interruptedBy?: string;
  quotedFrom?: {
    speakerName: string;
    textSnippet: string;
  };
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
  overallScore: number;
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

export interface RoomSettings {
  topic: GDTopic;
  format: GDFormat;
  languageMode: GDLanguageMode;
  panelSize: number; // 3 to 5 AI participants (excluding moderator)
  durationMins: number; // 3 to 12 mins
  studentName: string;
  patienceLatencyMs: number; // 500ms to 2500ms
  fishbowlSpectatorMode: boolean;
}

export interface ApiKeysConfig {
  grokApiKey: string;
  sarvamApiKey: string;
  groqApiKey: string;
  geminiApiKey: string;
}
