/**
 * Cyberlife — Web Audio API Synthesizer for Hacker Calls & UI SFX
 * 100% simulated in the presentation layer, routed through AudioManager's SFX and UI buses.
 */

import { audioManager } from './AudioManager';

export class AudioSfxManager {
  private localMuted = false;

  public setMuted(muted: boolean): void {
    this.localMuted = muted;
  }

  public isMuted(): boolean {
    return this.localMuted || audioManager.isMasterMuted();
  }

  /**
   * Synthesize classic dual-tone telephone ringing / hacker VoIP incoming call ring
   * Routed through AudioManager's SFX bus.
   */
  public playRing(): () => void {
    if (this.isMuted()) return () => {};
    const ctx = audioManager.getContext();
    const bus = audioManager.getBus('sfx');
    if (!ctx || !bus) return () => {};

    let isPlaying = true;
    let ringTimeout: number | null = null;

    const burst = () => {
      if (!isPlaying || !ctx || this.isMuted()) return;
      try {
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now); // 440 Hz
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(480, now); // 480 Hz

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.05);
        gain.gain.setValueAtTime(0.12, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(bus);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.4);
        osc2.stop(now + 1.4);

        if (isPlaying) {
          ringTimeout = window.setTimeout(burst, 3000);
        }
      } catch {
        // AudioContext not yet resumed
      }
    };

    burst();

    return () => {
      isPlaying = false;
      if (ringTimeout !== null) {
        window.clearTimeout(ringTimeout);
      }
    };
  }

  /**
   * Play VoIP call connect handshake sound (retro modem / secure link established)
   * Routed through AudioManager's SFX bus.
   */
  public playConnect(): void {
    if (this.isMuted()) return;
    const ctx = audioManager.getContext();
    const bus = audioManager.getBus('sfx');
    if (!ctx || !bus) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      osc.frequency.setValueAtTime(880, now + 0.2);
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.35);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch {
      // AudioContext not yet resumed
    }
  }

  /**
   * Play call termination beep
   * Routed through AudioManager's SFX bus.
   */
  public playDisconnect(): void {
    if (this.isMuted()) return;
    const ctx = audioManager.getContext();
    const bus = audioManager.getBus('sfx');
    if (!ctx || !bus) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.setValueAtTime(300, now + 0.12);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignored
    }
  }

  /**
   * Play incoming chat message notification chirp
   * Routed through AudioManager's UI bus.
   */
  public playMessagePing(): void {
    if (this.isMuted()) return;
    const ctx = audioManager.getContext();
    const bus = audioManager.getBus('ui');
    if (!ctx || !bus) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880.0, now + 0.08); // A5

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Ignored
    }
  }

  /**
   * Play typewriter subtitle tick for dialogue voice stream
   * Routed through AudioManager's UI bus.
   */
  public playSpeechBlip(): void {
    if (this.isMuted()) return;
    const ctx = audioManager.getContext();
    const bus = audioManager.getBus('ui');
    if (!ctx || !bus) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(180 + Math.random() * 80, now);

      gain.gain.setValueAtTime(0.015, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(bus);

      osc.start(now);
      osc.stop(now + 0.04);
    } catch {
      // Ignored
    }
  }
}

export const audioSfx = new AudioSfxManager();
