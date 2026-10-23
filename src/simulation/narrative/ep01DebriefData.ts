/**
 * Cyberlife — Episode 01 Debrief Data & Triage Scoring Engine
 *
 * Implements educational debrief data, ATT&CK mapping, Tier-1 lessons,
 * and a learning-focused scoring algorithm for Episode 01.
 *
 * SAFETY INVARIANT:
 * Zero host execution. 100% deterministic pure simulation logic.
 */

export interface DebriefEvaluationCriteria {
  readonly usedSmbFilter: boolean;
  readonly preservedIamEvidence: boolean;
  readonly preservedPcapEvidence: boolean;
  readonly executedContainment: boolean;
  readonly executedRemediation: boolean;
  readonly executedVerification: boolean;
  readonly choice: 'A' | 'B' | null;
}

export interface DebriefScorecard {
  readonly totalScore: number; // 0-100
  readonly grade: 'GRADE S' | 'GRADE A' | 'GRADE B' | 'GRADE C';
  readonly correctFindings: readonly string[];
  readonly missedFindings: readonly string[];
  readonly attckMappings: readonly string[];
  readonly tier1Lesson: string;
  readonly nistPhaseReview: string;
  readonly studyTopics: readonly string[];
}

export const EPISODE_01_DEBRIEF_CONTENT = {
  attckMappings: [
    'T1021.002: Remote Services — SMB/Windows Admin Shares',
    'T1071.001: Command and Control — Web Protocols',
  ],
  tier1Lesson:
    'In enterprise SOC environments, automated agent misconfigurations frequently disguise lateral traversal. Tier-1 analysts must always correlate perimeter proxy logs and outbound TLS flows with local application records before signing off on containment closure.',
  nistPhaseReview:
    'NIST SP 800-61 Rev. 2: Successfully advanced through Detection & Analysis (Phase 2), Containment, Eradication & Recovery (Phase 3), and Post-Incident Analysis (Phase 4).',
  studyTopics: [
    'SANS SEC503: Intrusion Detection In-Depth & Network Forensics',
    'RFC 2474: Definition of the Differentiated Services Field (DiffServ)',
    'NIST SP 800-61r2: Computer Security Incident Handling Guide',
  ],
};

/**
 * Evaluates the player's day-case actions into a comprehensive educational scorecard.
 */
export function evaluateEpisode01DayCase(
  criteria: DebriefEvaluationCriteria
): DebriefScorecard {
  let score = 0;
  const correctFindings: string[] = [];
  const missedFindings: string[] = [];

  // 1. Packet Filter Mastery (30 pts)
  if (criteria.usedSmbFilter) {
    score += 30;
    correctFindings.push('Applied precision Wireshark display filter "smb2.cmd == 5 && ip.addr == 10.0.4.15" to isolate Tree Connect.');
  } else {
    missedFindings.push('Did not execute precision display filter "smb2.cmd == 5" to isolate administrative share traversal.');
  }

  // 2. Evidence Preservation (25 pts)
  if (criteria.preservedIamEvidence && criteria.preservedPcapEvidence) {
    score += 25;
    correctFindings.push('Preserved cryptographic chain-of-custody for IAM policy snapshot (EVD-2026-004) and packet capture (EVD-2026-001).');
  } else if (criteria.preservedIamEvidence || criteria.preservedPcapEvidence) {
    score += 15;
    correctFindings.push('Preserved partial forensic evidence in Incident Portal.');
    missedFindings.push('Missed preserving full multi-source forensic artifacts before initiating containment.');
  } else {
    missedFindings.push('Failed to preserve cryptographic evidence artifacts before modifying system state.');
  }

  // 3. Technical Containment & Verification (30 pts)
  if (criteria.executedContainment && criteria.executedRemediation && criteria.executedVerification) {
    score += 30;
    correctFindings.push('Executed full lifecycle containment: severed unauthorized paths, enforced least-privilege role:kb-assistant, and verified remediation.');
  } else if (criteria.executedContainment || criteria.executedRemediation) {
    score += 15;
    correctFindings.push('Executed partial service containment on Aster assistant.');
    missedFindings.push('Did not complete formal recovery verification test suite.');
  } else {
    missedFindings.push('Aster assistant was not properly contained using aster-admin console.');
  }

  // 4. Incident Decision & Reporting (15 pts)
  if (criteria.choice === 'A') {
    score += 15;
    correctFindings.push('Truthfully escalated outbound pipeline staging anomaly to executive security board despite executive pressure.');
  } else if (criteria.choice === 'B') {
    score += 10;
    correctFindings.push('Strategically shielded internal systems team while containing permissions to conduct offline inquiry.');
  } else {
    score += 5;
    missedFindings.push('Incident report submitted without clear escalation decision.');
  }

  let grade: DebriefScorecard['grade'] = 'GRADE C';
  if (score >= 90) grade = 'GRADE S';
  else if (score >= 80) grade = 'GRADE A';
  else if (score >= 65) grade = 'GRADE B';

  return {
    totalScore: score,
    grade,
    correctFindings,
    missedFindings,
    attckMappings: EPISODE_01_DEBRIEF_CONTENT.attckMappings,
    tier1Lesson: EPISODE_01_DEBRIEF_CONTENT.tier1Lesson,
    nistPhaseReview: EPISODE_01_DEBRIEF_CONTENT.nistPhaseReview,
    studyTopics: EPISODE_01_DEBRIEF_CONTENT.studyTopics,
  };
}
