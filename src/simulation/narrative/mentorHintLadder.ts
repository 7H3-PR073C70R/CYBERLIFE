/**
 * Cyberlife — Mentor Hint Ladder Engine
 *
 * Implements an authoritative, 3-level progressive hint system:
 * - Level 1 (Nudge): High-level tactical observation or contextual reminder
 * - Level 2 (Direction): Specific tool, flag, or architectural component recommendation
 * - Level 3 (Answer): Concrete terminal command, parameter, or exact Wireshark display filter
 *
 * Designed to deliver hints diegetically via Onion Chat or terminal notification
 * when an analyst stalls in 'Immersive' mode.
 *
 * SAFETY INVARIANT:
 * Zero host execution. 100% deterministic pure simulation logic.
 */

export type MentorHintTier = 1 | 2 | 3;

export interface MentorHintDefinition {
  readonly beatId: string;
  readonly tier1Nudge: string;
  readonly tier2Direction: string;
  readonly tier3Answer: string;
  readonly idleThresholdSecondsTier1: number;
  readonly idleThresholdSecondsTier2: number;
  readonly idleThresholdSecondsTier3: number;
}

export interface MentorHintEvaluationResult {
  readonly shouldDeliver: boolean;
  readonly tier?: MentorHintTier;
  readonly hintText?: string;
  readonly hintId?: string;
}

/**
 * Evaluates whether a mentor hint should be dispatched based on elapsed beat idle time
 * and hints already delivered for the active beat.
 */
export function evaluateMentorHint(
  hintDef: MentorHintDefinition | undefined,
  idleSeconds: number,
  deliveredHintIds: readonly string[]
): MentorHintEvaluationResult {
  if (!hintDef) {
    return { shouldDeliver: false };
  }

  const id3 = `${hintDef.beatId}_tier3`;
  const id2 = `${hintDef.beatId}_tier2`;
  const id1 = `${hintDef.beatId}_tier1`;

  // Tier 3 Answer
  if (idleSeconds >= hintDef.idleThresholdSecondsTier3 && !deliveredHintIds.includes(id3)) {
    return {
      shouldDeliver: true,
      tier: 3,
      hintText: hintDef.tier3Answer,
      hintId: id3,
    };
  }

  // Tier 2 Direction
  if (idleSeconds >= hintDef.idleThresholdSecondsTier2 && !deliveredHintIds.includes(id2)) {
    return {
      shouldDeliver: true,
      tier: 2,
      hintText: hintDef.tier2Direction,
      hintId: id2,
    };
  }

  // Tier 1 Nudge
  if (idleSeconds >= hintDef.idleThresholdSecondsTier1 && !deliveredHintIds.includes(id1)) {
    return {
      shouldDeliver: true,
      tier: 1,
      hintText: hintDef.tier1Nudge,
      hintId: id1,
    };
  }

  return { shouldDeliver: false };
}
