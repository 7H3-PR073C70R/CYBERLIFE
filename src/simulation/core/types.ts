/**
 * Authoritative simulation core types for Cyberlife.
 * Defines the complete shape of game state, metadata, time, player,
 * inventory, flags, and scheduled timers.
 */

export interface CalendarTime {
  readonly iso: string;
  readonly year: number;
  readonly month: number; // 1-12
  readonly day: number; // 1-31
  readonly hour: number; // 0-23
  readonly minute: number; // 0-59
  readonly second: number; // 0-59
  readonly dayOfWeek:
    'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  readonly timeString: string; // e.g. "08:00 AM"
  readonly dateString: string; // e.g. "Monday, Oct 12, 2026"
}

export interface SimulationMetadata {
  readonly schemaVersion: number;
  readonly revision: number;
  readonly scenarioId: string;
  readonly initializedAtIso: string;
}

export interface SimulationTimeState {
  readonly simulationTimeSeconds: number;
  readonly calendar: CalendarTime;
}

export interface PlayerAttributes {
  readonly id: string;
  readonly name: string;
  readonly health: number; // 0 to 100
  readonly energy: number; // 0 to 100
  readonly moneyKobo: number; // Safe integer kobo (>= 0)
  readonly locationId: string; // Logical location (e.g. 'neighborhood', 'apartment_interior')
}

export interface InventorySlot {
  readonly itemId: string;
  readonly quantity: number; // Positive integer (> 0)
}

export interface SimulationInventoryState {
  readonly slots: ReadonlyArray<InventorySlot>;
}

export type WorldFlagValue = boolean | string | number;

export interface SimulationTimerState {
  readonly id: string;
  readonly label: string;
  readonly dueSimulationTime: number; // Simulation second when timer triggers
  readonly durationSeconds: number;
  readonly sequence: number; // Monotonic sequence for deterministic ordering
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly repeatIntervalSeconds?: number;
}

import type { AsterIncidentMissionState } from '../missions/types';
import type { NpcSimulationState, ActiveDialogueState } from '../actors/types';
import type { CareerState, JobBoardState, SkillId, SkillState, EconomyState } from '../career/types';

export interface SimulationState {
  readonly metadata: SimulationMetadata;
  readonly time: SimulationTimeState;
  readonly player: PlayerAttributes;
  readonly inventory: SimulationInventoryState;
  readonly flags: Readonly<Record<string, WorldFlagValue>>;
  readonly timers: ReadonlyArray<SimulationTimerState>;
  readonly nextTimerSequence: number;
  readonly mission?: AsterIncidentMissionState;
  readonly npcs?: Readonly<Record<string, NpcSimulationState>>;
  readonly activeDialogue?: ActiveDialogueState;
  readonly career?: CareerState;
  readonly jobs?: JobBoardState;
  readonly skills?: Readonly<Record<SkillId, SkillState>>;
  readonly economy?: EconomyState;
}
