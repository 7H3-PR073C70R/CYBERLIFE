/**
 * Cyberlife — Trace & Legal Exposure Command Handlers
 *
 * Dispatches deterministic state mutations for the Trace, Legal Exposure,
 * and Defender View debrief systems.
 */

import { SimulationState } from '../../core/types';
import { SimulationEvent } from '../../events/types';
import { createSimulationEvent } from '../../events/eventFactory';
import {
  recordActionNoise,
  decayTrace,
  applyOpsecAction,
  generateDefenderViewDebrief,
  createInitialTraceState,
} from './traceEngine';
import { AuthorizedScopeDefinition, ScopeWarning } from './types';

export function handleRecordActionNoise(
  state: SimulationState,
  actionId: string,
  target: string
): { state: SimulationState; events: SimulationEvent[] } {
  const currentTrace = state.trace ?? createInitialTraceState();
  const simTime = state.time.simulationTimeSeconds;
  const isoTime = state.time.calendar.iso;

  const result = recordActionNoise(currentTrace, actionId, target, simTime, isoTime);
  const nextRevision = state.metadata.revision + 1;
  const events: SimulationEvent[] = [];

  events.push(
    createSimulationEvent('TRACE_ACTION_NOISE_RECORDED', simTime, nextRevision, {
      actionId,
      target,
      noiseValue: result.event.noiseValue,
      inScope: result.event.inScope,
      currentTraceMeter: result.state.traceMeter,
      currentLegalExposure: result.state.legalExposureMeter,
    })
  );

  for (const resp of result.newResponses) {
    events.push(
      createSimulationEvent('DEFENDER_RESPONSE_TRIGGERED', simTime, nextRevision, {
        responseId: resp.id,
        type: resp.type,
        target: resp.target,
        message: resp.message,
      })
    );
  }

  // Check if narrative flags should be updated based on legal exposure milestones
  const updatedFlags = { ...state.flags };
  if (result.state.legalExposureMeter >= 40 && !updatedFlags['flag_blessing_warning_triggered']) {
    updatedFlags['flag_blessing_warning_triggered'] = true;
  }
  if (result.state.legalExposureMeter >= 65 && !updatedFlags['flag_choker_surveillance_active']) {
    updatedFlags['flag_choker_surveillance_active'] = true;
  }
  if (result.state.legalExposureMeter >= 85 && !updatedFlags['flag_ndsrc_subpoena_issued']) {
    updatedFlags['flag_ndsrc_subpoena_issued'] = true;
  }

  return {
    state: {
      ...state,
      metadata: { ...state.metadata, revision: nextRevision },
      flags: updatedFlags,
      trace: result.state,
    },
    events,
  };
}

export function handleApplyOpsecAction(
  state: SimulationState,
  opsecAction: 'TOR_ON' | 'TOR_OFF' | 'VPN_ON' | 'VPN_OFF' | 'WIPE_LOGS'
): { state: SimulationState; events: SimulationEvent[] } {
  const currentTrace = state.trace ?? createInitialTraceState();
  const simTime = state.time.simulationTimeSeconds;
  const updatedTrace = applyOpsecAction(currentTrace, opsecAction, simTime);
  const nextRevision = state.metadata.revision + 1;

  const event = createSimulationEvent('OPSEC_ACTION_APPLIED', simTime, nextRevision, {
    action: opsecAction,
    newTraceMeter: updatedTrace.traceMeter,
    opsecModifiers: updatedTrace.opsecModifiers,
  });

  return {
    state: {
      ...state,
      metadata: { ...state.metadata, revision: nextRevision },
      trace: updatedTrace,
    },
    events: [event],
  };
}

export function handleDecayTrace(
  state: SimulationState
): { state: SimulationState; events: SimulationEvent[] } {
  const currentTrace = state.trace ?? createInitialTraceState();
  const simTime = state.time.simulationTimeSeconds;
  const updatedTrace = decayTrace(currentTrace, simTime);

  if (updatedTrace.traceMeter === currentTrace.traceMeter) {
    return { state, events: [] };
  }

  const nextRevision = state.metadata.revision + 1;
  const event = createSimulationEvent('TRACE_METER_DECAYED', simTime, nextRevision, {
    previousTrace: currentTrace.traceMeter,
    currentTrace: updatedTrace.traceMeter,
  });

  return {
    state: {
      ...state,
      metadata: { ...state.metadata, revision: nextRevision },
      trace: updatedTrace,
    },
    events: [event],
  };
}

export function handleSetJobScope(
  state: SimulationState,
  scope: AuthorizedScopeDefinition | null,
  isNightJob: boolean = false,
  jobId?: string | null
): { state: SimulationState; events: SimulationEvent[] } {
  const currentTrace = state.trace ?? createInitialTraceState();
  const simTime = state.time.simulationTimeSeconds;
  const nextRevision = state.metadata.revision + 1;

  const effectiveJobId = jobId ?? (scope ? scope.jobId : (isNightJob ? 'night_job' : null));
  const updatedTrace = {
    ...currentTrace,
    activeScope: scope,
    isNightJobActive: isNightJob,
    activeJobId: effectiveJobId,
  };

  const event = createSimulationEvent('JOB_SCOPE_UPDATED', simTime, nextRevision, {
    isNightJob,
    jobId: scope?.jobId ?? null,
  });

  return {
    state: {
      ...state,
      metadata: { ...state.metadata, revision: nextRevision },
      trace: updatedTrace,
    },
    events: [event],
  };
}

export function handleRaiseScopeWarning(
  state: SimulationState,
  warning: ScopeWarning
): { state: SimulationState; events: SimulationEvent[] } {
  const currentTrace = state.trace ?? createInitialTraceState();
  const nextRevision = state.metadata.revision + 1;

  const updatedTrace = {
    ...currentTrace,
    pendingScopeWarning: warning,
  };

  const event = createSimulationEvent('SCOPE_WARNING_RAISED', state.time.simulationTimeSeconds, nextRevision, {
    target: warning.target,
    attemptedAction: warning.attemptedAction,
    reason: warning.reason,
  });

  return {
    state: {
      ...state,
      metadata: { ...state.metadata, revision: nextRevision },
      trace: updatedTrace,
    },
    events: [event],
  };
}

export function handleAcknowledgeScopeWarning(
  state: SimulationState,
  proceed: boolean
): { state: SimulationState; events: SimulationEvent[] } {
  const currentTrace = state.trace ?? createInitialTraceState();
  const pending = currentTrace.pendingScopeWarning;
  if (!pending) return { state, events: [] };

  const simTime = state.time.simulationTimeSeconds;
  const nextRevision = state.metadata.revision + 1;
  const events: SimulationEvent[] = [];

  events.push(
    createSimulationEvent('SCOPE_WARNING_RESOLVED', simTime, nextRevision, {
      target: pending.target,
      attemptedAction: pending.attemptedAction,
      proceed,
    })
  );

  let updatedState: SimulationState = {
    ...state,
    metadata: { ...state.metadata, revision: nextRevision },
    trace: {
      ...currentTrace,
      pendingScopeWarning: null,
    },
  };

  // If player chose to proceed, record the action noise and penalty
  if (proceed) {
    const actionId = (pending.pendingActionPayload?.actionId as string) || 'scan_port_slow';
    const noiseRes = handleRecordActionNoise(updatedState, actionId, pending.target);
    updatedState = noiseRes.state;
    events.push(...noiseRes.events);
  }

  return { state: updatedState, events };
}

export function handleDismissDefenderResponse(
  state: SimulationState,
  responseId: string
): { state: SimulationState; events: SimulationEvent[] } {
  const currentTrace = state.trace ?? createInitialTraceState();
  const updatedResponses = currentTrace.activeDefenderResponses.map(r =>
    r.id === responseId ? { ...r, isDismissed: true } : r
  );

  return {
    state: {
      ...state,
      trace: {
        ...currentTrace,
        activeDefenderResponses: updatedResponses,
      },
    },
    events: [],
  };
}

export function handleGenerateDefenderDebrief(
  state: SimulationState,
  jobId: string
): { state: SimulationState; events: SimulationEvent[] } {
  const currentTrace = state.trace ?? createInitialTraceState();
  const simTime = state.time.simulationTimeSeconds;
  const debrief = generateDefenderViewDebrief(currentTrace, jobId, simTime);
  const nextRevision = state.metadata.revision + 1;

  const event = createSimulationEvent('DEFENDER_DEBRIEF_GENERATED', simTime, nextRevision, {
    jobId,
    overallVerdict: debrief.overallVerdict,
    detectedCount: debrief.detectedCount,
  });

  return {
    state: {
      ...state,
      metadata: { ...state.metadata, revision: nextRevision },
      trace: {
        ...currentTrace,
        completedDebriefs: [...currentTrace.completedDebriefs, debrief],
        activeDebrief: debrief,
      },
    },
    events: [event],
  };
}

export function handleClearActiveDebrief(
  state: SimulationState
): { state: SimulationState; events: SimulationEvent[] } {
  const currentTrace = state.trace ?? createInitialTraceState();
  return {
    state: {
      ...state,
      trace: {
        ...currentTrace,
        activeDebrief: null,
      },
    },
    events: [],
  };
}
