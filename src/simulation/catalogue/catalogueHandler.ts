/**
 * Cyberlife — Milestone 11: Catalogue Command Handlers & Reducer
 *
 * Pure, deterministic state handlers for:
 * - Starting practical exercises
 * - Progressing exercise objectives
 * - Authoring & tuning SIEM detection rules
 * - Running Purple Team baseline and replay scenarios
 * - Submitting Red Team authorized finding reports
 * - Completing exercises with idempotent rewards
 */

import {
  CatalogueSimulationState,
  DetectionRule,
  PracticalExercise,
  RedTeamFinding,
} from './types';
import { DEFAULT_DETECTION_RULES, PRACTICAL_EXERCISES } from './catalogueDefinitions';
import { PURPLE_SMB_LATERAL_SCENARIO, runPurpleScenarioEvaluation } from './detectionEngine';
import { SimulationState } from '../core/types';
import { CommandResult, SimulationErrorCode } from '../commands/types';
import { createSimulationEvent } from '../events/eventFactory';
import { SimulationEvent } from '../events/types';
import { validateSimulationState } from '../core/invariants';
import { deepFreeze } from '../core/stateUtils';
import { creditPlayerMoney } from '../systems/playerSystem';
import { awardSkillXp } from '../career/skillDefinitions';
import { SkillId } from '../career/types';

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
 * Creates the initial catalogue simulation state for a new game.
 */
export function createInitialCatalogueState(): CatalogueSimulationState {
  return {
    completedEntryIds: [],
    completedExerciseIds: [],
    activeExerciseId: null,
    activeExercisePhase: undefined,
    activeExerciseState: undefined,
    detectionRules: [...DEFAULT_DETECTION_RULES],
    purpleRunHistory: [],
    redFindings: [],
    totalExercisesCompleted: 0,
  };
}

/**
 * Starts a practical exercise if it exists in the catalogue.
 */
export function handleStartCatalogueExercise(
  state: CatalogueSimulationState,
  exerciseId: string
): { nextState: CatalogueSimulationState; exercise: PracticalExercise | null } {
  const ex = PRACTICAL_EXERCISES.find(e => e.id === exerciseId);
  if (!ex) {
    return { nextState: state, exercise: null };
  }

  const nextState: CatalogueSimulationState = {
    ...state,
    activeExerciseId: exerciseId,
    activeExercisePhase: 'in_progress',
    activeExerciseState: {
      startedAt: Date.now(),
      completedObjectiveIds: [],
      acceptedRoe: false,
    },
  };

  return { nextState, exercise: ex };
}

/**
 * Handles action progress inside an active practical exercise.
 */
export function handleSubmitExerciseAction(
  state: CatalogueSimulationState,
  actionType: string,
  payload: Record<string, unknown> = {}
): CatalogueSimulationState {
  if (!state.activeExerciseId) return state;

  const currentExState = (state.activeExerciseState ?? {}) as Record<string, unknown>;
  const currentCompleted = Array.isArray(currentExState.completedObjectiveIds)
    ? [...currentExState.completedObjectiveIds]
    : [];

  const updatedExState: Record<string, unknown> = {
    ...currentExState,
  };

  if (actionType === 'ACCEPT_ROE') {
    updatedExState.acceptedRoe = true;
    if (!currentCompleted.includes('obj_red_accept_roe')) {
      currentCompleted.push('obj_red_accept_roe');
    }
  } else if (actionType === 'RECORD_OBJECTIVE') {
    const objId = String(payload.objectiveId || '');
    if (objId && !currentCompleted.includes(objId)) {
      currentCompleted.push(objId);
    }
  }

  updatedExState.completedObjectiveIds = currentCompleted;

  return {
    ...state,
    activeExerciseState: updatedExState,
  };
}

/**
 * Tunes or toggles a SIEM Detection Rule (Purple Team Detection Engineering).
 */
export function handleTuneDetectionRule(
  state: CatalogueSimulationState,
  ruleId: string,
  updates: Partial<DetectionRule>
): CatalogueSimulationState {
  const updatedRules = state.detectionRules.map(rule => {
    if (rule.id === ruleId) {
      return {
        ...rule,
        ...updates,
        isTuned: true,
      };
    }
    return rule;
  });

  return {
    ...state,
    detectionRules: updatedRules,
  };
}

/**
 * Executes a Purple Team scenario run (baseline or replay with tuned rules).
 */
export function handleRunPurpleScenario(
  state: CatalogueSimulationState,
  runType: 'baseline' | 'replay',
  simTimeSeconds: number
): {
  nextState: CatalogueSimulationState;
  runResult: ReturnType<typeof runPurpleScenarioEvaluation>;
} {
  const runResult = runPurpleScenarioEvaluation(
    PURPLE_SMB_LATERAL_SCENARIO,
    state.detectionRules,
    runType,
    simTimeSeconds
  );

  const updatedHistory = [runResult, ...state.purpleRunHistory];

  const updatedCompletedObjectives = Array.isArray(state.activeExerciseState?.completedObjectiveIds)
    ? [...state.activeExerciseState.completedObjectiveIds]
    : [];

  if (runType === 'baseline') {
    if (!updatedCompletedObjectives.includes('obj_purple_run_baseline')) {
      updatedCompletedObjectives.push('obj_purple_run_baseline');
    }
  } else if (runType === 'replay' && runResult.detected) {
    if (!updatedCompletedObjectives.includes('obj_purple_replay_scenario')) {
      updatedCompletedObjectives.push('obj_purple_replay_scenario');
    }
  }

  const nextState: CatalogueSimulationState = {
    ...state,
    purpleRunHistory: updatedHistory,
    activeExerciseState: {
      ...state.activeExerciseState,
      completedObjectiveIds: updatedCompletedObjectives,
      lastRunResult: runResult,
    },
  };

  return { nextState, runResult };
}

/**
 * Submits an authorized Red Team finding report with evidence.
 */
export function handleSubmitRedTeamFinding(
  state: CatalogueSimulationState,
  findingData: Omit<RedTeamFinding, 'findingId' | 'submittedAt' | 'isApproved'>,
  simTimeSeconds: number
): CatalogueSimulationState {
  const newFinding: RedTeamFinding = {
    ...findingData,
    findingId: `FIND-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    submittedAt: simTimeSeconds,
    isApproved: true,
  };

  const updatedCompletedObjectives = Array.isArray(state.activeExerciseState?.completedObjectiveIds)
    ? [...state.activeExerciseState.completedObjectiveIds]
    : [];

  if (!updatedCompletedObjectives.includes('obj_red_submit_finding')) {
    updatedCompletedObjectives.push('obj_red_submit_finding');
  }

  return {
    ...state,
    redFindings: [newFinding, ...state.redFindings],
    activeExerciseState: {
      ...state.activeExerciseState,
      completedObjectiveIds: updatedCompletedObjectives,
      latestFindingId: newFinding.findingId,
    },
  };
}

/**
 * Completes an active practical exercise idempotently, awarding rewards only on the first completion.
 */
export function handleCompleteCatalogueExercise(
  state: CatalogueSimulationState,
  exerciseId: string
): {
  nextState: CatalogueSimulationState;
  isFirstCompletion: boolean;
  exercise: PracticalExercise | null;
} {
  const ex = PRACTICAL_EXERCISES.find(e => e.id === exerciseId);
  if (!ex) {
    return { nextState: state, isFirstCompletion: false, exercise: null };
  }

  const isFirstCompletion = !state.completedExerciseIds.includes(exerciseId);

  const updatedCompletedExercises = isFirstCompletion
    ? [...state.completedExerciseIds, exerciseId]
    : state.completedExerciseIds;

  const entryId = ex.catalogueEntryId;
  const updatedCompletedEntries =
    isFirstCompletion && !state.completedEntryIds.includes(entryId)
      ? [...state.completedEntryIds, entryId]
      : state.completedEntryIds;

  const nextState: CatalogueSimulationState = {
    ...state,
    completedExerciseIds: updatedCompletedExercises,
    completedEntryIds: updatedCompletedEntries,
    activeExerciseId: null,
    activeExercisePhase: 'completed',
    totalExercisesCompleted: updatedCompletedExercises.length,
  };

  return { nextState, isFirstCompletion, exercise: ex };
}

/**
 * Resets an exercise back to initial un-started state without corrupting other progress.
 */
export function handleResetCatalogueExercise(
  state: CatalogueSimulationState,
  exerciseId: string
): CatalogueSimulationState {
  return {
    ...state,
    completedExerciseIds: state.completedExerciseIds.filter(id => id !== exerciseId),
    activeExerciseId: state.activeExerciseId === exerciseId ? null : state.activeExerciseId,
    activeExercisePhase: undefined,
    activeExerciseState: undefined,
  };
}

export function handleSimulationStartCatalogueExercise(
  currentState: Readonly<SimulationState>,
  exerciseId: string
): CommandResult {
  const currentCat = currentState.catalogue ?? createInitialCatalogueState();
  const { nextState: nextCat, exercise } = handleStartCatalogueExercise(currentCat, exerciseId);

  if (!exercise) {
    return makeFailure(
      currentState,
      'CATALOGUE_ENTRY_NOT_FOUND',
      `Exercise with ID "${exerciseId}" not found in catalogue`
    );
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;
  const event = createSimulationEvent('CATALOGUE_EXERCISE_STARTED', simTime, nextRevision, {
    exerciseId,
    title: exercise.title,
    track: exercise.track,
  });

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    catalogue: nextCat,
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Started practical exercise: "${exercise.title}"`,
  };
}

export function handleSimulationSubmitExerciseAction(
  currentState: Readonly<SimulationState>,
  actionType: string,
  payload: Record<string, unknown> = {}
): CommandResult {
  const currentCat = currentState.catalogue ?? createInitialCatalogueState();
  if (!currentCat.activeExerciseId) {
    return makeFailure(
      currentState,
      'CATALOGUE_EXERCISE_ERROR',
      'Cannot submit exercise action: no exercise is currently active'
    );
  }

  const nextCat = handleSubmitExerciseAction(currentCat, actionType, payload);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;
  const event = createSimulationEvent(
    'CATALOGUE_EXERCISE_ACTION_SUBMITTED',
    simTime,
    nextRevision,
    {
      exerciseId: currentCat.activeExerciseId,
      actionType,
      payload,
    }
  );

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    catalogue: nextCat,
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Submitted action "${actionType}" for exercise "${currentCat.activeExerciseId}"`,
  };
}

export function handleSimulationTuneDetectionRule(
  currentState: Readonly<SimulationState>,
  ruleId: string,
  updates: Partial<DetectionRule>
): CommandResult {
  const currentCat = currentState.catalogue ?? createInitialCatalogueState();
  const nextCat = handleTuneDetectionRule(currentCat, ruleId, updates);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;
  const event = createSimulationEvent('CATALOGUE_DETECTION_RULE_TUNED', simTime, nextRevision, {
    ruleId,
    updates: updates as Record<string, unknown>,
  });

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    catalogue: nextCat,
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Tuned detection rule "${ruleId}"`,
  };
}

export function handleSimulationRunPurpleScenario(
  currentState: Readonly<SimulationState>,
  runType: 'baseline' | 'replay'
): CommandResult {
  const currentCat = currentState.catalogue ?? createInitialCatalogueState();
  const simTime = currentState.time.simulationTimeSeconds;
  const { nextState: nextCat, runResult } = handleRunPurpleScenario(currentCat, runType, simTime);
  const nextRevision = currentState.metadata.revision + 1;

  const event = createSimulationEvent('PURPLE_SCENARIO_EXECUTED', simTime, nextRevision, {
    runType,
    detected: runResult.detected,
    falsePositiveCount: runResult.falsePositiveCount,
    timeToDetectSeconds: runResult.timeToDetectSeconds,
  });

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    catalogue: nextCat,
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Purple Team scenario executed (${runType}): detected=${runResult.detected}, falsePositives=${runResult.falsePositiveCount}`,
  };
}

export function handleSimulationSubmitRedTeamFinding(
  currentState: Readonly<SimulationState>,
  findingData: Omit<RedTeamFinding, 'findingId' | 'submittedAt' | 'isApproved'>
): CommandResult {
  const currentCat = currentState.catalogue ?? createInitialCatalogueState();
  const simTime = currentState.time.simulationTimeSeconds;
  const nextCat = handleSubmitRedTeamFinding(currentCat, findingData, simTime);
  const nextRevision = currentState.metadata.revision + 1;

  const latestFindingId = String(nextCat.activeExerciseState?.latestFindingId ?? 'FIND-001');
  const event = createSimulationEvent('RED_TEAM_FINDING_SUBMITTED', simTime, nextRevision, {
    findingId: latestFindingId,
    targetHost: findingData.targetHost,
    severity: findingData.severity,
  });

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    catalogue: nextCat,
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Authorized Red Team finding submitted: ${findingData.title} (${findingData.severity})`,
  };
}

export function handleSimulationCompleteCatalogueExercise(
  currentState: Readonly<SimulationState>,
  exerciseId: string
): CommandResult {
  const currentCat = currentState.catalogue ?? createInitialCatalogueState();
  const {
    nextState: nextCat,
    isFirstCompletion,
    exercise,
  } = handleCompleteCatalogueExercise(currentCat, exerciseId);

  if (!exercise) {
    return makeFailure(
      currentState,
      'CATALOGUE_ENTRY_NOT_FOUND',
      `Exercise with ID "${exerciseId}" not found in catalogue`
    );
  }

  const simTime = currentState.time.simulationTimeSeconds;
  let nextRevision = currentState.metadata.revision + 1;
  const events: SimulationEvent[] = [];

  let updatedPlayer = currentState.player;
  const updatedSkills = currentState.skills ? { ...currentState.skills } : undefined;

  // Award rewards ONLY on first completion (idempotent)
  if (isFirstCompletion) {
    if (exercise.rewardKobo > 0) {
      const prevKobo = updatedPlayer.moneyKobo;
      updatedPlayer = creditPlayerMoney(updatedPlayer, exercise.rewardKobo);
      events.push(
        createSimulationEvent('PLAYER_MONEY_CHANGED', simTime, nextRevision, {
          previousKobo: prevKobo,
          newKobo: updatedPlayer.moneyKobo,
          deltaKobo: exercise.rewardKobo,
          operation: 'CREDIT' as const,
          reason: `Catalogue exercise completion reward: ${exercise.title}`,
        })
      );
      nextRevision += 1;
    }

    if (exercise.skillRewards && updatedSkills) {
      for (const [skillKey, xp] of Object.entries(exercise.skillRewards)) {
        const sId = skillKey as SkillId;
        const currentSkill = updatedSkills[sId];
        if (currentSkill && typeof xp === 'number' && xp > 0) {
          const prevLevel = currentSkill.level;
          const { nextState: nextSkillState } = awardSkillXp(currentSkill, xp);
          updatedSkills[sId] = nextSkillState;

          events.push(
            createSimulationEvent('SKILL_PROGRESS_AWARDED', simTime, nextRevision, {
              skillId: sId,
              xpAwarded: xp,
              previousLevel: prevLevel,
              newLevel: nextSkillState.level,
              totalXp: nextSkillState.totalXp,
            })
          );
          nextRevision += 1;
        }
      }
    }
  }

  events.push(
    createSimulationEvent('CATALOGUE_EXERCISE_COMPLETED', simTime, nextRevision, {
      exerciseId,
      isFirstCompletion,
      rewardKobo: isFirstCompletion ? exercise.rewardKobo : 0,
      skillXpReward: isFirstCompletion ? exercise.rewardXp : 0,
    })
  );

  const nextFlags = {
    ...currentState.flags,
    [`catalogue_completed_${exerciseId}`]: true,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    player: updatedPlayer,
    skills: updatedSkills,
    flags: nextFlags,
    catalogue: nextCat,
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: isFirstCompletion
      ? `Completed exercise: "${exercise.title}" (+₦${(exercise.rewardKobo / 100).toFixed(2)})`
      : `Re-completed exercise: "${exercise.title}" (previously rewarded)`,
  };
}

export function handleSimulationResetCatalogueExercise(
  currentState: Readonly<SimulationState>,
  exerciseId: string
): CommandResult {
  const currentCat = currentState.catalogue ?? createInitialCatalogueState();
  const nextCat = handleResetCatalogueExercise(currentCat, exerciseId);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const event = createSimulationEvent('CATALOGUE_EXERCISE_RESET', simTime, nextRevision, {
    exerciseId,
  });

  const nextFlags = { ...currentState.flags };
  delete nextFlags[`catalogue_completed_${exerciseId}`];

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    flags: nextFlags,
    catalogue: nextCat,
  };

  validateSimulationState(nextState);
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Reset practical exercise "${exerciseId}"`,
  };
}
