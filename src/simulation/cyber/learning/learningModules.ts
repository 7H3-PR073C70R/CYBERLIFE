/**
 * Cyberlife — Progressive Cybersecurity Learning Modules Catalog
 *
 * Connects tools to guided practice, independent scenarios, and evidence-based assessments.
 */

import { CyberLearningModule } from './types';

export const CYBER_LEARNING_MODULES: readonly CyberLearningModule[] = [
  // 1. Beginner Concepts
  {
    id: 'mod_networking_fundamentals',
    title: 'IPv4 Addressing, Subnets & Host Resolution',
    summary:
      'Learn how devices on an internal network find one another using IP addresses, MAC addresses, and subnet masks.',
    teamTrack: 'shared',
    stage: 'beginner_concepts',
    estimatedMinutes: 15,
    learningObjectives: [
      'Understand how a /24 subnet limits host addresses (e.g. 10.0.4.1 to 10.0.4.254).',
      'Learn how the Address Resolution Protocol (ARP) translates IP addresses to hardware MAC addresses.',
      'Differentiate between private RFC 1918 subnets and internet gateways.',
    ],
    prerequisiteModuleIds: [],
    requiredSkillIds: ['skill_networking_basics'],
    relevantToolIds: ['tool_netmap', 'tool_terminal', 'tool_field_guide'],
    expectedEvidenceType: 'network_scan_report',
    assessmentCriteria: [
      {
        id: 'crit_arp_understanding',
        description: 'Correctly identify the role of ARP in local subnet communication.',
        maxScore: 10,
        requiredForPassing: true,
        validationMethod: 'action_dispatch',
      },
    ],
    commonMistakes: [
      {
        mistakeSummary: 'Assuming a host is down just because it does not respond to ping.',
        whyItHappens:
          'Many hardened servers drop ICMP Echo requests by default while keeping TCP listener ports active.',
        howToAvoid:
          'Use port/service probes (e.g. svcscan or TCP SYN sweeps) instead of relying solely on ICMP.',
      },
    ],
    completionCriteria: 'Perform a successful netmap sweep of 10.0.4.0/24 in the terminal.',
    careerPathRelevance:
      'Foundational prerequisite for SOC analysts, penetration testers, and network administrators.',
  },

  // 2. Guided Practice
  {
    id: 'mod_guided_service_enumeration',
    title: 'Guided Service Discovery & Version Auditing',
    summary:
      'Practice querying open ports, identifying application versions, and comparing findings against approved corporate policy.',
    teamTrack: 'shared',
    stage: 'guided_practice',
    estimatedMinutes: 20,
    learningObjectives: [
      'Learn how TCP three-way handshakes establish service connections.',
      'Extract daemon version banners from running software.',
      'Recognize unapproved or rogue listeners on internal servers.',
    ],
    prerequisiteModuleIds: ['mod_networking_fundamentals'],
    requiredSkillIds: ['skill_port_scanning'],
    relevantToolIds: ['tool_svcscan', 'tool_netmap'],
    linkedExerciseId: 'ex_red_authorized_recon_path',
    expectedEvidenceType: 'network_scan_report',
    assessmentCriteria: [
      {
        id: 'crit_service_enum',
        description: 'Successfully scan filesrv-01 and detect the open SMB port (445).',
        maxScore: 20,
        requiredForPassing: true,
        validationMethod: 'action_dispatch',
      },
    ],
    commonMistakes: [
      {
        mistakeSummary: 'Scanning outside of authorized engagement hours or subnets.',
        whyItHappens: 'Inexperienced analysts may probe arbitrary subnets without checking scope.',
        howToAvoid:
          'Always verify the signed Rules of Engagement (RoE) document before running scans.',
      },
    ],
    completionCriteria:
      'Identify all active listeners on filesrv-01 and report unapproved services.',
    careerPathRelevance:
      'Essential skill for Vulnerability Assessment and Penetration Testing (VAPT).',
  },

  // 3. Independent Exercises
  {
    id: 'mod_independent_log_triage',
    title: 'Independent SIEM Log Analysis & Threat Correlation',
    summary:
      'Filter and correlate authentication logs in EkoSec LogView to reconstruct the timeline of an unauthorized access event.',
    teamTrack: 'blue',
    stage: 'independent_exercise',
    estimatedMinutes: 25,
    learningObjectives: [
      'Filter high-volume logs by source, severity, and username.',
      'Differentiate normal administrative logins from anomalous credential usage.',
      'Establish a defensible incident timeline from multiple server sources.',
    ],
    prerequisiteModuleIds: ['mod_guided_service_enumeration'],
    requiredSkillIds: ['skill_log_analysis'],
    relevantToolIds: ['tool_logview', 'tool_incident'],
    linkedExerciseId: 'ex_blue_soc_log_triage',
    expectedEvidenceType: 'siem_event_log',
    assessmentCriteria: [
      {
        id: 'crit_isolate_anomaly',
        description: 'Isolate the anomalous 07:44:10 AM SMB authentication attempt by svc-aster.',
        maxScore: 30,
        requiredForPassing: true,
        validationMethod: 'action_dispatch',
      },
    ],
    commonMistakes: [
      {
        mistakeSummary: 'Treating every isolated failed login as a critical breach.',
        whyItHappens:
          'Users mistype passwords routinely; single failures are usually normal operational noise.',
        howToAvoid:
          'Look for velocity (bursts of failures), unusual hours, or service accounts authenticating to unexpected hosts.',
      },
    ],
    completionCriteria:
      'Pinpoint the anomalous authentication event in LogView and document it in the Incident Portal.',
    careerPathRelevance: 'Core daily operational competency for Tier 1 and Tier 2 SOC Analysts.',
  },

  // 4. Evidence-Based Assessment
  {
    id: 'mod_evidence_chain_custody',
    title: 'Cryptographic Evidence Integrity & Chain of Custody',
    summary:
      'Verify digital evidence against cryptographic SHA-256 digests and audit legal chain of custody records in Evidence Vault.',
    teamTrack: 'blue',
    stage: 'evidence_assessment',
    estimatedMinutes: 20,
    learningObjectives: [
      'Calculate and compare SHA-256 digests for acquired forensic artifacts.',
      'Understand the legal importance of timestamped, signed chain-of-custody ledgers.',
      'Spot tampered or corrupted evidence files before presenting findings.',
    ],
    prerequisiteModuleIds: ['mod_independent_log_triage'],
    requiredSkillIds: ['skill_forensics_basics'],
    relevantToolIds: ['tool_evidence', 'tool_incident'],
    linkedExerciseId: 'ex_blue_soc_log_triage',
    expectedEvidenceType: 'cryptographic_hash',
    assessmentCriteria: [
      {
        id: 'crit_evidence_hash_check',
        description: 'Execute evidence verify EVD-2026-001 and confirm intact state.',
        maxScore: 25,
        requiredForPassing: true,
        validationMethod: 'hash_verification',
      },
    ],
    commonMistakes: [
      {
        mistakeSummary: 'Opening evidence files directly in editable editors before hashing.',
        whyItHappens:
          'Accidentally modifying access timestamps or metadata can invalidate court admissibility.',
        howToAvoid:
          'Always work from read-only working copies and verify original cryptographic hashes immediately.',
      },
    ],
    completionCriteria:
      'Verify all items in the Evidence Vault and record verification signatures in Incident Portal.',
    careerPathRelevance:
      'Essential for Digital Forensics and Incident Response (DFIR) specialists.',
  },

  // 5. Advanced Scenarios
  {
    id: 'mod_advanced_attack_path',
    title: 'Authorized Attack-Path Mapping & Vulnerability Reporting',
    summary:
      'Execute an authorized red team engagement under Rules of Engagement ROE-2026-AST, trace lateral movement paths, and author remediation reports.',
    teamTrack: 'red',
    stage: 'advanced_scenario',
    estimatedMinutes: 30,
    learningObjectives: [
      'Trace how over-privileged service account tokens enable lateral movement to critical file servers.',
      'Document findings using industry-standard CVSS and root-cause taxonomies.',
      'Propose concrete remediation strategies including SMB signing and network segmentation.',
    ],
    prerequisiteModuleIds: ['mod_guided_service_enumeration'],
    requiredSkillIds: ['skill_penetration_testing'],
    relevantToolIds: ['tool_recon_path', 'tool_svcscan', 'tool_aster_admin'],
    linkedExerciseId: 'ex_red_authorized_recon_path',
    linkedScenarioName: 'Authorized Marina Tower Reconnaissance Path',
    expectedEvidenceType: 'vulnerability_finding',
    assessmentCriteria: [
      {
        id: 'crit_roe_acceptance',
        description: 'Formally accept Rules of Engagement before initiating lab simulation.',
        maxScore: 10,
        requiredForPassing: true,
        validationMethod: 'action_dispatch',
      },
      {
        id: 'crit_submit_finding',
        description: 'Submit verified lateral movement finding with remediation advice.',
        maxScore: 30,
        requiredForPassing: true,
        validationMethod: 'finding_submission',
      },
    ],
    commonMistakes: [
      {
        mistakeSummary:
          'Recommending that the vulnerable service simply be deleted rather than addressing permission scope.',
        whyItHappens: 'Fixing the symptom without understanding business dependencies.',
        howToAvoid:
          'Recommend least-privilege service account scoping and network micro-segmentation so business functions continue safely.',
      },
    ],
    completionCriteria:
      'Submit approved vulnerability finding VULN-2026-001 into the authoritative catalogue ledger.',
    careerPathRelevance:
      'Core requirement for Senior Penetration Testers and Security Consultants.',
  },

  // 6. Cross-Team Exercises
  {
    id: 'mod_purple_detection_engineering',
    title: 'Purple Team Detection Engineering & Alert Tuning',
    summary:
      'Collaborate across offensive and defensive paradigms: replay an attack scenario, detect telemetry blind spots, tune detection rules, and eliminate false positives.',
    teamTrack: 'purple',
    stage: 'cross_team_exercise',
    estimatedMinutes: 35,
    learningObjectives: [
      'Observe adversary techniques (SMB tree connects) from both attacker and SIEM perspectives.',
      'Tune detection rules (operator, match value, severity) to catch attacks with zero false alarms.',
      'Validate security posture improvements using automated replay baselines.',
    ],
    prerequisiteModuleIds: ['mod_independent_log_triage', 'mod_advanced_attack_path'],
    requiredSkillIds: ['skill_detection_engineering'],
    relevantToolIds: ['tool_rule_tuner', 'tool_logview', 'tool_attck_matrix'],
    linkedExerciseId: 'ex_purple_detection_tuning_replay',
    linkedScenarioName: 'SMB Lateral Movement Detection Tuning',
    expectedEvidenceType: 'detection_rule',
    assessmentCriteria: [
      {
        id: 'crit_tune_rule',
        description:
          'Configure RULE-DET-SMB-LATERAL to match file-server source and service account username.',
        maxScore: 25,
        requiredForPassing: true,
        validationMethod: 'action_dispatch',
      },
      {
        id: 'crit_run_replay',
        description: 'Replay PURPLE_SMB_LATERAL_SCENARIO and verify zero false alarms.',
        maxScore: 25,
        requiredForPassing: true,
        validationMethod: 'action_dispatch',
      },
    ],
    commonMistakes: [
      {
        mistakeSummary:
          'Creating overly broad detection rules that flood the SOC with hundreds of false alarms.',
        whyItHappens:
          'Writing rules that alert on any file access without scoping to service accounts or sensitive shares.',
        howToAvoid:
          'Anchor rules to high-fidelity conditions: specific administrative shares ($), service account identities, and off-baseline hosts.',
      },
    ],
    completionCriteria: 'Run scenario replay resulting in 1 True Positive and 0 False Positives.',
    careerPathRelevance:
      'High-demand skill set for Purple Team Engineers, Detection Engineers, and SOC Architects.',
  },
];
