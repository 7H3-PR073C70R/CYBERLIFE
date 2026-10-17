import { describe, it, expect, beforeEach } from 'vitest';
import { InteractionRegistry } from '@/presentation/world/InteractionRegistry';
import { InteractableDefinition } from '@/presentation/world/worldConfig';

describe('InteractionRegistry', () => {
  let registry: InteractionRegistry;

  const targetA: InteractableDefinition = {
    id: 'target_a',
    name: 'Cedarline Services Entrance',
    promptAction: 'enter Cedarline Services [E]',
    description: 'Corporate entrance.',
    position: [10, 0, 0],
    radius: 3.0,
  };

  const targetB: InteractableDefinition = {
    id: 'target_b',
    name: 'Player Apartment Entrance',
    promptAction: 'enter your studio apartment [E]',
    description: 'Home base entrance.',
    position: [-10, 0, 0],
    radius: 3.0,
  };

  beforeEach(() => {
    registry = new InteractionRegistry();
    registry.register(targetA);
    registry.register(targetB);
  });

  it('registers and retrieves interactables', () => {
    expect(registry.getAll()).toHaveLength(2);
  });

  it('returns null when player is out of interaction range', () => {
    // Player at origin (0, 0) is 10 units away (radius is 3.0)
    const result = registry.findNearest(0, 0);
    expect(result).toBeNull();
  });

  it('returns the target when player is within radius', () => {
    // Player at (9, 0) is 1 unit away from Target A
    const result = registry.findNearest(9, 0);
    expect(result).not.toBeNull();
    expect(result?.interactable.id).toBe('target_a');
    expect(result?.distance).toBeCloseTo(1.0);
  });

  it('deterministically selects the nearest target when multiple are nearby', () => {
    const targetC: InteractableDefinition = {
      id: 'target_c',
      name: 'Noticeboard',
      promptAction: 'read notices [E]',
      description: 'Bulletin board.',
      position: [8, 0, 0],
      radius: 4.0,
    };
    registry.register(targetC);

    // Player at (8.2, 0) is closer to Target C (0.2) than Target A (1.8)
    const result = registry.findNearest(8.2, 0);
    expect(result?.interactable.id).toBe('target_c');
  });

  it('unregisters interactables cleanly', () => {
    registry.unregister('target_a');
    expect(registry.findNearest(9.5, 0)).toBeNull();
  });
});
