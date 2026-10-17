import { InteractableDefinition } from './worldConfig';

export interface NearbyInteractionResult {
  interactable: InteractableDefinition;
  distance: number;
}

export class InteractionRegistry {
  private interactables: Map<string, InteractableDefinition> = new Map();

  public register(target: InteractableDefinition): void {
    this.interactables.set(target.id, target);
  }

  public unregister(id: string): void {
    this.interactables.delete(id);
  }

  public clear(): void {
    this.interactables.clear();
  }

  public getAll(): readonly InteractableDefinition[] {
    return Array.from(this.interactables.values());
  }

  /**
   * Deterministically finds the nearest interactable within range of player coordinates (x, z).
   * Returns null if no interactable is within its defined interaction radius.
   */
  public findNearest(playerX: number, playerZ: number): NearbyInteractionResult | null {
    let nearest: NearbyInteractionResult | null = null;
    let minDistance = Infinity;

    for (const target of this.interactables.values()) {
      const dx = playerX - target.position[0];
      const dz = playerZ - target.position[2];
      const distance = Math.sqrt(dx * dx + dz * dz);

      if (distance <= target.radius && distance < minDistance) {
        minDistance = distance;
        nearest = { interactable: target, distance };
      }
    }

    return nearest;
  }
}
