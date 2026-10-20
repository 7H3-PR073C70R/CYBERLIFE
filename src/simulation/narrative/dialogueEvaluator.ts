import {
  DialogueChoice,
  DialogueCondition,
  DialogueEvaluationContext,
  DialogueNode,
} from './dialogueTypes';
import { AsterIncidentPhase } from '../missions/types';

const PHASE_ORDER: Record<AsterIncidentPhase, number> = {
  briefing: 1,
  initial_assessment: 2,
  investigation: 3,
  evidence_preservation: 4,
  containment: 5,
  remediation: 6,
  verification: 7,
  reporting: 8,
  completed: 9,
};

/**
 * Checks whether a dialogue condition evaluates to true given the player's context.
 */
export function isDialogueConditionMet(
  condition: DialogueCondition | undefined,
  context: DialogueEvaluationContext
): boolean {
  if (!condition) return true;

  // Relationship check
  if (condition.minRelationship !== undefined && context.relationship < condition.minRelationship) {
    return false;
  }
  if (condition.maxRelationship !== undefined && context.relationship > condition.maxRelationship) {
    return false;
  }

  // Met before check
  if (condition.requiresMetBefore !== undefined) {
    const wasMet = context.memory.met && context.memory.conversationCount > 0;
    if (condition.requiresMetBefore !== wasMet) {
      return false;
    }
  }

  // Required world flags
  if (condition.requiredFlags) {
    for (const [key, value] of Object.entries(condition.requiredFlags)) {
      if (context.flags[key] !== value) {
        return false;
      }
    }
  }

  // Forbidden world flags
  if (condition.forbiddenFlags) {
    for (const key of condition.forbiddenFlags) {
      if (context.flags[key]) {
        return false;
      }
    }
  }

  // Exact mission phase check
  if (condition.requiredMissionPhase && context.missionPhase !== condition.requiredMissionPhase) {
    return false;
  }

  // Minimum mission phase check (cumulative progress)
  if (condition.minMissionPhase && context.missionPhase) {
    const currentOrder = PHASE_ORDER[context.missionPhase] ?? 0;
    const requiredOrder = PHASE_ORDER[condition.minMissionPhase] ?? 0;
    if (currentOrder < requiredOrder) {
      return false;
    }
  }

  // Required topic discussed
  if (
    condition.requiredTopic &&
    !context.memory.topicsDiscussed.includes(condition.requiredTopic)
  ) {
    return false;
  }

  // Forbidden topic discussed
  if (
    condition.forbiddenTopic &&
    context.memory.topicsDiscussed.includes(condition.forbiddenTopic)
  ) {
    return false;
  }

  // Required choice made in past
  if (condition.requiredChoice && !context.memory.choicesMade.includes(condition.requiredChoice)) {
    return false;
  }

  // Minimum career level check
  if (
    condition.minCareerLevel !== undefined &&
    (context.careerLevel ?? 1) < condition.minCareerLevel
  ) {
    return false;
  }

  // Required completed job check
  if (
    condition.requiredCompletedJobId &&
    !(context.completedJobs ?? []).includes(condition.requiredCompletedJobId)
  ) {
    return false;
  }

  // Minimum skill level check
  if (condition.minSkillLevel) {
    const curLevel = context.skills?.[condition.minSkillLevel.skillId] ?? 0;
    if (curLevel < condition.minSkillLevel.level) {
      return false;
    }
  }

  // Required faction standing check
  if (condition.requiredFactionStanding) {
    const currentStanding =
      context.factionStandings?.[condition.requiredFactionStanding.factionId] ?? 0;
    if (currentStanding < condition.requiredFactionStanding.minStanding) {
      return false;
    }
  }

  // Required evidence IDs check
  if (condition.requiredEvidenceIds && condition.requiredEvidenceIds.length > 0) {
    const preserved = new Set(context.preservedEvidenceIds ?? []);
    for (const evId of condition.requiredEvidenceIds) {
      if (!preserved.has(evId)) {
        return false;
      }
    }
  }

  // Required chapter check
  if (condition.requiredChapterId && context.currentChapterId !== condition.requiredChapterId) {
    return false;
  }

  return true;
}

/**
 * Filters the available response choices for a dialogue node based on current context.
 */
export function getAvailableChoices(
  node: DialogueNode,
  context: DialogueEvaluationContext
): readonly DialogueChoice[] {
  return node.choices.filter(choice => isDialogueConditionMet(choice.condition, context));
}
