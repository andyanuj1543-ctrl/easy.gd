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

export type GDDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Brutal';

export type GDSessionType = 
  | 'Practice Session' 
  | 'Drill Session' 
  | 'Pressure Session' 
  | 'Leadership Session' 
  | 'Summary Session' 
  | 'Evaluation Session';

export type GDLanguageMode = 'en-IN' | 'hinglish' | 'en-US';

export type PersonaRole = 
  | 'moderator' 
  | 'leader' 
  | 'analyst' 
  | 'critic' 
  | 'quiet' 
  | 'dominator' 
  | 'supporter' 
  | 'clown' 
  | 'deviator' 
  | 'philosopher'
  | 'databomb'
  | 'emotional'
  | 'devilsadvocate'
  | 'diplomat';

export interface PersonaConfig {
  id: string;
  name: string;
  role: PersonaRole;
  archetype: string;
  avatar: string;
  color: string;
  voiceGender: 'male' | 'female';
  sarvamVoice: string; // 'arvind' | 'meera' | 'pavithra' | 'amol' | 'amartya'
  pitch: number;
  rate: number;
  instructions: string;
  dominanceWeight: number;
  strength?: string;
  weakness?: string;
  keyPhrases?: string[];
}

export interface GDTopic {
  id: string;
  title: string;
  category: 'Placement Classic' | 'Case Study' | 'Abstract' | 'Controversial' | 'Tech & AI' | 'Follow-up Drill';
  description: string;
  keyPerspectives: string[];
  suggestedDurationMins: number;
  difficulty?: GDDifficulty;
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
  score: number; // 0 to 10
  verdict: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical Concern';
  explanation: string;
  notes?: string;
  quotedMoments: Array<{
    quote: string;
    timestampSec: number;
    context: string;
    recruiterInsight: string;
  }>;
}

export interface ScorecardArea {
  name: 'Content' | 'Communication' | 'Listening' | 'Teamwork' | 'Leadership' | 'Body Language' | 'Time Management' | 'Emotional Maturity';
  score: number; // 0 to 10
  notes: string;
}

export interface MissedOpportunity {
  timestampSec: number;
  triggerContext: string;
  whatYouSaidOrDid: string;
  whatYouCouldHaveSaid: string;
  strategicPrinciple: string;
}

export interface SelfUpgradeLog {
  sessionNumber: number;
  date: string;
  topic: string;
  difficulty: GDDifficulty;
  sessionType: GDSessionType;
  duration: string;
  aiParticipants: string[];
  humanScore: number; // out of 80
  whatWorked: string[];
  whatFailed: string[];
  aiUpgradeApplied: string[];
  humanImprovementTarget: string[];
  newPhrasesAdded: string[];
  newTopicsAdded: string[];
  nextSessionPlan: string;
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
  
  // Official v3.0 Scorecard (/80 total)
  scorecard: ScorecardArea[];
  totalScore80: number; // 0 to 80
  overallScore: number; // normalized percentage 0 to 100 for compatibility

  hiringRecommendation: 'Strong Hire' | 'Hire' | 'Borderline / Needs Polish' | 'Do Not Advance';
  executiveSummary: string;
  
  metrics: {
    content: FeedbackMetric;
    communication: FeedbackMetric;
    listening: FeedbackMetric;
    teamwork: FeedbackMetric;
    leadership: FeedbackMetric;
    bodyLanguage: FeedbackMetric;
    timeManagement: FeedbackMetric;
    emotionalMaturity: FeedbackMetric;
    // Legacy metrics aliases for backward compatibility if needed
    initiativeAndOpening?: FeedbackMetric;
    ideaQualityAndFrameworks?: FeedbackMetric;
    synthesizingAndListening?: FeedbackMetric;
    floorControlAndPacing?: FeedbackMetric;
    handlingInterruptionAndConflict?: FeedbackMetric;
    conclusionAndSummary?: FeedbackMetric;
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

  // Self Upgrade Engine Log
  selfUpgradeLog?: SelfUpgradeLog;

  // UPGRADE 5.0 — Research-Backed & IIM Specification Additions
  iimDualEvaluators?: {
    academicEvaluator: {
      name: string;
      role: string;
      contentScore: number; // /40
      researchDepthScore: number; // /30
      criticalPerspectivesScore: number; // /40
      summaryEvaluation: string;
      detailedNotes: string;
    };
    corporateEvaluator: {
      name: string;
      role: string;
      groupManagementScore: number; // /30
      bodyLanguageScore: number; // /10
      languagePacingScore: number; // /10
      leadershipScale40: number; // /40
      detailedNotes: string;
    };
  };
  fillerMetrics?: {
    totalFillers: number;
    fillersPerMinute: number;
    fillerWordsDetected: string[];
    grade: 'Excellent (0)' | 'Good (1-2/min)' | 'Average (3-4/min)' | 'Poor (5+/min)';
  };
  researchMarkingSplit?: {
    contentWeight70: number; // 70%
    groupManagementWeight30: number; // 30%
    masterWeightedScore100: number; // out of 100
  };
  writtenSummary?: string;
  writtenSummaryFeedback?: string;
}

export interface RoomSettings {
  topic: GDTopic;
  format: GDFormat;
  difficulty: GDDifficulty;
  sessionType: GDSessionType;
  languageMode: GDLanguageMode;
  panelSize: number; // 3 to 6 AI participants (excluding moderator)
  durationMins: number; // 3 to 15 mins
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
