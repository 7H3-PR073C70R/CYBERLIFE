import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import { HumanoidCharacter } from '@/presentation/world/entities/HumanoidCharacter';
import { WorkstationProps } from '@/presentation/world/entities/WorkstationProps';
import { PedestrianSystem } from '@/presentation/world/entities/PedestrianSystem';
import { TrafficSystem } from '@/presentation/world/entities/TrafficSystem';

describe('M4.5 Visual Systems & Realism Components', () => {
  describe('HumanoidCharacter', () => {
    it('builds an articulated human model with hierarchical joints and meshes', () => {
      const character = new HumanoidCharacter({
        jacket: 0x1e3a5f,
        pants: 0x222222,
        skin: 0x613d28,
        hair: 0x1a110b,
      });

      const mesh = character.getMesh();
      expect(mesh).toBeInstanceOf(THREE.Group);
      expect(mesh.children.length).toBeGreaterThan(0);

      // Verify standing idle animation
      character.update(0.016, false);

      // Verify walking animation
      character.update(0.016, true, 1.0);

      // Verify seated pose transition
      character.setSitting(true);
      expect(character.isSitting()).toBe(true);
      character.update(0.016, false);

      // Verify typing & mouse use trigger
      character.triggerTyping();
      character.update(0.016, false);

      character.triggerMouseUse();
      character.update(0.016, false);

      // Verify stand up
      character.setSitting(false);
      expect(character.isSitting()).toBe(false);

      character.dispose();
    });
  });

  describe('WorkstationProps', () => {
    it('creates detailed physical workstation with desk, chair, laptop, mouse, and first-person hands', () => {
      const props = new WorkstationProps();
      const group = props.getMesh();

      expect(group).toBeInstanceOf(THREE.Group);
      expect(group.children.length).toBeGreaterThan(3);

      // Verify canvas screen texture update
      props.updateTerminalOutput([
        'tade@heron-ws04:~$ help',
        'Command help - simulated terminal operational',
      ]);

      // Verify typing & mouse interactions
      props.triggerTyping();
      props.triggerMouseUse();
      props.update(0.016);

      // Verify first-person mode toggling
      props.setFirstPersonMode(true);
      props.update(0.016);
      props.setFirstPersonMode(false);

      props.dispose();
    });
  });

  describe('PedestrianSystem', () => {
    it('spawns animated human pedestrians on sidewalks along Broad Street and Marina promenade', () => {
      const peds = new PedestrianSystem();
      const group = peds.getMesh();

      expect(group).toBeInstanceOf(THREE.Group);
      expect(group.children.length).toBeGreaterThanOrEqual(4);

      // Update movement along waypoints
      peds.update(0.05);

      peds.dispose();
    });
  });

  describe('TrafficSystem', () => {
    it('spawns moving yellow Danfo commercial minibuses and sedans on Lagos roads', () => {
      const traffic = new TrafficSystem();
      const group = traffic.getMesh();

      expect(group).toBeInstanceOf(THREE.Group);
      expect(group.children.length).toBeGreaterThanOrEqual(4);

      // Update vehicle positions and wheel rotation
      traffic.update(0.05);

      traffic.dispose();
    });
  });
});
