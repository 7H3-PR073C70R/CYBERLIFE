/**
 * Cyberlife — Milestone 20: M16 Network Analysis & Investigation Adapter
 *
 * Bridges network packet analysis and threat intelligence findings with activities.
 */

import type { SimulationState } from '../../core/types';
import type { ActivityRuntimeState } from '../types';

export class M16InvestigationAdapter {
  public static syncInvestigationActivity(
    state: SimulationState,
    activity: ActivityRuntimeState
  ): ActivityRuntimeState {
    const net = state.networkInvestigation;
    if (!net) return activity;

    const objectives = activity.objectives.map(obj => {
      if (obj.isCompleted) return obj;
      if (obj.id === 'obj_intel_analyze_pcap' && (net.selectedHostId || net.inspectedEventIds.length > 0 || state.flags['threat_indicator_correlated'])) {
        return { ...obj, isCompleted: true };
      }
      if (obj.id === 'obj_intel_correlate_ioc' && (net.correlatedIndicatorIds.length > 0 || state.flags['broad_street_intel_verified'])) {
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
