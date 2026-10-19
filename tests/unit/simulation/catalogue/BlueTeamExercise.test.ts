/**
 * Cyberlife — Milestone 11: Blue Team Exercise Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialSimulationState } from '../../../../src/simulation/core/initialState';
import { handleCommand } from '../../../../src/simulation/commands/commandHandler';
import { SimulationState } from '../../../../src/simulation/core/types';

describe('Milestone 11: Blue Team Practical Exercise', () => {
  let state: SimulationState;

  beforeEach(() => {
    state = createInitialSimulationState();
  });

  it('starts the Blue Team SOC triage exercise', () => {
    const res = handleCommand(state, {
      type: 'StartCatalogueExercise',
      exerciseId: 'ex_blue_soc_log_triage',
    });

    expect(res.success).toBe(true);
    expect(res.state.catalogue?.activeExerciseId).toBe('ex_blue_soc_log_triage');
    expect(res.state.catalogue?.activeExercisePhase).toBe('in_progress');
    expect(res.events.some(e => e.type === 'CATALOGUE_EXERCISE_STARTED')).toBe(true);
  });

  it('progresses exercise objectives by submitting actions', () => {
    const current = handleCommand(state, {
      type: 'StartCatalogueExercise',
      exerciseId: 'ex_blue_soc_log_triage',
    }).state;

    const actionRes = handleCommand(current, {
      type: 'SubmitExerciseAction',
      actionType: 'RECORD_OBJECTIVE',
      payload: { objectiveId: 'obj_blue_triage_spike' },
    });

    expect(actionRes.success).toBe(true);
    const exState = actionRes.state.catalogue?.activeExerciseState as Record<string, unknown>;
    expect(exState.completedObjectiveIds).toContain('obj_blue_triage_spike');
  });

  it('completes the exercise and awards idempotent rewards', () => {
    const current = handleCommand(state, {
      type: 'StartCatalogueExercise',
      exerciseId: 'ex_blue_soc_log_triage',
    }).state;

    const initialMoney = current.player.moneyKobo;
    const initialLogXp = current.skills?.log_analysis.totalXp ?? 0;

    // 1. First completion awards money and skill XP
    const compRes1 = handleCommand(current, {
      type: 'CompleteCatalogueExercise',
      exerciseId: 'ex_blue_soc_log_triage',
    });

    expect(compRes1.success).toBe(true);
    expect(compRes1.state.catalogue?.completedExerciseIds).toContain('ex_blue_soc_log_triage');
    expect(compRes1.state.catalogue?.completedEntryIds).toContain('cat_blue_soc_triage');
    expect(compRes1.state.player.moneyKobo).toBe(initialMoney + 75_000); // ₦750.00
    expect(compRes1.state.skills?.log_analysis.totalXp).toBe(initialLogXp + 50);

    // 2. Second completion is idempotent (no duplicate money or XP awarded)
    const compRes2 = handleCommand(compRes1.state, {
      type: 'CompleteCatalogueExercise',
      exerciseId: 'ex_blue_soc_log_triage',
    });

    expect(compRes2.success).toBe(true);
    expect(compRes2.state.player.moneyKobo).toBe(initialMoney + 75_000); // Same!
    expect(compRes2.state.skills?.log_analysis.totalXp).toBe(initialLogXp + 50); // Same!
  });

  it('resets the exercise cleanly without corrupting other state', () => {
    const current = handleCommand(state, {
      type: 'StartCatalogueExercise',
      exerciseId: 'ex_blue_soc_log_triage',
    }).state;

    const resetRes = handleCommand(current, {
      type: 'ResetCatalogueExercise',
      exerciseId: 'ex_blue_soc_log_triage',
    });

    expect(resetRes.success).toBe(true);
    expect(resetRes.state.catalogue?.activeExerciseId).toBeNull();
    expect(resetRes.state.catalogue?.completedExerciseIds).not.toContain('ex_blue_soc_log_triage');
  });
});
