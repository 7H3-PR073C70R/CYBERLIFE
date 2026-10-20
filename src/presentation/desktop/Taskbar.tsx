/**
 * Cyberlife — Heron OS Security Desktop Taskbar & Application Launcher
 *
 * Inspired by Heron OS and modern Linux cybersecurity workstation conventions.
 * Features:
 * - Categorized applications menu with live search and team-track filters.
 * - Pinned favorites bar for quick access.
 * - Honest implementation badges (PLAYABLE, PARTIAL, REFERENCE, PLANNED).
 * - Open window tabs with active/minimized states.
 * - System tray with simulated network, sound, power, notifications, and simulation clock.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { AppId, APP_REGISTRY, WindowState } from './types';
import {
  SIMULATED_TOOLS,
  SimulatedToolDefinition,
  SimulatedTeamTrack,
} from '@/simulation/cyber/tools/SimulatedToolRegistry';

export interface TaskbarProps {
  windows: Record<AppId, WindowState>;
  activeWindowId: AppId | null;
  simulationTimeString?: string;
  simulationDateString?: string;
  onOpenApp: (appId: AppId) => void;
  onToggleMinimize: (appId: AppId) => void;
  onExitDesktop: () => void;
  isStartMenuOpen?: boolean;
  onToggleStartMenu?: () => void;
}

export const Taskbar: React.FC<TaskbarProps> = ({
  windows,
  activeWindowId,
  simulationTimeString = '08:00 AM',
  simulationDateString = 'Oct 12, 2026',
  onOpenApp,
  onToggleMinimize,
  onExitDesktop,
  isStartMenuOpen: controlledStartMenuOpen,
  onToggleStartMenu: controlledToggleStartMenu,
}) => {
  const [internalStartMenuOpen, setInternalStartMenuOpen] = useState(false);
  const isStartMenuOpen = controlledStartMenuOpen ?? internalStartMenuOpen;
  const toggleStartMenu = controlledToggleStartMenu ?? (() => setInternalStartMenuOpen(p => !p));

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrackFilter, setSelectedTrackFilter] = useState<string>('all');
  const startMenuRef = useRef<HTMLDivElement | null>(null);

  // Close start menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        startMenuRef.current &&
        !startMenuRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement)?.closest('.btn-start-launcher')
      ) {
        if (controlledStartMenuOpen !== undefined) {
          if (controlledStartMenuOpen && controlledToggleStartMenu) {
            controlledToggleStartMenu();
          }
        } else {
          setInternalStartMenuOpen(false);
        }
      }
    };

    if (isStartMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isStartMenuOpen, controlledStartMenuOpen, controlledToggleStartMenu]);

  // Filtered tools in application launcher
  const filteredTools = useMemo(() => {
    return SIMULATED_TOOLS.filter(tool => {
      if (selectedTrackFilter !== 'all') {
        if (!tool.tracks.includes(selectedTrackFilter as SimulatedTeamTrack)) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = tool.name.toLowerCase().includes(q);
        const matchesDesc = tool.description.toLowerCase().includes(q);
        const matchesCategory = tool.categoryLabel.toLowerCase().includes(q);
        const matchesCmd = tool.canonicalCommand.toLowerCase().includes(q);
        return matchesName || matchesDesc || matchesCategory || matchesCmd;
      }
      return true;
    });
  }, [searchQuery, selectedTrackFilter]);

  // Pinned favorites
  const pinnedFavorites: { id: AppId; name: string; icon: string }[] = [
    { id: 'terminal', name: 'Terminal', icon: '💻' },
    { id: 'files', name: 'Files', icon: '📁' },
    { id: 'packetLens', name: 'Packet Lens', icon: '🔍' },
    { id: 'incident', name: 'Incident Portal', icon: '🚨' },
    { id: 'catalogue', name: 'Cyber Catalogue', icon: '🛡️' },
  ];

  const appKeys = Object.keys(APP_REGISTRY) as AppId[];

  const handleLaunchTool = (tool: SimulatedToolDefinition) => {
    if (tool.linkedAppId && tool.linkedAppId in APP_REGISTRY) {
      onOpenApp(tool.linkedAppId as AppId);
    } else {
      // If it's a CLI-only tool or no specific GUI app, open the terminal
      onOpenApp('terminal');
    }
    if (controlledStartMenuOpen !== undefined) {
      if (controlledStartMenuOpen && controlledToggleStartMenu) controlledToggleStartMenu();
    } else {
      setInternalStartMenuOpen(false);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'playable':
        return { backgroundColor: '#238636', color: '#fff' };
      case 'partial':
        return { backgroundColor: '#d29922', color: '#0d1117' };
      case 'reference_only':
        return { backgroundColor: '#1f6feb', color: '#fff' };
      case 'planned':
      default:
        return { backgroundColor: '#30363d', color: '#8b949e' };
    }
  };

  return (
    <footer
      className="desktop-taskbar ekosec-panel"
      role="navigation"
      aria-label="EkoSec Desktop Taskbar"
      data-testid="desktop-taskbar"
      style={{
        display: 'flex',
        alignItems: 'center',
        height: '42px',
        backgroundColor: '#161b22',
        borderTop: '1px solid #30363d',
        padding: '0 8px',
        gap: '8px',
        position: 'relative',
        zIndex: 1000,
        userSelect: 'none',
      }}
    >
      {/* Applications Launcher Popup Menu */}
      {isStartMenuOpen && (
        <div
          ref={startMenuRef}
          className="desktop-start-menu ekosec-launcher"
          role="menu"
          aria-label="EkoSec Applications Menu"
          data-testid="desktop-start-menu"
          style={{
            position: 'absolute',
            bottom: '46px',
            left: '8px',
            width: '560px',
            maxHeight: '520px',
            backgroundColor: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '8px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.7)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header & Identity */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#161b22',
              borderBottom: '1px solid #30363d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.4rem' }}>🦅</span>
              <div>
                <div style={{ fontWeight: 700, color: '#58a6ff', fontSize: '0.95rem' }}>
                  EkoSec Security Station
                </div>
                <div style={{ fontSize: '0.75rem', color: '#8b949e' }}>
                  Cyberlife Linux 2026 // Lagos Marina Cluster
                </div>
              </div>
            </div>
            <span
              style={{
                fontSize: '0.7rem',
                backgroundColor: '#238636',
                color: '#fff',
                padding: '2px 8px',
                borderRadius: '10px',
                fontWeight: 600,
              }}
            >
              100% IN-GAME VFS
            </span>
          </div>

          {/* Search Bar & Track Filters */}
          <div
            style={{
              padding: '8px 16px',
              backgroundColor: '#0d1117',
              borderBottom: '1px solid #21262d',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <input
              type="text"
              placeholder="Search tools, commands, or categories..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
              style={{
                padding: '6px 12px',
                backgroundColor: '#161b22',
                border: '1px solid #30363d',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '0.82rem',
                outline: 'none',
              }}
              data-testid="launcher-search-input"
            />

            <div style={{ display: 'flex', gap: '4px' }}>
              {[
                { id: 'all', label: 'All Tracks' },
                { id: 'blue', label: '🔵 Blue' },
                { id: 'red', label: '🔴 Red' },
                { id: 'purple', label: '🟣 Purple' },
                { id: 'shared', label: '⚪ Foundations' },
              ].map(track => (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => setSelectedTrackFilter(track.id)}
                  style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    border: '1px solid #30363d',
                    backgroundColor: selectedTrackFilter === track.id ? '#1f6feb' : '#21262d',
                    color: selectedTrackFilter === track.id ? '#fff' : '#8b949e',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    fontWeight: 600,
                  }}
                >
                  {track.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tool List with Honest Badges */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '6px 8px',
              maxHeight: '320px',
            }}
          >
            {filteredTools.length === 0 ? (
              <div style={{ padding: '16px', color: '#8b949e', textAlign: 'center' }}>
                No tools matched &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredTools.map(tool => {
                const badgeStyle = getStatusBadgeStyle(tool.status);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => handleLaunchTool(tool)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: '#c9d1d9',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = '#161b22';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    data-testid={`launcher-item-${tool.id} start-menu-item-${tool.linkedAppId || tool.id}`}
                  >
                    <span style={{ fontSize: '1.2rem' }}>{tool.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontWeight: 600, color: '#e6edf3', fontSize: '0.82rem' }}>
                          {tool.name}
                        </span>
                        <span
                          style={{
                            fontSize: '0.62rem',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            fontWeight: 700,
                            ...badgeStyle,
                          }}
                        >
                          {tool.statusBadge}
                        </span>
                        <span style={{ fontSize: '0.68rem', color: '#8b949e', marginLeft: 'auto' }}>
                          {tool.categoryLabel}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '0.72rem',
                          color: '#8b949e',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {tool.description}
                      </div>
                    </div>
                  </button>
                );
              })
            )}

            {/* System Applications List */}
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: '#8b949e',
                textTransform: 'uppercase',
                padding: '6px 10px 2px',
                marginTop: '6px',
                borderTop: '1px solid #21262d',
              }}
            >
              System Applications
            </div>
            {appKeys.map(appId => {
              const def = APP_REGISTRY[appId];
              return (
                <button
                  key={`app-${appId}`}
                  type="button"
                  onClick={() => {
                    onOpenApp(appId);
                    if (controlledStartMenuOpen !== undefined && controlledToggleStartMenu) {
                      controlledToggleStartMenu();
                    } else {
                      setInternalStartMenuOpen(false);
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    width: '100%',
                    padding: '6px 10px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#c9d1d9',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = '#161b22';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  data-testid={`start-menu-item-${appId}`}
                >
                  <span style={{ fontSize: '1.1rem' }}>{def.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, color: '#e6edf3', fontSize: '0.8rem' }}>
                      {def.title}
                    </div>
                    <div
                      style={{
                        fontSize: '0.7rem',
                        color: '#8b949e',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {def.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Launcher Footer */}
          <div
            style={{
              padding: '8px 12px',
              backgroundColor: '#161b22',
              borderTop: '1px solid #30363d',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <button
              type="button"
              onClick={() => {
                if (controlledStartMenuOpen !== undefined && controlledToggleStartMenu) {
                  controlledToggleStartMenu();
                } else {
                  setInternalStartMenuOpen(false);
                }
                onOpenApp('helpCenter');
              }}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#58a6ff',
                fontSize: '0.75rem',
                cursor: 'pointer',
              }}
            >
              ❓ Help Center & Shortcuts
            </button>

            <button
              type="button"
              onClick={() => {
                if (controlledStartMenuOpen !== undefined && controlledToggleStartMenu) {
                  controlledToggleStartMenu();
                } else {
                  setInternalStartMenuOpen(false);
                }
                onExitDesktop();
              }}
              style={{
                padding: '4px 10px',
                backgroundColor: '#21262d',
                border: '1px solid #30363d',
                borderRadius: '4px',
                color: '#f85149',
                fontSize: '0.75rem',
                cursor: 'pointer',
                fontWeight: 600,
              }}
              data-testid="btn-start-exit"
            >
              ⏏ Stand Up [Esc]
            </button>
          </div>
        </div>
      )}

      {/* Main Start / Menu Launcher Button */}
      <button
        type="button"
        className={`btn-start-launcher ${isStartMenuOpen ? 'start-open' : ''}`}
        onClick={toggleStartMenu}
        aria-expanded={isStartMenuOpen}
        aria-label="Applications Menu"
        data-testid="btn-start-launcher"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          backgroundColor: isStartMenuOpen ? '#1f6feb' : '#238636',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 700,
          fontSize: '0.82rem',
        }}
      >
        <span aria-hidden="true">🦅</span>
        <span>EkoSec</span>
      </button>

      {/* Pinned Quick Launch Favorites */}
      <div
        className="pinned-favorites-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          borderRight: '1px solid #30363d',
          paddingRight: '8px',
        }}
      >
        {pinnedFavorites.map(fav => (
          <button
            key={fav.id}
            type="button"
            onClick={() => onOpenApp(fav.id)}
            style={{
              padding: '4px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
            title={`Quick Launch: ${fav.name}`}
            data-testid={`quick-launch-${fav.id}`}
          >
            {fav.icon}
          </button>
        ))}
      </div>

      {/* Open Applications Tabs */}
      <div
        className="taskbar-apps-container"
        role="tablist"
        aria-label="Open Applications"
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          overflowX: 'auto',
        }}
      >
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
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                backgroundColor: isActive ? '#1f6feb33' : '#21262d',
                border: isActive ? '1px solid #1f6feb' : '1px solid #30363d',
                borderRadius: '4px',
                color: isActive ? '#fff' : '#8b949e',
                cursor: 'pointer',
                fontSize: '0.78rem',
                maxWidth: '160px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{win.icon}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{win.title}</span>
            </button>
          );
        })}
      </div>

      {/* System Tray (Network, Audio, Power, Clock, Stand Up) */}
      <div
        className="taskbar-tray"
        data-testid="taskbar-tray"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.75rem',
          color: '#8b949e',
        }}
      >
        {/* Virtual Network Status */}
        <div
          title="Simulated Virtual Subnet: 10.0.4.15/24 (eth0: Online, 100% In-Game)"
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <span style={{ color: '#3fb950' }}>●</span>
          <span style={{ fontFamily: 'monospace' }}>10.0.4.15</span>
        </div>

        {/* Audio / Volume Indicator */}
        <span title="Workstation Audio: 80%">🔊</span>

        {/* AC Power Indicator */}
        <span title="AC Power: Connected (100%)">⚡</span>

        {/* Notifications Indicator */}
        <span
          title="Security Notifications (2 new incident alerts)"
          style={{
            cursor: 'pointer',
            backgroundColor: '#21262d',
            padding: '2px 6px',
            borderRadius: '10px',
            color: '#f0883e',
            fontWeight: 600,
          }}
        >
          🔔 2
        </span>

        {/* Simulation Clock */}
        <div
          className="tray-clock"
          title={`Authoritative Simulation Clock: ${simulationDateString}`}
          data-testid="tray-simulation-clock"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            lineHeight: '1.2',
          }}
        >
          <span style={{ color: '#e6edf3', fontWeight: 600 }}>{simulationTimeString}</span>
          <span style={{ fontSize: '0.65rem' }}>{simulationDateString}</span>
        </div>

        {/* Return to 3D World Button */}
        <button
          type="button"
          className="btn-tray-exit"
          onClick={onExitDesktop}
          aria-label="Exit Virtual Desktop and return to 3D world"
          title="Exit Virtual Desktop [Esc]"
          data-testid="btn-tray-exit"
          style={{
            padding: '4px 10px',
            backgroundColor: '#21262d',
            border: '1px solid #30363d',
            borderRadius: '4px',
            color: '#f85149',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>⏏</span>
          <span>Stand Up</span>
        </button>
      </div>
    </footer>
  );
};
