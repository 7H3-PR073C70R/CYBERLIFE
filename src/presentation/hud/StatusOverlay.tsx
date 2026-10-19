import React from 'react';
import { CameraMode } from '../world/worldConfig';
import { SaveStatusIndicator } from './SaveStatusIndicator';

export interface StatusOverlayProps {
  version?: string;
  milestoneTitle?: string;
  currentLocationName?: string;
  cameraMode?: CameraMode;
  simulationTimeString?: string;
  playerFunds?: string;
  onToggleCamera?: () => void;
  onToggleHelp?: () => void;
  onToggleDevDrawer?: () => void;
  onToggleSaveModal?: () => void;
  onToggleTour?: () => void;
  onToggleControls?: () => void;
  isHelpOpen?: boolean;
  isDevDrawerOpen?: boolean;
  isControlsOpen?: boolean;
}

export const StatusOverlay: React.FC<StatusOverlayProps> = ({
  milestoneTitle = 'M2.5: Lagos Island',
  currentLocationName = 'Lagos Island — Broad Street & Marina',
  cameraMode = 'THIRD_PERSON',
  simulationTimeString,
  playerFunds,
  onToggleCamera,
  onToggleHelp,
  onToggleDevDrawer,
  onToggleSaveModal,
  onToggleTour,
  onToggleControls,
  isHelpOpen = false,
  isDevDrawerOpen = false,
  isControlsOpen = false,
}) => {
  return (
    <header className="hud-header" role="banner">
      <div className="hud-brand-card hud-interactive">
        <span className="hud-logo-icon" aria-hidden="true">
          🛡️
        </span>
        <h1 className="hud-brand-title">Cyberlife</h1>
        <span className="hud-badge-milestone" data-testid="hud-milestone-badge">
          {milestoneTitle}
        </span>
        <span className="hud-badge-prototype" data-testid="hud-prototype-badge">
          Playable World
        </span>
      </div>

      <div className="hud-status-group hud-interactive">
        {/* Simulation Clock (if available) */}
        {simulationTimeString && (
          <div
            className="hud-location-badge"
            data-testid="hud-clock-badge"
            role="status"
            aria-label={`In-game simulation time: ${simulationTimeString}`}
            style={{ borderColor: 'rgba(6, 182, 212, 0.4)' }}
          >
            <span aria-hidden="true">⏰</span>
            <span>{simulationTimeString}</span>
          </div>
        )}

        {/* Player Funds (if available) */}
        {playerFunds && (
          <div
            className="hud-location-badge"
            data-testid="hud-funds-badge"
            role="status"
            aria-label={`Player balance: ${playerFunds}`}
            style={{ borderColor: 'rgba(245, 158, 11, 0.4)' }}
          >
            <span aria-hidden="true">💰</span>
            <span>{playerFunds}</span>
          </div>
        )}

        {/* Current Location Badge */}
        <div
          className="hud-location-badge"
          data-testid="hud-location-badge"
          role="status"
          aria-label={`Current location: ${currentLocationName}`}
        >
          <span aria-hidden="true">📍</span>
          <span>{currentLocationName}</span>
        </div>

        {/* Persistence Save / Load Indicator & Modal Button */}
        {onToggleSaveModal && <SaveStatusIndicator onOpenSaveModal={onToggleSaveModal} />}

        {/* Camera Mode Toggle Button */}
        <button
          type="button"
          className="hud-camera-toggle-btn"
          onClick={onToggleCamera}
          aria-label={`Switch camera mode. Currently in ${cameraMode === 'THIRD_PERSON' ? 'Third Person' : 'First Person'}. Press V to switch.`}
          data-testid="hud-camera-toggle-btn"
        >
          <span aria-hidden="true">📷</span>
          <span>{cameraMode === 'THIRD_PERSON' ? '3rd Person [V]' : '1st Person [V]'}</span>
        </button>

        {/* First-Launch Introduction Tour Button */}
        {onToggleTour && (
          <button
            type="button"
            className="hud-controls-help-btn"
            onClick={onToggleTour}
            aria-label="Open first-launch orientation tour"
            data-testid="hud-tour-btn"
            style={{
              borderColor: 'rgba(56, 189, 248, 0.4)',
              color: 'var(--color-accent-cyan)',
            }}
          >
            <span aria-hidden="true">🚀</span>
            <span>Tour</span>
          </button>
        )}

        {/* Full Controls & Game Reference Modal Button */}
        {onToggleControls && (
          <button
            type="button"
            className={`hud-controls-help-btn ${isControlsOpen ? 'active' : ''}`}
            onClick={onToggleControls}
            aria-label="Toggle full controls and game reference modal"
            data-testid="hud-controls-modal-btn"
            style={{
              borderColor: 'rgba(16, 185, 129, 0.4)',
              color: 'var(--color-accent-emerald)',
            }}
          >
            <span aria-hidden="true">⌨️</span>
            <span>Help [H]</span>
          </button>
        )}

        {/* Movement Help Drawer Toggle Button */}
        <button
          type="button"
          className={`hud-controls-help-btn ${isHelpOpen ? 'active' : ''}`}
          onClick={onToggleHelp}
          aria-label="Toggle exploration controls help panel"
          data-testid="hud-controls-help-btn"
        >
          <span aria-hidden="true">🎮</span>
          <span>Movement [M]</span>
        </button>

        {/* Dev Simulation Verification Drawer Toggle */}
        {onToggleDevDrawer && (
          <button
            type="button"
            className={`hud-controls-help-btn ${isDevDrawerOpen ? 'active' : ''}`}
            onClick={onToggleDevDrawer}
            aria-label="Toggle developer simulation verification inspector"
            data-testid="hud-dev-sim-btn"
            style={{
              borderColor: 'rgba(245, 158, 11, 0.5)',
              color: 'var(--color-accent-amber)',
            }}
          >
            <span aria-hidden="true">⚙️</span>
            <span>Dev Sim</span>
          </button>
        )}

        <div
          className="hud-system-status"
          role="status"
          aria-label="Simulation and rendering status"
        >
          <span className="status-dot" aria-hidden="true" />
          <span>WebGL Active</span>
        </div>
      </div>
    </header>
  );
};
