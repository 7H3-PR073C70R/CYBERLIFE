import React from 'react';
import { CameraMode } from '../world/worldConfig';

export interface StatusOverlayProps {
  version?: string;
  milestoneTitle?: string;
  currentLocationName?: string;
  cameraMode?: CameraMode;
  onToggleCamera?: () => void;
  onToggleHelp?: () => void;
  isHelpOpen?: boolean;
}

export const StatusOverlay: React.FC<StatusOverlayProps> = ({
  milestoneTitle = 'M2.5: Lagos Island',
  currentLocationName = 'Lagos Island — Broad Street & Marina',
  cameraMode = 'THIRD_PERSON',
  onToggleCamera,
  onToggleHelp,
  isHelpOpen = false,
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

        {/* Controls Help Toggle Button */}
        <button
          type="button"
          className={`hud-controls-help-btn ${isHelpOpen ? 'active' : ''}`}
          onClick={onToggleHelp}
          aria-label="Toggle exploration controls help panel"
          data-testid="hud-controls-help-btn"
        >
          <span aria-hidden="true">🎮</span>
          <span>Controls [WASD]</span>
        </button>

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
