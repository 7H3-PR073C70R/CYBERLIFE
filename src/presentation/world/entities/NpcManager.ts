import * as THREE from 'three';
import { HumanoidCharacter } from './HumanoidCharacter';
import { RiggedNpcCharacter } from './RiggedNpcCharacter';
import { InteractableMarker } from './InteractableMarker';
import { InteractionRegistry } from '../InteractionRegistry';
import { CollisionWorld } from '../CollisionWorld';
import { NPC_PROFILES } from '@/simulation/actors/npcProfiles';
import { getNpcActiveSchedule } from '@/simulation/actors/npcSchedules';
import { NpcProfile, NpcScheduleEntry } from '@/simulation/actors/types';

export interface ActiveNpcInstance {
  readonly profile: NpcProfile;
  character: HumanoidCharacter | RiggedNpcCharacter;
  riggedCharacter: RiggedNpcCharacter | null;
  fallbackCharacter: HumanoidCharacter | null;
  readonly marker: InteractableMarker;
  readonly schedule: NpcScheduleEntry;
  targetYaw: number;
  currentYaw: number;
  isInDialogue: boolean;
}

export class NpcManager {
  private group: THREE.Group;
  private npcs: Map<string, ActiveNpcInstance> = new Map();
  private interactionRegistry: InteractionRegistry;
  private collisionWorld: CollisionWorld;
  private currentLocationId = 'neighborhood';
  private activeDialogueNpcId: string | null = null;

  constructor(interactionRegistry: InteractionRegistry, collisionWorld: CollisionWorld) {
    this.group = new THREE.Group();
    this.group.name = 'NpcManager';
    this.interactionRegistry = interactionRegistry;
    this.collisionWorld = collisionWorld;
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  /**
   * Spawns or updates all NPCs eligible for the specified location and simulation hour.
   */
  public rebuildForLocation(locationId: string, simulationHour = 8): void {
    this.clear();
    this.currentLocationId = locationId;

    for (const profile of NPC_PROFILES) {
      const schedule = getNpcActiveSchedule(profile, simulationHour);
      if (schedule.locationId !== locationId) {
        continue;
      }

      // Procedural fallback character displayed immediately while rigged model loads
      const fallbackCharacter = new HumanoidCharacter(profile.palette);
      fallbackCharacter.setPosition(schedule.position[0], schedule.position[1], schedule.position[2]);
      fallbackCharacter.setRotation(schedule.yaw);

      // Add character collision obstacle to prevent player walking through NPCs
      const [px, , pz] = schedule.position;
      this.collisionWorld.addObstacle(
        px - 0.45,
        px + 0.45,
        pz - 0.45,
        pz + 0.45,
        `NPC: ${profile.name}`
      );

      // Interactable marker with flush ground ring and overhead holographic beacon (y = 2.15)
      const marker = new InteractableMarker(
        px,
        pz,
        profile.palette.jacketTrim ?? 0x38bdf8,
        {
          label: profile.name,
          beaconHeight: 2.15,
        }
      );

      const interactableId = `interact_${profile.id}`;
      this.interactionRegistry.register({
        id: interactableId,
        name: `${profile.name} (${profile.role})`,
        promptAction: `speak with ${profile.name} [E]`,
        description: profile.bio,
        position: [px, schedule.position[1], pz],
        radius: 2.6,
      });

      this.group.add(fallbackCharacter.getMesh());
      this.group.add(marker.getMesh());

      // Rigged NPC character instance
      const riggedCharacter = new RiggedNpcCharacter(profile, schedule);

      const instance: ActiveNpcInstance = {
        profile,
        character: fallbackCharacter,
        riggedCharacter,
        fallbackCharacter,
        marker,
        schedule,
        targetYaw: schedule.yaw,
        currentYaw: schedule.yaw,
        isInDialogue: false,
      };

      this.npcs.set(profile.id, instance);

      // Asynchronously load rigged model and hot-swap
      this.loadRiggedNpc(instance, riggedCharacter);
    }
  }

  private async loadRiggedNpc(
    instance: ActiveNpcInstance,
    rigged: RiggedNpcCharacter
  ): Promise<void> {
    try {
      await rigged.load();
      if (instance.fallbackCharacter) {
        this.group.remove(instance.fallbackCharacter.getMesh());
        instance.fallbackCharacter.dispose();
        instance.fallbackCharacter = null;
      }
      instance.character = rigged;
      this.group.add(rigged.getMesh());
      rigged.setRotation(instance.currentYaw);
    } catch (err) {
      console.warn(
        `NpcManager: Failed to load rigged model for ${instance.profile.name}, continuing with procedural character fallback.`,
        err
      );
      instance.riggedCharacter = null;
      instance.character = instance.fallbackCharacter!;
    }
  }

  public getCurrentLocationId(): string {
    return this.currentLocationId;
  }

  public getActiveDialogueNpcId(): string | null {
    return this.activeDialogueNpcId;
  }
  /**
   * Updates NPC visibility/positions when the simulation hour changes.
   * Only triggers a full rebuild if the set of NPCs at the current location
   * has changed (i.e. a schedule hour boundary was crossed).
   * Call this from WorldSceneManager.setSimulationTime whenever the hour changes.
   */
  public updateForSimulationHour(simulationHour: number): void {
    if (!this.currentLocationId) return;

    // Determine which NPC profiles should be present at the current location this hour
    const shouldBePresent = new Set<string>();
    for (const profile of NPC_PROFILES) {
      const schedule = getNpcActiveSchedule(profile, simulationHour);
      if (schedule.locationId === this.currentLocationId) {
        shouldBePresent.add(profile.id);
      }
    }

    // Check if the presence set differs from what is currently spawned
    const currentIds = new Set(this.npcs.keys());
    const added = [...shouldBePresent].filter(id => !currentIds.has(id));
    const removed = [...currentIds].filter(id => !shouldBePresent.has(id));

    if (added.length === 0 && removed.length === 0) return; // No change

    // Rebuild NPC set for this hour
    this.rebuildForLocation(this.currentLocationId, simulationHour);
  }


  public setDialogueActive(
    npcId: string | null,
    playerPosition?: THREE.Vector3 | { x: number; y: number; z: number }
  ): void {
    this.activeDialogueNpcId = npcId;

    this.npcs.forEach((instance, id) => {
      if (id === npcId) {
        instance.isInDialogue = true;
        if (playerPosition) {
          const dx = playerPosition.x - instance.schedule.position[0];
          const dz = playerPosition.z - instance.schedule.position[2];
          instance.targetYaw = Math.atan2(dx, dz);
        }
        if (instance.riggedCharacter && instance.schedule.animationState !== 'SEATED_IDLE') {
          instance.riggedCharacter.playAnimation('Idle');
        }
      } else {
        instance.isInDialogue = false;
        instance.targetYaw = instance.schedule.yaw;
      }
    });
  }

  public update(
    deltaTime: number,
    playerPosition?: THREE.Vector3 | { x: number; y: number; z: number }
  ): void {
    this.npcs.forEach(instance => {
      instance.marker.update(deltaTime);

      // Smoothly rotate NPC towards target yaw (either facing player during dialogue or facing routine direction)
      if (Math.abs(instance.targetYaw - instance.currentYaw) > 0.01) {
        let diff = instance.targetYaw - instance.currentYaw;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        instance.currentYaw += diff * Math.min(1.0, 6.0 * deltaTime);
        instance.character.setRotation(instance.currentYaw);
      }

      // If active dialogue and player is moving slightly, adjust facing angle smoothly
      if (instance.isInDialogue && playerPosition) {
        const dx = playerPosition.x - instance.schedule.position[0];
        const dz = playerPosition.z - instance.schedule.position[2];
        instance.targetYaw = Math.atan2(dx, dz);
      }

      // Update character animation
      instance.character.update(deltaTime, false);
    });
  }

  public getNpc(npcId: string): ActiveNpcInstance | undefined {
    return this.npcs.get(npcId);
  }

  public getNpcPositions(): Array<{ x: number; z: number }> {
    const list: Array<{ x: number; z: number }> = [];
    this.npcs.forEach(instance => {
      list.push({ x: instance.schedule.position[0], z: instance.schedule.position[2] });
    });
    return list;
  }

  public clear(): void {
    this.npcs.forEach(instance => {
      if (instance.riggedCharacter) instance.riggedCharacter.dispose();
      if (instance.fallbackCharacter) instance.fallbackCharacter.dispose();
      instance.marker.dispose();
      this.interactionRegistry.unregister(`interact_${instance.profile.id}`);
    });
    this.npcs.clear();
    this.activeDialogueNpcId = null;

    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      if (child) {
        this.group.remove(child);
      }
    }
  }

  public dispose(): void {
    this.clear();
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
