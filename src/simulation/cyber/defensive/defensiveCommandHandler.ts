/**
 * Cyberlife — Milestone 18: Defensive Command Handlers
 *
 * Implements pure command reducers for Blue Team & Purple Team operations:
 * - Triage security alerts with notes and status changes.
 * - Toggle detection rules on/off.
 * - Execute simulated defensive responses with consequence tracking.
 * - Record confirmed facts vs hypotheses.
 * - Run Purple Team adversary emulation scenarios.
 * - Submit and evaluate incident response reports.
 *
 * STRICT SAFETY INVARIANT:
 * Immutable state updates. Zero side effects. Emits typed domain events.
 */

import { SimulationState } from '../../core/types';
import { CommandResult } from '../../commands/types';
import { createSimulationEvent } from '../../events/eventFactory';
import { SimulationEvent } from '../../events/types';
import { deepFreeze } from '../../core/stateUtils';
import {
  AlertTriageStatus,
  DefensiveActionType,
  DefensiveOpsState,
  IncidentReportSubmission,
  InvestigationHypothesis,
} from './types';
import { createInitialDefensiveOpsState, evaluateDefensiveIncidentReport } from './defensiveScenarioData';
import { executeDefensiveAction } from './defensiveResponseEngine';
import { PURPLE_TEAM_SCENARIOS, runPurpleTeamScenario, generatePurpleTeamScorecard } from './purpleTeamEngine';
import { evaluateDetectionRules } from './detectionEngine';

function getOrInitDefensiveOps(state: Readonly<SimulationState>): DefensiveOpsState {
  return state.defensiveOps ?? createInitialDefensiveOpsState();
}

/**
 * Handles alert triage status transitions and analyst reasoning notes.
 */
export function handleTriageSecurityAlert(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'TriageSecurityAlert';
    readonly alertId: string;
    readonly status: AlertTriageStatus;
    readonly notes?: string;
    readonly reason?: string;
  }
): CommandResult {
  const ops = getOrInitDefensiveOps(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const targetAlert = ops.alerts.find(a => a.id === command.alertId);
  if (!targetAlert) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'ALERT_NOT_FOUND',
      message: `Security alert with ID "${command.alertId}" not found.`,
    };
  }

  const updatedAlerts = ops.alerts.map(a => {
    if (a.id === command.alertId) {
      return {
        ...a,
        triageStatus: command.status,
        triageNotes: command.notes ?? a.triageNotes,
        triageReason: command.reason ?? a.triageReason,
        triagedAtSimTime: simTime,
      };
    }
    return a;
  });

  // Check objective progressions
  const updatedObjectives = ops.objectives.map(obj => {
    if (obj.id === 'obj-m18-triage-alerts' && !obj.isCompleted) {
      return { ...obj, isCompleted: true, completedAtSimTime: simTime };
    }
    // Check false positive discrimination
    if (
      obj.id === 'obj-m18-distinguish-false-positive' &&
      !obj.isCompleted &&
      command.status === 'FALSE_POSITIVE' &&
      (targetAlert.affectedHostId.includes('mon-siem-01') || targetAlert.ruleId === 'RULE-SEC-008')
    ) {
      return { ...obj, isCompleted: true, completedAtSimTime: simTime };
    }
    return obj;
  });

  const nextOpsState: DefensiveOpsState = {
    ...ops,
    alerts: updatedAlerts,
    objectives: updatedObjectives,
    selectedAlertId: command.alertId,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    defensiveOps: nextOpsState,
  };

  const event = createSimulationEvent('SECURITY_ALERT_TRIAGED', simTime, nextRevision, {
    alertId: command.alertId,
    status: command.status,
    ruleId: targetAlert.ruleId,
    affectedHostId: targetAlert.affectedHostId,
  });

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Alert ${command.alertId} transitioned to ${command.status}.`,
  };
}

/**
 * Handles toggling detection rules on or off.
 */
export function handleToggleDetectionRule(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'ToggleDetectionRule';
    readonly ruleId: string;
    readonly isEnabled: boolean;
  }
): CommandResult {
  const ops = getOrInitDefensiveOps(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const rule = ops.rules.find(r => r.id === command.ruleId);
  if (!rule) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'RULE_NOT_FOUND',
      message: `Detection rule with ID "${command.ruleId}" not found.`,
    };
  }

  const updatedRules = ops.rules.map(r => {
    if (r.id === command.ruleId) {
      return { ...r, isEnabled: command.isEnabled };
    }
    return r;
  });

  // Re-evaluate alerts with updated rule enablement
  const reEvaluatedAlerts = evaluateDetectionRules(ops.telemetryEvents, updatedRules);

  const nextOpsState: DefensiveOpsState = {
    ...ops,
    rules: updatedRules,
    alerts: reEvaluatedAlerts,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    defensiveOps: nextOpsState,
  };

  const event = createSimulationEvent('DETECTION_RULE_TOGGLED', simTime, nextRevision, {
    ruleId: command.ruleId,
    isEnabled: command.isEnabled,
  });

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Rule ${command.ruleId} is now ${command.isEnabled ? 'ENABLED' : 'DISABLED'}.`,
  };
}

/**
 * Handles executing a simulated defensive response action (isolate endpoint, block IP, etc.).
 */
export function handleExecuteDefensiveResponse(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'ExecuteDefensiveResponse';
    readonly actionType: DefensiveActionType;
    readonly targetEntityId: string;
    readonly reason: string;
    readonly actor?: string;
  }
): CommandResult {
  const ops = getOrInitDefensiveOps(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const execResult = executeDefensiveAction(
    ops,
    command.actionType,
    command.targetEntityId,
    command.reason,
    simTime,
    command.actor ?? 'Security Analyst (Player)'
  );

  if (!execResult.success || !execResult.action) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'INVALID_DEFENSIVE_ACTION',
      message: execResult.message,
    };
  }

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    defensiveOps: execResult.nextState,
  };

  const event = createSimulationEvent('DEFENSIVE_RESPONSE_EXECUTED', simTime, nextRevision, {
    actionId: execResult.action.id,
    actionType: execResult.action.actionType,
    targetEntityId: execResult.action.targetEntityId,
    actor: execResult.action.actor,
    reason: execResult.action.reason,
  });

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: execResult.message,
  };
}

/**
 * Handles recording an investigation hypothesis or confirmed finding.
 */
export function handleRecordDefensiveHypothesis(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'RecordDefensiveHypothesis';
    readonly title: string;
    readonly hypothesisText: string;
    readonly isConfirmedFact: boolean;
    readonly linkedAlertIds?: readonly string[];
    readonly linkedTelemetryIds?: readonly string[];
    readonly linkedHostIds?: readonly string[];
    readonly linkedIndicatorIds?: readonly string[];
  }
): CommandResult {
  const ops = getOrInitDefensiveOps(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const newHypothesis: InvestigationHypothesis = {
    id: `hyp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    title: command.title.trim(),
    hypothesisText: command.hypothesisText.trim(),
    isConfirmedFact: command.isConfirmedFact,
    linkedAlertIds: command.linkedAlertIds ?? [],
    linkedTelemetryIds: command.linkedTelemetryIds ?? [],
    linkedHostIds: command.linkedHostIds ?? [],
    linkedIndicatorIds: command.linkedIndicatorIds ?? [],
    createdAtSimTime: simTime,
  };

  const updatedObjectives = ops.objectives.map(obj => {
    if (obj.id === 'obj-m18-investigate-incident' && !obj.isCompleted) {
      return { ...obj, isCompleted: true, completedAtSimTime: simTime };
    }
    return obj;
  });

  const nextOpsState: DefensiveOpsState = {
    ...ops,
    hypotheses: [newHypothesis, ...ops.hypotheses],
    objectives: updatedObjectives,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    defensiveOps: nextOpsState,
  };

  const event = createSimulationEvent('DEFENSIVE_HYPOTHESIS_RECORDED', simTime, nextRevision, {
    hypothesisId: newHypothesis.id,
    title: newHypothesis.title,
    isConfirmedFact: newHypothesis.isConfirmedFact,
  });

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Recorded ${command.isConfirmedFact ? 'confirmed finding' : 'investigation hypothesis'}: "${command.title}"`,
  };
}

/**
 * Handles advancing an authored defensive mission objective.
 */
export function handleAdvanceDefensiveObjective(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'AdvanceDefensiveObjective';
    readonly objectiveId: string;
  }
): CommandResult {
  const ops = getOrInitDefensiveOps(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const updatedObjectives = ops.objectives.map(obj => {
    if (obj.id === command.objectiveId && !obj.isCompleted) {
      return { ...obj, isCompleted: true, completedAtSimTime: simTime };
    }
    return obj;
  });

  const nextOpsState: DefensiveOpsState = {
    ...ops,
    objectives: updatedObjectives,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    defensiveOps: nextOpsState,
  };

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [],
    message: `Advanced defensive objective: ${command.objectiveId}`,
  };
}

/**
 * Handles executing an adversary emulation scenario in the Purple Team Studio.
 */
export function handleRunPurpleTeamScenario(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'RunPurpleTeamScenario';
    readonly scenarioId: string;
  }
): CommandResult {
  const ops = getOrInitDefensiveOps(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const scenario = PURPLE_TEAM_SCENARIOS.find(s => s.id === command.scenarioId);
  if (!scenario) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'SCENARIO_NOT_FOUND',
      message: `Purple Team scenario with ID "${command.scenarioId}" not found.`,
    };
  }

  const result = runPurpleTeamScenario(scenario, ops.rules, ops.telemetryEvents);

  const updatedResults = {
    ...ops.purpleEmulationResults,
    [scenario.id]: {
      ...result,
      executedAtSimTime: simTime,
    },
  };

  // Generate scorecard to see if objective is fulfilled
  const scorecard = generatePurpleTeamScorecard(updatedResults);
  const updatedObjectives = ops.objectives.map(obj => {
    if (obj.id === 'obj-m18-validate-purple-coverage' && !obj.isCompleted && scorecard.coveragePercentage >= 80) {
      return { ...obj, isCompleted: true, completedAtSimTime: simTime };
    }
    return obj;
  });

  const nextOpsState: DefensiveOpsState = {
    ...ops,
    purpleEmulationResults: updatedResults,
    objectives: updatedObjectives,
    selectedScenarioId: scenario.id,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    defensiveOps: nextOpsState,
  };

  const event = createSimulationEvent('PURPLE_TEAM_SCENARIO_RUN', simTime, nextRevision, {
    scenarioId: scenario.id,
    status: result.status,
    matchedRuleIds: result.matchedRuleIds,
    coveragePercentage: scorecard.coveragePercentage,
  });

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event as SimulationEvent],
    message: `Purple Team scenario "${scenario.name}" executed: ${result.status} (Coverage: ${scorecard.coveragePercentage}%)`,
  };
}

/**
 * Handles submitting and grading the final defensive incident report.
 */
export function handleSubmitDefensiveIncidentReport(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'SubmitDefensiveIncidentReport';
    readonly submission: IncidentReportSubmission;
  }
): CommandResult {
  const ops = getOrInitDefensiveOps(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const vaultIds = currentState.narrative?.evidenceVault
    ? Object.keys(currentState.narrative.evidenceVault)
    : [];

  const evalResult = evaluateDefensiveIncidentReport(
    command.submission,
    vaultIds,
    ops.executedResponses
  );

  const updatedObjectives = ops.objectives.map(obj => {
    if (obj.id === 'obj-m18-preserve-evidence' && !obj.isCompleted && evalResult.evidenceScore >= 5) {
      return { ...obj, isCompleted: true, completedAtSimTime: simTime };
    }
    return obj;
  });

  const nextOpsState: DefensiveOpsState = {
    ...ops,
    incidentSubmission: command.submission,
    evaluationResult: evalResult,
    objectives: updatedObjectives,
  };

  // Update world flags and faction standing if approved
  let nextFlags = { ...currentState.flags };
  if (evalResult.isApproved) {
    nextFlags = {
      ...nextFlags,
      flag_m18_defensive_completed: true,
      flag_m18_score: evalResult.scorePercentage,
    };
  }

  const nextState: SimulationState = {
    ...currentState,
    flags: nextFlags,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    defensiveOps: nextOpsState,
  };

  const event = createSimulationEvent('DEFENSIVE_MISSION_CONCLUDED', simTime, nextRevision, {
    isApproved: evalResult.isApproved,
    scorePercentage: evalResult.scorePercentage,
    suspectedAttacker: command.submission.suspectedAttacker,
    initialCompromisedHostId: command.submission.initialCompromisedHostId,
  });

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event as SimulationEvent],
    message: evalResult.isApproved
      ? `Defensive Assessment APPROVED! Score: ${evalResult.scorePercentage}%`
      : `Defensive Assessment Submitted with Revisions Needed. Score: ${evalResult.scorePercentage}%`,
  };
}
