/**
 * Cyberlife — Milestone 15: Decoupled Audio Event Dispatcher
 *
 * Provides a lightweight pub/sub event bus allowing simulation, world viewport,
 * virtual desktop, and narrative handlers to emit audio events without tight coupling.
 */

import { MusicContext } from './audioTypes';
import { musicController } from './MusicController';
import { ambienceController } from './AmbienceController';
import { sfxController } from './SfxController';

export type CyberlifeAudioEvent =
  | { type: 'MUSIC_SET_CONTEXT'; context: MusicContext }
  | { type: 'MUSIC_PLAY_STINGER'; stinger: 'music_discovery_revelation' | 'music_mission_resolved' }
  | { type: 'AMBIENCE_LOCATION_CHANGED'; locationId: string }
  | { type: 'WORKSTATION_STATE_CHANGED'; isFocused: boolean }
  | { type: 'TERMINAL_KEYSTROKE' }
  | { type: 'TERMINAL_COMMAND_EXECUTED'; outcome: 'success' | 'error' }
  | { type: 'APP_LIFECYCLE'; action: 'open' | 'close' }
  | { type: 'EVIDENCE_PRESERVED'; evidenceId: string }
  | { type: 'BED_SLEEP_REST' };

class AudioEventDispatcher {
  private listeners: Set<(event: CyberlifeAudioEvent) => void> = new Set();

  constructor() {
    // Register default handlers to connect events to subsystem controllers
    this.subscribe(this.handleDefaultEvent);
  }

  public subscribe(listener: (event: CyberlifeAudioEvent) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public dispatch(event: CyberlifeAudioEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('[AudioEventDispatcher] Listener error:', err);
      }
    }
  }

  private handleDefaultEvent = (event: CyberlifeAudioEvent): void => {
    switch (event.type) {
      case 'MUSIC_SET_CONTEXT':
        musicController.setContext(event.context);
        break;
      case 'MUSIC_PLAY_STINGER':
        musicController.playStinger(event.stinger);
        break;
      case 'AMBIENCE_LOCATION_CHANGED':
        ambienceController.setLocation(event.locationId);
        break;
      case 'WORKSTATION_STATE_CHANGED':
        ambienceController.setWorkstationFocus(event.isFocused);
        if (event.isFocused) {
          sfxController.playWorkstationEnter();
          musicController.setContext('WORKSTATION_FOCUS');
        } else {
          sfxController.playWorkstationExit();
          const loc = ambienceController.getCurrentLocationId() ?? 'neighborhood';
          if (loc === 'apartment_interior') {
            musicController.setContext('APARTMENT_DOWNTIME');
          } else {
            musicController.setContext('WORLD_EXPLORATION');
          }
        }
        break;
      case 'TERMINAL_KEYSTROKE':
        sfxController.playKeystroke();
        break;
      case 'TERMINAL_COMMAND_EXECUTED':
        if (event.outcome === 'success') {
          sfxController.playTerminalSuccess();
        } else {
          sfxController.playTerminalError();
        }
        break;
      case 'APP_LIFECYCLE':
        if (event.action === 'open') {
          sfxController.playAppOpen();
        } else {
          sfxController.playAppClose();
        }
        break;
      case 'EVIDENCE_PRESERVED':
        sfxController.playEvidenceAcquired();
        musicController.playStinger('music_discovery_revelation');
        break;
      case 'BED_SLEEP_REST':
        musicController.playStinger('music_mission_resolved');
        break;
    }
  };
}

export const audioEvents = new AudioEventDispatcher();
