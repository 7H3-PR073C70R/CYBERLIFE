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
  | 'STORY_ARC_NOT_FOUND'
  | 'STORY_CHAPTER_NOT_FOUND'
  | 'NARRATIVE_MISSION_NOT_FOUND'
  | 'NARRATIVE_PREREQUISITES_NOT_MET'
  | 'FACTION_NOT_FOUND'
  | 'CONCLUSION_NOT_FOUND'
  | 'INSUFFICIENT_EVIDENCE'
  | 'ALERT_NOT_FOUND'
  | 'RULE_NOT_FOUND'
  | 'INVALID_DEFENSIVE_ACTION'
  | 'SCENARIO_NOT_FOUND'
  | 'ACTIVITY_NOT_FOUND'
  | 'ACTIVITY_ALREADY_ACTIVE'
  | 'ACTIVITY_NOT_ACTIVE'
  | 'ACTIVITY_ALREADY_COMPLETED'
  | 'ACTIVITY_PREREQUISITES_NOT_MET'
  | 'ACTIVITY_OBJECTIVES_INCOMPLETE'
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
  | ResetCatalogueExerciseCommand
  | StartStoryArcCommand
  | AdvanceStoryChapterCommand
  | CompleteNarrativeMissionCommand
  | FailNarrativeMissionCommand
  | RecordInvestigativeEvidenceCommand
  | FormulateConclusionCommand
  | SubmitInvestigativeConclusionCommand
  | ChangeFactionStandingCommand
  | SetIndicatorReviewStatusCommand
  | RecordNetworkAnalystNoteCommand
  | AdvanceNetworkObjectiveCommand
  | SubmitNetworkInvestigationConclusionCommand
  | AcceptRulesOfEngagementCommand
  | ExecuteRedTeamActionCommand
  | ValidateVulnerabilityFindingCommand
  | RecordRedTeamAnalystNoteCommand
  | PreserveRedTeamEvidenceCommand
  | SubmitAssessmentReportCommand
  | TriageSecurityAlertCommand
  | ToggleDetectionRuleCommand
  | ExecuteDefensiveResponseCommand
  | RecordDefensiveHypothesisCommand
  | AdvanceDefensiveObjectiveCommand
  | RunPurpleTeamScenarioCommand
  | SubmitDefensiveIncidentReportCommand
  | AcceptContractCommand
  | WithdrawContractCommand
  | ClarifyContractScopeCommand
  | ExecuteContractSimulatedActionCommand
  | UpdateContractSubmissionDraftCommand
  | SubmitContractDeliverablesCommand
  | ResubmitContractRevisionCommand
  | SelectBountyContractCommand
  | SetBountyCategoryFilterCommand
  | SetBountyTabCommand
  | AcceptActivityCommand
  | AbandonActivityCommand
  | ResolveActivityCommand
  | SetPrimaryActivityCommand
  | SetActivityGuidanceFilterCommand
  | StartInterviewCommand
  | AskInterviewQuestionCommand
  | PresentEvidenceToNpcCommand
  | ConcludeInterviewCommand
  | InspectWorldObjectCommand
  | CompareEvidenceWithTestimonyCommand
  | SubmitM21ConclusionCommand
  | EvaluateSocEngDecisionCommand
  | RaiseAssessmentFindingCommand
  | SubmitPhysicalAssessmentReportCommand;

import type { ThreatReviewStatus } from '../cyber/threatintel/types';
import type { InvestigationConclusionSubmission } from '../cyber/investigation/types';
import type {
  AlertTriageStatus,
  DefensiveActionType,
  IncidentReportSubmission,
} from '../cyber/defensive/types';
import type {
  AcceptRulesOfEngagementCommand,
  ExecuteRedTeamActionCommand,
  ValidateVulnerabilityFindingCommand,
  RecordRedTeamAnalystNoteCommand,
  PreserveRedTeamEvidenceCommand,
  SubmitAssessmentReportCommand,
} from '../cyber/redteam/redTeamCommandHandler';

export type {
  AcceptRulesOfEngagementCommand,
  ExecuteRedTeamActionCommand,
  ValidateVulnerabilityFindingCommand,
  RecordRedTeamAnalystNoteCommand,
  PreserveRedTeamEvidenceCommand,
  SubmitAssessmentReportCommand,
};

export interface TriageSecurityAlertCommand {
  readonly type: 'TriageSecurityAlert';
  readonly alertId: string;
  readonly status: AlertTriageStatus;
  readonly notes?: string;
  readonly reason?: string;
}

export interface ToggleDetectionRuleCommand {
  readonly type: 'ToggleDetectionRule';
  readonly ruleId: string;
  readonly isEnabled: boolean;
}

export interface ExecuteDefensiveResponseCommand {
  readonly type: 'ExecuteDefensiveResponse';
  readonly actionType: DefensiveActionType;
  readonly targetEntityId: string;
  readonly reason: string;
  readonly actor?: string;
}

export interface RecordDefensiveHypothesisCommand {
  readonly type: 'RecordDefensiveHypothesis';
  readonly title: string;
  readonly hypothesisText: string;
  readonly isConfirmedFact: boolean;
  readonly linkedAlertIds?: readonly string[];
  readonly linkedTelemetryIds?: readonly string[];
  readonly linkedHostIds?: readonly string[];
  readonly linkedIndicatorIds?: readonly string[];
}

export interface AdvanceDefensiveObjectiveCommand {
  readonly type: 'AdvanceDefensiveObjective';
  readonly objectiveId: string;
}

export interface RunPurpleTeamScenarioCommand {
  readonly type: 'RunPurpleTeamScenario';
  readonly scenarioId: string;
}

export interface SubmitDefensiveIncidentReportCommand {
  readonly type: 'SubmitDefensiveIncidentReport';
  readonly submission: IncidentReportSubmission;
}


export interface SetIndicatorReviewStatusCommand {
  readonly type: 'SetIndicatorReviewStatus';
  readonly indicatorId: string;
  readonly status: ThreatReviewStatus;
  readonly notes?: string;
}

export interface RecordNetworkAnalystNoteCommand {
  readonly type: 'RecordNetworkAnalystNote';
  readonly title: string;
  readonly content: string;
  readonly category: 'TOPOLOGY' | 'TRAFFIC' | 'THREAT_INTEL' | 'HYPOTHESIS';
  readonly linkedHostIds?: readonly string[];
  readonly linkedEventIds?: readonly string[];
  readonly linkedIndicatorIds?: readonly string[];
}

export interface AdvanceNetworkObjectiveCommand {
  readonly type: 'AdvanceNetworkObjective';
  readonly objectiveId: string;
  readonly inspectedHostId?: string;
  readonly inspectedEventId?: string;
  readonly correlatedIndicatorId?: string;
}

export interface SubmitNetworkInvestigationConclusionCommand {
  readonly type: 'SubmitNetworkInvestigationConclusion';
  readonly submission: InvestigationConclusionSubmission;
}

export interface StartStoryArcCommand {
  readonly type: 'StartStoryArc';
  readonly arcId: string;
}

export interface AdvanceStoryChapterCommand {
  readonly type: 'AdvanceStoryChapter';
  readonly chapterId: string;
}

export interface CompleteNarrativeMissionCommand {
  readonly type: 'CompleteNarrativeMission';
  readonly missionId: string;
}

export interface FailNarrativeMissionCommand {
  readonly type: 'FailNarrativeMission';
  readonly missionId: string;
  readonly reason: string;
}

export interface RecordInvestigativeEvidenceCommand {
  readonly type: 'RecordInvestigativeEvidence';
  readonly evidenceId: string;
  readonly source: string;
  readonly title: string;
  readonly description: string;
  readonly hash: string;
  readonly tags?: readonly string[];
}

export interface FormulateConclusionCommand {
  readonly type: 'FormulateConclusion';
  readonly conclusionId: string;
}

export interface SubmitInvestigativeConclusionCommand {
  readonly type: 'SubmitInvestigativeConclusion';
  readonly conclusionId: string;
  readonly recipientFactionId: string;
}

export interface ChangeFactionStandingCommand {
  readonly type: 'ChangeFactionStanding';
  readonly factionId: string;
  readonly delta: number;
  readonly reason: string;
}

import type {
  ContractSubmissionDraft,
  ContractCategoryFilter,
  BountyAppTab,
} from '../cyber/contracts/types';

export interface AcceptContractCommand {
  readonly type: 'AcceptContract';
  readonly contractId: string;
}

export interface WithdrawContractCommand {
  readonly type: 'WithdrawContract';
  readonly reason?: string;
}

export interface ClarifyContractScopeCommand {
  readonly type: 'ClarifyContractScope';
  readonly optionId: string;
}

export interface ExecuteContractSimulatedActionCommand {
  readonly type: 'ExecuteContractSimulatedAction';
  readonly targetAssetId: string;
  readonly actionName: string;
  readonly actionCategory?: string;
}

export interface UpdateContractSubmissionDraftCommand {
  readonly type: 'UpdateContractSubmissionDraft';
  readonly draftUpdates: Partial<ContractSubmissionDraft>;
}

export interface SubmitContractDeliverablesCommand {
  readonly type: 'SubmitContractDeliverables';
}

export interface ResubmitContractRevisionCommand {
  readonly type: 'ResubmitContractRevision';
}

export interface SelectBountyContractCommand {
  readonly type: 'SelectBountyContract';
  readonly contractId: string;
}

export interface SetBountyCategoryFilterCommand {
  readonly type: 'SetBountyCategoryFilter';
  readonly filter: ContractCategoryFilter;
}

export interface SetBountyTabCommand {
  readonly type: 'SetBountyTab';
  readonly tab: BountyAppTab;
}

export interface AcceptActivityCommand {
  readonly type: 'AcceptActivity';
  readonly activityId: string;
}

export interface AbandonActivityCommand {
  readonly type: 'AbandonActivity';
  readonly activityId: string;
}

export interface ResolveActivityCommand {
  readonly type: 'ResolveActivity';
  readonly activityId: string;
}

export interface SetPrimaryActivityCommand {
  readonly type: 'SetPrimaryActivity';
  readonly activityId: string;
}

export interface SetActivityGuidanceFilterCommand {
  readonly type: 'SetActivityGuidanceFilter';
  readonly filter: 'ALL' | 'PRIMARY' | 'RECOMMENDED' | 'CAREER';
}

export interface CommandResult {
  readonly success: boolean;
  readonly state: Readonly<SimulationState>;
  readonly events: ReadonlyArray<SimulationEvent>;
  readonly errorCode?: SimulationErrorCode;
  readonly message: string;
  readonly isNoOp?: boolean;
}

import type {
  StartInterviewCommand,
  AskInterviewQuestionCommand,
  PresentEvidenceToNpcCommand,
  ConcludeInterviewCommand,
  InspectWorldObjectCommand,
  CompareEvidenceWithTestimonyCommand,
  SubmitM21ConclusionCommand,
  EvaluateSocEngDecisionCommand,
  RaiseAssessmentFindingCommand,
  SubmitPhysicalAssessmentReportCommand,
} from '../humanIntel/humanIntelCommandHandler';

export type {
  StartInterviewCommand,
  AskInterviewQuestionCommand,
  PresentEvidenceToNpcCommand,
  ConcludeInterviewCommand,
  InspectWorldObjectCommand,
  CompareEvidenceWithTestimonyCommand,
  SubmitM21ConclusionCommand,
  EvaluateSocEngDecisionCommand,
  RaiseAssessmentFindingCommand,
  SubmitPhysicalAssessmentReportCommand,
};
