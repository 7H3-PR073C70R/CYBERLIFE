import React, { useState } from 'react';
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
  onToggleSettings?: () => void;
  isHelpOpen?: boolean;
  isDevDrawerOpen?: boolean;
  isControlsOpen?: boolean;
  isSettingsOpen?: boolean;
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
  onToggleSettings,
  isHelpOpen = false,
  isDevDrawerOpen = false,
  isControlsOpen = false,
  isSettingsOpen = false,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  return (
    <header className="hud-header" role="banner">
      {/* Brand & In-Game Title */}
      <div className="hud-brand-card hud-interactive">
        <span className="hud-logo-icon" aria-hidden="true">
          🛡️
        </span>
        <h1 className="hud-brand-title">Cyberlife</h1>

        {/* Development & Milestone status badges (visually hidden for a clean player screen) */}
        <span
          className="hud-badge-milestone hud-badge-dev-only sr-only"
          data-testid="hud-milestone-badge"
        >
          {milestoneTitle}
        </span>
        <span
          className="hud-badge-prototype hud-badge-dev-only sr-only"
          data-testid="hud-prototype-badge"
        >
          Playable World
        </span>
      </div>

      <div className="hud-status-group hud-interactive" style={{ position: 'relative' }}>
        {/* Simulation Clock */}
        {simulationTimeString && (
          <div
            className="hud-location-badge hud-stat-pill"
            data-testid="hud-clock-badge"
            role="status"
            aria-label={`In-game simulation time: ${simulationTimeString}`}
            style={{ borderColor: 'rgba(6, 182, 212, 0.4)' }}
          >
            <span aria-hidden="true">⏰</span>
            <span>{simulationTimeString}</span>
          </div>
        )}

        {/* Player Funds */}
        {playerFunds && (
          <div
            className="hud-location-badge hud-stat-pill"
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
          className="hud-location-badge hud-location-pill"
          data-testid="hud-location-badge"
          role="status"
          aria-label={`Current location: ${currentLocationName}`}
        >
          <span aria-hidden="true">📍</span>
          <span className="location-name-text">{currentLocationName}</span>
        </div>

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

        {/* Desktop Quick-Access Buttons (Hidden on smaller screens to keep clean HUD) */}
        <div className="hud-desktop-actions">
          {/* Persistence Save / Load Indicator & Modal Button */}
          {onToggleSaveModal && <SaveStatusIndicator onOpenSaveModal={onToggleSaveModal} />}

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

          {/* Workstation & Experience Settings */}
          {onToggleSettings && (
            <button
              type="button"
              className={`hud-controls-help-btn ${isSettingsOpen ? 'active' : ''}`}
              onClick={onToggleSettings}
              aria-label="Toggle camera and workstation experience settings"
              data-testid="hud-settings-btn"
              style={{
                borderColor: 'rgba(0, 229, 255, 0.4)',
                color: 'var(--color-accent-cyan)',
              }}
            >
              <span aria-hidden="true">⚙️</span>
              <span>Settings</span>
            </button>
          )}
        </div>

        {/* Compact Responsive Menu Button (Always available for small screens & clean view) */}
        <button
          type="button"
          className={`hud-controls-help-btn hud-menu-toggle-btn ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(prev => !prev)}
          aria-expanded={isMenuOpen}
          aria-label="Toggle game options menu"
          data-testid="hud-menu-toggle-btn"
          style={{
            borderColor: 'rgba(56, 189, 248, 0.4)',
            color: 'var(--color-accent-cyan)',
            fontWeight: 600,
          }}
        >
          <span aria-hidden="true">☰</span>
          <span>Menu</span>
        </button>

        {/* Clean Dropdown Menu Drawer */}
        {isMenuOpen && (
          <div
            className="hud-dropdown-drawer"
            data-testid="hud-dropdown-drawer"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '260px',
              backgroundColor: 'rgba(15, 23, 42, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '8px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.8), 0 0 15px rgba(56, 189, 248, 0.2)',
              padding: '0.65rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.45rem',
              zIndex: 100,
            }}
          >
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#38bdf8',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                padding: '0.2rem 0.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Quick Actions</span>
              <button
                type="button"
                onClick={() => setIsMenuOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                ✕
              </button>
            </div>

            {onToggleSaveModal && (
              <button
                type="button"
                className="hud-drawer-item-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleSaveModal();
                }}
              >
                <span>💾</span>
                <span>Save / Load Game</span>
              </button>
            )}

            {onToggleTour && (
              <button
                type="button"
                className="hud-drawer-item-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleTour();
                }}
              >
                <span>🚀</span>
                <span>Orientation Tour</span>
              </button>
            )}

            {onToggleControls && (
              <button
                type="button"
                className="hud-drawer-item-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleControls();
                }}
              >
                <span>⌨️</span>
                <span>Game Controls [H]</span>
              </button>
            )}

            <button
              type="button"
              className="hud-drawer-item-btn"
              onClick={() => {
                setIsMenuOpen(false);
                onToggleHelp?.();
              }}
            >
              <span>🎮</span>
              <span>Movement Controls [M]</span>
            </button>

            {onToggleSettings && (
              <button
                type="button"
                className="hud-drawer-item-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleSettings();
                }}
              >
                <span>⚙️</span>
                <span>Experience Settings</span>
              </button>
            )}

            {onToggleDevDrawer && (
              <button
                type="button"
                className={`hud-drawer-item-btn ${isDevDrawerOpen ? 'active' : ''}`}
                data-testid="hud-dev-sim-btn"
                onClick={() => {
                  setIsMenuOpen(false);
                  onToggleDevDrawer();
                }}
                style={{ color: 'var(--color-accent-amber)' }}
              >
                <span>🛠️</span>
                <span>Dev Simulation Drawer</span>
              </button>
            )}
          </div>
        )}

        {/* Technical WebGL Status (Accessible for tests/readers, hidden visually from player view) */}
        <div
          className="hud-system-status hud-badge-dev-only sr-only"
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
