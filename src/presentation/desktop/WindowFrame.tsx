/**
 * Cyberlife — WindowFrame Component
 *
 * Provides the window chrome (titlebar, controls, drag handling, focus management).
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { WindowState } from './types';

export interface WindowFrameProps {
  windowState: WindowState;
  isActive: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onMove: (x: number, y: number) => void;
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
  children,
}) => {
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

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

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || windowState.isMaximized) return;

      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      const nextX = dragStartRef.current.startX + dx;
      const nextY = dragStartRef.current.startY + dy;

      onMove(nextX, nextY);
    },
    [onMove, windowState.isMaximized]
  );

  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

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

  const style: React.CSSProperties = windowState.isMaximized
    ? {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: '48px', // above taskbar
        width: '100%',
        height: 'calc(100% - 48px)',
        zIndex: windowState.zIndex,
      }
    : {
        position: 'absolute',
        top: `${windowState.position.y}px`,
        left: `${windowState.position.x}px`,
        width: `${windowState.size.width}px`,
        height: `${windowState.size.height}px`,
        maxWidth: 'calc(100vw - 20px)',
        maxHeight: 'calc(100vh - 70px)',
        zIndex: windowState.zIndex,
      };

  return (
    <div
      className={`desktop-window-frame ${isActive ? 'window-active' : 'window-inactive'}`}
      style={style}
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
        <div className="window-title-group">
          <span className="window-title-icon" aria-hidden="true">
            {windowState.icon}
          </span>
          <span className="window-title-text">{windowState.title}</span>
        </div>

        {/* Window Controls */}
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
            <span aria-hidden="true">−</span>
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
            <span aria-hidden="true">{windowState.isMaximized ? '❐' : '□'}</span>
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
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="window-content" data-testid={`window-content-${windowState.id}`}>
        {children}
      </div>
    </div>
  );
};
