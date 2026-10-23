import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { LagosProps } from '@/presentation/world/entities/LagosProps';
import { Building } from '@/presentation/world/entities/Building';
import { WorldEnvironment } from '@/presentation/world/WorldEnvironment';
import { CollisionWorld } from '@/presentation/world/CollisionWorld';
import { InteractionRegistry } from '@/presentation/world/InteractionRegistry';

describe('City Architecture & 3D Corporate Headquarters', () => {
  it('creates photorealistic corporate signboards with company branding and logo icons', () => {
    const cedarSign = LagosProps.createCorporateSignboard({
      companyName: 'Cedarline Services Ltd.',
      subtext: 'Enterprise Cyber Defense & SOC',
      brandColor: '#00f0ff',
      accentColor: '#10b981',
      logoIcon: 'CYBER',
      width: 10.0,
      height: 2.4,
    });
    expect(cedarSign).toBeInstanceOf(THREE.Group);
    expect(cedarSign.name).toBe('CorporateSign_Cedarline_Services_Ltd.');
    expect(cedarSign.children.length).toBeGreaterThanOrEqual(2);

    const bankSign = LagosProps.createCorporateSignboard({
      companyName: 'Eko Merchant Bank',
      subtext: 'Private & Corporate Banking',
      brandColor: '#facc15',
      accentColor: '#38bdf8',
      logoIcon: 'BANK',
      width: 9.8,
      height: 2.4,
    });
    expect(bankSign.name).toBe('CorporateSign_Eko_Merchant_Bank');

    const riskSign = LagosProps.createCorporateSignboard({
      companyName: 'Krest Independent Risk',
      subtext: 'Special Investigations & Forensics',
      brandColor: '#ef4444',
      accentColor: '#f97316',
      logoIcon: 'RISK',
    });
    expect(riskSign.name).toBe('CorporateSign_Krest_Independent_Risk');
  });

  it('initializes Building with GLTF modelUrl and attaches 3D corporate signage', () => {
    const building = new Building({
      name: 'Cedarline Services HQ',
      x: 18,
      z: 6,
      width: 14,
      height: 22,
      depth: 16,
      modelUrl: '/assets/environment/buildings/tower_cedarline_marina.glb',
      logoOptions: {
        companyName: 'Cedarline Services Ltd.',
        subtext: 'Enterprise Cyber Defense & SOC',
        brandColor: '#00f0ff',
        logoIcon: 'CYBER',
      },
    });

    const mesh = building.getMesh();
    expect(mesh).toBeInstanceOf(THREE.Group);
    expect(mesh.name).toBe('Building_Cedarline Services HQ');

    // Sign attached to building group
    const attachedSign = mesh.children.find(c => c.name.startsWith('CorporateSign_'));
    expect(attachedSign).toBeDefined();

    // Bounding box for collision registration
    const bbox = building.getBoundingBox();
    expect(bbox.minX).toBe(11);
    expect(bbox.maxX).toBe(25);
    expect(bbox.minZ).toBe(-2);
    expect(bbox.maxZ).toBe(14);

    building.dispose();
  });

  it('builds outdoor neighborhood with all 5 corporate headquarters and industrial diesel generator', () => {
    const collisionWorld = new CollisionWorld();
    const interactionRegistry = new InteractionRegistry();
    const env = new WorldEnvironment(collisionWorld, interactionRegistry);

    const mesh = env.getMesh();
    expect(mesh).toBeInstanceOf(THREE.Group);

    // Verify all 5 corporate headquarters exist in the world mesh
    const childNames = mesh.children.map(c => c.name);
    expect(childNames).toContain('Building_Cedarline Services HQ');
    expect(childNames).toContain('Building_Eko Merchant Bank Tower');
    expect(childNames).toContain('Building_Krest Independent Risk HQ');
    expect(childNames).toContain('Building_The Lagos Inquirer Press House');
    expect(childNames).toContain('Building_NDSRC Cyber Command');

    // Verify industrial diesel generator
    expect(childNames).toContain('CedarlineDieselGenerator');

    // Verify interactions registered for company headquarters
    expect(interactionRegistry.getById('interact_cedarline_entrance')).toBeDefined();
    expect(interactionRegistry.getById('interact_eko_bank_entrance')).toBeDefined();

    env.dispose();
  });
});
