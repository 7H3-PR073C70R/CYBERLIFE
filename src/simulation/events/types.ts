import { WorldFlagValue } from '../core/types';

export type SimulationEventType =
  | 'SIMULATION_TIME_ADVANCED'
  | 'PLAYER_ATTRIBUTE_CHANGED'
  | 'PLAYER_MONEY_CHANGED'
  | 'INVENTORY_ITEM_ADDED'
  | 'INVENTORY_ITEM_REMOVED'
  | 'WORLD_FLAG_CHANGED'
  | 'LOGICAL_PLAYER_LOCATION_CHANGED'
  | 'SIMULATION_TIMER_TRIGGERED'
  | 'SIMULATION_TIMER_SCHEDULED'
  | 'SIMULATION_TIMER_CANCELLED'
  | 'CYBER_ACTIVITY_RECORDED'
  | 'MISSION_STARTED'
  | 'MISSION_PHASE_ADVANCED'
  | 'MISSION_FINDING_RECORDED'
  | 'MISSION_EVIDENCE_PRESERVED'
  | 'MISSION_ASSESSMENT_SUBMITTED'
  | 'MISSION_CONTAINMENT_EXECUTED'
  | 'MISSION_REMEDIATION_APPLIED'
  | 'MISSION_VERIFICATION_COMPLETED'
  | 'MISSION_REPORT_SUBMITTED'
  | 'MISSION_COMPLETED'
  | 'NPC_DIALOGUE_STARTED'
  | 'NPC_DIALOGUE_CHOICE_SELECTED'
  | 'NPC_DIALOGUE_ENDED'
  | 'NPC_RELATIONSHIP_CHANGED'
  | 'NPC_MEMORY_RECORDED'
  | 'JOB_ACCEPTED'
  | 'JOB_COMPLETED'
  | 'CAREER_PROMOTED'
  | 'SKILL_PROGRESS_AWARDED'
  | 'ITEM_PURCHASED'
  | 'FINANCIAL_TRANSACTION_RECORDED'
  | 'RECURRING_EXPENSE_PAID'
  | 'RECURRING_EXPENSE_OVERDUE'
  | 'ONBOARDING_STEP_COMPLETED'
  | 'ONBOARDING_SKIPPED'
  | 'ONBOARDING_RESET'
  | 'GUIDANCE_HINT_DISMISSED'
  | 'GUIDANCE_MODE_CHANGED'
  | 'CATALOGUE_EXERCISE_STARTED'
  | 'CATALOGUE_EXERCISE_ACTION_SUBMITTED'
  | 'CATALOGUE_DETECTION_RULE_TUNED'
  | 'PURPLE_SCENARIO_EXECUTED'
  | 'RED_TEAM_FINDING_SUBMITTED'
  | 'CATALOGUE_EXERCISE_COMPLETED'
  | 'CATALOGUE_EXERCISE_RESET';

export interface BaseSimulationEvent<TType extends SimulationEventType, TPayload> {
  readonly id: string;
  readonly type: TType;
  readonly timestamp: number; // Simulation time in seconds
  readonly revision: number; // State revision after the event
  readonly payload: Readonly<TPayload>;
}

export type SimulationTimeAdvancedEvent = BaseSimulationEvent<
  'SIMULATION_TIME_ADVANCED',
  {
    readonly deltaSeconds: number;
    readonly totalSimulationSeconds: number;
    readonly calendarIso: string;
    readonly calendarTimeString: string;
  }
>;

export type PlayerAttributeChangedEvent = BaseSimulationEvent<
  'PLAYER_ATTRIBUTE_CHANGED',
  {
    readonly attribute: 'health' | 'energy';
    readonly previousValue: number;
    readonly newValue: number;
    readonly delta: number;
  }
>;

export type PlayerMoneyChangedEvent = BaseSimulationEvent<
  'PLAYER_MONEY_CHANGED',
  {
    readonly previousKobo: number;
    readonly newKobo: number;
    readonly deltaKobo: number;
    readonly operation: 'CREDIT' | 'DEBIT';
    readonly reason?: string;
  }
>;

export type InventoryItemAddedEvent = BaseSimulationEvent<
  'INVENTORY_ITEM_ADDED',
  {
    readonly itemId: string;
    readonly quantityAdded: number;
    readonly totalQuantity: number;
  }
>;

export type InventoryItemRemovedEvent = BaseSimulationEvent<
  'INVENTORY_ITEM_REMOVED',
  {
    readonly itemId: string;
    readonly quantityRemoved: number;
    readonly remainingQuantity: number;
  }
>;

export type WorldFlagChangedEvent = BaseSimulationEvent<
  'WORLD_FLAG_CHANGED',
  {
    readonly key: string;
    readonly previousValue: WorldFlagValue | undefined;
    readonly newValue: WorldFlagValue;
  }
>;

export type LogicalPlayerLocationChangedEvent = BaseSimulationEvent<
  'LOGICAL_PLAYER_LOCATION_CHANGED',
  {
    readonly previousLocationId: string;
    readonly newLocationId: string;
  }
>;

export type SimulationTimerTriggeredEvent = BaseSimulationEvent<
  'SIMULATION_TIMER_TRIGGERED',
  {
    readonly timerId: string;
    readonly label: string;
    readonly dueSimulationTime: number;
    readonly payload?: Readonly<Record<string, unknown>>;
  }
>;

export type SimulationTimerScheduledEvent = BaseSimulationEvent<
  'SIMULATION_TIMER_SCHEDULED',
  {
    readonly timerId: string;
    readonly label: string;
    readonly dueSimulationTime: number;
    readonly durationSeconds: number;
  }
>;

export type SimulationTimerCancelledEvent = BaseSimulationEvent<
  'SIMULATION_TIMER_CANCELLED',
  {
    readonly timerId: string;
  }
>;

export type CyberActivityRecordedEvent = BaseSimulationEvent<
  'CYBER_ACTIVITY_RECORDED',
  {
    readonly activityId: string;
    readonly tool: string;
    readonly action: string;
    readonly target?: string;
    readonly summary: string;
    readonly success: boolean;
    readonly metadata?: Readonly<Record<string, unknown>>;
  }
>;

export type MissionStartedEvent = BaseSimulationEvent<
  'MISSION_STARTED',
  {
    readonly missionId: string;
    readonly title: string;
  }
>;

export type MissionPhaseAdvancedEvent = BaseSimulationEvent<
  'MISSION_PHASE_ADVANCED',
  {
    readonly missionId: string;
    readonly previousPhase: string;
    readonly currentPhase: string;
  }
>;

export type MissionFindingRecordedEvent = BaseSimulationEvent<
  'MISSION_FINDING_RECORDED',
  {
    readonly missionId: string;
    readonly findingType: string;
    readonly targetId: string;
  }
>;

export type MissionEvidencePreservedEvent = BaseSimulationEvent<
  'MISSION_EVIDENCE_PRESERVED',
  {
    readonly missionId: string;
    readonly evidenceId: string;
    readonly hashSha256: string;
  }
>;

export type MissionAssessmentSubmittedEvent = BaseSimulationEvent<
  'MISSION_ASSESSMENT_SUBMITTED',
  {
    readonly missionId: string;
    readonly isAccurate: boolean;
    readonly feedback: string;
  }
>;

export type MissionContainmentExecutedEvent = BaseSimulationEvent<
  'MISSION_CONTAINMENT_EXECUTED',
  {
    readonly missionId: string;
    readonly action: string;
    readonly targetHost: string;
  }
>;

export type MissionRemediationAppliedEvent = BaseSimulationEvent<
  'MISSION_REMEDIATION_APPLIED',
  {
    readonly missionId: string;
    readonly role: string;
    readonly previousRole: string;
  }
>;

export type MissionVerificationCompletedEvent = BaseSimulationEvent<
  'MISSION_VERIFICATION_COMPLETED',
  {
    readonly missionId: string;
    readonly passed: boolean;
    readonly message: string;
  }
>;

export type MissionReportSubmittedEvent = BaseSimulationEvent<
  'MISSION_REPORT_SUBMITTED',
  {
    readonly missionId: string;
    readonly isApproved: boolean;
    readonly score: number;
    readonly feedback: string;
  }
>;

export type MissionCompletedEvent = BaseSimulationEvent<
  'MISSION_COMPLETED',
  {
    readonly missionId: string;
    readonly finalScore: number;
    readonly outcomeSummary: string;
  }
>;

export type NpcDialogueStartedEvent = BaseSimulationEvent<
  'NPC_DIALOGUE_STARTED',
  {
    readonly npcId: string;
    readonly initialNodeId: string;
  }
>;

export type NpcDialogueChoiceSelectedEvent = BaseSimulationEvent<
  'NPC_DIALOGUE_CHOICE_SELECTED',
  {
    readonly npcId: string;
    readonly choiceId: string;
    readonly previousNodeId: string;
    readonly nextNodeId: string;
    readonly isTerminal: boolean;
  }
>;

export type NpcDialogueEndedEvent = BaseSimulationEvent<
  'NPC_DIALOGUE_ENDED',
  {
    readonly npcId: string;
  }
>;

export type NpcRelationshipChangedEvent = BaseSimulationEvent<
  'NPC_RELATIONSHIP_CHANGED',
  {
    readonly npcId: string;
    readonly previousValue: number;
    readonly newValue: number;
    readonly delta: number;
    readonly reason: string;
    readonly band: string;
  }
>;

export type NpcMemoryRecordedEvent = BaseSimulationEvent<
  'NPC_MEMORY_RECORDED',
  {
    readonly npcId: string;
    readonly topic?: string;
    readonly choice?: string;
    readonly fact?: string;
    readonly commitment?: string;
  }
>;

export type JobAcceptedEvent = BaseSimulationEvent<
  'JOB_ACCEPTED',
  {
    readonly jobId: string;
    readonly title: string;
    readonly employer: string;
    readonly payoutKobo: number;
  }
>;

export type JobCompletedEvent = BaseSimulationEvent<
  'JOB_COMPLETED',
  {
    readonly jobId: string;
    readonly title: string;
    readonly payoutKobo: number;
    readonly careerXpEarned: number;
    readonly performanceRating: string;
  }
>;

export type CareerPromotedEvent = BaseSimulationEvent<
  'CAREER_PROMOTED',
  {
    readonly pathId: string;
    readonly previousLevel: number;
    readonly newLevel: number;
    readonly roleTitle: string;
  }
>;

export type SkillProgressAwardedEvent = BaseSimulationEvent<
  'SKILL_PROGRESS_AWARDED',
  {
    readonly skillId: string;
    readonly xpAwarded: number;
    readonly previousLevel: number;
    readonly newLevel: number;
    readonly totalXp: number;
  }
>;

export type ItemPurchasedEvent = BaseSimulationEvent<
  'ITEM_PURCHASED',
  {
    readonly itemId: string;
    readonly itemName: string;
    readonly priceKobo: number;
    readonly remainingMoneyKobo: number;
  }
>;

export type FinancialTransactionRecordedEvent = BaseSimulationEvent<
  'FINANCIAL_TRANSACTION_RECORDED',
  {
    readonly transactionId: string;
    readonly type: string;
    readonly amountKobo: number;
    readonly direction: 'CREDIT' | 'DEBIT';
    readonly balanceAfterKobo: number;
    readonly description: string;
  }
>;

export type RecurringExpensePaidEvent = BaseSimulationEvent<
  'RECURRING_EXPENSE_PAID',
  {
    readonly expenseId: string;
    readonly name: string;
    readonly amountKobo: number;
    readonly balanceAfterKobo: number;
  }
>;

export type RecurringExpenseOverdueEvent = BaseSimulationEvent<
  'RECURRING_EXPENSE_OVERDUE',
  {
    readonly expenseId: string;
    readonly name: string;
    readonly amountKobo: number;
    readonly playerMoneyKobo: number;
  }
>;

export type SimulationEvent =
  | SimulationTimeAdvancedEvent
  | PlayerAttributeChangedEvent
  | PlayerMoneyChangedEvent
  | InventoryItemAddedEvent
  | InventoryItemRemovedEvent
  | WorldFlagChangedEvent
  | LogicalPlayerLocationChangedEvent
  | SimulationTimerTriggeredEvent
  | SimulationTimerScheduledEvent
  | SimulationTimerCancelledEvent
  | CyberActivityRecordedEvent
  | MissionStartedEvent
  | MissionPhaseAdvancedEvent
  | MissionFindingRecordedEvent
  | MissionEvidencePreservedEvent
  | MissionAssessmentSubmittedEvent
  | MissionContainmentExecutedEvent
  | MissionRemediationAppliedEvent
  | MissionVerificationCompletedEvent
  | MissionReportSubmittedEvent
  | MissionCompletedEvent
  | NpcDialogueStartedEvent
  | NpcDialogueChoiceSelectedEvent
  | NpcDialogueEndedEvent
  | NpcRelationshipChangedEvent
  | NpcMemoryRecordedEvent
  | JobAcceptedEvent
  | JobCompletedEvent
  | CareerPromotedEvent
  | SkillProgressAwardedEvent
  | ItemPurchasedEvent
  | FinancialTransactionRecordedEvent
  | RecurringExpensePaidEvent
  | RecurringExpenseOverdueEvent
  | OnboardingStepCompletedEvent
  | OnboardingSkippedEvent
  | OnboardingResetEvent
  | GuidanceHintDismissedEvent
  | GuidanceModeChangedEvent
  | CatalogueExerciseStartedEvent
  | CatalogueExerciseActionSubmittedEvent
  | CatalogueDetectionRuleTunedEvent
  | PurpleScenarioExecutedEvent
  | RedTeamFindingSubmittedEvent
  | CatalogueExerciseCompletedEvent
  | CatalogueExerciseResetEvent;

export type OnboardingStepCompletedEvent = BaseSimulationEvent<
  'ONBOARDING_STEP_COMPLETED',
  {
    readonly stepId: string;
    readonly nextStepId?: string | null;
    readonly totalCompleted: number;
    readonly isIntroCompleted: boolean;
  }
>;

export type OnboardingSkippedEvent = BaseSimulationEvent<
  'ONBOARDING_SKIPPED',
  {
    readonly timestamp: number;
  }
>;

export type OnboardingResetEvent = BaseSimulationEvent<
  'ONBOARDING_RESET',
  {
    readonly timestamp: number;
  }
>;

export type GuidanceHintDismissedEvent = BaseSimulationEvent<
  'GUIDANCE_HINT_DISMISSED',
  {
    readonly hintId: string;
  }
>;

export type GuidanceModeChangedEvent = BaseSimulationEvent<
  'GUIDANCE_MODE_CHANGED',
  {
    readonly mode: 'guided' | 'experienced';
  }
>;

export type CatalogueExerciseStartedEvent = BaseSimulationEvent<
  'CATALOGUE_EXERCISE_STARTED',
  {
    readonly exerciseId: string;
    readonly title: string;
    readonly track: string;
  }
>;

export type CatalogueExerciseActionSubmittedEvent = BaseSimulationEvent<
  'CATALOGUE_EXERCISE_ACTION_SUBMITTED',
  {
    readonly exerciseId: string;
    readonly actionType: string;
    readonly payload?: Record<string, unknown>;
  }
>;

export type CatalogueDetectionRuleTunedEvent = BaseSimulationEvent<
  'CATALOGUE_DETECTION_RULE_TUNED',
  {
    readonly ruleId: string;
    readonly updates: Record<string, unknown>;
  }
>;

export type PurpleScenarioExecutedEvent = BaseSimulationEvent<
  'PURPLE_SCENARIO_EXECUTED',
  {
    readonly runType: 'baseline' | 'replay';
    readonly detected: boolean;
    readonly falsePositiveCount: number;
    readonly timeToDetectSeconds?: number | null;
  }
>;

export type RedTeamFindingSubmittedEvent = BaseSimulationEvent<
  'RED_TEAM_FINDING_SUBMITTED',
  {
    readonly findingId: string;
    readonly targetHost: string;
    readonly severity: string;
  }
>;

export type CatalogueExerciseCompletedEvent = BaseSimulationEvent<
  'CATALOGUE_EXERCISE_COMPLETED',
  {
    readonly exerciseId: string;
    readonly isFirstCompletion: boolean;
    readonly rewardKobo?: number;
    readonly skillXpReward?: number;
  }
>;

export type CatalogueExerciseResetEvent = BaseSimulationEvent<
  'CATALOGUE_EXERCISE_RESET',
  {
    readonly exerciseId: string;
  }
>;
