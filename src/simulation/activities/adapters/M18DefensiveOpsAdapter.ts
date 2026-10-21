/**
 * Cyberlife — Milestone 20: M18 Defensive Operations & Purple Team Adapter
 *
 * Bridges alert triage, Sigma rule tuning, and Purple Team adversary emulation.
 */

import type { SimulationState } from '../../core/types';
import type { ActivityRuntimeState } from '../types';

export class M18DefensiveOpsAdapter {
  public static syncDefensiveActivity(
    state: SimulationState,
    activity: ActivityRuntimeState
  ): ActivityRuntimeState {
    const def = state.defensiveOps;
    const cat = state.catalogue;

    const objectives = activity.objectives.map(obj => {
      if (obj.isCompleted) return obj;
      if (obj.id === 'obj_triage_alerts') {
        const triaged =
          (def?.alerts.some(a => a.triageStatus === 'RESOLVED' || a.triageStatus === 'FALSE_POSITIVE') ?? false) ||
          state.flags['balogun_defense_verified'] === true;
        if (triaged) return { ...obj, isCompleted: true };
      }
      if (obj.id === 'obj_tune_detection_rule') {
        const tuned =
          (def?.rules.some(r => r.isEnabled) ?? false) ||
          (cat?.detectionRules.some(r => r.isTuned) ?? false) ||
          state.flags['rule_tuned'] === true;
        if (tuned) return { ...obj, isCompleted: true };
      }
      if (obj.id === 'obj_purple_run_scenario') {
        const hasRun =
          (def && Object.keys(def.purpleEmulationResults).length > 0) ||
          (cat?.purpleRunHistory.length ?? 0) > 0 ||
          (def?.executedResponses.length ?? 0) > 0;
        if (hasRun) return { ...obj, isCompleted: true };
      }
      if (obj.id === 'obj_purple_verify_detection') {
        const detected =
          (def && Object.values(def.purpleEmulationResults).some(r => r.status === 'DETECTED' || r.executedAtSimTime !== undefined)) ||
          (cat?.purpleRunHistory.some(r => r.detected) ?? false) ||
          state.flags['purple_emulation_certified'] === true;
        if (detected) return { ...obj, isCompleted: true };
      }
      return obj;
    });

    const isAllDone = objectives.every(o => o.isCompleted);
    return {
      ...activity,
      objectives,
      status: isAllDone ? 'COMPLETED' : activity.status,
      progressPercentage: isAllDone ? 100 : Math.round((objectives.filter(o => o.isCompleted).length / objectives.length) * 100),
    };
  }
}
