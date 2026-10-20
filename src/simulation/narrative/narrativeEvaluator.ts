/**
 * Cyberlife — Milestone 14: Narrative Evaluator
 *
 * Pure, deterministic evaluation functions for faction standings, narrative prerequisites,
 * objective completion, and investigative conclusions.
 */

import {
  FactionStandingBand,
  InvestigativeConclusion,
  NarrativePrerequisites,
} from './narrativeTypes';
import { WorldFlagValue } from '../core/types';

export interface NarrativeEvaluationContext {
  readonly flags: Readonly<Record<string, WorldFlagValue>>;
  readonly careerLevel?: number;
  readonly completedJobs?: readonly string[];
  readonly skills?: Readonly<Record<string, number>>;
  readonly factionStandings?: Readonly<Record<string, number>>;
  readonly preservedEvidenceIds?: readonly string[];
}

/**
 * Clamps faction standing between -100 and +100 as an integer.
 */
export function clampFactionStanding(val: number): number {
  if (!Number.isFinite(val)) return 0;
  return Math.min(100, Math.max(-100, Math.round(val)));
}

/**
 * Returns the qualitative reputation band for a numeric standing score.
 */
export function getFactionStandingBand(standing: number): FactionStandingBand {
  const clamped = clampFactionStanding(standing);
  if (clamped <= -50) return 'HOSTILE';
  if (clamped <= -15) return 'DISTRUSTED';
  if (clamped <= 14) return 'NEUTRAL';
  if (clamped <= 49) return 'FAVORED';
  return 'ALLIED';
}

/**
 * Evaluates whether narrative prerequisites are met against a given evaluation context.
 */
export function isNarrativePrerequisiteMet(
  prereq: NarrativePrerequisites | undefined,
  context: NarrativeEvaluationContext
): boolean {
  if (!prereq) return true;

  // 1. Required flags
  if (prereq.requiredFlags) {
    for (const [k, expected] of Object.entries(prereq.requiredFlags)) {
      if (context.flags[k] !== expected) return false;
    }
  }

  // 2. Forbidden flags
  if (prereq.forbiddenFlags) {
    for (const k of prereq.forbiddenFlags) {
      if (context.flags[k]) return false;
    }
  }

  // 3. Minimum career level
  if (prereq.minCareerLevel !== undefined) {
    const level = context.careerLevel ?? 1;
    if (level < prereq.minCareerLevel) return false;
  }

  // 4. Required completed job
  if (prereq.requiredCompletedJobId) {
    const jobs = context.completedJobs ?? [];
    if (!jobs.includes(prereq.requiredCompletedJobId)) return false;
  }

  // 5. Minimum skill level
  if (prereq.minSkillLevel) {
    const userSkill = context.skills?.[prereq.minSkillLevel.skillId] ?? 0;
    if (userSkill < prereq.minSkillLevel.level) return false;
  }

  // 6. Required faction standing
  if (prereq.requiredFactionStanding) {
    const standing = context.factionStandings?.[prereq.requiredFactionStanding.factionId] ?? 0;
    if (standing < prereq.requiredFactionStanding.minStanding) return false;
  }

  // 7. Required evidence IDs
  if (prereq.requiredEvidenceIds && prereq.requiredEvidenceIds.length > 0) {
    const preserved = new Set(context.preservedEvidenceIds ?? []);
    for (const evId of prereq.requiredEvidenceIds) {
      if (!preserved.has(evId)) return false;
    }
  }

  return true;
}

/**
 * Evaluates if an investigative conclusion can be formulated from preserved evidence.
 * Requires that all requiredEvidenceIds are present in preservedEvidenceIds.
 */
export function canFormulateConclusion(
  conclusion: InvestigativeConclusion,
  preservedEvidenceIds: readonly string[]
): boolean {
  if (!conclusion.requiredEvidenceIds || conclusion.requiredEvidenceIds.length === 0) {
    return true;
  }
  const preservedSet = new Set(preservedEvidenceIds);
  return conclusion.requiredEvidenceIds.every(id => preservedSet.has(id));
}

/**
 * Calculates a dynamic confidence score based on completeness of evidence and corroborated logs.
 */
export function calculateConclusionConfidence(
  conclusion: InvestigativeConclusion,
  preservedEvidenceIds: readonly string[],
  discoveredLogIds: readonly string[] = []
): number {
  if (conclusion.requiredEvidenceIds.length === 0) {
    return conclusion.confidenceScore;
  }

  const preservedSet = new Set(preservedEvidenceIds);
  const logSet = new Set(discoveredLogIds);

  const evidenceMatches = conclusion.requiredEvidenceIds.filter(id => preservedSet.has(id)).length;
  const evidenceFraction = evidenceMatches / conclusion.requiredEvidenceIds.length;

  let logFraction = 1.0;
  if (conclusion.corroboratingLogIds.length > 0) {
    const logMatches = conclusion.corroboratingLogIds.filter(id => logSet.has(id)).length;
    logFraction = logMatches / conclusion.corroboratingLogIds.length;
  }

  // Weighted 75% on physical/cryptographic evidence, 25% on corroborated log traces
  const computed = (evidenceFraction * 0.75 + logFraction * 0.25) * conclusion.confidenceScore;
  return Math.min(100, Math.max(0, Math.round(computed)));
}
