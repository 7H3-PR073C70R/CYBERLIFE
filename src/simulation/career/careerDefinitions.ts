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
        description: 'Entry-level orientation role focused on log ingestion, triage, and basic workstation tooling.',
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
        description: 'Active monitoring of security event streams, triage of endpoint anomalies, and preliminary triage.',
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
        description: 'Lead investigative containment, cryptographic evidence custody, and stakeholder executive debriefs.',
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
        description: 'First-line support addressing ticket escalations, port checks, and workstation diagnostics.',
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
        description: 'Subnet mapping, service inventory management, and network hardware taps deployment.',
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
        description: 'Coordinate enterprise infrastructure reliability, uptime monitoring, and vendor compliance.',
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
};

export function getCareerLevelDefinition(
  pathId: CareerPathId,
  level: number
) {
  const path = CAREER_PATHS[pathId];
  if (!path) return undefined;
  return path.levels.find(l => l.level === level);
}
