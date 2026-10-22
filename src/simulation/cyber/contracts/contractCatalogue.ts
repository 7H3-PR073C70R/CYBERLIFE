/**
 * Cyberlife — Milestone 19: Contract Catalogue & Scenario Ground Truth
 *
 * Deterministic catalogue of 5 rich, distinct cybersecurity contract opportunities
 * spanning Balogun Market retail, First Eko Bank financial systems, Cedarline enterprise SaaS,
 * Krest MSSP defensive validation, and 0xLagos ambiguous scope research.
 *
 * STRICT SAFETY INVARIANT:
 * 100% fictional in-game entities. Zero connection to real organizations, domains, or platforms.
 */

import {
  BountyContract,
  BountyHubState,
  FreelanceReputationState,
} from './types';

export const INITIAL_FREELANCE_REPUTATION: FreelanceReputationState = {
  score: 120, // Starting freelance reputation
  tier: 'ROOKIE',
  completedContractsCount: 0,
  successfulDisclosuresCount: 0,
  revisionsCompletedCount: 0,
  scopeViolationsCount: 0,
  totalEarningsKobo: 0,
  clientRatingAverage: 5.0,
};

export const CONTRACT_CATALOGUE: readonly BountyContract[] = [
  // 1. STARTER CONTRACT: Balogun Merchant Alliance POS Audit
  {
    id: 'ct-balogun-pos-audit',
    title: 'Balogun Market Merchant Gateway — Configuration & Access Control Audit',
    category: 'CONFIG_AUDIT',
    client: {
      id: 'client_balogun_traders',
      name: 'Balogun Market Merchant Alliance',
      shortName: 'Balogun Alliance',
      category: 'RETAIL_ENTERPRISE',
      factionId: 'faction_balogun_traders',
      isVerifiedProgram: true,
      reputationRating: 4.8,
      contactPerson: 'Alhaji Rasheed',
      contactRole: 'Head of Merchant Consortium Tech',
      profileSummary:
        'Representative body for over 4,000 wholesale and retail merchants across Lagos Island, modernizing payment collection systems.',
      websiteDomain: 'balogunmerchants.ng',
    },
    problemStatement:
      'The merchant alliance deployed an experimental staging payment gateway to aggregate point-of-sale kiosks. Before opening to traders, SecOps requires an independent configuration audit to ensure default administrative credentials are deactivated and merchant accounts are isolated.',
    businessContext:
      'Unsecured terminals could expose trader daily transaction ledgers or allow cross-tenant invoice spoofing.',
    difficulty: 'BEGINNER',
    estimatedEffortMinutes: 15,
    prerequisites: {
      minCareerLevel: 1,
      requiredSkills: {
        security_fundamentals: 1,
        troubleshooting: 1,
      },
      minFreelanceReputation: 50,
    },
    financialTerms: {
      rewardKobo: 150_000, // ₦1,500.00
      currency: 'NGN',
      operationalExpensesKobo: 0,
      penaltyKobo: 15_000,
      paymentConditions: 'Full payment upon approved report and cryptographic hash verification.',
    },
    scope: {
      authorizedTargets: [
        {
          id: 'gw-balogun-pos-01',
          hostname: 'gw-balogun-pos-01',
          ipAddress: '10.0.12.10',
          fqdn: 'pos-gateway.staging.balogunmerchants.ng',
          port: 8080,
          protocol: 'http',
          serviceName: 'Balogun POS Gateway Staging API',
          environment: 'STAGING_LAB',
          inScope: true,
          scopeJustification: 'Staging merchant aggregation gateway authorized for configuration audit.',
          allowedActions: ['CONFIG_AUDIT', 'PORT_INSPECTION', 'CREDENTIAL_REVIEW', 'EVIDENCE_VERIFICATION'],
          prohibitedActions: ['DENIAL_OF_SERVICE', 'DATA_DESTRUCTION', 'PRODUCTION_SCANNING'],
        },
      ],
      outOfScopeTargets: [
        'core-settle-01 (10.0.12.1) — Interbank Clearing Node',
        'sw-switch-01 (10.0.12.2) — Physical POS Switch Subnet',
        'All live merchant terminals in Balogun Market zone',
      ],
      authorizedActionCategories: ['CONFIG_AUDIT', 'RECONNAISSANCE', 'EVIDENCE_HANDLING'],
      prohibitedActions: ['EXPLOIT_PAYLOAD_DEPLOYMENT', 'CREDENTIAL_BRUTE_FORCE', 'THIRD_PARTY_SCANNING'],
      hasScopeAmbiguity: false,
    },
    acceptanceCriteria: [
      'Identify default administrative credential exposure on gw-balogun-pos-01 port 8080.',
      'Verify cryptographic SHA-256 integrity of the exported configuration audit artifact.',
      'Provide prioritized, least-privilege remediation advice suitable for non-technical traders.',
      'Refrain from any scans against out-of-scope settlement nodes.',
    ],
    requiredDeliverables: [
      {
        id: 'del-balogun-exec-summary',
        title: 'Executive Summary',
        description: 'Clear, concise briefing summarizing configuration findings and trader business risk.',
        isMandatory: true,
      },
      {
        id: 'del-balogun-finding',
        title: 'Technical Finding: Default Admin Credentials',
        description: 'Document default credentials vulnerability (severity, affected endpoint, PoC).',
        isMandatory: true,
        minimumConfidence: 'CONFIRMED',
      },
      {
        id: 'del-balogun-evidence',
        title: 'Cryptographic Evidence Link',
        description: 'Link preserved configuration audit evidence item with valid SHA-256 hash.',
        isMandatory: true,
      },
      {
        id: 'del-balogun-remediation',
        title: 'Remediation Roadmap',
        description: 'Actionable steps: credential rotation, IP whitelist, session timeouts.',
        isMandatory: true,
      },
    ],
    deadlineSeconds: 7200, // 2 hours
    initialObjectives: [
      {
        id: 'obj-balogun-01',
        title: 'Enumerate POS Gateway Services',
        description: 'Run authorized configuration scan against gw-balogun-pos-01 (10.0.12.10:8080).',
        requiredAction: 'scan_target',
        targetAssetId: 'gw-balogun-pos-01',
        hint: 'Inspect open ports and HTTP service banners on the staging POS gateway.',
      },
      {
        id: 'obj-balogun-02',
        title: 'Audit Access Controls & Default Credentials',
        description: 'Inspect gateway admin portal headers and identify unrotated administrative accounts.',
        requiredAction: 'audit_config',
        targetAssetId: 'gw-balogun-pos-01',
        hint: 'Analyze the configuration dump for default username/password combinations.',
      },
      {
        id: 'obj-balogun-03',
        title: 'Preserve Evidence in Forensic Vault',
        description: 'Record SHA-256 cryptographic evidence snapshot EVD-2026-001 in audit vault.',
        requiredAction: 'verify_evidence',
        targetAssetId: 'gw-balogun-pos-01',
        hint: 'Verify the hash of the authentication log export to prevent tampering.',
      },
      {
        id: 'obj-balogun-04',
        title: 'Assemble & Submit Audit Deliverables',
        description: 'Draft executive summary, attach technical finding, and submit to Alhaji Rasheed.',
        requiredAction: 'submit_report',
        hint: 'Ensure scope compliance is affirmed and remediation recommendations are prioritized.',
      },
    ],
  },

  // 2. INVESTIGATION CONTRACT: First Eko Bank Perimeter ATM Anomaly
  {
    id: 'ct-eko-atm-investigation',
    title: 'First Eko Bank — Perimeter ATM Gateway Anomaly & C2 Telemetry Investigation',
    category: 'INVESTIGATION',
    client: {
      id: 'client_eko_bank',
      name: 'First Eko Bank Nigeria Plc',
      shortName: 'First Eko Bank',
      category: 'COMMERCIAL_BANK',
      factionId: 'faction_eko_bank',
      isVerifiedProgram: true,
      reputationRating: 4.9,
      contactPerson: 'Ngozi, CISSP',
      contactRole: 'Chief Information Security Officer',
      profileSummary:
        'One of Nigeria’s premier tier-1 commercial banking institutions, operating high-security digital banking and ATM switches across Lagos Island.',
      websiteDomain: 'firstekobank.ng',
    },
    problemStatement:
      'Bank perimeter sensors flagged periodic HTTP/DNS beacons from staging ATM gateway atm-gw-stg-01 towards undocumented IP ranges. SecOps requests an independent forensic review of network traffic streams and correlation against threat intelligence feeds.',
    businessContext:
      'Staging switch configurations could contain remnants of simulated malware or unauthorized persistence that must not bridge into core banking.',
    difficulty: 'INTERMEDIATE',
    estimatedEffortMinutes: 25,
    prerequisites: {
      minCareerLevel: 1,
      requiredSkills: {
        log_analysis: 2,
        network_fundamentals: 2,
        evidence_handling: 1,
      },
      minFreelanceReputation: 100,
    },
    financialTerms: {
      rewardKobo: 320_000, // ₦3,200.00
      currency: 'NGN',
      operationalExpensesKobo: 20_000, // Encrypted evidence tunnel fee
      penaltyKobo: 35_000,
      paymentConditions: 'Disbursed upon forensic correlation confirmation and verified timeline.',
    },
    scope: {
      authorizedTargets: [
        {
          id: 'atm-gw-stg-01',
          hostname: 'atm-gw-stg-01',
          ipAddress: '10.0.40.15',
          fqdn: 'atm-staging.mesh.firstekobank.ng',
          port: 443,
          protocol: 'https',
          serviceName: 'ATM Switch Telemetry Relay',
          environment: 'STAGING_LAB',
          inScope: true,
          scopeJustification: 'Staging ATM communication gateway under investigation.',
          allowedActions: ['TRAFFIC_ANALYSIS', 'LOG_REVIEW', 'THREAT_CORRELATION', 'EVIDENCE_EXTRACTION'],
          prohibitedActions: ['DENIAL_OF_SERVICE', 'CORE_BANKING_ACCESS', 'ACCOUNT_TAMPERING'],
        },
      ],
      outOfScopeTargets: [
        'vault-prod-db-01 (10.0.40.1) — Customer Production Account Vault (STRICTLY FORBIDDEN)',
        'cbn-settle-gw-01 — Central Bank of Nigeria Settlement Gateway',
        'All physical bank branches and customer-facing ATMs',
      ],
      authorizedActionCategories: ['INVESTIGATION', 'RECONNAISSANCE', 'EVIDENCE_HANDLING'],
      prohibitedActions: ['EXPLOIT_PAYLOAD_DEPLOYMENT', 'CREDENTIAL_HARVESTING', 'UNAUTHORIZED_EXFILTRATION'],
      hasScopeAmbiguity: false,
    },
    acceptanceCriteria: [
      'Analyze network traffic captures from atm-gw-stg-01 and locate dropped egress headers.',
      'Correlate outbound IP 198.51.100.99 against threat intelligence indicator ioc-c2-beacon-echo.',
      'Link forensic PCAP evidence EVD-2026-002 with valid SHA-256 hash.',
      'Deliver concrete timeline identifying the beacon interval and recommending perimeter firewall containment.',
    ],
    requiredDeliverables: [
      {
        id: 'del-eko-summary',
        title: 'Executive Briefing for CISO',
        description: 'Comprehensive risk summary outlining observed beaconing and zero customer impact.',
        isMandatory: true,
      },
      {
        id: 'del-eko-finding',
        title: 'Forensic Correlation Finding: C2 Beaconing',
        description: 'Technical finding confirming periodic beaconing to unallocated range 198.51.100.99.',
        isMandatory: true,
        minimumConfidence: 'CONFIRMED',
      },
      {
        id: 'del-eko-evidence',
        title: 'PCAP Forensic Evidence Reference',
        description: 'Cryptographic reference to EVD-2026-002 perimeter drop header capture.',
        isMandatory: true,
      },
      {
        id: 'del-eko-containment',
        title: 'Containment & Remediation Roadmap',
        description: 'Immediate firewall egress rule #14 verification and DNS sinkholing steps.',
        isMandatory: true,
      },
    ],
    deadlineSeconds: 10800, // 3 hours
    initialObjectives: [
      {
        id: 'obj-eko-01',
        title: 'Inspect ATM Gateway Telemetry Stream',
        description: 'Query network traffic logs for dropped egress packets originating from 10.0.40.15.',
        requiredAction: 'query_telemetry',
        targetAssetId: 'atm-gw-stg-01',
        hint: 'Search for syn packets dropped by perimeter firewall rule #14.',
      },
      {
        id: 'obj-eko-02',
        title: 'Correlate Threat Intelligence IOCs',
        description: 'Match destination IP 198.51.100.99 against known threat intelligence indicators.',
        requiredAction: 'correlate_threat_intel',
        targetAssetId: 'atm-gw-stg-01',
        hint: 'Examine threat intelligence registry for C2 beacon pattern signatures.',
      },
      {
        id: 'obj-eko-03',
        title: 'Preserve Forensic Evidence in Vault',
        description: 'Verify and link evidence record EVD-2026-002 into the contract submission dossier.',
        requiredAction: 'preserve_evidence',
        targetAssetId: 'atm-gw-stg-01',
        hint: 'Confirm the SHA-256 hash matches the perimeter gateway drop capture.',
      },
      {
        id: 'obj-eko-04',
        title: 'Submit Incident Conclusion to CISO',
        description: 'Finalize report affirming no production database exposure occurred.',
        requiredAction: 'submit_report',
        hint: 'Ensure timeline and remediation recommendations are fully documented.',
      },
    ],
  },

  // 3. ASSESSMENT CONTRACT: Cedarline Staging Customer Portal API
  {
    id: 'ct-cedarline-api-assessment',
    title: 'Cedarline Staging Customer Portal — IAM & Wildcard Permission Assessment',
    category: 'WEB_APP_ASSESSMENT',
    client: {
      id: 'client_cedarline',
      name: 'Cedarline Solutions Ltd',
      shortName: 'Cedarline',
      category: 'SAAS_PLATFORM',
      factionId: 'faction_cedarline',
      isVerifiedProgram: true,
      reputationRating: 4.7,
      contactPerson: 'Engr. Michael',
      contactRole: 'Director of Platform Security',
      profileSummary:
        'Lagos Island enterprise cloud services provider hosting business workflows and customer collaboration tools across West Africa.',
      websiteDomain: 'cedarline.ng',
    },
    problemStatement:
      'Following internal architecture revisions, Cedarline deployed an isolated customer portal API on api-staging-01. SecOps requires an authorized vulnerability assessment to test JWT token validation, verify RBAC scopes, and confirm that wildcard administrative privileges are strictly blocked.',
    businessContext:
      'Overprivileged API tokens could permit unauthorized cross-tenant data access, violating NDPR compliance.',
    difficulty: 'INTERMEDIATE',
    estimatedEffortMinutes: 30,
    prerequisites: {
      minCareerLevel: 2,
      requiredSkills: {
        security_fundamentals: 2,
        attack_simulation: 1,
        reporting: 2,
      },
      minFreelanceReputation: 150,
    },
    financialTerms: {
      rewardKobo: 450_000, // ₦4,500.00
      currency: 'NGN',
      operationalExpensesKobo: 25_000, // Lab compute allocation fee
      penaltyKobo: 50_000,
      paymentConditions: 'Disbursed upon validated PoC and verified least-privilege policy implementation.',
    },
    scope: {
      authorizedTargets: [
        {
          id: 'api-staging-01',
          hostname: 'api-staging-01',
          ipAddress: '10.0.1.20',
          fqdn: 'api.staging.cedarline.ng',
          port: 8080,
          protocol: 'http',
          serviceName: 'Customer Portal Staging REST API',
          environment: 'STAGING_LAB',
          inScope: true,
          scopeJustification: 'Staging customer portal API authorized for vulnerability and RBAC testing.',
          allowedActions: ['API_ASSESSMENT', 'AUTH_BYPASS_TEST', 'JWT_INSPECTION', 'REMEDIATION_VERIFICATION'],
          prohibitedActions: ['SQLI_PRODUCTION_DESTRUCTION', 'LATERAL_MOVEMENT', 'HOST_PERSISTENCE'],
        },
      ],
      outOfScopeTargets: [
        'dc-corp-01 (10.0.1.5) — Active Directory Domain Controller (STRICTLY PROHIBITED)',
        'prod-portal-01 — Live Cedarline Production Portal',
        'Customer corporate mailboxes and HR databases',
      ],
      authorizedActionCategories: ['WEB_APP_ASSESSMENT', 'CONFIG_AUDIT', 'EVIDENCE_HANDLING'],
      prohibitedActions: ['DENIAL_OF_SERVICE', 'LATERAL_MOVEMENT', 'EXTERNAL_SCANNING'],
      hasScopeAmbiguity: false,
    },
    acceptanceCriteria: [
      'Discover wildcard IAM privilege flaw in staging customer portal API endpoint.',
      'Author a valid proof-of-concept demonstrating privilege escalation via JWT claims.',
      'Link exception traceback log dump EVD-2026-003.',
      'Verify that least-privilege role:kb-assistant restricts unauthorized scopes.',
    ],
    requiredDeliverables: [
      {
        id: 'del-cedarline-summary',
        title: 'Executive Assessment Brief',
        description: 'High-level debrief explaining the IAM scope flaw and its potential business impact.',
        isMandatory: true,
      },
      {
        id: 'del-cedarline-poc',
        title: 'Proof-of-Concept Vulnerability Finding',
        description: 'Document the overprivileged role:corporate-admin claim vulnerability.',
        isMandatory: true,
        minimumConfidence: 'CONFIRMED',
      },
      {
        id: 'del-cedarline-evidence',
        title: 'Supporting Diagnostic Evidence',
        description: 'Attach EVD-2026-003 catalina exception traceback dump.',
        isMandatory: true,
      },
      {
        id: 'del-cedarline-remediation',
        title: 'Least-Privilege Remediation Plan',
        description: 'Explicit recommendations for JSON Web Token claims validation and scoped IAM roles.',
        isMandatory: true,
      },
    ],
    deadlineSeconds: 14400, // 4 hours
    initialObjectives: [
      {
        id: 'obj-cedarline-01',
        title: 'Enumerate Staging API Endpoints',
        description: 'Map REST endpoints and inspect authorization headers on api-staging-01.',
        requiredAction: 'enumerate_api',
        targetAssetId: 'api-staging-01',
        hint: 'Examine API routes for token acceptance without role constraint validation.',
      },
      {
        id: 'obj-cedarline-02',
        title: 'Test JWT Scope Authorization & Privilege Escalation',
        description: 'Submit crafted test token with elevated scope to verify RBAC enforcement.',
        requiredAction: 'test_auth_bypass',
        targetAssetId: 'api-staging-01',
        hint: 'Confirm whether role:corporate-admin grants unrestricted wildcard actions.',
      },
      {
        id: 'obj-cedarline-03',
        title: 'Verify Least-Privilege Remediation Patch',
        description: 'Test the remediated policy and confirm knowledge search succeeds while SMB access is blocked.',
        requiredAction: 'verify_remediation',
        targetAssetId: 'api-staging-01',
        hint: 'Ensure 403 Forbidden is properly returned on unauthorized resource requests.',
      },
      {
        id: 'obj-cedarline-04',
        title: 'Submit Formal Penetration Testing Report',
        description: 'Package findings and evidence into Cedarline SecOps review queue.',
        requiredAction: 'submit_report',
        hint: 'Ensure scope compliance is affirmed and no out-of-scope probes were attempted.',
      },
    ],
  },

  // 4. DEFENSIVE VALIDATION CONTRACT: Krest MSSP SIEM Coverage & Sigma Rules
  {
    id: 'ct-krest-siem-validation',
    title: 'Krest SecOps Managed SOC — Telemetry Coverage & Sigma Rule Validation',
    category: 'DETECTION_VALIDATION',
    client: {
      id: 'client_krest_ir',
      name: 'Krest Incident Response & SecOps',
      shortName: 'Krest SecOps',
      category: 'MSSP_SECOPS',
      factionId: 'faction_krest_ir',
      isVerifiedProgram: true,
      reputationRating: 4.9,
      contactPerson: 'Tsharp',
      contactRole: 'Lead Detection Engineer',
      profileSummary:
        'Managed security services provider monitoring mid-market financial and commercial firms across the Victoria Island business district.',
      websiteDomain: 'krestsec.ng',
    },
    problemStatement:
      'Krest is auditing their automated SIEM detection coverage for adversary techniques targeting corporate endpoints. They require a Purple Team engineer to execute synthetic adversary tests, validate alert generation in LogView, and tune Sigma rules to eliminate false positives.',
    businessContext:
      'High false-positive rates fatigue tier-1 SOC analysts, while coverage blindspots create dwell-time risks for client infrastructure.',
    difficulty: 'ADVANCED',
    estimatedEffortMinutes: 35,
    prerequisites: {
      minCareerLevel: 2,
      requiredSkills: {
        log_analysis: 2,
        detection_engineering: 2,
        reporting: 2,
      },
      minFreelanceReputation: 250,
    },
    financialTerms: {
      rewardKobo: 600_000, // ₦6,000.00
      currency: 'NGN',
      operationalExpensesKobo: 30_000, // Lab telemetry pipeline tap fee
      penaltyKobo: 70_000,
      paymentConditions: 'Disbursed upon scorecard calculation exceeding 85% detection efficiency.',
    },
    scope: {
      authorizedTargets: [
        {
          id: 'krest-lab-mon-01',
          hostname: 'krest-lab-mon-01',
          ipAddress: '10.0.25.5',
          fqdn: 'siem-engine.lab.krestsec.ng',
          port: 9000,
          protocol: 'http',
          serviceName: 'Krest Purple Team SIEM Lab Engine',
          environment: 'STAGING_LAB',
          inScope: true,
          scopeJustification: 'Dedicated Purple Team detection testing environment.',
          allowedActions: ['DETECTION_TEST', 'SIGMA_RULE_TUNING', 'SCORECARD_CALCULATION', 'LOG_REVIEW'],
          prohibitedActions: ['PRODUCTION_SOC_INTERFERENCE', 'RAW_STORAGE_PURGE'],
        },
      ],
      outOfScopeTargets: [
        'krest-core-prod-01 — Live Krest Multi-Tenant SIEM Cluster',
        'Customer client telemetry pipelines',
        'All corporate analyst workstations',
      ],
      authorizedActionCategories: ['DETECTION_VALIDATION', 'CONFIG_AUDIT', 'INVESTIGATION'],
      prohibitedActions: ['DENIAL_OF_SERVICE', 'LOG_TAMPERING', 'UNAUTHORIZED_EXFILTRATION'],
      hasScopeAmbiguity: false,
    },
    acceptanceCriteria: [
      'Execute synthetic credential brute-force and privilege escalation adversary tests.',
      'Verify alert generation in LogView SIEM and confirm MITRE ATT&CK mapping (T1078, T1059).',
      'Distinguish benign administrative scanner traffic from true positive brute-force events.',
      'Deliver fine-tuned Sigma rule recommendations and detection coverage scorecard.',
    ],
    requiredDeliverables: [
      {
        id: 'del-krest-summary',
        title: 'Purple Team Executive Summary',
        description: 'Comprehensive overview of detection coverage score, gaps identified, and MTTD impact.',
        isMandatory: true,
      },
      {
        id: 'del-krest-scorecard',
        title: 'Detection Coverage Scorecard',
        description: 'Itemized validation matrix confirming detection for simulated attack techniques.',
        isMandatory: true,
        minimumConfidence: 'CONFIRMED',
      },
      {
        id: 'del-krest-tuning',
        title: 'Sigma Rule Tuning & False Positive Filter',
        description: 'Specific filter recommendations to suppress benign vulnerability scanners.',
        isMandatory: true,
      },
      {
        id: 'del-krest-roadmap',
        title: 'Engineering Remediation Roadmap',
        description: 'Actionable steps to enhance parent-child PID tracking and endpoint telemetry.',
        isMandatory: true,
      },
    ],
    deadlineSeconds: 18000, // 5 hours
    initialObjectives: [
      {
        id: 'obj-krest-01',
        title: 'Run Synthetic Adversary Tests',
        description: 'Execute controlled authentication brute force and privilege escalation tests in lab.',
        requiredAction: 'run_detection_test',
        targetAssetId: 'krest-lab-mon-01',
        hint: 'Trigger synthetic events to test SIEM alert correlation rules.',
      },
      {
        id: 'obj-krest-02',
        title: 'Measure Detection Coverage Scorecard',
        description: 'Inspect LogView alerts and verify detection for MITRE ATT&CK techniques.',
        requiredAction: 'measure_coverage',
        targetAssetId: 'krest-lab-mon-01',
        hint: 'Ensure alerts are triggered for high-severity credential abuse.',
      },
      {
        id: 'obj-krest-03',
        title: 'Tune Rule to Eliminate False Positives',
        description: 'Identify benign scanner indicator and classify it as FALSE_POSITIVE_BENIGN.',
        requiredAction: 'tune_detection_rule',
        targetAssetId: 'krest-lab-mon-01',
        hint: 'Examine vulnerability scanner traffic and refine detection rule logic.',
      },
      {
        id: 'obj-krest-04',
        title: 'Submit Purple Team Validation Report',
        description: 'Deliver detection scorecard and engineering recommendations to Tsharp.',
        requiredAction: 'submit_report',
        hint: 'Include executive summary and affirm all testing occurred within lab boundary.',
      },
    ],
  },

  // 5. PROFESSIONAL JUDGMENT CONTRACT: Apex Ventures / 0xLagos Ambiguous Request
  {
    id: 'ct-0xlagos-scope-clarify',
    title: 'Apex Decentralized Clearing Staging — Conflicting Scope & Authorization Clarification',
    category: 'AMBIGUOUS_SCOPE_DISPUTE',
    client: {
      id: 'client_apex_ventures',
      name: 'Apex Decentralized Ventures / 0xLagos Collective',
      shortName: 'Apex Ventures',
      category: 'VENTURE_RESEARCH',
      factionId: 'faction_0xlagos',
      isVerifiedProgram: false,
      reputationRating: 3.9,
      contactPerson: 'Korede',
      contactRole: 'Lead Protocol Contributor',
      profileSummary:
        'Fast-moving web3 fintech startup building tokenized invoice clearance across West Africa, operating with informal security documentation.',
      websiteDomain: 'apexclearing.io',
    },
    problemStatement:
      'Apex Ventures submitted a bug bounty request to test their staging web interface apex-web-stg. However, their informal briefing text casually instructs the researcher to "also check the shared cloud database at 192.168.99.1". That IP belongs to an unverified multi-tenant cloud hosting provider, not Apex directly. A professional security tester must evaluate whether this request is safe or requires formal scope clarification.',
    businessContext:
      'Scanning third-party hosting infrastructure without explicit written mandate constitutes unauthorized computer access under the Cybercrimes Act.',
    difficulty: 'INTERMEDIATE',
    estimatedEffortMinutes: 20,
    prerequisites: {
      minCareerLevel: 1,
      requiredSkills: {
        security_fundamentals: 1,
        reporting: 1,
      },
      minFreelanceReputation: 80,
    },
    financialTerms: {
      rewardKobo: 280_000, // ₦2,800.00
      currency: 'NGN',
      operationalExpensesKobo: 0,
      penaltyKobo: 40_000,
      paymentConditions: 'Disbursed upon professional scope clarification and compliant advisory delivery.',
    },
    scope: {
      authorizedTargets: [
        {
          id: 'apex-web-stg',
          hostname: 'apex-web-stg',
          ipAddress: '10.0.88.50',
          fqdn: 'staging.apexclearing.io',
          port: 443,
          protocol: 'https',
          serviceName: 'Apex Staging Web Frontend',
          environment: 'STAGING_LAB',
          inScope: true,
          scopeJustification: 'Apex-owned staging web interface authorized for security evaluation.',
          allowedActions: ['WEB_RECON', 'INPUT_VALIDATION', 'SCOPE_CLARIFICATION'],
          prohibitedActions: ['THIRD_PARTY_SCANNING', 'UNVERIFIED_DATABASE_PROBING'],
        },
      ],
      outOfScopeTargets: [
        '192.168.99.1 — Multi-Tenant Shared Cloud Database (UNAUTHORIZED THIRD PARTY)',
        'Apex Liquidity Pool Smart Contracts on Mainnet',
        'Customer private keys and hardware wallets',
      ],
      authorizedActionCategories: ['WEB_APP_ASSESSMENT', 'CONFIG_AUDIT'],
      prohibitedActions: ['UNAUTHORIZED_THIRD_PARTY_ACCESS', 'DATA_EXFILTRATION', 'DENIAL_OF_SERVICE'],
      hasScopeAmbiguity: true,
      ambiguityDescription:
        'Client briefing verbally requests probing shared cloud database 192.168.99.1, but this asset belongs to a third-party multi-tenant provider with no written authorization on file.',
      clarificationOptions: [
        {
          id: 'opt-clarify-safe-restrict',
          label: 'Request Formal Clarification & Restrict Scope to apex-web-stg Only (Recommended)',
          description:
            'Formally notify Korede that 192.168.99.1 is a shared third-party IP requiring independent written authorization, and restrict active scope exclusively to apex-web-stg (10.0.88.50).',
          isSafeProfessionalChoice: true,
          resultingResolutionNotes:
            'Scope officially clarified: Shared host 192.168.99.1 marked STRICTLY OUT OF SCOPE. Authorization affirmed exclusively for apex-web-stg.',
          reputationImpact: 25,
        },
        {
          id: 'opt-proceed-unsafe-attack',
          label: 'Blindly Proceed and Scan Shared Host 192.168.99.1',
          description:
            'Ignore the missing authorization and launch scans against the shared multi-tenant database as casually requested in chat.',
          isSafeProfessionalChoice: false,
          resultingResolutionNotes:
            'CRITICAL POLICY BREACH: Attempted unauthorized testing against shared third-party cloud infrastructure. Incident flagged to regulatory audit.',
          reputationImpact: -50,
        },
      ],
    },
    acceptanceCriteria: [
      'Demonstrate sound professional judgment by formally requesting scope clarification.',
      'Explicitly exclude unverified shared host 192.168.99.1 from technical testing.',
      'Perform authorized web assessment strictly against apex-web-stg (10.0.88.50).',
      'Deliver architectural risk advisory recommending dedicated tenant isolation.',
    ],
    requiredDeliverables: [
      {
        id: 'del-apex-summary',
        title: 'Executive Advisory & Scope Clarification',
        description: 'Document professional scope assessment and legal justification for third-party exclusion.',
        isMandatory: true,
      },
      {
        id: 'del-apex-finding',
        title: 'Architectural Finding: Shared Tenant Isolation Risk',
        description: 'Technical finding explaining dangers of co-mingled multi-tenant database infrastructure.',
        isMandatory: true,
        minimumConfidence: 'CONFIRMED',
      },
      {
        id: 'del-apex-remediation',
        title: 'Remediation & Authorization Roadmap',
        description: 'Guidance on obtaining proper cloud vendor pentest authorizations and tenant VPC peering.',
        isMandatory: true,
      },
    ],
    deadlineSeconds: 10800, // 3 hours
    initialObjectives: [
      {
        id: 'obj-apex-01',
        title: 'Clarify Conflicting Authorization Boundary',
        description: 'Review client terms and formally resolve scope ambiguity before launching technical actions.',
        requiredAction: 'clarify_scope',
        targetAssetId: 'apex-web-stg',
        hint: 'Use the Scope Clarification panel to restrict testing to authorized apex-web-stg.',
      },
      {
        id: 'obj-apex-02',
        title: 'Audit Authorized Web Frontend (apex-web-stg)',
        description: 'Inspect HTTPS headers and input sanitization on staging.apexclearing.io.',
        requiredAction: 'scan_authorized_target',
        targetAssetId: 'apex-web-stg',
        hint: 'Perform non-destructive web reconnaissance against in-scope 10.0.88.50.',
      },
      {
        id: 'obj-apex-03',
        title: 'Document Multi-Tenant Isolation Risk',
        description: 'Analyze cloud architecture and document exposure risks of shared database dependencies.',
        requiredAction: 'document_architecture_risk',
        targetAssetId: 'apex-web-stg',
        hint: 'Explain why shared databases violate regulatory tenant isolation requirements.',
      },
      {
        id: 'obj-apex-04',
        title: 'Submit Security Advisory to Apex Founders',
        description: 'Submit report highlighting ethical scope resolution and cloud tenancy recommendations.',
        requiredAction: 'submit_report',
        hint: 'Ensure scope compliance is affirmed and third-party exclusion is documented.',
      },
    ],
  },
];

/**
 * Creates the initial BountyHubState for a new or loaded simulation session.
 */
export function createInitialBountyHubState(): BountyHubState {
  return {
    contracts: CONTRACT_CATALOGUE,
    activeContract: undefined,
    completedContractHistory: [],
    reputation: INITIAL_FREELANCE_REPUTATION,
    selectedContractId: 'ct-balogun-pos-audit',
    categoryFilter: 'ALL',
    activeTab: 'marketplace',
  };
}
