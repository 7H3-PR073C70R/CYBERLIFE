/**
 * Cyberlife — Milestone 21: Human Intelligence, Social Investigation
 * & Physical Security Assessment — Unit Tests
 *
 * Verifies three complete end-to-end playable scenarios:
 *
 *  Scenario A — The Server Room Discrepancy
 *   - Interview initiation injects Scenario A evidence into vault
 *   - Multiple interview questions unlocked by flags
 *   - Testimony vs badge-log comparison
 *   - Investigative conclusion submission and ground-truth evaluation
 *   - Activity Director objective sync via M21HumanIntelAdapter
 *
 *  Scenario B — Unusual Vendor Access Request
 *   - Social-engineering awareness scenario
 *   - Correct (verification + deny) and poor (approve without check) decisions
 *   - Reputation impact applied to bountyHub
 *   - Activity objective sync
 *
 *  Scenario C — Cedarline Visitor Management Audit
 *   - World object inspection recording observations
 *   - Assessment finding raising (linked to observations)
 *   - Report submission with completion ratio
 *   - Activity objective sync
 *
 *  Cross-cutting invariants
 *   - All command handlers return valid SimulationState (no undefined)
 *   - humanIntel slice is initialized in initial state
 *   - M21 activities appear in the AUTHORED_ACTIVITIES catalogue
 *   - Re-using a completed interview session is blocked
 *   - Prerequisite gates prevent Scenario C without Scenario A
 *   - All M21 command types are accepted by the main commandHandler dispatch
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createInitialSimulationState } from '@/simulation/core/initialState';
import { handleCommand } from '@/simulation/commands/commandHandler';
import { AUTHORED_ACTIVITIES } from '@/simulation/activities/activityCatalogue';
import { M21_INTERVIEW_QUESTIONS, SCENARIO_B_DECISIONS, SCENARIO_C_INSPECTABLE_OBJECTS } from '@/simulation/humanIntel/scenarioData';
import {
  handleStartInterview,
  handleAskInterviewQuestion,
  handleConcludeInterview,
  handleCompareEvidenceWithTestimony,
  handleSubmitM21Conclusion,
  handleEvaluateSocEngDecision,
  handleInspectWorldObject,
  handleRaiseAssessmentFinding,
  handleSubmitPhysicalAssessmentReport,
  handlePresentEvidenceToNpc,
} from '@/simulation/humanIntel/humanIntelCommandHandler';
import { syncAllActivitiesWithAdapters } from '@/simulation/activities/activityCommandHandler';
import { evaluatePrerequisites } from '@/simulation/activities/activityDirectorEngine';
import type { SimulationState } from '@/simulation/core/types';

// ============================================================================
// Helpers
// ============================================================================

function baseState(extraFlags: Record<string, boolean | string | number> = {}): SimulationState {
  return createInitialSimulationState({
    flags: {
      apartment_door_unlocked: true,
      has_read_community_noticeboard: false,
      mission_aster_active: true,
      mission_aster_phase: 'briefing',
      m21_humint_unlocked: true,
      ...extraFlags,
    },
  }) as SimulationState;
}

// ============================================================================
// CATALOGUE & INITIAL STATE VALIDATION
// ============================================================================

describe('M21: Catalogue & Initial State', () => {
  it('defines all three M21 activities in AUTHORED_ACTIVITIES', () => {
    expect(AUTHORED_ACTIVITIES['act_m21_conflicting_accounts']).toBeDefined();
    expect(AUTHORED_ACTIVITIES['act_m21_vendor_request']).toBeDefined();
    expect(AUTHORED_ACTIVITIES['act_m21_facility_audit']).toBeDefined();
  });

  it('Scenario A has 5 objectives (4 mandatory, none optional)', () => {
    const def = AUTHORED_ACTIVITIES['act_m21_conflicting_accounts']!;
    expect(def.objectives).toHaveLength(5);
    expect(def.objectives.every(o => !o.isOptional)).toBe(true);
  });

  it('Scenario B has 3 objectives (2 mandatory, 1 optional SOC-report)', () => {
    const def = AUTHORED_ACTIVITIES['act_m21_vendor_request']!;
    expect(def.objectives).toHaveLength(3);
    const optional = def.objectives.filter(o => o.isOptional);
    expect(optional).toHaveLength(1);
    expect(optional[0]!.id).toBe('obj_m21b_report_soc');
  });

  it('Scenario C requires completion of Scenario A', () => {
    const def = AUTHORED_ACTIVITIES['act_m21_facility_audit']!;
    expect(def.prerequisites.completedActivityIds).toContain('act_m21_conflicting_accounts');
  });

  it('Scenario C has a 4-hour deadline', () => {
    const def = AUTHORED_ACTIVITIES['act_m21_facility_audit']!;
    expect(def.deadlineDurationSeconds).toBe(14400);
  });

  it('initial state has humanIntel slice initialized', () => {
    const state = baseState();
    expect(state.humanIntel).toBeDefined();
    expect(state.humanIntel!.interviewSessions).toEqual({});
    expect(state.humanIntel!.observations).toEqual({});
    expect(state.humanIntel!.assessmentFindings).toEqual({});
  });

  it('initial state has all three M21 activities in the activity director', () => {
    const state = baseState();
    const activities = state.activityDirector!.activities;
    expect(activities['act_m21_conflicting_accounts']).toBeDefined();
    expect(activities['act_m21_vendor_request']).toBeDefined();
    expect(activities['act_m21_facility_audit']).toBeDefined();
  });

  it('M21 interview questions are defined for both Scenario A NPCs', () => {
    const marcusQs = M21_INTERVIEW_QUESTIONS.filter(q => q.targetNpcId === 'npc_marcus');
    const aminaQs = M21_INTERVIEW_QUESTIONS.filter(q => q.targetNpcId === 'npc_amina');
    expect(marcusQs.length).toBeGreaterThanOrEqual(3);
    expect(aminaQs.length).toBeGreaterThanOrEqual(2);
  });

  it('Scenario C defines 5 inspectable world objects', () => {
    expect(SCENARIO_C_INSPECTABLE_OBJECTS).toHaveLength(5);
    const ids = SCENARIO_C_INSPECTABLE_OBJECTS.map(o => o.id);
    expect(ids).toContain('obj_visitor_sign_in_sheet');
    expect(ids).toContain('obj_badge_printer_unattended');
    expect(ids).toContain('obj_tailgate_door_propped');
    expect(ids).toContain('obj_cctv_blind_spot');
    expect(ids).toContain('obj_escort_policy_poster');
  });
});

// ============================================================================
// REACHABILITY — gate flags must be set by real gameplay, not test fixtures
// ============================================================================

describe('M21: Reachability from normal gameplay', () => {
  it('M21 A/B are locked before the Aster Incident is completed', () => {
    const fresh = createInitialSimulationState() as SimulationState;
    expect(fresh.flags['m21_humint_unlocked']).toBeFalsy();
    expect(evaluatePrerequisites(AUTHORED_ACTIVITIES['act_m21_conflicting_accounts']!, fresh).eligible).toBe(false);
    expect(evaluatePrerequisites(AUTHORED_ACTIVITIES['act_m21_vendor_request']!, fresh).eligible).toBe(false);
  });

  it('completing the Aster Incident sets the M21 unlock flag', () => {
    const reward = AUTHORED_ACTIVITIES['act_story_aster_investigation']!.reward;
    expect(reward.flagsToSet?.['m21_humint_unlocked']).toBe(true);
  });

  it('M21 A/B become eligible once the Aster reward flags are applied', () => {
    const fresh = createInitialSimulationState() as SimulationState;
    const unlocked = {
      ...fresh,
      flags: { ...fresh.flags, ...AUTHORED_ACTIVITIES['act_story_aster_investigation']!.reward.flagsToSet },
    } as SimulationState;
    expect(evaluatePrerequisites(AUTHORED_ACTIVITIES['act_m21_conflicting_accounts']!, unlocked).eligible).toBe(true);
    expect(evaluatePrerequisites(AUTHORED_ACTIVITIES['act_m21_vendor_request']!, unlocked).eligible).toBe(true);
  });

  it('every requiredFlags gate on M21 interview questions is set by some M21 code path', () => {
    const settable = new Set<string>(['m21a_badge_log_reviewed']);
    for (const q of M21_INTERVIEW_QUESTIONS) {
      for (const f of Object.keys(q.flagsToSet ?? {})) settable.add(f);
    }
    for (const q of M21_INTERVIEW_QUESTIONS) {
      for (const f of Object.keys(q.requiredFlags ?? {})) {
        expect(settable.has(f), `flag "${f}" required by ${q.id} is never set`).toBe(true);
      }
    }
  });
});

// ============================================================================
// SCENARIO A — The Server Room Discrepancy
// ============================================================================

describe('M21 Scenario A: Conflicting Accounts', () => {
  let state: SimulationState;

  beforeEach(() => {
    state = baseState();
  });

  it('StartInterview with npc_marcus succeeds and creates a session', () => {
    const result = handleStartInterview(state, {
      type: 'StartInterview',
      npcId: 'npc_marcus',
      activityId: 'act_m21_conflicting_accounts',
    });
    expect(result.success).toBe(true);
    const hi = result.state.humanIntel!;
    const sessions = Object.values(hi.interviewSessions);
    expect(sessions).toHaveLength(1);
    expect(sessions[0]!.npcId).toBe('npc_marcus');
    expect(sessions[0]!.status).toBe('ACTIVE');
  });

  it('StartInterview injects badge-log evidence into narrative vault', () => {
    const result = handleStartInterview(state, {
      type: 'StartInterview',
      npcId: 'npc_marcus',
      activityId: 'act_m21_conflicting_accounts',
    });
    const vault = result.state.narrative?.evidenceVault ?? {};
    expect(vault['ev_phys_badge_log_tuesday']).toBeDefined();
    expect(vault['ev_phys_badge_log_tuesday']!.title).toContain('Badge Access Log');
  });

  it('Starting a second interview with same NPC + activityId is blocked', () => {
    const r1 = handleStartInterview(state, {
      type: 'StartInterview',
      npcId: 'npc_marcus',
      activityId: 'act_m21_conflicting_accounts',
    });
    const r2 = handleStartInterview(r1.state as SimulationState, {
      type: 'StartInterview',
      npcId: 'npc_marcus',
      activityId: 'act_m21_conflicting_accounts',
    });
    expect(r2.success).toBe(false);
    expect(r2.errorCode).toBe('INVALID_COMMAND');
  });

  it('Asking q_a_marcus_whereabouts sets alibi flag and records statement', () => {
    const r1 = handleStartInterview(state, {
      type: 'StartInterview',
      npcId: 'npc_marcus',
      activityId: 'act_m21_conflicting_accounts',
    });
    const sessionId = Object.keys(r1.state.humanIntel!.interviewSessions)[0]!;

    const r2 = handleAskInterviewQuestion(r1.state as SimulationState, {
      type: 'AskInterviewQuestion',
      sessionId,
      questionId: 'q_a_marcus_whereabouts',
    });

    expect(r2.success).toBe(true);
    expect(r2.state.flags['m21a_marcus_alibi_claimed']).toBe(true);
    const session = r2.state.humanIntel!.interviewSessions[sessionId]!;
    expect(session.statementsRecorded).toHaveLength(1);
    expect(session.statementsRecorded[0]!.claimedFact).toContain('NOT in the server room');
    expect(session.statementsRecorded[0]!.potentialContradiction).toBe('contradicts_marcus_badge_log');
  });

  it('Asking a question that requires a flag without the flag is blocked', () => {
    const r1 = handleStartInterview(state, {
      type: 'StartInterview',
      npcId: 'npc_marcus',
      activityId: 'act_m21_conflicting_accounts',
    });
    const sessionId = Object.keys(r1.state.humanIntel!.interviewSessions)[0]!;

    // q_a_marcus_badge requires m21a_marcus_alibi_claimed AND m21a_badge_log_reviewed — not set yet
    const r2 = handleAskInterviewQuestion(r1.state as SimulationState, {
      type: 'AskInterviewQuestion',
      sessionId,
      questionId: 'q_a_marcus_badge',
    });
    expect(r2.success).toBe(false);
    expect(r2.errorCode).toBe('DIALOGUE_CONDITION_NOT_MET');
  });

  it('Asking q_a_marcus_badge after prerequisites reveals Femi lead', () => {
    let s = handleStartInterview(state, {
      type: 'StartInterview', npcId: 'npc_marcus', activityId: 'act_m21_conflicting_accounts',
    }).state as SimulationState;
    const sessionId = Object.keys(s.humanIntel!.interviewSessions)[0]!;

    // Ask the alibi question first
    s = handleAskInterviewQuestion(s, { type: 'AskInterviewQuestion', sessionId, questionId: 'q_a_marcus_whereabouts' }).state as SimulationState;

    // m21a_badge_log_reviewed is set by StartInterview when the badge log enters the vault
    expect(s.flags['m21a_badge_log_reviewed']).toBe(true);

    // Now badge question should be available
    const r = handleAskInterviewQuestion(s, { type: 'AskInterviewQuestion', sessionId, questionId: 'q_a_marcus_badge' });
    expect(r.success).toBe(true);
    expect(r.state.flags['m21a_femi_lead_discovered']).toBe(true);
    expect(r.state.flags['m21a_marcus_badge_explanation_given']).toBe(true);
  });

  it('Asking the same question twice is blocked', () => {
    let s = handleStartInterview(state, {
      type: 'StartInterview', npcId: 'npc_marcus', activityId: 'act_m21_conflicting_accounts',
    }).state as SimulationState;
    const sessionId = Object.keys(s.humanIntel!.interviewSessions)[0]!;

    s = handleAskInterviewQuestion(s, { type: 'AskInterviewQuestion', sessionId, questionId: 'q_a_marcus_whereabouts' }).state as SimulationState;
    const r2 = handleAskInterviewQuestion(s, { type: 'AskInterviewQuestion', sessionId, questionId: 'q_a_marcus_whereabouts' });
    expect(r2.success).toBe(false);
    expect(r2.errorCode).toBe('INVALID_COMMAND');
  });

  it('PresentEvidenceToNpc unlocks evidence-gated questions via flag', () => {
    const s = handleStartInterview(state, {
      type: 'StartInterview', npcId: 'npc_marcus', activityId: 'act_m21_conflicting_accounts',
    }).state as SimulationState;
    const sessionId = Object.keys(s.humanIntel!.interviewSessions)[0]!;

    const r = handlePresentEvidenceToNpc(s, {
      type: 'PresentEvidenceToNpc',
      sessionId,
      evidenceId: 'ev_phys_badge_log_tuesday',
    });
    expect(r.success).toBe(true);
    expect(r.state.flags['m21_evidence_presented_ev_phys_badge_log_tuesday']).toBe(true);
  });

  it('ConcludeInterview marks session as COMPLETED and sets completion flag', () => {
    let s = handleStartInterview(state, {
      type: 'StartInterview', npcId: 'npc_marcus', activityId: 'act_m21_conflicting_accounts',
    }).state as SimulationState;
    const sessionId = Object.keys(s.humanIntel!.interviewSessions)[0]!;

    // Must ask at least one question first
    s = handleAskInterviewQuestion(s, { type: 'AskInterviewQuestion', sessionId, questionId: 'q_a_marcus_whereabouts' }).state as SimulationState;
    const r = handleConcludeInterview(s, { type: 'ConcludeInterview', sessionId });

    expect(r.success).toBe(true);
    const session = r.state.humanIntel!.interviewSessions[sessionId]!;
    expect(session.status).toBe('COMPLETED');
    expect(r.state.flags['m21_interview_completed_npc_marcus_act_m21_conflicting_accounts']).toBe(true);
  });

  it('ConcludeInterview without any questions asked is blocked', () => {
    const r1 = handleStartInterview(state, {
      type: 'StartInterview', npcId: 'npc_marcus', activityId: 'act_m21_conflicting_accounts',
    });
    const sessionId = Object.keys(r1.state.humanIntel!.interviewSessions)[0]!;
    const r2 = handleConcludeInterview(r1.state as SimulationState, { type: 'ConcludeInterview', sessionId });
    expect(r2.success).toBe(false);
    expect(r2.errorCode).toBe('INVALID_COMMAND');
  });

  it('CompareEvidenceWithTestimony: correct identification of CONTRADICTED is marked isCorrect=true', () => {
    // Setup interview and ask the alibi question
    let s = handleStartInterview(state, {
      type: 'StartInterview', npcId: 'npc_marcus', activityId: 'act_m21_conflicting_accounts',
    }).state as SimulationState;
    const sessionId = Object.keys(s.humanIntel!.interviewSessions)[0]!;
    s = handleAskInterviewQuestion(s, { type: 'AskInterviewQuestion', sessionId, questionId: 'q_a_marcus_whereabouts' }).state as SimulationState;

    const r = handleCompareEvidenceWithTestimony(s, {
      type: 'CompareEvidenceWithTestimony',
      activityId: 'act_m21_conflicting_accounts',
      statementId: 'q_a_marcus_whereabouts',
      technicalEvidenceId: 'ev_phys_badge_log_tuesday',
      playerVerdict: 'CONTRADICTED',
      playerRationale: "Marcus said he left at 6pm but his badge entered Room 4B at 19:47.",
    });

    expect(r.success).toBe(true);
    const comparisons = Object.values(r.state.humanIntel!.comparisons);
    expect(comparisons).toHaveLength(1);
    expect(comparisons[0]!.isCorrect).toBe(true);
    expect(comparisons[0]!.systemVerdict).toBe('CONTRADICTED');
    expect(r.state.flags['m21_comparison_correct']).toBe(true);
  });

  it('CompareEvidenceWithTestimony: incorrect verdict (CONSISTENT) is marked isCorrect=false', () => {
    let s = handleStartInterview(state, {
      type: 'StartInterview', npcId: 'npc_marcus', activityId: 'act_m21_conflicting_accounts',
    }).state as SimulationState;
    const sessionId = Object.keys(s.humanIntel!.interviewSessions)[0]!;
    s = handleAskInterviewQuestion(s, { type: 'AskInterviewQuestion', sessionId, questionId: 'q_a_marcus_whereabouts' }).state as SimulationState;

    const r = handleCompareEvidenceWithTestimony(s, {
      type: 'CompareEvidenceWithTestimony',
      activityId: 'act_m21_conflicting_accounts',
      statementId: 'q_a_marcus_whereabouts',
      technicalEvidenceId: 'ev_phys_badge_log_tuesday',
      playerVerdict: 'CONSISTENT',
      playerRationale: "Both seem to match.",
    });

    expect(r.success).toBe(true);
    const comp = Object.values(r.state.humanIntel!.comparisons)[0]!;
    expect(comp.isCorrect).toBe(false);
    expect(r.state.flags['m21_comparison_correct']).toBeUndefined();
  });

  it('SubmitM21Conclusion: correct badge_lending_policy conclusion is marked SUPPORTED', () => {
    let s = handleStartInterview(state, {
      type: 'StartInterview', npcId: 'npc_marcus', activityId: 'act_m21_conflicting_accounts',
    }).state as SimulationState;
    const sessionId = Object.keys(s.humanIntel!.interviewSessions)[0]!;
    s = handleAskInterviewQuestion(s, { type: 'AskInterviewQuestion', sessionId, questionId: 'q_a_marcus_whereabouts' }).state as SimulationState;

    const r = handleSubmitM21Conclusion(s, {
      type: 'SubmitM21Conclusion',
      activityId: 'act_m21_conflicting_accounts',
      conclusionId: 'conc_a_badge_lending_policy_breach',
      hypothesisText: 'Tobi lent his badge in violation of physical security policy, creating an access control gap.',
      playerConclusionType: 'SUPPORTED',
      supportingStatementIds: ['q_a_marcus_whereabouts'],
      supportingEvidenceIds: ['ev_phys_badge_log_tuesday'],
      contradictingStatementIds: [],
    });

    expect(r.success).toBe(true);
    const conclusion = r.state.humanIntel!.conclusions['conc_a_badge_lending_policy_breach']!;
    expect(conclusion.isCorrect).toBe(true);
    expect(conclusion.systemConclusionType).toBe('SUPPORTED');
    expect(r.state.flags['m21a_badge_policy_finding_raised']).toBe(true);
    expect(r.state.flags['m21a_conclusion_submitted']).toBe(true);
  });

  it('SubmitM21Conclusion: incorrect insider-threat conclusion is marked CONTRADICTED', () => {
    let s = handleStartInterview(state, {
      type: 'StartInterview', npcId: 'npc_marcus', activityId: 'act_m21_conflicting_accounts',
    }).state as SimulationState;
    const sessionId = Object.keys(s.humanIntel!.interviewSessions)[0]!;
    s = handleAskInterviewQuestion(s, { type: 'AskInterviewQuestion', sessionId, questionId: 'q_a_marcus_whereabouts' }).state as SimulationState;

    const r = handleSubmitM21Conclusion(s, {
      type: 'SubmitM21Conclusion',
      activityId: 'act_m21_conflicting_accounts',
      conclusionId: 'conc_a_marcus_insider_threat',
      hypothesisText: 'Tobi is an insider threat who deliberately accessed the server room.',
      playerConclusionType: 'SUPPORTED', // Wrong — should be CONTRADICTED
      supportingStatementIds: ['q_a_marcus_whereabouts'],
      supportingEvidenceIds: [],
      contradictingStatementIds: [],
    });

    expect(r.success).toBe(true);
    const conclusion = r.state.humanIntel!.conclusions['conc_a_marcus_insider_threat']!;
    expect(conclusion.isCorrect).toBe(false);
    expect(conclusion.systemConclusionType).toBe('CONTRADICTED');
    expect(r.state.flags['m21a_premature_accusation']).toBe(true);
  });

  it('SubmitM21Conclusion without any evidence or statements is blocked', () => {
    const r = handleSubmitM21Conclusion(state, {
      type: 'SubmitM21Conclusion',
      activityId: 'act_m21_conflicting_accounts',
      conclusionId: 'conc_a_badge_lending_policy_breach',
      hypothesisText: 'Something happened.',
      playerConclusionType: 'SUPPORTED',
      supportingStatementIds: [],
      supportingEvidenceIds: [],
      contradictingStatementIds: [],
    });
    expect(r.success).toBe(false);
    expect(r.errorCode).toBe('INSUFFICIENT_EVIDENCE');
  });

  it('M21HumanIntelAdapter marks obj_m21a_interview_marcus complete after interview', () => {
    let s = baseState();
    // Accept the activity
    const acceptResult = handleCommand(s, { type: 'AcceptActivity', activityId: 'act_m21_conflicting_accounts' });
    expect(acceptResult.success).toBe(true);
    s = acceptResult.state as SimulationState;

    // Conduct a complete interview with Marcus
    const r = handleStartInterview(s, { type: 'StartInterview', npcId: 'npc_marcus', activityId: 'act_m21_conflicting_accounts' });
    s = r.state as SimulationState;
    const sessionId = Object.keys(s.humanIntel!.interviewSessions)[0]!;
    s = handleAskInterviewQuestion(s, { type: 'AskInterviewQuestion', sessionId, questionId: 'q_a_marcus_whereabouts' }).state as SimulationState;
    s = handleConcludeInterview(s, { type: 'ConcludeInterview', sessionId }).state as SimulationState;

    // Sync activities via adapter
    const synced = syncAllActivitiesWithAdapters(s);
    const activity = synced.activityDirector!.activities['act_m21_conflicting_accounts']!;
    const marcusObj = activity.objectives.find(o => o.id === 'obj_m21a_interview_marcus')!;
    expect(marcusObj.isCompleted).toBe(true);
  });

  it('M21HumanIntelAdapter marks badge log objective complete when evidence injected', () => {
    let s = handleCommand(baseState(), { type: 'AcceptActivity', activityId: 'act_m21_conflicting_accounts' }).state as SimulationState;

    // StartInterview injects badge log evidence
    s = handleStartInterview(s, { type: 'StartInterview', npcId: 'npc_marcus', activityId: 'act_m21_conflicting_accounts' }).state as SimulationState;

    const synced = syncAllActivitiesWithAdapters(s);
    const activity = synced.activityDirector!.activities['act_m21_conflicting_accounts']!;
    const badgeObj = activity.objectives.find(o => o.id === 'obj_m21a_review_badge_log')!;
    expect(badgeObj.isCompleted).toBe(true);
  });
});

// ============================================================================
// SCENARIO B — Unusual Vendor Access Request
// ============================================================================

describe('M21 Scenario B: Social Engineering Awareness', () => {
  let state: SimulationState;

  beforeEach(() => {
    state = baseState();
  });

  it('EXCELLENT decision (verify + deny) sets correct flags and positive reputation', () => {
    const r = handleEvaluateSocEngDecision(state, {
      type: 'EvaluateSocEngDecision',
      activityId: 'act_m21_vendor_request',
      scenarioId: 'scenario_b_vendor',
      playerDecision: 'VERIFIED_AND_DENIED',
    });

    expect(r.success).toBe(true);
    expect(r.state.flags['m21b_correct_decision']).toBe(true);
    expect(r.state.flags['m21b_social_eng_caught']).toBe(true);
    expect(r.state.flags['m21b_decision_made']).toBe(true);
    const eval_ = Object.values(r.state.humanIntel!.socEngEvaluations)[0]!;
    expect(eval_.outcomeRating).toBe('EXCELLENT');
    expect(eval_.reputationDelta).toBe(25);
  });

  it('CRITICAL_FAILURE decision (approve without verification) sets breach-risk flag', () => {
    const r = handleEvaluateSocEngDecision(state, {
      type: 'EvaluateSocEngDecision',
      activityId: 'act_m21_vendor_request',
      scenarioId: 'scenario_b_vendor',
      playerDecision: 'APPROVED_WITHOUT_VERIFICATION',
    });

    expect(r.success).toBe(true);
    expect(r.state.flags['m21b_security_breach_risk']).toBe(true);
    expect(r.state.flags['m21b_correct_decision']).toBeUndefined();
    const eval_ = Object.values(r.state.humanIntel!.socEngEvaluations)[0]!;
    expect(eval_.outcomeRating).toBe('CRITICAL_FAILURE');
    expect(eval_.reputationDelta).toBe(-30);
  });

  it('GOOD decision (escalate to supervisor) is treated as correct', () => {
    const r = handleEvaluateSocEngDecision(state, {
      type: 'EvaluateSocEngDecision',
      activityId: 'act_m21_vendor_request',
      scenarioId: 'scenario_b_vendor',
      playerDecision: 'ESCALATED_TO_SUPERVISOR',
    });
    expect(r.success).toBe(true);
    expect(r.state.flags['m21b_escalated']).toBe(true);
    const eval_ = Object.values(r.state.humanIntel!.socEngEvaluations)[0]!;
    expect(eval_.outcomeRating).toBe('GOOD');
  });

  it('Evaluating same activity twice is blocked', () => {
    const r1 = handleEvaluateSocEngDecision(state, {
      type: 'EvaluateSocEngDecision',
      activityId: 'act_m21_vendor_request',
      scenarioId: 'scenario_b_vendor',
      playerDecision: 'VERIFIED_AND_DENIED',
    });
    const r2 = handleEvaluateSocEngDecision(r1.state as SimulationState, {
      type: 'EvaluateSocEngDecision',
      activityId: 'act_m21_vendor_request',
      scenarioId: 'scenario_b_vendor',
      playerDecision: 'VERIFIED_AND_APPROVED',
    });
    expect(r2.success).toBe(false);
    expect(r2.errorCode).toBe('INVALID_COMMAND');
  });

  it('SOC-report decision marks both objectives completed via adapter', () => {
    let s = handleCommand(state, { type: 'AcceptActivity', activityId: 'act_m21_vendor_request' }).state as SimulationState;

    s = handleEvaluateSocEngDecision(s, {
      type: 'EvaluateSocEngDecision',
      activityId: 'act_m21_vendor_request',
      scenarioId: 'scenario_b_vendor',
      playerDecision: 'REPORTED_TO_SOC',
    }).state as SimulationState;

    const synced = syncAllActivitiesWithAdapters(s);
    const activity = synced.activityDirector!.activities['act_m21_vendor_request']!;
    const reviewObj = activity.objectives.find(o => o.id === 'obj_m21b_review_message')!;
    const decisionObj = activity.objectives.find(o => o.id === 'obj_m21b_make_decision')!;
    const socObj = activity.objectives.find(o => o.id === 'obj_m21b_report_soc')!;

    expect(reviewObj.isCompleted).toBe(true);
    expect(decisionObj.isCompleted).toBe(true);
    expect(socObj.isCompleted).toBe(true);
  });

  it('All 5 Scenario B decisions are accounted for in SCENARIO_B_DECISIONS', () => {
    const decisions = SCENARIO_B_DECISIONS.map(d => d.decision);
    expect(decisions).toContain('VERIFIED_AND_APPROVED');
    expect(decisions).toContain('VERIFIED_AND_DENIED');
    expect(decisions).toContain('ESCALATED_TO_SUPERVISOR');
    expect(decisions).toContain('APPROVED_WITHOUT_VERIFICATION');
    expect(decisions).toContain('REPORTED_TO_SOC');
  });
});

// ============================================================================
// SCENARIO C — Cedarline Visitor Management Audit
// ============================================================================

describe('M21 Scenario C: Authorized Facility Assessment', () => {
  let state: SimulationState;

  beforeEach(() => {
    // Scenario C requires Scenario A to be completed
    state = baseState({ m21a_investigation_complete: true });
  });

  it('InspectWorldObject records an observation and sets the examine flag', () => {
    const r = handleInspectWorldObject(state, {
      type: 'InspectWorldObject',
      objectId: 'obj_visitor_sign_in_sheet',
      activityId: 'act_m21_facility_audit',
    });

    expect(r.success).toBe(true);
    const observations = Object.values(r.state.humanIntel!.observations);
    expect(observations).toHaveLength(1);
    expect(observations[0]!.objectId).toBe('obj_visitor_sign_in_sheet');
    expect(observations[0]!.category).toBe('DOCUMENT');
    expect(r.state.flags['m21c_signin_sheet_examined']).toBe(true);
  });

  it('InspectWorldObject is idempotent (second call on same object returns no-op)', () => {
    const r1 = handleInspectWorldObject(state, {
      type: 'InspectWorldObject',
      objectId: 'obj_visitor_sign_in_sheet',
      activityId: 'act_m21_facility_audit',
    });
    const r2 = handleInspectWorldObject(r1.state as SimulationState, {
      type: 'InspectWorldObject',
      objectId: 'obj_visitor_sign_in_sheet',
      activityId: 'act_m21_facility_audit',
    });
    expect(r2.isNoOp).toBe(true);
    // Observations count should still be 1
    expect(Object.values(r2.state.humanIntel!.observations)).toHaveLength(1);
  });

  it('Inspecting all 5 objects produces 5 observations', () => {
    let s = state;
    for (const obj of SCENARIO_C_INSPECTABLE_OBJECTS) {
      s = handleInspectWorldObject(s, {
        type: 'InspectWorldObject',
        objectId: obj.id,
        activityId: 'act_m21_facility_audit',
      }).state as SimulationState;
    }
    expect(Object.values(s.humanIntel!.observations)).toHaveLength(5);
  });

  it('RaiseAssessmentFinding without linked observations is blocked', () => {
    const r = handleRaiseAssessmentFinding(state, {
      type: 'RaiseAssessmentFinding',
      activityId: 'act_m21_facility_audit',
      facilityId: 'cedarline_interior',
      category: 'VISITOR_MANAGEMENT',
      severity: 'MEDIUM',
      title: 'Incomplete Sign-In Sheet',
      observationSummary: 'Fields missing',
      policyReference: 'Section 2.1',
      remediationRecommendation: 'Enforce all fields',
      linkedObservationIds: [], // Empty — should fail
    });
    expect(r.success).toBe(false);
    expect(r.errorCode).toBe('INVALID_ARGUMENT');
  });

  it('RaiseAssessmentFinding with a non-existent observation ID is blocked', () => {
    const r = handleRaiseAssessmentFinding(state, {
      type: 'RaiseAssessmentFinding',
      activityId: 'act_m21_facility_audit',
      facilityId: 'cedarline_interior',
      category: 'VISITOR_MANAGEMENT',
      severity: 'MEDIUM',
      title: 'Incomplete Sign-In Sheet',
      observationSummary: 'Fields missing',
      policyReference: 'Section 2.1',
      remediationRecommendation: 'Enforce all fields',
      linkedObservationIds: ['obs_does_not_exist'],
    });
    expect(r.success).toBe(false);
    expect(r.errorCode).toBe('ITEM_NOT_FOUND');
  });

  it('RaiseAssessmentFinding linked to a real observation succeeds', () => {
    // Inspect an object first to get an observation ID
    const inspectResult = handleInspectWorldObject(state, {
      type: 'InspectWorldObject',
      objectId: 'obj_visitor_sign_in_sheet',
      activityId: 'act_m21_facility_audit',
    });
    const obsId = Object.keys(inspectResult.state.humanIntel!.observations)[0]!;

    const r = handleRaiseAssessmentFinding(inspectResult.state as SimulationState, {
      type: 'RaiseAssessmentFinding',
      activityId: 'act_m21_facility_audit',
      facilityId: 'cedarline_interior',
      category: 'VISITOR_MANAGEMENT',
      severity: 'MEDIUM',
      title: 'Incomplete Visitor Sign-In Records',
      observationSummary: 'Three entries missing time-out and host employee.',
      policyReference: 'Cedarline Visitor Management Policy, Section 2.1',
      remediationRecommendation: 'Enforce mandatory completion of all fields.',
      linkedObservationIds: [obsId],
    });

    expect(r.success).toBe(true);
    const findings = Object.values(r.state.humanIntel!.assessmentFindings);
    expect(findings).toHaveLength(1);
    expect(findings[0]!.severity).toBe('MEDIUM');
    expect(r.state.flags['m21c_finding_raised']).toBe(true);
  });

  it('SubmitPhysicalAssessmentReport with < 2 findings is blocked', () => {
    // Inspect one object and raise one finding
    const inspectR = handleInspectWorldObject(state, {
      type: 'InspectWorldObject',
      objectId: 'obj_visitor_sign_in_sheet',
      activityId: 'act_m21_facility_audit',
    });
    const obsId = Object.keys(inspectR.state.humanIntel!.observations)[0]!;
    const findingR = handleRaiseAssessmentFinding(inspectR.state as SimulationState, {
      type: 'RaiseAssessmentFinding',
      activityId: 'act_m21_facility_audit',
      facilityId: 'cedarline_interior',
      category: 'VISITOR_MANAGEMENT',
      severity: 'MEDIUM',
      title: 'Only Finding',
      observationSummary: 'Single observation',
      policyReference: 'Policy 2.1',
      remediationRecommendation: 'Fix it',
      linkedObservationIds: [obsId],
    });

    const reportR = handleSubmitPhysicalAssessmentReport(findingR.state as SimulationState, {
      type: 'SubmitPhysicalAssessmentReport',
      activityId: 'act_m21_facility_audit',
      facilityId: 'cedarline_interior',
      scope: 'Lobby and restricted corridor',
      authorizationReference: 'AUTH-2026-001',
      executiveSummary: 'Assessment complete.',
    });
    expect(reportR.success).toBe(false);
    expect(reportR.errorCode).toBe('INVALID_ARGUMENT');
  });

  it('SubmitPhysicalAssessmentReport with 4 findings produces HIGH risk report and success', () => {
    let s = state;

    // Inspect 4 objects and raise 4 findings
    const objectsToInspect = [
      'obj_visitor_sign_in_sheet',
      'obj_badge_printer_unattended',
      'obj_tailgate_door_propped',
      'obj_cctv_blind_spot',
    ];

    for (const objId of objectsToInspect) {
      s = handleInspectWorldObject(s, { type: 'InspectWorldObject', objectId: objId, activityId: 'act_m21_facility_audit' }).state as SimulationState;
    }

    const obsIds = Object.keys(s.humanIntel!.observations);

    const findingData = [
      { category: 'VISITOR_MANAGEMENT' as const, severity: 'MEDIUM' as const, title: 'Incomplete Visitor Sign-In Records', policy: 'Section 2.1' },
      { category: 'ACCESS_CONTROL' as const, severity: 'HIGH' as const, title: 'Unattended Badge Printer with Partial Print', policy: 'Section 3.4' },
      { category: 'ACCESS_CONTROL' as const, severity: 'HIGH' as const, title: 'Restricted Corridor Door Propped Open', policy: 'Section 4.1' },
      { category: 'CCTV_COVERAGE' as const, severity: 'HIGH' as const, title: 'CCTV Camera Rotated — Lobby Blind Spot', policy: 'Section 1.2' },
    ];

    for (let i = 0; i < findingData.length; i++) {
      const fd = findingData[i]!;
      s = handleRaiseAssessmentFinding(s, {
        type: 'RaiseAssessmentFinding',
        activityId: 'act_m21_facility_audit',
        facilityId: 'cedarline_interior',
        category: fd.category,
        severity: fd.severity,
        title: fd.title,
        observationSummary: 'Observation confirmed during walk-through.',
        policyReference: fd.policy,
        remediationRecommendation: 'Address immediately.',
        linkedObservationIds: [obsIds[i]!],
      }).state as SimulationState;
    }

    const r = handleSubmitPhysicalAssessmentReport(s, {
      type: 'SubmitPhysicalAssessmentReport',
      activityId: 'act_m21_facility_audit',
      facilityId: 'cedarline_interior',
      scope: 'Cedarline lobby and restricted corridor',
      authorizationReference: 'AUTH-FAC-2026-003',
      executiveSummary: 'Four significant control weaknesses identified during authorized facility assessment.',
    });

    expect(r.success).toBe(true);
    const reports = Object.values(r.state.humanIntel!.assessmentReports);
    expect(reports).toHaveLength(1);
    expect(reports[0]!.overallRiskRating).toBe('HIGH');
    expect(reports[0]!.findings).toHaveLength(4);
    expect(r.state.flags['m21c_report_submitted']).toBe(true);
    // Client feedback should be "Excellent" with 4/4 matches
    expect(reports[0]!.clientFeedback).toContain('Excellent');
  });

  it('Submitting report twice is blocked', () => {
    let s = state;
    const objectsToInspect = ['obj_visitor_sign_in_sheet', 'obj_badge_printer_unattended'];
    for (const objId of objectsToInspect) {
      s = handleInspectWorldObject(s, { type: 'InspectWorldObject', objectId: objId, activityId: 'act_m21_facility_audit' }).state as SimulationState;
    }
    const obsIds = Object.keys(s.humanIntel!.observations);

    for (let i = 0; i < 2; i++) {
      s = handleRaiseAssessmentFinding(s, {
        type: 'RaiseAssessmentFinding',
        activityId: 'act_m21_facility_audit',
        facilityId: 'cedarline_interior',
        category: 'ACCESS_CONTROL',
        severity: 'HIGH',
        title: `Finding ${i + 1}`,
        observationSummary: 'Test',
        policyReference: 'Policy',
        remediationRecommendation: 'Fix',
        linkedObservationIds: [obsIds[i]!],
      }).state as SimulationState;
    }

    const submitCmd = {
      type: 'SubmitPhysicalAssessmentReport' as const,
      activityId: 'act_m21_facility_audit',
      facilityId: 'cedarline_interior',
      scope: 'Lobby',
      authorizationReference: 'AUTH-001',
      executiveSummary: 'Done.',
    };

    const r1 = handleSubmitPhysicalAssessmentReport(s, submitCmd);
    expect(r1.success).toBe(true);

    const r2 = handleSubmitPhysicalAssessmentReport(r1.state as SimulationState, submitCmd);
    expect(r2.success).toBe(false);
    expect(r2.errorCode).toBe('INVALID_COMMAND');
  });

  it('M21HumanIntelAdapter marks obj_m21c_inspect_objects complete after 3 inspections', () => {
    let s = handleCommand(state, { type: 'AcceptActivity', activityId: 'act_m21_facility_audit' }).state as SimulationState;

    const objsToInspect = ['obj_visitor_sign_in_sheet', 'obj_badge_printer_unattended', 'obj_tailgate_door_propped'];
    for (const objId of objsToInspect) {
      s = handleInspectWorldObject(s, { type: 'InspectWorldObject', objectId: objId, activityId: 'act_m21_facility_audit' }).state as SimulationState;
    }

    const synced = syncAllActivitiesWithAdapters(s);
    const activity = synced.activityDirector!.activities['act_m21_facility_audit']!;
    const inspectObj = activity.objectives.find(o => o.id === 'obj_m21c_inspect_objects')!;
    expect(inspectObj.isCompleted).toBe(true);
  });

  it('M21HumanIntelAdapter marks obj_m21c_raise_findings complete after 2 findings', () => {
    let s = handleCommand(state, { type: 'AcceptActivity', activityId: 'act_m21_facility_audit' }).state as SimulationState;

    // Inspect 2 objects and raise 2 findings
    const objIds = ['obj_visitor_sign_in_sheet', 'obj_badge_printer_unattended'];
    for (const objId of objIds) {
      s = handleInspectWorldObject(s, { type: 'InspectWorldObject', objectId: objId, activityId: 'act_m21_facility_audit' }).state as SimulationState;
    }
    const obsIds = Object.keys(s.humanIntel!.observations);

    for (let i = 0; i < 2; i++) {
      s = handleRaiseAssessmentFinding(s, {
        type: 'RaiseAssessmentFinding',
        activityId: 'act_m21_facility_audit',
        facilityId: 'cedarline_interior',
        category: 'ACCESS_CONTROL',
        severity: 'MEDIUM',
        title: `Finding ${i + 1}`,
        observationSummary: 'Observed',
        policyReference: 'Policy',
        remediationRecommendation: 'Fix',
        linkedObservationIds: [obsIds[i]!],
      }).state as SimulationState;
    }

    const synced = syncAllActivitiesWithAdapters(s);
    const activity = synced.activityDirector!.activities['act_m21_facility_audit']!;
    const findingsObj = activity.objectives.find(o => o.id === 'obj_m21c_raise_findings')!;
    expect(findingsObj.isCompleted).toBe(true);
  });
});

// ============================================================================
// CROSS-CUTTING: COMMAND DISPATCH INTEGRATION
// ============================================================================

describe('M21: Command Handler Dispatch Integration', () => {
  const s = baseState();

  it('StartInterview dispatches correctly via handleCommand', () => {
    const r = handleCommand(s, {
      type: 'StartInterview',
      npcId: 'npc_marcus',
      activityId: 'act_m21_conflicting_accounts',
    });
    expect(r.success).toBe(true);
    expect(Object.values(r.state.humanIntel!.interviewSessions)).toHaveLength(1);
  });

  it('InspectWorldObject dispatches correctly via handleCommand', () => {
    const r = handleCommand(s, {
      type: 'InspectWorldObject',
      objectId: 'obj_visitor_sign_in_sheet',
      activityId: 'act_m21_facility_audit',
    });
    expect(r.success).toBe(true);
    expect(Object.values(r.state.humanIntel!.observations)).toHaveLength(1);
  });

  it('EvaluateSocEngDecision dispatches correctly via handleCommand', () => {
    const r = handleCommand(s, {
      type: 'EvaluateSocEngDecision',
      activityId: 'act_m21_vendor_request',
      scenarioId: 'scenario_b_vendor',
      playerDecision: 'VERIFIED_AND_DENIED',
    });
    expect(r.success).toBe(true);
    expect(r.state.flags['m21b_correct_decision']).toBe(true);
  });

  it('Unknown command still falls through to error correctly (sanity check)', () => {
    const r = handleCommand(s, { type: 'NOT_A_REAL_COMMAND' } as never);
    expect(r.success).toBe(false);
    expect(r.errorCode).toBe('INVALID_COMMAND');
  });

  it('humanIntel state is non-null after every M21 command', () => {
    const commands = [
      { type: 'StartInterview', npcId: 'npc_amina', activityId: 'act_m21_conflicting_accounts' },
      { type: 'InspectWorldObject', objectId: 'obj_cctv_blind_spot', activityId: 'act_m21_facility_audit' },
    ] as const;
    let current: SimulationState = s;
    for (const cmd of commands) {
      const r = handleCommand(current, cmd as never);
      expect(r.state.humanIntel).toBeDefined();
      current = r.state as SimulationState;
    }
  });
});

// ============================================================================
// SCENARIO DATA INTEGRITY VALIDATION
// ============================================================================

describe('M21: Scenario Data Integrity', () => {
  it('all Scenario A interview questions have unique IDs', () => {
    const scaQs = M21_INTERVIEW_QUESTIONS.filter(q => q.activityId === 'act_m21_conflicting_accounts');
    const ids = scaQs.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all questions have non-empty responseText', () => {
    M21_INTERVIEW_QUESTIONS.forEach(q => {
      expect(q.responseText.length).toBeGreaterThan(10);
    });
  });

  it('Scenario C inspectable objects all define a flagOnExamine and observationTemplate', () => {
    SCENARIO_C_INSPECTABLE_OBJECTS.forEach(obj => {
      expect(obj.flagOnExamine).toBeTruthy();
      expect(obj.observationTemplate).toBeDefined();
      expect(obj.observationTemplate.category).toBeTruthy();
    });
  });

  it('Scenario B decisions cover full severity spectrum from EXCELLENT to CRITICAL_FAILURE', () => {
    const ratings = new Set(SCENARIO_B_DECISIONS.map(d => d.outcomeRating));
    expect(ratings.has('EXCELLENT')).toBe(true);
    expect(ratings.has('GOOD')).toBe(true);
    expect(ratings.has('CRITICAL_FAILURE')).toBe(true);
  });

  it('M21 activities use valid SkillId values in skillRewards', () => {
    const validSkillIds = new Set([
      'log_analysis', 'network_fundamentals', 'incident_response',
      'security_fundamentals', 'evidence_handling', 'reporting',
      'troubleshooting', 'attack_simulation', 'detection_engineering',
    ]);
    for (const id of ['act_m21_conflicting_accounts', 'act_m21_vendor_request', 'act_m21_facility_audit']) {
      const def = AUTHORED_ACTIVITIES[id]!;
      const rewardSkills = Object.keys(def.reward.skillRewards ?? {});
      rewardSkills.forEach(skill => {
        expect(validSkillIds.has(skill)).toBe(true);
      });
    }
  });
});
