/**
 * Cyberlife — Milestone 11: Purple Team Detection Engineering Engine
 *
 * Deterministic detection engine that evaluates configured SIEM DetectionRule[]
 * against simulated adversary attack telemetry and benign background event fixtures.
 *
 * PROHIBITION:
 * 100% in-memory deterministic evaluation. Zero regex injection / zero eval().
 */

import { DetectionRule, PurpleScenarioRunResult } from './types';
import { FictionalLogEntry } from '../cyber/tools/types';

export interface AdversaryScenarioStep {
  readonly stepNumber: number;
  readonly event: FictionalLogEntry;
  readonly elapsedSeconds: number;
  readonly isMalicious: boolean;
}

/**
 * Standard Purple Team Adversary Emulation Scenario:
 * Simulates service account svc-aster performing unauthorized lateral traversal
 * to access confidential finance spreadsheets on filesrv-01 via SMB port 445.
 */
export const PURPLE_SMB_LATERAL_SCENARIO: readonly AdversaryScenarioStep[] = [
  {
    stepNumber: 1,
    elapsedSeconds: 0,
    isMalicious: false,
    event: {
      id: 'SCEN-01',
      timestamp: '08:01:00 AM',
      source: 'auth',
      severity: 'INFO',
      eventType: 'AUTH_SUCCESS',
      hostId: 'app-portal-01',
      user: 'svc-aster',
      message: 'Service account svc-aster token refreshed by internal orchestrator daemon.',
      details: 'Scopes verified: corporate-admin [*]. Session granted.',
    },
  },
  {
    stepNumber: 2,
    elapsedSeconds: 15,
    isMalicious: false,
    event: {
      id: 'SCEN-02',
      timestamp: '08:01:15 AM',
      source: 'system',
      severity: 'INFO',
      eventType: 'DNS_QUERY',
      hostId: 'app-portal-01',
      user: 'svc-aster',
      message: 'DNS lookup resolved filesrv-01.corp.local -> 10.0.4.50.',
      details: 'Query type A from local resolver.',
    },
  },
  {
    stepNumber: 3,
    elapsedSeconds: 42,
    isMalicious: true,
    event: {
      id: 'SCEN-03',
      timestamp: '08:01:42 AM',
      source: 'file-server',
      severity: 'WARN',
      eventType: 'SHARE_ACCESS',
      hostId: 'filesrv-01',
      user: 'svc-aster',
      message:
        'SMB session established by svc-aster from 10.0.4.80 to share //filesrv-01/finance/payroll_q3_confidential.xlsx.',
      details: 'Protocol SMBv3, client app-portal-01. Granted by wildcard corporate-admin role.',
    },
  },
  {
    stepNumber: 4,
    elapsedSeconds: 60,
    isMalicious: true,
    event: {
      id: 'SCEN-04',
      timestamp: '08:02:00 AM',
      source: 'file-server',
      severity: 'WARN',
      eventType: 'FILE_READ',
      hostId: 'filesrv-01',
      user: 'svc-aster',
      message: 'File read completed: payroll_q3_confidential.xlsx (1.4 MB transferred).',
      details: 'Audit log written to local syslog repository.',
    },
  },
];

/**
 * Benign background noise fixture used to measure false positive rate.
 * Normal operations from authorized users (Goodness, Protector, Chidi).
 */
export const BENIGN_NOISE_FIXTURE: readonly FictionalLogEntry[] = [
  {
    id: 'BENIGN-01',
    timestamp: '08:05:00 AM',
    source: 'auth',
    severity: 'INFO',
    eventType: 'AUTH_SUCCESS',
    hostId: 'ws-finance-02',
    user: 'folake_alabi',
    message: 'User folake_alabi authenticated successfully.',
    details: 'Interactive Windows login.',
  },
  {
    id: 'BENIGN-02',
    timestamp: '08:06:10 AM',
    source: 'system',
    severity: 'INFO',
    eventType: 'SERVICE_START',
    hostId: 'filesrv-01',
    message: 'NFS export table reloaded cleanly.',
    details: 'Zero errors reported.',
  },
  {
    id: 'BENIGN-03',
    timestamp: '08:07:30 AM',
    source: 'auth',
    severity: 'INFO',
    eventType: 'AUTH_SUCCESS',
    hostId: 'ws-sec-04',
    user: 'tade_adebayo',
    message: 'Analyst session active.',
    details: 'Terminal session.',
  },
];

/**
 * Pure evaluator that checks if a single log entry satisfies a detection rule's criteria.
 */
export function evaluateRuleOnEvent(rule: DetectionRule, event: FictionalLogEntry): boolean {
  if (!rule.enabled) return false;

  let candidateValue = '';

  switch (rule.matchField) {
    case 'eventType':
      candidateValue = event.eventType ?? '';
      break;
    case 'hostId':
      candidateValue = event.hostId ?? '';
      break;
    case 'user':
      candidateValue = event.user ?? '';
      break;
    case 'severity':
      candidateValue = event.severity ?? '';
      break;
    case 'source':
      candidateValue = event.source ?? '';
      break;
    case 'serviceName':
      candidateValue = event.message ?? '';
      break;
    case 'port':
      candidateValue = event.details ?? '';
      break;
    default:
      return false;
  }

  const target = candidateValue.toLowerCase();
  const query = rule.matchValue.trim().toLowerCase();

  if (!query) return false;

  switch (rule.operator) {
    case 'EQUALS':
      return target === query;
    case 'CONTAINS':
      return target.includes(query);
    case 'STARTS_WITH':
      return target.startsWith(query);
    default:
      return false;
  }
}

/**
 * Runs a Purple Team adversary scenario through the player's active detection rules.
 */
export function runPurpleScenarioEvaluation(
  scenario: readonly AdversaryScenarioStep[],
  rules: readonly DetectionRule[],
  runType: 'baseline' | 'replay',
  simTimeSeconds: number
): PurpleScenarioRunResult {
  let detected = false;
  let timeToDetectSeconds: number | null = null;
  let triggeredRuleId: string | null = null;
  let detectedStep: AdversaryScenarioStep | null = null;

  // 1. Evaluate scenario steps sequentially
  for (const step of scenario) {
    for (const rule of rules) {
      if (evaluateRuleOnEvent(rule, step.event)) {
        detected = true;
        timeToDetectSeconds = step.elapsedSeconds;
        triggeredRuleId = rule.id;
        detectedStep = step;
        break;
      }
    }
    if (detected) break;
  }

  // 2. Measure false positives on benign noise
  let falsePositiveCount = 0;
  for (const noise of BENIGN_NOISE_FIXTURE) {
    for (const rule of rules) {
      if (evaluateRuleOnEvent(rule, noise)) {
        falsePositiveCount++;
        break;
      }
    }
  }

  const detectionGapIdentified = !detected;

  let details = '';
  if (detected && detectedStep && triggeredRuleId) {
    details = `DETECTION TRIGGERED! Rule '${triggeredRuleId}' flagged event ${detectedStep.event.id} (${detectedStep.event.eventType}) at T+${timeToDetectSeconds}s. False Positives on benchmark: ${falsePositiveCount}.`;
  } else {
    details =
      'DETECTION GAP IDENTIFIED! The adversary successfully executed unauthorized file read on filesrv-01 at T+42s without triggering any active SIEM alerts. Tune detection rules to close this blind spot.';
  }

  return {
    runId: `run-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    scenarioId: 'scen_smb_lateral',
    runType,
    timestamp: simTimeSeconds,
    detected,
    timeToDetectSeconds,
    triggeredRuleId,
    telemetryRecordsInspected: scenario.length,
    falsePositiveCount,
    detectionGapIdentified,
    details,
  };
}
