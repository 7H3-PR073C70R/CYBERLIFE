/**
 * Cyberlife — Simulation Cyber Terminal Types
 *
 * Defines the contracts for synthetic command execution within Cyberlife's
 * sandboxed, headless simulation environment.
 *
 * STRICT INVARIANTS:
 * - 100% synthetic: zero execution on the player's host operating system.
 * - Headless: zero imports of React, DOM, or Three.js.
 */

export interface TerminalCommandResult {
  /** Text lines printed to standard output. */
  stdout: string[];
  /** Optional text lines printed to standard error. */
  stderr?: string[];
  /** True if the command returned an error or non-zero simulated status. */
  isError?: boolean;
  /** If true, the terminal client should clear previous screen output. */
  clearScreen?: boolean;
}

export interface TerminalExecutionContext {
  /** Snapshot of in-game simulation calendar & time from M3 engine. */
  simulationTime: {
    timeString: string;
    dateString: string;
    iso: string;
    year: number;
    month: number;
    day: number;
    hour: number;
    minute: number;
    second: number;
    dayOfWeek: string;
  };
  /** Fictional in-game authenticated user persona. */
  currentUser: {
    username: string;
    displayName: string;
    role: string;
    organization: string;
    accessTier?: number;
  };
  /** Fictional in-game workstation metadata. */
  workstation: {
    id: string;
    hostname: string;
    osVersion: string;
    ipAddress: string;
    subnet: string;
    status: string;
    locationId: string;
  };
  /** History of commands entered in the current session. */
  history: readonly string[];
}

export interface TerminalCommandHandler {
  /** Canonical command identifier (e.g. 'help', 'whoami', 'date'). */
  readonly name: string;
  /** Short beginner-friendly summary of what this command accomplishes. */
  readonly description: string;
  /** Syntax and parameter usage example. */
  readonly usage: string;
  /**
   * Executes the command against the simulated context and returns output.
   * Must be deterministic and never perform real host I/O or shell evaluation.
   */
  execute(args: string[], context: TerminalExecutionContext): TerminalCommandResult;
}
