import { describe, it, expect, beforeEach } from 'vitest';
import { CollisionWorld } from '@/presentation/world/CollisionWorld';

describe('CollisionWorld', () => {
  let collisionWorld: CollisionWorld;

  beforeEach(() => {
    // 20x20 world bounds centered at origin
    collisionWorld = new CollisionWorld({ minX: -10, maxX: 10, minZ: -10, maxZ: 10 });
  });

  it('detects boundary collisions correctly', () => {
    const radius = 0.5;

    // Inside bounds
    expect(collisionWorld.isColliding(0, 0, radius)).toBe(false);

    // Crossing boundary
    expect(collisionWorld.isColliding(10, 0, radius)).toBe(true);
    expect(collisionWorld.isColliding(-10, 0, radius)).toBe(true);
    expect(collisionWorld.isColliding(0, 10, radius)).toBe(true);
    expect(collisionWorld.isColliding(0, -10, radius)).toBe(true);
  });

  it('detects collision with solid AABB obstacles', () => {
    const radius = 0.5;
    // Box from x: [2, 6], z: [2, 6]
    collisionWorld.addObstacle(2, 6, 2, 6, 'Test Building');

    // Far from obstacle
    expect(collisionWorld.isColliding(0, 0, radius)).toBe(false);

    // Inside obstacle
    expect(collisionWorld.isColliding(3, 3, radius)).toBe(true);

    // Touching obstacle edge with radius
    expect(collisionWorld.isColliding(1.6, 3, radius)).toBe(true);

    // Outside obstacle clearance
    expect(collisionWorld.isColliding(1.4, 3, radius)).toBe(false);
  });

  it('resolves unblocked movement directly', () => {
    const radius = 0.5;
    const result = collisionWorld.resolveMovement(0, 0, 1.0, 1.0, radius);

    expect(result.x).toBeCloseTo(1.0);
    expect(result.z).toBeCloseTo(1.0);
    expect(result.isBlocked).toBe(false);
    expect(result.isSliding).toBe(false);
  });

  it('permits sliding along Z axis when X movement is blocked by a wall', () => {
    const radius = 0.5;
    // Solid wall from x: [2, 4], z: [-5, 5]
    collisionWorld.addObstacle(2, 4, -5, 5, 'Wall facing East/West');

    // Player starts at (1.4, 0), tries to move diagonally (+1.0 in X, +1.0 in Z)
    const result = collisionWorld.resolveMovement(1.4, 0, 1.0, 1.0, radius);

    // Moving +1.0 in X would put player at 2.4 (inside wall).
    // So X is blocked, but Z (+1.0) is free!
    expect(result.x).toBeCloseTo(1.4);
    expect(result.z).toBeCloseTo(1.0);
    expect(result.isSliding).toBe(true);
    expect(result.isBlocked).toBe(false);
  });

  it('permits sliding along X axis when Z movement is blocked by a wall', () => {
    const radius = 0.5;
    // Solid wall from x: [-5, 5], z: [2, 4]
    collisionWorld.addObstacle(-5, 5, 2, 4, 'Wall facing North/South');

    // Player starts at (0, 1.4), tries to move diagonally (+1.0 in X, +1.0 in Z)
    const result = collisionWorld.resolveMovement(0, 1.4, 1.0, 1.0, radius);

    // Moving +1.0 in Z would put player at 2.4 (inside wall).
    // So Z is blocked, but X (+1.0) is free!
    expect(result.x).toBeCloseTo(1.0);
    expect(result.z).toBeCloseTo(1.4);
    expect(result.isSliding).toBe(true);
    expect(result.isBlocked).toBe(false);
  });

  it('completely blocks movement when player is in a corner with no valid sliding axis', () => {
    const radius = 0.5;
    // Corner: obstacle at [1, 5, -5, 5] and boundary at maxX = 10
    collisionWorld.addObstacle(1, 5, 1, 5, 'Corner Obstacle');

    // Try moving directly into the obstacle where both axes intersect
    const result = collisionWorld.resolveMovement(1.4, 1.4, 0.5, 0.5, radius);

    expect(result.x).toBeCloseTo(1.4);
    expect(result.z).toBeCloseTo(1.4);
    expect(result.isBlocked).toBe(true);
  });
});
