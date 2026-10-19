/**
 * Cyberlife — Milestone 11: Cybersecurity Catalogue Definitions
 *
 * Full curriculum covering:
 * - Blue Team (Defenders)
 * - Red Team (Authorized Attack Simulators)
 * - Purple Team (Collaborative Security Improvement & Detection Engineering)
 * - Shared Foundations
 *
 * All datasets and scenarios are strictly deterministic, in-memory simulations.
 */

import { CatalogueEntry, PracticalExercise, DetectionRule } from './types';

// ============================================================================
// Catalogue Entries Registry
// ============================================================================

export const CATALOGUE_ENTRIES: readonly CatalogueEntry[] = [
  // --------------------------------------------------------------------------
  // BLUE TEAM — DEFENDERS
  // --------------------------------------------------------------------------
  {
    id: 'cat_blue_soc_triage',
    track: 'blue',
    discipline: 'soc_operations',
    title: 'Security Operations & Alert Triage',
    summary: 'Correlate authentication event streams to identify unauthorized after-hours access.',
    description:
      'Security Operations Center (SOC) analysts monitor telemetry from firewalls, servers, and identity providers to detect security incidents in real time. In this module, analyze SIEM logs, correlate event types across hosts, and differentiate benign operational noise from anomalous credential use.',
    whyItMatters:
      'Modern enterprises generate millions of daily events. Failing to methodically triage alerts leads to alert fatigue, missed intrusions, and delayed containment.',
    fictionalScenario:
      'Cedarline Services SOC alert SIEM-2026-109B flagged abnormal after-hours authentication queries attributed to service account svc-aster across internal staging servers.',
    difficulty: 'beginner',
    learningObjectives: [
      'Query and filter SIEM event logs using logview by service, user, and severity',
      'Distinguish normal administrative background noise from suspicious access spikes',
      'Correlate host IDs with service account activity to uncover lateral access',
      'Document structured findings with event timestamps and justification',
    ],
    requiredKnowledge: [
      'Basic understanding of authentication logs and timestamps',
      'Familiarity with username and IP address conventions',
    ],
    relevantTools: ['logview', 'status'],
    status: 'playable',
    exerciseId: 'ex_blue_soc_log_triage',
    relatedRoleIds: ['role_soc_analyst', 'role_tier1_analyst'],
    prerequisites: ['cat_shared_networking'],
    mitreAttackTechniques: ['T1078.004 (Valid Accounts: Service Accounts)'],
    careerSkills: [
      { skillId: 'log_analysis', targetLevel: 2 },
      { skillId: 'security_fundamentals', targetLevel: 2 },
    ],
    expectedOutputDescription:
      'Logview output showing abnormal SHARE_ACCESS and AUTH_SUCCESS records for svc-aster on filesrv-01 outside normal business hours.',
    commonMistakes: [
      'Assuming every failed password attempt is a critical incident',
      'Failing to verify the source IP of anomalous authentication requests',
    ],
    recoveryGuidance:
      'Use "logview filter svc-aster" to isolate records specific to the target account, or inspect the Field Guide under Log Analysis.',
  },

  {
    id: 'cat_blue_ir_forensics',
    track: 'blue',
    discipline: 'incident_response',
    title: 'Incident Response & Digital Evidence Custody',
    summary: 'Investigate the Aster Incident, preserve forensic proof, and remediate permissions.',
    description:
      'Incident Responders coordinate rapid containment, evidence preservation, and policy hardening during active breaches. Follow the structured 6-phase response lifecycle: identify affected hosts, verify SHA-256 cryptographic evidence digests, isolate vulnerable services, and enforce the Principle of Least Privilege.',
    whyItMatters:
      'Hasty containment actions can destroy forensic evidence or disrupt critical business services. Rigorous chain of custody ensures post-incident accountability and successful audit verification.',
    fictionalScenario:
      'Autonomous internal assistant Aster was granted excessive role corporate-admin [*], allowing unauthorized queries to confidential payroll spreadsheets on filesrv-01.',
    difficulty: 'intermediate',
    learningObjectives: [
      'Map affected hosts and port listeners across the Marina Tower subnet',
      'Preserve digital evidence with verified SHA-256 cryptographic checksums',
      'Execute service isolation using aster-admin without terminating underlying servers',
      'Tighten RBAC permissions according to the Principle of Least Privilege',
      'Verify legitimate system availability after remediation has been deployed',
    ],
    requiredKnowledge: [
      'Network service mapping and port identification',
      'Cryptographic hash verification and integrity concepts',
      'Role-based access control (RBAC)',
    ],
    relevantTools: ['netmap', 'svcscan', 'evidence', 'aster-admin'],
    status: 'planned',
    relatedRoleIds: ['role_incident_responder', 'role_forensics_analyst'],
    prerequisites: ['cat_blue_soc_triage'],
    mitreAttackTechniques: [
      'T1078 (Valid Accounts)',
      'T1021.002 (Remote Services: SMB/Windows Admin Shares)',
      'T1548 (Abuse Elevation Control Mechanism)',
    ],
    careerSkills: [
      { skillId: 'incident_response', targetLevel: 3 },
      { skillId: 'evidence_handling', targetLevel: 2 },
      { skillId: 'reporting', targetLevel: 2 },
    ],
    expectedOutputDescription:
      'Evidence custody log showing verified SHA-256 hash, service containment status, and 200 OK verification result.',
    commonMistakes: [
      'Attempting to remediate permissions before documenting and preserving evidence',
      'Revoking necessary documentation scopes, breaking normal business workflows',
    ],
    recoveryGuidance:
      'Review the Incident Response Portal guidance tab or run "evidence verify EVD-2026-004" to check custody status.',
  },

  {
    id: 'cat_blue_network_defense',
    track: 'blue',
    discipline: 'network_defense',
    title: 'Network Defense & Perimeter Inventory Auditing',
    summary: 'Scan subnets to discover active nodes, identify anomalous ports, and audit exposure.',
    description:
      'Defenders maintain an accurate asset inventory to ensure unauthorized systems and unapproved services do not linger on internal networks. Practice subnet reconnaissance and service enumeration to discover rogue network nodes and unexpected exposed ports.',
    whyItMatters:
      'You cannot protect what you do not know exists. Unmonitored services represent prime lateral movement pivot points for adversaries.',
    fictionalScenario:
      'Cedarline IT has deployed new staging virtual machines on the 10.0.4.0/24 subnet. Validate which hosts are online and flag unapproved database or administrative listeners.',
    difficulty: 'beginner',
    learningObjectives: [
      'Scan fictional subnets with netmap to catalog active hostnames and IP addresses',
      'Inspect listener ports with svcscan to identify software products and versions',
      'Contrast approved service inventories with observed network telemetry',
    ],
    requiredKnowledge: ['IP addresses, subnets, and TCP port conventions'],
    relevantTools: ['netmap', 'svcscan'],
    status: 'planned',
    relatedRoleIds: ['role_security_engineer', 'role_tier1_analyst'],
    prerequisites: ['cat_shared_networking'],
    mitreAttackTechniques: ['T1046 (Network Service Discovery)'],
    careerSkills: [{ skillId: 'network_fundamentals', targetLevel: 2 }],
  },

  {
    id: 'cat_blue_iam_least_privilege',
    track: 'blue',
    discipline: 'iam_security',
    title: 'Identity & Access Management (IAM): Least Privilege',
    summary: 'Audit over-privileged identities and design role-based access control policies.',
    description:
      'Identity is the primary modern security boundary. Learn how wildcards in policy documents (role: corporate-admin [*]) grant unintended access across file shares and databases. Learn how to draft scoped policies (role: kb-assistant) that only grant necessary scopes (docs:read, kb:search).',
    whyItMatters:
      'Excessive permissions are the leading cause of privilege escalation and lateral data exposure.',
    fictionalScenario:
      'An automated assistant was granted corporate-admin privileges to facilitate development. Audit the policy document and remediate it to follow least privilege.',
    difficulty: 'intermediate',
    learningObjectives: [
      'Identify wildcard permissions and evaluate their security blast radius',
      'Draft granular permission scopes restricted to necessary business tasks',
      'Audit service account trust relationships',
    ],
    requiredKnowledge: ['Authentication vs. authorization, IAM roles, and scopes'],
    relevantTools: ['aster-admin', 'evidence'],
    status: 'informational',
    relatedRoleIds: ['role_security_engineer', 'role_security_architect'],
    prerequisites: ['cat_shared_web_auth'],
  },

  {
    id: 'cat_blue_threat_intel',
    track: 'blue',
    discipline: 'threat_intel',
    title: 'Cyber Threat Intelligence & IOC Analysis',
    summary: 'Analyze adversary behavior, tactics, and indicators of compromise (IOCs).',
    description:
      'Threat intelligence analysts track threat actors, their motivations, tooling, and known tactical patterns (TTPs). Learn how indicators of compromise (file hashes, IP addresses, domains) are ingested into security platforms to accelerate triage.',
    whyItMatters:
      'Threat intel transforms raw log alerts into actionable context, enabling proactive defense before an attacker achieves their objectives.',
    fictionalScenario:
      'A known threat actor group is actively targeting West African financial and logistics networks with credential spray tools. Correlate local logs with external advisories.',
    difficulty: 'intermediate',
    learningObjectives: [
      'Extract and evaluate indicators of compromise from intelligence bulletins',
      'Map observed attacker techniques to the MITRE ATT&CK enterprise matrix',
      'Recommend proactive defense controls based on adversary playbooks',
    ],
    requiredKnowledge: ['MITRE ATT&CK framework, forensic hash concepts'],
    relevantTools: ['logview', 'evidence'],
    status: 'informational',
    relatedRoleIds: ['role_threat_intel_analyst'],
    prerequisites: ['cat_blue_soc_triage'],
  },

  {
    id: 'cat_blue_app_cloud_sec',
    track: 'blue',
    discipline: 'app_cloud_security',
    title: 'Application & Cloud Workload Security',
    summary: 'Examine API authentication barriers, cloud logging, and data loss prevention.',
    description:
      'Application security protects the software layer from flaws such as injection, broken object-level authorization (BOLA), and insecure direct object references (IDOR). Examine how cloud services separate compute from storage and enforce API token expiration.',
    whyItMatters:
      'Applications represent the public front door of modern organizations. Even hardened networks can be bypassed through web application vulnerabilities.',
    fictionalScenario:
      'Cedarline customer portal app-portal-01 exposes an internal search endpoint. Review application logs to verify token validation and SQL input sanitization.',
    difficulty: 'advanced',
    learningObjectives: [
      'Understand OWASP Top 10 web application vulnerabilities',
      'Review application error logs for unauthorized object access attempts',
      'Design rate limiting and input validation defenses',
    ],
    requiredKnowledge: ['HTTP request/response lifecycle, REST APIs'],
    relevantTools: ['svcscan', 'logview'],
    status: 'planned',
    relatedRoleIds: ['role_appsec_analyst'],
    prerequisites: ['cat_shared_web_auth'],
  },

  {
    id: 'cat_blue_governance_risk',
    track: 'blue',
    discipline: 'governance_risk',
    title: 'Governance, Risk & Compliance (GRC)',
    summary: 'Security policy drafting, risk assessments, and compliance audit preparation.',
    description:
      'Security governance establishes the organizational policies, standards, and risk tolerances that guide defensive engineering. Learn how to perform qualitative risk assessments (Impact x Likelihood), verify compliance against regulatory frameworks, and maintain disaster recovery procedures.',
    whyItMatters:
      'Technology alone cannot secure an organization. Robust policies, user training, and accountability ensure defenses are implemented systematically.',
    fictionalScenario:
      'Prepare Cedarline Solutions for an upcoming ISO 27001 readiness review by auditing access control policies and backup verification logs.',
    difficulty: 'beginner',
    learningObjectives: [
      'Perform risk impact and likelihood scoring for enterprise assets',
      'Map technical security controls to regulatory requirements',
      'Formulate post-incident remediation roadmaps',
    ],
    requiredKnowledge: ['Basic risk concepts and policy structures'],
    relevantTools: ['status', 'evidence'],
    status: 'informational',
    relatedRoleIds: ['role_risk_analyst', 'role_security_architect'],
    prerequisites: ['cat_shared_ethics'],
  },

  // --------------------------------------------------------------------------
  // RED TEAM — AUTHORIZED ATTACK SIMULATION
  // --------------------------------------------------------------------------
  {
    id: 'cat_red_recon_surface',
    track: 'red',
    discipline: 'red_recon',
    title: 'Authorized Reconnaissance & Attack Surface Mapping',
    summary: 'Perform scoped discovery to map external attack surfaces and exposed services.',
    description:
      'Ethical security testers begin assessments by thoroughly evaluating the target organization’s attack surface within strict Rules of Engagement (RoE). Discover active nodes, identify banners, and find misconfigured services without disrupting operational uptime.',
    whyItMatters:
      'Attackers seek the path of least resistance. Defenders must understand what adversaries can discover from external network vantage points.',
    fictionalScenario:
      'Cedarline Solutions management has authorized an internal security assessment of staging subnet 10.0.4.0/24 under RoE #ROE-2026-AST. Identify accessible entry points.',
    difficulty: 'beginner',
    learningObjectives: [
      'Verify assessment authorization boundaries and target scope limits',
      'Enumerate hostnames and network roles using non-intrusive scanning',
      'Catalog open TCP ports and identify software versions from service banners',
      'Document discovered entry points in a structured reconnaissance brief',
    ],
    requiredKnowledge: ['TCP port numbers, subnet notation, Rules of Engagement'],
    relevantTools: ['netmap', 'svcscan'],
    status: 'playable',
    exerciseId: 'ex_red_authorized_recon_path',
    relatedRoleIds: ['role_security_tester', 'role_pen_tester'],
    prerequisites: ['cat_shared_ethics', 'cat_shared_networking'],
    mitreAttackTechniques: ['T1595 (Active Scanning)', 'T1046 (Network Service Discovery)'],
    careerSkills: [
      { skillId: 'network_fundamentals', targetLevel: 2 },
      { skillId: 'troubleshooting', targetLevel: 2 },
    ],
    expectedOutputDescription:
      'Reconnaissance summary identifying open ports across staging hosts and highlighting unauthenticated SMB port 445 on filesrv-01.',
    commonMistakes: [
      'Scanning targets outside the explicitly authorized Rules of Engagement scope',
      'Confusing port reachability with actual exploitable vulnerabilities',
    ],
    recoveryGuidance:
      'Inspect the RoE document to confirm IP ranges (10.0.4.0/24 only) before initiating scans.',
  },

  {
    id: 'cat_red_vuln_assessment',
    track: 'red',
    discipline: 'vuln_assessment',
    title: 'Vulnerability Assessment & Security Testing',
    summary: 'Safely validate service misconfigurations and out-of-date software components.',
    description:
      'Vulnerability assessments identify security flaws such as default credentials, unpatched daemons, and missing security headers. In Cyberlife, testing is conducted using safe, predefined probes that verify flaws without executing destructive payloads.',
    whyItMatters:
      'Proactively identifying vulnerabilities allows organizations to patch weaknesses before unauthorized threat actors can exploit them.',
    fictionalScenario:
      'Test internal file server filesrv-01 to verify whether legacy SMBv1 protocols or unauthenticated guest shares are accessible.',
    difficulty: 'intermediate',
    learningObjectives: [
      'Identify service version discrepancies against known vulnerability databases',
      'Distinguish between critical vulnerabilities and cosmetic configuration warnings',
      'Execute safe deterministic probes that validate flaws without causing denial of service',
    ],
    requiredKnowledge: ['Common Vulnerabilities and Exposures (CVE) concepts, service banners'],
    relevantTools: ['svcscan', 'logview'],
    status: 'planned',
    relatedRoleIds: ['role_pen_tester', 'role_appsec_analyst'],
    prerequisites: ['cat_red_recon_surface'],
    mitreAttackTechniques: ['T1190 (Exploit Public-Facing Application)'],
    careerSkills: [{ skillId: 'troubleshooting', targetLevel: 2 }],
  },

  {
    id: 'cat_red_attack_path',
    track: 'red',
    discipline: 'attack_path_analysis',
    title: 'Identity & Attack-Path Analysis',
    summary: 'Trace potential lateral movement paths through over-permissioned service accounts.',
    description:
      'Adversaries rarely exploit a single isolated server; they chain minor misconfigurations to reach crown-jewel assets. Model attack paths connecting web services, service accounts, and internal file repositories to demonstrate how an attacker could traverse from intranet portal to payroll data.',
    whyItMatters:
      'Patching individual vulnerabilities is ineffective if lateral movement paths remain wide open through trust relationships and shared credentials.',
    fictionalScenario:
      'Demonstrate how a compromise of app-portal-01 could allow lateral traversal to filesrv-01 via service account svc-aster.',
    difficulty: 'intermediate',
    learningObjectives: [
      'Map the relationship graph between application services and backend storage',
      'Analyze how service account scopes allow cross-boundary lateral traversal',
      'Construct a proof-of-concept attack path narrative with supporting evidence',
    ],
    requiredKnowledge: ['Service accounts, network segmentation, lateral movement'],
    relevantTools: ['netmap', 'logview', 'evidence'],
    status: 'planned',
    relatedRoleIds: ['role_pen_tester', 'role_security_architect'],
    prerequisites: ['cat_red_recon_surface', 'cat_blue_iam_least_privilege'],
    mitreAttackTechniques: ['T1021.002 (SMB/Windows Admin Shares)', 'T1078 (Valid Accounts)'],
  },

  {
    id: 'cat_red_social_engineering',
    track: 'red',
    discipline: 'social_engineering',
    title: 'Social Engineering & AI-Assisted Threat Simulation',
    summary: 'Recognize human-factor vectors: spear-phishing, pretexting, and prompt injection.',
    description:
      'Human error and social manipulation remain primary intrusion vectors. Study how attackers craft believable spear-phishing lures and how prompt injection attacks against LLM-based assistants can manipulate system instructions to leak sensitive data.',
    whyItMatters:
      'Technical defenses cannot prevent an intrusion if employees or AI agents can be tricked into granting access or bypassing controls.',
    fictionalScenario:
      'Analyze a simulated phishing email received by finance employee Folake Alabi that attempted to harvest intranet portal credentials.',
    difficulty: 'beginner',
    learningObjectives: [
      'Identify social engineering indicators: urgency, mismatched domains, pretexting',
      'Understand how prompt injection manipulates autonomous enterprise assistants',
      'Formulate user awareness training recommendations',
    ],
    requiredKnowledge: ['Email headers, basic AI assistant architecture'],
    relevantTools: ['logview'],
    status: 'informational',
    relatedRoleIds: ['role_security_tester'],
    prerequisites: ['cat_shared_ethics'],
  },

  {
    id: 'cat_red_adversary_emulation',
    track: 'red',
    discipline: 'adversary_emulation',
    title: 'Adversary Emulation & Safe Scenario Replay',
    summary:
      'Simulate specific threat actor tactics to test security posture against realistic threats.',
    description:
      'Adversary emulation tests enterprise defenses against known real-world threat actor playbooks. Replay safe, predefined sequences (initial access -> credential query -> file collection) to evaluate whether organizational detections fire reliably.',
    whyItMatters:
      'Testing isolated controls does not prove an organization can defend against a cohesive, multi-stage intrusion campaign.',
    fictionalScenario:
      'Execute a simulated multi-stage scenario modeling threat actor FIN-LAGOS to validate whether SOC analysts receive timely alert telemetry.',
    difficulty: 'advanced',
    learningObjectives: [
      'Deconstruct adversary playbooks into sequential, testable steps',
      'Execute controlled simulated behaviors strictly within sandbox bounds',
      'Record telemetry timestamps for Purple Team correlation',
    ],
    requiredKnowledge: ['MITRE ATT&CK enterprise matrices, attack lifecycles'],
    relevantTools: ['netmap', 'svcscan', 'logview'],
    status: 'planned',
    relatedRoleIds: ['role_pen_tester', 'role_purple_analyst'],
    prerequisites: ['cat_red_attack_path'],
  },

  {
    id: 'cat_red_reporting',
    track: 'red',
    discipline: 'red_reporting',
    title: 'Offensive Security Reporting & Retest Verification',
    summary: 'Draft finding reports, assign CVSS severities, and verify defensive remediations.',
    description:
      'The value of an offensive assessment lies entirely in the report delivered to defenders. Practice drafting actionable findings detailing the vulnerability, reproduction steps, business impact, CVSS severity rationale, and specific remediation advice. Conduct follow-up retesting to verify fixes.',
    whyItMatters:
      'A penetration test that does not clearly explain how to remediate the vulnerability leaves the organization at risk.',
    fictionalScenario:
      'Submit an authorized assessment report for the Aster Incident attack path and verify that Cedarline’s remediation blocked unauthorized SMB access.',
    difficulty: 'intermediate',
    learningObjectives: [
      'Draft technical findings with executive summaries and technical reproduction steps',
      'Assign objective severity ratings based on exploitability and impact',
      'Conduct verification retests to confirm successful remediation',
    ],
    requiredKnowledge: ['Technical writing, severity frameworks (CVSS)'],
    relevantTools: ['evidence', 'aster-admin'],
    status: 'planned',
    relatedRoleIds: ['role_pen_tester', 'role_security_tester'],
    prerequisites: ['cat_red_recon_surface'],
    careerSkills: [{ skillId: 'reporting', targetLevel: 2 }],
  },

  // --------------------------------------------------------------------------
  // PURPLE TEAM — COLLABORATIVE DEFENSE & DETECTION ENGINEERING
  // --------------------------------------------------------------------------
  {
    id: 'cat_purple_detection_validation',
    track: 'purple',
    discipline: 'detection_validation',
    title: 'Detection Validation & Telemetry Gap Analysis',
    summary:
      'Run simulated attacks, evaluate SIEM detections, and identify unmonitored blind spots.',
    description:
      'Purple Teaming unites offensive testing and defensive operations. In this foundational module, run a controlled adversary behavior against simulated infrastructure, inspect generated SIEM logs, and evaluate whether an alert was triggered or if a detection gap exists.',
    whyItMatters:
      'Organizations frequently assume their logging infrastructure detects attacks, only to discover during a breach that critical event sources were never configured or alerted on.',
    fictionalScenario:
      'Execute a simulated lateral movement access probe on filesrv-01. Notice that while the event is written to file-server logs, zero SIEM alerts fire due to missing detection rules.',
    difficulty: 'intermediate',
    learningObjectives: [
      'Execute an authorized simulated attack behavior and capture output timestamps',
      'Inspect SIEM alert streams to evaluate whether expected detections triggered',
      'Quantify detection gaps: distinguish between unlogged telemetry and unalerted logs',
      'Document detection gap findings for the detection engineering team',
    ],
    requiredKnowledge: ['SIEM event types, alert thresholds, MITRE ATT&CK techniques'],
    relevantTools: ['logview', 'status'],
    status: 'playable',
    exerciseId: 'ex_purple_detection_tuning_replay',
    relatedRoleIds: ['role_purple_analyst', 'role_detection_engineer'],
    prerequisites: ['cat_blue_soc_triage', 'cat_red_recon_surface'],
    mitreAttackTechniques: ['T1021.002 (SMB Access)', 'T1078 (Valid Accounts)'],
    careerSkills: [
      { skillId: 'log_analysis', targetLevel: 2 },
      { skillId: 'security_fundamentals', targetLevel: 2 },
    ],
    expectedOutputDescription:
      'Telemetry comparison showing 1 unmonitored lateral SMB access event in logs with 0 active SIEM alerts triggered.',
    commonMistakes: [
      'Assuming that because an event is logged in syslog, an alert was automatically sent to analysts',
    ],
    recoveryGuidance:
      'Open the Detection Rule Editor in the Purple Console to inspect which event types have enabled detection rules.',
  },

  {
    id: 'cat_purple_detection_engineering',
    track: 'purple',
    discipline: 'detection_engineering',
    title: 'Detection Engineering: Rule Tuning & False Positive Reduction',
    summary: 'Author and tune SIEM detection rules to catch threats with minimal noise.',
    description:
      'Detection engineers write precise logic (event source, matching field, operator, severity) that flags adversary behaviors without generating hundreds of false alarms. Configure and tune the Cedarline SIEM rule RULE-DET-SMB-LATERAL to detect abnormal service account access.',
    whyItMatters:
      'Too broad a rule floods analysts with false positives, causing real breaches to be ignored. Too narrow a rule allows attackers to slip by with minor variations in tooling.',
    fictionalScenario:
      'The default SIEM rule missed lateral movement on filesrv-01 because it was scoped exclusively to SSH port 22. Tune the rule to match SMB share events and service account targets.',
    difficulty: 'intermediate',
    learningObjectives: [
      'Configure field matching conditions: target field, comparison operator, match value',
      'Set appropriate alert severity levels (INFO, WARN, CRITICAL)',
      'Benchmark rules against historical log fixtures to verify 0 false positives on normal traffic',
      'Deploy and enable tuned detection logic in the authoritative simulation engine',
    ],
    requiredKnowledge: ['Boolean logic, event attributes, false positive concepts'],
    relevantTools: ['logview'],
    status: 'informational',
    relatedRoleIds: ['role_detection_engineer', 'role_purple_analyst'],
    prerequisites: ['cat_purple_detection_validation'],
    mitreAttackTechniques: ['T1021.002 (SMB)', 'T1078.004 (Service Accounts)'],
    careerSkills: [
      { skillId: 'log_analysis', targetLevel: 3 },
      { skillId: 'security_fundamentals', targetLevel: 2 },
    ],
  },

  {
    id: 'cat_purple_attack_mapping',
    track: 'purple',
    discipline: 'attack_mapping',
    title: 'MITRE ATT&CK Matrix Telemetry Alignment',
    summary: 'Map organizational telemetry and detection rules across adversary tactics.',
    description:
      'The MITRE ATT&CK framework provides a common taxonomy for analyzing threats. Map Cedarline’s current detection rules and telemetry coverage against tactical phases: Initial Access, Execution, Persistence, Privilege Escalation, Defense Evasion, and Lateral Movement.',
    whyItMatters:
      'Visualizing detection coverage reveals blind spots across the attack lifecycle, allowing budget and engineering effort to be directed where defenses are weakest.',
    fictionalScenario:
      'Review Cedarline’s ATT&CK heat map to identify unmonitored lateral movement techniques prior to the Aster Incident.',
    difficulty: 'intermediate',
    learningObjectives: [
      'Map specific event logs and alerts to standard ATT&CK technique IDs',
      'Identify tactical blind spots in an enterprise detection matrix',
      'Prioritize new detection rules based on high-risk technique coverage',
    ],
    requiredKnowledge: ['MITRE ATT&CK matrix structure (tactics vs. techniques)'],
    relevantTools: ['status'],
    status: 'informational',
    relatedRoleIds: ['role_purple_analyst', 'role_security_architect'],
    prerequisites: ['cat_purple_detection_validation'],
  },

  {
    id: 'cat_purple_collaborative_exercise',
    track: 'purple',
    discipline: 'collaborative_exercises',
    title: 'Closed-Loop Purple Team Exercise: Before vs. After Metrics',
    summary: 'Execute the full loop: test → detect gap → tune rule → replay → measure improvement.',
    description:
      'Complete the definitive Purple Team gameplay loop. Execute a baseline attack scenario, document the detection gap, tune the SIEM detection rule, replay the scenario against deterministic telemetry, and compare measurable outcomes: Detections (0% -> 100%), Time to Detect (N/A -> 42s), False Positives (0).',
    whyItMatters:
      'Collaborative security improvement provides objective, data-driven proof that organizational resilience has measurably increased.',
    fictionalScenario:
      'Prove that tuning RULE-DET-SMB-LATERAL enables immediate detection of svc-aster lateral movement without triggering false alerts on legitimate user Folake Alabi.',
    difficulty: 'intermediate',
    learningObjectives: [
      'Perform a controlled adversary behavior in a baseline state and record telemetry',
      'Tune SIEM detection rule parameters in response to observed gaps',
      'Replay the scenario under identical deterministic conditions',
      'Compare before-and-after detection metrics and document measurable improvement',
    ],
    requiredKnowledge: [
      'Full Purple Team loop (test, observe, tune, replay, compare)',
      'Security metrics (Time to Detect, Detection Rate, False Positive Rate)',
    ],
    relevantTools: ['logview'],
    status: 'informational',
    relatedRoleIds: ['role_purple_analyst', 'role_detection_engineer'],
    prerequisites: ['cat_purple_detection_validation', 'cat_purple_detection_engineering'],
    careerSkills: [
      { skillId: 'log_analysis', targetLevel: 3 },
      { skillId: 'incident_response', targetLevel: 2 },
      { skillId: 'reporting', targetLevel: 2 },
    ],
  },

  // --------------------------------------------------------------------------
  // SHARED FOUNDATIONS — CORE CYBERSECURITY LITERACY
  // --------------------------------------------------------------------------
  {
    id: 'cat_shared_networking',
    track: 'shared',
    discipline: 'shared_foundations',
    title: 'Networking Fundamentals & IP Subnetting',
    summary: 'Understand IPv4 addressing, subnets (CIDR), MAC addresses, and packet routing.',
    description:
      'Networking forms the foundation of all cybersecurity disciplines. Learn how IP addresses (10.0.4.15), subnets (255.255.255.0 / 10.0.4.0/24), and default gateways allow computers to communicate across local networks and route traffic across the internet.',
    whyItMatters:
      'Whether defending servers or identifying attack paths, you must understand how network devices exchange data and establish communication boundaries.',
    fictionalScenario:
      'Cedarline’s Lagos Island office uses subnet 10.0.4.0/24. Inspect workstation network configuration using status to understand subnet masks and gateways.',
    difficulty: 'beginner',
    learningObjectives: [
      'Understand IPv4 dotted-decimal notation and CIDR prefixes (/24)',
      'Distinguish between private local IP addresses (RFC 1918) and public internet routable addresses',
      'Explain the purpose of network gateways and ARP MAC resolution',
    ],
    requiredKnowledge: ['Basic computer literacy'],
    relevantTools: ['status', 'netmap'],
    status: 'informational',
    relatedRoleIds: ['role_tier1_analyst', 'role_security_tester'],
    prerequisites: [],
  },

  {
    id: 'cat_shared_operating_systems',
    track: 'shared',
    discipline: 'shared_foundations',
    title: 'Operating System Architecture & Process Isolation',
    summary: 'Processes, permissions, user context, and kernel vs. user-space boundaries.',
    description:
      'Operating systems manage hardware resources, file systems, and process memory isolation. Explore how permissions (POSIX user/group/other) prevent non-root users from reading sensitive files and how background daemons run under dedicated service accounts.',
    whyItMatters:
      'Intruders exploit weaknesses in OS configurations to escalate privileges from standard users to administrator or root.',
    fictionalScenario:
      'Examine the Parrot Security OS workstation environment using whoami to verify current user persona and system privileges.',
    difficulty: 'beginner',
    learningObjectives: [
      'Understand process execution context and user IDs (UID/GID)',
      'Explain file system permissions (read, write, execute)',
      'Understand daemon service accounts vs. human interactive logins',
    ],
    requiredKnowledge: ['Basic command line familiarity'],
    relevantTools: ['whoami', 'status'],
    status: 'informational',
    relatedRoleIds: ['role_tier1_analyst', 'role_security_engineer'],
    prerequisites: [],
  },

  {
    id: 'cat_shared_web_auth',
    track: 'shared',
    discipline: 'shared_foundations',
    title: 'Web Architecture, Authentication & Session Security',
    summary: 'HTTP protocols, REST APIs, session cookies, and multi-factor authentication.',
    description:
      'Modern applications communicate via HTTP/HTTPS APIs. Examine how authentication verifies identity (who you are via passwords/MFA) and authorization grants permissions (what you are allowed to access via tokens or RBAC roles).',
    whyItMatters:
      'Web applications and cloud APIs represent the most widely targeted attack surfaces in enterprise environments.',
    fictionalScenario:
      'Cedarline’s intranet portal uses token-based session verification. Review how API endpoints validate authorization headers.',
    difficulty: 'beginner',
    learningObjectives: [
      'Distinguish between authentication (AuthN) and authorization (AuthZ)',
      'Understand HTTP verbs (GET, POST), headers, and status codes (200, 401, 403, 404)',
      'Explain the security benefits of multi-factor authentication (MFA)',
    ],
    requiredKnowledge: ['Basic web browser concepts'],
    relevantTools: ['svcscan'],
    status: 'informational',
    relatedRoleIds: ['role_appsec_analyst', 'role_security_tester'],
    prerequisites: ['cat_shared_networking'],
  },

  {
    id: 'cat_shared_crypto_hygiene',
    track: 'shared',
    discipline: 'shared_foundations',
    title: 'Cryptographic Hygiene & Hash Integrity',
    summary: 'One-way cryptographic hash functions (SHA-256), digital signatures, and encryption.',
    description:
      'Cryptography provides confidentiality (encryption) and integrity (cryptographic hashing). Learn how SHA-256 generates a deterministic 64-character hexadecimal digest of digital files, ensuring that even a single altered byte completely changes the resulting hash.',
    whyItMatters:
      'Digital forensics and chain of custody rely on cryptographic hashes to prove in court or during security audits that evidence was not tampered with.',
    fictionalScenario:
      'Quarantine evidence artifact EVD-2026-004 and verify its SHA-256 hash using the evidence tool to confirm forensic integrity.',
    difficulty: 'beginner',
    learningObjectives: [
      'Explain the properties of cryptographic hash functions (deterministic, collision-resistant, one-way)',
      'Compute and verify SHA-256 digests of digital evidence files',
      'Distinguish between symmetric encryption, asymmetric encryption, and hashing',
    ],
    requiredKnowledge: ['Basic mathematics and file concepts'],
    relevantTools: ['evidence'],
    status: 'informational',
    relatedRoleIds: ['role_forensics_analyst', 'role_incident_responder'],
    prerequisites: [],
  },

  {
    id: 'cat_shared_ethics',
    track: 'shared',
    discipline: 'shared_foundations',
    title: 'Cybersecurity Ethics, Legal Scope & Authorization',
    summary: 'Rules of engagement, written authorization, responsible disclosure, and safety.',
    description:
      'The difference between a criminal cyberattack and a professional security assessment is authorization. Learn why ethical security professionals must have explicit written authorization, strict scope limits, defined rules of engagement, and emergency stop protocols before conducting any tests.',
    whyItMatters:
      'Unauthorized access is illegal under cybercrime laws worldwide. Ethical security professionals act with integrity, transparency, and respect for privacy.',
    fictionalScenario:
      'Review Rules of Engagement document #ROE-2026-AST before conducting authorized assessment activities on Cedarline staging systems.',
    difficulty: 'beginner',
    learningObjectives: [
      'Explain the critical importance of written scope and authorization',
      'Identify the components of professional Rules of Engagement (RoE)',
      'Understand responsible disclosure principles when finding vulnerabilities',
    ],
    requiredKnowledge: ['Professional ethics and legal compliance'],
    relevantTools: ['status'],
    status: 'informational',
    relatedRoleIds: ['role_pen_tester', 'role_risk_analyst', 'role_incident_responder'],
    prerequisites: [],
  },
];

// ============================================================================
// Playable Practical Exercises Definitions
// ============================================================================

export const PRACTICAL_EXERCISES: readonly PracticalExercise[] = [
  // --------------------------------------------------------------------------
  // BLUE TEAM EXERCISE
  // --------------------------------------------------------------------------
  {
    id: 'ex_blue_soc_log_triage',
    catalogueEntryId: 'cat_blue_soc_triage',
    title: 'Blue Team Exercise: SOC Log Correlation & Credential Spike Triage',
    track: 'blue',
    scenarioContext:
      'Cedarline SIEM generated warning alert LOG-2026-107B indicating service account svc-aster performed anomalous after-hours authentication against filesrv-01.',
    scopeOfAuthorization:
      'Internal SOC monitoring authorization. Inspect log telemetry for subnet 10.0.4.0/24.',
    startingHostId: 'ws-sec-04',
    availableTools: ['logview', 'status'],
    expectedActions: [
      'Execute logview in the terminal to inspect recent authentication records',
      'Filter logs to isolate target service account svc-aster',
      'Identify anomalous SHARE_ACCESS record on filesrv-01',
      'Submit finding documenting anomalous user, host, and event type',
    ],
    objectives: [
      {
        id: 'obj_blue_query_logs',
        title: 'Query Security Event Logs',
        description: 'Run logview in the terminal to inspect recent event telemetry.',
        isCompleted: false,
        hint: "Type 'logview' in the terminal to view all recent security events.",
      },
      {
        id: 'obj_blue_filter_account',
        title: 'Filter Telemetry for Target Account',
        description: 'Filter event records to isolate activity from user svc-aster.',
        isCompleted: false,
        hint: "Type 'logview filter svc-aster' or 'logview user svc-aster'.",
      },
      {
        id: 'obj_blue_identify_anomaly',
        title: 'Identify Anomalous File Server Access',
        description:
          'Locate event LOG-2026-107B showing svc-aster accessing payroll data on filesrv-01.',
        isCompleted: false,
        hint: "Inspect details for LOG-2026-107B using 'logview inspect LOG-2026-107B'.",
      },
    ],
    rubric: [
      {
        id: 'rubric_blue_query',
        criterion: 'Command Execution Accuracy',
        weight: 30,
        description: 'Successfully queries SIEM log store with appropriate filter parameters.',
      },
      {
        id: 'rubric_blue_analysis',
        criterion: 'Threat Correlation',
        weight: 40,
        description:
          'Correlates anomalous after-hours timestamp with unauthorized service account access.',
      },
      {
        id: 'rubric_blue_doc',
        criterion: 'Documentation & Triage Finding',
        weight: 30,
        description:
          'Correctly identifies filesrv-01 as the affected target and SMB share as the protocol.',
      },
    ],
    debrief:
      'Great work, Defender! You successfully investigated alert LOG-2026-107B and identified that service account svc-aster made unauthorized after-hours connections to filesrv-01. In an enterprise SOC, your triage finding would immediately escalate to the Incident Response team for containment.',
    rewardXp: 75,
    rewardKobo: 75_000, // ₦750.00
    skillRewards: {
      log_analysis: 50,
      security_fundamentals: 25,
    },
  },

  // --------------------------------------------------------------------------
  // RED TEAM EXERCISE
  // --------------------------------------------------------------------------
  {
    id: 'ex_red_authorized_recon_path',
    catalogueEntryId: 'cat_red_recon_surface',
    title: 'Red Team Exercise: Authorized Attack Surface & Attack Path Assessment',
    track: 'red',
    scenarioContext:
      'You are authorized under Rules of Engagement #ROE-2026-AST to perform internal penetration testing across Cedarline staging cluster (10.0.4.0/24). Evaluate attack paths from intranet portal app-portal-01 to backend file storage filesrv-01.',
    scopeOfAuthorization:
      'STRICT SCOPE: Subnet 10.0.4.0/24 only. Authorized targets: filesrv-01, app-portal-01. Unauthorized targets: vault-core-01 (RESTRICTED). Non-destructive testing only.',
    startingHostId: 'ws-sec-04',
    availableTools: ['netmap', 'svcscan', 'logview', 'evidence'],
    expectedActions: [
      'Confirm acceptance of the Rules of Engagement (RoE)',
      'Perform authorized discovery using netmap to identify active hosts',
      'Scan filesrv-01 with svcscan to discover listener port 445 (SMB)',
      'Identify that service account svc-aster has corporate-admin wildcard permissions',
      'Submit authorized penetration testing finding with evidence',
    ],
    objectives: [
      {
        id: 'obj_red_accept_roe',
        title: 'Review & Accept Rules of Engagement',
        description:
          'Review the scope of authorization and confirm engagement boundaries in the catalogue workspace.',
        isCompleted: false,
        hint: 'Click "Accept Rules of Engagement" in the Red Team Exercise workspace.',
      },
      {
        id: 'obj_red_recon_subnet',
        title: 'Execute Authorized Subnet Reconnaissance',
        description: 'Scan subnet 10.0.4.0/24 with netmap to enumerate active hostnames.',
        isCompleted: false,
        hint: "Type 'netmap hosts' in your terminal.",
      },
      {
        id: 'obj_red_scan_services',
        title: 'Inspect Target Service Listeners',
        description: 'Enumerate open services on filesrv-01 using svcscan.',
        isCompleted: false,
        hint: "Type 'svcscan inspect filesrv-01' in your terminal.",
      },
      {
        id: 'obj_red_submit_finding',
        title: 'Submit Authorized Finding Report',
        description:
          'Submit a formal finding detailing the exposed SMB service and over-privileged role risk.',
        isCompleted: false,
        hint: 'Click "Submit Red Team Finding" in the exercise panel once reconnaissance is verified.',
      },
    ],
    rubric: [
      {
        id: 'rubric_red_scope',
        criterion: 'Scope Compliance',
        weight: 30,
        description: 'Strict adherence to Rules of Engagement boundaries and authorized targets.',
      },
      {
        id: 'rubric_red_discovery',
        criterion: 'Reconnaissance Accuracy',
        weight: 35,
        description: 'Identifies open port 445 on filesrv-01 and maps attack path to svc-aster.',
      },
      {
        id: 'rubric_red_reporting',
        criterion: 'Finding Documentation',
        weight: 35,
        description: 'Documents high severity, business impact, and specific remediation advice.',
      },
    ],
    debrief:
      'Assessment Complete! As an authorized offensive security tester, your structured reconnaissance proved that unsegmented SMB access on port 445 coupled with wildcard service account permissions allowed an attacker on app-portal-01 to compromise filesrv-01. Your findings provide defenders with the exact evidence needed to justify network segmentation and IAM tightening.',
    rewardXp: 90,
    rewardKobo: 100_000, // ₦1,000.00
    skillRewards: {
      attack_simulation: 50,
      network_fundamentals: 40,
      troubleshooting: 30,
      reporting: 30,
    },
  },

  // --------------------------------------------------------------------------
  // PURPLE TEAM EXERCISE
  // --------------------------------------------------------------------------
  {
    id: 'ex_purple_detection_tuning_replay',
    catalogueEntryId: 'cat_purple_detection_validation',
    title: 'Purple Team Exercise: Detection Gap Analysis, Rule Tuning & Replay',
    track: 'purple',
    scenarioContext:
      'Execute the full Purple Team cycle. A simulated adversary probe accesses SMB shares on filesrv-01 using service account svc-aster. Evaluate the baseline detection gap, tune the SIEM detection rule, replay the scenario against deterministic telemetry, and compare measurable before-and-after results.',
    scopeOfAuthorization:
      'Authorized Purple Team testing environment. Safe deterministic simulation replay.',
    startingHostId: 'ws-sec-04',
    availableTools: ['logview'],
    expectedActions: [
      'Execute baseline scenario run to observe initial detection gap (0 alerts triggered)',
      'Inspect missing telemetry and identify unmonitored event source (file-server / SMB)',
      'Open the Detection Rule Editor and tune RULE-DET-SMB-LATERAL parameters',
      'Replay the scenario and verify that the tuned rule fires an alert with 0 false positives',
      'Compare before-and-after metrics (Detection Rate: 0% -> 100%, Detection Gap: CLOSED)',
    ],
    objectives: [
      {
        id: 'obj_purple_run_baseline',
        title: 'Run Baseline Scenario to Expose Gap',
        description:
          'Execute the initial scenario run in the Purple Console to demonstrate the detection blind spot.',
        isCompleted: false,
        hint: 'Click "Run Baseline Scenario" in the Purple Team Workspace.',
      },
      {
        id: 'obj_purple_tune_rule',
        title: 'Tune SIEM Detection Rule',
        description:
          'Configure RULE-DET-SMB-LATERAL with match field "source", operator "EQUALS", value "file-server", and enable the rule.',
        isCompleted: false,
        hint: 'Use the Detection Rule Editor in the Purple Console to tune and save the rule.',
      },
      {
        id: 'obj_purple_replay_scenario',
        title: 'Replay Scenario & Compare Metrics',
        description:
          'Replay the scenario against the deterministic event sequence to verify detection and compare metrics.',
        isCompleted: false,
        hint: 'Click "Replay Scenario with Tuned Rules" after saving your tuned rule.',
      },
    ],
    rubric: [
      {
        id: 'rubric_purple_gap',
        criterion: 'Gap Identification',
        weight: 30,
        description:
          'Identifies that baseline logging recorded the event but SIEM detection rules failed to trigger.',
      },
      {
        id: 'rubric_purple_tuning',
        criterion: 'Rule Engineering Precision',
        weight: 40,
        description:
          'Configures correct matching criteria without creating broad false-positive patterns.',
      },
      {
        id: 'rubric_purple_verification',
        criterion: 'Measurable Outcome Verification',
        weight: 30,
        description:
          'Demonstrates before-and-after metric improvement (100% detection rate, 0 false positives).',
      },
    ],
    debrief:
      'Purple Team Loop Complete! You observed a critical telemetry gap where an attacker could access sensitive file shares without triggering SIEM alarms. By tuning RULE-DET-SMB-LATERAL to monitor the file-server source and replaying the scenario under identical deterministic conditions, you proved a measurable improvement from 0% detection to 100% detection with zero false alarms. This is the heart of collaborative security engineering!',
    rewardXp: 120,
    rewardKobo: 120_000, // ₦1,200.00
    skillRewards: {
      detection_engineering: 50,
      log_analysis: 60,
      security_fundamentals: 40,
      reporting: 30,
    },
  },
];

// ============================================================================
// Default SIEM Detection Rules (for Purple Team Detection Engineering)
// ============================================================================

export const DEFAULT_DETECTION_RULES: readonly DetectionRule[] = [
  {
    id: 'RULE-DET-AUTH-BRUTEFORCE',
    name: 'Brute-Force Authentication Spike',
    description: 'Triggers when consecutive failed authentication attempts exceed threshold.',
    enabled: true,
    matchField: 'eventType',
    operator: 'EQUALS',
    matchValue: 'AUTH_FAILURE',
    alertSeverity: 'WARN',
    mitreTechnique: 'T1110 (Brute Force)',
    isTuned: false,
  },
  {
    id: 'RULE-DET-SSH-ROOT',
    name: 'Direct Root SSH Login Attempt',
    description: 'Detects any incoming SSH authentication with username root.',
    enabled: true,
    matchField: 'user',
    operator: 'EQUALS',
    matchValue: 'root',
    alertSeverity: 'CRITICAL',
    mitreTechnique: 'T1078 (Valid Accounts)',
    isTuned: false,
  },
  {
    id: 'RULE-DET-SMB-LATERAL',
    name: 'Lateral Movement via Internal File Share',
    description:
      'Monitors internal file server authentication for service account lateral traversal.',
    enabled: false, // Intentionally disabled/misconfigured initially to create the detection gap!
    matchField: 'source',
    operator: 'EQUALS',
    matchValue: 'unconfigured', // Player must tune this to 'file-server' or eventType 'SHARE_ACCESS'!
    alertSeverity: 'WARN',
    mitreTechnique: 'T1021.002 (Remote Services: SMB)',
    isTuned: false,
  },
  {
    id: 'RULE-DET-CLEAR-LOGS',
    name: 'Audit Log Tampering / Clearing',
    description: 'Alerts when system log daemons stop unexpectedly or logs are purged.',
    enabled: true,
    matchField: 'eventType',
    operator: 'EQUALS',
    matchValue: 'LOG_PURGE',
    alertSeverity: 'CRITICAL',
    mitreTechnique: 'T1070 (Indicator Removal)',
    isTuned: false,
  },
];
