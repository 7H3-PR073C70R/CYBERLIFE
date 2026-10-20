/**
 * Cyberlife — Terminal Application Component (Heron OS Security Edition)
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
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { OS_NAME, OS_VERSION, OS_BRANDING, HOSTNAMES, KERNEL_STRING } from '../osBranding';
import { OsIcon } from '../icons/OsIcons';

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

interface CommandHint {
  command: string;
  purpose: string;
  example: string;
  expectedOutput: string;
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
];

const COMMAND_HINTS: Record<string, CommandHint> = {
  help: {
    command: 'help',
    purpose: 'Lists all available simulated commands in the sandboxed system.',
    example: 'help',
    expectedOutput: 'Table of supported commands with descriptions.',
  },
  pwd: {
    command: 'pwd',
    purpose: 'Prints the current virtual working directory path.',
    example: 'pwd',
    expectedOutput: '/home/analyst',
  },
  ls: {
    command: 'ls',
    purpose: 'Lists files and directories in the virtual filesystem with permissions.',
    example: 'ls -l /var/log',
    expectedOutput: 'Permissions, owner, size, and filenames.',
  },
  cd: {
    command: 'cd',
    purpose: 'Navigates between virtual directories in the sandbox.',
    example: 'cd /mnt/evidence',
    expectedOutput: 'Changes directory prompt to target path.',
  },
  cat: {
    command: 'cat',
    purpose: 'Displays text content of synthetic logs, notes, or configs.',
    example: 'cat /etc/security/access.conf',
    expectedOutput: 'File content printed to terminal buffer.',
  },
  grep: {
    command: 'grep',
    purpose: 'Searches for matching patterns or strings within a virtual file.',
    example: 'grep FAIL /var/log/auth.log',
    expectedOutput: 'Lines containing the matching keyword.',
  },
  file: {
    command: 'file',
    purpose: 'Identifies file type and encoding of a virtual path.',
    example: 'file /mnt/evidence/EVD-2026-001.pcap',
    expectedOutput: 'tcpdump capture file (little-endian) - version 2.4',
  },
  nmap: {
    command: 'nmap',
    purpose: 'Educational alias for simulated network mapping tool (netmap).',
    example: 'nmap hosts',
    expectedOutput: 'Discovers reachable virtual hosts on the subnet.',
  },
  packetview: {
    command: 'packetview',
    purpose: 'Streams packet capture records from /mnt/evidence/EVD-2026-001.pcap.',
    example: 'packetview smb',
    expectedOutput: 'Filtered packet table with protocols and summaries.',
  },
  revview: {
    command: 'revview',
    purpose: 'Static binary inspector for aster_agent_daemon.bin strings and pseudocode.',
    example: 'revview strings',
    expectedOutput: 'Extracted string constants from .rodata section.',
  },
  whoami: {
    command: 'whoami',
    purpose:
      'Displays your authenticated fictional cybersecurity username, role, and organization.',
    example: 'whoami',
    expectedOutput: 'tade_adebayo — Security Analyst Intern (Cedarline Services)',
  },
  date: {
    command: 'date',
    purpose: 'Reads the authoritative in-game civil calendar time from the simulation engine.',
    example: 'date',
    expectedOutput: '08:00 AM, Monday, Oct 12, 2026',
  },
  status: {
    command: 'status',
    purpose: 'Queries the synthetic workstation hostname, virtual IP, and network status.',
    example: 'status',
    expectedOutput: 'cedarline-sec-ws04.corp.local — 10.0.4.15/24 (Operational)',
  },
  netmap: {
    command: 'netmap',
    purpose: 'Discovers reachable virtual hosts, addresses, and device roles on the subnet.',
    example: 'netmap hosts',
    expectedOutput: 'Table of reachable hosts, IP addresses, and device roles.',
  },
  svcscan: {
    command: 'svcscan',
    purpose: 'Queries active listeners, port numbers, software products, and version banners.',
    example: 'svcscan inspect filesrv-01',
    expectedOutput: 'Open port list with service banners, approved status, and security notes.',
  },
  logview: {
    command: 'logview',
    purpose: 'Queries and filters structured auth, firewall, and application event telemetry.',
    example: 'logview recent',
    expectedOutput: 'Chronological event log table with timestamps and severity ratings.',
  },
  evidence: {
    command: 'evidence',
    purpose: 'Catalogs digital forensic evidence objects, SHA-256 hashes, and custody records.',
    example: 'evidence list',
    expectedOutput: 'Forensic evidence ledger with chain of custody and artifact content.',
  },
};

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
  const [selectedHintCmd, setSelectedHintCmd] = useState<string | null>(null);

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

  const isCedarline = workstationId.includes('cedarline');
  const activeUser = isCedarline ? 'tade' : 'player';
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
              username: 'tade_adebayo',
              displayName: 'Tade Adebayo',
              role: 'Security Analyst Intern',
              organization: 'Cedarline Services — Marina Tower',
            }
          : {
              username: 'player',
              displayName: 'Tade Adebayo',
              role: 'Independent Security Researcher',
              organization: 'Home Rig — Broad Street 14',
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

    const ctx = buildContext(activeTab.currentDirectory, activeTab.history);
    const result = parser.parseAndExecute(trimmed, ctx);

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

    const newEntry: TerminalEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      command: trimmed,
      directory: formatDirForPrompt(activeTab.currentDirectory),
      stdout: result.stdout,
      stderr: result.stderr,
      isError: result.isError,
      timestamp: ctx.simulationTime.timeString,
    };

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

    onTerminalOutput?.(result.stdout);

    // If a cyber tool was executed, record cyber activity on the authoritative simulation engine
    const firstToken = trimmed.split(/\s+/)[0]?.toLowerCase();
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
  const activeHint = selectedHintCmd ? COMMAND_HINTS[selectedHintCmd] : null;

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
        backgroundColor: '#05090f',
        color: '#f8fafc',
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      }}
    >
      {/* Multi-Tab Bar */}
      <div
        className="terminal-tab-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#0c131f',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
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
                backgroundColor: isActive ? '#05090f' : '#111a28',
                color: isActive ? '#00e5ff' : '#94a3b8',
                borderTopLeftRadius: '4px',
                borderTopRightRadius: '4px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderBottom: isActive
                  ? '1px solid #05090f'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                cursor: 'pointer',
                fontSize: '0.73rem',
                fontFamily: "'JetBrains Mono', monospace",
                maxWidth: '180px',
              }}
              title={tab.title}
              data-testid={`terminal-tab-${idx}`}
            >
              <OsIcon name="terminal" size={13} color={isActive ? '#00e5ff' : '#64748b'} />
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
                    color: '#64748b',
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
              color: '#64748b',
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
            color: '#64748b',
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          <span>VFS: {activeTab.currentDirectory}</span>
        </div>
      </div>

      {/* Educational Command Learning Toolbar */}
      <div className="terminal-toolbar">
        <div className="terminal-chips-group">
          <span className="chips-label">Commands:</span>
          {KNOWN_COMMANDS.map(cmd => (
            <button
              key={cmd}
              type="button"
              className={`terminal-chip-btn ${selectedHintCmd === cmd ? 'chip-active' : ''}`}
              onClick={e => {
                e.stopPropagation();
                setSelectedHintCmd(prev => (prev === cmd ? null : cmd));
                inputRef.current?.focus({ preventScroll: true });
              }}
              title={`View guidance for '${cmd}' (manual typing required)`}
              data-testid={`terminal-chip-${cmd}`}
            >
              [{cmd}]
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn-terminal-clear"
          onClick={e => {
            e.stopPropagation();
            setTabs(prev => prev.map(t => (t.id === activeTab.id ? { ...t, entries: [] } : t)));
            inputRef.current?.focus();
            onTerminalOutput?.([]);
          }}
          title="Clear Terminal Output"
          data-testid="btn-terminal-clear"
        >
          Clear Screen
        </button>
      </div>

      {/* Educational Syntax & Purpose Card (Mandatory Manual Typing) */}
      {activeHint && (
        <div
          className="terminal-hint-banner"
          role="note"
          aria-label={`Command Guide: ${activeHint.command}`}
          data-testid="terminal-hint-banner"
        >
          <div className="hint-content">
            <span className="hint-icon" aria-hidden="true">
              <OsIcon name="fieldGuide" size={16} color="#00e5ff" />
            </span>
            <div>
              <div style={{ color: '#00e5ff', fontWeight: 600 }}>
                Command Guide: <code>{activeHint.command}</code>
              </div>
              <div
                style={{
                  color: '#94a3b8',
                  fontSize: '0.8rem',
                  marginTop: '2px',
                }}
              >
                {activeHint.purpose}
              </div>
              <div
                style={{
                  fontSize: '0.78rem',
                  marginTop: '4px',
                  color: '#00e676',
                }}
              >
                <strong>Manual Typing:</strong> Type <code>{activeHint.example}</code> into the
                prompt below and press <kbd>Enter</kbd>.
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-dismiss-hint"
            onClick={e => {
              e.stopPropagation();
              setSelectedHintCmd(null);
            }}
            aria-label="Close command guide"
          >
            ✕
          </button>
        </div>
      )}

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
        }}
      >
        {activeTab.entries.map(entry => (
          <div key={entry.id} className="terminal-entry" data-testid="terminal-entry">
            {entry.command && (
              <div className="terminal-command-block" style={{ marginBottom: '4px' }}>
                {/* Line 1: ┌─[user@host]─[dir] */}
                <div style={{ color: '#64748b', fontSize: '12px' }}>
                  <span>┌─[</span>
                  <span style={{ color: '#00e676', fontWeight: 600 }}>{activeUser}</span>
                  <span style={{ color: '#00e5ff' }}>@{activeHost}</span>
                  <span>]─[</span>
                  <span style={{ color: '#38bdf8' }}>{entry.directory ?? promptDir}</span>
                  <span>]</span>
                </div>
                {/* Line 2: └──╼ $ command */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ color: '#64748b' }}>└──╼ </span>
                  <span style={{ color: '#00e5ff', fontWeight: 700 }}>$ </span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{entry.command}</span>
                  <span style={{ marginLeft: 'auto', color: '#475569', fontSize: '11px' }}>
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
                  color: entry.isError ? '#ef4444' : '#cbd5e1',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                }}
              >
                {line}
              </div>
            ))}
          </div>
        ))}

        {/* Live Active Prompt Inline with Buffer */}
        <div className="terminal-live-prompt" style={{ marginTop: '8px' }}>
          {/* Prompt Line 1 */}
          <div style={{ color: '#64748b', fontSize: '12px' }}>
            <span>┌─[</span>
            <span style={{ color: '#00e676', fontWeight: 600 }}>{activeUser}</span>
            <span style={{ color: '#00e5ff' }}>@{activeHost}</span>
            <span>]─[</span>
            <span style={{ color: '#38bdf8' }}>{promptDir}</span>
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
              <span style={{ color: '#64748b' }}>└──╼ </span>
              <span style={{ color: '#00e5ff', fontWeight: 700, marginLeft: '2px' }}>$ </span>
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
              placeholder="Type command (Tab to complete)..."
              data-testid="terminal-command-input"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#f8fafc',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '13px',
                caretColor: '#00e5ff',
                padding: '2px 0',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
