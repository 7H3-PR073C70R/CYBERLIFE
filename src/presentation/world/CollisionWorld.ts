export interface AABB {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  label?: string;
}

export interface WorldBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export class CollisionWorld {
  private obstacles: AABB[] = [];
  private bounds: WorldBounds;

  constructor(bounds: WorldBounds = { minX: -28, maxX: 28, minZ: -28, maxZ: 28 }) {
    this.bounds = { ...bounds };
  }

  private dynamicObstacles: AABB[] = [];

  public setBounds(bounds: WorldBounds): void {
    this.bounds = { ...bounds };
  }

  public getBounds(): WorldBounds {
    return { ...this.bounds };
  }

  public addObstacle(minX: number, maxX: number, minZ: number, maxZ: number, label?: string): void {
    this.obstacles.push({
      minX: Math.min(minX, maxX),
      maxX: Math.max(minX, maxX),
      minZ: Math.min(minZ, maxZ),
      maxZ: Math.max(minZ, maxZ),
      label,
    });
  }

  public setDynamicObstacles(obstacles: AABB[]): void {
    this.dynamicObstacles = obstacles;
  }

  public getDynamicObstacles(): readonly AABB[] {
    return this.dynamicObstacles;
  }

  public getObstacles(): readonly AABB[] {
    return this.obstacles;
  }

  public clear(): void {
    this.obstacles = [];
    this.dynamicObstacles = [];
  }

  /**
   * Checks whether a circle centered at (x, z) with radius r intersects any obstacle AABB or world boundary.
   */
  public isColliding(x: number, z: number, radius: number): boolean {
    // 1. Check world boundaries
    if (
      x - radius < this.bounds.minX ||
      x + radius > this.bounds.maxX ||
      z - radius < this.bounds.minZ ||
      z + radius > this.bounds.maxZ
    ) {
      return true;
    }

    // 2. Check collision with each solid obstacle AABB
    for (const box of this.obstacles) {
      const closestX = Math.max(box.minX, Math.min(x, box.maxX));
      const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));

      const dx = x - closestX;
      const dz = z - closestZ;
      const distanceSq = dx * dx + dz * dz;

      if (distanceSq < radius * radius) {
        return true;
      }
    }

    // 3. Check collision with dynamic obstacles (e.g. moving/parked vehicles)
    for (const box of this.dynamicObstacles) {
      const closestX = Math.max(box.minX, Math.min(x, box.maxX));
      const closestZ = Math.max(box.minZ, Math.min(z, box.maxZ));

      const dx = x - closestX;
      const dz = z - closestZ;
      const distanceSq = dx * dx + dz * dz;

      if (distanceSq < radius * radius) {
        return true;
      }
    }

    return false;
  }

  /**
   * Resolves proposed displacement (dx, dz) with wall-sliding logic.
   * If direct movement is blocked, attempts sliding along the X axis or Z axis independently.
   */
  public resolveMovement(
    currentX: number,
    currentZ: number,
    dx: number,
    dz: number,
    radius: number
  ): { x: number; z: number; isSliding: boolean; isBlocked: boolean } {
    const targetX = currentX + dx;
    const targetZ = currentZ + dz;

    // 1. If direct movement is clear, accept full displacement
    if (!this.isColliding(targetX, targetZ, radius)) {
      return { x: targetX, z: targetZ, isSliding: false, isBlocked: false };
    }

    // 2. Try sliding along X axis (zeroing Z displacement)
    const canMoveX = dx !== 0 && !this.isColliding(targetX, currentZ, radius);

    // 3. Try sliding along Z axis (zeroing X displacement)
    const canMoveZ = dz !== 0 && !this.isColliding(currentX, targetZ, radius);

    if (canMoveX && !canMoveZ) {
      return { x: targetX, z: currentZ, isSliding: true, isBlocked: false };
    }

    if (canMoveZ && !canMoveX) {
      return { x: currentX, z: targetZ, isSliding: true, isBlocked: false };
    }

    if (canMoveX && canMoveZ) {
      // If both single-axis components are valid separately, pick the one with greater displacement
      if (Math.abs(dx) >= Math.abs(dz)) {
        return { x: targetX, z: currentZ, isSliding: true, isBlocked: false };
      } else {
        return { x: currentX, z: targetZ, isSliding: true, isBlocked: false };
      }
    }

    // Completely blocked on both axes
    return { x: currentX, z: currentZ, isSliding: false, isBlocked: true };
  }
}
