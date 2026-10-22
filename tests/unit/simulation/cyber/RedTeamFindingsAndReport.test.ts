/**
 * Cyberlife — Milestone 17: Red Team Findings Validation & Report Evaluation Unit Tests
 *
 * Verifies:
 * - Candidate finding triage (validation of true positives vs rejection of benign false positives)
 * - Independent severity and confidence ratings
 * - Audit trail preservation of rejected findings
 * - Executive report deliverable generation
 * - CISO Evaluation scorecard & authorization sign-off
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RedTeamEngine } from '@/simulation/cyber/redteam/redTeamEngine';
import { createInitialRedTeamAssessmentState } from '@/simulation/cyber/redteam/scenarioFixtures';
import {
  RedTeamAssessmentState,
  RedTeamReportSubmission,
} from '@/simulation/cyber/redteam/types';

describe('RedTeam Findings Triage & Assessment Reporting', () => {
  let assessmentState: RedTeamAssessmentState;

  beforeEach(() => {
    assessmentState = {
      ...createInitialRedTeamAssessmentState(),
      isAcceptedByPlayer: true,
      activePhase: 'FINDING_VALIDATION',
    };
  });

  it('validates true-positive vulnerability finding VULN-CEDAR-001 (BOLA)', () => {
    const updated = RedTeamEngine.validateFinding(
      assessmentState,
      'VULN-CEDAR-001',
      'VALIDATE',
      'Confirmed unauthenticated IDOR/BOLA retrieving acquisition targets.',
      29200,
      'Lead Assessor'
    );

    const finding = updated.findings.find(f => f.id === 'VULN-CEDAR-001')!;
    expect(finding.status).toBe('VALIDATED');
    expect(finding.analystNotes).toContain('Confirmed unauthenticated IDOR');
    expect(finding.severity).toBe('HIGH');
    expect(finding.confidence).toBe('CONFIRMED');
    expect(finding.validationHistory.length).toBeGreaterThan(0);
    expect(finding.validationHistory[0]?.rationale).toContain('Confirmed unauthenticated IDOR');
  });

  it('safely rejects benign candidate finding VULN-CEDAR-004 (TLS Cipher Suite)', () => {
    const updated = RedTeamEngine.validateFinding(
      assessmentState,
      'VULN-CEDAR-004',
      'REJECT',
      'Legacy CBC ciphers are secondary fallback; PFS and TLS 1.3 enforced. Non-exploitable.',
      29300,
      'Lead Assessor'
    );

    const finding = updated.findings.find(f => f.id === 'VULN-CEDAR-004')!;
    expect(finding.status).toBe('REJECTED');
    expect(finding.analystNotes).toContain('Non-exploitable');

    // Audit trail is preserved: finding is not deleted, but tracked with notes
    expect(finding.validationHistory.some(h => h.action === 'REJECT')).toBe(true);
  });

  it('maintains independent severity and confidence ratings', () => {
    const finding = assessmentState.findings.find(f => f.id === 'VULN-CEDAR-002')!;
    // Initially MEDIUM severity but SUSPECTED confidence
    expect(finding.severity).toBe('MEDIUM');
    expect(finding.confidence).toBe('SUSPECTED');

    const validated = RedTeamEngine.validateFinding(
      assessmentState,
      'VULN-CEDAR-002',
      'VALIDATE',
      'Verified unsigned SMB packets allow MITM relay.',
      29300,
      'Lead Assessor'
    );
    const updatedFinding = validated.findings.find(f => f.id === 'VULN-CEDAR-002')!;
    expect(updatedFinding.severity).toBe('MEDIUM');
    expect(updatedFinding.confidence).toBe('CONFIRMED');
  });

  it('generates well-structured executive report markdown deliverable', () => {
    const submission: RedTeamReportSubmission = {
      assessmentId: 'ROE-2026-CEDAR-RED-01',
      executiveSummary: 'Comprehensive assessment completed for Cedarline Services Ltd.',
      overallRiskLevel: 'CRITICAL',
      validatedFindingIds: ['VULN-CEDAR-001', 'VULN-CEDAR-002', 'VULN-CEDAR-003'],
      rejectedFalsePositiveIds: ['VULN-CEDAR-004'],
      limitationsDisclosed: ['Tested only staging subnets', 'SIEM excluded per RoE'],
      remediationRoadmap: ['Patch BOLA', 'Require SMB signing', 'Filter proxy headers'],
      preservedEvidenceIds: ['EVD-M17-RECON-PORTAL'],
      submittedAtSimTime: 29500,
      assessorSignature: 'Cyberlife Security Lead',
    };

    const markdown = RedTeamEngine.generateExecutiveDeliverable(assessmentState, submission);

    expect(markdown).toContain('EXECUTIVE PENETRATION TESTING DELIVERABLE');
    expect(markdown).toContain('Cedarline Services Ltd');
    expect(markdown).toContain('ROE-2026-CEDAR-RED-01');
  });

  it('awards 100% score and CISO approval for complete and accurate report', () => {
    // Perfect submission identifying all 3 true positives and rejecting 1 false positive
    const submission: RedTeamReportSubmission = {
      assessmentId: 'ROE-2026-CEDAR-RED-01',
      executiveSummary: 'Full assessment conducted on authorized perimeter and internal assets with complete verification.',
      overallRiskLevel: 'CRITICAL',
      validatedFindingIds: ['VULN-CEDAR-001', 'VULN-CEDAR-002', 'VULN-CEDAR-003'],
      rejectedFalsePositiveIds: ['VULN-CEDAR-004'],
      limitationsDisclosed: ['Internal core DC excluded'],
      remediationRoadmap: ['Enforce authorization checks', 'Require SMB signing', 'Filter proxy headers'],
      preservedEvidenceIds: ['EVD-M17-1', 'EVD-M17-2', 'EVD-M17-3'],
      submittedAtSimTime: 29600,
      assessorSignature: 'Lead PenTester',
    };

    const evaluation = RedTeamEngine.evaluateReportSubmission(submission, assessmentState);

    expect(evaluation.isApproved).toBe(true);
    expect(evaluation.scorePercentage).toBe(100);
    expect(evaluation.feedbackSummary).toContain('APPROVED');
    expect(evaluation.feedbackSummary).toContain('Goodness');
  });

  it('deducts points and rejects report when false positives are misclassified as confirmed', () => {
    // Flawed submission: claims VULN-CEDAR-004 (benign TLS) is a valid vulnerability
    const flawedSubmission: RedTeamReportSubmission = {
      assessmentId: 'ROE-2026-CEDAR-RED-01',
      executiveSummary: 'Assessment conducted with incomplete verification.',
      overallRiskLevel: 'CRITICAL',
      validatedFindingIds: ['VULN-CEDAR-001', 'VULN-CEDAR-004'], // Misclassified 004! Missing 002 and 003!
      rejectedFalsePositiveIds: [],
      limitationsDisclosed: [],
      remediationRoadmap: [],
      preservedEvidenceIds: [],
      submittedAtSimTime: 29600,
      assessorSignature: 'Novice Assessor',
    };

    const evaluation = RedTeamEngine.evaluateReportSubmission(flawedSubmission, assessmentState);

    expect(evaluation.isApproved).toBe(false);
    expect(evaluation.scorePercentage).toBeLessThan(75);
    expect(evaluation.feedbackSummary).toContain('REJECTED');
  });
});
