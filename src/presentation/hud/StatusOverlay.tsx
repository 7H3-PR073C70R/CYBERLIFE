import React from 'react';

export interface StatusOverlayProps {
  version?: string;
  milestoneTitle?: string;
}

export const StatusOverlay: React.FC<StatusOverlayProps> = ({
  milestoneTitle = 'M1: Bootable Foundation',
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
          Prototype
        </span>
      </div>

      <div
        className="hud-system-status hud-interactive"
        role="status"
        aria-label="Simulation and rendering status"
      >
        <span className="status-dot" aria-hidden="true" />
        <span>WebGL Active • Standby Mode</span>
      </div>
    </header>
  );
};
