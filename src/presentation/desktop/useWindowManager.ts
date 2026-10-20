/**
 * Cyberlife — Virtual Desktop Window Manager Hook & Logic
 *
 * Manages presentation window states (open, minimized, maximized, zIndex, coordinates).
 * Strictly presentation state — decoupled from authoritative simulation engine.
 */

import { useState, useCallback, useRef } from 'react';
import { AppId, APP_REGISTRY, WindowState } from './types';

export interface UseWindowManagerOptions {
  initialOpenApp?: AppId;
}

export function createInitialWindows(
  initialOpenApp: AppId = 'terminal'
): Record<AppId, WindowState> {
  const initialPositions: Record<AppId, { x: number; y: number }> = {
    incident: { x: 70, y: 30 },
    terminal: { x: 80, y: 40 },
    fieldGuide: { x: 120, y: 70 },
    systemInfo: { x: 160, y: 90 },
    notes: { x: 200, y: 110 },
    activity: { x: 240, y: 130 },
    contacts: { x: 100, y: 50 },
    career: { x: 90, y: 35 },
    saveManager: { x: 110, y: 50 },
    helpCenter: { x: 130, y: 60 },
    catalogue: { x: 95, y: 35 },
    files: { x: 105, y: 45 },
    packetLens: { x: 120, y: 55 },
    revLens: { x: 135, y: 65 },
    ruleTuner: { x: 150, y: 75 },
    torBrowser: { x: 140, y: 50 },
    onionChat: { x: 160, y: 70 },
    securityNews: { x: 130, y: 55 },
  };

  const windows: Partial<Record<AppId, WindowState>> = {};

  (Object.keys(APP_REGISTRY) as AppId[]).forEach((appId, index) => {
    const def = APP_REGISTRY[appId];
    windows[appId] = {
      id: appId,
      title: def.title,
      icon: def.icon,
      isOpen: appId === initialOpenApp,
      isMinimized: false,
      isMaximized: false,
      zIndex: appId === initialOpenApp ? 20 : 10 + index,
      position: initialPositions[appId] ?? { x: 50 + index * 30, y: 50 + index * 30 },
      size: { ...def.defaultSize },
    };
  });

  return windows as Record<AppId, WindowState>;
}

export function useWindowManager(options: UseWindowManagerOptions = {}) {
  const [windows, setWindows] = useState<Record<AppId, WindowState>>(() =>
    createInitialWindows(options.initialOpenApp ?? 'terminal')
  );

  const topZIndexRef = useRef<number>(25);

  const getNextZIndex = useCallback(() => {
    topZIndexRef.current += 1;
    return topZIndexRef.current;
  }, []);

  const openApp = useCallback(
    (appId: AppId) => {
      setWindows(prev => {
        const target = prev[appId];
        if (!target) return prev;

        const nextZ = getNextZIndex();
        return {
          ...prev,
          [appId]: {
            ...target,
            isOpen: true,
            isMinimized: false,
            zIndex: nextZ,
          },
        };
      });
    },
    [getNextZIndex]
  );

  const closeWindow = useCallback((appId: AppId) => {
    setWindows(prev => {
      const target = prev[appId];
      if (!target) return prev;

      return {
        ...prev,
        [appId]: {
          ...target,
          isOpen: false,
          isMinimized: false,
          isMaximized: false,
        },
      };
    });
  }, []);

  const minimizeWindow = useCallback((appId: AppId) => {
    setWindows(prev => {
      const target = prev[appId];
      if (!target) return prev;

      return {
        ...prev,
        [appId]: {
          ...target,
          isMinimized: true,
        },
      };
    });
  }, []);

  const restoreWindow = useCallback(
    (appId: AppId) => {
      setWindows(prev => {
        const target = prev[appId];
        if (!target) return prev;

        const nextZ = getNextZIndex();
        return {
          ...prev,
          [appId]: {
            ...target,
            isMinimized: false,
            zIndex: nextZ,
          },
        };
      });
    },
    [getNextZIndex]
  );

  const toggleMinimize = useCallback(
    (appId: AppId) => {
      setWindows(prev => {
        const target = prev[appId];
        if (!target) return prev;

        if (target.isMinimized) {
          const nextZ = getNextZIndex();
          return {
            ...prev,
            [appId]: {
              ...target,
              isMinimized: false,
              zIndex: nextZ,
            },
          };
        } else {
          return {
            ...prev,
            [appId]: {
              ...target,
              isMinimized: true,
            },
          };
        }
      });
    },
    [getNextZIndex]
  );

  const maximizeWindow = useCallback((appId: AppId) => {
    setWindows(prev => {
      const target = prev[appId];
      if (!target) return prev;

      return {
        ...prev,
        [appId]: {
          ...target,
          isMaximized: !target.isMaximized,
          snapState: null,
        },
      };
    });
  }, []);

  const snapWindow = useCallback((appId: AppId, snap: 'left' | 'right' | 'top' | 'none') => {
    setWindows(prev => {
      const target = prev[appId];
      if (!target) return prev;
      if (snap === 'top') {
        return {
          ...prev,
          [appId]: {
            ...target,
            isMaximized: true,
            snapState: null,
          },
        };
      }
      if (snap === 'left' || snap === 'right') {
        return {
          ...prev,
          [appId]: {
            ...target,
            isMaximized: false,
            snapState: snap,
          },
        };
      }
      return {
        ...prev,
        [appId]: {
          ...target,
          snapState: null,
        },
      };
    });
  }, []);

  const resizeWindow = useCallback((appId: AppId, width: number, height: number) => {
    setWindows(prev => {
      const target = prev[appId];
      if (!target) return prev;
      const minW = APP_REGISTRY[appId]?.minSize.width ?? 300;
      const minH = APP_REGISTRY[appId]?.minSize.height ?? 200;
      return {
        ...prev,
        [appId]: {
          ...target,
          snapState: null,
          size: {
            width: Math.max(minW, width),
            height: Math.max(minH, height),
          },
        },
      };
    });
  }, []);

  const focusWindow = useCallback(
    (appId: AppId) => {
      setWindows(prev => {
        const target = prev[appId];
        if (!target || !target.isOpen) return prev;

        const nextZ = getNextZIndex();
        return {
          ...prev,
          [appId]: {
            ...target,
            isMinimized: false,
            zIndex: nextZ,
          },
        };
      });
    },
    [getNextZIndex]
  );

  const moveWindow = useCallback(
    (appId: AppId, x: number, y: number, containerBounds?: { width: number; height: number }) => {
      setWindows(prev => {
        const target = prev[appId];
        if (!target) return prev;

        // Apply boundary clamping if bounds are provided
        let clampedX = x;
        let clampedY = y;

        if (containerBounds) {
          const minVisibleWidth = 100;
          const taskbarOffset = 52; // bottom taskbar/panel boundary margin
          clampedX = Math.max(0, Math.min(x, containerBounds.width - minVisibleWidth));
          clampedY = Math.max(0, Math.min(y, containerBounds.height - taskbarOffset - 40));
        }

        return {
          ...prev,
          [appId]: {
            ...target,
            snapState: null,
            position: { x: clampedX, y: clampedY },
          },
        };
      });
    },
    []
  );

  const closeAll = useCallback(() => {
    setWindows(prev => {
      const next = { ...prev };
      (Object.keys(next) as AppId[]).forEach(id => {
        next[id] = {
          ...next[id],
          isOpen: false,
          isMinimized: false,
          isMaximized: false,
          snapState: null,
        };
      });
      return next;
    });
  }, []);

  const getActiveWindowId = useCallback(() => {
    let topId: AppId | null = null;
    let maxZ = -1;

    (Object.keys(windows) as AppId[]).forEach(id => {
      const win = windows[id];
      if (win.isOpen && !win.isMinimized && win.zIndex > maxZ) {
        maxZ = win.zIndex;
        topId = id;
      }
    });

    return topId;
  }, [windows]);

  return {
    windows,
    openApp,
    closeWindow,
    minimizeWindow,
    restoreWindow,
    toggleMinimize,
    maximizeWindow,
    snapWindow,
    resizeWindow,
    focusWindow,
    moveWindow,
    closeAll,
    getActiveWindowId,
  };
}
