/**
 * Cyberlife — Milestone 14: Offensive Simulation Fixtures
 *
 * Seeded scenarios, authorized Rules of Engagement, Metasploit-inspired modules,
 * and synthetic targets for the offensive security lab.
 *
 * All targets and data are completely simulated and in-memory.
 */

import { RulesOfEngagement } from '../humanPhysical/types';
import { ExploitLabModule, OffensiveTargetAsset } from './types';

// ============================================================================
// 1. Authorized Rules of Engagement (RoE)
// ============================================================================

export const ROE_CEDARLINE_RED_2026: RulesOfEngagement = {
  engagementId: 'ROE-2026-RED-001',
  clientName: 'Cedarline Insurance & Financial Services Plc',
  authorizedAssessorName: 'Independent Security Specialist (Player)',
  effectiveStartDate: '2026-10-15T00:00:00Z',
  effectiveEndDate: '2026-10-25T23:59:59Z',
  authorizedRoles: ['RED_TEAM', 'PURPLE_TEAM', 'INDEPENDENT_INVESTIGATOR'],
  allowedTechniques: [
    'Authorized attack surface discovery & port enumeration',
    'Controlled vulnerability verification via proof-of-concept simulation',
    'SMB null session and tree connection auditing',
    'Redis unauthenticated command execution validation',
    'JWT signature bypass and algorithm verification',
    'IDOR and parameter tampering assessment on staging APIs',
    'Non-destructive dry-run vulnerability probing',
  ],
  prohibitedTechniques: [
    'denial_of_service',
    'data_destruction',
    'unauthorized_credential_dump',
    'brute_force_lockout',
    'production_interruption',
  ],
  inScopeTargets: [
    {
      targetType: 'HOST',
      identifier: 'filesrv-01',
      description: 'Internal payroll & departmental SMB file server (10.0.4.20)',
    },
    {
      targetType: 'HOST',
      identifier: 'app-portal-01',
      description: 'Corporate intranet web portal & assistant node (10.0.4.10)',
    },
    {
      targetType: 'HOST',
      identifier: 'redis-01',
      description: 'Internal caching and queue daemon (10.0.4.40)',
    },
    {
      targetType: 'HOST',
      identifier: 'dev-api-01',
      description: 'Staging microservice & employee directory API (10.0.4.30)',
    },
    {
      targetType: 'SUBNET',
      identifier: '10.0.4.0/24',
      description: 'Staging LAN cluster for Marina Tower internal operations',
    },
  ],
  emergencyContactPhone: '+234 1 234 5678 (SOC Emergency Desk)',
  signatureSha256: '9f8e7d6c5b4a3928170e1d2c3b4a59687e8d7c6b5a493827160e1d2c3b4a5968',
  isSignedAndActive: true,
};

export const ROE_EXPIRED_ENGAGEMENT: RulesOfEngagement = {
  engagementId: 'ROE-2025-ARCHIVED',
  clientName: 'Legacy Cedarline Staging 2025',
  authorizedAssessorName: 'Former Contractor',
  effectiveStartDate: '2025-01-01T00:00:00Z',
  effectiveEndDate: '2025-02-01T00:00:00Z',
  authorizedRoles: ['RED_TEAM'],
  allowedTechniques: ['Controlled vulnerability verification'],
  prohibitedTechniques: ['denial_of_service'],
  inScopeTargets: [
    {
      targetType: 'HOST',
      identifier: 'filesrv-01',
      description: 'Expired scope host',
    },
  ],
  emergencyContactPhone: 'N/A',
  signatureSha256: '0000111122223333444455556666777788889999aaaabbbbccccddddeeeeffff',
  isSignedAndActive: false, // Expired / Inactive
};

export const ROE_DRAFT_UNAPPROVED: RulesOfEngagement = {
  engagementId: 'ROE-2026-DRAFT',
  clientName: 'Unapproved Corporate Assessment',
  authorizedAssessorName: 'Pending Approval',
  effectiveStartDate: '2026-11-01T00:00:00Z',
  effectiveEndDate: '2026-11-15T00:00:00Z',
  authorizedRoles: ['RED_TEAM'],
  allowedTechniques: [],
  prohibitedTechniques: ['denial_of_service', 'data_destruction'],
  inScopeTargets: [],
  emergencyContactPhone: 'N/A',
  signatureSha256: '',
  isSignedAndActive: false,
};

// ============================================================================
// 2. Metasploit-Inspired Exploit Lab Modules
// ============================================================================

export const EXPLOIT_LAB_MODULES: readonly ExploitLabModule[] = [
  {
    id: 'mod_smb_tree_hijack',
    name: 'Cedarline SMB Tree Connect Session Hijack',
    cve: 'CVE-2026-ASTER-01',
    category: 'auth_bypass',
    severity: 'HIGH',
    description:
      'Exploits unrestricted wildcard permissions on svc-aster service account allowing unauthorized administrative Tree Connect to \\\\filesrv-01\\payroll$.',
    prerequisites: ['tool_svcscan', 'cat_red_recon_surface'],
    requiredClearanceTier: 2,
    targetService: 'microsoft-ds (SMB)',
    defaultPort: 445,
    payloadSnippet: 'SMB2_TREE_CONNECT_REQ(Share="\\\\filesrv-01\\payroll$", Impersonate="svc-aster")',
    safeTargetRequirement: 'filesrv-01 (10.0.4.20:445)',
    dryRunSupported: true,
    remediationAdvice:
      'Demote svc-aster credentials from corporate-admin wildcard role to kb-assistant least privilege in Aster Admin.',
  },
  {
    id: 'mod_redis_unauth_exec',
    name: 'Redis Unauthenticated Flush & Config Write',
    cve: 'CVE-2026-REDIS-RCE',
    category: 'unauthenticated_service',
    severity: 'CRITICAL',
    description:
      'Simulates command execution via unprotected Redis 6.2.7 instance listening without requirepass authentication.',
    prerequisites: ['tool_svcscan'],
    requiredClearanceTier: 2,
    targetService: 'redis',
    defaultPort: 6379,
    payloadSnippet: 'REDIS_CONFIG_SET(dir="/var/spool/cron", dbfilename="root", set="* * * * * test")',
    safeTargetRequirement: 'redis-01 (10.0.4.40:6379)',
    dryRunSupported: true,
    remediationAdvice:
      'Enforce strong requirepass token in /etc/redis/redis.conf and bind strictly to 127.0.0.1 loopback.',
  },
  {
    id: 'mod_jwt_alg_none',
    name: 'Intranet Portal JWT Algorithm None Signature Bypass',
    cve: 'CVE-2026-AUTH-BYPASS',
    category: 'token_signature_bypass',
    severity: 'CRITICAL',
    description:
      'Simulates forging administrative session tokens against Cedarline Intranet Portal by setting algorithm to "none" without valid HMAC signature.',
    prerequisites: ['cat_red_recon_surface'],
    requiredClearanceTier: 1,
    targetService: 'http-portal',
    defaultPort: 8080,
    payloadSnippet: 'JWT_HEADER{"alg":"none","typ":"JWT"}.PAYLOAD{"sub":"admin","role":"sec_admin"}',
    safeTargetRequirement: 'app-portal-01 (10.0.4.10:8080)',
    dryRunSupported: true,
    remediationAdvice:
      'Reject "none" algorithm in JWT validator and strictly enforce HMAC-SHA256 verification using secure secret key.',
  },
  {
    id: 'mod_idor_salary_export',
    name: 'Employee Directory IDOR Horizontal Privilege Escalation',
    cve: 'CVE-2026-API-IDOR',
    category: 'insecure_direct_object_ref',
    severity: 'HIGH',
    description:
      'Simulates querying confidential salary and appraisal records by tampering with the id parameter in REST endpoint /api/v1/employees.',
    prerequisites: ['cat_red_recon_surface'],
    requiredClearanceTier: 1,
    targetService: 'dev-api-service',
    defaultPort: 3000,
    payloadSnippet: 'GET /api/v1/employees?id=EMP-001 (tampered from authenticated EMP-104)',
    safeTargetRequirement: 'dev-api-01 (10.0.4.30:3000)',
    dryRunSupported: true,
    remediationAdvice:
      'Implement server-side session ownership checks verifying requester is authorized to view target record ID.',
  },
  {
    id: 'mod_buffer_bounds_check',
    name: 'Aster Agent Daemon Stack Buffer Bounds Probe',
    cve: 'CVE-2026-MEM-001',
    category: 'buffer_bounds',
    severity: 'MEDIUM',
    description:
      'Probes memory bounds in legacy C++ parsing routine without executing shellcode, verifying whether stack canary and ASLR are enabled.',
    prerequisites: ['tool_rev_lens'],
    requiredClearanceTier: 2,
    targetService: 'aster-daemon',
    defaultPort: 9090,
    payloadSnippet: 'CYCLIC_PROBE_STRING(length=1024, pattern="Aa0Aa1Aa2...")',
    safeTargetRequirement: 'app-portal-01 (10.0.4.10:9090)',
    dryRunSupported: true,
    remediationAdvice:
      'Recompile aster_agent_daemon with -fstack-protector-strong and replace strcpy with safe strncpy.',
  },
  {
    id: 'mod_dos_flood_prohibited',
    name: 'Distributed Connection Flood Exhaustion (PROHIBITED)',
    cve: 'CVE-2026-DOS-PROHIBITED',
    category: 'denial_of_service_prohibited',
    severity: 'HIGH',
    description:
      'Simulates flood testing designed to exhaust TCP socket pools. Prohibited under standard corporate Rules of Engagement.',
    prerequisites: [],
    requiredClearanceTier: 2,
    targetService: 'any',
    defaultPort: 80,
    payloadSnippet: 'TCP_SYN_FLOOD(rate=100000pps)',
    safeTargetRequirement: 'None - Prohibited under all RoE contracts',
    dryRunSupported: false,
    remediationAdvice: 'Not applicable - technique prohibited under authorization policy.',
  },
];

// ============================================================================
// 3. Fictional Offensive Target Inventory
// ============================================================================

export const INITIAL_OFFENSIVE_TARGETS: readonly OffensiveTargetAsset[] = [
  {
    id: 'filesrv-01',
    hostname: 'filesrv-01.cedarline.corp.local',
    ipAddress: '10.0.4.20',
    subnetId: '10.0.4.0/24',
    openPorts: [139, 445],
    primaryService: 'Samba 4.15.5 (SMB2/SMB3)',
    osDescription: 'Ubuntu Linux 22.04 LTS (Kernel 5.15.0)',
    isVulnerable: true,
    activeVulnerabilities: ['mod_smb_tree_hijack'],
    isPatched: false,
    appliedRemediations: [],
    description: 'Corporate payroll and departmental storage server hosting internal file shares.',
  },
  {
    id: 'app-portal-01',
    hostname: 'app-portal-01.cedarline.corp.local',
    ipAddress: '10.0.4.10',
    subnetId: '10.0.4.0/24',
    openPorts: [80, 8080, 9090],
    primaryService: 'Node.js Express / Aster Knowledge Assistant',
    osDescription: 'Debian GNU/Linux 11 (Bullseye)',
    isVulnerable: true,
    activeVulnerabilities: ['mod_jwt_alg_none', 'mod_buffer_bounds_check'],
    isPatched: false,
    appliedRemediations: [],
    description: 'Internal employee intranet portal and Aster AI search daemon host.',
  },
  {
    id: 'redis-01',
    hostname: 'redis-01.cedarline.corp.local',
    ipAddress: '10.0.4.40',
    subnetId: '10.0.4.0/24',
    openPorts: [6379],
    primaryService: 'Redis In-Memory Key-Value Store v6.2.7',
    osDescription: 'Alpine Linux 3.16',
    isVulnerable: true,
    activeVulnerabilities: ['mod_redis_unauth_exec'],
    isPatched: false,
    appliedRemediations: [],
    description: 'Session cache and asynchronous job queue broker.',
  },
  {
    id: 'dev-api-01',
    hostname: 'dev-api-01.cedarline.corp.local',
    ipAddress: '10.0.4.30',
    subnetId: '10.0.4.0/24',
    openPorts: [3000],
    primaryService: 'Go Gin REST API v1.4',
    osDescription: 'Ubuntu Linux 22.04 LTS',
    isVulnerable: true,
    activeVulnerabilities: ['mod_idor_salary_export'],
    isPatched: false,
    appliedRemediations: [],
    description: 'Staging microservice for Lagos Island staff directory and HR records.',
  },
  {
    id: 'vault-core-01',
    hostname: 'vault-core-01.cedarline.corp.local',
    ipAddress: '10.0.4.99',
    subnetId: '10.0.4.0/24',
    openPorts: [8200],
    primaryService: 'HashiCorp Vault Enterprise (Protected)',
    osDescription: 'Hardened Alpine Linux',
    isVulnerable: false,
    activeVulnerabilities: [],
    isPatched: true,
    appliedRemediations: ['Enforced TLS 1.3 mutual auth', 'AppRole token rotation'],
    description:
      'CRITICAL RESTRICTED VAULT. Explicitly OUT OF SCOPE for standard penetration testing.',
  },
];
