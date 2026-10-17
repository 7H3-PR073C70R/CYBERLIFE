import * as THREE from 'three';

export interface HumanoidPalette {
  skin: number;
  hair: number;
  jacket: number;
  jacketTrim: number;
  pants: number;
  shoes: number;
  accent: number;
}

export const DEFAULT_PLAYER_PALETTE: HumanoidPalette = {
  skin: 0x5c3826, // Warm Lagos brown skin tone
  hair: 0x17120e, // Dark black hair
  jacket: 0x1e293b, // Tech navy blazer/jacket
  jacketTrim: 0x00e5ff, // Neon cyan cyber trim
  pants: 0x0f172a, // Deep slate cargo trousers
  shoes: 0xe2e8f0, // White & cyan street sneakers
  accent: 0x00e676, // Cyber green badge/accent
};

export type HumanoidAnimationState = 'IDLE' | 'WALK' | 'SEATED_IDLE' | 'TYPING' | 'MOUSE_USE';

/**
 * HumanoidCharacter: An articulated, rigged 3D human character built with Three.js.
 * Features realistic proportions, joint hierarchies (hips, spine, chest, neck, head,
 * shoulders, elbows, wrists, knees, ankles), and smooth procedural animation blending
 * for walking, breathing idle, sitting in chairs, and workstation typing/mouse interactions.
 */
export class HumanoidCharacter {
  private group: THREE.Group;

  // Joint & Body Hierarchy Nodes
  private rootNode: THREE.Group;
  private pelvisNode: THREE.Group;
  private spineNode: THREE.Group;
  private chestNode: THREE.Group;
  private neckNode: THREE.Group;
  private headNode: THREE.Group;

  // Arms
  private leftShoulder: THREE.Group;
  private leftElbow: THREE.Group;
  private leftWrist: THREE.Group;
  private rightShoulder: THREE.Group;
  private rightElbow: THREE.Group;
  private rightWrist: THREE.Group;

  // Legs
  private leftHip: THREE.Group;
  private leftKnee: THREE.Group;
  private leftAnkle: THREE.Group;
  private rightHip: THREE.Group;
  private rightKnee: THREE.Group;
  private rightAnkle: THREE.Group;

  // Shadow decal
  private shadowDecal: THREE.Mesh;

  // Animation State
  private animState: HumanoidAnimationState = 'IDLE';
  private walkPhase = 0;
  private idlePhase = 0;
  private typingTimer = 0;
  private mouseTimer = 0;
  private sitProgress = 0; // 0 = fully standing, 1 = fully seated
  private targetSit = 0;

  private isFirstPerson = false;
  private palette: HumanoidPalette;

  constructor(palette: Partial<HumanoidPalette> = {}) {
    this.palette = { ...DEFAULT_PLAYER_PALETTE, ...palette };
    this.group = new THREE.Group();
    this.group.name = 'HumanoidCharacter';

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({
      color: this.palette.skin,
      roughness: 0.8,
      metalness: 0.05,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: this.palette.hair,
      roughness: 0.9,
    });
    const jacketMat = new THREE.MeshStandardMaterial({
      color: this.palette.jacket,
      roughness: 0.6,
      metalness: 0.2,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: this.palette.jacketTrim,
      roughness: 0.3,
      metalness: 0.5,
      emissive: this.palette.jacketTrim,
      emissiveIntensity: 0.3,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: this.palette.pants,
      roughness: 0.7,
      metalness: 0.1,
    });
    const shoesMat = new THREE.MeshStandardMaterial({
      color: this.palette.shoes,
      roughness: 0.5,
      metalness: 0.2,
    });

    // 1. Root & Pelvis
    this.rootNode = new THREE.Group();
    this.group.add(this.rootNode);

    this.pelvisNode = new THREE.Group();
    this.pelvisNode.position.y = 0.92; // Pelvis height ~0.92m
    this.rootNode.add(this.pelvisNode);

    // Pelvis mesh (hips)
    const pelvisGeo = new THREE.BoxGeometry(0.32, 0.16, 0.22);
    const pelvisMesh = new THREE.Mesh(pelvisGeo, pantsMat);
    pelvisMesh.castShadow = true;
    pelvisMesh.receiveShadow = true;
    this.pelvisNode.add(pelvisMesh);

    // 2. Spine & Torso
    this.spineNode = new THREE.Group();
    this.spineNode.position.y = 0.08;
    this.pelvisNode.add(this.spineNode);

    const waistGeo = new THREE.CylinderGeometry(0.14, 0.16, 0.14, 12);
    const waistMesh = new THREE.Mesh(waistGeo, jacketMat);
    waistMesh.position.y = 0.07;
    waistMesh.castShadow = true;
    this.spineNode.add(waistMesh);

    this.chestNode = new THREE.Group();
    this.chestNode.position.y = 0.14;
    this.spineNode.add(this.chestNode);

    // Torso / Jacket Chest
    const chestGeo = new THREE.BoxGeometry(0.36, 0.3, 0.24);
    const chestMesh = new THREE.Mesh(chestGeo, jacketMat);
    chestMesh.position.y = 0.15;
    chestMesh.castShadow = true;
    this.chestNode.add(chestMesh);

    // Cyber jacket trim stripe on chest
    const chestTrimGeo = new THREE.BoxGeometry(0.04, 0.31, 0.245);
    const chestTrimMesh = new THREE.Mesh(chestTrimGeo, trimMat);
    chestTrimMesh.position.set(0.08, 0.15, 0);
    this.chestNode.add(chestTrimMesh);

    // Collar
    const collarGeo = new THREE.CylinderGeometry(0.12, 0.13, 0.08, 12);
    const collarMesh = new THREE.Mesh(collarGeo, jacketMat);
    collarMesh.position.y = 0.32;
    this.chestNode.add(collarMesh);

    // 3. Neck & Head
    this.neckNode = new THREE.Group();
    this.neckNode.position.y = 0.34;
    this.chestNode.add(this.neckNode);

    const neckGeo = new THREE.CylinderGeometry(0.06, 0.07, 0.08, 12);
    const neckMesh = new THREE.Mesh(neckGeo, skinMat);
    neckMesh.position.y = 0.04;
    this.neckNode.add(neckMesh);

    this.headNode = new THREE.Group();
    this.headNode.position.y = 0.08;
    this.neckNode.add(this.headNode);

    // Realistic head shape
    const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
    headGeo.scale(0.9, 1.15, 1.0);
    const headMesh = new THREE.Mesh(headGeo, skinMat);
    headMesh.position.y = 0.12;
    headMesh.castShadow = true;
    this.headNode.add(headMesh);

    // Hair / Afro-fade hairstyle
    const hairGeo = new THREE.SphereGeometry(0.124, 16, 16);
    hairGeo.scale(0.92, 0.95, 1.05);
    const hairMesh = new THREE.Mesh(hairGeo, hairMat);
    hairMesh.position.set(0, 0.16, -0.01);
    this.headNode.add(hairMesh);

    // Smart Cyber Earpiece / Sleek HUD Visor Glasses
    const earpieceGeo = new THREE.BoxGeometry(0.24, 0.03, 0.12);
    const earpieceMesh = new THREE.Mesh(earpieceGeo, trimMat);
    earpieceMesh.position.set(0, 0.13, 0.06);
    this.headNode.add(earpieceMesh);

    // 4. Arms & Hands (Left)
    this.leftShoulder = new THREE.Group();
    this.leftShoulder.position.set(-0.21, 0.26, 0);
    this.chestNode.add(this.leftShoulder);

    const lUpperArmGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.26, 10);
    const lUpperArmMesh = new THREE.Mesh(lUpperArmGeo, jacketMat);
    lUpperArmMesh.position.y = -0.13;
    lUpperArmMesh.castShadow = true;
    this.leftShoulder.add(lUpperArmMesh);

    this.leftElbow = new THREE.Group();
    this.leftElbow.position.y = -0.26;
    this.leftShoulder.add(this.leftElbow);

    const lForearmGeo = new THREE.CylinderGeometry(0.046, 0.04, 0.24, 10);
    const lForearmMesh = new THREE.Mesh(lForearmGeo, jacketMat);
    lForearmMesh.position.y = -0.12;
    lForearmMesh.castShadow = true;
    this.leftElbow.add(lForearmMesh);

    this.leftWrist = new THREE.Group();
    this.leftWrist.position.y = -0.24;
    this.leftElbow.add(this.leftWrist);

    const lHandGeo = new THREE.BoxGeometry(0.04, 0.08, 0.08);
    const lHandMesh = new THREE.Mesh(lHandGeo, skinMat);
    lHandMesh.position.y = -0.04;
    this.leftWrist.add(lHandMesh);

    // 5. Arms & Hands (Right)
    this.rightShoulder = new THREE.Group();
    this.rightShoulder.position.set(0.21, 0.26, 0);
    this.chestNode.add(this.rightShoulder);

    const rUpperArmGeo = new THREE.CylinderGeometry(0.055, 0.048, 0.26, 10);
    const rUpperArmMesh = new THREE.Mesh(rUpperArmGeo, jacketMat);
    rUpperArmMesh.position.y = -0.13;
    rUpperArmMesh.castShadow = true;
    this.rightShoulder.add(rUpperArmMesh);

    this.rightElbow = new THREE.Group();
    this.rightElbow.position.y = -0.26;
    this.rightShoulder.add(this.rightElbow);

    const rForearmGeo = new THREE.CylinderGeometry(0.046, 0.04, 0.24, 10);
    const rForearmMesh = new THREE.Mesh(rForearmGeo, jacketMat);
    rForearmMesh.position.y = -0.12;
    rForearmMesh.castShadow = true;
    this.rightElbow.add(rForearmMesh);

    this.rightWrist = new THREE.Group();
    this.rightWrist.position.y = -0.24;
    this.rightElbow.add(this.rightWrist);

    const rHandGeo = new THREE.BoxGeometry(0.04, 0.08, 0.08);
    const rHandMesh = new THREE.Mesh(rHandGeo, skinMat);
    rHandMesh.position.y = -0.04;
    this.rightWrist.add(rHandMesh);

    // 6. Legs & Feet (Left)
    this.leftHip = new THREE.Group();
    this.leftHip.position.set(-0.11, -0.06, 0);
    this.pelvisNode.add(this.leftHip);

    const lThighGeo = new THREE.CylinderGeometry(0.075, 0.06, 0.38, 10);
    const lThighMesh = new THREE.Mesh(lThighGeo, pantsMat);
    lThighMesh.position.y = -0.19;
    lThighMesh.castShadow = true;
    this.leftHip.add(lThighMesh);

    this.leftKnee = new THREE.Group();
    this.leftKnee.position.y = -0.38;
    this.leftHip.add(this.leftKnee);

    const lShinGeo = new THREE.CylinderGeometry(0.058, 0.05, 0.38, 10);
    const lShinMesh = new THREE.Mesh(lShinGeo, pantsMat);
    lShinMesh.position.y = -0.19;
    lShinMesh.castShadow = true;
    this.leftKnee.add(lShinMesh);

    this.leftAnkle = new THREE.Group();
    this.leftAnkle.position.y = -0.38;
    this.leftKnee.add(this.leftAnkle);

    const lFootGeo = new THREE.BoxGeometry(0.09, 0.09, 0.2);
    const lFootMesh = new THREE.Mesh(lFootGeo, shoesMat);
    lFootMesh.position.set(0, -0.045, 0.04);
    lFootMesh.castShadow = true;
    this.leftAnkle.add(lFootMesh);

    // 7. Legs & Feet (Right)
    this.rightHip = new THREE.Group();
    this.rightHip.position.set(0.11, -0.06, 0);
    this.pelvisNode.add(this.rightHip);

    const rThighGeo = new THREE.CylinderGeometry(0.075, 0.06, 0.38, 10);
    const rThighMesh = new THREE.Mesh(rThighGeo, pantsMat);
    rThighMesh.position.y = -0.19;
    rThighMesh.castShadow = true;
    this.rightHip.add(rThighMesh);

    this.rightKnee = new THREE.Group();
    this.rightKnee.position.y = -0.38;
    this.rightHip.add(this.rightKnee);

    const rShinGeo = new THREE.CylinderGeometry(0.058, 0.05, 0.38, 10);
    const rShinMesh = new THREE.Mesh(rShinGeo, pantsMat);
    rShinMesh.position.y = -0.19;
    rShinMesh.castShadow = true;
    this.rightKnee.add(rShinMesh);

    this.rightAnkle = new THREE.Group();
    this.rightAnkle.position.y = -0.38;
    this.rightKnee.add(this.rightAnkle);

    const rFootGeo = new THREE.BoxGeometry(0.09, 0.09, 0.2);
    const rFootMesh = new THREE.Mesh(rFootGeo, shoesMat);
    rFootMesh.position.set(0, -0.045, 0.04);
    rFootMesh.castShadow = true;
    this.rightAnkle.add(rFootMesh);

    // 8. Soft Ground Shadow Decal
    const shadowGeo = new THREE.RingGeometry(0.05, 0.42, 24);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    this.shadowDecal = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowDecal.rotation.x = -Math.PI / 2;
    this.shadowDecal.position.y = 0.02;
    this.group.add(this.shadowDecal);
  }

  public getMesh(): THREE.Group {
    return this.group;
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

  public setFirstPerson(isFP: boolean): void {
    this.isFirstPerson = isFP;
    if (this.targetSit === 0) {
      // In first person exploration, hide avatar so camera doesn't clip
      this.group.visible = !isFP;
    } else {
      // In workstation mode, avatar visibility is managed by camera controller
      this.group.visible = !isFP;
    }
  }

  public getIsFirstPerson(): boolean {
    return this.isFirstPerson;
  }

  public setSitting(isSitting: boolean): void {
    this.targetSit = isSitting ? 1 : 0;
    if (isSitting) {
      this.animState = 'SEATED_IDLE';
    } else {
      this.animState = 'IDLE';
    }
  }

  public isSitting(): boolean {
    return this.targetSit > 0.5;
  }

  public triggerTyping(): void {
    this.typingTimer = 0.35; // keep typing active for 350ms
    if (this.isSitting()) {
      this.animState = 'TYPING';
    }
  }

  public triggerMouseUse(): void {
    this.mouseTimer = 0.4;
    if (this.isSitting()) {
      this.animState = 'MOUSE_USE';
    }
  }

  /**
   * Main per-frame animation update. Smoothly blends joint rotations based on movement
   * and workstation interaction states.
   */
  public update(deltaTime: number, isMoving: boolean, speed = 1.0): void {
    // 1. Smooth sitting transition blending (approx 350ms transition)
    const sitSpeed = 3.2 * deltaTime;
    if (this.sitProgress < this.targetSit) {
      this.sitProgress = Math.min(this.targetSit, this.sitProgress + sitSpeed);
    } else if (this.sitProgress > this.targetSit) {
      this.sitProgress = Math.max(this.targetSit, this.sitProgress - sitSpeed);
    }

    // Sitting Progress factor: s = 0 (standing), s = 1 (seated)
    const s = this.sitProgress;

    // 2. Timers decay
    if (this.typingTimer > 0) {
      this.typingTimer -= deltaTime;
      if (this.typingTimer <= 0 && this.isSitting()) {
        this.animState = 'SEATED_IDLE';
      }
    }
    if (this.mouseTimer > 0) {
      this.mouseTimer -= deltaTime;
      if (this.mouseTimer <= 0 && this.isSitting() && this.typingTimer <= 0) {
        this.animState = 'SEATED_IDLE';
      }
    }

    // 3. Idle breathing / posture
    this.idlePhase += deltaTime * 2.0;
    const breathe = Math.sin(this.idlePhase) * 0.015;
    this.chestNode.position.y = 0.14 + breathe;
    this.spineNode.rotation.x = Math.sin(this.idlePhase * 0.8) * 0.02;

    if (s > 0.01) {
      // ------------------------------------------------------------------
      // SEATED / WORKSTATION POSE
      // ------------------------------------------------------------------
      // Lower pelvis to chair height (~0.52m when seated)
      this.pelvisNode.position.y = THREE.MathUtils.lerp(0.92, 0.54, s);
      this.pelvisNode.position.z = THREE.MathUtils.lerp(0, -0.08, s);

      // Thighs bend 90 degrees forward (-PI/2)
      this.leftHip.rotation.x = THREE.MathUtils.lerp(0, -Math.PI / 2 + 0.08, s);
      this.rightHip.rotation.x = THREE.MathUtils.lerp(0, -Math.PI / 2 + 0.08, s);

      // Knees bend 90 degrees backward (+PI/2)
      this.leftKnee.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 2 - 0.05, s);
      this.rightKnee.rotation.x = THREE.MathUtils.lerp(0, Math.PI / 2 - 0.05, s);

      // Feet flat
      this.leftAnkle.rotation.x = THREE.MathUtils.lerp(0, -0.05, s);
      this.rightAnkle.rotation.x = THREE.MathUtils.lerp(0, -0.05, s);

      // Torso slight forward lean toward screen
      this.spineNode.rotation.x = THREE.MathUtils.lerp(0, 0.12, s);
      this.headNode.rotation.x = THREE.MathUtils.lerp(0, 0.18, s); // looking down at laptop screen

      // Base arm posture for desk (reaching forward onto desk)
      // Base shoulder forward pitch
      const baseShoulderPitch = -0.55;
      const baseElbowBend = 0.95;

      if (this.animState === 'TYPING' || this.typingTimer > 0) {
        // Typing: Rapid subtle key tapping motions
        const tapSpeed = 24.0;
        const leftTap = Math.sin(this.idlePhase * tapSpeed) * 0.12;
        const rightTap = Math.cos(this.idlePhase * tapSpeed + 1.2) * 0.12;

        this.leftShoulder.rotation.x = baseShoulderPitch + leftTap * 0.5;
        this.leftShoulder.rotation.z = -0.25;
        this.leftElbow.rotation.x = baseElbowBend + leftTap;
        this.leftWrist.rotation.x = -0.3 + leftTap * 0.8;

        this.rightShoulder.rotation.x = baseShoulderPitch + rightTap * 0.5;
        this.rightShoulder.rotation.z = 0.25;
        this.rightElbow.rotation.x = baseElbowBend + rightTap;
        this.rightWrist.rotation.x = -0.3 + rightTap * 0.8;
      } else if (this.animState === 'MOUSE_USE' || this.mouseTimer > 0) {
        // Left hand resting on keyboard / spacebar
        this.leftShoulder.rotation.x = baseShoulderPitch;
        this.leftShoulder.rotation.z = -0.22;
        this.leftElbow.rotation.x = baseElbowBend;
        this.leftWrist.rotation.x = -0.25;

        // Right hand subtly moving mouse on mousepad
        const mouseX = Math.sin(this.idlePhase * 6.0) * 0.08;
        const mouseZ = Math.cos(this.idlePhase * 4.5) * 0.06;

        this.rightShoulder.rotation.x = baseShoulderPitch + mouseZ;
        this.rightShoulder.rotation.y = mouseX * 0.4;
        this.rightShoulder.rotation.z = 0.35;
        this.rightElbow.rotation.x = baseElbowBend + mouseZ * 0.8;
        this.rightWrist.rotation.y = mouseX;
        this.rightWrist.rotation.x = -0.28;
      } else {
        // Seated idle: both hands resting comfortably on desk / keyboard well
        this.leftShoulder.rotation.x = baseShoulderPitch;
        this.leftShoulder.rotation.z = -0.2;
        this.leftElbow.rotation.x = baseElbowBend;
        this.leftWrist.rotation.x = -0.22;

        this.rightShoulder.rotation.x = baseShoulderPitch;
        this.rightShoulder.rotation.z = 0.28;
        this.rightElbow.rotation.x = baseElbowBend;
        this.rightWrist.rotation.x = -0.22;
      }
    } else {
      // ------------------------------------------------------------------
      // STANDING / WALKING POSE
      // ------------------------------------------------------------------
      this.pelvisNode.position.y = 0.92;
      this.pelvisNode.position.z = 0;

      if (isMoving) {
        this.walkPhase += deltaTime * 8.5 * speed;

        const legSwing = Math.sin(this.walkPhase) * 0.65;
        const armSwing = Math.sin(this.walkPhase) * 0.55;
        const bob = Math.abs(Math.cos(this.walkPhase)) * 0.04;

        // Pelvis bobbing & subtle sway
        this.pelvisNode.position.y = 0.92 + bob;
        this.pelvisNode.rotation.y = Math.sin(this.walkPhase) * 0.08;
        this.chestNode.rotation.y = -Math.sin(this.walkPhase) * 0.08;

        // Legs: alternating swing
        this.leftHip.rotation.x = legSwing;
        this.rightHip.rotation.x = -legSwing;

        // Knees bend when swinging backward
        this.leftKnee.rotation.x = legSwing < 0 ? Math.abs(legSwing) * 0.85 : 0.08;
        this.rightKnee.rotation.x = legSwing > 0 ? Math.abs(legSwing) * 0.85 : 0.08;

        // Arms: counter-swing with natural slight elbow bend
        this.leftShoulder.rotation.x = -armSwing * 0.8;
        this.leftShoulder.rotation.z = -0.1;
        this.leftElbow.rotation.x = 0.35 + (armSwing > 0 ? armSwing * 0.4 : 0);

        this.rightShoulder.rotation.x = armSwing * 0.8;
        this.rightShoulder.rotation.z = 0.1;
        this.rightElbow.rotation.x = 0.35 + (armSwing < 0 ? -armSwing * 0.4 : 0);

        this.leftWrist.rotation.set(0, 0, 0);
        this.rightWrist.rotation.set(0, 0, 0);
        this.headNode.rotation.x = 0;
      } else {
        // Standing Idle: relaxed arms at sides, subtle natural resting angle
        this.pelvisNode.rotation.set(0, 0, 0);
        this.chestNode.rotation.set(0, 0, 0);

        this.leftHip.rotation.set(0, 0, -0.04);
        this.rightHip.rotation.set(0, 0, 0.04);
        this.leftKnee.rotation.set(0.04, 0, 0);
        this.rightKnee.rotation.set(0.04, 0, 0);
        this.leftAnkle.rotation.set(0, 0, 0);
        this.rightAnkle.rotation.set(0, 0, 0);

        const idleArmSway = Math.sin(this.idlePhase * 1.5) * 0.03;
        this.leftShoulder.rotation.set(idleArmSway, 0, -0.08);
        this.leftElbow.rotation.set(0.12, 0, 0);
        this.leftWrist.rotation.set(0, 0, 0);

        this.rightShoulder.rotation.set(-idleArmSway, 0, 0.08);
        this.rightElbow.rotation.set(0.12, 0, 0);
        this.rightWrist.rotation.set(0, 0, 0);
        this.headNode.rotation.set(0, 0, 0);
      }
    }
  }

  public dispose(): void {
    this.group.traverse(obj => {
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
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
