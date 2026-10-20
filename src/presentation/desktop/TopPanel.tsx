/**
 * Cyberlife — Heron OS Top Panel Component
 *
 * Classical MATE/ParrotSec-inspired Linux cybersecurity desktop panel:
 * - Left: Cascading multi-level Applications menu (Heron Security -> Categories -> Tools)
 * - Places & System dropdown menus
 * - Quick Launchers: Terminal, Tor Browser, OnionChat, Files, Packet Lens
 * - Running Windows Task list
 * - Right Tray: CPU & RAM live resource graphs (MATE System Monitor Applet),
 *   Network status, Volume, Simulation Clock, and Exit Workstation
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

type MenuType = 'applications' | 'places' | 'system' | null;

// Parrot-style categorized security arsenal
interface SecuritySubCategory {
  id: string;
  label: string;
  tools: Array<{ id: AppId; name: string; icon: OsIconName; desc: string }>;
}

const HERON_SECURITY_CATEGORIES: SecuritySubCategory[] = [
  {
    id: 'most_used',
    label: 'Most Used Tools',
    tools: [
      {
        id: 'terminal',
        name: 'Heron Terminal',
        icon: 'terminal',
        desc: 'Synthetic interactive shell',
      },
      { id: 'torBrowser', name: 'Tor Browser', icon: 'tor', desc: 'Onion dark web gateway' },
      {
        id: 'onionChat',
        name: 'OnionChat & VoIP',
        icon: 'chat',
        desc: 'Encrypted Linux messenger',
      },
      {
        id: 'packetLens',
        name: 'Packet Lens',
        icon: 'packetLens',
        desc: 'Network protocol decoder',
      },
    ],
  },
  {
    id: 'info_gathering',
    label: 'Information Gathering',
    tools: [
      {
        id: 'terminal',
        name: 'Terminal Recon (nmap/netstat)',
        icon: 'terminal',
        desc: 'Port scanner & inventory',
      },
      {
        id: 'catalogue',
        name: 'Recon Knowledge Base',
        icon: 'catalogue',
        desc: 'Attack surface scoping',
      },
    ],
  },
  {
    id: 'vuln_analysis',
    label: 'Vulnerability Analysis',
    tools: [
      {
        id: 'packetLens',
        name: 'Packet Lens Analyzer',
        icon: 'packetLens',
        desc: 'PCAP stream forensics',
      },
      {
        id: 'ruleTuner',
        name: 'Rule Tuner (Suricata/Snort)',
        icon: 'ruleTuner',
        desc: 'Detection rule tuning',
      },
    ],
  },
  {
    id: 'web_apps',
    label: 'Web Application Analysis',
    tools: [
      {
        id: 'torBrowser',
        name: 'Tor Browser (.onion)',
        icon: 'tor',
        desc: 'Underground web inspection',
      },
      {
        id: 'fieldGuide',
        name: 'Field Guide — Web Security',
        icon: 'fieldGuide',
        desc: 'Web exploit principles',
      },
    ],
  },
  {
    id: 'exploitation',
    label: 'Exploitation Tools',
    tools: [
      {
        id: 'terminal',
        name: 'Terminal Shell & Payloads',
        icon: 'terminal',
        desc: 'PoC & hash cracking',
      },
      {
        id: 'torBrowser',
        name: 'CipherMarket Escrow',
        icon: 'tor',
        desc: 'Underground exploit broker',
      },
    ],
  },
  {
    id: 'forensics',
    label: 'Digital Forensics & Reverse',
    tools: [
      {
        id: 'revLens',
        name: 'Rev Lens Disassembler',
        icon: 'revLens',
        desc: 'Static binary analyzer',
      },
      {
        id: 'incident',
        name: 'Incident Response Portal',
        icon: 'incident',
        desc: 'Aster Incident workflow',
      },
      {
        id: 'files',
        name: 'Evidence Filesystem (/mnt)',
        icon: 'files',
        desc: 'Forensic artifacts storage',
      },
    ],
  },
  {
    id: 'anonymity',
    label: 'Anon Surf & Dark Web',
    tools: [
      {
        id: 'torBrowser',
        name: 'Tor Browser — Onion Network',
        icon: 'tor',
        desc: 'Multi-hop anonymity',
      },
      {
        id: 'onionChat',
        name: 'OnionChat Encrypted Line',
        icon: 'chat',
        desc: 'ZRTP VoIP & PGP chat',
      },
    ],
  },
];

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
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>('most_used');

  const panelRef = useRef<HTMLDivElement | null>(null);
  const canvasMonitorRef = useRef<HTMLCanvasElement | null>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
        setActiveSubMenu(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && openMenu) {
        setOpenMenu(null);
        setActiveSubMenu(null);
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
    setActiveSubMenu(null);
  }, []);

  // MATE System Monitor Applet (live oscillating CPU & RAM bars)
  useEffect(() => {
    const canvas = canvasMonitorRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const cpuHistory = [22, 28, 35, 18, 42, 29, 31, 24, 28, 38, 20, 26, 32, 27, 25];
    const ramHistory = [41, 42, 42, 43, 42, 43, 44, 43, 43, 42, 43, 43, 44, 43, 43];

    const renderMonitor = () => {
      step++;
      if (step % 20 === 0) {
        cpuHistory.shift();
        cpuHistory.push(Math.floor(18 + Math.random() * 28));
        ramHistory.shift();
        ramHistory.push(Math.floor(41 + Math.random() * 4));
      }

      ctx.fillStyle = '#060a12';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 9);
      ctx.lineTo(canvas.width, 9);
      ctx.stroke();

      // Draw CPU line (Green)
      ctx.strokeStyle = '#00ff66';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < cpuHistory.length; i++) {
        const x = (i / (cpuHistory.length - 1)) * (canvas.width / 2 - 2);
        const val = cpuHistory[i] ?? 25;
        const y = canvas.height - (val / 100) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Divider between CPU and RAM
      ctx.strokeStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.stroke();

      // Draw RAM line (Teal/Cyan)
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < ramHistory.length; i++) {
        const x = canvas.width / 2 + 2 + (i / (ramHistory.length - 1)) * (canvas.width / 2 - 4);
        const val = ramHistory[i] ?? 42;
        const y = canvas.height - (val / 100) * canvas.height;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(renderMonitor);
    };

    renderMonitor();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const openWindows = (Object.keys(windows) as AppId[])
    .map(id => windows[id])
    .filter(w => w.isOpen);

  const selectedCategoryObj = HERON_SECURITY_CATEGORIES.find(c => c.id === activeCategory);

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
        backgroundColor: 'rgba(10, 15, 24, 0.98)',
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

        {/* Level 1: Applications Dropdown Menu */}
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
              width: '240px',
              backgroundColor: '#0c131f',
              border: '1px solid #1e293b',
              borderRadius: '4px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 229, 255, 0.2)',
              padding: '6px 0',
              zIndex: 7000,
            }}
          >
            {/* Top Security Category Highlight */}
            <div
              style={{
                position: 'relative',
                backgroundColor:
                  activeSubMenu === 'security' ? 'rgba(0, 229, 255, 0.16)' : 'transparent',
              }}
              onMouseEnter={() => setActiveSubMenu('security')}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 12px',
                  color: '#00e5ff',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <OsIcon name="osLogo" size={14} color="#00e5ff" />
                  <span>Heron Security</span>
                </div>
                <span>▶</span>
              </div>

              {/* Level 2: Heron Security Categories Flyout */}
              {activeSubMenu === 'security' && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '238px',
                    width: '230px',
                    backgroundColor: '#0c131f',
                    border: '1px solid #1e293b',
                    borderRadius: '4px',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 229, 255, 0.2)',
                    padding: '4px 0',
                    zIndex: 7100,
                  }}
                >
                  {HERON_SECURITY_CATEGORIES.map(cat => (
                    <div
                      key={cat.id}
                      onMouseEnter={() => setActiveCategory(cat.id)}
                      style={{
                        position: 'relative',
                        backgroundColor:
                          activeCategory === cat.id ? 'rgba(0, 229, 255, 0.14)' : 'transparent',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '6px 12px',
                          color: activeCategory === cat.id ? '#00e5ff' : '#cbd5e1',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        <span>{cat.label}</span>
                        <span style={{ fontSize: '10px' }}>▶</span>
                      </div>

                      {/* Level 3: Tools Flyout */}
                      {activeCategory === cat.id && selectedCategoryObj && (
                        <div
                          style={{
                            position: 'absolute',
                            top: 0,
                            left: '228px',
                            width: '220px',
                            backgroundColor: '#090e18',
                            border: '1px solid #1e293b',
                            borderRadius: '4px',
                            boxShadow:
                              '0 10px 30px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(0, 229, 255, 0.25)',
                            padding: '4px 0',
                            zIndex: 7200,
                          }}
                        >
                          <div
                            style={{
                              padding: '4px 10px',
                              fontSize: '10px',
                              color: '#64748b',
                              fontWeight: 700,
                            }}
                          >
                            {selectedCategoryObj.label.toUpperCase()}
                          </div>
                          {selectedCategoryObj.tools.map(tool => (
                            <button
                              key={tool.name}
                              type="button"
                              onClick={() => {
                                onOpenApp(tool.id);
                                setOpenMenu(null);
                                setActiveSubMenu(null);
                              }}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                width: '100%',
                                padding: '6px 10px',
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#f8fafc',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '11px',
                              }}
                              onMouseEnter={e =>
                                (e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.15)')
                              }
                              onMouseLeave={e =>
                                (e.currentTarget.style.backgroundColor = 'transparent')
                              }
                            >
                              <OsIcon name={tool.icon} size={14} color="#00e5ff" />
                              <div>
                                <div style={{ fontWeight: 600 }}>{tool.name}</div>
                                <div style={{ fontSize: '9px', color: '#94a3b8' }}>{tool.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '4px 0' }} />

            {/* Standard Desktop Applications */}
            {[
              { id: 'torBrowser', title: 'Tor Browser (.onion)', icon: 'tor', cat: 'Internet' },
              { id: 'onionChat', title: 'OnionChat & VoIP', icon: 'chat', cat: 'Internet' },
              { id: 'files', title: `${OS_NAME} File Manager`, icon: 'files', cat: 'System' },
              { id: 'notes', title: 'Security Notes & Memo', icon: 'notes', cat: 'Accessories' },
              {
                id: 'fieldGuide',
                title: 'Cyberlife Field Guide',
                icon: 'fieldGuide',
                cat: 'Documentation',
              },
              { id: 'systemInfo', title: 'System Information', icon: 'systemInfo', cat: 'System' },
              { id: 'activity', title: 'Activity Telemetry', icon: 'activity', cat: 'System' },
              { id: 'career', title: 'Career Hub & Ledger', icon: 'career', cat: 'Operations' },
              {
                id: 'saveManager',
                title: 'Save File Manager',
                icon: 'saveManager',
                cat: 'Operations',
              },
            ].map(item => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                data-testid={`start-menu-item-${item.id}`}
                onClick={() => {
                  onOpenApp(item.id as AppId);
                  setOpenMenu(null);
                  setActiveSubMenu(null);
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
                onMouseEnter={e => {
                  setActiveSubMenu(null);
                  e.currentTarget.style.backgroundColor = 'rgba(0, 229, 255, 0.12)';
                }}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <OsIcon name={item.icon as OsIconName} size={14} color="#cbd5e1" />
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
              width: '210px',
              backgroundColor: '#0c131f',
              border: '1px solid #1e293b',
              borderRadius: '4px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 229, 255, 0.2)',
              padding: '6px 0',
              zIndex: 7000,
            }}
          >
            {[
              { name: 'Home Folder (/home/analyst)', icon: 'folder' },
              { name: 'Downloads (/downloads)', icon: 'folder' },
              { name: 'Evidence Vault (/mnt/evidence)', icon: 'folder' },
              { name: 'System Logs (/var/log)', icon: 'folder' },
            ].map(place => (
              <button
                key={place.name}
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
                <OsIcon name="folder" size={14} color="#38bdf8" />
                <span>{place.name}</span>
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
              onClick={() => {
                onOpenApp('helpCenter');
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
              <OsIcon name="helpCenter" size={14} color="#00e5ff" />
              <span>Help Center</span>
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
          { id: 'terminal', title: 'Terminal', icon: 'terminal', color: '#00ff66' },
          { id: 'torBrowser', title: 'Tor Browser', icon: 'tor', color: '#c084fc' },
          { id: 'onionChat', title: 'OnionChat', icon: 'chat', color: '#00e5ff' },
          { id: 'files', title: 'File Manager', icon: 'files', color: '#38bdf8' },
          { id: 'packetLens', title: 'Packet Lens', icon: 'packetLens', color: '#38bdf8' },
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
              e.currentTarget.style.color = launcher.color;
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

      {/* Running Windows Task Strip in top panel */}
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
          const iconName = typeof win.icon === 'string' ? (win.icon as OsIconName) : undefined;

          return (
            <button
              key={win.id}
              type="button"
              className={`window-tab-btn ${isActive ? 'tab-active' : ''} ${win.isMinimized ? 'tab-minimized' : ''}`}
              onClick={() => {
                if (isActive) onToggleMinimize(win.id);
                else onFocusWindow(win.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                maxWidth: '170px',
                height: '22px',
                backgroundColor: isActive
                  ? 'rgba(0, 229, 255, 0.18)'
                  : win.isMinimized
                    ? 'rgba(255, 255, 255, 0.03)'
                    : 'rgba(255, 255, 255, 0.06)',
                border: isActive
                  ? '1px solid rgba(0, 229, 255, 0.45)'
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

      {/* Right Tray */}
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
        {/* MATE System Monitor Applet (CPU / RAM graphs) */}
        <div
          title="MATE System Monitor — CPU (Green) & RAM (Cyan) Telemetry"
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#060a12',
            border: '1px solid #1e293b',
            borderRadius: '2px',
            padding: '1px',
            cursor: 'help',
          }}
        >
          <canvas ref={canvasMonitorRef} width={44} height={18} style={{ display: 'block' }} />
        </div>

        {/* Network status */}
        <span
          title="Virtual Subnet 10.0.4.15/24 (Tor Circuit Ready)"
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

        {/* Simulation Clock */}
        <span
          className="top-clock"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '11px',
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
