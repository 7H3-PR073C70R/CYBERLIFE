/**
 * Cyberlife — Milestone 14: Social Pretexting & Human Security Desktop Application
 *
 * Interactive human security simulation covering physical venue encounters,
 * phone pretexts, badge challenges, out-of-band verification, and psychological pressure.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated, in-memory domain model. Zero external communication.
 * All personas, venues, phone numbers, and badges are fictional.
 */

import React, { useState, useMemo } from 'react';
import {
  SocialPretextEngine,
  SOCIAL_PRETEXT_SCENARIOS,
} from '../../../simulation/cyber/social';
import {
  PretextEncounterDefinition,
  PretextDialogueOption,
} from '../../../simulation/cyber/social/types';

export const SocialPretextApp: React.FC = () => {
  const initialParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialScenId =
    initialParams?.get('pretextScenario') || SOCIAL_PRETEXT_SCENARIOS[0]!.id;

  const [engine] = useState(() => new SocialPretextEngine());
  const scenarios = useMemo(() => engine.getAllScenarios(), [engine]);

  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(initialScenId);
  const [activeSession, setActiveSession] = useState(() =>
    engine.startEncounter(initialScenId)
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeScenario: PretextEncounterDefinition = useMemo(
    () => (engine.getScenario(selectedScenarioId) ?? scenarios[0] ?? SOCIAL_PRETEXT_SCENARIOS[0])!,
    [engine, selectedScenarioId, scenarios]
  );

  const currentNode = useMemo(
    () => activeScenario.nodes[activeSession.currentNodeId],
    [activeScenario, activeSession.currentNodeId]
  );

  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    const newSession = engine.startEncounter(scenarioId);
    setActiveSession(newSession);
    setToastMessage(`Loaded encounter scenario: ${engine.getScenario(scenarioId)?.title}`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRestartScenario = () => {
    const newSession = engine.startEncounter(selectedScenarioId);
    setActiveSession(newSession);
    setToastMessage(`Reset scenario: ${activeScenario.title}`);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleChooseOption = (option: PretextDialogueOption) => {
    if (activeSession.isCompleted) return;

    try {
      const updatedSession = engine.selectOption(selectedScenarioId, option.id);
      setActiveSession({ ...updatedSession });
      if (option.verificationAction) {
        setToastMessage(`Executed procedure: [${option.verificationAction.replace(/_/g, ' ')}]`);
        setTimeout(() => setToastMessage(null), 3000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setToastMessage(`Action error: ${msg}`);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const getToneBadgeColors = (tone: string) => {
    switch (tone) {
      case 'STRICT_PROCEDURE':
        return { bg: '#0d3824', border: '#238636', text: '#3fb950' };
      case 'SKEPTICAL_CHALLENGE':
        return { bg: '#382b0d', border: '#9e6a03', text: '#d29922' };
      case 'AUTHORITATIVE':
        return { bg: '#2b1b38', border: '#8957e5', text: '#a371f7' };
      case 'EMPATHETIC':
        return { bg: '#0d2847', border: '#1f6feb', text: '#58a6ff' };
      case 'EVASIVE':
        return { bg: '#3d1618', border: '#da3633', text: '#f85149' };
      default:
        return { bg: '#21262d', border: '#30363d', text: '#8b949e' };
    }
  };

  const getOutcomeColors = (status?: string) => {
    switch (status) {
      case 'POLICY_UPHELD':
      case 'SUCCESS_VERIFIED':
      case 'THREAT_CONTAINED':
        return { bg: '#0d3824', border: '#238636', text: '#3fb950', badge: '#238636' };
      case 'SECURITY_BREACH_ALLOWED':
        return { bg: '#3d1618', border: '#da3633', text: '#f85149', badge: '#da3633' };
      default:
        return { bg: '#382b0d', border: '#9e6a03', text: '#d29922', badge: '#9e6a03' };
    }
  };

  const outcomeStyle = getOutcomeColors(activeSession.finalOutcome?.status);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
        fontFamily: 'Inter, -apple-system, sans-serif',
        fontSize: '12px',
        userSelect: 'none',
      }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '16px',
            zIndex: 50,
            backgroundColor: '#0d2847',
            border: '1px solid #1f6feb',
            color: '#58a6ff',
            padding: '6px 12px',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#58a6ff',
            }}
          />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Application Bar */}
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
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: '#f85149',
              boxShadow: '0 0 6px #f85149',
            }}
          />
          <span style={{ fontWeight: 700, letterSpacing: '0.5px', color: '#f0f6fc', fontSize: '13px' }}>
            EKOMIND SOCIAL PRETEXT & HUMAN RESILIENCE LAB
          </span>
          <span
            style={{
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              backgroundColor: '#3d1618',
              color: '#f85149',
              border: '1px solid #da3633',
              fontFamily: 'monospace',
            }}
          >
            HUMAN-SEC-SIM // V14.0
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#8b949e', fontSize: '11px' }}>Venue:</span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: '#21262d',
              color: '#f0f6fc',
              border: '1px solid #30363d',
              fontWeight: 500,
              fontSize: '11px',
            }}
          >
            {activeScenario.venueLabel}
          </span>
          <button
            onClick={handleRestartScenario}
            style={{
              padding: '3px 8px',
              backgroundColor: '#21262d',
              color: '#c9d1d9',
              border: '1px solid #30363d',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '11px',
            }}
            title="Reset active scenario encounter"
          >
            Restart Encounter
          </button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Column: Scenario Catalog */}
        <div
          style={{
            width: '280px',
            backgroundColor: '#161b22',
            borderRight: '1px solid #30363d',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              padding: '8px 12px',
              borderBottom: '1px solid #30363d',
              backgroundColor: '#21262d',
              fontWeight: 700,
              fontSize: '10px',
              letterSpacing: '0.5px',
              color: '#8b949e',
              textTransform: 'uppercase',
            }}
          >
            Authored Pretext Encounters ({scenarios.length})
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {scenarios.map(scen => {
              const isSelected = scen.id === selectedScenarioId;
              return (
                <button
                  key={scen.id}
                  onClick={() => handleSelectScenario(scen.id)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: isSelected ? '1px solid #f85149' : '1px solid #30363d',
                    backgroundColor: isSelected ? '#2d1819' : '#0d1117',
                    color: isSelected ? '#f0f6fc' : '#8b949e',
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '11px', color: isSelected ? '#f85149' : '#f0f6fc' }}>
                      {scen.title}
                    </span>
                  </div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '10px', color: '#8b949e', lineHeight: '1.4' }}>
                    {scen.summary}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: '#6e7681' }}>
                    <span>NPC: {scen.targetNpc.name}</span>
                    <span>•</span>
                    <span>{scen.targetNpc.title}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* NPC Profile Box */}
          <div style={{ padding: '10px', backgroundColor: '#0d1117', borderTop: '1px solid #30363d' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                color: '#8b949e',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Active Interlocutor Profile
            </span>
            <div
              style={{
                backgroundColor: '#161b22',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #30363d',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                fontSize: '11px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8b949e' }}>Name:</span>
                <span style={{ fontWeight: 600, color: '#f85149' }}>{activeScenario.targetNpc.name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8b949e' }}>Role:</span>
                <span style={{ color: '#c9d1d9' }}>{activeScenario.targetNpc.title}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8b949e' }}>Dept:</span>
                <span style={{ color: '#c9d1d9' }}>{activeScenario.targetNpc.department}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8b949e' }}>Badge ID:</span>
                <span style={{ fontFamily: 'monospace', color: '#d29922' }}>
                  {activeScenario.targetNpc.badgeNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Encounter Stage & Dialogue Branching */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#0d1117' }}>
          {/* Situation Briefing Bar */}
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#161b22',
              borderBottom: '1px solid #30363d',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '13px', color: '#f0f6fc' }}>
                {activeScenario.title}
              </span>
              <span style={{ fontSize: '11px', color: '#58a6ff', fontFamily: 'monospace' }}>
                Location: {activeScenario.venueLabel}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#8b949e', lineHeight: '1.5' }}>
              {activeScenario.situationBriefing}
            </p>
          </div>

          {/* Psychological & Trust Meters Dashboard */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: '#161b22',
              borderBottom: '1px solid #30363d',
            }}
          >
            {/* Trust Meter (-100 to 100) */}
            <div
              style={{
                backgroundColor: '#0d1117',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #30363d',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 600, textTransform: 'uppercase' }}>
                  Trust Index
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: activeSession.metrics.trust >= 20 ? '#3fb950' : activeSession.metrics.trust <= -20 ? '#f85149' : '#d29922',
                  }}
                >
                  {activeSession.metrics.trust > 0 ? `+${activeSession.metrics.trust}` : activeSession.metrics.trust}
                </span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#21262d', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: activeSession.metrics.trust >= 0 ? '#238636' : '#da3633',
                    width: `${Math.min(100, Math.max(0, (activeSession.metrics.trust + 100) / 2))}%`,
                    transition: 'width 300ms ease',
                  }}
                />
              </div>
            </div>

            {/* Suspicion Meter (0 to 100) */}
            <div
              style={{
                backgroundColor: '#0d1117',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #30363d',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 600, textTransform: 'uppercase' }}>
                  Suspicion Level
                </span>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: activeSession.metrics.suspicion >= 50 ? '#f85149' : activeSession.metrics.suspicion >= 25 ? '#d29922' : '#58a6ff',
                  }}
                >
                  {activeSession.metrics.suspicion}%
                </span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#21262d', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: activeSession.metrics.suspicion >= 50 ? '#da3633' : activeSession.metrics.suspicion >= 25 ? '#9e6a03' : '#1f6feb',
                    width: `${Math.min(100, Math.max(0, activeSession.metrics.suspicion))}%`,
                    transition: 'width 300ms ease',
                  }}
                />
              </div>
            </div>

            {/* Credibility Meter (0 to 100) */}
            <div
              style={{
                backgroundColor: '#0d1117',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #30363d',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 600, textTransform: 'uppercase' }}>
                  Credibility
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#58a6ff' }}>
                  {activeSession.metrics.credibility}%
                </span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#21262d', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#1f6feb',
                    width: `${Math.min(100, Math.max(0, activeSession.metrics.credibility))}%`,
                    transition: 'width 300ms ease',
                  }}
                />
              </div>
            </div>

            {/* Authority Meter (0 to 100) */}
            <div
              style={{
                backgroundColor: '#0d1117',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #30363d',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '10px', color: '#8b949e', fontWeight: 600, textTransform: 'uppercase' }}>
                  Perceived Authority
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: '11px', fontWeight: 700, color: '#a371f7' }}>
                  {activeSession.metrics.authority}%
                </span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#21262d', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    backgroundColor: '#8957e5',
                    width: `${Math.min(100, Math.max(0, activeSession.metrics.authority))}%`,
                    transition: 'width 300ms ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Dialogue Transcript Stream */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {activeSession.history.map((step, idx) => {
              const node = activeScenario.nodes[step.nodeId];
              if (!node) return null;
              const isNpc = node.speaker === 'NPC';
              const isPlayer = node.speaker === 'PLAYER';

              return (
                <div
                  key={`${step.nodeId}-${idx}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isPlayer ? 'flex-end' : isNpc ? 'flex-start' : 'center',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#8b949e' }}>
                    <span
                      style={{
                        fontWeight: 700,
                        color: isNpc ? '#f85149' : isPlayer ? '#58a6ff' : '#d29922',
                      }}
                    >
                      {node.speakerName}
                    </span>
                    <span>•</span>
                    <span style={{ fontFamily: 'monospace', fontSize: '9px', color: '#6e7681' }}>
                      {step.timestamp.slice(11, 19)}
                    </span>
                  </div>

                  <div
                    style={{
                      maxWidth: '560px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isPlayer ? '1px solid #1f6feb' : isNpc ? '1px solid #30363d' : '1px solid #9e6a03',
                      backgroundColor: isPlayer ? '#0d2847' : isNpc ? '#161b22' : '#2b210d',
                      color: isPlayer ? '#c9d1d9' : isNpc ? '#f0f6fc' : '#e3b341',
                      fontSize: '11px',
                      lineHeight: '1.5',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                    }}
                  >
                    {node.text}
                  </div>
                </div>
              );
            })}

            {/* Terminal Outcome Banner */}
            {activeSession.isCompleted && activeSession.finalOutcome && (
              <div
                style={{
                  marginTop: '12px',
                  padding: '14px',
                  borderRadius: '8px',
                  border: `1px solid ${outcomeStyle.border}`,
                  backgroundColor: outcomeStyle.bg,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontWeight: 700,
                        backgroundColor: outcomeStyle.badge,
                        color: '#f0f6fc',
                        textTransform: 'uppercase',
                      }}
                    >
                      {activeSession.finalOutcome.status.replace(/_/g, ' ')}
                    </span>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: outcomeStyle.text }}>
                      {activeSession.finalOutcome.title}
                    </h3>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#0d3824',
                        color: '#3fb950',
                        border: '1px solid #238636',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    >
                      +{activeSession.finalOutcome.xpReward} XP
                    </span>
                    <span
                      style={{
                        padding: '2px 6px',
                        borderRadius: '4px',
                        backgroundColor: '#382b0d',
                        color: '#d29922',
                        border: '1px solid #9e6a03',
                        fontFamily: 'monospace',
                        fontWeight: 600,
                      }}
                    >
                      ₦{(activeSession.finalOutcome.nairaRewardKobo / 100).toLocaleString()}
                    </span>
                  </div>
                </div>

                <p style={{ margin: '0 0 10px 0', fontSize: '11px', color: '#c9d1d9', lineHeight: '1.5' }}>
                  {activeSession.finalOutcome.summary}
                </p>

                {/* Evidence Item Generated */}
                {activeSession.finalOutcome.evidenceGenerated && (
                  <div
                    style={{
                      marginBottom: '10px',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#161b22',
                      border: '1px solid #1f6feb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#58a6ff', display: 'block' }}>
                        Forensic Evidence Captured
                      </span>
                      <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#f0f6fc' }}>
                        {activeSession.finalOutcome.evidenceGenerated}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        backgroundColor: '#0d2847',
                        color: '#58a6ff',
                        fontSize: '10px',
                        fontWeight: 600,
                        border: '1px solid #1f6feb',
                      }}
                    >
                      Saved to Evidence Vault
                    </span>
                  </div>
                )}

                {/* Feedback Notes */}
                {activeSession.finalOutcome.feedbackNotes.length > 0 && (
                  <div style={{ borderTop: '1px solid #30363d', paddingTop: '8px', fontSize: '11px' }}>
                    <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, color: '#8b949e', display: 'block', marginBottom: '4px' }}>
                      Procedural & Security Feedback
                    </span>
                    {activeSession.finalOutcome.feedbackNotes.map((note, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#c9d1d9', marginBottom: '2px' }}>
                        <span style={{ color: '#58a6ff' }}>•</span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Options Tray */}
          {!activeSession.isCompleted && currentNode && currentNode.options && (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#161b22',
                borderTop: '1px solid #30363d',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8b949e' }}>
                Choose Response / Operational Security Verification Action:
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {currentNode.options.map(option => {
                  const colors = getToneBadgeColors(option.tone);
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleChooseOption(option)}
                      style={{
                        padding: '10px 12px',
                        textAlign: 'left',
                        borderRadius: '6px',
                        backgroundColor: '#0d1117',
                        border: '1px solid #30363d',
                        color: '#f0f6fc',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        gap: '6px',
                        transition: 'border-color 150ms ease',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = '#f85149';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = '#30363d';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span
                          style={{
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '9px',
                            fontWeight: 700,
                            backgroundColor: colors.bg,
                            border: `1px solid ${colors.border}`,
                            color: colors.text,
                            textTransform: 'uppercase',
                          }}
                        >
                          {option.tone.replace(/_/g, ' ')}
                        </span>
                        {option.verificationAction && (
                          <span
                            style={{
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '9px',
                              backgroundColor: '#0d2847',
                              color: '#58a6ff',
                              border: '1px solid #1f6feb',
                              fontFamily: 'monospace',
                            }}
                          >
                            [{option.verificationAction.replace(/_/g, ' ')}]
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '11px', lineHeight: '1.4' }}>
                        "{option.text}"
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Security Procedures & Real-Time Audit Log */}
        <div
          style={{
            width: '280px',
            backgroundColor: '#161b22',
            borderLeft: '1px solid #30363d',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
          }}
        >
          {/* Learning Objectives */}
          <div style={{ padding: '12px', borderBottom: '1px solid #30363d', backgroundColor: '#161b22' }}>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: '#8b949e',
                display: 'block',
                marginBottom: '6px',
              }}
            >
              Target Learning Objectives
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {activeScenario.learningObjectives.map((obj, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: '#c9d1d9' }}>
                  <span style={{ color: '#f85149' }}>✓</span>
                  <span>{obj}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Real-time Audit Trail */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div
              style={{
                padding: '8px 12px',
                borderBottom: '1px solid #30363d',
                backgroundColor: '#21262d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#8b949e' }}>
                Simulation Audit Trail ({activeSession.auditEvents.length})
              </span>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3fb950' }} />
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '8px',
                fontFamily: 'monospace',
                fontSize: '10px',
                color: '#8b949e',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                backgroundColor: '#0d1117',
              }}
            >
              {activeSession.auditEvents.map((evt, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '6px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#161b22',
                    border: '1px solid #30363d',
                    color: '#c9d1d9',
                    wordBreak: 'break-word',
                    lineHeight: '1.4',
                  }}
                >
                  {evt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
