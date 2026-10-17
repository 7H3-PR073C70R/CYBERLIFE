/**
 * Cyberlife — DesktopShell Component
 *
 * The primary virtual desktop environment: workspace, desktop shortcut icons,
 * window manager integration, taskbar, first-time orientation banner,
 * and seamless return-to-world transition.
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
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';

export interface DesktopShellProps {
  workstationId?: string;
  onExitDesktop: () => void;
  initialApp?: AppId;
}

export const DesktopShell: React.FC<DesktopShellProps> = ({
  workstationId = 'interact_cedarline_workstation',
  onExitDesktop,
  initialApp = 'terminal',
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
    ? 'Cedarline Services HQ — Marina Tower Workstation #04'
    : 'Player Apartment — Broad Street 14 Workstation Rig';

  const simulationTime = sim?.state.time.calendar.timeString ?? '08:00 AM';
  const simulationDate = sim?.state.time.calendar.dateString ?? 'Monday, Oct 12, 2026';

  return (
    <div
      ref={desktopRef}
      className="desktop-shell-container"
      role="region"
      aria-label="Cyberlife Virtual Desktop"
      data-testid="desktop-shell-container"
    >
      {/* Workspace Area */}
      <div className="desktop-workspace" data-testid="desktop-workspace">
        {/* Ambient Lagos Cyber Watermark */}
        <div className="desktop-watermark" aria-hidden="true">
          <div className="watermark-logo">CYBERLIFE OS</div>
          <div className="watermark-sub">{workstationName}</div>
          <div className="watermark-status">
            SECURE SYNTHETIC RUNTIME // REVISION {sim?.state.metadata.revision ?? 1}
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
                onClick={() => openApp(appId)}
                onDoubleClick={() => openApp(appId)}
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
            <p className="empty-hint-title">Workspace Ready</p>
            <p className="empty-hint-text">
              Click an application icon on the desktop or use the CyberOS taskbar below to launch an
              app.
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => openApp('terminal')}
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
                🚀
              </span>
              <div className="welcome-title-group">
                <h3 className="welcome-title">Welcome to your Virtual Workstation</h3>
                <span className="welcome-tag">Beginner Guidance</span>
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
                You are now using a <strong>fictional computer inside Cyberlife</strong>. All tools,
                logs, and files operate entirely in an in-memory simulation — your real computer is
                completely isolated.
              </p>
              <div className="welcome-checklist">
                <div className="check-item">
                  <span className="check-bullet">1</span>
                  <span>
                    Open <strong>Terminal</strong> to practice safe simulated commands (type{' '}
                    <code>help</code> to begin).
                  </span>
                </div>
                <div className="check-item">
                  <span className="check-bullet">2</span>
                  <span>
                    Consult the <strong>Field Guide</strong> anytime for plain-English cybersecurity
                    analogies.
                  </span>
                </div>
                <div className="check-item">
                  <span className="check-bullet">3</span>
                  <span>
                    Press <kbd>Esc</kbd> or click <strong>Exit Desktop</strong> in the bottom right
                    to return to the 3D world.
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
                Got It — Start Exploring Desktop
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
              onFocus={() => focusWindow(appId)}
              onClose={() => closeWindow(appId)}
              onMinimize={() => minimizeWindow(appId)}
              onMaximize={() => maximizeWindow(appId)}
              onMove={(x, y) => {
                const bounds = desktopRef.current
                  ? {
                      width: desktopRef.current.clientWidth,
                      height: desktopRef.current.clientHeight,
                    }
                  : undefined;
                moveWindow(appId, x, y, bounds);
              }}
            >
              {appId === 'terminal' && <TerminalApp workstationId={workstationId} />}
              {appId === 'fieldGuide' && <FieldGuideApp />}
              {appId === 'systemInfo' && <SystemInfoApp workstationId={workstationId} />}
              {appId === 'notes' && <NotesApp workstationId={workstationId} />}
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
        onOpenApp={openApp}
        onToggleMinimize={toggleMinimize}
        onExitDesktop={onExitDesktop}
      />
    </div>
  );
};
