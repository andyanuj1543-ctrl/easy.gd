import { GDDifficulty, GDSessionType, SelfUpgradeLog, ScorecardArea, PersonaConfig } from '../types/gd';

const STORAGE_KEY_LOGS = 'easy_gd_self_upgrade_logs';
const STORAGE_KEY_STATE = 'easy_gd_self_upgrade_state';

export interface UserGDProfile {
  totalSessions: number;
  currentDifficulty: GDDifficulty;
  lastSessionType: GDSessionType;
  consecutiveHighScoreCount: number; // >= 64/80 (8/10 avg)
  consecutiveLowScoreCount: number; // < 40/80 (5/10 avg)
  identifiedWeaknesses: string[];
  identifiedStrengths: string[];
  learnedPhrases: string[];
  dynamicTopicsAdded: string[];
  aiBehaviorUpgrades: string[];
}

const DEFAULT_PROFILE: UserGDProfile = {
  totalSessions: 0,
  currentDifficulty: 'Beginner',
  lastSessionType: 'Practice Session',
  consecutiveHighScoreCount: 0,
  consecutiveLowScoreCount: 0,
  identifiedWeaknesses: ['Initial floor entry hesitation', 'Building on peer arguments'],
  identifiedStrengths: ['Calm tone under pressure'],
  learnedPhrases: [
    'Building on Priya’s framework, let us look at the operational cost...',
    'I agree with the broad principle, but what happens when scale breaks the model?',
    'Allow me 15 seconds to synthesize the two perspectives before we conclude.'
  ],
  dynamicTopicsAdded: [
    'Should Indian startups focus on profitability over hyper-growth?',
    'Will Generative AI commoditize junior engineering roles in 2026?'
  ],
  aiBehaviorUpgrades: [
    'Rule 1 applied: Unique random seed for participant traits per round.',
    'Rule 2 applied: Rohan (Dominator) calibrated to interrupt only after 12s of monologue.'
  ]
};

// Phrase bank from Spec Part M
const MASSIVE_PHRASE_POOL = [
  'Let me begin by defining the core dimensions of this topic.',
  'Building on what was said, I’d like to add a different empirical angle.',
  'I understand that perspective; however, the downstream economic data suggests otherwise.',
  'If I may complete my thought, allow me 10 seconds to finish that point.',
  'I’d like to bring in someone from our table who hasn’t spoken yet.',
  'Let’s return to the core question so we don’t drift away from our objective.',
  'To connect the key threads made so far, common ground seems to be on implementation feasibility.',
  'In the interest of time, let us focus our final remarks on actionable recommendations.'
];

export class SelfUpgradeEngine {
  public static getProfile(): UserGDProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEY_STATE);
      if (data) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to load profile from localStorage:', e);
    }
    return DEFAULT_PROFILE;
  }

  public static saveProfile(profile: UserGDProfile): void {
    try {
      localStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(profile));
    } catch (e) {
      console.warn('Failed to save profile to localStorage:', e);
    }
  }

  public static getSessionLogs(): SelfUpgradeLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEY_LOGS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {}
    return [];
  }

  /**
   * Process completed GD session, update learning weights, difficulty, and create official SESSION LOG #___
   * Adheres strictly to Section L, K, and S of the Master GD Training Specification.
   */
  public static processSessionResult(params: {
    topicTitle: string;
    difficulty: GDDifficulty;
    sessionType: GDSessionType;
    durationSec: number;
    participants: PersonaConfig[];
    scorecard: ScorecardArea[];
    totalScore80: number;
    studentSpeakingPercent: number;
  }): SelfUpgradeLog {
    const profile = this.getProfile();
    const sessionNumber = profile.totalSessions + 1;
    profile.totalSessions = sessionNumber;

    const { totalScore80, scorecard, difficulty, sessionType, topicTitle, durationSec, participants, studentSpeakingPercent } = params;

    // 1. Analyze Strengths and Weaknesses from scorecard (Spec K1, K6 & L2)
    const sortedAreas = [...scorecard].sort((a, b) => b.score - a.score);
    const topStrengths = sortedAreas.slice(0, 3).map(a => `${a.name}: ${a.score}/10 (${a.notes})`);
    const lowestWeaknesses = sortedAreas.slice(-3).map(a => `${a.name}: ${a.score}/10 — Target +1.5 points`);

    // 2. Rules 4 & 5 Difficulty Progression
    let nextDifficulty = difficulty;
    let difficultyUpgradeNotice = '';

    if (totalScore80 >= 64) { // 8+ / 10 average
      profile.consecutiveHighScoreCount += 1;
      profile.consecutiveLowScoreCount = 0;
      if (profile.consecutiveHighScoreCount >= 2) {
        if (difficulty === 'Beginner') nextDifficulty = 'Intermediate';
        else if (difficulty === 'Intermediate') nextDifficulty = 'Advanced';
        else if (difficulty === 'Advanced') nextDifficulty = 'Brutal';
        difficultyUpgradeNotice = `Promoted to ${nextDifficulty} difficulty (Rule 4: Two consecutive 8+/10 performances).`;
        profile.consecutiveHighScoreCount = 0;
      }
    } else if (totalScore80 < 40) { // below 5/10
      profile.consecutiveLowScoreCount += 1;
      profile.consecutiveHighScoreCount = 0;
      if (profile.consecutiveLowScoreCount >= 2 && difficulty !== 'Beginner') {
        if (difficulty === 'Brutal') nextDifficulty = 'Advanced';
        else if (difficulty === 'Advanced') nextDifficulty = 'Intermediate';
        else if (difficulty === 'Intermediate') nextDifficulty = 'Beginner';
        difficultyUpgradeNotice = `Adjusted to ${nextDifficulty} difficulty with supportive drills (Rule 5).`;
        profile.consecutiveLowScoreCount = 0;
      }
    } else {
      profile.consecutiveHighScoreCount = 0;
      profile.consecutiveLowScoreCount = 0;
    }

    profile.currentDifficulty = nextDifficulty;

    // 3. AI Behavioral Upgrades (Spec L2.1 & L3)
    const aiUpgrades: string[] = [];
    if (difficultyUpgradeNotice) aiUpgrades.push(difficultyUpgradeNotice);
    aiUpgrades.push(`Rule 2: Calibrated AI peer latency to ${Math.max(500, 1300 - sessionNumber * 50)}ms for competitive floor entry.`);
    
    if (studentSpeakingPercent < 20) {
      aiUpgrades.push(`The Leader (Aarav) and Supporter (Siddharth) programmed to invite candidate by name if silence exceeds 40s.`);
    } else if (studentSpeakingPercent > 32) {
      aiUpgrades.push(`The Critic (Tanvi) and Dominator (Rohan) primed with polite interruptions if candidate speaks > 35s continuously.`);
    } else {
      aiUpgrades.push(`Balanced turn-taking: AI personas will prioritize synthesizing candidate’s previous points.`);
    }

    // 4. Rule 6: Add 3 new phrases per session (Spec L2.4)
    const phraseOffset = (sessionNumber * 3) % MASSIVE_PHRASE_POOL.length;
    const newPhrases = [
      MASSIVE_PHRASE_POOL[phraseOffset] || MASSIVE_PHRASE_POOL[0],
      MASSIVE_PHRASE_POOL[(phraseOffset + 1) % MASSIVE_PHRASE_POOL.length],
      `"To add empirical rigor to what ${participants[0]?.name || 'the panel'} noted, consider the downstream adoption rate..."`
    ];
    profile.learnedPhrases = Array.from(new Set([...profile.learnedPhrases, ...newPhrases]));

    // 5. Rule 7: Add follow-up topic variations (Spec L2.3)
    const newTopic = `Follow-up Drill: Strategic execution and policy hurdles in ${topicTitle.slice(0, 35)}...`;
    profile.dynamicTopicsAdded = Array.from(new Set([...profile.dynamicTopicsAdded, newTopic]));

    // 6. Next Session Plan (Spec L3)
    const primaryWeakness = sortedAreas[sortedAreas.length - 1]?.name || 'Leadership';
    const nextSessionPlan = totalScore80 < 50
      ? `Drill Session focused on ${primaryWeakness} at ${nextDifficulty} level (Practicing early entry & 3-point structure).`
      : `Practice Session at ${nextDifficulty} level targeting ${primaryWeakness} under aggressive cross-talk.`;

    const mins = Math.round(durationSec / 60);

    const sessionLog: SelfUpgradeLog = {
      sessionNumber,
      date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
      topic: topicTitle,
      difficulty,
      sessionType,
      duration: `${mins} mins`,
      aiParticipants: participants.map(p => `${p.name} (${p.archetype})`),
      humanScore: totalScore80,
      whatWorked: topStrengths,
      whatFailed: lowestWeaknesses,
      aiUpgradeApplied: aiUpgrades,
      humanImprovementTarget: lowestWeaknesses,
      newPhrasesAdded: newPhrases,
      newTopicsAdded: [newTopic],
      nextSessionPlan
    };

    // Save
    const existingLogs = this.getSessionLogs();
    const updatedLogs = [sessionLog, ...existingLogs].slice(0, 50); // Keep last 50 (Rule 10)
    try {
      localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(updatedLogs));
    } catch (e) {}

    this.saveProfile(profile);

    return sessionLog;
  }
}
