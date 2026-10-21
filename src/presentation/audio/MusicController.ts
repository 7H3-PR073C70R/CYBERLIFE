/**
 * Cyberlife — Milestone 15: Context-Sensitive Music Controller
 *
 * Manages music playback lifecycle, context transitions, smooth crossfading,
 * dramatic narrative stingers, and race-free state transitions.
 */

import { audioManager, ActiveLoopHandle } from './AudioManager';
import { MUSIC_TRACKS } from './audioManifest';
import { MusicTrackId, MusicContext, MusicTransitionOptions } from './audioTypes';

export class MusicController {
  private currentTrackId: MusicTrackId | null = null;
  private currentLoopHandle: ActiveLoopHandle | null = null;
  private currentContext: MusicContext | null = null;
  private isTransitioning: boolean = false;
  private pendingTrackId: MusicTrackId | null = null;

  /**
   * Play a specific music track by ID with crossfade.
   */
  public async playTrack(
    trackId: MusicTrackId,
    options: MusicTransitionOptions = {}
  ): Promise<void> {
    const def = MUSIC_TRACKS[trackId];
    if (!def) {
      console.warn(`[MusicController] Unknown track ID: ${trackId}`);
      return;
    }

    if (this.currentTrackId === trackId && this.currentLoopHandle && !options.forceRestart) {
      return; // Already playing this track
    }

    this.pendingTrackId = trackId;

    if (this.isTransitioning) {
      // Another transition is in progress. Wait for our queued transition to complete.
      while (this.isTransitioning) {
        await new Promise(r => setTimeout(r, 20));
      }
      return;
    }

    this.isTransitioning = true;

    try {
      while (this.pendingTrackId) {
        const nextTrackId = this.pendingTrackId;
        this.pendingTrackId = null;

        const nextDef = MUSIC_TRACKS[nextTrackId];
        if (!nextDef) continue;

        if (this.currentTrackId === nextTrackId && this.currentLoopHandle && !options.forceRestart) {
          continue;
        }

        const crossfadeSec = options.crossfadeSeconds ?? nextDef.fadeInSeconds ?? 1.5;
        const targetVol = options.volume ?? nextDef.defaultVolume;

        const buffer = await audioManager.loadAudio(nextDef.pathWithoutExt);
        if (!buffer) {
          // Fallback or missing audio asset: do not break game loop
          continue;
        }

        // If an existing loop is playing, stop it with fade-out
        if (this.currentLoopHandle) {
          this.currentLoopHandle.stop(crossfadeSec);
          this.currentLoopHandle = null;
        }

        // Start new loop with fade-in
        const handle = audioManager.playLoop(buffer, {
          bus: 'music',
          volume: targetVol,
          fadeInSeconds: crossfadeSec,
          priority: 'high',
        });

        this.currentLoopHandle = handle;
        this.currentTrackId = nextTrackId;
      }
    } catch {
      // Audio playback blocked or failed gracefully
    } finally {
      this.isTransitioning = false;
    }
  }

  /**
   * Switch music based on high-level gameplay context.
   */
  public async setContext(context: MusicContext): Promise<void> {
    this.currentContext = context;
    switch (context) {
      case 'MAIN_MENU':
        await this.playTrack('music_main_menu');
        break;
      case 'WORLD_EXPLORATION':
        await this.playTrack('music_world_exploration');
        break;
      case 'APARTMENT_DOWNTIME':
        await this.playTrack('music_apartment_ambient');
        break;
      case 'WORKSTATION_FOCUS':
        await this.playTrack('music_workstation_focus');
        break;
      case 'INVESTIGATION_TENSION':
        await this.playTrack('music_investigation_tension');
        break;
    }
  }

  /**
   * Play a one-shot dramatic musical stinger (e.g., discovery or mission resolved)
   * while attenuating the active music bed and restoring it afterwards.
   */
  public async playStinger(
    stingerId: 'music_discovery_revelation' | 'music_mission_resolved'
  ): Promise<void> {
    const def = MUSIC_TRACKS[stingerId];
    if (!def) return;

    try {
      const buffer = await audioManager.loadAudio(def.pathWithoutExt);
      if (!buffer) return;

      // Attenuate active loop volume during stinger
      if (this.currentLoopHandle) {
        const normalVol = MUSIC_TRACKS[this.currentTrackId!]?.defaultVolume ?? 0.7;
        this.currentLoopHandle.setVolume(normalVol * 0.25);

        setTimeout(() => {
          if (this.currentLoopHandle && this.currentTrackId) {
            this.currentLoopHandle.setVolume(normalVol);
          }
        }, def.durationSeconds * 1000);
      }

      // Play stinger on music bus with high priority
      audioManager.playOneShot(buffer, {
        bus: 'music',
        volume: def.defaultVolume,
        priority: 'high',
      });
    } catch {
      // Fallback
    }
  }

  /**
   * Stop active music with smooth fade-out.
   */
  public stopMusic(fadeDurationSeconds = 1.0): void {
    if (this.currentLoopHandle) {
      this.currentLoopHandle.stop(fadeDurationSeconds);
      this.currentLoopHandle = null;
    }
    this.currentTrackId = null;
    this.currentContext = null;
  }

  public getCurrentTrackId(): MusicTrackId | null {
    return this.currentTrackId;
  }

  public getCurrentContext(): MusicContext | null {
    return this.currentContext;
  }

  public isPlaying(): boolean {
    return this.currentLoopHandle !== null;
  }

  public getIsTransitioning(): boolean {
    return this.isTransitioning;
  }
}

export const musicController = new MusicController();

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__CYBERLIFE_MUSIC_CONTROLLER__ = musicController;
}
