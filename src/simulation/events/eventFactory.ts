import { SimulationEvent, SimulationEventType, BaseSimulationEvent } from './types';
import { deepFreeze } from '../core/stateUtils';

let globalEventCounter = 0;

/**
 * Resets the event ID counter (useful for test isolation).
 */
export function resetEventCounter(): void {
  globalEventCounter = 0;
}

/**
 * Creates a deterministic, immutable simulation event.
 */
export function createSimulationEvent<TType extends SimulationEventType, TPayload>(
  type: TType,
  timestamp: number,
  revision: number,
  payload: TPayload
): BaseSimulationEvent<TType, TPayload> {
  globalEventCounter += 1;
  const id = `evt_${revision}_${globalEventCounter.toString().padStart(6, '0')}`;

  const event: BaseSimulationEvent<TType, TPayload> = {
    id,
    type,
    timestamp,
    revision,
    payload: deepFreeze(payload),
  };

  return deepFreeze(event);
}

export type { SimulationEvent };
