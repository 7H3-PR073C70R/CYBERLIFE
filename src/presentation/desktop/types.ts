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
  | 'ruleTuner';

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
    title: 'Security Activity Log',
    shortTitle: 'Activity',
    icon: 'activity',
    description:
      'Timeline of simulated workstation activities, tool executions, and security events.',
    defaultSize: { width: 660, height: 460 },
    minSize: { width: 380, height: 280 },
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
};
