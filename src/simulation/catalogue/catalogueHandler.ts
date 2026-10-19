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
): { nextState: CatalogueSimulationState; runResult: ReturnType<typeof runPurpleScenarioEvaluation> } {
  const runResult = runPurpleScenarioEvaluation(
    PURPLE_SMB_LATERAL_SCENARIO,
    state.detectionRules,
    runType,
    simTimeSeconds
  );

  const updatedHistory = [runResult, ...state.purpleRunHistory];

  let updatedCompletedObjectives = Array.isArray(
    state.activeExerciseState?.completedObjectiveIds
  )
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

  let updatedCompletedObjectives = Array.isArray(
    state.activeExerciseState?.completedObjectiveIds
  )
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
