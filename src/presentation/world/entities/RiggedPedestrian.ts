import * as THREE from 'three';
import { AssetLoader } from '../AssetLoader';
import { CharacterPalette, applyCharacterCustomization } from './CharacterCustomizer';

export type PedestrianBodyType = 'male_1' | 'male_2' | 'female_1' | 'female_2';

export interface RiggedPedestrianOptions {
  bodyType: PedestrianBodyType;
  palette?: CharacterPalette;
  randomScale?: number; // 0.95 to 1.05
  speedVariation?: number; // +/- 0.08
}

export class RiggedPedestrian {
  private group: THREE.Group;
  private modelRoot: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private actions = new Map<string, THREE.AnimationAction>();
  private currentAction: THREE.AnimationAction | null = null;
  private isMoving = false;

  private bodyType: PedestrianBodyType;
  private palette?: CharacterPalette;
  private randomScale: number;
  private speedVariation: number;
  private isLoaded = false;
  private accumulatedAnimDt = 0;

  constructor(options: RiggedPedestrianOptions) {
    this.bodyType = options.bodyType;
    this.palette = options.palette;
    this.randomScale = options.randomScale ?? (0.95 + Math.random() * 0.1);
    this.speedVariation = options.speedVariation ?? (0.92 + Math.random() * 0.16);

    this.group = new THREE.Group();
    this.group.name = `RiggedPedestrian_${this.bodyType}`;
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  public isReady(): boolean {
    return this.isLoaded;
  }

  public getBodyType(): PedestrianBodyType {
    return this.bodyType;
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
    this.modelRoot.name = `PedestrianModel_${this.bodyType}`;

    // Base height scaling: female characters ~1.65m, male ~1.76m
    const isFemale = this.bodyType === 'female_1' || this.bodyType === 'female_2';
    const baseScale = isFemale ? 0.936 : 1.0;
    const finalScale = baseScale * this.randomScale;
    this.modelRoot.scale.set(finalScale, finalScale, finalScale);
    this.modelRoot.position.set(0, 0.02, 0); // Elevation matches sidewalk/road surface so shoes are 100% visible

    // Shadows and material settings
    this.modelRoot.traverse(child => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        const mat = child.material;
        if (mat instanceof THREE.MeshStandardMaterial) {
          mat.roughness = 0.85;
          mat.metalness = 0.0;
          if (mat.map) {
            mat.map.colorSpace = THREE.SRGBColorSpace;
            mat.map.anisotropy = Math.min(8, 8);
          }
          if (mat.normalMap) {
            mat.normalMap.colorSpace = THREE.NoColorSpace;
            mat.normalMap.anisotropy = Math.min(8, 8);
          }

          const meshName = (child.name || '').toLowerCase();
          const matName = (mat.name || '').toLowerCase();
          if (
            meshName.includes('hair') ||
            meshName.includes('eyelash') ||
            matName.includes('hair') ||
            matName.includes('eyelash')
          ) {
            mat.alphaTest = 0.5;
            mat.depthWrite = true;
            mat.side = THREE.DoubleSide;
            mat.transparent = false;
          }
        }
      }
    });

    // Apply authentic Nigerian skin tone & clothing customization
    if (this.palette) {
      applyCharacterCustomization(this.modelRoot, this.palette);
    }

    // Setup AnimationMixer with Idle and Walk
    this.mixer = new THREE.AnimationMixer(this.modelRoot);

    for (const clip of animData.animations) {
      if (clip.name === 'Idle' || clip.name === 'Walk') {
        const action = this.mixer.clipAction(clip);
        action.loop = THREE.LoopRepeat;
        this.actions.set(clip.name, action);
      }
    }

    const idleAction = this.actions.get('Idle');
    const walkAction = this.actions.get('Walk');

    // Desynchronize initial animation phase between pedestrians
    if (idleAction) {
      idleAction.time = Math.random() * (idleAction.getClip().duration || 2.0);
    }
    if (walkAction) {
      walkAction.time = Math.random() * (walkAction.getClip().duration || 1.0);
    }

    // Default to Walk action for pedestrians
    if (walkAction) {
      walkAction.play();
      this.currentAction = walkAction;
      this.isMoving = true;
    } else if (idleAction) {
      idleAction.play();
      this.currentAction = idleAction;
      this.isMoving = false;
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

  public setPosition(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  public setRotation(yaw: number): void {
    this.group.rotation.y = yaw;
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  public isVisible(): boolean {
    return this.group.visible;
  }

  private setMoving(moving: boolean, speed = 1.3): void {
    if (this.isMoving === moving) {
      if (moving && this.currentAction) {
        this.currentAction.timeScale = (speed / 1.683) * this.speedVariation;
      }
      return;
    }

    this.isMoving = moving;
    const nextClipName = moving ? 'Walk' : 'Idle';
    const nextAction = this.actions.get(nextClipName);
    if (!nextAction) return;

    nextAction.reset();
    if (moving) {
      nextAction.timeScale = (speed / 1.683) * this.speedVariation;
    } else {
      nextAction.timeScale = this.speedVariation;
    }
    nextAction.play();

    if (this.currentAction) {
      this.currentAction.crossFadeTo(nextAction, 0.25, true);
    }
    this.currentAction = nextAction;
  }

  public update(deltaTime: number, isMoving: boolean, speed = 1.3, updateAnimation = true): void {
    this.setMoving(isMoving, speed);

    if (updateAnimation) {
      const dt = Math.min(deltaTime + this.accumulatedAnimDt, 0.2);
      this.accumulatedAnimDt = 0;
      if (this.mixer) {
        this.mixer.update(dt);
      }
    } else {
      this.accumulatedAnimDt += deltaTime;
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
