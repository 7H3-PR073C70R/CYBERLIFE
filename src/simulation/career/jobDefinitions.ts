import { JobListing } from './types';

export const JOB_LISTINGS: Readonly<Record<string, JobListing>> = {
  job_cedarline_triage: {
    id: 'job_cedarline_triage',
    title: 'Cedarline Ticket: Triage svc-aster Credential Spike',
    employer: 'Cedarline Solutions',
    contactNpcId: 'npc_amina',
    description:
      'Investigate unusual after-hours authentication requests attributed to service account svc-aster in Marina Tower internal logs. Identify anomalous query patterns.',
    minCareerLevel: 1,
    requiredSkills: {
      log_analysis: 1,
    },
    payoutKobo: 75_000, // ₦750.00
    careerXpReward: 50,
    skillRewards: {
      log_analysis: 45,
      incident_response: 25,
    },
    estimatedMinutes: 10,
    isRepeatable: false,
    objectives: [
      {
        id: 'obj_triage_log',
        type: 'RUN_TOOL',
        description: 'Examine authentication logs using logview or terminal diagnostics.',
        target: 'logview',
        isCompleted: false,
      },
      {
        id: 'obj_record_finding',
        type: 'RECORD_FINDING',
        description: 'Record finding identifying svc-aster unauthorized credential use.',
        target: 'svc-aster',
        isCompleted: false,
      },
    ],
  },

  job_marina_port_audit: {
    id: 'job_marina_port_audit',
    title: 'Marina Logistics: Subnet Port & Service Audit',
    employer: 'Marina Logistics Ltd',
    contactNpcId: 'npc_femi',
    description:
      'Perform a non-intrusive service audit across Marina branch infrastructure (192.168.10.0/24). Identify all open listener ports and catalog database endpoints.',
    minCareerLevel: 1,
    requiredSkills: {
      network_fundamentals: 1,
    },
    payoutKobo: 120_000, // ₦1,200.00
    careerXpReward: 75,
    skillRewards: {
      network_fundamentals: 50,
      troubleshooting: 30,
    },
    estimatedMinutes: 15,
    isRepeatable: false,
    objectives: [
      {
        id: 'obj_port_scan',
        type: 'RUN_TOOL',
        description: 'Execute netmap or svcscan across network subnet.',
        target: 'netmap',
        isCompleted: false,
      },
      {
        id: 'obj_verify_svc',
        type: 'VERIFY_SERVICE',
        description: 'Verify exposed database endpoint and catalog open services.',
        target: 'database_service',
        isCompleted: false,
      },
    ],
  },

  job_eko_forensics: {
    id: 'job_eko_forensics',
    title: 'Eko Tech Bureau: Forensic Database Hash Verification',
    employer: 'Eko Tech Bureau',
    contactNpcId: 'npc_yusuf',
    description:
      'Verify the SHA-256 cryptographic digest of a quarantined database dump to ensure evidence chain of custody was not altered during transfer.',
    minCareerLevel: 2,
    requiredSkills: {
      log_analysis: 2,
      evidence_handling: 1,
    },
    payoutKobo: 180_000, // ₦1,800.00
    careerXpReward: 100,
    skillRewards: {
      evidence_handling: 60,
      reporting: 40,
    },
    estimatedMinutes: 20,
    isRepeatable: false,
    objectives: [
      {
        id: 'obj_preserve_evidence',
        type: 'PRESERVE_EVIDENCE',
        description: 'Preserve evidence hash with documented cryptographic checksum.',
        target: 'database_dump_hash',
        isCompleted: false,
      },
      {
        id: 'obj_verify_custody',
        type: 'VERIFY_SERVICE',
        description: 'Confirm forensic integrity record in workstation evidence ledger.',
        target: 'forensic_integrity',
        isCompleted: false,
      },
    ],
  },

  job_broadstreet_containment: {
    id: 'job_broadstreet_containment',
    title: 'Broad Street Retail: Payment Gateway Containment Audit',
    employer: 'Broad Street Commercial Merchant Alliance',
    contactNpcId: 'npc_chioma',
    description:
      'Audit access control policies for merchant payment services. Validate that service isolation rules are enforced and unneeded network scopes are revoked.',
    minCareerLevel: 2,
    requiredSkills: {
      incident_response: 2,
      security_fundamentals: 2,
    },
    payoutKobo: 250_000, // ₦2,500.00
    careerXpReward: 150,
    skillRewards: {
      incident_response: 70,
      security_fundamentals: 50,
    },
    estimatedMinutes: 25,
    isRepeatable: false,
    objectives: [
      {
        id: 'obj_verify_containment',
        type: 'VERIFY_SERVICE',
        description: 'Validate containment and IAM scope restrictions.',
        target: 'containment_policy',
        isCompleted: false,
      },
      {
        id: 'obj_submit_summary',
        type: 'SUBMIT_REPORT',
        description: 'Submit technical containment audit report.',
        target: 'containment_audit_report',
        isCompleted: false,
      },
    ],
  },

  job_lagos_risk_briefing: {
    id: 'job_lagos_risk_briefing',
    title: 'Lagos Tech Council: Enterprise Cloud Risk Briefing',
    employer: 'Lagos State Digital Governance Advisory',
    description:
      'Draft an executive risk assessment briefing for municipal tech directors detailing lessons learned from service account credential misconfigurations.',
    minCareerLevel: 2,
    requiredSkills: {
      reporting: 2,
      security_fundamentals: 2,
    },
    payoutKobo: 350_000, // ₦3,500.00
    careerXpReward: 200,
    skillRewards: {
      reporting: 80,
      security_fundamentals: 60,
    },
    estimatedMinutes: 30,
    isRepeatable: false,
    objectives: [
      {
        id: 'obj_draft_risk_memo',
        type: 'SUBMIT_REPORT',
        description: 'Draft and submit cloud IAM executive briefing.',
        target: 'cloud_iam_risk_memo',
        isCompleted: false,
      },
    ],
  },

  job_red_surface_audit: {
    id: 'job_red_surface_audit',
    title: 'RedCell: Authorized Attack Surface & Identity Path Audit',
    employer: 'RedCell Security Advisory',
    contactNpcId: 'npc_femi',
    description:
      'Perform an authorized reconnaissance and privilege escalation path audit against Marina staging assets within documented Rules of Engagement.',
    minCareerLevel: 1,
    requiredSkills: {
      attack_simulation: 1,
      network_fundamentals: 1,
    },
    payoutKobo: 150_000,
    careerXpReward: 100,
    skillRewards: {
      attack_simulation: 50,
      reporting: 30,
    },
    estimatedMinutes: 15,
    isRepeatable: false,
    objectives: [
      {
        id: 'obj_red_roe_accept',
        type: 'RUN_TOOL',
        description: 'Review and accept authorized Rules of Engagement in the Cyber Catalogue.',
        target: 'catalogue',
        isCompleted: false,
      },
      {
        id: 'obj_red_submit_finding',
        type: 'RECORD_FINDING',
        description: 'Submit an authorized Red Team finding identifying the lateral movement path.',
        target: 'red_finding',
        isCompleted: false,
      },
    ],
  },

  job_purple_siem_rule_tune: {
    id: 'job_purple_siem_rule_tune',
    title: 'Lagos Alliance: SIEM Detection Engineering & Replay Validation',
    employer: 'Lagos Cyber Defense Alliance',
    contactNpcId: 'npc_amina',
    description:
      'Analyze initial detection telemetry gaps on SMB lateral movement, tune correlation logic, and validate detection with 0 false positives.',
    minCareerLevel: 1,
    requiredSkills: {
      detection_engineering: 1,
      log_analysis: 1,
    },
    payoutKobo: 160_000,
    careerXpReward: 110,
    skillRewards: {
      detection_engineering: 50,
      log_analysis: 35,
    },
    estimatedMinutes: 15,
    isRepeatable: false,
    objectives: [
      {
        id: 'obj_purple_tune_rule',
        type: 'RUN_TOOL',
        description: 'Open SIEM Rule Editor and configure correlation rule parameters.',
        target: 'catalogue',
        isCompleted: false,
      },
      {
        id: 'obj_purple_validate_replay',
        type: 'VERIFY_SERVICE',
        description:
          'Replay the adversary scenario and verify detection firing with zero false positives.',
        target: 'detection_tune',
        isCompleted: false,
      },
    ],
  },

  // M23 — Additional Playable Professions Job Listings
  job_marina_forensic_timeline: {
    id: 'job_marina_forensic_timeline',
    title: 'Marina Maritime: Disk Artifact & Exfiltration Forensic Analysis',
    employer: 'Marina Logistics Port Authority',
    contactNpcId: 'npc_marcus',
    description:
      'Acquire cryptographic hash of seized removable drive, parse filesystem MFT for timestomping anomalies, and extract exfiltrated data archive.',
    minCareerLevel: 1,
    requiredSkills: {
      evidence_handling: 1,
      log_analysis: 1,
    },
    payoutKobo: 180_000,
    careerXpReward: 120,
    skillRewards: {
      evidence_handling: 60,
      log_analysis: 45,
    },
    estimatedMinutes: 15,
    isRepeatable: false,
    objectives: [
      {
        id: 'obj_forensics_hash_verify',
        type: 'RUN_TOOL',
        description: 'Verify SHA-256 cryptographic hash of evidence image using forensics CLI.',
        target: 'forensics',
        isCompleted: false,
      },
      {
        id: 'obj_forensics_timestomp_detect',
        type: 'RECORD_FINDING',
        description: 'Analyze Master File Table records and identify timestomped exfiltration files.',
        target: 'forensics',
        isCompleted: false,
      },
      {
        id: 'obj_forensics_submit_report',
        type: 'SUBMIT_REPORT',
        description: 'Compile defensible digital forensic disclosure report with verified chain of custody.',
        target: 'forensics',
        isCompleted: false,
      },
    ],
  },

  job_interbank_siem_triage: {
    id: 'job_interbank_siem_triage',
    title: 'Broad Street Interbank: Peak-Hour SOC Alert Triage & Containment',
    employer: 'Broad Street Financial Interbank',
    contactNpcId: 'npc_amina',
    description:
      'Triage high-priority security events on core interbank switch, differentiate critical brute force / C2 beacons from routine payroll jobs, and isolate compromised nodes.',
    minCareerLevel: 1,
    requiredSkills: {
      incident_response: 1,
      log_analysis: 1,
    },
    payoutKobo: 200_000,
    careerXpReward: 130,
    skillRewards: {
      incident_response: 60,
      log_analysis: 50,
    },
    estimatedMinutes: 15,
    isRepeatable: false,
    objectives: [
      {
        id: 'obj_soc_queue_review',
        type: 'RUN_TOOL',
        description: 'Review pending alert queue using soctriage CLI tool.',
        target: 'soctriage',
        isCompleted: false,
      },
      {
        id: 'obj_soc_isolate_endpoint',
        type: 'VERIFY_SERVICE',
        description: 'Apply network containment to isolate compromised endpoints and suppress false positives.',
        target: 'soctriage',
        isCompleted: false,
      },
      {
        id: 'obj_soc_submit_escalation',
        type: 'SUBMIT_REPORT',
        description: 'Submit graded SOC triage bundle and incident escalation ticket.',
        target: 'soctriage',
        isCompleted: false,
      },
    ],
  },

  job_fintech_compliance_audit: {
    id: 'job_fintech_compliance_audit',
    title: 'Paystack Partner: Pre-Launch Security & NDPR Compliance Audit',
    employer: 'Lagos Tech Corridor Compliance Alliance',
    contactNpcId: 'npc_elizabeth',
    description:
      'Execute comprehensive pre-launch regulatory audit across Paystack partner infrastructure. Verify database encryption, detect leaked production API keys in staging code, and issue compliance certification.',
    minCareerLevel: 1,
    requiredSkills: {
      security_fundamentals: 1,
      reporting: 1,
    },
    payoutKobo: 220_000,
    careerXpReward: 140,
    skillRewards: {
      security_fundamentals: 60,
      reporting: 50,
    },
    estimatedMinutes: 20,
    isRepeatable: false,
    objectives: [
      {
        id: 'obj_audit_domain_scans',
        type: 'RUN_TOOL',
        description: 'Inspect encryption, API secrets, and access control domains using complianceaudit tool.',
        target: 'complianceaudit',
        isCompleted: false,
      },
      {
        id: 'obj_audit_remediation_plan',
        type: 'RECORD_FINDING',
        description: 'Compile prioritized remediation matrix for critical and high severity audit findings.',
        target: 'complianceaudit',
        isCompleted: false,
      },
      {
        id: 'obj_audit_certify_verdict',
        type: 'SUBMIT_REPORT',
        description: 'Issue formal regulatory attestation and conditional launch authorization certificate.',
        target: 'complianceaudit',
        isCompleted: false,
      },
    ],
  },
};
