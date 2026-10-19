import { SkillDefinition, SkillId, SkillState } from './types';

export const SKILL_DEFINITIONS: Readonly<Record<SkillId, SkillDefinition>> = {
  log_analysis: {
    id: 'log_analysis',
    name: 'Log Analysis & SIEM Triage',
    description:
      'Analyzing security event streams, auth logs, syslogs, and identifying suspicious intrusion telemetry.',
    maxLevel: 10,
  },
  network_fundamentals: {
    id: 'network_fundamentals',
    name: 'Network Fundamentals & Port Auditing',
    description:
      'Understanding TCP/IP, subnets, routing, port discovery, and diagnosing network perimeter exposures.',
    maxLevel: 10,
  },
  incident_response: {
    id: 'incident_response',
    name: 'Incident Response & Containment',
    description:
      'Coordinating containment actions, mitigating active intrusions, and isolating compromised workloads.',
    maxLevel: 10,
  },
  security_fundamentals: {
    id: 'security_fundamentals',
    name: 'Security Governance & IAM',
    description:
      'Principle of least privilege, role-based access control, cryptographic hygiene, and security policies.',
    maxLevel: 10,
  },
  evidence_handling: {
    id: 'evidence_handling',
    name: 'Evidence Custody & Forensics',
    description:
      'Preserving digital artefacts, verifying cryptographic SHA-256 hashes, and documenting forensic chain of custody.',
    maxLevel: 10,
  },
  reporting: {
    id: 'reporting',
    name: 'Technical Writing & Reporting',
    description:
      'Synthesizing incident root causes, drafting executive summaries, and communicating risk to stakeholders.',
    maxLevel: 10,
  },
  troubleshooting: {
    id: 'troubleshooting',
    name: 'Systems Diagnostics & Troubleshooting',
    description:
      'Methodical hardware and software diagnostics, service dependencies inspection, and bug isolation.',
    maxLevel: 10,
  },
  attack_simulation: {
    id: 'attack_simulation',
    name: 'Attack Simulation & Offensive Testing',
    description:
      'Authorized adversary tactics, surface reconnaissance, trust boundary probing, and structured vulnerability reporting.',
    maxLevel: 10,
  },
  detection_engineering: {
    id: 'detection_engineering',
    name: 'Detection Engineering & Rule Tuning',
    description:
      'Designing SIEM detection logic, evaluating false positives, measuring detection efficacy, and validating telemetry.',
    maxLevel: 10,
  },
};

export const XP_PER_LEVEL = 100;
export const MAX_SKILL_LEVEL = 10;

/**
 * Creates initial skill state for a new player.
 */
export function createInitialSkillState(): Record<SkillId, SkillState> {
  return {
    log_analysis: { id: 'log_analysis', level: 1, xp: 25, totalXp: 25 },
    network_fundamentals: { id: 'network_fundamentals', level: 1, xp: 20, totalXp: 20 },
    incident_response: { id: 'incident_response', level: 1, xp: 10, totalXp: 10 },
    security_fundamentals: { id: 'security_fundamentals', level: 1, xp: 30, totalXp: 30 },
    evidence_handling: { id: 'evidence_handling', level: 1, xp: 0, totalXp: 0 },
    reporting: { id: 'reporting', level: 1, xp: 15, totalXp: 15 },
    troubleshooting: { id: 'troubleshooting', level: 1, xp: 20, totalXp: 20 },
    attack_simulation: { id: 'attack_simulation', level: 1, xp: 10, totalXp: 10 },
    detection_engineering: { id: 'detection_engineering', level: 1, xp: 10, totalXp: 10 },
  };
}

/**
 * Awards XP to a specific skill state, handling level progression up to maxLevel (10).
 */
export function awardSkillXp(
  current: SkillState,
  xpEarned: number
): { readonly nextState: SkillState; readonly leveledUp: boolean; readonly levelsGained: number } {
  if (xpEarned <= 0) {
    return { nextState: current, leveledUp: false, levelsGained: 0 };
  }

  let level = current.level;
  let xp = current.xp + xpEarned;
  const totalXp = current.totalXp + xpEarned;
  let levelsGained = 0;

  while (xp >= XP_PER_LEVEL && level < MAX_SKILL_LEVEL) {
    xp -= XP_PER_LEVEL;
    level += 1;
    levelsGained += 1;
  }

  // Cap xp at 99 if at max level
  if (level >= MAX_SKILL_LEVEL && xp >= XP_PER_LEVEL) {
    xp = XP_PER_LEVEL - 1;
  }

  return {
    nextState: {
      id: current.id,
      level,
      xp,
      totalXp,
    },
    leveledUp: levelsGained > 0,
    levelsGained,
  };
}
