/**
 * Cyberlife — Milestone 17: Red Team Assessment Simulation Command Handlers
 *
 * Implements pure state transition functions for Red Team commands.
 * Connects directly to the authoritative SimulationState and commandHandler dispatch.
 */

import { SimulationState } from '../../core/types';
import { CommandResult } from '../../commands/types';
import { createSimulationEvent } from '../../events/eventFactory';
import { deepFreeze } from '../../core/stateUtils';
import { validateSimulationState } from '../../core/invariants';
import { RedTeamEngine } from './redTeamEngine';
import {
  RedTeamAssessmentState,
  RedTeamReportSubmission,
  RedTeamEvidenceItem,
} from './types';
import { SimulationEvent } from '../../events/types';

export interface AcceptRulesOfEngagementCommand {
  readonly type: 'AcceptRulesOfEngagement';
  readonly assessmentId?: string;
  readonly assessorSignature?: string;
}

export interface ExecuteRedTeamActionCommand {
  readonly type: 'ExecuteRedTeamAction';
  readonly targetId: string;
  readonly toolId: string;
}

export interface ValidateVulnerabilityFindingCommand {
  readonly type: 'ValidateVulnerabilityFinding';
  readonly findingId: string;
  readonly decision: 'VALIDATE' | 'REJECT' | 'MARK_UNRESOLVED';
  readonly rationale: string;
}

export interface RecordRedTeamAnalystNoteCommand {
  readonly type: 'RecordRedTeamAnalystNote';
  readonly title: string;
  readonly content: string;
  readonly category: 'SCOPE' | 'OBSERVATION' | 'FINDING' | 'REMEDIATION';
  readonly linkedTargetId?: string;
  readonly linkedFindingId?: string;
}

export interface PreserveRedTeamEvidenceCommand {
  readonly type: 'PreserveRedTeamEvidence';
  readonly evidenceItem: RedTeamEvidenceItem;
}

export interface SubmitAssessmentReportCommand {
  readonly type: 'SubmitAssessmentReport';
  readonly submission: RedTeamReportSubmission;
}

/**
 * Helper to update objective status within redTeamAssessment state
 */
function updateObjective(
  state: RedTeamAssessmentState,
  requiredAction: string,
  simTime: number
): RedTeamAssessmentState {
  const objectives = state.objectives.map(obj => {
    if (obj.requiredAction === requiredAction && !obj.isCompleted) {
      return {
        ...obj,
        isCompleted: true,
        completedAtSimTime: simTime,
      };
    }
    return obj;
  });

  return {
    ...state,
    objectives,
  };
}

/**
 * Handles AcceptRulesOfEngagement command
 */
export function handleAcceptRulesOfEngagement(
  currentState: SimulationState,
  command: AcceptRulesOfEngagementCommand
): CommandResult {
  const assessment = currentState.redTeamAssessment;
  if (!assessment) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'INVALID_COMMAND',
      message: 'Red Team assessment state is not initialized in simulation.',
    };
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const signature = command.assessorSignature || assessment.roe.authorizedAssessorName;

  const updatedRoe = {
    ...assessment.roe,
    playerAcceptedAtSimTime: simTime,
  };

  let updatedAssessment: RedTeamAssessmentState = {
    ...assessment,
    roe: updatedRoe,
    isAcceptedByPlayer: true,
    acceptedAtSimTime: simTime,
    activePhase: 'RECON_DISCOVERY',
    auditLog: [
      ...assessment.auditLog,
      {
        id: `audit-accept-${Date.now()}`,
        timestampSimTime: simTime,
        actor: signature,
        action: 'ACTION_COMPLETED',
        target: assessment.roe.assessmentId,
        status: 'ACTION_COMPLETED',
        details: `Assessor formally accepted and signed Rules of Engagement (RoE) under ${assessment.roe.legalFramework}.`,
      },
    ],
  };

  updatedAssessment = updateObjective(updatedAssessment, 'ACCEPT_ROE', simTime);

  const nextRevision = currentState.metadata.revision + 1;
  const event: SimulationEvent = createSimulationEvent(
    'RED_TEAM_ROE_ACCEPTED',
    simTime,
    nextRevision,
    {
      assessmentId: assessment.roe.assessmentId,
      acceptedAt: simTime,
      assessorSignature: signature,
    }
  );

  const nextFlags = {
    ...currentState.flags,
    redteam_assessment_accepted: true,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    flags: nextFlags,
    redTeamAssessment: updatedAssessment,
  };

  validateSimulationState(nextState);

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Rules of Engagement for ${assessment.roe.assessmentId} accepted. Technical assessment authorized.`,
  };
}

/**
 * Handles ExecuteRedTeamAction command
 */
export function handleExecuteRedTeamAction(
  currentState: SimulationState,
  command: ExecuteRedTeamActionCommand
): CommandResult {
  const assessment = currentState.redTeamAssessment;
  if (!assessment) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'INVALID_COMMAND',
      message: 'Red Team assessment state is not initialized.',
    };
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const { targetId, toolId } = command;

  // Run the domain engine action
  const actionResult = RedTeamEngine.executeToolAction(assessment, {
    targetId,
    toolId,
    currentSimTime: simTime,
    actorName: currentState.player.name,
  });

  const nextRevision = currentState.metadata.revision + 1;

  // Build audit entry
  const auditEntry = {
    id: `audit-act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestampSimTime: simTime,
    actor: currentState.player.name,
    action: `EXECUTE_${actionResult.category}`,
    target: targetId,
    status: actionResult.scopeEvaluation.decision,
    details: `${actionResult.toolName} on ${targetId}: ${actionResult.status}. ${actionResult.observations[0] ?? ''}`,
  };

  // Build updated assessment state
  let nextAssessment: RedTeamAssessmentState = {
    ...assessment,
    executedActionIds: actionResult.status !== 'BLOCKED'
      ? [...assessment.executedActionIds, actionResult.actionId]
      : assessment.executedActionIds,
    actionHistory: actionResult.status !== 'BLOCKED'
      ? [...assessment.actionHistory, actionResult]
      : assessment.actionHistory,
    auditLog: [...assessment.auditLog, auditEntry],
  };

  // If evidence was generated, store in evidenceVault
  if (actionResult.generatedEvidence) {
    nextAssessment = {
      ...nextAssessment,
      evidenceVault: [...nextAssessment.evidenceVault, actionResult.generatedEvidence],
    };
  }

  // Update objectives if successful
  if (actionResult.status === 'SUCCESS' || actionResult.status === 'DEFENSE_PREVENTED') {
    if (actionResult.category === 'RECONNAISSANCE') {
      nextAssessment = updateObjective(nextAssessment, 'RUN_RECONNAISSANCE', simTime);
      nextAssessment = { ...nextAssessment, activePhase: 'TARGET_ASSESSMENT' };
    }
    if (toolId === 'tool-config-smb-audit' && targetId === 'filesrv-01') {
      nextAssessment = updateObjective(nextAssessment, 'AUDIT_SERVICE_CONFIG', simTime);
    }
    if (toolId === 'tool-web-api-idor' && targetId === 'app-portal-01') {
      nextAssessment = updateObjective(nextAssessment, 'ASSESS_WEB_APPLICATION', simTime);
    }
    if (toolId === 'tool-auth-header-spoof' && targetId === 'api-gw-01') {
      nextAssessment = updateObjective(nextAssessment, 'EVALUATE_AUTH_ACCESS_CONTROL', simTime);
    }
  }

  const event = createSimulationEvent(
    'RED_TEAM_ACTION_EXECUTED',
    simTime,
    nextRevision,
    {
      actionId: actionResult.actionId,
      targetId,
      toolId,
      status: actionResult.status,
      decision: actionResult.scopeEvaluation.decision,
    }
  );

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    redTeamAssessment: nextAssessment,
  };

  validateSimulationState(nextState);

  return {
    success: actionResult.status !== 'BLOCKED',
    state: deepFreeze(nextState),
    events: [event],
    message: actionResult.observations[0] || `Executed ${toolId} on ${targetId}: ${actionResult.status}`,
  };
}

/**
 * Handles ValidateVulnerabilityFinding command
 */
export function handleValidateVulnerabilityFinding(
  currentState: SimulationState,
  command: ValidateVulnerabilityFindingCommand
): CommandResult {
  const assessment = currentState.redTeamAssessment;
  if (!assessment) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'INVALID_COMMAND',
      message: 'Red Team assessment state is not initialized.',
    };
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const { findingId, decision, rationale } = command;

  let nextAssessment = RedTeamEngine.validateFinding(
    assessment,
    findingId,
    decision,
    rationale,
    simTime,
    currentState.player.name
  );

  // Objective checks:
  // If player rejected the false positive VULN-CEDAR-004
  if (findingId === 'VULN-CEDAR-004' && decision === 'REJECT') {
    nextAssessment = updateObjective(nextAssessment, 'REJECT_BENIGN_FALSE_POSITIVE', simTime);
  }

  // Check if all 3 true positives are validated
  const truePositives = ['VULN-CEDAR-001', 'VULN-CEDAR-002', 'VULN-CEDAR-003'];
  const allValidated = truePositives.every(id => {
    const f = nextAssessment.findings.find(item => item.id === id);
    return f?.status === 'VALIDATED';
  });

  if (allValidated) {
    nextAssessment = updateObjective(nextAssessment, 'VALIDATE_TRUE_FINDINGS', simTime);
    nextAssessment = { ...nextAssessment, activePhase: 'FINDING_VALIDATION' };
  }

  const nextRevision = currentState.metadata.revision + 1;
  const event: SimulationEvent = createSimulationEvent(
    'RED_TEAM_FINDING_VALIDATED',
    simTime,
    nextRevision,
    {
      findingId,
      decision,
      rationale,
    }
  );

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    redTeamAssessment: nextAssessment,
  };

  validateSimulationState(nextState);

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Finding ${findingId} updated to ${decision}.`,
  };
}

/**
 * Handles PreserveRedTeamEvidence command
 */
export function handlePreserveRedTeamEvidence(
  currentState: SimulationState,
  command: PreserveRedTeamEvidenceCommand
): CommandResult {
  const assessment = currentState.redTeamAssessment;
  if (!assessment) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'INVALID_COMMAND',
      message: 'Red Team assessment state is not initialized.',
    };
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const { evidenceItem } = command;

  // Add evidence to vault if not already present
  const exists = assessment.evidenceVault.some(e => e.id === evidenceItem.id);
  const nextVault = exists ? assessment.evidenceVault : [...assessment.evidenceVault, evidenceItem];

  let nextAssessment: RedTeamAssessmentState = {
    ...assessment,
    evidenceVault: nextVault,
  };

  nextAssessment = updateObjective(nextAssessment, 'PRESERVE_CRYPTOGRAPHIC_EVIDENCE', simTime);

  const nextRevision = currentState.metadata.revision + 1;
  const event: SimulationEvent = createSimulationEvent(
    'RED_TEAM_EVIDENCE_PRESERVED',
    simTime,
    nextRevision,
    {
      evidenceId: evidenceItem.id,
      hashSha256: evidenceItem.hashSha256,
      targetId: evidenceItem.targetId,
    }
  );

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    redTeamAssessment: nextAssessment,
  };

  validateSimulationState(nextState);

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Preserved cryptographic evidence ${evidenceItem.id} (SHA-256: ${evidenceItem.hashSha256.slice(0, 16)}...).`,
  };
}

/**
 * Handles RecordRedTeamAnalystNote command
 */
export function handleRecordRedTeamAnalystNote(
  currentState: SimulationState,
  command: RecordRedTeamAnalystNoteCommand
): CommandResult {
  const assessment = currentState.redTeamAssessment;
  if (!assessment) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'INVALID_COMMAND',
      message: 'Red Team assessment state is not initialized.',
    };
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const note = {
    id: `note-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestampSimTime: simTime,
    title: command.title,
    content: command.content,
    category: command.category,
    linkedTargetId: command.linkedTargetId,
    linkedFindingId: command.linkedFindingId,
  };

  const nextAssessment: RedTeamAssessmentState = {
    ...assessment,
    analystNotes: [...assessment.analystNotes, note],
  };

  const nextRevision = currentState.metadata.revision + 1;
  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    redTeamAssessment: nextAssessment,
  };

  validateSimulationState(nextState);

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [],
    message: `Analyst note "${note.title}" recorded in assessment workspace.`,
  };
}

/**
 * Handles SubmitAssessmentReport command
 */
export function handleSubmitAssessmentReport(
  currentState: SimulationState,
  command: SubmitAssessmentReportCommand
): CommandResult {
  const assessment = currentState.redTeamAssessment;
  if (!assessment) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'INVALID_COMMAND',
      message: 'Red Team assessment state is not initialized.',
    };
  }

  const simTime = currentState.time.simulationTimeSeconds;
  const { submission } = command;

  // Run authoritative evaluator
  const evaluationResult = RedTeamEngine.evaluateReportSubmission(submission, assessment);

  let nextAssessment: RedTeamAssessmentState = {
    ...assessment,
    reportSubmission: submission,
    evaluationResult,
    activePhase: evaluationResult.isApproved ? 'COMPLETED' : 'REPORT_GENERATION',
  };

  if (evaluationResult.isApproved) {
    nextAssessment = updateObjective(nextAssessment, 'SUBMIT_ASSESSMENT_REPORT', simTime);
  }

  const nextRevision = currentState.metadata.revision + 1;
  const event: SimulationEvent = createSimulationEvent(
    'RED_TEAM_REPORT_SUBMITTED',
    simTime,
    nextRevision,
    {
      assessmentId: submission.assessmentId,
      isApproved: evaluationResult.isApproved,
      scorePercentage: evaluationResult.scorePercentage,
    }
  );

  const nextFlags = {
    ...currentState.flags,
    redteam_assessment_completed: evaluationResult.isApproved,
    redteam_report_approved: evaluationResult.isApproved,
    redteam_score: evaluationResult.scorePercentage,
  };

  // Award player career XP on approved completion
  const nextCareer = currentState.career
    ? {
        ...currentState.career,
        xp: currentState.career.xp + (evaluationResult.isApproved ? 500 : 50),
      }
    : undefined;

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    flags: nextFlags,
    career: nextCareer,
    redTeamAssessment: nextAssessment,
  };

  validateSimulationState(nextState);

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: evaluationResult.feedbackSummary,
  };
}
