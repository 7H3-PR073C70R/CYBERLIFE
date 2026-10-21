/**
 * Cyberlife — Milestone 20: Shared Activity Framework & Opportunity Director Types
 *
 * Defines domain models, lifecycle states, objective contracts, eligibility
 * rules, reward/consequence specifications, and activity director state.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated in-memory domain model. Zero external network access or host commands.
 */

import type { CareerPathId, SkillId } from '../career/types';
import type { WorldFlagValue } from '../core/types';

export type ActivityType =
  | 'STORY_MISSION'
  | 'CYBER_CONTRACT'
  | 'DEFENSIVE_OPERATION'
  | 'RED_TEAM_ASSESSMENT'
  | 'INVESTIGATION'
  | 'CAREER_ASSIGNMENT'
  | 'TRAINING_EXERCISE'
  | 'SOCIAL_COMMITMENT'
  | 'PERSONAL_GOAL';

export type ActivityLifecycleState =
  | 'AVAILABLE'
  | 'DISCOVERED'
  | 'ACTIVE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'ABANDONED'
  | 'BLOCKED';

export type ActivityPriority =
  | 'PRIMARY_OBJECTIVE'
  | 'RECOMMENDED'
  | 'OPTIONAL'
  | 'TIME_SENSITIVE'
  | 'FOLLOW_UP';

export type ActivityObjectiveType =
  | 'RUN_TOOL'
  | 'RECORD_FINDING'
  | 'PRESERVE_EVIDENCE'
  | 'VERIFY_SERVICE'
  | 'SUBMIT_REPORT'
  | 'ANALYZE_TRAFFIC'
  | 'EXECUTE_ACTION'
  | 'RESOLVE_INCIDENT'
  | 'TALK_TO_NPC'
  | 'VISIT_LOCATION'
  | 'TUNE_RULE'
  | 'INTERVIEW_NPC'
  | 'INSPECT_OBJECT'
  | 'COMPARE_EVIDENCE'
  | 'REACH_CONCLUSION';

export interface ActivityObjective {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly type: ActivityObjectiveType;
  readonly target?: string;
  readonly isOptional?: boolean;
  readonly isCompleted: boolean;
  readonly hint?: string;
  readonly actionPrompt?: string;
  readonly explanation?: string;
}

export interface ActivityPrerequisites {
  readonly careerPath?: CareerPathId;
  readonly minCareerLevel?: number;
  readonly requiredSkills?: Readonly<Partial<Record<SkillId, number>>>;
  readonly requiredFlags?: Readonly<Record<string, WorldFlagValue>>;
  readonly prohibitedFlags?: ReadonlyArray<string>;
  readonly minReputationPoints?: number;
  readonly requiredLocationId?: string;
  readonly requiredTools?: ReadonlyArray<string>;
  readonly completedActivityIds?: ReadonlyArray<string>;
}

export interface ActivityReward {
  readonly payoutKobo: number;
  readonly careerXp: number;
  readonly skillRewards: Readonly<Partial<Record<SkillId, number>>>;
  readonly reputationPoints: number;
  readonly factionStanding?: Readonly<{ factionId: string; delta: number }>;
  readonly unlockedActivityIds?: ReadonlyArray<string>;
  readonly flagsToSet?: Readonly<Record<string, WorldFlagValue>>;
}

export interface ActivityConsequences {
  readonly penaltyKobo?: number;
  readonly reputationPenalty?: number;
  readonly followUpActivityIds?: ReadonlyArray<string>;
  readonly flagsToSet?: Readonly<Record<string, WorldFlagValue>>;
  readonly recoveryGuidance: string;
}

export interface ActivityDefinition {
  readonly id: string;
  readonly type: ActivityType;
  readonly title: string;
  readonly shortTitle: string;
  readonly description: string;
  readonly narrativeContext: string;
  readonly source: string;
  readonly priority: ActivityPriority;
  readonly locationId?: string;
  readonly prerequisites: ActivityPrerequisites;
  readonly objectives: ReadonlyArray<ActivityObjective>;
  readonly reward: ActivityReward;
  readonly consequences: ActivityConsequences;
  readonly deadlineDurationSeconds?: number;
  readonly isRepeatable: boolean;
  readonly whyRecommended?: string;
  readonly relatedEntityId?: string;
}

export interface ActivityRuntimeState {
  readonly definitionId: string;
  readonly status: ActivityLifecycleState;
  readonly discoveredAt: number;
  readonly acceptedAt?: number;
  readonly resolvedAt?: number;
  readonly deadlineSimulationTime?: number;
  readonly objectives: ReadonlyArray<ActivityObjective>;
  readonly progressPercentage: number;
  readonly rewardClaimed: boolean;
  readonly resolutionNotes?: string;
  readonly score?: number;
}

export interface LongTermCareerGoal {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly currentProgress: number;
  readonly maxProgress: number;
  readonly isCompleted: boolean;
  readonly unlockedReward: string;
  readonly relatedCareerPath?: CareerPathId;
}

export interface ActivityEvaluationHistoryRecord {
  readonly activityId: string;
  readonly title: string;
  readonly resolvedAt: number;
  readonly outcome: 'COMPLETED' | 'FAILED' | 'ABANDONED';
  readonly score: number;
  readonly rewardClaimed: boolean;
  readonly payoutKobo: number;
  readonly feedbackNotes: string;
}

export interface ActivityDirectorState {
  readonly activities: Readonly<Record<string, ActivityRuntimeState>>;
  readonly activeActivityId: string | null;
  readonly primaryObjectiveId: string | null;
  readonly recommendedActivityIds: ReadonlyArray<string>;
  readonly completedHistory: ReadonlyArray<ActivityEvaluationHistoryRecord>;
  readonly longTermGoals: ReadonlyArray<LongTermCareerGoal>;
  readonly guidanceFilter: 'ALL' | 'PRIMARY' | 'RECOMMENDED' | 'CAREER';
  readonly lastEvaluatedSimulationTime: number;
}
