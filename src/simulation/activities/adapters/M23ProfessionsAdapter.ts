/**
 * Cyberlife — Milestone 24: M23 Professions Activity Adapter
 *
 * Synchronizes Digital Forensics, SOC Triage, and Compliance Audit
 * workflow states with the shared M20 Activity Director.
 */

import type { SimulationState } from '../../core/types';
import type { ActivityRuntimeState } from '../types';
import { getForensicsSessionState } from '../../cyber/terminal/forensicsCommand';
import { getSocTriageSessionState } from '../../cyber/terminal/soctriageCommand';
import { getComplianceAuditSessionState } from '../../cyber/terminal/complianceauditCommand';

export class M23ProfessionsAdapter {
  public static syncProfessionsActivity(
    state: SimulationState,
    activity: ActivityRuntimeState
  ): ActivityRuntimeState {
    const flags = state.flags;
    const forensics = getForensicsSessionState();
    const soc = getSocTriageSessionState();
    const audit = getComplianceAuditSessionState();

    const objectives = activity.objectives.map(obj => {
      if (obj.isCompleted) return obj;

      // ── 1. Digital Forensics: act_forensics_marina_breach ──────────────
      if (activity.definitionId === 'act_forensics_marina_breach') {
        if (
          obj.id === 'obj_m23_forensics_hash' &&
          (forensics.hashVerified || flags['m23_forensics_hash_verified'] || flags['m23_forensics_completed'])
        ) {
          return { ...obj, isCompleted: true };
        }
        if (
          obj.id === 'obj_m23_forensics_mft' &&
          (forensics.mftAnalyzed || flags['m23_forensics_mft_analyzed'] || flags['m23_forensics_completed'])
        ) {
          return { ...obj, isCompleted: true };
        }
        if (
          obj.id === 'obj_m23_forensics_report' &&
          (forensics.reportSubmitted || flags['m23_forensics_completed'])
        ) {
          return { ...obj, isCompleted: true };
        }
      }

      // ── 2. SOC Analyst: act_soc_triage_interbank ───────────────────────
      if (activity.definitionId === 'act_soc_triage_interbank') {
        if (
          obj.id === 'obj_m23_soc_queue' &&
          (soc.alerts.some(a => a.verdict) || flags['m23_soctriage_started'] || flags['m23_soctriage_completed'])
        ) {
          return { ...obj, isCompleted: true };
        }
        if (
          obj.id === 'obj_m23_soc_contain' &&
          (soc.alerts.some(a => a.actionTaken) || flags['m23_soctriage_action_taken'] || flags['m23_soctriage_completed'])
        ) {
          return { ...obj, isCompleted: true };
        }
        if (
          obj.id === 'obj_m23_soc_submit' &&
          (soc.submitted || flags['m23_soctriage_completed'])
        ) {
          return { ...obj, isCompleted: true };
        }
      }

      // ── 3. Compliance Auditor: act_audit_fintech_compliance ─────────────
      if (activity.definitionId === 'act_audit_fintech_compliance') {
        if (
          obj.id === 'obj_m23_audit_scans' &&
          (audit.domains.some(d => d.scanned) || flags['m23_compliance_scanned'] || flags['m23_complianceaudit_completed'])
        ) {
          return { ...obj, isCompleted: true };
        }
        if (
          obj.id === 'obj_m23_audit_remediation' &&
          (audit.remediationCompiled || flags['m23_compliance_remediated'] || flags['m23_complianceaudit_completed'])
        ) {
          return { ...obj, isCompleted: true };
        }
        if (
          (obj.id === 'obj_m23_audit_verdict' || obj.id === 'obj_m23_audit_certification') &&
          (audit.verdictSigned || flags['m23_complianceaudit_completed'])
        ) {
          return { ...obj, isCompleted: true };
        }
      }

      return obj;
    });

    const isAllDone = objectives.every(o => o.isCompleted);
    const completedCount = objectives.filter(o => o.isCompleted).length;
    const progress = objectives.length > 0 ? Math.round((completedCount / objectives.length) * 100) : 0;

    return {
      ...activity,
      objectives,
      status: isAllDone ? 'COMPLETED' : activity.status,
      progressPercentage: isAllDone ? 100 : progress,
    };
  }
}
