/**
 * Cyberlife — Milestone 23: Security Operations Analyst (SOC) CLI
 *
 * Implements high-volume incident triage and operational containment:
 * - Real-time SIEM alert queue monitoring across financial endpoints
 * - Telemetry deep packet / process inspection
 * - True Positive vs False Positive verdict evaluation
 * - Containment action dispatch (host network isolation, firewall IP block, suppression rules)
 * - Incident escalation ticket submission and response score calculation
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated in-memory telemetry. Zero real network commands or external connections.
 */

import { TerminalCommandHandler, TerminalCommandResult, TerminalExecutionContext } from './types';

export interface SocAlert {
  readonly id: string;
  readonly timestamp: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly sourceIp: string;
  readonly targetHost: string;
  readonly signature: string;
  readonly telemetrySnippet: string;
  readonly isTruePositive: boolean;
  readonly recommendedAction: 'isolate' | 'block_ip' | 'suppress' | 'escalate';
  verdict?: 'tp' | 'fp';
  actionTaken?: 'isolate' | 'block_ip' | 'suppress' | 'escalate';
}

export interface SocTriageSessionState {
  alerts: SocAlert[];
  submitted: boolean;
  score: number;
}

const DEFAULT_ALERTS: readonly SocAlert[] = [
  {
    id: 'ALT-301',
    timestamp: '08:14:02 UTC',
    severity: 'HIGH',
    sourceIp: '192.168.10.45',
    targetHost: 'fin-gateway-01.interbank.internal',
    signature: 'SSH_AUTH_BRUTE_FORCE_BURST',
    telemetrySnippet: '52 failed auth attempts within 8 seconds for user root/admin from internal marketing host 192.168.10.45.',
    isTruePositive: true,
    recommendedAction: 'isolate',
  },
  {
    id: 'ALT-302',
    timestamp: '08:15:33 UTC',
    severity: 'CRITICAL',
    sourceIp: '10.0.12.8',
    targetHost: '198.51.100.44',
    signature: 'DNS_COVERT_TUNNEL_BEACON',
    telemetrySnippet: 'Continuous high-entropy TXT queries exceeding 240 bytes to ns1.nxdomain-cdn.top carrying encoded payloads.',
    isTruePositive: true,
    recommendedAction: 'block_ip',
  },
  {
    id: 'ALT-303',
    timestamp: '08:16:15 UTC',
    severity: 'LOW',
    sourceIp: '10.0.8.2',
    targetHost: 'db-replica-02.interbank.internal',
    signature: 'SQL_MASS_SELECT_ANOMALY',
    telemetrySnippet: 'SELECT * on core_customer_ledger; Origin process matches signed cron job /opt/backup/daily_sync.sh.',
    isTruePositive: false,
    recommendedAction: 'suppress',
  },
  {
    id: 'ALT-304',
    timestamp: '08:17:40 UTC',
    severity: 'CRITICAL',
    sourceIp: '10.0.12.19',
    targetHost: 'swift-terminal-04.interbank.internal',
    signature: 'POWERSHELL_OBFUSCATED_DOWNLOAD',
    telemetrySnippet: 'powershell.exe -NonI -W Hidden -Enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQA... executing on payment switch.',
    isTruePositive: true,
    recommendedAction: 'isolate',
  },
];

let activeSocState: SocTriageSessionState = {
  alerts: DEFAULT_ALERTS.map(a => ({ ...a })),
  submitted: false,
  score: 0,
};

export function resetSocTriageSessionState(): void {
  activeSocState = {
    alerts: DEFAULT_ALERTS.map(a => ({ ...a })),
    submitted: false,
    score: 0,
  };
}

export function getSocTriageSessionState(): Readonly<SocTriageSessionState> {
  return activeSocState;
}

export const soctriageCommand: TerminalCommandHandler = {
  name: 'soctriage',
  description: 'Security Operations Center (SOC) CLI — High-volume alert triage, verdict assignment, and endpoint containment',
  usage: 'soctriage [list | inspect <alertId> | verdict <alertId> <tp|fp> | action <alertId> <action> | submit | status | reset]',
  execute: (args: string[], context: TerminalExecutionContext): TerminalCommandResult => {
    const sub = (args[0] ?? '').toLowerCase();

    if (!sub || sub === 'help') {
      return {
        stdout: [
          '=== Cedarline SecOps SIEM Triage Console (v3.1) ===',
          'Usage: soctriage <command> [options]',
          '',
          'Commands:',
          '  list                  Display incoming telemetry alert queue with severity and status',
          '  inspect <alertId>     Deep-dive packet trace, telemetry snippet, and process details',
          '  verdict <id> <tp|fp>  Assign True Positive (tp) or False Positive (fp) assessment',
          '  action <id> <action>  Apply containment (isolate | block_ip | suppress | escalate)',
          '  submit                Commit alert triage bundle, calculate accuracy score, and escalate',
          '  status                View triage progress across active alert batch',
          '  reset                 Reset active SOC queue to initial batch',
          '',
          'Active Feed: Broad Street Interbank Core Switching Subnet (10.0.12.0/24)',
        ],
      };
    }

    if (sub === 'list' || sub === 'queue') {
      const output = [
        '=== Broad Street Interbank — Active SIEM Alert Queue ===',
        'ALERT ID   TIME         SEVERITY   SOURCE IP       SIGNATURE                     VERDICT    ACTION',
        '------------------------------------------------------------------------------------------------------------------',
      ];

      for (const a of activeSocState.alerts) {
        const vStr = a.verdict ? a.verdict.toUpperCase().padEnd(10) : 'PENDING   ';
        const actStr = a.actionTaken ? a.actionTaken.padEnd(10) : 'NONE      ';
        output.push(
          `${a.id.padEnd(10)} ${a.timestamp.padEnd(12)} ${a.severity.padEnd(10)} ${a.sourceIp.padEnd(15)} ${a.signature.padEnd(29)} ${vStr} ${actStr}`
        );
      }

      output.push('');
      output.push('Run "soctriage inspect <alertId>" to analyze raw telemetry payloads.');
      output.push('Run "soctriage verdict <alertId> <tp|fp>" to assign assessment.');
      output.push('Run "soctriage action <alertId> <isolate|block_ip|suppress|escalate>" to apply containment.');

      return { stdout: output };
    }

    if (sub === 'inspect') {
      const alertId = (args[1] ?? '').toUpperCase();
      const alert = activeSocState.alerts.find(a => a.id === alertId);

      if (!alert) {
        return {
          isError: true,
          stdout: [`[!] Alert "${alertId}" not found. Run "soctriage list" to view queue.`],
        };
      }

      return {
        stdout: [
          `========================================================================================`,
          `ALERT TELEMETRY DOSSIER: ${alert.id}`,
          `========================================================================================`,
          `Timestamp:      ${alert.timestamp}`,
          `Severity:       ${alert.severity}`,
          `Detection Rule: ${alert.signature}`,
          `Source Host:    ${alert.sourceIp}`,
          `Target Host:    ${alert.targetHost}`,
          `Current Status: Verdict: ${alert.verdict ? alert.verdict.toUpperCase() : 'PENDING'} | Action: ${alert.actionTaken ?? 'NONE'}`,
          `----------------------------------------------------------------------------------------`,
          `RAW TELEMETRY PAYLOAD:`,
          `  ${alert.telemetrySnippet}`,
          `----------------------------------------------------------------------------------------`,
          `ANALYSIS GUIDANCE:`,
          alert.isTruePositive
            ? `  [!] Indicator matches known intrusion pattern. Recommended Action: ${alert.recommendedAction.toUpperCase()}`
            : `  [*] Indicator matches legitimate background maintenance job. Recommended Action: SUPPRESS`,
          `========================================================================================`,
        ],
      };
    }

    if (sub === 'verdict') {
      const alertId = (args[1] ?? '').toUpperCase();
      const verdict = (args[2] ?? '').toLowerCase();

      if (verdict !== 'tp' && verdict !== 'fp') {
        return {
          isError: true,
          stdout: ['Usage: soctriage verdict <alertId> <tp|fp> (e.g. soctriage verdict ALT-301 tp)'],
        };
      }

      const alert = activeSocState.alerts.find(a => a.id === alertId);
      if (!alert) {
        return {
          isError: true,
          stdout: [`[!] Alert "${alertId}" not found.`],
        };
      }

      alert.verdict = verdict;

      return {
        stdout: [
          `[+] Alert ${alert.id} verdict assigned: ${verdict === 'tp' ? 'TRUE POSITIVE' : 'FALSE POSITIVE'}`,
          `    Next: Run "soctriage action ${alert.id} <isolate|block_ip|suppress|escalate>" to execute containment.`,
        ],
      };
    }

    if (sub === 'action') {
      const alertId = (args[1] ?? '').toUpperCase();
      const action = (args[2] ?? '').toLowerCase() as SocAlert['actionTaken'];

      const validActions = ['isolate', 'block_ip', 'suppress', 'escalate'];
      if (!action || !validActions.includes(action)) {
        return {
          isError: true,
          stdout: ['Usage: soctriage action <alertId> <isolate|block_ip|suppress|escalate>'],
        };
      }

      const alert = activeSocState.alerts.find(a => a.id === alertId);
      if (!alert) {
        return {
          isError: true,
          stdout: [`[!] Alert "${alertId}" not found.`],
        };
      }

      alert.actionTaken = action;

      let actionDesc = '';
      switch (action) {
        case 'isolate':
          actionDesc = `VLAN port isolation triggered for ${alert.sourceIp}. Host disconnected from production gateway.`;
          break;
        case 'block_ip':
          actionDesc = `Firewall rule #FW-DROP-9022 appended. Ingress/egress drop applied for ${alert.targetHost}.`;
          break;
        case 'suppress':
          actionDesc = `Rule tuned with exclusion filter for authorized cron job. Alert suppressed for 30 days.`;
          break;
        case 'escalate':
          actionDesc = `Incident escalation ticket dispatched to Cedarline Tier 3 IR team.`;
          break;
      }

      return {
        stdout: [
          `[+] Containment action applied to ${alert.id}: [${action.toUpperCase()}]`,
          `    ${actionDesc}`,
          `[+] Telemetry state updated across Broad Street Interbank gateway.`,
        ],
      };
    }

    if (sub === 'submit') {
      const unassigned = activeSocState.alerts.filter(a => !a.verdict || !a.actionTaken);
      if (unassigned.length > 0) {
        return {
          isError: true,
          stdout: [
            `[!] INCOMPLETE TRIAGE: ${unassigned.length} alerts still pending verdict or containment action.`,
            `    Pending: ${unassigned.map(a => a.id).join(', ')}`,
            '    Review all alerts with "soctriage list" before submitting batch.',
          ],
        };
      }

      // Calculate accuracy
      let correct = 0;
      for (const a of activeSocState.alerts) {
        const verdictMatches = (a.verdict === 'tp' && a.isTruePositive) || (a.verdict === 'fp' && !a.isTruePositive);
        const actionMatches = a.actionTaken === a.recommendedAction;
        if (verdictMatches && actionMatches) {
          correct += 1;
        }
      }

      const score = Math.round((correct / activeSocState.alerts.length) * 100);
      activeSocState.score = score;
      activeSocState.submitted = true;

      return {
        stdout: [
          '========================================================================================',
          '               CEDARLINE SOLUTIONS // SECURITY OPERATIONS CENTER (SOC)',
          '                      INCIDENT TRIAGE & CONTAINMENT SCORECARD',
          '========================================================================================',
          `ANALYST:          ${context.currentUser.displayName} // ${context.currentUser.role}`,
          `LOCATION:         Broad Street Interbank Financial Corridor`,
          `TOTAL ALERTS:     ${activeSocState.alerts.length}`,
          `CORRECT ACTIONS:  ${correct} / ${activeSocState.alerts.length}`,
          `TRIAGE ACCURACY:  ${score}%`,
          '----------------------------------------------------------------------------------------',
          'CONTAINMENT ACTIONS SUMMARY:',
          '  [+] ALT-301: Host 192.168.10.45 isolated from internal LAN (SSH brute force contained).',
          '  [+] ALT-302: C2 Beacon IP 198.51.100.44 blocked at perimeter edge firewall.',
          '  [+] ALT-303: Scheduled backup job verified as legitimate FP and rule tuned.',
          '  [+] ALT-304: SWIFT terminal 10.0.12.19 quarantined; malware payload contained.',
          '----------------------------------------------------------------------------------------',
          '[+] INCIDENT TICKET #INC-9042 ESCALATED WITH FULL AUDIT CHAIN.',
          '[+] Objective Completed: Tier 2 SOC Alert Triage & Incident Scoping Complete.',
          '========================================================================================',
        ],
      };
    }

    if (sub === 'status') {
      const triagedCount = activeSocState.alerts.filter(a => a.verdict && a.actionTaken).length;
      return {
        stdout: [
          '=== SOC Triage Session Status ===',
          `Total Alerts:     ${activeSocState.alerts.length}`,
          `Triaged:          ${triagedCount} / ${activeSocState.alerts.length}`,
          `Batch Submitted:  ${activeSocState.submitted ? 'YES' : 'NO'}`,
          `Accuracy Score:   ${activeSocState.submitted ? `${activeSocState.score}%` : 'N/A'}`,
        ],
      };
    }

    if (sub === 'reset') {
      resetSocTriageSessionState();
      return { stdout: ['[+] SOC triage queue reset to initial state.'] };
    }

    return {
      isError: true,
      stdout: [`Unknown soctriage command "${sub}". Run "soctriage help" for usage.`],
    };
  },
};
