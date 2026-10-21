/**
 * Cyberlife — Milestone 19: Bounty Hunting & Security Contracts Command Handlers
 *
 * Implements pure command reducers for M19 contract lifecycle transitions:
 * - AcceptContract
 * - WithdrawContract
 * - ClarifyContractScope
 * - ExecuteContractSimulatedAction
 * - UpdateContractSubmissionDraft
 * - SubmitContractDeliverables
 * - ResubmitContractRevision
 * - SelectBountyContract
 * - SetBountyCategoryFilter
 * - SetBountyTab
 *
 * SAFETY INVARIANT:
 * Zero host shell execution · Zero real network sockets · Zero live payment calls.
 * All mutations return immutable next state snapshots and emit domain events.
 */

import { SimulationState } from '../../core/types';
import { CommandResult } from '../../commands/types';
import { createSimulationEvent } from '../../events/eventFactory';
import { deepFreeze } from '../../core/stateUtils';
import { createInitialBountyHubState } from './contractCatalogue';
import { ContractAuthorizationGate } from './contractAuthorizationGate';
import { ContractEvaluator } from './contractEvaluator';
import { M17RedTeamAdapter } from './adapters/M17RedTeamAdapter';
import { M18DefensiveAdapter } from './adapters/M18DefensiveAdapter';
import {
  BountyHubState,
  ActiveContractState,
  ContractSubmissionDraft,
  ContractSubmissionReport,
  ContractFinding,
  FreelanceTier,
  BountyAppTab,
  ContractCategoryFilter,
  ClientReviewRecord,
  FreelanceReputationState,
} from './types';
import { FinancialTransaction } from '../../career/types';
import { SimulationEvent } from '../../events/types';

function getOrInitBountyHub(state: Readonly<SimulationState>): BountyHubState {
  return state.bountyHub ?? createInitialBountyHubState();
}

export function computeFreelanceTier(score: number): FreelanceTier {
  if (score >= 800) return 'MASTER';
  if (score >= 500) return 'ELITE';
  if (score >= 300) return 'SPECIALIST';
  if (score >= 150) return 'VERIFIED';
  return 'ROOKIE';
}

function makeSuccess(
  state: Readonly<SimulationState>,
  message: string,
  events: ReadonlyArray<SimulationEvent> = []
): CommandResult {
  return {
    success: true,
    state: deepFreeze(state),
    events,
    message,
    isNoOp: false,
  };
}

function makeFailure(
  state: Readonly<SimulationState>,
  message: string
): CommandResult {
  return {
    success: false,
    state,
    events: [],
    errorCode: 'INVALID_COMMAND',
    message,
    isNoOp: false,
  };
}

// ============================================================================
// 1. ACCEPT CONTRACT
// ============================================================================

export function handleAcceptContract(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'AcceptContract';
    readonly contractId: string;
  }
): CommandResult {
  const hub = getOrInitBountyHub(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  // 1. Find contract
  const contract = hub.contracts.find(c => c.id === command.contractId);
  if (!contract) {
    return makeFailure(currentState, `Contract '${command.contractId}' was not found in the catalogue.`);
  }

  // 2. Active contract limit check
  if (hub.activeContract && hub.activeContract.status === 'ACTIVE') {
    if (hub.activeContract.contractId === command.contractId) {
      // Idempotent: already active
      return {
        success: true,
        state: currentState,
        events: [],
        message: `Contract '${contract.title}' is already active.`,
        isNoOp: true,
      };
    }
    return makeFailure(
      currentState,
      `Active contract limit reached. You must complete or withdraw from '${hub.activeContract.contractId}' before accepting another contract.`
    );
  }

  // 3. Prerequisites check
  const playerCareerLevel = currentState.career?.currentLevel ?? 1;
  if (playerCareerLevel < contract.prerequisites.minCareerLevel) {
    return makeFailure(
      currentState,
      `Prerequisite unmet: Career Level ${contract.prerequisites.minCareerLevel} required (Current: Level ${playerCareerLevel}).`
    );
  }

  if (hub.reputation.score < contract.prerequisites.minFreelanceReputation) {
    return makeFailure(
      currentState,
      `Prerequisite unmet: Freelance Reputation ${contract.prerequisites.minFreelanceReputation} required (Current: ${hub.reputation.score}).`
    );
  }

  // 4. Handle upfront operational expenses if any
  const expenseKobo = contract.financialTerms.operationalExpensesKobo;
  let nextMoneyKobo = currentState.player.moneyKobo;
  let nextEconomy = currentState.economy;

  if (expenseKobo > 0) {
    if (nextMoneyKobo < expenseKobo) {
      return makeFailure(
        currentState,
        `Insufficient funds for required operational lab expense (₦${(expenseKobo / 100).toFixed(2)} required).`
      );
    }
    nextMoneyKobo -= expenseKobo;

    const tx: FinancialTransaction = {
      id: `tx-expense-${simTime}-${contract.id}`,
      type: 'EXPENSE',
      amountKobo: expenseKobo,
      direction: 'DEBIT',
      balanceAfterKobo: nextMoneyKobo,
      timestamp: simTime,
      description: `Operational lab setup expense for contract: ${contract.title}`,
      relatedEntityId: contract.id,
    };

    nextEconomy = nextEconomy
      ? {
          ...nextEconomy,
          transactions: [tx, ...nextEconomy.transactions],
        }
      : {
          transactions: [tx],
          recurringExpenses: [],
        };
  }

  // 5. Build initial ActiveContractState
  const activeContract: ActiveContractState = {
    contractId: contract.id,
    status: 'ACTIVE',
    acceptedAtSimTime: simTime,
    acceptedScopeVersion: 1,
    deadlineSimTime: contract.deadlineSeconds ? simTime + contract.deadlineSeconds : undefined,
    objectives: contract.initialObjectives.map(obj => ({
      id: obj.id,
      title: obj.title,
      description: obj.description,
      requiredAction: obj.requiredAction,
      targetAssetId: obj.targetAssetId,
      hint: obj.hint,
      isCompleted: false,
    })),
    scopeClarified: !contract.scope.hasScopeAmbiguity,
    scopeClarificationNotes: contract.scope.hasScopeAmbiguity
      ? undefined
      : 'Standard authorized Rules of Engagement accepted.',
    activeDraft: {
      executiveSummary: '',
      methodologyNotes: 'Executed non-destructive testing strictly within authorized scope.',
      findings: [],
      linkedEvidenceIds: [],
      scopeComplianceAffirmed: false,
      riskImpactSummary: '',
      remediationRecommendations: [],
      remainingUncertainties: 'None noted.',
    },
    revisionCount: 0,
    auditEvents: [
      {
        id: `audit-accept-${simTime}`,
        timestampSimTime: simTime,
        actionName: 'CONTRACT_ACCEPTED',
        targetResource: contract.scope.authorizedTargets[0]?.hostname ?? 'contract-scope',
        decision: 'AUTHORIZED',
        details: `Formally accepted contract terms for '${contract.title}'. Rules of Engagement activated.`,
        violationRecorded: false,
      },
    ],
  };

  const nextHub: BountyHubState = {
    ...hub,
    activeContract,
    selectedContractId: contract.id,
    activeTab: 'activeContract',
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    player: {
      ...currentState.player,
      moneyKobo: nextMoneyKobo,
    },
    economy: nextEconomy,
    bountyHub: nextHub,
  };

  const event = createSimulationEvent(
    'BOUNTY_CONTRACT_ACCEPTED',
    simTime,
    nextRevision,
    { contractId: contract.id, rewardKobo: contract.financialTerms.rewardKobo }
  );

  return makeSuccess(nextState, `Contract '${contract.title}' accepted successfully.`, [event]);
}

// ============================================================================
// 2. WITHDRAW CONTRACT
// ============================================================================

export function handleWithdrawContract(
  currentState: Readonly<SimulationState>,
  _command: {
    readonly type: 'WithdrawContract';
    readonly reason?: string;
  }
): CommandResult {
  const hub = getOrInitBountyHub(currentState);
  if (!hub.activeContract || hub.activeContract.status !== 'ACTIVE') {
    return makeFailure(currentState, 'No active contract to withdraw from.');
  }

  const contract = hub.contracts.find(c => c.id === hub.activeContract!.contractId);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const penaltyKobo = contract?.financialTerms.penaltyKobo ?? 0;
  let nextMoneyKobo = currentState.player.moneyKobo;
  let nextEconomy = currentState.economy;

  if (penaltyKobo > 0 && nextMoneyKobo >= penaltyKobo) {
    nextMoneyKobo -= penaltyKobo;
    const tx: FinancialTransaction = {
      id: `tx-penalty-${simTime}`,
      type: 'EXPENSE',
      amountKobo: penaltyKobo,
      direction: 'DEBIT',
      balanceAfterKobo: nextMoneyKobo,
      timestamp: simTime,
      description: `Contract cancellation penalty fee: ${contract?.title ?? 'Contract'}`,
      relatedEntityId: contract?.id,
    };
    nextEconomy = nextEconomy
      ? { ...nextEconomy, transactions: [tx, ...nextEconomy.transactions] }
      : { transactions: [tx], recurringExpenses: [] };
  }

  const nextReputationScore = Math.max(0, hub.reputation.score - 15);
  const nextReputation: FreelanceReputationState = {
    ...hub.reputation,
    score: nextReputationScore,
    tier: computeFreelanceTier(nextReputationScore),
  };

  const nextHub: BountyHubState = {
    ...hub,
    activeContract: undefined,
    reputation: nextReputation,
    activeTab: 'marketplace',
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    player: {
      ...currentState.player,
      moneyKobo: nextMoneyKobo,
    },
    economy: nextEconomy,
    bountyHub: nextHub,
  };

  const event = createSimulationEvent(
    'BOUNTY_CONTRACT_WITHDRAWN',
    simTime,
    nextRevision,
    { contractId: contract?.id, penaltyKobo }
  );

  return makeSuccess(nextState, `Withdrawn from contract '${contract?.title ?? 'contract'}'.`, [event]);
}

// ============================================================================
// 3. CLARIFY SCOPE
// ============================================================================

export function handleClarifyContractScope(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'ClarifyContractScope';
    readonly optionId: string;
  }
): CommandResult {
  const hub = getOrInitBountyHub(currentState);
  if (!hub.activeContract || hub.activeContract.status !== 'ACTIVE') {
    return makeFailure(currentState, 'No active contract requiring scope clarification.');
  }

  const contract = hub.contracts.find(c => c.id === hub.activeContract!.contractId);
  if (!contract || !contract.scope.clarificationOptions) {
    return makeFailure(currentState, 'Contract does not require scope clarification.');
  }

  const option = contract.scope.clarificationOptions.find(o => o.id === command.optionId);
  if (!option) {
    return makeFailure(currentState, `Clarification option '${command.optionId}' not recognized.`);
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const nextRepScore = Math.max(0, hub.reputation.score + option.reputationImpact);
  const nextReputation: FreelanceReputationState = {
    ...hub.reputation,
    score: nextRepScore,
    tier: computeFreelanceTier(nextRepScore),
    scopeViolationsCount: option.isSafeProfessionalChoice
      ? hub.reputation.scopeViolationsCount
      : hub.reputation.scopeViolationsCount + 1,
  };

  // Mark the scope clarification objective complete
  const updatedObjectives = hub.activeContract.objectives.map(obj =>
    obj.requiredAction === 'clarify_scope'
      ? { ...obj, isCompleted: true, completedAtSimTime: simTime }
      : obj
  );

  const updatedAuditEvents = [
    ...hub.activeContract.auditEvents,
    {
      id: `audit-clarify-${simTime}`,
      timestampSimTime: simTime,
      actionName: 'SCOPE_CLARIFICATION_RESOLVED',
      targetResource: 'scope-boundary',
      decision: option.isSafeProfessionalChoice ? ('AUTHORIZED' as const) : ('BLOCKED_AMBIGUOUS_SCOPE' as const),
      details: option.resultingResolutionNotes,
      violationRecorded: !option.isSafeProfessionalChoice,
    },
  ];

  const updatedActiveContract: ActiveContractState = {
    ...hub.activeContract,
    scopeClarified: option.isSafeProfessionalChoice,
    scopeClarificationNotes: option.resultingResolutionNotes,
    objectives: updatedObjectives,
    auditEvents: updatedAuditEvents,
  };

  const nextHub: BountyHubState = {
    ...hub,
    activeContract: updatedActiveContract,
    reputation: nextReputation,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    bountyHub: nextHub,
  };

  const event = createSimulationEvent(
    'BOUNTY_SCOPE_CLARIFIED',
    simTime,
    nextRevision,
    { isSafe: option.isSafeProfessionalChoice, impact: option.reputationImpact }
  );

  return makeSuccess(nextState, `Scope clarification resolved: ${option.label}`, [event]);
}

// ============================================================================
// 4. EXECUTE SIMULATED ACTION
// ============================================================================

export function handleExecuteContractSimulatedAction(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'ExecuteContractSimulatedAction';
    readonly targetAssetId: string;
    readonly actionName: string;
    readonly actionCategory?: string;
  }
): CommandResult {
  const hub = getOrInitBountyHub(currentState);
  if (!hub.activeContract || hub.activeContract.status !== 'ACTIVE') {
    return makeFailure(currentState, 'No active contract. Accept a contract before conducting technical work.');
  }

  const contract = hub.contracts.find(c => c.id === hub.activeContract!.contractId);
  if (!contract) {
    return makeFailure(currentState, 'Active contract definition not found.');
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  // Evaluate authorization gate
  const evalResult = ContractAuthorizationGate.evaluateAction(
    contract,
    hub.activeContract,
    command.targetAssetId,
    command.actionName,
    command.actionCategory ?? 'TECHNICAL_AUDIT',
    simTime
  );

  // If blocked, record audit event and return error
  if (!evalResult.isAuthorized) {
    const updatedAuditEvents = [...hub.activeContract.auditEvents, evalResult.auditEvent];
    const updatedActiveContract: ActiveContractState = {
      ...hub.activeContract,
      auditEvents: updatedAuditEvents,
    };

    // Apply reputation penalty if out-of-scope or prohibited
    const nextRepScore = Math.max(0, hub.reputation.score - 10);
    const nextReputation: FreelanceReputationState = {
      ...hub.reputation,
      score: nextRepScore,
      tier: computeFreelanceTier(nextRepScore),
      scopeViolationsCount: hub.reputation.scopeViolationsCount + 1,
    };

    const nextState: SimulationState = {
      ...currentState,
      metadata: { ...currentState.metadata, revision: nextRevision },
      bountyHub: {
        ...hub,
        activeContract: updatedActiveContract,
        reputation: nextReputation,
      },
    };

    return {
      success: false,
      state: deepFreeze(nextState),
      events: [
        createSimulationEvent(
          'BOUNTY_SCOPE_VIOLATION_ATTEMPTED',
          simTime,
          nextRevision,
          { target: command.targetAssetId, action: command.actionName }
        ),
      ],
      errorCode: 'INVALID_COMMAND',
      message: evalResult.reason,
      isNoOp: false,
    };
  }

  // Target is authorized! Find target
  const target = contract.scope.authorizedTargets.find(
    t => t.id.toLowerCase() === command.targetAssetId.toLowerCase()
  )!;

  // Execute technical work via appropriate adapter
  let discoveredFindings: readonly ContractFinding[] = [];
  let linkedEvidenceId: string | undefined;

  if (contract.category === 'WEB_APP_ASSESSMENT' || contract.category === 'CONFIG_AUDIT' || contract.category === 'AMBIGUOUS_SCOPE_DISPUTE') {
    const scan = M17RedTeamAdapter.executeAssessmentAction(target, command.actionName);
    discoveredFindings = scan.findings;
    if (contract.id === 'ct-balogun-pos-audit') {
      linkedEvidenceId = 'EVD-2026-001';
    } else if (contract.id === 'ct-cedarline-api-assessment') {
      linkedEvidenceId = 'EVD-2026-003';
    }
  } else if (contract.category === 'DETECTION_VALIDATION' || contract.category === 'INVESTIGATION') {
    const val = M18DefensiveAdapter.executeDetectionValidation(target, command.actionName);
    discoveredFindings = val.findings;
    if (contract.id === 'ct-eko-atm-investigation') {
      linkedEvidenceId = 'EVD-2026-002';
    }
  }

  // Update matching objectives in active contract
  const updatedObjectives = hub.activeContract.objectives.map(obj => {
    const matchesTarget = !obj.targetAssetId || obj.targetAssetId === command.targetAssetId;
    const matchesAction =
      obj.requiredAction === command.actionName ||
      command.actionName.toLowerCase().includes(obj.requiredAction.toLowerCase()) ||
      obj.requiredAction.toLowerCase().includes(command.actionName.toLowerCase());

    if (matchesTarget && matchesAction) {
      return { ...obj, isCompleted: true, completedAtSimTime: simTime };
    }
    return obj;
  });

  // Auto-merge discovered findings into active draft so player doesn't have to retype findings!
  const currentDraft = hub.activeContract.activeDraft;
  const existingFindingIds = new Set(currentDraft.findings.map(f => f.id));
  const newFindings = [...currentDraft.findings];

  for (const f of discoveredFindings) {
    if (!existingFindingIds.has(f.id)) {
      newFindings.push(f);
      existingFindingIds.add(f.id);
    }
  }

  // Auto-merge evidence ID if not present
  const updatedEvidenceIds = [...currentDraft.linkedEvidenceIds];
  if (linkedEvidenceId && !updatedEvidenceIds.includes(linkedEvidenceId)) {
    updatedEvidenceIds.push(linkedEvidenceId);
  }

  // Default executive summary and remediation roadmap if empty
  const defaultSummary =
    currentDraft.executiveSummary ||
    `Authorized assessment of ${target.hostname} (${target.serviceName}) completed in accordance with contract scope. Identified key configuration and security findings.`;
  const defaultRemediations =
    currentDraft.remediationRecommendations.length > 0
      ? currentDraft.remediationRecommendations
      : discoveredFindings.map(f => f.remediationRecommendation).filter(Boolean);

  const updatedDraft: ContractSubmissionDraft = {
    ...currentDraft,
    executiveSummary: defaultSummary,
    findings: newFindings,
    linkedEvidenceIds: updatedEvidenceIds,
    remediationRecommendations:
      defaultRemediations.length > 0
        ? defaultRemediations
        : ['Enforce least privilege access control and verify regular audit logs.'],
  };

  const updatedAuditEvents = [...hub.activeContract.auditEvents, evalResult.auditEvent];

  const updatedActiveContract: ActiveContractState = {
    ...hub.activeContract,
    objectives: updatedObjectives,
    activeDraft: updatedDraft,
    auditEvents: updatedAuditEvents,
  };

  const nextHub: BountyHubState = {
    ...hub,
    activeContract: updatedActiveContract,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: { ...currentState.metadata, revision: nextRevision },
    bountyHub: nextHub,
  };

  const event = createSimulationEvent(
    'BOUNTY_SIMULATED_ACTION_EXECUTED',
    simTime,
    nextRevision,
    { target: target.hostname, findingsCount: discoveredFindings.length }
  );

  return makeSuccess(nextState, `Executed ${command.actionName} on ${target.hostname}.`, [event]);
}

// ============================================================================
// 5. UPDATE DRAFT
// ============================================================================

export function handleUpdateContractSubmissionDraft(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'UpdateContractSubmissionDraft';
    readonly draftUpdates: Partial<ContractSubmissionDraft>;
  }
): CommandResult {
  const hub = getOrInitBountyHub(currentState);
  if (!hub.activeContract) {
    return makeFailure(currentState, 'No active contract draft to update.');
  }

  const nextRevision = currentState.metadata.revision + 1;
  const updatedDraft: ContractSubmissionDraft = {
    ...hub.activeContract.activeDraft,
    ...command.draftUpdates,
  };

  const updatedActiveContract: ActiveContractState = {
    ...hub.activeContract,
    activeDraft: updatedDraft,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: { ...currentState.metadata, revision: nextRevision },
    bountyHub: {
      ...hub,
      activeContract: updatedActiveContract,
    },
  };

  return makeSuccess(nextState, 'Draft updated successfully.');
}

// ============================================================================
// 6. SUBMIT DELIVERABLES
// ============================================================================

export function handleSubmitContractDeliverables(
  currentState: Readonly<SimulationState>,
  _command?: {
    readonly type: 'SubmitContractDeliverables';
  }
): CommandResult {
  const hub = getOrInitBountyHub(currentState);
  if (!hub.activeContract) {
    return makeFailure(currentState, 'No active contract available for submission.');
  }

  if (hub.activeContract.status === 'APPROVED') {
    return makeFailure(currentState, 'This contract has already been approved and finalized.');
  }

  const contract = hub.contracts.find(c => c.id === hub.activeContract!.contractId);
  if (!contract) {
    return makeFailure(currentState, 'Contract definition not found.');
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;
  const activeContract = hub.activeContract;
  const draft = activeContract.activeDraft;

  // Snapshot submission report
  const revisionNumber = activeContract.revisionCount + 1;
  const submissionReport: ContractSubmissionReport = {
    submissionId: `sub-${contract.id}-rev${revisionNumber}-${simTime}`,
    contractId: contract.id,
    submittedAtSimTime: simTime,
    revisionNumber,
    executiveSummary: draft.executiveSummary,
    methodologyNotes: draft.methodologyNotes,
    findings: draft.findings,
    linkedEvidenceIds: draft.linkedEvidenceIds,
    scopeComplianceAffirmed: draft.scopeComplianceAffirmed,
    riskImpactSummary: draft.riskImpactSummary,
    remediationRecommendations: draft.remediationRecommendations,
    remainingUncertainties: draft.remainingUncertainties,
  };

  // Run deterministic evaluation
  const reviewResult = ContractEvaluator.evaluateSubmission(
    contract,
    activeContract,
    submissionReport,
    currentState
  );

  let nextMoneyKobo = currentState.player.moneyKobo;
  let nextEconomy = currentState.economy;
  let nextCareerXp = currentState.career?.xp ?? 0;
  const nextRepScore = Math.max(0, hub.reputation.score + reviewResult.freelanceReputationDelta);
  let nextCompletedHistory = [...hub.completedContractHistory];

  // Process payouts & reputation updates if APPROVED or ACCEPTED
  const isApproved =
    reviewResult.outcome === 'ACCEPTED' || reviewResult.outcome === 'ACCEPTED_WITH_FEEDBACK';

  if (isApproved && reviewResult.payoutKobo > 0) {
    nextMoneyKobo += reviewResult.payoutKobo;
    const tx: FinancialTransaction = {
      id: `tx-payout-${simTime}-${contract.id}`,
      type: 'JOB_PAYOUT',
      amountKobo: reviewResult.payoutKobo,
      direction: 'CREDIT',
      balanceAfterKobo: nextMoneyKobo,
      timestamp: simTime,
      description: `Bounty payout for contract: ${contract.title}`,
      relatedEntityId: contract.id,
    };
    nextEconomy = nextEconomy
      ? { ...nextEconomy, transactions: [tx, ...nextEconomy.transactions] }
      : { transactions: [tx], recurringExpenses: [] };
  }

  if (reviewResult.careerXpAwarded > 0) {
    nextCareerXp += reviewResult.careerXpAwarded;
  }

  // Update faction standing if applicable
  let nextNarrative = currentState.narrative;
  if (reviewResult.factionStandingDelta && nextNarrative) {
    const fId = reviewResult.factionStandingDelta.factionId;
    const delta = reviewResult.factionStandingDelta.delta;
    const currentStanding = nextNarrative.factions[fId]?.standing ?? 0;
    const updatedScore = Math.max(-100, Math.min(100, currentStanding + delta));

    nextNarrative = {
      ...nextNarrative,
      factions: {
        ...nextNarrative.factions,
        [fId]: {
          factionId: fId,
          standing: updatedScore,
          band:
            updatedScore >= 50
              ? 'ALLIED'
              : updatedScore >= 15
                ? 'FAVORED'
                : updatedScore >= -14
                  ? 'NEUTRAL'
                  : updatedScore >= -49
                    ? 'DISTRUSTED'
                    : 'HOSTILE',
          history: [
            ...(nextNarrative.factions[fId]?.history ?? []),
            {
              delta,
              reason: `Contract deliverable '${contract.title}' review: ${reviewResult.outcome}`,
              timestamp: simTime,
            },
          ],
        },
      },
    };
  }

  // Handle reputation statistics
  const nextReputation: FreelanceReputationState = {
    ...hub.reputation,
    score: nextRepScore,
    tier: computeFreelanceTier(nextRepScore),
    completedContractsCount: isApproved
      ? hub.reputation.completedContractsCount + 1
      : hub.reputation.completedContractsCount,
    successfulDisclosuresCount: isApproved
      ? hub.reputation.successfulDisclosuresCount + draft.findings.length
      : hub.reputation.successfulDisclosuresCount,
    totalEarningsKobo: hub.reputation.totalEarningsKobo + reviewResult.payoutKobo,
  };

  // Add history record if completed or rejected
  if (isApproved || reviewResult.outcome === 'REJECTED') {
    const record: ClientReviewRecord = {
      contractId: contract.id,
      contractTitle: contract.title,
      clientName: contract.client.name,
      outcome: reviewResult.outcome,
      completedAtSimTime: simTime,
      payoutKobo: reviewResult.payoutKobo,
      reputationDelta: reviewResult.freelanceReputationDelta,
      overallScore: reviewResult.overallScore,
      feedbackSummary: reviewResult.clientFeedbackTitle,
    };
    nextCompletedHistory = [record, ...nextCompletedHistory];
  }

  // Build next active contract status
  const nextStatus =
    reviewResult.outcome === 'ACCEPTED' || reviewResult.outcome === 'ACCEPTED_WITH_FEEDBACK'
      ? 'APPROVED'
      : reviewResult.outcome === 'REVISION_REQUESTED'
        ? 'REVISION_REQUESTED'
        : 'REJECTED';

  const updatedActiveContract: ActiveContractState = {
    ...activeContract,
    status: nextStatus,
    submittedReportSnapshot: submissionReport,
    latestReviewResult: reviewResult,
    revisionCount: revisionNumber,
  };

  const nextHub: BountyHubState = {
    ...hub,
    activeContract: updatedActiveContract,
    completedContractHistory: nextCompletedHistory,
    reputation: nextReputation,
    activeTab: 'reviewDebrief',
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: { ...currentState.metadata, revision: nextRevision },
    player: {
      ...currentState.player,
      moneyKobo: nextMoneyKobo,
    },
    career: currentState.career
      ? {
          ...currentState.career,
          xp: nextCareerXp,
        }
      : undefined,
    economy: nextEconomy,
    narrative: nextNarrative,
    bountyHub: nextHub,
  };

  const event = createSimulationEvent(
    'BOUNTY_CONTRACT_EVALUATED',
    simTime,
    nextRevision,
    {
      outcome: reviewResult.outcome,
      score: reviewResult.overallScore,
      payoutKobo: reviewResult.payoutKobo,
    }
  );

  return makeSuccess(
    nextState,
    `Submission evaluated: ${reviewResult.clientFeedbackTitle}`,
    [event]
  );
}

// ============================================================================
// 7. RESUBMIT REVISION
// ============================================================================

export function handleResubmitContractRevision(
  currentState: Readonly<SimulationState>
): CommandResult {
  const hub = getOrInitBountyHub(currentState);
  if (!hub.activeContract || hub.activeContract.status !== 'REVISION_REQUESTED') {
    return makeFailure(currentState, 'Contract is not currently in a revision requested state.');
  }

  // Set active contract back to ACTIVE and switch to submission studio tab
  const nextRevision = currentState.metadata.revision + 1;
  const updatedActiveContract: ActiveContractState = {
    ...hub.activeContract,
    status: 'ACTIVE',
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: { ...currentState.metadata, revision: nextRevision },
    bountyHub: {
      ...hub,
      activeContract: updatedActiveContract,
      activeTab: 'submissionStudio',
    },
  };

  return makeSuccess(nextState, 'Revision mode activated. You may now modify deliverables.');
}

// ============================================================================
// 8. NAVIGATION & FILTER REDUCERS
// ============================================================================

export function handleSelectBountyContract(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'SelectBountyContract';
    readonly contractId: string;
  }
): CommandResult {
  const hub = getOrInitBountyHub(currentState);
  const nextRevision = currentState.metadata.revision + 1;

  const nextState: SimulationState = {
    ...currentState,
    metadata: { ...currentState.metadata, revision: nextRevision },
    bountyHub: {
      ...hub,
      selectedContractId: command.contractId,
    },
  };

  return makeSuccess(nextState, `Selected contract ${command.contractId}.`);
}

export function handleSetBountyCategoryFilter(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'SetBountyCategoryFilter';
    readonly filter: ContractCategoryFilter;
  }
): CommandResult {
  const hub = getOrInitBountyHub(currentState);
  const nextRevision = currentState.metadata.revision + 1;

  const nextState: SimulationState = {
    ...currentState,
    metadata: { ...currentState.metadata, revision: nextRevision },
    bountyHub: {
      ...hub,
      categoryFilter: command.filter,
    },
  };

  return makeSuccess(nextState, `Category filter set to ${command.filter}.`);
}

export function handleSetBountyTab(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'SetBountyTab';
    readonly tab: BountyAppTab;
  }
): CommandResult {
  const hub = getOrInitBountyHub(currentState);
  const nextRevision = currentState.metadata.revision + 1;

  const nextState: SimulationState = {
    ...currentState,
    metadata: { ...currentState.metadata, revision: nextRevision },
    bountyHub: {
      ...hub,
      activeTab: command.tab,
    },
  };

  return makeSuccess(nextState, `Bounty tab set to ${command.tab}.`);
}
