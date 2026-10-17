import React, { useState } from 'react';

export interface ObjectiveTrackerHUDProps {
  missionTitle?: string;
  stageTitle?: string;
  isActive?: boolean;
  stepNumber?: number;
  goal?: string;
  whyItMatters?: string;
  whereToGo?: string;
  whatToDo?: string;
  onRepeatInstructions?: () => void;
}

export const ObjectiveTrackerHUD: React.FC<ObjectiveTrackerHUDProps> = ({
  missionTitle = 'Mission System Standby',
  stageTitle = 'Prototype Preview: The Aster Incident (Upcoming)',
  isActive = false,
  stepNumber = 1,
  goal = 'Approach the Cedarline workstation and press [E] to launch the virtual desktop.',
  whyItMatters = 'In incident response, accessing a secure terminal is required before inspecting logs or containing threats.',
  whereToGo = 'Cedarline Services Corporate HQ -> Marina Tower Lobby -> Workstation Desk',
  whatToDo = 'Walk to the desk, press [E], open the Terminal app, and type status.',
  onRepeatInstructions,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleRepeat = () => {
    setIsExpanded(prev => !prev);
    onRepeatInstructions?.();
  };

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

          <button
            type="button"
            className="btn-repeat-instructions"
            onClick={handleRepeat}
            aria-expanded={isExpanded}
            aria-label="Repeat or toggle 8-part guidance instructions"
            data-testid="btn-repeat-instructions"
          >
            🔄 [Repeat Instructions]
          </button>

          {isExpanded && (
            <div className="objective-expanded-guidance" data-testid="objective-expanded-guidance">
              <div className="guidance-subfield">
                <strong>Step {stepNumber} Goal:</strong> {goal}
              </div>
              <div className="guidance-subfield">
                <strong>Why It Matters:</strong> {whyItMatters}
              </div>
              <div className="guidance-subfield">
                <strong>Where To Go:</strong> {whereToGo}
              </div>
              <div className="guidance-subfield">
                <strong>What To Do:</strong> {whatToDo}
              </div>
            </div>
          )}
        </div>

        <div className="objective-status-tag">
          <span aria-hidden="true">ℹ️</span>
          <span>Simulation Engine: Headless architecture reserved</span>
        </div>
      </div>
    </aside>
  );
};
