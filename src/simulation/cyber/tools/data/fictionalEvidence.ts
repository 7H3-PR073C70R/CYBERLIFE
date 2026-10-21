/**
 * Cyberlife : Fictional Evidence Objects Dataset
 *
 * Deterministic catalog of digital evidence records preserved in the
 * Cedarline Security Operations Center vault.
 *
 * STRICT SAFETY INVARIANT:
 * Zero host file system interaction. All artifacts are simulated memory objects.
 *
 * EDUCATIONAL OBJECTIVE:
 * Teaches players that digital forensic evidence must maintain unbroken chain-of-custody,
 * be verified against cryptographic hashes (e.g. SHA-256), and remain strictly read-only.
 */

import { FictionalEvidenceItem } from '../types';

export const FICTIONAL_EVIDENCE: readonly FictionalEvidenceItem[] = [
  {
    id: 'EVD-2026-001',
    title: 'Authentication Log Export (Marina Cluster Morning Baseline)',
    source: 'mon-siem-01:/var/log/audit/auth_20261012_0755.csv',
    collectionTime: 'Monday, Oct 12, 2026 // 07:55:00 WAT',
    evidenceType: 'Structured Event Log Export (CSV format)',
    integrityStatus: 'VERIFIED',
    hashSha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    description:
      'Forensic CSV export containing all Kerberos ticket grants, interactive logins, and failed auth attempts across Marina subnet between 07:00:00 and 07:55:00 WAT.',
    requiredTier: 1,
    chainOfCustody: [
      {
        time: '07:55:10 WAT',
        handler: 'Michael (Lead Incident Response)',
        action: 'Acquired read-only snapshot via SIEM cryptographic export API.',
        signature: 'SIG-IR-99120',
      },
      {
        time: '07:57:30 WAT',
        handler: 'Automated Forensic Vault Agent',
        action: 'Computed SHA-256 checksum and verified storage block integrity.',
        signature: 'SIG-VAULT-HASH-OK',
      },
      {
        time: '07:59:00 WAT',
        handler: 'Protector (Security Analyst Intern)',
        action: 'Assigned for initial morning baseline inspection.',
        signature: 'SIG-ANALYST-READ',
      },
    ],
    artifactSnippet: [
      'timestamp,principal,client_ip,server_ip,auth_method,result,notes',
      '07:35:45,tade_adebayo@CORP.LOCAL,10.0.4.15,10.0.4.15,PAM_LOCAL,SUCCESS,Console session opened',
      '07:44:22,folake_alabi@CORP.LOCAL,10.0.4.22,10.0.4.80,HTTP_FORM,FAILURE,Invalid password hash',
      '07:45:03,folake_alabi@CORP.LOCAL,10.0.4.22,10.0.4.80,HTTP_FORM,SUCCESS,Retry accepted',
      '07:50:51,folake_alabi@CORP.LOCAL,10.0.4.22,10.0.4.50,KERBEROS,SUCCESS,SMB share access',
    ],
  },
  {
    id: 'EVD-2026-002',
    title: 'Perimeter Gateway Egress Drop Header Slice',
    source: 'gw-core-01:/var/log/suricata/drops_slice_0750.pcap',
    collectionTime: 'Monday, Oct 12, 2026 // 07:50:00 WAT',
    evidenceType: 'Network Packet Capture (Metadata Header Slice)',
    integrityStatus: 'VERIFIED',
    hashSha256: 'a3c299e19d2b7c41e8f9e2b10098df1234bc5678ef0123456789abcdef012345',
    description:
      'First 128 bytes of dropped egress packet headers triggered by perimeter rule #14 when an internal process tried sending syn packets to unallocated documentation range 198.51.100.99.',
    requiredTier: 1,
    chainOfCustody: [
      {
        time: '07:50:15 WAT',
        handler: 'gw-core-01 Firewall Daemon',
        action: 'Automated ring-buffer packet header slice written on rule trigger.',
        signature: 'SIG-FW-AUTO-RING',
      },
      {
        time: '07:52:00 WAT',
        handler: 'Anjola (IT Systems Admin)',
        action: 'Preserved pcap slice and notified SecOps team.',
        signature: 'SIG-ADMIN-HANDOFF',
      },
    ],
    artifactSnippet: [
      'Frame 1: 128 bytes on wire (1024 bits), 128 bytes captured',
      'Ethernet II, Src: 00:50:56:a4:02:22 (ws-finance-02), Dst: 00:50:56:a4:00:01 (gw-core-01)',
      'Internet Protocol Version 4, Src: 10.0.4.22, Dst: 198.51.100.99',
      'Transmission Control Protocol, Src Port: 49812, Dst Port: 443, Seq: 1, Len: 0, Flags: [SYN]',
      'Filter Action: DROPPED (Egress rule #14 matched)',
    ],
  },
  {
    id: 'EVD-2026-003',
    title: 'Payroll Staging Exception Traceback Dump',
    source: 'app-portal-01:/opt/tomcat/logs/catalina.2026-10-12.dump',
    collectionTime: 'Monday, Oct 12, 2026 // 07:54:15 WAT',
    evidenceType: 'Application Server Core & Stack Trace Dump',
    integrityStatus: 'VERIFIED',
    hashSha256: '4b912c009941a3e6f9876543210fedcba9876543210fedcba9876543210fedcb',
    description:
      'Java exception traceback and database pool connection diagnostics recorded when the experimental payroll staging service exhausted its connection quota during morning batch execution.',
    requiredTier: 1,
    chainOfCustody: [
      {
        time: '07:54:20 WAT',
        handler: 'Systemd Watchdog Daemon',
        action: 'Captured process core dump before triggering supervisor restart.',
        signature: 'SIG-SYSTEMD-CRASH-DUMP',
      },
      {
        time: '07:56:00 WAT',
        handler: 'Michael (Lead Incident Response)',
        action: 'Archived trace dump into incident investigation evidence locker.',
        signature: 'SIG-IR-ARCHIVE',
      },
    ],
    artifactSnippet: [
      '2026-10-12 07:53:30.104 ERROR [http-nio-8080-exec-4] org.apache.tomcat.jdbc.pool.ConnectionPool',
      'org.apache.tomcat.jdbc.pool.PoolExhaustedException: Timeout: Pool empty. Unable to fetch a connection in 30000 msec, none available[size:10; busy:10; idle:0; waiting:4]',
      '  at org.apache.tomcat.jdbc.pool.ConnectionPool.borrowConnection(ConnectionPool.java:683)',
      '  at com.cedarline.payroll.staging.DatabaseSynchronizer.executeSync(DatabaseSynchronizer.java:88)',
      '  at com.cedarline.payroll.staging.SyncServlet.doPost(SyncServlet.java:42)',
    ],
  },
  {
    id: 'EVD-2026-004',
    title: 'Aster AI Assistant IAM Configuration & Token Manifest',
    source: 'app-portal-01:/etc/aster/service.conf',
    collectionTime: 'Monday, Oct 12, 2026 // 07:56:00 WAT',
    evidenceType: 'Service Identity & Access Control Policy Dump (JSON)',
    integrityStatus: 'VERIFIED',
    hashSha256: '3a5f9c12e82b4a11c3ab8bf7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa',
    description:
      'Forensic configuration snapshot of the Aster internal assistant daemon on app-portal-01. Demonstrates service account svc-aster granted role:corporate-admin and wildcard scopes ["*"], enabling unauthorized SMB queries to filesrv-01.',
    requiredTier: 1,
    chainOfCustody: [
      {
        time: '07:56:10 WAT',
        handler: 'Blessing (Lead Security Analyst)',
        action: 'Extracted active service descriptor from app-portal-01 memory snapshot.',
        signature: 'SIG-LEAD-SEC-EXTRACT',
      },
      {
        time: '07:57:00 WAT',
        handler: 'Automated Forensic Vault Agent',
        action: 'Registered artifact in Cedarline evidence locker with SHA-256 seal.',
        signature: 'SIG-VAULT-HASH-VERIFIED',
      },
    ],
    artifactSnippet: [
      '{',
      '  "service_id": "aster-ai-core",',
      '  "account": "svc-aster@corp.local",',
      '  "assigned_role": "corporate-admin",',
      '  "granted_scopes": ["*"],',
      '  "allowed_subnets": ["10.0.4.0/24"],',
      '  "smb_direct_mount": true,',
      '  "target_shares": ["//filesrv-01/dept_shares/finance"],',
      '  "security_violation": "Excessive administrative wildcard permissions violate Least Privilege."',
      '}',
    ],
  },
  {
    id: 'EVD-2026-RESTRICTED',
    title: 'Executive Cryptographic Vault Key Ceremony Manifest',
    source: 'vault-core-01:/secure/audit/key_ceremony_01.enc',
    collectionTime: 'Monday, Oct 12, 2026 // 06:00:00 WAT',
    evidenceType: 'Encrypted HSM Audit Manifest',
    integrityStatus: 'VERIFIED',
    hashSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    description:
      'Strictly restricted cryptographic key generation manifest containing split-knowledge multi-custodian records.',
    requiredTier: 2, // Demonstrates permission restriction for Tier 1 Intern!
    chainOfCustody: [
      {
        time: '06:00:00 WAT',
        handler: 'Chief Information Security Officer & IR Lead',
        action: 'Dual-custody hardware key activation ceremony.',
        signature: 'SIG-EXEC-RESTRICTED',
      },
    ],
    artifactSnippet: ['[RESTRICTED CONTENT : CLEARANCE TIER 2 REQUIRED TO VIEW]'],
  },
];

export function getFictionalEvidence(): readonly FictionalEvidenceItem[] {
  return FICTIONAL_EVIDENCE;
}

export function findEvidenceById(id: string): FictionalEvidenceItem | undefined {
  const normalized = id.trim().toUpperCase();
  return FICTIONAL_EVIDENCE.find(e => e.id.toUpperCase() === normalized);
}
