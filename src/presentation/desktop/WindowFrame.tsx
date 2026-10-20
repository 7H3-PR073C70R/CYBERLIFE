/**
 * Cyberlife — WindowFrame Component (Heron OS Desktop Chrome)
 *
 * Provides classical GTK/MATE inspired window chrome:
 * - Dark titlebar with centered title and subtle top gradient
 * - Lucide-style vector window controls (minimize, maximize/restore, close)
 * - Focused vs unfocused visual states with accent teal edge illumination
 * - 6px rounded top corners, 1px border, deep drop shadows
 * - Titlebar dragging, double-click to maximize/restore
 * - Edge snapping (left half, right half, top maximize)
 * - Corner and edge resize handles with responsive cursors
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { WindowState } from './types';
import { OsIcon, OsIconName } from './icons/OsIcons';
import { OS_TOKENS } from './osTokens';

export interface WindowFrameProps {
  windowState: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMove: (x: number, y: number) => void;
  onResize?: (width: number, height: number) => void;
  onSnap?: (snap: 'left' | 'right' | 'top' | 'none') => void;
  children: React.ReactNode;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  windowState,
  isActive,
  onFocus,
  onClose,
  onMinimize,
  onMaximize,
  onMove,
  onResize,
  onSnap,
  children,
}) => {
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const [snapPreview, setSnapPreview] = useState<'left' | 'right' | 'top' | null>(null);

  // Resize drag state
  const isResizingRef = useRef(false);
  const resizeDirRef = useRef<string | null>(null);
  const resizeStartRef = useRef<{ mouseX: number; mouseY: number; startW: number; startH: number }>(
    {
      mouseX: 0,
      mouseY: 0,
      startW: 0,
      startH: 0,
    }
  );

  const handleTitleBarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag with left mouse click and not on control buttons
    if (e.button !== 0 || windowState.isMaximized) return;

    onFocus();
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: windowState.position.x,
      startY: windowState.position.y,
    };

    e.preventDefault();
  };

  const handleResizeMouseDown = (e: React.MouseEvent, dir: string) => {
    if (e.button !== 0 || windowState.isMaximized) return;
    e.stopPropagation();
    onFocus();

    isResizingRef.current = true;
    resizeDirRef.current = dir;
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: windowState.size.width,
      startH: windowState.size.height,
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      // Handle resizing
      if (isResizingRef.current && resizeDirRef.current) {
        const dx = e.clientX - resizeStartRef.current.mouseX;
        const dy = e.clientY - resizeStartRef.current.mouseY;
        const dir = resizeDirRef.current;

        let newW = resizeStartRef.current.startW;
        let newH = resizeStartRef.current.startH;

        if (dir.includes('e')) newW += dx;
        if (dir.includes('s')) newH += dy;

        onResize?.(newW, newH);
        return;
      }

      // Handle window moving & edge snap detection
      if (!isDraggingRef.current || windowState.isMaximized) return;

      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      const nextX = dragStartRef.current.startX + dx;
      const nextY = dragStartRef.current.startY + dy;

      onMove(nextX, nextY);

      // Edge snapping detection
      const screenW = window.innerWidth;
      if (e.clientY < 38) {
        setSnapPreview('top');
      } else if (e.clientX < 24) {
        setSnapPreview('left');
      } else if (e.clientX > screenW - 24) {
        setSnapPreview('right');
      } else {
        setSnapPreview(null);
      }
    },
    [onMove, onResize, windowState.isMaximized]
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current && snapPreview) {
      if (snapPreview === 'top') {
        onSnap?.('top');
      } else if (snapPreview === 'left') {
        onSnap?.('left');
      } else if (snapPreview === 'right') {
        onSnap?.('right');
      }
      setSnapPreview(null);
    }
    isDraggingRef.current = false;
    isResizingRef.current = false;
    resizeDirRef.current = null;
  }, [snapPreview, onSnap]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  if (!windowState.isOpen || windowState.isMinimized) {
    return null;
  }

  const panelH = OS_TOKENS.panel.height;

  // Compute position and sizing styles
  let frameStyle: React.CSSProperties;

  if (windowState.isMaximized) {
    frameStyle = {
      position: 'absolute',
      top: `${panelH}px`,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%',
      height: `calc(100% - ${panelH}px)`,
      zIndex: windowState.zIndex,
      borderRadius: 0,
    };
  } else if (windowState.snapState === 'left') {
    frameStyle = {
      position: 'absolute',
      top: `${panelH}px`,
      left: 0,
      width: '50%',
      height: `calc(100% - ${panelH}px)`,
      zIndex: windowState.zIndex,
      borderRadius: '0 4px 4px 0',
    };
  } else if (windowState.snapState === 'right') {
    frameStyle = {
      position: 'absolute',
      top: `${panelH}px`,
      left: '50%',
      width: '50%',
      height: `calc(100% - ${panelH}px)`,
      zIndex: windowState.zIndex,
      borderRadius: '4px 0 0 4px',
    };
  } else {
    frameStyle = {
      position: 'absolute',
      top: `${Math.max(panelH, windowState.position.y)}px`,
      left: `${windowState.position.x}px`,
      width: `${windowState.size.width}px`,
      height: `${windowState.size.height}px`,
      maxWidth: 'calc(100vw - 20px)',
      maxHeight: `calc(100vh - ${panelH + 20}px)`,
      zIndex: windowState.zIndex,
    };
  }

  const iconName =
    typeof windowState.icon === 'string' &&
    windowState.icon in
      {
        terminal: 1,
        fieldGuide: 1,
        systemInfo: 1,
        notes: 1,
        activity: 1,
        incident: 1,
        contacts: 1,
        career: 1,
        saveManager: 1,
        helpCenter: 1,
        catalogue: 1,
        files: 1,
        packetLens: 1,
        revLens: 1,
        ruleTuner: 1,
      }
      ? (windowState.icon as OsIconName)
      : undefined;

  return (
    <>
      {/* Edge Snap Ghost Guide */}
      {snapPreview && (
        <div
          className="window-snap-preview"
          style={{
            position: 'absolute',
            top: `${panelH}px`,
            left: snapPreview === 'right' ? '50%' : 0,
            width: snapPreview === 'top' ? '100%' : '50%',
            height: `calc(100% - ${panelH}px)`,
            border: '2px dashed #00e5ff',
            backgroundColor: 'rgba(0, 229, 255, 0.08)',
            zIndex: 9999,
            pointerEvents: 'none',
            borderRadius: '6px',
            transition: 'all 120ms ease-out',
          }}
        />
      )}

      <div
        className={`desktop-window-frame ${isActive ? 'window-active' : 'window-inactive'}`}
        style={frameStyle}
        role="region"
        aria-label={`${windowState.title} Window`}
        data-testid={`window-frame-${windowState.id}`}
        onMouseDown={onFocus}
      >
        {/* Title Bar */}
        <div
          className="window-titlebar"
          onMouseDown={handleTitleBarMouseDown}
          onDoubleClick={onMaximize}
          data-testid={`window-titlebar-${windowState.id}`}
        >
          {/* Left: Window Icon */}
          <div className="window-title-left">
            <span className="window-title-icon" aria-hidden="true">
              {iconName ? <OsIcon name={iconName} size={15} color="#00e5ff" /> : windowState.icon}
            </span>
          </div>

          {/* Center: Centered Title Text */}
          <div className="window-title-center">
            <span className="window-title-text">{windowState.title}</span>
          </div>

          {/* Right: Window Controls */}
          <div className="window-controls">
            <button
              type="button"
              className="window-control-btn btn-minimize"
              onClick={e => {
                e.stopPropagation();
                onMinimize();
              }}
              aria-label={`Minimize ${windowState.title}`}
              title="Minimize"
              data-testid={`btn-minimize-${windowState.id}`}
            >
              <OsIcon name="minimize" size={12} color="currentColor" />
            </button>

            <button
              type="button"
              className="window-control-btn btn-maximize"
              onClick={e => {
                e.stopPropagation();
                onMaximize();
              }}
              aria-label={
                windowState.isMaximized
                  ? `Restore ${windowState.title}`
                  : `Maximize ${windowState.title}`
              }
              title={windowState.isMaximized ? 'Restore' : 'Maximize'}
              data-testid={`btn-maximize-${windowState.id}`}
            >
              <OsIcon
                name={windowState.isMaximized ? 'restore' : 'maximize'}
                size={12}
                color="currentColor"
              />
            </button>

            <button
              type="button"
              className="window-control-btn btn-close"
              onClick={e => {
                e.stopPropagation();
                onClose();
              }}
              aria-label={`Close ${windowState.title}`}
              title="Close"
              data-testid={`btn-close-${windowState.id}`}
            >
              <OsIcon name="close" size={12} color="currentColor" />
            </button>
          </div>
        </div>

        {/* Window Content Body */}
        <div className="window-content" data-testid={`window-content-${windowState.id}`}>
          {children}
        </div>

        {/* Resize Handles (disabled when maximized) */}
        {!windowState.isMaximized && !windowState.snapState && (
          <>
            <div
              className="window-resize-handle handle-e"
              onMouseDown={e => handleResizeMouseDown(e, 'e')}
            />
            <div
              className="window-resize-handle handle-s"
              onMouseDown={e => handleResizeMouseDown(e, 's')}
            />
            <div
              className="window-resize-handle handle-se"
              onMouseDown={e => handleResizeMouseDown(e, 'se')}
            />
          </>
        )}
      </div>
    </>
  );
};
