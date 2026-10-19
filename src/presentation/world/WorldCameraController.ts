import * as THREE from 'three';
import { CameraMode, WORLD_CONFIG } from './worldConfig';
import { PlayerAvatar } from './entities/PlayerAvatar';
import {
  WorkstationCameraStateMachine,
  WorkstationCameraState,
  WorkstationCameraStateOptions,
  WorkstationCameraEvents,
} from './camera/WorkstationCameraStates';
import {
  WorkstationAnchorSet,
  DEFAULT_WORKSTATION_ANCHORS,
} from './WorkstationAnchors';

export interface CameraControllerOptions {
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  avatar: PlayerAvatar;
  initialMode?: CameraMode;
  onModeChanged?: (mode: CameraMode) => void;
  anchors?: WorkstationAnchorSet;
  stateOptions?: WorkstationCameraStateOptions;
  stateEvents?: WorkstationCameraEvents;
  onWorkstationStateChanged?: (state: WorkstationCameraState) => void;
}

export class WorldCameraController {
  private camera: THREE.PerspectiveCamera;
  private domElement: HTMLElement;
  private avatar: PlayerAvatar;

  private mode: CameraMode;
  private yaw = 0; // Horizontal look angle in radians
  private pitch = 0; // Vertical look angle in radians

  private isPointerLocked = false;
  private isEnabled = true;
  private onModeChanged?: (mode: CameraMode) => void;
  private onWorkstationStateChanged?: (state: WorkstationCameraState) => void;

  // Workstation camera state machine
  private stateMachine: WorkstationCameraStateMachine;
  private lastPlayerPos = { x: 0, y: 0, z: 0 };

  // Bound listeners
  private handleMouseMoveBound: (e: MouseEvent) => void;
  private handlePointerLockChangeBound: () => void;
  private handleClickBound: () => void;

  constructor(options: CameraControllerOptions) {
    this.camera = options.camera;
    this.domElement = options.domElement;
    this.avatar = options.avatar;
    this.mode = options.initialMode ?? 'THIRD_PERSON';
    this.onModeChanged = options.onModeChanged;
    this.onWorkstationStateChanged = options.onWorkstationStateChanged;

    const mergedEvents: WorkstationCameraEvents = {
      ...options.stateEvents,
      onStateChange: (from, to) => {
        this.onWorkstationStateChanged?.(to);
        options.stateEvents?.onStateChange?.(from, to);
      },
    };

    this.stateMachine = new WorkstationCameraStateMachine(
      options.stateOptions,
      mergedEvents
    );

    if (options.anchors) {
      this.stateMachine.setAnchors(options.anchors);
    } else {
      this.stateMachine.setAnchors(DEFAULT_WORKSTATION_ANCHORS);
    }

    this.handleMouseMoveBound = this.handleMouseMove.bind(this);
    this.handlePointerLockChangeBound = this.handlePointerLockChange.bind(this);
    this.handleClickBound = this.handleClick.bind(this);

    this.applyModeVisibility();
    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    if (typeof document === 'undefined') return;

    this.domElement.addEventListener('click', this.handleClickBound);
    document.addEventListener('mousemove', this.handleMouseMoveBound);
    document.addEventListener('pointerlockchange', this.handlePointerLockChangeBound);
  }

  public detachEventListeners(): void {
    if (typeof document === 'undefined') return;

    this.domElement.removeEventListener('click', this.handleClickBound);
    document.removeEventListener('mousemove', this.handleMouseMoveBound);
    document.removeEventListener('pointerlockchange', this.handlePointerLockChangeBound);

    this.exitPointerLock();
  }

  public exitPointerLock(): void {
    if (typeof document !== 'undefined' && document.pointerLockElement === this.domElement) {
      try {
        document.exitPointerLock?.();
      } catch {
        // Fallback
      }
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.exitPointerLock();
    }
  }

  public setAnchors(anchors: WorkstationAnchorSet): void {
    this.stateMachine.setAnchors(anchors);
  }

  public getAnchors(): WorkstationAnchorSet {
    return this.stateMachine.getAnchors();
  }

  public getStateMachine(): WorkstationCameraStateMachine {
    return this.stateMachine;
  }

  public getWorkstationState(): WorkstationCameraState {
    return this.stateMachine.getState();
  }

  public getOverlayOpacity(): number {
    return this.stateMachine.getOverlayOpacity();
  }

  private handleClick(): void {
    if (
      !this.isEnabled ||
      this.stateMachine.isWorkstationActive() ||
      this.stateMachine.isTransitioning()
    )
      return;

    // In first person exploration, clicking the canvas requests pointer lock for seamless mouse-look
    if (this.mode === 'FIRST_PERSON' && !this.isPointerLocked) {
      try {
        this.domElement.requestPointerLock?.();
      } catch {
        // Fallback
      }
    }
  }

  private handlePointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
  }

  private handleMouseMove(e: MouseEvent): void {
    if (
      !this.isEnabled ||
      this.stateMachine.isWorkstationActive() ||
      this.stateMachine.isTransitioning()
    )
      return;

    // Allow mouse look in first-person (or if pointer-locked)
    if (this.mode !== 'FIRST_PERSON' && !this.isPointerLocked) return;

    const sensitivity = WORLD_CONFIG.player.mouseSensitivity;
    this.yaw -= e.movementX * sensitivity;
    this.pitch -= e.movementY * sensitivity;

    // Clamp vertical look to prevent flipping
    this.pitch = Math.max(
      WORLD_CONFIG.camera.pitchLimitMin,
      Math.min(WORLD_CONFIG.camera.pitchLimitMax, this.pitch)
    );
  }

  public setMode(newMode: CameraMode): void {
    if (this.mode === newMode) return;
    this.mode = newMode;
    this.applyModeVisibility();

    if (this.mode === 'FIRST_PERSON') {
      try {
        this.domElement.requestPointerLock?.();
      } catch {
        // Fallback
      }
    } else {
      if (typeof document !== 'undefined' && document.pointerLockElement === this.domElement) {
        document.exitPointerLock?.();
      }
    }

    this.onModeChanged?.(this.mode);
  }

  public toggleMode(): CameraMode {
    if (this.stateMachine.isWorkstationActive()) return this.mode;
    const next = this.mode === 'THIRD_PERSON' ? 'FIRST_PERSON' : 'THIRD_PERSON';
    this.setMode(next);
    return this.mode;
  }

  public getMode(): CameraMode {
    return this.mode;
  }

  public getYaw(): number {
    return this.yaw;
  }

  public getPitch(): number {
    return this.pitch;
  }

  public setYaw(yaw: number): void {
    this.yaw = yaw;
  }

  public setPitch(pitch: number): void {
    this.pitch = Math.max(
      WORLD_CONFIG.camera.pitchLimitMin,
      Math.min(WORLD_CONFIG.camera.pitchLimitMax, pitch)
    );
  }

  /**
   * Enters workstation directly without transition (useful for testing or initial page URL params).
   */
  public enterWorkstationDirectly(explorationMode: CameraMode): void {
    this.exitPointerLock();

    if (explorationMode === 'THIRD_PERSON') {
      this.avatar.setVisible(true);
      this.avatar.setSitting(true);
    } else {
      this.avatar.setVisible(false);
      this.avatar.setSitting(true);
    }

    this.stateMachine.enterWorkstationDirectly(explorationMode);
    this.camera.position.copy(this.stateMachine.getCurrentPosition());
    this.camera.lookAt(this.stateMachine.getCurrentLookTarget());
    this.camera.fov = this.stateMachine.getCurrentFov();
    this.camera.updateProjectionMatrix();
  }

  /**
   * Enters the workstation session from walking exploration.
   */
  public enterWorkstation(explorationMode: CameraMode): void {
    this.exitPointerLock();

    // Capture starting camera state for smooth time-based interpolation
    const startCamPos = this.camera.position.clone();
    const startLook = new THREE.Vector3();
    this.camera.getWorldDirection(startLook);
    startLook.add(this.camera.position);

    // Configure avatar visibility
    if (explorationMode === 'THIRD_PERSON') {
      this.avatar.setVisible(true);
      this.avatar.setSitting(true);
    } else {
      this.avatar.setVisible(false);
      this.avatar.setSitting(true);
    }

    this.stateMachine.enterWorkstation(
      explorationMode,
      startCamPos,
      startLook,
      this.camera.fov
    );
  }

  /**
   * Peeks out from full-screen computer back to seated third-person view.
   */
  public peekOut(): void {
    this.stateMachine.peekOut();
  }

  /**
   * Focuses from seated view back into full-screen computer view.
   */
  public focusScreen(): void {
    this.stateMachine.dollyToScreen();
  }

  /**
   * Toggles between SCREEN_FULLSCREEN and SEATED_THIRD_PERSON (peek out).
   */
  public togglePeek(): void {
    this.stateMachine.togglePeek();
  }

  /**
   * Exits the workstation session, restoring original exploration camera mode,
   * orientation, and avatar standing state.
   */
  public exitWorkstation(): CameraMode {
    const restoredMode = this.stateMachine.getExplorationMode();
    this.mode = restoredMode;

    const { targetPos, targetLook } = this.calculateWalkingCameraFraming(
      this.lastPlayerPos,
      restoredMode
    );

    this.avatar.setSitting(false);
    this.stateMachine.standUp(targetPos, targetLook);

    if (restoredMode === 'FIRST_PERSON') {
      this.pitch = 0;
    }

    return restoredMode;
  }

  public isWorkstationActive(): boolean {
    return this.stateMachine.isWorkstationActive();
  }

  private applyModeVisibility(): void {
    if (this.stateMachine.isWorkstationActive()) {
      this.avatar.setVisible(this.stateMachine.getExplorationMode() === 'THIRD_PERSON');
    } else {
      // Hide avatar in 1st person exploration so camera does not clip inside player head
      this.avatar.setVisible(this.mode === 'THIRD_PERSON');
    }
  }

  /**
   * Calculates the standard exploration camera position and look-at point for walking.
   */
  public calculateWalkingCameraFraming(
    playerPos: { x: number; y: number; z: number },
    mode: CameraMode
  ): { targetPos: THREE.Vector3; targetLook: THREE.Vector3 } {
    if (mode === 'FIRST_PERSON') {
      const eyeY = playerPos.y + WORLD_CONFIG.player.eyeHeight;
      const targetPos = new THREE.Vector3(playerPos.x, eyeY, playerPos.z);

      const cosPitch = Math.cos(this.pitch);
      const sinPitch = Math.sin(this.pitch);
      const cosYaw = Math.cos(this.yaw);
      const sinYaw = Math.sin(this.yaw);

      const targetLook = new THREE.Vector3(
        playerPos.x - sinYaw * cosPitch,
        eyeY + sinPitch,
        playerPos.z - cosYaw * cosPitch
      );
      return { targetPos, targetLook };
    } else {
      const offset = WORLD_CONFIG.camera.thirdPersonOffset;
      const lookOffset = WORLD_CONFIG.camera.thirdPersonLookOffset;

      const cosYaw = Math.cos(this.yaw);
      const sinYaw = Math.sin(this.yaw);

      const camX = playerPos.x + sinYaw * offset.z;
      const camY = playerPos.y + offset.y;
      const camZ = playerPos.z + cosYaw * offset.z;

      const targetPos = new THREE.Vector3(camX, camY, camZ);
      const targetLook = new THREE.Vector3(
        playerPos.x + lookOffset.x,
        playerPos.y + lookOffset.y,
        playerPos.z + lookOffset.z
      );
      return { targetPos, targetLook };
    }
  }

  /**
   * Updates camera position and projection based on active player coordinates,
   * look angles, and workstation camera state machine transitions.
   */
  public update(playerPos: { x: number; y: number; z: number }, deltaTime = 0.045): void {
    this.lastPlayerPos = playerPos;

    if (this.stateMachine.isWorkstationActive() || this.stateMachine.isTransitioning()) {
      this.stateMachine.update(deltaTime);

      this.camera.position.copy(this.stateMachine.getCurrentPosition());
      this.camera.lookAt(this.stateMachine.getCurrentLookTarget());

      const targetFov = this.stateMachine.getCurrentFov();
      if (Math.abs(this.camera.fov - targetFov) > 0.05) {
        this.camera.fov = targetFov;
        this.camera.updateProjectionMatrix();
      }

      // If transition completed back to WALKING
      if (!this.stateMachine.isWorkstationActive() && !this.stateMachine.isTransitioning()) {
        this.applyModeVisibility();
        this.camera.fov = WORLD_CONFIG.camera.fov;
        this.camera.updateProjectionMatrix();
      }
      return;
    }

    // Walking camera update
    if (this.mode === 'FIRST_PERSON') {
      const { targetPos, targetLook } = this.calculateWalkingCameraFraming(
        playerPos,
        'FIRST_PERSON'
      );
      this.camera.position.copy(targetPos);
      this.camera.lookAt(targetLook);
    } else {
      const { targetPos, targetLook } = this.calculateWalkingCameraFraming(
        playerPos,
        'THIRD_PERSON'
      );
      this.camera.position.copy(targetPos);
      this.camera.lookAt(targetLook);
    }

    if (Math.abs(this.camera.fov - WORLD_CONFIG.camera.fov) > 0.05) {
      this.camera.fov = WORLD_CONFIG.camera.fov;
      this.camera.updateProjectionMatrix();
    }
  }

  public dispose(): void {
    this.detachEventListeners();
    this.stateMachine.reset();
  }
}
