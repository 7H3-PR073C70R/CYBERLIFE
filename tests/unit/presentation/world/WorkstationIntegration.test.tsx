import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CollisionWorld } from '@/presentation/world/CollisionWorld';
import { InteractionRegistry } from '@/presentation/world/InteractionRegistry';
import { WorldEnvironment } from '@/presentation/world/WorldEnvironment';
import { WorldSceneManager } from '@/presentation/world/WorldSceneManager';
import { PlayerController } from '@/presentation/world/PlayerController';
import { PlayerAvatar } from '@/presentation/world/entities/PlayerAvatar';
import { WorldViewport } from '@/presentation/world/WorldViewport';
import { SimulationProvider } from '@/application/simulation/SimulationContext';

describe('Workstation Integration & Input Isolation', () => {
  let collisionWorld: CollisionWorld;
  let interactionRegistry: InteractionRegistry;
  let environment: WorldEnvironment;

  beforeEach(() => {
    collisionWorld = new CollisionWorld({ minX: -20, maxX: 20, minZ: -20, maxZ: 20 });
    interactionRegistry = new InteractionRegistry();
    environment = new WorldEnvironment(collisionWorld, interactionRegistry);
  });

  afterEach(() => {
    environment.dispose();
  });

  it('registers Cedarline workstation interactable and marker in cedarline_interior', () => {
    environment.buildInteriorScene('cedarline_interior');

    const workstation = interactionRegistry.getById('interact_cedarline_workstation');
    expect(workstation).toBeDefined();
    expect(workstation?.name).toBe('Cedarline Workstation');
    expect(workstation?.promptAction).toContain('access Cedarline corporate terminal [E]');
    expect(workstation?.radius).toBe(2.2);
    expect(workstation?.position).toEqual([0, 0, -2.4]);
  });

  it('registers Research workstation interactable in apartment_interior', () => {
    environment.buildInteriorScene('apartment_interior');

    const workstation = interactionRegistry.getById('interact_apartment_workstation');
    expect(workstation).toBeDefined();
    expect(workstation?.name).toBe('Research Workstation');
    expect(workstation?.promptAction).toContain('access personal research workstation [E]');
    expect(workstation?.radius).toBe(2.2);
  });

  it('detects nearest workstation when player approaches desk coordinates', () => {
    environment.buildInteriorScene('cedarline_interior');

    // Player stands at (0, 0, -2.0), well within the 2.2m radius of (0, 0, -2.4)
    const nearest = interactionRegistry.findNearest(0, -2.0);
    expect(nearest).not.toBeNull();
    expect(nearest?.interactable.id).toBe('interact_cedarline_workstation');
    expect(nearest?.distance).toBeCloseTo(0.4, 2);
  });

  it('suspends movement, interaction, and camera keys when PlayerController input is disabled', () => {
    const avatar = new PlayerAvatar();
    const handleInteract = vi.fn();
    const handleCameraToggle = vi.fn();

    const controller = new PlayerController({
      avatar,
      collisionWorld,
      initialPosition: [0, 0, 0],
      initialYaw: 0,
      onInteract: handleInteract,
      onCameraToggle: handleCameraToggle,
    });

    // 1. Initially enabled: KeyW moves player
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    controller.update(0.1, 0);
    expect(controller.getPosition().z).toBeLessThan(0);

    // 2. Disable input (e.g. Virtual Desktop opened)
    controller.setInputDisabled(true);
    controller.setPosition(0, 0, 0);

    // KeyW should now be completely ignored
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    controller.update(0.1, 0);
    expect(controller.getPosition().z).toBe(0);

    // KeyE (interaction) should be ignored
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
    expect(handleInteract).not.toHaveBeenCalled();

    // KeyV (camera toggle) should be ignored
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyV' }));
    expect(handleCameraToggle).not.toHaveBeenCalled();

    // 3. Re-enable input (Virtual Desktop closed)
    controller.setInputDisabled(false);
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyE' }));
    expect(handleInteract).toHaveBeenCalledTimes(1);

    controller.dispose();
    avatar.dispose();
  });

  it('triggers onWorkstationOpen in WorldSceneManager when E is activated near workstation', () => {
    const manager = new WorldSceneManager();
    const handleWorkstationOpen = vi.fn();

    // Mock container
    const container = document.createElement('div');
    Object.defineProperty(container, 'clientWidth', { value: 800 });
    Object.defineProperty(container, 'clientHeight', { value: 600 });
    document.body.appendChild(container);

    vi.spyOn(WorldSceneManager, 'isWebGLAvailable').mockReturnValue(true);

    manager.initialize(container, {
      onWorkstationOpen: handleWorkstationOpen,
    });

    // Move to cedarline interior and approach desk at (0, 0, -2.3)
    (
      manager as unknown as { transitionController: { transitionTo: (id: string) => void } }
    ).transitionController.transitionTo('cedarline_interior');

    const playerCtrl = (manager as unknown as { playerController: PlayerController })
      .playerController;
    playerCtrl.setPosition(0, 0, -2.3);

    // Trigger nearby interaction
    manager.triggerNearbyInteraction();

    expect(handleWorkstationOpen).toHaveBeenCalledWith('interact_cedarline_workstation');

    manager.dispose();
    document.body.removeChild(container);
    vi.restoreAllMocks();
  });

  it('opens DesktopShell and restores HUD upon exiting desktop in WorldViewport', () => {
    vi.spyOn(WorldSceneManager, 'isWebGLAvailable').mockReturnValue(true);

    render(
      <SimulationProvider>
        <WorldViewport />
      </SimulationProvider>
    );

    // Initially HUD is visible and Desktop is closed
    expect(screen.getByTestId('hud-layer')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-shell-container')).not.toBeInTheDocument();

    expect(screen.getByTestId('world-viewport-container')).toBeInTheDocument();

    vi.restoreAllMocks();
  });
});
