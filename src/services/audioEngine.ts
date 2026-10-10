import { PersonaConfig } from '../types/gd';

export interface AudioEngineCallbacks {
  onInterimTranscript?: (text: string) => void;
  onFinalTranscript?: (text: string) => void;
  onUserBargeIn?: () => void;
  onStudentSpeechStart?: () => void;
  onStudentSpeechEnd?: () => void;
  onAiSpeechStart?: (personaId: string) => void;
  onAiSpeechEnd?: (personaId: string) => void;
  onError?: (err: string) => void;
  onVolumeChange?: (volume: number) => void; // 0 to 100
}

export class AudioEngine {
  private recognition: any = null;
  private isListening: boolean = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animFrameId: number | null = null;
  
  private currentAudioElement: HTMLAudioElement | null = null;
  private isAiSpeaking: boolean = false;
  private activeAiPersonaId: string | null = null;

  private speechStartTime: number = 0;
  private silenceTimer: any = null;
  private callbacks: AudioEngineCallbacks = {};

  private patienceMs: number = 1000;
  private isMuted: boolean = false;

  constructor(callbacks: AudioEngineCallbacks, patienceMs: number = 1000) {
    this.callbacks = callbacks;
    this.patienceMs = patienceMs;
    this.initSpeechRecognition();
  }

  public setPatience(ms: number) {
    this.patienceMs = ms;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
  }

  // --- 1. Speech-to-Text Initialization ---
  private initSpeechRecognition() {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not available in this browser');
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-IN'; // Default Indian English

      this.recognition.onstart = () => {
        this.isListening = true;
      };

      this.recognition.onresult = (event: any) => {
        if (this.isMuted) return;

        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            final += item[0].transcript;
          } else {
            interim += item[0].transcript;
          }
        }

        const currentText = (final || interim).trim();

        // Check for backchannels ("uh-huh", "hmm", "yeah", "ok")
        const isBackchannel = /^(uh-huh|hmm|yeah|okay|ok|haan|achha|right)$/i.test(currentText);

        if (currentText.length > 0) {
          // If AI was speaking and this is not just a minor backchannel -> BARGE-IN!
          if (this.isAiSpeaking && !isBackchannel && currentText.length > 3) {
            this.handleBargeIn();
          }

          if (interim) {
            this.callbacks.onInterimTranscript?.(interim);
          }

          if (final) {
            this.callbacks.onFinalTranscript?.(final);
          }

          // Reset silence timer
          this.resetSilenceTimer();
        }
      };

      this.recognition.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          this.callbacks.onError?.('Microphone access denied. Please allow microphone permissions.');
        } else if (event.error !== 'no-speech') {
          console.warn('Speech recognition error:', event.error);
        }
      };

      this.recognition.onend = () => {
        // Auto-restart if we are still meant to be listening
        if (this.isListening && !this.isMuted) {
          try {
            this.recognition.start();
          } catch (e) {
            // Already started or restarting
          }
        }
      };
    } catch (e: any) {
      console.warn('Failed to initialize SpeechRecognition:', e);
    }
  }

  // --- 2. Web Audio API Voice Activity Detection (VAD) ---
  public async startMicrophone(): Promise<boolean> {
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
      const source = this.audioContext.createMediaStreamSource(this.micStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      this.startVADLoop();

      if (this.recognition) {
        try {
          this.recognition.start();
        } catch (e) {}
      }

      this.isListening = true;
      return true;
    } catch (err: any) {
      console.error('Mic permission failed:', err);
      this.callbacks.onError?.('Could not access microphone: ' + (err.message || 'Permission denied'));
      return false;
    }
  }

  private startVADLoop() {
    if (!this.analyser) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    let speakingDetected = false;

    const checkAudioLevel = () => {
      if (!this.analyser) return;
      this.analyser.getByteFrequencyData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length;
      const normalizedVolume = Math.min(100, Math.round((avg / 128) * 100));

      this.callbacks.onVolumeChange?.(normalizedVolume);

      // Energy threshold for speech detection
      const SPEECH_THRESHOLD = 18;

      if (!this.isMuted && avg > SPEECH_THRESHOLD) {
        if (!speakingDetected) {
          speakingDetected = true;
          this.speechStartTime = Date.now();
          this.callbacks.onStudentSpeechStart?.();

          // Barge-in check: If AI is speaking and user produces sustained speech
          if (this.isAiSpeaking) {
            this.handleBargeIn();
          }
        }
      } else {
        if (speakingDetected && (Date.now() - this.speechStartTime > 300)) {
          speakingDetected = false;
          this.callbacks.onStudentSpeechEnd?.();
        }
      }

      this.animFrameId = requestAnimationFrame(checkAudioLevel);
    };

    this.animFrameId = requestAnimationFrame(checkAudioLevel);
  }

  private resetSilenceTimer() {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }
    this.silenceTimer = setTimeout(() => {
      this.callbacks.onStudentSpeechEnd?.();
    }, this.patienceMs);
  }

  // --- 3. Instant Barge-In Handler ---
  public handleBargeIn() {
    if (this.isAiSpeaking) {
      this.stopSpeaking();
      this.callbacks.onUserBargeIn?.();
    }
  }

  // --- 4. Text-to-Speech (Sarvam AI Direct / Proxy / Browser Fallback) ---
  public async speakAI(
    text: string,
    persona: PersonaConfig,
    sarvamApiKey?: string
  ): Promise<void> {
    // Cut any existing audio before starting
    this.stopSpeaking();

    this.isAiSpeaking = true;
    this.activeAiPersonaId = persona.id;
    this.callbacks.onAiSpeechStart?.(persona.id);

    try {
      // 1. Try Sarvam AI Direct TTS if API key is present
      if (sarvamApiKey) {
        try {
          const validSpeakers = [
            'aditya', 'ritu', 'ashutosh', 'priya', 'neha', 'rahul', 'pooja', 'rohan',
            'simran', 'kavya', 'amit', 'dev', 'ishita', 'shreya', 'ratan', 'varun',
            'manan', 'sumit', 'roopa', 'kabir', 'aayan', 'shubh', 'advait', 'anand',
            'tanya', 'tarun', 'sunny', 'mani', 'gokul', 'vijay', 'shruti', 'suhani',
            'mohit', 'kavitha', 'rehan', 'soham', 'rupali'
          ];
          const speakerVoice = validSpeakers.includes((persona.sarvamVoice || '').toLowerCase())
            ? (persona.sarvamVoice || '').toLowerCase()
            : (persona.voiceGender === 'female' ? 'priya' : 'aditya');

          const payload = {
            inputs: [text],
            target_language_code: 'en-IN',
            speaker: speakerVoice,
            pitch: 0,
            pace: persona.rate || 1.0,
            loudness: 1.5,
            speech_sample_rate: 22050,
            enable_preprocessing: true,
            model: 'bulbul:v3'
          };

          // Try direct Sarvam API
          const directRes = await fetch('https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-subscription-key': sarvamApiKey
            },
            body: JSON.stringify(payload)
          });

          if (directRes.ok) {
            const data = await directRes.json();
            if (data.audios && data.audios.length > 0) {
              await this.playBase64Audio(data.audios[0], persona.id);
              return;
            }
          }
        } catch (e) {
          console.warn('Direct Sarvam TTS call unavailable, checking backend proxy or browser speech:', e);
        }

        // Try backend proxy if running locally
        try {
          const proxyRes = await fetch('/api/sarvam/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text,
              speaker: persona.sarvamVoice || 'aditya',
              targetLanguageCode: 'en-IN',
              pitch: 0,
              pace: persona.rate || 1.0,
              apiKey: sarvamApiKey
            })
          });

          if (proxyRes.ok) {
            const data = await proxyRes.json();
            if (data.audioBase64) {
              await this.playBase64Audio(data.audioBase64, persona.id);
              return;
            }
          }
        } catch (e) {}
      }

      // 2. High-Fidelity Browser SpeechSynthesis Fallback
      await this.speakWithBrowserSynth(text, persona);
    } catch (err) {
      console.warn('Speech playback encountered error:', err);
    } finally {
      this.isAiSpeaking = false;
      this.activeAiPersonaId = null;
      this.callbacks.onAiSpeechEnd?.(persona.id);
    }
  }

  private playBase64Audio(base64: string, personaId: string): Promise<void> {
    return new Promise((resolve) => {
      const audioUrl = `data:audio/wav;base64,${base64}`;
      const audio = new Audio(audioUrl);
      this.currentAudioElement = audio;

      audio.onended = () => {
        this.currentAudioElement = null;
        resolve();
      };

      audio.onerror = () => {
        this.currentAudioElement = null;
        resolve();
      };

      audio.play().catch(() => {
        resolve();
      });
    });
  }

  private speakWithBrowserSynth(text: string, persona: PersonaConfig): Promise<void> {
    return new Promise((resolve) => {
      if (!('speechSynthesis' in window)) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      // Fix for Chrome speech synthesis bug: ensure voices are retrieved
      const voices = window.speechSynthesis.getVoices();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = persona.pitch || 1.0;
      utterance.rate = persona.rate || 1.0;

      const indianVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
      const ukVoice = voices.find(v => v.lang.includes('en-GB'));
      const usVoice = voices.find(v => v.lang.includes('en-US'));

      if (persona.voiceGender === 'female') {
        const femaleVoice = voices.find(v => (v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Zira') || v.name.includes('Google UK English Female')) && v.lang.startsWith('en'));
        utterance.voice = femaleVoice || indianVoice || voices[0];
      } else {
        const maleVoice = voices.find(v => (v.name.includes('Male') || v.name.includes('Rishi') || v.name.includes('David') || v.name.includes('Daniel') || v.name.includes('George')) && v.lang.startsWith('en'));
        utterance.voice = maleVoice || indianVoice || ukVoice || usVoice || voices[0];
      }

      let hasResolved = false;
      const finish = () => {
        if (!hasResolved) {
          hasResolved = true;
          resolve();
        }
      };

      utterance.onend = finish;
      utterance.onerror = finish;

      // Fallback timeout in case browser speech synthesis drops onend event
      const wordCount = text.split(' ').length;
      const estimatedDurationMs = Math.max(3000, (wordCount / 2.5) * 1000 + 1500);
      setTimeout(finish, estimatedDurationMs);

      window.speechSynthesis.speak(utterance);
    });
  }

  public stopSpeaking() {
    this.isAiSpeaking = false;
    this.activeAiPersonaId = null;

    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch (e) {}
      this.currentAudioElement = null;
    }

    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
  }

  public getActiveSpeakerId(): string | null {
    return this.activeAiPersonaId;
  }

  public isAiCurrentlySpeaking(): boolean {
    return this.isAiSpeaking;
  }

  public cleanup() {
    this.stopSpeaking();
    this.isListening = false;

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
    }

    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (e) {}
    }
  }
}
