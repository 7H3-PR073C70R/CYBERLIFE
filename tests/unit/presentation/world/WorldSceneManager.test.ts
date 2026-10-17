import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WorldSceneManager } from '@/presentation/world/WorldSceneManager';

describe('WorldSceneManager', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 1024, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 768, configurable: true });
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it('detects WebGL availability in the test environment', () => {
    expect(WorldSceneManager.isWebGLAvailable()).toBe(true);
  });

  it('fails initialization gracefully if container is missing', () => {
    const manager = new WorldSceneManager();
    expect(() => manager.initialize(null as unknown as HTMLElement)).toThrow(
      /Container element is null or undefined/
    );
  });

  it('fails initialization if WebGL is unavailable', () => {
    vi.spyOn(WorldSceneManager, 'isWebGLAvailable').mockReturnValue(false);

    const manager = new WorldSceneManager();
    expect(() => manager.initialize(container)).toThrow(
      /WebGL is not available or hardware acceleration is disabled/
    );
  });

  it('initializes the scene, mounts canvas, and begins animation loop', () => {
    const manager = new WorldSceneManager();
    manager.initialize(container);

    const canvas = container.querySelector('canvas');
    expect(canvas).not.toBeNull();
    expect(canvas).toHaveClass('world-viewport-canvas');
    expect(canvas).toHaveAttribute('aria-label');

    const stats = manager.getStatistics();
    expect(stats.isDisposed).toBe(false);

    manager.dispose();
  });

  it('handles resize updates properly', () => {
    const manager = new WorldSceneManager();
    manager.initialize(container);

    // Change dimensions
    Object.defineProperty(container, 'clientWidth', { value: 1280, configurable: true });
    Object.defineProperty(container, 'clientHeight', { value: 800, configurable: true });

    expect(() => manager.resize()).not.toThrow();

    manager.dispose();
  });

  it('cleans up resources and marks disposed status upon dispose()', () => {
    const manager = new WorldSceneManager();
    manager.initialize(container);

    expect(container.querySelector('canvas')).not.toBeNull();

    manager.dispose();

    const stats = manager.getStatistics();
    expect(stats.isDisposed).toBe(true);
    expect(container.querySelector('canvas')).toBeNull();
  });

  it('toggles camera mode between THIRD_PERSON and FIRST_PERSON', () => {
    const manager = new WorldSceneManager();
    manager.initialize(container);

    expect(manager.getCameraMode()).toBe('THIRD_PERSON');

    const newMode = manager.toggleCameraMode();
    expect(newMode).toBe('FIRST_PERSON');
    expect(manager.getCameraMode()).toBe('FIRST_PERSON');

    manager.dispose();
  });

  it('provides current location and player position', () => {
    const manager = new WorldSceneManager();
    manager.initialize(container);

    const location = manager.getCurrentLocation();
    expect(location.id).toBe('neighborhood');
    expect(location.name).toBe('Downtown Urban Block');

    const pos = manager.getPlayerPosition();
    expect(pos).toHaveProperty('x');
    expect(pos).toHaveProperty('y');
    expect(pos).toHaveProperty('z');

    manager.dispose();
  });
});
