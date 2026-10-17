/**
 * Cyberlife — Virtual Desktop Taskbar Component
 *
 * Provides application launcher menu, open window tabs, simulation clock,
 * host safety indicator, and return-to-world action.
 */

import React, { useState, useRef, useEffect } from 'react';
import { AppId, APP_REGISTRY, WindowState } from './types';

export interface TaskbarProps {
  windows: Record<AppId, WindowState>;
  activeWindowId: AppId | null;
  simulationTimeString?: string;
  simulationDateString?: string;
  onOpenApp: (appId: AppId) => void;
  onToggleMinimize: (appId: AppId) => void;
  onExitDesktop: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  simulationTimeString = '08:00 AM',
  simulationDateString = 'Oct 12, 2026',
  onOpenApp,
  onToggleMinimize,
  onExitDesktop,
}) => {
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const startMenuRef = useRef<HTMLDivElement | null>(null);

  // Close start menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        startMenuRef.current &&
        !startMenuRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement)?.closest('.btn-start-launcher')
      ) {
        setIsStartMenuOpen(false);
      }
    };

    if (isStartMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isStartMenuOpen]);

  const appKeys = Object.keys(APP_REGISTRY) as AppId[];

  return (
    <footer
      className="desktop-taskbar"
      role="navigation"
      aria-label="Virtual Desktop Taskbar"
      data-testid="desktop-taskbar"
    >
      {/* Start / Launcher Menu Popup */}
      {isStartMenuOpen && (
        <div
          ref={startMenuRef}
          className="desktop-start-menu"
          role="menu"
          aria-label="Application Launcher Menu"
          data-testid="desktop-start-menu"
        >
          <div className="start-menu-header">
            <span className="start-menu-badge" aria-hidden="true">
              ⚡
            </span>
            <div>
              <div className="start-menu-title">CyberOS Applications</div>
              <div className="start-menu-subtitle">Lagos Island Corporate Workstation</div>
            </div>
          </div>

          <div className="start-menu-list">
            {appKeys.map(appId => {
              const def = APP_REGISTRY[appId];
              const win = windows[appId];
              const isOpen = win?.isOpen;

              return (
                <button
                  key={appId}
                  type="button"
                  className="start-menu-item"
                  role="menuitem"
                  onClick={() => {
                    onOpenApp(appId);
                    setIsStartMenuOpen(false);
                  }}
                  data-testid={`start-menu-item-${appId}`}
                >
                  <span className="start-item-icon" aria-hidden="true">
                    {def.icon}
                  </span>
                  <div className="start-item-details">
                    <span className="start-item-name">{def.title}</span>
                    <span className="start-item-desc">{def.description}</span>
                  </div>
                  {isOpen && <span className="start-item-running-dot" title="Running" />}
                </button>
              );
            })}
          </div>

          <div className="start-menu-footer">
            <button
              type="button"
              className="btn-start-exit"
              onClick={() => {
                setIsStartMenuOpen(false);
                onExitDesktop();
              }}
              data-testid="btn-start-exit"
            >
              <span aria-hidden="true">⏏</span> Return to 3D World (Broad Street)
            </button>
          </div>
        </div>
      )}

      {/* Start Button */}
      <button
        type="button"
        className={`btn-start-launcher ${isStartMenuOpen ? 'start-open' : ''}`}
        onClick={() => setIsStartMenuOpen(prev => !prev)}
        aria-expanded={isStartMenuOpen}
        aria-label="Applications Menu"
        data-testid="btn-start-launcher"
      >
        <span className="start-btn-icon" aria-hidden="true">
          🌐
        </span>
        <span className="start-btn-text">CyberOS</span>
      </button>

      {/* Open Applications Tabs */}
      <div className="taskbar-apps-container" role="tablist" aria-label="Open Applications">
        {appKeys.map(appId => {
          const win = windows[appId];
          if (!win.isOpen) return null;

          const isActive = activeWindowId === appId && !win.isMinimized;
          const isMin = win.isMinimized;

          return (
            <button
              key={appId}
              type="button"
              className={`taskbar-app-tab ${isActive ? 'tab-active' : ''} ${isMin ? 'tab-minimized' : ''}`}
              role="tab"
              aria-selected={isActive}
              onClick={() => onToggleMinimize(appId)}
              title={`${win.title}${isMin ? ' (Minimized)' : ''}`}
              data-testid={`taskbar-tab-${appId}`}
            >
              <span className="tab-icon" aria-hidden="true">
                {win.icon}
              </span>
              <span className="tab-title">{win.title}</span>
              {isActive && <span className="tab-active-bar" aria-hidden="true" />}
            </button>
          );
        })}
      </div>

      {/* System Tray (Clock, Status, Return to World) */}
      <div className="taskbar-tray" data-testid="taskbar-tray">
        {/* Safety Badge */}
        <div
          className="tray-safety-badge"
          title="Cyberlife Sandboxed Environment: 100% simulated, zero host access"
        >
          <span className="tray-status-dot" aria-hidden="true" />
          <span className="tray-status-text">Simulated OS</span>
        </div>

        {/* Simulation Clock */}
        <div
          className="tray-clock"
          title={`Simulation Date: ${simulationDateString}`}
          data-testid="tray-simulation-clock"
        >
          <span className="tray-clock-time">{simulationTimeString}</span>
          <span className="tray-clock-date">{simulationDateString}</span>
        </div>

        {/* Exit Button */}
        <button
          type="button"
          className="btn-tray-exit"
          onClick={onExitDesktop}
          aria-label="Exit Virtual Desktop and return to 3D world"
          title="Exit Virtual Desktop [Esc]"
          data-testid="btn-tray-exit"
        >
          <span aria-hidden="true">⏏</span>
          <span className="exit-btn-text">Exit Desktop</span>
        </button>
      </div>
    </footer>
  );
};
