import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { WorldEnvironment } from '@/presentation/world/WorldEnvironment';
import { CollisionWorld } from '@/presentation/world/CollisionWorld';
import { InteractionRegistry } from '@/presentation/world/InteractionRegistry';
import { WORLD_CONFIG } from '@/presentation/world/worldConfig';

describe('WorldEnvironment', () => {
  it('constructs the outdoor Lagos Island neighborhood with landmarks and obstacles', () => {
    const collisionWorld = new CollisionWorld(WORLD_CONFIG.boundaries);
    const interactionRegistry = new InteractionRegistry();

    const env = new WorldEnvironment(collisionWorld, interactionRegistry);
    expect(env.isOutdoorScene()).toBe(true);
    expect(env.getMesh()).toBeInstanceOf(THREE.Group);

    // Verify key Lagos Island interactables are registered
    const aptInteractable = interactionRegistry.getById('interact_apartment_entrance');
    expect(aptInteractable).toBeDefined();
    expect(aptInteractable?.name).toBe('Player Apartment');
    expect(aptInteractable?.targetLocationId).toBe('apartment_interior');

    const cedarInteractable = interactionRegistry.getById('interact_cedarline_entrance');
    expect(cedarInteractable).toBeDefined();
    expect(cedarInteractable?.name).toBe('Cedarline Services HQ');
    expect(cedarInteractable?.targetLocationId).toBe('cedarline_interior');

    const noticeboard = interactionRegistry.getById('interact_noticeboard');
    expect(noticeboard).toBeDefined();
    expect(noticeboard?.name).toBe('Neighborhood Noticeboard');

    // Verify collision obstacles have been registered
    const obstacles = collisionWorld.getObstacles();
    expect(obstacles.length).toBeGreaterThan(10);

    // Verify presence of Danfo bus and Marina seawall obstacles
    const hasDanfo = obstacles.some(o => o.label?.includes('Danfo'));
    expect(hasDanfo).toBe(true);

    const hasSeawall = obstacles.some(o => o.label?.includes('Seawall'));
    expect(hasSeawall).toBe(true);

    const hasMonument = obstacles.some(o => o.label?.includes('Tinubu Square'));
    expect(hasMonument).toBe(true);

    env.dispose();
  });

  it('builds interior scene and registers exit door interaction', () => {
    const collisionWorld = new CollisionWorld(WORLD_CONFIG.boundaries);
    const interactionRegistry = new InteractionRegistry();

    const env = new WorldEnvironment(collisionWorld, interactionRegistry);
    env.buildInteriorScene('cedarline_interior');

    expect(env.isOutdoorScene()).toBe(false);

    const exitDoor = interactionRegistry.getById('interact_exit_door');
    expect(exitDoor).toBeDefined();
    expect(exitDoor?.targetLocationId).toBe('neighborhood');

    // Desk obstacle registered
    const desk = collisionWorld.getObstacles().find(o => o.label?.includes('Desk'));
    expect(desk).toBeDefined();

    env.dispose();
  });

  it('cleans up geometries and materials when cleared or disposed', () => {
    const collisionWorld = new CollisionWorld(WORLD_CONFIG.boundaries);
    const interactionRegistry = new InteractionRegistry();

    const env = new WorldEnvironment(collisionWorld, interactionRegistry);
    expect(env.getMesh().children.length).toBeGreaterThan(0);

    env.clear();
    expect(env.getMesh().children.length).toBe(0);
    expect(collisionWorld.getObstacles().length).toBe(0);

    env.dispose();
  });
});
