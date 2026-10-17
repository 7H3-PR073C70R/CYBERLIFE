import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { LagosProps } from '@/presentation/world/entities/LagosProps';

describe('LagosProps Entity Generator', () => {
  it('creates the iconic Lagos Danfo minibus with yellow livery and twin black stripes', () => {
    const danfo = LagosProps.createDanfoMinibus(5, 10, 0);

    expect(danfo.mesh).toBeInstanceOf(THREE.Group);
    expect(danfo.mesh.name).toBe('DanfoMinibus');
    expect(danfo.aabb).toBeDefined();
    expect(danfo.aabb?.label).toContain('Danfo');
    expect(danfo.mesh.position.x).toBe(5);
    expect(danfo.mesh.position.z).toBe(10);

    // Verify presence of yellow body, stripes, wheels, windshield
    expect(danfo.mesh.children.length).toBeGreaterThan(6);
  });

  it('creates Balogun market stalls with striped awnings and display crates', () => {
    const stall = LagosProps.createMarketStall(15, -8, 0, 0x15803d, 0xfef3c7, 'Test Textiles');

    expect(stall.mesh).toBeInstanceOf(THREE.Group);
    expect(stall.mesh.name).toContain('MarketStall');
    expect(stall.aabb).toBeDefined();
    expect(stall.aabb?.label).toContain('Test Textiles');

    // Table, legs, canopy, crates
    expect(stall.mesh.children.length).toBeGreaterThan(5);
  });

  it('creates concrete utility poles with cross-arms and transformers', () => {
    const pole = LagosProps.createUtilityPole(-5.5, 12);

    expect(pole.mesh).toBeInstanceOf(THREE.Group);
    expect(pole.mesh.name).toBe('UtilityPole');
    expect(pole.aabb).toBeDefined();
    expect(pole.aabb?.label).toBe('Utility Pole');
  });

  it('creates official Lagos State green and white street signs', () => {
    const sign = LagosProps.createStreetSign(0, 0, 'BROAD STREET');

    expect(sign).toBeInstanceOf(THREE.Group);
    expect(sign.name).toBe('StreetSign_BROAD STREET');
    expect(sign.children.length).toBeGreaterThanOrEqual(3);
  });

  it('creates tropical royal palm trees', () => {
    const palm = LagosProps.createPalmTree(-10, 15, 6);

    expect(palm).toBeInstanceOf(THREE.Group);
    expect(palm.name).toBe('PalmTree');
    // Segmented trunk + spreading fronds
    expect(palm.children.length).toBeGreaterThanOrEqual(10);
  });

  it('creates the Marina waterfront seawall with safety railings and bollards', () => {
    const seawall = LagosProps.createSeawall(33, -36, 36);

    expect(seawall.mesh).toBeInstanceOf(THREE.Group);
    expect(seawall.mesh.name).toBe('MarinaSeawall');
    expect(seawall.aabb).toBeDefined();
    expect(seawall.aabb?.minX).toBe(-36);
    expect(seawall.aabb?.maxX).toBe(36);
  });

  it('creates the Tinubu Square central monument and fountain', () => {
    const monument = LagosProps.createTinubuMonument(-18, 6);

    expect(monument.mesh).toBeInstanceOf(THREE.Group);
    expect(monument.mesh.name).toBe('TinubuSquareMonument');
    expect(monument.aabb).toBeDefined();
    expect(monument.aabb?.label).toContain('Tinubu Square');
  });

  it('creates rooftop polyethylene water storage tanks', () => {
    const tank = LagosProps.createWaterTank(2, 10, -2);

    expect(tank).toBeInstanceOf(THREE.Group);
    expect(tank.name).toBe('RooftopWaterTank');
    expect(tank.position.y).toBe(10);
  });
});
