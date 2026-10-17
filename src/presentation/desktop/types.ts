/**
 * Cyberlife — Virtual Desktop Presentation Types
 */

export type AppId = 'terminal' | 'fieldGuide' | 'systemInfo' | 'notes';

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
};
