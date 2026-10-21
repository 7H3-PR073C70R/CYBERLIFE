/**
 * Cyberlife — Milestone 15: Sound Effects & UI Feedback Controller
 *
 * Manages tactile interactive audio feedback: mechanical keyboard actuation,
 * terminal bells, application window events, workstation transitions,
 * cryptographic evidence preservation, and UI controls.
 */

import { audioManager } from './AudioManager';
import { SFX_TRACKS } from './audioManifest';
import { SfxId } from './audioTypes';

export class SfxController {
  private lastTypingTime = 0;
  private lastHoverTime = 0;
  private keyVariants = [
    '/assets/audio/sfx/terminal_key1',
    '/assets/audio/sfx/terminal_key2',
    '/assets/audio/sfx/terminal_key3',
  ];
  private nextKeyIdx = 0;

  /**
   * Play any registered SFX by ID.
   */
  public play(
    sfxId: SfxId,
    options: { volume?: number; playbackRate?: number } = {}
  ): void {
    try {
      const def = SFX_TRACKS[sfxId];
      if (!def) return;

      const vol = options.volume ?? def.defaultVolume;
      audioManager.playOneShot(def.pathWithoutExt, {
        bus: def.bus,
        volume: vol,
        playbackRate: options.playbackRate ?? 1.0,
        priority: sfxId.startsWith('evidence') || sfxId.startsWith('audio_test') ? 'high' : 'normal',
      });
    } catch {
      // Audio failures must never crash interactive caller logic
    }
  }

  /**
   * Play a realistic mechanical keystroke sound with pitch and sample variation.
   * Rate-limited to max 25 strokes/sec to prevent audio clutter during paste/scripts.
   */
  public playKeystroke(): void {
    try {
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - this.lastTypingTime < 40) return; // 25 Hz limit
      this.lastTypingTime = now;

      // Pick variant and slight humanized pitch variation (0.94x to 1.06x)
      const variantPath = this.keyVariants[this.nextKeyIdx % this.keyVariants.length]!;
      this.nextKeyIdx++;
      const pitch = 0.94 + Math.random() * 0.12;

      audioManager.playOneShot(variantPath, {
        bus: 'sfx',
        volume: 0.50,
        playbackRate: pitch,
        priority: 'low',
      });
    } catch {
      // Audio failures must never crash interactive caller logic
    }
  }

  public playTerminalEnter(): void {
    this.play('terminal_enter');
  }

  public playTerminalSuccess(): void {
    this.play('terminal_success');
  }

  public playTerminalError(): void {
    this.play('terminal_error');
  }

  public playAppOpen(): void {
    this.play('app_open');
  }

  public playAppClose(): void {
    this.play('app_close');
  }

  public playWorkstationEnter(): void {
    this.play('workstation_enter');
  }

  public playWorkstationExit(): void {
    this.play('workstation_exit');
  }

  public playEvidenceAcquired(): void {
    this.play('evidence_acquired');
  }

  public playAudioTest(): void {
    this.play('audio_test');
  }

  public playUiClick(): void {
    this.play('ui_click');
  }

  public playUiHover(): void {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - this.lastHoverTime < 70) return; // Max 14 Hz
    this.lastHoverTime = now;
    this.play('ui_hover');
  }

  public playUiToggle(): void {
    this.play('ui_toggle');
  }
}

export const sfxController = new SfxController();

if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).__CYBERLIFE_SFX_CONTROLLER__ = sfxController;
}
