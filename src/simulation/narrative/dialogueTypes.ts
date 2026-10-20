import { WorldFlagValue } from '../core/types';
import { AsterIncidentPhase } from '../missions/types';
import { NpcMemoryState } from '../actors/types';

export interface DialogueCondition {
  readonly minRelationship?: number;
  readonly maxRelationship?: number;
  readonly requiredFlags?: Readonly<Record<string, WorldFlagValue>>;
  readonly forbiddenFlags?: readonly string[];
  readonly requiredMissionPhase?: AsterIncidentPhase;
  readonly minMissionPhase?: AsterIncidentPhase;
  readonly requiredTopic?: string;
  readonly forbiddenTopic?: string;
  readonly requiredChoice?: string;
  readonly requiresMetBefore?: boolean;
  readonly minCareerLevel?: number;
  readonly requiredCompletedJobId?: string;
  readonly minSkillLevel?: { readonly skillId: string; readonly level: number };
  readonly requiredFactionStanding?: { readonly factionId: string; readonly minStanding: number };
  readonly requiredEvidenceIds?: readonly string[];
  readonly requiredChapterId?: string;
}

export type DialogueAction =
  | {
      readonly type: 'CHANGE_RELATIONSHIP';
      readonly delta: number;
      readonly reason: string;
    }
  | {
      readonly type: 'SET_FLAG';
      readonly key: string;
      readonly value: WorldFlagValue;
    }
  | {
      readonly type: 'RECORD_MEMORY';
      readonly topic: string;
      readonly fact?: string;
    }
  | {
      readonly type: 'ADVANCE_MISSION_PHASE';
      readonly targetPhase: AsterIncidentPhase;
    }
  | {
      readonly type: 'RECORD_FINDING';
      readonly findingType: 'host' | 'service' | 'log' | 'evidence';
      readonly targetId: string;
    }
  | {
      readonly type: 'ACCEPT_JOB';
      readonly jobId: string;
    }
  | {
      readonly type: 'CHANGE_FACTION_STANDING';
      readonly factionId: string;
      readonly delta: number;
      readonly reason: string;
    }
  | {
      readonly type: 'RECORD_INVESTIGATIVE_CONCLUSION';
      readonly conclusionId: string;
    }
  | {
      readonly type: 'RECORD_INVESTIGATIVE_EVIDENCE';
      readonly evidenceId: string;
      readonly source?: string;
      readonly title?: string;
      readonly description?: string;
      readonly hash?: string;
      readonly tags?: readonly string[];
    }
  | {
      readonly type: 'ADVANCE_STORY_CHAPTER';
      readonly chapterId: string;
    };

export interface DialogueChoice {
  readonly id: string;
  readonly text: string;
  readonly nextNodeId: string;
  readonly condition?: DialogueCondition;
  readonly actions?: readonly DialogueAction[];
}

export interface DialogueNode {
  readonly id: string;
  readonly speakerId: string;
  readonly text: string;
  readonly choices: readonly DialogueChoice[];
  readonly isTerminal?: boolean;
}

export interface DialogueEvaluationContext {
  readonly relationship: number;
  readonly memory: NpcMemoryState;
  readonly flags: Readonly<Record<string, WorldFlagValue>>;
  readonly missionPhase?: AsterIncidentPhase;
  readonly careerLevel?: number;
  readonly completedJobs?: readonly string[];
  readonly skills?: Readonly<Record<string, number>>;
  readonly factionStandings?: Readonly<Record<string, number>>;
  readonly preservedEvidenceIds?: readonly string[];
  readonly currentChapterId?: string;
}

export interface DialogueGraph {
  readonly npcId: string;
  readonly defaultNodeId: string;
  readonly nodes: Readonly<Record<string, DialogueNode>>;
  readonly getInitialNodeId?: (context: DialogueEvaluationContext) => string;
}
