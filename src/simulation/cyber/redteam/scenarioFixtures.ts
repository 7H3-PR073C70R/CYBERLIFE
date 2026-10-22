/**
 * Cyberlife — Milestone 17: Fictional Red Team Assessment Fixtures & Scenario Data
 *
 * Authored scenario: "Operation Eko Citadel — Cedarline Authorized Infrastructure Assessment 2026"
 * Client: Cedarline Services Ltd (Marina Tower, Lagos Island)
 * Authorizing Official: Goodness (Chief Information Security Officer)
 *
 * SAFETY INVARIANT:
 * 100% synthetic, in-memory domain fixtures.
 * Zero real network addresses, zero live services, zero host command execution.
 */

import {
  RedTeamAssessmentState,
  RulesOfEngagement,
  AssessmentTargetAsset,
  RedTeamToolDefinition,
  RedTeamObjective,
  VulnerabilityFinding,
  RedTeamEvidenceItem,
} from './types';

export const CEDARLINE_REDTEAM_ROE: RulesOfEngagement = {
  assessmentId: 'ROE-2026-CEDAR-RED-01',
  clientOrganization: 'Cedarline Services Ltd',
  authorizingOfficial: 'Goodness',
  authorizingRole: 'Chief Information Security Officer (CISO)',
  authorizedAssessorName: 'Protector (Lead Assessor, EkoSec Labs)',
  legalFramework: 'Lagos State Cybercrimes & Infrastructure Security Mandate (2025/2026)',
  validFromIso: '2026-10-12T00:00:00Z',
  validUntilIso: '2026-10-26T23:59:59Z',
  emergencyStopContact: 'Goodness (CISO Direct Hotline: +234-1-MARINA-SEC / ext. 9001)',
  authorizedSubnets: ['10.0.1.0/24', '10.0.4.0/24'],
  allowedActionCategories: [
    'RECONNAISSANCE',
    'CONFIG_AUDIT',
    'WEB_APP_ASSESSMENT',
    'AUTH_ACCESS_CONTROL',
    'FINDING_VALIDATION',
    'REPORT_GENERATION',
  ],
  prohibitedActions: [
    'denial_of_service',
    'dos_stress_testing',
    'data_destruction',
    'credential_brute_force',
    'social_engineering_physical',
    'unauthorized_external_probing',
  ],
  rulesSummary: [
    'Testing is strictly restricted to designated in-scope IP addresses within 10.0.1.0/24 and 10.0.4.0/24.',
    'Production monitoring infrastructure (10.0.99.5 mon-siem-01) and Domain Controllers (10.0.4.2 dc-core-01) are strictly OUT OF SCOPE for intrusive assessment.',
    'All observed candidate vulnerabilities must be verified through non-destructive, safe diagnostic probes.',
    'Assessor must rigorously distinguish true positive security flaws from automated scanner false positives before final executive reporting.',
    'All proof-of-concept artifacts must be recorded with SHA-256 cryptographic hashes for non-repudiation auditability.',
  ],
  isSignedAndActive: true,
};

export const ASSESSMENT_TARGETS: readonly AssessmentTargetAsset[] = [
  // --- In-Scope Target 1: Aster Assistant Intranet Application Host ---
  {
    id: 'app-portal-01',
    hostname: 'app-portal-01',
    ipAddress: '10.0.1.10',
    fqdn: 'app-portal-01.corp.local',
    segmentId: 'seg-dmz',
    segmentName: 'Marina DMZ Cluster',
    organization: 'Cedarline Services Ltd',
    category: 'application_server',
    roleLabel: 'Internal Workflow Portal & Aster AI Daemon Host',
    os: 'Ubuntu 22.04.4 LTS (Container Host)',
    inScope: true,
    scopeJustification: 'Primary enterprise intranet portal hosting internal claims processing APIs.',
    allowedActionCategories: [
      'RECONNAISSANCE',
      'WEB_APP_ASSESSMENT',
      'AUTH_ACCESS_CONTROL',
      'CONFIG_AUDIT',
      'FINDING_VALIDATION',
    ],
    prohibitedActions: ['denial_of_service', 'credential_brute_force'],
    environmentType: 'DMZ_CLUSTER',
    services: [
      {
        port: 8080,
        protocol: 'tcp',
        name: 'http-proxy',
        product: 'Gunicorn / Python FastAPI',
        version: '0.29.0',
        banner: 'AsterAssistant-API/1.4.2',
        description: 'REST API endpoints for internal claims lookup and workflow automation.',
        isVulnerable: true,
        securityControls: ['OAuth2 Bearer Token Authentication', 'JSON Request Validation'],
      },
    ],
    knownVulnerabilities: ['VULN-CEDAR-001'],
  },

  // --- In-Scope Target 2: Corporate File Server ---
  {
    id: 'filesrv-01',
    hostname: 'filesrv-01',
    ipAddress: '10.0.4.50',
    fqdn: 'filesrv-01.corp.local',
    segmentId: 'seg-corp-lan',
    segmentName: 'Marina Corporate LAN',
    organization: 'Cedarline Services Ltd',
    category: 'file_server',
    roleLabel: 'Central Corporate File Server',
    os: 'Debian GNU/Linux 12 (Hardened Kernel)',
    inScope: true,
    scopeJustification: 'Departmental storage repository for legal, underwriting, and finance shares.',
    allowedActionCategories: [
      'RECONNAISSANCE',
      'CONFIG_AUDIT',
      'AUTH_ACCESS_CONTROL',
      'FINDING_VALIDATION',
    ],
    prohibitedActions: ['denial_of_service', 'data_destruction'],
    environmentType: 'INTERNAL_ENTERPRISE',
    services: [
      {
        port: 445,
        protocol: 'tcp',
        name: 'smb',
        product: 'Samba',
        version: '4.18.2',
        banner: 'Samba 4.18.2-Debian',
        description: 'Central SMB2/3 departmental file sharing daemon.',
        isVulnerable: true,
        securityControls: ['PAM Integration', 'Local POSIX ACLs'],
      },
      {
        port: 2049,
        protocol: 'tcp',
        name: 'nfs',
        product: 'NFSv4 Kernel Server',
        version: '4.2',
        description: 'Internal backup export mount point.',
        isVulnerable: false,
        securityControls: ['IP Restriction to Backup Subnet'],
      },
    ],
    knownVulnerabilities: ['VULN-CEDAR-002'],
  },

  // --- In-Scope Target 3: API Gateway & Reverse Proxy ---
  {
    id: 'api-gw-01',
    hostname: 'api-gw-01',
    ipAddress: '10.0.1.5',
    fqdn: 'api-gateway.cedarline.corp.local',
    segmentId: 'seg-dmz',
    segmentName: 'Marina DMZ Cluster',
    organization: 'Cedarline Services Ltd',
    category: 'gateway_router',
    roleLabel: 'Perimeter Reverse Proxy & API Gateway',
    os: 'Envoy Proxy / Alpine Linux',
    inScope: true,
    scopeJustification: 'Perimeter routing layer terminating external TLS and proxying internal service calls.',
    allowedActionCategories: [
      'RECONNAISSANCE',
      'CONFIG_AUDIT',
      'AUTH_ACCESS_CONTROL',
      'WEB_APP_ASSESSMENT',
      'FINDING_VALIDATION',
    ],
    prohibitedActions: ['denial_of_service'],
    environmentType: 'DMZ_CLUSTER',
    services: [
      {
        port: 443,
        protocol: 'tcp',
        name: 'https',
        product: 'Envoy Proxy',
        version: '1.28.0',
        banner: 'envoy/1.28.0',
        description: 'Edge reverse proxy enforcing rate-limits and JWT claim forwarding.',
        isVulnerable: true,
        securityControls: ['TLS 1.3 Termination', 'Rate Limiting Filter'],
      },
    ],
    knownVulnerabilities: ['VULN-CEDAR-003'],
  },

  // --- In-Scope Target 4: Customer Insurance Quote Web Portal ---
  {
    id: 'web-quote-01',
    hostname: 'web-quote-01',
    ipAddress: '10.0.1.20',
    fqdn: 'quotes.cedarline.com.ng',
    segmentId: 'seg-dmz',
    segmentName: 'Marina DMZ Cluster',
    organization: 'Cedarline Services Ltd',
    category: 'application_server',
    roleLabel: 'Public Commercial Quote Portal',
    os: 'Red Hat Enterprise Linux 9.2',
    inScope: true,
    scopeJustification: 'Public-facing web quote calculator. Testing for cryptographic transport weaknesses.',
    allowedActionCategories: [
      'RECONNAISSANCE',
      'CONFIG_AUDIT',
      'WEB_APP_ASSESSMENT',
      'FINDING_VALIDATION',
    ],
    prohibitedActions: ['denial_of_service', 'credential_brute_force'],
    environmentType: 'DMZ_CLUSTER',
    services: [
      {
        port: 443,
        protocol: 'tcp',
        name: 'https',
        product: 'nginx',
        version: '1.24.0',
        banner: 'nginx/1.24.0 (RHEL)',
        description: 'HTTPS quote front-end with SSL/TLS certificate.',
        isVulnerable: false, // Benign / False-positive evaluation target!
        securityControls: [
          'HSTS Enforced (max-age=31536000)',
          'Strict TLS 1.2/1.3 Only (ECDHE-RSA-AES256-GCM-SHA384)',
          'Automated WAF Layer',
        ],
      },
    ],
    knownVulnerabilities: ['VULN-CEDAR-004'], // Seeded candidate false-positive
  },

  // --- STRICTLY OUT-OF-SCOPE TARGET 5: Production SOC Monitoring SIEM Vault ---
  {
    id: 'mon-siem-01',
    hostname: 'mon-siem-01',
    ipAddress: '10.0.99.5',
    fqdn: 'mon-siem-01.corp.local',
    segmentId: 'seg-mgmt-soc',
    segmentName: 'SecOps Management & SIEM Vault',
    organization: 'Cedarline Services Ltd',
    category: 'monitoring_siem',
    roleLabel: 'Central SOC SIEM & Audit Collector',
    os: 'Enterprise Linux / OpenSearch 2.11',
    inScope: false,
    scopeJustification: 'CRITICAL PRODUCTION DEFENSIVE ASSET: SIEM collectors and audit vaults must not be probed or disrupted.',
    allowedActionCategories: [],
    prohibitedActions: ['all_testing', 'reconnaissance', 'config_audit', 'web_app_assessment'],
    environmentType: 'OUT_OF_SCOPE_PRODUCTION',
    services: [
      {
        port: 9200,
        protocol: 'tcp',
        name: 'opensearch',
        product: 'OpenSearch Cluster Node',
        version: '2.11.0',
        description: 'Audit log storage cluster.',
        isVulnerable: false,
        securityControls: ['mTLS Client Certificates', 'Isolated Management VLAN'],
      },
    ],
    knownVulnerabilities: [],
  },

  // --- STRICTLY OUT-OF-SCOPE TARGET 6: Core Domain Controller ---
  {
    id: 'dc-core-01',
    hostname: 'dc-core-01',
    ipAddress: '10.0.4.2',
    fqdn: 'dc-core-01.corp.local',
    segmentId: 'seg-corp-lan',
    segmentName: 'Marina Corporate LAN',
    organization: 'Cedarline Services Ltd',
    category: 'domain_controller',
    roleLabel: 'Active Directory & Kerberos KDC',
    os: 'Windows Server 2022 Core',
    inScope: false,
    scopeJustification: 'CORE IDENTITY INFRASTRUCTURE: Active directory domain controller is excluded from intrusive testing without live change advisory approval.',
    allowedActionCategories: [],
    prohibitedActions: ['all_testing', 'exploit_simulation'],
    environmentType: 'OUT_OF_SCOPE_PRODUCTION',
    services: [
      {
        port: 88,
        protocol: 'tcp',
        name: 'kerberos',
        product: 'Microsoft Kerberos KDC',
        version: '5.0',
        description: 'Authentication ticket grantor.',
        isVulnerable: false,
        securityControls: ['Strict Kerberos Armoring', 'Protected Users Group'],
      },
    ],
    knownVulnerabilities: [],
  },

  // --- STRICTLY OUT-OF-SCOPE TARGET 7: External Threat Node ---
  {
    id: 'c2-nexus-01',
    hostname: 'telemetry-sync.ekonexus-update.net',
    ipAddress: '198.51.100.45',
    fqdn: 'telemetry-sync.ekonexus-update.net',
    segmentId: 'seg-external-threat',
    segmentName: 'External WAN & Suspect Endpoints',
    organization: 'Suspicious External Hosting (Seychelles VPS)',
    category: 'external_endpoint',
    roleLabel: 'Adversary Command & Control (Phantom Weaver APT)',
    os: 'Unknown Linux (Custom C2 Listener)',
    inScope: false,
    scopeJustification: 'EXTERNAL THIRD-PARTY INFRASTRUCTURE: Probing external adversary hosts without law enforcement warrant constitutes an unauthorized cyber attack under Nigerian Law.',
    allowedActionCategories: [],
    prohibitedActions: ['all_testing', 'unauthorized_external_probing'],
    environmentType: 'EXTERNAL_UNTRUSTED',
    services: [
      {
        port: 8443,
        protocol: 'tcp',
        name: 'https-alt',
        product: 'Stealth C2 Beacon Receiver',
        version: 'Custom',
        description: 'Adversary receiver.',
        isVulnerable: false,
        securityControls: ['IP Filtered Listener'],
      },
    ],
    knownVulnerabilities: [],
  },
];

export const RED_TEAM_TOOLS: readonly RedTeamToolDefinition[] = [
  {
    id: 'tool-recon-enum',
    name: 'EkoSec Asset & Service Discovery',
    category: 'RECONNAISSANCE',
    defaultTargetId: 'app-portal-01',
    description: 'Queries internal asset inventory to map running service versions, protocol banners, and segment boundaries without intrusive probing.',
    pedagogicalExplanation: {
      whatItEvaluates: 'Evaluates the reachability, exposed ports, software versions, and banner metadata of in-scope systems.',
      requiredTargetInput: 'A valid, authorized host identifier registered within the assessment scope inventory.',
      whyPermittedInRoE: 'Reconnaissance queries the passive architectural inventory and active service definitions under signed RoE authority.',
      whatResultEstablishes: 'Establishes which services are listening, their declared versions, and potential security control postures.',
      whatResultDoesNotEstablish: 'Does NOT establish whether a vulnerability is practically exploitable; only identifies attack surface exposure.',
      followUpRecommendations: 'Proceed to targeted configuration audits or web application checks on identified listening services.',
    },
  },
  {
    id: 'tool-config-smb-audit',
    name: 'SMB Configuration & Share Auditor',
    category: 'CONFIG_AUDIT',
    defaultTargetId: 'filesrv-01',
    description: 'Audits Samba/SMB2 configuration parameters, SMB packet signing requirements, null session allowances, and share ACL exposure.',
    pedagogicalExplanation: {
      whatItEvaluates: 'Evaluates whether SMB2 message signing is enforced and whether sensitive shares permit unauthenticated guest enumeration.',
      requiredTargetInput: 'Target file server asset (e.g. filesrv-01).',
      whyPermittedInRoE: 'Permitted under Internal LAN configuration review clause in Section 3 of RoE.',
      whatResultEstablishes: 'Establishes whether SMB signing is disabled (enabling NTLM relay) and if public shares leak confidential directory trees.',
      whatResultDoesNotEstablish: 'Does NOT download or alter client data; evaluates configuration flags and access boundaries only.',
      followUpRecommendations: 'Enforce server signing = mandatory in smb.conf and restrict guest access on staging mounts.',
    },
  },
  {
    id: 'tool-web-api-idor',
    name: 'REST API Broken Object-Level Authorization Tester',
    category: 'WEB_APP_ASSESSMENT',
    defaultTargetId: 'app-portal-01',
    description: 'Tests REST API endpoints for Insecure Direct Object References (IDOR / BOLA) by simulating low-privileged claims requests across object IDs.',
    pedagogicalExplanation: {
      whatItEvaluates: 'Evaluates if /api/v1/internal/claims/{id} validates the requesting session identity against object ownership before returning records.',
      requiredTargetInput: 'Target application server host (e.g. app-portal-01).',
      whyPermittedInRoE: 'Web application assessment is explicitly permitted for intranet portal hosts under Section 4 of RoE.',
      whatResultEstablishes: 'Establishes that user session standard_user_01 is able to read executive claim records (ID 9042) without authorization.',
      whatResultDoesNotEstablish: 'Does NOT modify database records or grant administrative account creation.',
      followUpRecommendations: 'Implement server-side user-to-object entitlement validation on all claims API routes.',
    },
  },
  {
    id: 'tool-auth-header-spoof',
    name: 'Reverse-Proxy Header Trust & Role Escalation Evaluator',
    category: 'AUTH_ACCESS_CONTROL',
    defaultTargetId: 'api-gw-01',
    description: 'Evaluates whether the perimeter API gateway fails to strip user-supplied X-Internal-Role headers, enabling vertical privilege escalation.',
    pedagogicalExplanation: {
      whatItEvaluates: 'Tests if downstream microservices blindly trust client-supplied X-Internal-Role or X-Authenticated-User headers forwarded by the proxy.',
      requiredTargetInput: 'Target API gateway asset (e.g. api-gw-01).',
      whyPermittedInRoE: 'Identity and access control assessment is authorized under Section 5 of RoE.',
      whatResultEstablishes: 'Confirms that injecting X-Internal-Role: secops_admin into API requests bypasses authorization gates on backend services.',
      whatResultDoesNotEstablish: 'Does NOT establish persistent backdoor access; demonstrates proxy header misconfiguration flaw.',
      followUpRecommendations: 'Configure Envoy to sanitize and strip all incoming X-Internal-* headers from untrusted clients.',
    },
  },
  {
    id: 'tool-crypto-cipher-eval',
    name: 'TLS Cipher Suite & Transport Security Evaluator',
    category: 'CONFIG_AUDIT',
    defaultTargetId: 'web-quote-01',
    description: 'Evaluates cryptographic transport security, SSL/TLS handshake negotiations, forward secrecy, and HSTS policy enforcement.',
    pedagogicalExplanation: {
      whatItEvaluates: 'Tests supported cipher suites and protocol versions against automated scanner warnings.',
      requiredTargetInput: 'Target HTTPS web portal asset (e.g. web-quote-01).',
      whyPermittedInRoE: 'Non-invasive cryptographic auditing is permitted across DMZ hosts.',
      whatResultEstablishes: 'PROVES FALSE POSITIVE: Demonstrates that the automated scanner warning was a false alarm; the host strictly enforces TLS 1.2+ with ECDHE forward secrecy.',
      whatResultDoesNotEstablish: 'Does NOT mean the application is invulnerable to other logic bugs; only confirms transport layer is hardened.',
      followUpRecommendations: 'Reject the automated vulnerability report in the findings studio and document the false-positive rationale.',
    },
  },
];

export const INITIAL_VULNERABILITY_FINDINGS: readonly VulnerabilityFinding[] = [
  // Finding 1: True Positive - High Severity
  {
    id: 'VULN-CEDAR-001',
    assessmentId: 'ROE-2026-CEDAR-RED-01',
    targetId: 'app-portal-01',
    targetHostname: 'app-portal-01',
    targetService: 'AsterAssistant-API/1.4.2 (Port 8080)',
    title: 'Broken Object-Level Authorization (IDOR) on Internal Claims API',
    category: 'WEB_APP_ASSESSMENT',
    cveOrCwe: 'CWE-284 / OWASP API1:2023',
    cvssScore: 8.5,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:N',
    severity: 'HIGH',
    confidence: 'SUSPECTED',
    status: 'SUSPECTED',
    technicalDescription:
      'The Aster Assistant REST API endpoint /api/v1/internal/claims/{claimId} fails to verify whether the authenticated caller has legitimate access to the requested claim record. By incrementing the claim ID parameter, a standard employee session was able to retrieve confidential executive claims and settlement terms.',
    businessImpact:
      'High business risk: Exposure of sensitive commercial insurance claims, customer PII, and financial settlement negotiations to unauthorized employees or compromised internal accounts.',
    safeReproductionSummary: [
      '1. Authenticate with standard staff token (staff_tier1).',
      '2. Issue HTTP GET to /api/v1/internal/claims/CLM-2026-9042.',
      '3. Observe that the server returns HTTP 200 OK with full claim settlement details rather than HTTP 403 Forbidden.',
    ],
    evidenceIds: [],
    remediationRecommendation:
      'Implement strict server-side access control checks in the ClaimsController. Verify that the authenticated user ID is either the assigned claim adjuster or has the claims:admin scope before returning object data.',
    analystNotes: 'Initial scan identified open parameter query. Pending player validation.',
    isFalsePositive: false,
    validationHistory: [],
    discoveredAtSimTime: 100,
  },

  // Finding 2: True Positive - Medium Severity
  {
    id: 'VULN-CEDAR-002',
    assessmentId: 'ROE-2026-CEDAR-RED-01',
    targetId: 'filesrv-01',
    targetHostname: 'filesrv-01',
    targetService: 'Samba 4.18.2 (Port 445/tcp)',
    title: 'Insecure SMB Signing & Guest Share Permission Exposure',
    category: 'CONFIG_AUDIT',
    cveOrCwe: 'CWE-287 / CWE-306',
    cvssScore: 6.2,
    cvssVector: 'CVSS:3.1/AV:A/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N',
    severity: 'MEDIUM',
    confidence: 'SUSPECTED',
    status: 'SUSPECTED',
    technicalDescription:
      'The central departmental file server filesrv-01 has server signing set to "auto" rather than "mandatory". Furthermore, the /shares/public_staging share permits unauthenticated null sessions (guest read access), exposing internal infrastructure staging notes and deployment manifests.',
    businessImpact:
      'Medium business risk: Enables adversary NTLM relay attacks on the internal corporate network and allows unauthenticated local users to read sensitive server deployment notes.',
    safeReproductionSummary: [
      '1. Initiate SMB2 tree connect to \\\\filesrv-01\\public_staging without credentials.',
      '2. Query server capabilities header and verify SMB signing is not enforced (signing_required=false).',
      '3. Enumerate folder contents and observe readable deployment manifests.',
    ],
    evidenceIds: [],
    remediationRecommendation:
      'Set "server signing = mandatory" in /etc/samba/smb.conf and set "guest ok = no" on the public_staging share definition. Restart smbd daemon.',
    analystNotes: 'Discovered during corporate LAN configuration review.',
    isFalsePositive: false,
    validationHistory: [],
    discoveredAtSimTime: 120,
  },

  // Finding 3: True Positive - Critical Severity
  {
    id: 'VULN-CEDAR-003',
    assessmentId: 'ROE-2026-CEDAR-RED-01',
    targetId: 'api-gw-01',
    targetHostname: 'api-gw-01',
    targetService: 'Envoy Proxy (Port 443/tcp)',
    title: 'Reverse-Proxy Header Spoofing & Role Escalation via X-Internal-Role',
    category: 'AUTH_ACCESS_CONTROL',
    cveOrCwe: 'CWE-345 / CWE-269',
    cvssScore: 9.1,
    cvssVector: 'CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:C/C:H/I:H/A:N',
    severity: 'CRITICAL',
    confidence: 'SUSPECTED',
    status: 'SUSPECTED',
    technicalDescription:
      'The Envoy API gateway forwards client-supplied HTTP headers directly to backend microservices without sanitization. An attacker with a standard user session can append "X-Internal-Role: secops_admin" to bypass upstream authorization filters and access restricted management endpoints.',
    businessImpact:
      'Critical business risk: Complete administrative takeover of backend microservices, allowing unauthorized role changes, policy overrides, and access to internal databases.',
    safeReproductionSummary: [
      '1. Dispatch authenticated request to /api/v1/admin/policy with injected header: "X-Internal-Role: secops_admin".',
      '2. Verify that Envoy forwards the header untouched and the backend microservice executes the request with full SecOps administrative privileges.',
    ],
    evidenceIds: [],
    remediationRecommendation:
      'Configure Envoy HTTP connection manager with "request_headers_to_remove: ["x-internal-role", "x-internal-user"]" to strip all client-supplied identity claims before proxying.',
    analystNotes: 'High-priority critical finding discovered during access control testing.',
    isFalsePositive: false,
    validationHistory: [],
    discoveredAtSimTime: 140,
  },

  // Finding 4: Seeded False Positive / Benign Observation - Low Severity
  {
    id: 'VULN-CEDAR-004',
    assessmentId: 'ROE-2026-CEDAR-RED-01',
    targetId: 'web-quote-01',
    targetHostname: 'web-quote-01',
    targetService: 'nginx/1.24.0 (Port 443/tcp)',
    title: 'Automated Scanner Alert: Alleged Weak TLS 1.0/1.1 Cipher Negotiation',
    category: 'CONFIG_AUDIT',
    cveOrCwe: 'CWE-326',
    cvssScore: 3.1,
    cvssVector: 'CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:L/I:N/A:N',
    severity: 'LOW',
    confidence: 'BENIGN_FALSE_POSITIVE',
    status: 'SUSPECTED', // Player must review and REJECT this finding!
    technicalDescription:
      'An automated vulnerability scan generated a candidate advisory stating that web-quote-01 supports legacy TLS 1.0/1.1 cipher suites based on a generic banner match. However, non-destructive handshake probing reveals that the server rejects all TLS 1.0/1.1 handshakes and exclusively negotiates TLS 1.2 and TLS 1.3 with ECDHE forward secrecy.',
    businessImpact:
      'Zero impact (False Positive). The server configuration is hardened and complies with modern cryptographic standards. Reporting this as a vulnerability would mislead stakeholders and waste engineering remediation effort.',
    safeReproductionSummary: [
      '1. Dispatch TLS ClientHello offering only TLS 1.0 and 3DES cipher suites.',
      '2. Verify server immediately aborts the handshake with TLS Alert 70 (protocol_version).',
      '3. Re-probe with TLS 1.3 ECDHE-RSA-AES256-GCM-SHA384 and confirm successful negotiation with HSTS.',
    ],
    evidenceIds: [],
    remediationRecommendation:
      'No code or server changes needed. Mark finding as REJECTED (False Positive) in the assessment findings registry and tune the automated scanner rule.',
    analystNotes:
      'Automated scanner flagged this based on RHEL banner heuristic. Player must evaluate evidence and reject finding.',
    isFalsePositive: true,
    falsePositiveReason:
      'Detailed cryptographic probing proves the server rejects TLS 1.0/1.1 and exclusively negotiates hardened TLS 1.2/1.3 with forward secrecy.',
    validationHistory: [],
    discoveredAtSimTime: 160,
  },
];

export const RED_TEAM_SCENARIO_OBJECTIVES: readonly RedTeamObjective[] = [
  {
    id: 'obj-m17-accept-roe',
    title: 'Review and Formally Accept Rules of Engagement (RoE)',
    description: 'Inspect the written assessment brief from CISO Goodness, review in-scope subnets, prohibited actions, and formally sign acceptance of the Rules of Engagement.',
    hint: 'Open the "Briefing & RoE" tab, read the contract terms, and click "Formally Accept Rules of Engagement".',
    isCompleted: false,
    requiredAction: 'ACCEPT_ROE',
  },
  {
    id: 'obj-m17-recon-dmz',
    title: 'Simulated Reconnaissance on In-Scope DMZ Application Hosts',
    description: 'Run the EkoSec Asset & Service Discovery tool against in-scope hosts (app-portal-01, api-gw-01) to identify listening services and perimeter attack surface.',
    hint: 'Select app-portal-01 or api-gw-01 in the Action Runner and execute the Reconnaissance tool.',
    isCompleted: false,
    requiredAction: 'RUN_RECONNAISSANCE',
  },
  {
    id: 'obj-m17-audit-smb-config',
    title: 'Audit Service Configuration on Internal File Server (filesrv-01)',
    description: 'Evaluate Samba configuration and share security permissions on filesrv-01 to detect missing SMB signing and unauthenticated share exposure.',
    hint: 'Target filesrv-01 with the "SMB Configuration & Share Auditor" tool.',
    isCompleted: false,
    requiredAction: 'AUDIT_SERVICE_CONFIG',
  },
  {
    id: 'obj-m17-test-api-idor',
    title: 'Assess REST API Object-Level Authorization on Aster Portal',
    description: 'Simulate API object entitlement checks against /api/v1/internal/claims on app-portal-01 to confirm Broken Object-Level Authorization (IDOR).',
    hint: 'Target app-portal-01 with the "REST API Object-Level Authorization Tester" tool.',
    isCompleted: false,
    requiredAction: 'ASSESS_WEB_APPLICATION',
  },
  {
    id: 'obj-m17-eval-header-trust',
    title: 'Evaluate Reverse-Proxy Header Trust & Role Escalation on api-gw-01',
    description: 'Test whether api-gw-01 permits user-controlled X-Internal-Role injection, leading to backend administrative privilege escalation.',
    hint: 'Target api-gw-01 with the "Reverse-Proxy Header Trust Evaluator" tool.',
    isCompleted: false,
    requiredAction: 'EVALUATE_AUTH_ACCESS_CONTROL',
  },
  {
    id: 'obj-m17-reject-false-positive',
    title: 'Investigate and Reject Benign Scanner Finding (False Positive)',
    description: 'Critically analyze the automated TLS cipher warning on web-quote-01 (VULN-CEDAR-004), verify forward secrecy, and mark the candidate finding as REJECTED.',
    hint: 'Open the "Findings & Validation" tab, inspect VULN-CEDAR-004, and click "Reject as False Positive".',
    isCompleted: false,
    requiredAction: 'REJECT_BENIGN_FALSE_POSITIVE',
  },
  {
    id: 'obj-m17-preserve-evidence',
    title: 'Preserve Cryptographic Evidence into Evidence Vault',
    description: 'Save validated technical proof-of-concept traces with SHA-256 cryptographic hashes into the assessment evidence vault for non-repudiation auditability.',
    hint: 'Click "Preserve Evidence to Vault" on any validated finding in the Findings or Console tab.',
    isCompleted: false,
    requiredAction: 'PRESERVE_CRYPTOGRAPHIC_EVIDENCE',
  },
  {
    id: 'obj-m17-submit-assessment-report',
    title: 'Compile and Submit Final Executive Penetration Testing Deliverable',
    description: 'Review validated findings, provide remediation priorities and limitation disclosures, and submit the formal report to CISO Goodness for evaluation.',
    hint: 'Switch to the "Executive Report" tab, verify findings status, and click "Submit Final Assessment Report".',
    isCompleted: false,
    requiredAction: 'SUBMIT_ASSESSMENT_REPORT',
  },
];

export const INITIAL_EVIDENCE_ITEMS: readonly RedTeamEvidenceItem[] = [
  {
    id: 'EVD-M17-RECON-PORTAL',
    assessmentId: 'ROE-2026-CEDAR-RED-01',
    targetId: 'app-portal-01',
    title: 'Initial Scoping Fingerprint & Banner Capture: app-portal-01',
    source: 'EkoSec Scoping Gateway // 10.0.1.10:8080',
    collectionTimeSimTime: 28800,
    evidenceType: 'RECON_OBSERVATION',
    integrityStatus: 'VERIFIED',
    hashSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    artifactSnippet: [
      'HTTP/1.1 200 OK',
      'Server: Gunicorn/20.1.0 (AsterAssistant-API/1.4.2)',
      'X-Environment: DMZ-Staging-Cluster',
      'Content-Type: application/json',
    ],
    chainOfCustody: [
      {
        time: 28800,
        handler: 'Goodness (CISO)',
        action: 'BASELINE_EVIDENCE_ARCHIVE',
        signature: 'SIG-CEDARLINE-CISO-SCOPE-CONFIRMED',
      },
    ],
    analystNotes: 'Baseline perimeter service fingerprint verified during engagement kick-off.',
  },
];

export function createInitialRedTeamAssessmentState(): RedTeamAssessmentState {
  return {
    scenarioId: 'scen_m17_cedarline_redteam',
    scenarioTitle: 'Operation Eko Citadel: Cedarline Authorized Infrastructure Assessment',
    issuingOrganization: 'Cedarline Services Ltd (Information Security Directorate)',
    activePhase: 'BRIEFING_SCOPE',
    roe: CEDARLINE_REDTEAM_ROE,
    isAcceptedByPlayer: false,
    targets: ASSESSMENT_TARGETS,
    availableTools: RED_TEAM_TOOLS,
    objectives: RED_TEAM_SCENARIO_OBJECTIVES,
    executedActionIds: [],
    actionHistory: [],
    findings: INITIAL_VULNERABILITY_FINDINGS,
    evidenceVault: [...INITIAL_EVIDENCE_ITEMS],
    auditLog: [
      {
        id: 'audit-init-01',
        timestampSimTime: 0,
        actor: 'Goodness (CISO)',
        action: 'ISSUED_ASSESSMENT_ROE',
        target: 'ROE-2026-CEDAR-RED-01',
        status: 'ACTION_COMPLETED',
        details: 'Assessment mandate ROE-2026-CEDAR-RED-01 issued and awaiting lead assessor acceptance.',
      },
    ],
    analystNotes: [
      {
        id: 'note-01',
        timestampSimTime: 0,
        title: 'Engagement Briefing Note',
        content: 'Cedarline CISO Goodness authorized this engagement following suspicious exfiltration anomalies observed on app-portal-01. Our objective is to rigorously identify exploitable architectural weaknesses while strictly respecting production safety boundaries.',
        category: 'SCOPE',
      },
    ],
  };
}
