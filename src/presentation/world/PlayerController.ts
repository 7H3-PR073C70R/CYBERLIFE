import { CollisionWorld } from './CollisionWorld';
import { PlayerAvatar } from './entities/PlayerAvatar';
import { WORLD_CONFIG } from './worldConfig';

export interface PlayerControllerOptions {
  avatar: PlayerAvatar;
  collisionWorld: CollisionWorld;
  initialPosition?: [number, number, number];
  initialYaw?: number;
  onCameraToggle?: () => void;
  onInteract?: () => void;
}

export class PlayerController {
  private avatar: PlayerAvatar;
  private collisionWorld: CollisionWorld;

  // Position and Orientation
  private x = 0;
  private y = 0;
  private z = 0;
  private yaw = 0; // In radians (0 = facing -Z / North)

  // Input states
  private keysPressed: Set<string> = new Set();
  private isInputDisabled = false;

  // Configuration
  private walkSpeed: number;
  private radius: number;

  // Callbacks
  private onCameraToggle?: () => void;
  private onInteract?: () => void;

  // Bound event listeners for cleanup
  private handleKeyDownBound: (e: KeyboardEvent) => void;
  private handleKeyUpBound: (e: KeyboardEvent) => void;
  private handleBlurBound: () => void;

  constructor(options: PlayerControllerOptions) {
    this.avatar = options.avatar;
    this.collisionWorld = options.collisionWorld;
    this.walkSpeed = WORLD_CONFIG.player.walkSpeed;
    this.radius = WORLD_CONFIG.player.radius;

    this.onCameraToggle = options.onCameraToggle;
    this.onInteract = options.onInteract;

    const initPos = options.initialPosition ?? [0, 0, 14];
    this.setPosition(initPos[0], initPos[1], initPos[2]);
    this.setYaw(options.initialYaw ?? 0);

    this.handleKeyDownBound = this.handleKeyDown.bind(this);
    this.handleKeyUpBound = this.handleKeyUp.bind(this);
    this.handleBlurBound = this.handleBlur.bind(this);

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('keydown', this.handleKeyDownBound);
    window.addEventListener('keyup', this.handleKeyUpBound);
    window.addEventListener('blur', this.handleBlurBound);
  }

  public detachEventListeners(): void {
    if (typeof window === 'undefined') return;
    window.removeEventListener('keydown', this.handleKeyDownBound);
    window.removeEventListener('keyup', this.handleKeyUpBound);
    window.removeEventListener('blur', this.handleBlurBound);
  }

  private handleKeyDown(e: KeyboardEvent): void {
    // If the user is currently typing in an input or textarea, suspend gameplay keys
    if (this.isTypingInInput(e)) return;

    const code = e.code;

    // Camera Switch (V)
    if (code === 'KeyV') {
      e.preventDefault();
      this.onCameraToggle?.();
      return;
    }

    // Interaction (E)
    if (code === 'KeyE') {
      e.preventDefault();
      this.onInteract?.();
      return;
    }

    // Movement keys
    if (
      ['KeyW', 'ArrowUp', 'KeyS', 'ArrowDown', 'KeyA', 'ArrowLeft', 'KeyD', 'ArrowRight'].includes(
        code
      )
    ) {
      this.keysPressed.add(code);
    }
  }

  private handleKeyUp(e: KeyboardEvent): void {
    this.keysPressed.delete(e.code);
  }

  private handleBlur(): void {
    // Prevent sticking movement when tab loses focus
    this.resetInput();
  }

  public resetInput(): void {
    this.keysPressed.clear();
  }

  public setInputDisabled(disabled: boolean): void {
    this.isInputDisabled = disabled;
    if (disabled) {
      this.resetInput();
    }
  }

  private isTypingInInput(e: KeyboardEvent): boolean {
    const target = e.target as HTMLElement | null;
    if (!target || !target.tagName) return false;
    const tagName = target.tagName.toUpperCase();
    return (
      tagName === 'INPUT' ||
      tagName === 'TEXTAREA' ||
      tagName === 'SELECT' ||
      Boolean(target.isContentEditable)
    );
  }

  public setPosition(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
    this.avatar.setPosition(x, y, z);
  }

  public setYaw(yaw: number): void {
    this.yaw = yaw;
    this.avatar.setRotation(yaw);
  }

  public getPosition(): { x: number; y: number; z: number } {
    return { x: this.x, y: this.y, z: this.z };
  }

  public getYaw(): number {
    return this.yaw;
  }

  public setCollisionWorld(world: CollisionWorld): void {
    this.collisionWorld = world;
  }

  /**
   * Updates player position based on active keyboard inputs, camera orientation, and collision rules.
   * @param deltaTime Elapsed time in seconds
   * @param cameraYaw Current view horizontal angle in radians
   */
  public update(deltaTime: number, cameraYaw: number): void {
    if (this.isInputDisabled) return;

    // Clamp delta time to avoid large movement jumps after pausing
    const dt = Math.min(deltaTime, 0.1);

    let moveForward = 0;
    let moveRight = 0;

    if (this.keysPressed.has('KeyW') || this.keysPressed.has('ArrowUp')) moveForward += 1;
    if (this.keysPressed.has('KeyS') || this.keysPressed.has('ArrowDown')) moveForward -= 1;
    if (this.keysPressed.has('KeyD') || this.keysPressed.has('ArrowRight')) moveRight += 1;
    if (this.keysPressed.has('KeyA') || this.keysPressed.has('ArrowLeft')) moveRight -= 1;

    // No movement input
    if (moveForward === 0 && moveRight === 0) return;

    // 1. Normalize input vector to prevent faster diagonal movement
    const length = Math.sqrt(moveForward * moveForward + moveRight * moveRight);
    const normForward = moveForward / length;
    const normRight = moveRight / length;

    // 2. Transform input vector relative to the camera yaw
    // Forward vector is (-sin(cameraYaw), -cos(cameraYaw))
    // Right vector is (cos(cameraYaw), -sin(cameraYaw))
    const sinYaw = Math.sin(cameraYaw);
    const cosYaw = Math.cos(cameraYaw);

    const worldDx = (normRight * cosYaw - normForward * sinYaw) * this.walkSpeed * dt;
    const worldDz = (-normRight * sinYaw - normForward * cosYaw) * this.walkSpeed * dt;

    // 3. Resolve collision against obstacles & boundaries (with wall-sliding)
    const result = this.collisionWorld.resolveMovement(
      this.x,
      this.z,
      worldDx,
      worldDz,
      this.radius
    );

    this.x = result.x;
    this.z = result.z;

    // 4. Update avatar position and face movement direction
    this.avatar.setPosition(this.x, this.y, this.z);

    if (Math.abs(worldDx) > 0.0001 || Math.abs(worldDz) > 0.0001) {
      // Facing angle along movement direction (atan2 for standard Three.js rotation.y)
      const moveAngle = Math.atan2(worldDx, worldDz);
      this.setYaw(moveAngle);
    }
  }

  public dispose(): void {
    this.detachEventListeners();
    this.keysPressed.clear();
  }
}
