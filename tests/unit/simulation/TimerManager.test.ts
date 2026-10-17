import { describe, it, expect } from 'vitest';
import { scheduleTimer, cancelTimer, processDueTimers, SimulationTimerState } from '@/simulation';
import { ValidationError, InvalidArgumentError } from '@/domain/errors/DomainError';

describe('Timer Manager', () => {
  it('schedules a one-shot timer with calculated due time', () => {
    const currentTimers: SimulationTimerState[] = [];
    const { timers, nextSequence } = scheduleTimer(currentTimers, 100, 0, {
      id: 'timer_test',
      durationSeconds: 30,
      label: 'Test Reminder',
    });

    expect(timers).toHaveLength(1);
    expect(timers[0]?.id).toBe('timer_test');
    expect(timers[0]?.dueSimulationTime).toBe(130);
    expect(timers[0]?.sequence).toBe(0);
    expect(nextSequence).toBe(1);
  });

  it('rejects duplicate timer IDs', () => {
    const currentTimers: SimulationTimerState[] = [
      {
        id: 'timer_existing',
        label: 'Existing',
        dueSimulationTime: 50,
        durationSeconds: 50,
        sequence: 0,
      },
    ];

    expect(() =>
      scheduleTimer(currentTimers, 0, 1, {
        id: 'timer_existing',
        durationSeconds: 10,
        label: 'Duplicate',
      })
    ).toThrow(ValidationError);
  });

  it('rejects invalid or non-positive durations', () => {
    expect(() =>
      scheduleTimer([], 0, 0, {
        id: 'timer_bad',
        durationSeconds: 0,
        label: 'Zero duration',
      })
    ).toThrow(InvalidArgumentError);

    expect(() =>
      scheduleTimer([], 0, 0, {
        id: 'timer_bad',
        durationSeconds: -10,
        label: 'Negative duration',
      })
    ).toThrow(InvalidArgumentError);
  });

  it('cancels an existing timer by ID', () => {
    const currentTimers: SimulationTimerState[] = [
      { id: 't1', label: 'T1', dueSimulationTime: 50, durationSeconds: 50, sequence: 0 },
      { id: 't2', label: 'T2', dueSimulationTime: 60, durationSeconds: 60, sequence: 1 },
    ];

    const updated = cancelTimer(currentTimers, 't1');
    expect(updated).toHaveLength(1);
    expect(updated[0]?.id).toBe('t2');
  });

  it('throws ValidationError when attempting to cancel a nonexistent timer', () => {
    expect(() => cancelTimer([], 't_unknown')).toThrow(ValidationError);
  });

  it('processes due timers deterministically', () => {
    const currentTimers: SimulationTimerState[] = [
      { id: 't_late', label: 'Late', dueSimulationTime: 80, durationSeconds: 80, sequence: 2 },
      {
        id: 't_early_b',
        label: 'Early B',
        dueSimulationTime: 30,
        durationSeconds: 30,
        sequence: 1,
      },
      {
        id: 't_early_a',
        label: 'Early A',
        dueSimulationTime: 30,
        durationSeconds: 30,
        sequence: 0,
      },
      {
        id: 't_future',
        label: 'Future',
        dueSimulationTime: 120,
        durationSeconds: 120,
        sequence: 3,
      },
    ];

    const { dueTimers, remainingTimers } = processDueTimers(currentTimers, 80);

    expect(dueTimers).toHaveLength(3);
    // Ordered by dueSimulationTime asc, then sequence asc
    expect(dueTimers[0]?.id).toBe('t_early_a');
    expect(dueTimers[1]?.id).toBe('t_early_b');
    expect(dueTimers[2]?.id).toBe('t_late');

    expect(remainingTimers).toHaveLength(1);
    expect(remainingTimers[0]?.id).toBe('t_future');
  });

  it('reschedules repeating timers for the next cycle', () => {
    const currentTimers: SimulationTimerState[] = [
      {
        id: 't_repeat',
        label: 'Repeat Alert',
        dueSimulationTime: 40,
        durationSeconds: 40,
        sequence: 0,
        repeatIntervalSeconds: 60,
      },
    ];

    const { dueTimers, remainingTimers } = processDueTimers(currentTimers, 45);

    expect(dueTimers).toHaveLength(1);
    expect(dueTimers[0]?.id).toBe('t_repeat');

    expect(remainingTimers).toHaveLength(1);
    expect(remainingTimers[0]?.id).toBe('t_repeat');
    expect(remainingTimers[0]?.dueSimulationTime).toBe(100); // 40 + 60
  });

  it('handles advancing across multiple timer deadlines simultaneously', () => {
    const currentTimers: SimulationTimerState[] = [
      { id: 't1', label: 'T1', dueSimulationTime: 10, durationSeconds: 10, sequence: 0 },
      { id: 't2', label: 'T2', dueSimulationTime: 20, durationSeconds: 20, sequence: 1 },
      { id: 't3', label: 'T3', dueSimulationTime: 30, durationSeconds: 30, sequence: 2 },
    ];

    // Advance directly to 50
    const { dueTimers, remainingTimers } = processDueTimers(currentTimers, 50);

    expect(dueTimers).toHaveLength(3);
    expect(dueTimers.map(t => t.id)).toEqual(['t1', 't2', 't3']);
    expect(remainingTimers).toHaveLength(0);
  });
});
