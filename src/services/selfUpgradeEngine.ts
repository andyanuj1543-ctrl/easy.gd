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

    // 1. Analyze Strengths and Weaknesses from scorecard (Part E & Rule 3)
    const sortedAreas = [...scorecard].sort((a, b) => b.score - a.score);
    const topStrengths = sortedAreas.slice(0, 2).map(a => `${a.name} (Scored ${a.score}/10)`);
    const lowestWeaknesses = sortedAreas.slice(-2).map(a => `${a.name} (Scored ${a.score}/10)`);

    // 2. Rules 4 & 5 Difficulty Progression
    let nextDifficulty = difficulty;
    let difficultyUpgradeNotice = '';

    if (totalScore80 >= 64) {
      profile.consecutiveHighScoreCount += 1;
      profile.consecutiveLowScoreCount = 0;
      if (profile.consecutiveHighScoreCount >= 2) {
        // Upgrade difficulty
        if (difficulty === 'Beginner') nextDifficulty = 'Intermediate';
        else if (difficulty === 'Intermediate') nextDifficulty = 'Advanced';
        else if (difficulty === 'Advanced') nextDifficulty = 'Brutal';
        difficultyUpgradeNotice = `Promoted to ${nextDifficulty} difficulty (Rule 4: Two consecutive 8+/10 performances).`;
        profile.consecutiveHighScoreCount = 0;
      }
    } else if (totalScore80 < 40) {
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

    // 3. AI Behavioral Upgrades (Part E3)
    const aiUpgrades: string[] = [];
    if (difficultyUpgradeNotice) aiUpgrades.push(difficultyUpgradeNotice);
    aiUpgrades.push(`Calibrated peer reaction latency to ${Math.max(600, 1400 - sessionNumber * 60)}ms for sharper floor contention.`);
    if (studentSpeakingPercent < 20) {
      aiUpgrades.push(`The Leader (Vikram/Aarav) programmed to prompt candidate by name when silence exceeds 45s.`);
    } else if (studentSpeakingPercent > 35) {
      aiUpgrades.push(`The Critic (Priya) and Dominator (Rohan) primed with polite interruptions if candidate speaks > 40s uninterrupted.`);
    } else {
      aiUpgrades.push(`Balanced turn-taking: AI personas will prioritize synthesizing candidate’s previous points.`);
    }

    // 4. Phrases & Topics Learned (Rule 6 & 7)
    const newPhrases = [
      `"To add empirical rigor to what ${participants[0]?.name || 'the panel'} noted, consider the downstream adoption rate..."`,
      `"While I appreciate that perspective, let us not conflate causation with correlation."`
    ];
    profile.learnedPhrases = Array.from(new Set([...profile.learnedPhrases, ...newPhrases]));

    const newTopic = `Strategic follow-up: Impact of policy changes on ${topicTitle.slice(0, 30)}...`;
    profile.dynamicTopicsAdded = Array.from(new Set([...profile.dynamicTopicsAdded, newTopic]));

    // 5. Human Improvement Target
    const improvementTargets = lowestWeaknesses.map(w => `Focus on ${w}: Aim for +1.5 points next session.`);

    // 6. Next Session Plan
    const nextSessionPlan = totalScore80 < 50
      ? `Drill Session focused on ${sortedAreas[sortedAreas.length - 1]?.name || 'Floor Entry'} at ${nextDifficulty} level.`
      : `Practice Session at ${nextDifficulty} level challenging ${sortedAreas[sortedAreas.length - 1]?.name || 'Leadership'}.`;

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
      humanImprovementTarget: improvementTargets,
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
