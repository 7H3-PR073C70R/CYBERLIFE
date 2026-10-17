/**
 * Cyberlife — Terminal Application Component (Parrot Security OS Inspired)
 *
 * Provides a beginner-friendly simulated command line prompt.
 * Strictly sandboxed; executes via TerminalCommandParser.
 * Enforces manual typing: command chips display educational syntax & hints,
 * but do not auto-fill or bypass manual input.
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { createDefaultTerminalParser, TerminalExecutionContext } from '@/simulation/cyber/terminal';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';

export interface TerminalEntry {
  id: string;
  command: string;
  stdout: string[];
  stderr?: string[];
  isError?: boolean;
  timestamp: string;
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

const COMMAND_HINTS: Record<string, CommandHint> = {
  help: {
    command: 'help',
    purpose: 'Lists all available simulated commands in the sandboxed system.',
    example: 'help',
    expectedOutput: 'Table of supported commands with descriptions.',
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
  history: {
    command: 'history',
    purpose: 'Lists the sequence of commands previously executed in this session.',
    example: 'history',
    expectedOutput: 'Numbered list of executed terminal commands.',
  },
  clear: {
    command: 'clear',
    purpose: 'Clears all visible terminal output lines from the screen buffer.',
    example: 'clear',
    expectedOutput: 'Clean empty terminal prompt.',
  },
};

export const TerminalApp: React.FC<TerminalAppProps> = ({
  workstationId = 'interact_cedarline_workstation',
  initialEntries,
  onTyping,
  onTerminalOutput,
}) => {
  const sim = useOptionalSimulation();
  const parser = useMemo(() => createDefaultTerminalParser(), []);

  // Initial welcome greeting (Parrot Security OS theme)
  const [entries, setEntries] = useState<TerminalEntry[]>(() => {
    if (initialEntries && initialEntries.length > 0) return initialEntries;

    return [
      {
        id: 'init-1',
        command: '',
        stdout: [
          'PARROT SECURITY OS // CYBERLIFE EDITION [v4.5-sandboxed]',
          'Kernel: Linux 6.8.0-parrot-enterprise x86_64 // Node: Synthetic Lagos Cluster',
          'Safety Boundary: 100% simulated sandbox. Zero host OS execution.',
          '',
          "Type 'help' to view available simulated commands.",
          "Type 'whoami' to inspect your security credentials.",
        ],
        timestamp: '08:00 AM',
      },
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [selectedHintCmd, setSelectedHintCmd] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Auto-scroll on new entry
  useEffect(() => {
    if (typeof terminalEndRef.current?.scrollIntoView === 'function') {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [entries]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const buildContext = useCallback((): TerminalExecutionContext => {
    const isCedarline = workstationId.includes('cedarline');

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
            osVersion: 'Parrot Security OS v4.5 [Simulated Sandboxed Kernel]',
            ipAddress: '10.0.4.15',
            subnet: '255.255.255.0',
            status: 'Operational (Synthetic Enterprise Subnet)',
            locationId: 'cedarline_interior',
          }
        : {
            id: workstationId,
            hostname: 'lagos-rig-dev01.local',
            osVersion: 'Parrot Security OS v4.5 [Home Rig]',
            ipAddress: '192.168.1.104',
            subnet: '255.255.255.0',
            status: 'Operational (Simulated Local Rig)',
            locationId: 'apartment_interior',
          },
      history,
    };
  }, [sim, workstationId, history]);

  const handleExecute = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    const ctx = buildContext();
    const result = parser.parseAndExecute(trimmed, ctx);

    // Update command history
    setHistory(prev => [...prev, trimmed]);
    setHistoryIndex(-1);

    if (result.clearScreen) {
      setEntries([]);
      setInputVal('');
      onTerminalOutput?.([]);
      return;
    }

    const newEntry: TerminalEntry = {
      id: `entry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      command: trimmed,
      stdout: result.stdout,
      stderr: result.stderr,
      isError: result.isError,
      timestamp: ctx.simulationTime.timeString,
    };

    setEntries(prev => {
      const updated = [...prev, newEntry];
      onTerminalOutput?.(result.stdout);
      return updated;
    });
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Stop propagation so 3D world player controller never receives terminal keys
    e.stopPropagation();

    // Trigger typing animation on character and physical workstation hands!
    onTyping?.();

    if (e.key === 'Enter') {
      e.preventDefault();
      handleExecute(inputVal);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;

      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(history[nextIndex] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0 || historyIndex === -1) return;

      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(history[nextIndex] ?? '');
      }
    } else if (e.key === 'c' && (e.ctrlKey || e.metaKey)) {
      // Clear line on Ctrl+C
      setInputVal('');
    } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
      // Clear screen on Ctrl+L
      e.preventDefault();
      setEntries([]);
      onTerminalOutput?.([]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputVal(e.target.value);
    onTyping?.();
  };

  const promptPrefix = workstationId.includes('cedarline')
    ? 'tade@parrot-sec-ws04:~$ '
    : 'player@parrot-rig:~$ ';

  const activeHint = selectedHintCmd ? COMMAND_HINTS[selectedHintCmd] : null;

  return (
    <div
      className="terminal-app-container parrot-theme"
      role="region"
      aria-label="Simulated Terminal Session"
      onClick={() => inputRef.current?.focus()}
      data-testid="terminal-app-container"
    >
      {/* Educational Command Learning Toolbar */}
      <div className="terminal-toolbar">
        <div className="terminal-chips-group">
          <span className="chips-label">Command Guide:</span>
          {['help', 'whoami', 'date', 'status', 'history', 'clear'].map(cmd => (
            <button
              key={cmd}
              type="button"
              className={`terminal-chip-btn ${selectedHintCmd === cmd ? 'chip-active' : ''}`}
              onClick={e => {
                e.stopPropagation();
                // Mandatory manual typing: clicking teaches command purpose, does NOT auto-insert!
                setSelectedHintCmd(prev => (prev === cmd ? null : cmd));
                inputRef.current?.focus();
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
            setEntries([]);
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
              📖
            </span>
            <div>
              <div style={{ color: 'var(--color-accent-cyan, #00e5ff)', fontWeight: 600 }}>
                Command Guide: <code>{activeHint.command}</code>
              </div>
              <div
                style={{
                  color: 'var(--color-text-secondary, #94a3b8)',
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
                  color: 'var(--color-accent-emerald, #00e676)',
                }}
              >
                ✍️ <strong>Manual Typing:</strong> Type <code>{activeHint.example}</code> into the
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

      {/* Terminal Log Output */}
      <div
        className="terminal-scroll-area"
        role="log"
        aria-live="polite"
        data-testid="terminal-scroll-area"
      >
        {entries.map(entry => (
          <div key={entry.id} className="terminal-entry" data-testid="terminal-entry">
            {entry.command && (
              <div className="terminal-command-line">
                <span className="terminal-prompt-text">{promptPrefix}</span>
                <span className="terminal-command-text">{entry.command}</span>
                <span className="terminal-timestamp">{entry.timestamp}</span>
              </div>
            )}

            {entry.stdout.map((line, i) => (
              <div
                key={i}
                className={`terminal-output-line ${entry.isError ? 'output-error' : 'output-normal'}`}
              >
                {line}
              </div>
            ))}
          </div>
        ))}
        <div ref={terminalEndRef} />
      </div>

      {/* Active Input Line */}
      <div className="terminal-input-row" data-testid="terminal-input-row">
        <label htmlFor="terminal-command-input" className="terminal-prompt-label">
          {promptPrefix}
        </label>
        <input
          ref={inputRef}
          id="terminal-command-input"
          type="text"
          className="terminal-text-input"
          value={inputVal}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          aria-label="Terminal command input"
          placeholder="Type manually: help, whoami, date, status, history, clear..."
          data-testid="terminal-command-input"
        />
        <button
          type="button"
          className="btn-terminal-submit"
          onClick={e => {
            e.stopPropagation();
            handleExecute(inputVal);
          }}
          aria-label="Submit command"
        >
          Run
        </button>
      </div>
    </div>
  );
};
