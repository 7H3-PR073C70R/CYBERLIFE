/**
 * Cyberlife — Terminal Command Registry
 *
 * Manages registered synthetic command handlers.
 * Extensible for M5 cybersecurity tools without changing core parser.
 */

import { TerminalCommandHandler, TerminalCommandResult, TerminalExecutionContext } from './types';
import { createDefaultCyberTools, createToolCommandHandler } from '../tools';

export class TerminalCommandRegistry {
  private handlers = new Map<string, TerminalCommandHandler>();

  public register(handler: TerminalCommandHandler): void {
    const key = handler.name.toLowerCase();
    this.handlers.set(key, handler);
  }

  public unregister(name: string): boolean {
    return this.handlers.delete(name.toLowerCase());
  }

  public has(name: string): boolean {
    return this.handlers.has(name.toLowerCase());
  }

  public get(name: string): TerminalCommandHandler | undefined {
    return this.handlers.get(name.toLowerCase());
  }

  public getAll(): readonly TerminalCommandHandler[] {
    return Array.from(this.handlers.values());
  }
}

/**
 * Built-in M4 command handlers: help, clear, whoami, date, status, history.
 */

export const helpCommand: TerminalCommandHandler = {
  name: 'help',
  description: 'Lists all available commands and explains how to use the terminal.',
  usage: 'help [command]',
  execute(args: string[], _context: TerminalExecutionContext): TerminalCommandResult {
    const specificCmd = args[0]?.toLowerCase();

    if (specificCmd) {
      if (specificCmd === 'help') {
        return {
          stdout: [
            'Command: help',
            'Usage: help [command]',
            'Description: Displays general help or details about a specific command.',
          ],
        };
      }
      if (specificCmd === 'clear') {
        return {
          stdout: [
            'Command: clear',
            'Usage: clear',
            'Description: Clears all previous output text from the terminal screen.',
          ],
        };
      }
      if (specificCmd === 'whoami') {
        return {
          stdout: [
            'Command: whoami',
            'Usage: whoami',
            'Description: Prints the currently logged-in in-game user persona and role.',
          ],
        };
      }
      if (specificCmd === 'date') {
        return {
          stdout: [
            'Command: date',
            'Usage: date',
            'Description: Displays the current in-game simulation date, time, and timezone (WAT).',
          ],
        };
      }
      if (specificCmd === 'status') {
        return {
          stdout: [
            'Command: status',
            'Usage: status',
            'Description: Displays a summary of the simulated workstation environment and network node.',
          ],
        };
      }
      if (specificCmd === 'history') {
        return {
          stdout: [
            'Command: history',
            'Usage: history',
            'Description: Shows the history of commands executed during this terminal session.',
          ],
        };
      }
      if (specificCmd === 'netmap') {
        return {
          stdout: [
            'Command: netmap',
            'Usage: netmap hosts | netmap inspect <host-id> | netmap filter <role>',
            'Description: Simulated network discovery tool for inventorying reachable subnet nodes.',
            'Examples:',
            '  netmap hosts               - List all discovered devices on the subnet',
            '  netmap inspect filesrv-01  - View detailed host metadata, OS, and location',
            '  netmap filter workstation  - Filter nodes by device role',
            'Educational Note: A host inventory maps existing devices; it does NOT mean a host is compromised.',
          ],
        };
      }
      if (specificCmd === 'svcscan') {
        return {
          stdout: [
            'Command: svcscan',
            'Usage: svcscan inspect <host-id> | svcscan list | svcscan filter <approved|review>',
            'Description: Simulated service and port inspector for querying active software listeners.',
            'Examples:',
            '  svcscan inspect ws-finance-02  - Examine open ports and version banners on a host',
            '  svcscan list                   - List all inventoried services across the subnet',
            '  svcscan filter review          - Display services flagged for security review',
            'Educational Note: Differentiate between service discovery and vulnerability; open ports are normal business services.',
          ],
        };
      }
      if (specificCmd === 'logview') {
        return {
          stdout: [
            'Command: logview',
            'Usage: logview recent [--limit=N] | logview filter --source=SRC [--severity=SEV] | logview inspect <log-id>',
            'Description: Simulated security and operational event log viewer.',
            'Examples:',
            '  logview recent                 - Display the 10 most recent log entries',
            '  logview filter --source=auth   - Show authentication events (logins, failed retries)',
            '  logview filter --severity=WARN - Show warning and anomaly entries',
            '  logview inspect LOG-2026-104   - View detailed message, user, and technical context',
            'Educational Note: Most logs represent normal operational activity; correlate timestamps before drawing conclusions.',
          ],
        };
      }
      if (specificCmd === 'evidence') {
        return {
          stdout: [
            'Command: evidence',
            'Usage: evidence list | evidence inspect <evidence-id>',
            'Description: Simulated digital forensic evidence catalog and artifact inspector.',
            'Examples:',
            '  evidence list                  - List all registered evidence artifacts in the vault',
            '  evidence inspect EVD-2026-001  - View hash verification, chain of custody, and content',
            'Educational Note: Forensic evidence is strictly read-only and verified via SHA-256 hashes.',
          ],
        };
      }
      return {
        stdout: [
          `No detailed manual entry for '${specificCmd}'.`,
          "Type 'help' to see the list of supported commands.",
        ],
      };
    }

    return {
      stdout: [
        'Cyberlife Terminal Shell — Fictional Sandboxed Environment',
        '==========================================================',
        'SYSTEM COMMANDS:',
        '  help     - Show this help guide or details about a command (e.g. "help netmap")',
        '  clear    - Clear the terminal screen output',
        '  whoami   - Display the logged-in user persona and authorization level',
        '  date     - Display the current in-game simulation date and time',
        '  status   - Display simulated workstation and node connection health',
        '  history  - View commands entered during the current session',
        '',
        'SIMULATED CYBERSECURITY TOOLS:',
        '  netmap   - Discover virtual hosts and inspect subnet inventory (e.g. "netmap hosts")',
        '  svcscan  - Scan services, ports, and version banners (e.g. "svcscan inspect filesrv-01")',
        '  logview  - Inspect and filter simulated event logs (e.g. "logview recent")',
        '  evidence - View digital evidence, SHA-256 hashes, and chain of custody (e.g. "evidence list")',
        '',
        'Tips for Beginners:',
        '  • Type any command name above and press Enter to execute it manually.',
        '  • Use the Up (↑) and Down (↓) arrow keys to recall previous commands.',
        '  • Click command guide chips above the prompt for educational hints and syntax.',
        '  • This terminal runs 100% inside Cyberlife; it cannot affect your real computer.',
        '==========================================================',
      ],
    };
  },
};

export const clearCommand: TerminalCommandHandler = {
  name: 'clear',
  description: 'Clears the terminal screen output.',
  usage: 'clear',
  execute(): TerminalCommandResult {
    return {
      stdout: [],
      clearScreen: true,
    };
  },
};

export const whoamiCommand: TerminalCommandHandler = {
  name: 'whoami',
  description: 'Displays the active in-game user persona and role.',
  usage: 'whoami',
  execute(_args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    const { username, displayName, role, organization } = context.currentUser;
    return {
      stdout: [
        `${username}`,
        `Identity:     ${displayName}`,
        `Role:         ${role}`,
        `Organization: ${organization}`,
        'Access Level: Security Analyst (Tier 1)',
      ],
    };
  },
};

export const dateCommand: TerminalCommandHandler = {
  name: 'date',
  description: 'Displays the current in-game simulation date and time.',
  usage: 'date',
  execute(_args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    const { dateString, timeString } = context.simulationTime;
    return {
      stdout: [
        `${dateString} ${timeString} WAT (West Africa Time)`,
        'Clock Source: Authoritative Cyberlife Simulation Engine',
      ],
    };
  },
};

export const statusCommand: TerminalCommandHandler = {
  name: 'status',
  description: 'Displays fictional workstation and simulated network node status.',
  usage: 'status',
  execute(_args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    const { workstation, simulationTime, currentUser } = context;
    return {
      stdout: [
        '==============================================================',
        `  WORKSTATION STATUS: ${workstation.hostname}`,
        '==============================================================',
        `  Environment:       ${workstation.osVersion}`,
        `  Virtual Node IP:   ${workstation.ipAddress} (${workstation.subnet})`,
        `  Location:          ${workstation.locationId}`,
        `  Current User:      ${currentUser.username} (${currentUser.role})`,
        `  Simulation Clock:  ${simulationTime.dateString} ${simulationTime.timeString}`,
        `  Network Status:    ${workstation.status}`,
        '  Host OS Isolation: ENFORCED (100% synthetic in-game sandbox)',
        '==============================================================',
      ],
    };
  },
};

export const historyCommand: TerminalCommandHandler = {
  name: 'history',
  description: 'Displays the history of commands executed in the current session.',
  usage: 'history',
  execute(_args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    if (!context.history || context.history.length === 0) {
      return {
        stdout: ['No command history recorded for this session yet.'],
      };
    }

    const lines = context.history.map((cmd, index) => {
      const num = (index + 1).toString().padStart(3, ' ');
      return ` ${num}  ${cmd}`;
    });

    return {
      stdout: lines,
    };
  },
};

/**
 * Creates and initializes a TerminalCommandRegistry with the standard M4 command set.
 */
export function createDefaultCommandRegistry(): TerminalCommandRegistry {
  const registry = new TerminalCommandRegistry();
  // Standard built-in commands
  registry.register(helpCommand);
  registry.register(clearCommand);
  registry.register(whoamiCommand);
  registry.register(dateCommand);
  registry.register(statusCommand);
  registry.register(historyCommand);

  // M5 simulated cybersecurity tools
  for (const tool of createDefaultCyberTools()) {
    registry.register(createToolCommandHandler(tool));
  }

  return registry;
}
