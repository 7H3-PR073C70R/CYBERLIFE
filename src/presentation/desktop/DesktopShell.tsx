/**
 * Cyberlife — DesktopShell Component (Orion OS Security Workstation)
 *
 * MATE/GTK inspired classical cybersecurity workstation environment:
 * - Single source of truth branding via osBranding.ts & osTokens.ts
 * - Top panel: Applications, Places, System menus, quick launchers, running windows strip, tray clock & exit
 * - Left-aligned desktop shortcuts with Lucide vector icons, text shadow, and double-click to open
 * - Procedural circuit & node gradient wallpaper (100% code-generated, zero bird logos or external artwork)
 * - Restyled WindowFrame with centered title, Lucide controls, snapping, and resize handles
 * - Short skippable boot/login transition moment on first sit-down
 * - Right-click context menu (Terminal, Files, Packet Lens, System Specs)
 * - Multi-app routing with zero emojis in UI
 */

import React, { useState, useEffect, useRef } from 'react';
import { AppId, APP_REGISTRY } from './types';
import { useWindowManager } from './useWindowManager';
import { WindowFrame } from './WindowFrame';
import { TopPanel } from './TopPanel';
import { TerminalApp } from './apps/TerminalApp';
import { FieldGuideApp } from './apps/FieldGuideApp';
import { SystemInfoApp } from './apps/SystemInfoApp';
import { NotesApp } from './apps/NotesApp';
import { ActivityApp } from './apps/ActivityApp';
import { IncidentApp } from './apps/IncidentApp';
import { ContactsApp } from './apps/ContactsApp';
import { CareerApp } from './apps/CareerApp';
import { SaveManagerApp } from './apps/SaveManagerApp';
import { HelpCenterApp } from './apps/HelpCenterApp';
import { CyberCatalogueApp } from './apps/CyberCatalogueApp';
import { FileManagerApp } from './apps/FileManagerApp';
import { PacketLensApp } from './apps/PacketLensApp';
import { RevLensApp } from './apps/RevLensApp';
import { RuleTunerApp } from './apps/RuleTunerApp';
import { TorBrowserApp } from './apps/TorBrowserApp';
import { OnionChatApp } from './apps/OnionChatApp';
import { SecurityNewsApp } from './apps/SecurityNewsApp';
import { ExploitLabApp } from './apps/ExploitLabApp';
import { WebProxyApp } from './apps/WebProxyApp';
import { SocialPretextApp } from './apps/SocialPretextApp';
import { DefensiveOpsApp } from './apps/DefensiveOpsApp';
import { RedTeamApp } from './apps/RedTeamApp';
import { BountyApp } from './apps/BountyApp';
import { HumanIntelApp } from './apps/HumanIntelApp';
import { JournalApp } from './apps/JournalApp';
import { BottomPanel } from './BottomPanel';

import { HackerCallOverlay } from './HackerCallOverlay';
import { HackerCallState, ChatThread } from '@/simulation/cyber/chat';
import { audioSfx } from '../audio/audioSfx';
import { INITIAL_CHAT_THREADS } from '@/simulation/cyber/chat/chatData';
import { useOptionalSimulation } from '@/application/simulation/SimulationContext';
import { CameraMode } from '../world/worldConfig';
import { ScreenDesktopState } from '../world/ScreenRenderer';
import { OS_NAME, OS_VERSION, KERNEL_STRING } from './osBranding';
import { getWallpaperDataUrl } from './wallpaper';
import { OsIcon, OsIconName } from './icons/OsIcons';
import { ScopeWarningDialog } from './components/ScopeWarningDialog';
import { DefenderViewModal } from './components/DefenderViewModal';
import { EnterpriseDebriefModal } from './components/EnterpriseDebriefModal';
import { IncidentChoiceModal } from './components/IncidentChoiceModal';
import { EPISODE_01_DEFINITION } from '@/simulation/narrative/episodeData';

export interface DesktopShellProps {
  workstationId?: string;
  cameraMode?: CameraMode;
  layout?: 'bounded' | 'fullscreen';
  onExitDesktop: () => void;
  onPeekOut?: () => void;
  showKeyHints?: boolean;
  initialApp?: AppId;
  onTyping?: () => void;
  onMouseUse?: () => void;
  onTerminalOutput?: (lines: string[]) => void;
  onDesktopStateChange?: (state: Partial<ScreenDesktopState>) => void;
}

export const DesktopShell: React.FC<DesktopShellProps> = ({
  workstationId = 'interact_cedarline_workstation',
  cameraMode = 'THIRD_PERSON',
  layout = 'bounded',
  onExitDesktop,
  onPeekOut,
  initialApp = 'terminal',
  onTyping,
  onMouseUse,
  onTerminalOutput,
  onDesktopStateChange,
}) => {
  const sim = useOptionalSimulation();
  const desktopRef = useRef<HTMLDivElement | null>(null);

  const {
    windows,
    openApp,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    toggleMinimize,
    focusWindow,
    moveWindow,
    resizeWindow,
    snapWindow,
    getActiveWindowId,
  } = useWindowManager({ initialOpenApp: initialApp });

  // Orientation banner (auto-dismiss when a non-terminal initialApp is requested)
  const [showWelcomeBanner, setShowWelcomeBanner] = useState<boolean>(
    () => !initialApp || initialApp === 'terminal'
  );
  const showWelcomeBannerRef = useRef(showWelcomeBanner);
  showWelcomeBannerRef.current = showWelcomeBanner;

  // Short skippable boot/login moment on first sit-down (1.6s)
  const skipBootParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('skipBoot') === '1';
  const [bootMomentActive, setBootMomentActive] = useState<boolean>(() => !skipBootParam);
  const [showDebriefModal, setShowDebriefModal] = useState<boolean>(false);
  const traceState = sim?.state.trace;
  const isImmersive = sim?.state.episode?.guidanceMode === 'Immersive';

  useEffect(() => {
    const timer = setTimeout(() => {
      setBootMomentActive(false);
    }, 1600);
    return () => clearTimeout(timer);
  }, []);

  const dismissBoot = () => setBootMomentActive(false);

  // Selected desktop icon
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null);

  // Active Workspace (1-4)
  const [activeWorkspace, setActiveWorkspace] = useState<number>(1);

  // Hacker VoIP Call State (Hacker Simulator style)
  const [callState, setCallState] = useState<HackerCallState | null>(null);
  const [activeCallThread, setActiveCallThread] = useState<ChatThread | null>(null);

  // Trigger initial story incoming call from SecOps lead after sitting down
  useEffect(() => {
    const callTimer = setTimeout(() => {
      setCallState(current => {
        if (current) return current;
        const amina = INITIAL_CHAT_THREADS[0]!;
        setActiveCallThread(amina);
        return {
          id: `call-incoming-${Date.now()}`,
          callerId: amina.contactId,
          callerName: amina.contactName,
          callerRole: amina.contactRole,
          callerOrg: amina.contactOrg,
          status: 'ringing',
          durationSeconds: 0,
          currentSubtitleIndex: 0,
          isMuted: false,
        };
      });
    }, 6000);
    return () => clearTimeout(callTimer);
  }, []);

  const handleStartOutgoingCall = (thread: ChatThread) => {
    setActiveCallThread(thread);
    setCallState({
      id: `call-${Date.now()}`,
      callerId: thread.contactId,
      callerName: thread.contactName,
      callerRole: thread.contactRole,
      callerOrg: thread.contactOrg,
      status: 'active',
      durationSeconds: 0,
      currentSubtitleIndex: 0,
      isMuted: false,
    });
    audioSfx.playConnect();
  };

  // Listen for episode urgent VoIP calls
  useEffect(() => {
    const episodeCall = sim?.state.episode?.activeCall;
    if (episodeCall) {
      const dialogueLines = episodeCall.dialogue.map(d => ({
        text: d.text,
        delayMs: d.delayMs ?? 3000,
        speech: d.speech,
        delivery: d.delivery,
      }));
      const dynamicThread: ChatThread = {
        id: `thread-${episodeCall.callerId}`,
        contactId: episodeCall.callerId,
        contactName: episodeCall.callerName,
        contactRole: episodeCall.callerRole,
        contactOrg: episodeCall.callerOrg ?? 'Cedarline SecOps',
        contactAvatarColor: '#f59e0b',
        isOnline: true,
        securityClearance: 'SEC-VOIP // EPISODE STREAM',
        unreadCount: 0,
        canCall: true,
        callDialogue: dialogueLines,
        messages: [],
      };
      setActiveCallThread(dynamicThread);
      setCallState({
        id: episodeCall.id,
        callerId: episodeCall.callerId,
        callerName: episodeCall.callerName,
        callerRole: episodeCall.callerRole,
        callerOrg: episodeCall.callerOrg ?? 'Cedarline SecOps',
        status: 'ringing',
        durationSeconds: 0,
        currentSubtitleIndex: 0,
        isMuted: false,
      });
    }
  }, [sim?.state.episode?.activeCall]);

  const handleAcceptCall = () => {
    if (!callState) return;
    setCallState(prev => (prev ? { ...prev, status: 'active' } : null));
    audioSfx.playConnect();
  };

  const handleDeclineCall = () => {
    if (sim?.state.episode?.activeCall && callState?.id === sim.state.episode.activeCall.id) {
      sim.dispatch({ type: 'CompleteEpisodeBeat', beatId: sim.state.episode.activeCall.id });
    }
    setCallState(null);
    setActiveCallThread(null);
    audioSfx.playDisconnect();
  };

  const handleEndCall = () => {
    if (sim?.state.episode?.activeCall && callState?.id === sim.state.episode.activeCall.id) {
      sim.dispatch({ type: 'CompleteEpisodeBeat', beatId: sim.state.episode.activeCall.id });
    }
    setCallState(null);
    setActiveCallThread(null);
    audioSfx.playDisconnect();
  };

  const handleToggleShowDesktop = () => {
    const anyOpenNotMinimized = (Object.keys(APP_REGISTRY) as AppId[]).some(
      id => windows[id].isOpen && !windows[id].isMinimized
    );
    (Object.keys(APP_REGISTRY) as AppId[]).forEach(id => {
      if (windows[id].isOpen) {
        if (anyOpenNotMinimized) {
          minimizeWindow(id);
        } else {
          toggleMinimize(id);
        }
      }
    });
  };

  // Desktop Right-Click Context Menu
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const activeWindowId = getActiveWindowId();
  const activeWindowIdRef = useRef(activeWindowId);
  activeWindowIdRef.current = activeWindowId;

  // Global Keyboard Shortcuts with Focus Isolation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (bootMomentActive) {
        setBootMomentActive(false);
      }

      // Don't intercept typing if active element is an editable text field
      const activeEl = document.activeElement;
      const isInputFocused =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();

        if (contextMenu) {
          setContextMenu(null);
          return;
        }

        if (showWelcomeBannerRef.current) {
          setShowWelcomeBanner(false);
          return;
        }

        onExitDesktop();
        return;
      }

      if (e.key === 'Tab' && !e.ctrlKey && !e.altKey && !isInputFocused) {
        if (onPeekOut) {
          e.preventDefault();
          e.stopPropagation();
          onPeekOut();
        }
        return;
      }

      if (e.altKey && e.key === 'F1') {
        e.preventDefault();
        e.stopPropagation();
        // Alt+F1 activates terminal or opens applications
        openApp('terminal');
        return;
      }

      if (e.ctrlKey && e.altKey && (e.key === 't' || e.key === 'T')) {
        e.preventDefault();
        e.stopPropagation();
        openApp('terminal');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
    };
  }, [onExitDesktop, onPeekOut, contextMenu, bootMomentActive, openApp]);

  // Listen for open-app events dispatched from CommandCopyChip or Desktop Incident Banner
  useEffect(() => {
    const handleOpenAppEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ appId: AppId }>;
      const targetAppId = customEvent.detail?.appId;
      if (targetAppId && targetAppId in APP_REGISTRY) {
        openApp(targetAppId);
        focusWindow(targetAppId);
      }
    };

    window.addEventListener('cyberlife:desktop:open-app', handleOpenAppEvent);
    return () => window.removeEventListener('cyberlife:desktop:open-app', handleOpenAppEvent);
  }, [openApp, focusWindow]);

  // Read authoritative in-game simulation time
  const simulationTime = sim?.state.time.calendar.timeString ?? '08:00 AM';

  const isMissionDone = Boolean(
    sim?.state.mission?.isCompleted || sim?.state.flags?.mission_aster_completed
  );
  const hasActiveIncident = Boolean(sim?.state.mission && !isMissionDone);

  const workstationName = workstationId.includes('cedarline')
    ? 'Cedarline Corp SecOps Desk 04'
    : 'Apartment Home Lab Rig';

  const isCedarline = workstationId.includes('cedarline');

  // Sync state with 3D screen texture
  useEffect(() => {
    if (!onDesktopStateChange) return;

    const openWindowsList = (Object.keys(windows) as AppId[])
      .map(id => windows[id])
      .filter(w => w.isOpen)
      .map(w => ({
        id: w.id,
        title: w.title,
        icon: typeof w.icon === 'string' ? w.icon : 'app',
        isMinimized: w.isMinimized,
        isMaximized: w.isMaximized,
        position: w.position,
        size: w.size,
      }));

    onDesktopStateChange({
      openWindows: openWindowsList,
      activeWindowId,
      simulationTime,
      workstationName,
    });
  }, [windows, activeWindowId, simulationTime, workstationName, onDesktopStateChange]);

  const appKeys = Object.keys(APP_REGISTRY) as AppId[];
  const hasOpenWindows = appKeys.some(id => windows[id].isOpen && !windows[id].isMinimized);

  const modeClass = cameraMode === 'THIRD_PERSON' ? 'mode-third-person' : 'mode-first-person';
  const layoutClass = layout === 'fullscreen' ? 'layout-fullscreen' : 'layout-bounded';

  return (
    <div
      className={`workstation-overlay-backdrop ${modeClass} ${layoutClass}`}
      data-testid="workstation-overlay-backdrop"
      onMouseMove={() => onMouseUse?.()}
      onClick={() => {
        onMouseUse?.();
        if (contextMenu) setContextMenu(null);
      }}
    >
      <div
        ref={desktopRef}
        className={`desktop-shell-container os-theme ${modeClass} ${layoutClass}`}
        role="region"
        aria-label={`${OS_NAME} Cyberlife Virtual Desktop`}
        data-testid="desktop-shell-container"
        style={{
          background: `url("${getWallpaperDataUrl()}") center center / cover no-repeat, #060a10`,
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        }}
      >
        {/* Top Panel (Applications, Places, System, Quick Launchers, Windows Strip, Tray) */}
        <TopPanel
          windows={windows}
          activeWindowId={activeWindowId}
          simulationTime={simulationTime}
          onOpenApp={appId => {
            openApp(appId);
            onMouseUse?.();
          }}
          onToggleMinimize={appId => {
            toggleMinimize(appId);
            onMouseUse?.();
          }}
          onFocusWindow={appId => {
            focusWindow(appId);
            onMouseUse?.();
          }}
          onExitDesktop={onExitDesktop}
          onPeekOut={onPeekOut}
          isPeekAvailable={layout === 'fullscreen'}
          onOpenDebrief={() => setShowDebriefModal(true)}
        />

        {/* Workspace Area */}
        <div
          className="desktop-workspace"
          data-testid="desktop-workspace"
          onClick={() => setSelectedIcon(null)}
          onContextMenu={e => {
            e.preventDefault();
            const rect = desktopRef.current?.getBoundingClientRect();
            const x = rect ? e.clientX - rect.left : e.clientX;
            const y = rect ? e.clientY - rect.top : e.clientY;
            setContextMenu({ x, y });
          }}
          style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient Security Distro Watermark */}
          <div className="desktop-watermark" aria-hidden="true">
            <div className="watermark-logo">
              {OS_NAME.toUpperCase()} {OS_VERSION}
            </div>
            <div className="watermark-sub">{workstationName}</div>
            <div className="watermark-status">
              100% IN-GAME VFS // M3 CLOCK: {simulationTime} // ISOLATED SANDBOX
            </div>
          </div>

          {/* Active Mission Incident Banner (Prominently alerts player of active case) */}
          {hasActiveIncident && sim?.state.mission && (() => {
            const activeObjIndex = sim.state.mission.objectives.findIndex(o => !o.isCompleted);
            const activeObj =
              activeObjIndex >= 0
                ? sim.state.mission.objectives[activeObjIndex]
                : sim.state.mission.objectives[sim.state.mission.objectives.length - 1];
            const currentStepNum =
              activeObjIndex >= 0
                ? activeObjIndex + 1
                : sim.state.mission.objectives.length;

            return (
              <div
                className="desktop-incident-banner"
                data-testid="desktop-incident-banner"
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '96px',
                  right: '16px',
                  zIndex: 12,
                  backgroundColor: 'rgba(15, 23, 42, 0.94)',
                  borderColor: '#f59e0b',
                }}
              >
                <div className="incident-banner-left">
                  <span className="incident-pulse-icon" aria-hidden="true">
                    🚨
                  </span>
                  <div className="incident-banner-meta">
                    <span
                      className="incident-banner-case"
                      style={{ color: '#fef08a' }}
                    >
                      ACTIVE SOC DISPATCH // {sim.state.mission.title}
                    </span>
                    <span className="incident-banner-objective">
                      Step {currentStepNum}/9: {activeObj?.title ?? 'Finalize & submit incident report'}
                    </span>
                  </div>
                </div>

                <div className="incident-banner-actions">
                  <button
                    type="button"
                    className="btn-incident-banner-primary"
                    onClick={() => {
                      openApp('incident');
                      focusWindow('incident');
                    }}
                    data-testid="btn-banner-open-incident"
                  >
                    📋 Open Incident Report &amp; Checklist
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Desktop Shortcut Icons (Left vertical grid) */}
          <div
            className="desktop-icons-grid"
            role="toolbar"
            aria-label="Desktop Shortcuts"
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'wrap',
              maxHeight: 'calc(100% - 24px)',
              gap: '12px 18px',
              zIndex: 10,
              pointerEvents: 'auto',
            }}
          >
            {/* System Home folder shortcut */}
            <button
              type="button"
              className={`desktop-shortcut-btn ${selectedIcon === 'home' ? 'shortcut-selected' : ''}`}
              onClick={e => {
                e.stopPropagation();
                setSelectedIcon('home');
              }}
              onDoubleClick={e => {
                e.stopPropagation();
                openApp('files');
                onMouseUse?.();
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '64px',
                padding: '3px 2px',
                background: selectedIcon === 'home' ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                border:
                  selectedIcon === 'home'
                    ? '1px solid rgba(0, 229, 255, 0.4)'
                    : '1px solid transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#f8fafc',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.95)',
              }}
            >
              <div className="shortcut-icon" aria-hidden="true" style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <OsIcon name="home" size={26} color="#00e5ff" />
              </div>
              <span
                style={{ fontSize: '10px', marginTop: '3px', textAlign: 'center', fontWeight: 500 }}
              >
                Home
              </span>
            </button>

            {/* Trash icon */}
            <button
              type="button"
              className={`desktop-shortcut-btn ${selectedIcon === 'trash' ? 'shortcut-selected' : ''}`}
              onClick={e => {
                e.stopPropagation();
                setSelectedIcon('trash');
              }}
              onDoubleClick={e => {
                e.stopPropagation();
                openApp('files');
                onMouseUse?.();
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '64px',
                padding: '3px 2px',
                background: selectedIcon === 'trash' ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                border:
                  selectedIcon === 'trash'
                    ? '1px solid rgba(0, 229, 255, 0.4)'
                    : '1px solid transparent',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#f8fafc',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.95)',
              }}
            >
              <div className="shortcut-icon" aria-hidden="true" style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <OsIcon name="trash" size={26} color="#94a3b8" />
              </div>
              <span
                style={{ fontSize: '10px', marginTop: '3px', textAlign: 'center', fontWeight: 500 }}
              >
                Trash
              </span>
            </button>

            {/* Registered Application Shortcuts */}
            {appKeys.map(appId => {
              const def = APP_REGISTRY[appId];
              const win = windows[appId];
              const isRunning = win.isOpen;
              const isSelected = selectedIcon === appId;
              const iconName =
                typeof def.icon === 'string' &&
                  def.icon in
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
                    tor: 1,
                    chat: 1,
                    call: 1,
                    securityNews: 1,
                    exploitLab: 1,
                    webProxy: 1,
                    socialPretext: 1,
                    defensiveOps: 1,
                    bountyHub: 1,
                  }
                  ? (def.icon as OsIconName)

                  : undefined;

              return (
                <button
                  key={appId}
                  type="button"
                  className={`desktop-shortcut-btn ${isSelected ? 'shortcut-selected' : ''} ${isRunning ? 'shortcut-running' : ''} ${appId === 'incident' && hasActiveIncident ? 'shortcut-active-incident' : ''}`}
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedIcon(appId);
                    openApp(appId);
                    onMouseUse?.();
                  }}
                  onDoubleClick={e => {
                    e.stopPropagation();
                    openApp(appId);
                    onMouseUse?.();
                  }}
                  aria-label={`Launch ${def.title}`}
                  data-testid={`desktop-shortcut-${appId}`}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    width: '64px',
                    padding: '3px 2px',
                    background: isSelected ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                    border: isSelected
                      ? '1px solid rgba(0, 229, 255, 0.4)'
                      : '1px solid transparent',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    color: '#f8fafc',
                    textShadow: '0 1px 3px rgba(0, 0, 0, 0.95)',
                    position: 'relative',
                  }}
                >
                  <div className="shortcut-icon" aria-hidden="true" style={{ width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <OsIcon name={iconName || 'terminal'} size={26} color="#00e5ff" />
                  </div>
                  <div
                    className="shortcut-label"
                    style={{
                      fontSize: '10px',
                      marginTop: '3px',
                      textAlign: 'center',
                      fontWeight: 500,
                      lineHeight: '1.15',
                      maxWidth: '62px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {def.shortTitle}
                  </div>
                  {isRunning && (
                    <span
                      className="shortcut-dot"
                      title="Running"
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '12px',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#00e676',
                        boxShadow: '0 0 6px #00e676',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Right-Click Context Menu */}
          {contextMenu && (
            <div
              className="desktop-context-menu"
              style={{
                position: 'absolute',
                top: `${contextMenu.y}px`,
                left: `${contextMenu.x}px`,
                backgroundColor: '#0c131f',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(0, 229, 255, 0.2)',
                zIndex: 8000,
                minWidth: '190px',
                padding: '4px 0',
                display: 'flex',
                flexDirection: 'column',
              }}
              onClick={e => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => {
                  openApp('terminal');
                  setContextMenu(null);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <OsIcon name="terminal" size={14} color="#00e5ff" />
                <span>Open Terminal</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openApp('files');
                  setContextMenu(null);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <OsIcon name="files" size={14} color="#00e676" />
                <span>Open File Manager</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  openApp('packetLens');
                  setContextMenu(null);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <OsIcon name="packetLens" size={14} color="#38bdf8" />
                <span>Open Packet Lens</span>
              </button>

              <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '4px 0' }} />

              <button
                type="button"
                disabled
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  textAlign: 'left',
                  cursor: 'not-allowed',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <OsIcon name="folder" size={14} color="#64748b" />
                <span>New Folder (Read-Only VFS)</span>
              </button>

              <button
                type="button"
                disabled
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#64748b',
                  textAlign: 'left',
                  cursor: 'not-allowed',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <OsIcon name="desktop" size={14} color="#64748b" />
                <span>Change Wallpaper (Procedural)</span>
              </button>

              <div style={{ height: '1px', backgroundColor: '#1e293b', margin: '4px 0' }} />

              <button
                type="button"
                onClick={() => {
                  openApp('systemInfo');
                  setContextMenu(null);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#f8fafc',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <OsIcon name="systemInfo" size={14} color="#f59e0b" />
                <span>System Specifications</span>
              </button>
            </div>
          )}

          {/* Empty desktop state hint when no windows are open */}
          {!hasOpenWindows && (
            <div className="empty-desktop-hint" data-testid="empty-desktop-hint">
              <span className="empty-hint-icon" aria-hidden="true">
                <OsIcon name="osLogo" size={40} color="#00e5ff" />
              </span>
              <p className="empty-hint-title">{OS_NAME} Security Station Active</p>
              <p className="empty-hint-text">
                Double-click an icon on the left, use the Applications menu above, or right-click to
                launch tools.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                {hasActiveIncident && (
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      openApp('incident');
                      focusWindow('incident');
                      onMouseUse?.();
                    }}
                    style={{
                      fontSize: '0.85rem',
                      backgroundColor: 'rgba(56, 189, 248, 0.2)',
                      borderColor: '#38bdf8',
                      color: '#38bdf8',
                    }}
                    data-testid="btn-empty-open-incident"
                  >
                    <OsIcon name="incident" size={14} color="currentColor" /> Open Incident Report
                  </button>
                )}
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    openApp('terminal');
                    onMouseUse?.();
                  }}
                  style={{ fontSize: '0.85rem' }}
                  data-testid="btn-empty-open-terminal"
                >
                  <OsIcon name="terminal" size={14} color="currentColor" /> Open Terminal
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    openApp('files');
                    onMouseUse?.();
                  }}
                  style={{ fontSize: '0.85rem', backgroundColor: '#1e293b' }}
                >
                  <OsIcon name="files" size={14} color="currentColor" /> Open Files
                </button>
              </div>
            </div>
          )}

          {/* First-Time Non-Blocking Workstation Orientation Hint */}
          {showWelcomeBanner && (
            <aside
              className="desktop-welcome-banner hud-interactive"
              role="status"
              aria-live="polite"
              aria-label="Workstation Orientation Hint"
              data-testid="desktop-welcome-banner"
            >
              <div className="welcome-banner-header">
                <span className="welcome-icon" aria-hidden="true">
                  <OsIcon name="osLogo" size={18} color="#00e5ff" />
                </span>
                <div className="welcome-title-group">
                  <h4 className="welcome-title" style={{ fontSize: '0.85rem', margin: 0 }}>
                    Workstation Ready
                  </h4>
                </div>
                <button
                  type="button"
                  className="welcome-btn-close"
                  onClick={() => setShowWelcomeBanner(false)}
                  aria-label="Close orientation hint"
                  data-testid="btn-welcome-close"
                >
                  ✕
                </button>
              </div>

              <div className="welcome-banner-body" style={{ fontSize: '0.75rem', lineHeight: 1.4 }}>
                <p style={{ margin: '0 0 6px 0', color: '#94a3b8' }}>
                  Commands run in a sandboxed virtual shell. Press <kbd>Esc</kbd> to stand up. Comprehensive guides available in <strong>Help Center</strong> &amp; <strong>Field Guide</strong>.
                </p>
              </div>

              <div className="welcome-banner-footer" style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setShowWelcomeBanner(false)}
                  data-testid="btn-welcome-dismiss"
                  style={{ backgroundColor: '#1e293b', fontSize: '0.72rem', padding: '3px 8px' }}
                >
                  Dismiss
                </button>
              </div>
            </aside>
          )}

          {/* Application Windows */}
          {appKeys.map(appId => {
            const win = windows[appId];
            if (!win.isOpen) return null;

            const isActive = activeWindowId === appId;

            return (
              <WindowFrame
                key={appId}
                windowState={win}
                isActive={isActive}
                onFocus={() => {
                  focusWindow(appId);
                  onMouseUse?.();
                }}
                onClose={() => {
                  closeWindow(appId);
                  onMouseUse?.();
                }}
                onMinimize={() => {
                  minimizeWindow(appId);
                  onMouseUse?.();
                }}
                onMaximize={() => {
                  maximizeWindow(appId);
                  onMouseUse?.();
                }}
                onMove={(x, y) => {
                  const bounds = desktopRef.current
                    ? {
                      width: desktopRef.current.clientWidth,
                      height: desktopRef.current.clientHeight,
                    }
                    : undefined;
                  moveWindow(appId, x, y, bounds);
                  onMouseUse?.();
                }}
                onResize={(w, h) => {
                  resizeWindow(appId, w, h);
                  onMouseUse?.();
                }}
                onSnap={snap => {
                  snapWindow(appId, snap);
                  onMouseUse?.();
                }}
              >
                {appId === 'terminal' && (
                  <TerminalApp
                    workstationId={workstationId}
                    onTyping={onTyping}
                    onTerminalOutput={onTerminalOutput}
                  />
                )}
                {appId === 'fieldGuide' && <FieldGuideApp />}
                {appId === 'systemInfo' && <SystemInfoApp workstationId={workstationId} />}
                {appId === 'notes' && <NotesApp workstationId={workstationId} />}
                {appId === 'activity' && <ActivityApp workstationId={workstationId} />}
                {appId === 'incident' && <IncidentApp />}
                {appId === 'contacts' && <ContactsApp />}
                {appId === 'career' && <CareerApp />}
                {appId === 'saveManager' && <SaveManagerApp />}
                {appId === 'helpCenter' && <HelpCenterApp />}
                {appId === 'catalogue' && <CyberCatalogueApp onOpenApp={openApp} />}
                {appId === 'files' && <FileManagerApp />}
                {appId === 'packetLens' && <PacketLensApp />}
                {appId === 'revLens' && <RevLensApp />}
                {appId === 'ruleTuner' && <RuleTunerApp />}
                {appId === 'torBrowser' && <TorBrowserApp />}
                {appId === 'onionChat' && <OnionChatApp onStartCall={handleStartOutgoingCall} />}
                {appId === 'securityNews' && <SecurityNewsApp />}
                {appId === 'exploitLab' && <ExploitLabApp />}
                {appId === 'webProxy' && <WebProxyApp />}
                {appId === 'socialPretext' && <SocialPretextApp />}
                {appId === 'defensiveOps' && <DefensiveOpsApp />}
                {appId === 'redTeam' && <RedTeamApp />}
                {appId === 'bountyHub' && <BountyApp />}
                {appId === 'humanIntel' && <HumanIntelApp />}
                {appId === 'journal' && <JournalApp />}
              </WindowFrame>

            );
          })}
        </div>

        {/* Bottom Panel (MATE-style Taskbar, Open Window Tabs & Workspace Pager) */}
        <BottomPanel
          windows={windows}
          activeWindowId={activeWindowId}
          activeWorkspace={activeWorkspace}
          onSelectWorkspace={setActiveWorkspace}
          onToggleWindow={appId => {
            const win = windows[appId];
            if (activeWindowId === appId && win && !win.isMinimized) {
              minimizeWindow(appId);
            } else {
              focusWindow(appId);
            }
          }}
          onToggleShowDesktop={handleToggleShowDesktop}
          onOpenApp={openApp}
        />

        {/* Hacker VoIP Call Overlay HUD */}
        <HackerCallOverlay
          callState={callState}
          activeThread={activeCallThread}
          onAcceptCall={handleAcceptCall}
          onDeclineCall={handleDeclineCall}
          onEndCall={handleEndCall}
        />

        {/* Skippable Boot/Login Moment (1.6s auto-fadeout or click to dismiss) */}
        {bootMomentActive && (
          <div
            className="Orion-boot-splash"
            onClick={dismissBoot}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(5, 9, 15, 0.94)',
              zIndex: 9000,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              animation: 'fadeIn 180ms ease-out',
            }}
          >
            <OsIcon name="osLogo" size={48} color="#00e5ff" />
            <h2
              style={{
                color: '#f8fafc',
                fontSize: '1.25rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                marginTop: '12px',
                fontFamily: 'Inter, system-ui, sans-serif',
              }}
            >
              {OS_NAME} {OS_VERSION}
            </h2>
            <div
              style={{
                color: '#00e5ff',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.78rem',
                marginTop: '4px',
              }}
            >
              Kernel: {KERNEL_STRING} // Host: {isCedarline ? 'Orion-ws04' : 'Orion-rig'}
            </div>
            <div
              style={{
                color: '#64748b',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.72rem',
                marginTop: '12px',
              }}
            >
              [ Authenticated session initialized for protector ]
            </div>
            <div
              style={{
                color: '#475569',
                fontSize: '0.7rem',
                marginTop: '20px',
              }}
            >
              Press any key or click to skip
            </div>
          </div>
        )}

        {/* RoE Scope Warning Dialog */}
        {traceState?.pendingScopeWarning && (
          <ScopeWarningDialog warning={traceState.pendingScopeWarning} />
        )}

        {/* Defender View Purple Team Debrief Modal */}
        {(showDebriefModal || Boolean(traceState?.activeDebrief) || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('defenderDebrief') === '1')) && (
          <DefenderViewModal
            debrief={
              traceState?.activeDebrief ?? {
                jobId: 'ep01_night_recon',
                completedAtSimTime: 1729670400,
                finalTraceLevel: 60,
                finalLegalExposure: 15,
                totalActions: 1,
                detectedCount: 1,
                overallVerdict: 'SURVEILLED',
                feedbackSummary: 'Aggressive port scans trigger stateless firewall rate-limiters.',
                entries: [
                  {
                    id: 'deb-1',
                    actionName: 'SYN Stealth Scan (Aggressive)',
                    timestampString: '00:14:22',
                    timestampSimTime: 1729670400,
                    target: 'app-portal-01:8080',
                    logFormat: 'CEF',
                    logLine:
                      'CEF:0|Cedarline|EdgeFW|2026.1|PORT_SCAN|TCP SYN Port Scan Detected|7|src=102.89.23.14 dst=10.0.4.15 spt=49210 dpt=8080 proto=TCP act=DROP',
                    status: 'DETECTED',
                    attckTechniqueId: 'T1046',
                    attckTechniqueName: 'Network Service Discovery',
                    blueTeamInsight:
                      'High rate of SYN packets without completing handshake exceeded rate limit threshold (50 pkts/sec).',
                    redTeamLesson:
                      'Use passive OSINT or slow timing template (-T2) with decoy IP addresses.',
                  },
                ],
              }
            }
            onClose={() => {
              setShowDebriefModal(false);
              sim?.dispatch({ type: 'ClearActiveDebrief' });
            }}
          />
        )}

        {/* Incident Escalation Choice Dilemma (Beat 8) */}
        {(sim?.state.episode?.activeChoice || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('choice') === '1')) && (
          <IncidentChoiceModal
            choice={
              sim?.state.episode?.activeChoice ??
              (EPISODE_01_DEFINITION.beats.find(b => b.id === 'ep01_beat_08_choice')?.effects.choice ?? {
                choiceId: 'choice_escalation_ep01',
                title: 'Incident Classification & Escalation Dilemma',
                prompt: 'Assess whether to escalate external C2 anomaly to executive leadership or contain locally.',
                options: [
                  {
                    id: 'opt_escalate_external',
                    label: 'Escalate External Anomalies (Strict Compliance)',
                    description: 'Log external staging pipeline in ticket ALT-2026-1012.',
                  },
                  {
                    id: 'opt_internal_containment',
                    label: 'Classify as Internal Misconfiguration (Team Shield)',
                    description: 'Attribute query strictly to IAM misconfiguration.',
                  },
                ],
              })
            }
          />
        )}

        {/* Enterprise SOC Day Debrief Modal (Beat 9) */}
        {(sim?.state.episode?.activeBeatId === 'ep01_beat_09_day_debrief' || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('dayDebrief') === '1')) && (
          <EnterpriseDebriefModal
            isOpen={true}
            onClose={() => {
              sim?.dispatch({ type: 'CompleteEpisodeBeat', beatId: 'ep01_beat_09_day_debrief' });
            }}
          />
        )}

        {/* Diegetic Immersive Trace Alert Overlay */}
        {isImmersive && traceState && traceState.traceMeter >= 50 && (
          <div
            data-testid="immersive-trace-overlay"
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '16px',
              pointerEvents: 'none',
              padding: '6px 12px',
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              border: `1px solid ${traceState.traceMeter >= 75 ? '#ef4444' : '#eab308'}`,
              borderRadius: '4px',
              color: traceState.traceMeter >= 75 ? '#fca5a5' : '#fef08a',
              fontFamily: 'ui-monospace, monospace',
              fontSize: '11px',
              zIndex: 7000,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>⚠️</span>
            <span>PERIMETER SENSOR SCRUTINY: TRACE {traceState.traceMeter}%</span>
          </div>
        )}
      </div>
    </div>
  );
};
