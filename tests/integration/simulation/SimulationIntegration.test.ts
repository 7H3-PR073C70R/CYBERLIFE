import { describe, it, expect } from 'vitest';
import { createSimulationEngine, SimulationEvent, Money } from '@/simulation';

describe('Simulation Engine End-to-End Integration Flow', () => {
  it('executes a complete multi-step gameplay scenario with authoritative state, events, and timers', () => {
    const engine = createSimulationEngine();
    const eventLog: SimulationEvent[] = [];

    // Subscribe to all state updates and record events
    engine.subscribe((_state, events) => {
      eventLog.push(...events);
    });

    // 1. Initial State Assertions
    const initial = engine.getState();
    expect(initial.metadata.revision).toBe(0);
    expect(initial.player.locationId).toBe('neighborhood');
    expect(initial.player.moneyKobo).toBe(250_000); // ₦2,500.00
    expect(initial.player.energy).toBe(100);
    expect(initial.time.calendar.timeString).toBe('08:00 AM');

    // 2. Player moves to Cedarline Marina HQ
    const moveRes = engine.dispatch({
      type: 'SetLogicalPlayerLocation',
      locationId: 'cedarline_interior',
    });
    expect(moveRes.success).toBe(true);
    expect(engine.getState().player.locationId).toBe('cedarline_interior');
    expect(engine.getState().metadata.revision).toBe(1);

    // 3. Player expends energy doing morning prep
    const energyRes = engine.dispatch({
      type: 'ChangePlayerAttribute',
      attribute: 'energy',
      delta: -40,
    });
    expect(energyRes.success).toBe(true);
    expect(engine.getState().player.energy).toBe(60);
    expect(engine.getState().metadata.revision).toBe(2);

    // 4. Player buys a hot coffee from street vendor: Debit ₦300.00 (30,000 kobo), Add item_coffee x1
    const debitRes = engine.dispatch({
      type: 'DebitMoney',
      amountKobo: 30_000,
      reason: 'Street coffee purchase',
    });
    expect(debitRes.success).toBe(true);
    expect(engine.getState().player.moneyKobo).toBe(220_000); // 250k - 30k
    expect(engine.getState().metadata.revision).toBe(3);

    const addItemRes = engine.dispatch({
      type: 'AddInventoryItem',
      itemId: 'item_coffee',
      quantity: 1,
    });
    expect(addItemRes.success).toBe(true);
    expect(engine.getState().inventory.slots).toHaveLength(3); // badge, notebook, coffee
    expect(engine.getState().metadata.revision).toBe(4);

    // 5. Player schedules a reminder timer for Marcus meeting at 08:30 AM (in 30 mins = 1800s)
    const scheduleRes = engine.dispatch({
      type: 'ScheduleTimer',
      id: 'timer_marcus_briefing',
      durationSeconds: 1800,
      label: 'Marcus Sysadmin Briefing',
      payload: { contact: 'marcus.vance@cedarline.internal' },
    });
    expect(scheduleRes.success).toBe(true);
    expect(engine.getState().timers).toHaveLength(1);
    expect(engine.getState().timers[0]?.dueSimulationTime).toBe(1800);
    expect(engine.getState().metadata.revision).toBe(5);

    // 6. Player drinks coffee: remove coffee from inventory, restore energy (+30)
    const consumeRes = engine.dispatch({
      type: 'RemoveInventoryItem',
      itemId: 'item_coffee',
      quantity: 1,
    });
    expect(consumeRes.success).toBe(true);
    expect(engine.getState().inventory.slots).toHaveLength(2); // coffee slot removed
    expect(engine.getState().metadata.revision).toBe(6);

    const restoreRes = engine.dispatch({
      type: 'ChangePlayerAttribute',
      attribute: 'energy',
      delta: 30,
    });
    expect(restoreRes.success).toBe(true);
    expect(engine.getState().player.energy).toBe(90);
    expect(engine.getState().metadata.revision).toBe(7);

    // 7. Player reads Tinubu Square bulletin board
    const flagRes = engine.dispatch({
      type: 'SetWorldFlag',
      key: 'has_read_community_noticeboard',
      value: true,
    });
    expect(flagRes.success).toBe(true);
    expect(engine.getState().flags['has_read_community_noticeboard']).toBe(true);
    expect(engine.getState().metadata.revision).toBe(8);

    // 8. In-game time advances past the 30-minute timer deadline (advance 2100 seconds = 35 mins)
    const advanceRes = engine.dispatch({
      type: 'AdvanceSimulationTime',
      deltaSeconds: 2100,
    });
    expect(advanceRes.success).toBe(true);
    expect(engine.getState().time.simulationTimeSeconds).toBe(2100);
    expect(engine.getState().time.calendar.timeString).toBe('08:35 AM');
    expect(engine.getState().timers).toHaveLength(0); // Meeting timer fired and completed
    expect(engine.getState().metadata.revision).toBe(9);

    // Verify timer trigger event was captured in the advance result
    const timerTriggerEvent = advanceRes.events.find(e => e.type === 'SIMULATION_TIMER_TRIGGERED');
    expect(timerTriggerEvent).toBeDefined();
    expect(timerTriggerEvent?.payload).toMatchObject({
      timerId: 'timer_marcus_briefing',
      label: 'Marcus Sysadmin Briefing',
      dueSimulationTime: 1800,
    });

    // 9. Inspect the complete deterministic event log
    expect(eventLog).toHaveLength(10); // 1 move + 1 energy + 1 debit + 1 add item + 1 schedule + 1 remove item + 1 energy + 1 flag + 1 advance (which emits advance + timerTrigger = 2) = 10 events
    expect(eventLog.map(e => e.type)).toEqual([
      'LOGICAL_PLAYER_LOCATION_CHANGED',
      'PLAYER_ATTRIBUTE_CHANGED',
      'PLAYER_MONEY_CHANGED',
      'INVENTORY_ITEM_ADDED',
      'SIMULATION_TIMER_SCHEDULED',
      'INVENTORY_ITEM_REMOVED',
      'PLAYER_ATTRIBUTE_CHANGED',
      'WORLD_FLAG_CHANGED',
      'SIMULATION_TIME_ADVANCED',
      'SIMULATION_TIMER_TRIGGERED',
    ]);

    // 10. Final State Consistency Check
    const finalState = engine.getState();
    expect(finalState.metadata.revision).toBe(9);
    expect(finalState.player.energy).toBe(90);
    expect(finalState.player.moneyKobo).toBe(220_000);
    expect(Money.fromKobo(finalState.player.moneyKobo).format()).toContain('2,200.00');
    expect(finalState.player.locationId).toBe('cedarline_interior');
    expect(finalState.flags['has_read_community_noticeboard']).toBe(true);
  });
});
