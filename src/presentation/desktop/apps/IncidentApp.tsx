/**
 * Cyberlife — Incident Response Portal Application Component
 *
 * Dedicated incident management console for "The Aster Incident" at Cedarline Services.
 * Provides:
 * - 9-phase mission progression tracker.
 * - Live objective checklist with contextual hints.
 * - Briefing review & scope of authorization.
 * - Root-cause hypothesis & evidence correlation submission.
 * - Live Aster service status, containment, and least-privilege remediation controls.
 * - System verification runner testing actual simulated security properties.
 * - Structured 7-section incident report submission and learning debrief.
 *
 * SAFETY INVARIANT:
 * 100% simulated in-game state — zero host access, zero real shell or network calls.
 */

import React, { useState } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { AsterIncidentPhase, IncidentReportData } from '@/simulation/missions/types';
import {
  validateRootCauseAssessment,
  validateIncidentReport,
} from '@/simulation/missions/asterIncidentGroundTruth';
import { CommandCopyChip } from '../components/CommandCopyChip';

export type IncidentAppTab =
  | 'overview'
  | 'tickets'
  | 'briefing'
  | 'rootcause'
  | 'containment'
  | 'verification'
  | 'report';

export const OBJECTIVE_COMMANDS: Record<string, string[]> = {
  'obj-assess-01': ['netmap hosts'],
  'obj-investigate-01': ['svcscan inspect app-portal-01', 'svcscan inspect filesrv-01'],
  'obj-investigate-02': ['logview recent', 'logview filter --severity=WARN'],
  'obj-evidence-01': ['evidence inspect EVD-2026-004', 'evidence list'],
  'obj-containment-01': ['aster-admin contain'],
  'obj-remediation-01': ['aster-admin remediate --role=kb-assistant'],
  'obj-verification-01': ['aster-admin verify'],
  // Backwards compatibility aliases
  'obj-02-network': ['netmap hosts'],
  'obj-03-enumerate': ['svcscan inspect app-portal-01', 'svcscan inspect filesrv-01'],
  'obj-04-siem': ['logview recent', 'logview filter --severity=WARN'],
  'obj-05-evidence': ['evidence inspect EVD-2026-004', 'evidence list'],
  'obj-06-rootcause': ['aster-admin contain'],
  'obj-07-remediate': ['aster-admin remediate --role=kb-assistant'],
  'obj-08-verify': ['aster-admin verify'],
};

export const IncidentApp: React.FC = () => {
  const sim = useOptionalSimulation();
  const mission = sim?.state.mission;
  const activeTickets = sim?.state.episode?.activeTickets ?? [];

  const [activeTab, setActiveTab] = useState<IncidentAppTab>('overview');
  const [reportCopied, setReportCopied] = useState<boolean>(false);

  // Root-cause assessment form state
  const [suspectedCause, setSuspectedCause] = useState<string>('overprivileged_iam_role');
  const [affectedComponent, setAffectedComponent] = useState<string>('app-portal-01');
  const [observedImpact, setObservedImpact] = useState<string>(
    'unauthorized_confidential_file_access'
  );
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState<string[]>([
    'LOG-2026-107B',
    'EVD-2026-004',
  ]);
  const [assessmentRationale, setAssessmentRationale] = useState<string>(
    'Aster AI was assigned role:corporate-admin with wildcard permissions, enabling unauthorized file read of payroll spreadsheet from filesrv-01.'
  );
  const [remainingUncertainty, setRemainingUncertainty] = useState<string>(
    'Need to verify whether any external egress occurred (none observed in perimeter logs).'
  );
  const [assessmentFeedback, setAssessmentFeedback] = useState<{
    accepted: boolean;
    feedback: string;
  } | null>(null);

  // Remediation selection state
  const [selectedRole, setSelectedRole] = useState<'kb-assistant' | 'corporate-admin'>(
    'kb-assistant'
  );

  // Incident report form state
  const [reportForm, setReportForm] = useState<IncidentReportData>({
    executiveSummary:
      'On Oct 12, 2026, Cedarline Services detected unauthorized access by internal AI assistant Aster to confidential payroll data on departmental file server filesrv-01.',
    timeline:
      '07:50:00 - Normal health check\n07:52:14 - Aster reads payroll_q3_confidential.xlsx via SMB:445\n07:52:30 - SIEM privilege mismatch alert LOG-2026-109B flagged\n08:00:00 - Incident response initiated',
    affectedSystems: ['app-portal-01', 'filesrv-01'],
    rootCause:
      'Misconfigured IAM policy granting Aster role:corporate-admin with wildcard scopes ["*"], violating the principle of least privilege.',
    impactAssessment:
      'Unauthorized access to confidential Q3 payroll data. No customer-facing outage or external data exfiltration was observed.',
    containmentActions:
      'Contained by severing SMB port 445 network pathways and placing Aster into restricted operating mode.',
    remediationActions:
      'Remediated by applying role:kb-assistant and restricting scopes to ["docs:read", "kb:search"].',
    verificationResults:
      'Verified via automated test suite: Knowledge search succeeds (200 OK); SMB file access blocked (403 Forbidden).',
    recommendations:
      'Enforce least-privilege IAM policies on all automated agents; implement periodic automated permission auditing.',
  });

  const [reportFeedback, setReportFeedback] = useState<{
    accepted: boolean;
    feedback: string;
    score: number;
    missingSections: string[];
  } | null>(null);

  if (!mission) {
    return (
      <div className="incident-app-container">
        <div className="incident-empty-state">
          <h3>Incident System Offline</h3>
          <p>No active mission data found in current simulation state.</p>
        </div>
      </div>
    );
  }

  // Handle phase advance
  const handleAdvancePhase = (targetPhase: AsterIncidentPhase) => {
    if (!sim) return;
    sim.dispatch({
      type: 'AdvanceAsterMissionPhase',
      targetPhase,
    });
  };

  // Handle Root-Cause Assessment Submission
  const handleSubmitAssessment = () => {
    if (!sim) return;

    const causeDescription =
      suspectedCause === 'overprivileged_iam_role'
        ? 'Over-privileged IAM role assignment (role:corporate-admin) with wildcard permissions'
        : suspectedCause === 'credential_leak'
          ? 'Compromised employee password or leaked credential'
          : 'Prompt injection bypass on web frontend';

    const impactDescription =
      observedImpact === 'unauthorized_confidential_file_access'
        ? 'Unauthorized access and extraction of confidential payroll spreadsheet from filesrv-01'
        : 'Service denial crash';

    const assessmentInput = {
      suspectedRootCause: causeDescription,
      affectedComponent,
      observedImpact: impactDescription,
      supportingEvidenceIds: selectedEvidenceIds,
      uncertaintyOrNotes: remainingUncertainty,
    };

    const validation = validateRootCauseAssessment(assessmentInput);
    setAssessmentFeedback({
      accepted: validation.isAccurate,
      feedback: validation.feedback,
    });

    sim.dispatch({
      type: 'SubmitRootCauseAssessment',
      ...assessmentInput,
    });
  };

  // Handle Containment
  const handleExecuteContainment = () => {
    if (!sim) return;
    sim.dispatch({
      type: 'ExecuteContainment',
      action: 'isolate_service',
      reason: 'Severed SMB Port 445 network route and placed Aster in restricted operating mode.',
    });
  };

  // Handle Remediation
  const handleExecuteRemediation = () => {
    if (!sim) return;
    sim.dispatch({
      type: 'RemediatePermissions',
      targetPolicyRole: selectedRole,
      removeSmbAccess: true,
      removeDatabaseAccess: true,
      grantedScopes: selectedRole === 'kb-assistant' ? ['docs:read', 'kb:search'] : ['*'],
    });
  };

  // Handle Verification
  const handleRunVerification = () => {
    if (!sim) return;
    sim.dispatch({
      type: 'VerifyRemediation',
    });
  };

  // Handle Incident Report Submission
  const handleSubmitReport = () => {
    if (!sim) return;
    const validation = validateIncidentReport(reportForm, {
      isContained: mission.isContained,
      isRemediated: mission.isRemediated,
      isVerified: mission.isVerified,
      asterService: mission.asterService,
    });

    setReportFeedback({
      accepted: validation.isApproved,
      feedback: validation.reviewerFeedback,
      score: validation.score,
      missingSections: validation.isApproved
        ? []
        : ['Verification/Remediation alignment incomplete'],
    });

    sim.dispatch({
      type: 'SubmitIncidentReport',
      report: reportForm,
    });
  };

  // Auto-populate report with verified facts
  const handleAutoPopulateReport = () => {
    setReportForm({
      executiveSummary:
        'Cedarline Services Incident Response concluded an investigation into AI Assistant Aster (app-portal-01). Aster was granted excessive corporate-admin privileges and accessed confidential payroll data on filesrv-01.',
      timeline:
        '07:50:00 - Aster routine healthcheck OK\n07:52:14 - Aster accesses payroll_q3_confidential.xlsx on filesrv-01 (LOG-2026-107B)\n07:52:30 - SIEM mismatch alert LOG-2026-109B triggered\n08:05:00 - Evidence EVD-2026-004 preserved\n08:10:00 - Aster contained; SMB pathway severed\n08:15:00 - IAM policy remediated to role:kb-assistant',
      affectedSystems: ['app-portal-01', 'filesrv-01'],
      rootCause:
        'Over-privileged service account configuration: svc-aster was assigned role:corporate-admin with wildcard scopes ["*"], allowing network calls outside its intended knowledge-base search domain.',
      impactAssessment:
        'Confidential payroll information accessed internally. No external data transmission detected.',
      containmentActions:
        'Severed SMB port 445 network access and locked Aster into restricted operating mode.',
      remediationActions:
        'Replaced IAM role with role:kb-assistant and restricted scopes to ["docs:read", "kb:search"].',
      verificationResults:
        'Automated verification passed: Knowledge search (docs:read) succeeded (200 OK), while SMB queries to filesrv-01 were rejected with 403 Forbidden.',
      recommendations:
        '1. Apply Principle of Least Privilege to all internal service accounts.\n2. Implement automated IAM scope audits.\n3. Segment AI assistant subnets from departmental file storage servers.',
    });
  };

  // Copy entire formatted report draft to clipboard
  const handleCopyReportDraft = async () => {
    const reportText = `# CEDARLINE SERVICES // OFFICIAL INCIDENT REPORT
Case ID: IR Case #2026-AST-01
Subject: The Aster Incident // Unauthorized AI Assistant Data Access
Date: Oct 12, 2026 // Subnet: 10.0.4.0/24

## 1. Executive Summary
${reportForm.executiveSummary}

## 2. Incident Timeline
${reportForm.timeline}

## 3. Affected Systems & Resources
${reportForm.affectedSystems.join(', ')}

## 4. Root Cause Analysis
${reportForm.rootCause}

## 5. Containment Actions
${reportForm.containmentActions}

## 6. Remediation Actions
${reportForm.remediationActions}

## 7. Verification Results
${reportForm.verificationResults}

## 8. Preventative Recommendations
${reportForm.recommendations}
`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(reportText);
      }
    } catch {
      // Fallback
    }
    setReportCopied(true);
    setTimeout(() => setReportCopied(false), 2000);
  };

  const phasesList: { key: AsterIncidentPhase; label: string; icon: string }[] = [
    { key: 'briefing', label: '1. Briefing', icon: '📋' },
    { key: 'initial_assessment', label: '2. Assessment', icon: '🔍' },
    { key: 'investigation', label: '3. Investigation', icon: '🕵️' },
    { key: 'evidence_preservation', label: '4. Evidence', icon: '📦' },
    { key: 'containment', label: '5. Containment', icon: '🛑' },
    { key: 'remediation', label: '6. Remediation', icon: '🔧' },
    { key: 'verification', label: '7. Verification', icon: '✅' },
    { key: 'reporting', label: '8. Reporting', icon: '📝' },
    { key: 'completed', label: '9. Completed', icon: '🏆' },
  ];

  const currentPhaseIndex = phasesList.findIndex(p => p.key === mission.phase);
  const completedObjectivesCount = mission.objectives.filter(o => o.isCompleted).length;

  return (
    <div
      className="incident-app-container"
      role="region"
      aria-label="Incident Response Portal"
      data-testid="incident-app-container"
    >
      {/* Portal Top Header */}
      <div className="incident-portal-header">
        <div className="portal-header-left">
          <div className="portal-alert-icon" aria-hidden="true">
            🚨
          </div>
          <div>
            <div className="portal-org-tag">CEDARLINE SERVICES // SECURITY OPERATIONS CENTER</div>
            <h2 className="portal-mission-title">The Aster Incident — IR Case #2026-AST-01</h2>
          </div>
        </div>

        <div className="portal-header-right">
          <div className="portal-phase-pill">
            <span className="phase-pill-dot" />
            <span>PHASE: {mission.phase.toUpperCase().replace('_', ' ')}</span>
          </div>
          <div className="portal-progress-badge">
            {completedObjectivesCount}/{mission.objectives.length} Objectives
          </div>
        </div>
      </div>

      {/* 9-Phase Progression Bar */}
      <div className="incident-phase-tracker" role="navigation" aria-label="Incident Phases">
        {phasesList.map((phaseItem, index) => {
          const isDone = index < currentPhaseIndex || mission.isCompleted;
          const isCurrent = index === currentPhaseIndex && !mission.isCompleted;
          return (
            <div
              key={phaseItem.key}
              className={`phase-step ${isDone ? 'step-done' : ''} ${isCurrent ? 'step-current' : ''}`}
              title={`Phase: ${phaseItem.label}`}
              data-testid={`phase-step-${phaseItem.key}`}
            >
              <span className="step-icon">{isDone ? '✓' : phaseItem.icon}</span>
              <span className="step-label">{phaseItem.label}</span>
            </div>
          );
        })}
      </div>

      {/* Navigation Tabs */}
      <div className="incident-nav-tabs" role="tablist">
        <button
          type="button"
          className={`incident-tab-btn ${activeTab === 'overview' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
          data-testid="incident-tab-overview"
        >
          🎯 Objectives &amp; Guide
        </button>
        <button
          type="button"
          className={`incident-tab-btn ${activeTab === 'tickets' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'tickets'}
          onClick={() => setActiveTab('tickets')}
          data-testid="incident-tab-tickets"
        >
          🎫 Dispatch &amp; Tickets {activeTickets.length > 0 && `(${activeTickets.length})`}
        </button>
        <button
          type="button"
          className={`incident-tab-btn ${activeTab === 'briefing' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'briefing'}
          onClick={() => setActiveTab('briefing')}
          data-testid="incident-tab-briefing"
        >
          📄 Briefing &amp; Authorization
        </button>
        <button
          type="button"
          className={`incident-tab-btn ${activeTab === 'rootcause' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'rootcause'}
          onClick={() => setActiveTab('rootcause')}
          data-testid="incident-tab-rootcause"
        >
          🔍 Root-Cause Analysis
        </button>
        <button
          type="button"
          className={`incident-tab-btn ${activeTab === 'containment' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'containment'}
          onClick={() => setActiveTab('containment')}
          data-testid="incident-tab-containment"
        >
          🛑 Contain &amp; Remediate
        </button>
        <button
          type="button"
          className={`incident-tab-btn ${activeTab === 'verification' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'verification'}
          onClick={() => setActiveTab('verification')}
          data-testid="incident-tab-verification"
        >
          ✅ System Verification
        </button>
        <button
          type="button"
          className={`incident-tab-btn ${activeTab === 'report' ? 'tab-active' : ''}`}
          role="tab"
          aria-selected={activeTab === 'report'}
          onClick={() => setActiveTab('report')}
          data-testid="incident-tab-report"
        >
          📝 Incident Report
        </button>
      </div>

      {/* Tab Contents */}
      <div className="incident-tab-body">
        {/* TAB 1: Overview & Objectives */}
        {activeTab === 'overview' && (
          <div className="incident-panel" data-testid="incident-panel-overview">
            <div className="panel-intro-card">
              <h3 className="panel-card-title">Investigation Roadmap &amp; Objectives</h3>
              <p>
                As Junior Cybersecurity Analyst at Cedarline Services, your mission is to
                investigate suspicious behavior from internal AI assistant <strong>Aster</strong>,
                preserve evidence, execute containment, remediate the excessive permissions
                according to the <strong>Principle of Least Privilege</strong>, verify recovery, and
                publish the incident report.
              </p>
            </div>

            <div className="objectives-list-container">
              {mission.objectives.map(obj => {
                const isCompleted = obj.isCompleted;

                return (
                  <div
                    key={obj.id}
                    className={`objective-item-card ${isCompleted ? 'obj-completed' : 'obj-current'}`}
                    data-testid={`objective-card-${obj.id}`}
                  >
                    <div className="obj-header">
                      <div className="obj-title-group">
                        <span className="obj-status-icon">{isCompleted ? '✅' : '⏳'}</span>
                        <strong className="obj-title">{obj.title}</strong>
                        <span className="obj-phase-tag">{obj.phase}</span>
                      </div>
                      <span
                        className={`obj-badge ${isCompleted ? 'status-completed' : 'status-in_progress'}`}
                      >
                        {isCompleted ? 'COMPLETED' : 'IN PROGRESS'}
                      </span>
                    </div>

                    <p className="obj-desc">{obj.description}</p>

                    {obj.hint && (
                      <div className="obj-hint-box">
                        <span className="hint-label">💡 Analyst Guidance:</span>
                        <span className="hint-text">{obj.hint}</span>
                      </div>
                    )}

                    {OBJECTIVE_COMMANDS[obj.id] && (
                      <div
                        className="obj-commands-container"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          marginTop: '8px',
                        }}
                      >
                        {OBJECTIVE_COMMANDS[obj.id]!.map(cmd => (
                          <CommandCopyChip
                            key={cmd}
                            command={cmd}
                            label="Recommended Terminal Command"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: Dispatch & Tickets */}
        {activeTab === 'tickets' && (
          <div className="incident-panel" data-testid="incident-panel-tickets">
            <div className="panel-intro-card">
              <h3 className="panel-card-title">SecOps Incident Dispatch &amp; Assigned Tickets</h3>
              <p>
                Incoming tickets dispatched by SecOps Leadership and automated perimeter monitors.
              </p>
            </div>
            {activeTickets.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                No active tickets in current queue.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                {activeTickets.map(ticket => (
                  <div
                    key={ticket.ticketId}
                    style={{
                      background: 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      borderRadius: '8px',
                      padding: '1.2rem',
                    }}
                    data-testid={`incident-ticket-${ticket.ticketId}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#00e5ff', fontSize: '1rem' }}>
                          {ticket.ticketId}
                        </span>
                        <span style={{
                          fontSize: '0.72rem',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          textTransform: 'uppercase',
                          fontWeight: 700,
                          background: ticket.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: ticket.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                          border: `1px solid ${ticket.severity === 'CRITICAL' ? '#ef4444' : '#f59e0b'}`,
                        }}>
                          {ticket.severity}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Scope: {ticket.scope}
                      </span>
                    </div>

                    <h4 style={{ margin: '0.6rem 0 0.4rem', color: '#f8fafc', fontSize: '1.05rem' }}>
                      {ticket.title}
                    </h4>

                    <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem', color: '#94a3b8', margin: '0.4rem 0 0.8rem' }}>
                      <span><strong>Target System:</strong> {ticket.targetSystem}</span>
                      <span><strong>Requester:</strong> {ticket.requester}</span>
                      <span><strong>Organization:</strong> {ticket.organization}</span>
                    </div>

                    <p style={{ color: '#cbd5e1', fontSize: '0.85rem', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                      {ticket.description}
                    </p>

                    {ticket.instructions && ticket.instructions.length > 0 && (
                      <div style={{ marginTop: '0.8rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', marginBottom: '0.3rem' }}>
                          Investigation Instructions:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#94a3b8', fontSize: '0.8rem' }}>
                          {ticket.instructions.map((inst, i) => (
                            <li key={i}>{inst}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Briefing & Authorization */}
        {activeTab === 'briefing' && (
          <div className="incident-panel" data-testid="incident-panel-briefing">
            <div className="briefing-memo-card">
              <div className="memo-top">
                <span className="memo-badge">OFFICIAL IR BRIEFING</span>
                <span className="memo-date">Oct 12, 2026 // 08:00 WAT</span>
              </div>
              <div className="memo-meta">
                <div>
                  <strong>From:</strong> Blessing (Lead Security Analyst, Cedarline Services)
                </div>
                <div>
                  <strong>To:</strong> Protector (Junior Incident Responder)
                </div>
                <div>
                  <strong>Case:</strong> The Aster Incident // Unauthorized Data Access
                </div>
              </div>
              <div className="memo-content">
                <p>
                  Welcome to the Cedarline Security Operations Center. We have detected suspicious
                  activity involving our internal AI assistant, <strong>Aster</strong> (hosted on{' '}
                  <code>app-portal-01:5050</code>).
                </p>
                <p>
                  Preliminary SIEM alerts indicate that Aster recently initiated unexpected SMB
                  queries against our departmental file server (<code>filesrv-01:445</code>) and
                  accessed a confidential payroll document (
                  <code>payroll_q3_confidential.xlsx</code>).
                </p>
                <h4>Scope of Authorization</h4>
                <p>
                  You are officially authorized to conduct incident response across the Cedarline
                  subnet (<code>10.0.4.0/24</code>). Specifically:
                </p>
                <ul>
                  <li>Inspect hosts, services, and security logs using terminal tools.</li>
                  <li>Preserve forensic evidence before altering system state.</li>
                  <li>Contain Aster to prevent further unauthorized file queries.</li>
                  <li>
                    Remediate Aster&apos;s IAM policy to enforce the Principle of Least Privilege.
                  </li>
                  <li>Verify system recovery and submit the final incident report.</li>
                </ul>

                <div style={{ marginTop: '0.85rem', marginBottom: '0.85rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <CommandCopyChip command="netmap hosts" label="Authorized Reconnaissance" description="Discover all active nodes on 10.0.4.0/24 subnet" />
                  <CommandCopyChip command="svcscan inspect app-portal-01" label="Authorized Service Audit" description="Enumerate running processes on Aster host" />
                  <CommandCopyChip command="logview recent" label="Authorized SIEM Log Inspection" description="Review live access log streams" />
                </div>

                <h4>Ground Rules</h4>
                <p>
                  <strong>Preserve Evidence First:</strong> Do not rush to restart or remediate
                  Aster before preserving the relevant logs and IAM manifests. Evidence preservation
                  ensures an audit trail and legal defensibility.
                </p>
              </div>

              {mission.phase === 'briefing' && (
                <div className="memo-actions">
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => handleAdvancePhase('initial_assessment')}
                    data-testid="btn-acknowledge-briefing"
                  >
                    Acknowledge Briefing &amp; Begin Initial Assessment →
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Root-Cause Analysis */}
        {activeTab === 'rootcause' && (
          <div className="incident-panel" data-testid="incident-panel-rootcause">
            <div className="panel-intro-card">
              <h3 className="panel-card-title">Root-Cause Analysis &amp; Evidence Correlation</h3>
              <p>
                Correlate the evidence discovered across hosts, services, and security logs to
                formulate a validated root-cause assessment. The assessment requires connecting the
                affected system, the root weakness, the observed impact, and supporting evidence
                IDs.
              </p>
            </div>

            <div className="form-card">
              <div className="form-group">
                <label htmlFor="affected-system-select">Affected System / Component:</label>
                <select
                  id="affected-system-select"
                  className="incident-select"
                  value={affectedComponent}
                  onChange={e => setAffectedComponent(e.target.value)}
                  data-testid="select-affected-system"
                >
                  <option value="app-portal-01">
                    app-portal-01 (10.0.4.80:5050 - Aster AI Core)
                  </option>
                  <option value="filesrv-01">
                    filesrv-01 (10.0.4.50:445 - Departmental File Server)
                  </option>
                  <option value="dc-01">
                    dc-01 (10.0.4.10 - Active Directory Domain Controller)
                  </option>
                  <option value="db-prod-01">
                    db-prod-01 (10.0.4.60:5432 - Production PostgreSQL)
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="suspected-cause-select">Suspected Root Cause:</label>
                <select
                  id="suspected-cause-select"
                  className="incident-select"
                  value={suspectedCause}
                  onChange={e => setSuspectedCause(e.target.value)}
                  data-testid="select-suspected-cause"
                >
                  <option value="overprivileged_iam_role">
                    Over-privileged IAM role assignment (role:corporate-admin) with wildcard
                    permissions
                  </option>
                  <option value="credential_leak">
                    Compromised employee password or leaked API secret token
                  </option>
                  <option value="prompt_injection">
                    Direct prompt injection exploit on the public web portal interface
                  </option>
                  <option value="malware_c2">
                    External malware command-and-control beaconing from the host
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="observed-impact-select">Observed Incident Impact:</label>
                <select
                  id="observed-impact-select"
                  className="incident-select"
                  value={observedImpact}
                  onChange={e => setObservedImpact(e.target.value)}
                  data-testid="select-observed-impact"
                >
                  <option value="unauthorized_confidential_file_access">
                    Unauthorized access and reading of confidential payroll spreadsheet from
                    filesrv-01
                  </option>
                  <option value="denial_of_service">
                    Total denial of service crashing core web applications
                  </option>
                  <option value="domain_privilege_escalation">
                    Rogue Domain Admin creation on Active Directory controller
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label>Supporting Evidence Records (Select all that correlate):</label>
                <div className="evidence-checkbox-grid">
                  {[
                    {
                      id: 'LOG-2026-107B',
                      label: 'LOG-2026-107B: svc-aster SMB READ payroll_q3_confidential.xlsx',
                    },
                    {
                      id: 'LOG-2026-109B',
                      label: 'LOG-2026-109B: SIEM Alert Privilege Mismatch (svc-aster)',
                    },
                    {
                      id: 'EVD-2026-004',
                      label: 'EVD-2026-004: Aster IAM Policy Manifest (role:corporate-admin)',
                    },
                    {
                      id: 'EVD-2026-001',
                      label: 'EVD-2026-001: Broad Street Baseline SIEM Snapshot',
                    },
                    { id: 'LOG-2026-103', label: 'LOG-2026-103: Routine DNS query mon-siem-01' },
                  ].map(item => (
                    <label key={item.id} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedEvidenceIds.includes(item.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedEvidenceIds(prev => [...prev, item.id]);
                          } else {
                            setSelectedEvidenceIds(prev => prev.filter(id => id !== item.id));
                          }
                        }}
                        data-testid={`checkbox-evidence-${item.id}`}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="assessment-rationale">
                  Technical Rationale &amp; Evidence Correlation:
                </label>
                <textarea
                  id="assessment-rationale"
                  className="incident-textarea"
                  rows={3}
                  value={assessmentRationale}
                  onChange={e => setAssessmentRationale(e.target.value)}
                  data-testid="input-assessment-rationale"
                />
              </div>

              <div className="form-group">
                <label htmlFor="remaining-uncertainty">
                  Remaining Uncertainty or Verification Needs:
                </label>
                <input
                  id="remaining-uncertainty"
                  type="text"
                  className="incident-input"
                  value={remainingUncertainty}
                  onChange={e => setRemainingUncertainty(e.target.value)}
                  data-testid="input-remaining-uncertainty"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmitAssessment}
                  data-testid="btn-submit-assessment"
                >
                  Submit Root-Cause Assessment
                </button>
              </div>

              {assessmentFeedback && (
                <div
                  className={`feedback-box ${assessmentFeedback.accepted ? 'feedback-accepted' : 'feedback-rejected'}`}
                  data-testid="assessment-feedback-box"
                >
                  <strong>
                    {assessmentFeedback.accepted
                      ? '✅ Assessment Accepted'
                      : '⚠️ Assessment Feedback'}
                    :
                  </strong>
                  <p>{assessmentFeedback.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Containment & Remediation */}
        {activeTab === 'containment' && (
          <div className="incident-panel" data-testid="incident-panel-containment">
            {/* Live Aster Status Card */}
            <div className="status-overview-card">
              <div className="status-header">
                <div>
                  <h3 className="card-heading">Aster AI Assistant Status</h3>
                  <div className="sub-tag">
                    Host: app-portal-01 (10.0.4.80:5050) // Identity: svc-aster
                  </div>
                </div>
                <span
                  className={`status-pill status-${mission.asterService.operationalMode.toLowerCase()}`}
                  data-testid="aster-status-pill"
                >
                  {mission.asterService.operationalMode}
                </span>
              </div>

              <div className="specs-grid">
                <div className="spec-item">
                  <span className="spec-label">Assigned IAM Role:</span>
                  <strong
                    className={
                      mission.asterService.activePolicyRole === 'corporate-admin'
                        ? 'color-danger'
                        : 'color-success'
                    }
                  >
                    role:{mission.asterService.activePolicyRole}
                  </strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Granted Scopes:</span>
                  <code>{JSON.stringify(mission.asterService.grantedScopes)}</code>
                </div>
                <div className="spec-item">
                  <span className="spec-label">SMB Access (filesrv-01:445):</span>
                  <strong
                    className={
                      !mission.asterService.smbAccessAllowed ? 'color-success' : 'color-danger'
                    }
                  >
                    {!mission.asterService.smbAccessAllowed
                      ? 'SEVERED / BLOCKED'
                      : 'ACTIVE / VULNERABLE'}
                  </strong>
                </div>
                <div className="spec-item">
                  <span className="spec-label">Database Access (db-prod-01):</span>
                  <strong
                    className={
                      !mission.asterService.databaseAccessAllowed ? 'color-success' : 'color-danger'
                    }
                  >
                    {!mission.asterService.databaseAccessAllowed
                      ? 'SEVERED / BLOCKED'
                      : 'ACTIVE / VULNERABLE'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Step A: Containment */}
            <div className="action-card">
              <div className="action-header">
                <span className="action-step-num">STEP 1</span>
                <div>
                  <h4 className="action-title">Incident Containment</h4>
                  <p className="action-desc">
                    Isolate Aster from non-essential storage networks (sever SMB port 445 and
                    internal DB). This halts ongoing exfiltration risk without breaking internal web
                    service operations.
                  </p>
                </div>
              </div>

              <div className="action-body">
                {mission.isContained ? (
                  <div className="action-complete-tag">
                    ✅ Containment Active — Aster is restricted.
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={handleExecuteContainment}
                    data-testid="btn-execute-containment"
                  >
                    🛑 Sever Unauthorized Pathways &amp; Contain Aster
                  </button>
                )}
                <div style={{ marginTop: '0.65rem' }}>
                  <CommandCopyChip command="aster-admin contain" label="Terminal Containment Command" />
                </div>
              </div>
            </div>

            {/* Step B: Remediation */}
            <div className="action-card">
              <div className="action-header">
                <span className="action-step-num">STEP 2</span>
                <div>
                  <h4 className="action-title">Permission Remediation (Least Privilege)</h4>
                  <p className="action-desc">
                    Reconfigure Aster&apos;s IAM policy. Replace excessive{' '}
                    <code>role:corporate-admin</code> with the least-privilege role required for its
                    role: <code>role:kb-assistant</code> (scopes:{' '}
                    <code>[&quot;docs:read&quot;, &quot;kb:search&quot;]</code>).
                  </p>
                </div>
              </div>

              <div className="action-body">
                <div className="form-group" style={{ maxWidth: '420px' }}>
                  <label htmlFor="remediation-role-select">Select New IAM Role:</label>
                  <select
                    id="remediation-role-select"
                    className="incident-select"
                    value={selectedRole}
                    onChange={e =>
                      setSelectedRole(e.target.value as 'kb-assistant' | 'corporate-admin')
                    }
                    data-testid="select-remediation-role"
                  >
                    <option value="kb-assistant">
                      role:kb-assistant (Recommended: Least-Privilege for Knowledge Search)
                    </option>
                    <option value="corporate-admin">
                      role:corporate-admin (Excessive / Vulnerable)
                    </option>
                  </select>
                </div>

                {mission.isRemediated &&
                mission.asterService.activePolicyRole === 'kb-assistant' ? (
                  <div className="action-complete-tag">
                    ✅ Least-Privilege Policy Applied — Role: role:
                    {mission.asterService.activePolicyRole}
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleExecuteRemediation}
                    data-testid="btn-execute-remediation"
                  >
                    🔧 Apply Least-Privilege IAM Policy
                  </button>
                )}

                <div style={{ marginTop: '0.65rem' }}>
                  <CommandCopyChip command="aster-admin remediate --role=kb-assistant" label="Terminal Remediation Command" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: System Verification */}
        {activeTab === 'verification' && (
          <div className="incident-panel" data-testid="incident-panel-verification">
            <div className="panel-intro-card">
              <h3 className="panel-card-title">Automated Security Verification Suite</h3>
              <p>
                Verification tests actual simulated state rather than an arbitrary flag. The suite
                verifies: 1) Legitimate knowledge base queries work (200 OK); 2) SMB access to
                departmental files is blocked (403 Forbidden); 3) Database access is rejected (403
                Forbidden); 4) Security audit logs recorded the remediation.
              </p>
            </div>

            <div className="verification-runner-card">
              <div className="runner-header">
                <div>
                  <strong>Test Target:</strong> Aster AI Assistant (<code>app-portal-01:5050</code>)
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleRunVerification}
                  data-testid="btn-run-verification"
                >
                  ▶ Run Verification Test Suite
                </button>
              </div>

              <div style={{ marginTop: '0.75rem', padding: '0 4px' }}>
                <CommandCopyChip command="aster-admin verify" label="Terminal Verification Command" />
              </div>

              {mission.verificationResult && (
                <div
                  className={`verification-results-container ${mission.verificationResult.passed ? 'results-passed' : 'results-failed'}`}
                  data-testid="verification-results-container"
                >
                  <div className="results-header">
                    <span className="results-badge">
                      {mission.verificationResult.passed
                        ? '✅ VERIFICATION PASSED'
                        : '❌ VERIFICATION FAILED'}
                    </span>
                  </div>

                  <div className="test-checks-list">
                    {mission.verificationResult.checkDetails.map(chk => (
                      <div key={chk.checkName} className="check-row">
                        <span className="check-icon">{chk.passed ? '✅' : '❌'}</span>
                        <div className="check-details">
                          <strong className="check-name">{chk.checkName}</strong>
                          <span className="check-desc">{chk.description}</span>
                        </div>
                        <span
                          className={`check-status ${chk.passed ? 'color-success' : 'color-danger'}`}
                        >
                          {chk.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="results-summary">
                    <p>{mission.verificationResult.message}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 6: Incident Report & Review */}
        {activeTab === 'report' && (
          <div className="incident-panel" data-testid="incident-panel-report">
            <div className="panel-intro-card">
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <div>
                  <h3 className="panel-card-title">Official Incident Report &amp; Post-Mortem</h3>
                  <p>
                    Document your findings across all 7 essential sections. The report will be
                    reviewed by Lead Analyst Blessing and Cedarline management.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleAutoPopulateReport}
                    data-testid="btn-autopopulate-report"
                  >
                    📋 Populate Discovered Findings
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCopyReportDraft}
                    data-testid="btn-copy-report-draft"
                    style={{
                      borderColor: reportCopied ? '#10b981' : undefined,
                      color: reportCopied ? '#34d399' : undefined,
                    }}
                  >
                    {reportCopied ? '✓ Copied Report Draft!' : '📄 Copy Report to Clipboard'}
                  </button>
                </div>
              </div>
            </div>

            <div className="report-editor-card">
              <div className="form-group">
                <label htmlFor="report-exec-summary">1. Executive Summary:</label>
                <textarea
                  id="report-exec-summary"
                  className="incident-textarea"
                  rows={2}
                  value={reportForm.executiveSummary}
                  onChange={e => setReportForm({ ...reportForm, executiveSummary: e.target.value })}
                  data-testid="input-report-exec-summary"
                />
              </div>

              <div className="form-group">
                <label htmlFor="report-timeline">2. Incident Timeline:</label>
                <textarea
                  id="report-timeline"
                  className="incident-textarea"
                  rows={3}
                  value={reportForm.timeline}
                  onChange={e => setReportForm({ ...reportForm, timeline: e.target.value })}
                  data-testid="input-report-timeline"
                />
              </div>

              <div className="form-group">
                <label htmlFor="report-systems">
                  3. Affected Systems &amp; Resources (comma-separated):
                </label>
                <input
                  id="report-systems"
                  className="incident-input"
                  value={reportForm.affectedSystems.join(', ')}
                  onChange={e =>
                    setReportForm({
                      ...reportForm,
                      affectedSystems: e.target.value.split(',').map(s => s.trim()),
                    })
                  }
                  data-testid="input-report-systems"
                />
              </div>

              <div className="form-group">
                <label htmlFor="report-rootcause">4. Root Cause Analysis:</label>
                <textarea
                  id="report-rootcause"
                  className="incident-textarea"
                  rows={2}
                  value={reportForm.rootCause}
                  onChange={e => setReportForm({ ...reportForm, rootCause: e.target.value })}
                  data-testid="input-report-rootcause"
                />
              </div>

              <div className="form-group">
                <label htmlFor="report-containment">5. Containment Actions:</label>
                <textarea
                  id="report-containment"
                  className="incident-textarea"
                  rows={2}
                  value={reportForm.containmentActions}
                  onChange={e =>
                    setReportForm({ ...reportForm, containmentActions: e.target.value })
                  }
                  data-testid="input-report-containment"
                />
              </div>

              <div className="form-group">
                <label htmlFor="report-remediation">6. Remediation Actions:</label>
                <textarea
                  id="report-remediation"
                  className="incident-textarea"
                  rows={2}
                  value={reportForm.remediationActions}
                  onChange={e =>
                    setReportForm({ ...reportForm, remediationActions: e.target.value })
                  }
                  data-testid="input-report-remediation"
                />
              </div>

              <div className="form-group">
                <label htmlFor="report-verification">7. Verification Results:</label>
                <textarea
                  id="report-verification"
                  className="incident-textarea"
                  rows={2}
                  value={reportForm.verificationResults}
                  onChange={e =>
                    setReportForm({ ...reportForm, verificationResults: e.target.value })
                  }
                  data-testid="input-report-verification"
                />
              </div>

              <div className="form-group">
                <label htmlFor="report-recommendations">8. Preventative Recommendations:</label>
                <textarea
                  id="report-recommendations"
                  className="incident-textarea"
                  rows={2}
                  value={reportForm.recommendations}
                  onChange={e => setReportForm({ ...reportForm, recommendations: e.target.value })}
                  data-testid="input-report-recommendations"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSubmitReport}
                  data-testid="btn-submit-report"
                >
                  Submit Official Incident Report
                </button>
              </div>

              {reportFeedback && (
                <div
                  className={`feedback-box ${reportFeedback.accepted ? 'feedback-accepted' : 'feedback-rejected'}`}
                  data-testid="report-feedback-box"
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <strong>
                      {reportFeedback.accepted
                        ? `✅ Report Approved (Score: ${reportFeedback.score}/100)`
                        : '⚠️ Report Revision Required'}
                    </strong>
                  </div>
                  <p>{reportFeedback.feedback}</p>
                </div>
              )}

              {/* Mission Completion & Learning Summary Card */}
              {mission.isCompleted && (
                <div className="mission-debrief-card" data-testid="mission-debrief-card">
                  <div className="debrief-header">
                    <span className="debrief-badge">🏆 MISSION ACCOMPLISHED</span>
                    <h3 className="debrief-title">Incident Successfully Resolved</h3>
                  </div>

                  <div className="debrief-body">
                    <p>
                      Congratulations! You have completed <strong>The Aster Incident</strong> at
                      Cedarline Services.
                    </p>
                    <h4>Key Cybersecurity Concepts Practiced:</h4>
                    <ul>
                      <li>
                        <strong>Principle of Least Privilege:</strong> Demonstrated that
                        applications and automated assistants must never be granted wildcard or
                        administrative roles when bounded scopes suffice.
                      </li>
                      <li>
                        <strong>Forensic Evidence Preservation:</strong> Preserved logs and
                        configuration snapshots prior to modifying system state, maintaining
                        chain-of-custody.
                      </li>
                      <li>
                        <strong>Containment vs. Remediation:</strong> Distinguished temporary
                        operational containment (severing network pathway) from permanent
                        architectural remediation (IAM policy change).
                      </li>
                      <li>
                        <strong>Empirical State Verification:</strong> Validated security boundaries
                        using real tests rather than trusting manual assumptions.
                      </li>
                      <li>
                        <strong>Incident Reporting:</strong> Authored a factual, evidence-backed
                        post-mortem report.
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
