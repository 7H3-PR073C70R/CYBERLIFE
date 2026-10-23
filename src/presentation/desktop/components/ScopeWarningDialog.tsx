/**
 * Cyberlife — Rules of Engagement Scope Warning Dialog
 *
 * In-world diegetic confirmation prompt when player attempts an out-of-scope action.
 * Emphasizes legal risk, evidence tainting, and RoE compliance.
 */

import React from 'react';
import { ScopeWarning } from '@/simulation/cyber/trace/types';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';

export interface ScopeWarningDialogProps {
  warning: ScopeWarning;
  onProceed?: () => void;
  onCancel?: () => void;
}

export const ScopeWarningDialog: React.FC<ScopeWarningDialogProps> = ({
  warning,
  onProceed,
  onCancel,
}) => {
  const sim = useOptionalSimulation();
  const activeScope = sim?.state.trace?.activeScope;

  const handleProceed = () => {
    if (onProceed) {
      onProceed();
    } else {
      sim?.dispatch({
        type: 'AcknowledgeScopeWarning',
        proceed: true,
      });
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      sim?.dispatch({
        type: 'AcknowledgeScopeWarning',
        proceed: false,
      });
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="scope-warning-title"
      data-testid="scope-warning-dialog"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#0f172a',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.25)',
          overflow: 'hidden',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
          color: '#f8fafc',
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div>
            <h2
              id="scope-warning-title"
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 700,
                color: '#fca5a5',
                letterSpacing: '0.05em',
              }}
            >
              RULES OF ENGAGEMENT // SCOPE BREACH DETECTED
            </h2>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>
              Attempted Target: <span style={{ color: '#f87171' }}>{warning.target}</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '16px', fontSize: '12px', lineHeight: 1.6 }}>
          <p style={{ margin: '0 0 12px 0', color: '#e2e8f0' }}>
            <strong>{warning.reason}</strong>
          </p>

          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(30, 41, 59, 0.7)',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              marginBottom: '14px',
              fontSize: '11px',
            }}
          >
            <div style={{ color: '#38bdf8', marginBottom: '4px', fontWeight: 600 }}>
              Authorised Mission Scope:
            </div>
            <div>
              • Mission: {activeScope?.missionName ?? activeScope?.clientName ?? 'Cedarline Enterprise Contract'}
            </div>
            <div>
              • Authorised Hosts: {activeScope?.authorizedHosts?.join(', ') ?? '10.0.4.0/24 (filesrv-01)'}
            </div>
            <div>
              • Authorised Ports: {activeScope?.authorizedPorts?.join(', ') ?? '445, 139, 80, 443'}
            </div>
          </div>

          <div
            style={{
              padding: '10px 12px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderLeft: '3px solid #ef4444',
              borderRadius: '0 4px 4px 0',
              marginBottom: '16px',
              fontSize: '11px',
              color: '#fca5a5',
            }}
          >
            <strong>"This host is not in your authorised scope. Proceed?"</strong>
            <div style={{ marginTop: '4px', color: '#cbd5e1' }}>
              Proceeding without authorisation increases your <strong>Legal Exposure meter</strong>, alerts perimeter blue teams, and flags any acquired logs or tokens as <strong>TAINTED EVIDENCE</strong> inadmissible for formal tribunal claims.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 16px',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}
        >
          <button
            type="button"
            data-testid="btn-scope-cancel"
            onClick={handleCancel}
            style={{
              padding: '8px 14px',
              borderRadius: '4px',
              backgroundColor: '#1e293b',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#f8fafc',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cancel (Abort Out-of-Scope Probe)
          </button>
          <button
            type="button"
            data-testid="btn-scope-proceed"
            onClick={handleProceed}
            style={{
              padding: '8px 14px',
              borderRadius: '4px',
              backgroundColor: '#b91c1c',
              border: '1px solid #ef4444',
              color: '#fee2e2',
              fontSize: '11px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Proceed Anyway (Accept Legal Liability)
          </button>
        </div>
      </div>
    </div>
  );
};
