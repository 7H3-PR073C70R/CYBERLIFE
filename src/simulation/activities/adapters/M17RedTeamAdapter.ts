/**
 * Cyberlife — Milestone 20: M17 Red Team Assessment Adapter
 *
 * Bridges authorized penetration testing, RoE compliance, and vulnerability reporting.
 */

import type { SimulationState } from '../../core/types';
import type { ActivityRuntimeState } from '../types';

export class M17RedTeamAdapter {
  public static syncRedTeamActivity(
    state: SimulationState,
    activity: ActivityRuntimeState
  ): ActivityRuntimeState {
    const red = state.redTeamAssessment;
    if (!red) return activity;

    const objectives = activity.objectives.map(obj => {
      if (obj.isCompleted) return obj;
      if (obj.id === 'obj_red_accept_roe' && (red.isAcceptedByPlayer || state.flags['red_team_roe_accepted'])) {
        return { ...obj, isCompleted: true };
      }
      if (obj.id === 'obj_red_validate_vuln' && (red.findings.length > 0 || state.flags['red_finding_recorded'])) {
        return { ...obj, isCompleted: true };
      }
      if (obj.id === 'obj_red_submit_findings' && (red.reportSubmission !== undefined || state.flags['red_balogun_audit_passed'])) {
        return { ...obj, isCompleted: true };
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
