import { Router, Request, Response } from 'express';
import { POPULAR_TOPICS } from '../data/topics.js';
import { ALL_PERSONAS } from '../data/personas.js';
import { generatePersonaTurn } from '../services/grokService.js';
import { synthesizeSarvamSpeech, transcribeSarvamAudio } from '../services/sarvamService.js';
import { generateRecruiterReport } from '../services/reportEvaluator.js';

export const apiRouter = Router();

// 1. Get Topics
apiRouter.get('/topics', (req: Request, res: Response) => {
  res.json({ topics: POPULAR_TOPICS });
});

// 2. Get Personas
apiRouter.get('/personas', (req: Request, res: Response) => {
  res.json({ personas: ALL_PERSONAS });
});

// 3. Generate Next Turn (Grok / Groq / Gemini with Fallback)
apiRouter.post('/chat/turn', async (req: Request, res: Response) => {
  try {
    const { topic, messages, speaker, allPersonas, studentName, roomStage, apiKey, provider } = req.body;

    if (!speaker || !topic) {
      return res.status(400).json({ error: 'Missing required speaker or topic parameters' });
    }

    const result = await generatePersonaTurn({
      topic,
      messages: messages || [],
      speaker,
      allPersonas: allPersonas || ALL_PERSONAS,
      studentName: studentName || 'Candidate',
      roomStage: roomStage || 'open_discussion',
      apiKey,
      provider
    });

    res.json(result);
  } catch (err: any) {
    console.error('Error generating turn:', err);
    res.status(500).json({ error: err.message || 'Internal server error in turn generation' });
  }
});

// 4. Sarvam AI Text-to-Speech (Bulbul)
apiRouter.post('/sarvam/tts', async (req: Request, res: Response) => {
  try {
    const { text, speaker, targetLanguageCode, pitch, pace, apiKey } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Missing text to synthesize' });
    }

    const ttsResult = await synthesizeSarvamSpeech({
      text,
      speaker: speaker || 'arvind',
      targetLanguageCode: targetLanguageCode || 'en-IN',
      pitch: pitch || 0,
      pace: pace || 1.0,
      apiKey
    });

    res.json(ttsResult);
  } catch (err: any) {
    console.error('Error in Sarvam TTS:', err);
    res.status(500).json({ isFallback: true, error: err.message });
  }
});

// 5. Sarvam AI Speech-to-Text (Saarika)
apiRouter.post('/sarvam/stt', async (req: Request, res: Response) => {
  try {
    const { audioBase64, languageCode, apiKey } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Missing audioBase64 data' });
    }

    const buffer = Buffer.from(audioBase64, 'base64');
    const result = await transcribeSarvamAudio(buffer, apiKey, languageCode || 'en-IN');
    res.json(result);
  } catch (err: any) {
    console.error('Error in Sarvam STT:', err);
    res.status(500).json({ isFallback: true, error: err.message });
  }
});

// 6. Recruiter Report Evaluation
apiRouter.post('/report/evaluate', async (req: Request, res: Response) => {
  try {
    const { topic, messages, studentId, studentName, totalDurationSec, participants, apiKey, provider } = req.body;

    if (!topic || !messages) {
      return res.status(400).json({ error: 'Missing topic or messages for evaluation' });
    }

    const report = await generateRecruiterReport({
      topic,
      messages: messages || [],
      studentId: studentId || 'user',
      studentName: studentName || 'Candidate',
      totalDurationSec: totalDurationSec || 300,
      participants: participants || ALL_PERSONAS,
      apiKey,
      provider
    });

    res.json(report);
  } catch (err: any) {
    console.error('Error generating report:', err);
    res.status(500).json({ error: err.message || 'Error generating recruiter report' });
  }
});
