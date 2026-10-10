interface SarvamTTSParams {
  text: string;
  speaker?: string; // 'meera' | 'pavithra' | 'maitreyi' | 'arvind' | 'amol' | 'amartya'
  targetLanguageCode?: string; // 'en-IN' | 'hi-IN'
  pitch?: number;
  pace?: number;
  apiKey?: string;
}

export async function synthesizeSarvamSpeech(params: SarvamTTSParams): Promise<{
  audioBase64?: string;
  format?: string;
  isFallback: boolean;
  error?: string;
}> {
  const {
    text,
    speaker = 'arvind',
    targetLanguageCode = 'en-IN',
    pitch = 0,
    pace = 1.0,
    apiKey
  } = params;

  const key = apiKey || process.env.SARVAM_API_KEY;

  if (!key) {
    return {
      isFallback: true,
      error: 'Sarvam API key not configured; client will use Web SpeechSynthesis fallback.'
    };
  }

  try {
    const payload = {
      inputs: [text],
      target_language_code: targetLanguageCode,
      speaker: speaker,
      pitch: pitch,
      pace: pace,
      loudness: 1.5,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
      model: 'bulbul:v1'
    };

    const res = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': key
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn(`Sarvam TTS error (${res.status}): ${errText}`);
      return {
        isFallback: true,
        error: `Sarvam TTS responded with status ${res.status}: ${errText}`
      };
    }

    const data = await res.json();
    if (data.audios && data.audios.length > 0) {
      return {
        audioBase64: data.audios[0],
        format: 'audio/wav',
        isFallback: false
      };
    }

    return {
      isFallback: true,
      error: 'No audio returned in Sarvam response'
    };
  } catch (err: any) {
    console.warn('Sarvam TTS network error:', err);
    return {
      isFallback: true,
      error: err.message || 'Network error calling Sarvam TTS'
    };
  }
}

export async function transcribeSarvamAudio(
  audioBuffer: Buffer,
  apiKey?: string,
  languageCode: string = 'en-IN'
): Promise<{ transcript: string; isFallback: boolean; error?: string }> {
  const key = apiKey || process.env.SARVAM_API_KEY;

  if (!key) {
    return {
      transcript: '',
      isFallback: true,
      error: 'Sarvam API key missing; client using browser SpeechRecognition'
    };
  }

  try {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: 'audio/wav' });
    formData.append('file', blob, 'speech.wav');
    formData.append('model', 'saarika:v1');
    formData.append('language_code', languageCode);

    const res = await fetch('https://api.sarvam.ai/speech-to-text', {
      method: 'POST',
      headers: {
        'api-subscription-key': key
      },
      body: formData
    });

    if (!res.ok) {
      const errText = await res.text();
      return {
        transcript: '',
        isFallback: true,
        error: `Sarvam STT failed with status ${res.status}: ${errText}`
      };
    }

    const data = await res.json();
    return {
      transcript: data.transcript || '',
      isFallback: false
    };
  } catch (err: any) {
    return {
      transcript: '',
      isFallback: true,
      error: err.message || 'Error during Sarvam STT transcription'
    };
  }
}
