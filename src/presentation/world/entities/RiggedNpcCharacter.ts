import * as THREE from 'three';
import { AssetLoader } from '../AssetLoader';
import { NpcProfile, NpcScheduleEntry } from '@/simulation/actors/types';
import { applyCharacterCustomization } from './CharacterCustomizer';
import { PedestrianBodyType } from './RiggedPedestrian';

export function getNpcBodyType(npcId: string): PedestrianBodyType {
  switch (npcId) {
    case 'npc_amina':
    case 'npc_nkechi':
      return 'female_1';
    case 'npc_elena':
    case 'npc_folake':
      return 'female_2';
    case 'npc_femi':
    case 'npc_tunde':
      return 'male_1';
    case 'npc_marcus':
    case 'npc_segun':
      return 'male_2';
    default:
      return 'male_1';
  }
}

export class RiggedNpcCharacter {
  private group: THREE.Group;
  private modelRoot: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private actions = new Map<string, THREE.AnimationAction>();
  private currentAction: THREE.AnimationAction | null = null;

  private profile: NpcProfile;
  private schedule: NpcScheduleEntry;
  private bodyType: PedestrianBodyType;
  private isLoaded = false;
  private currentYaw = 0;

  constructor(profile: NpcProfile, schedule: NpcScheduleEntry) {
    this.profile = profile;
    this.schedule = schedule;
    this.bodyType = getNpcBodyType(profile.id);

    this.group = new THREE.Group();
    this.group.name = `RiggedNPC_${profile.id}`;
    this.group.position.set(schedule.position[0], schedule.position[1], schedule.position[2]);
    this.setRotation(schedule.yaw);
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  public isReady(): boolean {
    return this.isLoaded;
  }

  public getProfile(): NpcProfile {
    return this.profile;
  }

  public setPosition(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  public setRotation(yaw: number): void {
    this.currentYaw = yaw;
    if (this.modelRoot) {
      this.modelRoot.rotation.y = yaw;
    } else {
      this.group.rotation.y = yaw;
    }
  }

  public async load(): Promise<void> {
    const loader = AssetLoader.getInstance();
    const modelUrl = this.getModelUrl();
    const animationsUrl = '/assets/characters/animations.glb';

    const [modelData, animData] = await Promise.all([
      loader.loadGLTFWithAnimations(modelUrl),
      loader.loadGLTFWithAnimations(animationsUrl),
    ]);

    this.modelRoot = modelData.scene;
    this.modelRoot.name = `NPCModel_${this.profile.id}`;

    // Proportions & scale: female ~1.65m, male ~1.76m
    const isFemale = this.bodyType === 'female_1' || this.bodyType === 'female_2';
    const scale = isFemale ? 0.936 : 1.0;
    this.modelRoot.scale.set(scale, scale, scale);
    this.modelRoot.position.set(0, 0, 0);
    this.modelRoot.rotation.y = this.currentYaw;

    // Apply authentic Nigerian skin tone & tailored outfit customization
    applyCharacterCustomization(this.modelRoot, this.profile.palette);

    // Setup AnimationMixer with available animations
    this.mixer = new THREE.AnimationMixer(this.modelRoot);

    for (const clip of animData.animations) {
      const action = this.mixer.clipAction(clip);
      action.loop = THREE.LoopRepeat;
      this.actions.set(clip.name, action);
    }

    // Determine initial animation from schedule activity
    const targetClipName = this.resolveClipName(this.schedule.animationState);
    const action = this.actions.get(targetClipName) ?? this.actions.get('Idle');
    if (action) {
      action.play();
      this.currentAction = action;
    }

    this.group.add(this.modelRoot);
    this.isLoaded = true;
  }

  private getModelUrl(): string {
    switch (this.bodyType) {
      case 'male_1':
        return '/assets/characters/player_male.glb';
      case 'male_2':
        return '/assets/characters/ped_male_2.glb';
      case 'female_1':
        return '/assets/characters/player_female.glb';
      case 'female_2':
        return '/assets/characters/ped_female_2.glb';
    }
  }

  private resolveClipName(state?: string): string {
    switch (state) {
      case 'SEATED_IDLE':
        return 'SitIdle';
      case 'TYPING':
      case 'MOUSE_USE':
        return 'Typing';
      case 'WALK':
        return 'Walk';
      case 'IDLE':
      default:
        return 'Idle';
    }
  }

  public playAnimation(clipName: string, fadeDuration = 0.25): void {
    const nextAction = this.actions.get(clipName);
    if (!nextAction || nextAction === this.currentAction) return;

    nextAction.reset();
    nextAction.play();

    if (this.currentAction) {
      this.currentAction.crossFadeTo(nextAction, fadeDuration, true);
    }
    this.currentAction = nextAction;
  }

  public update(deltaTime: number, _isMoving = false): void {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  }

  public dispose(): void {
    if (this.mixer) {
      this.mixer.stopAllAction();
      if (this.modelRoot) {
        this.mixer.uncacheRoot(this.modelRoot as unknown as THREE.Object3D);
      }
    }
    this.actions.clear();

    if (this.modelRoot && this.modelRoot.parent) {
      this.modelRoot.parent.remove(this.modelRoot);
    }
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
