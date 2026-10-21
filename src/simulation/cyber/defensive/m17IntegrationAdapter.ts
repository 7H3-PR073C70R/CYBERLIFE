/**
 * Cyberlife — Milestone 18: M17 Red Team Integration Boundary & Adapter
 *
 * Defines the integration contract for consuming simulated offensive assessment events
 * from Milestone 17 (Red Team & Authorized Assessment Workflows).
 *
 * DESIGN INVARIANT:
 * - Operates independently from M17's internal execution pipeline.
 * - Does not modify or rebuild M17's owned systems.
 * - If M17's runtime event bus is available, maps its offensive actions to defensive observations.
 * - If M17 is not yet merged/active, falls back seamlessly to deterministic synthetic fixtures
 *   clearly marked with `isSyntheticFixture: true` without crashing or blocking M18.
 */

import { AssessmentEventContract, RedTeamAssessmentAdapter, TelemetryEvent } from './types';

/**
 * Fixture fallback assessments representing M17 Red Team assessment actions.
 * These are strictly simulation fixtures used when M17 runtime events are not yet present.
 */
export const SYNTHETIC_M17_FIXTURE_ASSESSMENTS: readonly AssessmentEventContract[] = [
  {
    assessmentId: 'asm-m17-001',
    timestampSeconds: 27700,
    toolName: 'exploitlab-cred-spray',
    targetHost: '10.0.4.10',
    actionType: 'AUTHENTICATION_SPRAY',
    success: true,
    payloadSummary: 'Slow dictionary spray against Active Directory LDAP targeting 4 accounts.',
    isSyntheticFixture: true,
  },
  {
    assessmentId: 'asm-m17-002',
    timestampSeconds: 28010,
    toolName: 'webproxy-tamper',
    targetHost: '10.0.1.10',
    actionType: 'RCE_COMMAND_INJECTION',
    success: true,
    payloadSummary: 'Parameter tampering on /api/assistant injecting curl pipe to stage2.',
    isSyntheticFixture: true,
  },
  {
    assessmentId: 'asm-m17-003',
    timestampSeconds: 28310,
    toolName: 'c2-beacon-emulator',
    targetHost: '198.51.100.45',
    actionType: 'EGRESS_BEACON',
    success: true,
    payloadSummary: 'Outbound TLS 1.3 heartbeat to offshore relay port 8443.',
    isSyntheticFixture: true,
  },
  {
    assessmentId: 'asm-m17-004',
    timestampSeconds: 28430,
    toolName: 'dns-tunnel-exfil',
    targetHost: '198.51.100.1',
    actionType: 'DNS_STAGING_EXFIL',
    success: true,
    payloadSummary: 'High-entropy TXT records query exfiltrating token hashes.',
    isSyntheticFixture: true,
  },
  {
    assessmentId: 'asm-m17-005',
    timestampSeconds: 28610,
    toolName: 'iam-privilege-grant',
    targetHost: '10.0.4.10',
    actionType: 'PRIVILEGE_ELEVATION',
    success: true,
    payloadSummary: 'Wildcard IAM scope grant to svc-aster.',
    isSyntheticFixture: true,
  },
];

export class DefaultRedTeamAssessmentAdapter implements RedTeamAssessmentAdapter {
  private readonly _injectedEvents: AssessmentEventContract[] = [];

  constructor(initialEvents?: readonly AssessmentEventContract[]) {
    if (initialEvents) {
      this._injectedEvents.push(...initialEvents);
    }
  }

  public get isM17Available(): boolean {
    return this._injectedEvents.length > 0 && !this._injectedEvents.every(e => e.isSyntheticFixture);
  }

  public registerAssessmentEvent(event: AssessmentEventContract): void {
    this._injectedEvents.push(event);
  }

  public getSimulatedAssessmentEvents(): readonly AssessmentEventContract[] {
    if (this._injectedEvents.length > 0) {
      return this._injectedEvents;
    }
    return SYNTHETIC_M17_FIXTURE_ASSESSMENTS;
  }

  public convertToDefensiveTelemetry(event: AssessmentEventContract): TelemetryEvent {
    let category: TelemetryEvent['category'] = 'NETWORK_CONNECTION';
    let severity: TelemetryEvent['severity'] = 'HIGH';

    if (event.actionType === 'AUTHENTICATION_SPRAY') {
      category = 'AUTHENTICATION';
      severity = 'HIGH';
    } else if (event.actionType === 'RCE_COMMAND_INJECTION') {
      category = 'PROCESS_EXECUTION';
      severity = 'CRITICAL';
    } else if (event.actionType === 'PRIVILEGE_ELEVATION') {
      category = 'PRIVILEGE_CHANGE';
      severity = 'CRITICAL';
    } else if (event.actionType === 'DNS_STAGING_EXFIL') {
      category = 'NETWORK_CONNECTION';
      severity = 'HIGH';
    }

    return {
      id: `tel-m17-${event.assessmentId}`,
      simTimestampSeconds: event.timestampSeconds,
      formattedTime: new Date(event.timestampSeconds * 1000).toISOString().substr(11, 8),
      category,
      severity,
      sourceHostId: event.targetHost,
      sourceIp: event.targetHost,
      eventSource: `m17-assessment:${event.toolName}`,
      title: `[Adversary Emulation] ${event.actionType}`,
      summary: event.payloadSummary,
      isKnownBenign: false,
      tags: ['m17_assessment', 'adversary_emulation', event.toolName],
    };
  }
}
