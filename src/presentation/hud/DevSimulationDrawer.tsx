import React, { useState, useEffect } from 'react';
import { useOptionalSimulation } from '../../application/simulation/SimulationContext';
import { CommandResult } from '../../simulation/commands/types';
import { Money } from '../../domain/common/Money';

export interface DevSimulationDrawerProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const DevSimulationDrawer: React.FC<DevSimulationDrawerProps> = ({ isOpen, onClose }) => {
  const sim = useOptionalSimulation();
  const [lastResult, setLastResult] = useState<CommandResult | null>(null);

  // Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen || !sim) return null;

  const { state, dispatch, lastEvents } = sim;

  const handleRunCommand = (command: Parameters<typeof dispatch>[0]) => {
    const res = dispatch(command);
    setLastResult(res);
  };

  const formattedMoney = Money.fromKobo(state.player.moneyKobo).format();

  return (
    <div
      className="dev-sim-drawer-overlay hud-interactive"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-sim-drawer-title"
      data-testid="dev-sim-drawer"
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(440px, 95vw)',
        backgroundColor: 'rgba(10, 15, 26, 0.96)',
        backdropFilter: 'blur(12px)',
        borderLeft: '1px solid var(--color-border-subtle)',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.6)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-sans)',
        pointerEvents: 'auto',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          borderBottom: '1px solid var(--color-border-subtle)',
          backgroundColor: 'rgba(16, 24, 40, 0.8)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }} aria-hidden="true">
            ⚙️
          </span>
          <h2
            id="dev-sim-drawer-title"
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--color-accent-amber)',
              margin: 0,
            }}
          >
            Simulation Engine Verification
          </h2>
        </div>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onClose();
          }}
          aria-label="Close Simulation Inspector"
          className="btn-icon-close"
          style={{
            width: '36px',
            height: '36px',
            minWidth: '36px',
            minHeight: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            pointerEvents: 'auto',
          }}
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          fontSize: '0.85rem',
        }}
      >
        {/* State Summary Card */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0.75rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.4rem',
              fontWeight: 600,
              color: 'var(--color-accent-cyan)',
            }}
          >
            <span>Authoritative State</span>
            <span data-testid="dev-state-revision">Rev: #{state.metadata.revision}</span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.4rem',
              color: 'var(--color-text-secondary)',
            }}
          >
            <div>
              Clock:{' '}
              <strong data-testid="dev-state-clock" style={{ color: '#fff' }}>
                {state.time.calendar.timeString}
              </strong>
            </div>
            <div>
              Date:{' '}
              <strong data-testid="dev-state-date" style={{ color: '#fff' }}>
                {state.time.calendar.dateString}
              </strong>
            </div>
            <div>
              Health:{' '}
              <strong data-testid="dev-state-health" style={{ color: '#10b981' }}>
                {state.player.health}%
              </strong>
            </div>
            <div>
              Energy:{' '}
              <strong data-testid="dev-state-energy" style={{ color: '#06b6d4' }}>
                {state.player.energy}%
              </strong>
            </div>
            <div>
              Funds:{' '}
              <strong data-testid="dev-state-funds" style={{ color: '#f59e0b' }}>
                {formattedMoney}
              </strong>
            </div>
            <div>
              Location:{' '}
              <strong data-testid="dev-state-location" style={{ color: '#fff' }}>
                {state.player.locationId}
              </strong>
            </div>
          </div>
        </div>

        {/* Command Testing Actions */}
        <div>
          <h3
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
            }}
          >
            Dispatch Simulation Commands
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              onClick={() =>
                handleRunCommand({
                  type: 'AdvanceSimulationTime',
                  deltaSeconds: 3600,
                })
              }
              data-testid="dev-btn-advance-1h"
            >
              +1 Hour Clock
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              onClick={() =>
                handleRunCommand({
                  type: 'AdvanceSimulationTime',
                  deltaSeconds: 600,
                })
              }
              data-testid="dev-btn-advance-10m"
            >
              +10 Mins Clock
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              onClick={() =>
                handleRunCommand({
                  type: 'CreditMoney',
                  amountKobo: 50_000,
                  reason: 'Grant stipend',
                })
              }
              data-testid="dev-btn-credit-money"
            >
              +₦500 Funds
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              onClick={() =>
                handleRunCommand({
                  type: 'DebitMoney',
                  amountKobo: 20_000,
                  reason: 'Street food',
                })
              }
              data-testid="dev-btn-debit-money"
            >
              -₦200 Funds
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              onClick={() =>
                handleRunCommand({
                  type: 'SetPlayerAttribute',
                  attribute: 'energy',
                  value: 100,
                })
              }
              data-testid="dev-btn-restore-energy"
            >
              Restore Energy (100)
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              onClick={() =>
                handleRunCommand({
                  type: 'AddInventoryItem',
                  itemId: 'item_coffee',
                  quantity: 1,
                })
              }
              data-testid="dev-btn-add-coffee"
            >
              +1 Coffee Item
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              onClick={() =>
                handleRunCommand({
                  type: 'SetWorldFlag',
                  key: 'has_read_community_noticeboard',
                  value: !state.flags['has_read_community_noticeboard'],
                })
              }
              data-testid="dev-btn-toggle-flag"
            >
              Toggle Notice Flag
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              onClick={() =>
                handleRunCommand({
                  type: 'ScheduleTimer',
                  id: `timer_${Date.now()}`,
                  durationSeconds: 15,
                  label: 'Dev Verification Alert',
                })
              }
              data-testid="dev-btn-schedule-timer"
            >
              Schedule 15s Timer
            </button>

            <button
              type="button"
              style={{
                gridColumn: '1 / -1',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '0.4rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              onClick={() =>
                handleRunCommand({
                  type: 'DebitMoney',
                  amountKobo: 999_999_900,
                  reason: 'Excessive debit test',
                })
              }
              data-testid="dev-btn-test-invalid"
            >
              Test Invalid Action (Debit ₦9,999,999.00)
            </button>
          </div>
        </div>

        {/* Narrative Episode Controls */}
        <div>
          <h3
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-accent-cyan)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
            }}
          >
            Episode 01 Controls (Dev)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn-primary"
              style={{
                fontSize: '0.75rem',
                padding: '0.4rem',
                backgroundColor: 'rgba(6, 182, 212, 0.25)',
                border: '1px solid #06b6d4',
                color: '#67e8f9',
              }}
              onClick={() =>
                handleRunCommand({
                  type: 'StartEpisode',
                  episodeId: 'ep01_triage_init',
                })
              }
              data-testid="dev-btn-start-ep01"
            >
              🎬 Start Episode 01
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              onClick={() =>
                handleRunCommand({
                  type: 'SetEpisodeGuidanceMode',
                  mode: state.episode?.guidanceMode === 'Immersive' ? 'Guided' : 'Immersive',
                })
              }
              data-testid="dev-btn-toggle-guidance"
            >
              Mode: {state.episode?.guidanceMode ?? 'Guided'} ➔ {state.episode?.guidanceMode === 'Immersive' ? 'Guided' : 'Immersive'}
            </button>

            <button
              type="button"
              className="btn-primary"
              style={{ fontSize: '0.75rem', padding: '0.4rem' }}
              onClick={() => {
                if (state.episode?.activeBeatId) {
                  handleRunCommand({
                    type: 'CompleteEpisodeBeat',
                    beatId: state.episode.activeBeatId,
                  });
                } else {
                  handleRunCommand({
                    type: 'AdvanceEpisodeBeat',
                  });
                }
              }}
              data-testid="dev-btn-advance-beat"
            >
              ⏩ Next / Advance Beat
            </button>

            <button
              type="button"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid #f59e0b',
                color: '#fbbf24',
                padding: '0.4rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              onClick={() =>
                handleRunCommand({
                  type: 'TriggerBlackoutBeat',
                  beatId: 'ep01_beat_12_cliffhanger',
                })
              }
              data-testid="dev-btn-trigger-blackout"
            >
              ⚡ Trigger Blackout
            </button>
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Active Episode: <strong style={{ color: '#fff' }}>{state.episode?.activeEpisodeId ?? 'None'}</strong> | Beat:{' '}
            <strong style={{ color: '#fff' }}>{state.episode?.activeBeatId ?? 'None'}</strong>
          </div>
        </div>

        {/* Trace & Legal Exposure Testing Controls */}
        <div style={{ marginTop: '1rem' }}>
          <h3
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.5rem',
            }}
          >
            Trace & Legal Exposure Telemetry
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
            <button
              type="button"
              style={{
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                border: '1px solid #a855f7',
                color: '#e9d5ff',
                padding: '0.4rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              onClick={() =>
                handleRunCommand({
                  type: 'SetJobScope',
                  isNightJob: true,
                  jobId: 'ep01_night_intel',
                })
              }
              data-testid="dev-btn-start-nightjob"
            >
              🌙 Start Night Job
            </button>

            <button
              type="button"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #ef4444',
                color: '#fca5a5',
                padding: '0.4rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              onClick={() =>
                handleRunCommand({
                  type: 'RecordActionNoise',
                  actionId: 'portscan_aggressive',
                  target: 'app-portal-01',
                })
              }
              data-testid="dev-btn-active-scan"
            >
              💥 Loud Scan (+60 Noise)
            </button>

            <button
              type="button"
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                border: '1px solid #10b981',
                color: '#6ee7b7',
                padding: '0.4rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              onClick={() =>
                handleRunCommand({
                  type: 'RecordActionNoise',
                  actionId: 'passive_osint',
                  target: 'app-portal-01',
                })
              }
              data-testid="dev-btn-quiet-osint"
            >
              🤫 Passive OSINT (+5)
            </button>

            <button
              type="button"
              style={{
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid #f59e0b',
                color: '#fde047',
                padding: '0.4rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              onClick={() =>
                handleRunCommand({
                  type: 'RaiseScopeWarning',
                  target: 'out-of-scope-dc02',
                  actionId: 'portscan_aggressive',
                  attemptedCommand: 'svcscan inspect out-of-scope-dc02',
                })
              }
              data-testid="dev-btn-raise-scope-warning"
            >
              ⚠️ Raise Scope Warning
            </button>

            <button
              type="button"
              style={{
                backgroundColor: 'rgba(56, 189, 248, 0.2)',
                border: '1px solid #38bdf8',
                color: '#bae6fd',
                padding: '0.4rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              onClick={() =>
                handleRunCommand({
                  type: 'GenerateDefenderDebrief',
                  jobId: 'ep01_night_intel',
                  jobTitle: 'Night Operation: Perimeter Reconnaissance',
                })
              }
              data-testid="dev-btn-generate-debrief"
            >
              🛡️ Defender Debrief
            </button>

            <button
              type="button"
              style={{
                backgroundColor: 'rgba(100, 116, 139, 0.2)',
                border: '1px solid #64748b',
                color: '#cbd5e1',
                padding: '0.4rem',
                borderRadius: '4px',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
              onClick={() =>
                handleRunCommand({
                  type: 'ApplyOpsecAction',
                  logCleanup: true,
                })
              }
              data-testid="dev-btn-wipe-traces"
            >
              🧹 Wipe Session Traces
            </button>
          </div>
          <div style={{ marginTop: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Trace: <strong style={{ color: '#ef4444' }}>{state.trace?.traceMeter ?? 0}%</strong> | Legal:{' '}
            <strong style={{ color: '#f59e0b' }}>{state.trace?.legalExposureMeter ?? 0}%</strong> | Mode:{' '}
            <strong style={{ color: '#a855f7' }}>{state.trace?.isNightJobActive ? 'NIGHT' : 'DAY'}</strong>
          </div>
        </div>

        {/* Command Result Box */}
        {lastResult && (
          <div
            data-testid="dev-command-result"
            style={{
              padding: '0.6rem',
              borderRadius: '6px',
              border: `1px solid ${lastResult.success ? '#10b981' : '#ef4444'}`,
              backgroundColor: lastResult.success
                ? 'rgba(16, 185, 129, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
            }}
          >
            <div style={{ fontWeight: 600, color: lastResult.success ? '#10b981' : '#ef4444' }}>
              {lastResult.success ? '✓ Command Accepted' : '✗ Command Rejected'}
              {lastResult.isNoOp && ' (No-op)'}
            </div>
            <div style={{ marginTop: '0.2rem', color: 'var(--color-text-secondary)' }}>
              {lastResult.message}
            </div>
            {lastResult.errorCode && (
              <div style={{ marginTop: '0.2rem', fontSize: '0.75rem', color: '#f87171' }}>
                Error Code: <code>{lastResult.errorCode}</code>
              </div>
            )}
          </div>
        )}

        {/* Inventory Inspection */}
        <div>
          <h3
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.4rem',
            }}
          >
            Inventory ({state.inventory.slots.length} slots)
          </h3>
          <ul
            data-testid="dev-inventory-list"
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            {state.inventory.slots.map(slot => (
              <li
                key={slot.itemId}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.3rem 0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '4px',
                }}
              >
                <span>{slot.itemId}</span>
                <strong>x{slot.quantity}</strong>
              </li>
            ))}
          </ul>
        </div>

        {/* World Flags */}
        <div>
          <h3
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.4rem',
            }}
          >
            World Flags
          </h3>
          <div
            data-testid="dev-flags-list"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem',
            }}
          >
            {Object.entries(state.flags).map(([key, val]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.25rem 0.5rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                }}
              >
                <code style={{ color: 'var(--color-accent-amber)' }}>{key}</code>
                <span>{String(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Timers */}
        <div>
          <h3
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.4rem',
            }}
          >
            Active Timers ({state.timers.length})
          </h3>
          {state.timers.length === 0 ? (
            <div style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              No active timers
            </div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {state.timers.map(timer => (
                <li
                  key={timer.id}
                  style={{
                    padding: '0.3rem 0.5rem',
                    backgroundColor: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: '4px',
                    marginBottom: '0.25rem',
                  }}
                >
                  <div>
                    <strong>{timer.label}</strong> (id: {timer.id})
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                    Due at: {timer.dueSimulationTime}s (in{' '}
                    {Math.max(0, timer.dueSimulationTime - state.time.simulationTimeSeconds)}s)
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Events Log */}
        <div>
          <h3
            style={{
              fontSize: '0.85rem',
              color: 'var(--color-text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.4rem',
            }}
          >
            Last Emitted Events ({lastEvents.length})
          </h3>
          {lastEvents.length === 0 ? (
            <div style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
              No recent events
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              {lastEvents.map(evt => (
                <div
                  key={evt.id}
                  style={{
                    padding: '0.3rem 0.5rem',
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    borderLeft: '2px solid var(--color-accent-cyan)',
                    borderRadius: '2px',
                    fontSize: '0.75rem',
                  }}
                >
                  <div style={{ fontWeight: 600, color: 'var(--color-accent-cyan)' }}>
                    {evt.type}
                  </div>
                  <div style={{ color: 'var(--color-text-secondary)' }}>
                    Rev #{evt.revision} @ {evt.timestamp}s
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
