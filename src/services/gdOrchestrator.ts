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
      durationSec: 6
    };

    this.messages.push(openingMsg);
    this.callbacks.onNewMessage(openingMsg);
    this.lastSpeakerId = MODERATOR_PERSONA.id;

    // Transition to open discussion after moderator finishes speaking
    setTimeout(() => {
      if (!this.isRunning) return;
      this.currentStage = 'open_discussion';
      this.callbacks.onStageChange('open_discussion');
      // Give student 2.5s to start speaking; if they don't, first AI speaker takes initiative!
      this.scheduleNextAiTurn(2500);
    }, 6000);
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
      let text = '';

      // 1. Try Direct Fast Client LLM if API Key is configured
      if (this.apiKey) {
        text = await this.generateDirectLlmTurn(speaker);
      }

      // 2. If no API key or LLM failed, try backend proxy
      if (!text) {
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
          if (res.ok) {
            const data = await res.json();
            text = data.text;
          }
        } catch (e) {}
      }

      // 3. High-Fidelity Humanized Dynamic Fallback
      if (!text) {
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

        // Schedule next AI speaker after current finishes talking (durationSec + small natural pause)
        if (this.currentStage === 'open_discussion') {
          const pauseSec = Math.floor(Math.random() * 2) + 1; // 1-2s natural human breath pause
          const nextTurnMs = (msg.durationSec + pauseSec) * 1000;
          this.scheduleNextAiTurn(nextTurnMs);
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
        const pauseSec = Math.floor(Math.random() * 2) + 1;
        const nextTurnMs = (msg.durationSec + pauseSec) * 1000;
        this.scheduleNextAiTurn(nextTurnMs);
      }
    } finally {
      this.isGeneratingTurn = false;
      this.callbacks.onSpeakerActive(null);
    }
  }

  private async generateDirectLlmTurn(speaker: PersonaConfig): Promise<string> {
    if (!this.apiKey) return '';

    const recentTranscript = this.messages.slice(-6).map(m => {
      return `${m.senderName} (${m.senderRole}): "${m.text}"`;
    }).join('\n');

    const lastMsg = this.messages[this.messages.length - 1];
    const lastSpeakerName = lastMsg ? lastMsg.senderName : 'the room';

    const systemPrompt = `You are playing ${speaker.name} (${speaker.archetype}) in an authentic Indian Campus Placement Group Discussion.
Personality Directives:
${speaker.instructions}

Topic: "${this.settings.topic.title}" - ${this.settings.topic.description}
Candidate's Name: ${this.settings.studentName}
Last Speaker was: ${lastSpeakerName}

CRITICAL RULES FOR REALISTIC HUMAN SPOKEN DIALOGUE:
1. Speak NATURALLY in 1 to 2 spoken sentences (maximum 28 words).
2. React DIRECTLY to what was just said! Build on or disagree with ${lastSpeakerName} or ${this.settings.studentName}.
3. Sound conversational: use natural transitions ("I hear that point, but...", "Building on what was just said...", "Let's look at the numbers...").
4. Output ONLY the raw spoken dialogue. Never include speaker names, bullet points, quotes, or markdown.`;

    const userPrompt = `Recent context:\n${recentTranscript || '[Discussion just opened]'}\n\nSpeak now as ${speaker.name} in 1-2 sharp spoken sentences:`;

    // A. Groq (Ultra fast ~300ms)
    if (this.provider === 'groq' || this.apiKey.startsWith('gsk_')) {
      try {
        const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 60
          })
        });
        if (res.ok) {
          const data = await res.json();
          const clean = data.choices?.[0]?.message?.content?.replace(/^["']|["']$/g, '').trim();
          if (clean) return clean;
        }
      } catch (e) {}
    }

    // B. Grok / xAI
    if (this.provider === 'grok' || (!this.provider && this.apiKey.startsWith('xai-'))) {
      try {
        const res = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: 'grok-2-latest',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.8,
            max_tokens: 60
          })
        });
        if (res.ok) {
          const data = await res.json();
          const clean = data.choices?.[0]?.message?.content?.replace(/^["']|["']$/g, '').trim();
          if (clean) return clean;
        }
      } catch (e) {}
    }

    // C. Gemini
    if (this.provider === 'gemini' || this.apiKey.startsWith('AIza')) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 60 }
          })
        });
        if (res.ok) {
          const data = await res.json();
          const clean = data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/^["']|["']$/g, '').trim();
          if (clean) return clean;
        }
      } catch (e) {}
    }

    return '';
  }

  private generateFallbackTurn(speaker: PersonaConfig): string {
    const lastMsg = this.messages[this.messages.length - 1];
    const lastSpeaker = lastMsg ? lastMsg.senderName : 'the room';

    const topicTitle = this.settings.topic.title;

    if (speaker.role === 'leader') {
      const list = [
        `Let me step back and structure what we have discussed so far regarding "${topicTitle}". We have heard both operational and societal angles; let us now align on concrete solutions.`,
        `I appreciate the passion in the room, but let's make sure we give space to everyone. Before we conclude, what is our key priority?`,
        `Building on what ${lastSpeaker} said, let us frame this into three buckets: policy implementation, economic feasibility, and citizen adoption.`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
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
    if (speaker.role === 'critic') {
      const list = [
        `I see a fundamental flaw in that logic. You are assuming infinite resources and frictionless adoption, which never happens in reality.`,
        `Have we considered the unintended systemic fallout? If we proceed with ${lastSpeaker}'s model, who bears the liability when errors occur?`,
        `That sounds appealing in theory, but stress-testing it against actual governance constraints reveals major regulatory bottlenecks.`
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
    if (speaker.role === 'supporter' || speaker.role === 'diplomat') {
      const list = [
        `I completely agree with the candidate’s perspective on this. Extending that thought, collaborative public-private partnerships can bridge that gap.`,
        `That is a very constructive point made by ${lastSpeaker}. If we combine that with robust quality checks, the entire panel reaches consensus.`,
        `I want to back that point up—bringing both technical capability and ground-level feedback together makes this model work.`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
    if (speaker.role === 'clown') {
      const list = [
        `Haha, let me lighten this discussion for a second! If our recruiters were listening to this right now, they'd ask for an ROI statement by yesterday!`,
        `On a lighter note, imagine explaining this complex framework to my grandmother—she’d just ask if it saves time or costs money!`,
        `Good point, but let’s not overcomplicate it like a rocket science exam—common sense execution is 90% of the game.`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
    if (speaker.role === 'deviator' || speaker.role === 'drifter') {
      const list = [
        `This actually reminds me of an interesting case study from the Finnish education model where decentralization created unexpected breakthroughs.`,
        `Think about it like an IPL championship match—you can formulate the best strategic playbook, but adaptability on the ground wins the game!`,
        `Looking at historical precedents during the industrial revolution, every technological shock initially creates fear before stabilizing.`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
    if (speaker.role === 'philosopher') {
      const list = [
        `Let us examine the foundational ethical premise here: is efficiency our ultimate moral compass, or is it human dignity?`,
        `Beyond the commercial balance sheet, what kind of societal contract are we implicitly endorsing through this policy?`,
        `When we evaluate ${lastSpeaker}'s point through first principles, we must ask whether technology serves humanity or vice versa.`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
    if (speaker.role === 'databomb') {
      const list = [
        `Let me inject some hard empirical numbers: NASSCOM and Gartner predict a 34% productivity variance within the first 18 months of rollout.`,
        `According to recent economic surveys, capital expenditure efficiency improves by nearly 2.4x when structured frameworks are adopted.`,
        `The statistics are undeniable here: over 68% of pilot implementations fail purely due to lack of middle-management change integration.`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
    if (speaker.role === 'emotional') {
      const list = [
        `This is not just an intellectual debate—it directly touches real families, livelihoods, and youth aspiring for stability!`,
        `We cannot reduce human lives and aspirations to cold cells on a spreadsheet. Where is the empathy in our proposed solution?`,
        `I feel deeply that unless we protect the most vulnerable stakeholders first, any economic victory is hollow.`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }
    if (speaker.role === 'devilsadvocate') {
      const list = [
        `Let me deliberately challenge the room's consensus: what if our starting assumption is completely backwards?`,
        `Everyone seems to agree on ${lastSpeaker}'s thesis, but what happens during a severe black swan event when the foundation collapses?`,
        `I’m playing devil’s advocate here: why are we even forcing this change if the status quo already delivers 80% of the benefits at half the cost?`
      ];
      return list[Math.floor(Math.random() * list.length)];
    }

    return `Building on what ${lastSpeaker} highlighted, sustainable implementation requires both stakeholder alignment and transparent oversight.`;
  }

  public getMessages(): GDMessage[] {
    return this.messages;
  }
}
