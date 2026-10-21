/**
 * Cyberlife — Milestone 15: Location-Aware Ambience Controller
 *
 * Manages environmental soundscapes tied to actual physical locations
 * (Lagos streets, player apartment, Cedarline corporate lobby, workstation equipment).
 * Supports seamless loops, smooth location crossfades, and time-of-day modulation.
 */

import { audioManager, ActiveLoopHandle } from './AudioManager';
import { AMBIENCE_TRACKS } from './audioManifest';
import { AmbienceTrackId } from './audioTypes';

export class AmbienceController {
  private currentTrackId: AmbienceTrackId | null = null;
  private currentLoopHandle: ActiveLoopHandle | null = null;
  private currentLocationId: string | null = null;
  private isWorkstationFocused: boolean = false;
  private isTransitioning: boolean = false;
  private pendingTrackId: AmbienceTrackId | null = null;

  /**
   * Play an ambience loop by ID with smooth crossfading.
   */
  public async playAmbience(
    trackId: AmbienceTrackId,
    crossfadeSeconds: number = 2.0
  ): Promise<void> {
    if (this.currentTrackId === trackId && this.currentLoopHandle) {
      return; // Already playing
    }

    const def = AMBIENCE_TRACKS[trackId];
    if (!def) {
      console.warn(`[AmbienceController] Unknown ambience track ID: ${trackId}`);
      return;
    }

    if (this.isTransitioning) {
      this.pendingTrackId = trackId;
      return;
    }

    this.isTransitioning = true;

    try {
      const buffer = await audioManager.loadAudio(def.pathWithoutExt);
      if (!buffer) {
        this.isTransitioning = false;
        return;
      }

      // Stop old loop if playing
      if (this.currentLoopHandle) {
        this.currentLoopHandle.stop(crossfadeSeconds);
        this.currentLoopHandle = null;
      }

      // Start new loop
      const handle = audioManager.playLoop(buffer, {
        bus: 'ambience',
        volume: def.defaultVolume,
        fadeInSeconds: crossfadeSeconds,
        priority: 'high',
      });

      this.currentLoopHandle = handle;
      this.currentTrackId = trackId;
    } catch {
      // Audio playback blocked or failed gracefully
    } finally {
      this.isTransitioning = false;
      if (this.pendingTrackId && this.pendingTrackId !== this.currentTrackId) {
        const next = this.pendingTrackId;
        this.pendingTrackId = null;
        await this.playAmbience(next, crossfadeSeconds);
      }
    }
  }

  /**
   * Update ambience based on the player's 3D world location.
   */
  public async setLocation(locationId: string): Promise<void> {
    this.currentLocationId = locationId;

    if (this.isWorkstationFocused) {
      // While workstation focused, workstation tone takes precedence
      await this.playAmbience('ambience_workstation', 1.0);
      return;
    }

    switch (locationId) {
      case 'apartment_interior':
        await this.playAmbience('ambience_apartment', 1.5);
        break;
      case 'cedarline_interior':
        await this.playAmbience('ambience_cedarline_lobby', 1.5);
        break;
      case 'neighborhood':
      default:
        await this.playAmbience('ambience_lagos_streets', 2.0);
        break;
    }
  }

  /**
   * Enter or exit computer workstation focus.
   */
  public async setWorkstationFocus(focused: boolean): Promise<void> {
    this.isWorkstationFocused = focused;
    if (focused) {
      await this.playAmbience('ambience_workstation', 1.0);
    } else if (this.currentLocationId) {
      await this.setLocation(this.currentLocationId);
    }
  }

  /**
   * Modulate ambience volume for time of day (e.g. night quiet).
   */
  public setTimeOfDayFactor(factor: number): void {
    if (!this.currentLoopHandle || !this.currentTrackId) return;
    const baseVol = AMBIENCE_TRACKS[this.currentTrackId]?.defaultVolume ?? 0.6;
    const clampedFactor = Math.max(0.4, Math.min(1.1, factor));
    this.currentLoopHandle.setVolume(baseVol * clampedFactor);
  }

  /**
   * Stop active environmental ambience with fade-out.
   */
  public stopAmbience(fadeDurationSeconds = 1.0): void {
    if (this.currentLoopHandle) {
      this.currentLoopHandle.stop(fadeDurationSeconds);
      this.currentLoopHandle = null;
    }
    this.currentTrackId = null;
  }

  public getCurrentTrackId(): AmbienceTrackId | null {
    return this.currentTrackId;
  }

  public getCurrentLocationId(): string | null {
    return this.currentLocationId;
  }

  public isPlaying(): boolean {
    return this.currentLoopHandle !== null;
  }
}

export const ambienceController = new AmbienceController();

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__CYBERLIFE_AMBIENCE_CONTROLLER__ = ambienceController;
}
