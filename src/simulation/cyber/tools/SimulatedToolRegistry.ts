/**
 * Cyberlife — Simulated Security Tool Arsenal Registry
 *
 * Categorized cybersecurity tools inspired by ParrotOS and modern Linux security workstations.
 * Features honest status tracking: 'playable', 'partial', 'reference_only', 'planned'.
 * Strictly internal to Cyberlife's synthetic in-game data model.
 */

export type ToolCategory =
  | 'info_gathering'
  | 'network_security'
  | 'vulnerability_web'
  | 'attack_simulation'
  | 'blue_team_siem'
  | 'digital_forensics'
  | 'reverse_engineering'
  | 'purple_team'
  | 'reporting_utilities';

export type ToolAppType = 'gui' | 'terminal' | 'both';

export type ToolImplementationStatus = 'playable' | 'partial' | 'reference_only' | 'planned';

export type SimulatedTeamTrack = 'blue' | 'red' | 'purple' | 'shared';

export interface SimulatedToolDefinition {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly icon: string;
  readonly category: ToolCategory;
  readonly categoryLabel: string;
  readonly tracks: readonly SimulatedTeamTrack[];
  readonly description: string;
  readonly beginnerExplanation: string;
  readonly appType: ToolAppType;
  readonly canonicalCommand: string;
  readonly aliases: readonly string[];
  readonly status: ToolImplementationStatus;
  readonly statusBadge: string;
  readonly permissionsRequired: string;
  readonly datasetsUsed: readonly string[];
  readonly prerequisites: readonly string[];
  readonly linkedAppId?: string;
  readonly linkedExerciseId?: string;
  readonly realWorldReference?: string;
}

export const SIMULATED_TOOL_REGISTRY: readonly SimulatedToolDefinition[] = [
  // --------------------------------------------------------------------------
  // 1. Information Gathering & Asset Discovery
  // --------------------------------------------------------------------------
  {
    id: 'tool_netmap',
    name: 'EkoSec Netmap — Subnet & Host Discovery',
    shortName: 'Netmap',
    icon: '🗺️',
    category: 'info_gathering',
    categoryLabel: 'Information Gathering',
    tracks: ['blue', 'red', 'shared'],
    description:
      'Discovers reachable network nodes, IP assignments, MAC addresses, and host operational roles across the Marina Tower cluster.',
    beginnerExplanation:
      'Like real-world Nmap ping scans, Netmap checks which computers are active on a network subnet so you know what systems exist.',
    appType: 'both',
    canonicalCommand: 'netmap',
    aliases: ['nmap', 'ping-sweep', 'hostscan'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'Standard analyst network read rights',
    datasetsUsed: ['fictionalHosts (10.0.4.0/24 subnet)'],
    prerequisites: ['cat_shared_networking'],
    linkedExerciseId: 'ex_red_authorized_recon_path',
    realWorldReference: 'Nmap / ARP-scan',
  },
  {
    id: 'tool_svcscan',
    name: 'EkoSec SvcScan — Service Enumerator & Banner Grabber',
    shortName: 'SvcScan',
    icon: '📡',
    category: 'info_gathering',
    categoryLabel: 'Information Gathering',
    tracks: ['blue', 'red', 'shared'],
    description:
      'Inspects open TCP listener ports on target nodes, pulls protocol banners, identifies daemon versions, and flags approved vs. rogue services.',
    beginnerExplanation:
      'Similar to Nmap service version detection (-sV), SvcScan queries active ports (like HTTP port 80 or SMB port 445) to see what software is running.',
    appType: 'both',
    canonicalCommand: 'svcscan',
    aliases: ['bannergrab', 'portscan'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'Standard analyst probe rights',
    datasetsUsed: ['fictionalServices (filesrv-01, app-portal-01, etc.)'],
    prerequisites: ['cat_shared_networking', 'cat_red_recon_surface'],
    linkedExerciseId: 'ex_red_authorized_recon_path',
    realWorldReference: 'Nmap -sV / Amass',
  },

  // --------------------------------------------------------------------------
  // 2. Network Security & Traffic Analysis
  // --------------------------------------------------------------------------
  {
    id: 'tool_packet_lens',
    name: 'Packet Lens — Fictional PCAP & Protocol Stream Inspector',
    shortName: 'Packet Lens',
    icon: '🌊',
    category: 'network_security',
    categoryLabel: 'Network Traffic Analysis',
    tracks: ['blue', 'purple', 'shared'],
    description:
      'Inspects captured synthetic Ethernet frames and IP packets, decodes TCP handshakes and SMB protocol negotiations, and highlights suspicious payloads.',
    beginnerExplanation:
      'Inspired by Wireshark, Packet Lens lets you inspect digital packets traveling across the wire to catch unauthorized file transfers or credentials.',
    appType: 'both',
    canonicalCommand: 'packetview',
    aliases: ['wireshark', 'tcpdump', 'tshark'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'PCAP read permissions (/mnt/evidence)',
    datasetsUsed: ['EVD-2026-001.pcap (Synthetic SMB session packet trace)'],
    prerequisites: ['cat_shared_networking'],
    linkedAppId: 'packetLens',
    realWorldReference: 'Wireshark / tcpdump',
  },
  {
    id: 'tool_firewall_audit',
    name: 'Firewall Policy & Perimeter ACL Auditor',
    shortName: 'FW Policy',
    icon: '🧱',
    category: 'network_security',
    categoryLabel: 'Network Traffic Analysis',
    tracks: ['blue'],
    description:
      'Reviews fictional iptables/nftables rulesets, ingress filters, and subnet isolation boundaries.',
    beginnerExplanation:
      'Reviews the rules that determine which computers can talk to which servers, helping defenders spot accidental open doorways.',
    appType: 'terminal',
    canonicalCommand: 'status firewall',
    aliases: ['iptables', 'nftables'],
    status: 'partial',
    statusBadge: 'PARTIAL',
    permissionsRequired: 'Security auditor read rights',
    datasetsUsed: ['access.conf'],
    prerequisites: ['cat_blue_network_defense'],
    realWorldReference: 'pfsense / iptables',
  },

  // --------------------------------------------------------------------------
  // 3. Blue Team Operations & SIEM Telemetry
  // --------------------------------------------------------------------------
  {
    id: 'tool_logview',
    name: 'EkoSec LogView — SIEM Event Correlation Engine',
    shortName: 'LogView',
    icon: '📜',
    category: 'blue_team_siem',
    categoryLabel: 'Blue Team Operations',
    tracks: ['blue', 'purple'],
    description:
      'Correlates multi-source event telemetry, queries failed authentication spikes, and identifies anomalous after-hours credential usage.',
    beginnerExplanation:
      'Like an enterprise SIEM (Splunk, Elastic), LogView aggregates server and firewall logs into one searchable screen so analysts can spot break-ins.',
    appType: 'both',
    canonicalCommand: 'logview',
    aliases: ['siem', 'splunk-sim', 'elk'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'SOC analyst log read permissions',
    datasetsUsed: ['fictionalLogs (AUTH_FAILURE, AUTH_SUCCESS, SMB events)'],
    prerequisites: ['cat_blue_soc_triage'],
    linkedExerciseId: 'ex_blue_soc_log_triage',
    realWorldReference: 'Splunk / Wazuh / Elastic Security',
  },
  {
    id: 'tool_incident_portal',
    name: 'Incident Response Portal — The Aster Incident',
    shortName: 'Incident Portal',
    icon: '🚨',
    category: 'blue_team_siem',
    categoryLabel: 'Blue Team Operations',
    tracks: ['blue'],
    description:
      'Coordinates the 6-phase Incident Response lifecycle: triage, evidence verification, service isolation, permission remediation, and final reporting.',
    beginnerExplanation:
      'The central incident command center where you investigate active breaches, isolate compromised systems, and restore business operations.',
    appType: 'gui',
    canonicalCommand: 'incident',
    aliases: ['ir', 'aster-incident'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'Incident Commander role',
    datasetsUsed: ['The Aster Incident mission state'],
    prerequisites: ['cat_blue_soc_triage'],
    linkedAppId: 'incident',
    realWorldReference: 'TheHive / Jira SecOps',
  },

  // --------------------------------------------------------------------------
  // 4. Red Team & Attack Simulation
  // --------------------------------------------------------------------------
  {
    id: 'tool_recon_path',
    name: 'Attack Surface & Attack-Path Assessment Console',
    shortName: 'Attack Path',
    icon: '🎯',
    category: 'attack_simulation',
    categoryLabel: 'Offensive Simulation',
    tracks: ['red'],
    description:
      'Simulates authorized reconnaissance under strict Rules of Engagement (#ROE-2026-AST), modeling attack paths from web entry points to backend payroll shares.',
    beginnerExplanation:
      'Helps authorized penetration testers discover how an attacker could hop from an internet portal into confidential internal file shares.',
    appType: 'gui',
    canonicalCommand: 'catalogue exercises',
    aliases: ['recon-path', 'bloodhound-sim'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'Signed Rules of Engagement (ROE-2026-AST)',
    datasetsUsed: ['10.0.4.0/24 Staging Cluster Topology'],
    prerequisites: ['cat_red_recon_surface'],
    linkedExerciseId: 'ex_red_authorized_recon_path',
    realWorldReference: 'BloodHound / Metasploit Framework',
  },

  // --------------------------------------------------------------------------
  // 5. Purple Team & Detection Engineering
  // --------------------------------------------------------------------------
  {
    id: 'tool_rule_tuner',
    name: 'EkoSec Detection Rule Editor & SIEM Tuner',
    shortName: 'SIEM Tuner',
    icon: '⚙️',
    category: 'purple_team',
    categoryLabel: 'Purple Team Engineering',
    tracks: ['purple'],
    description:
      'Configures and tests SIEM detection rule logic (event source, operator, value, severity) to close telemetry blind spots with 0 false positives.',
    beginnerExplanation:
      'The detection engineering tool where defenders write rules that automatically sound the alarm when suspicious commands or lateral movement happen.',
    appType: 'both',
    canonicalCommand: 'catalogue',
    aliases: ['rule-editor', 'sigma-sim', 'yara-sim'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'Detection Engineer write permissions',
    datasetsUsed: ['DEFAULT_DETECTION_RULES', 'PURPLE_SMB_LATERAL_SCENARIO'],
    prerequisites: ['cat_purple_detection_validation'],
    linkedAppId: 'ruleTuner',
    linkedExerciseId: 'ex_purple_detection_tuning_replay',
    realWorldReference: 'Sigma Rules / Splunk Detection Editor',
  },

  // --------------------------------------------------------------------------
  // 6. Reverse Engineering & Static Analysis
  // --------------------------------------------------------------------------
  {
    id: 'tool_rev_lens',
    name: 'Rev Lens — Static Binary & Strings Decompiler',
    shortName: 'Rev Lens',
    icon: '🔬',
    category: 'reverse_engineering',
    categoryLabel: 'Reverse Engineering',
    tracks: ['blue', 'red', 'shared'],
    description:
      'Performs static inspection on synthetic executable sample aster_agent_daemon.bin: string extraction, ELF header metadata, and pseudocode disassembly.',
    beginnerExplanation:
      'Inspired by Ghidra and radare2, Rev Lens analyzes software files without running them to see what hardcoded passwords, web addresses, or commands they contain.',
    appType: 'both',
    canonicalCommand: 'revview',
    aliases: ['ghidra', 'radare2', 'strings', 'objdump'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'Binary analysis sandbox access',
    datasetsUsed: ['aster_agent_daemon.bin (Synthetic ELF binary sample)'],
    prerequisites: ['cat_shared_os_internals'],
    linkedAppId: 'revLens',
    realWorldReference: 'Ghidra / IDA Pro / radare2',
  },

  // --------------------------------------------------------------------------
  // 7. Digital Forensics
  // --------------------------------------------------------------------------
  {
    id: 'tool_evidence',
    name: 'EkoSec Evidence Vault & Cryptographic Ledger',
    shortName: 'Evidence Vault',
    icon: '💾',
    category: 'digital_forensics',
    categoryLabel: 'Digital Forensics',
    tracks: ['blue'],
    description:
      'Manages cryptographic SHA-256 evidence digests, maintains the legal chain of custody, and validates artifact tampering status.',
    beginnerExplanation:
      'Like real forensic tools (Autopsy), Evidence Vault verifies that digital proof hasn’t been altered and documents who handled each file.',
    appType: 'both',
    canonicalCommand: 'evidence',
    aliases: ['autopsy-sim', 'sha256sum'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'Forensics Investigator certification',
    datasetsUsed: ['fictionalEvidence ledger (EVD-2026-001, EVD-2026-004)'],
    prerequisites: ['cat_shared_crypto', 'cat_blue_ir_forensics'],
    realWorldReference: 'Autopsy / Volatility',
  },

  // --------------------------------------------------------------------------
  // 8. System Utilities & Virtual Filesystem
  // --------------------------------------------------------------------------
  {
    id: 'tool_file_manager',
    name: 'EkoSec Files — Virtual Filesystem Browser',
    shortName: 'Files',
    icon: '📁',
    category: 'reporting_utilities',
    categoryLabel: 'System Utilities',
    tracks: ['shared'],
    description:
      'Graphical file manager browsing the synthetic workstation filesystem (/home, /var/log, /mnt/evidence, /etc/security, /opt/tools).',
    beginnerExplanation:
      'Your desktop file explorer to browse investigation notes, log files, configuration files, and forensic artifacts safely.',
    appType: 'gui',
    canonicalCommand: 'ls',
    aliases: ['file-manager', 'nautilus', 'caja'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'Analyst file read/write rights',
    datasetsUsed: ['virtualFilesystem (/home, /var, /mnt, /etc, /opt)'],
    prerequisites: [],
    linkedAppId: 'files',
    realWorldReference: 'Caja / Nautilus / Thunar',
  },
  {
    id: 'tool_terminal',
    name: 'EkoSec Multi-Tab Terminal Emulator',
    shortName: 'Terminal',
    icon: '💻',
    category: 'reporting_utilities',
    categoryLabel: 'System Utilities',
    tracks: ['shared'],
    description:
      'Multi-tab Linux terminal prompt supporting manual command execution, educational syntax chips, command history, and aliases.',
    beginnerExplanation:
      'The hacker’s primary interface: enter commands manually to explore networks, query logs, and run security tools.',
    appType: 'both',
    canonicalCommand: 'help',
    aliases: ['bash', 'sh', 'term', 'konsole'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'Interactive shell access',
    datasetsUsed: ['TerminalCommandRegistry'],
    prerequisites: [],
    linkedAppId: 'terminal',
    realWorldReference: 'MATE Terminal / Terminator / Bash',
  },
  {
    id: 'tool_career',
    name: 'Lagos Island Cyber Career Hub & Job Board',
    shortName: 'Career Hub',
    icon: '💼',
    category: 'reporting_utilities',
    categoryLabel: 'System Utilities',
    tracks: ['shared'],
    description:
      'Manage cybersecurity career paths across Blue, Red, and Purple teams, accept verified tickets, level up skills, and audit finances in Naira.',
    beginnerExplanation:
      'Track your professional progress as an infosec analyst in Lagos, take on paid contracts, and purchase gear upgrades.',
    appType: 'gui',
    canonicalCommand: 'career',
    aliases: ['jobs', 'market'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'Registered Security Professional',
    datasetsUsed: ['careerDefinitions', 'jobDefinitions', 'skillDefinitions'],
    prerequisites: [],
    linkedAppId: 'career',
  },
  {
    id: 'tool_field_guide',
    name: 'Cyberlife Field Guide & Command Manual',
    shortName: 'Field Guide',
    icon: '📖',
    category: 'reporting_utilities',
    categoryLabel: 'System Utilities',
    tracks: ['shared'],
    description:
      'Comprehensive, beginner-accessible manual explaining cybersecurity terminology, command syntax, network concepts, and career advice.',
    beginnerExplanation:
      'Your interactive cyber handbook that teaches you what commands mean and how to think like a professional security engineer.',
    appType: 'gui',
    canonicalCommand: 'help',
    aliases: ['man', 'guide', 'docs'],
    status: 'playable',
    statusBadge: 'PLAYABLE',
    permissionsRequired: 'None',
    datasetsUsed: ['fieldGuideCategories'],
    prerequisites: [],
    linkedAppId: 'fieldGuide',
  },
];

export const SIMULATED_TOOLS = SIMULATED_TOOL_REGISTRY;

/**
 * Gets tools by category.
 */
export function getToolsByCategory(category: ToolCategory): readonly SimulatedToolDefinition[] {
  return SIMULATED_TOOL_REGISTRY.filter(t => t.category === category);
}

/**
 * Gets tools by cybersecurity team track.
 */
export function getToolsByTrack(
  track: 'blue' | 'red' | 'purple' | 'shared'
): readonly SimulatedToolDefinition[] {
  return SIMULATED_TOOL_REGISTRY.filter(t => t.tracks.includes(track));
}

/**
 * Gets tools by honest implementation status.
 */
export function getToolsByStatus(
  status: ToolImplementationStatus
): readonly SimulatedToolDefinition[] {
  return SIMULATED_TOOL_REGISTRY.filter(t => t.status === status);
}

/**
 * Resolves a simulated tool by canonical command name or alias.
 */
export function findToolByCommandOrAlias(cmd: string): SimulatedToolDefinition | undefined {
  const q = cmd.trim().toLowerCase();
  return SIMULATED_TOOL_REGISTRY.find(
    t => t.canonicalCommand.toLowerCase() === q || t.aliases.some(a => a.toLowerCase() === q)
  );
}

/**
 * Resolves a simulated tool by its linked desktop application ID.
 */
export function findToolByLinkedAppId(appId: string): SimulatedToolDefinition | undefined {
  return SIMULATED_TOOL_REGISTRY.find(t => t.linkedAppId === appId);
}

/**
 * Searches tools by query text (name, command, description, aliases).
 */
export function searchTools(query: string): readonly SimulatedToolDefinition[] {
  const q = query.trim().toLowerCase();
  if (!q) return SIMULATED_TOOL_REGISTRY;

  return SIMULATED_TOOL_REGISTRY.filter(
    t =>
      t.name.toLowerCase().includes(q) ||
      t.shortName.toLowerCase().includes(q) ||
      t.canonicalCommand.toLowerCase().includes(q) ||
      t.categoryLabel.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.aliases.some(a => a.toLowerCase().includes(q))
  );
}
