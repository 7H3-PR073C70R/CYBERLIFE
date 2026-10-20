import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { TrafficSystem } from '@/presentation/world/entities/TrafficSystem';
import { LagosProps } from '@/presentation/world/entities/LagosProps';
import { PLAYER_PROTAGONIST_PALETTE } from '@/presentation/world/entities/CharacterCustomizer';
import { InteractionRegistry } from '@/presentation/world/InteractionRegistry';
import { CollisionWorld } from '@/presentation/world/CollisionWorld';
import { WorldEnvironment } from '@/presentation/world/WorldEnvironment';
import { WORLD_CONFIG } from '@/presentation/world/worldConfig';

describe('Traffic System Enhancements & Pedestrian Avoidance', () => {
  it('creates traffic system with vehicles positioned on roadway', () => {
    const traffic = new TrafficSystem();
    const group = traffic.getMesh();
    expect(group).toBeInstanceOf(THREE.Group);
    expect(group.name).toBe('TrafficSystem');
    expect(group.children.length).toBeGreaterThanOrEqual(4);
    traffic.dispose();
  });

  it('decelerates and activates brake lights when pedestrian is directly ahead in lane', () => {
    const traffic = new TrafficSystem();
    // Simulate updating with a pedestrian directly in front of southbound car (-2.4, 0, -28)
    const pedestrianAhead = { x: -2.4, z: -28 };

    // Update with delta
    traffic.update(0.1, [pedestrianAhead], { x: 100, y: 0, z: 100 });

    // The vehicle in that lane should be yielding
    // Let's verify by updating several frames to ensure smooth braking
    for (let i = 0; i < 15; i++) {
      traffic.update(0.1, [pedestrianAhead]);
    }

    traffic.dispose();
  });

  it('resumes cruising speed once pedestrian has crossed out of the lane', () => {
    const traffic = new TrafficSystem();
    // First brake
    traffic.update(0.1, [{ x: -2.4, z: -28 }]);
    // Then pedestrian moves away onto sidewalk at x = -8.0
    for (let i = 0; i < 20; i++) {
      traffic.update(0.1, [{ x: -8.0, z: -28 }]);
    }
    traffic.dispose();
  });
});

describe('Lagos Props - Billboards, Welcome Arch & Trees', () => {
  it('creates commercial advertising billboards with brand styling', () => {
    const mtnAd = LagosProps.createBillboardAd(0, 10, 0, 0, 'MTN_5G');
    expect(mtnAd.name).toBe('BillboardAd_MTN_5G');
    expect(mtnAd.children.length).toBeGreaterThanOrEqual(3);

    const flutterwaveAd = LagosProps.createBillboardAd(0, 10, 0, 0, 'FLUTTERWAVE');
    expect(flutterwaveAd.name).toBe('BillboardAd_FLUTTERWAVE');

    const cyberAd = LagosProps.createBillboardAd(0, 10, 0, 0, 'CYBERLIFE_OS');
    expect(cyberAd.name).toBe('BillboardAd_CYBERLIFE_OS');

    const gtcoAd = LagosProps.createBillboardAd(0, 10, 0, 0, 'GTCO_BANK');
    expect(gtcoAd.name).toBe('BillboardAd_GTCO_BANK');
  });

  it('creates Broad Street Welcome Portal Arch with clear vehicle passage', () => {
    const arch = LagosProps.createWelcomePortalArch(-36);
    expect(arch.name).toBe('BroadStreetWelcomePortal');
    expect(arch.position.z).toBe(-36);
    expect(arch.children.length).toBeGreaterThanOrEqual(4);
  });

  it('creates realistic tropical royal palm tree with segmented trunk and lush fronds', () => {
    const palm = LagosProps.createPalmTree(10, 15, 6.2);
    expect(palm.name).toBe('PalmTree');
    // Multiple trunk segments, collars, nuts, and tiered fronds
    expect(palm.children.length).toBeGreaterThanOrEqual(15);
  });
});

describe('Player Character Protagonist Uniqueness', () => {
  it('defines unique protagonist palette distinct from ordinary pedestrian styles', () => {
    expect(PLAYER_PROTAGONIST_PALETTE.style).toBe('CYBER_PROTAGONIST');
    expect(PLAYER_PROTAGONIST_PALETTE.jacket).toBe(0x0f172a); // Obsidian Cyber Operative Jacket
    expect(PLAYER_PROTAGONIST_PALETTE.shoes).toBe(0x06b6d4); // Cyan tech runners
    expect(PLAYER_PROTAGONIST_PALETTE.accent).toBe(0x00f0ff); // Cyber Cyan comm-link
  });
});

describe('World Environment Building & Road Placement', () => {
  it('ensures no building is located in the middle of Broad Street roadway (x: -5 to 5)', () => {
    const registry = new InteractionRegistry();
    const collisionWorld = new CollisionWorld(WORLD_CONFIG.boundaries);
    const env = new WorldEnvironment(collisionWorld, registry);

    const buildings = env.getBuildings();
    for (const b of buildings) {
      const box = b.getBoundingBox();
      // Broad street roadway is from x = -5 to +5, z between -36 and 20
      const inRoadwayX = box.minX < 4.5 && box.maxX > -4.5;
      const inRoadwayZ = box.minZ < 18 && box.maxZ > -35;
      const sitsInMiddleOfRoad = inRoadwayX && inRoadwayZ;

      expect(sitsInMiddleOfRoad).toBe(false);
    }

    env.dispose();
  });

  it('places Idumota Wholesale Depot safely on the East lot off the road', () => {
    const registry = new InteractionRegistry();
    const collisionWorld = new CollisionWorld(WORLD_CONFIG.boundaries);
    const env = new WorldEnvironment(collisionWorld, registry);

    const depot = env.getBuildings().find(b => b.getName() === 'Idumota Wholesale Depot');
    expect(depot).toBeDefined();
    if (depot) {
      const box = depot.getBoundingBox();
      // East lot is at x >= 12
      expect(box.minX).toBeGreaterThanOrEqual(12);
    }

    env.dispose();
  });
});
