/**
 * Cyberlife — Milestone 18: Defensive Operations Console Application
 *
 * Dedicated Blue Team and Purple Team operations workstation suite providing:
 * - Telemetry Monitor: Multi-source synthetic security telemetry stream with filters and inspector.
 * - Detection Rules: Sigma-inspired rule catalog with toggles, query viewer, and inline testing.
 * - Alert Queue: Triage console with explainable derived priority (P1-P4) and status workflows.
 * - Investigation Workspace: Attack timeline, confirmed facts vs hypotheses, and Evidence Vault integration.
 * - Defensive Response: Active mitigation console (endpoint isolation, perimeter blocks, account restrictions) with consequence modeling and audit logging.
 * - Purple Team Studio: Adversary emulation runner, coverage analysis, scorecard, and M17 adapter.
 * - Operation Lagos Shield: Playable 7-objective mission with ground-truth report evaluation.
 *
 * STRICT SAFETY INVARIANT:
 * 100% simulated state. Zero host network calls, zero raw sockets, zero shell execution.
 */

import React, { useState, useMemo } from 'react';
import { useOptionalSimulation } from '@/application/simulation';
import {
  AlertTriageStatus,
  DefensiveActionType,
  PriorityLevel,
  TelemetryCategory,
  TelemetryEvent,
  IncidentReportSubmission,
} from '@/simulation/cyber/defensive/types';
import { createInitialDefensiveOpsState } from '@/simulation/cyber/defensive/defensiveScenarioData';
import { filterAlerts } from '@/simulation/cyber/defensive/detectionEngine';
import { PURPLE_TEAM_SCENARIOS, generatePurpleTeamScorecard } from '@/simulation/cyber/defensive/purpleTeamEngine';

export type DefensiveOpsTab =
  | 'telemetry'
  | 'rules'
  | 'alerts'
  | 'investigation'
  | 'response'
  | 'purple'
  | 'mission';

export interface DefensiveOpsAppProps {
  readonly initialTab?: DefensiveOpsTab;
}

export const DefensiveOpsApp: React.FC<DefensiveOpsAppProps> = ({ initialTab = 'telemetry' }) => {
  const sim = useOptionalSimulation();
  const fallbackState = useMemo(() => createInitialDefensiveOpsState(), []);
  const defState = sim?.state.defensiveOps ?? fallbackState;

  // Read URL search parameters if present (for headless browser testing & deep linking)
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const urlTabParam = urlParams?.get('defTab') || urlParams?.get('defensiveTab');
  let effectiveInitialTab: DefensiveOpsTab = initialTab;
  if (urlTabParam === 'telemetry') effectiveInitialTab = 'telemetry';
  else if (urlTabParam === 'rules') effectiveInitialTab = 'rules';
  else if (urlTabParam === 'alerts') effectiveInitialTab = 'alerts';
  else if (urlTabParam === 'investigation') effectiveInitialTab = 'investigation';
  else if (urlTabParam === 'response') effectiveInitialTab = 'response';
  else if (urlTabParam === 'purple') effectiveInitialTab = 'purple';
  else if (urlTabParam === 'mission') effectiveInitialTab = 'mission';

  const [activeTab, setActiveTab] = useState<DefensiveOpsTab>(effectiveInitialTab);

  // Telemetry tab state
  const [telemetryFilter, setTelemetryFilter] = useState<TelemetryCategory | 'ALL'>('ALL');
  const [telemetrySearch, setTelemetrySearch] = useState<string>('');
  const [selectedTelemId, setSelectedTelemId] = useState<string>(
    defState.telemetryEvents[0]?.id ?? 'tel-001'
  );

  // Detection rules tab state
  const [ruleTestFeedback, setRuleTestFeedback] = useState<string | null>(null);

  // Alert queue tab state
  const [selectedAlertId, setSelectedAlertId] = useState<string>(
    defState.alerts[0]?.id ?? 'alt-001'
  );
  const [alertStatusFilter, setAlertStatusFilter] = useState<string>('ALL');
  const [alertPriorityFilter, setAlertPriorityFilter] = useState<string>('ALL');
  const [alertSearch, setAlertSearch] = useState<string>('');
  const [triageNotes, setTriageNotes] = useState<string>('');
  const [triageReason, setTriageReason] = useState<string>('');
  const [triageFeedback, setTriageFeedback] = useState<string | null>(null);

  // Investigation tab state
  const [hypoTitle, setHypoTitle] = useState<string>('');
  const [hypoText, setHypoText] = useState<string>('');
  const [hypoIsFact, setHypoIsFact] = useState<boolean>(true);
  const [evidencePreserveFeedback, setEvidencePreserveFeedback] = useState<string | null>(null);

  // Response tab state
  const [responseActionType, setResponseActionType] = useState<DefensiveActionType>('ISOLATE_ENDPOINT');
  const [responseTarget, setResponseTarget] = useState<string>('app-portal-01');
  const [responseReason, setResponseReason] = useState<string>('Isolating host following confirmed webshell execution');
  const [responseFeedback, setResponseFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Mission submission state
  const [reportActor, setReportActor] = useState<string>('Phantom Weaver APT');
  const [reportHost, setReportHost] = useState<string>('app-portal-01');
  const [reportVector, setReportVector] = useState<string>('Prompt injection and webshell command injection');
  const [reportFpHost, setReportFpHost] = useState<string>('mon-siem-01');
  const [reportSummary, setReportSummary] = useState<string>(
    'Adversary exploited over-scoped assistant endpoint to execute webshell and stage C2 beaconing. Threat neutralized via endpoint isolation and perimeter firewall drop.'
  );

  // Selected telemetry event
  const selectedTelemetry = useMemo(
    () => defState.telemetryEvents.find(e => e.id === selectedTelemId) ?? defState.telemetryEvents[0],
    [defState.telemetryEvents, selectedTelemId]
  );

  // Filtered telemetry
  const filteredTelemetry = useMemo(() => {
    return defState.telemetryEvents.filter(e => {
      if (telemetryFilter !== 'ALL' && e.category !== telemetryFilter) return false;
      if (telemetrySearch) {
        const q = telemetrySearch.toLowerCase();
        const match =
          e.title.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.sourceHostId.toLowerCase().includes(q) ||
          e.sourceIp.toLowerCase().includes(q) ||
          e.tags.some(t => t.toLowerCase().includes(q));
        if (!match) return false;
      }
      return true;
    });
  }, [defState.telemetryEvents, telemetryFilter, telemetrySearch]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    return filterAlerts(defState.alerts, {
      status: alertStatusFilter,
      priority: alertPriorityFilter as PriorityLevel | 'ALL',
      searchQuery: alertSearch,
    });
  }, [defState.alerts, alertStatusFilter, alertPriorityFilter, alertSearch]);

  // Selected alert
  const selectedAlert = useMemo(
    () => defState.alerts.find(a => a.id === selectedAlertId) ?? defState.alerts[0],
    [defState.alerts, selectedAlertId]
  );

  // Purple team scorecard
  const purpleScorecard = useMemo(
    () => generatePurpleTeamScorecard(defState.purpleEmulationResults),
    [defState.purpleEmulationResults]
  );

  // Handlers
  const handleTriageAlert = (status: AlertTriageStatus) => {
    if (!selectedAlert) return;
    if (sim) {
      sim.dispatch({
        type: 'TriageSecurityAlert',
        alertId: selectedAlert.id,
        status,
        notes: triageNotes || undefined,
        reason: triageReason || undefined,
      });
      setTriageFeedback(`Alert ${selectedAlert.id} successfully updated to ${status}.`);
    } else {
      setTriageFeedback(`[Preview Mode] Alert ${selectedAlert.id} transitioned to ${status}.`);
    }
  };

  const handleToggleRule = (ruleId: string, currentStatus: boolean) => {
    if (sim) {
      sim.dispatch({
        type: 'ToggleDetectionRule',
        ruleId,
        isEnabled: !currentStatus,
      });
    }
    setRuleTestFeedback(`Toggled rule ${ruleId} to ${!currentStatus ? 'ENABLED' : 'DISABLED'}.`);
  };

  const handleTestRule = (ruleId: string) => {
    const rule = defState.rules.find(r => r.id === ruleId);
    if (!rule) return;
    const matches = defState.telemetryEvents.filter(e => rule.category === e.category && rule.evaluateMatch(e));
    setRuleTestFeedback(
      `Rule ${rule.id} [${rule.name}]: Evaluated against ${defState.telemetryEvents.length} events -> Matched ${matches.length} event(s). (${matches.map(m => m.id).join(', ') || 'None'})`
    );
  };

  const handleAddHypothesis = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hypoTitle.trim() || !hypoText.trim()) return;

    if (sim) {
      sim.dispatch({
        type: 'RecordDefensiveHypothesis',
        title: hypoTitle,
        hypothesisText: hypoText,
        isConfirmedFact: hypoIsFact,
        linkedHostIds: ['app-portal-01'],
      });
    }
    setHypoTitle('');
    setHypoText('');
  };

  const handlePreserveEvidence = (telemetry: TelemetryEvent) => {
    const evidenceId = telemetry.associatedEvidenceId ?? `EVD-M18-${telemetry.id.toUpperCase()}`;
    const hash =
      telemetry.process?.hashSha256 ??
      'd41d8cd98f00b204e9800998ecf8427e0123456789abcdef0123456789abcdef';

    if (sim) {
      sim.dispatch({
        type: 'RecordInvestigativeEvidence',
        evidenceId,
        source: telemetry.eventSource,
        title: telemetry.title,
        description: telemetry.summary,
        hash,
        tags: telemetry.tags,
      });
      sim.dispatch({
        type: 'AdvanceDefensiveObjective',
        objectiveId: 'obj-m18-preserve-evidence',
      });
      setEvidencePreserveFeedback(`Preserved cryptographic forensic item "${evidenceId}" into Evidence Vault.`);
    } else {
      setEvidencePreserveFeedback(`[Preview Mode] Preserved "${evidenceId}" into Evidence Vault.`);
    }
  };

  const handleExecuteResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (sim) {
      const res = sim.dispatch({
        type: 'ExecuteDefensiveResponse',
        actionType: responseActionType,
        targetEntityId: responseTarget,
        reason: responseReason,
      });
      setResponseFeedback({
        success: res.success,
        message: res.message,
      });
    } else {
      setResponseFeedback({
        success: true,
        message: `[Preview Mode] Simulated action ${responseActionType} on ${responseTarget} executed.`,
      });
    }
  };

  const handleRunPurpleScenario = (scenarioId: string) => {
    if (sim) {
      sim.dispatch({
        type: 'RunPurpleTeamScenario',
        scenarioId,
      });
    }
  };

  const handleRunAllPurple = () => {
    for (const scenario of PURPLE_TEAM_SCENARIOS) {
      handleRunPurpleScenario(scenario.id);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    const submission: IncidentReportSubmission = {
      incidentTitle: 'Operation Lagos Shield: Perimeter & AI Service Breach',
      suspectedAttacker: reportActor,
      initialCompromisedHostId: reportHost,
      primaryVector: reportVector,
      falsePositiveHostId: reportFpHost,
      confirmedFindingIds: ['hyp-001'],
      appliedResponseActionIds: defState.executedResponses.map(r => r.id),
      rootCauseSummary: reportSummary,
      submittedAtSimTime: sim?.state.time.simulationTimeSeconds ?? 29300,
    };

    if (sim) {
      sim.dispatch({
        type: 'SubmitDefensiveIncidentReport',
        submission,
      });
    }
  };

  // Severity color helper
  const getSeverityBadgeColor = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return '#f85149';
      case 'HIGH':
        return '#d29922';
      case 'MEDIUM':
        return '#db6d28';
      case 'LOW':
        return '#58a6ff';
      default:
        return '#8b949e';
    }
  };

  return (
    <div
      className="defensive-ops-container"
      data-testid="defensive-ops-app"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#090d13',
        color: '#c9d1d9',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        fontSize: '0.82rem',
        overflow: 'hidden',
      }}
    >
      {/* Top Suite Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0.65rem 1rem',
          backgroundColor: '#0d1117',
          borderBottom: '1px solid #21262d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              backgroundColor: '#1f242c',
              border: '1px solid #30363d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#388bfd',
              fontWeight: 'bold',
            }}
          >
            🛡️
          </div>
          <div>
            <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.9rem' }}>
              Defensive Operations Console
            </div>
            <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>
              EkoSec Cyber Defense Operations · Incident: Operation Lagos Shield
            </div>
          </div>
        </div>

        {/* Global Security Posture Badge */}
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
          <div
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              fontSize: '0.72rem',
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#8b949e' }}>Isolated Hosts:</span>
            <span style={{ color: defState.isolatedHostIds.length > 0 ? '#f85149' : '#3fb950', fontWeight: 'bold' }}>
              {defState.isolatedHostIds.length}
            </span>
          </div>

          <div
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              backgroundColor: '#161b22',
              border: '1px solid #30363d',
              fontSize: '0.72rem',
              display: 'flex',
              gap: '0.4rem',
              alignItems: 'center',
            }}
          >
            <span style={{ color: '#8b949e' }}>Blocked Indicators:</span>
            <span style={{ color: defState.blockedIndicators.length > 0 ? '#d29922' : '#8b949e', fontWeight: 'bold' }}>
              {defState.blockedIndicators.length}
            </span>
          </div>

          <div
            style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '12px',
              backgroundColor: purpleScorecard.coveragePercentage >= 80 ? '#1b4721' : '#3d2514',
              border: `1px solid ${purpleScorecard.coveragePercentage >= 80 ? '#2ea043' : '#db6d28'}`,
              fontSize: '0.72rem',
              color: '#f0f6fc',
              fontWeight: 'bold',
            }}
          >
            Purple Team: {purpleScorecard.coveragePercentage}% Coverage
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div
        style={{
          display: 'flex',
          backgroundColor: '#0d1117',
          borderBottom: '1px solid #30363d',
          padding: '0 0.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'telemetry', label: 'Telemetry Monitor', icon: '📡' },
          { id: 'rules', label: 'Detection Rules', icon: '⚙️' },
          { id: 'alerts', label: `Alert Queue (${defState.alerts.filter(a => a.triageStatus === 'NEW').length})`, icon: '🚨' },
          { id: 'investigation', label: 'Investigation Workspace', icon: '🔎' },
          { id: 'response', label: 'Defensive Response', icon: '⚡' },
          { id: 'purple', label: 'Purple Team Studio', icon: '🟣' },
          { id: 'mission', label: 'Operation Lagos Shield', icon: '🎯' },
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as DefensiveOpsTab)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.6rem 0.9rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid #58a6ff' : '2px solid transparent',
                color: isActive ? '#f0f6fc' : '#8b949e',
                cursor: 'pointer',
                fontWeight: isActive ? 600 : 400,
                fontSize: '0.8rem',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {/* ==================================================================== */}
        {/* 1. TELEMETRY MONITOR TAB */}
        {/* ==================================================================== */}
        {activeTab === 'telemetry' && (
          <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Left Telemetry Stream List */}
            <div
              style={{
                flex: 3,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #21262d',
                backgroundColor: '#090d13',
              }}
            >
              {/* Category Filter and Search Toolbar */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#161b22',
                  borderBottom: '1px solid #21262d',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <input
                  type="text"
                  placeholder="Filter by host, IP, title, tag..."
                  value={telemetrySearch}
                  onChange={e => setTelemetrySearch(e.target.value)}
                  style={{
                    backgroundColor: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '4px',
                    color: '#c9d1d9',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.78rem',
                    width: '200px',
                  }}
                />

                <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                  {[
                    'ALL',
                    'AUTHENTICATION',
                    'PROCESS_EXECUTION',
                    'NETWORK_CONNECTION',
                    'PRIVILEGE_CHANGE',
                    'WEB_APPLICATION',
                    'FILE_INTEGRITY',
                  ].map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setTelemetryFilter(cat as TelemetryCategory | 'ALL')}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid',
                        borderColor: telemetryFilter === cat ? '#58a6ff' : '#30363d',
                        backgroundColor: telemetryFilter === cat ? '#1f6feb22' : '#0d1117',
                        color: telemetryFilter === cat ? '#58a6ff' : '#8b949e',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                      }}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Telemetry Stream Items */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredTelemetry.map(event => {
                  const isSelected = selectedTelemId === event.id;
                  return (
                    <div
                      key={event.id}
                      onClick={() => setSelectedTelemId(event.id)}
                      style={{
                        padding: '0.5rem 0.75rem',
                        borderBottom: '1px solid #21262d',
                        backgroundColor: isSelected ? '#1f242c' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ color: '#8b949e', fontFamily: 'monospace', fontSize: '0.72rem' }}>
                            {event.formattedTime}
                          </span>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              padding: '0.1rem 0.4rem',
                              borderRadius: '3px',
                              backgroundColor: `${getSeverityBadgeColor(event.severity)}22`,
                              color: getSeverityBadgeColor(event.severity),
                              fontWeight: 'bold',
                            }}
                          >
                            {event.severity}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#58a6ff', fontWeight: 500 }}>
                            {event.category}
                          </span>
                        </div>
                        <span style={{ color: '#8b949e', fontSize: '0.7rem' }}>{event.eventSource}</span>
                      </div>

                      <div style={{ color: '#f0f6fc', fontWeight: 500 }}>{event.title}</div>
                      <div style={{ color: '#8b949e', fontSize: '0.74rem' }}>{event.summary}</div>

                      <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem', alignItems: 'center' }}>
                        <span style={{ color: '#8b949e', fontSize: '0.7rem' }}>Host: {event.sourceHostId}</span>
                        {event.destinationIp && (
                          <span style={{ color: '#8b949e', fontSize: '0.7rem' }}>
                            -&gt; {event.destinationIp}:{event.destinationPort}
                          </span>
                        )}
                        {event.isKnownBenign && (
                          <span style={{ color: '#3fb950', fontSize: '0.68rem' }}>✓ Authorized / Benign</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Telemetry Detail Inspector */}
            <div
              style={{
                flex: 2,
                backgroundColor: '#0d1117',
                padding: '1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {selectedTelemetry ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#8b949e', fontFamily: 'monospace' }}>
                        ID: {selectedTelemetry.id} · Timestamp: {selectedTelemetry.formattedTime}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f6fc', marginTop: '0.2rem' }}>
                        {selectedTelemetry.title}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: `${getSeverityBadgeColor(selectedTelemetry.severity)}22`,
                        color: getSeverityBadgeColor(selectedTelemetry.severity),
                        fontWeight: 'bold',
                        fontSize: '0.75rem',
                      }}
                    >
                      {selectedTelemetry.severity}
                    </span>
                  </div>

                  <div style={{ backgroundColor: '#161b22', padding: '0.75rem', borderRadius: '6px', border: '1px solid #30363d' }}>
                    <div style={{ fontSize: '0.75rem', color: '#8b949e', fontWeight: 600, marginBottom: '0.3rem' }}>
                      TELEMETRY SUMMARY
                    </div>
                    <div style={{ color: '#c9d1d9', lineHeight: 1.4 }}>{selectedTelemetry.summary}</div>
                  </div>

                  {/* Contextual Category Inspection Blocks */}
                  {selectedTelemetry.process && (
                    <div style={{ backgroundColor: '#161b22', padding: '0.75rem', borderRadius: '6px', border: '1px solid #30363d' }}>
                      <div style={{ fontSize: '0.75rem', color: '#58a6ff', fontWeight: 600, marginBottom: '0.4rem' }}>
                        SYSMON PROCESS EXECUTION TREE
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                        <div>Parent: {selectedTelemetry.process.parentProcessName} (PPID {selectedTelemetry.process.ppid})</div>
                        <div>Process: {selectedTelemetry.process.processName} (PID {selectedTelemetry.process.pid})</div>
                        <div>User: {selectedTelemetry.process.user}</div>
                        <div style={{ wordBreak: 'break-all', color: '#f0f6fc' }}>
                          Command: {selectedTelemetry.process.commandLine}
                        </div>
                        {selectedTelemetry.process.hashSha256 && (
                          <div style={{ color: '#8b949e', wordBreak: 'break-all', fontSize: '0.7rem' }}>
                            SHA-256: {selectedTelemetry.process.hashSha256}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTelemetry.auth && (
                    <div style={{ backgroundColor: '#161b22', padding: '0.75rem', borderRadius: '6px', border: '1px solid #30363d' }}>
                      <div style={{ fontSize: '0.75rem', color: '#d29922', fontWeight: 600, marginBottom: '0.4rem' }}>
                        AUTHENTICATION ATTRIBUTES
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem' }}>
                        <div>User Principal: {selectedTelemetry.auth.userPrincipal}</div>
                        <div>Logon Type: {selectedTelemetry.auth.logonType}</div>
                        <div>Status: {selectedTelemetry.auth.authStatus}</div>
                        {selectedTelemetry.auth.failureReason && <div>Failure Reason: {selectedTelemetry.auth.failureReason}</div>}
                        {selectedTelemetry.auth.consecutiveFailures && (
                          <div style={{ color: '#f85149', fontWeight: 'bold' }}>
                            Consecutive Failures: {selectedTelemetry.auth.consecutiveFailures}
                          </div>
                        )}
                        <div>Client IP: {selectedTelemetry.auth.clientIp}</div>
                      </div>
                    </div>
                  )}

                  {selectedTelemetry.web && (
                    <div style={{ backgroundColor: '#161b22', padding: '0.75rem', borderRadius: '6px', border: '1px solid #30363d' }}>
                      <div style={{ fontSize: '0.75rem', color: '#bc8cff', fontWeight: 600, marginBottom: '0.4rem' }}>
                        WEB APPLICATION SECURITY INSPECTION
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem' }}>
                        <div>Request: {selectedTelemetry.web.method} {selectedTelemetry.web.uri}</div>
                        <div>Status: HTTP {selectedTelemetry.web.httpStatus}</div>
                        {selectedTelemetry.web.attackType && (
                          <div style={{ color: '#f85149', fontWeight: 'bold' }}>Attack Type: {selectedTelemetry.web.attackType}</div>
                        )}
                        {selectedTelemetry.web.payloadSnippet && (
                          <div style={{ backgroundColor: '#0d1117', padding: '0.4rem', borderRadius: '4px', fontFamily: 'monospace', color: '#f0f6fc' }}>
                            {selectedTelemetry.web.payloadSnippet}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedTelemetry.fim && (
                    <div style={{ backgroundColor: '#161b22', padding: '0.75rem', borderRadius: '6px', border: '1px solid #30363d' }}>
                      <div style={{ fontSize: '0.75rem', color: '#f85149', fontWeight: 600, marginBottom: '0.4rem' }}>
                        FILE INTEGRITY MONITORING (FIM)
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.75rem' }}>
                        <div>File Path: {selectedTelemetry.fim.filePath}</div>
                        <div>Change: {selectedTelemetry.fim.changeType}</div>
                        <div>Critical System File: {selectedTelemetry.fim.isSystemCritical ? 'YES' : 'NO'}</div>
                        {selectedTelemetry.fim.expectedHashSha256 && (
                          <div style={{ wordBreak: 'break-all', fontSize: '0.7rem' }}>
                            Expected: {selectedTelemetry.fim.expectedHashSha256}
                          </div>
                        )}
                        {selectedTelemetry.fim.actualHashSha256 && (
                          <div style={{ wordBreak: 'break-all', fontSize: '0.7rem', color: '#f85149' }}>
                            Actual: {selectedTelemetry.fim.actualHashSha256}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions Bar */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid #21262d' }}>
                    <button
                      type="button"
                      onClick={() => handlePreserveEvidence(selectedTelemetry)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        backgroundColor: '#1f6feb',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff',
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                      }}
                    >
                      💾 Preserve in Evidence Vault
                    </button>
                  </div>
                  {evidencePreserveFeedback && (
                    <div style={{ color: '#3fb950', fontSize: '0.74rem' }}>{evidencePreserveFeedback}</div>
                  )}
                </>
              ) : (
                <div style={{ color: '#8b949e', textAlign: 'center', marginTop: '2rem' }}>
                  Select a telemetry event to inspect attributes.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 2. DETECTION RULES TAB */}
        {/* ==================================================================== */}
        {activeTab === 'rules' && (
          <div style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f6fc' }}>
                  Sigma-Inspired SIEM Detection Rules
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                  Manage and test in-engine rules evaluating synthetic telemetry streams.
                </div>
              </div>
            </div>

            {ruleTestFeedback && (
              <div
                style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#161b22',
                  border: '1px solid #388bfd',
                  borderRadius: '4px',
                  color: '#58a6ff',
                  fontSize: '0.76rem',
                }}
              >
                {ruleTestFeedback}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))', gap: '0.75rem' }}>
              {defState.rules.map(rule => (
                <div
                  key={rule.id}
                  style={{
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.45rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#8b949e' }}>{rule.id}</span>
                      <div style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.85rem' }}>{rule.name}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleToggleRule(rule.id, rule.isEnabled)}
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        border: 'none',
                        backgroundColor: rule.isEnabled ? '#238636' : '#21262d',
                        color: rule.isEnabled ? '#fff' : '#8b949e',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                      }}
                    >
                      {rule.isEnabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div style={{ color: '#8b949e', fontSize: '0.75rem', lineHeight: 1.35 }}>
                    {rule.description}
                  </div>

                  {/* Severity vs Confidence distinction */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', fontSize: '0.72rem' }}>
                    <span style={{ color: getSeverityBadgeColor(rule.severity), fontWeight: 'bold' }}>
                      Severity: {rule.severity}
                    </span>
                    <span style={{ color: '#8b949e' }}>|</span>
                    <span style={{ color: '#58a6ff', fontWeight: 'bold' }}>
                      Confidence: {rule.confidenceScore}%
                    </span>
                    <span style={{ color: '#8b949e' }}>|</span>
                    <span style={{ color: '#bc8cff' }}>{rule.category}</span>
                  </div>

                  {/* Sigma Query Box */}
                  <div
                    style={{
                      backgroundColor: '#090d13',
                      border: '1px solid #21262d',
                      borderRadius: '4px',
                      padding: '0.4rem',
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      color: '#79c0ff',
                      wordBreak: 'break-all',
                    }}
                  >
                    {rule.queryDefinition}
                  </div>

                  <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                    {rule.mitreTechniques.map(tech => (
                      <span
                        key={tech}
                        style={{
                          fontSize: '0.65rem',
                          padding: '0.1rem 0.35rem',
                          borderRadius: '3px',
                          backgroundColor: '#21262d',
                          color: '#8b949e',
                        }}
                      >
                        MITRE: {tech}
                      </span>
                    ))}
                  </div>

                  <div style={{ marginTop: '0.3rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="button"
                      onClick={() => handleTestRule(rule.id)}
                      style={{
                        padding: '0.25rem 0.6rem',
                        backgroundColor: '#21262d',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        color: '#c9d1d9',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                      }}
                    >
                      ▶ Test Against Telemetry
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 3. ALERT QUEUE TAB */}
        {/* ==================================================================== */}
        {activeTab === 'alerts' && (
          <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
            {/* Left Alert Queue List */}
            <div
              style={{
                flex: 3,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid #21262d',
                backgroundColor: '#090d13',
              }}
            >
              {/* Filter Toolbar */}
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  padding: '0.5rem 0.75rem',
                  backgroundColor: '#161b22',
                  borderBottom: '1px solid #21262d',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <input
                  type="text"
                  placeholder="Search alerts..."
                  value={alertSearch}
                  onChange={e => setAlertSearch(e.target.value)}
                  style={{
                    backgroundColor: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '4px',
                    color: '#c9d1d9',
                    padding: '0.3rem 0.6rem',
                    fontSize: '0.78rem',
                    width: '180px',
                  }}
                />

                <select
                  value={alertStatusFilter}
                  onChange={e => setAlertStatusFilter(e.target.value)}
                  style={{
                    backgroundColor: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '4px',
                    color: '#c9d1d9',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="NEW">NEW</option>
                  <option value="UNDER_INVESTIGATION">UNDER INVESTIGATION</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
                </select>

                <select
                  value={alertPriorityFilter}
                  onChange={e => setAlertPriorityFilter(e.target.value)}
                  style={{
                    backgroundColor: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '4px',
                    color: '#c9d1d9',
                    padding: '0.3rem 0.5rem',
                    fontSize: '0.75rem',
                  }}
                >
                  <option value="ALL">All Priorities</option>
                  <option value="P1_CRITICAL">P1 (Critical)</option>
                  <option value="P2_HIGH">P2 (High)</option>
                  <option value="P3_MEDIUM">P3 (Medium)</option>
                  <option value="P4_LOW">P4 (Low)</option>
                </select>
              </div>

              {/* Alert Items List */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {filteredAlerts.map(alert => {
                  const isSelected = selectedAlertId === alert.id;
                  const prioColor =
                    alert.priority.level === 'P1_CRITICAL'
                      ? '#f85149'
                      : alert.priority.level === 'P2_HIGH'
                      ? '#d29922'
                      : alert.priority.level === 'P3_MEDIUM'
                      ? '#db6d28'
                      : '#58a6ff';

                  return (
                    <div
                      key={alert.id}
                      onClick={() => setSelectedAlertId(alert.id)}
                      style={{
                        padding: '0.6rem 0.75rem',
                        borderBottom: '1px solid #21262d',
                        backgroundColor: isSelected ? '#1f242c' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                          <span
                            style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: '3px',
                              backgroundColor: `${prioColor}22`,
                              color: prioColor,
                              fontWeight: 'bold',
                              fontSize: '0.72rem',
                            }}
                          >
                            {alert.priority.level.replace('_', ' ')} ({alert.priority.score})
                          </span>
                          <span style={{ fontSize: '0.72rem', color: '#8b949e', fontFamily: 'monospace' }}>
                            {alert.formattedTime}
                          </span>
                        </div>

                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '3px',
                            backgroundColor:
                              alert.triageStatus === 'RESOLVED'
                                ? '#23863622'
                                : alert.triageStatus === 'FALSE_POSITIVE'
                                ? '#8b949e22'
                                : '#1f6feb22',
                            color:
                              alert.triageStatus === 'RESOLVED'
                                ? '#3fb950'
                                : alert.triageStatus === 'FALSE_POSITIVE'
                                ? '#8b949e'
                                : '#58a6ff',
                            fontWeight: 600,
                          }}
                        >
                          {alert.triageStatus}
                        </span>
                      </div>

                      <div style={{ color: '#f0f6fc', fontWeight: 600 }}>{alert.title}</div>
                      <div style={{ color: '#8b949e', fontSize: '0.75rem' }}>{alert.summary}</div>

                      <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.7rem', color: '#8b949e' }}>
                        <span>Target: {alert.affectedHostId}</span>
                        {alert.affectedUser && <span>User: {alert.affectedUser}</span>}
                        <span>Rule: {alert.ruleId}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Alert Triage Drawer */}
            <div
              style={{
                flex: 2,
                backgroundColor: '#0d1117',
                padding: '1rem',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {selectedAlert ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '0.72rem', color: '#8b949e', fontFamily: 'monospace' }}>
                        Alert: {selectedAlert.id} · {selectedAlert.formattedTime}
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f6fc', marginTop: '0.2rem' }}>
                        {selectedAlert.title}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        backgroundColor: '#1f6feb22',
                        color: '#58a6ff',
                        fontWeight: 'bold',
                        fontSize: '0.72rem',
                      }}
                    >
                      {selectedAlert.triageStatus}
                    </span>
                  </div>

                  {/* Derived Priority Explanation Box */}
                  <div
                    style={{
                      backgroundColor: '#161b22',
                      border: '1px solid #30363d',
                      borderRadius: '6px',
                      padding: '0.75rem',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#d29922', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                      PRIORITY CALCULATION FORMULA
                    </div>
                    <div style={{ color: '#f0f6fc', fontSize: '0.78rem', lineHeight: 1.4 }}>
                      {selectedAlert.priority.formulaRationale}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.72rem', color: '#8b949e' }}>
                      <span>Severity: {selectedAlert.severity}</span>
                      <span>Confidence: {selectedAlert.confidenceScore}%</span>
                      <span>Asset: {selectedAlert.affectedHostId}</span>
                    </div>
                  </div>

                  {/* Triggering Rule & Supporting Telemetry */}
                  <div
                    style={{
                      backgroundColor: '#161b22',
                      border: '1px solid #30363d',
                      borderRadius: '6px',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ fontSize: '0.72rem', color: '#58a6ff', fontWeight: 'bold' }}>
                      MATCHING RATIONALE & SUPPORTING EVIDENCE
                    </div>
                    <div style={{ color: '#c9d1d9', fontSize: '0.78rem' }}>{selectedAlert.matchingReason}</div>
                    <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>
                      Linked Telemetry Events: {selectedAlert.matchingTelemetryIds.join(', ')}
                    </div>
                  </div>

                  {/* Triage Action Panel */}
                  <div
                    style={{
                      backgroundColor: '#161b22',
                      border: '1px solid #30363d',
                      borderRadius: '6px',
                      padding: '0.75rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f0f6fc' }}>
                      ANALYST TRIAGE DECISION
                    </div>

                    <input
                      type="text"
                      placeholder="Add analyst investigation notes..."
                      value={triageNotes}
                      onChange={e => setTriageNotes(e.target.value)}
                      style={{
                        backgroundColor: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        color: '#c9d1d9',
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.75rem',
                      }}
                    />

                    <input
                      type="text"
                      placeholder="Operational justification / reason..."
                      value={triageReason}
                      onChange={e => setTriageReason(e.target.value)}
                      style={{
                        backgroundColor: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        color: '#c9d1d9',
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.75rem',
                      }}
                    />

                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.3rem', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleTriageAlert('UNDER_INVESTIGATION')}
                        style={{
                          padding: '0.35rem 0.6rem',
                          backgroundColor: '#1f6feb',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#fff',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                        }}
                      >
                        Investigate Alert
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriageAlert('RESOLVED')}
                        style={{
                          padding: '0.35rem 0.6rem',
                          backgroundColor: '#238636',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#fff',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                        }}
                      >
                        Mark Resolved
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTriageAlert('FALSE_POSITIVE')}
                        style={{
                          padding: '0.35rem 0.6rem',
                          backgroundColor: '#30363d',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#8b949e',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                        }}
                      >
                        False Positive
                      </button>
                    </div>

                    {triageFeedback && (
                      <div style={{ color: '#3fb950', fontSize: '0.72rem', marginTop: '0.3rem' }}>
                        {triageFeedback}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ color: '#8b949e', textAlign: 'center', marginTop: '2rem' }}>
                  Select an alert to triage.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 4. INVESTIGATION WORKSPACE TAB */}
        {/* ==================================================================== */}
        {activeTab === 'investigation' && (
          <div style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f6fc' }}>
              Incident Investigation & Timeline Workspace
            </div>

            {/* Attack Chain Progression Card */}
            <div
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#58a6ff' }}>
                CORRELATED ATTACK CHAIN (OPERATION LAGOS SHIELD)
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.5rem' }}>
                <div style={{ backgroundColor: '#0d1117', padding: '0.5rem', borderRadius: '4px', border: '1px solid #21262d' }}>
                  <div style={{ color: '#d29922', fontWeight: 'bold', fontSize: '0.72rem' }}>PHASE 1: SPRAY</div>
                  <div style={{ fontSize: '0.7rem', color: '#c9d1d9', marginTop: '0.2rem' }}>
                    Password spraying on 10.0.4.10 from pivot 10.0.4.88
                  </div>
                </div>

                <div style={{ backgroundColor: '#0d1117', padding: '0.5rem', borderRadius: '4px', border: '1px solid #21262d' }}>
                  <div style={{ color: '#bc8cff', fontWeight: 'bold', fontSize: '0.72rem' }}>PHASE 2: INJECTION</div>
                  <div style={{ fontSize: '0.7rem', color: '#c9d1d9', marginTop: '0.2rem' }}>
                    Prompt injection override on app-portal-01:8080
                  </div>
                </div>

                <div style={{ backgroundColor: '#0d1117', padding: '0.5rem', borderRadius: '4px', border: '1px solid #21262d' }}>
                  <div style={{ color: '#f85149', fontWeight: 'bold', fontSize: '0.72rem' }}>PHASE 3: WEBSHELL</div>
                  <div style={{ fontSize: '0.7rem', color: '#c9d1d9', marginTop: '0.2rem' }}>
                    http-proxy spawned /bin/sh downloading stage2.sh
                  </div>
                </div>

                <div style={{ backgroundColor: '#0d1117', padding: '0.5rem', borderRadius: '4px', border: '1px solid #21262d' }}>
                  <div style={{ color: '#f85149', fontWeight: 'bold', fontSize: '0.72rem' }}>PHASE 4: C2 BEACON</div>
                  <div style={{ fontSize: '0.7rem', color: '#c9d1d9', marginTop: '0.2rem' }}>
                    Egress TLS beacon to 198.51.100.45:8443
                  </div>
                </div>
              </div>
            </div>

            {/* Confirmed Facts vs Hypotheses Form & List */}
            <div
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f0f6fc' }}>
                RECORD CONFIRMED FACT / INVESTIGATION HYPOTHESIS
              </div>

              <form onSubmit={handleAddHypothesis} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="Fact / Hypothesis Title..."
                  value={hypoTitle}
                  onChange={e => setHypoTitle(e.target.value)}
                  style={{
                    backgroundColor: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '4px',
                    color: '#c9d1d9',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.78rem',
                  }}
                />

                <textarea
                  placeholder="Explain evidence, observed telemetry, or attribution hypothesis..."
                  value={hypoText}
                  onChange={e => setHypoText(e.target.value)}
                  rows={2}
                  style={{
                    backgroundColor: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '4px',
                    color: '#c9d1d9',
                    padding: '0.4rem 0.6rem',
                    fontSize: '0.78rem',
                    resize: 'vertical',
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#8b949e' }}>
                    <input
                      type="checkbox"
                      checked={hypoIsFact}
                      onChange={e => setHypoIsFact(e.target.checked)}
                    />
                    Mark as Confirmed Technical Fact (vs Unproven Hypothesis)
                  </label>

                  <button
                    type="submit"
                    style={{
                      padding: '0.35rem 0.8rem',
                      backgroundColor: '#238636',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                    }}
                  >
                    + Record Finding
                  </button>
                </div>
              </form>

              {/* Recorded Hypotheses List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                {defState.hypotheses.map(hypo => (
                  <div
                    key={hypo.id}
                    style={{
                      backgroundColor: '#0d1117',
                      border: '1px solid #21262d',
                      borderRadius: '4px',
                      padding: '0.6rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.8rem' }}>{hypo.title}</span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          padding: '0.1rem 0.4rem',
                          borderRadius: '3px',
                          backgroundColor: hypo.isConfirmedFact ? '#23863622' : '#d2992222',
                          color: hypo.isConfirmedFact ? '#3fb950' : '#d29922',
                          fontWeight: 'bold',
                        }}
                      >
                        {hypo.isConfirmedFact ? 'CONFIRMED FACT' : 'HYPOTHESIS'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#c9d1d9' }}>{hypo.hypothesisText}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 5. DEFENSIVE RESPONSE TAB */}
        {/* ==================================================================== */}
        {activeTab === 'response' && (
          <div style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f6fc' }}>
              Simulated Defensive Response & Active Mitigation Console
            </div>

            {/* Current Active Mitigations Status Bar */}
            <div
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '0.85rem',
                display: 'flex',
                gap: '1.5rem',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>ISOLATED ENDPOINTS</div>
                <div style={{ fontWeight: 'bold', color: defState.isolatedHostIds.length > 0 ? '#f85149' : '#3fb950', marginTop: '0.2rem' }}>
                  {defState.isolatedHostIds.join(', ') || 'None (All Online)'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>BLOCKED INDICATORS (PERIMETER)</div>
                <div style={{ fontWeight: 'bold', color: defState.blockedIndicators.length > 0 ? '#d29922' : '#8b949e', marginTop: '0.2rem' }}>
                  {defState.blockedIndicators.join(', ') || 'None (Open)'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>LOCKED SERVICE ACCOUNTS</div>
                <div style={{ fontWeight: 'bold', color: defState.lockedUserAccounts.length > 0 ? '#f85149' : '#8b949e', marginTop: '0.2rem' }}>
                  {defState.lockedUserAccounts.join(', ') || 'None'}
                </div>
              </div>
            </div>

            {/* Mitigation Action Form */}
            <div
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f6fc' }}>
                EXECUTE SIMULATED CONTAINMENT ACTION
              </div>

              <form onSubmit={handleExecuteResponse} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b949e', marginBottom: '0.2rem' }}>
                      Action Type:
                    </label>
                    <select
                      value={responseActionType}
                      onChange={e => setResponseActionType(e.target.value as DefensiveActionType)}
                      style={{
                        width: '100%',
                        backgroundColor: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        color: '#c9d1d9',
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.78rem',
                      }}
                    >
                      <option value="ISOLATE_ENDPOINT">ISOLATE_ENDPOINT (Cut host connectivity)</option>
                      <option value="RESTORE_ENDPOINT">RESTORE_ENDPOINT (Re-enable host)</option>
                      <option value="BLOCK_INDICATOR">BLOCK_INDICATOR (Firewall drop rule)</option>
                      <option value="UNBLOCK_INDICATOR">UNBLOCK_INDICATOR (Remove drop rule)</option>
                      <option value="DISABLE_ACCOUNT">DISABLE_ACCOUNT (Lock compromised account)</option>
                      <option value="RESTRICT_ACCOUNT_PERMISSIONS">RESTRICT_ACCOUNT_PERMISSIONS (Least privilege)</option>
                      <option value="APPLY_CONTAINMENT_POLICY">APPLY_CONTAINMENT_POLICY (Micro-segmentation)</option>
                      <option value="ESCALATE_INCIDENT">ESCALATE_INCIDENT (Notify NDSRC / Krest IR)</option>
                    </select>
                  </div>

                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b949e', marginBottom: '0.2rem' }}>
                      Target Entity ID (Host / IP / Account):
                    </label>
                    <input
                      type="text"
                      value={responseTarget}
                      onChange={e => setResponseTarget(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        color: '#c9d1d9',
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.78rem',
                      }}
                    />
                  </div>
                </div>

                {/* Quick Target Chips */}
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', color: '#8b949e' }}>Quick Targets:</span>
                  {['app-portal-01', '198.51.100.45', 'svc-aster', 'seg-dmz'].map(target => (
                    <button
                      key={target}
                      type="button"
                      onClick={() => setResponseTarget(target)}
                      style={{
                        padding: '0.15rem 0.4rem',
                        borderRadius: '3px',
                        backgroundColor: '#21262d',
                        border: '1px solid #30363d',
                        color: '#58a6ff',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                      }}
                    >
                      {target}
                    </button>
                  ))}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b949e', marginBottom: '0.2rem' }}>
                    Operational Reason / Justification:
                  </label>
                  <input
                    type="text"
                    value={responseReason}
                    onChange={e => setResponseReason(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#0d1117',
                      border: '1px solid #30363d',
                      borderRadius: '4px',
                      color: '#c9d1d9',
                      padding: '0.35rem 0.5rem',
                      fontSize: '0.78rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '0.45rem 1rem',
                      backgroundColor: '#da3633',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.78rem',
                    }}
                  >
                    ⚡ Execute Mitigation Action
                  </button>
                </div>
              </form>

              {responseFeedback && (
                <div
                  style={{
                    padding: '0.5rem',
                    borderRadius: '4px',
                    backgroundColor: responseFeedback.success ? '#1f6feb22' : '#da363322',
                    border: `1px solid ${responseFeedback.success ? '#238636' : '#f85149'}`,
                    color: responseFeedback.success ? '#3fb950' : '#f85149',
                    fontSize: '0.75rem',
                  }}
                >
                  {responseFeedback.message}
                </div>
              )}
            </div>

            {/* Audit Log */}
            <div
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f0f6fc' }}>
                DEFENSIVE MITIGATION AUDIT LOG
              </div>

              {defState.executedResponses.length === 0 ? (
                <div style={{ color: '#8b949e', fontSize: '0.75rem' }}>No defensive responses executed yet.</div>
              ) : (
                defState.executedResponses.map(act => (
                  <div
                    key={act.id}
                    style={{
                      backgroundColor: '#0d1117',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid #21262d',
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      color: '#c9d1d9',
                    }}
                  >
                    {act.auditLogEntry}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 6. PURPLE TEAM STUDIO TAB */}
        {/* ==================================================================== */}
        {activeTab === 'purple' && (
          <div style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f6fc' }}>
                  Purple Team Adversary Emulation & Coverage Studio
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                  Replay atomic adversary behaviors mapped to MITRE ATT&CK to measure SIEM detection coverage.
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunAllPurple}
                style={{
                  padding: '0.4rem 0.8rem',
                  backgroundColor: '#8957e5',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                ▶ Run All Emulation Tests
              </button>
            </div>

            {/* Scorecard Widget */}
            <div
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                gap: '2rem',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>OVERALL COVERAGE</div>
                <div
                  style={{
                    fontSize: '1.8rem',
                    fontWeight: 'bold',
                    color: purpleScorecard.coveragePercentage >= 80 ? '#3fb950' : '#db6d28',
                  }}
                >
                  {purpleScorecard.coveragePercentage}%
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>DETECTED</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#3fb950' }}>
                  {purpleScorecard.detectedCount} / {purpleScorecard.totalScenarios}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>PARTIAL</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#d29922' }}>
                  {purpleScorecard.partialCount}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>UNDETECTED (GAPS)</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f85149' }}>
                  {purpleScorecard.undetectedCount}
                </div>
              </div>

              <div style={{ flex: 1, minWidth: '220px' }}>
                <div style={{ fontSize: '0.7rem', color: '#8b949e' }}>POSTURE EVALUATION</div>
                <div style={{ fontSize: '0.75rem', color: '#c9d1d9', marginTop: '0.2rem' }}>
                  {purpleScorecard.evaluationNotes}
                </div>
              </div>
            </div>

            {/* M17 Red Team Integration Boundary Notice */}
            <div
              style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '4px',
                fontSize: '0.74rem',
                color: '#8b949e',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <span style={{ color: '#bc8cff', fontWeight: 600 }}>M17 Integration Boundary:</span> Compatible with Red Team Assessment Event Contract.
              </div>
              <span style={{ padding: '0.1rem 0.4rem', backgroundColor: '#21262d', borderRadius: '3px', color: '#58a6ff' }}>
                Active Mode: Fixture Emulation Fallback
              </span>
            </div>

            {/* Scenarios Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {PURPLE_TEAM_SCENARIOS.map(scen => {
                const result = defState.purpleEmulationResults[scen.id];
                const status = result?.status ?? 'UNDETECTED';
                const statusColor =
                  status === 'DETECTED' ? '#3fb950' : status === 'PARTIALLY_DETECTED' ? '#d29922' : '#8b949e';

                return (
                  <div
                    key={scen.id}
                    style={{
                      backgroundColor: '#161b22',
                      border: '1px solid #30363d',
                      borderRadius: '6px',
                      padding: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.4rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#8b949e' }}>{scen.id}</span>
                          <span style={{ fontWeight: 600, color: '#f0f6fc', fontSize: '0.85rem' }}>{scen.name}</span>
                          <span style={{ fontSize: '0.68rem', padding: '0.1rem 0.35rem', borderRadius: '3px', backgroundColor: '#21262d', color: '#8b949e' }}>
                            {scen.mitreTechniqueId}: {scen.mitreTechniqueName}
                          </span>
                        </div>
                        <div style={{ color: '#8b949e', fontSize: '0.74rem', marginTop: '0.2rem' }}>
                          {scen.description}
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            backgroundColor: `${statusColor}22`,
                            color: statusColor,
                            fontWeight: 'bold',
                            fontSize: '0.72rem',
                          }}
                        >
                          {status}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRunPurpleScenario(scen.id)}
                          style={{
                            padding: '0.25rem 0.6rem',
                            backgroundColor: '#21262d',
                            border: '1px solid #30363d',
                            borderRadius: '4px',
                            color: '#c9d1d9',
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                          }}
                        >
                          ▶ Replay Test
                        </button>
                      </div>
                    </div>

                    {result && (
                      <div
                        style={{
                          backgroundColor: '#0d1117',
                          padding: '0.4rem 0.6rem',
                          borderRadius: '4px',
                          border: '1px solid #21262d',
                          fontSize: '0.72rem',
                          color: '#c9d1d9',
                        }}
                      >
                        {result.detectionNotes}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* 7. OPERATION LAGOS SHIELD TAB */}
        {/* ==================================================================== */}
        {activeTab === 'mission' && (
          <div style={{ padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#f0f6fc' }}>
                  Operation Lagos Shield — Defensive Mission Checklist
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                  Protect Cedarline Services & Broad Street financial corridor from the Phantom Weaver breach.
                </div>
              </div>
            </div>

            {/* Mission Objectives Checklist */}
            <div
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.6rem',
              }}
            >
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f0f6fc' }}>
                MISSION OBJECTIVES
              </div>

              {defState.objectives.map(obj => (
                <div
                  key={obj.id}
                  style={{
                    backgroundColor: '#0d1117',
                    border: '1px solid #21262d',
                    borderRadius: '4px',
                    padding: '0.6rem 0.75rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1rem', color: obj.isCompleted ? '#3fb950' : '#8b949e' }}>
                      {obj.isCompleted ? '☑' : '☐'}
                    </span>
                    <div>
                      <div style={{ fontWeight: 600, color: obj.isCompleted ? '#f0f6fc' : '#c9d1d9', fontSize: '0.8rem' }}>
                        {obj.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#8b949e' }}>{obj.description}</div>
                      <div style={{ fontSize: '0.68rem', color: '#58a6ff', marginTop: '0.1rem' }}>Hint: {obj.hint}</div>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      color: obj.isCompleted ? '#3fb950' : '#8b949e',
                    }}
                  >
                    {obj.isCompleted ? 'COMPLETED' : 'INCOMPLETE'}
                  </span>
                </div>
              ))}
            </div>

            {/* Final Incident Report Submission Form */}
            <div
              style={{
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f0f6fc' }}>
                SUBMIT FINAL INCIDENT RESPONSE ASSESSMENT
              </div>

              <form onSubmit={handleSubmitReport} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.5rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b949e', marginBottom: '0.2rem' }}>
                      Suspected Threat Actor:
                    </label>
                    <input
                      type="text"
                      value={reportActor}
                      onChange={e => setReportActor(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        color: '#c9d1d9',
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.78rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b949e', marginBottom: '0.2rem' }}>
                      Initial Compromised Host:
                    </label>
                    <input
                      type="text"
                      value={reportHost}
                      onChange={e => setReportHost(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        color: '#c9d1d9',
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.78rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b949e', marginBottom: '0.2rem' }}>
                      Primary Attack Vector:
                    </label>
                    <input
                      type="text"
                      value={reportVector}
                      onChange={e => setReportVector(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        color: '#c9d1d9',
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.78rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b949e', marginBottom: '0.2rem' }}>
                      False Positive Host (SIEM Scanner):
                    </label>
                    <input
                      type="text"
                      value={reportFpHost}
                      onChange={e => setReportFpHost(e.target.value)}
                      style={{
                        width: '100%',
                        backgroundColor: '#0d1117',
                        border: '1px solid #30363d',
                        borderRadius: '4px',
                        color: '#c9d1d9',
                        padding: '0.35rem 0.5rem',
                        fontSize: '0.78rem',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.72rem', color: '#8b949e', marginBottom: '0.2rem' }}>
                    Root Cause & Mitigation Summary:
                  </label>
                  <textarea
                    rows={3}
                    value={reportSummary}
                    onChange={e => setReportSummary(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#0d1117',
                      border: '1px solid #30363d',
                      borderRadius: '4px',
                      color: '#c9d1d9',
                      padding: '0.4rem 0.6rem',
                      fontSize: '0.78rem',
                      resize: 'vertical',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.4rem' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '0.45rem 1.2rem',
                      backgroundColor: '#238636',
                      border: 'none',
                      borderRadius: '4px',
                      color: '#fff',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                    }}
                  >
                    Submit Formal Assessment Report
                  </button>
                </div>
              </form>

              {/* Evaluation Results Debriefing Panel */}
              {defState.evaluationResult && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.85rem',
                    backgroundColor: '#0d1117',
                    border: `1px solid ${defState.evaluationResult.isApproved ? '#2ea043' : '#da3633'}`,
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontWeight: 'bold',
                        fontSize: '0.9rem',
                        color: defState.evaluationResult.isApproved ? '#3fb950' : '#f85149',
                      }}
                    >
                      {defState.evaluationResult.isApproved ? 'ASSESSMENT APPROVED (100% PASS)' : 'REVISIONS REQUIRED'}
                    </span>
                    <span style={{ fontSize: '1rem', fontWeight: 'bold', color: '#f0f6fc' }}>
                      Score: {defState.evaluationResult.scorePercentage}%
                    </span>
                  </div>

                  <div style={{ color: '#c9d1d9', fontSize: '0.78rem' }}>
                    {defState.evaluationResult.critiqueSummary}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.3rem' }}>
                    {defState.evaluationResult.feedbackNotes.map((note, idx) => (
                      <div key={idx} style={{ fontSize: '0.72rem', color: '#8b949e' }}>
                        • {note}
                      </div>
                    ))}
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
