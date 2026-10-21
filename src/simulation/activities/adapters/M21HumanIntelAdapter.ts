/**
 * Cyberlife — Milestone 21: Human Intelligence Activity Adapter
 *
 * Syncs M21 activity objectives with the HumanIntelState simulation slice.
 * Called by syncAllActivitiesWithAdapters() in activityCommandHandler.ts.
 */

import type { SimulationState } from '../../core/types';
import type { ActivityRuntimeState } from '../types';
import type { HumanIntelState } from '../../humanIntel/types';

export class M21HumanIntelAdapter {
  public static syncHumanIntelActivity(
    state: SimulationState,
    activity: ActivityRuntimeState
  ): ActivityRuntimeState {
    const hi: HumanIntelState | undefined = (state as SimulationState & { humanIntel?: HumanIntelState }).humanIntel;
    if (!hi) return activity;

    const flags = state.flags;

    let objectives = activity.objectives.map(obj => {
      if (obj.isCompleted) return obj;

      // ── Scenario A: Conflicting Accounts ─────────────────────────────────
      if (activity.definitionId === 'act_m21_conflicting_accounts') {
        // Objective: Interview Tobi (Marcus)
        if (
          obj.id === 'obj_m21a_interview_marcus' &&
          flags['m21_interview_completed_npc_marcus_act_m21_conflicting_accounts']
        ) {
          return { ...obj, isCompleted: true };
        }
        // Objective: Interview Blessing (Amina)
        if (
          obj.id === 'obj_m21a_interview_amina' &&
          flags['m21_interview_completed_npc_amina_act_m21_conflicting_accounts']
        ) {
          return { ...obj, isCompleted: true };
        }
        // Objective: Review badge access log (evidence in vault)
        if (
          obj.id === 'obj_m21a_review_badge_log' &&
          state.narrative?.evidenceVault['ev_phys_badge_log_tuesday']
        ) {
          return { ...obj, isCompleted: true };
        }
        // Objective: Compare testimony vs log
        if (
          obj.id === 'obj_m21a_compare_testimony' &&
          flags['m21_comparison_made_q_a_marcus_whereabouts']
        ) {
          return { ...obj, isCompleted: true };
        }
        // Objective: Submit conclusion
        if (obj.id === 'obj_m21a_submit_conclusion' && flags['m21a_conclusion_submitted']) {
          return { ...obj, isCompleted: true };
        }
      }

      // ── Scenario B: Suspicious Vendor Request ────────────────────────────
      if (activity.definitionId === 'act_m21_vendor_request') {
        // Objective: Evaluate the vendor message indicators
        if (obj.id === 'obj_m21b_review_message' && flags['m21b_decision_made']) {
          return { ...obj, isCompleted: true };
        }
        // Objective: Make a decision (any decision counts for objective; rating drives reward)
        if (obj.id === 'obj_m21b_make_decision' && flags['m21b_decision_made']) {
          return { ...obj, isCompleted: true };
        }
        // Optional: Report to SOC
        if (obj.id === 'obj_m21b_report_soc' && flags['m21b_soc_reported']) {
          return { ...obj, isCompleted: true };
        }
      }

      // ── Scenario C: Visitor Management Audit ─────────────────────────────
      if (activity.definitionId === 'act_m21_facility_audit') {
        // Objective: Inspect at least 3 objects
        if (obj.id === 'obj_m21c_inspect_objects') {
          const obsCount = Object.values(hi.observations).filter(
            o => o.activityId === 'act_m21_facility_audit'
          ).length;
          if (obsCount >= 3) return { ...obj, isCompleted: true };
        }
        // Objective: Raise at least 2 findings
        if (obj.id === 'obj_m21c_raise_findings') {
          const findingCount = Object.values(hi.assessmentFindings).filter(
            f => f.activityId === 'act_m21_facility_audit'
          ).length;
          if (findingCount >= 2) return { ...obj, isCompleted: true };
        }
        // Objective: Submit report
        if (obj.id === 'obj_m21c_submit_report' && flags['m21c_report_submitted']) {
          return { ...obj, isCompleted: true };
        }
      }

      return obj;
    });

    const completedCount = objectives.filter(o => o.isCompleted).length;
    const totalCount = objectives.length;
    const allMandatoryDone = objectives.filter(o => !o.isOptional).every(o => o.isCompleted);
    const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return {
      ...activity,
      objectives,
      progressPercentage: progress,
      status: allMandatoryDone ? 'COMPLETED' : activity.status,
    };
  }
}
