/**
 * Cyberlife — Workstation Top Panel Trace & Legal Exposure Applet
 *
 * Renders compact, diegetic telemetry in the Orion OS top panel during night jobs
 * or when active trace/legal exposure is elevated.
 * Honors prefers-reduced-motion.
 */

import React, { useMemo } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';

export interface TraceMeterAppletProps {
  onOpenDebrief?: () => void;
}

export const TraceMeterApplet: React.FC<TraceMeterAppletProps> = ({ onOpenDebrief }) => {
  const sim = useOptionalSimulation();
  const trace = sim?.state.trace;

  const isReducedMotion = useMemo(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  if (!trace) return null;

  // Visible during night operations, or if trace/legal exposure is non-zero
  const isVisible = trace.isNightJobActive || trace.traceMeter > 0 || trace.legalExposureMeter > 0;
  if (!isVisible) return null;

  const traceVal = Math.min(100, Math.max(0, trace.traceMeter));
  const legalVal = Math.min(100, Math.max(0, trace.legalExposureMeter));

  // Determine trace status color
  const getTraceColor = (val: number) => {
    if (val >= 90) return '#ef4444'; // critical red
    if (val >= 75) return '#f97316'; // orange
    if (val >= 50) return '#eab308'; // amber/yellow
    if (val >= 25) return '#38bdf8'; // sky blue
    return '#10b981'; // emerald green
  };

  const traceColor = getTraceColor(traceVal);
  const legalColor = legalVal >= 65 ? '#ef4444' : legalVal >= 40 ? '#f59e0b' : '#38bdf8';

  const activeAlert = trace.activeDefenderResponses.find(r => !r.isDismissed);

  return (
    <div
      className="trace-meter-applet"
      data-testid="trace-meter-applet"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '2px 8px',
        borderRadius: '4px',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        border: `1px solid ${traceVal >= 75 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
        fontSize: '11px',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        color: '#e2e8f0',
        lineHeight: 1,
      }}
    >
      {/* Night Job Indicator */}
      {trace.isNightJobActive && (
        <span
          title="Night Operation Active (Unofficial / Gray-Zone Reconnaissance)"
          style={{
            color: '#a855f7',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
          }}
        >
          <span>🌙</span>
          <span style={{ fontSize: '10px' }}>NIGHT</span>
        </span>
      )}

      {/* Short-Term Trace Meter */}
      <div
        data-testid="trace-indicator"
        title={`Short-Term Trace: ${traceVal}%\nThresholds: 25% Rate Limit, 50% SOC Alert/Honeypot, 75% IP Block, 90% Lockout`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          cursor: 'pointer',
        }}
        onClick={onOpenDebrief}
      >
        <span style={{ color: '#94a3b8', fontSize: '10px' }}>TRACE:</span>
        <div
          style={{
            width: '42px',
            height: '6px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${traceVal}%`,
              height: '100%',
              backgroundColor: traceColor,
              transition: isReducedMotion ? 'none' : 'width 0.3s ease',
            }}
          />
        </div>
        <span style={{ color: traceColor, fontWeight: 700, minWidth: '24px' }}>
          {traceVal}%
        </span>
      </div>

      <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>|</span>

      {/* Long-Term Legal Exposure Meter */}
      <div
        data-testid="legal-indicator"
        title={`Long-Term Legal Exposure: ${legalVal}%\nIncreases on out-of-scope probes. Affects faction standing & story consequences.`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        <span style={{ color: '#94a3b8', fontSize: '10px' }}>LEGAL:</span>
        <span style={{ color: legalColor, fontWeight: 700 }}>
          {legalVal}%
        </span>
      </div>

      {/* Active Defender Alert Capsule */}
      {activeAlert && (
        <div
          data-testid="defender-response-capsule"
          title={`Active Defender Response: ${activeAlert.message}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '1px 5px',
            borderRadius: '3px',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            fontSize: '10px',
            animation: isReducedMotion ? 'none' : 'pulse 2s infinite',
          }}
        >
          <span>⚠️ {activeAlert.type}</span>
          <button
            type="button"
            title="Dismiss response alert"
            onClick={e => {
              e.stopPropagation();
              sim?.dispatch({
                type: 'DismissDefenderResponse',
                responseId: activeAlert.id,
              });
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#fca5a5',
              cursor: 'pointer',
              padding: '0 2px',
              fontSize: '10px',
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Debrief Button (if debrief ready) */}
      {trace.activeDebrief && (
        <button
          type="button"
          data-testid="btn-open-debrief"
          onClick={onOpenDebrief}
          style={{
            padding: '2px 6px',
            borderRadius: '3px',
            backgroundColor: 'rgba(168, 85, 247, 0.25)',
            border: '1px solid rgba(168, 85, 247, 0.5)',
            color: '#e9d5ff',
            fontSize: '10px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          🛡️ Blue Team Debrief
        </button>
      )}
    </div>
  );
};
