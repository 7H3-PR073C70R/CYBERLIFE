import * as THREE from 'three';
import { AssetLoader } from '../AssetLoader';
import { PlayerCharacterGender, PLAYER_CHARACTER } from '../worldConfig';
import { CharacterPalette, applyCharacterCustomization } from './CharacterCustomizer';

export type RiggedAnimationState =
  | 'IDLE'
  | 'WALK'
  | 'RUN'
  | 'STAND_TO_SIT'
  | 'SIT_IDLE'
  | 'TYPING'
  | 'SIT_TO_STAND';

function shortestAngleDist(a: number, b: number): number {
  const max = Math.PI * 2;
  const diff = (b - a) % max;
  return ((2 * diff) % max) - diff;
}

export class RiggedHumanoidCharacter {
  private group: THREE.Group;
  private modelRoot: THREE.Group | null = null;
  private mixer: THREE.AnimationMixer | null = null;
  private actions = new Map<string, THREE.AnimationAction>();

  private currentState: RiggedAnimationState = 'IDLE';
  private currentAction: THREE.AnimationAction | null = null;

  // Rotation smoothing
  private currentYaw = 0;
  private targetYaw = 0;
  private hasSetRotation = false;

  // Timers
  private typingTimer = 0;
  private mouseTimer = 0;
  private transitionTimer = 0;
  private isSittingTarget = false;

  // First-person state & nodes
  private isFirstPerson = false;
  private headBone: THREE.Bone | null = null;
  private neckBone: THREE.Bone | null = null;
  private leftWristBone: THREE.Bone | null = null;
  private hiddenFirstPersonMeshes: THREE.Mesh[] = [];

  // Configuration
  private gender: PlayerCharacterGender;
  private palette: CharacterPalette;
  private isLoaded = false;

  constructor(
    gender: PlayerCharacterGender = PLAYER_CHARACTER,
    palette?: CharacterPalette
  ) {
    this.gender = gender;
    this.palette = palette ?? {
      skin: 0x643c28, // Warm Mahogany medium-brown skin tone
      jacket: 0x0f172a, // Obsidian Cyber Operative Jacket
      pants: 0x1e293b, // Tactical Charcoal Denim
      shoes: 0x06b6d4, // Cyber Cyan Tech Runners
      hair: 0x111111, // Short dark hair
    };
    this.group = new THREE.Group();
    this.group.name = `RiggedHumanoidCharacter_${gender}`;
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  public isReady(): boolean {
    return this.isLoaded;
  }

  public async load(): Promise<void> {
    const loader = AssetLoader.getInstance();
    const characterModelUrl =
      this.gender === 'female'
        ? '/assets/characters/player_female.glb'
        : '/assets/characters/player_male.glb';
    const animationsUrl = '/assets/characters/animations.glb';

    // 1. Load model and animations in parallel
    const [characterData, animData] = await Promise.all([
      loader.loadGLTFWithAnimations(characterModelUrl),
      loader.loadGLTFWithAnimations(animationsUrl),
    ]);

    this.modelRoot = characterData.scene;
    this.modelRoot.name = `RiggedCharacter_${this.gender}`;

    // 2. Proportions & scale (female ~1.65m, male ~1.76m)
    const scale = this.gender === 'female' ? 0.936 : 1.0;
    this.modelRoot.scale.set(scale, scale, scale);
    this.modelRoot.position.set(0, 0.02, 0); // Elevation matches sidewalk/road surface so shoes are 100% visible
    this.modelRoot.rotation.y = this.currentYaw;

    // 3. Materials, shadow casting, and first-person bone tracking
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

        const lowerName = (child.name || '').toLowerCase();
        if (
          lowerName.includes('shirt') ||
          lowerName.includes('cloth') ||
          lowerName.includes('hair') ||
          lowerName.includes('eyelash')
        ) {
          this.hiddenFirstPersonMeshes.push(child);
        }
      }

      if (child instanceof THREE.Bone || (child as THREE.Object3D).type === 'Bone') {
        const boneName = child.name;
        if (boneName === 'mixamorigHead' || boneName === 'mixamorig:Head') {
          this.headBone = child as THREE.Bone;
        } else if (boneName === 'mixamorigNeck' || boneName === 'mixamorig:Neck') {
          this.neckBone = child as THREE.Bone;
        } else if (
          boneName === 'mixamorigLeftHand' ||
          boneName === 'mixamorig:LeftHand' ||
          boneName === 'mixamorigLeftForeArm' ||
          boneName === 'mixamorig:LeftForeArm'
        ) {
          if (!this.leftWristBone || boneName.includes('Hand')) {
            this.leftWristBone = child as THREE.Bone;
          }
        }
      }
    });

    // Ensure character has hair mesh (attach procedural short dark hair if GLB has none, e.g. player_male.glb)
    let hasHairMesh = false;
    this.modelRoot.traverse(child => {
      if (child instanceof THREE.Mesh) {
        const name = (child.name || '').toLowerCase();
        if (name.includes('hair')) {
          hasHairMesh = true;
        }
      }
    });

    if (!hasHairMesh && this.headBone) {
      const hairGeo = new THREE.SphereGeometry(0.128, 18, 16, 0, Math.PI * 2, 0, Math.PI * 0.65);
      hairGeo.scale(0.98, 1.08, 1.08);
      const hairMat = new THREE.MeshStandardMaterial({
        color: this.palette.hair ?? 0x111111,
        roughness: 0.95,
        metalness: 0.05,
      });
      const hairMesh = new THREE.Mesh(hairGeo, hairMat);
      hairMesh.name = 'player_hair_mesh';
      hairMesh.position.set(0, 0.082, 0.005);
      hairMesh.castShadow = true;
      hairMesh.receiveShadow = true;
      this.headBone.add(hairMesh);
      this.hiddenFirstPersonMeshes.push(hairMesh);
    }

    // Apply authentic Nigerian skin tone & clothing customization
    applyCharacterCustomization(this.modelRoot, this.palette);

    // If Protagonist, attach custom holographic cyber comm-link to left wrist
    if (this.palette.accent && this.leftWristBone) {
      const commGroup = new THREE.Group();
      commGroup.name = 'ProtagonistCyberCommLink';

      // Titanium wristband
      const bandGeo = new THREE.CylinderGeometry(0.045, 0.048, 0.04, 16);
      const bandMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.85,
      });
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.rotation.x = Math.PI / 2;
      commGroup.add(band);

      // Emissive holographic screen ring
      const screenGeo = new THREE.CylinderGeometry(0.049, 0.049, 0.015, 16);
      const screenMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.9,
        roughness: 0.1,
      });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.rotation.x = Math.PI / 2;
      commGroup.add(screen);

      this.leftWristBone.add(commGroup);
    }

    // 4. Set up AnimationMixer and animation actions
    this.mixer = new THREE.AnimationMixer(this.modelRoot);

    for (const clip of animData.animations) {
      const action = this.mixer.clipAction(clip);
      if (clip.name === 'StandToSit' || clip.name === 'SitToStand') {
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
      } else {
        action.loop = THREE.LoopRepeat;
      }
      this.actions.set(clip.name, action);
    }

    // Default to Idle action
    const idleAction = this.actions.get('Idle');
    if (idleAction) {
      idleAction.play();
      this.currentAction = idleAction;
      this.currentState = 'IDLE';
    }

    this.group.add(this.modelRoot);
    this.applyFirstPersonState();
    this.isLoaded = true;
  }

  public setPosition(x: number, y: number, z: number): void {
    this.group.position.set(x, y, z);
  }

  public setRotation(yaw: number): void {
    this.targetYaw = yaw;
    if (!this.hasSetRotation) {
      this.hasSetRotation = true;
      this.currentYaw = yaw;
      if (this.modelRoot) {
        this.modelRoot.rotation.y = yaw;
      }
    }
  }

  public snapRotation(yaw: number): void {
    this.hasSetRotation = true;
    this.targetYaw = yaw;
    this.currentYaw = yaw;
    if (this.modelRoot) {
      this.modelRoot.rotation.y = yaw;
    }
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  public isVisible(): boolean {
    return this.group.visible;
  }

  public setFirstPerson(isFP: boolean): void {
    if (this.isFirstPerson === isFP) return;
    this.isFirstPerson = isFP;
    this.applyFirstPersonState();
  }

  public getIsFirstPerson(): boolean {
    return this.isFirstPerson;
  }

  private applyFirstPersonState(): void {
    if (!this.modelRoot) return;

    if (this.isFirstPerson) {
      // Hide head and neck by scaling down to near zero
      if (this.headBone) this.headBone.scale.set(0.0001, 0.0001, 0.0001);
      if (this.neckBone) this.neckBone.scale.set(0.0001, 0.0001, 0.0001);

      // Hide torso clothing and hair so camera does not clip
      for (const mesh of this.hiddenFirstPersonMeshes) {
        mesh.visible = false;
      }
    } else {
      if (this.headBone) this.headBone.scale.set(1, 1, 1);
      if (this.neckBone) this.neckBone.scale.set(1, 1, 1);

      for (const mesh of this.hiddenFirstPersonMeshes) {
        mesh.visible = true;
      }
    }
  }

  public setSitting(isSitting: boolean): void {
    if (this.isSittingTarget === isSitting) return;
    this.isSittingTarget = isSitting;

    if (isSitting) {
      this.transitionTo('STAND_TO_SIT');
    } else {
      this.transitionTo('SIT_TO_STAND');
    }
  }

  public isSitting(): boolean {
    return this.isSittingTarget;
  }

  public triggerTyping(): void {
    this.typingTimer = 0.35;
  }

  public triggerMouseUse(): void {
    this.mouseTimer = 0.4;
  }

  private crossFadeTo(nextClipName: string, duration = 0.25): void {
    const nextAction = this.actions.get(nextClipName);
    if (!nextAction || nextAction === this.currentAction) return;

    nextAction.reset();
    nextAction.play();

    if (this.currentAction) {
      this.currentAction.crossFadeTo(nextAction, duration, true);
    }

    this.currentAction = nextAction;
  }

  private transitionTo(newState: RiggedAnimationState): void {
    if (this.currentState === newState) return;
    this.currentState = newState;

    switch (newState) {
      case 'IDLE':
        this.crossFadeTo('Idle', 0.25);
        break;
      case 'WALK':
        this.crossFadeTo('Walk', 0.25);
        break;
      case 'RUN':
        this.crossFadeTo('Run', 0.25);
        break;
      case 'STAND_TO_SIT': {
        const action = this.actions.get('StandToSit');
        if (action) {
          action.reset();
          action.play();
          if (this.currentAction) {
            this.currentAction.crossFadeTo(action, 0.2, true);
          }
          this.currentAction = action;
          this.transitionTimer = action.getClip().duration || 2.2;
        } else {
          this.transitionTo('SIT_IDLE');
        }
        break;
      }
      case 'SIT_IDLE':
        this.crossFadeTo('SitIdle', 0.25);
        break;
      case 'TYPING':
        this.crossFadeTo('Typing', 0.2);
        break;
      case 'SIT_TO_STAND': {
        const action = this.actions.get('SitToStand');
        if (action) {
          action.reset();
          action.play();
          if (this.currentAction) {
            this.currentAction.crossFadeTo(action, 0.2, true);
          }
          this.currentAction = action;
          this.transitionTimer = action.getClip().duration || 2.25;
        } else {
          this.transitionTo('IDLE');
        }
        break;
      }
    }
  }

  public update(deltaTime: number, isMoving: boolean, speed = 1.0): void {
    const dt = Math.min(deltaTime, 0.1);

    // 1. Smooth rotation toward movement direction / target yaw (no turn clips)
    const angleDiff = shortestAngleDist(this.currentYaw, this.targetYaw);
    const turnSpeed = this.isSittingTarget ? 18.0 : 12.0;
    this.currentYaw += angleDiff * Math.min(1.0, turnSpeed * dt);
    if (this.modelRoot) {
      this.modelRoot.rotation.y = this.currentYaw;
    }

    // 2. Timers decay
    if (this.typingTimer > 0) this.typingTimer -= dt;
    if (this.mouseTimer > 0) this.mouseTimer -= dt;
    if (this.transitionTimer > 0) this.transitionTimer -= dt;

    // 3. Animation State Machine
    if (this.isSittingTarget) {
      // Seated flow
      if (this.currentState === 'STAND_TO_SIT') {
        if (this.transitionTimer <= 0) {
          this.transitionTo('SIT_IDLE');
        }
      } else if (this.currentState !== 'SIT_TO_STAND') {
        const isInteracting = this.typingTimer > 0 || this.mouseTimer > 0;
        if (isInteracting && this.currentState !== 'TYPING') {
          this.transitionTo('TYPING');
        } else if (!isInteracting && this.currentState === 'TYPING') {
          this.transitionTo('SIT_IDLE');
        }
      }
    } else {
      // Standing / Walking / Running flow
      if (this.currentState === 'SIT_TO_STAND') {
        if (this.transitionTimer <= 0) {
          this.transitionTo(isMoving ? 'WALK' : 'IDLE');
        }
      } else if (isMoving) {
        const actualMoveSpeed = speed * 6.0; // Base walkSpeed = 6.0 units/sec
        const isRunning = speed >= 1.4;

        if (isRunning) {
          if (this.currentState !== 'RUN') this.transitionTo('RUN');
          const runAction = this.actions.get('Run');
          if (runAction) {
            // Natural running cycle speed ~4.47 m/s
            runAction.timeScale = Math.max(0.6, Math.min(2.0, actualMoveSpeed / 4.47));
          }
        } else {
          if (this.currentState !== 'WALK') this.transitionTo('WALK');
          const walkAction = this.actions.get('Walk');
          if (walkAction) {
            // Natural walking cycle speed ~1.683 m/s
            walkAction.timeScale = Math.max(0.6, Math.min(2.2, actualMoveSpeed / 1.683));
          }
        }
      } else {
        if (this.currentState !== 'IDLE') {
          this.transitionTo('IDLE');
        }
      }
    }

    // 4. Update AnimationMixer
    if (this.mixer) {
      this.mixer.update(dt);
    }

    // 5. Re-apply first person bone scalings after mixer update to prevent clipping
    if (this.isFirstPerson) {
      if (this.headBone) this.headBone.scale.set(0.0001, 0.0001, 0.0001);
      if (this.neckBone) this.neckBone.scale.set(0.0001, 0.0001, 0.0001);
    }
  }

  public dispose(): void {
    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer.uncacheRoot(this.modelRoot as unknown as THREE.Object3D);
    }
    this.actions.clear();

    if (this.modelRoot) {
      this.modelRoot.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(m => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        }
      });
      if (this.modelRoot.parent) {
        this.modelRoot.parent.remove(this.modelRoot);
      }
    }

    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
