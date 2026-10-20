import * as THREE from 'three';
import { AssetLoader } from '../AssetLoader';
import { NpcProfile, NpcScheduleEntry } from '@/simulation/actors/types';
import { CharacterPalette, applyCharacterCustomization } from './CharacterCustomizer';
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

export function getNpcCustomPalette(profile: NpcProfile): CharacterPalette {
  const base = profile.palette;
  switch (profile.id) {
    // 1. Femi Martins - VP of Technology & Operations: Bespoke Executive Midnight Navy Suit
    case 'npc_femi':
      return {
        ...base,
        style: 'ELITE_SUIT',
        jacket: 0x0b1329, // Presidential Midnight Navy tailored jacket
        pants: 0x0b1329, // Matching tailored trousers
        shoes: 0x050505, // Polished high-gloss black leather oxfords
        skin: 0x3d2012, // Deep Ebony Melanin
      };

    // 2. Folake Davies - Technology Talent Partner / Recruiter: Regal Violet Executive Suit
    case 'npc_folake':
      return {
        ...base,
        style: 'ELITE_SUIT',
        jacket: 0x7c3aed, // Regal violet tailored blazer
        pants: 0x1a1e24, // Italian charcoal tailored trousers
        shoes: 0x050505, // Polished patent leather heels
        skin: 0x5c3826, // Warm Cocoa
      };

    // 3. Dr. Elena Chen - Lead AI Engineer: Corporate Emerald Tailored Blazer
    case 'npc_elena':
      return {
        ...base,
        style: 'ELITE_SUIT',
        jacket: 0x064e3b, // Corporate Emerald tailored blazer
        pants: 0x064e3b, // Matching emerald slacks
        shoes: 0x050505, // Polished designer heels
        skin: 0x8d5c3f, // Warm Caramel
      };

    // 4. Amina Okonjo - Lead Security Analyst: Professional Cedarline Tech Uniform
    case 'npc_amina':
      return {
        ...base,
        style: 'SMART_CASUAL',
        jacket: 0x0284c7, // Cedarline Tech Cyan / Royal Blue
        pants: 0x1e293b, // Dark navy trousers
        shoes: 0x18181b, // Professional dark footwear
        skin: 0x5c3826, // Warm Cocoa
      };

    // 5. Mama Nkechi - Merchant & Electronics Vendor: Vibrant Crimson Traditional Ankara
    case 'npc_nkechi':
      return {
        ...base,
        style: 'VIBRANT_ANKARA',
        jacket: 0x9f1239, // Rich crimson Ankara
        pants: 0x881337, // Matching Ankara wrap
        shoes: 0x451a03, // Cognac leather sandals
        skin: 0x543220, // Warm Mahogany
      };

    // 6. Uncle Segun - Community Elder & Historian: Traditional Agbada Vest
    case 'npc_segun':
      return {
        ...base,
        style: 'SMART_CASUAL',
        jacket: 0x1e3a5f, // Navy traditional vest
        pants: 0x1e293b, // Slate trousers
        shoes: 0x5c2b14, // Burnished chestnut monk-straps
        skin: 0x3d2012, // Deep Ebony Melanin
        hair: 0x9ca3af, // Silver-grey hair
      };

    // 7. Marcus Adebayo - Junior SysAdmin: Utility Windbreaker & Chinos
    case 'npc_marcus':
      return {
        ...base,
        style: 'SMART_CASUAL',
        jacket: 0x475569, // Slate utility windbreaker
        pants: 0x334155, // Grey chinos
        shoes: 0x1e293b, // Dark tech sneakers
        skin: 0x4a2a1a, // Deep Umber
      };

    // 8. Tunde "ZeroDay" Bakare - Independent Security Researcher: Modern Streetwear
    case 'npc_tunde':
      return {
        ...base,
        style: 'STREETWEAR',
        jacket: 0xd97706, // Amber hoodie
        pants: 0x18181b, // Obsidian black denim
        shoes: 0xffffff, // Crisp white street sneakers
        skin: 0x3b2219, // Dark Roast Cocoa
      };

    default:
      return base;
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
    const palette = getNpcCustomPalette(this.profile);
    applyCharacterCustomization(this.modelRoot, palette);

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
