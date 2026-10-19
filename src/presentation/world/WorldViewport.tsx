import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WorldSceneManager } from './WorldSceneManager';
import {
  CameraMode,
  LocationDefinition,
  InteractableDefinition,
  WORLD_CONFIG,
} from './worldConfig';
import { HUDShell } from '../hud/HUDShell';
import { DesktopShell } from '../desktop/DesktopShell';

import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { Money } from '@/domain/common/Money';

export interface WorldViewportProps {
  onInitialized?: () => void;
  onError?: (error: Error) => void;
}

export const WorldViewport: React.FC<WorldViewportProps> = ({ onInitialized, onError }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const managerRef = useRef<WorldSceneManager | null>(null);
  const sim = useOptionalSimulation();
  const simRef = useRef(sim);
  simRef.current = sim;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Optional URL search parameters for direct workstation and scene testing
  const initialParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialLocParam = initialParams?.get('location');
  const initialWsParam = initialParams?.get('workstation');

  // M2 World and Camera State
  const [currentLocation, setCurrentLocation] = useState<LocationDefinition>(() => {
    if (initialLocParam === 'cedarline_interior') return WORLD_CONFIG.locations.cedarlineInterior;
    if (initialLocParam === 'apartment_interior') return WORLD_CONFIG.locations.apartmentInterior;
    return WORLD_CONFIG.locations.neighborhood;
  });
  const [cameraMode, setCameraMode] = useState<CameraMode>('THIRD_PERSON');
  const [activeTarget, setActiveTarget] = useState<InteractableDefinition | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // M4 Virtual Desktop State
  const [isDesktopOpen, setIsDesktopOpen] = useState<boolean>(() => initialWsParam === 'open');
  const [activeWorkstationId, setActiveWorkstationId] = useState<string>(
    initialLocParam === 'apartment_interior'
      ? 'interact_apartment_workstation'
      : 'interact_cedarline_workstation'
  );

  const initializeScene = useCallback(() => {
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
      manager.initialize(containerRef.current, {
        initialLocationId: initialLocParam ?? 'neighborhood',
        onLocationChanged: loc => {
          setCurrentLocation(loc);
          if (simRef.current && simRef.current.state.player.locationId !== loc.id) {
            simRef.current.dispatch({
              type: 'SetLogicalPlayerLocation',
              locationId: loc.id,
            });
          }
        },
        onCameraModeChanged: mode => setCameraMode(mode),
        onInteractionTargetChanged: target => setActiveTarget(target),
        onNoticeboardRead: notice => {
          setNoticeMessage(notice);
          if (simRef.current) {
            simRef.current.dispatch({
              type: 'SetWorldFlag',
              key: 'has_read_community_noticeboard',
              value: true,
            });
          }
        },
        onWorkstationOpen: wsId => {
          setActiveWorkstationId(wsId);
          setIsDesktopOpen(true);
          manager.setInputDisabled(true);
          if (simRef.current) {
            simRef.current.dispatch({
              type: 'SetWorldFlag',
              key: 'has_accessed_workstation',
              value: true,
            });
          }
        },
      });
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

  const handleToggleCamera = () => {
    if (managerRef.current) {
      const newMode = managerRef.current.toggleCameraMode();
      setCameraMode(newMode);
    }
  };

  const handleInteract = () => {
    if (managerRef.current) {
      managerRef.current.triggerNearbyInteraction();
    }
  };

  const handleCloseDesktop = useCallback(() => {
    setIsDesktopOpen(false);
    if (managerRef.current) {
      managerRef.current.exitWorkstationSession();
    }
  }, []);

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
            Building 3D Neighborhood Environment...
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

      {/* Noticeboard Modal Alert (if reading community bulletin) */}
      {noticeMessage && (
        <div
          role="dialog"
          aria-label="Neighborhood Noticeboard Bulletin"
          className="world-error-card hud-interactive"
          style={{
            position: 'absolute',
            top: '5.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 25,
            border: '1px solid var(--color-accent-amber)',
            backgroundColor: 'var(--color-bg-surface-elevated)',
          }}
        >
          <h3
            style={{
              color: 'var(--color-accent-amber)',
              fontSize: '1rem',
              marginBottom: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>📋</span> Community Incident Alert
          </h3>
          <p
            style={{
              color: 'var(--color-text-primary)',
              fontSize: '0.85rem',
              lineHeight: 1.5,
              marginBottom: '0.75rem',
            }}
          >
            {noticeMessage}
          </p>
          <button
            type="button"
            className="btn-primary"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.8rem' }}
            onClick={() => setNoticeMessage(null)}
          >
            Close Notice
          </button>
        </div>
      )}

      {/* 2D HUD Layer positioned above the 3D canvas */}
      {!isDesktopOpen && (
        <HUDShell
          currentLocationName={currentLocation.name}
          cameraMode={cameraMode}
          activeTarget={activeTarget}
          simulationTimeString={sim ? sim.state.time.calendar.timeString : undefined}
          playerFunds={sim ? Money.fromKobo(sim.state.player.moneyKobo).format() : undefined}
          onToggleCamera={handleToggleCamera}
          onInteract={handleInteract}
        />
      )}

      {/* M4 Virtual Desktop Overlay */}
      {isDesktopOpen && (
        <DesktopShell
          workstationId={activeWorkstationId}
          cameraMode={cameraMode}
          onExitDesktop={handleCloseDesktop}
          onTyping={() => managerRef.current?.triggerTypingAnimation()}
          onMouseUse={() => managerRef.current?.triggerMouseAnimation()}
          onTerminalOutput={lines => managerRef.current?.updateWorkstationTerminal(lines)}
        />
      )}
    </div>
  );
};
