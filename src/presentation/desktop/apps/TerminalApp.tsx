/**
 * Cyberlife — Terminal Application Component
 *
 * Provides a beginner-friendly simulated command line prompt.
 * Strictly sandboxed; executes via TerminalCommandParser.
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
}

export const TerminalApp: React.FC<TerminalAppProps> = ({
  workstationId = 'interact_cedarline_workstation',
  initialEntries,
}) => {
  const sim = useOptionalSimulation();
  const parser = useMemo(() => createDefaultTerminalParser(), []);

  // Initial welcome greeting
  const [entries, setEntries] = useState<TerminalEntry[]>(() => {
    if (initialEntries && initialEntries.length > 0) return initialEntries;

    return [
      {
        id: 'init-1',
        command: '',
        stdout: [
          'Cyberlife OS [Version 4.2.0-sandboxed]',
          'Copyright (c) 2026 Cedarline Services & Cyberlife Initiative.',
          'All operations in this terminal are 100% simulated within the game environment.',
          '',
          "Type 'help' to view available simulated commands.",
        ],
        timestamp: '08:00 AM',
      },
    ];
  });

  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [showHintBanner, setShowHintBanner] = useState(true);

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
            osVersion: 'CyberOS Enterprise v4.2 [Simulated Sandboxed Kernel]',
            ipAddress: '10.0.4.15',
            subnet: '255.255.255.0',
            status: 'Operational (Synthetic Enterprise Subnet)',
            locationId: 'cedarline_interior',
          }
        : {
            id: workstationId,
            hostname: 'lagos-rig-dev01.local',
            osVersion: 'CyberOS Workstation Edition v4.2',
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

    setEntries(prev => [...prev, newEntry]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Stop propagation so 3D world player controller never receives terminal keys
    e.stopPropagation();

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
    }
  };

  const insertCommand = (cmd: string) => {
    setInputVal(cmd);
    inputRef.current?.focus();
  };

  const promptPrefix = workstationId.includes('cedarline')
    ? 'tade@cedarline:~$ '
    : 'player@research-rig:~$ ';

  return (
    <div
      className="terminal-app-container"
      role="region"
      aria-label="Simulated Terminal Session"
      onClick={() => inputRef.current?.focus()}
      data-testid="terminal-app-container"
    >
      {/* Quick Suggestion Chips Header */}
      <div className="terminal-toolbar">
        <div className="terminal-chips-group">
          <span className="chips-label">Quick Commands:</span>
          {['help', 'whoami', 'date', 'status', 'history', 'clear'].map(cmd => (
            <button
              key={cmd}
              type="button"
              className="terminal-chip-btn"
              onClick={e => {
                e.stopPropagation();
                insertCommand(cmd);
              }}
              title={`Insert '${cmd}' command`}
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
          }}
          title="Clear Terminal Output"
          data-testid="btn-terminal-clear"
        >
          Clear Screen
        </button>
      </div>

      {/* Beginner Guidance Hint Banner */}
      {showHintBanner && (
        <div
          className="terminal-hint-banner"
          role="note"
          aria-label="Beginner Terminal Guidance"
          data-testid="terminal-hint-banner"
        >
          <div className="hint-content">
            <span className="hint-icon" aria-hidden="true">
              💡
            </span>
            <span>
              <strong>New to terminals?</strong> Click <code>[help]</code> above or type{' '}
              <code>help</code> and press <kbd>Enter</kbd> to see what you can do.
            </span>
          </div>
          <button
            type="button"
            className="btn-dismiss-hint"
            onClick={e => {
              e.stopPropagation();
              setShowHintBanner(false);
            }}
            aria-label="Dismiss beginner hint"
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
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          aria-label="Terminal command input"
          placeholder="Type a command (e.g. help, status, date)..."
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
