/**
 * Cyberlife — Milestone 24: Human Intelligence & Physical Security Portal
 *
 * Dedicated Orion OS desktop suite for M21 human-centered cybersecurity operations:
 * - Witness interviews, dialogue queries, and testimony recording
 * - Contradiction analysis: testimony statements vs. cryptographic evidence logs
 * - Investigative conclusion formulation & ground-truth validation
 * - Social engineering vendor access email triage & decision evaluation
 * - Physical security walkthrough inspection, finding triage & executive reporting
 *
 * STRICT SAFETY INVARIANT:
 * 100% simulated in-game state — zero host access, zero external calls.
 */

import React, { useState, useMemo } from 'react';
import { useOptionalSimulation } from '@/application/simulation';
import {
  M21_INTERVIEW_QUESTIONS,
  SCENARIO_B_VENDOR_MESSAGE,
  SCENARIO_B_DECISIONS,
  SCENARIO_C_INSPECTABLE_OBJECTS,
  SCENARIO_C_EXPECTED_FINDINGS,
  M21_SCENARIO_A_EVIDENCE,
} from '@/simulation/humanIntel/scenarioData';
import type {
  ComparisonVerdict,
  SocEngDecision,
  WitnessStatement,
} from '@/simulation/humanIntel/types';

export type HumanIntelTab = 'interviews' | 'soceng' | 'facility' | 'vault';

export const HumanIntelApp: React.FC = () => {
  const sim = useOptionalSimulation();
  const humanIntel = sim?.state.humanIntel;
  const flags = useMemo(() => sim?.state.flags ?? {}, [sim?.state.flags]);

  // Deep-linking query parameters for headless testing & screenshots
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlTab = urlParams?.get('tab') as HumanIntelTab | null;

  const [activeTab, setActiveTab] = useState<HumanIntelTab>(() => {
    if (urlTab && ['interviews', 'soceng', 'facility', 'vault'].includes(urlTab)) {
      return urlTab;
    }
    return 'interviews';
  });

  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showFeedback = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  // ── Tab 1: Interview & Conflicting Accounts State ─────────────────────────
  const [selectedWitnessId, setSelectedWitnessId] = useState<string>('npc_marcus');
  const [selectedVerdict, setSelectedVerdict] = useState<ComparisonVerdict>('CONTRADICTED');
  const [comparisonRationale, setComparisonRationale] = useState<string>(
    'The physical badge log shows Barry’s credential swiped into Room 4B at 19:47, directly contradicting his claim that he left at 18:00.'
  );
  const [selectedConclusionId, setSelectedConclusionId] = useState<string>('conc_a_badge_lending_policy_breach');

  const activeSession = useMemo(() => {
    if (!humanIntel) return null;
    return (
      Object.values(humanIntel.interviewSessions).find(
        s => s.npcId === selectedWitnessId && s.status === 'ACTIVE'
      ) ?? null
    );
  }, [humanIntel, selectedWitnessId]);

  const statements = useMemo<WitnessStatement[]>(() => {
    if (!humanIntel) return [];
    const list: WitnessStatement[] = [];
    for (const session of Object.values(humanIntel.interviewSessions)) {
      list.push(...session.statementsRecorded);
    }
    return list;
  }, [humanIntel]);

  const availableQuestions = useMemo(() => {
    return M21_INTERVIEW_QUESTIONS.filter(q => {
      if (q.targetNpcId !== selectedWitnessId) return false;
      if (q.requiredFlags) {
        for (const [flag, expected] of Object.entries(q.requiredFlags)) {
          if (Boolean(flags[flag]) !== expected) return false;
        }
      }
      return true;
    });
  }, [selectedWitnessId, flags]);

  // ── Tab 2: Social Engineering State ──────────────────────────────────────
  const [selectedDecisionId, setSelectedDecisionId] = useState<string>('decision_verify_deny');
  const [showIndicators, setShowIndicators] = useState<boolean>(true);

  // ── Tab 3: Physical Facility State ───────────────────────────────────────
  const observations = useMemo(() => {
    if (!humanIntel) return [];
    return Object.values(humanIntel.observations);
  }, [humanIntel]);

  const findings = useMemo(() => {
    if (!humanIntel) return [];
    return Object.values(humanIntel.assessmentFindings);
  }, [humanIntel]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStartInterview = (npcId: string) => {
    if (!sim) return;
    const res = sim.engine.dispatch({
      type: 'StartInterview',
      npcId,
      activityId: 'act_m21_conflicting_accounts',
    });
    if (res.success) {
      showFeedback(`Interview session opened with ${npcId === 'npc_marcus' ? 'Barry (Infra Admin)' : 'Blessing (Lead Analyst)'}. Badge log evidence added to vault.`, 'success');
    } else {
      showFeedback(res.message || 'Failed to start interview', 'error');
    }
  };

  const handleAskQuestion = (questionId: string) => {
    if (!sim || !activeSession) return;
    const res = sim.engine.dispatch({
      type: 'AskInterviewQuestion',
      sessionId: activeSession.sessionId,
      questionId,
    });
    if (res.success) {
      showFeedback('Question answered and witness statement recorded.', 'success');
    } else {
      showFeedback(res.message || 'Failed to ask question', 'error');
    }
  };

  const handlePresentEvidence = () => {
    if (!sim || !activeSession) return;
    const res = sim.engine.dispatch({
      type: 'PresentEvidenceToNpc',
      sessionId: activeSession.sessionId,
      evidenceId: 'ev_phys_badge_log_tuesday',
    });
    if (res.success) {
      showFeedback('Badge access log presented to witness. Witness admitted badge-sharing.', 'success');
    } else {
      showFeedback(res.message || 'Failed to present evidence', 'error');
    }
  };

  const handleConcludeInterview = () => {
    if (!sim || !activeSession) return;
    const res = sim.engine.dispatch({
      type: 'ConcludeInterview',
      sessionId: activeSession.sessionId,
    });
    if (res.success) {
      showFeedback('Interview successfully concluded and archived.', 'success');
    } else {
      showFeedback(res.message || 'Failed to conclude interview', 'error');
    }
  };

  const handleCompareEvidence = () => {
    if (!sim) return;
    const res = sim.engine.dispatch({
      type: 'CompareEvidenceWithTestimony',
      activityId: 'act_m21_conflicting_accounts',
      statementId: 'q_a_marcus_whereabouts',
      technicalEvidenceId: 'ev_phys_badge_log_tuesday',
      playerVerdict: selectedVerdict,
      playerRationale: comparisonRationale,
    });
    if (res.success) {
      showFeedback('Comparison submitted. Verdict graded against ground truth: CONTRADICTED.', 'success');
    } else {
      showFeedback(res.message || 'Failed to compare evidence', 'error');
    }
  };

  const handleSubmitConclusion = () => {
    if (!sim) return;
    const isLending = selectedConclusionId === 'conc_a_badge_lending_policy_breach';
    const res = sim.engine.dispatch({
      type: 'SubmitM21Conclusion',
      activityId: 'act_m21_conflicting_accounts',
      conclusionId: selectedConclusionId,
      hypothesisText: isLending
        ? 'Barry lent his badge to Michael to fetch a patch cable during deployment, violating Section 4.2.'
        : 'Barry deliberately accessed the server room as an insider threat.',
      playerConclusionType: isLending ? 'SUPPORTED' : 'CONTRADICTED',
      supportingStatementIds: ['q_a_marcus_badge', 'q_a_amina_badge_policy'],
      supportingEvidenceIds: ['ev_phys_badge_log_tuesday'],
      contradictingStatementIds: ['q_a_marcus_whereabouts'],
    });
    if (res.success) {
      showFeedback('Investigative conclusion officially submitted to Security Office. Scenario completed!', 'success');
    } else {
      showFeedback(res.message || 'Failed to submit conclusion', 'error');
    }
  };

  const handleEvaluateSocEng = () => {
    if (!sim) return;
    const decisionConfig = SCENARIO_B_DECISIONS.find(d => d.id === selectedDecisionId);
    if (!decisionConfig) return;

    const res = sim.engine.dispatch({
      type: 'EvaluateSocEngDecision',
      activityId: 'act_m21_vendor_request',
      scenarioId: 'scen_vendor_emergency_ups',
      playerDecision: decisionConfig.decision as SocEngDecision,
    });
    if (res.success) {
      showFeedback(`Access decision evaluated: Rating ${decisionConfig.outcomeRating}. ${decisionConfig.feedbackText.substring(0, 100)}...`, 'success');
    } else {
      showFeedback(res.message || 'Failed to evaluate decision', 'error');
    }
  };

  const handleInspectObject = (objectId: string) => {
    if (!sim) return;
    const res = sim.engine.dispatch({
      type: 'InspectWorldObject',
      activityId: 'act_m21_facility_audit',
      objectId,
    });
    if (res.success) {
      showFeedback('Physical security control inspected and observation recorded.', 'success');
    } else {
      showFeedback(res.message || 'Inspection failed', 'error');
    }
  };

  const handleRaiseFinding = (findingIndex: number) => {
    if (!sim) return;
    const exp = SCENARIO_C_EXPECTED_FINDINGS[findingIndex];
    if (!exp) return;

    const res = sim.engine.dispatch({
      type: 'RaiseAssessmentFinding',
      activityId: 'act_m21_facility_audit',
      facilityId: 'cedarline_hq',
      category: exp.category,
      severity: exp.severity,
      title: exp.title,
      observationSummary: `Physical inspection verified policy non-compliance: ${exp.title}.`,
      policyReference: exp.policyReference,
      remediationRecommendation: exp.remediationRecommendation,
      linkedObservationIds: observations.map(o => o.id),
    });
    if (res.success) {
      showFeedback(`Formal finding raised: "${exp.title}" (${exp.severity}).`, 'success');
    } else {
      showFeedback(res.message || 'Failed to raise finding', 'error');
    }
  };

  const handleSubmitFacilityReport = () => {
    if (!sim) return;
    const res = sim.engine.dispatch({
      type: 'SubmitPhysicalAssessmentReport',
      activityId: 'act_m21_facility_audit',
      facilityId: 'cedarline_hq',
      scope: 'Cedarline HQ Ground Floor Lobby, Visitor Registration & Restricted Corridor Access Control',
      authorizationReference: 'FAC-AUTH-2026-PHYS-01',
      executiveSummary: 'Physical access controls exhibit notable gaps in visitor registration and door closure enforcement. Recommendations filed.',
    });
    if (res.success) {
      showFeedback('Physical Security Audit Report certified and submitted to Facilities Management!', 'success');
    } else {
      showFeedback(res.message || 'Failed to submit report', 'error');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: '#070b14',
        color: '#f8fafc',
        fontFamily: "'Inter', system-ui, sans-serif",
        overflow: 'hidden',
      }}
      data-testid="human-intel-app"
    >
      {/* App Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: '#0c1322',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 229, 255, 0.12)',
              border: '1px solid #00e5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00e5ff',
              fontSize: '16px',
            }}
          >
            🛡️
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '0.04em', color: '#f8fafc' }}>
              HUMAN INTELLIGENCE &amp; PHYSICAL SECURITY
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Investigation Portal // Witness Interviews, SocEng Defense &amp; Facility Audits
            </div>
          </div>
        </div>

        {/* Global Stats Badge */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            <span>TESTIMONIES: </span>
            <strong style={{ color: '#00e5ff' }}>{statements.length}</strong>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            <span>OBSERVATIONS: </span>
            <strong style={{ color: '#38bdf8' }}>{observations.length}</strong>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            <span>FINDINGS: </span>
            <strong style={{ color: '#f59e0b' }}>{findings.length}</strong>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#090e1a',
          borderBottom: '1px solid #1e293b',
          padding: '0 12px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('interviews')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'interviews' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'interviews' ? '2px solid #00e5ff' : '2px solid transparent',
            color: activeTab === 'interviews' ? '#00e5ff' : '#94a3b8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          data-testid="tab-interviews"
        >
          <span>🎙️</span> Witness Interviews (HUMINT)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('soceng')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'soceng' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'soceng' ? '2px solid #00e5ff' : '2px solid transparent',
            color: activeTab === 'soceng' ? '#00e5ff' : '#94a3b8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          data-testid="tab-soceng"
        >
          <span>🎣</span> SocEng Awareness &amp; Vendor Triage
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('facility')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'facility' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'facility' ? '2px solid #00e5ff' : '2px solid transparent',
            color: activeTab === 'facility' ? '#00e5ff' : '#94a3b8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          data-testid="tab-facility"
        >
          <span>🏢</span> Facility Access &amp; Physical Audit
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('vault')}
          style={{
            padding: '10px 16px',
            backgroundColor: activeTab === 'vault' ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'vault' ? '2px solid #00e5ff' : '2px solid transparent',
            color: activeTab === 'vault' ? '#00e5ff' : '#94a3b8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
          data-testid="tab-vault"
        >
          <span>🔒</span> Evidence Vault &amp; Chain of Custody
        </button>
      </div>

      {/* Action Feedback Banner */}
      {feedback && (
        <div
          style={{
            padding: '8px 16px',
            fontSize: '12px',
            backgroundColor:
              feedback.type === 'success'
                ? 'rgba(16, 185, 129, 0.15)'
                : feedback.type === 'error'
                  ? 'rgba(239, 68, 68, 0.15)'
                  : 'rgba(56, 189, 248, 0.15)',
            borderBottom: `1px solid ${
              feedback.type === 'success'
                ? '#10b981'
                : feedback.type === 'error'
                  ? '#ef4444'
                  : '#38bdf8'
            }`,
            color:
              feedback.type === 'success'
                ? '#6ee7b7'
                : feedback.type === 'error'
                  ? '#fca5a5'
                  : '#bae6fd',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          data-testid="feedback-banner"
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Tab Content Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* ── TAB 1: WITNESS INTERVIEWS ──────────────────────────────────── */}
        {activeTab === 'interviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Scenario Banner */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '14px 16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#00e5ff', fontWeight: 700 }}>
                    Active HUMINT Scenario // The Server Room Discrepancy
                  </div>
                  <h2 style={{ fontSize: '16px', margin: '4px 0', color: '#f8fafc' }}>
                    Conflicting Accounts Investigation (Room 4B)
                  </h2>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0, maxWidth: '800px' }}>
                    Credential <code>CED-2026-B-0247</code> (assigned to Barry) was recorded at 19:47 entering Room 4B,
                    yet Barry claims he left at 18:00. Interview both staff members, confront contradictions with badge logs,
                    and submit a substantiated investigative conclusion.
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>ACTIVITY ID:</div>
                  <code style={{ fontSize: '11px', color: '#38bdf8' }}>act_m21_conflicting_accounts</code>
                </div>
              </div>
            </div>

            {/* Split Screen: Witness Selection & Interview Session */}
            <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '16px' }}>
              {/* Left Column: Witness Selector & Status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                  Available Witnesses
                </div>

                {/* Witness 1: Barry */}
                <div
                  onClick={() => setSelectedWitnessId('npc_marcus')}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: selectedWitnessId === 'npc_marcus' ? 'rgba(0, 229, 255, 0.08)' : '#0f172a',
                    border: `1px solid ${selectedWitnessId === 'npc_marcus' ? '#00e5ff' : '#1e293b'}`,
                    cursor: 'pointer',
                  }}
                  data-testid="witness-marcus"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: '#f8fafc' }}>Barry</strong>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#334155', color: '#cbd5e1' }}>
                      Junior Infra Admin
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    Claims he left at 18:00. Badge swiped at 19:47. Key subject of interest.
                  </p>
                  {flags['m21_interview_completed_npc_marcus_act_m21_conflicting_accounts'] && (
                    <div style={{ fontSize: '10px', color: '#10b981', marginTop: '6px' }}>
                      ✓ Formal Interview Concluded
                    </div>
                  )}
                </div>

                {/* Witness 2: Blessing */}
                <div
                  onClick={() => setSelectedWitnessId('npc_amina')}
                  style={{
                    padding: '12px',
                    borderRadius: '6px',
                    backgroundColor: selectedWitnessId === 'npc_amina' ? 'rgba(0, 229, 255, 0.08)' : '#0f172a',
                    border: `1px solid ${selectedWitnessId === 'npc_amina' ? '#00e5ff' : '#1e293b'}`,
                    cursor: 'pointer',
                  }}
                  data-testid="witness-amina"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: '#f8fafc' }}>Blessing</strong>
                    <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#334155', color: '#cbd5e1' }}>
                      Lead Security Analyst
                    </span>
                  </div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    Corroborates Barry’s early departure. Can clarify policy Section 4.2.
                  </p>
                  {flags['m21_interview_completed_npc_amina_act_m21_conflicting_accounts'] && (
                    <div style={{ fontSize: '10px', color: '#10b981', marginTop: '6px' }}>
                      ✓ Formal Interview Concluded
                    </div>
                  )}
                </div>

                {/* Interview Action Controls */}
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!activeSession ? (
                    <button
                      type="button"
                      onClick={() => handleStartInterview(selectedWitnessId)}
                      style={{
                        padding: '10px 14px',
                        backgroundColor: '#00e5ff',
                        color: '#020617',
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                      data-testid="btn-start-interview"
                    >
                      ▶ Open Interview Session
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handlePresentEvidence}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#1e293b',
                          color: '#f8fafc',
                          border: '1px solid #38bdf8',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                        data-testid="btn-present-evidence"
                      >
                        📂 Present Badge Log Evidence
                      </button>
                      <button
                        type="button"
                        onClick={handleConcludeInterview}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          color: '#fca5a5',
                          border: '1px solid #ef4444',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          fontWeight: 600,
                        }}
                        data-testid="btn-conclude-interview"
                      >
                        ⏹ Conclude &amp; Sign Interview
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Active Dialogue & Questions */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '14px', margin: 0, color: '#f8fafc' }}>
                    {activeSession ? `Active Session: ${selectedWitnessId === 'npc_marcus' ? 'Barry' : 'Blessing'}` : 'Recorded Testimonies & Statements'}
                  </h3>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      backgroundColor: activeSession ? 'rgba(16, 185, 129, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                      color: activeSession ? '#10b981' : '#94a3b8',
                      fontWeight: 600,
                    }}
                  >
                    {activeSession ? '● RECORDING ACTIVE' : 'ARCHIVED / READY'}
                  </span>
                </div>

                {/* Question Selector (If Active Session) */}
                {activeSession && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                      Choose Inquiry to Put Forward:
                    </div>
                    {availableQuestions.map(q => {
                      const alreadyAsked = statements.some(s => s.questionId === q.id);
                      return (
                        <div
                          key={q.id}
                          style={{
                            padding: '8px 12px',
                            backgroundColor: alreadyAsked ? '#1e293b' : 'rgba(0, 229, 255, 0.05)',
                            border: `1px solid ${alreadyAsked ? '#334155' : '#00e5ff'}`,
                            borderRadius: '6px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                          }}
                        >
                          <span style={{ fontSize: '12px', color: alreadyAsked ? '#94a3b8' : '#f8fafc' }}>
                            {q.questionText}
                          </span>
                          <button
                            type="button"
                            disabled={alreadyAsked}
                            onClick={() => handleAskQuestion(q.id)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11px',
                              borderRadius: '4px',
                              backgroundColor: alreadyAsked ? '#475569' : '#00e5ff',
                              color: alreadyAsked ? '#94a3b8' : '#020617',
                              border: 'none',
                              cursor: alreadyAsked ? 'not-allowed' : 'pointer',
                              fontWeight: 600,
                            }}
                          >
                            {alreadyAsked ? 'Answered' : 'Ask Question'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Recorded Statements Feed */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                    Logged Statements ({statements.length}):
                  </div>

                  {statements.length === 0 ? (
                    <div style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic', padding: '16px', textAlign: 'center' }}>
                      No statements logged yet. Open an interview session above to begin questioning witnesses.
                    </div>
                  ) : (
                    statements.map(stmt => (
                      <div
                        key={stmt.statementId}
                        style={{
                          padding: '10px 12px',
                          backgroundColor: '#161f33',
                          border: '1px solid #1e293b',
                          borderRadius: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8' }}>
                            {stmt.npcId === 'npc_marcus' ? 'Barry (Admin)' : 'Blessing (SecOps Lead)'}
                          </span>
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: '#334155',
                              color: '#cbd5e1',
                            }}
                          >
                            RELIABILITY: {stmt.reliability}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#f8fafc', fontStyle: 'italic' }}>
                          &ldquo;{stmt.responseText}&rdquo;
                        </div>
                        {stmt.potentialContradiction && (
                          <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '4px' }}>
                            ⚠ Flagged Indicator: {stmt.potentialContradiction}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Evidence Comparison Studio & Conclusion Box */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {/* Contradiction Analysis */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  ⚖️ Testimony vs. Evidence Comparison Matrix
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Compare statement <code>q_a_marcus_whereabouts</code> against <code>ev_phys_badge_log_tuesday</code>:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#cbd5e1' }}>Player Verdict:</label>
                  <select
                    value={selectedVerdict}
                    onChange={e => setSelectedVerdict(e.target.value as ComparisonVerdict)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#1e293b',
                      color: '#f8fafc',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                    data-testid="select-verdict"
                  >
                    <option value="CONTRADICTED">CONTRADICTED (Testimony conflicts with physical log)</option>
                    <option value="CONSISTENT">CONSISTENT (Log fully aligns with testimony)</option>
                    <option value="PARTIALLY_CONSISTENT">PARTIALLY_CONSISTENT (Badge lent to colleague)</option>
                    <option value="INCONCLUSIVE">INCONCLUSIVE (Insufficient data)</option>
                  </select>

                  <label style={{ fontSize: '11px', color: '#cbd5e1' }}>Investigative Rationale:</label>
                  <textarea
                    rows={3}
                    value={comparisonRationale}
                    onChange={e => setComparisonRationale(e.target.value)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#1e293b',
                      color: '#f8fafc',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                      fontSize: '11px',
                    }}
                  />

                  <button
                    type="button"
                    onClick={handleCompareEvidence}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#38bdf8',
                      color: '#020617',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                    data-testid="btn-submit-comparison"
                  >
                    Submit Formal Comparison Analysis
                  </button>
                </div>
              </div>

              {/* Investigative Conclusion Submission */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  📋 Final Investigative Conclusion
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Formulate your substantiated finding for the Cedarline Security Office:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '11px', color: '#cbd5e1' }}>Substantiated Theory:</label>
                  <select
                    value={selectedConclusionId}
                    onChange={e => setSelectedConclusionId(e.target.value)}
                    style={{
                      padding: '8px',
                      backgroundColor: '#1e293b',
                      color: '#f8fafc',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                      fontSize: '12px',
                    }}
                    data-testid="select-conclusion"
                  >
                    <option value="conc_a_badge_lending_policy_breach">
                      Policy Breach: Barry lent badge to Michael (Non-Malicious Policy Violation)
                    </option>
                    <option value="conc_a_marcus_insider_threat">
                      Malicious Insider: Barry intentionally conducted unauthorized access
                    </option>
                  </select>

                  <div style={{ fontSize: '11px', color: '#94a3b8', backgroundColor: '#161f33', padding: '10px', borderRadius: '4px' }}>
                    <strong>Evidence Basis:</strong> Testimony confirms departure at 18:15 corroborated by Blessing. Badge lending admitted at 19:47. Physical policy Section 4.2 prohibits credential sharing.
                  </div>

                  <button
                    type="button"
                    onClick={handleSubmitConclusion}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#10b981',
                      color: '#020617',
                      border: 'none',
                      borderRadius: '4px',
                      fontWeight: 700,
                      fontSize: '12px',
                      cursor: 'pointer',
                      marginTop: 'auto',
                    }}
                    data-testid="btn-submit-conclusion"
                  >
                    File Definitive Investigative Conclusion
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: SOCENG & VENDOR TRIAGE ──────────────────────────────── */}
        {activeTab === 'soceng' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#00e5ff', fontWeight: 700 }}>
                Social Engineering Awareness // Scenario B
              </div>
              <h2 style={{ fontSize: '16px', margin: '4px 0', color: '#f8fafc' }}>
                Unusual Third-Party Vendor Access Request
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Analyze the incoming message from Telekron Power Systems Nigeria. Detect indicators of deception,
                adhere to visitor and credential protocols, and evaluate your response decision.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              {/* Message Viewer */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                    📨 Incoming Secure Mailbox Message
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowIndicators(p => !p)}
                    style={{
                      padding: '4px 8px',
                      backgroundColor: '#1e293b',
                      color: '#38bdf8',
                      border: '1px solid #334155',
                      borderRadius: '4px',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    {showIndicators ? 'Hide Red Flags' : 'Inspect Red Flags'}
                  </button>
                </div>

                <div
                  style={{
                    backgroundColor: '#070b14',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    padding: '12px',
                    fontSize: '12px',
                    lineHeight: '1.5',
                  }}
                >
                  <div style={{ borderBottom: '1px solid #1e293b', paddingBottom: '8px', marginBottom: '8px' }}>
                    <div><strong>FROM:</strong> {SCENARIO_B_VENDOR_MESSAGE.sender}</div>
                    <div><strong>SUBJECT:</strong> {SCENARIO_B_VENDOR_MESSAGE.subject}</div>
                  </div>
                  <pre
                    style={{
                      whiteSpace: 'pre-wrap',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '11px',
                      color: '#cbd5e1',
                      margin: 0,
                    }}
                  >
                    {SCENARIO_B_VENDOR_MESSAGE.body}
                  </pre>
                </div>

                {/* Highlighted Spoof Indicators */}
                {showIndicators && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                      Detected Deception Indicators (4 Red Flags):
                    </div>
                    {SCENARIO_B_VENDOR_MESSAGE.spoofIndicators.map((ind, i) => (
                      <div
                        key={i}
                        style={{
                          fontSize: '11px',
                          padding: '6px 10px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(245, 158, 11, 0.08)',
                          borderLeft: '3px solid #f59e0b',
                        }}
                      >
                        <strong>{ind.indicator}:</strong> {ind.detail}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Decision Console */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  🎯 Select &amp; Evaluate Response Action
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {SCENARIO_B_DECISIONS.map(dec => (
                    <label
                      key={dec.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '6px',
                        backgroundColor: selectedDecisionId === dec.id ? 'rgba(0, 229, 255, 0.08)' : '#161f33',
                        border: `1px solid ${selectedDecisionId === dec.id ? '#00e5ff' : '#1e293b'}`,
                        cursor: 'pointer',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'flex-start',
                      }}
                    >
                      <input
                        type="radio"
                        name="socEngDecision"
                        checked={selectedDecisionId === dec.id}
                        onChange={() => setSelectedDecisionId(dec.id)}
                        style={{ marginTop: '2px' }}
                      />
                      <div style={{ fontSize: '11px', color: '#f8fafc' }}>
                        <div>{dec.label}</div>
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleEvaluateSocEng}
                  style={{
                    padding: '10px',
                    backgroundColor: '#00e5ff',
                    color: '#020617',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginTop: 'auto',
                  }}
                  data-testid="btn-submit-soceng"
                >
                  Confirm &amp; Evaluate Access Decision
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: FACILITY & PHYSICAL AUDIT ───────────────────────────── */}
        {activeTab === 'facility' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#00e5ff', fontWeight: 700 }}>
                Physical Security Assessment // Scenario C
              </div>
              <h2 style={{ fontSize: '16px', margin: '4px 0', color: '#f8fafc' }}>
                Cedarline Visitor Management &amp; Access Control Audit
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Authorized walk-through assessment of Cedarline HQ ground lobby and restricted corridor.
                Inspect physical controls, document observations, raise formal findings, and file executive report.
              </p>
            </div>

            {/* Inspectable Controls Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                Physical Security Checkpoints:
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {SCENARIO_C_INSPECTABLE_OBJECTS.map(obj => {
                  const isObserved = observations.some(o => o.objectId === obj.id);
                  return (
                    <div
                      key={obj.id}
                      style={{
                        padding: '12px',
                        borderRadius: '6px',
                        backgroundColor: isObserved ? 'rgba(16, 185, 129, 0.08)' : '#0f172a',
                        border: `1px solid ${isObserved ? '#10b981' : '#1e293b'}`,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                      data-testid={`inspect-${obj.id}`}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ fontSize: '13px', color: '#f8fafc' }}>{obj.displayName}</strong>
                          <span style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', backgroundColor: '#334155', color: '#94a3b8' }}>
                            {obj.category}
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#cbd5e1', margin: '4px 0 0 0' }}>
                          {isObserved ? obj.examineDescription : obj.shortDescription}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleInspectObject(obj.id)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '4px',
                          backgroundColor: isObserved ? '#1e293b' : '#38bdf8',
                          color: isObserved ? '#94a3b8' : '#020617',
                          border: 'none',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {isObserved ? '✓ Inspected (Re-scan)' : '🔍 Inspect Physical Control'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Findings & Reporting Section */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              {/* Expected Findings Generator */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  📝 Raise Formal Security Findings
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  Based on your physical inspections, raise formal non-compliance findings:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {SCENARIO_C_EXPECTED_FINDINGS.map((exp, idx) => {
                    const isRaised = findings.some(f => f.title === exp.title);
                    return (
                      <div
                        key={idx}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '6px',
                          backgroundColor: isRaised ? '#161f33' : 'rgba(0, 229, 255, 0.05)',
                          border: `1px solid ${isRaised ? '#1e293b' : '#00e5ff'}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc' }}>
                            {exp.title}
                          </div>
                          <div style={{ fontSize: '10px', color: '#94a3b8' }}>
                            {exp.severity} // {exp.policyReference}
                          </div>
                        </div>

                        <button
                          type="button"
                          disabled={isRaised}
                          onClick={() => handleRaiseFinding(idx)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            backgroundColor: isRaised ? '#334155' : '#00e5ff',
                            color: isRaised ? '#94a3b8' : '#020617',
                            border: 'none',
                            fontSize: '11px',
                            fontWeight: 600,
                            cursor: isRaised ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isRaised ? 'Raised' : 'Raise Finding'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assessment Report Submission */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
                  📊 Compile &amp; Certify Executive Audit Report
                </div>

                <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.5' }}>
                  <div><strong>FACILITY:</strong> Cedarline Solutions HQ (Ground Lobby)</div>
                  <div><strong>AUTHORIZATION:</strong> <code>FAC-AUTH-2026-PHYS-01</code></div>
                  <div><strong>FINDINGS RAISED:</strong> {findings.length} / {SCENARIO_C_EXPECTED_FINDINGS.length}</div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitFacilityReport}
                  style={{
                    padding: '12px',
                    backgroundColor: '#10b981',
                    color: '#020617',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '12px',
                    cursor: 'pointer',
                    marginTop: 'auto',
                  }}
                  data-testid="btn-submit-facility-report"
                >
                  Certify &amp; Submit Executive Audit Report
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: EVIDENCE VAULT ──────────────────────────────────────── */}
        {activeTab === 'vault' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '14px 16px',
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#00e5ff', fontWeight: 700 }}>
                Chain of Custody // Vault Artifacts
              </div>
              <h2 style={{ fontSize: '16px', margin: '4px 0', color: '#f8fafc' }}>
                Forensic &amp; Physical Evidence Registry
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', margin: 0 }}>
                Verified cryptographic evidence items from badge readers, witness interviews, and facility walk-throughs.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '12px' }}>
              {/* Scenario A Badge Log Evidence */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <strong style={{ fontSize: '13px', color: '#38bdf8' }}>{M21_SCENARIO_A_EVIDENCE[0].title}</strong>
                  <span style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', backgroundColor: '#334155', color: '#94a3b8' }}>
                    PHYSICAL ACCESS LOG
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: '#cbd5e1' }}>
                  {M21_SCENARIO_A_EVIDENCE[0].description}
                </div>
                <div style={{ fontSize: '10px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace", marginTop: '4px' }}>
                  SHA-256: {M21_SCENARIO_A_EVIDENCE[0].hash}
                </div>
                <div style={{ fontSize: '10px', color: '#10b981' }}>
                  ✓ Custody Verified (Floor 4 Badge Reader Log)
                </div>
              </div>

              {/* Witness Statements */}
              {statements.map(stmt => (
                <div
                  key={stmt.statementId}
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '6px',
                    padding: '14px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: '13px', color: '#f8fafc' }}>
                      Statement: {stmt.npcId === 'npc_marcus' ? 'Barry' : 'Blessing'}
                    </strong>
                    <span style={{ fontSize: '9px', padding: '2px 5px', borderRadius: '3px', backgroundColor: '#334155', color: '#94a3b8' }}>
                      TESTIMONY
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', fontStyle: 'italic' }}>
                    &ldquo;{stmt.responseText}&rdquo;
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b', fontFamily: "'JetBrains Mono', monospace", marginTop: '4px' }}>
                    STATEMENT ID: {stmt.statementId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
