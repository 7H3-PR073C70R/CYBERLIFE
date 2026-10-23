/**
 * Cyberlife — Defender View Debrief Modal (Purple Team Teaching Timeline)
 *
 * Renders the post-job forensic timeline showing:
 * - What the SOC/Blue Team saw
 * - Synthesized realistic log lines (CEF, Sysmon, Suricata, Nginx, iptables)
 * - MITRE ATT&CK technique mapping
 * - Why each action was detected or missed
 * - Purple-team lessons on noise reduction and real-world defense
 */

import React, { useState } from 'react';
import { DefenderViewDebrief, DefenderViewEntry } from '@/simulation/cyber/trace/types';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';

export interface DefenderViewModalProps {
  debrief: DefenderViewDebrief;
  onClose?: () => void;
}

export const DefenderViewModal: React.FC<DefenderViewModalProps> = ({ debrief, onClose }) => {
  const sim = useOptionalSimulation();
  const entries = debrief.entries ?? [];
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(
    entries[0]?.id ?? null
  );

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      sim?.dispatch({ type: 'ClearActiveDebrief' });
    }
  };

  const selectedEntry =
    entries.find((e: DefenderViewEntry) => e.id === selectedEntryId) ?? entries[0];

  const getVerdictBadge = (assessment: string) => {
    if (assessment === 'STEALTHY') {
      return { label: 'GHOST // STEALTHY', bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', text: '#6ee7b7' };
    }
    if (assessment === 'SURVEILLED') {
      return { label: 'SUSPICIOUS // SURVEILLED', bg: 'rgba(234, 179, 8, 0.2)', border: '#eab308', text: '#fde047' };
    }
    return { label: 'COMPROMISED // BURNED', bg: 'rgba(239, 68, 68, 0.2)', border: '#ef4444', text: '#fca5a5' };
  };

  const verdict = getVerdictBadge(debrief.overallVerdict);
  const missedCount = Math.max(0, debrief.totalActions - debrief.detectedCount);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="defender-view-title"
      data-testid="defender-view-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9998,
        padding: '24px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          backgroundColor: '#090d16',
          border: '1px solid rgba(168, 85, 247, 0.4)',
          borderRadius: '8px',
          boxShadow: '0 25px 60px -15px rgba(168, 85, 247, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          color: '#e2e8f0',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderBottom: '1px solid rgba(168, 85, 247, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>🛡️</span>
              <h2
                id="defender-view-title"
                style={{
                  margin: 0,
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#e9d5ff',
                  letterSpacing: '0.05em',
                }}
              >
                DEFENDER VIEW // WHAT THE BLUE TEAM SAW
              </h2>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
              Perimeter Reconnaissance Forensics • Session Ref: {debrief.jobId}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                padding: '3px 8px',
                borderRadius: '4px',
                backgroundColor: verdict.bg,
                border: `1px solid ${verdict.border}`,
                color: verdict.text,
                fontSize: '11px',
                fontWeight: 700,
              }}
            >
              {verdict.label}
            </span>
            <button
              type="button"
              data-testid="btn-close-debrief"
              onClick={handleClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '16px',
                cursor: 'pointer',
                padding: '4px 8px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Overview Stats Bar */}
        <div
          style={{
            padding: '10px 20px',
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            fontSize: '11px',
          }}
        >
          <div>
            <span style={{ color: '#94a3b8' }}>Actions Executed: </span>
            <strong style={{ color: '#f8fafc' }}>{debrief.totalActions}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Detected by Sensors: </span>
            <strong style={{ color: debrief.detectedCount > 0 ? '#fca5a5' : '#86efac' }}>
              {debrief.detectedCount}
            </strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Evaded / Missed: </span>
            <strong style={{ color: '#86efac' }}>{missedCount}</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Final Trace: </span>
            <strong style={{ color: '#38bdf8' }}>{debrief.finalTraceLevel}%</strong>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>Legal Exposure: </span>
            <strong style={{ color: '#f59e0b' }}>{debrief.finalLegalExposure}%</strong>
          </div>
        </div>

        {/* Main Body (Split Pane: Timeline List on Left, Log & Teaching Details on Right) */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            minHeight: 0,
            overflow: 'hidden',
          }}
        >
          {/* Left: Timeline Events */}
          <div
            style={{
              width: '42%',
              borderRight: '1px solid rgba(255, 255, 255, 0.08)',
              overflowY: 'auto',
              padding: '12px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px', fontWeight: 600 }}>
              CHRONOLOGICAL TELEMETRY STREAM ({entries.length} EVENTS)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {entries.map((entry: DefenderViewEntry, idx: number) => {
                const isSelected = entry.id === selectedEntry?.id;
                const isDetected = entry.status === 'DETECTED';
                return (
                  <div
                    key={entry.id}
                    data-testid={`timeline-entry-${idx}`}
                    onClick={() => setSelectedEntryId(entry.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '4px',
                      backgroundColor: isSelected
                        ? 'rgba(168, 85, 247, 0.15)'
                        : 'rgba(30, 41, 59, 0.4)',
                      border: isSelected
                        ? '1px solid rgba(168, 85, 247, 0.5)'
                        : '1px solid rgba(255, 255, 255, 0.06)',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '10px', color: '#94a3b8' }}>{entry.timestampString}</span>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '1px 5px',
                          borderRadius: '2px',
                          backgroundColor: isDetected ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: isDetected ? '#fca5a5' : '#86efac',
                        }}
                      >
                        {entry.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#f8fafc', marginTop: '4px' }}>
                      {entry.actionName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#38bdf8', marginTop: '2px' }}>
                      &rarr; {entry.target} ({entry.attckTechniqueId})
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Event Deep Dive & Purple Team Lesson */}
          <div
            style={{
              width: '58%',
              overflowY: 'auto',
              padding: '16px',
              backgroundColor: '#0c1220',
            }}
          >
            {selectedEntry ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', color: '#f8fafc' }}>
                    {selectedEntry.actionName}
                  </h3>
                  <span style={{ fontSize: '11px', color: '#c084fc' }}>
                    {selectedEntry.attckTechniqueId} // {selectedEntry.attckTechniqueName}
                  </span>
                </div>

                {/* Log Line Generator Output */}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                    SIMULATED LOG ARTIFACT ({selectedEntry.logFormat}):
                  </div>
                  <pre
                    data-testid="simulated-log-box"
                    style={{
                      margin: 0,
                      padding: '10px 12px',
                      backgroundColor: '#020617',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      color: '#a5f3fc',
                      fontSize: '10px',
                      lineHeight: 1.5,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {selectedEntry.logLine}
                  </pre>
                </div>

                {/* Defender View Explanation */}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                    HOW THE BLUE TEAM ANALYZED THIS:
                  </div>
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'rgba(30, 41, 59, 0.5)',
                      borderRadius: '4px',
                      borderLeft: `3px solid ${selectedEntry.status === 'DETECTED' ? '#ef4444' : '#10b981'}`,
                      fontSize: '11px',
                      color: '#e2e8f0',
                      lineHeight: 1.5,
                    }}
                  >
                    {selectedEntry.blueTeamInsight}
                  </div>
                </div>

                {/* Purple Team OPSEC Mitigation */}
                <div style={{ marginTop: '14px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                    PURPLE TEAM LESSON // NOISE ATTENUATION:
                  </div>
                  <div
                    style={{
                      padding: '10px 12px',
                      backgroundColor: 'rgba(168, 85, 247, 0.08)',
                      borderRadius: '4px',
                      borderLeft: '3px solid #a855f7',
                      fontSize: '11px',
                      color: '#e9d5ff',
                      lineHeight: 1.5,
                    }}
                  >
                    {selectedEntry.redTeamLesson}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ color: '#64748b', fontSize: '12px' }}>
                Select a telemetry event to inspect the log line and blue team analysis.
              </div>
            )}

            {/* Key Takeaways Section */}
            <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '14px' }}>
              <div style={{ fontSize: '11px', color: '#38bdf8', marginBottom: '6px', fontWeight: 600 }}>
                BLUE TEAM SUMMARY & FEEDBACK:
              </div>
              <p style={{ margin: 0, fontSize: '11px', color: '#cbd5e1', lineHeight: 1.6 }}>
                {debrief.feedbackSummary}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            type="button"
            data-testid="btn-dismiss-debrief"
            onClick={handleClose}
            style={{
              padding: '6px 16px',
              borderRadius: '4px',
              backgroundColor: '#7c3aed',
              border: '1px solid #a855f7',
              color: '#f8fafc',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Acknowledge Debrief & Return to Workstation
          </button>
        </div>
      </div>
    </div>
  );
};
