import React, { useState } from 'react';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';

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
  const sim = useOptionalSimulation();
  const mission = sim?.state.mission;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleRepeat = () => {
    setIsExpanded(prev => !prev);
    onRepeatInstructions?.();
  };

  // If live mission state is present from simulation context, use authoritative progress
  const hasLiveMission = Boolean(mission);
  const activeMissionTitle = hasLiveMission ? mission!.title : missionTitle;
  const activePhase = hasLiveMission
    ? `PHASE: ${mission!.phase.toUpperCase().replace('_', ' ')}`
    : stageTitle;

  const currentObjective = hasLiveMission
    ? (mission!.objectives.find(o => !o.isCompleted) ??
      mission!.objectives[mission!.objectives.length - 1])
    : null;

  const completedCount = hasLiveMission ? mission!.objectives.filter(o => o.isCompleted).length : 0;
  const totalCount = hasLiveMission ? mission!.objectives.length : 1;

  const displayGoal = currentObjective ? currentObjective.title : goal;
  const displayDesc = currentObjective ? currentObjective.description : whyItMatters;
  const displayHint = currentObjective?.hint ?? whatToDo;

  const statusBadgeText = hasLiveMission
    ? mission!.isCompleted
      ? 'Completed'
      : `${completedCount}/${totalCount} Done`
    : isActive
      ? 'Active'
      : 'Inactive in M1';

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
          <span>{activeMissionTitle}</span>
        </h2>
        <span
          className="hud-badge-prototype"
          data-testid="objective-status-badge"
          aria-label={
            hasLiveMission
              ? mission!.isCompleted
                ? 'Mission completed'
                : 'Mission active'
              : isActive
                ? 'Mission active'
                : 'Simulation not yet active'
          }
          style={
            mission?.isCompleted
              ? {
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--color-accent-emerald)',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                }
              : undefined
          }
        >
          {statusBadgeText}
        </span>
      </div>

      <div className="objective-panel-body">
        <div className="objective-stage-badge" data-testid="objective-stage-title">
          {activePhase}
        </div>

        {hasLiveMission ? (
          <>
            <p
              className="objective-step-desc"
              style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}
            >
              {displayGoal}
            </p>
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.45,
                margin: '0 0 0.5rem',
              }}
            >
              {displayDesc}
            </p>
          </>
        ) : (
          <p className="objective-step-desc">
            The mission state machine and authoritative gameplay engine will be introduced in
            subsequent milestones (M3 &amp; M4).
          </p>
        )}

        <div className="objective-guidance-box">
          <div className="guidance-field-label">
            {hasLiveMission ? '💡 Analyst Guidance' : 'Guided Guidance Standard'}
          </div>
          <p style={{ margin: 0, lineHeight: 1.45, fontSize: '0.8rem' }}>
            {hasLiveMission
              ? displayHint
              : 'Future missions will provide structured step-by-step goals, plain-English explanations, and exact copy/paste commands so that anyone can play and learn cybersecurity defense.'}
          </p>

          <button
            type="button"
            className="btn-repeat-instructions"
            onClick={handleRepeat}
            aria-expanded={isExpanded}
            aria-label={
              hasLiveMission ? 'Toggle mission checklist' : 'Repeat or toggle instructions'
            }
            data-testid="btn-repeat-instructions"
          >
            {hasLiveMission
              ? `📋 ${isExpanded ? 'Hide Mission Checklist' : 'Show Mission Checklist'}`
              : '🔄 [Repeat Instructions]'}
          </button>

          {isExpanded && hasLiveMission && (
            <div
              className="objective-expanded-guidance"
              data-testid="objective-expanded-guidance"
              style={{ marginTop: '0.5rem' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {mission!.objectives.map((obj, i) => (
                  <div
                    key={obj.id}
                    style={{
                      fontSize: '0.74rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      color: obj.isCompleted
                        ? 'var(--color-accent-emerald)'
                        : 'var(--color-accent-cyan)',
                    }}
                  >
                    <span>{obj.isCompleted ? '✓' : '○'}</span>
                    <span>
                      {i + 1}. {obj.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isExpanded && !hasLiveMission && (
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
          <span>
            {hasLiveMission
              ? 'Cedarline SOC // Authoritative Simulation'
              : 'Simulation Engine: Headless architecture reserved'}
          </span>
        </div>
      </div>
    </aside>
  );
};
