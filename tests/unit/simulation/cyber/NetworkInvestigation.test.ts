/**
 * Cyberlife — Milestone 16: Network Investigation Scenario & Evaluator Unit Tests
 *
 * Verifies objective progression, analyst notes, review status updates,
 * formal conclusion evaluation, and simulation state persistence integrity.
 */

import { describe, it, expect } from 'vitest';
import {
  createInitialNetworkInvestigationState,
} from '@/simulation/cyber/investigation/m16ScenarioData';
import {
  evaluateInvestigationSubmission,
} from '@/simulation/cyber/investigation/investigationEvaluator';
import {
  handleSetIndicatorReviewStatus,
  handleRecordNetworkAnalystNote,
  handleAdvanceNetworkObjective,
  handleSubmitNetworkInvestigationConclusion,
} from '@/simulation/cyber/investigation/networkInvestigationCommandHandler';
import { createInitialSimulationState } from '@/simulation/core/initialState';
import { checkSimulationInvariants } from '@/simulation/core/invariants';

describe('Network Investigation Scenario & Forensic Evaluator (M16)', () => {
  it('initializes investigation state with 7 objectives in BRIEFING phase', () => {
    const state = createInitialNetworkInvestigationState();
    expect(state.scenarioId).toBe('scen_m16_marina_nexus');
    expect(state.activePhase).toBe('BRIEFING');
    expect(state.objectives.length).toBe(7);
    expect(state.objectives.every(o => !o.isCompleted)).toBe(true);
    expect(state.analystNotes.length).toBeGreaterThan(0);
  });

  it('advances objectives and transitions phases via command handler', () => {
    let state = createInitialSimulationState();
    expect(state.networkInvestigation).toBeDefined();

    // 1. Advance objective 1 (triage topology)
    const res1 = handleAdvanceNetworkObjective(state, {
      type: 'AdvanceNetworkObjective',
      objectiveId: 'obj-m16-triage-topology',
      inspectedHostId: 'app-portal-01',
    });
    expect(res1.success).toBe(true);
    state = res1.state;

    const obj1 = state.networkInvestigation?.objectives.find(o => o.id === 'obj-m16-triage-topology');
    expect(obj1?.isCompleted).toBe(true);
    expect(state.networkInvestigation?.inspectedHostIds).toContain('app-portal-01');
    expect(state.networkInvestigation?.activePhase).toBe('TOPOLOGY_TRIAGE');

    // 2. Advance objective 2 (filter TLS)
    const res2 = handleAdvanceNetworkObjective(state, {
      type: 'AdvanceNetworkObjective',
      objectiveId: 'obj-m16-filter-tls',
    });
    expect(res2.success).toBe(true);
    state = res2.state;
    expect(state.networkInvestigation?.activePhase).toBe('TRAFFIC_INSPECTION');
  });

  it('records analyst notes with category and linked entity IDs', () => {
    let state = createInitialSimulationState();

    const noteRes = handleRecordNetworkAnalystNote(state, {
      type: 'RecordNetworkAnalystNote',
      title: 'C2 Beacon Analysis',
      content: 'Outbound TLS 1.3 session observed targeting 198.51.100.45:8443 with JA3 72a589dc249d32b8529e8c46fb8869c9.',
      category: 'TRAFFIC',
      linkedHostIds: ['app-portal-01', 'c2-nexus-01'],
      linkedEventIds: ['pkt-013'],
      linkedIndicatorIds: ['ioc-ip-c2-phantom'],
    });
    expect(noteRes.success).toBe(true);
    state = noteRes.state;

    const notes = state.networkInvestigation?.analystNotes;
    expect(notes?.length).toBeGreaterThanOrEqual(2);
    const latest = notes?.[notes.length - 1];
    expect(latest?.title).toBe('C2 Beacon Analysis');
    expect(latest?.category).toBe('TRAFFIC');
    expect(latest?.linkedHostIds).toContain('app-portal-01');
    expect(latest?.linkedEventIds).toContain('pkt-013');
  });

  it('updates threat indicator review status and tracks false positive decision', () => {
    let state = createInitialSimulationState();

    const reviewRes = handleSetIndicatorReviewStatus(state, {
      type: 'SetIndicatorReviewStatus',
      indicatorId: 'ioc-ip-c2-phantom',
      status: 'CONFIRMED_THREAT',
      notes: 'Confirmed active C2 endpoint in packet stream.',
    });
    expect(reviewRes.success).toBe(true);
    state = reviewRes.state;

    expect(state.networkInvestigation?.indicatorReviews['ioc-ip-c2-phantom']).toBe('CONFIRMED_THREAT');
  });

  it('evaluates a correct forensic conclusion submission with full approval (100% score)', () => {
    const submission = {
      suspectedActor: 'Phantom Weaver APT',
      compromisedHostId: 'app-portal-01',
      primaryC2Channel: 'TLS on port 8443 to 198.51.100.45',
      exfiltrationMethod: 'High-entropy DNS TXT tunneling & TLS egress',
      falsePositiveRecognized: 'mon-siem-01 vulnerability scanner probe (10.0.99.5)',
      preservedEvidenceIds: ['EVD-2026-M16-01', 'EVD-2026-M16-02'],
      analystNotes: 'All forensic anomalies attributed to Phantom Weaver beaconing.',
      submittedAtSimTime: 28900,
    };

    const result = evaluateInvestigationSubmission(submission, ['EVD-2026-M16-01', 'EVD-2026-M16-02']);
    expect(result.isApproved).toBe(true);
    expect(result.scorePercentage).toBe(100);
    expect(result.correctActor).toBe(true);
    expect(result.correctCompromisedHost).toBe(true);
    expect(result.correctC2Channel).toBe(true);
    expect(result.correctExfiltrationMethod).toBe(true);
    expect(result.correctFalsePositiveIdentification).toBe(true);
    expect(result.feedbackSummary).toContain('EXCELLENT INVESTIGATION');
  });

  it('penalizes incorrect actor attribution or false-positive confusion in evaluator', () => {
    const wrongSubmission = {
      suspectedActor: 'Unrelated Script Kiddie',
      compromisedHostId: 'filesrv-01',
      primaryC2Channel: 'Plaintext HTTP 80',
      exfiltrationMethod: 'USB Stick',
      falsePositiveRecognized: 'None',
      preservedEvidenceIds: [],
      analystNotes: 'Guesswork without evidence.',
      submittedAtSimTime: 28900,
    };

    const result = evaluateInvestigationSubmission(wrongSubmission, []);
    expect(result.isApproved).toBe(false);
    expect(result.scorePercentage).toBeLessThan(50);
    expect(result.correctActor).toBe(false);
    expect(result.correctCompromisedHost).toBe(false);
    expect(result.feedbackSummary).toContain('INSUFFICIENT OR INCOMPLETE FINDING');
  });

  it('submits conclusion command and preserves evaluation result in simulation state', () => {
    let state = createInitialSimulationState();

    const submission = {
      suspectedActor: 'Phantom Weaver APT',
      compromisedHostId: 'app-portal-01',
      primaryC2Channel: 'TLS on port 8443 to 198.51.100.45',
      exfiltrationMethod: 'High-entropy DNS TXT tunneling & TLS egress',
      falsePositiveRecognized: 'mon-siem-01 vulnerability scanner probe (10.0.99.5)',
      preservedEvidenceIds: ['EVD-2026-M16-01', 'EVD-2026-M16-02'],
      analystNotes: 'Verified forensic package.',
      submittedAtSimTime: 28900,
    };

    const submitRes = handleSubmitNetworkInvestigationConclusion(state, {
      type: 'SubmitNetworkInvestigationConclusion',
      submission,
    });
    expect(submitRes.success).toBe(true);
    state = submitRes.state;

    expect(state.networkInvestigation?.conclusionSubmission).toBeDefined();
    expect(state.networkInvestigation?.evaluationResult).toBeDefined();
    expect(state.networkInvestigation?.evaluationResult?.isApproved).toBe(true);
    expect(state.networkInvestigation?.activePhase).toBe('COMPLETED');

    // Verify simulation invariant check passes cleanly
    const violations = checkSimulationInvariants(state);
    expect(violations.length).toBe(0);
  });
});
