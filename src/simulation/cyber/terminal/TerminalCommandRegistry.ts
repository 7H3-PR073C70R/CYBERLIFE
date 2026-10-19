/**
 * Cyberlife — Terminal Command Registry
 *
 * Manages registered synthetic command handlers.
 * Extensible for M5 cybersecurity tools without changing core parser.
 */

import { TerminalCommandHandler, TerminalCommandResult, TerminalExecutionContext } from './types';
import { createDefaultCyberTools, createToolCommandHandler } from '../tools';
import { virtualFilesystem, resolveVirtualPath } from '../filesystem';

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
      if (specificCmd === 'aster-admin') {
        return {
          stdout: [
            'Command: aster-admin',
            'Usage: aster-admin status | aster-admin policy | aster-admin contain | aster-admin remediate --role=kb-assistant | aster-admin verify',
            'Description: Simulated administration and incident response console for Aster AI assistant.',
            'Examples:',
            '  aster-admin status                       - Inspect active operational mode and IAM role',
            '  aster-admin policy                       - Compare active policy vs least-privilege baseline',
            '  aster-admin contain                      - Isolate service and sever unauthorized SMB paths',
            '  aster-admin remediate --role=kb-assistant  - Enforce least-privilege IAM policy',
            '  aster-admin verify                       - Run live recovery verification test suite',
            'Educational Note: Proper incident response isolates compromised services first, remediates permissions second, and verifies recovery before closure.',
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
        '  svcscan     - Scan services, ports, and version banners (e.g. "svcscan inspect filesrv-01")',
        '  logview     - Inspect and filter simulated event logs (e.g. "logview recent")',
        '  evidence    - View digital evidence, SHA-256 hashes, and chain of custody (e.g. "evidence list")',
        '  aster-admin - Aster AI service administration & incident response console (e.g. "aster-admin status")',
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

export const catalogueCommand: TerminalCommandHandler = {
  name: 'catalogue',
  description:
    'Displays Cyberlife cybersecurity tracks, practical exercises, and learning pathways.',
  usage: 'catalogue [tracks|exercises]',
  execute(args: string[]): TerminalCommandResult {
    const sub = args[0]?.toLowerCase();
    if (sub === 'exercises') {
      return {
        stdout: [
          'Cyberlife Practical Exercises (M11):',
          '----------------------------------------------------------',
          '  1. ex_blue_soc_log_triage        [BLUE]   SOC Log Correlation & Credential Spike',
          '  2. ex_red_authorized_recon_path  [RED]    Authorized Recon & Attack Path Finding',
          '  3. ex_purple_detection_tuning_replay [PURPLE] Detection Gap Tuning & Replay Loop',
          'Launch the Cyber Catalogue app on your desktop to run interactive exercises.',
        ],
      };
    }
    return {
      stdout: [
        'CYBERLIFE CYBERSECURITY CATALOGUE — TEAM TRACKS & EXERCISES',
        '==========================================================',
        'TRACKS:',
        '  [BLUE]   Defenders: SOC, Incident Response, Network/IAM Defense',
        '  [RED]    Attack Simulators: RoE Scoping, Recon, Identity Paths',
        '  [PURPLE] Collaborative: Detection Gap Analysis, Rule Tuning, Replay',
        '  [SHARED] Foundations: Network/OS/Web/Crypto & Security Ethics',
        '',
        'PLAYABLE EXERCISES:',
        '  • ex_blue_soc_log_triage        - Blue: SOC Log Correlation & Credential Spike',
        '  • ex_red_authorized_recon_path  - Red: Authorized Surface & Attack Path Assessment',
        '  • ex_purple_detection_tuning_replay - Purple: Detection Gap & Rule Tuning Replay',
        '',
        'Launch the "Cyber Catalogue" app on your desktop for interactive workspaces.',
        '==========================================================',
      ],
    };
  },
};

export const pwdCommand: TerminalCommandHandler = {
  name: 'pwd',
  description: 'Prints current virtual working directory path.',
  usage: 'pwd',
  execute(_args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    return {
      stdout: [context.currentDirectory || '/home/analyst'],
    };
  },
};

export const lsCommand: TerminalCommandHandler = {
  name: 'ls',
  description: 'Lists contents of the current or specified virtual directory.',
  usage: 'ls [-l] [-a] [directory]',
  execute(args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    const isDetailed = args.includes('-l') || args.includes('-la') || args.includes('-al');
    const pathArg = args.find(a => !a.startsWith('-'));
    const currentDir = context.currentDirectory || '/home/analyst';
    const targetDir = pathArg ? resolveVirtualPath(currentDir, pathArg) : currentDir;

    const entry = virtualFilesystem.getEntry(targetDir);
    if (!entry) {
      return {
        stdout: [],
        stderr: [`ls: cannot access '${pathArg || targetDir}': No such file or directory`],
        isError: true,
      };
    }

    if (entry.type === 'file') {
      return {
        stdout: [
          isDetailed
            ? `${entry.permissions} 1 ${entry.owner} ${entry.group} ${entry.sizeBytes} ${entry.modifiedDate} ${entry.name}`
            : entry.name,
        ],
      };
    }

    const children = virtualFilesystem.listDirectory(targetDir);
    if (children.length === 0) {
      return { stdout: ['(empty directory)'] };
    }

    if (isDetailed) {
      const lines = [
        `total ${children.length}`,
        ...children.map(c => {
          const sizeStr = c.sizeBytes.toString().padStart(6, ' ');
          const nameSuffix = c.type === 'directory' ? '/' : '';
          return `${c.permissions} 1 ${c.owner.padEnd(7, ' ')} ${c.group.padEnd(7, ' ')} ${sizeStr} ${c.modifiedDate} ${c.name}${nameSuffix}`;
        }),
      ];
      return { stdout: lines };
    }

    const items = children.map(c => (c.type === 'directory' ? `${c.name}/` : c.name));
    return {
      stdout: [items.join('  ')],
    };
  },
};

export const cdCommand: TerminalCommandHandler = {
  name: 'cd',
  description: 'Changes the virtual working directory.',
  usage: 'cd [directory]',
  execute(args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    const target = args[0] || '~';
    const currentDir = context.currentDirectory || '/home/analyst';
    const resolved = resolveVirtualPath(currentDir, target);

    const entry = virtualFilesystem.getEntry(resolved);
    if (!entry) {
      return {
        stdout: [],
        stderr: [`cd: ${target}: No such file or directory`],
        isError: true,
      };
    }

    if (entry.type !== 'directory') {
      return {
        stdout: [],
        stderr: [`cd: not a directory: ${target}`],
        isError: true,
      };
    }

    return {
      stdout: [],
      newDirectory: resolved,
    };
  },
};

export const catCommand: TerminalCommandHandler = {
  name: 'cat',
  description: 'Displays the content of a virtual file.',
  usage: 'cat <filename>',
  execute(args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    if (args.length === 0) {
      return {
        stdout: [],
        stderr: ['cat: missing file operand. Usage: cat <filename>'],
        isError: true,
      };
    }

    const currentDir = context.currentDirectory || '/home/analyst';
    const targetPath = resolveVirtualPath(currentDir, args[0]!);

    const entry = virtualFilesystem.getEntry(targetPath);
    if (!entry) {
      return {
        stdout: [],
        stderr: [`cat: ${args[0]}: No such file or directory`],
        isError: true,
      };
    }

    if (entry.type === 'directory') {
      return {
        stdout: [],
        stderr: [`cat: ${args[0]}: Is a directory`],
        isError: true,
      };
    }

    const file = virtualFilesystem.readFile(targetPath);
    if (!file) {
      return {
        stdout: [],
        stderr: [`cat: ${args[0]}: Cannot read file`],
        isError: true,
      };
    }

    return {
      stdout: file.content.split('\n'),
    };
  },
};

export const grepCommand: TerminalCommandHandler = {
  name: 'grep',
  description: 'Searches for matching patterns inside a virtual file.',
  usage: 'grep <pattern> <filename>',
  execute(args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    if (args.length < 2) {
      return {
        stdout: [],
        stderr: ['grep: missing arguments. Usage: grep <pattern> <filename>'],
        isError: true,
      };
    }

    const pattern = args[0]!;
    const filename = args[1]!;
    const currentDir = context.currentDirectory || '/home/analyst';
    const targetPath = resolveVirtualPath(currentDir, filename);

    const file = virtualFilesystem.readFile(targetPath);
    if (!file) {
      return {
        stdout: [],
        stderr: [`grep: ${filename}: No such file or directory`],
        isError: true,
      };
    }

    const lines = file.content.split('\n');
    const matched = lines.filter(l => l.toLowerCase().includes(pattern.toLowerCase()));

    return {
      stdout: matched.length > 0 ? matched : ['(no matches found)'],
    };
  },
};

export const fileCommand: TerminalCommandHandler = {
  name: 'file',
  description: 'Determines the type of a virtual file or directory.',
  usage: 'file <path>',
  execute(args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    if (args.length === 0) {
      return {
        stdout: [],
        stderr: ['file: missing operand. Usage: file <path>'],
        isError: true,
      };
    }

    const currentDir = context.currentDirectory || '/home/analyst';
    const targetPath = resolveVirtualPath(currentDir, args[0]!);
    const entry = virtualFilesystem.getEntry(targetPath);

    if (!entry) {
      return {
        stdout: [],
        stderr: [`file: cannot open '${args[0]}': No such file or directory`],
        isError: true,
      };
    }

    if (entry.type === 'directory') {
      return { stdout: [`${args[0]}: directory`] };
    }

    if (entry.name.endsWith('.json')) {
      return { stdout: [`${args[0]}: JSON data text`] };
    }
    if (
      entry.name.endsWith('.md') ||
      entry.name.endsWith('.txt') ||
      entry.name.endsWith('.log') ||
      entry.name.endsWith('.cfg') ||
      entry.name.endsWith('.conf')
    ) {
      return { stdout: [`${args[0]}: ASCII text`] };
    }
    if (entry.name.endsWith('.pcap')) {
      return { stdout: [`${args[0]}: tcpdump capture file (little-endian) - version 2.4`] };
    }
    if (entry.name.endsWith('.raw')) {
      return { stdout: [`${args[0]}: ELF 64-bit LSB core file, x86-64`] };
    }
    return { stdout: [`${args[0]}: POSIX tar archive / binary data`] };
  },
};

export const nmapCommand: TerminalCommandHandler = {
  name: 'nmap',
  description: 'Educational alias for simulated network mapping tool (netmap).',
  usage: 'nmap [hosts|subnet]',
  execute(args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    const netmapTool = createDefaultCyberTools().find(t => t.metadata.name === 'netmap')!;
    const netmap = createToolCommandHandler(netmapTool);
    const subResult = netmap.execute(args, context);
    return {
      ...subResult,
      stdout: [
        "💡 [EkoSec Educational Alias] 'nmap' maps to Cyberlife simulated tool 'netmap' (Parrot/Linux Nmap equivalent).",
        ...subResult.stdout,
      ],
    };
  },
};

export const packetviewCommand: TerminalCommandHandler = {
  name: 'packetview',
  description: 'Inspects synthetic packet capture stream from /mnt/evidence/EVD-2026-001.pcap.',
  usage: 'packetview [filter]',
  execute(args: string[]): TerminalCommandResult {
    const filter = args[0]?.toLowerCase();
    const allPackets = [
      'No.   Time     Source        Destination   Proto  Length  Info',
      '--------------------------------------------------------------------------------',
      '001   0.0000   10.0.4.15     10.0.4.1      ARP    42      Who has 10.0.4.1? Tell 10.0.4.15',
      '002   0.0008   10.0.4.1      10.0.4.15     ARP    42      10.0.4.1 is at 02:42:0a:00:04:01',
      '003   0.0124   10.0.4.10     10.0.4.20     TCP    74      51204 > 445 [SYN] Seq=0 Win=64240',
      '004   0.0128   10.0.4.20     10.0.4.10     TCP    74      445 > 51204 [SYN, ACK] Seq=0 Ack=1',
      '005   0.0131   10.0.4.10     10.0.4.20     TCP    66      51204 > 445 [ACK] Seq=1 Ack=1',
      '006   0.0142   10.0.4.10     10.0.4.20     SMB2   182     Negotiate Protocol Request',
      '007   0.0149   10.0.4.20     10.0.4.10     SMB2   268     Negotiate Protocol Response',
      '008   0.0160   10.0.4.10     10.0.4.20     SMB2   288     Session Setup Request, User: svc-aster',
      '009   0.0175   10.0.4.20     10.0.4.10     SMB2   196     Session Setup Response [SUCCESS]',
      '010   0.0188   10.0.4.10     10.0.4.20     SMB2   214     Tree Connect Request: \\\\filesrv-01\\payroll$',
      '011   0.0194   10.0.4.20     10.0.4.10     SMB2   142     Tree Connect Response: Access Granted (Admin)',
      '012   0.0210   10.0.4.10     10.0.4.20     SMB2   248     Create Request File: october_salaries.xlsx',
    ];

    if (!filter) {
      return {
        stdout: [
          '=== EkoSec Packet Lens (CLI) — PCAP: /mnt/evidence/EVD-2026-001.pcap ===',
          ...allPackets,
          '',
          'Tip: Launch the graphical "Packet Lens" app on your desktop for deep protocol decode.',
        ],
      };
    }

    const filtered = allPackets.filter((p, i) => i < 2 || p.toLowerCase().includes(filter));
    return {
      stdout: [`=== EkoSec Packet Lens (CLI) — Filter: '${filter}' ===`, ...filtered],
    };
  },
};

export const revviewCommand: TerminalCommandHandler = {
  name: 'revview',
  description: 'Inspects static binary strings & pseudocode of aster_agent_daemon.bin.',
  usage: 'revview [strings|decomp]',
  execute(args: string[]): TerminalCommandResult {
    const sub = args[0]?.toLowerCase();
    if (sub === 'strings') {
      return {
        stdout: [
          '=== Static String Extraction: aster_agent_daemon.bin ===',
          '[0x00401020] /api/v1/internal/assistant/query',
          '[0x00401050] svc-aster',
          '[0x00401080] corporate-admin',
          '[0x004010b0] \\\\filesrv-01\\payroll$',
          '[0x004010e0] oct_2026_ledger.xlsx',
          '[0x00401120] Authorization: Bearer eyJhbGciOiJIUzI1NiIsIn...',
          '[0x00401180] Error: Insufficient privilege check bypassed',
        ],
      };
    }

    return {
      stdout: [
        '=== EkoSec Rev Lens (CLI) — Static Binary Inspector ===',
        'Binary: /opt/tools/aster_agent_daemon.bin',
        'Format: ELF 64-bit LSB executable, x86-64',
        'SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        '',
        'Functions Identified:',
        '  0x00401200  main()',
        '  0x00401280  init_auth_session(user="svc-aster", role="corporate-admin")',
        '  0x00401340  query_smb_file(share="payroll$", file="october_salaries.xlsx")',
        '',
        'Run "revview strings" for extracted strings, or launch "Rev Lens" on your desktop for interactive decompilation.',
      ],
    };
  },
};

/**
 * Creates and initializes a TerminalCommandRegistry with the standard command set.
 */
export function createDefaultCommandRegistry(): TerminalCommandRegistry {
  const registry = new TerminalCommandRegistry();
  // Standard built-in system commands
  registry.register(helpCommand);
  registry.register(clearCommand);
  registry.register(whoamiCommand);
  registry.register(dateCommand);
  registry.register(statusCommand);
  registry.register(historyCommand);
  registry.register(catalogueCommand);

  // Virtual filesystem commands
  registry.register(pwdCommand);
  registry.register(lsCommand);
  registry.register(cdCommand);
  registry.register(catCommand);
  registry.register(grepCommand);
  registry.register(fileCommand);

  // Aliases & specialized cyber CLI tools
  registry.register(nmapCommand);
  registry.register(packetviewCommand);
  registry.register(revviewCommand);

  // M5 simulated cybersecurity tools
  for (const tool of createDefaultCyberTools()) {
    registry.register(createToolCommandHandler(tool));
  }

  return registry;
}
