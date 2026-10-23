import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { WorldEnvironment } from '@/presentation/world/WorldEnvironment';
import { CollisionWorld } from '@/presentation/world/CollisionWorld';
import { InteractionRegistry } from '@/presentation/world/InteractionRegistry';

describe('Five Distinct Real-World Office Interiors', () => {
  const locations = [
    {
      id: 'cedarline_interior',
      expectedTerminal: 'Cedarline SOC Workstation',
      expectedExit: 'Cedarline Services Exit',
    },
    {
      id: 'eko_bank_interior',
      expectedTerminal: 'Eko Merchant Bank Treasury Terminal',
      expectedExit: 'Eko Merchant Bank Exit',
    },
    {
      id: 'krest_interior',
      expectedTerminal: 'Krest Independent Risk Forensic Rig',
      expectedExit: 'Krest Independent Risk Exit',
    },
    {
      id: 'inquirer_interior',
      expectedTerminal: 'The Lagos Inquirer Editorial Desk',
      expectedExit: 'The Lagos Inquirer Exit',
    },
    {
      id: 'apartment_interior',
      expectedTerminal: 'Research Workstation',
      expectedExit: 'Apartment Exit',
    },
  ];

  locations.forEach(({ id, expectedTerminal, expectedExit }) => {
    it(`builds bespoke interior scene for ${id}`, () => {
      const collisionWorld = new CollisionWorld();
      const interactionRegistry = new InteractionRegistry();
      const env = new WorldEnvironment(collisionWorld, interactionRegistry);

      env.buildInteriorScene(id);
      expect(env.isOutdoorScene()).toBe(false);

      const mesh = env.getMesh();
      expect(mesh).toBeInstanceOf(THREE.Group);

      // Verify workstation interaction exists with bespoke corporate terminal name
      const wsInteraction = interactionRegistry.getById(`interact_${id}_workstation`);
      expect(wsInteraction).toBeDefined();
      expect(wsInteraction?.name).toBe(expectedTerminal);

      // Verify exit doorway interaction exists with bespoke exit label
      const exitInteraction = interactionRegistry.getById('interact_exit_door');
      expect(exitInteraction).toBeDefined();
      expect(exitInteraction?.name).toBe(expectedExit);
      expect(exitInteraction?.targetLocationId).toBe('neighborhood');

      env.dispose();
    });
  });
});
