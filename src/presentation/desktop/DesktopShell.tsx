/**
 * Cyberlife — DesktopShell Component (EkoSec OS Security Workstation)
 *
 * The primary virtual cybersecurity desktop environment: workspace, original EkoSec OS branding,
 * desktop shortcut icons, window manager integration, multi-app routing (including Files,
 * Packet Lens, Rev Lens, Rule Tuner), taskbar application launcher, right-click context menu,
 * wallpaper personalization, and keyboard shortcuts with strict focus isolation.
 *
 * Rendered inside the 3D world as a bounded, high-fidelity workstation display
 * preserving 3D view of the seated character, physical laptop, desk, and office environment.
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
import { SaveManagerApp } from './apps/SaveManagerApp';
import { HelpCenterApp } from './apps/HelpCenterApp';
import { CyberCatalogueApp } from './apps/CyberCatalogueApp';
import { FileManagerApp } from './apps/FileManagerApp';
import { PacketLensApp } from './apps/PacketLensApp';
import { RevLensApp } from './apps/RevLensApp';
import { RuleTunerApp } from './apps/RuleTunerApp';
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

  // Orientation banner
  const [showWelcomeBanner, setShowWelcomeBanner] = useState<boolean>(true);
  const showWelcomeBannerRef = useRef(showWelcomeBanner);
  showWelcomeBannerRef.current = showWelcomeBanner;

  // Start Menu state
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);

  // Desktop Personalization (Wallpaper theme)
  const [wallpaperTheme, setWallpaperTheme] = useState<'slate' | 'marina' | 'obsidian'>('slate');

  // Desktop Right-Click Context Menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const activeWindowId = getActiveWindowId();
  const activeWindowIdRef = useRef(activeWindowId);
  activeWindowIdRef.current = activeWindowId;

  // Global Keyboard Shortcuts with Focus Isolation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept typing if active element is an editable text field
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      // Escape key handler: dismisses menus/banners first, then exits workstation
      if (e.key === 'Escape') {
        if (contextMenu) {
          setContextMenu(null);
          return;
        }
        if (isStartMenuOpen) {
          setIsStartMenuOpen(false);
          return;
        }
        if (showWelcomeBannerRef.current) {
          setShowWelcomeBanner(false);
          return;
        }
        onExitDesktop();
        return;
      }

      // Alt+F1: Toggle Applications Menu
      if (e.altKey && e.key === 'F1') {
        e.preventDefault();
        setIsStartMenuOpen(prev => !prev);
        return;
      }

      // Ctrl+Alt+T: Quick Launch Terminal
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        openApp('terminal');
        return;
      }

      // Ctrl+K: Quick Help & Knowledge
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K') && !isInputActive) {
        e.preventDefault();
        openApp('helpCenter');
        return;
      }

      // Window manipulation shortcuts (only when not typing in an input)
      if (!isInputActive && activeWindowIdRef.current) {
        const currentActive = activeWindowIdRef.current;
        // Ctrl+W: Close active window
        if ((e.ctrlKey || e.metaKey) && (e.key === 'w' || e.key === 'W')) {
          e.preventDefault();
          closeWindow(currentActive);
          return;
        }
        // Alt+F9: Minimize active window
        if (e.altKey && e.key === 'F9') {
          e.preventDefault();
          minimizeWindow(currentActive);
          return;
        }
        // Alt+F10: Maximize/Restore active window
        if (e.altKey && e.key === 'F10') {
          e.preventDefault();
          maximizeWindow(currentActive);
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onExitDesktop,
    contextMenu,
    isStartMenuOpen,
    openApp,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
  ]);

  const appKeys = Object.keys(APP_REGISTRY) as AppId[];
  const hasOpenWindows = appKeys.some(id => windows[id].isOpen && !windows[id].isMinimized);

  const isCedarline = workstationId.includes('cedarline');
  const workstationName = isCedarline
    ? 'Cedarline Services Marina Tower // Staging Cluster'
    : 'Apartment Broad Street // Personal Research Rig';

  const simulationTime = sim?.state.time.calendar.timeString ?? '08:00 AM';
  const simulationDate = sim?.state.time.calendar.dateString ?? 'Monday, Oct 12, 2026';

  const modeClass = cameraMode === 'THIRD_PERSON' ? 'mode-third-person' : 'mode-first-person';

  // Desktop background wallpaper style
  const getWallpaperBackground = () => {
    switch (wallpaperTheme) {
      case 'marina':
        return 'radial-gradient(ellipse at bottom, #091a28 0%, #050b14 70%)';
      case 'obsidian':
        return 'radial-gradient(circle at 50% 50%, #161b22 0%, #07090d 100%)';
      case 'slate':
      default:
        return 'radial-gradient(circle at 20% 20%, #1b2735 0%, #090a0f 100%)';
    }
  };

  return (
    <div
      className={`workstation-overlay-backdrop ${modeClass}`}
      onMouseMove={() => onMouseUse?.()}
      onClick={() => {
        onMouseUse?.();
        if (contextMenu) setContextMenu(null);
      }}
    >
      <div
        ref={desktopRef}
        className={`desktop-shell-container parrot-theme ${modeClass}`}
        role="region"
        aria-label="EkoSec Cyberlife Virtual Desktop"
        data-testid="desktop-shell-container"
        style={{
          background: getWallpaperBackground(),
        }}
      >
        {/* EkoSec OS Top Status Bar */}
        <div className="workstation-top-bar" data-testid="workstation-top-bar">
          <div className="top-bar-left">
            <span className="parrot-os-badge">🦅 EKOSEC OS 2026</span>
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
        <div
          className="desktop-workspace"
          data-testid="desktop-workspace"
          onContextMenu={e => {
            e.preventDefault();
            const rect = desktopRef.current?.getBoundingClientRect();
            const x = rect ? e.clientX - rect.left : e.clientX;
            const y = rect ? e.clientY - rect.top : e.clientY;
            setContextMenu({ x, y });
          }}
          onScroll={e => {
            e.currentTarget.scrollTop = 0;
            e.currentTarget.scrollLeft = 0;
          }}
        >
          {/* Ambient Cyber Watermark */}
          <div className="desktop-watermark" aria-hidden="true">
            <div className="watermark-logo">EKOSEC LINUX 2026</div>
            <div className="watermark-sub">{workstationName}</div>
            <div className="watermark-status">
              100% IN-GAME VFS // M3 CLOCK: {simulationTime} // ISOLATED SANDBOX
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

          {/* Desktop Right-Click Context Menu */}
          {contextMenu && (
            <div
              className="desktop-context-menu"
              style={{
                position: 'absolute',
                top: `${contextMenu.y}px`,
                left: `${contextMenu.x}px`,
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                zIndex: 5000,
                minWidth: '180px',
                padding: '4px 0',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  openApp('terminal');
                  setContextMenu(null);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#c9d1d9',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                }}
              >
                💻 Open Terminal
              </button>
              <button
                type="button"
                onClick={() => {
                  openApp('files');
                  setContextMenu(null);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#c9d1d9',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                }}
              >
                📁 Open File Manager
              </button>
              <button
                type="button"
                onClick={() => {
                  openApp('packetLens');
                  setContextMenu(null);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#c9d1d9',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                }}
              >
                🔍 Open Packet Lens
              </button>

              <div style={{ height: '1px', backgroundColor: '#30363d', margin: '4px 0' }} />

              <div
                style={{
                  padding: '4px 12px',
                  fontSize: '0.7rem',
                  color: '#8b949e',
                  fontWeight: 600,
                }}
              >
                Wallpaper Theme:
              </div>
              <button
                type="button"
                onClick={() => {
                  setWallpaperTheme('slate');
                  setContextMenu(null);
                }}
                style={{
                  padding: '4px 12px',
                  backgroundColor: wallpaperTheme === 'slate' ? '#1f6feb22' : 'transparent',
                  border: 'none',
                  color: wallpaperTheme === 'slate' ? '#58a6ff' : '#c9d1d9',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                • Slate Cyber Grid {wallpaperTheme === 'slate' && '✓'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setWallpaperTheme('marina');
                  setContextMenu(null);
                }}
                style={{
                  padding: '4px 12px',
                  backgroundColor: wallpaperTheme === 'marina' ? '#1f6feb22' : 'transparent',
                  border: 'none',
                  color: wallpaperTheme === 'marina' ? '#58a6ff' : '#c9d1d9',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                • Marina Midnight {wallpaperTheme === 'marina' && '✓'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setWallpaperTheme('obsidian');
                  setContextMenu(null);
                }}
                style={{
                  padding: '4px 12px',
                  backgroundColor: wallpaperTheme === 'obsidian' ? '#1f6feb22' : 'transparent',
                  border: 'none',
                  color: wallpaperTheme === 'obsidian' ? '#58a6ff' : '#c9d1d9',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                }}
              >
                • Obsidian Stealth {wallpaperTheme === 'obsidian' && '✓'}
              </button>

              <div style={{ height: '1px', backgroundColor: '#30363d', margin: '4px 0' }} />

              <button
                type="button"
                onClick={() => {
                  openApp('systemInfo');
                  setContextMenu(null);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#c9d1d9',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                }}
              >
                ⚙️ System Specifications
              </button>
            </div>
          )}

          {/* Empty desktop state hint when no windows are open */}
          {!hasOpenWindows && (
            <div className="empty-desktop-hint" data-testid="empty-desktop-hint">
              <span className="empty-hint-icon" aria-hidden="true">
                🦅
              </span>
              <p className="empty-hint-title">EkoSec Security Station Active</p>
              <p className="empty-hint-text">
                Click an icon on the desktop, use the taskbar below, or right-click to launch tools.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    openApp('terminal');
                    onMouseUse?.();
                  }}
                  style={{ fontSize: '0.85rem' }}
                  data-testid="btn-empty-open-terminal"
                >
                  💻 Open Terminal
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    openApp('files');
                    onMouseUse?.();
                  }}
                  style={{ fontSize: '0.85rem', backgroundColor: '#21262d' }}
                >
                  📁 Open Files
                </button>
              </div>
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
                  <h3 className="welcome-title">EkoSec Linux Cybersecurity Workstation</h3>
                  <span className="welcome-tag">M11 Parroted Security Arsenal</span>
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
                  You are seated at the physical security workstation. All terminal commands are
                  typed manually into the sandboxed virtual shell — zero commands run on your real
                  machine.
                </p>
                <div className="welcome-checklist">
                  <div className="check-item">
                    <span className="check-bullet">1</span>
                    <span>
                      Type <code>help</code>, <code>pwd</code>, or <code>ls -l</code> to explore the
                      virtual filesystem. Typing animates your character&apos;s hands!
                    </span>
                  </div>
                  <div className="check-item">
                    <span className="check-bullet">2</span>
                    <span>
                      Launch <strong>Packet Lens</strong>, <strong>Rev Lens</strong>, or{' '}
                      <strong>Rule Tuner</strong> from the desktop or EkoSec menu.
                    </span>
                  </div>
                  <div className="check-item">
                    <span className="check-bullet">3</span>
                    <span>
                      Press <kbd>Alt+F1</kbd> for the menu, <kbd>Ctrl+Alt+T</kbd> for terminal, or{' '}
                      <kbd>Esc</kbd> to stand up safely.
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
                  Got It — Use Security Station
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
                {appId === 'saveManager' && <SaveManagerApp />}
                {appId === 'helpCenter' && <HelpCenterApp />}
                {appId === 'catalogue' && <CyberCatalogueApp />}
                {appId === 'files' && <FileManagerApp />}
                {appId === 'packetLens' && <PacketLensApp />}
                {appId === 'revLens' && <RevLensApp />}
                {appId === 'ruleTuner' && <RuleTunerApp />}
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
          isStartMenuOpen={isStartMenuOpen}
          onToggleStartMenu={() => setIsStartMenuOpen(prev => !prev)}
        />
      </div>
    </div>
  );
};
