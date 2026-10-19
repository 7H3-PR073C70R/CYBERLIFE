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
};

export function getCareerLevelDefinition(pathId: CareerPathId, level: number) {
  const path = CAREER_PATHS[pathId];
  if (!path) return undefined;
  return path.levels.find(l => l.level === level);
}
