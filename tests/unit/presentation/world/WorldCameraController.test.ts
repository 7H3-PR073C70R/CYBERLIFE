import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as THREE from 'three';
import { WorldCameraController } from '@/presentation/world/WorldCameraController';
import { PlayerAvatar } from '@/presentation/world/entities/PlayerAvatar';
import { WORLD_CONFIG } from '@/presentation/world/worldConfig';

describe('WorldCameraController', () => {
  let camera: THREE.PerspectiveCamera;
  let domElement: HTMLDivElement;
  let avatar: PlayerAvatar;
  let controller: WorldCameraController;

  beforeEach(() => {
    camera = new THREE.PerspectiveCamera(60, 1.33, 0.1, 100);
    domElement = document.createElement('div');
    document.body.appendChild(domElement);
    avatar = new PlayerAvatar();

    controller = new WorldCameraController({
      camera,
      domElement,
      avatar,
      initialMode: 'THIRD_PERSON',
    });
  });

  afterEach(() => {
    controller.dispose();
    avatar.dispose();
    if (domElement.parentNode) {
      domElement.parentNode.removeChild(domElement);
    }
    vi.restoreAllMocks();
  });

  it('initializes in third-person mode with visible avatar', () => {
    expect(controller.getMode()).toBe('THIRD_PERSON');
    expect(avatar.isVisible()).toBe(true);
  });

  it('switches between third-person and first-person mode with V toggle', () => {
    const handleMode = vi.fn();
    const modeController = new WorldCameraController({
      camera,
      domElement,
      avatar,
      onModeChanged: handleMode,
    });

    const newMode = modeController.toggleMode();
    expect(newMode).toBe('FIRST_PERSON');
    expect(modeController.getMode()).toBe('FIRST_PERSON');
    expect(handleMode).toHaveBeenCalledWith('FIRST_PERSON');

    // Avatar must be hidden in 1st person to prevent camera clipping inside player head
    expect(avatar.isVisible()).toBe(false);

    // Toggle back to 3rd person
    const backMode = modeController.toggleMode();
    expect(backMode).toBe('THIRD_PERSON');
    expect(avatar.isVisible()).toBe(true);

    modeController.dispose();
  });

  it('clamps pitch in first-person mode within safe limits', () => {
    controller.setMode('FIRST_PERSON');

    // Try setting excessive pitch (> 90 deg)
    controller.setPitch(Math.PI);
    expect(controller.getPitch()).toBeLessThanOrEqual(WORLD_CONFIG.camera.pitchLimitMax);

    // Try setting excessive negative pitch
    controller.setPitch(-Math.PI);
    expect(controller.getPitch()).toBeGreaterThanOrEqual(WORLD_CONFIG.camera.pitchLimitMin);
  });

  it('positions camera behind avatar in third-person mode', () => {
    const playerPos = { x: 5, y: 0, z: 10 };
    controller.setMode('THIRD_PERSON');
    controller.setYaw(0); // Facing north
    controller.update(playerPos);

    // Camera should be positioned with Y and Z offset behind player
    expect(camera.position.x).toBeCloseTo(playerPos.x);
    expect(camera.position.y).toBeGreaterThan(playerPos.y);
    expect(camera.position.z).toBeGreaterThan(playerPos.z);
  });

  it('positions camera at eye height in first-person mode', () => {
    const playerPos = { x: 5, y: 0, z: 10 };
    controller.setMode('FIRST_PERSON');
    controller.update(playerPos);

    expect(camera.position.x).toBe(playerPos.x);
    expect(camera.position.z).toBe(playerPos.z);
    expect(camera.position.y).toBeCloseTo(playerPos.y + WORLD_CONFIG.player.eyeHeight);
  });

  it('transitions to dedicated over-the-shoulder view in third-person workstation mode', () => {
    controller.setMode('THIRD_PERSON');
    controller.enterWorkstation('THIRD_PERSON');

    // Camera target moves smoothly towards over-the-shoulder composition
    for (let i = 0; i < 20; i++) {
      controller.update({ x: 0, y: 0, z: -2.85 });
    }
    expect(camera.position.y).toBeGreaterThan(1.0);
    expect(camera.position.x).toBeCloseTo(0.48, 1);
    // In third person workstation mode, avatar must remain visible
    expect(avatar.isVisible()).toBe(true);

    // Exiting workstation restores third-person exploration mode
    const restored = controller.exitWorkstation();
    expect(restored).toBe('THIRD_PERSON');
    expect(controller.getMode()).toBe('THIRD_PERSON');
  });

  it('transitions to seated eye-level view in first-person workstation mode without switching to 3rd person', () => {
    controller.setMode('FIRST_PERSON');
    controller.enterWorkstation('FIRST_PERSON');

    for (let i = 0; i < 20; i++) {
      controller.update({ x: 0, y: 0, z: -2.85 });
    }
    expect(controller.getMode()).toBe('FIRST_PERSON');
    expect(camera.position.y).toBeCloseTo(1.16, 1);
    // Avatar stays hidden to prevent clipping inside head
    expect(avatar.isVisible()).toBe(false);

    // Exiting workstation restores first-person exploration mode
    const restored = controller.exitWorkstation();
    expect(restored).toBe('FIRST_PERSON');
    expect(controller.getMode()).toBe('FIRST_PERSON');
  });
});
