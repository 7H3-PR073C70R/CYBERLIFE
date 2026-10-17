import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { LocationTransitionController } from '@/presentation/world/LocationTransitionController';
import { WorldEnvironment } from '@/presentation/world/WorldEnvironment';
import { CollisionWorld } from '@/presentation/world/CollisionWorld';
import { InteractionRegistry } from '@/presentation/world/InteractionRegistry';
import { PlayerAvatar } from '@/presentation/world/entities/PlayerAvatar';
import { PlayerController } from '@/presentation/world/PlayerController';
import { WorldCameraController } from '@/presentation/world/WorldCameraController';

describe('LocationTransitionController', () => {
  let collisionWorld: CollisionWorld;
  let interactionRegistry: InteractionRegistry;
  let environment: WorldEnvironment;
  let avatar: PlayerAvatar;
  let playerController: PlayerController;
  let cameraController: WorldCameraController;
  let transitionController: LocationTransitionController;
  let camera: THREE.PerspectiveCamera;
  let domElement: HTMLDivElement;

  beforeEach(() => {
    collisionWorld = new CollisionWorld();
    interactionRegistry = new InteractionRegistry();
    environment = new WorldEnvironment(collisionWorld, interactionRegistry);
    avatar = new PlayerAvatar();
    camera = new THREE.PerspectiveCamera();
    domElement = document.createElement('div');
    document.body.appendChild(domElement);

    playerController = new PlayerController({
      avatar,
      collisionWorld,
      initialPosition: [0, 0, 14],
    });

    cameraController = new WorldCameraController({
      camera,
      domElement,
      avatar,
    });

    transitionController = new LocationTransitionController({
      environment,
      playerController,
      cameraController,
      initialLocationId: 'neighborhood',
      cooldownMs: 0,
    });
  });

  afterEach(() => {
    playerController.dispose();
    cameraController.dispose();
    environment.dispose();
    avatar.dispose();
    if (domElement.parentNode) {
      domElement.parentNode.removeChild(domElement);
    }
    vi.restoreAllMocks();
  });

  it('starts in the outdoor neighborhood location', () => {
    const loc = transitionController.getCurrentLocation();
    expect(loc.id).toBe('neighborhood');
    expect(loc.type).toBe('OUTDOOR');
  });

  it('transitions to Cedarline Services interior and updates location and coordinates', () => {
    const handleLocation = vi.fn();
    const customTransition = new LocationTransitionController({
      environment,
      playerController,
      cameraController,
      initialLocationId: 'neighborhood',
      onLocationChanged: handleLocation,
    });

    const success = customTransition.transitionTo('cedarline_interior');
    expect(success).toBe(true);

    const loc = customTransition.getCurrentLocation();
    expect(loc.id).toBe('cedarline_interior');
    expect(loc.type).toBe('INTERIOR');
    expect(handleLocation).toHaveBeenCalledWith(loc);

    // Player position should match the interior spawn point
    const pos = playerController.getPosition();
    expect(pos.z).toBeCloseTo(1.5);
  });

  it('returns safely from interior to outdoor neighborhood', () => {
    // 1. Enter apartment interior
    transitionController.transitionTo('apartment_interior');
    expect(transitionController.getCurrentLocation().id).toBe('apartment_interior');

    // 2. Exit back to outdoor neighborhood
    transitionController.transitionTo('neighborhood');
    const loc = transitionController.getCurrentLocation();
    expect(loc.id).toBe('neighborhood');
    expect(loc.type).toBe('OUTDOOR');
  });

  it('debounces rapid transition requests to prevent accidental double-triggers', () => {
    const debouncedController = new LocationTransitionController({
      environment,
      playerController,
      cameraController,
      cooldownMs: 150,
    });
    const first = debouncedController.transitionTo('cedarline_interior');
    expect(first).toBe(true);

    // Immediately attempting a second transition while transition is in flight should return false
    const second = debouncedController.transitionTo('apartment_interior');
    expect(second).toBe(false);
  });
});
