import { CareerPathDefinition, CareerPathId } from './types';

export const CAREER_PATHS: Readonly<Record<CareerPathId, CareerPathDefinition>> = {
  career_sec_analyst: {
    id: 'career_sec_analyst',
    title: 'Cybersecurity Operations & Incident Response',
    description:
      'Defend Lagos digital infrastructure against unauthorized intrusions, analyze suspicious telemetry, and remediate system exposures.',
    issuingOrg: 'Cedarline Solutions / Lagos Cyber Command',
    levels: [
      {
        level: 1,
        title: 'Trainee Analyst',
        description:
          'Entry-level orientation role focused on log ingestion, triage, and basic workstation tooling.',
        minXp: 0,
        requiredSkillLevels: {
          log_analysis: 1,
          security_fundamentals: 1,
        },
        minCompletedJobs: 0,
        salaryBonusKobo: 0,
      },
      {
        level: 2,
        title: 'Junior SOC Analyst',
        description:
          'Active monitoring of security event streams, triage of endpoint anomalies, and preliminary triage.',
        minXp: 100,
        requiredSkillLevels: {
          log_analysis: 2,
          network_fundamentals: 2,
          security_fundamentals: 2,
        },
        minCompletedJobs: 2,
        salaryBonusKobo: 25_000, // ₦250.00 base stipend bonus
      },
      {
        level: 3,
        title: 'Incident Response Specialist',
        description:
          'Lead investigative containment, cryptographic evidence custody, and stakeholder executive debriefs.',
        minXp: 300,
        requiredSkillLevels: {
          log_analysis: 3,
          incident_response: 3,
          evidence_handling: 2,
          reporting: 2,
        },
        minCompletedJobs: 4,
        salaryBonusKobo: 75_000, // ₦750.00 base stipend bonus
      },
    ],
  },
  career_it_support: {
    id: 'career_it_support',
    title: 'Enterprise IT Systems & Infrastructure',
    description:
      'Maintain enterprise networks, configure workstations, and troubleshoot service outages across Lagos Island business hubs.',
    issuingOrg: 'Marina Logistics Tech Services',
    levels: [
      {
        level: 1,
        title: 'Helpdesk Support Tech',
        description:
          'First-line support addressing ticket escalations, port checks, and workstation diagnostics.',
        minXp: 0,
        requiredSkillLevels: {
          troubleshooting: 1,
          network_fundamentals: 1,
        },
        minCompletedJobs: 0,
        salaryBonusKobo: 0,
      },
      {
        level: 2,
        title: 'Systems Support Specialist',
        description:
          'Subnet mapping, service inventory management, and network hardware taps deployment.',
        minXp: 100,
        requiredSkillLevels: {
          troubleshooting: 2,
          network_fundamentals: 2,
        },
        minCompletedJobs: 2,
        salaryBonusKobo: 20_000,
      },
      {
        level: 3,
        title: 'IT Operations Lead',
        description:
          'Coordinate enterprise infrastructure reliability, uptime monitoring, and vendor compliance.',
        minXp: 300,
        requiredSkillLevels: {
          troubleshooting: 3,
          network_fundamentals: 3,
          reporting: 2,
        },
        minCompletedJobs: 4,
        salaryBonusKobo: 60_000,
      },
    ],
  },
  career_red_sec: {
    id: 'career_red_sec',
    title: 'Offensive Security & Attack Simulation',
    description:
      'Simulate adversary tactics within strict rules of engagement, identify exploitable misconfigurations, and deliver actionable remediation guidance.',
    issuingOrg: 'RedCell Security Advisory / Lagos Island',
    levels: [
      {
        level: 1,
        title: 'Associate Security Tester',
        description:
          'Conduct authorized perimeter reconnaissance, service cataloguing, and basic vulnerability verification.',
        minXp: 0,
        requiredSkillLevels: {
          network_fundamentals: 1,
          attack_simulation: 1,
        },
        minCompletedJobs: 0,
        salaryBonusKobo: 0,
      },
      {
        level: 2,
        title: 'Penetration Tester',
        description:
          'Execute chained attack paths, evaluate IAM trust boundaries, and assess lateral movement viability.',
        minXp: 100,
        requiredSkillLevels: {
          network_fundamentals: 2,
          attack_simulation: 2,
          reporting: 1,
        },
        minCompletedJobs: 2,
        salaryBonusKobo: 30_000,
      },
      {
        level: 3,
        title: 'Adversary Emulation Specialist',
        description:
          'Design custom adversary campaigns mapped to MITRE ATT&CK, test defensive postures, and produce executive risk briefs.',
        minXp: 300,
        requiredSkillLevels: {
          network_fundamentals: 3,
          attack_simulation: 3,
          reporting: 2,
        },
        minCompletedJobs: 4,
        salaryBonusKobo: 80_000,
      },
    ],
  },
  career_purple_sec: {
    id: 'career_purple_sec',
    title: 'Collaborative Defense & Detection Engineering',
    description:
      'Bridge offensive validation and defensive engineering, tune SIEM correlation logic, and measure detection coverage before and after retests.',
    issuingOrg: 'Lagos Cyber Defense Alliance',
    levels: [
      {
        level: 1,
        title: 'Purple Team Analyst',
        description:
          'Execute baseline attack scenarios, inspect telemetry streams, and document detection coverage gaps.',
        minXp: 0,
        requiredSkillLevels: {
          log_analysis: 1,
          detection_engineering: 1,
        },
        minCompletedJobs: 0,
        salaryBonusKobo: 0,
      },
      {
        level: 2,
        title: 'Detection Engineer',
        description:
          'Author and tune correlation rules, analyze false positive rates, and validate telemetry pipelines.',
        minXp: 100,
        requiredSkillLevels: {
          log_analysis: 2,
          detection_engineering: 2,
          security_fundamentals: 2,
        },
        minCompletedJobs: 2,
        salaryBonusKobo: 35_000,
      },
      {
        level: 3,
        title: 'Security Validation Architect',
        description:
          'Oversee continuous detection validation pipelines, optimize mean time to detect/contain, and align with ATT&CK matrices.',
        minXp: 300,
        requiredSkillLevels: {
          log_analysis: 3,
          detection_engineering: 3,
          reporting: 2,
        },
        minCompletedJobs: 4,
        salaryBonusKobo: 85_000,
      },
    ],
  },
  career_bounty_hunter: {
    id: 'career_bounty_hunter',
    title: 'Independent Bug Bounty & Security Research',
    description:
      'Discover and responsibly disclose security vulnerabilities in enterprise platforms across West Africa for competitive bounty rewards.',
    issuingOrg: 'Eko Bounty Network & Cyber Defense Freelance',
    levels: [
      {
        level: 1,
        title: 'Freelance Bug Hunter',
        description: 'Triage public bug bounty scopes, perform passive reconnaissance, and author proof-of-concept submissions.',
        minXp: 0,
        requiredSkillLevels: {
          security_fundamentals: 1,
          network_fundamentals: 1,
        },
        minCompletedJobs: 0,
        salaryBonusKobo: 0,
      },
      {
        level: 2,
        title: 'Vulnerability Researcher',
        description: 'Identify complex privilege escalations, tool-calling injection, and cloud misconfigurations.',
        minXp: 150,
        requiredSkillLevels: {
          security_fundamentals: 2,
          attack_simulation: 2,
          reporting: 2,
        },
        minCompletedJobs: 2,
        salaryBonusKobo: 40_000,
      },
      {
        level: 3,
        title: 'Principal Zero-Day Hunter',
        description: 'High-reputation researcher uncovering critical infrastructure exposures and mentoring local analysts.',
        minXp: 350,
        requiredSkillLevels: {
          attack_simulation: 3,
          reporting: 3,
          evidence_handling: 2,
        },
        minCompletedJobs: 4,
        salaryBonusKobo: 95_000,
      },
    ],
  },
  career_independent_investigator: {
    id: 'career_independent_investigator',
    title: 'Digital Forensics & Corporate Integrity Investigations',
    description:
      'Conduct impartial digital investigations, preserve cryptographic evidence chains, and provide objective forensic audits.',
    issuingOrg: 'Lagos Island Legal & Integrity Chambers',
    levels: [
      {
        level: 1,
        title: 'Forensic Associate',
        description: 'Handle chain-of-custody tracking, compute cryptographic hashes, and inspect system log timelines.',
        minXp: 0,
        requiredSkillLevels: {
          evidence_handling: 1,
          log_analysis: 1,
        },
        minCompletedJobs: 0,
        salaryBonusKobo: 0,
      },
      {
        level: 2,
        title: 'Digital Forensic Auditor',
        description: 'Reconstruct physical-to-digital attack chronologies, analyze removable media telemetry, and verify SLA compliance.',
        minXp: 150,
        requiredSkillLevels: {
          evidence_handling: 2,
          log_analysis: 2,
          reporting: 2,
        },
        minCompletedJobs: 2,
        salaryBonusKobo: 45_000,
      },
      {
        level: 3,
        title: 'Lead Forensic Investigator',
        description: 'Authoritative expert witness delivering certified forensic incident disclosure reports to executive boards.',
        minXp: 350,
        requiredSkillLevels: {
          evidence_handling: 3,
          reporting: 3,
          incident_response: 2,
        },
        minCompletedJobs: 4,
        salaryBonusKobo: 100_000,
      },
    ],
  },
  career_security_consultant: {
    id: 'career_security_consultant',
    title: 'Enterprise Cybersecurity Consulting & Compliance Auditing',
    description:
      'Audit corporate information systems against Nigerian and international standards (NDPR, ISO/IEC 27001, PCI-DSS), assess control gaps, and recommend risk mitigation strategies.',
    issuingOrg: 'Lagos Tech Corridor Compliance Alliance',
    levels: [
      {
        level: 1,
        title: 'Associate Security Auditor',
        description:
          'Audit basic control domains, verify cryptographic storage policies, and inspect data inventory schemas.',
        minXp: 0,
        requiredSkillLevels: {
          security_fundamentals: 1,
          reporting: 1,
        },
        minCompletedJobs: 0,
        salaryBonusKobo: 0,
      },
      {
        level: 2,
        title: 'Senior Compliance Consultant',
        description:
          'Conduct comprehensive pre-launch technical audits, identity & access policy evaluations, and API secret leakage reviews.',
        minXp: 120,
        requiredSkillLevels: {
          security_fundamentals: 2,
          reporting: 2,
          log_analysis: 2,
        },
        minCompletedJobs: 2,
        salaryBonusKobo: 50_000,
      },
      {
        level: 3,
        title: 'Principal Enterprise Security Advisor',
        description:
          'Deliver binding regulatory compliance attestations, architect enterprise zero-trust frameworks, and guide executive risk governance.',
        minXp: 320,
        requiredSkillLevels: {
          security_fundamentals: 3,
          reporting: 3,
          incident_response: 2,
          evidence_handling: 2,
        },
        minCompletedJobs: 4,
        salaryBonusKobo: 110_000,
      },
    ],
  },
};

export function getCareerLevelDefinition(pathId: CareerPathId, level: number) {
  const path = CAREER_PATHS[pathId];
  if (!path) return undefined;
  return path.levels.find(l => l.level === level);
}
