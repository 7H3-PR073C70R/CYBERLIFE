import { SimulationTimerState } from '../core/types';
import { ValidationError, InvalidArgumentError } from '../../domain/errors/DomainError';

export interface ScheduleTimerOptions {
  readonly id: string;
  readonly label: string;
  readonly durationSeconds: number;
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly repeatIntervalSeconds?: number;
}

/**
 * Validates and schedules a new deterministic simulation timer.
 */
export function scheduleTimer(
  currentTimers: ReadonlyArray<SimulationTimerState>,
  currentSimTimeSeconds: number,
  nextSequence: number,
  options: ScheduleTimerOptions
): { readonly timers: ReadonlyArray<SimulationTimerState>; readonly nextSequence: number } {
  if (!options.id || typeof options.id !== 'string' || options.id.trim().length === 0) {
    throw new InvalidArgumentError('Timer id must be a non-empty string');
  }

  if (currentTimers.some(t => t.id === options.id)) {
    throw new ValidationError(`Timer with id "${options.id}" already exists`);
  }

  if (!Number.isFinite(options.durationSeconds) || options.durationSeconds <= 0) {
    throw new InvalidArgumentError(
      `Timer duration must be a positive finite number of seconds, received: ${options.durationSeconds}`
    );
  }

  if (
    options.repeatIntervalSeconds !== undefined &&
    (!Number.isFinite(options.repeatIntervalSeconds) || options.repeatIntervalSeconds <= 0)
  ) {
    throw new InvalidArgumentError(
      `Timer repeat interval must be a positive finite number of seconds, received: ${options.repeatIntervalSeconds}`
    );
  }

  const dueSimulationTime = currentSimTimeSeconds + options.durationSeconds;

  const newTimer: SimulationTimerState = {
    id: options.id.trim(),
    label: options.label.trim() || options.id.trim(),
    dueSimulationTime,
    durationSeconds: options.durationSeconds,
    sequence: nextSequence,
    payload: options.payload,
    repeatIntervalSeconds: options.repeatIntervalSeconds,
  };

  return {
    timers: [...currentTimers, newTimer],
    nextSequence: nextSequence + 1,
  };
}

/**
 * Cancels a pending timer by id.
 */
export function cancelTimer(
  currentTimers: ReadonlyArray<SimulationTimerState>,
  timerId: string
): ReadonlyArray<SimulationTimerState> {
  const index = currentTimers.findIndex(t => t.id === timerId);
  if (index === -1) {
    throw new ValidationError(`Cannot cancel timer: Timer with id "${timerId}" not found`);
  }

  return currentTimers.filter(t => t.id !== timerId);
}

/**
 * Processes due timers given a target simulation time.
 * Returns due timers sorted deterministically:
 *  1. Earliest due time first.
 *  2. Earliest sequence number.
 *  3. Lexicographical ID.
 *
 * For one-shot timers, they are removed from the active collection.
 * For repeating timers, they are rescheduled with the next deadline.
 */
export function processDueTimers(
  currentTimers: ReadonlyArray<SimulationTimerState>,
  currentSimTimeSeconds: number
): {
  readonly dueTimers: ReadonlyArray<SimulationTimerState>;
  readonly remainingTimers: ReadonlyArray<SimulationTimerState>;
} {
  const due: SimulationTimerState[] = [];
  const remaining: SimulationTimerState[] = [];

  for (const timer of currentTimers) {
    if (timer.dueSimulationTime <= currentSimTimeSeconds) {
      due.push(timer);
      if (timer.repeatIntervalSeconds && timer.repeatIntervalSeconds > 0) {
        remaining.push({
          ...timer,
          dueSimulationTime: timer.dueSimulationTime + timer.repeatIntervalSeconds,
        });
      }
    } else {
      remaining.push(timer);
    }
  }

  // Sort due timers deterministically
  due.sort((a, b) => {
    if (a.dueSimulationTime !== b.dueSimulationTime) {
      return a.dueSimulationTime - b.dueSimulationTime;
    }
    if (a.sequence !== b.sequence) {
      return a.sequence - b.sequence;
    }
    return a.id.localeCompare(b.id);
  });

  return {
    dueTimers: due,
    remainingTimers: remaining,
  };
}
