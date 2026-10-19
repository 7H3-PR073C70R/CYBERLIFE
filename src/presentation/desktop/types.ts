/**
 * Cyberlife — Virtual Desktop Presentation Types
 */

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
  | 'helpCenter';

export interface AppDefinition {
  id: AppId;
  title: string;
  shortTitle: string;
  icon: string;
  description: string;
  defaultSize: { width: number; height: number };
  minSize: { width: number; height: number };
}

export interface WindowState {
  id: AppId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export const APP_REGISTRY: Record<AppId, AppDefinition> = {
  incident: {
    id: 'incident',
    title: 'Incident Response Portal — The Aster Incident',
    shortTitle: 'Incident Portal',
    icon: '🚨',
    description:
      'Manage investigation phases, review briefing, submit root-cause assessment, verify remediation, and complete incident report.',
    defaultSize: { width: 780, height: 560 },
    minSize: { width: 440, height: 340 },
  },
  career: {
    id: 'career',
    title: 'Career Hub, Job Board & Financial Ledger',
    shortTitle: 'Career & Market',
    icon: '💼',
    description:
      'Manage cybersecurity career path, accept verified tickets, level up skills, purchase hardware upgrades, and audit finances.',
    defaultSize: { width: 840, height: 580 },
    minSize: { width: 480, height: 380 },
  },
  terminal: {
    id: 'terminal',
    title: 'CyberOS Terminal',
    shortTitle: 'Terminal',
    icon: '💻',
    description: 'Simulated command-line prompt for system navigation, diagnostics, and tools.',
    defaultSize: { width: 720, height: 480 },
    minSize: { width: 380, height: 280 },
  },
  fieldGuide: {
    id: 'fieldGuide',
    title: 'Cyberlife Field Guide',
    shortTitle: 'Field Guide',
    icon: '📖',
    description:
      'Beginner-friendly reference guide explaining terminals, commands, and security basics.',
    defaultSize: { width: 680, height: 500 },
    minSize: { width: 380, height: 280 },
  },
  systemInfo: {
    id: 'systemInfo',
    title: 'System Information',
    shortTitle: 'System Info',
    icon: '⚙️',
    description:
      'Read-only fictional workstation specifications, kernel details, and virtual network status.',
    defaultSize: { width: 560, height: 440 },
    minSize: { width: 360, height: 260 },
  },
  notes: {
    id: 'notes',
    title: 'Security Notes & Memo',
    shortTitle: 'Notes',
    icon: '📝',
    description:
      'Introductory orientation memo from Cedarline InfoSec and player session scratchpad.',
    defaultSize: { width: 580, height: 440 },
    minSize: { width: 360, height: 260 },
  },
  activity: {
    id: 'activity',
    title: 'Security Activity Log',
    shortTitle: 'Activity',
    icon: '📊',
    description:
      'Timeline of simulated workstation activities, tool executions, and security events.',
    defaultSize: { width: 660, height: 460 },
    minSize: { width: 380, height: 280 },
  },
  contacts: {
    id: 'contacts',
    title: 'Lagos Social & Professional Directory',
    shortTitle: 'Contacts',
    icon: '👥',
    description:
      'Track Lagos Island professional contacts, colleagues, community relations, and schedules.',
    defaultSize: { width: 720, height: 500 },
    minSize: { width: 440, height: 320 },
  },
  saveManager: {
    id: 'saveManager',
    title: 'Persistence Vault & System Recovery',
    shortTitle: 'Save Vault',
    icon: '💾',
    description:
      'Manage persistent save slots, audit integrity checksums, restore shadow crash backups, and start new game sessions.',
    defaultSize: { width: 780, height: 540 },
    minSize: { width: 440, height: 340 },
  },
  helpCenter: {
    id: 'helpCenter',
    title: 'Help Center & Searchable Knowledge Base',
    shortTitle: 'Help Center',
    icon: '❓',
    description:
      'Searchable guide to controls, commands, Aster Incident steps, career mechanics, and troubleshooting.',
    defaultSize: { width: 780, height: 540 },
    minSize: { width: 440, height: 340 },
  },
};
