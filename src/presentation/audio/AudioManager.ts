/**
 * Cyberlife — Central Audio System & Bus Architecture
 *
 * Provides a unified Web Audio API management layer:
 * - Single shared AudioContext with user-gesture unlock.
 * - Dedicated volume buses: master, voice, sfx, ambience, music, ui.
 * - Persistent bus volumes in localStorage with defined defaults:
 *   voice: 1.0, sfx: 0.8, ambience: 0.5, music: 0.35, ui: 0.6, master: 1.0.
 * - Dynamic ducking: lowers ambience and music by ~7.5 dB (0.42 gain) when voice speaks.
 * - Tab visibility listener: suspends AudioContext when hidden, resumes when visible.
 * - Asset loader with format fallback (.opus -> .ogg -> .mp3) and AudioBuffer cache.
 * - One-shot & looping playback with smooth crossfading.
 * - Concurrency limiter: caps active sources to 24 with low-priority oldest-first eviction.
 * - Positional audio helper attached to Three.js camera / AudioListener.
 * - Unified master mute integrated with 'cyberlife_voice_muted'.
 */

import * as THREE from 'three';

export type AudioBusName = 'master' | 'voice' | 'sfx' | 'ambience' | 'music' | 'ui';

export interface AudioVolumes {
  master: number;
  voice: number;
  sfx: number;
  ambience: number;
  music: number;
  ui: number;
}

export const DEFAULT_AUDIO_VOLUMES: AudioVolumes = {
  master: 1.0,
  voice: 1.0,
  sfx: 0.8,
  ambience: 0.5,
  music: 0.35,
  ui: 0.6,
};

export const AUDIO_SETTINGS_STORAGE_KEY = 'cyberlife_audio_settings_v1';
export const VOICE_MUTED_STORAGE_KEY = 'cyberlife_voice_muted';

export interface PlayOneShotOptions {
  bus?: AudioBusName;
  volume?: number;
  playbackRate?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface PlayLoopOptions {
  bus?: AudioBusName;
  volume?: number;
  fadeInSeconds?: number;
  priority?: 'low' | 'normal' | 'high';
}

export interface ActiveSoundSource {
  id: number;
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  bus: AudioBusName;
  priority: 'low' | 'normal' | 'high';
  startTime: number;
  isLoop: boolean;
  stop: (fadeSeconds?: number) => void;
}

export interface ActiveLoopHandle {
  readonly id: number;
  readonly bus: AudioBusName;
  setVolume: (volume: number) => void;
  crossfade: (newBuffer: AudioBuffer, durationSeconds?: number) => Promise<void>;
  stop: (fadeDurationSeconds?: number) => void;
}

export class AudioManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isVoiceMutedExplicitly: boolean = false;

  private volumes: AudioVolumes = { ...DEFAULT_AUDIO_VOLUMES };

  // Master and Category GainNodes
  private masterGain: GainNode | null = null;
  private voiceGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private uiGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  // Dedicated Ducking GainNodes for Ambience and Music
  private ambienceDuckingGain: GainNode | null = null;
  private musicDuckingGain: GainNode | null = null;
  private isDucked: boolean = false;

  // Active Sound Pool & Limiter (Max 24 concurrent sources)
  private static readonly MAX_CONCURRENT_SOURCES = 24;
  private nextSourceId = 1;
  private activeSources: Map<number, ActiveSoundSource> = new Map();

  // AudioBuffer Asset Cache
  private bufferCache: Map<string, AudioBuffer> = new Map();

  // Three.js Positional Audio Listener
  private threeListener: THREE.AudioListener | null = null;

  // Lifecycle listeners
  private gestureListenerAttached = false;
  private visibilityListenerAttached = false;
  private stateChangeListeners: Set<() => void> = new Set();

  constructor() {
    this.loadStoredSettings();
    if (typeof window !== 'undefined') {
      this.initGestureUnlock();
      this.initVisibilityListener();
    }
  }

  /**
   * Lazily retrieve or create the shared AudioContext and construct the audio graph.
   */
  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return null;

      try {
        this.ctx = new AudioContextClass();
        this.buildAudioGraph(this.ctx);
      } catch {
        return null;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended' && !this.isMuted) {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Constructs the bus topology:
   * voice   -> master -> destination
   * sfx     -> master -> destination
   * ui      -> master -> destination
   * ambience -> ambienceDucking -> master -> destination
   * music    -> musicDucking    -> master -> destination
   */
  private buildAudioGraph(ctx: AudioContext): void {
    const now = ctx.currentTime;

    // Master bus
    this.masterGain = ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volumes.master, now);
    this.masterGain.connect(ctx.destination);

    // Voice bus
    this.voiceGain = ctx.createGain();
    this.voiceGain.gain.setValueAtTime(this.volumes.voice, now);
    this.voiceGain.connect(this.masterGain);

    // SFX bus
    this.sfxGain = ctx.createGain();
    this.sfxGain.gain.setValueAtTime(this.volumes.sfx, now);
    this.sfxGain.connect(this.masterGain);

    // UI bus
    this.uiGain = ctx.createGain();
    this.uiGain.gain.setValueAtTime(this.volumes.ui, now);
    this.uiGain.connect(this.masterGain);

    // Ducking nodes (defaults to 1.0 gain, ducked to ~0.42 [-7.5 dB])
    this.ambienceDuckingGain = ctx.createGain();
    this.ambienceDuckingGain.gain.setValueAtTime(this.isDucked ? 0.42 : 1.0, now);
    this.ambienceDuckingGain.connect(this.masterGain);

    this.musicDuckingGain = ctx.createGain();
    this.musicDuckingGain.gain.setValueAtTime(this.isDucked ? 0.42 : 1.0, now);
    this.musicDuckingGain.connect(this.masterGain);

    // Ambience bus
    this.ambienceGain = ctx.createGain();
    this.ambienceGain.gain.setValueAtTime(this.volumes.ambience, now);
    this.ambienceGain.connect(this.ambienceDuckingGain);

    // Music bus
    this.musicGain = ctx.createGain();
    this.musicGain.gain.setValueAtTime(this.volumes.music, now);
    this.musicGain.connect(this.musicDuckingGain);
  }

  /**
   * Attach user gesture handlers to resume the AudioContext upon first interaction.
   */
  private initGestureUnlock(): void {
    if (this.gestureListenerAttached || typeof window === 'undefined') return;
    this.gestureListenerAttached = true;

    const unlock = () => {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended' && !this.isMuted) {
        ctx.resume().catch(() => {});
      }
      window.removeEventListener('pointerdown', unlock, true);
      window.removeEventListener('keydown', unlock, true);
      window.removeEventListener('touchstart', unlock, true);
      window.removeEventListener('click', unlock, true);
    };

    window.addEventListener('pointerdown', unlock, true);
    window.addEventListener('keydown', unlock, true);
    window.addEventListener('touchstart', unlock, true);
    window.addEventListener('click', unlock, true);
  }

  /**
   * Pause AudioContext when page/tab is hidden and resume when visible.
   */
  private initVisibilityListener(): void {
    if (this.visibilityListenerAttached || typeof document === 'undefined') return;
    this.visibilityListenerAttached = true;

    document.addEventListener('visibilitychange', () => {
      if (!this.ctx) return;
      if (document.visibilityState === 'hidden') {
        this.ctx.suspend().catch(() => {});
      } else if (document.visibilityState === 'visible') {
        if (!this.isMuted) {
          this.ctx.resume().catch(() => {});
        }
      }
    });
  }

  /**
   * Load stored volume settings and mute state from localStorage.
   */
  private loadStoredSettings(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed.master === 'number') this.volumes.master = parsed.master;
        if (typeof parsed.voice === 'number') this.volumes.voice = parsed.voice;
        if (typeof parsed.sfx === 'number') this.volumes.sfx = parsed.sfx;
        if (typeof parsed.ambience === 'number') this.volumes.ambience = parsed.ambience;
        if (typeof parsed.music === 'number') this.volumes.music = parsed.music;
        if (typeof parsed.ui === 'number') this.volumes.ui = parsed.ui;
        if (typeof parsed.isMuted === 'boolean') this.isMuted = parsed.isMuted;
      }
    } catch {
      // Storage unavailable or invalid JSON
    }

    // Maintain compatibility with existing 'cyberlife_voice_muted' key
    try {
      const voiceMutedRaw = localStorage.getItem(VOICE_MUTED_STORAGE_KEY);
      this.isVoiceMutedExplicitly = voiceMutedRaw === 'true';
    } catch {
      this.isVoiceMutedExplicitly = false;
    }
  }

  /**
   * Save audio settings to localStorage.
   */
  private saveSettings(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        AUDIO_SETTINGS_STORAGE_KEY,
        JSON.stringify({
          ...this.volumes,
          isMuted: this.isMuted,
        })
      );
      localStorage.setItem(
        VOICE_MUTED_STORAGE_KEY,
        String(this.isMuted || this.isVoiceMutedExplicitly)
      );
    } catch {
      // Storage unavailable
    }
    this.notifyStateChange();
  }

  /**
   * Get specific GainNode corresponding to an AudioBusName.
   */
  public getBus(busName: AudioBusName): GainNode | null {
    this.getContext(); // Ensure graph built
    switch (busName) {
      case 'master':
        return this.masterGain;
      case 'voice':
        return this.voiceGain;
      case 'sfx':
        return this.sfxGain;
      case 'ui':
        return this.uiGain;
      case 'ambience':
        return this.ambienceGain;
      case 'music':
        return this.musicGain;
    }
  }

  /**
   * Set volume of a specific audio bus (clamped [0, 1]).
   */
  public setBusVolume(bus: AudioBusName, volume: number): void {
    const clamped = Math.max(0, Math.min(1.0, volume));
    this.volumes[bus] = clamped;

    const gainNode = this.getBus(bus);
    if (gainNode && this.ctx) {
      const now = this.ctx.currentTime;
      if (bus === 'master') {
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(this.isMuted ? 0 : clamped, now);
      } else {
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(clamped, now);
      }
    }

    this.saveSettings();
  }

  /**
   * Get configured volume of a specific bus.
   */
  public getBusVolume(bus: AudioBusName): number {
    return this.volumes[bus];
  }

  /**
   * Get all current bus volumes.
   */
  public getAllVolumes(): Readonly<AudioVolumes> {
    return { ...this.volumes };
  }

  /**
   * Get effective volume multiplier for voice synthesis.
   */
  public getEffectiveVoiceVolume(): number {
    if (this.isMuted || this.isVoiceMutedExplicitly) return 0;
    return this.volumes.voice * this.volumes.master;
  }

  /**
   * Global master mute toggle.
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    const master = this.getBus('master');
    if (master && this.ctx) {
      const now = this.ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(muted ? 0 : this.volumes.master, now);
    }
    this.saveSettings();
  }

  public isMasterMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  /**
   * Reset all audio bus volumes and mute state to defaults.
   */
  public resetToDefaults(): void {
    this.volumes = { ...DEFAULT_AUDIO_VOLUMES };
    this.isMuted = false;
    this.isVoiceMutedExplicitly = false;
    if (this.ctx) {
      const now = this.ctx.currentTime;
      (Object.keys(DEFAULT_AUDIO_VOLUMES) as AudioBusName[]).forEach(bus => {
        const gainNode = this.getBus(bus);
        if (gainNode) {
          gainNode.gain.cancelScheduledValues(now);
          gainNode.gain.setValueAtTime(DEFAULT_AUDIO_VOLUMES[bus], now);
        }
      });
    }
    this.saveSettings();
  }

  /**
   * Play an audible test chime through the sfx bus to verify browser output.
   */
  public testAudioPlayback(): void {
    if (this.isMuted) {
      this.setMuted(false);
    }
    this.playOneShot('/assets/audio/sfx/audio_test', {
      bus: 'sfx',
      volume: 0.8,
      priority: 'high',
    });
  }

  /**
   * Ducking: lowers ambience and music by about 7.5 dB (0.42 gain) with a smooth ramp.
   */
  public setDucking(active: boolean): void {
    this.isDucked = active;
    this.getContext();
    if (!this.ctx || !this.ambienceDuckingGain || !this.musicDuckingGain) return;

    const targetGain = active ? 0.42 : 1.0;
    const rampTime = active ? 0.12 : 0.28; // Rapid duck (120ms), gentle recovery (280ms)
    const now = this.ctx.currentTime;

    try {
      this.ambienceDuckingGain.gain.cancelScheduledValues(now);
      this.ambienceDuckingGain.gain.setValueAtTime(this.ambienceDuckingGain.gain.value, now);
      this.ambienceDuckingGain.gain.linearRampToValueAtTime(targetGain, now + rampTime);

      this.musicDuckingGain.gain.cancelScheduledValues(now);
      this.musicDuckingGain.gain.setValueAtTime(this.musicDuckingGain.gain.value, now);
      this.musicDuckingGain.gain.linearRampToValueAtTime(targetGain, now + rampTime);
    } catch {
      // Ignored
    }
  }

  public isCurrentlyDucked(): boolean {
    return this.isDucked;
  }

  /**
   * Asset loader with caching: load and decode audio files.
   * Prefers .opus, then .ogg, with an .mp3 fallback.
   */
  public async loadAudio(urlWithoutExtOrWithExt: string): Promise<AudioBuffer | null> {
    const cached = this.bufferCache.get(urlWithoutExtOrWithExt);
    if (cached) return cached;

    const ctx = this.getContext();
    if (!ctx) return null;

    const candidates = this.resolveUrlCandidates(urlWithoutExtOrWithExt);
    const origin =
      typeof window !== 'undefined' && window.location?.origin && window.location.origin !== 'null'
        ? window.location.origin
        : 'http://localhost';

    for (const rawUrl of candidates) {
      try {
        const fullUrl = rawUrl.startsWith('/') ? `${origin}${rawUrl}` : rawUrl;
        const response = await fetch(fullUrl);
        if (!response.ok) continue;
        const arrayBuffer = await response.arrayBuffer();
        const decoded = await ctx.decodeAudioData(arrayBuffer);
        this.bufferCache.set(urlWithoutExtOrWithExt, decoded);
        this.bufferCache.set(rawUrl, decoded);
        return decoded;
      } catch {
        // Fallback or ignore fetch errors in environments without active HTTP server
      }
    }

    return null;
  }

  private resolveUrlCandidates(url: string): string[] {
    if (/\.(opus|ogg|mp3|wav)$/i.test(url)) {
      return [url];
    }
    // Preferred candidate order: .opus -> .ogg -> .mp3
    return [`${url}.opus`, `${url}.ogg`, `${url}.mp3`];
  }

  /**
   * Play a one-shot audio buffer or cached sound url through a bus.
   * Enforces 24-source maximum concurrency limit with oldest low-priority source eviction.
   */
  public playOneShot(
    sound: AudioBuffer | string,
    options: PlayOneShotOptions = {}
  ): ActiveSoundSource | null {
    if (this.isMuted) return null;
    const ctx = this.getContext();
    if (!ctx) return null;

    let buffer: AudioBuffer | null = null;
    if (typeof sound === 'string') {
      buffer = this.bufferCache.get(sound) ?? null;
      if (!buffer) {
        // Asynchronously load for future invocations
        this.loadAudio(sound);
        return null;
      }
    } else {
      buffer = sound;
    }

    if (!buffer) return null;

    this.enforceConcurrencyLimit();

    const targetBus = options.bus ?? 'sfx';
    const busGain = this.getBus(targetBus) ?? this.masterGain;
    if (!busGain) return null;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    if (options.playbackRate) {
      source.playbackRate.value = options.playbackRate;
    }

    const sourceGain = ctx.createGain();
    const volume = options.volume ?? 1.0;
    sourceGain.gain.setValueAtTime(volume, ctx.currentTime);

    source.connect(sourceGain);
    sourceGain.connect(busGain);

    const sourceId = this.nextSourceId++;
    const activeItem: ActiveSoundSource = {
      id: sourceId,
      source,
      gainNode: sourceGain,
      bus: targetBus,
      priority: options.priority ?? 'normal',
      startTime: ctx.currentTime,
      isLoop: false,
      stop: (fadeSeconds = 0.05) => {
        try {
          const now = ctx.currentTime;
          sourceGain.gain.cancelScheduledValues(now);
          sourceGain.gain.setValueAtTime(sourceGain.gain.value, now);
          sourceGain.gain.linearRampToValueAtTime(0.001, now + fadeSeconds);
          source.stop(now + fadeSeconds);
        } catch {
          // Ignored
        }
        this.activeSources.delete(sourceId);
      },
    };

    source.onended = () => {
      this.activeSources.delete(sourceId);
    };

    this.activeSources.set(sourceId, activeItem);
    source.start(ctx.currentTime);
    return activeItem;
  }

  /**
   * Play a looping audio buffer with optional fade-in and crossfade capability.
   */
  public playLoop(
    sound: AudioBuffer,
    options: PlayLoopOptions = {}
  ): ActiveLoopHandle | null {
    const ctx = this.getContext();
    if (!ctx) return null;

    this.enforceConcurrencyLimit();

    const targetBus = options.bus ?? 'music';
    const busGain = this.getBus(targetBus) ?? this.masterGain;
    if (!busGain) return null;

    let currentSource = ctx.createBufferSource();
    currentSource.buffer = sound;
    currentSource.loop = true;

    const loopGain = ctx.createGain();
    const targetVol = options.volume ?? 1.0;
    const fadeIn = options.fadeInSeconds ?? 0.5;

    const now = ctx.currentTime;
    if (fadeIn > 0) {
      loopGain.gain.setValueAtTime(0.001, now);
      loopGain.gain.linearRampToValueAtTime(targetVol, now + fadeIn);
    } else {
      loopGain.gain.setValueAtTime(targetVol, now);
    }

    currentSource.connect(loopGain);
    loopGain.connect(busGain);

    const loopId = this.nextSourceId++;
    const activeItem: ActiveSoundSource = {
      id: loopId,
      source: currentSource,
      gainNode: loopGain,
      bus: targetBus,
      priority: options.priority ?? 'high',
      startTime: now,
      isLoop: true,
      stop: (fadeSeconds = 0.5) => {
        try {
          const t = ctx.currentTime;
          loopGain.gain.cancelScheduledValues(t);
          loopGain.gain.setValueAtTime(loopGain.gain.value, t);
          loopGain.gain.linearRampToValueAtTime(0.001, t + fadeSeconds);
          currentSource.stop(t + fadeSeconds);
        } catch {
          // Ignored
        }
        this.activeSources.delete(loopId);
      },
    };

    this.activeSources.set(loopId, activeItem);
    currentSource.start(now);

    const handle: ActiveLoopHandle = {
      id: loopId,
      bus: targetBus,
      setVolume: (vol: number) => {
        const t = ctx.currentTime;
        loopGain.gain.cancelScheduledValues(t);
        loopGain.gain.setValueAtTime(vol, t);
      },
      crossfade: async (newBuffer: AudioBuffer, durationSeconds = 1.0) => {
        const nextSource = ctx.createBufferSource();
        nextSource.buffer = newBuffer;
        nextSource.loop = true;

        const nextGain = ctx.createGain();
        const fadeNow = ctx.currentTime;
        nextGain.gain.setValueAtTime(0.001, fadeNow);
        nextGain.gain.linearRampToValueAtTime(targetVol, fadeNow + durationSeconds);

        loopGain.gain.cancelScheduledValues(fadeNow);
        loopGain.gain.setValueAtTime(loopGain.gain.value, fadeNow);
        loopGain.gain.linearRampToValueAtTime(0.001, fadeNow + durationSeconds);

        nextSource.connect(nextGain);
        nextGain.connect(busGain);

        nextSource.start(fadeNow);

        setTimeout(() => {
          try {
            currentSource.stop();
          } catch {
            // Ignored
          }
          currentSource = nextSource;
        }, durationSeconds * 1000);
      },
      stop: (fadeDurationSeconds = 0.5) => {
        activeItem.stop(fadeDurationSeconds);
      },
    };

    return handle;
  }

  /**
   * Concurrency Limiter: Caps sources to 24, evicting the oldest low-priority source first.
   */
  private enforceConcurrencyLimit(): void {
    if (this.activeSources.size < AudioManager.MAX_CONCURRENT_SOURCES) return;

    // Collect candidates sorted by priority then startTime
    const priorityWeight: Record<string, number> = { low: 0, normal: 1, high: 2 };
    const candidates = Array.from(this.activeSources.values()).sort((a, b) => {
      const pDiff = (priorityWeight[a.priority] ?? 1) - (priorityWeight[b.priority] ?? 1);
      if (pDiff !== 0) return pDiff;
      return a.startTime - b.startTime;
    });

    const oldest = candidates[0];
    if (oldest) {
      oldest.stop(0.02);
      this.activeSources.delete(oldest.id);
    }
  }

  /**
   * Attach Three.js AudioListener to the active Three.js camera for 3D world sounds.
   */
  public attachCamera(camera: THREE.Camera): THREE.AudioListener | null {
    if (typeof window === 'undefined') return null;
    const ctx = this.getContext();
    if (!ctx) return null;

    if (!this.threeListener) {
      this.threeListener = new THREE.AudioListener();
      try {
        // Route Three.js audio listener output through the sfx bus
        this.threeListener.gain.disconnect();
        const sfx = this.getBus('sfx');
        if (sfx) {
          this.threeListener.gain.connect(sfx);
        }
      } catch {
        // Ignored
      }
    }

    if (this.threeListener.parent !== camera) {
      if (this.threeListener.parent) {
        this.threeListener.parent.remove(this.threeListener);
      }
      camera.add(this.threeListener);
    }

    return this.threeListener;
  }

  public getThreeListener(): THREE.AudioListener | null {
    return this.threeListener;
  }

  /**
   * Create a Three.js PositionalAudio sound routed through sfx or ambience bus.
   */
  public createPositionalAudio(
    busName: AudioBusName = 'sfx'
  ): THREE.PositionalAudio | null {
    if (!this.threeListener) return null;
    try {
      const sound = new THREE.PositionalAudio(this.threeListener);
      const bus = this.getBus(busName);
      if (bus) {
        sound.getOutput().disconnect();
        sound.getOutput().connect(bus);
      }
      return sound;
    } catch {
      return null;
    }
  }

  /**
   * Register a listener for volume and mute state updates.
   */
  public onStateChange(callback: () => void): () => void {
    this.stateChangeListeners.add(callback);
    return () => {
      this.stateChangeListeners.delete(callback);
    };
  }

  private notifyStateChange(): void {
    this.stateChangeListeners.forEach(fn => {
      try {
        fn();
      } catch {
        // Ignored
      }
    });
  }

  /**
   * Synthesize an inverter warning alarm tone (1000 Hz) for blackout beats.
   * Uses Web Audio API oscillator routed to sfx bus.
   */
  public synthesizeInverterAlarm(durationSeconds = 3.5): { stop: () => void } {
    const ctx = this.getContext();
    if (!ctx) return { stop: () => {} };

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1000, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gain.gain.setValueAtTime(0.18, now + durationSeconds - 0.2);
      gain.gain.linearRampToValueAtTime(0.001, now + durationSeconds);

      const sfxBus = this.getBus('sfx') ?? this.masterGain;
      if (sfxBus) {
        osc.connect(gain);
        gain.connect(sfxBus);
      }

      osc.start(now);
      osc.stop(now + durationSeconds);

      let stopped = false;
      return {
        stop: () => {
          if (stopped) return;
          stopped = true;
          try {
            gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.05);
            osc.stop(ctx.currentTime + 0.06);
          } catch {
            // Ignore
          }
        },
      };
    } catch {
      return { stop: () => {} };
    }
  }

  /**
   * Get active source count (for testing/diagnostics).
   */
  public getActiveSourceCount(): number {
    return this.activeSources.size;
  }
}

export const audioManager = new AudioManager();

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__CYBERLIFE_AUDIO_MANAGER__ = audioManager;
}
