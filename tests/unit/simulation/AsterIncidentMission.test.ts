/**
 * Cyberlife — Milestone 6: The Aster Incident Unit & Integration Tests
 *
 * Comprehensive tests for:
 * - 9-phase mission state machine and invariants.
 * - Valid & invalid phase transitions with prerequisite enforcement.
 * - Evidence preservation and forensic integrity.
 * - Root-cause analysis assessment validation against ground truth.
 * - Containment and least-privilege remediation.
 * - Empirical verification testing actual simulated security boundaries.
 * - 7-section structured incident report validation and mission completion.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationEngine } from '@/simulation/SimulationEngine';
import { createInitialSimulationState } from '@/simulation/core/initialState';
import {
  validateRootCauseAssessment,
  validateIncidentReport,
  runSimulatedVerification,
} from '@/simulation/missions/asterIncidentGroundTruth';

describe('Milestone 6: The Aster Incident Simulation Engine & Mission Lifecycle', () => {
  let engine: SimulationEngine;

  beforeEach(() => {
    const state = createInitialSimulationState();
    engine = new SimulationEngine({ initialState: state });
  });

  describe('Initial Mission State & Invariants', () => {
    it('initializes with The Aster Incident mission active in briefing phase', () => {
      const mission = engine.getState().mission;
      expect(mission).toBeDefined();
      expect(mission?.missionId).toBe('the_aster_incident');
      expect(mission?.phase).toBe('briefing');
      expect(mission?.hasStarted).toBe(true);
      expect(mission?.isCompleted).toBe(false);
      expect(mission?.objectives.length).toBe(9);
      expect(mission?.asterService.operationalMode).toBe('NORMAL');
      expect(mission?.asterService.activePolicyRole).toBe('corporate-admin');
      expect(mission?.asterService.smbAccessAllowed).toBe(true);
    });

    it('sets the first objective (briefing) to pending initially', () => {
      const mission = engine.getState().mission;
      const firstObj = mission?.objectives.find(o => o.id === 'obj-briefing-01');
      expect(firstObj).toBeDefined();
      expect(firstObj?.isCompleted).toBe(false);
    });
  });

  describe('Phase Progression & Prerequisite Enforcement', () => {
    it('advances from briefing to initial_assessment and completes briefing objective', () => {
      engine.dispatch({
        type: 'AdvanceAsterMissionPhase',
        targetPhase: 'initial_assessment',
      });

      const mission = engine.getState().mission;
      expect(mission?.phase).toBe('initial_assessment');
      const objBriefing = mission?.objectives.find(o => o.id === 'obj-briefing-01');
      expect(objBriefing?.isCompleted).toBe(true);
    });

    it('rejects skipping directly to remediation before containment', () => {
      const result = engine.dispatch({
        type: 'AdvanceAsterMissionPhase',
        targetPhase: 'remediation',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Aster must first be contained');
    });

    it('rejects skipping directly to verification before remediation', () => {
      const result = engine.dispatch({
        type: 'AdvanceAsterMissionPhase',
        targetPhase: 'verification',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Aster permissions have not been remediated');
    });

    it('rejects completing the mission before the incident report is approved', () => {
      const result = engine.dispatch({
        type: 'AdvanceAsterMissionPhase',
        targetPhase: 'completed',
      });
      expect(result.success).toBe(false);
      expect(result.message).toContain('Incident report has not been submitted and approved');
    });
  });

  describe('Evidence Preservation', () => {
    it('preserves evidence and records simulation timestamp', () => {
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'initial_assessment' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'investigation' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'evidence_preservation' });

      engine.dispatch({
        type: 'PreserveMissionEvidence',
        evidenceId: 'EVD-2026-004',
        source: 'app-portal-01',
        description: 'Forensic snapshot of overprivileged IAM policy before remediation',
        reason: 'Chain of custody',
      });

      const mission = engine.getState().mission;
      expect(mission?.preservedEvidenceIds).toContain('EVD-2026-004');
      const objPreserve = mission?.objectives.find(o => o.id === 'obj-evidence-01');
      expect(objPreserve?.isCompleted).toBe(true);
    });

    it('prevents duplicate evidence entries when preserved repeatedly', () => {
      engine.dispatch({
        type: 'PreserveMissionEvidence',
        evidenceId: 'EVD-2026-004',
        source: 'app-portal-01',
        description: 'Initial preserve',
        reason: 'Chain of custody',
      });
      engine.dispatch({
        type: 'PreserveMissionEvidence',
        evidenceId: 'EVD-2026-004',
        source: 'app-portal-01',
        description: 'Repeated preserve call',
        reason: 'Chain of custody',
      });

      const mission = engine.getState().mission;
      const count = mission?.preservedEvidenceIds.filter(id => id === 'EVD-2026-004').length;
      expect(count).toBe(1);
    });
  });

  describe('Root-Cause Assessment Validation', () => {
    it('accepts valid root-cause assessment correlating evidence and ground truth', () => {
      const validAssessment = {
        suspectedRootCause:
          'Over-privileged IAM role assignment (role:corporate-admin) with wildcard permissions',
        affectedComponent: 'app-portal-01',
        observedImpact:
          'Unauthorized access and extraction of confidential payroll spreadsheet from filesrv-01',
        supportingEvidenceIds: ['LOG-2026-107B', 'EVD-2026-004'],
        uncertaintyOrNotes: 'Wildcard privileges allowed Aster to call filesrv-01 SMB port 445.',
      };

      const result = validateRootCauseAssessment(validAssessment);
      expect(result.isAccurate).toBe(true);

      engine.dispatch({
        type: 'SubmitRootCauseAssessment',
        ...validAssessment,
      });

      const mission = engine.getState().mission;
      expect(mission?.rootCauseAssessment).toBeDefined();
      expect(mission?.rootCauseAssessment?.isAccurate).toBe(true);
    });

    it('rejects unsupported root-cause hypotheses with constructive feedback', () => {
      const invalidAssessment = {
        suspectedRootCause: 'External ransomware attack',
        affectedComponent: 'dc-01',
        observedImpact: 'Domain controller wiped',
        supportingEvidenceIds: [],
        uncertaintyOrNotes: 'Guessing without reviewing logs.',
      };

      const result = validateRootCauseAssessment(invalidAssessment);
      expect(result.isAccurate).toBe(false);
      expect(result.feedback).toContain(
        'The affected component does not clearly identify the Aster AI service'
      );
    });
  });

  describe('Containment & Remediation', () => {
    beforeEach(() => {
      // Advance to containment phase
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'initial_assessment' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'investigation' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'evidence_preservation' });
      engine.dispatch({
        type: 'PreserveMissionEvidence',
        evidenceId: 'EVD-2026-004',
        source: 'app-portal-01',
        description: 'IAM Manifest',
        reason: 'Preserve evidence',
      });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'containment' });
    });

    it('executes containment, severs SMB port 445 access, and updates Aster status', () => {
      engine.dispatch({
        type: 'ExecuteContainment',
        action: 'isolate_service',
        reason: 'Severed SMB route to filesrv-01',
      });

      const mission = engine.getState().mission;
      expect(mission?.isContained).toBe(true);
      expect(mission?.asterService.operationalMode).toBe('CONTAINED');
      expect(mission?.asterService.smbAccessAllowed).toBe(false);
      expect(mission?.asterService.databaseAccessAllowed).toBe(false);

      const objContain = mission?.objectives.find(o => o.id === 'obj-containment-01');
      expect(objContain?.isCompleted).toBe(true);
    });

    it('is idempotent: executing containment repeatedly does not corrupt state', () => {
      engine.dispatch({ type: 'ExecuteContainment', action: 'isolate_service', reason: 'Initial' });
      const firstTimestamp = engine.getState().mission?.containmentTimestamp;

      engine.dispatch({ type: 'ExecuteContainment', action: 'isolate_service', reason: 'Repeat' });
      const secondTimestamp = engine.getState().mission?.containmentTimestamp;

      expect(firstTimestamp).toBe(secondTimestamp);
      expect(engine.getState().mission?.asterService.operationalMode).toBe('CONTAINED');
    });

    it('remediates excessive permissions to least-privilege role:kb-assistant', () => {
      engine.dispatch({ type: 'ExecuteContainment', action: 'isolate_service', reason: 'Isolate' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'remediation' });

      engine.dispatch({
        type: 'RemediatePermissions',
        targetPolicyRole: 'kb-assistant',
        removeSmbAccess: true,
        removeDatabaseAccess: true,
        grantedScopes: ['docs:read', 'kb:search'],
      });

      const mission = engine.getState().mission;
      expect(mission?.isRemediated).toBe(true);
      expect(mission?.asterService.activePolicyRole).toBe('kb-assistant');
      expect(mission?.asterService.grantedScopes).toEqual(['docs:read', 'kb:search']);
      expect(mission?.asterService.operationalMode).toBe('REMEDIATED');

      const objRemediate = mission?.objectives.find(o => o.id === 'obj-remediation-01');
      expect(objRemediate?.isCompleted).toBe(true);
    });

    it('rejects restoring overprivileged role during remediation', () => {
      engine.dispatch({ type: 'ExecuteContainment', action: 'isolate_service', reason: 'Isolate' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'remediation' });

      const result = engine.dispatch({
        type: 'RemediatePermissions',
        targetPolicyRole: 'corporate-admin',
        removeSmbAccess: false,
        removeDatabaseAccess: false,
        grantedScopes: ['*'],
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('Remediation Rejected');
    });
  });

  describe('System Verification', () => {
    it('fails verification if Aster is still uncontained or overprivileged', () => {
      const mission = engine.getState().mission!;
      const result = runSimulatedVerification(mission.asterService, 100);

      expect(result.passed).toBe(false);
      expect(result.message).toContain('Verification Failed');
      const smbCheck = result.checkDetails.find(c => c.checkName.includes('SMB'));
      expect(smbCheck?.passed).toBe(false);
    });

    it('passes verification when Aster is properly contained and remediated', () => {
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'initial_assessment' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'investigation' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'evidence_preservation' });
      engine.dispatch({
        type: 'PreserveMissionEvidence',
        evidenceId: 'EVD-2026-004',
        source: 'app-portal-01',
        description: 'Policy',
        reason: 'Pre-remediation',
      });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'containment' });
      engine.dispatch({ type: 'ExecuteContainment', action: 'isolate_service', reason: 'Isolate' });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'remediation' });
      engine.dispatch({
        type: 'RemediatePermissions',
        targetPolicyRole: 'kb-assistant',
        removeSmbAccess: true,
        removeDatabaseAccess: true,
        grantedScopes: ['docs:read', 'kb:search'],
      });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'verification' });

      engine.dispatch({ type: 'VerifyRemediation' });

      const mission = engine.getState().mission;
      expect(mission?.verificationResult?.passed).toBe(true);
      expect(mission?.verificationResult?.checkDetails.length).toBe(4);
      expect(mission?.verificationResult?.checkDetails.every(c => c.passed)).toBe(true);

      const objVerify = mission?.objectives.find(o => o.id === 'obj-verification-01');
      expect(objVerify?.isCompleted).toBe(true);
    });
  });

  describe('Incident Report & Final Mission Completion', () => {
    it('validates a complete 7-section incident report and awards high score', () => {
      const completeReport = {
        executiveSummary:
          'Cedarline Services IR responded to unauthorized data access by internal AI assistant Aster.',
        timeline:
          '07:50 - Healthcheck\n07:52 - Unauthorized file read LOG-2026-107B\n08:00 - Contained',
        affectedSystems: ['app-portal-01', 'filesrv-01'],
        rootCause:
          'Misconfigured role:corporate-admin with wildcard scopes granting unintended SMB access.',
        impactAssessment: 'Confidential payroll file accessed internally.',
        containmentActions: 'Contained by severing SMB port 445 network route and isolating Aster.',
        remediationActions:
          'Remediated to role:kb-assistant and restricted scopes to docs:read, kb:search.',
        verificationResults:
          'Verification passed: Knowledge search OK (200), SMB filesrv-01 blocked (403).',
        recommendations: 'Implement automated IAM policy scanning and enforce least privilege.',
      };

      const validation = validateIncidentReport(completeReport, {
        isContained: true,
        isRemediated: true,
        isVerified: true,
        asterService: {
          hostId: 'app-portal-01',
          serviceName: 'aster-ai-core',
          operationalMode: 'REMEDIATED',
          activePolicyRole: 'kb-assistant',
          grantedScopes: ['docs:read', 'kb:search'],
          allowedSubnets: ['10.0.4.0/24'],
          smbAccessAllowed: false,
          databaseAccessAllowed: false,
        },
      });

      expect(validation.isApproved).toBe(true);
      expect(validation.score).toBe(100);
    });

    it('rejects incomplete report missing required sections', () => {
      const incompleteReport = {
        executiveSummary: 'Short',
        timeline: '',
        affectedSystems: [],
        rootCause: '',
        impactAssessment: '',
        containmentActions: '',
        remediationActions: '',
        verificationResults: '',
        recommendations: '',
      };

      const validation = validateIncidentReport(incompleteReport, {
        isContained: false,
        isRemediated: false,
        isVerified: false,
        asterService: {
          hostId: 'app-portal-01',
          serviceName: 'aster-ai-core',
          operationalMode: 'NORMAL',
          activePolicyRole: 'corporate-admin',
          grantedScopes: ['*'],
          allowedSubnets: ['10.0.4.0/24'],
          smbAccessAllowed: true,
          databaseAccessAllowed: true,
        },
      });

      expect(validation.isApproved).toBe(false);
      expect(validation.score).toBeLessThan(70);
    });

    it('completes the entire end-to-end mission lifecycle successfully', () => {
      // 1. Briefing -> Initial Assessment
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'initial_assessment' });

      // 2. Initial Assessment -> Investigation
      engine.dispatch({
        type: 'RecordMissionFinding',
        findingType: 'host',
        targetId: 'app-portal-01',
      });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'investigation' });

      // 3. Investigation -> Evidence Preservation
      engine.dispatch({
        type: 'RecordMissionFinding',
        findingType: 'log',
        targetId: 'LOG-2026-107B',
      });
      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'evidence_preservation' });

      // 4. Evidence Preservation -> Containment
      engine.dispatch({
        type: 'PreserveMissionEvidence',
        evidenceId: 'EVD-2026-004',
        source: 'app-portal-01',
        description: 'Aster IAM Policy manifest',
        reason: 'Pre-containment snapshot',
      });

      // Submit Root-Cause Assessment
      engine.dispatch({
        type: 'SubmitRootCauseAssessment',
        suspectedRootCause:
          'Over-privileged IAM role assignment (role:corporate-admin) with wildcard permissions',
        affectedComponent: 'app-portal-01',
        observedImpact:
          'Unauthorized access and extraction of confidential payroll spreadsheet from filesrv-01',
        supportingEvidenceIds: ['LOG-2026-107B', 'EVD-2026-004'],
        uncertaintyOrNotes: 'Wildcard privileges allowed Aster to call filesrv-01 SMB port 445.',
      });

      engine.dispatch({ type: 'AdvanceAsterMissionPhase', targetPhase: 'containment' });

      // 5. Containment -> Remediation
      engine.dispatch({
        type: 'ExecuteContainment',
        action: 'isolate_service',
        reason: 'Severed SMB port 445 network route to filesrv-01',
      });

      // 6. Remediation -> Verification
      engine.dispatch({
        type: 'RemediatePermissions',
        targetPolicyRole: 'kb-assistant',
        removeSmbAccess: true,
        removeDatabaseAccess: true,
        grantedScopes: ['docs:read', 'kb:search'],
      });

      // 7. Verification -> Reporting
      engine.dispatch({ type: 'VerifyRemediation' });

      // 8. Submit Incident Report -> Completed
      engine.dispatch({
        type: 'SubmitIncidentReport',
        report: {
          executiveSummary:
            'Cedarline Services IR team resolved an unauthorized confidential file read incident.',
          timeline:
            '07:50 - Normal status\n07:52 - LOG-2026-107B unauthorized SMB read\n08:10 - Contained & remediated',
          affectedSystems: ['app-portal-01', 'filesrv-01'],
          rootCause: 'Aster was configured with role:corporate-admin and wildcard scopes [*].',
          impactAssessment: 'Internal access to payroll sheet. Zero external egress.',
          containmentActions: 'Severed SMB network route and restricted Aster.',
          remediationActions: 'Applied role:kb-assistant with least privilege.',
          verificationResults:
            'Verified: KB search returns 200 OK; SMB query returns 403 Forbidden.',
          recommendations:
            'Enforce least privilege on all AI agents and automate periodic IAM audits.',
        },
      });

      const finalState = engine.getState();
      expect(finalState.mission?.phase).toBe('completed');
      expect(finalState.mission?.isCompleted).toBe(true);
      expect(finalState.flags.mission_aster_completed).toBe(true);
      expect(finalState.flags.mission_aster_report_approved).toBe(true);
    });
  });
});
