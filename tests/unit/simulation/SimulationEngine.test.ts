import { describe, it, expect, vi } from 'vitest';
import { SimulationEngine, createSimulationEngine } from '@/simulation';

describe('SimulationEngine Class', () => {
  it('initializes with default state when no arguments provided', () => {
    const engine = new SimulationEngine();
    const state = engine.getState();

    expect(state.metadata.schemaVersion).toBe(1);
    expect(state.metadata.revision).toBe(0);
    expect(state.player.id).toBe('player_01');
    expect(engine.subscriberCount).toBe(0);
    expect(engine.isDisposed).toBe(false);
  });

  it('initializes with custom overrides', () => {
    const engine = createSimulationEngine({
      initialOverrides: {
        playerName: 'Agent Adeyemi',
        moneyKobo: 500_000,
      },
    });

    expect(engine.getState().player.name).toBe('Agent Adeyemi');
    expect(engine.getState().player.moneyKobo).toBe(500_000);
  });

  it('dispatches commands and updates authoritative state', () => {
    const engine = new SimulationEngine();
    const result = engine.dispatch({
      type: 'AdvanceSimulationTime',
      deltaSeconds: 1800,
    });

    expect(result.success).toBe(true);
    expect(engine.getState().time.simulationTimeSeconds).toBe(1800);
    expect(engine.getState().metadata.revision).toBe(1);
  });

  it('notifies state subscribers on accepted state-changing commands', () => {
    const engine = new SimulationEngine();
    const listener = vi.fn();

    const unsubscribe = engine.subscribe(listener);
    expect(engine.subscriberCount).toBe(1);

    engine.dispatch({
      type: 'CreditMoney',
      amountKobo: 10_000,
    });

    expect(listener).toHaveBeenCalledTimes(1);
    const [notifiedState, notifiedEvents] = listener.mock.calls[0]!;
    expect(notifiedState.player.moneyKobo).toBe(260_000);
    expect(notifiedEvents).toHaveLength(1);
    expect(notifiedEvents[0]?.type).toBe('PLAYER_MONEY_CHANGED');

    // Unsubscribe
    unsubscribe();
    expect(engine.subscriberCount).toBe(0);

    engine.dispatch({
      type: 'CreditMoney',
      amountKobo: 10_000,
    });
    // Should not have been called again after unsubscribe
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('does not notify subscribers on rejected or no-op commands', () => {
    const engine = new SimulationEngine();
    const listener = vi.fn();
    engine.subscribe(listener);

    // 1. Rejected command
    engine.dispatch({
      type: 'DebitMoney',
      amountKobo: 999_999_999, // Insufficient funds
    });
    expect(listener).not.toHaveBeenCalled();

    // 2. No-op command
    engine.dispatch({
      type: 'AdvanceSimulationTime',
      deltaSeconds: 0,
    });
    expect(listener).not.toHaveBeenCalled();
  });

  it('supports event-specific subscription with engine.on()', () => {
    const engine = new SimulationEngine();
    const flagListener = vi.fn();
    const moneyListener = vi.fn();

    const unsubFlag = engine.on('WORLD_FLAG_CHANGED', flagListener);
    const unsubMoney = engine.on('PLAYER_MONEY_CHANGED', moneyListener);

    engine.dispatch({
      type: 'SetWorldFlag',
      key: 'test_flag',
      value: 'active',
    });

    expect(flagListener).toHaveBeenCalledTimes(1);
    expect(moneyListener).not.toHaveBeenCalled();

    engine.dispatch({
      type: 'CreditMoney',
      amountKobo: 5_000,
    });

    expect(moneyListener).toHaveBeenCalledTimes(1);

    // Clean unbinding
    unsubFlag();
    unsubMoney();

    engine.dispatch({
      type: 'SetWorldFlag',
      key: 'test_flag',
      value: 'inactive',
    });
    expect(flagListener).toHaveBeenCalledTimes(1);
  });

  it('isolates listener errors so failing subscribers do not corrupt committed state or crash other subscribers', () => {
    const errorLog: string[] = [];
    const engine = new SimulationEngine({
      onListenerError: (err, ctx) => {
        errorLog.push(`${ctx.listenerType}: ${err.message}`);
      },
    });

    const failingListener = vi.fn(() => {
      throw new Error('Subscriber exploded in UI component');
    });
    const healthyListener = vi.fn();

    engine.subscribe(failingListener);
    engine.subscribe(healthyListener);

    // Dispatch command
    const res = engine.dispatch({
      type: 'ChangePlayerAttribute',
      attribute: 'energy',
      delta: -10,
    });

    // The command succeeded and committed
    expect(res.success).toBe(true);
    expect(engine.getState().player.energy).toBe(90);

    // Both listeners were invoked; healthy listener received the state
    expect(failingListener).toHaveBeenCalled();
    expect(healthyListener).toHaveBeenCalled();

    // Error was reported to error handler without crashing
    expect(errorLog).toHaveLength(1);
    expect(errorLog[0]).toContain('Subscriber exploded in UI component');
  });

  it('preserves immutable snapshots across sequential commands', () => {
    const engine = new SimulationEngine();
    const snap0 = engine.getState();

    engine.dispatch({
      type: 'CreditMoney',
      amountKobo: 50_000,
    });
    const snap1 = engine.getState();

    engine.dispatch({
      type: 'AdvanceSimulationTime',
      deltaSeconds: 7200,
    });
    const snap2 = engine.getState();

    expect(snap0.metadata.revision).toBe(0);
    expect(snap0.player.moneyKobo).toBe(250_000);
    expect(snap0.time.simulationTimeSeconds).toBe(0);

    expect(snap1.metadata.revision).toBe(1);
    expect(snap1.player.moneyKobo).toBe(300_000);
    expect(snap1.time.simulationTimeSeconds).toBe(0);

    expect(snap2.metadata.revision).toBe(2);
    expect(snap2.player.moneyKobo).toBe(300_000);
    expect(snap2.time.simulationTimeSeconds).toBe(7200);
  });

  it('disposes cleanly and rejects subsequent dispatches', () => {
    const engine = new SimulationEngine();
    const listener = vi.fn();
    engine.subscribe(listener);

    engine.dispose();
    expect(engine.isDisposed).toBe(true);
    expect(engine.subscriberCount).toBe(0);

    const res = engine.dispatch({
      type: 'AdvanceSimulationTime',
      deltaSeconds: 100,
    });

    expect(res.success).toBe(false);
    expect(res.message).toContain('disposed');
    expect(listener).not.toHaveBeenCalled();
  });
});
