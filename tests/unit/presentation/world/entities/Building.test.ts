import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { Building } from '@/presentation/world/entities/Building';

describe('Building Entity', () => {
  it('creates an Afro-Brazilian style building with arched windows, balcony, and water tank', () => {
    const building = new Building({
      name: 'Test Brazilian House',
      x: 10,
      z: 20,
      width: 12,
      height: 10,
      depth: 8,
      style: 'AFRO_BRAZILIAN',
      color: 0xd97706,
      trimColor: 0x78350f,
      hasBalcony: true,
      hasWaterTank: true,
      entranceSide: 'EAST',
    });

    const mesh = building.getMesh();
    expect(mesh).toBeInstanceOf(THREE.Group);
    expect(mesh.name).toBe('Building_Test Brazilian House');
    expect(building.getName()).toBe('Test Brazilian House');

    const aabb = building.getBoundingBox();
    expect(aabb.minX).toBe(4); // 10 - 6
    expect(aabb.maxX).toBe(16); // 10 + 6
    expect(aabb.minZ).toBe(16); // 20 - 4
    expect(aabb.maxZ).toBe(24); // 20 + 4

    // Ensure children include mesh, base, trim, balcony, water tank, etc.
    expect(mesh.children.length).toBeGreaterThan(4);

    // Verify cleanup
    expect(() => building.dispose()).not.toThrow();
  });

  it('creates a Commercial Tower building with window ribbons, entrance canopy, and roof chillers', () => {
    const building = new Building({
      name: 'Test Commercial Tower',
      x: -15,
      z: 0,
      width: 14,
      height: 20,
      depth: 14,
      style: 'COMMERCIAL_TOWER',
      color: 0x0f172a,
      trimColor: 0x0284c7,
      entranceSide: 'WEST',
      roofEquipment: true,
      hasWaterTank: true,
    });

    const mesh = building.getMesh();
    expect(mesh).toBeInstanceOf(THREE.Group);
    expect(building.getName()).toBe('Test Commercial Tower');

    const aabb = building.getBoundingBox();
    expect(aabb.minX).toBe(-22);
    expect(aabb.maxX).toBe(-8);

    expect(() => building.dispose()).not.toThrow();
  });

  it('creates a Market Storefront with roll-down shutters, striped awning, and signage', () => {
    const building = new Building({
      name: 'Test Market Shop',
      x: 0,
      z: -10,
      width: 10,
      height: 8,
      depth: 6,
      style: 'MARKET_STOREFRONT',
      color: 0xf1f5f9,
      awningColors: [0x15803d, 0xfacc15],
      entranceSide: 'SOUTH',
    });

    const mesh = building.getMesh();
    expect(mesh).toBeInstanceOf(THREE.Group);

    expect(() => building.dispose()).not.toThrow();
  });

  it('handles North entrance orientation correctly', () => {
    const building = new Building({
      name: 'North Facing Building',
      x: 0,
      z: 0,
      width: 8,
      height: 8,
      depth: 8,
      color: 0x334155,
      entranceSide: 'NORTH',
    });

    expect(building.getMesh()).toBeInstanceOf(THREE.Group);
    expect(() => building.dispose()).not.toThrow();
  });
});
