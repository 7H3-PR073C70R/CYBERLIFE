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
  private onModeChanged?: (mode: CameraMode) => void;

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

    if (document.pointerLockElement === this.domElement) {
      document.exitPointerLock();
    }
  }

  private handleClick(): void {
    // In first person, clicking the canvas requests pointer lock for seamless mouse-look
    if (this.mode === 'FIRST_PERSON' && !this.isPointerLocked) {
      try {
        this.domElement.requestPointerLock?.();
      } catch {
        // Pointer lock may be restricted by environment; fallback smoothly
      }
    }
  }

  private handlePointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement === this.domElement;
  }

  private handleMouseMove(e: MouseEvent): void {
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

  private applyModeVisibility(): void {
    // Hide avatar in 1st person so the camera does not clip inside the player head
    this.avatar.setVisible(this.mode === 'THIRD_PERSON');
  }

  /**
   * Updates camera position and projection based on active player coordinates and look angles.
   */
  public update(playerPos: { x: number; y: number; z: number }): void {
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

  public dispose(): void {
    this.detachEventListeners();
  }
}
