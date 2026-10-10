import { GDMessage, PersonaConfig } from '../types.js';

interface TurnRequestParams {
  topic: {
    title: string;
    description: string;
    category?: string;
  };
  messages: GDMessage[];
  speaker: PersonaConfig;
  allPersonas: PersonaConfig[];
  studentName?: string;
  roomStage: 'opening' | 'open_discussion' | 'warning' | 'closing';
  userInterrupted?: boolean;
  apiKey?: string;
  provider?: 'grok' | 'groq' | 'gemini';
}

export async function generatePersonaTurn(params: TurnRequestParams): Promise<{
  text: string;
  quotedSpeaker?: string;
  quotedSnippet?: string;
}> {
  const { topic, messages, speaker, allPersonas, studentName = 'Candidate', roomStage, apiKey, provider = 'grok' } = params;

  const key = apiKey || process.env.GROK_API_KEY || process.env.XAI_API_KEY || process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;

  // Build conversational context
  const recentTranscript = messages.slice(-10).map(m => {
    return `${m.senderName} (${m.senderRole})${m.isInterrupted ? ' [INTERRUPTED]' : ''}: "${m.text}"`;
  }).join('\n');

  const otherNames = allPersonas.filter(p => p.id !== speaker.id).map(p => `${p.name} (${p.archetype})`).join(', ');

  const systemPrompt = `You are playing ${speaker.name} in an authentic live Indian Campus Placement Group Discussion.
Role: ${speaker.role} (${speaker.archetype}).
Specific Persona Directives:
${speaker.instructions}

Other people in the room: ${studentName} (the human placement candidate), and peers: ${otherNames}.
Topic: "${topic.title}" - ${topic.description}
Current GD Stage: ${roomStage.toUpperCase()}

Crucial GD Rules for your reply:
1. Speak NATURALLY in 1 to 3 punchy spoken sentences (under 35 words total). NEVER write an essay or bullet points.
2. DO NOT just talk to the student! Address or reference other participants by name when appropriate ("I agree with Priya's logic...", "Rohan makes a strong claim, but...", "Building on Candidate's point...").
3. Stay in character! If you are Rohan (dominator), be assertive and confident. If Priya (analyst), quote a metric or framework. If Ananya (quiet), be gentle and thoughtful. If Kabir (drifter), use an analogy or colloquial Hinglish flair.
4. Output ONLY the raw spoken dialogue. Do not include markdown asterisks, actions in parentheses, or speaker labels.`;

  const userPrompt = `Recent discussion transcript:
${recentTranscript || '[Discussion is just starting]'}

Current situation: The floor is now yours (${speaker.name}). Speak directly to the room based on what was just said:`;

  if (key) {
    try {
      // 1. Try Grok (xAI) or Groq (OpenAI-compatible)
      if (provider === 'grok' || (!provider && (process.env.GROK_API_KEY || process.env.XAI_API_KEY))) {
        const grokEndpoint = 'https://api.x.ai/v1/chat/completions';
        const model = 'grok-2-latest';

        const res = await fetch(grokEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify({
            model: model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.85,
            max_tokens: 90
          })
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.choices?.[0]?.message?.content?.trim();
          if (reply) {
            return cleanDialogue(reply);
          }
        }
      }

      // 2. Try Groq (Fast Free Tier)
      if (provider === 'groq' || key.startsWith('gsk_') || process.env.GROQ_API_KEY) {
        const groqKey = key.startsWith('gsk_') ? key : (process.env.GROQ_API_KEY || key);
        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${groqKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.85,
            max_tokens: 90
          })
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const reply = data.choices?.[0]?.message?.content?.trim();
          if (reply) {
            return cleanDialogue(reply);
          }
        }
      }

      // 3. Try Gemini API
      if (provider === 'gemini' || key.startsWith('AIza') || process.env.GEMINI_API_KEY) {
        const geminiKey = key.startsWith('AIza') ? key : (process.env.GEMINI_API_KEY || key);
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`;
        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
              }
            ],
            generationConfig: {
              temperature: 0.85,
              maxOutputTokens: 90
            }
          })
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (reply) {
            return cleanDialogue(reply);
          }
        }
      }
    } catch (err) {
      console.warn('LLM API call failed, falling back to smart dynamic generator:', err);
    }
  }

  // Fallback to intelligent dynamic dialogue synthesis
  const fallback = generateSmartFallbackDialogue(speaker, messages, topic.title, studentName, roomStage);
  return cleanDialogue(fallback);
}

function cleanDialogue(text: string): { text: string } {
  // Strip quotes, speaker prefixes like "Rohan: ", markdown asterisks
  let cleaned = text.replace(/^["']|["']$/g, '');
  cleaned = cleaned.replace(/^[A-Za-z\s]+:\s*/, '');
  cleaned = cleaned.replace(/\*[^*]+\*/g, '');
  cleaned = cleaned.replace(/\([^)]+\)/g, '');
  return { text: cleaned.trim() };
}

function generateSmartFallbackDialogue(
  speaker: PersonaConfig,
  messages: GDMessage[],
  topicTitle: string,
  studentName: string,
  stage: string
): string {
  const lastMsg = messages[messages.length - 1];
  const lastSpeaker = lastMsg ? lastMsg.senderName : 'the room';

  if (stage === 'opening' && speaker.role === 'moderator') {
    return `Welcome everyone. Today's group discussion topic is: "${topicTitle}". You have 8 minutes for an open exchange. Let's maintain mutual respect and avoid cross-talk. Please begin.`;
  }

  if (stage === 'closing' && speaker.role === 'moderator') {
    return `We are in the final minute. Let us have a crisp 30-second summary from the group capturing the core consensus. Who would like to summarize?`;
  }

  // Persona-specific dynamic responses reacting to previous speaker
  if (speaker.role === 'dominator') {
    const openings = [
      `Look, let me jump in right here. The ground reality is simple—if you don't scale fast, you become irrelevant.`,
      `I completely disagree with the cautious approach. If we look at the aggressive competitors in the market, waiting around is pure suicide.`,
      `Let me take the lead on this point. What ${lastSpeaker} said misses the commercial angle entirely!`,
      `Building directly on that, the most urgent factor here is speed of execution, not endless debate.`
    ];
    return openings[Math.floor(Math.random() * openings.length)];
  }

  if (speaker.role === 'analyst') {
    const openings = [
      `I hear that perspective, but if we look at the PESTEL framework and industry data, the ROI doesn't substantiate that claim.`,
      `Let's structure this into two distinct metrics: first, the regulatory risk, and second, customer retention economics.`,
      `Interesting point from ${lastSpeaker}, but what empirical evidence do we have to validate that adoption rate?`,
      `To bring some analytical rigor here: without a clear break-even timeline, this strategy carries severe downside exposure.`
    ];
    return openings[Math.floor(Math.random() * openings.length)];
  }

  if (speaker.role === 'quiet') {
    const openings = [
      `If I may add a quieter observation... we shouldn't overlook the grassroots human impact and mental well-being in this shift.`,
      `I feel what ${lastSpeaker} pointed out is valid, but ethical trust is much harder to rebuild once lost.`,
      `Perhaps we can look at the long-term cultural fallout rather than just quarterly KPIs.`
    ];
    return openings[Math.floor(Math.random() * openings.length)];
  }

  if (speaker.role === 'drifter') {
    const openings = [
      `Yaar, honestly, think about it like an IPL final—you can have all the big data in the world, but momentum wins the match!`,
      `Point to sahi hai, but let's zoom out a bit. Remember how Blockbuster thought they were invincible until streaming arrived?`,
      `This reminds me of a real case during college fests—when chaos strikes, rigid rules always collapse first!`
    ];
    return openings[Math.floor(Math.random() * openings.length)];
  }

  if (speaker.role === 'diplomat') {
    const openings = [
      `I think Rohan and Priya are highlighting two sides of the same coin. Can we balance aggressive growth with risk mitigation?`,
      `Let's synthesize what ${lastSpeaker} and ${studentName} mentioned—it bridges the short-term tactical need with long-term vision.`,
      `To find common ground here, maybe a phased rollout satisfies both the innovators and the risk analysts.`
    ];
    return openings[Math.floor(Math.random() * openings.length)];
  }

  return `That brings up an interesting angle regarding sustainability and accountability for all stakeholders involved.`;
}
