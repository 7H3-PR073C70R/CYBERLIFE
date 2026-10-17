import React, { useState } from 'react';
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

  if (!isOpen || !sim) return null;

  const { state, dispatch, lastEvents } = sim;

  const handleRunCommand = (command: Parameters<typeof dispatch>[0]) => {
    const res = dispatch(command);
    setLastResult(res);
  };

  const formattedMoney = Money.fromKobo(state.player.moneyKobo).format();

  return (
    <div
      className="dev-sim-drawer-overlay"
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
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-sans)',
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
          onClick={onClose}
          aria-label="Close Simulation Inspector"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            fontSize: '1.2rem',
            cursor: 'pointer',
            padding: '0.2rem 0.5rem',
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
