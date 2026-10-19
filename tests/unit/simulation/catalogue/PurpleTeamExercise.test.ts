/**
 * Cyberlife — Milestone 11: Purple Team Detection Engineering & Replay Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialSimulationState } from '../../../../src/simulation/core/initialState';
import { handleCommand } from '../../../../src/simulation/commands/commandHandler';
import { SimulationState } from '../../../../src/simulation/core/types';

describe('Milestone 11: Purple Team Collaborative Detection Loop', () => {
  let state: SimulationState;

  beforeEach(() => {
    state = createInitialSimulationState();
  });

  it('runs baseline scenario and identifies detection gap', () => {
    const current = handleCommand(state, {
      type: 'StartCatalogueExercise',
      exerciseId: 'ex_purple_detection_tuning_replay',
    }).state;

    // Execute initial baseline run
    const baselineRes = handleCommand(current, {
      type: 'RunPurpleScenario',
      runType: 'baseline',
    });

    expect(baselineRes.success).toBe(true);
    const history = baselineRes.state.catalogue?.purpleRunHistory;
    expect(history).toBeDefined();
    expect(history?.length).toBeGreaterThan(0);

    const baselineRun = history![0]!;
    expect(baselineRun.runType).toBe('baseline');
    // Default rule is unconfigured -> gap identified!
    expect(baselineRun.detected).toBe(false);
    expect(baselineRun.detectionGapIdentified).toBe(true);
    expect(baselineRun.timeToDetectSeconds).toBeNull();
  });

  it('tunes SIEM detection rule and replays scenario with measurable improvement', () => {
    let current = handleCommand(state, {
      type: 'StartCatalogueExercise',
      exerciseId: 'ex_purple_detection_tuning_replay',
    }).state;

    // 1. Run baseline
    current = handleCommand(current, {
      type: 'RunPurpleScenario',
      runType: 'baseline',
    }).state;

    // 2. Tune the rule: match file-server on SMB activity
    const tuneRes = handleCommand(current, {
      type: 'TuneDetectionRule',
      ruleId: 'RULE-DET-SMB-LATERAL',
      updates: {
        matchField: 'source',
        operator: 'EQUALS',
        matchValue: 'file-server',
        alertSeverity: 'CRITICAL',
        enabled: true,
      },
    });

    expect(tuneRes.success).toBe(true);
    const tunedRule = tuneRes.state.catalogue?.detectionRules.find(
      r => r.id === 'RULE-DET-SMB-LATERAL'
    );
    expect(tunedRule?.enabled).toBe(true);
    expect(tunedRule?.matchField).toBe('source');
    expect(tunedRule?.matchValue).toBe('file-server');
    expect(tunedRule?.isTuned).toBe(true);

    // 3. Replay scenario with tuned rule
    const replayRes = handleCommand(tuneRes.state, {
      type: 'RunPurpleScenario',
      runType: 'replay',
    });

    expect(replayRes.success).toBe(true);
    const history = replayRes.state.catalogue?.purpleRunHistory;
    expect(history).toHaveLength(2);

    const replayRun = history![0]!;
    expect(replayRun.runType).toBe('replay');
    // Now malicious event is detected!
    expect(replayRun.detected).toBe(true);
    expect(replayRun.detectionGapIdentified).toBe(false);
    expect(replayRun.triggeredRuleId).toBe('RULE-DET-SMB-LATERAL');
    expect(replayRun.timeToDetectSeconds).toBe(42); // Detected at T+42s
    expect(replayRun.falsePositiveCount).toBe(0); // 0 false positives on benign noise
  });

  it('completes the Purple Team exercise idempotently', () => {
    const current = handleCommand(state, {
      type: 'StartCatalogueExercise',
      exerciseId: 'ex_purple_detection_tuning_replay',
    }).state;

    const initialDetXp = current.skills?.detection_engineering.totalXp ?? 0;
    const initialMoney = current.player.moneyKobo;

    const compRes = handleCommand(current, {
      type: 'CompleteCatalogueExercise',
      exerciseId: 'ex_purple_detection_tuning_replay',
    });

    expect(compRes.success).toBe(true);
    expect(compRes.state.catalogue?.completedExerciseIds).toContain(
      'ex_purple_detection_tuning_replay'
    );
    expect(compRes.state.skills?.detection_engineering.totalXp).toBe(initialDetXp + 50);
    expect(compRes.state.player.moneyKobo).toBe(initialMoney + 120_000); // ₦1,200.00
  });
});
