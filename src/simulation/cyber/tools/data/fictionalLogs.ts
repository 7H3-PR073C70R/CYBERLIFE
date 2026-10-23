/**
 * Cyberlife — Fictional Security & Application Logs Dataset
 *
 * Deterministic log dataset for simulated log analysis (`logview`).
 * Timestamps align with the authoritative in-game simulation morning timeline.
 *
 * EDUCATIONAL OBJECTIVE:
 * Teaches players that real-world logs contain mostly normal operational noise.
 * A single failed password or temporary timeout does not automatically constitute
 * an attack. Correlation across time, user, and host is required.
 */

import { FictionalLogEntry } from '../types';

export const FICTIONAL_LOGS: readonly FictionalLogEntry[] = [
  {
    id: 'LOG-2026-101',
    timestamp: '07:30:12 AM',
    source: 'system',
    severity: 'INFO',
    eventType: 'SERVICE_START',
    hostId: 'gw-core-01',
    message: 'Perimeter gateway core routing daemon started; 14 physical interfaces active.',
    details: 'BGP and OSPF adjacencies synchronized with Marina regional node.',
  },
  {
    id: 'LOG-2026-102',
    timestamp: '07:35:45 AM',
    source: 'auth',
    severity: 'INFO',
    eventType: 'AUTH_SUCCESS',
    hostId: 'ws-sec-04',
    user: 'protector',
    message: 'Interactive workstation login succeeded for user protector via local PAM.',
    details: 'Session ID: ses_sec_99182; console attached to display :0.',
  },
  {
    id: 'LOG-2026-103',
    timestamp: '07:41:04 AM',
    source: 'file-server',
    severity: 'INFO',
    eventType: 'SHARE_MOUNT',
    hostId: 'filesrv-01',
    user: 'system',
    message: 'Nightly incremental backup volume /mnt/storage/backups unmounted cleanly.',
    details: 'Integrity checksums verified (status 0). Volume marked read-only snapshot.',
  },
  {
    id: 'LOG-2026-104',
    timestamp: '07:44:22 AM',
    source: 'auth',
    severity: 'WARN',
    eventType: 'AUTH_FAILURE',
    hostId: 'app-portal-01',
    user: 'goodness_alabi',
    message: 'Web portal password verification failed for account goodness_alabi from 10.0.4.22.',
    details: 'Failure reason: invalid password hash. Consecutive failures on account: 1.',
  },
  {
    id: 'LOG-2026-105',
    timestamp: '07:45:03 AM',
    source: 'auth',
    severity: 'INFO',
    eventType: 'AUTH_SUCCESS',
    hostId: 'app-portal-01',
    user: 'goodness_alabi',
    message: 'Web portal authentication succeeded on retry for goodness_alabi from 10.0.4.22.',
    details: 'Password accepted; session token issued. Preceding failed attempt cleared.',
  },
  {
    id: 'LOG-2026-106',
    timestamp: '07:48:19 AM',
    source: 'firewall',
    severity: 'INFO',
    eventType: 'CONNECTION_BLOCKED',
    hostId: 'gw-core-01',
    user: 'system',
    message: 'Outbound TCP connection to non-routable destination 198.51.100.99:443 blocked.',
    details: 'Blocked by egress policy rule #14 (Drop unassigned documentation IP ranges).',
  },
  {
    id: 'LOG-2026-107',
    timestamp: '07:50:51 AM',
    source: 'file-server',
    severity: 'INFO',
    eventType: 'FILE_ACCESS',
    hostId: 'filesrv-01',
    user: 'goodness_alabi',
    message: 'Shared directory //filesrv-01/dept_shares/finance accessed with read/write tokens.',
    details: 'Client IP: 10.0.4.22; Kerberos principal: goodness_alabi@CORP.LOCAL.',
  },
  {
    id: 'LOG-2026-107B',
    timestamp: '07:51:30 AM',
    source: 'file-server',
    severity: 'WARN',
    eventType: 'UNAUTHORIZED_FILE_READ',
    hostId: 'filesrv-01',
    user: 'svc-aster',
    message:
      'Service account svc-aster performed bulk read on confidential file //filesrv-01/dept_shares/finance/payroll_q3_confidential.xlsx.',
    details:
      'Read size: 4.2 MB; SMB handle #8812; authenticated via Bearer token issued to svc-aster on app-portal-01 with role:corporate-admin.',
  },
  {
    id: 'LOG-2026-108',
    timestamp: '07:53:30 AM',
    source: 'app-portal',
    severity: 'ERROR',
    eventType: 'DATABASE_TIMEOUT',
    hostId: 'app-portal-01',
    user: 'system',
    message: 'Database connection pool timeout on payroll staging API endpoint (/api/v1/sync).',
    details: 'SQL state 08001: Connection pool exhausted after 30000ms. 0 connections available.',
  },
  {
    id: 'LOG-2026-109',
    timestamp: '07:55:02 AM',
    source: 'system',
    severity: 'NOTICE',
    eventType: 'SERVICE_RESTART',
    hostId: 'app-portal-01',
    user: 'system',
    message: 'Service tomcat-payroll-staging restarted automatically by supervisor watchdog.',
    details: 'Supervisor rule: restart on exit status 143. Uptime reset.',
  },
  {
    id: 'LOG-2026-109B',
    timestamp: '07:55:45 AM',
    source: 'auth',
    severity: 'WARN',
    eventType: 'IAM_PRIVILEGE_MISMATCH',
    hostId: 'mon-siem-01',
    user: 'svc-aster',
    message:
      'SIEM anomaly detection alert: svc-aster granted administrative scope ["*"] inconsistent with documentation assistant purpose.',
    details:
      'Alert rule #IR-882: Service account privilege exceeds baseline role requirements. Recommended action: isolate service and enforce least privilege.',
  },
  {
    id: 'LOG-2026-108B',
    timestamp: '07:56:40 AM',
    source: 'app-portal',
    severity: 'INFO',
    eventType: 'HEALTH_CHECK_OK',
    hostId: 'app-portal-01',
    user: 'system',
    message: 'Application health check returned HTTP 200 OK after service restart.',
    details: 'Database pool re-established with 10 idle connections.',
  },
  {
    id: 'LOG-2026-110',
    timestamp: '07:58:15 AM',
    source: 'auth',
    severity: 'WARN',
    eventType: 'AUTH_FAILURE',
    hostId: 'filesrv-01',
    message: 'Anonymous SMB session setup request rejected on administrative share IPC$.',
    details: 'Origin IP: 10.0.4.22; NT status STATUS_ACCESS_DENIED. Anonymous binds prohibited.',
  },
  {
    id: 'LOG-2026-111',
    timestamp: '08:00:00 AM',
    source: 'system',
    severity: 'INFO',
    eventType: 'AUDIT_SYNC',
    hostId: 'mon-siem-01',
    user: 'system',
    message: 'Scheduled morning audit synchronization completed across Marina subnet 10.0.4.0/24.',
    details: 'Telemetry sources: 6 hosts reporting; 0 agent faults detected.',
  },
  // ============================================================================
  // ORION SIEM CEF ALERTS (mon-siem-01)
  // ============================================================================
  {
    id: 'LOG-2026-CEF-01',
    timestamp: '07:42:01 AM',
    source: 'siem',
    severity: 'WARN',
    eventType: 'ALERT_SMB_TRAVERSAL',
    hostId: 'mon-siem-01',
    user: 'svc-aster',
    message:
      'CEF:0|CedarlineSec|OrionSIEM|2026.2|ALERT_SMB_TRAVERSAL|Unauthorized SMB Tree Connect to Confidential Share|7|src=10.0.4.15 dst=10.0.4.20 spt=51204 dpt=445 suser=svc-aster msg=Tree connect to \\\\filesrv-01\\confidential$ granted under corporate-admin role',
    rawCef:
      'CEF:0|CedarlineSec|OrionSIEM|2026.2|ALERT_SMB_TRAVERSAL|Unauthorized SMB Tree Connect to Confidential Share|7|src=10.0.4.15 dst=10.0.4.20 spt=51204 dpt=445 suser=svc-aster msg=Tree connect to \\\\filesrv-01\\confidential$ granted under corporate-admin role',
    details:
      'SIEM Correlation Engine: Service account svc-aster initiated tree connect to confidential management share using wildcard administrative token.',
  },
  {
    id: 'LOG-2026-CEF-02',
    timestamp: '07:42:02 AM',
    source: 'siem',
    severity: 'ERROR',
    eventType: 'ALERT_OUTBOUND_TLS_ANOMALY',
    hostId: 'mon-siem-01',
    user: 'svc-aster',
    message:
      'CEF:0|CedarlineSec|OrionSIEM|2026.2|ALERT_OUTBOUND_TLS_ANOMALY|Unexpected TLS Egress from Application Tier|8|src=10.0.4.15 dst=196.220.10.5 spt=49812 dpt=8443 cs1=vault-core-01.transit.internal cs2=JA3:72c6499890ba msg=Outbound connection to unclassified external transit node',
    rawCef:
      'CEF:0|CedarlineSec|OrionSIEM|2026.2|ALERT_OUTBOUND_TLS_ANOMALY|Unexpected TLS Egress from Application Tier|8|src=10.0.4.15 dst=196.220.10.5 spt=49812 dpt=8443 cs1=vault-core-01.transit.internal cs2=JA3:72c6499890ba msg=Outbound connection to unclassified external transit node',
    details:
      'External TLS handshake detected destined for vault-core-01.transit.internal (Eko Nexus pipeline staging node). Application tier should have no external routing.',
  },
  {
    id: 'LOG-2026-CEF-03',
    timestamp: '07:42:02 AM',
    source: 'siem',
    severity: 'WARN',
    eventType: 'ALERT_SMB_TRAVERSAL',
    hostId: 'mon-siem-01',
    user: 'svc-aster',
    message:
      'CEF:0|CedarlineSec|OrionSIEM|2026.2|ALERT_SMB_TRAVERSAL|Unauthorized SMB Tree Connect to Confidential Share|7|src=10.0.4.15 dst=10.0.4.20 spt=51204 dpt=445 suser=svc-aster msg=Duplicate alert: Tree connect to \\\\filesrv-01\\confidential$',
    rawCef:
      'CEF:0|CedarlineSec|OrionSIEM|2026.2|ALERT_SMB_TRAVERSAL|Unauthorized SMB Tree Connect to Confidential Share|7|src=10.0.4.15 dst=10.0.4.20 spt=51204 dpt=445 suser=svc-aster msg=Duplicate alert: Tree connect to \\\\filesrv-01\\confidential$',
    details: 'Duplicate event emitted by secondary correlation rule.',
  },
  {
    id: 'LOG-2026-CEF-04',
    timestamp: '07:43:00 AM',
    source: 'siem',
    severity: 'INFO',
    eventType: 'ALERT_HEALTH_PROBE',
    hostId: 'mon-siem-01',
    message:
      'CEF:0|CedarlineSec|OrionSIEM|2026.2|ALERT_HEALTH_PROBE|AWS Staging Load Balancer Health Check|2|src=10.0.4.99 dst=10.0.4.15 spt=443 dpt=8080 msg=Routine TCP 8080 health check',
    rawCef:
      'CEF:0|CedarlineSec|OrionSIEM|2026.2|ALERT_HEALTH_PROBE|AWS Staging Load Balancer Health Check|2|src=10.0.4.99 dst=10.0.4.15 spt=443 dpt=8080 msg=Routine TCP 8080 health check',
    details: 'Routine background monitoring noise from staging balancer.',
  },
  {
    id: 'LOG-2026-CEF-SUPPRESSED',
    timestamp: '07:45:10 AM',
    source: 'siem',
    severity: 'WARN',
    eventType: 'ALERT_TICKET_SUPPRESSION',
    hostId: 'mon-siem-01',
    user: 'mfemi',
    message:
      'CEF:0|CedarlineSec|OrionSIEM|2026.2|ALERT_TICKET_SUPPRESSION|Ticket ALT-2026-1012 Suppressed from Executive Digest|6|src=10.0.4.200 cs3=SUPPRESSED_FROM_EXEC_DASHBOARD cs4=user:mfemi msg=Ticket ALT-2026-1012 suppressed from Morning Exec Briefing by user:mfemi',
    rawCef:
      'CEF:0|CedarlineSec|OrionSIEM|2026.2|ALERT_TICKET_SUPPRESSION|Ticket ALT-2026-1012 Suppressed from Executive Digest|6|src=10.0.4.200 cs3=SUPPRESSED_FROM_EXEC_DASHBOARD cs4=user:mfemi msg=Ticket ALT-2026-1012 suppressed from Morning Exec Briefing by user:mfemi',
    details:
      'Management override logged: VP Michael (mfemi) excluded ticket ALT-2026-1012 from executive security summary ahead of board acquisition review.',
  },
  // ============================================================================
  // SYSMON EVENT RECORDS (app-portal-01)
  // ============================================================================
  {
    id: 'LOG-2026-SYS-01',
    timestamp: '07:42:01 AM',
    source: 'sysmon',
    severity: 'WARN',
    eventType: 'SYSMON_EVENT_1',
    hostId: 'app-portal-01',
    user: 'CEDARLINE\\svc-aster',
    message:
      'Sysmon Event 1: aster-agent-worker.exe spawned targeting \\\\filesrv-01\\confidential$\\payroll_2026_q3_draft.xlsx',
    details:
      'Sysmon Process Creation (Event ID 1):\n  UtcTime:      2026-10-12 06:42:01.710\n  ProcessId:    4812\n  Image:        C:\\Cedarline\\Aster\\bin\\aster-agent-worker.exe\n  CommandLine:  aster-agent-worker.exe --task=retrieve --target=\\\\filesrv-01\\confidential$\\payroll_2026_q3_draft.xlsx\n  User:         CEDARLINE\\svc-aster\n  ParentImage:  C:\\Windows\\System32\\services.exe\n  Hashes:       SHA256=d8f1b2c45e6a789012345678abcdef0123456789abcdef0123456789abcdef01',
    sysmon: {
      eventId: 1,
      processId: 4812,
      image: 'C:\\Cedarline\\Aster\\bin\\aster-agent-worker.exe',
      commandLine:
        'aster-agent-worker.exe --task=retrieve --target=\\\\filesrv-01\\confidential$\\payroll_2026_q3_draft.xlsx',
      user: 'CEDARLINE\\svc-aster',
      parentImage: 'C:\\Windows\\System32\\services.exe',
    },
  },
  {
    id: 'LOG-2026-SYS-03',
    timestamp: '07:42:02 AM',
    source: 'sysmon',
    severity: 'WARN',
    eventType: 'SYSMON_EVENT_3',
    hostId: 'app-portal-01',
    user: 'CEDARLINE\\svc-aster',
    message:
      'Sysmon Event 3: aster-agent-worker.exe network connection to 196.220.10.5:8443 (vault-core-01.transit.internal)',
    details:
      'Sysmon Network Connection (Event ID 3):\n  UtcTime:             2026-10-12 06:42:02.104\n  ProcessId:           4812\n  Image:               C:\\Cedarline\\Aster\\bin\\aster-agent-worker.exe\n  User:                CEDARLINE\\svc-aster\n  Protocol:            tcp\n  Initiated:           true\n  SourceIp:            10.0.4.15\n  SourcePort:          49812\n  DestinationIp:       196.220.10.5\n  DestinationPort:     8443\n  DestinationHostname: vault-core-01.transit.internal',
    sysmon: {
      eventId: 3,
      processId: 4812,
      image: 'C:\\Cedarline\\Aster\\bin\\aster-agent-worker.exe',
      user: 'CEDARLINE\\svc-aster',
      protocol: 'tcp',
      destinationIp: '196.220.10.5',
      destinationPort: 8443,
      destinationHostname: 'vault-core-01.transit.internal',
    },
  },
];

export function getFictionalLogs(): readonly FictionalLogEntry[] {
  return FICTIONAL_LOGS;
}

export function filterLogs(options: {
  source?: string;
  severity?: string;
  limit?: number;
}): readonly FictionalLogEntry[] {
  let filtered = FICTIONAL_LOGS;

  if (options.source) {
    const s = options.source.trim().toLowerCase();
    filtered = filtered.filter(log => log.source.toLowerCase() === s);
  }

  if (options.severity) {
    const sev = options.severity.trim().toUpperCase();
    filtered = filtered.filter(log => log.severity.toUpperCase() === sev);
  }

  if (typeof options.limit === 'number' && options.limit > 0) {
    filtered = filtered.slice(0, options.limit);
  }

  return filtered;
}

export function findLogById(id: string): FictionalLogEntry | undefined {
  const normalized = id.trim().toUpperCase();
  return FICTIONAL_LOGS.find(l => l.id.toUpperCase() === normalized);
}
