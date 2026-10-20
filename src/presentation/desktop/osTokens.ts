/**
 * Design system tokens shared between the DOM desktop environment and 3D canvas renderer.
 */
export const OS_TOKENS = {
  // Dimensions
  panel: {
    height: 30, // px
  },
  window: {
    titleBarHeight: 34,
    borderRadius: 6,
    borderWidth: 1,
    buttonSize: 14,
    minWidth: 380,
    minHeight: 240,
  },
  typography: {
    fontSans: 'Inter, system-ui, -apple-system, sans-serif',
    fontMono: "'JetBrains Mono', 'Fira Code', monospace",
    fontSizeUI: 12,
    fontSizeTerminal: 13,
    fontSizeCode: 12,
  },
  // Color Palette
  colors: {
    bgDark: '#060a10',
    bgPanel: '#0c131f',
    bgSurface: '#0f172a',
    bgSurfaceElevated: '#162234',
    bgWindowBody: '#05090f',

    borderDefault: '#1e293b',
    borderFocused: 'rgba(0, 229, 255, 0.45)',
    borderSubtle: 'rgba(148, 163, 184, 0.15)',

    accentTeal: '#00e5ff',
    accentGreen: '#00e676',
    accentCyan: '#38bdf8',
    accentAmber: '#f59e0b',
    accentRed: '#ef4444',
    accentPurple: '#a855f7',

    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#64748b',

    promptUser: '#00e676',
    promptHost: '#00e5ff',
    promptPath: '#38bdf8',
    promptChar: '#00e5ff',

    shadowFocused: '0 18px 40px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(0, 229, 255, 0.25)',
    shadowUnfocused: '0 8px 24px rgba(0, 0, 0, 0.55)',
  },
  animations: {
    windowOpenMs: 160,
    menuFadeMs: 120,
    loginBootMs: 1600,
  },
} as const;
