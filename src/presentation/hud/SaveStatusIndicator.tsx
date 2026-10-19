/**
 * Cyberlife — Milestone 9: HUD Save Status Indicator Component
 *
 * Displays active save state in the top status bar and opens the Save Manager modal.
 */

import React from 'react';
import { useOptionalPersistence } from '../../application/persistence/usePersistence';

export interface SaveStatusIndicatorProps {
  readonly onOpenSaveModal: () => void;
}

export const SaveStatusIndicator: React.FC<SaveStatusIndicatorProps> = ({ onOpenSaveModal }) => {
  const persistence = useOptionalPersistence();

  if (!persistence) {
    return null;
  }

  const { status, lastSavedTime } = persistence;

  const getLabel = () => {
    switch (status) {
      case 'SAVING':
        return 'Saving...';
      case 'SAVED':
        return lastSavedTime
          ? `Saved ${lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
          : 'Saved';
      case 'ERROR':
        return 'Save Error';
      case 'IDLE':
      default:
        return 'Save / Load';
    }
  };

  const getBorderColor = () => {
    switch (status) {
      case 'SAVED':
        return 'rgba(16, 185, 129, 0.4)';
      case 'SAVING':
        return 'rgba(56, 189, 248, 0.5)';
      case 'ERROR':
        return 'rgba(239, 68, 68, 0.6)';
      default:
        return 'rgba(148, 163, 184, 0.4)';
    }
  };

  const getColor = () => {
    switch (status) {
      case 'SAVED':
        return '#10b981';
      case 'SAVING':
        return '#38bdf8';
      case 'ERROR':
        return '#ef4444';
      default:
        return 'var(--color-text-primary)';
    }
  };

  return (
    <button
      type="button"
      className="hud-controls-help-btn"
      onClick={onOpenSaveModal}
      data-testid="hud-save-btn"
      aria-label={`Save and recovery manager. Current status: ${status}`}
      style={{
        borderColor: getBorderColor(),
        color: getColor(),
        display: 'flex',
        alignItems: 'center',
        gap: '0.4rem',
        cursor: 'pointer',
      }}
    >
      <span aria-hidden="true">💾</span>
      <span data-testid="hud-save-status-text">{getLabel()}</span>
    </button>
  );
};
