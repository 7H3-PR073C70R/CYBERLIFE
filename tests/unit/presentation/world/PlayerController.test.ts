import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PlayerController } from '@/presentation/world/PlayerController';
import { PlayerAvatar } from '@/presentation/world/entities/PlayerAvatar';
import { CollisionWorld } from '@/presentation/world/CollisionWorld';

describe('PlayerController', () => {
  let avatar: PlayerAvatar;
  let collisionWorld: CollisionWorld;
  let controller: PlayerController;

  beforeEach(() => {
    avatar = new PlayerAvatar();
    collisionWorld = new CollisionWorld({ minX: -20, maxX: 20, minZ: -20, maxZ: 20 });
    controller = new PlayerController({
      avatar,
      collisionWorld,
      initialPosition: [0, 0, 0],
      initialYaw: 0,
    });
  });

  afterEach(() => {
    controller.dispose();
    avatar.dispose();
    vi.restoreAllMocks();
  });

  it('normalizes diagonal movement speed to match straight movement', () => {
    // 1. Move straight North (KeyW) for 1 second with camera facing North (yaw = 0)
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    controller.update(0.1, 0);
    const straightPos = controller.getPosition();
    const straightDist = Math.abs(straightPos.z);
    expect(straightDist).toBeGreaterThan(0);

    // Reset position
    controller.resetInput();
    controller.setPosition(0, 0, 0);

    // 2. Move diagonally North + East (KeyW + KeyD) for the same 0.1s
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyD' }));
    controller.update(0.1, 0);
    const diagPos = controller.getPosition();
    const diagDist = Math.sqrt(diagPos.x * diagPos.x + diagPos.z * diagPos.z);

    // The total distance traveled must equal the straight distance (normalized!)
    expect(diagDist).toBeCloseTo(straightDist, 3);
  });

  it('maintains frame-rate independent movement using delta time', () => {
    // Move forward at 60 FPS step (16.6ms) vs 30 FPS step (33.3ms)
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));

    controller.update(0.0166, 0);
    const pos1 = controller.getPosition();

    controller.setPosition(0, 0, 0);
    controller.update(0.0332, 0);
    const pos2 = controller.getPosition();

    // 33.2ms displacement should be double 16.6ms displacement
    expect(Math.abs(pos2.z)).toBeCloseTo(Math.abs(pos1.z) * 2, 2);
  });

  it('clamps excessively large delta-time values to prevent tunneling after pauses', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));

    // Simulate 5-second tab freeze
    controller.update(5.0, 0);
    const pos = controller.getPosition();

    // Maximum clamped step is 0.1s -> speed (6.0) * 0.1 = 0.6 units max
    expect(Math.abs(pos.z)).toBeLessThanOrEqual(0.65);
  });

  it('resets inputs when window loses focus (blur)', () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    window.dispatchEvent(new FocusEvent('blur'));

    // Update with no active keys pressed
    controller.setPosition(0, 0, 0);
    controller.update(0.1, 0);
    const pos = controller.getPosition();

    expect(pos.x).toBe(0);
    expect(pos.z).toBe(0);
  });

  it('triggers onCameraToggle callback when V key is pressed', () => {
    const handleToggle = vi.fn();
    const toggleController = new PlayerController({
      avatar,
      collisionWorld,
      onCameraToggle: handleToggle,
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
    expect(handleToggle).toHaveBeenCalledTimes(1);

    toggleController.dispose();
  });

  it('triggers onInteract callback when E key is pressed', () => {
    const handleInteract = vi.fn();
    const interactController = new PlayerController({
      avatar,
      collisionWorld,
      onInteract: handleInteract,
    });

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
    expect(handleInteract).toHaveBeenCalledTimes(1);

    interactController.dispose();
  });

  it('ignores movement keys when typing inside an input element', () => {
    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', { code: 'KeyW', bubbles: true });
    Object.defineProperty(event, 'target', { value: input });
    window.dispatchEvent(event);

    controller.update(0.1, 0);
    const pos = controller.getPosition();
    expect(pos.z).toBe(0);

    document.body.removeChild(input);
  });
});
