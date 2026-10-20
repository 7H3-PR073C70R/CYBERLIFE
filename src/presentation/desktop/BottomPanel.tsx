/**
 * Cyberlife — Orion OS Bottom Panel (MATE-style Taskbar & Workspace Pager)
 *
 * Classical Linux security distribution bottom panel:
 * - Left: Menu launcher & quick terminal button
 * - Center: Open window tabs with active focus state and minimize/restore toggle
 * - Right: Desktop workspace switcher / pager (1, 2, 3, 4) & Show Desktop button
 */

import React from 'react';
import { AppId, WindowState } from './types';
import { OsIcon, OsIconName } from './icons/OsIcons';

export interface BottomPanelProps {
  windows: Record<AppId, WindowState>;
  activeWindowId: AppId | null;
  activeWorkspace: number;
  onSelectWorkspace: (workspace: number) => void;
  onToggleWindow: (appId: AppId) => void;
  onToggleShowDesktop: () => void;
  onOpenApp: (appId: AppId) => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  windows,
  activeWindowId,
  activeWorkspace,
  onSelectWorkspace,
  onToggleWindow,
  onToggleShowDesktop,
  onOpenApp,
}) => {
  const openWindows = (Object.keys(windows) as AppId[])
    .map(id => windows[id])
    .filter(w => w.isOpen);

  return (
    <footer
      className="Orion-bottom-panel"
      data-testid="desktop-bottom-panel"
      role="region"
      aria-label="Orion OS Bottom Taskbar"
      style={{
        height: '28px',
        minHeight: '28px',
        backgroundColor: 'rgba(10, 15, 24, 0.96)',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        gap: '4px',
        zIndex: 6000,
        userSelect: 'none',
        fontSize: '11px',
        color: '#f8fafc',
      }}
    >
      {/* Far Left: Quick Menu / Terminal Launcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <button
          type="button"
          onClick={() => onOpenApp('terminal')}
          title="Terminal (Alt+F1)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '3px',
            padding: '2px 6px',
            color: '#00ff66',
            cursor: 'pointer',
          }}
        >
          <OsIcon name="terminal" size={13} color="#00ff66" />
        </button>
      </div>

      <div
        style={{
          width: '1px',
          height: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          margin: '0 2px',
        }}
      />

      {/* Center: Open Window Tabs */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: '4px',
          overflowX: 'auto',
          alignItems: 'center',
        }}
      >
        {openWindows.map(win => {
          const isActive = activeWindowId === win.id && !win.isMinimized;
          const iconName = typeof win.icon === 'string' ? (win.icon as OsIconName) : undefined;

          return (
            <button
              key={win.id}
              type="button"
              onClick={() => onToggleWindow(win.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                maxWidth: '180px',
                height: '22px',
                backgroundColor: isActive
                  ? 'rgba(0, 229, 255, 0.2)'
                  : win.isMinimized
                    ? 'rgba(30, 41, 59, 0.4)'
                    : 'rgba(15, 23, 42, 0.8)',
                border: isActive
                  ? '1px solid rgba(0, 229, 255, 0.5)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                color: isActive ? '#00e5ff' : win.isMinimized ? '#64748b' : '#cbd5e1',
                fontSize: '11px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {iconName ? (
                <OsIcon name={iconName} size={12} color={isActive ? '#00e5ff' : '#94a3b8'} />
              ) : null}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{win.title}</span>
            </button>
          );
        })}
      </div>

      {/* Far Right: Workspace Pager & Show Desktop */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Workspace Pager 1 - 4 */}
        <div
          className="workspace-pager"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '2px',
            backgroundColor: '#050910',
            padding: '2px',
            borderRadius: '3px',
            border: '1px solid #1e293b',
          }}
        >
          {[1, 2, 3, 4].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => onSelectWorkspace(num)}
              title={`Workspace ${num}`}
              style={{
                width: '18px',
                height: '16px',
                backgroundColor: activeWorkspace === num ? '#00e5ff' : '#0f172a',
                color: activeWorkspace === num ? '#050910' : '#64748b',
                border: 'none',
                borderRadius: '2px',
                fontSize: '9px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Show Desktop Button */}
        <button
          type="button"
          onClick={onToggleShowDesktop}
          title="Show Desktop (Minimize/Restore All)"
          style={{
            width: '20px',
            height: '20px',
            backgroundColor: 'transparent',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '3px',
            color: '#94a3b8',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          <OsIcon name="desktop" size={12} color="#94a3b8" />
        </button>
      </div>
    </footer>
  );
};
