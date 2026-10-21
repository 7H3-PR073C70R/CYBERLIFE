/**
 * Cyberlife — Milestone 18: Playable Defensive Scenario Data & Ground-Truth Evaluator
 *
 * Authored Mission: "Operation Lagos Shield: Broad Street Defense"
 * Provides:
 * - 7 authored defensive & purple team objectives.
 * - Initial state factory initializing rules, telemetry, and pre-computed alerts.
 * - Ground-truth incident report evaluation scoring player triage, root cause,
 *   defensive response adequacy, and false-positive discrimination.
 *
 * STRICT SAFETY INVARIANT:
 * 100% simulated mission content. Zero external dependencies.
 */

import {
  DefensiveMissionObjective,
  DefensiveOpsState,
  DefensiveEvaluationResult,
  IncidentReportSubmission,
  DefensiveResponseAction,
} from './types';
import { SYNTHETIC_TELEMETRY_EVENTS } from './telemetryFixtures';
import { DETECTION_RULES_CATALOG } from './detectionRules';
import { evaluateDetectionRules } from './detectionEngine';

export const OPERATION_LAGOS_SHIELD_OBJECTIVES: readonly DefensiveMissionObjective[] = [
  {
    id: 'obj-m18-triage-telemetry',
    title: 'Monitor Multi-Source Security Telemetry',
    description: 'Inspect synthetic security events across Authentication, Process Execution, Network, and FIM categories in the Telemetry Monitor.',
    hint: 'Filter telemetry by category to identify anomalous processes on app-portal-01.',
    isCompleted: false,
    requiredAction: 'MONITOR_TELEMETRY',
  },
  {
    id: 'obj-m18-triage-alerts',
    title: 'Triage Security Alert Queue & Prioritize P1 Threats',
    description: 'Review SIEM alerts, examine derived priority calculations, and transition active alerts from NEW to UNDER_INVESTIGATION.',
    hint: 'Open the Alert Queue tab and select the CRITICAL webshell alert to inspect its priority formula.',
    isCompleted: false,
    requiredAction: 'TRIAGE_SECURITY_ALERTS',
  },
  {
    id: 'obj-m18-distinguish-false-positive',
    title: 'Discriminate Authorized SOC Scanner Activity',
    description: 'Identify the routine port sweep alert from internal scanner mon-siem-01 and classify it as a FALSE_POSITIVE.',
    hint: 'Examine alert alt-008 or the scanner telemetry from 10.0.99.5. This is an authorized SOC OpenVAS scanner on the allowlist.',
    isCompleted: false,
    requiredAction: 'DISTINGUISH_FALSE_POSITIVE',
  },
  {
    id: 'obj-m18-investigate-incident',
    title: 'Conduct Evidence-Backed Incident Investigation',
    description: 'Correlate telemetry observations, map attack progression from prompt injection to C2 beaconing, and record analyst hypotheses.',
    hint: 'Use the Investigation tab to formulate confirmed facts regarding app-portal-01 and the Phantom Weaver C2 relay.',
    isCompleted: false,
    requiredAction: 'INVESTIGATE_INCIDENT_TIMELINE',
  },
  {
    id: 'obj-m18-preserve-evidence',
    title: 'Preserve Cryptographic Forensic Telemetry',
    description: 'Preserve key attack telemetry artifacts (C2 beaconing, webshell execution, or credential spray) into your Evidence Vault.',
    hint: 'Click "Preserve Telemetry as Vault Evidence" in the alert details or investigation view.',
    isCompleted: false,
    requiredAction: 'PRESERVE_DEFENSIVE_EVIDENCE',
  },
  {
    id: 'obj-m18-execute-response',
    title: 'Execute Justified Simulated Defensive Response',
    description: 'Take active containment action by isolating compromised host app-portal-01 or blocking adversary C2 indicator 198.51.100.45.',
    hint: 'Go to the Defensive Response tab, select an appropriate mitigation (e.g. BLOCK_INDICATOR or ISOLATE_ENDPOINT), and provide an operational reason.',
    isCompleted: false,
    requiredAction: 'EXECUTE_DEFENSIVE_RESPONSE',
  },
  {
    id: 'obj-m18-validate-purple-coverage',
    title: 'Validate Purple Team Detection Coverage Scorecard',
    description: 'Execute adversary emulation scenarios in the Purple Team Studio and achieve at least 80% detection coverage.',
    hint: 'Run all 6 emulation scenarios. If any are missed, verify that corresponding detection rules are enabled.',
    isCompleted: false,
    requiredAction: 'VALIDATE_PURPLE_COVERAGE',
  },
];

/**
 * Creates the initial, fully populated DefensiveOpsState for Milestone 18.
 */
export function createInitialDefensiveOpsState(): DefensiveOpsState {
  const telemetryEvents = SYNTHETIC_TELEMETRY_EVENTS;
  const rules = DETECTION_RULES_CATALOG;
  const initialAlerts = evaluateDetectionRules(telemetryEvents, rules);

  return {
    scenarioId: 'scen-m18-lagos-shield',
    title: 'Operation Lagos Shield — Broad Street Defensive Operations',
    activeTab: 'telemetry',
    telemetryEvents,
    rules,
    alerts: initialAlerts,
    selectedAlertId: initialAlerts[0]?.id,
    selectedTelemetryId: telemetryEvents[0]?.id,
    hypotheses: [
      {
        id: 'hyp-001',
        title: 'Initial Access via Web Application Prompt Injection',
        hypothesisText: 'Threat actor submitted adversarial override payload to /api/assistant on app-portal-01 to bypass tool guardrails.',
        isConfirmedFact: true,
        linkedAlertIds: ['alt-006'],
        linkedTelemetryIds: ['tel-013'],
        linkedHostIds: ['app-portal-01'],
        linkedIndicatorIds: [],
        createdAtSimTime: 28860,
      },
    ],
    executedResponses: [],
    blockedIndicators: [],
    isolatedHostIds: [],
    lockedUserAccounts: [],
    objectives: OPERATION_LAGOS_SHIELD_OBJECTIVES,
    purpleEmulationResults: {},
  };
}

/**
 * Evaluates an incident report submission against ground-truth technical realities.
 */
export function evaluateDefensiveIncidentReport(
  submission: IncidentReportSubmission,
  vaultEvidenceIds: readonly string[],
  executedResponses: readonly DefensiveResponseAction[]
): DefensiveEvaluationResult {
  const feedbackNotes: string[] = [];
  let score = 0;

  // 1. Correct Attacker Attribution (20 pts)
  const actorNormalized = submission.suspectedAttacker.toLowerCase();
  const correctActor = actorNormalized.includes('phantom weaver') || actorNormalized.includes('phantom');
  if (correctActor) {
    score += 20;
    feedbackNotes.push('Attribution Verified: Correctly attributed attack campaign to Phantom Weaver APT (+20 pts).');
  } else {
    feedbackNotes.push(`Attribution Inaccurate: Specified "${submission.suspectedAttacker}", but IOCs and C2 telemetry point to Phantom Weaver (0/20 pts).`);
  }

  // 2. Correct Initial Compromised Host (20 pts)
  const hostNormalized = submission.initialCompromisedHostId.toLowerCase();
  const correctInitialHost = hostNormalized.includes('app-portal-01') || hostNormalized.includes('portal');
  if (correctInitialHost) {
    score += 20;
    feedbackNotes.push('Initial Foothold Isolated: Correctly identified app-portal-01 as initial compromised asset (+20 pts).');
  } else {
    feedbackNotes.push(`Initial Host Missed: Identified "${submission.initialCompromisedHostId}", but webshell and RCE occurred on app-portal-01 (0/20 pts).`);
  }

  // 3. Correct Attack Vector Analysis (20 pts)
  const vectorNormalized = submission.primaryVector.toLowerCase();
  const correctVector =
    vectorNormalized.includes('prompt injection') ||
    vectorNormalized.includes('webshell') ||
    vectorNormalized.includes('rce') ||
    vectorNormalized.includes('command injection');
  if (correctVector) {
    score += 20;
    feedbackNotes.push('Attack Vector Confirmed: Root cause correctly identified as prompt injection / webshell execution (+20 pts).');
  } else {
    feedbackNotes.push('Attack Vector Vague: Did not identify the prompt injection or webshell command execution vector (0/20 pts).');
  }

  // 4. Correct False Positive Recognition (15 pts)
  const fpNormalized = submission.falsePositiveHostId.toLowerCase();
  const correctFalsePositiveRecognition =
    fpNormalized.includes('mon-siem-01') ||
    fpNormalized.includes('siem') ||
    fpNormalized.includes('10.0.99.5');
  if (correctFalsePositiveRecognition) {
    score += 15;
    feedbackNotes.push('Defensive Discernment: Successfully differentiated authorized SOC scanner mon-siem-01 from malicious port reconnaissance (+15 pts).');
  } else {
    feedbackNotes.push('False Positive Blindness: Failed to recognize the routine SIEM vulnerability scanner mon-siem-01 as benign allowlist (0/15 pts).');
  }

  // 5. Response Action Adequacy (15 pts)
  const hasIsolatedHost = executedResponses.some(r => r.actionType === 'ISOLATE_ENDPOINT' && r.targetEntityId.includes('app-portal-01'));
  const hasBlockedC2 = executedResponses.some(r => r.actionType === 'BLOCK_INDICATOR' && r.targetEntityId.includes('198.51.100.45'));
  const hasDisabledAccount = executedResponses.some(r => r.actionType === 'DISABLE_ACCOUNT' && r.targetEntityId.includes('svc-aster'));

  let responseScore = 0;
  if (hasIsolatedHost || hasBlockedC2) {
    responseScore = 15;
    feedbackNotes.push('Containment Confirmed: Justified mitigation applied (endpoint isolation / C2 IP firewall drop) (+15 pts).');
  } else if (hasDisabledAccount) {
    responseScore = 10;
    feedbackNotes.push('Partial Containment: Locked compromised service account, but did not sever active network connection or isolate host (+10/15 pts).');
  } else {
    feedbackNotes.push('No Containment: No active defensive response (endpoint isolation or C2 blocking) was executed (0/15 pts).');
  }
  score += responseScore;

  // 6. Evidence Vault Preservation (10 pts)
  let evidenceScore = 0;
  const criticalEvidenceIds = ['EVD-2026-001', 'EVD-2026-003', 'EVD-2026-004'];
  const preservedCount = criticalEvidenceIds.filter(id => vaultEvidenceIds.includes(id)).length;
  if (preservedCount >= 2) {
    evidenceScore = 10;
    feedbackNotes.push(`Forensic Evidence Complete: Preserved ${preservedCount} cryptographic artifacts in Vault (+10 pts).`);
  } else if (preservedCount === 1) {
    evidenceScore = 5;
    feedbackNotes.push('Forensic Evidence Partial: Preserved 1 artifact in Vault (+5/10 pts).');
  } else {
    feedbackNotes.push('Forensic Evidence Missing: No critical evidence preserved in Evidence Vault (0/10 pts).');
  }
  score += evidenceScore;

  const isApproved = score >= 80;

  const critiqueSummary = isApproved
    ? `Investigation Approved with Commendation (Score: ${score}%). Excellent blue team triage, root cause attribution, false positive discrimination, and mitigation.`
    : `Investigation Finding Requires Revision (Score: ${score}%). Passing threshold is 80%. Review attribution, false positive recognition, and ensure containment actions are taken.`;

  return {
    isApproved,
    scorePercentage: score,
    critiqueSummary,
    correctActor,
    correctInitialHost,
    correctVector,
    correctFalsePositiveRecognition,
    responseAdequacyScore: responseScore,
    evidenceScore,
    feedbackNotes,
  };
}
