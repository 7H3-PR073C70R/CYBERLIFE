/**
 * Cyberlife — Rule Tuner Application (Purple Team Detection Engineering)
 *
 * Graphical detection engineering studio for authoring SIEM detection rules,
 * tuning alerting thresholds, and running attack replays to eliminate false positives/negatives.
 */

import React, { useState } from 'react';

interface SiemRule {
  id: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  query: string;
  thresholdCount: number;
  timeWindowSeconds: number;
  status: 'ACTIVE' | 'TUNING' | 'DEPRECATED';
  description: string;
}

const INITIAL_RULES: SiemRule[] = [
  {
    id: 'RULE-001',
    name: 'Service Account Anomalous Share Access',
    severity: 'HIGH',
    category: 'Identity & Access',
    query:
      'event.type == "smb.tree_connect" && user.name == "svc-aster" && target.share contains "$"',
    thresholdCount: 1,
    timeWindowSeconds: 60,
    status: 'TUNING',
    description:
      'Alerts when the Aster AI service account queries administrative hidden or payroll shares.',
  },
  {
    id: 'RULE-002',
    name: 'Rapid Credential Guessing Spike',
    severity: 'MEDIUM',
    category: 'Authentication',
    query: 'event.type == "auth.failure" && event.substatus == "invalid_credentials"',
    thresholdCount: 5,
    timeWindowSeconds: 120,
    status: 'ACTIVE',
    description:
      'Detects password spraying or brute force attempts exceeding 5 failures in 2 minutes.',
  },
  {
    id: 'RULE-003',
    name: 'Broad Port Sweep Anomaly',
    severity: 'LOW',
    category: 'Network Reconnaissance',
    query: 'event.type == "firewall.reject" && network.direction == "inbound"',
    thresholdCount: 10,
    timeWindowSeconds: 30,
    status: 'ACTIVE',
    description:
      'Flags port scanning activity when firewall rejects exceed 10 packets within 30 seconds.',
  },
];

interface ReplayResult {
  scenarioName: string;
  totalEventsProcessed: number;
  alertsFired: number;
  truePositives: number;
  falsePositives: number;
  falseNegatives: number;
  verdict: 'OPTIMAL' | 'TOO_SENSITIVE' | 'TOO_LENIENT';
  notes: string;
}

export const RuleTunerApp: React.FC = () => {
  const [rules, setRules] = useState<SiemRule[]>(INITIAL_RULES);
  const [selectedRuleId, setSelectedRuleId] = useState<string>('RULE-001');
  const [threshold, setThreshold] = useState<number>(1);
  const [timeWindow, setTimeWindow] = useState<number>(60);
  const [severity, setSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('HIGH');
  const [ruleQuery, setRuleQuery] = useState<string>(
    'event.type == "smb.tree_connect" && user.name == "svc-aster" && target.share contains "$"'
  );
  const [replayResult, setReplayResult] = useState<ReplayResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const selectedRule = rules.find(r => r.id === selectedRuleId) ?? rules[0]!;

  const handleSelectRule = (rule: SiemRule) => {
    setSelectedRuleId(rule.id);
    setThreshold(rule.thresholdCount);
    setTimeWindow(rule.timeWindowSeconds);
    setSeverity(rule.severity);
    setRuleQuery(rule.query);
    setReplayResult(null);
    setSaveStatus(null);
  };

  const handleSaveRule = () => {
    setRules(prev =>
      prev.map(r =>
        r.id === selectedRuleId
          ? {
              ...r,
              thresholdCount: threshold,
              timeWindowSeconds: timeWindow,
              severity,
              query: ruleQuery,
              status: 'ACTIVE',
            }
          : r
      )
    );
    setSaveStatus('Rule configuration deployed to synthetic SIEM engine.');
  };

  const handleRunReplay = (scenario: 'baseline' | 'aster_attack' | 'backup_routine') => {
    setSaveStatus(null);
    if (scenario === 'baseline') {
      // Normal background operations: 0 alerts expected
      const triggered = threshold <= 0;
      setReplayResult({
        scenarioName: 'Scenario 1: Normal Office Baseline Traffic (1,450 events)',
        totalEventsProcessed: 1450,
        alertsFired: triggered ? 3 : 0,
        truePositives: 0,
        falsePositives: triggered ? 3 : 0,
        falseNegatives: 0,
        verdict: triggered ? 'TOO_SENSITIVE' : 'OPTIMAL',
        notes: triggered
          ? 'False positives detected on routine service health checks. Increase threshold.'
          : 'Zero false alarms fired during normal operations. Clean baseline verified.',
      });
    } else if (scenario === 'aster_attack') {
      // Real Aster Incident replay: 1 malicious payroll$ exfiltration
      const caught = threshold <= 2 && ruleQuery.includes('svc-aster');
      setReplayResult({
        scenarioName: 'Scenario 2: Aster AI Incident Replay (Exfiltration of payroll$)',
        totalEventsProcessed: 120,
        alertsFired: caught ? 1 : 0,
        truePositives: caught ? 1 : 0,
        falsePositives: 0,
        falseNegatives: caught ? 0 : 1,
        verdict: caught ? 'OPTIMAL' : 'TOO_LENIENT',
        notes: caught
          ? 'Threat caught! Alert generated within 0.02s of anomalous SMB2 tree connect.'
          : 'Alert missed! Threshold too high or query too narrow; adversary bypassed detection.',
      });
    } else {
      // Benign backup routine
      const triggered = !ruleQuery.includes('user.name == "svc-aster"') && threshold <= 1;
      setReplayResult({
        scenarioName: 'Scenario 3: Scheduled Backup Routine (admin-backup account)',
        totalEventsProcessed: 580,
        alertsFired: triggered ? 4 : 0,
        truePositives: 0,
        falsePositives: triggered ? 4 : 0,
        falseNegatives: 0,
        verdict: triggered ? 'TOO_SENSITIVE' : 'OPTIMAL',
        notes: triggered
          ? 'High false positive rate: backup service account was falsely flagged.'
          : 'Rule cleanly differentiated between authorized backup service and rogue assistant.',
      });
    }
  };

  return (
    <div
      className="rule-tuner-container"
      role="region"
      aria-label="Purple Team Rule Tuner"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '0.82rem',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px',
          backgroundColor: '#161b22',
          borderBottom: '1px solid #30363d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.1rem' }}>🎯</span>
          <div>
            <span style={{ fontWeight: 600, color: '#f0883e' }}>Rule Tuner</span>
            <span style={{ color: '#8b949e', marginLeft: '6px' }}>
              // Purple Team Collaborative Detection Studio
            </span>
          </div>
        </div>
        <span
          style={{
            fontSize: '0.72rem',
            backgroundColor: '#21262d',
            padding: '2px 8px',
            borderRadius: '4px',
            color: '#3fb950',
          }}
        >
          SIEM Engine: Active & Synchronized
        </span>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left Rules List */}
        <div
          style={{
            width: '260px',
            backgroundColor: '#161b22',
            borderRight: '1px solid #30363d',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              color: '#8b949e',
              textTransform: 'uppercase',
              marginBottom: '4px',
            }}
          >
            Detection Rules
          </div>

          {rules.map(rule => {
            const isSelected = rule.id === selectedRuleId;
            return (
              <button
                key={rule.id}
                type="button"
                onClick={() => handleSelectRule(rule)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '8px',
                  backgroundColor: isSelected ? '#1f6feb22' : '#0d1117',
                  border: isSelected ? '1px solid #1f6feb' : '1px solid #21262d',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <span style={{ color: '#58a6ff', fontWeight: 600 }}>{rule.id}</span>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      color:
                        rule.severity === 'CRITICAL' || rule.severity === 'HIGH'
                          ? '#f85149'
                          : '#f0883e',
                    }}
                  >
                    {rule.severity}
                  </span>
                </div>
                <div style={{ color: '#e6edf3', fontSize: '0.78rem', marginTop: '2px' }}>
                  {rule.name}
                </div>
                <div style={{ color: '#8b949e', fontSize: '0.7rem', marginTop: '4px' }}>
                  {rule.category} • {rule.status}
                </div>
              </button>
            );
          })}

          <div
            style={{
              marginTop: 'auto',
              padding: '6px',
              backgroundColor: '#0d1117',
              borderRadius: '4px',
              border: '1px solid #21262d',
              fontSize: '0.7rem',
              color: '#8b949e',
            }}
          >
            <div style={{ color: '#f0883e', fontWeight: 600 }}>Purple Team Feedback Loop</div>
            <div>
              Tune detection logic, replay synthetic telemetry, and verify zero false alerts.
            </div>
          </div>
        </div>

        {/* Center Rule Editor & Controls */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            padding: '12px',
            overflowY: 'auto',
            gap: '12px',
          }}
        >
          {/* Rule Metadata Bar */}
          <div
            style={{
              backgroundColor: '#161b22',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid #30363d',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#e6edf3' }}>
              {selectedRule.name} ({selectedRule.id})
            </div>
            <div style={{ color: '#8b949e', fontSize: '0.75rem', marginTop: '2px' }}>
              {selectedRule.description}
            </div>
          </div>

          {/* Query Expression Editor */}
          <div>
            <label
              style={{
                display: 'block',
                fontWeight: 600,
                color: '#58a6ff',
                marginBottom: '4px',
                fontSize: '0.75rem',
              }}
            >
              Detection Logic Expression (SIEM Event Filter):
            </label>
            <textarea
              value={ruleQuery}
              onChange={e => setRuleQuery(e.target.value)}
              rows={3}
              style={{
                width: '100%',
                backgroundColor: '#090d13',
                border: '1px solid #30363d',
                borderRadius: '4px',
                color: '#3fb950',
                padding: '8px',
                fontFamily: 'monospace',
                fontSize: '0.78rem',
                resize: 'none',
              }}
            />
          </div>

          {/* Threshold and Sensitivity Controls */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  color: '#8b949e',
                  fontSize: '0.75rem',
                  marginBottom: '4px',
                }}
              >
                Event Count Threshold:
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={threshold}
                onChange={e => setThreshold(parseInt(e.target.value) || 1)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  color: '#fff',
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  color: '#8b949e',
                  fontSize: '0.75rem',
                  marginBottom: '4px',
                }}
              >
                Time Window (Seconds):
              </label>
              <input
                type="number"
                min={5}
                max={600}
                value={timeWindow}
                onChange={e => setTimeWindow(parseInt(e.target.value) || 60)}
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  color: '#fff',
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label
                style={{
                  display: 'block',
                  color: '#8b949e',
                  fontSize: '0.75rem',
                  marginBottom: '4px',
                }}
              >
                Alert Severity:
              </label>
              <select
                value={severity}
                onChange={e =>
                  setSeverity(e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')
                }
                style={{
                  width: '100%',
                  padding: '4px 8px',
                  backgroundColor: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  color: '#fff',
                }}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={handleSaveRule}
              style={{
                padding: '6px 14px',
                backgroundColor: '#238636',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Deploy Tuned Rule
            </button>
            {saveStatus && (
              <span style={{ color: '#3fb950', fontSize: '0.75rem' }}>{saveStatus}</span>
            )}
          </div>

          {/* Attack Replay & Validation Testing Section */}
          <div
            style={{
              backgroundColor: '#161b22',
              borderRadius: '6px',
              border: '1px solid #30363d',
              padding: '12px',
            }}
          >
            <div style={{ color: '#f0883e', fontWeight: 600, marginBottom: '6px' }}>
              🔬 Telemetry Attack Replay Engine
            </div>
            <div style={{ color: '#8b949e', fontSize: '0.75rem', marginBottom: '10px' }}>
              Run deterministic recorded telemetry datasets through this rule to measure precision
              and recall.
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleRunReplay('baseline')}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#21262d',
                  color: '#c9d1d9',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                Replay: Baseline Normal (FP Test)
              </button>

              <button
                type="button"
                onClick={() => handleRunReplay('aster_attack')}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#381c1c',
                  color: '#ff7b72',
                  border: '1px solid #f85149',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Replay: Aster Attack (TP Test)
              </button>

              <button
                type="button"
                onClick={() => handleRunReplay('backup_routine')}
                style={{
                  padding: '6px 10px',
                  backgroundColor: '#21262d',
                  color: '#c9d1d9',
                  border: '1px solid #30363d',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                Replay: Backup Job (Edge Case)
              </button>
            </div>

            {/* Replay Result Panel */}
            {replayResult && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '10px',
                  backgroundColor: '#0d1117',
                  borderRadius: '4px',
                  border: '1px solid #30363d',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}
                >
                  <span style={{ fontWeight: 600, color: '#e6edf3' }}>
                    {replayResult.scenarioName}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color:
                        replayResult.verdict === 'OPTIMAL'
                          ? '#3fb950'
                          : replayResult.verdict === 'TOO_SENSITIVE'
                            ? '#f0883e'
                            : '#f85149',
                    }}
                  >
                    VERDICT: {replayResult.verdict}
                  </span>
                </div>

                <div
                  style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: '#8b949e' }}
                >
                  <div>Events Processed: {replayResult.totalEventsProcessed}</div>
                  <div>Alerts Triggered: {replayResult.alertsFired}</div>
                  <div style={{ color: '#3fb950' }}>
                    True Positives: {replayResult.truePositives}
                  </div>
                  <div style={{ color: '#f0883e' }}>
                    False Positives: {replayResult.falsePositives}
                  </div>
                  <div style={{ color: '#f85149' }}>
                    False Negatives: {replayResult.falseNegatives}
                  </div>
                </div>

                <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#c9d1d9' }}>
                  💡 {replayResult.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '4px 12px',
          backgroundColor: '#161b22',
          borderTop: '1px solid #30363d',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.75rem',
          color: '#8b949e',
        }}
      >
        <span>
          Authoring SIEM Rule {selectedRule.id} | Track: Purple Team Detection Engineering
        </span>
        <span style={{ color: '#3fb950' }}>Continuous Validation: Replay Loop Operational</span>
      </div>
    </div>
  );
};
