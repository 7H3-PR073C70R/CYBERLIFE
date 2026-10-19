/**
 * Cyberlife — Milestone 9: In-Game Save & Recovery Manager Modal
 *
 * Full-featured save management interface accessible from the HUD or Virtual Desktop.
 * Provides slot inspection, manual saving, loading, slot deletion, shadow backup restoration,
 * and guarded new game creation.
 */

import React, { useState } from 'react';
import { useOptionalPersistence } from '../../application/persistence/usePersistence';
import { Money } from '../../domain/common/Money';

export interface SaveManagerModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export const SaveManagerModal: React.FC<SaveManagerModalProps> = ({ isOpen, onClose }) => {
  const persistence = useOptionalPersistence();

  const [confirmingNewGame, setConfirmingNewGame] = useState<boolean>(false);
  const [confirmingDeleteSlot, setConfirmingDeleteSlot] = useState<string | null>(null);
  const [confirmingOverwriteSlot, setConfirmingOverwriteSlot] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  if (!isOpen || !persistence) return null;

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

  const handleQuickSave = async () => {
    setActionFeedback('Saving progress...');
    const res = await saveGame(activeSlotId);
    if (res.success) {
      setActionFeedback(`Game successfully saved to ${activeSlotId.toUpperCase()}!`);
    } else {
      setActionFeedback(`Save failed: ${res.error}`);
    }
  };

  const handleSaveToSlot = async (slotId: string) => {
    setActionFeedback(`Saving to ${slotId.toUpperCase()}...`);
    const res = await saveGame(slotId);
    setConfirmingOverwriteSlot(null);
    if (res.success) {
      setActionFeedback(`Saved to ${slotId.toUpperCase()}!`);
    } else {
      setActionFeedback(`Save failed: ${res.error}`);
    }
  };

  const handleLoadSlot = async (slotId: string) => {
    setActionFeedback(`Loading ${slotId.toUpperCase()}...`);
    const res = await loadGame(slotId);
    if (res.success) {
      setActionFeedback(`Loaded ${slotId.toUpperCase()} successfully!`);
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      setActionFeedback(`Load error: ${res.error}`);
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    await deleteSlot(slotId);
    setConfirmingDeleteSlot(null);
    setActionFeedback(`Deleted save data for ${slotId.toUpperCase()}`);
  };

  const handleRestoreBackup = async (slotId: string) => {
    setActionFeedback(`Restoring backup for ${slotId.toUpperCase()}...`);
    const res = await restoreFromBackup(slotId);
    if (res.success) {
      setActionFeedback(`Restored ${slotId.toUpperCase()} from backup!`);
      setTimeout(() => {
        onClose();
      }, 600);
    } else {
      setActionFeedback(`Backup restore error: ${res.error}`);
    }
  };

  const handleConfirmNewGame = () => {
    resetToNewGame();
    setConfirmingNewGame(false);
    setActionFeedback('Started new game session');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div
      className="save-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="save-manager-modal-title"
      data-testid="save-manager-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 10, 20, 0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: 'var(--font-sans)',
        color: 'var(--color-text-primary)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="save-modal-container"
        style={{
          width: 'min(720px, 95vw)',
          maxHeight: '90vh',
          backgroundColor: '#0f172a',
          border: '1px solid #1e293b',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid #1e293b',
            backgroundColor: '#1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }} aria-hidden="true">
              💾
            </span>
            <div>
              <h2
                id="save-manager-modal-title"
                style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: '#38bdf8' }}
              >
                Data Persistence & Recovery Manager
              </h2>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Encrypted local IndexedDB storage with shadow crash recovery
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Save Manager"
            data-testid="btn-close-save-modal"
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.4rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Global Status Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1.5rem',
            backgroundColor: '#090d16',
            borderBottom: '1px solid #1e293b',
            fontSize: '0.85rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span>
              Status:{' '}
              <strong
                data-testid="save-modal-global-status"
                style={{
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
                {status === 'SAVED'
                  ? '✓ Saved'
                  : status === 'SAVING'
                    ? '⏳ Saving...'
                    : status === 'ERROR'
                      ? '⚠ Save Error'
                      : 'Idle'}
              </strong>
            </span>
            {lastSavedTime && (
              <span style={{ color: '#64748b' }}>
                Last saved: {lastSavedTime.toLocaleTimeString()}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleQuickSave}
            data-testid="btn-save-modal-quicksave"
            style={{
              padding: '0.4rem 0.9rem',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
            }}
          >
            <span>💾</span> Quick Save Active
          </button>
        </div>

        {/* Action Feedback Banner */}
        {actionFeedback && (
          <div
            data-testid="save-modal-feedback-banner"
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              borderBottom: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {actionFeedback}
          </div>
        )}

        {/* Error Banner */}
        {lastError && (
          <div
            data-testid="save-modal-error-banner"
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.85rem',
            }}
          >
            <strong>Storage Error:</strong> {lastError}
          </div>
        )}

        {/* Slot List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}
        >
          {slots.map(slot => {
            const meta = slot.metadata;
            const isCurrentActive = slot.slotId === activeSlotId;

            return (
              <div
                key={slot.slotId}
                data-testid={`save-slot-card-${slot.slotId}`}
                style={{
                  backgroundColor: '#131e33',
                  border: `1px solid ${isCurrentActive ? '#0284c7' : '#1e293b'}`,
                  borderRadius: '8px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                {/* Slot Top Header */}
                <div
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc' }}>
                      {slot.slotId === 'slot_1'
                        ? 'SLOT 1 (Primary & Autosave)'
                        : slot.slotId === 'slot_2'
                          ? 'SLOT 2 (Manual Backup)'
                          : 'SLOT 3 (Manual Backup)'}
                    </span>
                    {isCurrentActive && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          backgroundColor: 'rgba(2, 132, 199, 0.25)',
                          color: '#38bdf8',
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          border: '1px solid rgba(56, 189, 248, 0.4)',
                        }}
                      >
                        Active Slot
                      </span>
                    )}
                  </div>

                  <div>
                    {slot.status === 'VALID' ? (
                      <span
                        data-testid={`slot-status-badge-${slot.slotId}`}
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: 'rgba(16, 185, 129, 0.2)',
                          color: '#10b981',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        ● Valid Save (v{meta?.schemaVersion})
                      </span>
                    ) : slot.status === 'CORRUPT' ? (
                      <span
                        data-testid={`slot-status-badge-${slot.slotId}`}
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: 'rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        ⚠ Corrupt File
                      </span>
                    ) : (
                      <span
                        data-testid={`slot-status-badge-${slot.slotId}`}
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: 'rgba(148, 163, 184, 0.2)',
                          color: '#94a3b8',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                        }}
                      >
                        Empty Slot
                      </span>
                    )}
                  </div>
                </div>

                {/* Slot Details (if valid) */}
                {slot.status === 'VALID' && meta ? (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '0.5rem 1rem',
                      fontSize: '0.85rem',
                      backgroundColor: 'rgba(15, 23, 42, 0.6)',
                      padding: '0.75rem',
                      borderRadius: '6px',
                    }}
                  >
                    <div>
                      <span style={{ color: '#64748b' }}>Role: </span>
                      <strong style={{ color: '#f1f5f9' }}>{meta.playerRole}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Career Level: </span>
                      <strong style={{ color: '#f1f5f9' }}>Level {meta.careerLevel}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Funds: </span>
                      <strong style={{ color: '#f59e0b' }}>
                        {Money.fromKobo(meta.moneyKobo).format()}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Completed Work: </span>
                      <strong style={{ color: '#f1f5f9' }}>
                        {meta.completedJobsCount} Tickets
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Sim Date: </span>
                      <span style={{ color: '#cbd5e1' }}>{meta.simulationDateString}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748b' }}>Incident Phase: </span>
                      <strong style={{ color: '#38bdf8', textTransform: 'capitalize' }}>
                        {meta.asterIncidentPhase.replace('_', ' ')}
                      </strong>
                    </div>
                    <div style={{ gridColumn: '1 / -1', fontSize: '0.78rem', color: '#64748b' }}>
                      Saved at: {new Date(meta.updatedAtIso).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    No game data saved in this slot.
                  </div>
                )}

                {/* Actions Row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.25rem',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {slot.status === 'VALID' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleLoadSlot(slot.slotId)}
                          data-testid={`btn-load-slot-${slot.slotId}`}
                          style={{
                            padding: '0.35rem 0.8rem',
                            backgroundColor: '#0284c7',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Load Game
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmingOverwriteSlot(slot.slotId)}
                          data-testid={`btn-overwrite-slot-${slot.slotId}`}
                          style={{
                            padding: '0.35rem 0.8rem',
                            backgroundColor: '#1e293b',
                            color: '#e2e8f0',
                            border: '1px solid #334155',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                          }}
                        >
                          Overwrite
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSaveToSlot(slot.slotId)}
                        data-testid={`btn-save-slot-${slot.slotId}`}
                        style={{
                          padding: '0.35rem 0.8rem',
                          backgroundColor: '#0284c7',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        Save Current Game Here
                      </button>
                    )}

                    {slot.hasBackup && (
                      <button
                        type="button"
                        onClick={() => handleRestoreBackup(slot.slotId)}
                        data-testid={`btn-restore-backup-${slot.slotId}`}
                        style={{
                          padding: '0.35rem 0.8rem',
                          backgroundColor: 'rgba(245, 158, 11, 0.15)',
                          color: '#f59e0b',
                          border: '1px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                        }}
                      >
                        Restore Shadow Backup
                      </button>
                    )}
                  </div>

                  {slot.status === 'VALID' && (
                    <button
                      type="button"
                      onClick={() => setConfirmingDeleteSlot(slot.slotId)}
                      data-testid={`btn-delete-slot-${slot.slotId}`}
                      style={{
                        padding: '0.35rem 0.75rem',
                        backgroundColor: 'transparent',
                        color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
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

        {/* Footer / Danger Zone */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid #1e293b',
            backgroundColor: '#0b1120',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Autosaves trigger automatically after mission, job, and career milestones.
          </div>

          <button
            type="button"
            onClick={() => setConfirmingNewGame(true)}
            data-testid="btn-modal-new-game"
            style={{
              padding: '0.45rem 1rem',
              backgroundColor: 'transparent',
              color: '#f87171',
              border: '1px solid #f87171',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Start New Game...
          </button>
        </div>
      </div>

      {/* Confirmation Modal: Start New Game */}
      {confirmingNewGame && (
        <div
          className="confirm-dialog-backdrop"
          role="alertdialog"
          aria-labelledby="confirm-new-game-title"
          data-testid="confirm-new-game-modal"
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
              maxWidth: '440px',
              backgroundColor: '#1e293b',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '1.5rem',
              boxShadow: '0 20px 30px rgba(0,0,0,0.8)',
            }}
          >
            <h3 id="confirm-new-game-title" style={{ color: '#ef4444', margin: '0 0 0.75rem 0' }}>
              ⚠ Start New Game?
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Are you sure you want to start a new game? Your current session state will be reset to
              the initial playthrough. Any saved slots will remain untouched unless you overwrite
              them.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.25rem',
              }}
            >
              <button
                type="button"
                onClick={() => setConfirmingNewGame(false)}
                data-testid="btn-cancel-new-game"
                style={{
                  padding: '0.4rem 0.9rem',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmNewGame}
                data-testid="btn-confirm-new-game"
                style={{
                  padding: '0.4rem 0.9rem',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Confirm New Game
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Overwrite Slot */}
      {confirmingOverwriteSlot && (
        <div
          className="confirm-dialog-backdrop"
          role="alertdialog"
          aria-labelledby="confirm-overwrite-title"
          data-testid="confirm-overwrite-modal"
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
              maxWidth: '440px',
              backgroundColor: '#1e293b',
              border: '1px solid #f59e0b',
              borderRadius: '8px',
              padding: '1.5rem',
            }}
          >
            <h3 id="confirm-overwrite-title" style={{ color: '#f59e0b', margin: '0 0 0.75rem 0' }}>
              ⚠ Overwrite {confirmingOverwriteSlot.toUpperCase()}?
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              This will overwrite existing save progress in {confirmingOverwriteSlot.toUpperCase()}.
              A shadow backup copy will be kept in case you need to recover it later.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.25rem',
              }}
            >
              <button
                type="button"
                onClick={() => setConfirmingOverwriteSlot(null)}
                data-testid="btn-cancel-overwrite"
                style={{
                  padding: '0.4rem 0.9rem',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveToSlot(confirmingOverwriteSlot)}
                data-testid="btn-confirm-overwrite"
                style={{
                  padding: '0.4rem 0.9rem',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Overwrite Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Slot */}
      {confirmingDeleteSlot && (
        <div
          className="confirm-dialog-backdrop"
          role="alertdialog"
          aria-labelledby="confirm-delete-title"
          data-testid="confirm-delete-modal"
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
              maxWidth: '440px',
              backgroundColor: '#1e293b',
              border: '1px solid #ef4444',
              borderRadius: '8px',
              padding: '1.5rem',
            }}
          >
            <h3 id="confirm-delete-title" style={{ color: '#ef4444', margin: '0 0 0.75rem 0' }}>
              ⚠ Delete {confirmingDeleteSlot.toUpperCase()}?
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Are you sure you want to delete all saved data for{' '}
              {confirmingDeleteSlot.toUpperCase()}? This action cannot be undone.
            </p>
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '0.75rem',
                marginTop: '1.25rem',
              }}
            >
              <button
                type="button"
                onClick={() => setConfirmingDeleteSlot(null)}
                data-testid="btn-cancel-delete"
                style={{
                  padding: '0.4rem 0.9rem',
                  backgroundColor: '#334155',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSlot(confirmingDeleteSlot)}
                data-testid="btn-confirm-delete"
                style={{
                  padding: '0.4rem 0.9rem',
                  backgroundColor: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Delete Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
