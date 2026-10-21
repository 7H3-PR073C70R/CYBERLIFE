/**
 * Cyberlife — Milestone 18: Purple Team Emulation & Coverage Engine
 *
 * Coordinates adversary emulation scenarios against defensive detection rules:
 * - Maps atomic emulation tests to MITRE ATT&CK techniques.
 * - Evaluates defensive coverage (DETECTED, PARTIALLY_DETECTED, UNDETECTED).
 * - Identifies telemetry blind spots and threshold gaps.
 * - Computes structured Purple Team coverage scorecards.
 *
 * STRICT SAFETY INVARIANT:
 * 100% simulated playbooks. Executes against in-memory rule engine only.
 */

import {
  CoverageStatus,
  DetectionRule,
  EmulationCoverageResult,
  PurpleTeamScenario,
  PurpleTeamScorecard,
  TelemetryEvent,
} from './types';

export const PURPLE_TEAM_SCENARIOS: readonly PurpleTeamScenario[] = [
  {
    id: 'SCEN-PT-01',
    name: 'Active Directory Password Spraying Emulation',
    description: 'Emulates an adversary attempting slow dictionary credential spraying across multiple accounts on the domain controller.',
    mitreTechniqueId: 'T1110.003',
    mitreTechniqueName: 'Brute Force: Password Spraying',
    tactics: ['Credential Access'],
    targetHostId: 'dc-core-01',
    simulatedActor: 'Phantom Weaver (Initial Access Phase)',
    generatedTelemetryIds: ['tel-002'],
    relevantRuleIds: ['RULE-SEC-001'],
    expectedDetectionSummary: 'Rule RULE-SEC-001 should trigger on consecutive failed network auth events exceeding threshold 3.',
    gapAnalysisIfMissed: 'If missed, the detection threshold may be too high or the auth-daemon failed to capture network logon event codes.',
    remediationRecommendation: 'Tune RULE-SEC-001 to aggregate failed authentication events across accounts within a sliding 60-second window.',
  },
  {
    id: 'SCEN-PT-02',
    name: 'Web Server Shell Spawn (Webshell / RCE)',
    description: 'Emulates execution of an interactive shell spawned by web server daemon http-proxy to execute stage 2 download payload.',
    mitreTechniqueId: 'T1505.003',
    mitreTechniqueName: 'Server Software Component: Web Shell',
    tactics: ['Persistence', 'Execution'],
    targetHostId: 'app-portal-01',
    simulatedActor: 'Phantom Weaver (Execution Phase)',
    generatedTelemetryIds: ['tel-005'],
    relevantRuleIds: ['RULE-SEC-002'],
    expectedDetectionSummary: 'Rule RULE-SEC-002 should trigger CRITICAL alert on http-proxy spawning /bin/sh.',
    gapAnalysisIfMissed: 'If missed, parent-child process tracking is not enabled for the DMZ application tier.',
    remediationRecommendation: 'Deploy Sysmon process creation monitoring (Event ID 1) with strict parent process allowlists for web daemons.',
  },
  {
    id: 'SCEN-PT-03',
    name: 'Offshore Adversary C2 Beaconing',
    description: 'Emulates periodic outbound TLS heartbeat connections from compromised DMZ host to offshore IP 198.51.100.45.',
    mitreTechniqueId: 'T1071.001',
    mitreTechniqueName: 'Application Layer Protocol: Web Protocols',
    tactics: ['Command and Control'],
    targetHostId: 'app-portal-01',
    simulatedActor: 'Phantom Weaver (Command & Control Phase)',
    generatedTelemetryIds: ['tel-008'],
    relevantRuleIds: ['RULE-SEC-003'],
    expectedDetectionSummary: 'Rule RULE-SEC-003 should trigger on outbound traffic matching threat intelligence record ioc-c2-ip-01.',
    gapAnalysisIfMissed: 'Threat intelligence feed is stale or perimeter egress inspection rule is disabled.',
    remediationRecommendation: 'Correlate real-time NIDS flows against local threat intelligence registry IOCs and automate firewall blocks.',
  },
  {
    id: 'SCEN-PT-04',
    name: 'High-Entropy DNS Exfiltration Tunneling',
    description: 'Emulates encoded data exfiltration via recursive DNS TXT queries with high entropy subdomains.',
    mitreTechniqueId: 'T1048.003',
    mitreTechniqueName: 'Exfiltration Over Alternative Protocol: DNS',
    tactics: ['Exfiltration'],
    targetHostId: 'app-portal-01',
    simulatedActor: 'Phantom Weaver (Exfiltration Phase)',
    generatedTelemetryIds: ['tel-009'],
    relevantRuleIds: ['RULE-SEC-004'],
    expectedDetectionSummary: 'Rule RULE-SEC-004 should trigger HIGH alert on DNS queries matching staged regex patterns.',
    gapAnalysisIfMissed: 'DNS recursive resolution is permitted without entropy or query volume analysis.',
    remediationRecommendation: 'Implement Shannon entropy inspection on DNS resolver logs and alert on subdomains exceeding 12 hex characters.',
  },
  {
    id: 'SCEN-PT-05',
    name: 'Unsanctioned Wildcard IAM Privilege Elevation',
    description: 'Emulates an adversary attaching corporate-admin wildcard permissions to an existing service account.',
    mitreTechniqueId: 'T1098',
    mitreTechniqueName: 'Account Manipulation',
    tactics: ['Persistence', 'Privilege Escalation'],
    targetHostId: 'dc-core-01',
    simulatedActor: 'Insider Threat / Compromised Credential Pivot',
    generatedTelemetryIds: ['tel-011'],
    relevantRuleIds: ['RULE-SEC-005'],
    expectedDetectionSummary: 'Rule RULE-SEC-005 should trigger CRITICAL alert on isUnsanctionedWildcard == true.',
    gapAnalysisIfMissed: 'IAM audit logging is not forwarded to central SIEM.',
    remediationRecommendation: 'Enforce real-time alerts on IAM policy changes granting wildcard (*) permissions and require multi-party approval.',
  },
  {
    id: 'SCEN-PT-06',
    name: 'Autonomous Assistant Adversarial Prompt Injection',
    description: 'Emulates user prompt injection subverting autonomous LLM agent tool-calling boundaries.',
    mitreTechniqueId: 'T1190',
    mitreTechniqueName: 'Exploit Public-Facing Application',
    tactics: ['Initial Access'],
    targetHostId: 'app-portal-01',
    simulatedActor: 'External Threat Actor (Prompt Injection)',
    generatedTelemetryIds: ['tel-013'],
    relevantRuleIds: ['RULE-SEC-006'],
    expectedDetectionSummary: 'Rule RULE-SEC-006 should detect prompt injection directives in HTTP request payload.',
    gapAnalysisIfMissed: 'WAF rules are limited to traditional SQLi/XSS signatures and lack semantic intent analysis.',
    remediationRecommendation: 'Implement pre-inference guardrail filtering and isolate tool-calling execution environments under strict IAM limits.',
  },
];

/**
 * Runs a single Purple Team emulation scenario against active detection rules and telemetry.
 */
export function runPurpleTeamScenario(
  scenario: PurpleTeamScenario,
  rules: readonly DetectionRule[],
  telemetry: readonly TelemetryEvent[]
): EmulationCoverageResult {
  const matchedRules: string[] = [];
  const generatedAlerts: string[] = [];

  for (const ruleId of scenario.relevantRuleIds) {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule || !rule.isEnabled) {
      continue;
    }

    // Check if any scenario telemetry event triggers this rule
    for (const telemId of scenario.generatedTelemetryIds) {
      const event = telemetry.find(e => e.id === telemId);
      if (event && rule.category === event.category && rule.evaluateMatch(event)) {
        matchedRules.push(rule.id);
        generatedAlerts.push(`alt-sim-${scenario.id}-${rule.id}`);
        break;
      }
    }
  }

  let status: CoverageStatus = 'UNDETECTED';
  let detectionNotes = '';

  if (matchedRules.length === scenario.relevantRuleIds.length && matchedRules.length > 0) {
    status = 'DETECTED';
    detectionNotes = `Full detection verified! Rule(s) [${matchedRules.join(', ')}] cleanly triggered on scenario telemetry.`;
  } else if (matchedRules.length > 0) {
    status = 'PARTIALLY_DETECTED';
    detectionNotes = `Partial detection. Triggered rule(s): [${matchedRules.join(', ')}], but missed expected rule(s): [${scenario.relevantRuleIds.filter(r => !matchedRules.includes(r)).join(', ')}].`;
  } else {
    status = 'UNDETECTED';
    detectionNotes = `Detection gap! Relevant rules [${scenario.relevantRuleIds.join(', ')}] are either disabled, misconfigured, or lack matching telemetry. ${scenario.gapAnalysisIfMissed}`;
  }

  return {
    scenarioId: scenario.id,
    status,
    matchedRuleIds: matchedRules,
    generatedAlertIds: generatedAlerts,
    detectionNotes,
  };
}

/**
 * Generates an aggregated Purple Team coverage scorecard across all scenarios.
 */
export function generatePurpleTeamScorecard(
  results: Readonly<Record<string, EmulationCoverageResult>>,
  totalScenarios: number = PURPLE_TEAM_SCENARIOS.length
): PurpleTeamScorecard {
  let detected = 0;
  let partial = 0;
  let undetected = 0;

  for (const scenario of PURPLE_TEAM_SCENARIOS) {
    const res = results[scenario.id];
    if (!res) {
      undetected++;
    } else if (res.status === 'DETECTED') {
      detected++;
    } else if (res.status === 'PARTIALLY_DETECTED') {
      partial++;
    } else {
      undetected++;
    }
  }

  const coveragePercentage = totalScenarios > 0 ? Math.round(((detected + partial * 0.5) / totalScenarios) * 100) : 0;

  let evaluationNotes = '';
  if (coveragePercentage >= 85) {
    evaluationNotes = 'Excellent defensive coverage! Detection rules recognized the majority of adversary techniques with minimal blind spots.';
  } else if (coveragePercentage >= 60) {
    evaluationNotes = 'Moderate detection posture. Core execution and C2 vectors were detected, but credential spraying or exfiltration tunneling require tuning.';
  } else {
    evaluationNotes = 'Substantial detection gaps identified. Adversary techniques bypassed active SIEM and host monitoring rules. Enable and tune relevant detection rules.';
  }

  return {
    totalScenarios,
    detectedCount: detected,
    partialCount: partial,
    undetectedCount: undetected,
    coveragePercentage,
    evaluationNotes,
  };
}
