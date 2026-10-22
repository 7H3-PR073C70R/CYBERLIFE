/**
 * Cyberlife — Milestone 17: Red Team Assessment Workspace
 *
 * Professional in-game authorized cybersecurity assessment suite featuring:
 *   - Tab 1: Briefing & Scope (Written Rules of Engagement, legal authority, allowed/prohibited actions)
 *   - Tab 2: Target Inventory (Scope explorer distinguishing authorized assets from prohibited boundaries)
 *   - Tab 3: Assessment Console (Interactive tool execution, authorization gate enforcement, diagnostic logs)
 *   - Tab 4: Findings Studio (Vulnerability triage, true-positive validation vs benign false-positive rejection)
 *   - Tab 5: Evidence Vault (Cryptographic SHA-256 artifacts, chain-of-custody, analyst notes)
 *   - Tab 6: Executive Report (Debriefing deliverable, CISO grading & authorization sign-off)
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated, in-memory domain execution.
 * Zero real network sockets · Zero host commands · Zero live external probes.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useOptionalSimulation } from '@/application/simulation';
import { audioEvents } from '@/presentation/audio';
import {
  ActionCategory,
  FindingSeverity,
  FindingStatus,
  RedTeamAssessmentState,
  RedTeamReportSubmission,
} from '@/simulation/cyber/redteam/types';
import {
  createInitialRedTeamAssessmentState,
} from '@/simulation/cyber/redteam/scenarioFixtures';
import { RedTeamEngine } from '@/simulation/cyber/redteam/redTeamEngine';
import { RedTeamAuthorizationGate } from '@/simulation/cyber/redteam/authorizationGate';

export type RedTeamTab =
  | 'scope'
  | 'targets'
  | 'console'
  | 'findings'
  | 'evidence'
  | 'report';

export interface RedTeamAppProps {
  readonly initialTab?: RedTeamTab;
}

export const RedTeamApp: React.FC<RedTeamAppProps> = ({ initialTab }) => {
  const sim = useOptionalSimulation();

  // Fallback local state if mounted outside SimulationProvider or initialized via preset
  const [localAssessmentState, setLocalAssessmentState] = useState<RedTeamAssessmentState>(() => {
    const base = createInitialRedTeamAssessmentState();
    if (typeof window === 'undefined') return base;
    const params = new URLSearchParams(window.location.search);
    const preset = params.get('redPreset');
    const accepted = params.get('redAccepted');

    if (preset === 'approved') {
      let s: RedTeamAssessmentState = {
        ...base,
        isAcceptedByPlayer: true,
        acceptedAtSimTime: 28800,
        activePhase: 'COMPLETED',
        executedActionIds: ['act-01', 'act-02', 'act-03'],
      };
      s = RedTeamEngine.validateFinding(s, 'VULN-CEDAR-001', 'VALIDATE', 'Confirmed BOLA via unauthenticated parameter tampering', 29000);
      s = RedTeamEngine.validateFinding(s, 'VULN-CEDAR-002', 'VALIDATE', 'SMB signing disabled allows NTLM relay', 29050);
      s = RedTeamEngine.validateFinding(s, 'VULN-CEDAR-003', 'VALIDATE', 'Client headers forwarded without sanitization', 29100);
      s = RedTeamEngine.validateFinding(s, 'VULN-CEDAR-004', 'REJECT', 'Standard TLS 1.2 configuration with forward secrecy', 29150);

      const sub: RedTeamReportSubmission = {
        assessmentId: s.roe.assessmentId,
        executiveSummary: 'Comprehensive authorized security assessment of Cedarline Corp DMZ and staging perimeter. Identified and validated 3 genuine vulnerabilities across web API access controls and SMB infrastructure, while discarding false-positive cipher alarms.',
        overallRiskLevel: 'CRITICAL',
        validatedFindingIds: ['VULN-CEDAR-001', 'VULN-CEDAR-002', 'VULN-CEDAR-003'],
        rejectedFalsePositiveIds: ['VULN-CEDAR-004'],
        limitationsDisclosed: [
          'Domain Controller (dc-core-01) excluded per Rules of Engagement',
          'Passive, non-disruptive testing only without denial-of-service',
        ],
        remediationRoadmap: [
          'Immediate: Implement JWT object-level tenant ownership validation on /api/v1/user/profile endpoints.',
          'Short-term: Enforce require_smb_signing=yes and disable SMBv1 across staging fileservers.',
          'Medium-term: Configure Envoy API Gateway request header stripping for internal identity claims.',
        ],
        preservedEvidenceIds: s.evidenceVault.map(e => e.id),
        submittedAtSimTime: 29500,
        assessorSignature: 'Lead Security Assessor',
      };

      const evalRes = RedTeamEngine.evaluateReportSubmission(sub, s);
      return {
        ...s,
        reportSubmission: sub,
        evaluationResult: evalRes,
        objectives: s.objectives.map(o => ({ ...o, isCompleted: true, completedAtSimTime: 29600 })),
      };
    }

    if (preset === 'validated') {
      let s: RedTeamAssessmentState = {
        ...base,
        isAcceptedByPlayer: true,
        acceptedAtSimTime: 28800,
        activePhase: 'FINDING_VALIDATION',
        executedActionIds: ['act-01', 'act-02', 'act-03'],
      };
      s = RedTeamEngine.validateFinding(s, 'VULN-CEDAR-001', 'VALIDATE', 'Confirmed BOLA via unauthenticated parameter tampering', 29000);
      s = RedTeamEngine.validateFinding(s, 'VULN-CEDAR-002', 'VALIDATE', 'SMB signing disabled allows NTLM relay', 29050);
      s = RedTeamEngine.validateFinding(s, 'VULN-CEDAR-003', 'VALIDATE', 'Client headers forwarded without sanitization', 29100);
      s = RedTeamEngine.validateFinding(s, 'VULN-CEDAR-004', 'REJECT', 'Standard TLS 1.2 configuration with forward secrecy', 29150);
      return s;
    }

    if (preset === 'executed') {
      const s: RedTeamAssessmentState = {
        ...base,
        isAcceptedByPlayer: true,
        acceptedAtSimTime: 28800,
        activePhase: 'TARGET_ASSESSMENT',
      };
      const act = RedTeamEngine.executeToolAction(s, {
        targetId: 'app-portal-01',
        toolId: 'tool-recon-enum',
        currentSimTime: 28900,
      });
      return {
        ...s,
        actionHistory: [act],
        executedActionIds: [act.actionId],
        evidenceVault: act.generatedEvidence ? [act.generatedEvidence, ...s.evidenceVault] : s.evidenceVault,
      };
    }

    if (preset === 'rejected_scope') {
      return {
        ...base,
        isAcceptedByPlayer: true,
        acceptedAtSimTime: 28800,
        activePhase: 'TARGET_ASSESSMENT',
      };
    }

    if (accepted === 'true') {
      return {
        ...base,
        isAcceptedByPlayer: true,
        acceptedAtSimTime: 28800,
        activePhase: 'RECON_DISCOVERY',
        objectives: base.objectives.map(o => (o.requiredAction === 'ACCEPT_ROE' ? { ...o, isCompleted: true, completedAtSimTime: 28800 } : o)),
      };
    }

    return base;
  });

  // Active state resolution: simulation context or local preview state
  const assessmentState: RedTeamAssessmentState = useMemo(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('redPreset') || params.get('redAccepted')) {
        return localAssessmentState;
      }
    }
    return sim?.state.redTeamAssessment ?? localAssessmentState;
  }, [sim?.state.redTeamAssessment, localAssessmentState]);

  // Tab navigation state with URL query parameter support
  const [activeTab, setActiveTab] = useState<RedTeamTab>(() => {
    if (initialTab) {
      return initialTab;
    }
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('redTab') as RedTeamTab | null;
      if (tabParam && ['scope', 'targets', 'console', 'findings', 'evidence', 'report'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'scope';
  });

  // Keep activeTab in sync when initialTab prop is provided
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Keep URL query param in sync for headless testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (url.searchParams.get('redTab') !== activeTab) {
        url.searchParams.set('redTab', activeTab);
        window.history.replaceState({}, '', url.toString());
      }
    }
  }, [activeTab]);

  // Selection states
  const [selectedTargetId, setSelectedTargetId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('redPreset') === 'rejected_scope') return 'dc-core-01';
      return params.get('redTarget') ?? 'app-portal-01';
    }
    return 'app-portal-01';
  });
  const [selectedToolId, setSelectedToolId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('redPreset') === 'rejected_scope') return 'tool-config-smb-audit';
      return params.get('redTool') ?? 'tool-recon-enum';
    }
    return 'tool-recon-enum';
  });
  const [selectedFindingId, setSelectedFindingId] = useState<string>('VULN-CEDAR-001');
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('EVD-M17-RECON-PORTAL');

  // Interactive input states
  const [assessorSignature, setAssessorSignature] = useState<string>('Lead Security Assessor');
  const [validationRationale, setValidationRationale] = useState<string>('');
  const [analystNoteCategory, setAnalystNoteCategory] = useState<'SCOPE' | 'OBSERVATION' | 'FINDING' | 'REMEDIATION'>('OBSERVATION');
  const [analystNoteTitle, setAnalystNoteTitle] = useState<string>('');
  const [analystNoteContent, setAnalystNoteContent] = useState<string>('');
  const [actionFeedback, setActionFeedback] = useState<{ isError?: boolean; message: string } | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('redPreset') === 'rejected_scope') {
        return {
          isError: true,
          message: 'AUTHORIZATION DENIED: Target dc-core-01 is OUT OF SCOPE. Rules of engagement strictly forbid engaging critical domain controller infrastructure outside staging DMZ.',
        };
      }
      if (params.get('redPreset') === 'executed') {
        return {
          isError: false,
          message: 'Simulated action "Passive Reconnaissance & Enumeration" on app-portal-01 executed successfully. Observations logged.',
        };
      }
    }
    return null;
  });

  // Selected entities resolution
  const selectedTarget = useMemo(() => {
    return assessmentState.targets.find(t => t.id === selectedTargetId) ?? assessmentState.targets[0]!;
  }, [assessmentState.targets, selectedTargetId]);

  const selectedTool = useMemo(() => {
    return assessmentState.availableTools.find(t => t.id === selectedToolId) ?? assessmentState.availableTools[0]!;
  }, [assessmentState.availableTools, selectedToolId]);

  const selectedFinding = useMemo(() => {
    return assessmentState.findings.find(f => f.id === selectedFindingId) ?? assessmentState.findings[0]!;
  }, [assessmentState.findings, selectedFindingId]);

  const selectedEvidence = useMemo(() => {
    return assessmentState.evidenceVault.find(e => e.id === selectedEvidenceId) ?? assessmentState.evidenceVault[0];
  }, [assessmentState.evidenceVault, selectedEvidenceId]);

  // Handler: Accept Rules of Engagement
  const handleAcceptRoE = () => {
    if (assessmentState.isAcceptedByPlayer) return;

    if (sim) {
      sim.dispatch({
        type: 'AcceptRulesOfEngagement',
        assessmentId: assessmentState.roe.assessmentId,
        assessorSignature: assessorSignature.trim() || 'Lead Security Assessor',
      });
    } else {
      setLocalAssessmentState(prev => ({
        ...prev,
        isAcceptedByPlayer: true,
        activePhase: 'RECON_DISCOVERY',
        acceptedAtSimTime: 28800,
        objectives: prev.objectives.map(o =>
          o.requiredAction === 'ACCEPT_ROE' ? { ...o, isCompleted: true, completedAtSimTime: 28800 } : o
        ),
      }));
    }

    try {
      audioEvents.dispatch({ type: 'TERMINAL_COMMAND_EXECUTED', outcome: 'success' });
    } catch {
      // Audio optional in test/headless
    }
    setActionFeedback({
      isError: false,
      message: `Rules of Engagement (${assessmentState.roe.assessmentId}) successfully signed and accepted. Technical assessments unlocked.`,
    });
  };

  // Handler: Execute Tool Action
  const handleExecuteAction = () => {
    const simTime = sim?.state.time.simulationTimeSeconds ?? 28900;

    // Check authorization gate first
    const gateCheck = RedTeamAuthorizationGate.evaluateScope(
      assessmentState,
      selectedTarget.id,
      selectedTool.category,
      selectedTool.name,
      simTime
    );

    if (!gateCheck.isAuthorized) {
      try {
        audioEvents.dispatch({ type: 'TERMINAL_COMMAND_EXECUTED', outcome: 'error' });
      } catch (err) {
        void err;
      }
      setActionFeedback({
        isError: true,
        message: `AUTHORIZATION DENIED: ${gateCheck.reason}`,
      });
      return;
    }

    if (sim) {
      sim.dispatch({
        type: 'ExecuteRedTeamAction',
        targetId: selectedTarget.id,
        toolId: selectedTool.id,
      });
    } else {
      const result = RedTeamEngine.executeToolAction(assessmentState, {
        targetId: selectedTarget.id,
        toolId: selectedTool.id,
        currentSimTime: simTime,
      });

      setLocalAssessmentState(prev => ({
        ...prev,
        actionHistory: [result, ...prev.actionHistory],
        executedActionIds: [result.actionId, ...prev.executedActionIds],
        evidenceVault: result.generatedEvidence
          ? [result.generatedEvidence, ...prev.evidenceVault.filter(e => e.id !== result.generatedEvidence!.id)]
          : prev.evidenceVault,
      }));
    }

    try {
      audioEvents.dispatch({ type: 'TERMINAL_COMMAND_EXECUTED', outcome: 'success' });
    } catch (err) {
      void err;
    }
    setActionFeedback({
      isError: false,
      message: `Simulated action "${selectedTool.name}" on ${selectedTarget.id} executed successfully. Observations logged.`,
    });
  };

  // Handler: Validate Finding
  const handleValidateFinding = (decision: 'VALIDATE' | 'REJECT' | 'MARK_UNRESOLVED') => {
    const rationale = validationRationale.trim() || `Analyst determined finding as ${decision}`;

    if (sim) {
      sim.dispatch({
        type: 'ValidateVulnerabilityFinding',
        findingId: selectedFinding.id,
        decision,
        rationale,
      });
    } else {
      const updated = RedTeamEngine.validateFinding(
        assessmentState,
        selectedFinding.id,
        decision,
        rationale,
        29100,
        'Lead Assessor'
      );
      setLocalAssessmentState(updated);
    }

    try {
      audioEvents.dispatch({ type: 'TERMINAL_COMMAND_EXECUTED', outcome: 'success' });
    } catch (err) {
      void err;
    }
    setValidationRationale('');
    setActionFeedback({
      isError: false,
      message: `Finding "${selectedFinding.id}" updated with status: ${decision === 'VALIDATE' ? 'VALIDATED' : decision === 'REJECT' ? 'REJECTED' : 'UNRESOLVED'}.`,
    });
  };

  // Handler: Add Analyst Note
  const handleAddAnalystNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!analystNoteTitle.trim() || !analystNoteContent.trim()) return;

    if (sim) {
      sim.dispatch({
        type: 'RecordRedTeamAnalystNote',
        title: analystNoteTitle.trim(),
        content: analystNoteContent.trim(),
        category: analystNoteCategory,
        linkedTargetId: selectedTarget.id,
        linkedFindingId: selectedFinding.id,
      });
    } else {
      const newNote = {
        id: `note-${Date.now()}`,
        timestampSimTime: 29200,
        title: analystNoteTitle.trim(),
        content: analystNoteContent.trim(),
        category: analystNoteCategory,
        linkedTargetId: selectedTarget.id,
        linkedFindingId: selectedFinding.id,
      };
      setLocalAssessmentState(prev => ({
        ...prev,
        analystNotes: [newNote, ...prev.analystNotes],
      }));
    }

    setAnalystNoteTitle('');
    setAnalystNoteContent('');
    setActionFeedback({
      isError: false,
      message: 'Analyst note recorded into assessment audit trail.',
    });
  };

  // Handler: Submit Final Report
  const handleSubmitReport = () => {
    const validatedIds = assessmentState.findings.filter(f => f.status === 'VALIDATED').map(f => f.id);
    const rejectedIds = assessmentState.findings.filter(f => f.status === 'REJECTED').map(f => f.id);

    const submission: RedTeamReportSubmission = {
      assessmentId: assessmentState.roe.assessmentId,
      executiveSummary:
        'Authorized penetration testing for Cedarline Services Ltd evaluated public perimeter, internal file sharing, and API gateway architectures. Confirmed 3 exploitable weaknesses (BOLA on app-portal-01, unsigned SMB on filesrv-01, proxy spoofing on api-gw-01). Identified and safely rejected 1 non-exploitable TLS cipher suite finding.',
      overallRiskLevel: validatedIds.length >= 3 ? 'CRITICAL' : 'HIGH',
      validatedFindingIds: validatedIds,
      rejectedFalsePositiveIds: rejectedIds,
      limitationsDisclosed: [
        'Assessment restricted strictly to RFC 1918 test subnets 10.0.1.0/24 and 10.0.4.0/24.',
        'Production domain controller (dc-core-01) and security SIEM (mon-siem-01) were excluded from active exploitation per RoE.',
        'No Denial of Service techniques were simulated to preserve enterprise SLA stability.',
      ],
      remediationRoadmap: [
        'Phase 1 (Immediate): Enforce session ownership validation on /api/v1/documents/:id endpoint.',
        'Phase 2 (Immediate): Group Policy update requiring mandatory SMB2 packet signing on filesrv-01.',
        'Phase 3 (Next Sprint): Configure API gateway to strip and overwrite untrusted X-Forwarded-For headers.',
      ],
      preservedEvidenceIds: assessmentState.evidenceVault.map(e => e.id),
      submittedAtSimTime: 29600,
      assessorSignature: assessorSignature.trim() || 'Lead Security Assessor',
    };

    if (sim) {
      sim.dispatch({
        type: 'SubmitAssessmentReport',
        submission,
      });
    } else {
      const evaluation = RedTeamEngine.evaluateReportSubmission(submission, assessmentState);
      setLocalAssessmentState(prev => ({
        ...prev,
        reportSubmission: submission,
        evaluationResult: evaluation,
        activePhase: 'COMPLETED',
        objectives: prev.objectives.map(o =>
          o.requiredAction === 'SUBMIT_ASSESSMENT_REPORT'
            ? { ...o, isCompleted: true, completedAtSimTime: 29600 }
            : o
        ),
      }));
    }

    try {
      audioEvents.dispatch({ type: 'MUSIC_PLAY_STINGER', stinger: 'music_mission_resolved' });
    } catch (err) {
      void err;
    }
    setActionFeedback({
      isError: false,
      message: 'Assessment report submitted. Client CISO evaluation and debriefing letter generated.',
    });
  };

  // Severity color tokens
  const getSeverityColor = (sev: FindingSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return '#ef4444';
      case 'HIGH':
        return '#f97316';
      case 'MEDIUM':
        return '#eab308';
      case 'LOW':
        return '#3b82f6';
      case 'INFORMATIONAL':
      default:
        return '#94a3b8';
    }
  };

  // Status color tokens
  const getStatusBadge = (status: FindingStatus) => {
    switch (status) {
      case 'VALIDATED':
        return { label: 'CONFIRMED TRUE POSITIVE', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'REJECTED':
        return { label: 'REJECTED (FALSE POSITIVE)', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'UNRESOLVED':
        return { label: 'UNRESOLVED / INSUFFICIENT', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
      case 'SUSPECTED':
      default:
        return { label: 'CANDIDATE (SUSPECTED)', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
    }
  };

  return (
    <div
      className="redteam-app-root"
      data-testid="redteam-app-root"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0a0d14',
        color: '#e2e8f0',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        userSelect: 'text',
      }}
    >
      {/* Top Banner / Header Bar */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '18px',
              color: '#ffffff',
              boxShadow: '0 0 12px rgba(220, 38, 38, 0.5)',
            }}
          >
            RT
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.02em' }}>
                {assessmentState.scenarioTitle}
              </h2>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: assessmentState.isAcceptedByPlayer ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: assessmentState.isAcceptedByPlayer ? '#10b981' : '#f87171',
                  border: `1px solid ${assessmentState.isAcceptedByPlayer ? '#10b981' : '#ef4444'}`,
                }}
              >
                {assessmentState.isAcceptedByPlayer ? 'ROE ACTIVE & SIGNED' : 'UNAUTHORIZED (ROE PENDING)'}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              Client: <strong style={{ color: '#cbd5e1' }}>{assessmentState.roe.clientOrganization}</strong> · Authorizing Official: <strong style={{ color: '#cbd5e1' }}>{assessmentState.roe.authorizingOfficial}</strong> · Ref: <code style={{ color: '#38bdf8' }}>{assessmentState.roe.assessmentId}</code>
            </div>
          </div>
        </div>

        {/* Global Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Objectives Completed: <strong style={{ color: '#38bdf8' }}>{assessmentState.objectives.filter(o => o.isCompleted).length} / {assessmentState.objectives.length}</strong>
            </div>
            <div
              style={{
                width: '120px',
                height: '6px',
                backgroundColor: '#1e293b',
                borderRadius: '3px',
                overflow: 'hidden',
                marginTop: '4px',
              }}
            >
              <div
                style={{
                  width: `${(assessmentState.objectives.filter(o => o.isCompleted).length / assessmentState.objectives.length) * 100}%`,
                  height: '100%',
                  backgroundColor: '#10b981',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Primary Navigation Tabs */}
      <nav
        style={{
          display: 'flex',
          backgroundColor: '#090d16',
          borderBottom: '1px solid #1e293b',
          padding: '0 16px',
        }}
      >
        {[
          { id: 'scope', label: '1. Briefing & Scope', badge: assessmentState.isAcceptedByPlayer ? 'Signed' : 'Action Req' },
          { id: 'targets', label: '2. Target Inventory', badge: `${assessmentState.targets.filter(t => t.inScope).length} In-Scope` },
          { id: 'console', label: '3. Assessment Console', badge: `${assessmentState.actionHistory.length} Runs` },
          { id: 'findings', label: '4. Findings Studio', badge: `${assessmentState.findings.filter(f => f.status === 'VALIDATED').length} Confirmed` },
          { id: 'evidence', label: '5. Evidence Vault', badge: `${assessmentState.evidenceVault.length} Items` },
          { id: 'report', label: '6. Report & Evaluation', badge: assessmentState.evaluationResult ? `${assessmentState.evaluationResult.scorePercentage}%` : 'Draft' },
        ].map(tab => {
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as RedTeamTab);
                setActionFeedback(null);
              }}
              data-testid={`tab-${tab.id}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 18px',
                border: 'none',
                borderBottom: isSelected ? '2px solid #ef4444' : '2px solid transparent',
                backgroundColor: isSelected ? 'rgba(239, 68, 68, 0.08)' : 'transparent',
                color: isSelected ? '#ffffff' : '#94a3b8',
                fontWeight: isSelected ? 600 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '0.65rem',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  backgroundColor: isSelected ? '#ef4444' : '#1e293b',
                  color: isSelected ? '#ffffff' : '#cbd5e1',
                }}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div
          role="status"
          style={{
            padding: '10px 20px',
            backgroundColor: actionFeedback.isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            borderBottom: `1px solid ${actionFeedback.isError ? '#ef4444' : '#10b981'}`,
            color: actionFeedback.isError ? '#fca5a5' : '#86efac',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{actionFeedback.message}</span>
          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            style={{
              background: 'none',
              border: 'none',
              color: 'currentColor',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Workspace Body */}
      <main style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {/* ========================================================================= */}
        {/* TAB 1: BRIEFING & SCOPE AUTHORIZATION                                     */}
        {/* ========================================================================= */}
        {activeTab === 'scope' && (
          <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Legal Authority & Written Engagement Mandate */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>
                    Written Authorization & Rules of Engagement Mandate
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
                    Document Ref: <strong style={{ color: '#38bdf8' }}>{assessmentState.roe.assessmentId}</strong> · Authorizing Official: <strong style={{ color: '#f8fafc' }}>{assessmentState.roe.authorizingOfficial}</strong> ({assessmentState.roe.authorizingRole})
                  </div>
                </div>
                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    backgroundColor: assessmentState.isAcceptedByPlayer ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: assessmentState.isAcceptedByPlayer ? '#10b981' : '#f59e0b',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    border: `1px solid ${assessmentState.isAcceptedByPlayer ? '#10b981' : '#f59e0b'}`,
                  }}
                >
                  {assessmentState.isAcceptedByPlayer ? 'LEGAL BOUNDARY ACTIVE' : 'PENDING OPERATOR SIGNATURE'}
                </div>
              </div>

              <div
                style={{
                  backgroundColor: '#0b1120',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '16px',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                  color: '#cbd5e1',
                  marginBottom: '20px',
                }}
              >
                <p style={{ marginTop: 0 }}>
                  <strong>LEGAL FRAMEWORK:</strong> {assessmentState.roe.legalFramework}
                </p>
                <p>
                  <strong>EMERGENCY CEASE-FIRE CONTACT:</strong> <code style={{ color: '#fca5a5' }}>{assessmentState.roe.emergencyStopContact}</code>
                </p>
                <p style={{ marginBottom: 0 }}>
                  <strong>AUTHORIZED SUB-NETWORKS:</strong> {assessmentState.roe.authorizedSubnets.join(', ')}
                </p>
              </div>

              {/* Permitted vs Prohibited Matrix */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                {/* Permitted Categories */}
                <div
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '6px',
                    padding: '16px',
                  }}
                >
                  <h4 style={{ margin: '0 0 12px 0', color: '#10b981', fontSize: '0.95rem', fontWeight: 600 }}>
                    Authorized Action Categories
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                    {assessmentState.roe.allowedActionCategories.map((cat: ActionCategory) => (
                      <li key={cat}>
                        <strong>{cat.replace(/_/g, ' ')}</strong>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prohibited Techniques */}
                <div
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.05)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: '6px',
                    padding: '16px',
                  }}
                >
                  <h4 style={{ margin: '0 0 12px 0', color: '#ef4444', fontSize: '0.95rem', fontWeight: 600 }}>
                    Strictly Prohibited Techniques (Hard Simulation Guards)
                  </h4>
                  <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                    {assessmentState.roe.prohibitedActions.map((act: string) => (
                      <li key={act}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Operator Signature & Acceptance Form */}
              <div
                style={{
                  backgroundColor: '#0b1120',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '20px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor="operator-sig-input"
                    style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '6px' }}
                  >
                    Assessor Formal Affirmation & Electronic Signature:
                  </label>
                  <input
                    id="operator-sig-input"
                    type="text"
                    value={assessorSignature}
                    onChange={e => setAssessorSignature(e.target.value)}
                    disabled={assessmentState.isAcceptedByPlayer}
                    placeholder="Enter your name / callsign"
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleAcceptRoE}
                  disabled={assessmentState.isAcceptedByPlayer || !assessorSignature.trim()}
                  data-testid="btn-accept-roe"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: assessmentState.isAcceptedByPlayer ? '#10b981' : '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    cursor: assessmentState.isAcceptedByPlayer ? 'default' : 'pointer',
                    boxShadow: assessmentState.isAcceptedByPlayer
                      ? 'none'
                      : '0 0 16px rgba(220, 38, 38, 0.4)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {assessmentState.isAcceptedByPlayer ? '✓ Rules of Engagement Accepted' : 'Confirm & Sign RoE'}
                </button>
              </div>
            </div>

            {/* Assessment Objectives Checklist */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '24px',
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: 700 }}>
                Operation Eko Citadel Assessment Objectives
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {assessmentState.objectives.map((obj, idx) => (
                  <div
                    key={obj.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 16px',
                      backgroundColor: obj.isCompleted ? 'rgba(16, 185, 129, 0.05)' : '#0b1120',
                      border: `1px solid ${obj.isCompleted ? 'rgba(16, 185, 129, 0.3)' : '#1e293b'}`,
                      borderRadius: '6px',
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        backgroundColor: obj.isCompleted ? '#10b981' : '#334155',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        marginTop: '2px',
                      }}
                    >
                      {obj.isCompleted ? '✓' : idx + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: obj.isCompleted ? '#10b981' : '#f8fafc' }}>
                          {obj.title}
                        </span>
                        {obj.isCompleted && (
                          <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>[COMPLETED]</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                        {obj.description}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', fontStyle: 'italic' }}>
                        Guidance: {obj.hint}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: TARGET INVENTORY & SCOPE EXPLORER                                  */}
        {/* ========================================================================= */}
        {activeTab === 'targets' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>
                  Target Assets & Scope Boundaries
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Evaluate authorized systems vs. prohibited out-of-scope enterprise boundaries. Actions against prohibited assets will be blocked by the simulation gate.
                </p>
              </div>
            </div>

            {/* Target Assets Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
              {assessmentState.targets.map(target => {
                const isSelected = target.id === selectedTargetId;
                return (
                  <div
                    key={target.id}
                    onClick={() => setSelectedTargetId(target.id)}
                    data-testid={`target-card-${target.id}`}
                    style={{
                      padding: '16px',
                      backgroundColor: isSelected ? '#1e293b' : '#0f172a',
                      border: `1px solid ${isSelected ? '#38bdf8' : target.inScope ? '#334155' : 'rgba(239, 68, 68, 0.4)'}`,
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* In-Scope / Out-of-Scope Ribbon */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        padding: '4px 10px',
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        borderBottomLeftRadius: '6px',
                        backgroundColor: target.inScope ? '#10b981' : '#dc2626',
                        color: '#ffffff',
                      }}
                    >
                      {target.inScope ? 'AUTHORIZED IN-SCOPE' : 'FORBIDDEN OUT-OF-SCOPE'}
                    </div>

                    <div style={{ marginTop: '4px' }}>
                      <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', color: '#f8fafc' }}>
                        {target.hostname}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                        {target.ipAddress} · {target.segmentName}
                      </div>
                    </div>

                    <div style={{ margin: '12px 0', fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.4' }}>
                      {target.scopeJustification}
                    </div>

                    {/* Services Pill List */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginBottom: '4px' }}>
                        Active Services & Endpoints:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {target.services.map(svc => (
                          <span
                            key={`${svc.port}-${svc.protocol}`}
                            style={{
                              fontSize: '0.7rem',
                              padding: '2px 8px',
                              backgroundColor: '#0b1120',
                              border: '1px solid #1e293b',
                              borderRadius: '4px',
                              color: svc.isVulnerable ? '#f97316' : '#cbd5e1',
                              fontFamily: 'monospace',
                            }}
                          >
                            {svc.port}/{svc.protocol} ({svc.name})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Target Action Button */}
                    <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedTargetId(target.id);
                          setActiveTab('console');
                        }}
                        style={{
                          padding: '6px 12px',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Select in Console →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SIMULATED ASSESSMENT CONSOLE & TOOLKIT                            */}
        {/* ========================================================================= */}
        {activeTab === 'console' && (
          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px', height: '100%' }}>
            {/* Left Control Panel: Tool & Target Selection */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1rem', color: '#f8fafc', fontWeight: 700 }}>
                Simulated Assessment Execution
              </h3>

              {/* Target Selector */}
              <div>
                <label
                  htmlFor="console-target-select"
                  style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}
                >
                  Target Asset:
                </label>
                <select
                  id="console-target-select"
                  value={selectedTargetId}
                  onChange={e => setSelectedTargetId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#0b1120',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                >
                  <optgroup label="Authorized In-Scope Targets">
                    {assessmentState.targets
                      .filter(t => t.inScope)
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          {t.hostname} ({t.ipAddress})
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Prohibited Out-of-Scope Targets">
                    {assessmentState.targets
                      .filter(t => !t.inScope)
                      .map(t => (
                        <option key={t.id} value={t.id}>
                          [FORBIDDEN] {t.hostname} ({t.ipAddress})
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Tool Selector */}
              <div>
                <label
                  htmlFor="console-tool-select"
                  style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}
                >
                  Fictional Security Assessment Tool:
                </label>
                <select
                  id="console-tool-select"
                  value={selectedToolId}
                  onChange={e => setSelectedToolId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#0b1120',
                    border: '1px solid #334155',
                    borderRadius: '6px',
                    color: '#ffffff',
                    fontSize: '0.85rem',
                  }}
                >
                  {assessmentState.availableTools.map(tl => (
                    <option key={tl.id} value={tl.id}>
                      {tl.name} ({tl.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Pedagogical Guidance Card */}
              <div
                style={{
                  backgroundColor: '#0b1120',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '14px',
                  fontSize: '0.8rem',
                  lineHeight: '1.5',
                  color: '#cbd5e1',
                  flex: 1,
                  overflow: 'auto',
                }}
              >
                <div style={{ color: '#38bdf8', fontWeight: 600, marginBottom: '6px' }}>
                  Educational Methodology:
                </div>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Evaluates:</strong> {selectedTool.pedagogicalExplanation.whatItEvaluates}
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  <strong>Why Authorized:</strong> {selectedTool.pedagogicalExplanation.whyPermittedInRoE}
                </p>
                <p style={{ margin: '0 0 8px 0', color: '#fcd34d' }}>
                  <strong>Establishes:</strong> {selectedTool.pedagogicalExplanation.whatResultEstablishes}
                </p>
                <p style={{ margin: 0, color: '#f87171' }}>
                  <strong>Does NOT Prove:</strong> {selectedTool.pedagogicalExplanation.whatResultDoesNotEstablish}
                </p>
              </div>

              {/* Execution Trigger */}
              <button
                type="button"
                onClick={handleExecuteAction}
                data-testid="btn-execute-action"
                style={{
                  padding: '12px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 0 14px rgba(220, 38, 38, 0.4)',
                }}
              >
                Execute Action ({selectedTool.name})
              </button>
            </div>

            {/* Right Panel: Simulated Live Console Stream & Diagnostic Logs */}
            <div
              style={{
                backgroundColor: '#030712',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: '12px',
                  borderBottom: '1px solid #1e293b',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                  <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                    Diagnostic Terminal & Diagnostic Trace
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Zero Host Execution · In-Memory Simulation Engine
                </span>
              </div>

              {/* Log History */}
              <div
                style={{
                  flex: 1,
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  fontSize: '0.8rem',
                }}
              >
                {assessmentState.actionHistory.length === 0 ? (
                  <div style={{ color: '#64748b', fontStyle: 'italic', padding: '20px' }}>
                    No actions executed yet. Select an authorized target and assessment tool, then click "Execute Action".
                  </div>
                ) : (
                  assessmentState.actionHistory.map(res => (
                    <div
                      key={res.actionId}
                      style={{
                        padding: '12px',
                        backgroundColor: res.status === 'BLOCKED' ? 'rgba(239, 68, 68, 0.08)' : '#0b1120',
                        border: `1px solid ${res.status === 'BLOCKED' ? 'rgba(239, 68, 68, 0.3)' : '#1e293b'}`,
                        borderRadius: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', marginBottom: '8px' }}>
                        <span>
                          [{res.toolName}] on <strong style={{ color: '#38bdf8' }}>{res.targetId}</strong>
                        </span>
                        <span style={{ color: res.status === 'BLOCKED' ? '#ef4444' : '#10b981', fontWeight: 700 }}>
                          [{res.status}]
                        </span>
                      </div>

                      {/* Observations */}
                      <div style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                        {res.observations.map((obs, i) => (
                          <div key={i}>&gt; {obs}</div>
                        ))}
                      </div>

                      {/* Evidence Pill */}
                      {res.generatedEvidence && (
                        <div
                          style={{
                            marginTop: '10px',
                            padding: '6px 10px',
                            backgroundColor: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid rgba(56, 189, 248, 0.3)',
                            borderRadius: '4px',
                            color: '#38bdf8',
                            fontSize: '0.75rem',
                          }}
                        >
                          Evidence Acquired: <strong>{res.generatedEvidence.title}</strong> (SHA-256: {res.generatedEvidence.hashSha256.substring(0, 16)}...)
                        </div>
                      )}

                      {/* Candidate Finding Identified */}
                      {res.candidateFindingId && (
                        <div
                          style={{
                            marginTop: '8px',
                            padding: '6px 10px',
                            backgroundColor: 'rgba(249, 115, 22, 0.1)',
                            border: '1px solid rgba(249, 115, 22, 0.3)',
                            borderRadius: '4px',
                            color: '#f97316',
                            fontSize: '0.75rem',
                          }}
                        >
                          Potential Weakness Identified: <strong>{res.candidateFindingId}</strong> (Triage in Findings Studio)
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: FINDINGS STUDIO & VALIDATION                                       */}
        {/* ========================================================================= */}
        {activeTab === 'findings' && (
          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px' }}>
            {/* Findings List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 700 }}>
                Identified Security Weaknesses ({assessmentState.findings.length})
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                Validate true positives against supporting evidence, and reject benign false positives.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                {assessmentState.findings.map(finding => {
                  const isSelected = finding.id === selectedFindingId;
                  const statusInfo = getStatusBadge(finding.status);
                  const sevColor = getSeverityColor(finding.severity);

                  return (
                    <div
                      key={finding.id}
                      onClick={() => setSelectedFindingId(finding.id)}
                      data-testid={`finding-card-${finding.id}`}
                      style={{
                        padding: '14px',
                        backgroundColor: isSelected ? '#1e293b' : '#0f172a',
                        border: `1px solid ${isSelected ? '#38bdf8' : '#334155'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: sevColor,
                            color: '#ffffff',
                          }}
                        >
                          {finding.severity}
                        </span>
                        <span
                          style={{
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            backgroundColor: statusInfo.bg,
                            color: statusInfo.color,
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginBottom: '4px' }}>
                        <span style={{ color: '#38bdf8', marginRight: '6px' }}>[{finding.id}]</span>
                        {finding.title}
                      </div>

                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Target: <strong style={{ color: '#cbd5e1' }}>{finding.targetId}</strong> · {finding.cveOrCwe}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Finding Detail & Validation Studio */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: getSeverityColor(selectedFinding.severity),
                        color: '#ffffff',
                      }}
                    >
                      {selectedFinding.severity}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                      {selectedFinding.cveOrCwe} · CVSS {selectedFinding.cvssScore}
                    </span>
                  </div>
                  <h3 style={{ margin: '8px 0 0 0', fontSize: '1.2rem', color: '#f8fafc', fontWeight: 700 }}>
                    <span style={{ color: '#38bdf8', marginRight: '8px' }}>[{selectedFinding.id}]</span>
                    {selectedFinding.title}
                  </h3>
                </div>

                <div
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: getStatusBadge(selectedFinding.status).bg,
                    color: getStatusBadge(selectedFinding.status).color,
                    border: `1px solid ${getStatusBadge(selectedFinding.status).color}`,
                  }}
                >
                  {getStatusBadge(selectedFinding.status).label}
                </div>
              </div>

              {/* Technical Description & Impact */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ backgroundColor: '#0b1120', padding: '16px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
                    Technical Description:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {selectedFinding.technicalDescription}
                  </div>
                </div>

                <div style={{ backgroundColor: '#0b1120', padding: '16px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
                    Fictional Business Impact:
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                    {selectedFinding.businessImpact}
                  </div>
                </div>
              </div>

              {/* Safe In-Game Reproduction Steps */}
              <div style={{ backgroundColor: '#0b1120', padding: '16px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, marginBottom: '6px' }}>
                  Safe In-Game Reproduction Steps (Zero Host Network Activity):
                </div>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                  {selectedFinding.safeReproductionSummary.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>

              {/* Strategic Remediation Recommendation */}
              <div style={{ backgroundColor: '#0b1120', padding: '16px', borderRadius: '6px', border: '1px solid #1e293b' }}>
                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginBottom: '6px' }}>
                  Recommended Remediation:
                </div>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: '1.5' }}>
                  {selectedFinding.remediationRecommendation}
                </div>
              </div>

              {/* Analyst Validation Controls */}
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#0b1120',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                  Analyst Validation Determination:
                </div>

                <div>
                  <label
                    htmlFor="validation-rationale-input"
                    style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}
                  >
                    Validation Rationale & Evidence Interpretation:
                  </label>
                  <input
                    id="validation-rationale-input"
                    type="text"
                    value={validationRationale}
                    onChange={e => setValidationRationale(e.target.value)}
                    placeholder="Provide justification based on observed simulation evidence..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#0f172a',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => handleValidateFinding('VALIDATE')}
                    data-testid="btn-validate-finding"
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#10b981',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Confirm Valid Finding (True Positive)
                  </button>

                  <button
                    type="button"
                    onClick={() => handleValidateFinding('REJECT')}
                    data-testid="btn-reject-finding"
                    style={{
                      flex: 1,
                      padding: '10px',
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Reject as Benign / False Positive
                  </button>

                  <button
                    type="button"
                    onClick={() => handleValidateFinding('MARK_UNRESOLVED')}
                    style={{
                      padding: '10px 16px',
                      backgroundColor: '#334155',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    Mark Unresolved
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: EVIDENCE VAULT & ANALYST NOTES                                     */}
        {/* ========================================================================= */}
        {activeTab === 'evidence' && (
          <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '20px' }}>
            {/* Evidence List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>
                Forensic Evidence Vault ({assessmentState.evidenceVault.length})
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8' }}>
                Authoritative cryptographic artifacts with SHA-256 hashes and chain-of-custody provenance.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                {assessmentState.evidenceVault.map(ev => {
                  const isSelected = ev.id === selectedEvidenceId;
                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEvidenceId(ev.id)}
                      data-testid={`evidence-card-${ev.id}`}
                      style={{
                        padding: '12px',
                        backgroundColor: isSelected ? '#1e293b' : '#0f172a',
                        border: `1px solid ${isSelected ? '#38bdf8' : '#334155'}`,
                        borderRadius: '6px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#38bdf8', fontFamily: 'monospace' }}>
                        {ev.id} · SHA-256: {ev.hashSha256.substring(0, 12)}...
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Evidence Inspector & Notes Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {selectedEvidence ? (
                <div
                  style={{
                    backgroundColor: '#0f172a',
                    border: '1px solid #1e293b',
                    borderRadius: '8px',
                    padding: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                        {selectedEvidence.title}
                      </h4>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        Source: <code style={{ color: '#38bdf8' }}>{selectedEvidence.source}</code> · Target: <strong style={{ color: '#cbd5e1' }}>{selectedEvidence.targetId}</strong>
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        color: '#10b981',
                      }}
                    >
                      INTEGRITY: {selectedEvidence.integrityStatus}
                    </span>
                  </div>

                  {/* SHA-256 Cryptographic Hash */}
                  <div
                    style={{
                      padding: '10px',
                      backgroundColor: '#0b1120',
                      border: '1px solid #1e293b',
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      color: '#a5f3fc',
                      wordBreak: 'break-all',
                      marginBottom: '16px',
                    }}
                  >
                    SHA-256: {selectedEvidence.hashSha256}
                  </div>

                  {/* Raw Artifact Snippet */}
                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                      Diagnostic Trace & Packet Payload Snippet:
                    </div>
                    <pre
                      style={{
                        backgroundColor: '#030712',
                        border: '1px solid #1e293b',
                        borderRadius: '4px',
                        padding: '12px',
                        fontSize: '0.75rem',
                        color: '#cbd5e1',
                        overflow: 'auto',
                        lineHeight: '1.5',
                        margin: 0,
                      }}
                    >
                      {selectedEvidence.artifactSnippet.join('\n')}
                    </pre>
                  </div>

                  {/* Chain of Custody */}
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '6px' }}>
                      Cryptographic Chain of Custody Audit:
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {selectedEvidence.chainOfCustody.map((coc, i) => (
                        <div
                          key={i}
                          style={{
                            fontSize: '0.75rem',
                            padding: '6px 10px',
                            backgroundColor: '#0b1120',
                            borderRadius: '4px',
                            color: '#94a3b8',
                            display: 'flex',
                            justifyContent: 'space-between',
                          }}
                        >
                          <span>{coc.action} by <strong>{coc.handler}</strong></span>
                          <span style={{ fontFamily: 'monospace' }}>Sig: {coc.signature.substring(0, 16)}...</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Add Analyst Note Form */}
              <div
                style={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #1e293b',
                  borderRadius: '8px',
                  padding: '20px',
                }}
              >
                <h4 style={{ margin: '0 0 12px 0', fontSize: '0.95rem', color: '#f8fafc' }}>
                  Record Professional Assessment Note
                </h4>
                <form onSubmit={handleAddAnalystNote} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="Note Title / Subject"
                      value={analystNoteTitle}
                      onChange={e => setAnalystNoteTitle(e.target.value)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#0b1120',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                      }}
                    />
                    <select
                      value={analystNoteCategory}
                      onChange={e =>
                        setAnalystNoteCategory(
                          e.target.value as 'SCOPE' | 'OBSERVATION' | 'FINDING' | 'REMEDIATION'
                        )
                      }
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#0b1120',
                        border: '1px solid #334155',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value="SCOPE">Scope Compliance</option>
                      <option value="OBSERVATION">Technical Observation</option>
                      <option value="FINDING">Vulnerability Note</option>
                      <option value="REMEDIATION">Remediation Roadmap</option>
                    </select>
                  </div>

                  <textarea
                    rows={3}
                    placeholder="Enter analytical observation, technical reproduction context, or risk justification..."
                    value={analystNoteContent}
                    onChange={e => setAnalystNoteContent(e.target.value)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#0b1120',
                      border: '1px solid #334155',
                      borderRadius: '6px',
                      color: '#ffffff',
                      fontSize: '0.85rem',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={!analystNoteTitle.trim() || !analystNoteContent.trim()}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#0284c7',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Save Analyst Note
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: EXECUTIVE REPORT & CISO DEBRIEFING                                  */}
        {/* ========================================================================= */}
        {activeTab === 'report' && (
          <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Evaluation Scorecard (If submitted) */}
            {assessmentState.evaluationResult && (
              <div
                style={{
                  padding: '24px',
                  backgroundColor: assessmentState.evaluationResult.isApproved ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                  border: `2px solid ${assessmentState.evaluationResult.isApproved ? '#10b981' : '#ef4444'}`,
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.3rem', color: '#ffffff', fontWeight: 800 }}>
                      CISO Technical Evaluation & Assessment Sign-off
                    </h3>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
                      Reviewer: <strong style={{ color: '#ffffff' }}>{assessmentState.roe.authorizingOfficial}</strong> ({assessmentState.roe.authorizingRole})
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '2rem',
                      fontWeight: 900,
                      color: assessmentState.evaluationResult.isApproved ? '#10b981' : '#ef4444',
                    }}
                  >
                    {assessmentState.evaluationResult.scorePercentage}%
                  </div>
                </div>

                <div style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.6', marginBottom: '16px' }}>
                  {assessmentState.evaluationResult.feedbackSummary}
                </div>

                {/* Score breakdown metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div style={{ backgroundColor: '#0b1120', padding: '12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Confirmed True Findings</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981', marginTop: '2px' }}>
                      {assessmentState.evaluationResult.correctFindingsCount} / {assessmentState.evaluationResult.totalExpectedFindings}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#0b1120', padding: '12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>False Positive Identified</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: assessmentState.evaluationResult.falsePositiveCorrectlyIdentified ? '#10b981' : '#ef4444', marginTop: '2px' }}>
                      {assessmentState.evaluationResult.falsePositiveCorrectlyIdentified ? 'PASS (Rejected)' : 'FAIL'}
                    </div>
                  </div>

                  <div style={{ backgroundColor: '#0b1120', padding: '12px', borderRadius: '6px' }}>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>RoE Scope Boundaries</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: assessmentState.evaluationResult.outOfScopeAssetsRespected ? '#10b981' : '#ef4444', marginTop: '2px' }}>
                      {assessmentState.evaluationResult.outOfScopeAssetsRespected ? '100% Respected' : 'Violated'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Assessment Report Preview Deliverable */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '1px solid #1e293b',
                borderRadius: '8px',
                padding: '24px',
              }}
            >
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: 700 }}>
                Executive Penetration Testing Report Deliverable
              </h3>

              <div
                style={{
                  backgroundColor: '#030712',
                  border: '1px solid #1e293b',
                  borderRadius: '6px',
                  padding: '20px',
                  fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                  fontSize: '0.8rem',
                  lineHeight: '1.6',
                  color: '#cbd5e1',
                  overflow: 'auto',
                  maxHeight: '400px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {RedTeamEngine.generateExecutiveDeliverable(assessmentState)}
              </div>

              {/* Submit Final Assessment Button */}
              {!assessmentState.evaluationResult && (
                <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={handleSubmitReport}
                    data-testid="btn-submit-report"
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 0 16px rgba(220, 38, 38, 0.4)',
                    }}
                  >
                    Submit Final Report to CISO Goodness
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
