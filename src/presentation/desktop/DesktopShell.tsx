/**
 * Cyberlife — DesktopShell Component (Parrot Security OS Inspired)
 *
 * The primary virtual desktop environment: workspace, desktop shortcut icons,
 * window manager integration, taskbar, first-time orientation banner,
 * and seamless return-to-world transition.
 *
 * Rendered inside the 3D world as a bounded, high-fidelity workstation display
 * (not a full-screen takeover), preserving 3D view of the seated character,
 * physical laptop, desk, and office environment.
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppId, APP_REGISTRY } from './types';
import { useWindowManager } from './useWindowManager';
import { WindowFrame } from './WindowFrame';
import { Taskbar } from './Taskbar';
import { TerminalApp } from './apps/TerminalApp';
import { FieldGuideApp } from './apps/FieldGuideApp';
import { SystemInfoApp } from './apps/SystemInfoApp';
import { NotesApp } from './apps/NotesApp';
import { ActivityApp } from './apps/ActivityApp';
import { IncidentApp } from './apps/IncidentApp';
import { ContactsApp } from './apps/ContactsApp';
import { CareerApp } from './apps/CareerApp';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { CameraMode } from '../world/worldConfig';

export interface DesktopShellProps {
  workstationId?: string;
  cameraMode?: CameraMode;
  onExitDesktop: () => void;
  initialApp?: AppId;
  onTyping?: () => void;
  onMouseUse?: () => void;
  onTerminalOutput?: (lines: string[]) => void;
}

export const DesktopShell: React.FC<DesktopShellProps> = ({
  workstationId = 'interact_cedarline_workstation',
  cameraMode = 'THIRD_PERSON',
  onExitDesktop,
  initialApp = 'terminal',
  onTyping,
  onMouseUse,
  onTerminalOutput,
}) => {
  const sim = useOptionalSimulation();
  const desktopRef = useRef<HTMLDivElement | null>(null);

  const {
    windows,
    openApp,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    toggleMinimize,
    focusWindow,
    moveWindow,
    getActiveWindowId,
  } = useWindowManager({ initialOpenApp: initialApp });

  // First-time desktop orientation banner
  const [showWelcomeBanner, setShowWelcomeBanner] = useState<boolean>(true);
  const showWelcomeBannerRef = useRef(showWelcomeBanner);
  showWelcomeBannerRef.current = showWelcomeBanner;

  const activeWindowId = getActiveWindowId();

  // Escape key handler: exits desktop if no modal open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showWelcomeBannerRef.current) {
          setShowWelcomeBanner(false);
          return;
        }
        onExitDesktop();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExitDesktop]);

  const appKeys = Object.keys(APP_REGISTRY) as AppId[];
  const hasOpenWindows = appKeys.some(id => windows[id].isOpen && !windows[id].isMinimized);

  const isCedarline = workstationId.includes('cedarline');
  const workstationName = isCedarline
    ? 'Cedarline Services Marina Tower // Staging Cluster'
    : 'Apartment Broad Street // Personal Research Rig';

  const simulationTime = sim?.state.time.calendar.timeString ?? '08:00 AM';
  const simulationDate = sim?.state.time.calendar.dateString ?? 'Monday, Oct 12, 2026';

  const modeClass = cameraMode === 'THIRD_PERSON' ? 'mode-third-person' : 'mode-first-person';

  return (
    <div
      className={`workstation-overlay-backdrop ${modeClass}`}
      onMouseMove={() => onMouseUse?.()}
      onClick={() => onMouseUse?.()}
    >
      <div
        ref={desktopRef}
        className={`desktop-shell-container parrot-theme ${modeClass}`}
        role="region"
        aria-label="Cyberlife Virtual Desktop"
        data-testid="desktop-shell-container"
      >
        {/* Parrot Security OS Top Status Bar */}
        <div className="workstation-top-bar" data-testid="workstation-top-bar">
          <div className="top-bar-left">
            <span className="parrot-os-badge">🦅 PARROT SEC OS</span>
            <span className="workstation-sub-tag">{workstationName}</span>
          </div>
          <div className="top-bar-center">
            <span className="mode-badge">
              {cameraMode === 'THIRD_PERSON'
                ? '🎥 Over-The-Shoulder View (Character Seated)'
                : '👁️ Seated Eye-Level View (Computer Focus)'}
            </span>
          </div>
          <div className="top-bar-right">
            <span className="top-clock" title="Authoritative Simulation Clock">
              🕒 {simulationTime}
            </span>
            <button
              type="button"
              className="btn-exit-workstation"
              onClick={onExitDesktop}
              aria-label="Exit Workstation and stand up"
              data-testid="btn-exit-workstation-top"
            >
              Stand Up [Esc]
            </button>
          </div>
        </div>

        {/* Workspace Area */}
        <div className="desktop-workspace" data-testid="desktop-workspace">
          {/* Ambient Lagos Cyber Watermark */}
          <div className="desktop-watermark" aria-hidden="true">
            <div className="watermark-logo">PARROT SEC OS</div>
            <div className="watermark-sub">{workstationName}</div>
            <div className="watermark-status">
              100% IN-GAME SANDBOX // M3 CLOCK: {simulationTime}
            </div>
          </div>

          {/* Desktop Shortcut Icons */}
          <div className="desktop-icons-grid" role="toolbar" aria-label="Desktop Shortcuts">
            {appKeys.map(appId => {
              const def = APP_REGISTRY[appId];
              const win = windows[appId];
              const isRunning = win.isOpen;

              return (
                <button
                  key={appId}
                  type="button"
                  className={`desktop-shortcut-btn ${isRunning ? 'shortcut-running' : ''}`}
                  onClick={() => {
                    openApp(appId);
                    onMouseUse?.();
                  }}
                  onDoubleClick={() => {
                    openApp(appId);
                    onMouseUse?.();
                  }}
                  aria-label={`Launch ${def.title}`}
                  data-testid={`desktop-shortcut-${appId}`}
                >
                  <div className="shortcut-icon" aria-hidden="true">
                    {def.icon}
                  </div>
                  <div className="shortcut-label">{def.shortTitle}</div>
                  {isRunning && <span className="shortcut-dot" title="Running" />}
                </button>
              );
            })}
          </div>

          {/* Empty desktop state hint when no windows are open */}
          {!hasOpenWindows && (
            <div className="empty-desktop-hint" data-testid="empty-desktop-hint">
              <span className="empty-hint-icon" aria-hidden="true">
                ✨
              </span>
              <p className="empty-hint-title">Workstation Active</p>
              <p className="empty-hint-text">
                Click an icon on the desktop or use the taskbar below to launch tools.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  openApp('terminal');
                  onMouseUse?.();
                }}
                style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}
                data-testid="btn-empty-open-terminal"
              >
                💻 Open Terminal
              </button>
            </div>
          )}

          {/* First-Time Welcome & Guidance Banner */}
          {showWelcomeBanner && (
            <div
              className="desktop-welcome-banner hud-interactive"
              role="dialog"
              aria-label="Workstation Orientation"
              data-testid="desktop-welcome-banner"
            >
              <div className="welcome-banner-header">
                <span className="welcome-icon" aria-hidden="true">
                  🦅
                </span>
                <div className="welcome-title-group">
                  <h3 className="welcome-title">Parrot Security OS Workstation</h3>
                  <span className="welcome-tag">M4.5 Immersive Experience</span>
                </div>
                <button
                  type="button"
                  className="welcome-btn-close"
                  onClick={() => setShowWelcomeBanner(false)}
                  aria-label="Close orientation banner"
                  data-testid="btn-welcome-close"
                >
                  ✕
                </button>
              </div>

              <div className="welcome-banner-body">
                <p>
                  You are seated at the physical workstation. All terminal commands are typed
                  manually into the synthetic shell — zero commands run on your real machine.
                </p>
                <div className="welcome-checklist">
                  <div className="check-item">
                    <span className="check-bullet">1</span>
                    <span>
                      Type <code>help</code> to view available commands. Typing animates your
                      character&apos;s hands on the keyboard!
                    </span>
                  </div>
                  <div className="check-item">
                    <span className="check-bullet">2</span>
                    <span>
                      The simulated terminal reads the in-game clock (<code>date</code>) and network
                      (<code>status</code>).
                    </span>
                  </div>
                  <div className="check-item">
                    <span className="check-bullet">3</span>
                    <span>
                      Press <kbd>Esc</kbd> or click <strong>Stand Up</strong> to return to the 3D
                      world anytime.
                    </span>
                  </div>
                </div>
              </div>

              <div className="welcome-banner-footer">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowWelcomeBanner(false)}
                  data-testid="btn-welcome-dismiss"
                >
                  Got It — Use Workstation
                </button>
              </div>
            </div>
          )}

          {/* Application Windows */}
          {appKeys.map(appId => {
            const win = windows[appId];
            if (!win.isOpen) return null;

            const isActive = activeWindowId === appId;

            return (
              <WindowFrame
                key={appId}
                windowState={win}
                isActive={isActive}
                onFocus={() => {
                  focusWindow(appId);
                  onMouseUse?.();
                }}
                onClose={() => {
                  closeWindow(appId);
                  onMouseUse?.();
                }}
                onMinimize={() => {
                  minimizeWindow(appId);
                  onMouseUse?.();
                }}
                onMaximize={() => {
                  maximizeWindow(appId);
                  onMouseUse?.();
                }}
                onMove={(x, y) => {
                  const bounds = desktopRef.current
                    ? {
                        width: desktopRef.current.clientWidth,
                        height: desktopRef.current.clientHeight,
                      }
                    : undefined;
                  moveWindow(appId, x, y, bounds);
                  onMouseUse?.();
                }}
              >
                {appId === 'terminal' && (
                  <TerminalApp
                    workstationId={workstationId}
                    onTyping={onTyping}
                    onTerminalOutput={onTerminalOutput}
                  />
                )}
                {appId === 'fieldGuide' && <FieldGuideApp />}
                {appId === 'systemInfo' && <SystemInfoApp workstationId={workstationId} />}
                {appId === 'notes' && <NotesApp workstationId={workstationId} />}
                {appId === 'activity' && <ActivityApp workstationId={workstationId} />}
                {appId === 'incident' && <IncidentApp />}
                {appId === 'contacts' && <ContactsApp />}
                {appId === 'career' && <CareerApp />}
              </WindowFrame>
            );
          })}
        </div>

        {/* Taskbar */}
        <Taskbar
          windows={windows}
          activeWindowId={activeWindowId}
          simulationTimeString={simulationTime}
          simulationDateString={simulationDate}
          onOpenApp={appId => {
            openApp(appId);
            onMouseUse?.();
          }}
          onToggleMinimize={appId => {
            toggleMinimize(appId);
            onMouseUse?.();
          }}
          onExitDesktop={onExitDesktop}
        />
      </div>
    </div>
  );
};
