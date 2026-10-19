import { WorldFlagValue, SimulationState } from '../core/types';
import { SimulationEvent } from '../events/types';
import { BoundedAttribute } from '../systems/playerSystem';

export type SimulationErrorCode =
  | 'INVALID_COMMAND'
  | 'INVALID_ARGUMENT'
  | 'INVALID_TIME_DELTA'
  | 'ATTRIBUTE_OUT_OF_BOUNDS'
  | 'INSUFFICIENT_FUNDS'
  | 'INVALID_CURRENCY_AMOUNT'
  | 'ITEM_NOT_FOUND'
  | 'INSUFFICIENT_ITEM_QUANTITY'
  | 'INVALID_ITEM_QUANTITY'
  | 'INVALID_FLAG_KEY'
  | 'INVALID_FLAG_VALUE'
  | 'INVALID_LOCATION'
  | 'TIMER_ALREADY_EXISTS'
  | 'TIMER_NOT_FOUND'
  | 'NPC_NOT_FOUND'
  | 'DIALOGUE_NODE_NOT_FOUND'
  | 'DIALOGUE_CHOICE_NOT_FOUND'
  | 'DIALOGUE_CONDITION_NOT_MET'
  | 'NO_ACTIVE_DIALOGUE'
  | 'JOB_NOT_FOUND'
  | 'JOB_ALREADY_ACTIVE'
  | 'JOB_ALREADY_COMPLETED'
  | 'JOB_REQUIREMENTS_NOT_MET'
  | 'JOB_OBJECTIVES_INCOMPLETE'
  | 'CAREER_NOT_PROMOTION_ELIGIBLE'
  | 'ITEM_NOT_IN_CATALOGUE'
  | 'PURCHASE_LIMIT_REACHED'
  | 'EXPENSE_NOT_FOUND'
  | 'EXPENSE_NOT_OVERDUE'
  | 'CATALOGUE_ENTRY_NOT_FOUND'
  | 'CATALOGUE_EXERCISE_ERROR'
  | 'INVARIANT_VIOLATION';

export interface AdvanceSimulationTimeCommand {
  readonly type: 'AdvanceSimulationTime';
  readonly deltaSeconds: number;
}

export interface ChangePlayerAttributeCommand {
  readonly type: 'ChangePlayerAttribute';
  readonly attribute: BoundedAttribute;
  readonly delta: number;
}

export interface SetPlayerAttributeCommand {
  readonly type: 'SetPlayerAttribute';
  readonly attribute: BoundedAttribute;
  readonly value: number;
}

export interface CreditMoneyCommand {
  readonly type: 'CreditMoney';
  readonly amountKobo: number;
  readonly reason?: string;
}

export interface DebitMoneyCommand {
  readonly type: 'DebitMoney';
  readonly amountKobo: number;
  readonly reason?: string;
}

export interface AddInventoryItemCommand {
  readonly type: 'AddInventoryItem';
  readonly itemId: string;
  readonly quantity: number;
}

export interface RemoveInventoryItemCommand {
  readonly type: 'RemoveInventoryItem';
  readonly itemId: string;
  readonly quantity: number;
}

export interface SetWorldFlagCommand {
  readonly type: 'SetWorldFlag';
  readonly key: string;
  readonly value: WorldFlagValue;
}

export interface SetLogicalPlayerLocationCommand {
  readonly type: 'SetLogicalPlayerLocation';
  readonly locationId: string;
}

export interface ScheduleTimerCommand {
  readonly type: 'ScheduleTimer';
  readonly id: string;
  readonly durationSeconds: number;
  readonly label: string;
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly repeatIntervalSeconds?: number;
}

export interface CancelTimerCommand {
  readonly type: 'CancelTimer';
  readonly id: string;
}

export interface RecordCyberActivityCommand {
  readonly type: 'RecordCyberActivity';
  readonly activityId: string;
  readonly tool: string;
  readonly action: string;
  readonly target?: string;
  readonly summary: string;
  readonly success: boolean;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

import type { AsterIncidentPhase, AsterPolicyRole, IncidentReportData } from '../missions/types';

export interface StartAsterMissionCommand {
  readonly type: 'StartAsterMission';
}

export interface AdvanceAsterMissionPhaseCommand {
  readonly type: 'AdvanceAsterMissionPhase';
  readonly targetPhase: AsterIncidentPhase;
}

export interface RecordMissionFindingCommand {
  readonly type: 'RecordMissionFinding';
  readonly findingType: 'host' | 'service' | 'log' | 'evidence';
  readonly targetId: string;
  readonly summary?: string;
}

export interface PreserveMissionEvidenceCommand {
  readonly type: 'PreserveMissionEvidence';
  readonly evidenceId: string;
  readonly source: string;
  readonly description: string;
  readonly reason: string;
}

export interface SubmitRootCauseAssessmentCommand {
  readonly type: 'SubmitRootCauseAssessment';
  readonly suspectedRootCause: string;
  readonly affectedComponent: string;
  readonly observedImpact: string;
  readonly supportingEvidenceIds: readonly string[];
  readonly uncertaintyOrNotes?: string;
}

export interface ExecuteContainmentCommand {
  readonly type: 'ExecuteContainment';
  readonly action: 'isolate_service' | 'revoke_token' | 'suspend_network';
  readonly reason: string;
}

export interface RemediatePermissionsCommand {
  readonly type: 'RemediatePermissions';
  readonly targetPolicyRole: AsterPolicyRole;
  readonly removeSmbAccess: boolean;
  readonly removeDatabaseAccess: boolean;
  readonly grantedScopes: readonly string[];
}

export interface VerifyRemediationCommand {
  readonly type: 'VerifyRemediation';
}

export interface SubmitIncidentReportCommand {
  readonly type: 'SubmitIncidentReport';
  readonly report: IncidentReportData;
}

export interface StartNpcDialogueCommand {
  readonly type: 'StartNpcDialogue';
  readonly npcId: string;
  readonly initialNodeId?: string;
}

export interface SelectDialogueChoiceCommand {
  readonly type: 'SelectDialogueChoice';
  readonly npcId: string;
  readonly choiceId: string;
}

export interface EndDialogueCommand {
  readonly type: 'EndDialogue';
  readonly npcId?: string;
}

export interface ChangeNpcRelationshipCommand {
  readonly type: 'ChangeNpcRelationship';
  readonly npcId: string;
  readonly delta: number;
  readonly reason: string;
}

export interface RecordNpcMemoryCommand {
  readonly type: 'RecordNpcMemory';
  readonly npcId: string;
  readonly topic?: string;
  readonly choice?: string;
  readonly fact?: string;
  readonly commitment?: string;
}

import type { CareerPathId } from '../career/types';

export interface AcceptJobCommand {
  readonly type: 'AcceptJob';
  readonly jobId: string;
}

export interface CompleteJobCommand {
  readonly type: 'CompleteJob';
  readonly jobId: string;
}

export interface PromoteCareerCommand {
  readonly type: 'PromoteCareer';
  readonly targetPathId?: CareerPathId;
}

export interface PurchaseItemCommand {
  readonly type: 'PurchaseItem';
  readonly itemId: string;
}

export interface StudyLearningMaterialCommand {
  readonly type: 'StudyLearningMaterial';
  readonly itemId: string;
}

export interface PayRecurringExpenseCommand {
  readonly type: 'PayRecurringExpense';
  readonly expenseId: string;
}

import type { GuidanceMode } from '../onboarding/types';

export interface CompleteOnboardingStepCommand {
  readonly type: 'CompleteOnboardingStep';
  readonly stepId: string;
  readonly nextStepId?: string | null;
}

export interface SkipOnboardingCommand {
  readonly type: 'SkipOnboarding';
}

export interface ResetOnboardingCommand {
  readonly type: 'ResetOnboarding';
}

export interface DismissGuidanceHintCommand {
  readonly type: 'DismissGuidanceHint';
  readonly hintId: string;
}

export interface SetGuidanceModeCommand {
  readonly type: 'SetGuidanceMode';
  readonly mode: GuidanceMode;
}

import type { DetectionRule, RedTeamFinding } from '../catalogue/types';

export interface StartCatalogueExerciseCommand {
  readonly type: 'StartCatalogueExercise';
  readonly exerciseId: string;
}

export interface SubmitExerciseActionCommand {
  readonly type: 'SubmitExerciseAction';
  readonly actionType: string;
  readonly payload?: Record<string, unknown>;
}

export interface TuneDetectionRuleCommand {
  readonly type: 'TuneDetectionRule';
  readonly ruleId: string;
  readonly updates: Partial<DetectionRule>;
}

export interface RunPurpleScenarioCommand {
  readonly type: 'RunPurpleScenario';
  readonly runType: 'baseline' | 'replay';
}

export interface SubmitRedTeamFindingCommand {
  readonly type: 'SubmitRedTeamFinding';
  readonly findingData: Omit<RedTeamFinding, 'findingId' | 'submittedAt' | 'isApproved'>;
}

export interface CompleteCatalogueExerciseCommand {
  readonly type: 'CompleteCatalogueExercise';
  readonly exerciseId: string;
}

export interface ResetCatalogueExerciseCommand {
  readonly type: 'ResetCatalogueExercise';
  readonly exerciseId: string;
}

export type SimulationCommand =
  | AdvanceSimulationTimeCommand
  | ChangePlayerAttributeCommand
  | SetPlayerAttributeCommand
  | CreditMoneyCommand
  | DebitMoneyCommand
  | AddInventoryItemCommand
  | RemoveInventoryItemCommand
  | SetWorldFlagCommand
  | SetLogicalPlayerLocationCommand
  | ScheduleTimerCommand
  | CancelTimerCommand
  | RecordCyberActivityCommand
  | StartAsterMissionCommand
  | AdvanceAsterMissionPhaseCommand
  | RecordMissionFindingCommand
  | PreserveMissionEvidenceCommand
  | SubmitRootCauseAssessmentCommand
  | ExecuteContainmentCommand
  | RemediatePermissionsCommand
  | VerifyRemediationCommand
  | SubmitIncidentReportCommand
  | StartNpcDialogueCommand
  | SelectDialogueChoiceCommand
  | EndDialogueCommand
  | ChangeNpcRelationshipCommand
  | RecordNpcMemoryCommand
  | AcceptJobCommand
  | CompleteJobCommand
  | PromoteCareerCommand
  | PurchaseItemCommand
  | StudyLearningMaterialCommand
  | PayRecurringExpenseCommand
  | CompleteOnboardingStepCommand
  | SkipOnboardingCommand
  | ResetOnboardingCommand
  | DismissGuidanceHintCommand
  | SetGuidanceModeCommand
  | StartCatalogueExerciseCommand
  | SubmitExerciseActionCommand
  | TuneDetectionRuleCommand
  | RunPurpleScenarioCommand
  | SubmitRedTeamFindingCommand
  | CompleteCatalogueExerciseCommand
  | ResetCatalogueExerciseCommand;

export interface CommandResult {
  readonly success: boolean;
  readonly state: Readonly<SimulationState>;
  readonly events: ReadonlyArray<SimulationEvent>;
  readonly errorCode?: SimulationErrorCode;
  readonly message: string;
  readonly isNoOp?: boolean;
}
