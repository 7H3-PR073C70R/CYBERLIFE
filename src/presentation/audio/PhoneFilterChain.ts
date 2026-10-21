/**
 * Cyberlife — Telephone Filter Chain (Web Audio API)
 *
 * Simulates telecom bandwidth and line characteristics for hacker VoIP calls:
 * - Bandpass filtering (PSTN standard ~300 Hz - 3400 Hz)
 * - Light compression (fast attack, subtle ratio to maintain speech intelligibility)
 * - Soft saturation (harmonic warmth / slight mic overdrive via WaveShaper)
 * - Subtle analog line-noise bed (gentle ambient hiss at ~ -46 dB)
 * - Occasional subtle crackle impulse spikes
 * - Clear intelligibility and instant bypass switch (setEnabled)
 */

import { audioManager } from './AudioManager';

export class PhoneFilterChain {
  private ctx: AudioContext | null = null;

  // Audio Nodes
  private inputNode: GainNode | null = null;
  private highpassFilter: BiquadFilterNode | null = null;
  private lowpassFilter: BiquadFilterNode | null = null;
  private presenceFilter: BiquadFilterNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  private waveShaper: WaveShaperNode | null = null;

  private wetGain: GainNode | null = null;
  private dryGain: GainNode | null = null;
  private outputNode: GainNode | null = null;

  // Line noise bed & crackle generator
  private noiseSource: AudioBufferSourceNode | null = null;
  private noiseGain: GainNode | null = null;
  private crackleTimer: ReturnType<typeof setTimeout> | null = null;

  private isEnabled: boolean = true;
  private isNoiseActive: boolean = false;

  constructor() {
    // Lazily initialized when audio context is active
  }

  /**
   * Initializes the phone filter chain in the Web Audio graph.
   */
  public initGraph(ctx: AudioContext): GainNode {
    if (this.inputNode && this.ctx === ctx) {
      return this.inputNode;
    }

    this.ctx = ctx;

    // 1. Input Node
    this.inputNode = ctx.createGain();

    // 2. Bandpass filtering: 300 Hz highpass + 3400 Hz lowpass + subtle 1.8kHz presence peak
    this.highpassFilter = ctx.createBiquadFilter();
    this.highpassFilter.type = 'highpass';
    this.highpassFilter.frequency.setValueAtTime(320, ctx.currentTime);
    this.highpassFilter.Q.setValueAtTime(0.7, ctx.currentTime);

    this.lowpassFilter = ctx.createBiquadFilter();
    this.lowpassFilter.type = 'lowpass';
    this.lowpassFilter.frequency.setValueAtTime(3400, ctx.currentTime);
    this.lowpassFilter.Q.setValueAtTime(0.7, ctx.currentTime);

    this.presenceFilter = ctx.createBiquadFilter();
    this.presenceFilter.type = 'peaking';
    this.presenceFilter.frequency.setValueAtTime(1800, ctx.currentTime);
    this.presenceFilter.gain.setValueAtTime(2.0, ctx.currentTime);
    this.presenceFilter.Q.setValueAtTime(1.0, ctx.currentTime);

    // 3. Light Dynamic Compression
    this.compressor = ctx.createDynamicsCompressor();
    this.compressor.threshold.setValueAtTime(-22, ctx.currentTime);
    this.compressor.knee.setValueAtTime(6, ctx.currentTime);
    this.compressor.ratio.setValueAtTime(3.5, ctx.currentTime);
    this.compressor.attack.setValueAtTime(0.005, ctx.currentTime);
    this.compressor.release.setValueAtTime(0.06, ctx.currentTime);

    // 4. Soft Saturation Curve (tanh transfer function)
    this.waveShaper = ctx.createWaveShaper();
    this.waveShaper.curve = this.createSaturationCurve(1.25) as unknown as Float32Array<ArrayBuffer>;
    this.waveShaper.oversample = '2x';

    // 5. Wet/Dry Crossfade for Bypass Switch
    this.wetGain = ctx.createGain();
    this.wetGain.gain.setValueAtTime(this.isEnabled ? 1.0 : 0.0, ctx.currentTime);

    this.dryGain = ctx.createGain();
    this.dryGain.gain.setValueAtTime(this.isEnabled ? 0.0 : 1.0, ctx.currentTime);

    // 6. Output Node (routes to Voice Bus)
    this.outputNode = ctx.createGain();
    const voiceBus = audioManager.getBus('voice');
    if (voiceBus) {
      this.outputNode.connect(voiceBus);
    } else {
      this.outputNode.connect(ctx.destination);
    }

    // Connect Filtered Path
    this.inputNode.connect(this.highpassFilter);
    this.highpassFilter.connect(this.lowpassFilter);
    this.lowpassFilter.connect(this.presenceFilter);
    this.presenceFilter.connect(this.compressor);
    this.compressor.connect(this.waveShaper);
    this.waveShaper.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);

    // Connect Bypass Path
    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);

    // 7. Background Line Noise Bed
    this.initLineNoise(ctx);

    return this.inputNode;
  }

  /**
   * Generates a soft saturation curve (n=512) for analog harmonic warmth.
   */
  private createSaturationCurve(k: number): Float32Array {
    const samples = 512;
    const curve = new Float32Array(samples);
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      // Soft saturation using tanh with smooth linear falloff
      curve[i] = Math.tanh(k * x) / Math.tanh(k);
    }
    return curve;
  }

  /**
   * Creates a quiet analog line-noise buffer (~ -46 dB) to simulate telephone line tone.
   */
  private initLineNoise(ctx: AudioContext): void {
    const bufferSize = ctx.sampleRate * 2; // 2 seconds
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      // Pink/filtered noise approximation
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut * 0.9 + white * 0.1) * 0.05;
      lastOut = output[i] ?? 0.0;
    }

    this.noiseGain = ctx.createGain();
    this.noiseGain.gain.setValueAtTime(0.005, ctx.currentTime); // ~ -46 dB
    if (this.outputNode) {
      this.noiseGain.connect(this.outputNode);
    }
  }

  /**
   * Start line noise and subtle procedural crackle during active call.
   */
  public startCallNoise(): void {
    if (!this.ctx || !this.noiseGain || this.isNoiseActive) return;
    this.isNoiseActive = true;

    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut * 0.85 + white * 0.15) * 0.05;
        lastOut = data[i] ?? 0.0;
      }

      this.noiseSource = this.ctx.createBufferSource();
      this.noiseSource.buffer = noiseBuffer;
      this.noiseSource.loop = true;
      this.noiseSource.connect(this.noiseGain);
      this.noiseSource.start();

      this.scheduleNextCrackle();
    } catch {
      // AudioContext may be suspended or headless
    }
  }

  /**
   * Stop line noise and crackle when call ends.
   */
  public stopCallNoise(): void {
    this.isNoiseActive = false;
    if (this.crackleTimer) {
      clearTimeout(this.crackleTimer);
      this.crackleTimer = null;
    }
    if (this.noiseSource) {
      try {
        this.noiseSource.stop();
        this.noiseSource.disconnect();
      } catch {
        // Ignored
      }
      this.noiseSource = null;
    }
  }

  /**
   * Occasional subtle crackle impulse spikes (every 2.5 - 4.5 seconds).
   */
  private scheduleNextCrackle(): void {
    if (!this.isNoiseActive || !this.ctx || !this.outputNode) return;

    const delayMs = 2500 + Math.random() * 2000;
    this.crackleTimer = setTimeout(() => {
      if (!this.isNoiseActive || !this.ctx || !this.outputNode) return;

      try {
        const crackle = this.ctx.createBuffer(1, 128, this.ctx.sampleRate);
        const data = crackle.getChannelData(0);
        for (let i = 0; i < 128; i++) {
          data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 20) * 0.03;
        }
        const src = this.ctx.createBufferSource();
        src.buffer = crackle;
        const crackleGain = this.ctx.createGain();
        crackleGain.gain.setValueAtTime(0.015, this.ctx.currentTime);
        src.connect(crackleGain);
        crackleGain.connect(this.outputNode);
        src.start();
      } catch {
        // Ignored
      }

      this.scheduleNextCrackle();
    }, delayMs);
  }

  /**
   * Enable or disable the telephone filter (bypass switch).
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!this.ctx || !this.wetGain || !this.dryGain) return;

    const now = this.ctx.currentTime;
    this.wetGain.gain.cancelScheduledValues(now);
    this.wetGain.gain.setValueAtTime(this.wetGain.gain.value, now);
    this.wetGain.gain.linearRampToValueAtTime(enabled ? 1.0 : 0.0, now + 0.05);

    this.dryGain.gain.cancelScheduledValues(now);
    this.dryGain.gain.setValueAtTime(this.dryGain.gain.value, now);
    this.dryGain.gain.linearRampToValueAtTime(enabled ? 0.0 : 1.0, now + 0.05);
  }

  public getIsEnabled(): boolean {
    return this.isEnabled;
  }

  public getInputNode(): GainNode | null {
    return this.inputNode;
  }

  public getOutputNode(): GainNode | null {
    return this.outputNode;
  }
}

export const phoneFilterChain = new PhoneFilterChain();
