/**
 * Cyberlife — Milestone 20: Activity Command Handler
 *
 * Implements deterministic command handlers for player activity lifecycle:
 * - Accept activity with prerequisite gating
 * - Abandon activity with safe recovery
 * - Resolve activity with objective validation and idempotent reward dispatch
 * - Set primary focus objective & guidance filtering
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated, in-memory domain logic.
 */

import type { SimulationState } from '../core/types';
import type { CommandResult, SimulationErrorCode } from '../commands/types';
import type { SimulationEvent } from '../events/types';
import { createSimulationEvent } from '../events/eventFactory';
import { deepFreeze } from '../core/stateUtils';
import { validateSimulationState } from '../core/invariants';
import {
  evaluatePrerequisites,
  evaluateActivityObjectives,
  resolveActivityOutcome,
} from './activityDirectorEngine';
import { AUTHORED_ACTIVITIES } from './activityCatalogue';
import {
  M14StoryAdapter,
  M16InvestigationAdapter,
  M17RedTeamAdapter,
  M18DefensiveOpsAdapter,
  M19BountyAdapter,
  M21HumanIntelAdapter,
  M23ProfessionsAdapter,
} from './adapters';

function makeFailure(
  state: Readonly<SimulationState>,
  errorCode: SimulationErrorCode,
  message: string
): CommandResult {
  return {
    success: false,
    state,
    events: [],
    errorCode,
    message,
    isNoOp: false,
  };
}

/**
 * Synchronizes runtime activity objectives with subsystem states.
 */
export function syncAllActivitiesWithAdapters(
  state: SimulationState
): SimulationState {
  const director = state.activityDirector;
  if (!director) return state;

  const nextActivities = { ...director.activities };

  for (const [id, runtime] of Object.entries(nextActivities)) {
    let synced = { ...runtime };
    if (id === 'act_story_aster_investigation') {
      synced = M14StoryAdapter.syncStoryActivity(state, synced);
    } else if (id === 'act_story_broad_street_intel') {
      synced = M16InvestigationAdapter.syncInvestigationActivity(state, synced);
    } else if (id === 'act_red_balogun_assessment') {
      synced = M17RedTeamAdapter.syncRedTeamActivity(state, synced);
    } else if (id === 'act_blue_broad_street_triage' || id === 'act_purple_eko_emulation') {
      synced = M18DefensiveOpsAdapter.syncDefensiveActivity(state, synced);
    } else if (id === 'act_bounty_atm_audit') {
      synced = M19BountyAdapter.syncBountyActivity(state, synced);
    } else if (
      id === 'act_m21_conflicting_accounts' ||
      id === 'act_m21_vendor_request' ||
      id === 'act_m21_facility_audit'
    ) {
      synced = M21HumanIntelAdapter.syncHumanIntelActivity(state, synced);
    } else if (
      id === 'act_forensics_marina_breach' ||
      id === 'act_soc_triage_interbank' ||
      id === 'act_audit_fintech_compliance'
    ) {
      synced = M23ProfessionsAdapter.syncProfessionsActivity(state, synced);
    }
    nextActivities[id] = synced;
  }

  return {
    ...state,
    activityDirector: {
      ...director,
      activities: nextActivities,
    },
  };
}

/**
 * Handles accepting an available activity.
 */
export function handleAcceptActivity(
  currentState: Readonly<SimulationState>,
  activityId: string
): CommandResult {
  const director = currentState.activityDirector;
  if (!director) {
    return makeFailure(currentState, 'ACTIVITY_NOT_FOUND', 'Activity director not initialized');
  }

  const def = AUTHORED_ACTIVITIES[activityId];
  if (!def) {
    return makeFailure(currentState, 'ACTIVITY_NOT_FOUND', `Activity "${activityId}" does not exist in catalogue`);
  }

  const currentRuntime = director.activities[activityId];

  // Check if already active
  if (currentRuntime && (currentRuntime.status === 'ACTIVE' || currentRuntime.status === 'IN_PROGRESS')) {
    return makeFailure(currentState, 'ACTIVITY_ALREADY_ACTIVE', `Activity "${def.title}" is already active`);
  }

  // Check if non-repeatable activity was already completed
  if (!def.isRepeatable && currentRuntime && currentRuntime.status === 'COMPLETED') {
    return makeFailure(currentState, 'ACTIVITY_ALREADY_COMPLETED', `Activity "${def.title}" has already been completed`);
  }

  // Validate prerequisites
  const { eligible, reason } = evaluatePrerequisites(def, currentState as SimulationState);
  if (!eligible) {
    return makeFailure(
      currentState,
      'ACTIVITY_PREREQUISITES_NOT_MET',
      `Cannot accept activity: ${reason ?? 'Prerequisites not met'}`
    );
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  // Initialize runtime state for activity
  const acceptedRuntime = {
    definitionId: activityId,
    status: 'ACTIVE' as const,
    discoveredAt: currentRuntime?.discoveredAt ?? simTime,
    acceptedAt: simTime,
    deadlineSimulationTime: def.deadlineDurationSeconds ? simTime + def.deadlineDurationSeconds : undefined,
    objectives: def.objectives.map(o => ({ ...o })),
    progressPercentage: 0,
    rewardClaimed: false,
  };

  const updatedActivities = {
    ...director.activities,
    [activityId]: acceptedRuntime,
  };

  // If this was an Eko Bounty contract, bridge to active contract state
  let nextBountyHub = currentState.bountyHub;
  if (def.type === 'CYBER_CONTRACT' && def.relatedEntityId && nextBountyHub) {
    const contract = nextBountyHub.contracts.find(c => c.id === def.relatedEntityId);
    if (contract && !nextBountyHub.activeContract) {
      nextBountyHub = {
        ...nextBountyHub,
        activeContract: {
          contractId: contract.id,
          status: 'ACTIVE',
          acceptedAtSimTime: simTime,
          acceptedScopeVersion: 1,
          objectives: contract.initialObjectives.map(o => ({
            id: o.id,
            title: o.title,
            description: o.description,
            requiredAction: o.requiredAction,
            targetAssetId: o.targetAssetId,
            hint: o.hint,
            isCompleted: false,
          })),
          scopeClarified: true,
          activeDraft: {
            executiveSummary: '',
            methodologyNotes: '',
            findings: [],
            linkedEvidenceIds: [],
            scopeComplianceAffirmed: true,
            riskImpactSummary: '',
            remediationRecommendations: [],
            remainingUncertainties: '',
          },
          revisionCount: 0,
          auditEvents: [],
        },
      };
    }
  }

  const event: SimulationEvent = createSimulationEvent('ACTIVITY_ACCEPTED', simTime, nextRevision, {
    activityId: def.id,
    title: def.title,
    type: def.type,
    priority: def.priority,
  });

  const nextDirector = {
    ...director,
    activities: updatedActivities,
    activeActivityId: activityId,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    activityDirector: nextDirector,
    bountyHub: nextBountyHub,
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Accepted activity: "${def.title}"`,
  };
}

/**
 * Handles abandoning an active activity.
 */
export function handleAbandonActivity(
  currentState: Readonly<SimulationState>,
  activityId: string
): CommandResult {
  const director = currentState.activityDirector;
  if (!director) {
    return makeFailure(currentState, 'ACTIVITY_NOT_FOUND', 'Activity director not initialized');
  }

  const runtime = director.activities[activityId];
  if (!runtime || (runtime.status !== 'ACTIVE' && runtime.status !== 'IN_PROGRESS')) {
    return makeFailure(currentState, 'ACTIVITY_NOT_ACTIVE', `Activity "${activityId}" is not currently active`);
  }

  const def = AUTHORED_ACTIVITIES[activityId];
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const { nextState } = resolveActivityOutcome(
    activityId,
    currentState as SimulationState,
    'ABANDONED',
    AUTHORED_ACTIVITIES
  );

  const event: SimulationEvent = createSimulationEvent('ACTIVITY_ABANDONED', simTime, nextRevision, {
    activityId,
    title: def?.title ?? activityId,
    recoveryGuidance: def?.consequences.recoveryGuidance ?? 'Returned to available pool.',
  });

  const finalState: SimulationState = {
    ...nextState,
    metadata: {
      ...nextState.metadata,
      revision: nextRevision,
    },
  };

  validateSimulationState(finalState);
  return {
    success: true,
    state: deepFreeze(finalState),
    events: [event],
    message: `Abandoned activity: "${def?.title ?? activityId}"`,
  };
}

/**
 * Handles completing/resolving an active activity.
 */
export function handleResolveActivity(
  currentState: Readonly<SimulationState>,
  activityId: string
): CommandResult {
  const director = currentState.activityDirector;
  if (!director) {
    return makeFailure(currentState, 'ACTIVITY_NOT_FOUND', 'Activity director not initialized');
  }

  const def = AUTHORED_ACTIVITIES[activityId];
  if (!def) {
    return makeFailure(currentState, 'ACTIVITY_NOT_FOUND', `Activity "${activityId}" not found in catalogue`);
  }

  const rawRuntime = director.activities[activityId];
  if (!rawRuntime) {
    return makeFailure(currentState, 'ACTIVITY_NOT_FOUND', `Activity "${activityId}" has not been started`);
  }

  // 1. Sync and evaluate objectives
  const syncedState = syncAllActivitiesWithAdapters(currentState as SimulationState);
  const runtime = syncedState.activityDirector!.activities[activityId]!;
  const evaluatedRuntime = evaluateActivityObjectives(runtime, def, syncedState);

  // 2. Validate mandatory objectives
  const pendingObjs = evaluatedRuntime.objectives.filter(o => !o.isOptional && !o.isCompleted);
  if (pendingObjs.length > 0) {
    const names = pendingObjs.map(o => `"${o.title}"`).join(', ');
    return makeFailure(
      currentState,
      'ACTIVITY_OBJECTIVES_INCOMPLETE',
      `Cannot resolve activity: pending mandatory objectives: ${names}`
    );
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  // 3. Resolve outcome and apply rewards
  const { nextState, payoutKobo, careerXpEarned, feedbackNotes } = resolveActivityOutcome(
    activityId,
    syncedState,
    'COMPLETED',
    AUTHORED_ACTIVITIES
  );

  const events: SimulationEvent[] = [];

  events.push(
    createSimulationEvent('ACTIVITY_COMPLETED', simTime, nextRevision, {
      activityId,
      title: def.title,
      payoutKobo,
      careerXpEarned,
      score: 100,
    })
  );

  if (payoutKobo > 0) {
    events.push(
      createSimulationEvent('PLAYER_MONEY_CHANGED', simTime, nextRevision, {
        previousKobo: currentState.player.moneyKobo,
        newKobo: nextState.player.moneyKobo,
        deltaKobo: payoutKobo,
        operation: 'CREDIT' as const,
        reason: `Activity payout: ${def.title}`,
      })
    );
  }

  if (careerXpEarned > 0) {
    events.push(
      createSimulationEvent('CAREER_PROMOTED', simTime, nextRevision, {
        pathId: currentState.career?.currentPathId ?? 'career_sec_analyst',
        previousLevel: currentState.career?.currentLevel ?? 1,
        newLevel: nextState.career?.currentLevel ?? 1,
        roleTitle: nextState.career?.roleTitle ?? 'Security Analyst',
      })
    );
  }

  const finalState: SimulationState = {
    ...nextState,
    metadata: {
      ...nextState.metadata,
      revision: nextRevision,
    },
  };

  validateSimulationState(finalState);
  return {
    success: true,
    state: deepFreeze(finalState),
    events,
    message: feedbackNotes,
  };
}

/**
 * Sets primary focus objective.
 */
export function handleSetPrimaryActivity(
  currentState: Readonly<SimulationState>,
  activityId: string
): CommandResult {
  const director = currentState.activityDirector;
  if (!director) {
    return makeFailure(currentState, 'ACTIVITY_NOT_FOUND', 'Activity director not initialized');
  }

  const def = AUTHORED_ACTIVITIES[activityId];
  if (!def) {
    return makeFailure(currentState, 'ACTIVITY_NOT_FOUND', `Activity "${activityId}" not found`);
  }

  const nextRevision = currentState.metadata.revision + 1;
  const nextDirector = {
    ...director,
    primaryObjectiveId: activityId,
    activeActivityId: activityId,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    activityDirector: nextDirector,
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [],
    message: `Set primary objective to "${def.title}"`,
  };
}

/**
 * Sets guidance filter preference.
 */
export function handleSetActivityGuidanceFilter(
  currentState: Readonly<SimulationState>,
  filter: 'ALL' | 'PRIMARY' | 'RECOMMENDED' | 'CAREER'
): CommandResult {
  const director = currentState.activityDirector;
  if (!director) {
    return makeFailure(currentState, 'ACTIVITY_NOT_FOUND', 'Activity director not initialized');
  }

  const nextRevision = currentState.metadata.revision + 1;
  const nextDirector = {
    ...director,
    guidanceFilter: filter,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    activityDirector: nextDirector,
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [],
    message: `Activity guidance filter set to "${filter}"`,
  };
}
