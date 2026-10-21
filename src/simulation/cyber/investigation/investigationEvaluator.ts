/**
 * Cyberlife — Milestone 16: Pure Investigation Evaluator
 *
 * Evaluates the player's submitted conclusions and technical findings
 * against ground-truth evidence and forensic standards.
 *
 * SAFETY INVARIANT:
 * Zero side-effects. Pure deterministic domain function.
 */

import {
  InvestigationConclusionSubmission,
  InvestigationEvaluationResult,
} from './types';

export function evaluateInvestigationSubmission(
  submission: InvestigationConclusionSubmission,
  preservedVaultEvidenceIds: readonly string[]
): InvestigationEvaluationResult {
  // 1. Evaluate Suspected Threat Actor
  const actorText = submission.suspectedActor.toLowerCase();
  const correctActor = actorText.includes('phantom') || actorText.includes('weaver');

  // 2. Evaluate Compromised Host
  const hostText = submission.compromisedHostId.toLowerCase();
  const correctCompromisedHost =
    hostText.includes('app-portal-01') || hostText.includes('10.0.1.10') || hostText.includes('aster');

  // 3. Evaluate Primary C2 Channel
  const c2Text = submission.primaryC2Channel.toLowerCase();
  const correctC2Channel =
    c2Text.includes('8443') ||
    c2Text.includes('198.51.100.45') ||
    (c2Text.includes('tls') && c2Text.includes('c2'));

  // 4. Evaluate Exfiltration Method
  const exfilText = submission.exfiltrationMethod.toLowerCase();
  const correctExfiltrationMethod =
    exfilText.includes('dns') ||
    exfilText.includes('tunnel') ||
    exfilText.includes('smb') ||
    exfilText.includes('beacon');

  // 5. Evaluate False Positive Identification
  const fpText = submission.falsePositiveRecognized.toLowerCase();
  const correctFalsePositiveIdentification =
    fpText.includes('siem') ||
    fpText.includes('mon-siem-01') ||
    fpText.includes('10.0.99.5') ||
    fpText.includes('scanner') ||
    fpText.includes('openvas');

  // 6. Evaluate Evidence Completeness
  const requiredEvidencePool = ['EVD-2026-M16-01', 'EVD-2026-M16-02', 'EVD-2026-M16-03'];
  const preservedCount = requiredEvidencePool.filter(id =>
    preservedVaultEvidenceIds.includes(id) || submission.preservedEvidenceIds.includes(id)
  ).length;

  const missingEvidenceIds = requiredEvidencePool.filter(
    id => !preservedVaultEvidenceIds.includes(id) && !submission.preservedEvidenceIds.includes(id)
  );

  const evidenceCompletenessScore = Math.min(100, Math.round((preservedCount / 2) * 100)); // 2 required for 100%

  // Compute overall score
  let score = 0;
  if (correctActor) score += 20;
  if (correctCompromisedHost) score += 20;
  if (correctC2Channel) score += 20;
  if (correctExfiltrationMethod) score += 20;
  if (correctFalsePositiveIdentification) score += 10;
  if (preservedCount >= 1) score += 10;

  const isApproved = score >= 70 && correctCompromisedHost && correctActor;

  let feedback = '';
  if (isApproved) {
    feedback = `EXCELLENT INVESTIGATION (${score}%): Lead Incident Responder Michael confirms your findings. You correctly identified the compromised Aster host (app-portal-01), the Phantom Weaver APT adversary group, the port 8443 C2 channel, and successfully filtered out the internal SIEM scanner false positive. Digital evidence integrity is cryptographically preserved in the vault.`;
  } else {
    const issues: string[] = [];
    if (!correctCompromisedHost) issues.push('The primary compromised asset in the DMZ was not correctly identified.');
    if (!correctActor) issues.push('The adversary group did not match threat intelligence indicators.');
    if (!correctC2Channel) issues.push('The egress C2 channel (port 8443 / suspect IP 198.51.100.45) was missing or inaccurate.');
    if (!correctFalsePositiveIdentification) issues.push('The authorized SIEM scanner (mon-siem-01) was not distinguished from true adversary traffic.');
    if (preservedCount < 1) issues.push('Forensic evidence items were not preserved in the Evidence Vault.');

    feedback = `INSUFFICIENT OR INCOMPLETE FINDING (${score}%): ${issues.join(' ')} Re-examine network traffic records, correlate with NDSRC Advisory #2026-8841, and verify forensic packet metadata before resubmitting.`;
  }

  return {
    isApproved,
    scorePercentage: score,
    feedbackSummary: feedback,
    correctActor,
    correctCompromisedHost,
    correctC2Channel,
    correctExfiltrationMethod,
    correctFalsePositiveIdentification,
    evidenceCompletenessScore,
    missingEvidenceIds,
  };
}

export { evaluateInvestigationSubmission as evaluateNetworkInvestigation };

