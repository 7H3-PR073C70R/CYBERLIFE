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
};
