/**
 * Melancholic Ambient Sound Engine using Web Audio API
 * Generates procedural piano chords (in minor keys) + gentle filtered rain sound.
 * Requires zero external audio files, completely reliable and offline-safe.
 */

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private isRunning = false;
  private masterGain: GainNode | null = null;
  private rainGain: GainNode | null = null;
  private pianoGain: GainNode | null = null;
  private rainNode: AudioNode | null = null;
  private pianoInterval: number | null = null;
  private volume = 0.55;
  private currentPreset: 'midnight-rain-piano' | 'solitary-rain' | 'piano-whispers' = 'midnight-rain-piano';

  private chordProgressions = [
    // Minor progressions: C minor, Ab maj7, Eb major, Bb major
    [130.81, 155.56, 196.00, 261.63], // Cm (C3, Eb3, G3, C4)
    [103.83, 155.56, 196.00, 246.94], // Abmaj7 (Ab2, Eb3, G3, B3)
    [116.54, 146.83, 174.61, 233.08], // Bb (Bb2, D3, F3, Bb3)
    [98.00, 146.83, 196.00, 246.94],  // Gm7 (G2, D3, G3, B3)
    [87.31, 130.81, 174.61, 220.00],  // Fm (F2, C3, F3, A3)
  ];
  private chordIndex = 0;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Rain channel
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.rainGain.connect(this.masterGain);

      // Piano channel with subtle low-pass warmth
      this.pianoGain = this.ctx.createGain();
      this.pianoGain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      this.pianoGain.connect(this.masterGain);

      this.createRainGenerator();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createRainGenerator() {
    if (!this.ctx || !this.rainGain) return;

    // Buffer of pink-ish noise for gentle rain
    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.06;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Filter to simulate distant melancholic rain against glass
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(950, this.ctx.currentTime);

    const highpass = this.ctx.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.setValueAtTime(200, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(highpass);
    highpass.connect(this.rainGain);
    whiteNoise.start();
    this.rainNode = whiteNoise;
  }

  // Play a single soft resonant piano-like bell tone
  private playPianoTone(freq: number, delayMs: number = 0, duration: number = 4.5) {
    if (!this.ctx || !this.pianoGain) return;

    setTimeout(() => {
      if (!this.ctx || !this.pianoGain || !this.isRunning) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Slightly warm triangle + sine harmonic blend
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle pitch drift for vintage acoustic warmth
      osc.detune.setValueAtTime((Math.random() - 0.5) * 4, now);

      // Low-pass filter for felt hammer acoustic feel
      const feltFilter = this.ctx.createBiquadFilter();
      feltFilter.type = 'lowpass';
      feltFilter.frequency.setValueAtTime(freq * 3.5, now);
      feltFilter.frequency.exponentialRampToValueAtTime(freq * 1.2, now + duration);

      // Attack - Decay - Sustain - Release
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.08); // soft hammer attack
      gain.gain.exponentialRampToValueAtTime(0.05, now + 1.2);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(feltFilter);
      feltFilter.connect(gain);
      gain.connect(this.pianoGain);

      osc.start(now);
      osc.stop(now + duration + 0.1);
    }, delayMs);
  }

  // Play a delicate high crystal chime (for lighting candles, placing stars, wiping mist)
  public playChime(freq = 587.33, duration = 3.0) {
    if (!this.ctx) {
      try {
        this.initContext();
      } catch {
        return;
      }
    }
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Subtle overtone harmonic
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2.01, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.09, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc2.start(now);
    osc.stop(now + duration + 0.05);
    osc2.stop(now + duration + 0.05);
  }

  private triggerChordArpeggio() {
    if (!this.isRunning || !this.ctx) return;

    if (this.currentPreset === 'solitary-rain') {
      return; // only rain
    }

    const chord = this.chordProgressions[this.chordIndex];
    this.chordIndex = (this.chordIndex + 1) % this.chordProgressions.length;

    // Arpeggiate softly across 2.5 seconds
    chord.forEach((freq, i) => {
      const delay = i * (450 + Math.random() * 100);
      this.playPianoTone(freq, delay, 5.0);
    });

    // Occasional gentle high chime melody note
    if (Math.random() > 0.4) {
      const highChime = chord[Math.floor(Math.random() * chord.length)] * 2;
      this.playPianoTone(highChime, 2200 + Math.random() * 600, 4.0);
    }
  }

  public start() {
    this.initContext();
    this.isRunning = true;
    this.applyPresetGains();

    if (this.pianoInterval) {
      clearInterval(this.pianoInterval);
    }

    // Play first chord immediately
    this.triggerChordArpeggio();

    // Loop a melancholic chord every 4.8 seconds
    this.pianoInterval = window.setInterval(() => {
      this.triggerChordArpeggio();
    }, 4800);
  }

  public pause() {
    this.isRunning = false;
    if (this.pianoInterval) {
      clearInterval(this.pianoInterval);
      this.pianoInterval = null;
    }
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.4);
    }
  }

  public resume() {
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.4);
    }
    this.start();
  }

  public toggle(): boolean {
    if (this.isRunning) {
      this.pause();
      return false;
    } else {
      this.resume();
      return true;
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.ctx && this.masterGain && this.isRunning) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.1);
    }
  }

  public setPreset(preset: 'midnight-rain-piano' | 'solitary-rain' | 'piano-whispers') {
    this.currentPreset = preset;
    this.applyPresetGains();
  }

  private applyPresetGains() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (this.rainGain) {
      if (this.currentPreset === 'piano-whispers') {
        this.rainGain.gain.setTargetAtTime(0.0001, now, 0.5);
      } else if (this.currentPreset === 'solitary-rain') {
        this.rainGain.gain.setTargetAtTime(0.55, now, 0.5);
      } else {
        this.rainGain.gain.setTargetAtTime(0.35, now, 0.5);
      }
    }

    if (this.pianoGain) {
      if (this.currentPreset === 'solitary-rain') {
        this.pianoGain.gain.setTargetAtTime(0.0001, now, 0.5);
      } else {
        this.pianoGain.gain.setTargetAtTime(0.4, now, 0.5);
      }
    }
  }

  public getIsPlaying(): boolean {
    return this.isRunning;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getPreset() {
    return this.currentPreset;
  }
}

export const soundEngine = new AmbientSoundEngine();
