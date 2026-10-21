/**
 * Cyberlife — Milestone 15: Audio System Type Definitions
 *
 * Defines authoritative TypeScript types for music tracks, ambient loops,
 * sound effects, bus topologies, playback states, and event payloads.
 */

import { AudioBusName, AudioVolumes } from './AudioManager';

export type { AudioBusName, AudioVolumes };

export type MusicTrackId =
  | 'music_main_menu'
  | 'music_world_exploration'
  | 'music_apartment_ambient'
  | 'music_workstation_focus'
  | 'music_investigation_tension'
  | 'music_discovery_revelation'
  | 'music_mission_resolved';

export type AmbienceTrackId =
  | 'ambience_lagos_streets'
  | 'ambience_apartment'
  | 'ambience_cedarline_lobby'
  | 'ambience_workstation';

export type SfxId =
  | 'ui_click'
  | 'ui_hover'
  | 'ui_toggle'
  | 'terminal_key'
  | 'terminal_enter'
  | 'terminal_success'
  | 'terminal_error'
  | 'app_open'
  | 'app_close'
  | 'workstation_enter'
  | 'workstation_exit'
  | 'evidence_acquired'
  | 'audio_test';

export interface AudioAssetDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: 'music' | 'ambience' | 'sfx' | 'ui';
  readonly pathWithoutExt: string;
  readonly bus: AudioBusName;
  readonly defaultVolume: number;
  readonly isLoop: boolean;
  readonly durationSeconds: number;
  readonly description: string;
  readonly fadeInSeconds?: number;
  readonly fadeOutSeconds?: number;
}

export type MusicContext =
  | 'MAIN_MENU'
  | 'WORLD_EXPLORATION'
  | 'APARTMENT_DOWNTIME'
  | 'WORKSTATION_FOCUS'
  | 'INVESTIGATION_TENSION';

export interface MusicTransitionOptions {
  readonly crossfadeSeconds?: number;
  readonly volume?: number;
  readonly forceRestart?: boolean;
}

export interface AudioSystemSettings {
  readonly volumes: AudioVolumes;
  readonly isMuted: boolean;
  readonly reducedDynamicRange?: boolean;
}
