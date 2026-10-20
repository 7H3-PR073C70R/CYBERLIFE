import * as THREE from 'three';
import {
  CameraMode,
  LocationDefinition,
  InteractableDefinition,
  WORLD_CONFIG,
} from './worldConfig';
import { CollisionWorld } from './CollisionWorld';
import { InteractionRegistry } from './InteractionRegistry';
import { PlayerAvatar } from './entities/PlayerAvatar';
import { PlayerController } from './PlayerController';
import { WorldCameraController } from './WorldCameraController';
import { WorldEnvironment } from './WorldEnvironment';
import { LocationTransitionController } from './LocationTransitionController';
import { SkyEnvironment } from './render/SkyEnvironment';
import {
  WorkstationCameraState,
  WorkstationCameraStateOptions,
} from './camera/WorkstationCameraStates';
import { ScreenDesktopState } from './ScreenRenderer';

export interface NpcDialogueData {
  npcId: string;
  name: string;
  role: string;
  dialogue: string;
}

export interface WorldSceneOptions {
  clearColor?: number;
  antialias?: boolean;
  initialLocationId?: string;
  onInteractionTargetChanged?: (target: InteractableDefinition | null) => void;
  onLocationChanged?: (location: LocationDefinition) => void;
  onCameraModeChanged?: (mode: CameraMode) => void;
  onNoticeboardRead?: (notice: string) => void;
  onWorkstationOpen?: (workstationId: string) => void;
  onWorkstationStateChanged?: (state: WorkstationCameraState) => void;
  onNpcDialogue?: (dialogue: NpcDialogueData) => void;
  onNpcInteract?: (npcId: string) => void;
}

export interface SceneStatistics {
  renderedFrames: number;
  isDisposed: boolean;
  activeLocation: string;
  cameraMode: CameraMode;
}

/**
 * WorldSceneManager encapsulates the Three.js rendering lifecycle:
 * Scene, Camera, Renderer, Animation loop, Player Controller, Collision World,
 * Environment, Interaction Registry, and Location Transitions.
 */
export class WorldSceneManager {
  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private clock: THREE.Clock | null = null;

  // M2 Subsystems
  private collisionWorld: CollisionWorld | null = null;
  private interactionRegistry: InteractionRegistry | null = null;
  private playerAvatar: PlayerAvatar | null = null;
  private playerController: PlayerController | null = null;
  private cameraController: WorldCameraController | null = null;
  private worldEnvironment: WorldEnvironment | null = null;
  private transitionController: LocationTransitionController | null = null;
  private skyEnvironment: SkyEnvironment | null = null;

  // Active interaction target tracking
  private currentTargetId: string | null = null;
  private activeBookmark:
    'apartment_wide' | 'desk_seated_third_person' | 'desk_screen_closeup' | null = null;

  // Callbacks
  private onInteractionTargetChanged?: (target: InteractableDefinition | null) => void;
  private onLocationChanged?: (location: LocationDefinition) => void;
  private onCameraModeChanged?: (mode: CameraMode) => void;
  private onNoticeboardRead?: (notice: string) => void;
  private onWorkstationOpen?: (workstationId: string) => void;
  private onWorkstationStateChanged?: (state: WorkstationCameraState) => void;
  private onNpcDialogue?: (dialogue: NpcDialogueData) => void;
  private onNpcInteract?: (npcId: string) => void;

  private frameCount = 0;
  private isDisposed = false;
  private currentSimTime = '08:00 AM';

  /**
   * Checks whether the current browser environment supports WebGL.
   */
  public static isWebGLAvailable(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return Boolean(
        window.WebGLRenderingContext &&
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
      );
    } catch {
      return false;
    }
  }

  /**
   * Initializes the Three.js scene, camera, renderer, environment, controllers, and render loop.
   */
  public initialize(container: HTMLElement, options: WorldSceneOptions = {}): void {
    if (!container) {
      throw new Error(
        'WorldSceneManager: Initialization failed. Container element is null or undefined.'
      );
    }

    if (!WorldSceneManager.isWebGLAvailable()) {
      throw new Error(
        'WorldSceneManager: WebGL is not available or hardware acceleration is disabled in this browser.'
      );
    }

    this.container = container;
    this.isDisposed = false;
    this.clock = new THREE.Clock();

    this.onInteractionTargetChanged = options.onInteractionTargetChanged;
    this.onLocationChanged = options.onLocationChanged;
    this.onCameraModeChanged = options.onCameraModeChanged;
    this.onNoticeboardRead = options.onNoticeboardRead;
    this.onWorkstationOpen = options.onWorkstationOpen;
    this.onWorkstationStateChanged = options.onWorkstationStateChanged;
    this.onNpcDialogue = options.onNpcDialogue;
    this.onNpcInteract = options.onNpcInteract;

    // 1. Scene Setup
    this.scene = new THREE.Scene();

    // 2. Camera Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(
      WORLD_CONFIG.camera.fov,
      width / height,
      WORLD_CONFIG.camera.near,
      WORLD_CONFIG.camera.far
    );

    // 3. Renderer Setup (ACESFilmicToneMapping, SRGBColorSpace, PCFSoftShadowMap)
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: options.antialias ?? true,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.0;

      const canvas = this.renderer.domElement;
      canvas.className = 'world-viewport-canvas';
      canvas.setAttribute('role', 'region');
      canvas.setAttribute('aria-label', '3D World Viewport — Explorable Lagos Island Environment');
      this.container.appendChild(canvas);
    } catch (err) {
      this.dispose();
      throw new Error(
        `WorldSceneManager: WebGLRenderer creation failed: ${err instanceof Error ? err.message : String(err)}`
      );
    }

    // 4. Core Subsystems Setup
    this.collisionWorld = new CollisionWorld(WORLD_CONFIG.boundaries);
    this.interactionRegistry = new InteractionRegistry();

    // 5. Build Environment (Lagos Island district + landmarks + collision obstacles)
    this.worldEnvironment = new WorldEnvironment(this.collisionWorld, this.interactionRegistry);
    this.scene.add(this.worldEnvironment.getMesh());

    // 6. Lighting & Atmosphere (Procedural Sky, PMREM IBL, PCF soft shadows, horizon haze)
    this.skyEnvironment = new SkyEnvironment(this.scene, this.renderer);
    const initialLoc = options.initialLocationId ?? 'neighborhood';
    const isInitialInterior =
      initialLoc === 'cedarline_interior' || initialLoc === 'apartment_interior';
    this.skyEnvironment.setLocationMode(isInitialInterior);

    // 7. Player Avatar and Controller Setup
    this.playerAvatar = new PlayerAvatar();
    this.scene.add(this.playerAvatar.getMesh());

    this.playerController = new PlayerController({
      avatar: this.playerAvatar,
      collisionWorld: this.collisionWorld,
      initialPosition: WORLD_CONFIG.locations.neighborhood.spawnPosition,
      initialYaw: WORLD_CONFIG.locations.neighborhood.spawnYaw,
      onCameraToggle: () => this.toggleCameraMode(),
      onInteract: () => this.triggerNearbyInteraction(),
    });

    // 8. Camera Controller Setup
    this.cameraController = new WorldCameraController({
      camera: this.camera,
      domElement: this.renderer.domElement,
      avatar: this.playerAvatar,
      initialMode: 'THIRD_PERSON',
      onModeChanged: mode => this.onCameraModeChanged?.(mode),
      onWorkstationStateChanged: state => {
        this.onWorkstationStateChanged?.(state);
        if (state === 'WALKING') {
          this.setInputDisabled(false);
        }
      },
    });

    // 9. Location Transition Controller Setup
    this.transitionController = new LocationTransitionController({
      environment: this.worldEnvironment,
      playerController: this.playerController,
      cameraController: this.cameraController,
      initialLocationId: options.initialLocationId ?? 'neighborhood',
      onLocationChanged: loc => {
        this.skyEnvironment?.setLocationMode(loc.type === 'INTERIOR');
        this.onLocationChanged?.(loc);
      },
    });

    // 10. Resize Handling
    this.setupResizeObserver();

    // 11. Start Animation Loop
    this.startAnimationLoop();
  }

  /**
   * Toggles between First-Person and Third-Person camera modes.
   */
  public toggleCameraMode(): CameraMode {
    if (!this.cameraController) return 'THIRD_PERSON';
    return this.cameraController.toggleMode();
  }

  public getCameraMode(): CameraMode {
    return this.cameraController ? this.cameraController.getMode() : 'THIRD_PERSON';
  }

  /**
   * Directly enters the workstation screen without transitions (for instant testing or URL params).
   */
  public enterWorkstationDirectly(workstationId = 'interact_cedarline_workstation'): void {
    const mode = this.getCameraMode();
    if (this.playerController) {
      this.playerController.setPosition(0, 0, -2.85);
      this.playerController.setYaw(0);
    }
    if (this.cameraController) {
      this.cameraController.enterWorkstationDirectly(mode);
    }
    if (this.worldEnvironment) {
      this.worldEnvironment.getWorkstationProps()?.setFirstPersonMode(mode === 'FIRST_PERSON');
    }
    this.setInputDisabled(true);
    this.onWorkstationOpen?.(workstationId);
  }

  /**
   * Executes interaction with the nearest eligible interactable when E is pressed.
   */
  public triggerNearbyInteraction(): void {
    if (!this.interactionRegistry || !this.playerController || !this.transitionController) return;

    const pos = this.playerController.getPosition();
    const nearest = this.interactionRegistry.findNearest(pos.x, pos.z);

    if (!nearest) return;

    const target = nearest.interactable;

    // If target specifies a destination location, execute scene transition
    if (target.targetLocationId) {
      this.transitionController.transitionTo(target.targetLocationId);
    } else if (target.id.includes('workstation')) {
      const mode = this.getCameraMode();
      // Align player to chair at (0, 0, -2.85) facing north (-Z)
      if (this.playerController) {
        this.playerController.setPosition(0, 0, -2.85);
        this.playerController.setYaw(0);
      }
      if (this.cameraController) {
        this.cameraController.enterWorkstation(mode);
      }
      if (this.worldEnvironment) {
        this.worldEnvironment.getWorkstationProps()?.setFirstPersonMode(mode === 'FIRST_PERSON');
      }
      this.setInputDisabled(true);
      this.onWorkstationOpen?.(target.id);
    } else if (target.id === 'interact_noticeboard') {
      this.onNoticeboardRead?.(
        'TINUBU SQUARE BULLETIN: Unusual system alert activity detected in Cedarline Services Marina staging cluster. Cedarline IT security staff meeting on Broad Street at 14:00.'
      );
    } else if (target.id.startsWith('interact_npc_') || target.id === 'interact_npc_amina') {
      const npcId = target.id.replace('interact_', '');
      const playerPos = this.playerController?.getPosition();
      if (playerPos) {
        this.worldEnvironment?.getNpcManager()?.setDialogueActive(npcId, playerPos);
      }
      this.onNpcInteract?.(npcId);
      this.onNpcDialogue?.({
        npcId,
        name: target.name,
        role: '',
        dialogue:
          target.id === 'interact_npc_amina'
            ? 'Tade, welcome to the SOC. We have an active incident: Aster AI was flagged for unauthorized SMB queries on filesrv-01. Head to your workstation, open the Terminal and Incident Portal, preserve the evidence, and investigate why Aster has excessive permissions. Good luck!'
            : '',
      });
    }
  }

  public endNpcDialogue(): void {
    this.worldEnvironment?.getNpcManager()?.setDialogueActive(null);
  }

  /**
   * Exits the workstation session, restoring exploration camera mode and standing pose.
   */
  public exitWorkstationSession(): void {
    if (this.cameraController) {
      const restoredMode = this.cameraController.exitWorkstation();
      this.onCameraModeChanged?.(restoredMode);
    }
    if (this.worldEnvironment) {
      this.worldEnvironment.getWorkstationProps()?.setFirstPersonMode(false);
    }
  }

  public peekOutWorkstation(): void {
    this.cameraController?.peekOut();
  }

  public focusWorkstationScreen(): void {
    this.cameraController?.focusScreen();
  }

  public toggleWorkstationPeek(): void {
    this.cameraController?.togglePeek();
  }

  public getWorkstationCameraState(): WorkstationCameraState {
    return this.cameraController?.getWorkstationState() ?? 'WALKING';
  }

  public getWorkstationOverlayOpacity(): number {
    return this.cameraController?.getOverlayOpacity() ?? 0;
  }

  public updateWorkstationDesktopState(state: Partial<ScreenDesktopState>): void {
    this.worldEnvironment?.getWorkstationProps()?.updateDesktopState(state);
  }

  public setWorkstationSettings(options: Partial<WorkstationCameraStateOptions>): void {
    this.cameraController?.getStateMachine().setOptions(options);
  }

  public triggerTypingAnimation(): void {
    this.playerAvatar?.triggerTyping();
    this.worldEnvironment?.getWorkstationProps()?.triggerTyping();
  }

  public triggerMouseAnimation(): void {
    this.playerAvatar?.triggerMouseUse();
    this.worldEnvironment?.getWorkstationProps()?.triggerMouseUse();
  }

  public updateWorkstationTerminal(lines: string[]): void {
    this.worldEnvironment?.getWorkstationProps()?.updateTerminalOutput(lines);
  }

  public setSimulationTime(timeStr: string): void {
    this.currentSimTime = timeStr;
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    let hour = 12;
    if (match && match[1] && match[3]) {
      hour = parseInt(match[1], 10);
      const meridiem = match[3].toUpperCase();
      if (meridiem === 'PM' && hour < 12) hour += 12;
      if (meridiem === 'AM' && hour === 12) hour = 0;
    }
    const isDay = hour >= 6 && hour < 18;
    if (this.scene) {
      const skyColor = isDay ? 0x7dd3fc : 0x050a14;
      this.scene.background = new THREE.Color(skyColor);
      if (this.scene.fog instanceof THREE.FogExp2) {
        this.scene.fog.color.setHex(skyColor);
      }
    }
    if (this.worldEnvironment) {
      this.worldEnvironment.update(
        0.016,
        timeStr,
        this.playerController ? this.playerController.getPosition() : undefined
      );
    }
  }

  public setCallbacks(options: {
    onInteractionTargetChanged?: (target: InteractableDefinition | null) => void;
    onLocationChanged?: (location: LocationDefinition) => void;
    onCameraModeChanged?: (mode: CameraMode) => void;
    onNoticeboardRead?: (notice: string) => void;
    onWorkstationOpen?: (workstationId: string) => void;
  }): void {
    if (options.onInteractionTargetChanged)
      this.onInteractionTargetChanged = options.onInteractionTargetChanged;
    if (options.onLocationChanged) this.onLocationChanged = options.onLocationChanged;
    if (options.onCameraModeChanged) this.onCameraModeChanged = options.onCameraModeChanged;
    if (options.onNoticeboardRead) this.onNoticeboardRead = options.onNoticeboardRead;
    if (options.onWorkstationOpen) this.onWorkstationOpen = options.onWorkstationOpen;
  }

  /**
   * Suspends or restores player movement and camera controls.
   * Used when opening/closing the virtual desktop.
   */
  public setInputDisabled(disabled: boolean): void {
    if (this.playerController) {
      this.playerController.setInputDisabled(disabled);
    }
    if (this.cameraController) {
      this.cameraController.setEnabled(!disabled);
    }
  }

  public getCurrentLocation(): LocationDefinition {
    if (this.transitionController) {
      return this.transitionController.getCurrentLocation();
    }
    return WORLD_CONFIG.locations.neighborhood;
  }

  public getPlayerPosition(): { x: number; y: number; z: number } {
    if (this.playerController) {
      return this.playerController.getPosition();
    }
    return { x: 0, y: 0, z: 0 };
  }

  public resize(): void {
    if (!this.container || !this.renderer || !this.camera) return;

    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private setupResizeObserver(): void {
    if (!this.container || typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.container);
  }

  private startAnimationLoop(): void {
    const animate = () => {
      if (this.isDisposed) return;

      this.frameCount++;
      const deltaTime = this.clock ? this.clock.getDelta() : 0.016;

      // 1. Update Player Movement (camera-relative)
      if (this.playerController && this.cameraController) {
        this.playerController.update(deltaTime, this.cameraController.getYaw());
      }

      // 2. Update Camera Position and Orientation (using deltaTime for frame-rate independence)
      if (this.activeBookmark) {
        this.applyBookmarkCamera(this.activeBookmark);
      } else if (this.cameraController && this.playerController) {
        this.cameraController.update(this.playerController.getPosition(), deltaTime);
      }

      // 3. Update Environment Markers, Pedestrians, Traffic, and Workstation Screen
      const playerPos = this.playerController ? this.playerController.getPosition() : undefined;
      if (this.worldEnvironment) {
        this.worldEnvironment.update(deltaTime, this.currentSimTime, playerPos);
      }

      // Update sun shadow frustum to follow player tightly
      if (this.skyEnvironment && playerPos) {
        this.skyEnvironment.update(playerPos);
      }

      // 4. Proximity Interaction Check
      if (this.interactionRegistry && this.playerController) {
        const playerPos = this.playerController.getPosition();
        const nearest = this.interactionRegistry.findNearest(playerPos.x, playerPos.z);
        const newTargetId = nearest ? nearest.interactable.id : null;

        if (newTargetId !== this.currentTargetId) {
          this.currentTargetId = newTargetId;
          this.onInteractionTargetChanged?.(nearest ? nearest.interactable : null);
        }
      }

      // 5. Render Scene
      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  public getRenderer(): THREE.WebGLRenderer | null {
    return this.renderer;
  }

  public getCamera(): THREE.PerspectiveCamera | null {
    return this.camera;
  }

  public getScene(): THREE.Scene | null {
    return this.scene;
  }

  public getWorldEnvironment(): WorldEnvironment | null {
    return this.worldEnvironment;
  }

  private applyBookmarkCamera(
    name: 'apartment_wide' | 'desk_seated_third_person' | 'desk_screen_closeup'
  ): void {
    if (!this.camera) return;
    if (name === 'apartment_wide') {
      this.camera.position.set(-4.5, 2.5, 3.8);
      this.camera.lookAt(0.2, 1.1, -2.4);
      this.camera.fov = 55;
      this.camera.updateProjectionMatrix();
      if (this.playerAvatar) {
        this.playerAvatar.setSitting(false);
        this.playerAvatar.setPosition(0, 0, -1.8);
        this.playerAvatar.setRotation(0);
      }
    } else if (name === 'desk_seated_third_person') {
      this.camera.position.set(0.48, 1.34, -2.05);
      this.camera.lookAt(-0.02, 0.94, -3.32);
      this.camera.fov = WORLD_CONFIG.camera.fov;
      this.camera.updateProjectionMatrix();
      if (this.playerAvatar) {
        this.playerAvatar.setVisible(true);
        this.playerAvatar.setSitting(true);
        this.playerAvatar.setPosition(0, 0, -2.85);
        this.playerAvatar.setRotation(0);
      }
    } else if (name === 'desk_screen_closeup') {
      this.camera.position.set(0.12, 1.22, -2.8);
      this.camera.lookAt(-0.02, 1.02, -3.45);
      this.camera.fov = 42;
      this.camera.updateProjectionMatrix();
      if (this.playerAvatar) {
        this.playerAvatar.setVisible(false);
      }
    }
  }

  public setCameraBookmark(
    name: 'apartment_wide' | 'desk_seated_third_person' | 'desk_screen_closeup' | null
  ): void {
    this.activeBookmark = name;
    if (name) {
      this.setInputDisabled(true);
      this.applyBookmarkCamera(name);
    } else {
      this.setInputDisabled(false);
    }
  }

  public async captureBookmarkScreenshot(filename: string): Promise<boolean> {
    if (!this.renderer || !this.scene || !this.camera) return false;
    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    const resp = await fetch('/api/save-screenshot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, dataUrl }),
    });
    return resp.ok;
  }

  public getStatistics(): SceneStatistics {
    return {
      renderedFrames: this.frameCount,
      isDisposed: this.isDisposed,
      activeLocation: this.getCurrentLocation().name,
      cameraMode: this.getCameraMode(),
    };
  }

  public dispose(): void {
    this.isDisposed = true;

    // 1. Cancel Animation Loop
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    // 2. Disconnect Resize Observer
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    // 3. Dispose Subsystems
    if (this.playerController) {
      this.playerController.dispose();
      this.playerController = null;
    }

    if (this.cameraController) {
      this.cameraController.dispose();
      this.cameraController = null;
    }

    if (this.worldEnvironment) {
      this.worldEnvironment.dispose();
      this.worldEnvironment = null;
    }

    if (this.skyEnvironment) {
      this.skyEnvironment.dispose();
      this.skyEnvironment = null;
    }

    if (this.playerAvatar) {
      this.playerAvatar.dispose();
      this.playerAvatar = null;
    }

    if (this.collisionWorld) {
      this.collisionWorld.clear();
      this.collisionWorld = null;
    }

    if (this.interactionRegistry) {
      this.interactionRegistry.clear();
      this.interactionRegistry = null;
    }

    this.transitionController = null;

    // 4. Dispose Scene Meshes & Lights
    if (this.scene) {
      this.scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) object.material.forEach(m => m.dispose());
            else object.material.dispose();
          }
        }
      });
      this.scene.clear();
      this.scene = null;
    }

    // 5. Dispose WebGL Renderer
    if (this.renderer) {
      if (this.renderer.domElement && this.renderer.domElement.parentNode) {
        this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
      this.renderer = null;
    }

    this.camera = null;
    this.container = null;
    this.clock = null;
  }
}
