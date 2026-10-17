import { SimulationState } from './types';
import { calculateCalendarTime, DEFAULT_SIMULATION_START_ISO } from '../time/calendar';
import { validateSimulationState } from './invariants';
import { deepFreeze } from './stateUtils';

export interface InitialStateOverrides {
  readonly schemaVersion?: number;
  readonly revision?: number;
  readonly scenarioId?: string;
  readonly simulationTimeSeconds?: number;
  readonly startIso?: string;
  readonly playerId?: string;
  readonly playerName?: string;
  readonly health?: number;
  readonly energy?: number;
  readonly moneyKobo?: number;
  readonly locationId?: string;
  readonly inventorySlots?: ReadonlyArray<{ readonly itemId: string; readonly quantity: number }>;
  readonly flags?: Readonly<Record<string, boolean | string | number>>;
}

/**
 * Creates the deterministic initial simulation state for Cyberlife.
 * Uses documented defaults for Lagos Island environment.
 */
export function createInitialSimulationState(
  overrides?: InitialStateOverrides
): Readonly<SimulationState> {
  const startIso = overrides?.startIso ?? DEFAULT_SIMULATION_START_ISO;
  const simulationTimeSeconds = overrides?.simulationTimeSeconds ?? 0;
  const calendar = calculateCalendarTime(simulationTimeSeconds, startIso);

  const state: SimulationState = {
    metadata: {
      schemaVersion: overrides?.schemaVersion ?? 1,
      revision: overrides?.revision ?? 0,
      scenarioId: overrides?.scenarioId ?? 'lagos_island_intro',
      initializedAtIso: startIso,
    },
    time: {
      simulationTimeSeconds,
      calendar,
    },
    player: {
      id: overrides?.playerId ?? 'player_01',
      name: overrides?.playerName ?? 'Babatunde Vance',
      health: overrides?.health ?? 100,
      energy: overrides?.energy ?? 100,
      moneyKobo: overrides?.moneyKobo ?? 250_000, // ₦2,500.00
      locationId: overrides?.locationId ?? 'neighborhood',
    },
    inventory: {
      slots: overrides?.inventorySlots ?? [
        { itemId: 'item_access_badge', quantity: 1 },
        { itemId: 'item_cedarline_notebook', quantity: 1 },
      ],
    },
    flags: overrides?.flags ?? {
      apartment_door_unlocked: true,
      has_read_community_noticeboard: false,
    },
    timers: [],
    nextTimerSequence: 0,
  };

  validateSimulationState(state);
  return deepFreeze(state);
}
