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
  onNpcDialogue?: (dialogue: NpcDialogueData) => void;
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

  // Active interaction target tracking
  private currentTargetId: string | null = null;

  // Callbacks
  private onInteractionTargetChanged?: (target: InteractableDefinition | null) => void;
  private onLocationChanged?: (location: LocationDefinition) => void;
  private onCameraModeChanged?: (mode: CameraMode) => void;
  private onNoticeboardRead?: (notice: string) => void;
  private onWorkstationOpen?: (workstationId: string) => void;
  private onNpcDialogue?: (dialogue: NpcDialogueData) => void;

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
    this.onNpcDialogue = options.onNpcDialogue;

    // 1. Scene Setup
    const clearColor = options.clearColor ?? 0x7dd3fc; // Warm coastal Lagos sky blue
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(clearColor);
    this.scene.fog = new THREE.FogExp2(clearColor, 0.012);

    // 2. Camera Setup
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;
    this.camera = new THREE.PerspectiveCamera(
      WORLD_CONFIG.camera.fov,
      width / height,
      WORLD_CONFIG.camera.near,
      WORLD_CONFIG.camera.far
    );

    // 3. Renderer Setup
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: options.antialias ?? true,
        alpha: false,
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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

    // 6. Lighting (Bright Tropical Sunlight & Coastal Sky)
    this.setupLighting();

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
    });

    // 9. Location Transition Controller Setup
    this.transitionController = new LocationTransitionController({
      environment: this.worldEnvironment,
      playerController: this.playerController,
      cameraController: this.cameraController,
      initialLocationId: options.initialLocationId ?? 'neighborhood',
      onLocationChanged: loc => this.onLocationChanged?.(loc),
    });

    // 10. Resize Handling
    this.setupResizeObserver();

    // 11. Start Animation Loop
    this.startAnimationLoop();
  }

  private setupLighting(): void {
    if (!this.scene) return;

    // Ambient Tropical Fill Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    this.scene.add(ambientLight);

    // Directional Tropical Sunlight (Bright sun with warm gold tint)
    const sunLight = new THREE.DirectionalLight(0xfffaed, 1.35);
    sunLight.position.set(20, 45, 25);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 100;
    sunLight.shadow.camera.left = -40;
    sunLight.shadow.camera.right = 40;
    sunLight.shadow.camera.top = 40;
    sunLight.shadow.camera.bottom = -40;
    this.scene.add(sunLight);

    // Hemisphere Coastal Sky & Ground Bounce
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0xfde68a, 0.65);
    this.scene.add(hemiLight);
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
    } else if (target.id === 'interact_npc_amina') {
      this.onNpcDialogue?.({
        npcId: 'npc_amina',
        name: 'Amina Okonjo',
        role: 'Lead Security Analyst',
        dialogue:
          'Tade, welcome to the SOC. We have an active incident: Aster AI was flagged for unauthorized SMB queries on filesrv-01. Head to your workstation, open the Terminal and Incident Portal, preserve the evidence, and investigate why Aster has excessive permissions. Good luck!',
      });
    }
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
    this.setInputDisabled(false);
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

      // 2. Update Camera Position and Orientation
      if (this.cameraController && this.playerController) {
        this.cameraController.update(this.playerController.getPosition());
      }

      // 3. Update Environment Markers, Pedestrians, Traffic, and Workstation Screen
      if (this.worldEnvironment) {
        this.worldEnvironment.update(deltaTime, this.currentSimTime);
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
