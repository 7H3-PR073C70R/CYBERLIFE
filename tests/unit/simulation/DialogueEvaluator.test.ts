import { describe, it, expect } from 'vitest';
import {
  isDialogueConditionMet,
  getAvailableChoices,
} from '@/simulation/narrative/dialogueEvaluator';
import {
  DialogueCondition,
  DialogueEvaluationContext,
  DialogueNode,
} from '@/simulation/narrative/dialogueTypes';

describe('Milestone 7: Dialogue Evaluator & Condition Checking', () => {
  const baseContext: DialogueEvaluationContext = {
    relationship: 0,
    memory: {
      met: true,
      conversationCount: 1,
      topicsDiscussed: ['topic_soc_alert'],
      choicesMade: ['choice_empathy'],
      sharedFacts: ['fact_sysadmin_overworked'],
      commitments: [],
    },
    flags: { cedarline_incident_started: true },
    missionPhase: 'initial_assessment',
  };

  it('allows choices with no conditions unconditionally', () => {
    expect(isDialogueConditionMet(undefined, baseContext)).toBe(true);
  });

  describe('Relationship Conditions', () => {
    it('enforces minRelationship requirement', () => {
      const cond: DialogueCondition = { minRelationship: 25 };

      // Relationship 0 -> unmet
      expect(isDialogueConditionMet(cond, baseContext)).toBe(false);

      // Relationship 30 -> met
      expect(isDialogueConditionMet(cond, { ...baseContext, relationship: 30 })).toBe(true);
    });

    it('enforces maxRelationship requirement', () => {
      const cond: DialogueCondition = { maxRelationship: -20 };

      // Relationship 0 -> unmet
      expect(isDialogueConditionMet(cond, baseContext)).toBe(false);

      // Relationship -30 -> met
      expect(isDialogueConditionMet(cond, { ...baseContext, relationship: -30 })).toBe(true);
    });
  });

  describe('Memory & Topic Conditions', () => {
    it('evaluates requiredTopic and forbiddenTopic', () => {
      const reqCond: DialogueCondition = { requiredTopic: 'topic_soc_alert' };
      expect(isDialogueConditionMet(reqCond, baseContext)).toBe(true);
      expect(
        isDialogueConditionMet(reqCond, {
          ...baseContext,
          memory: { ...baseContext.memory, topicsDiscussed: [] },
        })
      ).toBe(false);

      const forbidCond: DialogueCondition = { forbiddenTopic: 'topic_soc_alert' };
      expect(isDialogueConditionMet(forbidCond, baseContext)).toBe(false);
      expect(
        isDialogueConditionMet(forbidCond, {
          ...baseContext,
          memory: { ...baseContext.memory, topicsDiscussed: [] },
        })
      ).toBe(true);
    });

    it('evaluates requiredChoice', () => {
      const reqChoice: DialogueCondition = { requiredChoice: 'choice_empathy' };
      expect(isDialogueConditionMet(reqChoice, baseContext)).toBe(true);
      expect(
        isDialogueConditionMet(reqChoice, {
          ...baseContext,
          memory: { ...baseContext.memory, choicesMade: [] },
        })
      ).toBe(false);
    });

    it('evaluates requiresMetBefore', () => {
      expect(isDialogueConditionMet({ requiresMetBefore: true }, baseContext)).toBe(true);
      expect(
        isDialogueConditionMet(
          { requiresMetBefore: true },
          { ...baseContext, memory: { ...baseContext.memory, met: false } }
        )
      ).toBe(false);
    });
  });

  describe('World Flag & Mission Phase Conditions', () => {
    it('evaluates requiredFlags and forbiddenFlags', () => {
      const reqFlag: DialogueCondition = {
        requiredFlags: { cedarline_incident_started: true },
      };
      expect(isDialogueConditionMet(reqFlag, baseContext)).toBe(true);
      expect(isDialogueConditionMet(reqFlag, { ...baseContext, flags: {} })).toBe(false);

      const forbidFlag: DialogueCondition = {
        forbiddenFlags: ['cedarline_incident_started'],
      };
      expect(isDialogueConditionMet(forbidFlag, baseContext)).toBe(false);
      expect(isDialogueConditionMet(forbidFlag, { ...baseContext, flags: {} })).toBe(true);
    });

    it('evaluates requiredMissionPhase and minMissionPhase', () => {
      expect(
        isDialogueConditionMet({ requiredMissionPhase: 'initial_assessment' }, baseContext)
      ).toBe(true);
      expect(isDialogueConditionMet({ requiredMissionPhase: 'remediation' }, baseContext)).toBe(
        false
      );

      // minMissionPhase: 'briefing' <= 'initial_assessment' -> true
      expect(isDialogueConditionMet({ minMissionPhase: 'briefing' }, baseContext)).toBe(true);
      // minMissionPhase: 'remediation' > 'initial_assessment' -> false
      expect(isDialogueConditionMet({ minMissionPhase: 'remediation' }, baseContext)).toBe(false);
    });
  });

  describe('getAvailableChoices filtering', () => {
    it('filters a list of choices on a DialogueNode returning only those satisfying conditions', () => {
      const node: DialogueNode = {
        id: 'node_test',
        speakerId: 'npc_test',
        text: 'Test node',
        choices: [
          { id: 'c1', text: 'Always visible', nextNodeId: 'node_test' },
          {
            id: 'c2',
            text: 'Needs high trust',
            nextNodeId: 'node_test',
            condition: { minRelationship: 40 },
          },
          {
            id: 'c3',
            text: 'Needs topic',
            nextNodeId: 'node_test',
            condition: { requiredTopic: 'topic_soc_alert' },
          },
        ],
      };

      const available = getAvailableChoices(node, baseContext);
      expect(available.map(c => c.id)).toEqual(['c1', 'c3']);
    });
  });
});
