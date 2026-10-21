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
import { DialogueOverlay } from '../dialogue/DialogueOverlay';
import { AppId } from '../desktop/types';
import { WorkstationCameraState } from './camera/WorkstationCameraStates';
import { getStoredWorkstationSettings, WorkstationSettings } from '../hud/WorkstationSettingsModal';
import { MainMenuOverlay } from '../onboarding/MainMenuOverlay';
import { musicController } from '../audio/MusicController';
import { ambienceController } from '../audio/AmbienceController';
import { sfxController } from '../audio/SfxController';

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
  const onInitializedRef = useRef(onInitialized);
  onInitializedRef.current = onInitialized;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Optional URL search parameters for direct workstation and scene testing
  const initialParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialLocParam = initialParams?.get('location');
  const initialWsParam = initialParams?.get('workstation') || initialParams?.get('desktop');
  const initialAppParam = initialParams?.get('app') as AppId | null;
  const initialNpcParam = initialParams?.get('npc');

  // M2 World and Camera State
  const [currentLocation, setCurrentLocation] = useState<LocationDefinition>(() => {
    if (initialLocParam === 'cedarline_interior') return WORLD_CONFIG.locations.cedarlineInterior;
    if (initialLocParam === 'apartment_interior') return WORLD_CONFIG.locations.apartmentInterior;
    return WORLD_CONFIG.locations.neighborhood;
  });
  const [cameraMode, setCameraMode] = useState<CameraMode>('THIRD_PERSON');
  const [activeTarget, setActiveTarget] = useState<InteractableDefinition | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);
  const [activeNpcId, setActiveNpcId] = useState<string | null>(() => initialNpcParam ?? null);
  const [playerPosition, setPlayerPosition] = useState<{ x: number; z: number }>(() => {
    if (initialLocParam === 'apartment_interior') return { x: -12.0, z: -14.0 };
    if (initialLocParam === 'cedarline_interior') return { x: 18.0, z: 6.0 };
    return { x: 0, z: 10 };
  });

  // M4 Virtual Desktop State
  const [isDesktopOpen, setIsDesktopOpen] = useState<boolean>(() => initialWsParam === 'open');
  const [workstationState, setWorkstationState] = useState<WorkstationCameraState>(
    initialWsParam === 'open' ? 'SCREEN_FULLSCREEN' : 'WALKING'
  );
  const [workstationSettings, setWorkstationSettings] = useState<WorkstationSettings>(() =>
    getStoredWorkstationSettings()
  );
  const [activeWorkstationId, setActiveWorkstationId] = useState<string>(
    initialLocParam === 'apartment_interior'
      ? 'interact_apartment_workstation'
      : 'interact_cedarline_workstation'
  );

  // M15 Main Menu & Audio State
  const initialMenuParam = initialParams?.get('menu');
  const skipMenuParam = initialParams?.get('skipMenu');
  const isTestEnv =
    typeof process !== 'undefined' && process.env?.NODE_ENV === 'test';
  const hasDirectTestingParams = Boolean(
    initialLocParam || initialWsParam || initialNpcParam || initialAppParam
  );

  const [isMainMenuOpen, setIsMainMenuOpen] = useState<boolean>(() => {
    if (initialMenuParam === 'true') return true;
    if (skipMenuParam === 'true' || hasDirectTestingParams || isTestEnv) return false;
    if (typeof window !== 'undefined' && localStorage.getItem('cyberlife_menu_entered')) return false;
    return true;
  });

  const startInGameAudio = useCallback((locId?: string) => {
    const targetLoc = locId ?? currentLocation.id;
    ambienceController.setLocation(targetLoc);
    if (targetLoc === 'apartment_interior') {
      musicController.setContext('APARTMENT_DOWNTIME');
    } else {
      musicController.setContext('WORLD_EXPLORATION');
    }
  }, [currentLocation.id]);

  useEffect(() => {
    if (!isMainMenuOpen) {
      startInGameAudio();
    }
  }, [isMainMenuOpen, startInGameAudio]);

  // Synchronize audio ambient intensity with simulation time of day
  useEffect(() => {
    const hour = sim?.state.time.calendar.hour;
    if (typeof hour === 'number') {
      const isNight = hour >= 22 || hour < 6;
      ambienceController.setTimeOfDayFactor(isNight ? 0.65 : 1.0);
    }
  }, [sim?.state.time.calendar.hour]);

  // Audio cues for narrative evidence preservation
  const prevEvidenceCountRef = useRef<number>(0);
  useEffect(() => {
    const vault = sim?.state.narrative?.evidenceVault;
    if (vault) {
      const count = Object.keys(vault).length;
      if (count > prevEvidenceCountRef.current && prevEvidenceCountRef.current > 0) {
        sfxController.playEvidenceAcquired();
        musicController.playStinger('music_discovery_revelation');
      }
      prevEvidenceCountRef.current = count;
    }
  }, [sim?.state.narrative?.evidenceVault]);

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
          ambienceController.setLocation(loc.id);
          if (loc.id === 'apartment_interior') {
            musicController.setContext('APARTMENT_DOWNTIME');
          } else {
            musicController.setContext('WORLD_EXPLORATION');
          }
          if (loc.id === 'apartment_interior') {
            setPlayerPosition({ x: -12.0, z: -14.0 });
          } else if (loc.id === 'cedarline_interior') {
            setPlayerPosition({ x: 18.0, z: 6.0 });
          } else if (managerRef.current) {
            const p = managerRef.current.getPlayerPosition();
            setPlayerPosition({ x: p.x, z: p.z });
          }
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
          ambienceController.setWorkstationFocus(true);
          musicController.setContext('WORKSTATION_FOCUS');
          sfxController.playWorkstationEnter();
          if (simRef.current) {
            simRef.current.dispatch({
              type: 'SetWorldFlag',
              key: 'has_accessed_workstation',
              value: true,
            });
          }
        },
        onWorkstationStateChanged: state => {
          setWorkstationState(state);
          if (state === 'WALKING') {
            setIsDesktopOpen(false);
            ambienceController.setWorkstationFocus(false);
            const loc = managerRef.current?.getCurrentLocation()?.id ?? 'neighborhood';
            if (loc === 'apartment_interior') {
              musicController.setContext('APARTMENT_DOWNTIME');
            } else {
              musicController.setContext('WORLD_EXPLORATION');
            }
          }
        },
        onNpcInteract: npcId => {
          setActiveNpcId(npcId);
          manager.setInputDisabled(true);
          if (simRef.current) {
            simRef.current.dispatch({
              type: 'StartNpcDialogue',
              npcId,
            });
            if (simRef.current.state.mission?.phase === 'briefing' && npcId === 'npc_amina') {
              simRef.current.dispatch({
                type: 'AdvanceAsterMissionPhase',
                targetPhase: 'initial_assessment',
              });
            }
          }
        },
        onBedSleep: () => {
          sfxController.play('workstation_exit');
          musicController.playStinger('music_mission_resolved');
          if (simRef.current) {
            simRef.current.dispatch({
              type: 'AdvanceSimulationTime',
              deltaSeconds: 8 * 3600,
            });
            simRef.current.dispatch({
              type: 'SetPlayerAttribute',
              attribute: 'energy',
              value: 100,
            });
            const newTime = simRef.current.state.time.calendar.timeString;
            setNoticeMessage(
              `🛏️ You slept soundly for 8 hours. You wake up at ${newTime} feeling refreshed and energized. Energy restored to 100%.`
            );
          } else {
            setNoticeMessage('🛏️ You rested for 8 hours and feel refreshed.');
          }
        },
        onPlayerPositionChanged: coords => {
          setPlayerPosition({ x: coords.x, z: coords.z });
        },
      });

      // Apply initial workstation camera settings
      manager.setWorkstationSettings(workstationSettings);

      // Support instant workstation mode entry via URL parameter
      if (initialWsParam === 'open') {
        const targetWs =
          initialLocParam === 'apartment_interior'
            ? 'interact_apartment_workstation'
            : 'interact_cedarline_workstation';
        manager.enterWorkstationDirectly(targetWs);
        setWorkstationState('SCREEN_FULLSCREEN');
      }

      managerRef.current = manager;
      if (typeof window !== 'undefined') {
        (window as unknown as Record<string, unknown>).__CYBERLIFE_WORLD_MANAGER__ = manager;
        (window as unknown as Record<string, unknown>).__CYBERLIFE_SIMULATION__ = sim;
      }
      setIsLoading(false);
      onInitializedRef.current?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setErrorMessage(error.message);
      setIsLoading(false);
      onErrorRef.current?.(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLocParam, initialWsParam]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).__CYBERLIFE_SIMULATION__ = sim;
    }
  }, [sim]);

  // Synchronize 3D world lighting and sky with simulation calendar time
  useEffect(() => {
    if (sim?.state.time.calendar.timeString && managerRef.current) {
      managerRef.current.setSimulationTime(sim.state.time.calendar.timeString);
    }
  }, [sim?.state.time.calendar.timeString]);

  // Game clock ticker: advances in-game time smoothly during active gameplay
  useEffect(() => {
    if (!sim) return;

    const interval = setInterval(() => {
      // 1 real-world second = 15 simulation seconds (1 game minute every 4 seconds)
      sim.dispatch({
        type: 'AdvanceSimulationTime',
        deltaSeconds: 15,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [sim]);

  useEffect(() => {
    initializeScene();

    return () => {
      if (managerRef.current) {
        managerRef.current.dispose();
        managerRef.current = null;
        if (typeof window !== 'undefined') {
          delete (window as unknown as Record<string, unknown>).__CYBERLIFE_WORLD_MANAGER__;
        }
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
    sfxController.playWorkstationExit();
    if (managerRef.current) {
      managerRef.current.exitWorkstationSession();
    } else {
      setIsDesktopOpen(false);
      setWorkstationState('WALKING');
    }
    ambienceController.setWorkstationFocus(false);
    const loc = managerRef.current?.getCurrentLocation()?.id ?? currentLocation.id;
    if (loc === 'apartment_interior') {
      musicController.setContext('APARTMENT_DOWNTIME');
    } else {
      musicController.setContext('WORLD_EXPLORATION');
    }
  }, [currentLocation.id]);

  const handleSettingsChanged = useCallback((settings: WorkstationSettings) => {
    setWorkstationSettings(settings);
    managerRef.current?.setWorkstationSettings(settings);
  }, []);

  // Keyboard shortcut listener when peeked out in SEATED_THIRD_PERSON
  useEffect(() => {
    if (!isDesktopOpen || workstationState !== 'SEATED_THIRD_PERSON') return;

    const handlePeekedKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        e.stopPropagation();
        managerRef.current?.focusWorkstationScreen();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        handleCloseDesktop();
      }
    };

    window.addEventListener('keydown', handlePeekedKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handlePeekedKeyDown, true);
    };
  }, [isDesktopOpen, workstationState, handleCloseDesktop]);

  const handleCloseDialogue = useCallback(() => {
    setActiveNpcId(null);
    if (managerRef.current) {
      managerRef.current.setInputDisabled(false);
      managerRef.current.endNpcDialogue();
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

      {/* M7 Interactive Branching Dialogue Overlay */}
      {activeNpcId && <DialogueOverlay npcId={activeNpcId} onClose={handleCloseDialogue} />}

      {/* Fatigue Sleep Prompt (when player worked long hours or energy is low) */}
      {!isDesktopOpen && sim && sim.state.player.energy <= 35 && (
        <div
          role="status"
          aria-live="polite"
          className="fatigue-prompt-banner hud-interactive"
          style={{
            position: 'absolute',
            bottom: '5.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 22,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '0.5rem 1rem',
            color: '#fef3c7',
            fontSize: '0.82rem',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          }}
        >
          <span style={{ fontSize: '1.1rem' }}>💤</span>
          <span>
            <strong>Fatigued from long hours:</strong> Energy is low ({sim.state.player.energy}%).
            Head to the bed in your apartment to sleep and recharge.
          </span>
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
          playerCoords={playerPosition}
          onToggleCamera={handleToggleCamera}
          onInteract={handleInteract}
          onSettingsChanged={handleSettingsChanged}
          onOpenMainMenu={() => {
            setIsMainMenuOpen(true);
            musicController.setContext('MAIN_MENU');
          }}
        />
      )}

      {/* On-screen controls when peeked out at workstation */}
      {isDesktopOpen && workstationState === 'SEATED_THIRD_PERSON' && (
        <div className="workstation-peek-controls" data-testid="workstation-peek-controls">
          <button
            type="button"
            className="btn-peek-action btn-peek-focus"
            onClick={() => managerRef.current?.focusWorkstationScreen()}
            aria-label="Focus screen (Tab)"
          >
            <span>🖥️</span> Focus Screen <kbd className="key-hint-badge">Tab</kbd>
          </button>
          <button
            type="button"
            className="btn-peek-action btn-peek-stand"
            onClick={handleCloseDesktop}
            aria-label="Stand up and leave workstation (Esc)"
          >
            <span>🚶</span> Stand Up <kbd className="key-hint-badge">Esc</kbd>
          </button>
        </div>
      )}

      {/* M4 Virtual Desktop Overlay */}
      {isDesktopOpen && (
        <div
          className={`workstation-desktop-overlay ${
            workstationState === 'SCREEN_FULLSCREEN' ? 'visible' : ''
          }`}
          data-testid="workstation-desktop-overlay"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            pointerEvents: workstationState === 'SCREEN_FULLSCREEN' ? 'auto' : 'none',
            opacity: workstationState === 'SCREEN_FULLSCREEN' ? 1 : 0,
            transition: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          <DesktopShell
            workstationId={activeWorkstationId}
            cameraMode={cameraMode}
            layout="fullscreen"
            initialApp={initialAppParam ?? undefined}
            onExitDesktop={handleCloseDesktop}
            onPeekOut={() => managerRef.current?.peekOutWorkstation()}
            showKeyHints={workstationSettings.showKeyHints}
            onTyping={() => {
              managerRef.current?.triggerTypingAnimation();
              sfxController.playKeystroke();
            }}
            onMouseUse={() => managerRef.current?.triggerMouseAnimation()}
            onTerminalOutput={lines => managerRef.current?.updateWorkstationTerminal(lines)}
            onDesktopStateChange={state => managerRef.current?.updateWorkstationDesktopState(state)}
          />
        </div>
      )}

      {/* M15 Atmospheric Main Menu / Title Screen Overlay */}
      <MainMenuOverlay
        isOpen={isMainMenuOpen}
        onStartGame={() => {
          try {
            localStorage.setItem('cyberlife_menu_entered', 'true');
          } catch {
            // Storage unavailable in private browsing
          }
          setIsMainMenuOpen(false);
          startInGameAudio();
        }}
        onOpenSettings={() => {}}
        onOpenControls={() => {
          setIsMainMenuOpen(false);
        }}
      />
    </div>
  );
};
