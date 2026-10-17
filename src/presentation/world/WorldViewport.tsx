import React, { useEffect, useRef, useState } from 'react';
import { WorldSceneManager } from './WorldSceneManager';

export interface WorldViewportProps {
  onInitialized?: () => void;
  onError?: (error: Error) => void;
}

export const WorldViewport: React.FC<WorldViewportProps> = ({ onInitialized, onError }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const managerRef = useRef<WorldSceneManager | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const initializeScene = React.useCallback(() => {
    if (!containerRef.current) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Clean up any existing manager before reinitializing
    if (managerRef.current) {
      managerRef.current.dispose();
      managerRef.current = null;
    }

    try {
      const manager = new WorldSceneManager();
      manager.initialize(containerRef.current);
      managerRef.current = manager;
      setIsLoading(false);
      onInitialized?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setErrorMessage(error.message);
      setIsLoading(false);
      onError?.(error);
    }
  }, [onInitialized, onError]);

  useEffect(() => {
    initializeScene();

    return () => {
      if (managerRef.current) {
        managerRef.current.dispose();
        managerRef.current = null;
      }
    };
  }, [initializeScene]);

  return (
    <div
      ref={containerRef}
      className="world-viewport-container"
      data-testid="world-viewport-container"
    >
      {isLoading && (
        <div className="world-loading-overlay" role="status" aria-live="polite">
          <div className="spinner" aria-hidden="true" />
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
            Initializing 3D World Viewport...
          </p>
        </div>
      )}

      {errorMessage && (
        <div className="world-error-overlay" role="alert" aria-live="assertive">
          <div className="world-error-card">
            <h2 className="world-error-title">
              <span aria-hidden="true">⚠️</span> 3D Rendering Unavailable
            </h2>
            <p className="world-error-message">
              The 3D WebGL viewport could not be initialized. This may happen if hardware
              acceleration is disabled or your browser does not support WebGL.
            </p>
            <div className="world-error-details" data-testid="world-error-details">
              {errorMessage}
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={initializeScene}
              aria-label="Retry 3D WebGL initialization"
            >
              Retry Initialization
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
