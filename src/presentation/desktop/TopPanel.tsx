/**
 * Cyberlife — Heron OS Top Panel Component
 *
 * MATE/GTK inspired classical security desktop panel:
 * - Left: Applications, Places, System dropdown menus
 * - Quick Launchers: Terminal, Notes, Field Guide, System Info
 * - Center/Middle: Running windows task list with active state indicators
 * - Right Tray: Network, Volume, Power, authoritative simulation clock, and Session menu
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppId, WindowState } from './types';
import { OsIcon, OsIconName } from './icons/OsIcons';
import { OS_NAME } from './osBranding';

export interface TopPanelProps {
  windows: Record<AppId, WindowState>;
  activeWindowId: AppId | null;
  simulationTime: string;
  onOpenApp: (appId: AppId) => void;
  onToggleMinimize: (appId: AppId) => void;
  onFocusWindow: (appId: AppId) => void;
  onExitDesktop: () => void;
  onPeekOut?: () => void;
  isPeekAvailable?: boolean;
}

type MenuType = 'applications' | 'places' | 'system' | 'user' | null;

export const TopPanel: React.FC<TopPanelProps> = ({
  windows,
  activeWindowId,
  simulationTime,
  onOpenApp,
  onToggleMinimize,
  onFocusWindow,
  onExitDesktop,
  onPeekOut,
  isPeekAvailable = false,
}) => {
  const [openMenu, setOpenMenu] = useState<MenuType>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openMenu) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openMenu]);

  const toggleMenu = useCallback((menu: MenuType) => {
    setOpenMenu(prev => (prev === menu ? null : menu));
  }, []);

  const openWindows = (Object.keys(windows) as AppId[])
    .map(id => windows[id])
    .filter(w => w.isOpen);

  return (
    <header
      ref={panelRef}
      className="heron-top-panel"
      data-testid="desktop-taskbar"
      role="banner"
      aria-label="Heron OS Desktop Panel"
      style={{
        height: '30px',
        minHeight: '30px',
        backgroundColor: 'rgba(12, 19, 31, 0.96)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 6px',
        gap: '4px',
        zIndex: 6000,
        userSelect: 'none',
        fontSize: '12px',
        color: '#f8fafc',
        position: 'relative',
      }}
    >
      {/* OS Brand Icon & Applications Menu */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className={`panel-menu-btn ${openMenu === 'applications' ? 'menu-open' : ''}`}
          onClick={() => toggleMenu('applications')}
          aria-expanded={openMenu === 'applications'}
          aria-haspopup="true"
          data-testid="btn-start-launcher"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '3px 8px',
            backgroundColor:
              openMenu === 'applications' ? 'rgba(0, 229, 255, 0.18)' : 'transparent',
            border: 'none',
            borderRadius: '3px',
            color: openMenu === 'applications' ? '#00e5ff' : '#f8fafc',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 600,
          }}
        >
          <OsIcon name="osLogo" size={14} color="#00e5ff" />
          <span>Applications</span>
        </button>

        {/* Applications Dropdown Menu */}
        {openMenu === 'applications' && (
          <div
            className="panel-dropdown-menu"
            data-testid="desktop-start-menu"
            role="menu"
            aria-label="Applications Menu"
            style={{
              position: 'absolute',
              top: '28px',
              left: 0,
              width: '260px',
              backgroundColor: '#0c131f',
              border: '1px solid #1e293b',
              borderRadius: '4px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 229, 255, 0.2)',
              padding: '6px 0',
              zIndex: 7000,
            }}
          >
            <div
              style={{
                padding: '4px 12px 2px',
                fontSize: '10px',
                color: '#64748b',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              CYBERSECURITY & FORENSICS
            </div>
            {[
              { id: 'terminal', title: `${OS_NAME} Terminal`, icon: 'terminal' },
              { id: 'packetLens', title: 'Packet Lens Analyzer', icon: 'packetLens' },
              { id: 'revLens', title: 'Rev Lens Disassembler', icon: 'revLens' },
              { id: 'ruleTuner', title: 'Rule Tuner (Suricata/Snort)', icon: 'ruleTuner' },
              { id: 'incident', title: 'Incident Response Portal', icon: 'incident' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                data-testid={`start-menu-item-${item.id}`}
                onClick={() => {
                  onOpenApp(item.id as AppId);
                  setOpenMenu(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.12)')
                }
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <OsIcon name={item.icon as OsIconName} size={14} color="#00e5ff" />
                <span>{item.title}</span>
              </button>
            ))}

            <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '4px 0' }} />

            <div
              style={{
                padding: '4px 12px 2px',
                fontSize: '10px',
                color: '#64748b',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              UTILITIES & SYSTEM
            </div>
            {[
              { id: 'fieldGuide', title: 'Cyberlife Field Guide', icon: 'fieldGuide' },
              { id: 'notes', title: 'Security Memo & Notes', icon: 'notes' },
              { id: 'files', title: `${OS_NAME} File Manager`, icon: 'files' },
              { id: 'systemInfo', title: 'System Information', icon: 'systemInfo' },
              { id: 'activity', title: 'Activity Telemetry', icon: 'activity' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                data-testid={`start-menu-item-${item.id}`}
                onClick={() => {
                  onOpenApp(item.id as AppId);
                  setOpenMenu(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.12)')
                }
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <OsIcon name={item.icon as OsIconName} size={14} color="#00e676" />
                <span>{item.title}</span>
              </button>
            ))}

            <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '4px 0' }} />

            <div
              style={{
                padding: '4px 12px 2px',
                fontSize: '10px',
                color: '#64748b',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              OPERATIONS
            </div>
            {[
              { id: 'career', title: 'Career Hub & Ledger', icon: 'career' },
              { id: 'saveManager', title: 'Save File Manager', icon: 'saveManager' },
              { id: 'catalogue', title: 'Cyber Concept Catalogue', icon: 'catalogue' },
              { id: 'helpCenter', title: 'Help & Knowledge Center', icon: 'helpCenter' },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                data-testid={`start-menu-item-${item.id}`}
                onClick={() => {
                  onOpenApp(item.id as AppId);
                  setOpenMenu(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.12)')
                }
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <OsIcon name={item.icon as OsIconName} size={14} color="#38bdf8" />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Places Menu */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className={`panel-menu-btn ${openMenu === 'places' ? 'menu-open' : ''}`}
          onClick={() => toggleMenu('places')}
          aria-expanded={openMenu === 'places'}
          aria-haspopup="true"
          style={{
            padding: '3px 8px',
            backgroundColor: openMenu === 'places' ? 'rgba(0, 229, 255, 0.18)' : 'transparent',
            border: 'none',
            borderRadius: '3px',
            color: openMenu === 'places' ? '#00e5ff' : '#f8fafc',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          Places
        </button>

        {openMenu === 'places' && (
          <div
            className="panel-dropdown-menu"
            role="menu"
            aria-label="Places Menu"
            style={{
              position: 'absolute',
              top: '28px',
              left: 0,
              width: '200px',
              backgroundColor: '#0c131f',
              border: '1px solid #1e293b',
              borderRadius: '4px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 229, 255, 0.2)',
              padding: '6px 0',
              zIndex: 7000,
            }}
          >
            {[
              { title: 'Home Folder (/home/analyst)', icon: 'home' },
              { title: 'Documents', icon: 'documents' },
              { title: 'Downloads', icon: 'downloads' },
              { title: 'Forensic Vault (/mnt/evidence)', icon: 'folder' },
            ].map((place, idx) => (
              <button
                key={idx}
                type="button"
                role="menuitem"
                onClick={() => {
                  onOpenApp('files');
                  setOpenMenu(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  width: '100%',
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
                onMouseEnter={e =>
                  (e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.12)')
                }
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <OsIcon name={place.icon as OsIconName} size={14} color="#00e5ff" />
                <span>{place.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* System Menu */}
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          className={`panel-menu-btn ${openMenu === 'system' ? 'menu-open' : ''}`}
          onClick={() => toggleMenu('system')}
          aria-expanded={openMenu === 'system'}
          aria-haspopup="true"
          style={{
            padding: '3px 8px',
            backgroundColor: openMenu === 'system' ? 'rgba(0, 229, 255, 0.18)' : 'transparent',
            border: 'none',
            borderRadius: '3px',
            color: openMenu === 'system' ? '#00e5ff' : '#f8fafc',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          System
        </button>

        {openMenu === 'system' && (
          <div
            className="panel-dropdown-menu"
            role="menu"
            aria-label="System Menu"
            style={{
              position: 'absolute',
              top: '28px',
              left: 0,
              width: '190px',
              backgroundColor: '#0c131f',
              border: '1px solid #1e293b',
              borderRadius: '4px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 229, 255, 0.2)',
              padding: '6px 0',
              zIndex: 7000,
            }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onOpenApp('systemInfo');
                setOpenMenu(null);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#cbd5e1',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.12)')
              }
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <OsIcon name="systemInfo" size={14} color="#00e5ff" />
              <span>System Information</span>
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => setOpenMenu(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#94a3b8',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.12)')
              }
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <OsIcon name="lock" size={14} color="#64748b" />
              <span>Lock Screen (Active)</span>
            </button>

            <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '4px 0' }} />

            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpenMenu(null);
                onExitDesktop();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '6px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#f87171',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '12px',
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)')
              }
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <OsIcon name="power" size={14} color="#ef4444" />
              <span>Exit Workstation [Esc]</span>
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          width: '1px',
          height: '18px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          margin: '0 4px',
        }}
      />

      {/* Quick Launchers */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
        {[
          { id: 'terminal', title: 'Terminal', icon: 'terminal' },
          { id: 'notes', title: 'Notes', icon: 'notes' },
          { id: 'fieldGuide', title: 'Field Guide', icon: 'fieldGuide' },
          { id: 'systemInfo', title: 'System Info', icon: 'systemInfo' },
        ].map(launcher => (
          <button
            key={launcher.id}
            type="button"
            title={`Launch ${launcher.title}`}
            onClick={() => onOpenApp(launcher.id as AppId)}
            style={{
              padding: '3px 5px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '3px',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.color = '#00e5ff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <OsIcon name={launcher.icon as OsIconName} size={15} color="currentColor" />
          </button>
        ))}
      </div>

      <div
        style={{
          width: '1px',
          height: '18px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          margin: '0 4px',
        }}
      />

      {/* Running Windows Task Strip */}
      <div
        className="heron-window-strip"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flex: 1,
          overflowX: 'auto',
          padding: '0 4px',
        }}
      >
        {openWindows.map(win => {
          const isActive = activeWindowId === win.id && !win.isMinimized;
          const iconName =
            typeof win.icon === 'string' &&
            win.icon in
              {
                terminal: 1,
                fieldGuide: 1,
                systemInfo: 1,
                notes: 1,
                activity: 1,
                incident: 1,
                contacts: 1,
                career: 1,
                saveManager: 1,
                helpCenter: 1,
                catalogue: 1,
                files: 1,
                packetLens: 1,
                revLens: 1,
                ruleTuner: 1,
              }
              ? (win.icon as OsIconName)
              : undefined;

          return (
            <button
              key={win.id}
              type="button"
              onClick={() => {
                if (isActive) {
                  onToggleMinimize(win.id);
                } else {
                  onFocusWindow(win.id);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '2px 8px',
                height: '24px',
                backgroundColor: isActive
                  ? 'rgba(0, 229, 255, 0.18)'
                  : win.isMinimized
                    ? 'rgba(15, 23, 42, 0.4)'
                    : 'rgba(255, 255, 255, 0.04)',
                border: isActive
                  ? '1px solid rgba(0, 229, 255, 0.45)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '3px',
                color: isActive ? '#00e5ff' : win.isMinimized ? '#64748b' : '#cbd5e1',
                cursor: 'pointer',
                fontSize: '11px',
                maxWidth: '180px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {iconName ? <OsIcon name={iconName} size={13} color="currentColor" /> : win.icon}
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {win.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Right Side System Tray */}
      <div
        className="heron-panel-tray"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: 'auto',
          paddingLeft: '8px',
        }}
      >
        {/* Network status */}
        <span
          title="Virtual Subnet 10.0.4.15/24 (Connected)"
          style={{ display: 'flex', alignItems: 'center', color: '#00e676', cursor: 'help' }}
        >
          <OsIcon name="network" size={14} color="#00e676" />
        </span>

        {/* Volume */}
        <span
          title="Audio Output: Stereo Balanced"
          style={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}
        >
          <OsIcon name="volume" size={14} color="#94a3b8" />
        </span>

        {/* Battery / AC */}
        <span
          title="AC Power Line Connected (100%)"
          style={{ display: 'flex', alignItems: 'center', color: '#00e5ff' }}
        >
          <OsIcon name="battery" size={14} color="#00e5ff" />
        </span>

        {/* Authoritative Simulation Clock */}
        <span
          className="top-clock"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            color: '#f8fafc',
            fontWeight: 600,
            padding: '1px 6px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '3px',
          }}
        >
          {simulationTime}
        </span>

        {/* Optional Peek Out Button */}
        {isPeekAvailable && onPeekOut && (
          <button
            type="button"
            className="btn-peek-workstation"
            onClick={onPeekOut}
            aria-label="Peek out to seated over-the-shoulder view"
            data-testid="btn-peek-workstation-top"
            style={{
              padding: '2px 6px',
              fontSize: '11px',
              backgroundColor: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              color: '#38bdf8',
              borderRadius: '3px',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            Peek Out [Tab]
          </button>
        )}

        {/* Exit Workstation button */}
        <button
          type="button"
          className="btn-exit-workstation"
          onClick={onExitDesktop}
          aria-label="Exit Workstation and stand up"
          data-testid="btn-tray-exit"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '2px 8px',
            fontSize: '11px',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            borderRadius: '3px',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          <OsIcon name="power" size={12} color="#fca5a5" />
          <span>Exit [Esc]</span>
        </button>
      </div>
    </header>
  );
};
