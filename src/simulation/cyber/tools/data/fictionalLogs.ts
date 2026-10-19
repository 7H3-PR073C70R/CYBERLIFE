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
    user: 'tade_adebayo',
    message: 'Interactive workstation login succeeded for user tade_adebayo via local PAM.',
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
    user: 'folake_alabi',
    message: 'Web portal password verification failed for account folake_alabi from 10.0.4.22.',
    details: 'Failure reason: invalid password hash. Consecutive failures on account: 1.',
  },
  {
    id: 'LOG-2026-105',
    timestamp: '07:45:03 AM',
    source: 'auth',
    severity: 'INFO',
    eventType: 'AUTH_SUCCESS',
    hostId: 'app-portal-01',
    user: 'folake_alabi',
    message: 'Web portal authentication succeeded on retry for folake_alabi from 10.0.4.22.',
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
    user: 'folake_alabi',
    message: 'Shared directory //filesrv-01/dept_shares/finance accessed with read/write tokens.',
    details: 'Client IP: 10.0.4.22; Kerberos principal: folake_alabi@CORP.LOCAL.',
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
