/**
 * Cyberlife — Pure Domain Trace & Legal Exposure Engine
 *
 * Implements deterministic calculations for:
 * 1. ActionNoise calculation with OPSEC modifiers and target sensitivity.
 * 2. Short-term Trace meter updates, decay, and deterministic threshold triggers.
 * 3. Long-term Legal Exposure meter updates, scope violations, and story milestones.
 * 4. Purple-team Defender View debrief timeline generation.
 *
 * INVARIANTS:
 * 100% pure domain functions · Zero side-effects · Deterministic and replayable.
 */

import {
  ActionNoiseEvent,
  DefenderResponseEvent,
  DefenderResponseType,
  DefenderViewDebrief,
  DefenderViewEntry,
  OpsecModifiers,
  TraceSystemState,
} from './types';
import {
  NOISE_ACTION_CATALOG,
  TARGET_SENSITIVITY_PROFILES,
  generateSyntheticLogLine,
} from './noiseCatalog';

export const TRACE_DECAY_RATE_SECONDS = 45; // 1 point decayed per 45s sim time

export function createInitialTraceState(): TraceSystemState {
  return {
    traceMeter: 0,
    legalExposureMeter: 0,
    isNightJobActive: false,
    activeJobId: null,
    activeScope: null,
    pendingScopeWarning: null,
    opsecModifiers: {
      useTor: false,
      useVpn: false,
      isOffHours: false,
      cleanedLogs: false,
    },
    actionHistory: [],
    activeDefenderResponses: [],
    taintedEvidenceIds: [],
    lastDecaySimTime: 0,
    storyTriggersFired: [],
    completedDebriefs: [],
    activeDebrief: null,
  };
}

/**
 * Calculates effective noise (0-100) after applying target sensitivity and OPSEC modifiers.
 */
export function calculateActionNoise(
  actionId: string,
  target: string,
  opsec: OpsecModifiers
): number {
  const def = NOISE_ACTION_CATALOG[actionId];
  if (!def) return 5; // Default safe fallback

  const targetProfile = TARGET_SENSITIVITY_PROFILES[target];
  const targetMultiplier = targetProfile ? targetProfile.multiplier : 1.0;

  let modifier = 1.0;
  if (opsec.useTor) modifier *= 0.65; // -35% noise
  if (opsec.useVpn) modifier *= 0.85; // -15% noise
  if (opsec.isOffHours) modifier *= 0.85; // -15% noise

  const rawNoise = def.baseNoise * targetMultiplier * modifier;
  return Math.min(100, Math.max(0, Math.round(rawNoise)));
}

/**
 * Evaluates whether an action on a target is within the active Scope.
 */
export function isActionInScope(
  state: TraceSystemState,
  actionId: string,
  target: string
): { inScope: boolean; reason?: string } {
  const scope = state.activeScope;
  // If no active scope is declared (e.g. gray-zone night job with no contract), everything is out-of-scope for legal immunity
  if (!scope) {
    return {
      inScope: false,
      reason: 'No authorized contract or Rules of Engagement currently registered.',
    };
  }

  // Check prohibited targets
  if (scope.prohibitedTargets.some(p => target.includes(p))) {
    return {
      inScope: false,
      reason: `Target '${target}' is explicitly listed on the Prohibited Assets register.`,
    };
  }

  // Check authorized hosts
  const hostMatch = scope.authorizedHosts.some(
    h => h === '*' || target === h || target.includes(h)
  );
  if (!hostMatch) {
    return {
      inScope: false,
      reason: `Target host '${target}' is outside authorized scope definition.`,
    };
  }

  // Check category if scope restricts allowed categories
  const actionDef = NOISE_ACTION_CATALOG[actionId];
  if (scope.allowedCategories && actionDef && !scope.allowedCategories.includes(actionDef.category)) {
    return {
      inScope: false,
      reason: `Action category '${actionDef.category}' is prohibited under active Rules of Engagement.`,
    };
  }

  return { inScope: true };
}

/**
 * Emits an ActionNoiseEvent, updates the trace and legal exposure meters,
 * and checks for deterministic defender responses.
 */
export function recordActionNoise(
  state: TraceSystemState,
  actionId: string,
  target: string,
  simTime: number,
  isoTime: string,
  sourceIp: string = '10.0.4.15'
): { state: TraceSystemState; event: ActionNoiseEvent; newResponses: DefenderResponseEvent[] } {
  const actionDef = NOISE_ACTION_CATALOG[actionId] ?? {
    id: actionId,
    name: actionId,
    category: 'ENUMERATION',
    baseNoise: 20,
    attckTechniqueId: 'T1046',
    attckTechniqueName: 'Network Service Discovery',
    logFormat: 'CEF',
    detectionReason: 'Probed network endpoint.',
    opsecMitigation: 'Limit query frequency.',
  };

  const calculatedNoise = calculateActionNoise(actionId, target, state.opsecModifiers);
  const scopeCheck = isActionInScope(state, actionId, target);

  // Determine if defender logged/detected this action
  // Threshold: actions with noise >= 20 on defended targets have a high detection chance
  const isDetected = calculatedNoise >= 20;

  const generatedLog = generateSyntheticLogLine(
    actionDef.logFormat,
    actionDef,
    target,
    isoTime,
    state.opsecModifiers.useTor ? '185.220.101.5' : sourceIp
  );

  const noiseEvent: ActionNoiseEvent = {
    id: `noise-${simTime}-${Math.random().toString(36).slice(2, 7)}`,
    actionId: actionDef.id,
    category: actionDef.category,
    target,
    noiseValue: calculatedNoise,
    inScope: scopeCheck.inScope,
    timestampSimTime: simTime,
    generatedLog,
    attckTechniqueId: actionDef.attckTechniqueId,
    attckTechniqueName: actionDef.attckTechniqueName,
    detected: isDetected,
    detectionReason: actionDef.detectionReason,
    opsecMitigation: actionDef.opsecMitigation,
  };

  // 1. Update Short-Term Trace Meter
  const nextTrace = Math.min(100, state.traceMeter + calculatedNoise);

  // 2. Update Long-Term Legal Exposure Meter if action was unauthorized / out-of-scope
  let legalDelta = 0;
  if (!scopeCheck.inScope) {
    // Night jobs or unauthorized intrusions increase legal risk
    legalDelta = actionDef.category === 'EXPLOITATION' || actionDef.category === 'EXFILTRATION' ? 25 : 12;
  }
  const nextLegal = Math.min(100, state.legalExposureMeter + legalDelta);

  // 3. Mark evidence as tainted if collected out-of-scope
  const updatedTainted = [...state.taintedEvidenceIds];
  if (!scopeCheck.inScope) {
    updatedTainted.push(`EVD-UNAUTH-${target}-${simTime}`);
  }

  // 4. Deterministic Defender Response Triggering
  const newResponses: DefenderResponseEvent[] = [];
  const existingTypes = new Set(state.activeDefenderResponses.map(r => r.type));

  const checkThreshold = (
    level: number,
    type: DefenderResponseType,
    msg: string,
    signature: string
  ) => {
    if (nextTrace >= level && !existingTypes.has(type)) {
      newResponses.push({
        id: `resp-${type}-${simTime}`,
        type,
        target,
        triggeredAtTraceLevel: nextTrace,
        timestampSimTime: simTime,
        message: msg,
        logSignature: signature,
        isDismissed: false,
      });
    }
  };

  checkThreshold(
    25,
    'RATE_LIMIT',
    `Target '${target}' defender initiated adaptive rate limiting (HTTP 429 Too Many Requests). Queries throttled.`,
    'WAF_RATE_LIMIT_RULE_429'
  );
  checkThreshold(
    50,
    'SOC_ALERT',
    `Perimeter IDS raised high-priority alert for host '${target}'. SOC analysts assigned to triage origin.`,
    'SURICATA_ET_ALERT_ELEVATED'
  );
  checkThreshold(
    50,
    'HONEYPOT_EXPOSURE',
    `Host '${target}' deployed canary auth tokens and decoy SMB directories.`,
    'DECOY_HONEY_TOKEN_DEPLOYED'
  );
  checkThreshold(
    75,
    'IP_BLOCK',
    `Firewall active defense rule engaged. Direct TCP/UDP packets to '${target}' are dropped.`,
    'IPTABLES_DROP_SRC_IP_BLOCK'
  );
  checkThreshold(
    90,
    'FULL_LOCKOUT',
    `Critical incident lockout declared on '${target}'. Session invalidated; administrative lockdown initiated.`,
    'ENTERPRISE_SOC_INCIDENT_SEV1'
  );

  // 5. Evaluate Story Triggers for Legal Exposure
  const firedTriggers = new Set(state.storyTriggersFired);
  if (nextLegal >= 40 && !firedTriggers.has('story_blessing_warning')) {
    firedTriggers.add('story_blessing_warning');
  }
  if (nextLegal >= 65 && !firedTriggers.has('story_choker_surveillance')) {
    firedTriggers.add('story_choker_surveillance');
  }
  if (nextLegal >= 85 && !firedTriggers.has('story_ndsrc_subpoena')) {
    firedTriggers.add('story_ndsrc_subpoena');
  }

  const updatedHistory = [...state.actionHistory, noiseEvent].slice(-50); // Keep last 50 for clean replay

  return {
    state: {
      ...state,
      traceMeter: nextTrace,
      legalExposureMeter: nextLegal,
      actionHistory: updatedHistory,
      activeDefenderResponses: [...state.activeDefenderResponses, ...newResponses],
      taintedEvidenceIds: updatedTainted,
      lastDecaySimTime: simTime,
      storyTriggersFired: Array.from(firedTriggers),
    },
    event: noiseEvent,
    newResponses,
  };
}

/**
 * Calculates time-based decay of the Trace meter.
 */
export function decayTrace(state: TraceSystemState, currentSimTime: number): TraceSystemState {
  if (state.traceMeter <= 0) {
    return { ...state, lastDecaySimTime: currentSimTime };
  }

  const elapsedSeconds = Math.max(0, currentSimTime - state.lastDecaySimTime);
  const decayPoints = Math.floor(elapsedSeconds / TRACE_DECAY_RATE_SECONDS);

  if (decayPoints <= 0) return state;

  const nextTrace = Math.max(0, state.traceMeter - decayPoints);
  return {
    ...state,
    traceMeter: nextTrace,
    lastDecaySimTime: currentSimTime,
  };
}

/**
 * Applies deliberate OPSEC choices (Tor, VPN, log cleanup).
 */
export function applyOpsecAction(
  state: TraceSystemState,
  action: 'TOR_ON' | 'TOR_OFF' | 'VPN_ON' | 'VPN_OFF' | 'WIPE_LOGS',
  simTime: number
): TraceSystemState {
  switch (action) {
    case 'TOR_ON':
      return { ...state, opsecModifiers: { ...state.opsecModifiers, useTor: true } };
    case 'TOR_OFF':
      return { ...state, opsecModifiers: { ...state.opsecModifiers, useTor: false } };
    case 'VPN_ON':
      return { ...state, opsecModifiers: { ...state.opsecModifiers, useVpn: true } };
    case 'VPN_OFF':
      return { ...state, opsecModifiers: { ...state.opsecModifiers, useVpn: false } };
    case 'WIPE_LOGS':
      return {
        ...state,
        traceMeter: Math.max(0, state.traceMeter - 20),
        opsecModifiers: { ...state.opsecModifiers, cleanedLogs: true },
        lastDecaySimTime: simTime,
      };
    default:
      return state;
  }
}

/**
 * Generates the authentic Purple-Team "Defender View" debrief.
 */
export function generateDefenderViewDebrief(
  state: TraceSystemState,
  jobId: string,
  simTime: number
): DefenderViewDebrief {
  const entries: DefenderViewEntry[] = state.actionHistory.map(item => {
    let status: 'DETECTED' | 'SUSPICIOUS' | 'MISSED' = 'MISSED';
    if (item.noiseValue >= 50) {
      status = 'DETECTED';
    } else if (item.noiseValue >= 20) {
      status = 'SUSPICIOUS';
    }

    return {
      id: `debrief-${item.id}`,
      timestampString: new Date(item.timestampSimTime * 1000).toISOString().slice(11, 19),
      timestampSimTime: item.timestampSimTime,
      target: item.target,
      actionName: item.actionId,
      logLine: item.generatedLog,
      logFormat: 'CEF',
      status,
      attckTechniqueId: item.attckTechniqueId,
      attckTechniqueName: item.attckTechniqueName,
      blueTeamInsight: item.detectionReason,
      redTeamLesson: item.opsecMitigation,
    };
  });

  const detectedCount = entries.filter(e => e.status === 'DETECTED').length;
  let overallVerdict: 'STEALTHY' | 'SURVEILLED' | 'BURNED' = 'STEALTHY';
  if (state.traceMeter >= 75) {
    overallVerdict = 'BURNED';
  } else if (state.traceMeter >= 30 || detectedCount >= 2) {
    overallVerdict = 'SURVEILLED';
  }

  let feedbackSummary = 'Clean engagement. The target SOC did not establish high-fidelity correlation.';
  if (overallVerdict === 'BURNED') {
    feedbackSummary = 'Severe telemetry footprint. Active defenses triggered IP blocking and alert escalation.';
  } else if (overallVerdict === 'SURVEILLED') {
    feedbackSummary = 'Elevated noise profile. Host sensors logged suspicious anomalies; rate limits were initiated.';
  }

  return {
    jobId,
    completedAtSimTime: simTime,
    finalTraceLevel: state.traceMeter,
    finalLegalExposure: state.legalExposureMeter,
    totalActions: entries.length,
    detectedCount,
    entries,
    overallVerdict,
    feedbackSummary,
  };
}
