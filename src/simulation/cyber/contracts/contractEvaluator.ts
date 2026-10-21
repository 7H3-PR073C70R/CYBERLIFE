/**
 * Cyberlife — Milestone 19: Deterministic Contract Evaluation & Grading Engine
 *
 * Implements authoritative, deterministic evaluation of submitted contract deliverables:
 * - Validates required deliverables against contract acceptance criteria.
 * - Assesses technical finding accuracy, affected component mapping, and proof-of-concept.
 * - Confirms cryptographic hash validity of linked evidence artifacts.
 * - Checks scope compliance history for unauthorized probes or policy breaches.
 * - Grades executive summaries, methodology notes, and remediation plans.
 * - Issues deterministic outcomes (ACCEPTED, ACCEPTED_WITH_FEEDBACK, REVISION_REQUESTED, REJECTED).
 * - Computes financial payouts, career XP, reputation deltas, and faction standing updates.
 *
 * SAFETY INVARIANT:
 * Zero arbitrary randomness; identical inputs always produce identical evaluation scores and feedback.
 */

import {
  ActiveContractState,
  BountyContract,
  ClientReviewResult,
  AcceptanceCheckResult,
  ContractSubmissionReport,
} from './types';
import { SimulationState } from '../../core/types';
import { EvidenceVaultAdapter } from './adapters/EvidenceVaultAdapter';

export class ContractEvaluator {
  /**
   * Deterministically evaluates a submitted contract report against ground truth criteria.
   */
  public static evaluateSubmission(
    contract: BountyContract,
    activeContract: ActiveContractState,
    submission: ContractSubmissionReport,
    currentState: Readonly<SimulationState>
  ): ClientReviewResult {
    const simTime = currentState.time.simulationTimeSeconds;
    const reviewId = `rev-${contract.id}-${submission.revisionNumber}-${simTime}`;
    const checks: AcceptanceCheckResult[] = [];

    let totalScore = 0;

    // 1. Objectives Progress Check (Up to 35 points)
    const totalObjs = activeContract.objectives.length;
    const completedObjs = activeContract.objectives.filter(o => o.isCompleted).length;
    const objScore = totalObjs > 0 ? Math.round((completedObjs / totalObjs) * 35) : 0;
    totalScore += objScore;

    const allObjsDone = completedObjs >= totalObjs;
    checks.push({
      checkName: 'Simulated Technical Objectives Completion',
      passed: completedObjs >= Math.max(1, totalObjs - 1),
      feedback: allObjsDone
        ? `All ${completedObjs}/${totalObjs} authorized technical objectives completed.`
        : `${completedObjs}/${totalObjs} technical objectives completed. Minor gaps observed.`,
    });

    // 2. Technical Findings Accuracy Check (Up to 25 points)
    let findingScore = 0;
    const primaryFinding = submission.findings[0];
    if (primaryFinding) {
      const hasTitle = primaryFinding.title.trim().length >= 10;
      const hasComponent = primaryFinding.affectedComponent.trim().length >= 5;
      const hasPoC = primaryFinding.proofOfConceptOrObservation.trim().length >= 20;
      const hasRemediation = primaryFinding.remediationRecommendation.trim().length >= 15;

      if (hasTitle && hasComponent && hasPoC && hasRemediation) {
        findingScore = 25;
        checks.push({
          checkName: 'Technical Finding & Proof-of-Concept Quality',
          passed: true,
          feedback: `Finding '${primaryFinding.title}' contains valid affected component, severity, and reproducible observation.`,
        });
      } else {
        findingScore = 12;
        checks.push({
          checkName: 'Technical Finding & Proof-of-Concept Quality',
          passed: false,
          feedback: 'Technical finding is incomplete: requires clear affected component, reproducible observation, and mitigation.',
        });
      }
    } else {
      checks.push({
        checkName: 'Technical Finding & Proof-of-Concept Quality',
        passed: false,
        feedback: 'No technical findings provided. Contract requires documented vulnerability or audit observations.',
      });
    }
    totalScore += findingScore;

    // 3. Cryptographic Evidence Validation (Up to 15 points)
    let evidenceScore = 0;
    const linkedEvidence = submission.linkedEvidenceIds;
    if (linkedEvidence.length > 0) {
      let verifiedCount = 0;
      for (const evId of linkedEvidence) {
        const verify = EvidenceVaultAdapter.verifyEvidenceIntegrity(evId, currentState);
        if (verify.isValid) {
          verifiedCount++;
        }
      }

      if (verifiedCount > 0) {
        evidenceScore = 15;
        checks.push({
          checkName: 'Cryptographic Forensic Evidence Verification',
          passed: true,
          feedback: `Verified ${verifiedCount} linked evidence artifact(s) with valid SHA-256 integrity in vault.`,
        });
      } else {
        evidenceScore = 5;
        checks.push({
          checkName: 'Cryptographic Forensic Evidence Verification',
          passed: false,
          feedback: 'Linked evidence IDs could not be verified in the forensic vault.',
        });
      }
    } else {
      // If contract has mandatory evidence deliverable
      const hasMandatoryEvidence = contract.requiredDeliverables.some(d =>
        d.id.includes('evidence')
      );
      if (hasMandatoryEvidence) {
        checks.push({
          checkName: 'Cryptographic Forensic Evidence Verification',
          passed: false,
          feedback: 'No evidence artifacts linked. Contract requires verified forensic evidence snapshot.',
        });
      } else {
        evidenceScore = 10;
        checks.push({
          checkName: 'Cryptographic Forensic Evidence Verification',
          passed: true,
          feedback: 'No external evidence required for this triage assignment.',
        });
      }
    }
    totalScore += evidenceScore;

    // 4. Executive Summary & Methodology (Up to 15 points)
    let summaryScore = 0;
    const summaryLen = submission.executiveSummary.trim().length;
    if (summaryLen >= 50) {
      summaryScore = 15;
      checks.push({
        checkName: 'Executive Summary & Business Context Briefing',
        passed: true,
        feedback: 'Executive summary clearly communicates business risk, affected systems, and operational context.',
      });
    } else if (summaryLen >= 20) {
      summaryScore = 8;
      checks.push({
        checkName: 'Executive Summary & Business Context Briefing',
        passed: false,
        feedback: 'Executive summary is brief. Elaborate on business risk and operational impact.',
      });
    } else {
      checks.push({
        checkName: 'Executive Summary & Business Context Briefing',
        passed: false,
        feedback: 'Executive summary is missing or too brief.',
      });
    }
    totalScore += summaryScore;

    // 5. Remediation Recommendations Quality (Up to 10 points)
    let remediationScore = 0;
    const recs = submission.remediationRecommendations;
    if (recs && recs.length > 0 && recs[0] && recs[0].trim().length >= 15) {
      remediationScore = 10;
      checks.push({
        checkName: 'Actionable Remediation & Defense Recommendations',
        passed: true,
        feedback: `${recs.length} actionable, prioritized remediation recommendation(s) provided.`,
      });
    } else {
      checks.push({
        checkName: 'Actionable Remediation & Defense Recommendations',
        passed: false,
        feedback: 'Missing concrete remediation recommendations.',
      });
    }
    totalScore += remediationScore;

    // 6. Scope Compliance & Audit Events Enforcement
    const violations = activeContract.auditEvents.filter(e => e.violationRecorded);
    const hasScopeViolation = violations.length > 0;

    // Special check for professional judgment ambiguous contract:
    const requiresClarification = contract.scope.hasScopeAmbiguity;
    const clarifiedCorrectly = activeContract.scopeClarified;

    if (hasScopeViolation) {
      totalScore = Math.max(0, totalScore - 40);
      checks.push({
        checkName: 'Rules of Engagement & Scope Compliance Audit',
        passed: false,
        feedback: `CRITICAL: ${violations.length} out-of-scope or prohibited action(s) detected during engagement!`,
      });
    } else if (requiresClarification && !clarifiedCorrectly) {
      totalScore = Math.min(totalScore, 35); // Capped at failing score
      checks.push({
        checkName: 'Professional Scope Clarification Compliance',
        passed: false,
        feedback:
          'UNRESOLVED SCOPE: Proceeding without clarifying the unverified third-party database at 192.168.99.1 is a professional compliance failure.',
      });
    } else {
      if (submission.scopeComplianceAffirmed) {
        checks.push({
          checkName: 'Rules of Engagement & Scope Compliance Audit',
          passed: true,
          feedback: 'Zero out-of-scope probes recorded. Scope compliance affirmed by operator.',
        });
      } else {
        totalScore = Math.max(0, totalScore - 10);
        checks.push({
          checkName: 'Rules of Engagement & Scope Compliance Audit',
          passed: false,
          feedback: 'Operator failed to check the scope compliance affirmation checkbox.',
        });
      }
    }

    // 7. Outcome Determination
    let outcome: ClientReviewResult['outcome'];
    let feedbackTitle = '';
    let feedbackBody = '';
    let payoutKobo = 0;
    let xpAwarded = 0;
    let reputationDelta = 0;
    let factionDelta = 0;

    const baseReward = contract.financialTerms.rewardKobo;

    if (totalScore >= 85) {
      outcome = 'ACCEPTED';
      feedbackTitle = `Approved — Exemplary Delivery (${totalScore}/100)`;
      feedbackBody = `${contract.client.name} review board has evaluated and APPROVED your contract submission. All acceptance criteria and scope boundaries were flawlessly maintained. Payment has been authorized.`;
      payoutKobo = baseReward;
      xpAwarded = 150;
      reputationDelta = 35;
      factionDelta = 15;
    } else if (totalScore >= 70) {
      outcome = 'ACCEPTED_WITH_FEEDBACK';
      feedbackTitle = `Accepted with Minor Notes (${totalScore}/100)`;
      feedbackBody = `${contract.client.name} has ACCEPTED your submission. Minor feedback on deliverable depth noted for future contracts. Full payment authorized.`;
      payoutKobo = baseReward;
      xpAwarded = 100;
      reputationDelta = 20;
      factionDelta = 10;
    } else if (totalScore >= 45 && !hasScopeViolation) {
      outcome = 'REVISION_REQUESTED';
      feedbackTitle = `Revision Requested (${totalScore}/100)`;
      feedbackBody = `${contract.client.contactPerson} reviewed your submission and requested targeted revisions before approving payment. Review the itemized checklist above, update missing findings or evidence, and resubmit.`;
      payoutKobo = 0; // No payout until approved
      xpAwarded = 25;
      reputationDelta = 5;
      factionDelta = 0;
    } else {
      outcome = 'REJECTED';
      feedbackTitle = `Submission Rejected (${totalScore}/100)`;
      feedbackBody = hasScopeViolation
        ? `REJECTED FOR SCOPE BREACH: ${contract.client.name} security team flagged unauthorized operations outside authorized boundaries. Contract terminated with reputation penalty.`
        : `REJECTED: Submission failed to meet critical acceptance criteria. Insufficient technical deliverables or unverified evidence provided.`;
      payoutKobo = 0;
      xpAwarded = 0;
      reputationDelta = -25;
      factionDelta = -10;
    }

    return {
      reviewId,
      contractId: contract.id,
      outcome,
      reviewedAtSimTime: simTime,
      revisionNumber: submission.revisionNumber,
      overallScore: totalScore,
      clientFeedbackTitle: feedbackTitle,
      clientFeedbackBody: feedbackBody,
      itemizedChecks: checks,
      payoutKobo,
      careerXpAwarded: xpAwarded,
      freelanceReputationDelta: reputationDelta,
      factionStandingDelta: contract.client.factionId
        ? { factionId: contract.client.factionId, delta: factionDelta }
        : undefined,
      payoutProcessed: payoutKobo > 0,
    };
  }
}
