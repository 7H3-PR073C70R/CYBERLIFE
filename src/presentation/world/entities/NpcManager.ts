import * as THREE from 'three';
import { HumanoidCharacter } from './HumanoidCharacter';
import { InteractableMarker } from './InteractableMarker';
import { InteractionRegistry } from '../InteractionRegistry';
import { CollisionWorld } from '../CollisionWorld';
import { NPC_PROFILES } from '@/simulation/actors/npcProfiles';
import { getNpcActiveSchedule } from '@/simulation/actors/npcSchedules';
import { NpcProfile, NpcScheduleEntry } from '@/simulation/actors/types';

export interface ActiveNpcInstance {
  readonly profile: NpcProfile;
  readonly character: HumanoidCharacter;
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

      const character = new HumanoidCharacter(profile.palette);
      character.setPosition(schedule.position[0], schedule.position[1], schedule.position[2]);
      character.setRotation(schedule.yaw);

      // Add character collision obstacle to prevent player walking through NPCs
      const [px, , pz] = schedule.position;
      this.collisionWorld.addObstacle(
        px - 0.45,
        px + 0.45,
        pz - 0.45,
        pz + 0.45,
        `NPC: ${profile.name}`
      );

      // Interactable marker floating above NPC head (at y = 2.15)
      const marker = new InteractableMarker(
        px,
        pz,
        profile.palette.jacketTrim ?? 0x38bdf8,
        profile.name
      );
      marker.getMesh().position.y = 0.25;

      const interactableId = `interact_${profile.id}`;
      this.interactionRegistry.register({
        id: interactableId,
        name: `${profile.name} (${profile.role})`,
        promptAction: `speak with ${profile.name} [E]`,
        description: profile.bio,
        position: [px, schedule.position[1], pz],
        radius: 2.6,
      });

      this.group.add(character.getMesh());
      this.group.add(marker.getMesh());

      this.npcs.set(profile.id, {
        profile,
        character,
        marker,
        schedule,
        targetYaw: schedule.yaw,
        currentYaw: schedule.yaw,
        isInDialogue: false,
      });
    }
  }

  public getCurrentLocationId(): string {
    return this.currentLocationId;
  }

  public getActiveDialogueNpcId(): string | null {
    return this.activeDialogueNpcId;
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

      // Procedural breathing idle animation
      instance.character.update(deltaTime, false);
    });
  }

  public getNpc(npcId: string): ActiveNpcInstance | undefined {
    return this.npcs.get(npcId);
  }

  public clear(): void {
    this.npcs.forEach(instance => {
      instance.character.dispose();
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
