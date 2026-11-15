// Procedural Web Audio API synthesizer + Vietnamese SpeechSynthesis MC controller
// Zero external MP3 dependencies — 100% offline capable.

class SoundAndVoiceEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private mcVoiceEnabled = true;
  private musicEnabled = false;
  private speechRate = 1.0;
  private musicTimer: number | null = null;
  private musicStep = 0;

  private ensureCtx(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  configure(opts: {
    soundEnabled: boolean;
    mcVoiceEnabled: boolean;
    musicEnabled: boolean;
    mcSpeechRate: number;
  }) {
    this.soundEnabled = opts.soundEnabled;
    this.mcVoiceEnabled = opts.mcVoiceEnabled;
    this.speechRate = opts.mcSpeechRate || 1.0;
    if (opts.musicEnabled !== this.musicEnabled) {
      this.musicEnabled = opts.musicEnabled;
      if (this.musicEnabled && this.soundEnabled) {
        this.startBackgroundMusic();
      } else {
        this.stopBackgroundMusic();
      }
    } else if (!this.soundEnabled) {
      this.stopBackgroundMusic();
    }
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.14,
    delay = 0,
  ) {
    if (!this.soundEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(gainPeak, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playClick() {
    this.tone(520, 0.07, 'triangle', 0.1);
  }

  playLifeline() {
    this.tone(440, 0.12, 'triangle', 0.12, 0);
    this.tone(660, 0.15, 'triangle', 0.12, 0.08);
  }

  playTick() {
    this.tone(780, 0.04, 'sine', 0.05);
  }

  playCoin() {
    this.tone(987.77, 0.09, 'sine', 0.12, 0);
    this.tone(1318.51, 0.22, 'sine', 0.13, 0.07);
  }

  playKey() {
    this.tone(587.33, 0.1, 'triangle', 0.13, 0);
    this.tone(783.99, 0.1, 'triangle', 0.13, 0.08);
    this.tone(1174.66, 0.24, 'sine', 0.14, 0.16);
  }

  playCorrect() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, idx) => {
      this.tone(n, 0.22, 'triangle', 0.15, idx * 0.08);
    });
  }

  playWrong() {
    this.tone(330, 0.18, 'sine', 0.11, 0);
    this.tone(247, 0.28, 'sine', 0.11, 0.14);
  }

  playChestCreak() {
    if (!this.soundEnabled) return;
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.linearRampToValueAtTime(165, now + 0.45);
    osc.frequency.linearRampToValueAtTime(130, now + 0.85);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.95);
  }

  playChestOpenFanfare() {
    const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    chord.forEach((n, idx) => {
      this.tone(n, 0.55, 'triangle', 0.15, idx * 0.09);
    });
  }

  startBackgroundMusic() {
    if (this.musicTimer !== null || typeof window === 'undefined') return;
    const pentatonic = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 440.0, 392.0];
    this.musicTimer = window.setInterval(() => {
      if (!this.soundEnabled || !this.musicEnabled) return;
      const note = pentatonic[this.musicStep % pentatonic.length];
      this.tone(note, 0.36, 'sine', 0.032, 0);
      if (this.musicStep % 2 === 0) {
        this.tone(note * 0.5, 0.48, 'triangle', 0.02, 0);
      }
      this.musicStep += 1;
    }, 520);
  }

  stopBackgroundMusic() {
    if (this.musicTimer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private pickVietnameseVoice(): SpeechSynthesisVoice | null {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (!voices.length) return null;
    const viVoices = voices.filter((v) => v.lang.toLowerCase().startsWith('vi'));
    if (!viVoices.length) return null;
    return (
      viVoices.find((v) => /natural|google|microsoft|hoaimy|namminh|linh/i.test(v.name)) ||
      viVoices[0]
    );
  }

  stopSpeech() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // Ignore browser TTS cancellation quirks
      }
    }
  }

  speakMc(
    text: string,
    callbacks?: {
      onStart?: () => void;
      onEnd?: () => void;
    },
  ) {
    this.stopSpeech();
    if (!this.mcVoiceEnabled || !text.trim()) {
      callbacks?.onEnd?.();
      return;
    }
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      callbacks?.onEnd?.();
      return;
    }

    try {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'vi-VN';
      utter.rate = Math.min(Math.max(this.speechRate, 0.75), 1.35);
      utter.pitch = 1.06;
      const viVoice = this.pickVietnameseVoice();
      if (viVoice) utter.voice = viVoice;

      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        callbacks?.onEnd?.();
      };

      utter.onstart = () => callbacks?.onStart?.();
      utter.onend = done;
      utter.onerror = done;

      // Safety fallback in case browser speech engine does not fire onend
      const approxMs = Math.max(2200, Math.min(18000, text.length * 75));
      window.setTimeout(done, approxMs);

      callbacks?.onStart?.();
      window.speechSynthesis.speak(utter);
    } catch {
      callbacks?.onEnd?.();
    }
  }
}

export const audioEngine = new SoundAndVoiceEngine();
