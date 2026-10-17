import * as THREE from 'three';
import { CameraMode, WORLD_CONFIG } from './worldConfig';
import { PlayerAvatar } from './entities/PlayerAvatar';

export interface CameraControllerOptions {
  camera: THREE.PerspectiveCamera;
  domElement: HTMLElement;
  avatar: PlayerAvatar;
  initialMode?: CameraMode;
  onModeChanged?: (mode: CameraMode) => void;
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

  // Workstation camera state (M4.5 Camera-Aware Interaction)
  private isInWorkstation = false;
  private workstationExplorationMode: CameraMode | null = null;
  private transitionProgress = 1.0; // 0 = start of transition, 1 = settled
  private savedCameraPosition = new THREE.Vector3();
  private savedLookTarget = new THREE.Vector3();

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

  private handleClick(): void {
    if (!this.isEnabled || this.isInWorkstation) return;

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
    if (!this.isEnabled || this.isInWorkstation) return;

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
    if (this.isInWorkstation) return this.mode;
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
   * Enters the workstation session. Transitions camera based on active exploration mode:
   * - Third-Person: Positions over-the-shoulder showing seated character, hands, and laptop.
   * - First-Person: Positions at seated eye-level focused directly on the computer screen.
   */
  public enterWorkstation(explorationMode: CameraMode): void {
    this.isInWorkstation = true;
    this.workstationExplorationMode = explorationMode;
    this.exitPointerLock();

    // Save starting camera state for smooth interpolation
    this.savedCameraPosition.copy(this.camera.position);
    this.camera.getWorldDirection(this.savedLookTarget);
    this.savedLookTarget.add(this.camera.position);
    this.transitionProgress = 0.0;

    // Configure avatar visibility
    if (explorationMode === 'THIRD_PERSON') {
      this.avatar.setVisible(true);
      this.avatar.setSitting(true);
    } else {
      // In first-person workstation, full avatar body is hidden so it doesn't clip
      this.avatar.setVisible(false);
      this.avatar.setSitting(true);
    }
  }

  /**
   * Exits the workstation session, restoring original exploration camera mode,
   * orientation, and avatar standing state.
   */
  public exitWorkstation(): CameraMode {
    this.isInWorkstation = false;
    const restoredMode = this.workstationExplorationMode ?? 'THIRD_PERSON';
    this.mode = restoredMode;
    this.workstationExplorationMode = null;

    this.avatar.setSitting(false);
    this.applyModeVisibility();

    if (restoredMode === 'FIRST_PERSON') {
      // Restore look angles toward front
      this.pitch = 0;
    }

    return restoredMode;
  }

  public isWorkstationActive(): boolean {
    return this.isInWorkstation;
  }

  private applyModeVisibility(): void {
    if (this.isInWorkstation) {
      this.avatar.setVisible(this.workstationExplorationMode === 'THIRD_PERSON');
    } else {
      // Hide avatar in 1st person exploration so camera does not clip inside player head
      this.avatar.setVisible(this.mode === 'THIRD_PERSON');
    }
  }

  /**
   * Updates camera position and projection based on active player coordinates and look angles.
   */
  public update(playerPos: { x: number; y: number; z: number }): void {
    if (this.isInWorkstation) {
      this.updateWorkstationCamera();
      return;
    }

    if (this.mode === 'FIRST_PERSON') {
      // 1. First-Person Mode: Camera positioned directly at eye level
      const eyeY = playerPos.y + WORLD_CONFIG.player.eyeHeight;
      this.camera.position.set(playerPos.x, eyeY, playerPos.z);

      // Compute look-at point from spherical angles (yaw and pitch)
      const cosPitch = Math.cos(this.pitch);
      const sinPitch = Math.sin(this.pitch);
      const cosYaw = Math.cos(this.yaw);
      const sinYaw = Math.sin(this.yaw);

      const lookTarget = new THREE.Vector3(
        playerPos.x - sinYaw * cosPitch,
        eyeY + sinPitch,
        playerPos.z - cosYaw * cosPitch
      );

      this.camera.lookAt(lookTarget);
    } else {
      // 2. Third-Person Mode: Camera positioned behind and slightly above avatar
      const offset = WORLD_CONFIG.camera.thirdPersonOffset;
      const lookOffset = WORLD_CONFIG.camera.thirdPersonLookOffset;

      // Orbit camera position behind player based on yaw
      const cosYaw = Math.cos(this.yaw);
      const sinYaw = Math.sin(this.yaw);

      const camX = playerPos.x + sinYaw * offset.z;
      const camY = playerPos.y + offset.y;
      const camZ = playerPos.z + cosYaw * offset.z;

      this.camera.position.set(camX, camY, camZ);

      // Look at target around the chest/head of the avatar
      const target = new THREE.Vector3(
        playerPos.x + lookOffset.x,
        playerPos.y + lookOffset.y,
        playerPos.z + lookOffset.z
      );
      this.camera.lookAt(target);
    }
  }

  /**
   * Handles dedicated workstation camera compositions:
   * - Third-Person: Over-the-shoulder framing the seated character, upper body, hands on keyboard/mouse, and laptop.
   * - First-Person: Seated eye-level view focused directly on the computer screen.
   */
  private updateWorkstationCamera(): void {
    const isTP = this.workstationExplorationMode === 'THIRD_PERSON';

    let targetCamPos: THREE.Vector3;
    let targetLookAt: THREE.Vector3;

    if (isTP) {
      // Dedicated Over-the-Shoulder Workstation Framing
      // Slightly to the right and above character's shoulder:
      // Player seated at (0, 0, -2.85), laptop at (0, 0.74, -3.32)
      targetCamPos = new THREE.Vector3(0.48, 1.34, -2.05);
      targetLookAt = new THREE.Vector3(-0.02, 0.94, -3.32);
    } else {
      // First-Person Seated Eye-Level Focused on Laptop Display
      // Eyes at height 1.15m at chair position Z = -2.82m
      targetCamPos = new THREE.Vector3(0.0, 1.16, -2.82);
      targetLookAt = new THREE.Vector3(0.0, 0.92, -3.32);
    }

    // Smooth camera transition (lerp)
    if (this.transitionProgress < 1.0) {
      this.transitionProgress = Math.min(1.0, this.transitionProgress + 0.08);
      const t = THREE.MathUtils.smoothstep(this.transitionProgress, 0, 1);
      this.camera.position.lerpVectors(this.savedCameraPosition, targetCamPos, t);

      const currentLook = new THREE.Vector3();
      currentLook.lerpVectors(this.savedLookTarget, targetLookAt, t);
      this.camera.lookAt(currentLook);
    } else {
      this.camera.position.copy(targetCamPos);
      this.camera.lookAt(targetLookAt);
    }
  }

  public dispose(): void {
    this.detachEventListeners();
  }
}
