import { describe, it, expect } from 'vitest';
import { createInitialSimulationState, handleCommand } from '@/simulation';

describe('Authoritative Command Handler', () => {
  const getInitial = () => createInitialSimulationState();

  describe('AdvanceSimulationTime', () => {
    it('advances simulation time and produces SIMULATION_TIME_ADVANCED event', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'AdvanceSimulationTime',
        deltaSeconds: 3600, // 1 hour
      });

      expect(result.success).toBe(true);
      expect(result.state.time.simulationTimeSeconds).toBe(3600);
      expect(result.state.time.calendar.timeString).toBe('09:00 AM');
      expect(result.state.metadata.revision).toBe(1);

      expect(result.events).toHaveLength(1);
      expect(result.events[0]?.type).toBe('SIMULATION_TIME_ADVANCED');
      expect(result.events[0]?.payload).toMatchObject({
        deltaSeconds: 3600,
        totalSimulationSeconds: 3600,
      });
    });

    it('handles 0 second delta as accepted no-op without advancing revision or emitting events', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'AdvanceSimulationTime',
        deltaSeconds: 0,
      });

      expect(result.success).toBe(true);
      expect(result.isNoOp).toBe(true);
      expect(result.state.metadata.revision).toBe(0);
      expect(result.events).toHaveLength(0);
      expect(result.state).toBe(state);
    });

    it('rejects negative deltaSeconds with INVALID_TIME_DELTA without mutating state', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'AdvanceSimulationTime',
        deltaSeconds: -60,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_TIME_DELTA');
      expect(result.events).toHaveLength(0);
      expect(result.state).toBe(state);
    });
  });

  describe('ChangePlayerAttribute & SetPlayerAttribute', () => {
    it('applies attribute change and emits PLAYER_ATTRIBUTE_CHANGED', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'ChangePlayerAttribute',
        attribute: 'energy',
        delta: -25,
      });

      expect(result.success).toBe(true);
      expect(result.state.player.energy).toBe(75);
      expect(result.state.metadata.revision).toBe(1);

      expect(result.events).toHaveLength(1);
      expect(result.events[0]?.type).toBe('PLAYER_ATTRIBUTE_CHANGED');
      expect(result.events[0]?.payload).toMatchObject({
        attribute: 'energy',
        previousValue: 100,
        newValue: 75,
        delta: -25,
      });
    });

    it('handles boundary clamping no-op cleanly', () => {
      const state = getInitial(); // Health is already 100
      const result = handleCommand(state, {
        type: 'ChangePlayerAttribute',
        attribute: 'health',
        delta: 20,
      });

      expect(result.success).toBe(true);
      expect(result.isNoOp).toBe(true);
      expect(result.state.metadata.revision).toBe(0);
      expect(result.events).toHaveLength(0);
    });

    it('sets attribute to exact value with SetPlayerAttribute', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'SetPlayerAttribute',
        attribute: 'health',
        value: 60,
      });

      expect(result.success).toBe(true);
      expect(result.state.player.health).toBe(60);
      expect(result.state.metadata.revision).toBe(1);
      expect(result.events[0]?.type).toBe('PLAYER_ATTRIBUTE_CHANGED');
    });

    it('rejects out of bounds value with ATTRIBUTE_OUT_OF_BOUNDS', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'SetPlayerAttribute',
        attribute: 'energy',
        value: 150,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('ATTRIBUTE_OUT_OF_BOUNDS');
      expect(result.state).toBe(state);
    });

    it('treats setting to identical value as no-op', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'SetPlayerAttribute',
        attribute: 'health',
        value: 100,
      });

      expect(result.success).toBe(true);
      expect(result.isNoOp).toBe(true);
      expect(result.state.metadata.revision).toBe(0);
      expect(result.events).toHaveLength(0);
    });
  });

  describe('CreditMoney & DebitMoney', () => {
    it('credits money in kobo and emits PLAYER_MONEY_CHANGED', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'CreditMoney',
        amountKobo: 50_000, // +₦500.00
        reason: 'Consultancy bounty',
      });

      expect(result.success).toBe(true);
      expect(result.state.player.moneyKobo).toBe(300_000); // 250k + 50k
      expect(result.state.metadata.revision).toBe(1);

      expect(result.events[0]?.type).toBe('PLAYER_MONEY_CHANGED');
      expect(result.events[0]?.payload).toMatchObject({
        previousKobo: 250_000,
        newKobo: 300_000,
        deltaKobo: 50_000,
        operation: 'CREDIT',
        reason: 'Consultancy bounty',
      });
    });

    it('debits money in kobo and emits PLAYER_MONEY_CHANGED', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'DebitMoney',
        amountKobo: 50_000, // -₦500.00
        reason: 'Transit fare',
      });

      expect(result.success).toBe(true);
      expect(result.state.player.moneyKobo).toBe(200_000);
      expect(result.state.metadata.revision).toBe(1);

      expect(result.events[0]?.payload).toMatchObject({
        previousKobo: 250_000,
        newKobo: 200_000,
        deltaKobo: -50_000,
        operation: 'DEBIT',
        reason: 'Transit fare',
      });
    });

    it('rejects debit when balance is insufficient with INSUFFICIENT_FUNDS', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'DebitMoney',
        amountKobo: 1_000_000, // ₦10,000.00 (exceeds ₦2,500.00)
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INSUFFICIENT_FUNDS');
      expect(result.message).toContain('Insufficient funds');
      expect(result.state.player.moneyKobo).toBe(250_000);
      expect(result.events).toHaveLength(0);
    });

    it('rejects invalid currency amounts with INVALID_CURRENCY_AMOUNT', () => {
      const state = getInitial();
      const r1 = handleCommand(state, {
        type: 'CreditMoney',
        amountKobo: -100,
      });
      expect(r1.success).toBe(false);
      expect(r1.errorCode).toBe('INVALID_CURRENCY_AMOUNT');

      const r2 = handleCommand(state, {
        type: 'DebitMoney',
        amountKobo: 0,
      });
      expect(r2.success).toBe(false);
      expect(r2.errorCode).toBe('INVALID_CURRENCY_AMOUNT');
    });
  });

  describe('AddInventoryItem & RemoveInventoryItem', () => {
    it('adds item to inventory and emits INVENTORY_ITEM_ADDED', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'AddInventoryItem',
        itemId: 'item_coffee',
        quantity: 2,
      });

      expect(result.success).toBe(true);
      expect(result.state.inventory.slots).toHaveLength(3);
      expect(result.state.metadata.revision).toBe(1);

      expect(result.events[0]?.type).toBe('INVENTORY_ITEM_ADDED');
      expect(result.events[0]?.payload).toMatchObject({
        itemId: 'item_coffee',
        quantityAdded: 2,
        totalQuantity: 2,
      });
    });

    it('stacks with existing inventory item', () => {
      const state = getInitial(); // has 1x item_access_badge
      const result = handleCommand(state, {
        type: 'AddInventoryItem',
        itemId: 'item_access_badge',
        quantity: 1,
      });

      expect(result.success).toBe(true);
      expect(result.state.inventory.slots).toHaveLength(2); // no new slot, stacked
      expect(result.events[0]?.payload).toMatchObject({
        itemId: 'item_access_badge',
        quantityAdded: 1,
        totalQuantity: 2,
      });
    });

    it('removes item from inventory and emits INVENTORY_ITEM_REMOVED', () => {
      const state = getInitial(); // has 1x item_access_badge
      const result = handleCommand(state, {
        type: 'RemoveInventoryItem',
        itemId: 'item_access_badge',
        quantity: 1,
      });

      expect(result.success).toBe(true);
      expect(result.state.inventory.slots).toHaveLength(1);
      expect(result.events[0]?.type).toBe('INVENTORY_ITEM_REMOVED');
      expect(result.events[0]?.payload).toMatchObject({
        itemId: 'item_access_badge',
        quantityRemoved: 1,
        remainingQuantity: 0,
      });
    });

    it('rejects removal of nonexistent item with ITEM_NOT_FOUND', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'RemoveInventoryItem',
        itemId: 'nonexistent_key',
        quantity: 1,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('ITEM_NOT_FOUND');
      expect(result.state).toBe(state);
      expect(result.events).toHaveLength(0);
    });

    it('rejects removal of more items than available with INSUFFICIENT_ITEM_QUANTITY', () => {
      const state = getInitial(); // has 1x item_access_badge
      const result = handleCommand(state, {
        type: 'RemoveInventoryItem',
        itemId: 'item_access_badge',
        quantity: 5,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INSUFFICIENT_ITEM_QUANTITY');
      expect(result.state).toBe(state);
    });

    it('rejects invalid quantity with INVALID_ITEM_QUANTITY', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'AddInventoryItem',
        itemId: 'item_coffee',
        quantity: -2,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_ITEM_QUANTITY');
    });
  });

  describe('SetWorldFlag', () => {
    it('sets a new world flag and emits WORLD_FLAG_CHANGED', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'SetWorldFlag',
        key: 'visited_balogun_market',
        value: true,
      });

      expect(result.success).toBe(true);
      expect(result.state.flags['visited_balogun_market']).toBe(true);
      expect(result.state.metadata.revision).toBe(1);

      expect(result.events[0]?.type).toBe('WORLD_FLAG_CHANGED');
      expect(result.events[0]?.payload).toMatchObject({
        key: 'visited_balogun_market',
        previousValue: undefined,
        newValue: true,
      });
    });

    it('handles setting flag to existing value as accepted no-op', () => {
      const state = getInitial(); // apartment_door_unlocked is true
      const result = handleCommand(state, {
        type: 'SetWorldFlag',
        key: 'apartment_door_unlocked',
        value: true,
      });

      expect(result.success).toBe(true);
      expect(result.isNoOp).toBe(true);
      expect(result.state.metadata.revision).toBe(0);
      expect(result.events).toHaveLength(0);
      expect(result.state).toBe(state);
    });

    it('rejects invalid flag key with INVALID_FLAG_KEY', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'SetWorldFlag',
        key: '!',
        value: true,
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_FLAG_KEY');
      expect(result.state).toBe(state);
    });
  });

  describe('SetLogicalPlayerLocation', () => {
    it('updates player logical location and emits LOGICAL_PLAYER_LOCATION_CHANGED', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'SetLogicalPlayerLocation',
        locationId: 'cedarline_interior',
      });

      expect(result.success).toBe(true);
      expect(result.state.player.locationId).toBe('cedarline_interior');
      expect(result.state.metadata.revision).toBe(1);

      expect(result.events[0]?.type).toBe('LOGICAL_PLAYER_LOCATION_CHANGED');
      expect(result.events[0]?.payload).toMatchObject({
        previousLocationId: 'neighborhood',
        newLocationId: 'cedarline_interior',
      });
    });

    it('handles setting location to current location as no-op', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'SetLogicalPlayerLocation',
        locationId: 'neighborhood',
      });

      expect(result.success).toBe(true);
      expect(result.isNoOp).toBe(true);
      expect(result.state.metadata.revision).toBe(0);
      expect(result.events).toHaveLength(0);
    });

    it('rejects empty location with INVALID_LOCATION', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'SetLogicalPlayerLocation',
        locationId: '',
      });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_LOCATION');
    });
  });

  describe('ScheduleTimer & CancelTimer', () => {
    it('schedules a timer and emits SIMULATION_TIMER_SCHEDULED', () => {
      const state = getInitial();
      const result = handleCommand(state, {
        type: 'ScheduleTimer',
        id: 'timer_alert',
        durationSeconds: 120,
        label: 'Standby Alert',
      });

      expect(result.success).toBe(true);
      expect(result.state.timers).toHaveLength(1);
      expect(result.state.timers[0]?.dueSimulationTime).toBe(120);
      expect(result.state.metadata.revision).toBe(1);

      expect(result.events[0]?.type).toBe('SIMULATION_TIMER_SCHEDULED');
      expect(result.events[0]?.payload).toMatchObject({
        timerId: 'timer_alert',
        dueSimulationTime: 120,
      });
    });

    it('triggers scheduled timer when simulation time advances past its deadline', () => {
      let state = getInitial();
      const scheduleRes = handleCommand(state, {
        type: 'ScheduleTimer',
        id: 't_meeting',
        durationSeconds: 300,
        label: 'Barry Briefing',
      });
      state = scheduleRes.state;

      const advanceRes = handleCommand(state, {
        type: 'AdvanceSimulationTime',
        deltaSeconds: 350,
      });

      expect(advanceRes.success).toBe(true);
      expect(advanceRes.state.timers).toHaveLength(0); // one-shot timer removed

      const triggerEvt = advanceRes.events.find(e => e.type === 'SIMULATION_TIMER_TRIGGERED');
      expect(triggerEvt).toBeDefined();
      expect(triggerEvt?.payload).toMatchObject({
        timerId: 't_meeting',
        dueSimulationTime: 300,
      });
    });

    it('cancels pending timer and emits SIMULATION_TIMER_CANCELLED', () => {
      let state = getInitial();
      state = handleCommand(state, {
        type: 'ScheduleTimer',
        id: 't_cancel_me',
        durationSeconds: 60,
        label: 'Temporary',
      }).state;

      const cancelRes = handleCommand(state, {
        type: 'CancelTimer',
        id: 't_cancel_me',
      });

      expect(cancelRes.success).toBe(true);
      expect(cancelRes.state.timers).toHaveLength(0);
      expect(cancelRes.events[0]?.type).toBe('SIMULATION_TIMER_CANCELLED');
    });

    it('rejects scheduling existing timer ID with TIMER_ALREADY_EXISTS', () => {
      let state = getInitial();
      state = handleCommand(state, {
        type: 'ScheduleTimer',
        id: 't_dup',
        durationSeconds: 60,
        label: 'First',
      }).state;

      const dupRes = handleCommand(state, {
        type: 'ScheduleTimer',
        id: 't_dup',
        durationSeconds: 30,
        label: 'Second',
      });

      expect(dupRes.success).toBe(false);
      expect(dupRes.errorCode).toBe('TIMER_ALREADY_EXISTS');
    });

    it('rejects cancelling non-existent timer with TIMER_NOT_FOUND', () => {
      const state = getInitial();
      const res = handleCommand(state, {
        type: 'CancelTimer',
        id: 'nonexistent_timer',
      });

      expect(res.success).toBe(false);
      expect(res.errorCode).toBe('TIMER_NOT_FOUND');
    });

    it('rejects cancelling with invalid or empty timer ID', () => {
      const state = getInitial();
      const res = handleCommand(state, {
        type: 'CancelTimer',
        id: '',
      });
      expect(res.success).toBe(false);
      expect(res.errorCode).toBe('INVALID_ARGUMENT');
    });

    it('rejects scheduling with invalid duration or repeatInterval', () => {
      const state = getInitial();
      const res1 = handleCommand(state, {
        type: 'ScheduleTimer',
        id: '',
        durationSeconds: 10,
        label: 'Bad',
      });
      expect(res1.errorCode).toBe('INVALID_ARGUMENT');

      const res2 = handleCommand(state, {
        type: 'ScheduleTimer',
        id: 't_bad_dur',
        durationSeconds: 0,
        label: 'Bad',
      });
      expect(res2.errorCode).toBe('INVALID_ARGUMENT');

      const res3 = handleCommand(state, {
        type: 'ScheduleTimer',
        id: 't_bad_repeat',
        durationSeconds: 10,
        label: 'Bad',
        repeatIntervalSeconds: -5,
      });
      expect(res3.errorCode).toBe('INVALID_ARGUMENT');
    });
  });

  describe('Invalid or unsupported commands', () => {
    it('rejects unsupported command types gracefully with INVALID_COMMAND', () => {
      const state = getInitial();
      // @ts-expect-error Unsupported command test
      const result = handleCommand(state, { type: 'UnsupportedRandomAction' });

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_COMMAND');
      expect(result.state).toBe(state);
      expect(result.events).toHaveLength(0);
    });

    it('rejects null or non-object commands with INVALID_COMMAND', () => {
      const state = getInitial();
      // @ts-expect-error Invalid command test
      const result = handleCommand(state, null);

      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('INVALID_COMMAND');
    });

    it('rejects invalid attribute names and non-finite deltas in ChangePlayerAttribute', () => {
      const state = getInitial();
      const r1 = handleCommand(state, {
        type: 'ChangePlayerAttribute',
        attribute: 'mana' as unknown as 'health',
        delta: 5,
      });
      expect(r1.errorCode).toBe('INVALID_ARGUMENT');

      const r2 = handleCommand(state, {
        type: 'ChangePlayerAttribute',
        attribute: 'health',
        delta: NaN,
      });
      expect(r2.errorCode).toBe('INVALID_ARGUMENT');

      const r3 = handleCommand(state, {
        type: 'SetPlayerAttribute',
        attribute: 'stamina' as unknown as 'health',
        value: 50,
      });
      expect(r3.errorCode).toBe('INVALID_ARGUMENT');
    });

    it('rejects empty item IDs in AddInventoryItem and RemoveInventoryItem', () => {
      const state = getInitial();
      const r1 = handleCommand(state, { type: 'AddInventoryItem', itemId: '', quantity: 1 });
      expect(r1.errorCode).toBe('INVALID_ARGUMENT');

      const r2 = handleCommand(state, { type: 'RemoveInventoryItem', itemId: '', quantity: 1 });
      expect(r2.errorCode).toBe('INVALID_ARGUMENT');
    });

    it('rejects non-string keys and invalid values in SetWorldFlag', () => {
      const state = getInitial();
      const r1 = handleCommand(state, {
        type: 'SetWorldFlag',
        key: null as unknown as string,
        value: true,
      });
      expect(r1.errorCode).toBe('INVALID_FLAG_KEY');

      const r2 = handleCommand(state, {
        type: 'SetWorldFlag',
        key: 'valid_key',
        value: { bad: true } as unknown as boolean,
      });
      expect(r2.errorCode).toBe('INVALID_FLAG_VALUE');
    });
  });
});
