/**
 * Cyberlife — Milestone 21: Human Intelligence Command Handler
 *
 * Pure command handlers for M21 gameplay:
 * - StartInterview / AskInterviewQuestion / PresentEvidenceToNpc / ConcludeInterview
 * - InspectWorldObject (observation recording)
 * - CompareEvidenceWithTestimony
 * - SubmitM21Conclusion
 * - EvaluateSocEngDecision
 * - RaiseAssessmentFinding / SubmitPhysicalAssessmentReport
 *
 * All handlers are deterministic, pure functions returning CommandResult.
 * STRICT SAFETY BOUNDARY: 100% in-memory simulation. No real-world operations.
 */

import type { SimulationState } from '../core/types';
import type { CommandResult, SimulationErrorCode } from '../commands/types';
import { deepFreeze } from '../core/stateUtils';
import { createSimulationEvent } from '../events/eventFactory';
import { clampRelationship } from '../actors/types';
import type {
  HumanIntelState,
  InterviewSession,
  WitnessStatement,
  ObservationRecord,
  EvidenceComparisonRecord,
  M21InvestigativeConclusion,
  SocEngScenarioEvaluation,
  PhysicalAssessmentFinding,
  PhysicalAssessmentReport,
  M21ConclusionType,
  SocEngDecision,
  ComparisonVerdict,
  FindingSeverity,
  FindingCategory,
} from './types';
import {
  M21_INTERVIEW_QUESTIONS,
  SCENARIO_B_DECISIONS,
  SCENARIO_C_INSPECTABLE_OBJECTS,
  SCENARIO_C_EXPECTED_FINDINGS,
  M21_SCENARIO_A_EVIDENCE,
} from './scenarioData';
import { AUTHORED_ACTIVITIES } from '../activities/activityCatalogue';

// ============================================================================
// Command type definitions (re-exported via commands/types.ts extension)
// ============================================================================

export interface StartInterviewCommand {
  readonly type: 'StartInterview';
  readonly npcId: string;
  readonly activityId: string;
}

export interface AskInterviewQuestionCommand {
  readonly type: 'AskInterviewQuestion';
  readonly sessionId: string;
  readonly questionId: string;
}

export interface PresentEvidenceToNpcCommand {
  readonly type: 'PresentEvidenceToNpc';
  readonly sessionId: string;
  readonly evidenceId: string;
}

export interface ConcludeInterviewCommand {
  readonly type: 'ConcludeInterview';
  readonly sessionId: string;
}

export interface InspectWorldObjectCommand {
  readonly type: 'InspectWorldObject';
  readonly objectId: string;
  readonly activityId: string;
}

export interface CompareEvidenceWithTestimonyCommand {
  readonly type: 'CompareEvidenceWithTestimony';
  readonly activityId: string;
  readonly statementId: string;
  readonly technicalEvidenceId: string;
  readonly playerVerdict: ComparisonVerdict;
  readonly playerRationale: string;
}

export interface SubmitM21ConclusionCommand {
  readonly type: 'SubmitM21Conclusion';
  readonly activityId: string;
  readonly conclusionId: string;
  readonly hypothesisText: string;
  readonly playerConclusionType: M21ConclusionType;
  readonly supportingStatementIds: readonly string[];
  readonly supportingEvidenceIds: readonly string[];
  readonly contradictingStatementIds: readonly string[];
}

export interface EvaluateSocEngDecisionCommand {
  readonly type: 'EvaluateSocEngDecision';
  readonly activityId: string;
  readonly scenarioId: string;
  readonly playerDecision: SocEngDecision;
}

export interface RaiseAssessmentFindingCommand {
  readonly type: 'RaiseAssessmentFinding';
  readonly activityId: string;
  readonly facilityId: string;
  readonly roomId?: string;
  readonly category: FindingCategory;
  readonly severity: FindingSeverity;
  readonly title: string;
  readonly observationSummary: string;
  readonly policyReference: string;
  readonly remediationRecommendation: string;
  readonly linkedObservationIds: readonly string[];
}

export interface SubmitPhysicalAssessmentReportCommand {
  readonly type: 'SubmitPhysicalAssessmentReport';
  readonly activityId: string;
  readonly facilityId: string;
  readonly scope: string;
  readonly authorizationReference: string;
  readonly executiveSummary: string;
}

// ============================================================================
// Helpers
// ============================================================================

function makeFailure(
  state: Readonly<SimulationState>,
  errorCode: SimulationErrorCode,
  message: string
): CommandResult {
  return { success: false, state, events: [], errorCode, message, isNoOp: false };
}

function getHumanIntel(state: Readonly<SimulationState>): HumanIntelState {
  return state.humanIntel ?? {
    observations: {},
    interviewSessions: {},
    comparisons: {},
    conclusions: {},
    socEngEvaluations: {},
    assessmentFindings: {},
    assessmentReports: {},
    askedQuestions: {},
  };
}

function withHumanIntel(state: SimulationState, hi: HumanIntelState): SimulationState {
  return { ...state, humanIntel: hi };
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
}

/** Returns npc relationship from state, defaulting to 0. */
function getNpcRelationship(state: Readonly<SimulationState>, npcId: string): number {
  return state.npcs?.[npcId]?.relationship ?? 0;
}

/** Applies a relationship delta to an NPC in state. */
function applyRelationshipDelta(state: SimulationState, npcId: string, delta: number): SimulationState {
  if (!state.npcs || !state.npcs[npcId]) return state;
  const current = state.npcs[npcId]!.relationship;
  const next = clampRelationship(current + delta);
  return {
    ...state,
    npcs: {
      ...state.npcs,
      [npcId]: { ...state.npcs[npcId]!, relationship: next },
    },
  };
}

/** Applies a map of flags to state. */
function applyFlags(
  state: SimulationState,
  flagsToSet: Readonly<Record<string, boolean | string | number>>
): SimulationState {
  return { ...state, flags: { ...state.flags, ...flagsToSet } };
}

// ============================================================================
// StartInterview
// ============================================================================

export function handleStartInterview(
  state: Readonly<SimulationState>,
  cmd: StartInterviewCommand
): CommandResult {
  const hi = getHumanIntel(state);
  const npcProfile = state.npcs?.[cmd.npcId];

  if (!npcProfile) {
    return makeFailure(state, 'NPC_NOT_FOUND', `NPC "${cmd.npcId}" not found in simulation state.`);
  }

  const def = AUTHORED_ACTIVITIES[cmd.activityId];
  if (!def) {
    return makeFailure(state, 'ACTIVITY_NOT_FOUND', `Activity "${cmd.activityId}" not found.`);
  }

  // Check there's no active session already
  const existingActive = Object.values(hi.interviewSessions).find(
    s => s.npcId === cmd.npcId && s.activityId === cmd.activityId && s.status === 'ACTIVE'
  );
  if (existingActive) {
    return makeFailure(
      state,
      'INVALID_COMMAND',
      `An interview with "${cmd.npcId}" for activity "${cmd.activityId}" is already active (session: ${existingActive.sessionId}).`
    );
  }

  const sessionId = uid('interview');
  const session: InterviewSession = {
    sessionId,
    activityId: cmd.activityId,
    npcId: cmd.npcId,
    startedAtSimTime: state.time.simulationTimeSeconds,
    questionsAsked: [],
    statementsRecorded: [],
    evidencePresentedIds: [],
    status: 'ACTIVE',
    trustBeforeInterview: getNpcRelationship(state, cmd.npcId),
  };

  const nextHi: HumanIntelState = {
    ...hi,
    interviewSessions: { ...hi.interviewSessions, [sessionId]: session },
  };

  // Inject Scenario A evidence into narrative vault if starting Scenario A
  let nextState: SimulationState = { ...(state as SimulationState), humanIntel: nextHi };
  if (cmd.activityId === 'act_m21_conflicting_accounts') {
    for (const ev of M21_SCENARIO_A_EVIDENCE) {
      if (!nextState.narrative?.evidenceVault[ev.evidenceId]) {
        nextState = {
          ...nextState,
          narrative: nextState.narrative
            ? {
                ...nextState.narrative,
                evidenceVault: {
                  ...nextState.narrative.evidenceVault,
                  [ev.evidenceId]: {
                    evidenceId: ev.evidenceId,
                    source: ev.source,
                    title: ev.title,
                    description: ev.description,
                    hash: ev.hash,
                    collectedAtSimTime: state.time.simulationTimeSeconds,
                    integrityVerified: true,
                    tags: [...ev.tags],
                  },
                },
              }
            : nextState.narrative,
        };
      }
    }
    // The badge log is now in the player's evidence vault — mirror the adapter's
    // "review badge log" objective so the follow-up badge question unlocks.
    nextState = applyFlags(nextState, { m21a_badge_log_reviewed: true });
  }

  const event = createSimulationEvent(
    'ACTIVITY_ACCEPTED',
    state.time.simulationTimeSeconds,
    state.metadata.revision + 1,
    {
      activityId: cmd.activityId,
      title: `Interview: ${cmd.npcId}`,
      type: 'INVESTIGATION',
      priority: 'RECOMMENDED',
    }
  );

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Interview session started with NPC "${cmd.npcId}" for activity "${cmd.activityId}" (session: ${sessionId}).`,
  };
}

// ============================================================================
// AskInterviewQuestion
// ============================================================================

export function handleAskInterviewQuestion(
  state: Readonly<SimulationState>,
  cmd: AskInterviewQuestionCommand
): CommandResult {
  const hi = getHumanIntel(state);
  const session = hi.interviewSessions[cmd.sessionId];

  if (!session || session.status !== 'ACTIVE') {
    return makeFailure(
      state,
      'NO_ACTIVE_DIALOGUE',
      `Interview session "${cmd.sessionId}" is not active.`
    );
  }

  if (session.questionsAsked.includes(cmd.questionId)) {
    return makeFailure(
      state,
      'INVALID_COMMAND',
      `Question "${cmd.questionId}" has already been asked in this session.`
    );
  }

  // Find the question definition
  const qDef = M21_INTERVIEW_QUESTIONS.find(
    q => q.id === cmd.questionId && q.activityId === session.activityId
  );
  if (!qDef) {
    return makeFailure(
      state,
      'DIALOGUE_NODE_NOT_FOUND',
      `Interview question "${cmd.questionId}" not found for activity "${session.activityId}".`
    );
  }

  // Check required flags
  if (qDef.requiredFlags) {
    for (const [flag, expected] of Object.entries(qDef.requiredFlags)) {
      if ((state as SimulationState).flags[flag] !== expected) {
        return makeFailure(
          state,
          'DIALOGUE_CONDITION_NOT_MET',
          `Question "${cmd.questionId}" requires flag "${flag}" = ${String(expected)}. Prerequisite not met.`
        );
      }
    }
  }
  if (qDef.prohibitedFlags) {
    for (const flag of qDef.prohibitedFlags) {
      if ((state as SimulationState).flags[flag]) {
        return makeFailure(
          state,
          'DIALOGUE_CONDITION_NOT_MET',
          `Question "${cmd.questionId}" cannot be asked while flag "${flag}" is set.`
        );
      }
    }
  }
  if (qDef.minRelationship !== undefined) {
    const rel = getNpcRelationship(state, session.npcId);
    if (rel < qDef.minRelationship) {
      return makeFailure(
        state,
        'DIALOGUE_CONDITION_NOT_MET',
        `Question "${cmd.questionId}" requires relationship ≥ ${qDef.minRelationship} with "${session.npcId}" (current: ${rel}).`
      );
    }
  }

  const statementId = uid('stmt');
  const statement: WitnessStatement = {
    statementId,
    npcId: session.npcId,
    questionId: cmd.questionId,
    responseText: qDef.responseText,
    reliability: qDef.reliability,
    claimedFact: qDef.claimedFact,
    potentialContradiction: qDef.potentialContradiction,
    evidenceIdMentioned: qDef.evidenceIdMentioned,
    recordedAtSimTime: state.time.simulationTimeSeconds,
  };

  const updatedSession: InterviewSession = {
    ...session,
    questionsAsked: [...session.questionsAsked, cmd.questionId],
    statementsRecorded: [...session.statementsRecorded, statement],
  };

  const askedForNpc = hi.askedQuestions[session.npcId] ?? [];

  const nextHi: HumanIntelState = {
    ...hi,
    interviewSessions: { ...hi.interviewSessions, [cmd.sessionId]: updatedSession },
    askedQuestions: {
      ...hi.askedQuestions,
      [session.npcId]: [...askedForNpc, cmd.questionId],
    },
  };

  let nextState: SimulationState = withHumanIntel(state as SimulationState, nextHi);

  // Apply flags
  if (qDef.flagsToSet) {
    nextState = applyFlags(nextState, qDef.flagsToSet as Record<string, boolean | string | number>);
  }

  // Apply relationship delta
  if (qDef.relationshipDelta !== undefined && qDef.relationshipDelta !== 0) {
    nextState = applyRelationshipDelta(nextState, session.npcId, qDef.relationshipDelta);
  }

  // Record NPC memory topic
  if (nextState.npcs?.[session.npcId]) {
    const npcState = nextState.npcs[session.npcId]!;
    nextState = {
      ...nextState,
      npcs: {
        ...nextState.npcs,
        [session.npcId]: {
          ...npcState,
          memory: {
            ...npcState.memory,
            topicsDiscussed: npcState.memory.topicsDiscussed.includes(cmd.questionId)
              ? npcState.memory.topicsDiscussed
              : [...npcState.memory.topicsDiscussed, cmd.questionId],
          },
        },
      },
    };
  }

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [],
    message: `Question asked. ${session.npcId} responded: "${qDef.responseText.slice(0, 80)}..."`,
  };
}

// ============================================================================
// PresentEvidenceToNpc
// ============================================================================

export function handlePresentEvidenceToNpc(
  state: Readonly<SimulationState>,
  cmd: PresentEvidenceToNpcCommand
): CommandResult {
  const hi = getHumanIntel(state);
  const session = hi.interviewSessions[cmd.sessionId];

  if (!session || session.status !== 'ACTIVE') {
    return makeFailure(state, 'NO_ACTIVE_DIALOGUE', `Interview session "${cmd.sessionId}" is not active.`);
  }

  const evidenceItem = state.narrative?.evidenceVault[cmd.evidenceId] ??
    (state as SimulationState).redTeamAssessment?.evidenceVault.find(e => e.id === cmd.evidenceId);

  if (!evidenceItem) {
    return makeFailure(
      state,
      'INSUFFICIENT_EVIDENCE',
      `Evidence "${cmd.evidenceId}" not found in the evidence vault. Collect it first.`
    );
  }

  if (session.evidencePresentedIds.includes(cmd.evidenceId)) {
    return { success: true, state, events: [], message: `Evidence "${cmd.evidenceId}" has already been presented in this session.`, isNoOp: true };
  }

  const updatedSession: InterviewSession = {
    ...session,
    evidencePresentedIds: [...session.evidencePresentedIds, cmd.evidenceId],
  };

  // Unlock any questions that require evidence to be reviewed
  const flagKey = `m21_evidence_presented_${cmd.evidenceId}`;
  let nextState = applyFlags(state as SimulationState, { [flagKey]: true });
  nextState = withHumanIntel(nextState, {
    ...hi,
    interviewSessions: { ...hi.interviewSessions, [cmd.sessionId]: updatedSession },
  });

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [],
    message: `Evidence "${evidenceItem.title}" presented to ${session.npcId}.`,
  };
}

// ============================================================================
// ConcludeInterview
// ============================================================================

export function handleConcludeInterview(
  state: Readonly<SimulationState>,
  cmd: ConcludeInterviewCommand
): CommandResult {
  const hi = getHumanIntel(state);
  const session = hi.interviewSessions[cmd.sessionId];

  if (!session || session.status !== 'ACTIVE') {
    return makeFailure(state, 'NO_ACTIVE_DIALOGUE', `Interview session "${cmd.sessionId}" is not active.`);
  }

  if (session.questionsAsked.length === 0) {
    return makeFailure(
      state,
      'INVALID_COMMAND',
      'Cannot conclude an interview without asking at least one question.'
    );
  }

  const updatedSession: InterviewSession = {
    ...session,
    status: 'COMPLETED',
    completedAtSimTime: state.time.simulationTimeSeconds,
    trustAfterInterview: getNpcRelationship(state, session.npcId),
  };

  const flagKey = `m21_interview_completed_${session.npcId}_${session.activityId}`;
  let nextState = applyFlags(state as SimulationState, { [flagKey]: true });
  nextState = withHumanIntel(nextState, {
    ...hi,
    interviewSessions: { ...hi.interviewSessions, [cmd.sessionId]: updatedSession },
  });

  const event = createSimulationEvent(
    'ACTIVITY_COMPLETED',
    state.time.simulationTimeSeconds,
    state.metadata.revision + 1,
    {
      activityId: session.activityId,
      title: `Interview concluded: ${session.npcId}`,
      payoutKobo: 0,
      careerXpEarned: 0,
      score: session.statementsRecorded.length,
    }
  );

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Interview with "${session.npcId}" concluded. ${session.statementsRecorded.length} statements recorded.`,
  };
}

// ============================================================================
// InspectWorldObject
// ============================================================================

export function handleInspectWorldObject(
  state: Readonly<SimulationState>,
  cmd: InspectWorldObjectCommand
): CommandResult {
  const hi = getHumanIntel(state);

  // Check if already inspected
  if (Object.values(hi.observations).some(o => o.objectId === cmd.objectId && o.activityId === cmd.activityId)) {
    return {
      success: true,
      state,
      events: [],
      message: `Object "${cmd.objectId}" has already been observed for activity "${cmd.activityId}".`,
      isNoOp: true,
    };
  }

  // Find the inspectable object template
  const objDef = SCENARIO_C_INSPECTABLE_OBJECTS.find(o => o.id === cmd.objectId) ??
    // Future: other scenarios may add objects here
    null;

  if (!objDef) {
    return makeFailure(state, 'ITEM_NOT_FOUND', `Inspectable object "${cmd.objectId}" not defined in scenario data.`);
  }

  // Check required flag if any
  if (objDef.requiredFlag && !(state as SimulationState).flags[objDef.requiredFlag]) {
    return makeFailure(
      state,
      'DIALOGUE_CONDITION_NOT_MET',
      `Object "${cmd.objectId}" requires flag "${objDef.requiredFlag}" to be set before it can be inspected.`
    );
  }

  const obsId = uid('obs');
  const observation: ObservationRecord = {
    id: obsId,
    recordedAtSimTime: state.time.simulationTimeSeconds,
    ...objDef.observationTemplate,
    activityId: cmd.activityId,
  };

  const nextHi: HumanIntelState = {
    ...hi,
    observations: { ...hi.observations, [obsId]: observation },
  };

  let nextState = applyFlags(state as SimulationState, { [objDef.flagOnExamine]: true });
  nextState = withHumanIntel(nextState, nextHi);

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [],
    message: `Observed: ${objDef.displayName}. ${objDef.examineDescription}`,
  };
}

// ============================================================================
// CompareEvidenceWithTestimony
// ============================================================================

/** Ground-truth comparison verdicts for Scenario A. */
const KNOWN_COMPARISONS: ReadonlyArray<{
  statementId: string;
  technicalEvidenceId: string;
  systemVerdict: ComparisonVerdict;
  systemRationale: string;
}> = [
  {
    statementId: 'q_a_marcus_whereabouts',
    technicalEvidenceId: 'ev_phys_badge_log_tuesday',
    systemVerdict: 'CONTRADICTED',
    systemRationale:
      "Barry denied being in Room 4B after 18:00, but his badge credential is recorded granting access at 19:47. A later explanation (badge lending) qualifies this, but the initial statement is factually contradicted.",
  },
  {
    statementId: 'q_a_amina_saw_marcus',
    technicalEvidenceId: 'ev_phys_badge_log_tuesday',
    systemVerdict: 'CONSISTENT',
    systemRationale:
      'Blessing confirmed Barry left around 18:15. The badge log entry at 19:47 is after this time, which is consistent with the claim — he left the building, but his badge was later used.',
  },
];

export function handleCompareEvidenceWithTestimony(
  state: Readonly<SimulationState>,
  cmd: CompareEvidenceWithTestimonyCommand
): CommandResult {
  const hi = getHumanIntel(state);

  // Verify the statement exists
  const allSessions = Object.values(hi.interviewSessions);
  const statementExists = allSessions.some(s =>
    s.statementsRecorded.some(st => st.statementId === cmd.statementId || st.questionId === cmd.statementId)
  );
  // Also allow questionId as a proxy for statementId lookup
  if (!statementExists) {
    // Tolerate: the statementId here could be a question ID already asked
    const questionAsked = allSessions.some(s => s.questionsAsked.includes(cmd.statementId));
    if (!questionAsked) {
      return makeFailure(
        state,
        'INVALID_ARGUMENT',
        `Statement "${cmd.statementId}" has not been recorded in any interview session for activity "${cmd.activityId}".`
      );
    }
  }

  // Check evidence exists
  const evidenceItem = state.narrative?.evidenceVault[cmd.technicalEvidenceId];
  if (!evidenceItem) {
    return makeFailure(
      state,
      'INSUFFICIENT_EVIDENCE',
      `Evidence "${cmd.technicalEvidenceId}" not found in vault.`
    );
  }

  // Find ground truth
  const groundTruth = KNOWN_COMPARISONS.find(
    c => c.statementId === cmd.statementId && c.technicalEvidenceId === cmd.technicalEvidenceId
  );

  const systemVerdict: ComparisonVerdict = groundTruth?.systemVerdict ?? 'INCONCLUSIVE';
  const systemRationale = groundTruth?.systemRationale ?? 'No ground-truth comparison defined for this pair.';
  const isCorrect = cmd.playerVerdict === systemVerdict;

  const compId = uid('comp');
  const comparison: EvidenceComparisonRecord = {
    id: compId,
    activityId: cmd.activityId,
    statementId: cmd.statementId,
    technicalEvidenceId: cmd.technicalEvidenceId,
    playerVerdict: cmd.playerVerdict,
    playerRationale: cmd.playerRationale,
    systemVerdict,
    systemRationale,
    isCorrect,
    recordedAtSimTime: state.time.simulationTimeSeconds,
  };

  const nextHi: HumanIntelState = {
    ...hi,
    comparisons: { ...hi.comparisons, [compId]: comparison },
  };

  const flagKey = `m21_comparison_made_${cmd.statementId}`;
  let nextState = applyFlags(state as SimulationState, { [flagKey]: true });
  if (isCorrect) nextState = applyFlags(nextState, { m21_comparison_correct: true });
  nextState = withHumanIntel(nextState, nextHi);

  const feedbackPrefix = isCorrect ? '✓ Correct assessment.' : '✗ Assessment differs from ground truth.';
  return {
    success: true,
    state: deepFreeze(nextState),
    events: [],
    message: `${feedbackPrefix} System verdict: ${systemVerdict}. ${systemRationale}`,
  };
}

// ============================================================================
// SubmitM21Conclusion
// ============================================================================

/** Ground truth for Scenario A conclusion. */
const SCENARIO_A_CONCLUSIONS: ReadonlyArray<{
  conclusionId: string;
  systemConclusionType: M21ConclusionType;
  feedbackText: string;
  consequenceFlags: Record<string, boolean | string | number>;
}> = [
  {
    conclusionId: 'conc_a_badge_lending_policy_breach',
    systemConclusionType: 'SUPPORTED',
    feedbackText:
      'The evidence supports this conclusion. Barry admitted to lending his badge — a confirmed policy breach — and the badge log corroborates the timeline. The correct outcome is to document the policy violation and begin a formal review of badge-sharing practices. Barry is not the threat actor, but his actions created an exploitable access control gap.',
    consequenceFlags: { m21a_conclusion_correct: true, m21a_badge_policy_finding_raised: true },
  },
  {
    conclusionId: 'conc_a_marcus_insider_threat',
    systemConclusionType: 'CONTRADICTED',
    feedbackText:
      'This conclusion is not supported by the available evidence. Barry admitted to a procedural violation (badge lending), not a deliberate insider attack. The evidence shows negligence and policy non-compliance, not malicious intent. Premature accusations without adequate evidence would damage a professional relationship and potentially expose Cedarline to an unjustified HR action.',
    consequenceFlags: { m21a_premature_accusation: true },
  },
];

export function handleSubmitM21Conclusion(
  state: Readonly<SimulationState>,
  cmd: SubmitM21ConclusionCommand
): CommandResult {
  const hi = getHumanIntel(state);

  if (hi.conclusions[cmd.conclusionId]) {
    return makeFailure(
      state,
      'INVALID_COMMAND',
      `Conclusion "${cmd.conclusionId}" has already been submitted.`
    );
  }

  // Require at least one statement and one evidence item
  if (cmd.supportingStatementIds.length === 0 && cmd.supportingEvidenceIds.length === 0) {
    return makeFailure(
      state,
      'INSUFFICIENT_EVIDENCE',
      'A conclusion requires at least one supporting statement or evidence item.'
    );
  }

  const groundTruth = SCENARIO_A_CONCLUSIONS.find(c => c.conclusionId === cmd.conclusionId);
  const systemConclusionType: M21ConclusionType = groundTruth?.systemConclusionType ?? 'INCONCLUSIVE';
  const isCorrect = cmd.playerConclusionType === systemConclusionType;
  const feedbackText = groundTruth?.feedbackText ??
    'Your conclusion has been recorded. Review the evidence and testimony again to refine your assessment.';

  const conclusion: M21InvestigativeConclusion = {
    id: cmd.conclusionId,
    activityId: cmd.activityId,
    title: cmd.hypothesisText.slice(0, 80),
    hypothesisText: cmd.hypothesisText,
    supportingStatementIds: cmd.supportingStatementIds,
    supportingEvidenceIds: cmd.supportingEvidenceIds,
    contradictingStatementIds: cmd.contradictingStatementIds,
    playerConclusionType: cmd.playerConclusionType,
    systemConclusionType,
    isCorrect,
    feedbackText,
    submittedAtSimTime: state.time.simulationTimeSeconds,
    consequenceFlags: groundTruth?.consequenceFlags ?? {},
  };

  const nextHi: HumanIntelState = {
    ...hi,
    conclusions: { ...hi.conclusions, [cmd.conclusionId]: conclusion },
  };

  let nextState = withHumanIntel(state as SimulationState, nextHi);
  if (groundTruth?.consequenceFlags) {
    nextState = applyFlags(nextState, groundTruth.consequenceFlags as Record<string, boolean | string | number>);
  }
  nextState = applyFlags(nextState, {
    [`m21_conclusion_submitted_${cmd.activityId}`]: true,
    m21a_conclusion_submitted: true,
  });

  const event = createSimulationEvent(
    'ACTIVITY_COMPLETED',
    state.time.simulationTimeSeconds,
    state.metadata.revision + 1,
    {
      activityId: cmd.activityId,
      title: `Conclusion: ${cmd.conclusionId}`,
      payoutKobo: 0,
      careerXpEarned: 0,
      score: isCorrect ? 100 : 50,
    }
  );

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Conclusion submitted. ${isCorrect ? '✓ Correct.' : '✗ Reconsidering recommended.'} ${feedbackText.slice(0, 120)}`,
  };
}

// ============================================================================
// EvaluateSocEngDecision (Scenario B)
// ============================================================================

export function handleEvaluateSocEngDecision(
  state: Readonly<SimulationState>,
  cmd: EvaluateSocEngDecisionCommand
): CommandResult {
  const hi = getHumanIntel(state);

  if (hi.socEngEvaluations[cmd.activityId]) {
    return makeFailure(
      state,
      'INVALID_COMMAND',
      `Social-engineering scenario for activity "${cmd.activityId}" has already been evaluated.`
    );
  }

  const decisionDef = SCENARIO_B_DECISIONS.find(d => d.decision === cmd.playerDecision);
  if (!decisionDef) {
    return makeFailure(state, 'INVALID_ARGUMENT', `Unknown social-engineering decision: "${String(cmd.playerDecision)}"`);
  }

  const evalId = uid('soceng');
  const evaluation: SocEngScenarioEvaluation = {
    evaluationId: evalId,
    activityId: cmd.activityId,
    scenarioId: cmd.scenarioId,
    playerDecision: cmd.playerDecision,
    outcomeRating: decisionDef.outcomeRating,
    feedbackText: decisionDef.feedbackText,
    consequenceFlags: decisionDef.consequenceFlags,
    reputationDelta: decisionDef.reputationDelta,
    evaluatedAtSimTime: state.time.simulationTimeSeconds,
  };

  const nextHi: HumanIntelState = {
    ...hi,
    socEngEvaluations: { ...hi.socEngEvaluations, [cmd.activityId]: evaluation },
  };

  let nextState = withHumanIntel(state as SimulationState, nextHi);
  nextState = applyFlags(nextState, {
    ...(decisionDef.consequenceFlags as Record<string, boolean | string | number>),
    m21b_decision_made: true,
    [`m21b_outcome_${decisionDef.outcomeRating.toLowerCase()}`]: true,
  });

  // Apply reputation if bountyHub available
  if (nextState.bountyHub && (decisionDef.reputationDelta as number) !== 0) {
    const bh = nextState.bountyHub;
    nextState = {
      ...nextState,
      bountyHub: {
        ...bh,
        reputation: {
          ...bh.reputation,
          score: Math.max(0, bh.reputation.score + decisionDef.reputationDelta),
        },
      },
    };
  }

  const event = createSimulationEvent(
    'ACTIVITY_COMPLETED',
    state.time.simulationTimeSeconds,
    state.metadata.revision + 1,
    {
      activityId: cmd.activityId,
      title: `SocEng Decision: ${cmd.scenarioId}`,
      payoutKobo: 0,
      careerXpEarned: 0,
      score: (['EXCELLENT', 'GOOD'].includes(decisionDef.outcomeRating)) ? 100 : 0,
    }
  );

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `${decisionDef.outcomeRating}: ${decisionDef.feedbackText.slice(0, 120)}`,
  };
}

// ============================================================================
// RaiseAssessmentFinding (Scenario C)
// ============================================================================

export function handleRaiseAssessmentFinding(
  state: Readonly<SimulationState>,
  cmd: RaiseAssessmentFindingCommand
): CommandResult {
  const hi = getHumanIntel(state);

  // Must have at least one linked observation
  if (cmd.linkedObservationIds.length === 0) {
    return makeFailure(
      state,
      'INVALID_ARGUMENT',
      'An assessment finding must be linked to at least one observation. Inspect the relevant objects first.'
    );
  }

  // Verify observations exist
  for (const obsId of cmd.linkedObservationIds) {
    if (!hi.observations[obsId]) {
      return makeFailure(
        state,
        'ITEM_NOT_FOUND',
        `Linked observation "${obsId}" not found. It must be recorded before raising a finding.`
      );
    }
  }

  const findingId = uid('finding');
  const finding: PhysicalAssessmentFinding = {
    findingId,
    activityId: cmd.activityId,
    facilityId: cmd.facilityId,
    roomId: cmd.roomId,
    category: cmd.category,
    severity: cmd.severity,
    title: cmd.title,
    observationSummary: cmd.observationSummary,
    policyReference: cmd.policyReference,
    remediationRecommendation: cmd.remediationRecommendation,
    linkedObservationIds: cmd.linkedObservationIds,
    raisedAtSimTime: state.time.simulationTimeSeconds,
    isVerified: cmd.linkedObservationIds.length >= 1,
  };

  const nextHi: HumanIntelState = {
    ...hi,
    assessmentFindings: { ...hi.assessmentFindings, [findingId]: finding },
  };

  let nextState = withHumanIntel(state as SimulationState, nextHi);
  nextState = applyFlags(nextState, {
    [`m21_finding_raised_${cmd.category}`]: true,
    m21c_finding_raised: true,
  });

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [],
    message: `Assessment finding raised: [${cmd.severity}] ${cmd.title} (ID: ${findingId})`,
  };
}

// ============================================================================
// SubmitPhysicalAssessmentReport (Scenario C)
// ============================================================================

export function handleSubmitPhysicalAssessmentReport(
  state: Readonly<SimulationState>,
  cmd: SubmitPhysicalAssessmentReportCommand
): CommandResult {
  const hi = getHumanIntel(state);

  // Must have at least 2 findings
  const activityFindings = Object.values(hi.assessmentFindings).filter(
    f => f.activityId === cmd.activityId
  );
  if (activityFindings.length < 2) {
    return makeFailure(
      state,
      'INVALID_ARGUMENT',
      `A physical assessment report requires at least 2 recorded findings (currently ${activityFindings.length}).`
    );
  }

  // Already submitted?
  const existingReport = Object.values(hi.assessmentReports).find(r => r.activityId === cmd.activityId);
  if (existingReport) {
    return makeFailure(
      state,
      'INVALID_COMMAND',
      `Assessment report for activity "${cmd.activityId}" has already been submitted.`
    );
  }

  // Determine overall risk from finding severities
  const severityRanks: Record<string, number> = {
    CRITICAL: 5, HIGH: 4, MEDIUM: 3, LOW: 2, INFORMATIONAL: 1,
  };
  const highestSeverity: FindingSeverity = activityFindings.reduce<FindingSeverity>((max, f) => {
    return (severityRanks[f.severity] ?? 0) > (severityRanks[max] ?? 0) ? f.severity : max;
  }, 'INFORMATIONAL');

  // Evaluate how many expected findings the player caught
  const matchedExpected = SCENARIO_C_EXPECTED_FINDINGS.filter(ef =>
    activityFindings.some(f =>
      f.category === ef.category ||
      f.title.toLowerCase().includes((ef.title.toLowerCase().split(':')[0] ?? '').toLowerCase())
    )
  ).length;
  const completionRatio = matchedExpected / SCENARIO_C_EXPECTED_FINDINGS.length;
  let clientFeedback: string;
  if (completionRatio >= 0.75) {
    clientFeedback = `Excellent assessment. ${matchedExpected} of ${SCENARIO_C_EXPECTED_FINDINGS.length} key issues identified. Remediation plan accepted by Cedarline Facilities Management.`;
  } else if (completionRatio >= 0.5) {
    clientFeedback = `Good assessment. ${matchedExpected} of ${SCENARIO_C_EXPECTED_FINDINGS.length} key issues identified. Some gaps remain — a follow-up review is recommended.`;
  } else {
    clientFeedback = `Partial assessment. Only ${matchedExpected} of ${SCENARIO_C_EXPECTED_FINDINGS.length} key issues were captured. A more thorough inspection is recommended before remediation begins.`;
  }

  const reportId = uid('report');
  const report: PhysicalAssessmentReport = {
    reportId,
    activityId: cmd.activityId,
    facilityId: cmd.facilityId,
    assessorName: state.player.name,
    scope: cmd.scope,
    authorizationReference: cmd.authorizationReference,
    findings: activityFindings,
    executiveSummary: cmd.executiveSummary,
    overallRiskRating: highestSeverity,
    submittedAtSimTime: state.time.simulationTimeSeconds,
    clientFeedback,
  };

  const nextHi: HumanIntelState = {
    ...hi,
    assessmentReports: { ...hi.assessmentReports, [reportId]: report },
  };

  let nextState = withHumanIntel(state as SimulationState, nextHi);
  nextState = applyFlags(nextState, {
    m21c_report_submitted: true,
    m21c_findings_count: activityFindings.length,
    m21c_completion_ratio: completionRatio,
  });

  const event = createSimulationEvent(
    'ACTIVITY_COMPLETED',
    state.time.simulationTimeSeconds,
    state.metadata.revision + 1,
    {
      activityId: cmd.activityId,
      title: `Physical Assessment Report: ${cmd.facilityId}`,
      payoutKobo: 0,
      careerXpEarned: 0,
      score: Math.round(completionRatio * 100),
    }
  );

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Physical assessment report submitted (${activityFindings.length} findings, risk: ${highestSeverity}). ${clientFeedback}`,
  };
}
