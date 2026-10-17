import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWindowManager, createInitialWindows } from '@/presentation/desktop/useWindowManager';

describe('useWindowManager', () => {
  it('creates initial windows with terminal open by default', () => {
    const windows = createInitialWindows('terminal');

    expect(windows.terminal.isOpen).toBe(true);
    expect(windows.terminal.isMinimized).toBe(false);
    expect(windows.fieldGuide.isOpen).toBe(false);
    expect(windows.systemInfo.isOpen).toBe(false);
    expect(windows.notes.isOpen).toBe(false);
  });

  it('opens an application and elevates its z-index', () => {
    const { result } = renderHook(() => useWindowManager({ initialOpenApp: 'terminal' }));

    act(() => {
      result.current.openApp('fieldGuide');
    });

    expect(result.current.windows.fieldGuide.isOpen).toBe(true);
    expect(result.current.windows.fieldGuide.isMinimized).toBe(false);
    expect(result.current.windows.fieldGuide.zIndex).toBeGreaterThan(
      result.current.windows.terminal.zIndex
    );
    expect(result.current.getActiveWindowId()).toBe('fieldGuide');
  });

  it('restores and brings to front when opening an already-open minimized window', () => {
    const { result } = renderHook(() => useWindowManager({ initialOpenApp: 'terminal' }));

    act(() => {
      result.current.minimizeWindow('terminal');
    });
    expect(result.current.windows.terminal.isMinimized).toBe(true);

    act(() => {
      result.current.openApp('terminal');
    });
    expect(result.current.windows.terminal.isOpen).toBe(true);
    expect(result.current.windows.terminal.isMinimized).toBe(false);
    expect(result.current.getActiveWindowId()).toBe('terminal');
  });

  it('minimizes and restores a window via toggleMinimize', () => {
    const { result } = renderHook(() => useWindowManager({ initialOpenApp: 'terminal' }));

    act(() => {
      result.current.toggleMinimize('terminal');
    });
    expect(result.current.windows.terminal.isMinimized).toBe(true);

    act(() => {
      result.current.toggleMinimize('terminal');
    });
    expect(result.current.windows.terminal.isMinimized).toBe(false);
  });

  it('maximizes and restores window state', () => {
    const { result } = renderHook(() => useWindowManager({ initialOpenApp: 'terminal' }));

    act(() => {
      result.current.maximizeWindow('terminal');
    });
    expect(result.current.windows.terminal.isMaximized).toBe(true);

    act(() => {
      result.current.maximizeWindow('terminal');
    });
    expect(result.current.windows.terminal.isMaximized).toBe(false);
  });

  it('closes a window and resets state', () => {
    const { result } = renderHook(() => useWindowManager({ initialOpenApp: 'terminal' }));

    act(() => {
      result.current.closeWindow('terminal');
    });
    expect(result.current.windows.terminal.isOpen).toBe(false);
    expect(result.current.windows.terminal.isMinimized).toBe(false);
    expect(result.current.windows.terminal.isMaximized).toBe(false);
  });

  it('closes all windows cleanly', () => {
    const { result } = renderHook(() => useWindowManager({ initialOpenApp: 'terminal' }));

    act(() => {
      result.current.openApp('fieldGuide');
      result.current.openApp('systemInfo');
    });

    expect(result.current.windows.terminal.isOpen).toBe(true);
    expect(result.current.windows.fieldGuide.isOpen).toBe(true);
    expect(result.current.windows.systemInfo.isOpen).toBe(true);

    act(() => {
      result.current.closeAll();
    });

    expect(result.current.windows.terminal.isOpen).toBe(false);
    expect(result.current.windows.fieldGuide.isOpen).toBe(false);
    expect(result.current.windows.systemInfo.isOpen).toBe(false);
    expect(result.current.getActiveWindowId()).toBeNull();
  });

  it('clamps window position inside desktop boundaries when moved', () => {
    const { result } = renderHook(() => useWindowManager({ initialOpenApp: 'terminal' }));

    const bounds = { width: 1000, height: 700 };

    // Attempt to drag completely off the left edge (negative X)
    act(() => {
      result.current.moveWindow('terminal', -150, -50, bounds);
    });
    expect(result.current.windows.terminal.position.x).toBe(0);
    expect(result.current.windows.terminal.position.y).toBe(0);

    // Attempt to drag off the right edge
    act(() => {
      result.current.moveWindow('terminal', 1200, 900, bounds);
    });
    // Expected to clamp so at least 100px remains on screen (maxX = 1000 - 100 = 900)
    expect(result.current.windows.terminal.position.x).toBe(900);
    // maxY = 700 - 52 - 40 = 608
    expect(result.current.windows.terminal.position.y).toBe(608);
  });
});
