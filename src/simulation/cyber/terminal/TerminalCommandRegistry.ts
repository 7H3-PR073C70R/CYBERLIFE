/**
 * Cyberlife — Terminal Command Registry
 *
 * Manages registered synthetic command handlers.
 * Extensible for M5 cybersecurity tools without changing core parser.
 */

import { TerminalCommandHandler, TerminalCommandResult, TerminalExecutionContext } from './types';
import { createDefaultCyberTools, createToolCommandHandler } from '../tools';
import { virtualFilesystem, resolveVirtualPath } from '../filesystem';
import { ExploitLabEngine } from '../offensive/ExploitLabEngine';
import { WebProxyEngine } from '../webproxy/WebProxyEngine';
import { SocialPretextEngine } from '../social/SocialPretextEngine';
import { SYNTHETIC_TRAFFIC_EVENTS } from '../network/trafficFixtures';
import { filterTrafficEvents } from '../network/trafficAnalyzer';
import { ProtocolType } from '../network/types';
import { THREAT_INTEL_RECORDS } from '../threatintel/threatIntelFixtures';
import { searchThreatRecords, correlateAllTraffic } from '../threatintel/threatCorrelationEngine';
import { SIMULATED_NETWORK_NODES, NETWORK_SEGMENTS } from '../network/topologyFixtures';

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
        '  • Use "help <command>" (e.g. "help netmap") for syntax and guidance.',
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
        "💡 [EkoSec Educational Alias] 'nmap' maps to Cyberlife simulated tool 'netmap' (Orion OS / Linux Nmap equivalent).",
        ...subResult.stdout,
      ],
    };
  },
};

export const packetviewCommand: TerminalCommandHandler = {
  name: 'packetview',
  description: 'Inspects synthetic packet capture stream with protocol and text filtering.',
  usage: 'packetview [filter] [--proto <type>]',
  execute(args: string[]): TerminalCommandResult {
    const protoArgIdx = args.findIndex(a => a === '--proto');
    let protoFilter: ProtocolType | undefined;
    let query = '';

    if (protoArgIdx !== -1 && args[protoArgIdx + 1]) {
      protoFilter = args[protoArgIdx + 1]!.toUpperCase() as ProtocolType;
      query = args.filter((_, idx) => idx !== protoArgIdx && idx !== protoArgIdx + 1).join(' ');
    } else {
      query = args.join(' ');
    }

    const filtered = filterTrafficEvents(SYNTHETIC_TRAFFIC_EVENTS, {
      protocol: protoFilter,
      searchQuery: query || undefined,
    });

    const lines = [
      `=== EkoSec Packet Lens (CLI) — ${filtered.length} packets displayed ===`,
      'No.   Time          Source        Destination   Proto  Length  Info',
      '--------------------------------------------------------------------------------',
      ...filtered.map(p => {
        const no = String(p.sequenceNo).padStart(3, '0');
        const time = p.formattedTime.padEnd(13, ' ');
        const src = (p.sourceIp + (p.sourcePort ? `:${p.sourcePort}` : '')).padEnd(20, ' ');
        const dst = (p.destinationIp + (p.destinationPort ? `:${p.destinationPort}` : '')).padEnd(20, ' ');
        const proto = p.protocol.padEnd(6, ' ');
        const len = String(p.lengthBytes).padStart(6, ' ');
        const info = p.summaryInfo;
        return `${no}   ${time} ${src} ${dst} ${proto} ${len}  ${info}`;
      }),
      '',
      'Tip: Launch the graphical "Packet Lens" app on your desktop for deep multi-layer dissection and hex dump.',
    ];

    return { stdout: lines };
  },
};

export const threatintelCommand: TerminalCommandHandler = {
  name: 'threatintel',
  description: 'Searches local threat intelligence indicators and correlates with observed traffic.',
  usage: 'threatintel [search <query> | show <id> | correlate]',
  execute(args: string[]): TerminalCommandResult {
    const sub = args[0]?.toLowerCase() ?? 'list';

    if (sub === 'search') {
      const q = args.slice(1).join(' ');
      const results = searchThreatRecords(THREAT_INTEL_RECORDS, { queryText: q });
      return {
        stdout: [
          `=== Local Threat Intelligence Database — Search: "${q}" (${results.length} matches) ===`,
          ...results.map(r => `[${r.id}] ${r.type} | ${r.value} | Severity: ${r.severity} | Campaign: ${r.campaign}`),
        ],
      };
    }

    if (sub === 'show') {
      const id = args[1]?.trim();
      const rec = THREAT_INTEL_RECORDS.find(r => r.id === id || r.value === id);
      if (!rec) {
        return {
          stdout: [],
          stderr: [`Threat indicator not found: "${id}". Use "threatintel" to list available records.`],
        };
      }
      return {
        stdout: [
          `=== Threat Indicator Details: ${rec.id} ===`,
          `Value:        ${rec.value}`,
          `Type:         ${rec.type}`,
          `Category:     ${rec.category}`,
          `Severity:     ${rec.severity}`,
          `Confidence:   ${rec.confidenceScore}/100`,
          `Campaign:     ${rec.campaign}`,
          `Threat Actor: ${rec.threatActor}`,
          `Publisher:    ${rec.provenance.publisher} (${rec.provenance.reportReference})`,
          `Description:  ${rec.description}`,
          `MITRE:        ${rec.mitreTechniques.join(', ')}`,
          `Known Benign: ${rec.isKnownBenignAllowlist ? 'YES (Allowlist)' : 'NO (Adversary)'}`,
        ],
      };
    }

    if (sub === 'correlate') {
      const matches = correlateAllTraffic(SYNTHETIC_TRAFFIC_EVENTS, THREAT_INTEL_RECORDS);
      return {
        stdout: [
          `=== Real-Time Threat Correlation (${matches.length} active indicators matched in traffic) ===`,
          ...matches.map(m =>
            `[MATCH ${m.matchStrength}] Event: ${m.matchedEventId} | Indicator: ${m.indicatorValue} (${m.severity}) | ${m.reasonExplanation}`
          ),
        ],
      };
    }

    // Default: list all records
    return {
      stdout: [
        `=== Local Threat Intelligence Database (${THREAT_INTEL_RECORDS.length} indicators) ===`,
        ...THREAT_INTEL_RECORDS.map(r =>
          `[${r.id}] ${r.type.padEnd(16, ' ')} ${r.value.padEnd(36, ' ')} [${r.severity.padEnd(8, ' ')}] ${r.campaign}`
        ),
        '',
        'Usage: threatintel search <term> | threatintel show <id> | threatintel correlate',
      ],
    };
  },
};

export const topologyCommand: TerminalCommandHandler = {
  name: 'topology',
  description: 'Displays simulated network topology segments and host assets.',
  usage: 'topology [segment | host <hostname>]',
  execute(args: string[]): TerminalCommandResult {
    const sub = args[0]?.toLowerCase();
    if (sub === 'host') {
      const target = args[1]?.toLowerCase();
      const node = SIMULATED_NETWORK_NODES.find(n => n.id.toLowerCase() === target || n.hostname.toLowerCase().includes(target ?? ''));
      if (!node) {
        return {
          stdout: [],
          stderr: [`Host not found: "${target}".`],
        };
      }
      return {
        stdout: [
          `=== Host Details: ${node.hostname} (${node.ipAddress}) ===`,
          `FQDN:         ${node.fqdn}`,
          `Segment:      ${node.segmentId}`,
          `Role:         ${node.roleLabel}`,
          `OS:           ${node.os}`,
          `Status:       ${node.status}`,
          `Location:     ${node.location}`,
          `Relevance:    ${node.investigationRelevance}`,
          `Services:     ${node.services.map(s => `${s.port}/${s.protocol} (${s.name})`).join(', ') || 'None'}`,
          `Description:  ${node.description}`,
        ],
      };
    }

    return {
      stdout: [
        '=== Marina Tower Network Topology Segments ===',
        ...NETWORK_SEGMENTS.map(s => `[${s.id}] ${s.name} (${s.cidr}, VLAN ${s.vlanId}) — ${s.securityZone}`),
        '',
        'Hosts inventory:',
        ...SIMULATED_NETWORK_NODES.map(n =>
          `  ${n.ipAddress.padEnd(15, ' ')} ${n.hostname.padEnd(24, ' ')} [${n.segmentId}] ${n.roleLabel}`
        ),
        '',
        'Usage: topology host <name/id> to view host details.',
      ],
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

export const exploitlabCommand: TerminalCommandHandler = {
  name: 'exploitlab',
  description: 'Authorized attack simulation lab & Metasploit-style vulnerability runner.',
  usage: 'exploitlab [scope|targets|modules|run|dryrun|retest|remediate] [targetId] [moduleId]',
  execute(args: string[], context: TerminalExecutionContext): TerminalCommandResult {
    const defaultExploitEngine = new ExploitLabEngine();
    const sub = args[0]?.toLowerCase() || 'scope';

    if (sub === 'scope') {
      const roe = defaultExploitEngine.getActiveEngagement();
      const inScope = roe.inScopeTargets.map(t => `  - [${t.targetType}] ${t.identifier}: ${t.description}`);
      const prohibited = roe.prohibitedTechniques.map(p => `  - ${p}`);
      return {
        stdout: [
          '=== EkoSec Exploit Lab // Rules of Engagement Scope ===',
          `Engagement ID: ${roe.engagementId}`,
          `Client:        ${roe.clientName}`,
          `Assessor:      ${roe.authorizedAssessorName}`,
          `Status:        ${roe.isSignedAndActive ? 'ACTIVE / SIGNED' : 'EXPIRED'}`,
          `Validity:      ${roe.effectiveStartDate} to ${roe.effectiveEndDate}`,
          '',
          'In-Scope Targets:',
          ...inScope,
          '',
          'Prohibited Techniques (Violations blocked by engine):',
          ...prohibited,
          '',
          'Usage: "exploitlab targets", "exploitlab modules", "exploitlab run <target> <module>"',
        ],
      };
    }

    if (sub === 'targets') {
      const targets = defaultExploitEngine.getTargets();
      const rows = targets.map(
        t =>
          `${t.id.padEnd(14)}${t.ipAddress.padEnd(16)}${t.primaryService.padEnd(30)}${t.isVulnerable ? 'VULNERABLE' : 'HARDENED/PATCHED'}`
      );
      return {
        stdout: [
          '=== EkoSec Exploit Lab // Authorized Target Inventory ===',
          'TARGET ID     IP ADDRESS      PRIMARY SERVICE               STATUS',
          '--------------------------------------------------------------------------------',
          ...rows,
          '--------------------------------------------------------------------------------',
          'Tip: Launch "Exploit Lab" GUI app for interactive exploit payloads and traces.',
        ],
      };
    }

    if (sub === 'modules') {
      const modules = defaultExploitEngine.getModules();
      const rows = modules.map(
        m =>
          `${m.id.padEnd(26)}${m.cve.padEnd(20)}${m.severity.padEnd(10)}${m.targetService}`
      );
      return {
        stdout: [
          '=== EkoSec Exploit Lab // Verified Simulation Modules ===',
          'MODULE ID                 CVE ID              SEVERITY  TARGET SERVICE',
          '--------------------------------------------------------------------------------',
          ...rows,
          '--------------------------------------------------------------------------------',
          'Usage: exploitlab dryrun <targetId> <moduleId>',
          '       exploitlab run <targetId> <moduleId>',
        ],
      };
    }

    if (sub === 'dryrun' || sub === 'run') {
      const targetId = args[1];
      const moduleId = args[2];
      if (!targetId || !moduleId) {
        return {
          isError: true,
          stdout: [
            `Usage: exploitlab ${sub} <targetId> <moduleId>`,
            'Example: exploitlab run filesrv-01 mod_smb_tree_hijack',
          ],
        };
      }

      const result = defaultExploitEngine.executeModule({
        targetId,
        moduleId,
        mode: sub === 'dryrun' ? 'dry_run' : 'simulation',
        actorName: context.currentUser.username,
      });

      return {
        isError: result.status.startsWith('BLOCKED'),
        stdout: [...result.executionLogs],
      };
    }

    if (sub === 'retest') {
      const targetId = args[1];
      const moduleId = args[2];
      if (!targetId || !moduleId) {
        return {
          isError: true,
          stdout: ['Usage: exploitlab retest <targetId> <moduleId>'],
        };
      }

      const result = defaultExploitEngine.retestTarget(
        targetId,
        moduleId,
        context.currentUser.username
      );

      return {
        stdout: [...result.executionLogs],
      };
    }

    if (sub === 'remediate') {
      const targetId = args[1];
      const moduleId = args[2];
      if (!targetId || !moduleId) {
        return {
          isError: true,
          stdout: ['Usage: exploitlab remediate <targetId> <moduleId>'],
        };
      }

      const patchRes = defaultExploitEngine.applyRemediation({
        targetId,
        moduleId,
        patchTitle: `Security Hardening Configuration for ${targetId}`,
        patchDescription: `Applied patch closing ${moduleId}`,
        configChanges: ['Restrict anonymous session bind', 'Enforce authentication challenge'],
      });

      return {
        stdout: [
          `[+] Remediation Applied: ${patchRes.message}`,
          'Run "exploitlab retest ' + targetId + ' ' + moduleId + '" to verify the fix.',
        ],
      };
    }

    return {
      isError: true,
      stdout: [
        `Unknown subcommand '${sub}'. Available: scope, targets, modules, dryrun, run, retest, remediate`,
      ],
    };
  },
};

export const webproxyCommand: TerminalCommandHandler = {
  name: 'webproxy',
  description: 'Simulated web application security proxy & request tamper console.',
  usage: 'webproxy [list|inspect|replay] [txId]',
  execute(args: string[]): TerminalCommandResult {
    const defaultWebProxyEngine = new WebProxyEngine();
    const sub = args[0]?.toLowerCase() || 'list';

    if (sub === 'list') {
      const txs = defaultWebProxyEngine.getTransactions();
      const rows = txs.map(
        tx =>
          `${tx.id.padEnd(8)}${tx.originalRequest.method.padEnd(8)}${String(tx.originalResponse.statusCode).padEnd(8)}${tx.originalRequest.path.padEnd(30)}${tx.tags.join(', ')}`
      );
      return {
        stdout: [
          '=== EkoSec Web Application Proxy // Captured Transactions ===',
          'ID      METHOD  STATUS  PATH                          TAGS',
          '--------------------------------------------------------------------------------',
          ...rows,
          '--------------------------------------------------------------------------------',
          'Usage: webproxy inspect <txId> | webproxy replay <txId>',
          'Tip: Launch the graphical "Web Proxy" app for side-by-side tamper and diff views.',
        ],
      };
    }

    if (sub === 'inspect') {
      const txId = args[1] || 'tx-001';
      const tx = defaultWebProxyEngine.getTransaction(txId);
      if (!tx) {
        return {
          isError: true,
          stdout: [`Transaction '${txId}' not found. Use "webproxy list" to view buffer.`],
        };
      }

      return {
        stdout: [
          `=== Web Proxy Transaction Details: ${tx.id} ===`,
          `URL:    ${tx.originalRequest.method} ${tx.originalRequest.url}`,
          `Host:   ${tx.targetHost}:${tx.targetPort} (${tx.appId})`,
          'Request Headers:',
          ...Object.entries(tx.originalRequest.headers).map(([k, v]) => `  ${k}: ${v}`),
          '',
          `Response: ${tx.originalResponse.statusCode} ${tx.originalResponse.statusText} (${tx.originalResponse.responseTimeMs}ms)`,
          'Response Headers:',
          ...Object.entries(tx.originalResponse.headers).map(([k, v]) => `  ${k}: ${v}`),
          '',
          'Response Body:',
          tx.originalResponse.body,
        ],
      };
    }

    if (sub === 'replay') {
      const txId = args[1] || 'tx-001';
      const tx = defaultWebProxyEngine.getTransaction(txId);
      if (!tx) {
        return {
          isError: true,
          stdout: [`Transaction '${txId}' not found.`],
        };
      }

      const tamperArg = args[2];
      const modifiedReq = { ...tx.originalRequest };
      if (tamperArg && tamperArg.includes('=')) {
        const eqIdx = tamperArg.indexOf('=');
        const k = tamperArg.substring(0, eqIdx);
        const v = tamperArg.substring(eqIdx + 1);
        modifiedReq.queryParams = { ...modifiedReq.queryParams, [k]: v };
        modifiedReq.url = `${modifiedReq.path}?${encodeURIComponent(k)}=${encodeURIComponent(v)}`;
      }

      const result = defaultWebProxyEngine.replayRequest(txId, modifiedReq);
      return {
        stdout: [
          `[+] Replayed Transaction ${txId} against ${tx.targetHost}`,
          `Status:   ${result.transaction.modifiedResponse?.statusCode} ${result.transaction.modifiedResponse?.statusText}`,
          `Diff:     ${result.transaction.diff?.securityObservation ?? 'Completed'}`,
          `Response Body:`,
          result.transaction.modifiedResponse?.body ?? '(empty)',
        ],
      };
    }

    return {
      isError: true,
      stdout: ['Usage: webproxy [list|inspect|replay] [txId]'],
    };
  },
};

export const pretextCommand: TerminalCommandHandler = {
  name: 'pretext',
  description: 'Social engineering and human-centered security scenario console.',
  usage: 'pretext [list|start|choose] [scenarioId] [optionId]',
  execute(args: string[]): TerminalCommandResult {
    const defaultSocialEngine = new SocialPretextEngine();
    const sub = args[0]?.toLowerCase() || 'list';

    if (sub === 'list') {
      const scenarios = defaultSocialEngine.getAllScenarios();
      const rows = scenarios.map(
        s => `[${s.id}] ${s.title}\n  Venue: ${s.venueLabel} | Target: ${s.targetNpc.name}`
      );
      return {
        stdout: [
          '=== EkoSec Social Pretexting & Human Attack Surface Scenarios ===',
          ...rows,
          '',
          'Usage: pretext start <scenarioId>',
          'Tip: Launch the graphical "Pretext Lab" app for real-time trust meters and audio.',
        ],
      };
    }

    if (sub === 'start') {
      const scenarioId = args[1] || 'scen_reception_courier';
      const scenario = defaultSocialEngine.getScenario(scenarioId);
      if (!scenario) {
        return {
          isError: true,
          stdout: [`Scenario '${scenarioId}' not found. Use "pretext list" to view scenarios.`],
        };
      }

      const session = defaultSocialEngine.startEncounter(scenarioId);
      const node = scenario.nodes[session.currentNodeId];
      if (!node) {
        return {
          isError: true,
          stdout: [`Starting node '${session.currentNodeId}' not found.`],
        };
      }
      const optLines =
        node.options?.map((o, idx) => `  [${idx + 1}] (${o.id}): "${o.text}" [${o.tone}]`) ?? [];

      return {
        stdout: [
          `=== Encounter Started: ${scenario.title} ===`,
          `Venue:    ${scenario.venueLabel}`,
          `Persona:  ${scenario.targetNpc.name} (${scenario.targetNpc.title})`,
          `Briefing: ${scenario.situationBriefing}`,
          '--------------------------------------------------------------------------------',
          `Metrics:  Trust=${session.metrics.trust} | Credibility=${session.metrics.credibility} | Authority=${session.metrics.authority} | Suspicion=${session.metrics.suspicion}`,
          '--------------------------------------------------------------------------------',
          `${node.speakerName}: "${node.text}"`,
          '',
          'Options:',
          ...optLines,
          '',
          `To choose, run: pretext choose ${scenarioId} <optionId>`,
        ],
      };
    }

    if (sub === 'choose') {
      const scenarioId = args[1];
      const optionId = args[2];
      if (!scenarioId || !optionId) {
        return {
          isError: true,
          stdout: ['Usage: pretext choose <scenarioId> <optionId>'],
        };
      }

      defaultSocialEngine.startEncounter(scenarioId);
      const session = defaultSocialEngine.selectOption(scenarioId, optionId);
      const scenario = defaultSocialEngine.getScenario(scenarioId);
      const node = scenario?.nodes[session.currentNodeId];

      const out = [
        `[+] Selected Option: ${optionId}`,
        `Metrics: Trust=${session.metrics.trust} | Credibility=${session.metrics.credibility} | Authority=${session.metrics.authority} | Suspicion=${session.metrics.suspicion}`,
        '--------------------------------------------------------------------------------',
      ];

      if (node) {
        out.push(`${node.speakerName}: "${node.text}"`);
        if (node.options && node.options.length > 0) {
          out.push('');
          out.push('Next Options:');
          for (const o of node.options) {
            out.push(`  - (${o.id}): "${o.text}"`);
          }
        }
      }

      if (session.isCompleted && session.finalOutcome) {
        out.push('');
        out.push('====================================================================');
        out.push(`SCENARIO OUTCOME: ${session.finalOutcome.title} [${session.finalOutcome.status}]`);
        out.push('====================================================================');
        out.push(session.finalOutcome.summary);
        out.push(
          `Rewards: +${session.finalOutcome.xpReward} XP, ₦${(session.finalOutcome.nairaRewardKobo / 100).toLocaleString()}`
        );
      }

      return { stdout: out };
    }

    return {
      isError: true,
      stdout: ['Usage: pretext [list|start|choose] [scenarioId] [optionId]'],
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
  registry.register(threatintelCommand);
  registry.register(topologyCommand);

  // M14 Authorized Offensive & Social Pretexting CLI tools
  registry.register(exploitlabCommand);
  registry.register(webproxyCommand);
  registry.register(pretextCommand);

  // M5 simulated cybersecurity tools
  for (const tool of createDefaultCyberTools()) {
    registry.register(createToolCommandHandler(tool));
  }

  return registry;
}

