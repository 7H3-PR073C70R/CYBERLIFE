import React, { useState, useEffect } from 'react';
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
  forceExpanded?: boolean;
  onToggleExpanded?: (expanded: boolean) => void;
  onRepeatInstructions?: () => void;
}

export interface ObjectiveActionGuide {
  readonly whereToGo: string;
  readonly whatToDo: string;
  readonly command?: string;
  readonly tip: string;
}

export const OBJECTIVE_ACTION_GUIDES: Record<string, ObjectiveActionGuide> = {
  'obj-briefing-01': {
    whereToGo: 'Cedarline Office Floor 14 (Console) or Workstation Desk',
    whatToDo: 'Speak with Lead Analyst Blessing or open the Incident Portal app on your workstation to review Case #2026-AST-01.',
    tip: 'Press [E] to talk to Blessing, or sit at the workstation desk to use the computer.',
  },
  'obj-assess-01': {
    whereToGo: 'Workstation Desktop -> Terminal App',
    whatToDo: 'Scan the corporate network inventory to find the IP addresses for the Aster AI portal and file server.',
    command: 'netmap hosts',
    tip: 'Click "Paste in Terminal" or type the command into the terminal prompt.',
  },
  'obj-investigate-01': {
    whereToGo: 'Workstation Desktop -> Terminal App',
    whatToDo: 'Inspect the exposed services and open ports on app-portal-01 and filesrv-01.',
    command: 'svcscan inspect app-portal-01',
    tip: 'Check what services Aster AI is running and whether it is listening on internal ports.',
  },
  'obj-investigate-02': {
    whereToGo: 'Workstation Desktop -> Terminal App',
    whatToDo: 'Query security logs for unauthorized SMB queries and out-of-scope access from svc-aster.',
    command: 'logview filter --severity=WARN',
    tip: 'Look for logs with WARN severity linking svc-aster to confidential files.',
  },
  'obj-evidence-01': {
    whereToGo: 'Workstation Desktop -> Incident Portal (Tab 4) or Terminal App',
    whatToDo: 'Inspect digital forensic evidence record EVD-2026-004 to preserve the IAM configuration snapshot.',
    command: 'evidence inspect EVD-2026-004',
    tip: 'Preserving evidence protects the cryptographic chain of custody before you make configuration changes.',
  },
  'obj-containment-01': {
    whereToGo: 'Workstation Desktop -> Incident Portal (Tab 5) or Terminal App',
    whatToDo: 'Formulate root cause (over-privileged IAM role) and execute authorized containment to isolate Aster.',
    command: 'aster-admin contain',
    tip: 'Containment severs network routes to filesrv-01 while keeping the service running in safe mode.',
  },
  'obj-remediation-01': {
    whereToGo: 'Workstation Desktop -> Incident Portal (Tab 5) or Terminal App',
    whatToDo: 'Reconfigure Aster permissions to the least-privilege role: kb-assistant (docs:read, kb:search).',
    command: 'aster-admin remediate --role=kb-assistant',
    tip: 'This removes wildcard admin privileges and strips unauthorized file server access.',
  },
  'obj-verification-01': {
    whereToGo: 'Workstation Desktop -> Incident Portal (Tab 5) or Terminal App',
    whatToDo: 'Run the automated verification suite to prove unauthorized queries fail while valid KB queries succeed.',
    command: 'aster-admin verify',
    tip: 'The verification suite tests both positive query functionality and negative security isolation.',
  },
  'obj-reporting-01': {
    whereToGo: 'Workstation Desktop -> Incident Portal (Tab 6)',
    whatToDo: 'Review the completed incident response sections and click "Submit Incident Report" for executive approval.',
    tip: 'Executive sign-off awards your incident response stipend and marks the case resolved.',
  },
};

export const POST_INCIDENT_DIRECTIVES = [
  {
    icon: '🏢',
    location: 'Cedarline SOC Floor 14',
    contact: 'Lead Analyst Blessing',
    action: 'Speak with Blessing for closing remarks, performance debrief, and career mentorship.',
  },
  {
    icon: '🌊',
    location: 'Marina Seawall Promenade',
    contact: "Tsharp 'ZeroDay' Bakare",
    action: 'Meet independent researcher Tsharp for bug bounty collaborations and threat intelligence.',
  },
  {
    icon: '🛒',
    location: 'Balogun Market Electronics Stall',
    contact: 'Mama Esther',
    action: 'Visit Mama Esther to source hardware adapters, burner devices, and street telemetry.',
  },
  {
    icon: '☕',
    location: 'Broad Street Sidewalk Café',
    contact: 'Anjola',
    action: 'Meet tech talent scout Anjola to review high-paying fintech contracts and salary benchmarks.',
  },
  {
    icon: '💼',
    location: 'Workstation Applications Menu',
    contact: 'Career & Market App',
    action: 'Launch Career & Market on your desktop to accept junior analyst tickets and triage assignments.',
  },
  {
    icon: '🛏️',
    location: 'Player Apartment Bed',
    contact: 'Rest & Recharge',
    action: 'If your energy is low, return to your apartment bed to sleep and prepare for future operations.',
  },
];

export const ObjectiveTrackerHUD: React.FC<ObjectiveTrackerHUDProps> = ({
  missionTitle = 'Mission System Standby',
  stageTitle = 'Prototype Preview: The Aster Incident (Upcoming)',
  isActive = false,
  stepNumber = 1,
  goal = 'Approach the Cedarline workstation and press [E] to launch the virtual desktop.',
  whyItMatters = 'In incident response, accessing a secure terminal is required before inspecting logs or containing threats.',
  whereToGo = 'Cedarline Services Corporate HQ -> Marina Tower Lobby -> Workstation Desk',
  whatToDo = 'Walk to the desk, press [E], open the Terminal app, and type status.',
  forceExpanded,
  onToggleExpanded,
  onRepeatInstructions,
}) => {
  const sim = useOptionalSimulation();
  const mission = sim?.state.mission;

  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isPanelCollapsed, setIsPanelCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });

  useEffect(() => {
    if (forceExpanded !== undefined) {
      setIsPanelCollapsed(!forceExpanded);
      if (forceExpanded) {
        setIsExpanded(true);
      }
    }
  }, [forceExpanded]);

  const handleRepeat = () => {
    setIsExpanded(prev => !prev);
    onRepeatInstructions?.();
  };

  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);

  const handleCopyCmd = (cmd: string) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(cmd);
      }
    } catch {
      // Ignore clipboard write restrictions
    }
    setCopiedCommand(cmd);
    setTimeout(() => setCopiedCommand(null), 2500);
  };

  const handlePasteCmd = (cmd: string) => {
    handleCopyCmd(cmd);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cyberlife:desktop:open-app', { detail: { appId: 'terminal' } })
      );
      window.dispatchEvent(
        new CustomEvent('cyberlife:terminal:paste', { detail: { command: cmd } })
      );
    }
  };

  // If live mission state is present from simulation context, use authoritative progress
  const hasLiveMission = Boolean(mission);
  const isMissionComplete = Boolean(hasLiveMission && (mission!.isCompleted || sim?.state.flags?.mission_aster_completed));

  const totalCount = hasLiveMission ? mission!.objectives.length : 1;
  const rawCompletedCount = hasLiveMission ? mission!.objectives.filter(o => o.isCompleted).length : 0;
  const completedCount = isMissionComplete ? totalCount : rawCompletedCount;

  // Find the active objective sequentially
  const currentObjectiveIndex = hasLiveMission
    ? mission!.objectives.findIndex(o => !o.isCompleted)
    : -1;
  const currentObjective = hasLiveMission
    ? currentObjectiveIndex >= 0
      ? mission!.objectives[currentObjectiveIndex]
      : mission!.objectives[mission!.objectives.length - 1]
    : null;

  // Correct step number: 1-indexed position of active objective, or totalCount when complete
  const currentStepNumber = isMissionComplete
    ? totalCount
    : currentObjectiveIndex >= 0
      ? currentObjectiveIndex + 1
      : totalCount;

  const activeMissionTitle = isMissionComplete
    ? 'The Aster Incident // Case #2026-AST-01 (Closed)'
    : hasLiveMission
      ? mission!.title
      : missionTitle;

  const activePhase = isMissionComplete
    ? 'PHASE: INCIDENT RESOLVED // EXECUTIVE SIGN-OFF APPROVED'
    : hasLiveMission
      ? `PHASE: ${mission!.phase.toUpperCase().replace('_', ' ')}`
      : stageTitle;

  const currentGuide = currentObjective ? OBJECTIVE_ACTION_GUIDES[currentObjective.id] : undefined;

  const displayGoal = isMissionComplete
    ? 'Next Play: Expand Career & Explore Lagos Island'
    : currentObjective
      ? currentObjective.title
      : goal;

  const displayDesc = isMissionComplete
    ? 'The Aster Incident has been completely contained, remediated, verified, and reported! Your corporate stipend has been credited. You can now explore Lagos Island, tackle independent bug bounties, or take on active SOC triage jobs.'
    : currentObjective
      ? currentObjective.description
      : whyItMatters;

  const displayHint = currentObjective?.hint ?? whatToDo;

  const statusBadgeText = hasLiveMission
    ? isMissionComplete
      ? '✓ 9/9 Completed'
      : `${completedCount}/${totalCount} Done`
    : isActive
      ? 'Active'
      : 'Inactive in M1';

  return (
    <aside
      className={`objective-panel hud-interactive ${isPanelCollapsed ? 'objective-panel-collapsed' : ''}`}
      role="complementary"
      aria-label="Objective Tracker"
      data-testid="objective-tracker-panel"
    >
      <div className="objective-panel-header">
        <h2
          className="objective-panel-title"
          style={{
            fontSize: isPanelCollapsed ? '0.78rem' : '0.86rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: isPanelCollapsed ? '340px' : '380px',
          }}
        >
          <span aria-hidden="true">{isMissionComplete ? '✅' : '🎯'}</span>
          <span>
            {isPanelCollapsed
              ? isMissionComplete
                ? 'Incident Solved (9/9) // Next: Explore Lagos Island'
                : hasLiveMission
                  ? `Step ${currentStepNumber}/${totalCount}: ${displayGoal}`
                  : `Step ${stepNumber}: ${goal}`
              : activeMissionTitle}
          </span>
        </h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
          <span
            className="hud-badge-prototype"
            data-testid="objective-status-badge"
            aria-label={
              hasLiveMission
                ? isMissionComplete
                  ? 'Mission completed'
                  : 'Mission active'
                : isActive
                  ? 'Mission active'
                  : 'Simulation not yet active'
            }
            style={
              isMissionComplete
                ? {
                    background: 'rgba(16, 185, 129, 0.25)',
                    color: 'var(--color-accent-emerald)',
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                    fontWeight: 700,
                  }
                : undefined
            }
          >
            {statusBadgeText}
          </span>
          <button
            type="button"
            className="btn-objective-collapse"
            onClick={() => {
              const nextVal = !isPanelCollapsed;
              setIsPanelCollapsed(nextVal);
              onToggleExpanded?.(!nextVal);
            }}
            aria-label={isPanelCollapsed ? 'Expand objective panel' : 'Collapse objective panel'}
            data-testid="btn-toggle-collapse-objective"
            title={isPanelCollapsed ? 'Expand objective tracker' : 'Minimize objective tracker'}
          >
            {isPanelCollapsed ? '⊞' : '−'}
          </button>
        </div>
      </div>

      {!isPanelCollapsed && (
        <div className="objective-panel-body">
          <div
            className="objective-stage-badge"
            data-testid="objective-stage-title"
            style={
              isMissionComplete
                ? {
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                  }
                : undefined
            }
          >
            {activePhase}
          </div>

          <div style={{ margin: '0.4rem 0' }}>
            <p
              className="objective-step-desc"
              style={{
                color: isMissionComplete ? '#34d399' : 'var(--color-text-primary)',
                fontWeight: 700,
                fontSize: '0.88rem',
                margin: '0 0 0.25rem',
              }}
            >
              {isMissionComplete ? `🎉 ${displayGoal}` : `Step ${currentStepNumber} of ${totalCount}: ${displayGoal}`}
            </p>
            {hasLiveMission ? (
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
            ) : (
              <p className="objective-step-desc">
                The mission state machine and authoritative gameplay engine will be introduced in
                subsequent milestones (M3 &amp; M4).
              </p>
            )}
          </div>

          {/* When mission is active, give explicit step-by-step guidance, where to go, what to do, and copyable command */}
          {!isMissionComplete && hasLiveMission && (
            <div
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.65)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '6px',
                padding: '0.65rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.45rem',
                marginBottom: '0.5rem',
              }}
            >
              <div style={{ fontSize: '0.73rem', color: '#94a3b8' }}>
                <strong style={{ color: '#38bdf8' }}>📍 Where to Go:</strong>{' '}
                {currentGuide?.whereToGo ?? whereToGo}
              </div>
              <div style={{ fontSize: '0.73rem', color: '#e2e8f0' }}>
                <strong style={{ color: '#38bdf8' }}>🎯 What to Do:</strong>{' '}
                {currentGuide?.whatToDo ?? displayHint}
              </div>

              {currentGuide?.command && (
                <div
                  style={{
                    backgroundColor: '#020617',
                    border: '1px solid rgba(56, 189, 248, 0.35)',
                    borderRadius: '4px',
                    padding: '0.35rem 0.55rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '0.5rem',
                  }}
                >
                  <code
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.76rem',
                      color: '#38bdf8',
                    }}
                  >
                    $ {currentGuide.command}
                  </code>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <button
                      type="button"
                      onClick={() => handleCopyCmd(currentGuide.command!)}
                      style={{
                        backgroundColor: '#1e293b',
                        border: '1px solid #475569',
                        color: '#f8fafc',
                        borderRadius: '3px',
                        padding: '2px 7px',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      title="Copy command to clipboard"
                    >
                      {copiedCommand === currentGuide.command ? '✓ Copied' : '📋 Copy'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePasteCmd(currentGuide.command!)}
                      style={{
                        backgroundColor: 'rgba(56, 189, 248, 0.2)',
                        border: '1px solid #38bdf8',
                        color: '#38bdf8',
                        borderRadius: '3px',
                        padding: '2px 7px',
                        fontSize: '0.68rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                      title="Launch terminal and paste command"
                    >
                      ▶ Paste in Terminal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Post-Incident Navigation & Gameplay Directives */}
          {isMissionComplete && (
            <div
              style={{
                backgroundColor: 'rgba(6, 78, 59, 0.25)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '6px',
                padding: '0.65rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
                marginBottom: '0.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#34d399',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                🗺️ Where to Go Next // Available Activities:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
                {POST_INCIDENT_DIRECTIVES.map(d => (
                  <div
                    key={d.location}
                    style={{
                      backgroundColor: 'rgba(2, 6, 23, 0.6)',
                      borderRadius: '4px',
                      padding: '0.4rem 0.55rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.15rem',
                      fontSize: '0.73rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span>{d.icon}</span>
                      <strong style={{ color: '#f8fafc' }}>{d.location}</strong>
                      <span style={{ color: '#38bdf8', fontSize: '0.7rem' }}>• {d.contact}</span>
                    </div>
                    <div style={{ color: '#cbd5e1', paddingLeft: '1.25rem' }}>{d.action}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="objective-guidance-box">
            <div className="guidance-field-label">
              {isMissionComplete
                ? '📋 Full Incident Checklist (All Complete)'
                : hasLiveMission
                  ? '💡 Analyst Guidance & Steps'
                  : 'Guided Guidance Standard'}
            </div>

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
                ? `📋 ${isExpanded ? 'Hide Full 9-Step Checklist' : 'View Full 9-Step Checklist'}`
                : '🔄 [Repeat Instructions]'}
            </button>

            {isExpanded && hasLiveMission && (
              <div
                className="objective-expanded-guidance"
                data-testid="objective-expanded-guidance"
                style={{ marginTop: '0.5rem' }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {mission!.objectives.map((obj, i) => {
                    const isObjDone = isMissionComplete || obj.isCompleted;
                    return (
                      <div
                        key={obj.id}
                        style={{
                          fontSize: '0.74rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          color: isObjDone
                            ? 'var(--color-accent-emerald)'
                            : i === currentObjectiveIndex
                              ? 'var(--color-accent-amber)'
                              : 'var(--color-accent-cyan)',
                          fontWeight: i === currentObjectiveIndex && !isMissionComplete ? 700 : 400,
                        }}
                      >
                        <span>{isObjDone ? '✓' : i === currentObjectiveIndex ? '▶' : '○'}</span>
                        <span>
                          {i + 1}. {obj.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="objective-status-tag">
            <span aria-hidden="true">{isMissionComplete ? '🎉' : 'ℹ️'}</span>
            <span>
              {isMissionComplete
                ? 'Incident Closed // All Systems Operational'
                : hasLiveMission
                  ? 'Cedarline SOC // Authoritative Simulation'
                  : 'Simulation Engine: Headless architecture reserved'}
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};
