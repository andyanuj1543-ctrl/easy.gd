import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { apiRouter } from './routes/api.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'easy.gd backend',
    timestamp: new Date().toISOString(),
    keysConfigured: {
      grok: Boolean(process.env.GROK_API_KEY || process.env.XAI_API_KEY),
      sarvam: Boolean(process.env.SARVAM_API_KEY),
      groq: Boolean(process.env.GROQ_API_KEY),
      gemini: Boolean(process.env.GEMINI_API_KEY)
    }
  });
});

// API Routes
app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`🚀 easy.gd backend running at http://localhost:${PORT}`);
});
