/**
 * Cyberlife — Milestone 16: Network Investigation Command Handlers
 *
 * Implements pure command reducers for M16 network analysis and threat intelligence
 * actions, maintaining immutable state transitions and emitting domain events.
 */

import { SimulationState } from '../../core/types';
import { CommandResult } from '../../commands/types';
import { createSimulationEvent } from '../../events/eventFactory';
import { deepFreeze } from '../../core/stateUtils';
import { createInitialNetworkInvestigationState } from './m16ScenarioData';
import { evaluateInvestigationSubmission } from './investigationEvaluator';
import {
  NetworkInvestigationState,
  AnalystNote,
  InvestigationConclusionSubmission,
} from './types';
import { ThreatReviewStatus } from '../threatintel/types';

function getOrInitInvestigation(state: Readonly<SimulationState>): NetworkInvestigationState {
  return state.networkInvestigation ?? createInitialNetworkInvestigationState();
}

export function handleSetIndicatorReviewStatus(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'SetIndicatorReviewStatus';
    readonly indicatorId: string;
    readonly status: ThreatReviewStatus;
    readonly notes?: string;
  }
): CommandResult {
  const inv = getOrInitInvestigation(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const updatedReviews = {
    ...inv.indicatorReviews,
    [command.indicatorId]: command.status,
  };

  // Check if this fulfills the false positive objective
  let updatedObjectives = [...inv.objectives];
  if (command.indicatorId === 'ioc-benign-siem-scanner' && command.status === 'FALSE_POSITIVE_BENIGN') {
    updatedObjectives = updatedObjectives.map(obj =>
      obj.id === 'obj-m16-distinguish-false-positive'
        ? { ...obj, isCompleted: true, completedAtSimTime: simTime }
        : obj
    );
  }

  const nextInvState: NetworkInvestigationState = {
    ...inv,
    indicatorReviews: updatedReviews,
    objectives: updatedObjectives,
    correlatedIndicatorIds: inv.correlatedIndicatorIds.includes(command.indicatorId)
      ? inv.correlatedIndicatorIds
      : [...inv.correlatedIndicatorIds, command.indicatorId],
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    networkInvestigation: nextInvState,
  };

  const event = createSimulationEvent('THREAT_INDICATOR_CORRELATED', simTime, nextRevision, {
    indicatorId: command.indicatorId,
    status: command.status,
  });

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Updated review status for indicator ${command.indicatorId} to ${command.status}`,
  };
}

export function handleRecordNetworkAnalystNote(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'RecordNetworkAnalystNote';
    readonly title: string;
    readonly content: string;
    readonly category: 'TOPOLOGY' | 'TRAFFIC' | 'THREAT_INTEL' | 'HYPOTHESIS';
    readonly linkedHostIds?: readonly string[];
    readonly linkedEventIds?: readonly string[];
    readonly linkedIndicatorIds?: readonly string[];
  }
): CommandResult {
  const inv = getOrInitInvestigation(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const newNote: AnalystNote = {
    id: `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    createdAtSimTime: simTime,
    title: command.title,
    content: command.content,
    category: command.category,
    linkedHostIds: command.linkedHostIds ?? [],
    linkedEventIds: command.linkedEventIds ?? [],
    linkedIndicatorIds: command.linkedIndicatorIds ?? [],
  };

  const nextInvState: NetworkInvestigationState = {
    ...inv,
    analystNotes: [...inv.analystNotes, newNote],
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    networkInvestigation: nextInvState,
  };

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [],
    message: `Recorded analyst note: "${command.title}"`,
  };
}

export function handleAdvanceNetworkObjective(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'AdvanceNetworkObjective';
    readonly objectiveId: string;
    readonly inspectedHostId?: string;
    readonly inspectedEventId?: string;
    readonly correlatedIndicatorId?: string;
  }
): CommandResult {
  const inv = getOrInitInvestigation(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const updatedObjectives = inv.objectives.map(obj => {
    if (obj.id === command.objectiveId && !obj.isCompleted) {
      return { ...obj, isCompleted: true, completedAtSimTime: simTime };
    }
    return obj;
  });

  const inspectedHosts = command.inspectedHostId && !inv.inspectedHostIds.includes(command.inspectedHostId)
    ? [...inv.inspectedHostIds, command.inspectedHostId]
    : inv.inspectedHostIds;

  const inspectedEvents = command.inspectedEventId && !inv.inspectedEventIds.includes(command.inspectedEventId)
    ? [...inv.inspectedEventIds, command.inspectedEventId]
    : inv.inspectedEventIds;

  const correlatedIndicators = command.correlatedIndicatorId && !inv.correlatedIndicatorIds.includes(command.correlatedIndicatorId)
    ? [...inv.correlatedIndicatorIds, command.correlatedIndicatorId]
    : inv.correlatedIndicatorIds;

  let nextPhase = inv.activePhase;
  if (command.objectiveId === 'obj-m16-triage-topology') {
    nextPhase = 'TOPOLOGY_TRIAGE';
  } else if (command.objectiveId === 'obj-m16-filter-tls' || command.objectiveId === 'obj-m16-dissect-beacon') {
    nextPhase = 'TRAFFIC_INSPECTION';
  } else if (command.objectiveId === 'obj-m16-correlate-intel' || command.objectiveId === 'obj-m16-distinguish-false-positive') {
    nextPhase = 'THREAT_CORRELATION';
  } else if (command.objectiveId === 'obj-m16-preserve-evidence') {
    nextPhase = 'EVIDENCE_SYNTHESIS';
  } else if (command.objectiveId === 'obj-m16-submit-assessment') {
    nextPhase = 'CONCLUSION_SUBMISSION';
  }

  const nextInvState: NetworkInvestigationState = {
    ...inv,
    activePhase: nextPhase,
    objectives: updatedObjectives,
    inspectedHostIds: inspectedHosts,
    inspectedEventIds: inspectedEvents,
    correlatedIndicatorIds: correlatedIndicators,
    selectedHostId: command.inspectedHostId ?? inv.selectedHostId,
    selectedEventId: command.inspectedEventId ?? inv.selectedEventId,
    selectedIndicatorId: command.correlatedIndicatorId ?? inv.selectedIndicatorId,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    networkInvestigation: nextInvState,
  };

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [],
    message: `Advanced network investigation objective: ${command.objectiveId}`,
  };
}

export function handleSubmitNetworkInvestigationConclusion(
  currentState: Readonly<SimulationState>,
  command: {
    readonly type: 'SubmitNetworkInvestigationConclusion';
    readonly submission: InvestigationConclusionSubmission;
  }
): CommandResult {
  const inv = getOrInitInvestigation(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const vaultIds = currentState.narrative?.evidenceVault
    ? Object.keys(currentState.narrative.evidenceVault)
    : [];

  const evalResult = evaluateInvestigationSubmission(command.submission, vaultIds);

  const updatedObjectives = inv.objectives.map(obj => {
    if (obj.id === 'obj-m16-submit-assessment' && evalResult.isApproved) {
      return { ...obj, isCompleted: true, completedAtSimTime: simTime };
    }
    return obj;
  });

  const nextInvState: NetworkInvestigationState = {
    ...inv,
    conclusionSubmission: command.submission,
    evaluationResult: evalResult,
    objectives: updatedObjectives,
    activePhase: evalResult.isApproved ? 'COMPLETED' : inv.activePhase,
  };

  const event = createSimulationEvent('NETWORK_INVESTIGATION_CONCLUDED', simTime, nextRevision, {
    isApproved: evalResult.isApproved,
    scorePercentage: evalResult.scorePercentage,
    suspectedActor: command.submission.suspectedActor,
    compromisedHostId: command.submission.compromisedHostId,
  });

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    networkInvestigation: nextInvState,
  };

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: evalResult.isApproved
      ? `Investigation finding approved! Score: ${evalResult.scorePercentage}%`
      : `Investigation finding submitted with revisions needed. Score: ${evalResult.scorePercentage}%`,
  };
}
