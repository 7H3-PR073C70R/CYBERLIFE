import { describe, it, expect } from 'vitest';
import {
  createInitialSimulationState,
  validateSimulationState,
  deepFreeze,
  deepClone,
  SimulationState,
} from '@/simulation';
import { InvariantViolationError } from '@/domain/errors/DomainError';

describe('Initial Simulation State & Invariants', () => {
  it('creates default initial state conforming to documented specifications', () => {
    const state = createInitialSimulationState();

    expect(state.metadata.schemaVersion).toBe(1);
    expect(state.metadata.revision).toBe(0);
    expect(state.metadata.scenarioId).toBe('lagos_island_intro');
    expect(state.time.simulationTimeSeconds).toBe(0);
    expect(state.time.calendar.timeString).toBe('08:00 AM');
    expect(state.time.calendar.dayOfWeek).toBe('Monday');

    expect(state.player.id).toBe('player_01');
    expect(state.player.name).toBe('Protector');
    expect(state.player.health).toBe(100);
    expect(state.player.energy).toBe(100);
    expect(state.player.moneyKobo).toBe(250_000); // ₦2,500.00
    expect(state.player.locationId).toBe('neighborhood');

    expect(state.inventory.slots).toHaveLength(2);
    expect(state.inventory.slots[0]?.itemId).toBe('item_access_badge');
    expect(state.inventory.slots[1]?.itemId).toBe('item_cedarline_notebook');

    expect(state.flags['apartment_door_unlocked']).toBe(true);
    expect(state.flags['has_read_community_noticeboard']).toBe(false);

    expect(state.timers).toHaveLength(0);
    expect(state.nextTimerSequence).toBe(0);
  });

  it('validates a clean initial state without errors', () => {
    const state = createInitialSimulationState();
    expect(() => validateSimulationState(state)).not.toThrow();
  });

  it('is frozen and protected against direct mutation', () => {
    const state = createInitialSimulationState();
    expect(Object.isFrozen(state)).toBe(true);
    expect(Object.isFrozen(state.player)).toBe(true);
    expect(Object.isFrozen(state.inventory.slots)).toBe(true);

    expect(() => {
      // @ts-expect-error Attempting mutation on frozen object
      state.player.health = 50;
    }).toThrow();
  });

  it('independent state calls produce distinct immutable objects', () => {
    const s1 = createInitialSimulationState();
    const s2 = createInitialSimulationState();

    expect(s1).not.toBe(s2);
    expect(s1.player).not.toBe(s2.player);
    expect(s1).toEqual(s2);
  });

  it('allows custom overrides when creating initial state', () => {
    const state = createInitialSimulationState({
      playerId: 'test_investigator',
      health: 80,
      moneyKobo: 100_000,
      locationId: 'apartment_interior',
    });

    expect(state.player.id).toBe('test_investigator');
    expect(state.player.health).toBe(80);
    expect(state.player.moneyKobo).toBe(100_000);
    expect(state.player.locationId).toBe('apartment_interior');
  });

  it('rejects invalid metadata in invariant validation', () => {
    const base = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    base.metadata.schemaVersion = 0;
    expect(() => validateSimulationState(base)).toThrow(InvariantViolationError);

    const base2 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    base2.metadata.revision = -1;
    expect(() => validateSimulationState(base2)).toThrow(InvariantViolationError);
  });

  it('rejects out of bounds player attributes in invariant validation', () => {
    const base = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    base.player.health = 105;
    expect(() => validateSimulationState(base)).toThrow(InvariantViolationError);

    const base2 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    base2.player.energy = -5;
    expect(() => validateSimulationState(base2)).toThrow(InvariantViolationError);

    const base3 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    base3.player.moneyKobo = -100;
    expect(() => validateSimulationState(base3)).toThrow(InvariantViolationError);
  });

  it('rejects duplicate or invalid inventory slots in invariant validation', () => {
    const base = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    base.inventory.slots = [
      { itemId: 'item_coffee', quantity: 2 },
      { itemId: 'item_coffee', quantity: 1 },
    ];
    expect(() => validateSimulationState(base)).toThrow(InvariantViolationError);
    expect(() => validateSimulationState(base)).toThrow(/Duplicate item slot/i);

    const base2 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    base2.inventory.slots = [{ itemId: 'item_coffee', quantity: 0 }];
    expect(() => validateSimulationState(base2)).toThrow(InvariantViolationError);
  });

  it('rejects duplicate or invalid timers in invariant validation', () => {
    const base = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    base.timers = [
      { id: 't1', label: 'T1', dueSimulationTime: 10, durationSeconds: 10, sequence: 0 },
      { id: 't1', label: 'T2', dueSimulationTime: 20, durationSeconds: 20, sequence: 1 },
    ];
    expect(() => validateSimulationState(base)).toThrow(InvariantViolationError);
    expect(() => validateSimulationState(base)).toThrow(/Duplicate timer/i);

    const base2 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    base2.timers = [
      { id: '', label: 'Bad', dueSimulationTime: 10, durationSeconds: 10, sequence: 0 },
    ];
    expect(() => validateSimulationState(base2)).toThrow(InvariantViolationError);

    const base3 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    base3.timers = [
      { id: 't1', label: 'Bad', dueSimulationTime: -5, durationSeconds: 10, sequence: 0 },
    ];
    expect(() => validateSimulationState(base3)).toThrow(InvariantViolationError);

    const base4 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    base4.timers = [
      { id: 't1', label: 'Bad', dueSimulationTime: 10, durationSeconds: 10, sequence: -1 },
    ];
    expect(() => validateSimulationState(base4)).toThrow(InvariantViolationError);
  });

  it('rejects missing or corrupted state components in invariant validation', () => {
    // @ts-expect-error Intentionally null
    expect(() => validateSimulationState(null)).toThrow(InvariantViolationError);

    const b1 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally deleted
    delete b1.metadata;
    expect(() => validateSimulationState(b1)).toThrow(/metadata is missing/i);

    const b2 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    b2.metadata.scenarioId = '';
    expect(() => validateSimulationState(b2)).toThrow(/Scenario ID/i);

    const b3 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally deleted
    delete b3.time;
    expect(() => validateSimulationState(b3)).toThrow(/time is missing/i);

    const b4 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    b4.time.simulationTimeSeconds = -10;
    expect(() => validateSimulationState(b4)).toThrow(/simulationTimeSeconds/i);

    const b5 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    b5.time.calendar = null;
    expect(() => validateSimulationState(b5)).toThrow(/calendar time/i);

    const b6 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally deleted
    delete b6.player;
    expect(() => validateSimulationState(b6)).toThrow(/Player attributes are missing/i);

    const b7 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    b7.player.id = '';
    expect(() => validateSimulationState(b7)).toThrow(/Player ID/i);

    const b8 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    b8.player.locationId = '';
    expect(() => validateSimulationState(b8)).toThrow(/locationId/i);

    const b9 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally deleted
    delete b9.inventory;
    expect(() => validateSimulationState(b9)).toThrow(/inventory is missing/i);

    const b10 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    b10.inventory.slots = [{ itemId: '', quantity: 1 }];
    expect(() => validateSimulationState(b10)).toThrow(/missing or invalid itemId/i);

    const b11 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally deleted
    delete b11.flags;
    expect(() => validateSimulationState(b11)).toThrow(/World flags must be an object/i);

    const b12 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally deleted
    delete b12.timers;
    expect(() => validateSimulationState(b12)).toThrow(/timers must be an array/i);

    const b13 = deepClone(createInitialSimulationState()) as SimulationState;
    // @ts-expect-error Intentionally invalid
    b13.nextTimerSequence = -1;
    expect(() => validateSimulationState(b13)).toThrow(/nextTimerSequence/i);
  });

  it('deepFreeze recursively protects nested structures', () => {
    const obj = {
      nested: {
        deeper: { value: 42 },
        list: [1, 2, 3],
      },
    };
    deepFreeze(obj);
    expect(Object.isFrozen(obj.nested)).toBe(true);
    expect(Object.isFrozen(obj.nested.deeper)).toBe(true);
    expect(Object.isFrozen(obj.nested.list)).toBe(true);
  });
});
