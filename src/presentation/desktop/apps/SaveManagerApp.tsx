/**
 * Cyberlife — Milestone 9: Virtual Workstation Save Manager App (Heron OS Style)
 *
 * Provides a dedicated desktop application for managing persistent save slots,
 * auditing checksum integrity, restoring shadow backups, and reviewing save data.
 */

import React, { useState } from 'react';
import { useOptionalPersistence } from '../../../application/persistence/usePersistence';
import { useOptionalSimulation } from '../../../application/simulation/SimulationContext';
import { Money } from '../../../domain/common/Money';
import { calculateStateChecksum } from '../../../application/persistence/checksum';

export const SaveManagerApp: React.FC = () => {
  const persistence = useOptionalPersistence();
  const sim = useOptionalSimulation();

  const [activeTab, setActiveTab] = useState<'slots' | 'audit' | 'raw'>('slots');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmNewGame, setConfirmNewGame] = useState<boolean>(false);
  const [confirmDeleteSlot, setConfirmDeleteSlot] = useState<string | null>(null);

  if (!persistence) {
    return (
      <div style={{ padding: '2rem', color: '#ef4444' }}>Persistence system is not available.</div>
    );
  }

  const {
    slots,
    activeSlotId,
    status,
    lastSavedTime,
    lastError,
    saveGame,
    loadGame,
    restoreFromBackup,
    deleteSlot,
    resetToNewGame,
  } = persistence;

  const currentChecksum = sim ? calculateStateChecksum(sim.state) : 'N/A';

  const handleSave = async (slotId: string) => {
    setFeedback(`Writing atomic save to ${slotId.toUpperCase()}...`);
    const res = await saveGame(slotId);
    if (res.success) {
      setFeedback(`Successfully saved to ${slotId.toUpperCase()}!`);
    } else {
      setFeedback(`Save error: ${res.error}`);
    }
  };

  const handleLoad = async (slotId: string) => {
    setFeedback(`Restoring session from ${slotId.toUpperCase()}...`);
    const res = await loadGame(slotId);
    if (res.success) {
      setFeedback(`Restored state from ${slotId.toUpperCase()} successfully!`);
    } else {
      setFeedback(`Load error: ${res.error}`);
    }
  };

  const handleRestoreBackup = async (slotId: string) => {
    setFeedback(`Restoring shadow backup for ${slotId.toUpperCase()}...`);
    const res = await restoreFromBackup(slotId);
    if (res.success) {
      setFeedback(`Shadow backup restored for ${slotId.toUpperCase()}!`);
    } else {
      setFeedback(`Backup restore error: ${res.error}`);
    }
  };

  const handleDelete = async (slotId: string) => {
    await deleteSlot(slotId);
    setConfirmDeleteSlot(null);
    setFeedback(`Deleted data for ${slotId.toUpperCase()}`);
  };

  const handleConfirmNewGame = () => {
    resetToNewGame();
    setConfirmNewGame(false);
    setFeedback('Started clean initial playthrough');
  };

  return (
    <div
      className="save-manager-app-container"
      data-testid="save-manager-app"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#0a0f1d',
        color: '#e2e8f0',
        fontFamily: 'var(--font-sans)',
        fontSize: '0.9rem',
      }}
    >
      {/* Top App Bar & Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1.25rem',
          backgroundColor: '#0f172a',
          borderBottom: '1px solid #1e293b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.2rem' }} aria-hidden="true">
            💾
          </span>
          <span style={{ fontWeight: 600, color: '#38bdf8' }}>Persistence Vault</span>
          <span
            data-testid="app-save-status-badge"
            style={{
              fontSize: '0.75rem',
              padding: '0.15rem 0.5rem',
              borderRadius: '4px',
              backgroundColor:
                status === 'SAVED'
                  ? 'rgba(16, 185, 129, 0.2)'
                  : status === 'SAVING'
                    ? 'rgba(56, 189, 248, 0.2)'
                    : status === 'ERROR'
                      ? 'rgba(239, 68, 68, 0.2)'
                      : 'rgba(148, 163, 184, 0.2)',
              color:
                status === 'SAVED'
                  ? '#10b981'
                  : status === 'SAVING'
                    ? '#38bdf8'
                    : status === 'ERROR'
                      ? '#ef4444'
                      : '#94a3b8',
            }}
          >
            {status}
          </span>
          {lastSavedTime && (
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
              ({lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
            </span>
          )}
        </div>

        {/* Tab Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('slots')}
            data-testid="tab-save-slots"
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'slots' ? '#0284c7' : '#1e293b',
              color: '#ffffff',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Save Slots
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            data-testid="tab-save-audit"
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'audit' ? '#0284c7' : '#1e293b',
              color: '#ffffff',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            Integrity Audit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('raw')}
            data-testid="tab-save-raw"
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: '4px',
              border: 'none',
              backgroundColor: activeTab === 'raw' ? '#0284c7' : '#1e293b',
              color: '#ffffff',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
          >
            State Snapshot
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          data-testid="app-save-feedback"
          style={{
            padding: '0.5rem 1.25rem',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            borderBottom: '1px solid rgba(56, 189, 248, 0.3)',
            color: '#38bdf8',
            fontSize: '0.85rem',
          }}
        >
          {feedback}
        </div>
      )}

      {/* Error Banner */}
      {lastError && (
        <div
          data-testid="app-save-error"
          style={{
            padding: '0.5rem 1.25rem',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: '0.85rem',
          }}
        >
          <strong>Error:</strong> {lastError}
        </div>
      )}

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
        {activeTab === 'slots' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid #1e293b',
              }}
            >
              <div>
                <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>
                  Managed Save Slots (IndexedDB)
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Active Slot: {activeSlotId.toUpperCase()} • Checksum:{' '}
                  <code>{currentChecksum}</code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSave(activeSlotId)}
                data-testid="btn-app-quicksave"
                style={{
                  padding: '0.4rem 0.9rem',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                💾 Quick Save Active
              </button>
            </div>

            {slots.map(slot => {
              const meta = slot.metadata;
              const isCurrent = slot.slotId === activeSlotId;

              return (
                <div
                  key={slot.slotId}
                  data-testid={`app-slot-row-${slot.slotId}`}
                  style={{
                    backgroundColor: '#111827',
                    border: `1px solid ${isCurrent ? '#0284c7' : '#1f2937'}`,
                    borderRadius: '8px',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ color: '#f8fafc' }}>{slot.slotId.toUpperCase()}</strong>
                      {isCurrent && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            padding: '0.1rem 0.4rem',
                            backgroundColor: 'rgba(2, 132, 199, 0.25)',
                            color: '#38bdf8',
                            borderRadius: '3px',
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>

                    <span
                      data-testid={`app-slot-badge-${slot.slotId}`}
                      style={{
                        fontSize: '0.75rem',
                        color:
                          slot.status === 'VALID'
                            ? '#10b981'
                            : slot.status === 'CORRUPT'
                              ? '#ef4444'
                              : '#94a3b8',
                      }}
                    >
                      ● {slot.status}
                    </span>
                  </div>

                  {slot.status === 'VALID' && meta ? (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                        gap: '0.5rem',
                        fontSize: '0.85rem',
                        backgroundColor: '#0f172a',
                        padding: '0.75rem',
                        borderRadius: '6px',
                      }}
                    >
                      <div>
                        <span style={{ color: '#64748b' }}>Role: </span>
                        <span>{meta.playerRole}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Level: </span>
                        <span>Level {meta.careerLevel}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Money: </span>
                        <span style={{ color: '#f59e0b' }}>
                          {Money.fromKobo(meta.moneyKobo).format()}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Tickets: </span>
                        <span>{meta.completedJobsCount}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Phase: </span>
                        <span>{meta.asterIncidentPhase}</span>
                      </div>
                      <div>
                        <span style={{ color: '#64748b' }}>Saved: </span>
                        <span>{new Date(meta.updatedAtIso).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: '#64748b', fontStyle: 'italic', fontSize: '0.85rem' }}>
                      No data recorded in this slot.
                    </div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        onClick={() => handleSave(slot.slotId)}
                        data-testid={`btn-app-save-${slot.slotId}`}
                        style={{
                          padding: '0.3rem 0.75rem',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        Save
                      </button>

                      {slot.status === 'VALID' && (
                        <button
                          type="button"
                          onClick={() => handleLoad(slot.slotId)}
                          data-testid={`btn-app-load-${slot.slotId}`}
                          style={{
                            padding: '0.3rem 0.75rem',
                            backgroundColor: '#1e293b',
                            color: '#ffffff',
                            border: '1px solid #334155',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          Load
                        </button>
                      )}

                      {slot.hasBackup && (
                        <button
                          type="button"
                          onClick={() => handleRestoreBackup(slot.slotId)}
                          data-testid={`btn-app-backup-${slot.slotId}`}
                          style={{
                            padding: '0.3rem 0.75rem',
                            backgroundColor: 'rgba(245, 158, 11, 0.2)',
                            color: '#f59e0b',
                            border: '1px solid rgba(245, 158, 11, 0.4)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem',
                          }}
                        >
                          Restore Backup
                        </button>
                      )}
                    </div>

                    {slot.status === 'VALID' && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteSlot(slot.slotId)}
                        data-testid={`btn-app-delete-${slot.slotId}`}
                        style={{
                          padding: '0.3rem 0.6rem',
                          backgroundColor: 'transparent',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'audit' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>
              Data Integrity & Checksum Verification
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', lineHeight: 1.5 }}>
              Cyberlife uses 32-bit FNV-1a checksums calculated across canonical state trees to
              prevent corruption, partial writes, and tampering.
            </p>

            <div
              style={{
                backgroundColor: '#111827',
                border: '1px solid #1f2937',
                borderRadius: '8px',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                fontSize: '0.85rem',
              }}
            >
              <div>
                <span style={{ color: '#64748b' }}>Active State Checksum: </span>
                <code
                  data-testid="audit-current-checksum"
                  style={{ color: '#10b981', fontWeight: 600 }}
                >
                  {currentChecksum}
                </code>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>State Revision: </span>
                <span>{sim?.state.metadata.revision ?? 0}</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Active Timers: </span>
                <span>{sim?.state.timers.length ?? 0} scheduled</span>
              </div>
              <div>
                <span style={{ color: '#64748b' }}>Storage Engine: </span>
                <span style={{ color: '#38bdf8' }}>Native Browser IndexedDB</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'raw' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#f8fafc', fontSize: '1rem' }}>
                Authoritative State JSON
              </h3>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Approx Size: {JSON.stringify(sim?.state ?? {}).length} bytes
              </span>
            </div>
            <textarea
              readOnly
              data-testid="raw-state-textarea"
              value={JSON.stringify(sim?.state ?? {}, null, 2)}
              rows={16}
              style={{
                width: '100%',
                backgroundColor: '#090d16',
                border: '1px solid #1e293b',
                color: '#38bdf8',
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                padding: '0.75rem',
                borderRadius: '6px',
              }}
            />
          </div>
        )}
      </div>

      {/* Confirmation Modals */}
      {confirmNewGame && (
        <div
          role="alertdialog"
          data-testid="app-confirm-new-game-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              maxWidth: '400px',
              backgroundColor: '#1e293b',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '1.25rem',
            }}
          >
            <h4 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>Start New Game?</h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Reset active session to initial playthrough.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                marginTop: '1rem',
              }}
            >
              <button
                type="button"
                onClick={() => setConfirmNewGame(false)}
                style={{
                  padding: '0.3rem 0.75rem',
                  backgroundColor: '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmNewGame}
                data-testid="btn-app-confirm-new-game"
                style={{
                  padding: '0.3rem 0.75rem',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteSlot && (
        <div
          role="alertdialog"
          data-testid="app-confirm-delete-modal"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              maxWidth: '400px',
              backgroundColor: '#1e293b',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '1.25rem',
            }}
          >
            <h4 style={{ color: '#ef4444', margin: '0 0 0.5rem 0' }}>
              Delete {confirmDeleteSlot.toUpperCase()}?
            </h4>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              This will permanently delete this save slot.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.5rem',
                marginTop: '1rem',
              }}
            >
              <button
                type="button"
                onClick={() => setConfirmDeleteSlot(null)}
                style={{
                  padding: '0.3rem 0.75rem',
                  backgroundColor: '#334155',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteSlot)}
                data-testid="btn-app-confirm-delete"
                style={{
                  padding: '0.3rem 0.75rem',
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                }}
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
