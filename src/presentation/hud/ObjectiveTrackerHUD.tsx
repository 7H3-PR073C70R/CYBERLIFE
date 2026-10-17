import React from 'react';

export interface ObjectiveTrackerHUDProps {
  missionTitle?: string;
  stageTitle?: string;
  isActive?: boolean;
}

export const ObjectiveTrackerHUD: React.FC<ObjectiveTrackerHUDProps> = ({
  missionTitle = 'Mission System Standby',
  stageTitle = 'Prototype Preview: The Aster Incident (Upcoming)',
  isActive = false,
}) => {
  return (
    <aside
      className="objective-panel hud-interactive"
      role="complementary"
      aria-label="Objective Tracker"
      data-testid="objective-tracker-panel"
    >
      <div className="objective-panel-header">
        <h2 className="objective-panel-title">
          <span aria-hidden="true">🎯</span>
          <span>{missionTitle}</span>
        </h2>
        <span
          className="hud-badge-prototype"
          data-testid="objective-status-badge"
          aria-label={isActive ? 'Mission active' : 'Simulation not yet active'}
        >
          {isActive ? 'Active' : 'Inactive in M1'}
        </span>
      </div>

      <div className="objective-panel-body">
        <div className="objective-stage-badge" data-testid="objective-stage-title">
          {stageTitle}
        </div>

        <p className="objective-step-desc">
          The mission state machine and authoritative gameplay engine will be introduced in
          subsequent milestones (M3 &amp; M4).
        </p>

        <div className="objective-guidance-box">
          <div className="guidance-field-label">Guided Guidance Standard</div>
          <p style={{ margin: 0, lineHeight: 1.45 }}>
            Future missions will provide structured step-by-step goals, plain-English explanations,
            and exact copy/paste commands so that anyone can play and learn cybersecurity defense.
          </p>
        </div>

        <div className="objective-status-tag">
          <span aria-hidden="true">ℹ️</span>
          <span>Simulation Engine: Headless architecture reserved</span>
        </div>
      </div>
    </aside>
  );
};
