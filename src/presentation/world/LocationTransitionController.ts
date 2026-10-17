import { WORLD_CONFIG, LocationDefinition } from './worldConfig';
import { WorldEnvironment } from './WorldEnvironment';
import { PlayerController } from './PlayerController';
import { WorldCameraController } from './WorldCameraController';

export interface LocationTransitionOptions {
  environment: WorldEnvironment;
  playerController: PlayerController;
  cameraController: WorldCameraController;
  initialLocationId?: string;
  cooldownMs?: number;
  onLocationChanged?: (location: LocationDefinition) => void;
}

export class LocationTransitionController {
  private environment: WorldEnvironment;
  private playerController: PlayerController;
  private cameraController: WorldCameraController;

  private currentLocation: LocationDefinition;
  private isTransitioning = false;
  private cooldownMs: number;
  private lastOutdoorPosition: [number, number, number] = [0, 0, 14];

  private onLocationChanged?: (location: LocationDefinition) => void;

  constructor(options: LocationTransitionOptions) {
    this.environment = options.environment;
    this.playerController = options.playerController;
    this.cameraController = options.cameraController;
    this.onLocationChanged = options.onLocationChanged;
    this.cooldownMs = options.cooldownMs ?? 150;

    const locId = options.initialLocationId ?? 'neighborhood';
    this.currentLocation = this.resolveLocation(locId);
  }

  private resolveLocation(locationId: string): LocationDefinition {
    if (locationId === 'cedarline_interior') {
      return WORLD_CONFIG.locations.cedarlineInterior;
    }
    if (locationId === 'apartment_interior') {
      return WORLD_CONFIG.locations.apartmentInterior;
    }
    return WORLD_CONFIG.locations.neighborhood;
  }

  public getCurrentLocation(): LocationDefinition {
    return this.currentLocation;
  }

  public canTransition(): boolean {
    return !this.isTransitioning;
  }

  /**
   * Executes a safe transition to the target location.
   */
  public transitionTo(targetLocationId: string): boolean {
    if (this.isTransitioning) return false;

    this.isTransitioning = true;
    const targetDef = this.resolveLocation(targetLocationId);

    // Save outdoor position when leaving outdoor neighborhood
    if (this.currentLocation.type === 'OUTDOOR' && targetDef.type === 'INTERIOR') {
      const pos = this.playerController.getPosition();
      this.lastOutdoorPosition = [pos.x, pos.y, pos.z];
    }

    // 1. Rebuild Environment for the target scene
    if (targetDef.type === 'OUTDOOR') {
      this.environment.buildOutdoorNeighborhood();
      // When returning outdoors, spawn near the building door entered
      const returnSpawn = this.lastOutdoorPosition;
      this.playerController.setPosition(returnSpawn[0], returnSpawn[1], returnSpawn[2]);
      this.playerController.setYaw(targetDef.spawnYaw);
      this.cameraController.setYaw(targetDef.spawnYaw);
    } else {
      this.environment.buildInteriorScene(targetDef.id);
      const spawn = targetDef.spawnPosition;
      this.playerController.setPosition(spawn[0], spawn[1], spawn[2]);
      this.playerController.setYaw(targetDef.spawnYaw);
      this.cameraController.setYaw(targetDef.spawnYaw);
    }

    // 2. Clear inputs and update location tracking
    this.playerController.resetInput();
    this.currentLocation = targetDef;
    this.onLocationChanged?.(this.currentLocation);

    // 3. Reset transition lock after brief cooldown
    if (this.cooldownMs > 0) {
      setTimeout(() => {
        this.isTransitioning = false;
      }, this.cooldownMs);
    } else {
      this.isTransitioning = false;
    }

    return true;
  }
}
