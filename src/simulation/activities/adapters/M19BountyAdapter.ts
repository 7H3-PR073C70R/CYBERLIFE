/**
 * Cyberlife — Milestone 20: M19 Bug Bounty Hunting & Contracts Adapter
 *
 * Bridges the Eko Bounty Network marketplace, active contracts, and client debriefs.
 */

import type { SimulationState } from '../../core/types';
import type { ActivityRuntimeState } from '../types';

export class M19BountyAdapter {
  public static syncBountyActivity(
    state: SimulationState,
    activity: ActivityRuntimeState
  ): ActivityRuntimeState {
    const hub = state.bountyHub;
    if (!hub) return activity;

    const objectives = activity.objectives.map(obj => {
      if (obj.isCompleted) return obj;
      if (obj.id === 'obj_bounty_accept_contract' && hub.activeContract !== undefined) {
        return { ...obj, isCompleted: true };
      }
      if (obj.id === 'obj_bounty_run_tool' && (hub.activeContract?.auditEvents?.length ?? 0) > 0) {
        return { ...obj, isCompleted: true };
      }
      if (obj.id === 'obj_bounty_submit_findings') {
        const submitted =
          hub.activeContract?.submittedReportSnapshot !== undefined ||
          hub.activeContract?.status === 'SUBMITTED' ||
          hub.activeContract?.status === 'UNDER_REVIEW' ||
          hub.activeContract?.status === 'APPROVED' ||
          state.flags['bounty_atm_completed'] === true;
        if (submitted) return { ...obj, isCompleted: true };
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
