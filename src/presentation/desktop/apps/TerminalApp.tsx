/**
 * Cyberlife — Terminal Application Component (Orion OS Security Edition)
 *
 * Provides a classical two-line signature prompt:
 * ┌─[user@host]─[dir]
 * └──╼ $ command
 *
 * Features:
 * - Direct inline input at the prompt line with terminal typography
 * - Tab completion for simulated commands
 * - Command history navigation (Up/Down)
 * - Ctrl+L clear screen, Ctrl+C interrupt
 * - Sandboxed execution via TerminalCommandParser with zero host escape
 * - Colorized tokens for user, host, path, status, and error output
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createDefaultTerminalParser, TerminalExecutionContext } from '@/simulation/cyber/terminal';
import { interceptTerminalCommand } from '@/simulation/cyber/trace/commandInterceptor';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { OS_NAME, OS_VERSION, OS_BRANDING, HOSTNAMES, KERNEL_STRING } from '../osBranding';
import { OsIcon } from '../icons/OsIcons';
import { sfxController } from '../../audio/SfxController';

export interface TerminalEntry {
  id: string;
  command: string;
  directory?: string;
  stdout: string[];
  stderr?: string[];
  isError?: boolean;
  timestamp: string;
}

export interface TerminalTab {
  id: string;
  title: string;
  currentDirectory: string;
  entries: TerminalEntry[];
  history: string[];
  historyIndex: number;
  inputVal: string;
}

export interface TerminalAppProps {
  workstationId?: string;
  initialEntries?: TerminalEntry[];
  onTyping?: () => void;
  onTerminalOutput?: (lines: string[]) => void;
}

const KNOWN_COMMANDS = [
  'help',
  'whoami',
  'date',
  'status',
  'pwd',
  'ls',
  'cd',
  'cat',
  'grep',
  'file',
  'nmap',
  'packetview',
  'revview',
  'netmap',
  'svcscan',
  'logview',
  'evidence',
  'redteam',
  'bounty',
  'forensics',
  'soctriage',
  'complianceaudit',
  'trace',
];

function formatDirForPrompt(dir: string): string {
  if (dir === '/home/analyst') return '~';
  if (dir.startsWith('/home/analyst/')) return '~' + dir.slice('/home/analyst'.length);
  return dir;
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  workstationId = 'interact_cedarline_workstation',
  initialEntries,
  onTyping,
  onTerminalOutput,
}) => {
  const sim = useOptionalSimulation();
  const parser = useMemo(() => createDefaultTerminalParser(), []);

  const defaultWelcomeGreeting: TerminalEntry[] = useMemo(() => {
    if (initialEntries && initialEntries.length > 0) return initialEntries;

    return [
      {
        id: 'init-1',
        command: '',
        stdout: [
          `${OS_BRANDING.bannerHeader}`,
          `Kernel: Linux ${KERNEL_STRING} // Cluster: Lagos Marina Subnet`,
          'Safety Boundary: 100% simulated sandbox. Zero host OS execution.',
          '',
          "Type 'help' to view available simulated commands.",
          "Type 'pwd', 'ls -l', 'cd', or 'cat' to explore the virtual filesystem.",
          "Try aliases: 'nmap hosts', 'packetview', or 'revview strings'.",
        ],
        timestamp: '08:00 AM',
      },
    ];
  }, [initialEntries]);

  // Multi-tab state
  const [tabs, setTabs] = useState<TerminalTab[]>([
    {
      id: 'tab-1',
      title: 'bash: ~',
      currentDirectory: '/home/analyst',
      entries: defaultWelcomeGreeting,
      history: [],
      historyIndex: -1,
      inputVal: '',
    },
  ]);
  const [activeTabId, setActiveTabId] = useState<string>('tab-1');

  const activeTab = useMemo(() => {
    return tabs.find(t => t.id === activeTabId) ?? tabs[0]!;
  }, [tabs, activeTabId]);

  const terminalScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll on new entry within the active tab
  useEffect(() => {
    if (terminalScrollAreaRef.current) {
      terminalScrollAreaRef.current.scrollTop = terminalScrollAreaRef.current.scrollHeight;
    }
  }, [activeTab.entries, activeTab.inputVal]);

  // Refocus input whenever tab changes
  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, [activeTabId]);

  // GTK Top Menu Bar State
  const [openGtkMenu, setOpenGtkMenu] = useState<
    'file' | 'edit' | 'view' | 'search' | 'terminal' | 'help' | null
  >(null);

  useEffect(() => {
    const handleCloseGtk = () => setOpenGtkMenu(null);
    if (openGtkMenu) {
      window.addEventListener('click', handleCloseGtk);
      return () => window.removeEventListener('click', handleCloseGtk);
    }
  }, [openGtkMenu]);

  const isCedarline = workstationId.includes('cedarline');
  const activeUser = isCedarline ? 'protector' : 'player';
  const activeHost = isCedarline ? HOSTNAMES.office : HOSTNAMES.home;

  const buildContext = useCallback(
    (dir: string, history: string[]): TerminalExecutionContext => {
      const calendar = sim?.state.time.calendar ?? {
        timeString: '08:00 AM',
        dateString: 'Monday, Oct 12, 2026',
        iso: '2026-10-12T08:00:00.000Z',
        year: 2026,
        month: 10,
        day: 12,
        hour: 8,
        minute: 0,
        second: 0,
        dayOfWeek: 'Monday',
      };

      return {
        simulationTime: calendar,
        currentDirectory: dir,
        currentUser: isCedarline
          ? {
            username: 'protector',
            displayName: 'Protector',
            role: 'Security Analyst Intern',
            organization: 'Cedarline Services: Marina Tower',
          }
          : {
            username: 'protector',
            displayName: 'Protector',
            role: 'Independent Security Researcher',
            organization: 'Home Rig: Broad Street 14',
          },
        workstation: isCedarline
          ? {
            id: workstationId,
            hostname: 'cedarline-sec-ws04.corp.local',
            osVersion: `${OS_NAME} v${OS_VERSION} [Simulated Sandboxed Kernel]`,
            ipAddress: '10.0.4.15',
            subnet: '255.255.255.0',
            status: 'Operational (Synthetic Enterprise Subnet)',
            locationId: 'cedarline_interior',
          }
          : {
            id: workstationId,
            hostname: 'lagos-rig-dev01.local',
            osVersion: `${OS_NAME} v${OS_VERSION} [Home Rig]`,
            ipAddress: '192.168.1.104',
            subnet: '255.255.255.0',
            status: 'Operational (Simulated Local Rig)',
            locationId: 'apartment_interior',
          },
        history,
        traceState: sim?.state.trace,
        dispatchCommand: sim?.dispatch,
      };
    },
    [sim, workstationId, isCedarline]
  );

  const handleNewTab = () => {
    if (tabs.length >= 6) return;
    const newTabNumber = tabs.length + 1;
    const newTabId = `tab-${Date.now()}`;
    const newTab: TerminalTab = {
      id: newTabId,
      title: `bash (${newTabNumber}): ~`,
      currentDirectory: '/home/analyst',
      entries: [
        {
          id: `tab-init-${Date.now()}`,
          command: '',
          stdout: [
            `${OS_NAME} Terminal Tab ${newTabNumber} initialized.`,
            `Working directory: /home/analyst`,
            "Type 'help' for commands.",
          ],
          timestamp: sim?.state.time.calendar.timeString ?? '08:00 AM',
        },
      ],
      history: [],
      historyIndex: -1,
      inputVal: '',
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTabId);
  };

  const handleCloseTab = (tabIdToClose: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;

    const remaining = tabs.filter(t => t.id !== tabIdToClose);
    setTabs(remaining);
    if (activeTabId === tabIdToClose) {
      setActiveTabId(remaining[remaining.length - 1]!.id);
    }
  };

  const handleExecute = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    sfxController.playTerminalEnter();

    const ctx = buildContext(activeTab.currentDirectory, activeTab.history);
    const interception = interceptTerminalCommand(trimmed, ctx);

    if (interception.shouldBlock && interception.blockingLines) {
      const entry: TerminalEntry = {
        id: `entry-${Date.now()}`,
        command: trimmed,
        stdout: interception.blockingLines,
        isError: true,
        timestamp: sim?.state.time.calendar.timeString ?? '08:00 AM',
      };
      setTabs(prev =>
        prev.map(t =>
          t.id === activeTab.id
            ? {
                ...t,
                entries: [...t.entries, entry],
                history: [...t.history, trimmed],
                historyIndex: -1,
                inputVal: '',
              }
            : t
        )
      );
      onTerminalOutput?.(interception.blockingLines);
      return;
    }

    const commandToRun = interception.cleanedCommand ?? trimmed;
    const result = parser.parseAndExecute(commandToRun, ctx);

    const nextHistory = [...activeTab.history, trimmed];
    const nextDir = result.newDirectory ? result.newDirectory : activeTab.currentDirectory;
    const nextTitle = `bash: ${formatDirForPrompt(nextDir)}`;

    if (result.clearScreen) {
      setTabs(prev =>
        prev.map(t =>
          t.id === activeTab.id
            ? {
              ...t,
              entries: [],
              inputVal: '',
              history: nextHistory,
              historyIndex: -1,
            }
            : t
        )
      );
      onTerminalOutput?.([]);
      return;
    }

    const firstToken = trimmed.split(/\s+/)[0]?.toLowerCase();
    const guidedStdout = [...result.stdout];
    if (!result.isError && firstToken) {
      if (firstToken === 'netmap' || firstToken === 'nmap') {
        guidedStdout.push('');
        guidedStdout.push('  [✓] OBJECTIVE COMPLETED: Identify Active Corporate Subnet Nodes');
        guidedStdout.push("  [→] NEXT STEP: Run 'svcscan inspect <host>' to audit services");
      } else if (firstToken === 'svcscan') {
        guidedStdout.push('');
        guidedStdout.push('  [✓] OBJECTIVE COMPLETED: Audit Exposed Services');
        guidedStdout.push("  [→] NEXT STEP: Run 'logview recent' or 'logview filter --severity=WARN'");
      } else if (firstToken === 'logview') {
        guidedStdout.push('');
        guidedStdout.push('  [✓] OBJECTIVE COMPLETED: Analyze Authentication and Application Logs');
        guidedStdout.push("  [→] NEXT STEP: Inspect artifacts with 'evidence list' and 'evidence inspect EVD-2026-004'");
      } else if (firstToken === 'evidence') {
        guidedStdout.push('');
        guidedStdout.push('  [✓] OBJECTIVE COMPLETED: Inspect & Preserve Forensic Artifacts');
        guidedStdout.push("  [→] NEXT STEP: Open Incident Portal on desktop to submit Root Cause & Contain Aster Service");
        if (sim) {
          const tokens = trimmed.split(/\s+/);
          const subAction = tokens[1]?.toLowerCase();
          const targetId = (tokens[2] || (subAction?.startsWith('evd-') ? subAction : 'EVD-2026-001')).toUpperCase();
          sim.dispatch({
            type: 'RecordInvestigativeEvidence',
            evidenceId: targetId,
            source: 'terminal_evidence_tool',
            title:
              targetId === 'EVD-2026-004'
                ? 'Aster IAM Policy Manifest (role:corporate-admin)'
                : targetId === 'EVD-2026-002'
                ? 'Payroll File Share Access Audit'
                : 'Aster Core Configuration Snapshot',
            description: 'Preserved digital evidence from SOC terminal investigation',
            hash: 'sha256-evd-vault-sealed',
            tags: ['terminal_forensics', 'preserved'],
          });
        }
      } else if (firstToken === 'forensics') {
        guidedStdout.push('');
        guidedStdout.push('  [✓] OBJECTIVE COMPLETED: Digital Forensics Artifact Analysis Complete');
        guidedStdout.push("  [→] NEXT STEP: Run 'forensics report' to file certified disclosure findings");
      } else if (firstToken === 'soctriage') {
        guidedStdout.push('');
        guidedStdout.push('  [✓] OBJECTIVE COMPLETED: SOC Telemetry Triage Action Dispatched');
        guidedStdout.push("  [→] NEXT STEP: Run 'soctriage submit' to commit incident escalation ticket");
      } else if (firstToken === 'complianceaudit') {
        guidedStdout.push('');
        guidedStdout.push('  [✓] OBJECTIVE COMPLETED: Regulatory Compliance Scan Evaluated');
        guidedStdout.push("  [→] NEXT STEP: Run 'complianceaudit sign conditional' to authorize restricted launch");
      }
    }

    const newEntry: TerminalEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      command: trimmed,
      directory: formatDirForPrompt(activeTab.currentDirectory),
      stdout: guidedStdout,
      stderr: result.stderr,
      isError: result.isError,
      timestamp: ctx.simulationTime.timeString,
    };

    if (result.isError) {
      sfxController.playTerminalError();
    } else {
      sfxController.playTerminalSuccess();
    }

    // Update active tab entries & state
    setTabs(prev =>
      prev.map(t =>
        t.id === activeTab.id
          ? {
            ...t,
            title: nextTitle,
            currentDirectory: nextDir,
            entries: [...t.entries, newEntry],
            inputVal: '',
            history: nextHistory,
            historyIndex: -1,
          }
          : t
      )
    );

    onTerminalOutput?.(guidedStdout);

    // If a cyber tool was executed, record cyber activity on the authoritative simulation engine
    if (
      firstToken &&
      [
        'netmap',
        'svcscan',
        'logview',
        'evidence',
        'aster-admin',
        'nmap',
        'packetview',
        'revview',
      ].includes(firstToken)
    ) {
      sim?.dispatch({
        type: 'RecordCyberActivity',
        activityId: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        tool: firstToken,
        action: trimmed.split(/\s+/)[1] ?? 'exec',
        target: trimmed.split(/\s+/)[2],
        summary: `Executed command '${trimmed}' on ${ctx.workstation.hostname}`,
        success: !result.isError,
      });
    }
  };

  // Listen for paste command events dispatched from Incident Report / Guidance chips
  useEffect(() => {
    const handlePasteEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ command: string; execute?: boolean }>;
      const cmd = customEvent.detail?.command;
      if (!cmd) return;

      setTabs(prev =>
        prev.map(t => (t.id === activeTab.id ? { ...t, inputVal: cmd } : t))
      );

      // Focus input field smoothly
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);

      if (customEvent.detail?.execute) {
        handleExecute(cmd);
      }
    };

    window.addEventListener('cyberlife:terminal:paste', handlePasteEvent);
    return () => window.removeEventListener('cyberlife:terminal:paste', handlePasteEvent);
  }, [activeTab.id, handleExecute]);

  const hasExecutedUrlCmdRef = useRef(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && !hasExecutedUrlCmdRef.current) {
      const params = new URLSearchParams(window.location.search);
      const cmd = params.get('cmd') || params.get('runCommand');
      if (cmd) {
        hasExecutedUrlCmdRef.current = true;
        setTimeout(() => {
          handleExecute(cmd);
        }, 150);
      }
    }
  }, [handleExecute]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Stop propagation so 3D world player controller never receives terminal keys
    e.stopPropagation();

    // Trigger typing animation on character and physical workstation hands
    onTyping?.();

    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute(activeTab.inputVal);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const current = activeTab.inputVal.trim();
      if (!current) return;
      const match = KNOWN_COMMANDS.find(c => c.startsWith(current));
      if (match) {
        setTabs(prev => prev.map(t => (t.id === activeTab.id ? { ...t, inputVal: match } : t)));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeTab.history.length === 0) return;

      const nextIndex =
        activeTab.historyIndex === -1
          ? activeTab.history.length - 1
          : Math.max(0, activeTab.historyIndex - 1);

      setTabs(prev =>
        prev.map(t =>
          t.id === activeTab.id
            ? {
              ...t,
              historyIndex: nextIndex,
              inputVal: activeTab.history[nextIndex] ?? '',
            }
            : t
        )
      );
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeTab.history.length === 0 || activeTab.historyIndex === -1) return;

      const nextIndex = activeTab.historyIndex + 1;
      if (nextIndex >= activeTab.history.length) {
        setTabs(prev =>
          prev.map(t =>
            t.id === activeTab.id
              ? {
                ...t,
                historyIndex: -1,
                inputVal: '',
              }
              : t
          )
        );
      } else {
        setTabs(prev =>
          prev.map(t =>
            t.id === activeTab.id
              ? {
                ...t,
                historyIndex: nextIndex,
                inputVal: activeTab.history[nextIndex] ?? '',
              }
              : t
          )
        );
      }
    } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      setTabs(prev => prev.map(t => (t.id === activeTab.id ? { ...t, inputVal: '' } : t)));
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      setTabs(prev => prev.map(t => (t.id === activeTab.id ? { ...t, entries: [] } : t)));
      onTerminalOutput?.([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTabs(prev => prev.map(t => (t.id === activeTab.id ? { ...t, inputVal: val } : t)));
    onTyping?.();
  };

  const promptDir = formatDirForPrompt(activeTab.currentDirectory);

  return (
    <div
      className="terminal-app-container os-theme"
      role="region"
      aria-label="Simulated Terminal Session"
      onClick={() => inputRef.current?.focus({ preventScroll: true })}
      data-testid="terminal-app-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#000000',
        color: '#00ff66',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {/* Classical GTK Menu Bar */}
      <div
        className="terminal-gtk-menubar"
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#070f07',
          borderBottom: '1px solid #002b11',
          padding: '1px 6px',
          gap: '2px',
          fontSize: '11px',
          userSelect: 'none',
          position: 'relative',
          zIndex: 100,
        }}
        onClick={e => e.stopPropagation()}
      >
        {(['file', 'edit', 'view', 'search', 'terminal', 'help'] as const).map(menu => (
          <div key={menu} style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setOpenGtkMenu(openGtkMenu === menu ? null : menu)}
              style={{
                backgroundColor: openGtkMenu === menu ? '#003314' : 'transparent',
                border: 'none',
                color: openGtkMenu === menu ? '#00ff66' : '#94a3b8',
                padding: '2px 7px',
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '11px',
                textTransform: 'capitalize',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {menu}
            </button>

            {openGtkMenu === menu && (
              <div
                style={{
                  position: 'absolute',
                  top: '22px',
                  left: 0,
                  backgroundColor: '#0c131f',
                  border: '1px solid #1e293b',
                  borderRadius: '3px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.85)',
                  padding: '4px 0',
                  minWidth: '160px',
                  zIndex: 200,
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {menu === 'file' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        handleNewTab();
                        setOpenGtkMenu(null);
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '4px 10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      <span>New Tab</span>
                      <span style={{ color: '#64748b' }}>Ctrl+Shift+T</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseTab(activeTabId, {
                          stopPropagation: () => { },
                        } as React.MouseEvent);
                        setOpenGtkMenu(null);
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '4px 10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Close Tab</span>
                      <span style={{ color: '#64748b' }}>Ctrl+Shift+W</span>
                    </button>
                  </>
                )}
                {menu === 'edit' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenGtkMenu(null)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '4px 10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Copy</span>
                      <span style={{ color: '#64748b' }}>Shift+Ctrl+C</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenGtkMenu(null)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '4px 10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Paste</span>
                      <span style={{ color: '#64748b' }}>Shift+Ctrl+V</span>
                    </button>
                  </>
                )}
                {menu === 'view' && (
                  <>
                    <button
                      type="button"
                      onClick={() => setOpenGtkMenu(null)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '4px 10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Zoom In</span>
                      <span style={{ color: '#64748b' }}>Ctrl++</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOpenGtkMenu(null)}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '4px 10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Zoom Out</span>
                      <span style={{ color: '#64748b' }}>Ctrl+-</span>
                    </button>
                  </>
                )}
                {menu === 'search' && (
                  <button
                    type="button"
                    onClick={() => setOpenGtkMenu(null)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '4px 10px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    <span>Find...</span>
                    <span style={{ color: '#64748b' }}>Shift+Ctrl+F</span>
                  </button>
                )}
                {menu === 'terminal' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setTabs(prev =>
                          prev.map(t => (t.id === activeTab.id ? { ...t, entries: [] } : t))
                        );
                        onTerminalOutput?.([]);
                        setOpenGtkMenu(null);
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '4px 10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Clear Output</span>
                      <span style={{ color: '#64748b' }}>Ctrl+L</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setTabs(prev =>
                          prev.map(t =>
                            t.id === activeTab.id ? { ...t, entries: defaultWelcomeGreeting } : t
                          )
                        );
                        setOpenGtkMenu(null);
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '4px 10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#f8fafc',
                        fontSize: '11px',
                        cursor: 'pointer',
                      }}
                    >
                      <span>Reset Terminal</span>
                    </button>
                  </>
                )}
                {menu === 'help' && (
                  <button
                    type="button"
                    onClick={() => {
                      handleExecute('help');
                      setOpenGtkMenu(null);
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '4px 10px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#f8fafc',
                      fontSize: '11px',
                      cursor: 'pointer',
                    }}
                  >
                    <span>About Orion Terminal</span>
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Multi-Tab Bar */}
      <div
        className="terminal-tab-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#050a05',
          borderBottom: '1px solid #002b11',
          padding: '2px 4px 0 4px',
          gap: '2px',
          userSelect: 'none',
        }}
      >
        {tabs.map((tab, idx) => {
          const isActive = tab.id === activeTabId;
          return (
            <div
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                backgroundColor: isActive ? '#000000' : '#030803',
                color: isActive ? '#00ff66' : '#008833',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
                border: isActive ? '1px solid #004d1f' : '1px solid #00220a',
                borderBottom: isActive ? '1px solid #000000' : '1px solid #002b11',
                cursor: 'pointer',
                fontSize: '0.73rem',
                fontFamily: "'JetBrains Mono', monospace",
                maxWidth: '180px',
              }}
              title={tab.title}
              data-testid={`terminal-tab-${idx}`}
            >
              <OsIcon name="terminal" size={13} color={isActive ? '#00ff66' : '#006622'} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {tab.title}
              </span>
              {tabs.length > 1 && (
                <button
                  type="button"
                  onClick={e => handleCloseTab(tab.id, e)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#006622',
                    cursor: 'pointer',
                    fontSize: '0.7rem',
                    padding: '0 2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Close Tab"
                >
                  <OsIcon name="close" size={10} color="currentColor" />
                </button>
              )}
            </div>
          );
        })}

        {tabs.length < 6 && (
          <button
            type="button"
            onClick={handleNewTab}
            style={{
              padding: '2px 8px',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#008833',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
            title="Open New Tab (Ctrl+Shift+T)"
            data-testid="btn-terminal-new-tab"
          >
            +
          </button>
        )}

        <div
          style={{
            marginLeft: 'auto',
            paddingRight: '8px',
            fontSize: '0.68rem',
            color: '#008833',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span>VFS: {activeTab.currentDirectory}</span>
        </div>
      </div>

      {/* Terminal Log Output Buffer */}
      <div
        ref={terminalScrollAreaRef}
        className="terminal-scroll-area"
        role="log"
        aria-live="polite"
        data-testid="terminal-scroll-area"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '8px 12px',
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          fontSize: '13px',
          lineHeight: '1.45',
          backgroundColor: '#000000',
          color: '#00ff66',
        }}
      >
        {activeTab.entries.map(entry => (
          <div key={entry.id} className="terminal-entry" data-testid="terminal-entry">
            {entry.command && (
              <div className="terminal-command-block" style={{ marginBottom: '4px' }}>
                {/* Line 1: ┌─[user@host]─[dir] */}
                <div style={{ color: '#00aa44', fontSize: '12px' }}>
                  <span>┌─[</span>
                  <span style={{ color: '#00ff66', fontWeight: 600 }}>{activeUser}</span>
                  <span style={{ color: '#39ff14' }}>@{activeHost}</span>
                  <span>]─[</span>
                  <span style={{ color: '#00e575' }}>{entry.directory ?? promptDir}</span>
                  <span>]</span>
                </div>
                {/* Line 2: └──╼ $ command */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#00aa44' }}>└──╼ </span>
                  <span style={{ color: '#00ff66', fontWeight: 700 }}>$ </span>
                  <span style={{ color: '#00ff66', fontWeight: 600 }}>{entry.command}</span>
                  <span style={{ marginLeft: 'auto', color: '#008833', fontSize: '11px' }}>
                    {entry.timestamp}
                  </span>
                </div>
              </div>
            )}

            {entry.stdout.map((line, i) => (
              <div
                key={i}
                className={`terminal-output-line ${entry.isError ? 'output-error' : 'output-normal'}`}
                style={{
                  color: entry.isError ? '#ef4444' : '#00ff66',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {line}
              </div>
            ))}
          </div>
        ))}

        {/* Live Active Prompt Inline with Buffer (Zero Border, Pure Hacker Terminal) */}
        <div className="terminal-live-prompt" style={{ marginTop: '8px' }}>
          {/* Prompt Line 1 */}
          <div style={{ color: '#00aa44', fontSize: '12px' }}>
            <span>┌─[</span>
            <span style={{ color: '#00ff66', fontWeight: 600 }}>{activeUser}</span>
            <span style={{ color: '#39ff14' }}>@{activeHost}</span>
            <span>]─[</span>
            <span style={{ color: '#00e575' }}>{promptDir}</span>
            <span>]</span>
          </div>

          {/* Prompt Line 2 & Inline Input */}
          <div
            className="terminal-input-row"
            data-testid="terminal-input-row"
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'transparent',
              padding: 0,
              border: 'none',
              marginTop: '1px',
            }}
          >
            <label
              htmlFor="terminal-command-input"
              className="terminal-prompt-label"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginRight: '6px',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
                userSelect: 'none',
              }}
            >
              <span style={{ color: '#00aa44' }}>└──╼ </span>
              <span style={{ color: '#00ff66', fontWeight: 700, marginLeft: '2px' }}>$ </span>
            </label>
            <input
              ref={inputRef}
              id="terminal-command-input"
              type="text"
              className="terminal-text-input"
              value={activeTab.inputVal}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              aria-label="Terminal command input"
              data-testid="terminal-command-input"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                boxShadow: 'none',
                color: '#00ff66',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
                caretColor: '#00ff66',
                padding: '2px 0',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
