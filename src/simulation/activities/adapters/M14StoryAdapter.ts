/**
 * Cyberlife — Milestone 20: M14 Narrative & Story Arc Adapter
 *
 * Exposes M14 story missions through the shared activity framework.
 */

import type { SimulationState } from '../../core/types';
import type { ActivityRuntimeState } from '../types';

export class M14StoryAdapter {
  public static syncStoryActivity(
    state: SimulationState,
    activity: ActivityRuntimeState
  ): ActivityRuntimeState {
    const mission = state.mission;
    if (!mission) return activity;

    const objectives = activity.objectives.map(obj => {
      if (obj.isCompleted) return obj;
      if (obj.id === 'obj_aster_inspect_logs' && mission.analyzedLogIds.length > 0) {
        return { ...obj, isCompleted: true };
      }
      if (obj.id === 'obj_aster_contain_service' && (mission.isContained || mission.isRemediated)) {
        return { ...obj, isCompleted: true };
      }
      if (obj.id === 'obj_aster_submit_report' && (mission.incidentReport !== undefined || mission.isCompleted)) {
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
