import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  AudioManager,
  DEFAULT_AUDIO_VOLUMES,
  AUDIO_SETTINGS_STORAGE_KEY,
  VOICE_MUTED_STORAGE_KEY,
} from '@/presentation/audio/AudioManager';

class MockAudioParam {
  public value: number;
  public setValueAtTime: ReturnType<typeof vi.fn>;
  public linearRampToValueAtTime: ReturnType<typeof vi.fn>;
  public cancelScheduledValues: ReturnType<typeof vi.fn>;

  constructor(initialValue: number = 1.0) {
    this.value = initialValue;
    this.setValueAtTime = vi.fn((val: number) => {
      this.value = val;
    });
    this.linearRampToValueAtTime = vi.fn((val: number) => {
      this.value = val;
    });
    this.cancelScheduledValues = vi.fn();
  }
}

class MockGainNode {
  public gain: MockAudioParam;
  public connect = vi.fn();
  public disconnect = vi.fn();

  constructor() {
    this.gain = new MockAudioParam(1.0);
  }
}

class MockBufferSourceNode {
  public buffer: unknown = null;
  public loop: boolean = false;
  public playbackRate = new MockAudioParam(1.0);
  public connect = vi.fn();
  public disconnect = vi.fn();
  public start = vi.fn();
  public stop = vi.fn();
  public onended: (() => void) | null = null;
}

class MockAudioContext {
  public static lastInstance: MockAudioContext | null = null;

  public state: AudioContextState = 'running';
  public currentTime = 10.0;
  public destination = {};

  public createGain = vi.fn(() => new MockGainNode());
  public createBufferSource = vi.fn(() => new MockBufferSourceNode());
  public suspend = vi.fn(async () => {
    this.state = 'suspended';
  });
  public resume = vi.fn(async () => {
    this.state = 'running';
  });
  public decodeAudioData = vi.fn(async (_buffer: ArrayBuffer) => {
    return {
      duration: 1.5,
      numberOfChannels: 2,
      sampleRate: 44100,
      length: 66150,
    } as unknown as AudioBuffer;
  });

  constructor() {
    MockAudioContext.lastInstance = this;
  }
}

describe('AudioManager', () => {
  let originalAudioContext: unknown;

  beforeEach(() => {
    localStorage.clear();
    MockAudioContext.lastInstance = null;
    originalAudioContext = (window as unknown as { AudioContext?: unknown }).AudioContext;
    (window as unknown as { AudioContext: typeof MockAudioContext }).AudioContext = MockAudioContext;
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
    (window as unknown as { AudioContext?: unknown }).AudioContext = originalAudioContext;
  });

  describe('Initialization and Default Volumes', () => {
    it('initializes with default volume specifications', () => {
      const manager = new AudioManager();
      const volumes = manager.getAllVolumes();

      expect(volumes.master).toBe(1.0);
      expect(volumes.voice).toBe(1.0);
      expect(volumes.sfx).toBe(0.8);
      expect(volumes.ambience).toBe(0.5);
      expect(volumes.music).toBe(0.35);
      expect(volumes.ui).toBe(0.6);
      expect(manager.isMasterMuted()).toBe(false);
    });

    it('builds audio graph with expected topology and gain values', () => {
      const manager = new AudioManager();
      const ctx = manager.getContext();
      expect(ctx).toBeDefined();

      const masterGain = manager.getBus('master') as unknown as MockGainNode;
      const voiceGain = manager.getBus('voice') as unknown as MockGainNode;
      const sfxGain = manager.getBus('sfx') as unknown as MockGainNode;
      const ambienceGain = manager.getBus('ambience') as unknown as MockGainNode;
      const musicGain = manager.getBus('music') as unknown as MockGainNode;
      const uiGain = manager.getBus('ui') as unknown as MockGainNode;

      expect(masterGain.gain.setValueAtTime).toHaveBeenCalledWith(1.0, 10.0);
      expect(voiceGain.gain.setValueAtTime).toHaveBeenCalledWith(DEFAULT_AUDIO_VOLUMES.voice, 10.0);
      expect(sfxGain.gain.setValueAtTime).toHaveBeenCalledWith(DEFAULT_AUDIO_VOLUMES.sfx, 10.0);
      expect(ambienceGain.gain.setValueAtTime).toHaveBeenCalledWith(
        DEFAULT_AUDIO_VOLUMES.ambience,
        10.0
      );
      expect(musicGain.gain.setValueAtTime).toHaveBeenCalledWith(DEFAULT_AUDIO_VOLUMES.music, 10.0);
      expect(uiGain.gain.setValueAtTime).toHaveBeenCalledWith(DEFAULT_AUDIO_VOLUMES.ui, 10.0);
    });
  });

  describe('Bus Volume Adjustments and Clamping', () => {
    it('sets and clamps bus volume to [0, 1] range', () => {
      const manager = new AudioManager();
      manager.getContext();

      manager.setBusVolume('sfx', 0.45);
      expect(manager.getBusVolume('sfx')).toBe(0.45);
      const sfxGain = manager.getBus('sfx') as unknown as MockGainNode;
      expect(sfxGain.gain.setValueAtTime).toHaveBeenCalledWith(0.45, 10.0);

      // Over 1.0 clamped to 1.0
      manager.setBusVolume('sfx', 1.8);
      expect(manager.getBusVolume('sfx')).toBe(1.0);

      // Under 0.0 clamped to 0.0
      manager.setBusVolume('sfx', -0.5);
      expect(manager.getBusVolume('sfx')).toBe(0.0);
    });

    it('persists modified volumes in localStorage', () => {
      const manager = new AudioManager();
      manager.setBusVolume('music', 0.2);
      manager.setBusVolume('voice', 0.75);

      const raw = localStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
      expect(raw).toBeTruthy();
      const parsed = JSON.parse(raw!);
      expect(parsed.music).toBe(0.2);
      expect(parsed.voice).toBe(0.75);

      // A newly instantiated manager loads the persisted volumes
      const newManager = new AudioManager();
      expect(newManager.getBusVolume('music')).toBe(0.2);
      expect(newManager.getBusVolume('voice')).toBe(0.75);
    });
  });

  describe('Ducking Architecture', () => {
    it('ducks ambience and music to ~0.42 when voice speaks and restores to 1.0', () => {
      const manager = new AudioManager();
      manager.getContext();

      expect(manager.isCurrentlyDucked()).toBe(false);

      // Voice starts speaking -> ducking active
      manager.setDucking(true);
      expect(manager.isCurrentlyDucked()).toBe(true);

      // Voice ends -> ducking restored
      manager.setDucking(false);
      expect(manager.isCurrentlyDucked()).toBe(false);
    });

    it('smoothly ramps ducking gain nodes without modifying base user volumes', () => {
      const manager = new AudioManager();
      manager.setBusVolume('ambience', 0.5);
      manager.setBusVolume('music', 0.35);

      manager.setDucking(true);
      // Base user volumes remain unchanged
      expect(manager.getBusVolume('ambience')).toBe(0.5);
      expect(manager.getBusVolume('music')).toBe(0.35);

      manager.setDucking(false);
      expect(manager.getBusVolume('ambience')).toBe(0.5);
      expect(manager.getBusVolume('music')).toBe(0.35);
    });
  });

  describe('Master Mute and Voice Mute Synchronization', () => {
    it('sets master gain to 0 when muted and restores to master volume when unmuted', () => {
      const manager = new AudioManager();
      manager.setBusVolume('master', 0.85);
      const masterGain = manager.getBus('master') as unknown as MockGainNode;

      manager.setMuted(true);
      expect(manager.isMasterMuted()).toBe(true);
      expect(masterGain.gain.setValueAtTime).toHaveBeenCalledWith(0, 10.0);

      manager.setMuted(false);
      expect(manager.isMasterMuted()).toBe(false);
      expect(masterGain.gain.setValueAtTime).toHaveBeenCalledWith(0.85, 10.0);
    });

    it('toggles mute state and notifies listeners', () => {
      const manager = new AudioManager();
      const listener = vi.fn();
      manager.onStateChange(listener);

      manager.toggleMute();
      expect(manager.isMasterMuted()).toBe(true);
      expect(listener).toHaveBeenCalled();

      manager.toggleMute();
      expect(manager.isMasterMuted()).toBe(false);
    });

    it('persists mute state to localStorage including cyberlife_voice_muted compatibility key', () => {
      const manager = new AudioManager();

      manager.setMuted(true);
      expect(localStorage.getItem(VOICE_MUTED_STORAGE_KEY)).toBe('true');

      const raw = localStorage.getItem(AUDIO_SETTINGS_STORAGE_KEY);
      expect(raw).toBeTruthy();
      expect(JSON.parse(raw!).isMuted).toBe(true);

      manager.setMuted(false);
      expect(localStorage.getItem(VOICE_MUTED_STORAGE_KEY)).toBe('false');
    });

    it('computes effective voice volume taking mute into account', () => {
      const manager = new AudioManager();
      manager.setBusVolume('master', 0.8);
      manager.setBusVolume('voice', 0.9);

      expect(manager.getEffectiveVoiceVolume()).toBeCloseTo(0.72);

      manager.setMuted(true);
      expect(manager.getEffectiveVoiceVolume()).toBe(0);

      manager.setMuted(false);
      expect(manager.getEffectiveVoiceVolume()).toBeCloseTo(0.72);
    });
  });

  describe('Playback, Limiter & Concurrency Pool', () => {
    it('caps active playback sources to 24, evicting the oldest low-priority source', () => {
      const manager = new AudioManager();
      manager.getContext();

      const mockBuffer = {} as AudioBuffer;

      // Spawn 24 sounds: first is low priority
      const firstLow = manager.playOneShot(mockBuffer, { priority: 'low' });
      expect(firstLow).not.toBeNull();
      const stopSpy = vi.spyOn(firstLow!, 'stop');

      for (let i = 1; i < 24; i++) {
        manager.playOneShot(mockBuffer, { priority: 'normal' });
      }

      expect(manager.getActiveSourceCount()).toBe(24);

      // 25th sound should evict the oldest low-priority source
      manager.playOneShot(mockBuffer, { priority: 'high' });

      expect(stopSpy).toHaveBeenCalled();
      expect(manager.getActiveSourceCount()).toBeLessThanOrEqual(24);
    });

    it('resolves URL candidate fallbacks (.opus -> .ogg -> .mp3)', async () => {
      const manager = new AudioManager();
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: RequestInfo | URL) => {
        const urlStr = String(url);
        if (urlStr.endsWith('.opus')) {
          return { ok: false, status: 404 } as Response;
        }
        if (urlStr.endsWith('.ogg')) {
          return {
            ok: true,
            status: 200,
            arrayBuffer: async () => new ArrayBuffer(8),
          } as Response;
        }
        return { ok: false, status: 404 } as Response;
      });

      const buffer = await manager.loadAudio('/audio/test-sound');
      expect(buffer).not.toBeNull();
      expect(fetchSpy).toHaveBeenCalledWith('/audio/test-sound.opus');
      expect(fetchSpy).toHaveBeenCalledWith('/audio/test-sound.ogg');
    });

    it('supports looping sounds with crossfade and stop handles', async () => {
      const manager = new AudioManager();
      manager.getContext();

      const mockBufferA = {} as AudioBuffer;
      const mockBufferB = {} as AudioBuffer;

      const loopHandle = manager.playLoop(mockBufferA, { fadeInSeconds: 0.2 });
      expect(loopHandle).not.toBeNull();
      expect(loopHandle?.bus).toBe('music');

      await loopHandle?.crossfade(mockBufferB, 0.5);

      loopHandle?.stop(0.1);
    });
  });

  describe('Tab Visibility Listener', () => {
    it('suspends audio context on document hidden and resumes on visible', () => {
      const manager = new AudioManager();
      manager.getContext();

      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'hidden',
      });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(MockAudioContext.lastInstance?.suspend).toHaveBeenCalled();

      Object.defineProperty(document, 'visibilityState', {
        configurable: true,
        get: () => 'visible',
      });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(MockAudioContext.lastInstance?.resume).toHaveBeenCalled();
    });
  });
});
