/**
 * Cyberlife — Milestone 15: Audio Subsystem Unit Tests
 *
 * Validates audio engine lifecycle, bus mixing topology, context transitions,
 * location-aware ambience, mechanical keyboard actuation rate limiting,
 * ducking, user-gesture unlock, and persistence.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  audioManager,
  musicController,
  ambienceController,
  sfxController,
  audioEvents,
  MUSIC_TRACKS,
  AMBIENCE_TRACKS,
  SFX_TRACKS,
  DEFAULT_AUDIO_VOLUMES,
  AudioBusName,
} from '../../../../src/presentation/audio';

describe('Milestone 15 — Cyberlife Audio Subsystem', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    audioManager.resetToDefaults();
  });

  afterEach(() => {
    musicController.stopMusic(0);
    ambienceController.stopAmbience(0);
  });

  describe('1. Audio Engine Lifecycle & Initialization', () => {
    it('initializes with default volume mix and unmuted state', () => {
      expect(audioManager.isMasterMuted()).toBe(false);
      const vols = audioManager.getAllVolumes();
      expect(vols.master).toBe(DEFAULT_AUDIO_VOLUMES.master);
      expect(vols.music).toBe(DEFAULT_AUDIO_VOLUMES.music);
      expect(vols.ambience).toBe(DEFAULT_AUDIO_VOLUMES.ambience);
      expect(vols.sfx).toBe(DEFAULT_AUDIO_VOLUMES.sfx);
      expect(vols.voice).toBe(DEFAULT_AUDIO_VOLUMES.voice);
      expect(vols.ui).toBe(DEFAULT_AUDIO_VOLUMES.ui);
    });

    it('lazily instantiates AudioContext and constructs audio bus graph', () => {
      const ctx = audioManager.getContext();
      expect(ctx).not.toBeNull();
      expect(ctx?.state).toBe('running');

      // Master, Music, Ambience, SFX, Voice, UI buses exist
      const buses: AudioBusName[] = ['master', 'music', 'ambience', 'sfx', 'voice', 'ui'];
      buses.forEach(b => {
        const gainNode = audioManager.getBus(b);
        expect(gainNode).not.toBeNull();
      });
    });

    it('resumes suspended AudioContext on user interaction gesture', () => {
      const ctx = audioManager.getContext()!;
      Object.defineProperty(ctx, 'state', { value: 'suspended', configurable: true });
      vi.mocked(ctx.resume).mockClear();

      // Dispatch simulated pointerdown event
      window.dispatchEvent(new Event('pointerdown'));
      expect(ctx.resume).toHaveBeenCalled();
    });

    it('suspends and resumes AudioContext on browser visibilitychange', () => {
      const ctx = audioManager.getContext();

      // Simulate tab hidden
      Object.defineProperty(document, 'visibilityState', {
        value: 'hidden',
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(ctx?.suspend).toHaveBeenCalled();

      // Simulate tab visible
      Object.defineProperty(document, 'visibilityState', {
        value: 'visible',
        configurable: true,
      });
      document.dispatchEvent(new Event('visibilitychange'));
      expect(ctx?.resume).toHaveBeenCalled();
    });
  });

  describe('2. Audio Mixing, Volume Buses & Persistence', () => {
    it('updates specific bus volumes independently within [0, 1] range', () => {
      audioManager.setBusVolume('music', 0.45);
      expect(audioManager.getBusVolume('music')).toBeCloseTo(0.45);
      expect(audioManager.getBusVolume('ambience')).toBe(DEFAULT_AUDIO_VOLUMES.ambience);

      // Clamps to [0, 1]
      audioManager.setBusVolume('sfx', 1.5);
      expect(audioManager.getBusVolume('sfx')).toBe(1.0);

      audioManager.setBusVolume('voice', -0.5);
      expect(audioManager.getBusVolume('voice')).toBe(0.0);
    });

    it('persists volume changes and mute state across reloads via localStorage', () => {
      audioManager.setBusVolume('music', 0.65);
      audioManager.setBusVolume('ambience', 0.55);
      audioManager.setMuted(true);

      const storedRaw = localStorage.getItem('cyberlife_audio_settings_v1');
      expect(storedRaw).not.toBeNull();
      const parsed = JSON.parse(storedRaw!);
      expect(parsed.music).toBeCloseTo(0.65);
      expect(parsed.ambience).toBeCloseTo(0.55);
      expect(parsed.isMuted).toBe(true);
    });

    it('resets all audio buses and mute state to defaults', () => {
      audioManager.setBusVolume('music', 0.2);
      audioManager.setBusVolume('master', 0.1);
      audioManager.setMuted(true);

      audioManager.resetToDefaults();
      expect(audioManager.isMasterMuted()).toBe(false);
      expect(audioManager.getBusVolume('master')).toBe(DEFAULT_AUDIO_VOLUMES.master);
      expect(audioManager.getBusVolume('music')).toBe(DEFAULT_AUDIO_VOLUMES.music);
    });

    it('executes audio test output chime', () => {
      const playSpy = vi.spyOn(audioManager, 'playOneShot');
      audioManager.testAudioPlayback();
      expect(playSpy).toHaveBeenCalledWith(
        '/assets/audio/sfx/audio_test',
        expect.objectContaining({ bus: 'sfx', volume: 0.8 })
      );
    });

    it('ducks music and ambience when voice or critical cues activate', () => {
      expect(audioManager.isCurrentlyDucked()).toBe(false);
      audioManager.setDucking(true);
      expect(audioManager.isCurrentlyDucked()).toBe(true);
      audioManager.setDucking(false);
      expect(audioManager.isCurrentlyDucked()).toBe(false);
    });
  });

  describe('3. Music Controller & Narrative Context Transitions', () => {
    it('registers all 7 original musical themes and stingers', () => {
      expect(MUSIC_TRACKS.music_main_menu).toBeDefined();
      expect(MUSIC_TRACKS.music_world_exploration).toBeDefined();
      expect(MUSIC_TRACKS.music_apartment_ambient).toBeDefined();
      expect(MUSIC_TRACKS.music_workstation_focus).toBeDefined();
      expect(MUSIC_TRACKS.music_investigation_tension).toBeDefined();
      expect(MUSIC_TRACKS.music_discovery_revelation).toBeDefined();
      expect(MUSIC_TRACKS.music_mission_resolved).toBeDefined();
    });

    it('transitions music smoothly according to gameplay context', async () => {
      const dummyBuffer = {} as AudioBuffer;
      vi.spyOn(audioManager, 'loadAudio').mockResolvedValue(dummyBuffer);

      // Context 1: Main Menu
      await musicController.setContext('MAIN_MENU');
      expect(musicController.getCurrentTrackId()).toBe('music_main_menu');
      expect(musicController.getCurrentContext()).toBe('MAIN_MENU');

      // Context 2: World Exploration
      await musicController.setContext('WORLD_EXPLORATION');
      expect(musicController.getCurrentTrackId()).toBe('music_world_exploration');
      expect(musicController.getCurrentContext()).toBe('WORLD_EXPLORATION');

      // Context 3: Workstation Focus
      await musicController.setContext('WORKSTATION_FOCUS');
      expect(musicController.getCurrentTrackId()).toBe('music_workstation_focus');

      // Context 4: Apartment Downtime
      await musicController.setContext('APARTMENT_DOWNTIME');
      expect(musicController.getCurrentTrackId()).toBe('music_apartment_ambient');
    });

    it('plays discovery revelation stinger with automatic music attenuation and recovery', async () => {
      const dummyBuffer = {} as AudioBuffer;
      vi.spyOn(audioManager, 'loadAudio').mockResolvedValue(dummyBuffer);
      const playSpy = vi.spyOn(audioManager, 'playOneShot');

      await musicController.playStinger('music_discovery_revelation');
      expect(playSpy).toHaveBeenCalledWith(
        dummyBuffer,
        expect.objectContaining({ bus: 'music', priority: 'high' })
      );
    });

    it('prevents duplicate playback when calling same context repeatedly', async () => {
      const dummyBuffer = {} as AudioBuffer;
      vi.spyOn(audioManager, 'loadAudio').mockResolvedValue(dummyBuffer);

      await musicController.setContext('MAIN_MENU');
      const playSpy = vi.spyOn(audioManager, 'playLoop');

      // Same context should be a no-op
      await musicController.setContext('MAIN_MENU');
      expect(playSpy).not.toHaveBeenCalled();
    });
  });

  describe('4. Ambience Controller & Location Awareness', () => {
    it('registers all 4 environmental ambience loops', () => {
      expect(AMBIENCE_TRACKS.ambience_lagos_streets).toBeDefined();
      expect(AMBIENCE_TRACKS.ambience_apartment).toBeDefined();
      expect(AMBIENCE_TRACKS.ambience_cedarline_lobby).toBeDefined();
      expect(AMBIENCE_TRACKS.ambience_workstation).toBeDefined();
    });

    it('maps location identifiers to appropriate environmental ambiences', async () => {
      const dummyBuffer = {} as AudioBuffer;
      vi.spyOn(audioManager, 'loadAudio').mockResolvedValue(dummyBuffer);

      // Street locations -> Lagos street ambience
      await ambienceController.setLocation('neighborhood');
      expect(ambienceController.getCurrentTrackId()).toBe('ambience_lagos_streets');

      // Apartment interior -> quiet domestic room tone
      await ambienceController.setLocation('apartment_interior');
      expect(ambienceController.getCurrentTrackId()).toBe('ambience_apartment');

      // Cedarline lobby -> corporate ventilation and reverb
      await ambienceController.setLocation('cedarline_interior');
      expect(ambienceController.getCurrentTrackId()).toBe('ambience_cedarline_lobby');
    });

    it('transitions to workstation focus fan hum when entering terminal', async () => {
      const dummyBuffer = {} as AudioBuffer;
      vi.spyOn(audioManager, 'loadAudio').mockResolvedValue(dummyBuffer);

      await ambienceController.setLocation('neighborhood');
      expect(ambienceController.getCurrentTrackId()).toBe('ambience_lagos_streets');

      await ambienceController.setWorkstationFocus(true);
      expect(ambienceController.getCurrentTrackId()).toBe('ambience_workstation');

      await ambienceController.setWorkstationFocus(false);
      expect(ambienceController.getCurrentTrackId()).toBe('ambience_lagos_streets');
    });

    it('modulates ambient volume factor for night time', () => {
      expect(() => {
        ambienceController.setTimeOfDayFactor(0.6);
      }).not.toThrow();
    });
  });

  describe('5. Sound Effects, Mechanical Keystrokes & Rate Throttling', () => {
    it('registers tactile sound effects', () => {
      expect(SFX_TRACKS.terminal_key).toBeDefined();
      expect(SFX_TRACKS.terminal_enter).toBeDefined();
      expect(SFX_TRACKS.terminal_success).toBeDefined();
      expect(SFX_TRACKS.terminal_error).toBeDefined();
      expect(SFX_TRACKS.app_open).toBeDefined();
      expect(SFX_TRACKS.app_close).toBeDefined();
      expect(SFX_TRACKS.workstation_enter).toBeDefined();
      expect(SFX_TRACKS.workstation_exit).toBeDefined();
      expect(SFX_TRACKS.evidence_acquired).toBeDefined();
      expect(SFX_TRACKS.audio_test).toBeDefined();
    });

    it('throttles rapid keystrokes to max 25 strokes/sec (40ms interval)', () => {
      const playSpy = vi.spyOn(audioManager, 'playOneShot');

      sfxController.playKeystroke();
      expect(playSpy).toHaveBeenCalledTimes(1);

      // Immediately trigger again within 40ms -> should be suppressed
      sfxController.playKeystroke();
      expect(playSpy).toHaveBeenCalledTimes(1);
    });

    it('plays window open and close sounds', () => {
      const playSpy = vi.spyOn(audioManager, 'playOneShot');
      sfxController.playAppOpen();
      expect(playSpy).toHaveBeenCalledWith(
        '/assets/audio/ui/app_open',
        expect.objectContaining({ bus: 'ui' })
      );

      sfxController.playAppClose();
      expect(playSpy).toHaveBeenCalledWith(
        '/assets/audio/ui/app_close',
        expect.objectContaining({ bus: 'ui' })
      );
    });

    it('triggers evidence acquired sound for narrative milestones', () => {
      const playSpy = vi.spyOn(audioManager, 'playOneShot');
      sfxController.playEvidenceAcquired();
      expect(playSpy).toHaveBeenCalledWith(
        '/assets/audio/sfx/evidence_acquired',
        expect.objectContaining({ bus: 'sfx', priority: 'high' })
      );
    });
  });

  describe('6. Audio Events Pub/Sub Dispatcher', () => {
    it('dispatches and receives audio events cleanly', () => {
      const received: string[] = [];
      const unsub = audioEvents.subscribe((event) => {
        if (event.type === 'EVIDENCE_PRESERVED') {
          received.push(event.evidenceId);
        }
      });

      audioEvents.dispatch({ type: 'EVIDENCE_PRESERVED', evidenceId: 'ev-101' });
      expect(received).toEqual(['ev-101']);

      unsub();
      audioEvents.dispatch({ type: 'EVIDENCE_PRESERVED', evidenceId: 'ev-102' });
      expect(received).toEqual(['ev-101']); // Not called again after unsub
    });
  });
});
