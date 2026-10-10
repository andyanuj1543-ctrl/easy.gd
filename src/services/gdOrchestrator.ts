import { GDMessage, GDStage, PersonaConfig, RoomSettings } from '../types/gd';
import { MODERATOR_PERSONA } from '../data/personas';

export interface OrchestratorCallbacks {
  onStageChange: (stage: GDStage) => void;
  onNewMessage: (msg: GDMessage) => void;
  onSpeakerActive: (personaId: string | null) => void;
  onTimeTick: (remainingSec: number) => void;
  onCoachHint: (hint: string) => void;
}

export class GDOrchestrator {
  private settings: RoomSettings;
  private participants: PersonaConfig[];
  private messages: GDMessage[] = [];
  private currentStage: GDStage = 'setup';
  private callbacks: OrchestratorCallbacks;

  private totalDurationSec: number;
  private remainingSec: number;
  private timerInterval: any = null;
  private coachInterval: any = null;

  private isRunning: boolean = false;
  private isGeneratingTurn: boolean = false;
  private nextTurnTimer: any = null;
  private lastStudentSpeechTime: number = 0;
  private lastSpeakerId: string | null = null;

  private apiKey?: string;
  private provider?: 'grok' | 'groq' | 'gemini';

  constructor(
    settings: RoomSettings,
    participants: PersonaConfig[],
    callbacks: OrchestratorCallbacks,
    apiKey?: string,
    provider?: 'grok' | 'groq' | 'gemini'
  ) {
    this.settings = settings;
    this.participants = participants;
    this.callbacks = callbacks;
    this.apiKey = apiKey;
    this.provider = provider;
    this.totalDurationSec = settings.durationMins * 60;
    this.remainingSec = this.totalDurationSec;
  }

  public start() {
    this.isRunning = true;
    this.startTimer();
    this.startCoachLoop();
    this.transitionStage('opening');
  }

  public stop() {
    this.isRunning = false;
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.coachInterval) clearInterval(this.coachInterval);
    if (this.nextTurnTimer) clearTimeout(this.nextTurnTimer);
  }

  private startTimer() {
    this.timerInterval = setInterval(() => {
      if (!this.isRunning) return;

      this.remainingSec -= 1;
      this.callbacks.onTimeTick(this.remainingSec);

      // Warning at 2 minutes (120s)
      if (this.remainingSec === 120 && this.currentStage === 'open_discussion') {
        this.transitionStage('warning');
      }

      // Closing round at 60s
      if (this.remainingSec === 60 && (this.currentStage === 'open_discussion' || this.currentStage === 'warning')) {
        this.transitionStage('closing');
      }

      // Time expired
      if (this.remainingSec <= 0) {
        this.stop();
        this.transitionStage('evaluating');
      }
    }, 1000);
  }

  private startCoachLoop() {
    this.coachInterval = setInterval(() => {
      if (!this.isRunning || this.currentStage !== 'open_discussion') return;
      this.generateCoachNudge();
    }, 25000); // Check every 25s
  }

  private generateCoachNudge() {
    const elapsedSec = this.totalDurationSec - this.remainingSec;
    const timeSinceStudentSpeech = elapsedSec - this.lastStudentSpeechTime;

    if (timeSinceStudentSpeech > 90) {
      this.callbacks.onCoachHint('⏱️ You haven’t spoken for 90+ seconds. In a real GD, this risks passive elimination. Raise your hand or jump in now!');
      return;
    }

    if (this.lastSpeakerId === 'dominator') {
      this.callbacks.onCoachHint('⚡ Rohan just made a bold claim. Jump in with: "Building on Rohan’s energy, let us examine the feasibility..."');
      return;
    }

    if (this.lastSpeakerId === 'drifter') {
      this.callbacks.onCoachHint('🎨 Kabir took the discussion off-track with an analogy. Bring the room back on focus to score high moderator points!');
      return;
    }

    // Default encouragement
    const genericNudges = [
      '💡 Tip: Refer to fellow candidates by name (e.g. "I agree with Priya...") to score high listening points.',
      '🎯 Use a 2-part framework: "First, the short-term consumer impact, and second, the long-term industry shift."',
      '🤝 If someone interrupts you, hold your ground politely: "Allow me 10 seconds to close this thought."'
    ];
    const nudge = genericNudges[Math.floor(Math.random() * genericNudges.length)];
    this.callbacks.onCoachHint(nudge);
  }

  public transitionStage(newStage: GDStage) {
    this.currentStage = newStage;
    this.callbacks.onStageChange(newStage);

    if (newStage === 'opening') {
      this.triggerModeratorOpening();
    } else if (newStage === 'warning') {
      this.triggerModeratorWarning();
    } else if (newStage === 'closing') {
      this.triggerModeratorClosing();
    }
  }

  // --- Moderator Triggers ---
  private async triggerModeratorOpening() {
    const openingMsg: GDMessage = {
      id: `msg-${Date.now()}`,
      senderId: MODERATOR_PERSONA.id,
      senderName: MODERATOR_PERSONA.name,
      senderRole: 'moderator',
      text: `Good morning everyone. Welcome to this discussion round. The topic before the panel is: "${this.settings.topic.title}". The floor is now open for discussion. Let us maintain professional conduct. Please begin.`,
      timestamp: 0,
      durationSec: 8
    };

    this.messages.push(openingMsg);
    this.callbacks.onNewMessage(openingMsg);
    this.lastSpeakerId = MODERATOR_PERSONA.id;

    // Transition to open discussion after moderator finishes
    setTimeout(() => {
      this.currentStage = 'open_discussion';
      this.callbacks.onStageChange('open_discussion');
      this.scheduleNextAiTurn(1800); // Allow student a chance to speak first!
    }, 4000);
  }

  private async triggerModeratorWarning() {
    const warningMsg: GDMessage = {
      id: `msg-${Date.now()}`,
      senderId: MODERATOR_PERSONA.id,
      senderName: MODERATOR_PERSONA.name,
      senderRole: 'moderator',
      text: `Panelists, we have 2 minutes remaining. Please steer your points towards concrete takeaways and synthesis.`,
      timestamp: this.totalDurationSec - this.remainingSec,
      durationSec: 5
    };
    this.messages.push(warningMsg);
    this.callbacks.onNewMessage(warningMsg);
    this.lastSpeakerId = MODERATOR_PERSONA.id;
  }

  private async triggerModeratorClosing() {
    const closingMsg: GDMessage = {
      id: `msg-${Date.now()}`,
      senderId: MODERATOR_PERSONA.id,
      senderName: MODERATOR_PERSONA.name,
      senderRole: 'moderator',
      text: `Time is nearly up. I invite a crisp 30-second summary from the group capturing the core consensus. Who would like to summarize?`,
      timestamp: this.totalDurationSec - this.remainingSec,
      durationSec: 6
    };
    this.messages.push(closingMsg);
    this.callbacks.onNewMessage(closingMsg);
    this.lastSpeakerId = MODERATOR_PERSONA.id;
  }

  // --- Student Speech Registration ---
  public registerStudentSpeech(text: string, isInterruption: boolean = false) {
    if (!text || text.trim().length === 0) return;

    const elapsedSec = this.totalDurationSec - this.remainingSec;
    this.lastStudentSpeechTime = elapsedSec;

    // If student interrupted an active AI speaker, mark the previous message
    if (isInterruption && this.messages.length > 0) {
      const prevMsg = this.messages[this.messages.length - 1];
      if (prevMsg.senderId !== 'user') {
        prevMsg.isInterrupted = true;
        prevMsg.interruptedBy = this.settings.studentName;
      }
    }

    const studentMsg: GDMessage = {
      id: `msg-${Date.now()}`,
      senderId: 'user',
      senderName: this.settings.studentName,
      senderRole: 'Candidate',
      text: text.trim(),
      timestamp: elapsedSec,
      durationSec: Math.max(3, Math.round(text.split(' ').length / 2.2))
    };

    this.messages.push(studentMsg);
    this.callbacks.onNewMessage(studentMsg);
    this.lastSpeakerId = 'user';

    // Clear any pending AI turns and schedule a response after student finishes
    if (this.nextTurnTimer) clearTimeout(this.nextTurnTimer);
    this.scheduleNextAiTurn(this.settings.patienceLatencyMs || 1000);
  }

  // --- Turn-Taking Logic ---
  public scheduleNextAiTurn(delayMs: number = 1000) {
    if (!this.isRunning || this.isGeneratingTurn) return;

    if (this.nextTurnTimer) clearTimeout(this.nextTurnTimer);

    this.nextTurnTimer = setTimeout(async () => {
      if (!this.isRunning || this.isGeneratingTurn) return;
      await this.executeAiTurn();
    }, delayMs);
  }

  private selectNextPersona(): PersonaConfig {
    // Select persona based on who hasn't spoken recently and dominance weight
    const candidates = this.participants.filter(p => p.id !== 'moderator' && p.id !== this.lastSpeakerId);
    
    if (candidates.length === 0) {
      return this.participants[0];
    }

    // Weighted random selection based on dominance weights
    const totalWeight = candidates.reduce((sum, c) => sum + c.dominanceWeight, 0);
    let rand = Math.random() * totalWeight;

    for (const cand of candidates) {
      rand -= cand.dominanceWeight;
      if (rand <= 0) {
        return cand;
      }
    }

    return candidates[0];
  }

  private async executeAiTurn() {
    if (this.isGeneratingTurn || !this.isRunning) return;

    const speaker = this.selectNextPersona();
    this.isGeneratingTurn = true;
    this.callbacks.onSpeakerActive(speaker.id);

    try {
      const res = await fetch('/api/chat/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: this.settings.topic,
          messages: this.messages,
          speaker,
          allPersonas: this.participants,
          studentName: this.settings.studentName,
          roomStage: this.currentStage,
          apiKey: this.apiKey,
          provider: this.provider
        })
      });

      let text = '';
      if (res.ok) {
        const data = await res.json();
        text = data.text;
      } else {
        text = this.generateFallbackTurn(speaker);
      }

      if (text) {
        const elapsedSec = this.totalDurationSec - this.remainingSec;
        const msg: GDMessage = {
          id: `msg-${Date.now()}`,
          senderId: speaker.id,
          senderName: speaker.name,
          senderRole: speaker.role,
          text: text,
          timestamp: elapsedSec,
          durationSec: Math.max(4, Math.round(text.split(' ').length / 2.3))
        };

        this.messages.push(msg);
        this.callbacks.onNewMessage(msg);
        this.lastSpeakerId = speaker.id;

        // Schedule next turn if in open discussion
        if (this.currentStage === 'open_discussion') {
          const speechTimeMs = msg.durationSec * 1000 + 1200;
          this.scheduleNextAiTurn(speechTimeMs);
        }
      }
    } catch (err) {
      console.warn('API turn generation offline, using client fallback:', err);
      const fallbackText = this.generateFallbackTurn(speaker);
      const elapsedSec = this.totalDurationSec - this.remainingSec;
      const msg: GDMessage = {
        id: `msg-${Date.now()}`,
        senderId: speaker.id,
        senderName: speaker.name,
        senderRole: speaker.role,
        text: fallbackText,
        timestamp: elapsedSec,
        durationSec: Math.max(4, Math.round(fallbackText.split(' ').length / 2.3))
      };

      this.messages.push(msg);
      this.callbacks.onNewMessage(msg);
      this.lastSpeakerId = speaker.id;

      if (this.currentStage === 'open_discussion') {
        const speechTimeMs = msg.durationSec * 1000 + 1200;
        this.scheduleNextAiTurn(speechTimeMs);
      }
    } finally {
      this.isGeneratingTurn = false;
      this.callbacks.onSpeakerActive(null);
    }
  }

  private generateFallbackTurn(speaker: PersonaConfig): string {
    const lastMsg = this.messages[this.messages.length - 1];
    const lastSpeaker = lastMsg ? lastMsg.senderName : 'the room';

    if (speaker.role === 'dominator') {
      const list = [
        `Look, let me jump in right here. The ground reality is simple—if you don't scale fast, you become completely irrelevant!`,
        `I strongly disagree with the cautious approach. In this competitive landscape, waiting around is pure suicide!`,
        `Let me take the lead on this point. What ${lastSpeaker} said misses the commercial execution angle entirely!`,
        `Building directly on that, the most urgent factor here is speed to market, not endless analysis.`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
    if (speaker.role === 'analyst') {
      const list = [
        `I hear that perspective, but looking at empirical market data, the unit economics do not substantiate that claim.`,
        `Let's structure this systematically: first, the regulatory risk profile, and second, customer retention economics.`,
        `Interesting point from ${lastSpeaker}, but what concrete benchmark do we have to validate that adoption rate?`,
        `To bring some analytical rigor here: without a clear break-even timeline, this strategy carries severe downside exposure.`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
    if (speaker.role === 'quiet') {
      const list = [
        `If I may add a quieter observation... we shouldn't overlook the grassroots human impact and mental well-being in this shift.`,
        `I feel what ${lastSpeaker} pointed out is valid, but organizational trust is much harder to rebuild once lost.`,
        `Perhaps we can look at the long-term cultural fallout rather than just short-term quarterly KPIs.`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
    if (speaker.role === 'drifter') {
      const list = [
        `Yaar, honestly, think about it like an IPL final—you can have all the big data in the world, but momentum wins the match!`,
        `Point to sahi hai, but let's zoom out a bit. Remember how Blockbuster thought they were invincible until streaming arrived?`,
        `This reminds me of a real situation during college fests—when chaos strikes, rigid rules always collapse first!`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
    if (speaker.role === 'diplomat') {
      const list = [
        `I think Rohan and Priya are highlighting two sides of the same coin. Can we balance aggressive growth with risk mitigation?`,
        `Let's synthesize what ${lastSpeaker} mentioned—it bridges the short-term tactical need with long-term vision.`,
        `To find common ground here, maybe a phased rollout satisfies both the innovators and the risk analysts.`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
    return `That brings up a crucial dimension regarding sustainability and accountability for all stakeholders involved.`;
  }

  public getMessages(): GDMessage[] {
    return this.messages;
  }
}
