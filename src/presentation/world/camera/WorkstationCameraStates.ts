import * as THREE from 'three';
import { CameraMode, WORLD_CONFIG } from '../worldConfig';
import {
  CameraFraming,
  WorkstationAnchorSet,
  DEFAULT_WORKSTATION_ANCHORS,
} from '../WorkstationAnchors';

export type WorkstationCameraState =
  | 'WALKING'
  | 'SITTING_DOWN'
  | 'SEATED_THIRD_PERSON'
  | 'DOLLY_TO_SCREEN'
  | 'SCREEN_FULLSCREEN'
  | 'PEEK_OUT'
  | 'STANDING_UP';

export interface WorkstationCameraStateOptions {
  sitDuration?: number;
  dollyDuration?: number;
  peekOutDuration?: number;
  standDuration?: number;
  reducedMotionDuration?: number;
  screenFov?: number;
  baseFov?: number;
  reduceMotion?: boolean;
  skipSitAfterFirst?: boolean;
}

export interface WorkstationCameraEvents {
  onSitStart?: () => void;
  onDollyStart?: () => void;
  onFullscreenEnter?: () => void;
  onPeekOut?: () => void;
  onStandUp?: () => void;
  onStateChange?: (from: WorkstationCameraState, to: WorkstationCameraState) => void;
}

/**
 * Standard cubic ease-in-out easing function.
 * Smooth acceleration at start, smooth deceleration at end (C1 continuous).
 */
export function easeInOutCubic(t: number): number {
  const clamped = Math.max(0, Math.min(1, t));
  return clamped < 0.5 ? 4 * clamped * clamped * clamped : 1 - Math.pow(-2 * clamped + 2, 3) / 2;
}

export interface CameraTransformSnapshot {
  position: THREE.Vector3;
  lookTarget: THREE.Vector3;
  fov: number;
}

/**
 * WorkstationCameraStateMachine
 * Manages explicit camera states, smooth time-based interpolation of position,
 * look-at target, and FOV, as well as DOM overlay crossfades and input blocking.
 */
export class WorkstationCameraStateMachine {
  private state: WorkstationCameraState = 'WALKING';
  private explorationMode: CameraMode = 'THIRD_PERSON';

  // Configurable options
  private sitDuration: number;
  private dollyDuration: number;
  private peekOutDuration: number;
  private standDuration: number;
  private reducedMotionDuration: number;
  private screenFov: number;
  private baseFov: number;
  private reduceMotion: boolean;
  private skipSitAfterFirst: boolean;

  // Session tracking
  private hasSatDownOnce = false;

  // Transition interpolation state
  private transitionElapsed = 0;
  private currentDuration = 0;
  private startSnapshot: CameraTransformSnapshot = {
    position: new THREE.Vector3(),
    lookTarget: new THREE.Vector3(),
    fov: WORLD_CONFIG.camera.fov,
  };
  private targetSnapshot: CameraTransformSnapshot = {
    position: new THREE.Vector3(),
    lookTarget: new THREE.Vector3(),
    fov: WORLD_CONFIG.camera.fov,
  };

  // Interpolated output values
  private currentPosition = new THREE.Vector3();
  private currentLookTarget = new THREE.Vector3();
  private currentFov: number = WORLD_CONFIG.camera.fov;
  private overlayOpacity = 0.0;

  // Anchors reference
  private anchors: WorkstationAnchorSet = DEFAULT_WORKSTATION_ANCHORS;

  // Event callbacks
  private events: WorkstationCameraEvents = {};

  constructor(options: WorkstationCameraStateOptions = {}, events: WorkstationCameraEvents = {}) {
    const wsCfg = WORLD_CONFIG.camera.workstation;
    this.sitDuration = options.sitDuration ?? wsCfg.sitDuration;
    this.dollyDuration = options.dollyDuration ?? wsCfg.dollyDuration;
    this.peekOutDuration = options.peekOutDuration ?? wsCfg.peekOutDuration;
    this.standDuration = options.standDuration ?? wsCfg.standDuration;
    this.reducedMotionDuration = options.reducedMotionDuration ?? wsCfg.reducedMotionDuration;
    this.screenFov = options.screenFov ?? wsCfg.screenFov;
    this.baseFov = options.baseFov ?? WORLD_CONFIG.camera.fov;
    this.reduceMotion = options.reduceMotion ?? false;
    this.skipSitAfterFirst = options.skipSitAfterFirst ?? false;
    this.events = events;
  }

  public setAnchors(anchors: WorkstationAnchorSet): void {
    this.anchors = anchors;
  }

  public getAnchors(): WorkstationAnchorSet {
    return this.anchors;
  }

  public setEvents(events: WorkstationCameraEvents): void {
    this.events = { ...this.events, ...events };
  }

  public setOptions(options: Partial<WorkstationCameraStateOptions>): void {
    if (options.sitDuration !== undefined) this.sitDuration = options.sitDuration;
    if (options.dollyDuration !== undefined) this.dollyDuration = options.dollyDuration;
    if (options.peekOutDuration !== undefined) this.peekOutDuration = options.peekOutDuration;
    if (options.standDuration !== undefined) this.standDuration = options.standDuration;
    if (options.reducedMotionDuration !== undefined)
      this.reducedMotionDuration = options.reducedMotionDuration;
    if (options.screenFov !== undefined) this.screenFov = options.screenFov;
    if (options.baseFov !== undefined) this.baseFov = options.baseFov;
    if (options.reduceMotion !== undefined) this.reduceMotion = options.reduceMotion;
    if (options.skipSitAfterFirst !== undefined) this.skipSitAfterFirst = options.skipSitAfterFirst;
  }

  public getState(): WorkstationCameraState {
    return this.state;
  }

  public getExplorationMode(): CameraMode {
    return this.explorationMode;
  }

  public isWorkstationActive(): boolean {
    return this.state !== 'WALKING' && this.state !== 'STANDING_UP';
  }

  public isMovementBlocked(): boolean {
    return this.state !== 'WALKING';
  }

  public isMouseLookBlocked(): boolean {
    return this.state !== 'WALKING';
  }

  public isTransitioning(): boolean {
    return (
      this.state === 'SITTING_DOWN' ||
      this.state === 'DOLLY_TO_SCREEN' ||
      this.state === 'PEEK_OUT' ||
      this.state === 'STANDING_UP'
    );
  }

  public getOverlayOpacity(): number {
    return this.overlayOpacity;
  }

  public getCurrentFov(): number {
    return this.currentFov;
  }

  public getCurrentPosition(): THREE.Vector3 {
    return this.currentPosition;
  }

  public getCurrentLookTarget(): THREE.Vector3 {
    return this.currentLookTarget;
  }

  private getEffectiveDuration(standardDuration: number): number {
    return this.reduceMotion ? this.reducedMotionDuration : standardDuration;
  }

  private getTargetFov(targetFov: number): number {
    return this.reduceMotion ? this.baseFov : targetFov;
  }

  private changeState(newState: WorkstationCameraState): void {
    if (this.state === newState) return;
    const oldState = this.state;
    this.state = newState;
    this.events.onStateChange?.(oldState, newState);
  }

  /**
   * Enters workstation directly without transition (useful for testing or initial page URL params).
   */
  public enterWorkstationDirectly(explorationMode: CameraMode): void {
    this.explorationMode = explorationMode;
    this.hasSatDownOnce = true;
    this.changeState('SCREEN_FULLSCREEN');
    this.currentPosition.copy(this.anchors.CAMERA_SCREEN.position);
    this.currentLookTarget.copy(this.anchors.CAMERA_SCREEN.lookTarget);
    this.currentFov = this.getTargetFov(this.screenFov);
    this.overlayOpacity = 1.0;
  }

  /**
   * Enters the workstation session from walking exploration.
   */
  public enterWorkstation(
    explorationMode: CameraMode,
    currentCamPos: THREE.Vector3,
    currentCamLookTarget: THREE.Vector3,
    currentFov = this.baseFov
  ): void {
    this.explorationMode = explorationMode;

    const seatedTarget =
      explorationMode === 'THIRD_PERSON'
        ? this.anchors.CAMERA_SEATED_TP
        : this.anchors.CAMERA_SEATED_FP;

    // Check if player has chosen to skip sit animation after first time
    if (this.skipSitAfterFirst && this.hasSatDownOnce) {
      // Direct fast dolly into screen
      this.startTransition(
        'DOLLY_TO_SCREEN',
        {
          position: currentCamPos.clone(),
          lookTarget: currentCamLookTarget.clone(),
          fov: currentFov,
        },
        {
          position: this.anchors.CAMERA_SCREEN.position.clone(),
          lookTarget: this.anchors.CAMERA_SCREEN.lookTarget.clone(),
          fov: this.getTargetFov(this.screenFov),
        },
        this.getEffectiveDuration(this.dollyDuration)
      );
      this.events.onDollyStart?.();
      return;
    }

    this.startTransition(
      'SITTING_DOWN',
      {
        position: currentCamPos.clone(),
        lookTarget: currentCamLookTarget.clone(),
        fov: currentFov,
      },
      {
        position: seatedTarget.position.clone(),
        lookTarget: seatedTarget.lookTarget.clone(),
        fov: this.baseFov,
      },
      this.getEffectiveDuration(this.sitDuration)
    );
    this.events.onSitStart?.();
  }

  /**
   * Dolly in from seated view to full screen monitor view.
   */
  public dollyToScreen(): void {
    if (this.state !== 'SEATED_THIRD_PERSON' && this.state !== 'PEEK_OUT') return;

    const startPos =
      this.state === 'PEEK_OUT'
        ? this.currentPosition.clone()
        : this.getSeatedFraming().position.clone();
    const startLook =
      this.state === 'PEEK_OUT'
        ? this.currentLookTarget.clone()
        : this.getSeatedFraming().lookTarget.clone();

    this.startTransition(
      'DOLLY_TO_SCREEN',
      {
        position: startPos,
        lookTarget: startLook,
        fov: this.currentFov,
      },
      {
        position: this.anchors.CAMERA_SCREEN.position.clone(),
        lookTarget: this.anchors.CAMERA_SCREEN.lookTarget.clone(),
        fov: this.getTargetFov(this.screenFov),
      },
      this.getEffectiveDuration(this.dollyDuration)
    );
    this.events.onDollyStart?.();
  }

  /**
   * Peeks out from full-screen monitor view to over-the-shoulder seated third-person view.
   */
  public peekOut(): void {
    if (this.state !== 'SCREEN_FULLSCREEN' && this.state !== 'DOLLY_TO_SCREEN') return;

    const seated = this.getSeatedFraming();
    const startPos =
      this.state === 'DOLLY_TO_SCREEN'
        ? this.currentPosition.clone()
        : this.anchors.CAMERA_SCREEN.position.clone();
    const startLook =
      this.state === 'DOLLY_TO_SCREEN'
        ? this.currentLookTarget.clone()
        : this.anchors.CAMERA_SCREEN.lookTarget.clone();

    this.startTransition(
      'PEEK_OUT',
      {
        position: startPos,
        lookTarget: startLook,
        fov: this.currentFov,
      },
      {
        position: seated.position.clone(),
        lookTarget: seated.lookTarget.clone(),
        fov: this.baseFov,
      },
      this.getEffectiveDuration(this.peekOutDuration)
    );
    this.events.onPeekOut?.();
  }

  /**
   * Toggles between SCREEN_FULLSCREEN and SEATED_THIRD_PERSON (peek out).
   */
  public togglePeek(): void {
    if (this.state === 'SCREEN_FULLSCREEN' || this.state === 'DOLLY_TO_SCREEN') {
      this.peekOut();
    } else if (this.state === 'SEATED_THIRD_PERSON' || this.state === 'PEEK_OUT') {
      this.dollyToScreen();
    }
  }

  /**
   * Exits workstation session and stands up, returning to WALKING.
   * Can be safely called from any state (Esc key).
   */
  public standUp(walkingTargetPos: THREE.Vector3, walkingTargetLook: THREE.Vector3): void {
    if (this.state === 'WALKING') return;

    this.startTransition(
      'STANDING_UP',
      {
        position: this.currentPosition.clone(),
        lookTarget: this.currentLookTarget.clone(),
        fov: this.currentFov,
      },
      {
        position: walkingTargetPos.clone(),
        lookTarget: walkingTargetLook.clone(),
        fov: this.baseFov,
      },
      this.getEffectiveDuration(this.standDuration)
    );
    this.events.onStandUp?.();
  }

  private getSeatedFraming(): CameraFraming {
    return this.explorationMode === 'THIRD_PERSON'
      ? this.anchors.CAMERA_SEATED_TP
      : this.anchors.CAMERA_SEATED_FP;
  }

  private startTransition(
    newState: WorkstationCameraState,
    start: CameraTransformSnapshot,
    target: CameraTransformSnapshot,
    duration: number
  ): void {
    this.changeState(newState);
    this.startSnapshot = start;
    this.targetSnapshot = target;
    this.currentDuration = Math.max(0.01, duration);
    this.transitionElapsed = 0;

    // Immediately copy starting values
    this.currentPosition.copy(start.position);
    this.currentLookTarget.copy(start.lookTarget);
    this.currentFov = start.fov;
  }

  /**
   * Updates state machine based on delta time (seconds).
   */
  public update(deltaTime: number): void {
    if (this.state === 'WALKING') {
      this.overlayOpacity = 0.0;
      return;
    }

    if (this.state === 'SEATED_THIRD_PERSON') {
      const seated = this.getSeatedFraming();
      this.currentPosition.copy(seated.position);
      this.currentLookTarget.copy(seated.lookTarget);
      this.currentFov = this.baseFov;
      this.overlayOpacity = 0.0;
      return;
    }

    if (this.state === 'SCREEN_FULLSCREEN') {
      this.currentPosition.copy(this.anchors.CAMERA_SCREEN.position);
      this.currentLookTarget.copy(this.anchors.CAMERA_SCREEN.lookTarget);
      this.currentFov = this.getTargetFov(this.screenFov);
      this.overlayOpacity = 1.0;
      return;
    }

    // Process active transition
    this.transitionElapsed += Math.max(0, deltaTime);
    const rawProgress = Math.min(1.0, this.transitionElapsed / this.currentDuration);
    const easedT = easeInOutCubic(rawProgress);

    // Interpolate camera position, look target, and FOV
    this.currentPosition.lerpVectors(
      this.startSnapshot.position,
      this.targetSnapshot.position,
      easedT
    );
    this.currentLookTarget.lerpVectors(
      this.startSnapshot.lookTarget,
      this.targetSnapshot.lookTarget,
      easedT
    );
    this.currentFov = THREE.MathUtils.lerp(this.startSnapshot.fov, this.targetSnapshot.fov, easedT);

    // Manage DOM overlay crossfade opacity
    if (this.state === 'DOLLY_TO_SCREEN') {
      // Crossfade starts at 70% of dolly (overlayCrossfadeStart)
      const crossfadeStart = WORLD_CONFIG.camera.workstation.overlayCrossfadeStart;
      if (rawProgress >= crossfadeStart) {
        this.overlayOpacity = (rawProgress - crossfadeStart) / (1.0 - crossfadeStart);
      } else {
        this.overlayOpacity = 0.0;
      }
    } else if (this.state === 'PEEK_OUT') {
      // Fade out overlay during first portion of peek out
      this.overlayOpacity = Math.max(0.0, 1.0 - rawProgress * 2.5);
    } else if (this.state === 'STANDING_UP') {
      // Fade out overlay immediately
      this.overlayOpacity = Math.max(0.0, 1.0 - rawProgress * 4.0);
    } else {
      this.overlayOpacity = 0.0;
    }

    // Check completion of transition
    if (rawProgress >= 1.0) {
      this.handleTransitionComplete();
    }
  }

  private handleTransitionComplete(): void {
    switch (this.state) {
      case 'SITTING_DOWN': {
        this.hasSatDownOnce = true;
        this.changeState('SEATED_THIRD_PERSON');
        // Smoothly sequence into dolly to screen
        this.dollyToScreen();
        break;
      }
      case 'DOLLY_TO_SCREEN': {
        this.changeState('SCREEN_FULLSCREEN');
        this.overlayOpacity = 1.0;
        this.events.onFullscreenEnter?.();
        break;
      }
      case 'PEEK_OUT': {
        this.changeState('SEATED_THIRD_PERSON');
        this.overlayOpacity = 0.0;
        break;
      }
      case 'STANDING_UP': {
        this.changeState('WALKING');
        this.overlayOpacity = 0.0;
        break;
      }
    }
  }

  /**
   * Resets state machine to walking baseline.
   */
  public reset(): void {
    this.state = 'WALKING';
    this.transitionElapsed = 0;
    this.overlayOpacity = 0.0;
    this.currentFov = this.baseFov;
  }
}
