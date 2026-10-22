/**
 * Cyberlife — Virtual Desktop Presentation Types
 */
import { OsIconName } from './icons/OsIcons';
import { OS_NAME } from './osBranding';

export type AppId =
  | 'terminal'
  | 'fieldGuide'
  | 'systemInfo'
  | 'notes'
  | 'activity'
  | 'incident'
  | 'contacts'
  | 'career'
  | 'saveManager'
  | 'helpCenter'
  | 'catalogue'
  | 'files'
  | 'packetLens'
  | 'revLens'
  | 'ruleTuner'
  | 'torBrowser'
  | 'onionChat'
  | 'securityNews'
  | 'exploitLab'
  | 'webProxy'
  | 'socialPretext'
  | 'defensiveOps'
  | 'redTeam'
  | 'bountyHub'
  | 'humanIntel';


export interface AppDefinition {
  id: AppId;
  title: string;
  shortTitle: string;
  icon: OsIconName | string;
  description: string;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
}

export interface WindowState {
  id: AppId;
  title: string;
  icon: OsIconName | string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  snapState?: 'left' | 'right' | null;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export const APP_REGISTRY: Record<AppId, AppDefinition> = {
  incident: {
    id: 'incident',
    title: 'Incident Response Portal — The Aster Incident',
    shortTitle: 'Incident Portal',
    icon: 'incident',
    description:
      'Manage investigation phases, review briefing, submit root-cause assessment, verify remediation, and complete incident report.',
    defaultSize: { width: 780, height: 560 },
    minSize: { width: 440, height: 340 },
  },
  career: {
    id: 'career',
    title: 'Career Hub, Job Board & Financial Ledger',
    shortTitle: 'Career & Market',
    icon: 'career',
    description:
      'Manage cybersecurity career path, accept verified tickets, level up skills, purchase hardware upgrades, and audit finances.',
    defaultSize: { width: 840, height: 580 },
    minSize: { width: 480, height: 380 },
  },
  terminal: {
    id: 'terminal',
    title: `${OS_NAME} Terminal`,
    shortTitle: 'Terminal',
    icon: 'terminal',
    description: 'Simulated command-line prompt for system navigation, diagnostics, and tools.',
    defaultSize: { width: 720, height: 480 },
    minSize: { width: 380, height: 280 },
  },
  fieldGuide: {
    id: 'fieldGuide',
    title: 'Cyberlife Field Guide',
    shortTitle: 'Field Guide',
    icon: 'fieldGuide',
    description:
      'Beginner-friendly reference guide explaining terminals, commands, and security basics.',
    defaultSize: { width: 680, height: 500 },
    minSize: { width: 380, height: 280 },
  },
  systemInfo: {
    id: 'systemInfo',
    title: 'System Information',
    shortTitle: 'System Info',
    icon: 'systemInfo',
    description:
      'Read-only fictional workstation specifications, kernel details, and virtual network status.',
    defaultSize: { width: 560, height: 440 },
    minSize: { width: 360, height: 260 },
  },
  notes: {
    id: 'notes',
    title: 'Security Notes & Memo',
    shortTitle: 'Notes',
    icon: 'notes',
    description:
      'Introductory orientation memo from Cedarline InfoSec and player session scratchpad.',
    defaultSize: { width: 580, height: 440 },
    minSize: { width: 360, height: 260 },
  },
  activity: {
    id: 'activity',
    title: 'Activity Director, Career Progression & Operations Hub',
    shortTitle: 'Activity Director',
    icon: 'activity',
    description:
      'Discover opportunities, track active objectives, resolve cybersecurity engagements, advance career goals, and inspect audit telemetry.',
    defaultSize: { width: 880, height: 600 },
    minSize: { width: 500, height: 400 },
  },
  contacts: {
    id: 'contacts',
    title: 'Lagos Social & Professional Directory',
    shortTitle: 'Contacts',
    icon: 'contacts',
    description:
      'Track Lagos Island professional contacts, colleagues, community relations, and schedules.',
    defaultSize: { width: 720, height: 500 },
    minSize: { width: 440, height: 320 },
  },
  saveManager: {
    id: 'saveManager',
    title: 'Persistence Vault & System Recovery',
    shortTitle: 'Save Vault',
    icon: 'saveManager',
    description:
      'Manage persistent save slots, audit integrity checksums, restore shadow crash backups, and start new game sessions.',
    defaultSize: { width: 780, height: 540 },
    minSize: { width: 440, height: 340 },
  },
  helpCenter: {
    id: 'helpCenter',
    title: 'Help Center & Searchable Knowledge Base',
    shortTitle: 'Help Center',
    icon: 'helpCenter',
    description:
      'Searchable guide to controls, commands, Aster Incident steps, career mechanics, and troubleshooting.',
    defaultSize: { width: 780, height: 540 },
    minSize: { width: 440, height: 340 },
  },
  catalogue: {
    id: 'catalogue',
    title: 'Cyber Catalogue — Blue, Red & Purple Team Tracks',
    shortTitle: 'Cyber Catalogue',
    icon: 'catalogue',
    description:
      'Structured cybersecurity learning catalogue spanning Blue defenders, Red attack simulators, Purple collaborative validation, and Shared foundations.',
    defaultSize: { width: 880, height: 600 },
    minSize: { width: 480, height: 380 },
  },
  files: {
    id: 'files',
    title: `${OS_NAME} File Manager — Sandboxed Virtual Filesystem`,
    shortTitle: 'Files',
    icon: 'files',
    description:
      'Explore synthetic directories (/home/analyst, /var/log, /mnt/evidence, /etc/security), inspect evidence, and manage virtual files.',
    defaultSize: { width: 780, height: 520 },
    minSize: { width: 440, height: 320 },
  },
  packetLens: {
    id: 'packetLens',
    title: 'Packet Lens — Protocol Decoder & Stream Analyzer',
    shortTitle: 'Packet Lens',
    icon: 'packetLens',
    description:
      'Wireshark-inspired simulated packet capture inspector for /mnt/evidence/EVD-2026-001.pcap with protocol decoding, filtering, and hex/ASCII views.',
    defaultSize: { width: 840, height: 560 },
    minSize: { width: 480, height: 360 },
  },
  revLens: {
    id: 'revLens',
    title: 'Rev Lens — Static Binary & Pseudocode Analyzer',
    shortTitle: 'Rev Lens',
    icon: 'revLens',
    description:
      'Ghidra-inspired static reverse-engineering viewer for aster_agent_daemon.bin featuring strings, decompiled pseudocode, and ELF header metadata.',
    defaultSize: { width: 840, height: 560 },
    minSize: { width: 480, height: 360 },
  },
  ruleTuner: {
    id: 'ruleTuner',
    title: 'Rule Tuner — Purple Team Detection Engineering Studio',
    shortTitle: 'Rule Tuner',
    icon: 'ruleTuner',
    description:
      'Detection engineering interface to author SIEM detection rules, tune alert thresholds, and replay synthetic attack scenarios to measure false positive/negative delta.',
    defaultSize: { width: 840, height: 580 },
    minSize: { width: 480, height: 380 },
  },
  torBrowser: {
    id: 'torBrowser',
    title: 'Tor Browser — Onion Dark Web Gateway',
    shortTitle: 'Tor Browser',
    icon: 'tor',
    description:
      'Simulated multi-hop onion routing browser for exploring fictional dark web directories, leak pastebins, black-market tools, and underground forums.',
    defaultSize: { width: 880, height: 600 },
    minSize: { width: 500, height: 380 },
  },
  onionChat: {
    id: 'onionChat',
    title: 'OnionChat — End-to-End Encrypted Linux Messenger',
    shortTitle: 'OnionChat',
    icon: 'chat',
    description:
      'Simulated decentralized encrypted messenger and VoIP communicator for handling incoming hacker contracts, handler briefs, and audio calls.',
    defaultSize: { width: 840, height: 560 },
    minSize: { width: 480, height: 360 },
  },
  securityNews: {
    id: 'securityNews',
    title: 'Orion Threat Dispatch & Security News',
    shortTitle: 'Security News',
    icon: 'securityNews',
    description:
      'Real-time threat intelligence bulletins, CVE advisories, and Lagos Island cyber incident updates.',
    defaultSize: { width: 840, height: 580 },
    minSize: { width: 480, height: 360 },
  },
  exploitLab: {
    id: 'exploitLab',
    title: 'EkoSec Exploit Lab — Authorized Offensive Simulation',
    shortTitle: 'Exploit Lab',
    icon: 'exploitLab',
    description:
      'Metasploit-inspired offensive security framework for dry-run payload execution and vulnerability verification under strict Rules of Engagement (RoE).',
    defaultSize: { width: 880, height: 600 },
    minSize: { width: 480, height: 380 },
  },
  webProxy: {
    id: 'webProxy',
    title: 'Web Application Security Testing Proxy — Interception Console',
    shortTitle: 'Web Proxy',
    icon: 'webProxy',
    description:
      'Burp Suite / OWASP ZAP-inspired intercepting proxy for inspecting transactions, tampering parameters/headers, replaying requests, and diffing responses.',
    defaultSize: { width: 880, height: 600 },
    minSize: { width: 480, height: 380 },
  },
  socialPretext: {
    id: 'socialPretext',
    title: 'Pretext Lab — Human Attack Surface & Social Security Scenarios',
    shortTitle: 'Pretext Lab',
    icon: 'socialPretext',
    description:
      'Interactive social pretexting and identity verification scenarios evaluating trust, authority, and security policy compliance across 6 authentic venues.',
    defaultSize: { width: 840, height: 580 },
    minSize: { width: 480, height: 380 },
  },
  defensiveOps: {
    id: 'defensiveOps',
    title: 'Defensive Operations Console — Blue & Purple Team Workflows',
    shortTitle: 'Defensive Ops',
    icon: 'defensiveOps',
    description:
      'Enterprise security operations suite featuring synthetic telemetry monitoring, Sigma detection rules, alert triage, incident response mitigations, and Purple Team adversary emulation coverage scorecards.',
    defaultSize: { width: 920, height: 620 },
    minSize: { width: 500, height: 380 },
  },
  redTeam: {
    id: 'redTeam',
    title: 'Red Team Assessment Workspace — Authorized Penetration Testing',
    shortTitle: 'Red Team Workspace',
    icon: 'exploitLab',
    description:
      'Permission-driven offensive cybersecurity assessment suite featuring scope authorization, active Rules of Engagement (RoE), simulated reconnaissance, configuration audits, web API testing, finding validation, and executive penetration test reporting.',
    defaultSize: { width: 920, height: 620 },
    minSize: { width: 500, height: 380 },
  },
  bountyHub: {
    id: 'bountyHub',
    title: 'Eko Bounty Network & Security Contracts',
    shortTitle: 'Bounty Network',
    icon: 'bountyHub',
    description:
      'Open-market bug bounty portal and freelance cybersecurity contract marketplace. Discover opportunities, evaluate scopes of engagement, execute authorized security assessments, submit verified evidence, and build independent professional reputation.',
    defaultSize: { width: 960, height: 640 },
    minSize: { width: 520, height: 400 },
  },
  humanIntel: {
    id: 'humanIntel',
    title: 'Human Intelligence & Physical Security Portal',
    shortTitle: 'Human Intel',
    icon: 'humanIntel',
    description:
      'Witness interviews, testimony-evidence comparison, social engineering triage, and physical security assessment.',
    defaultSize: { width: 940, height: 620 },
    minSize: { width: 480, height: 380 },
  },
};

