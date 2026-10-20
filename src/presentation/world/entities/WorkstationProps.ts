import * as THREE from 'three';
import { ScreenRenderer, ScreenDesktopState } from '../ScreenRenderer';
import { AssetLoader } from '../AssetLoader';
import {
  loadWorkstationAnchorsFromObject,
  WorkstationAnchorSet,
  DEFAULT_WORKSTATION_ANCHORS,
} from '../WorkstationAnchors';

export interface WorkstationOptions {
  isCedarline?: boolean;
  accentColor?: number;
  onLoaded?: (anchors: WorkstationAnchorSet) => void;
}

export class WorkstationProps {
  private group: THREE.Group;
  private proceduralChildren: THREE.Object3D[] = [];
  private glbChildren: THREE.Object3D[] = [];
  private screenRenderer: ScreenRenderer;
  private screenMesh: THREE.Mesh | null = null;
  private screenGlowLight: THREE.PointLight | null = null;

  // First-person hands rig (visible during first-person workstation mode)
  private fpHandsGroup: THREE.Group;
  private fpLeftArm!: THREE.Group;
  private fpRightArm!: THREE.Group;
  private fpLeftHand!: THREE.Mesh;
  private fpRightHand!: THREE.Mesh;

  private typingTimer = 0;
  private mouseTimer = 0;
  private timePhase = 0;

  private isLoaded = false;
  private isUsingGLB = false;
  private options: WorkstationOptions;
  private loadPromise: Promise<boolean>;
  private cyberDeskProps: THREE.Group | null = null;

  constructor(options: WorkstationOptions = {}) {
    this.options = options;
    const isCedarline = options.isCedarline ?? true;
    const accentColor = options.accentColor ?? (isCedarline ? 0x00e5ff : 0x00e676);

    this.group = new THREE.Group();
    this.group.name = 'PhysicalWorkstation';

    // 1. Initialize ScreenRenderer
    this.screenRenderer = new ScreenRenderer({ accentColor });

    // 2. Build procedural fallback geometry (immediate, synchronous)
    this.buildProceduralFallback(isCedarline, accentColor);

    // 3. Build First-Person Hands Rig
    this.fpHandsGroup = this.buildFirstPersonHands();
    this.group.add(this.fpHandsGroup);

    // 4. Asynchronously load the optimized PBR GLBs
    this.loadPromise = this.loadGLBAssets(accentColor);
  }

  private async loadGLBAssets(accentColor: number): Promise<boolean> {
    try {
      const loader = AssetLoader.getInstance();
      const [desk, chair, computer, propsDesk] = await Promise.all([
        loader.loadGLTF('/assets/props/desk.glb'),
        loader.loadGLTF('/assets/props/chair.glb'),
        loader.loadGLTF('/assets/props/computer.glb'),
        loader.loadGLTF('/assets/props/props_desk.glb'),
      ]);

      desk.name = 'Desk_Asset';
      desk.position.set(0, 0, -3.4);

      chair.name = 'Chair_Asset';
      chair.position.set(0, 0, -2.85);

      computer.name = 'Computer_Asset';
      computer.position.set(0, 0.7875, -3.32);

      propsDesk.name = 'PropsDesk_Asset';
      propsDesk.position.set(0, 0.7875, -3.32);

      // Wire ScreenRenderer material to SCREEN_QUAD in loaded computer GLB
      let loadedScreenMesh: THREE.Mesh | null = null;
      computer.traverse(child => {
        if (child instanceof THREE.Mesh) {
          if (Array.isArray(child.material)) {
            const screenIdx = child.material.findIndex(
              m =>
                m &&
                'name' in m &&
                (m.name === 'classic_laptop_screen' || m.name.toLowerCase().includes('screen'))
            );
            if (screenIdx !== -1) {
              child.material[screenIdx] = this.screenRenderer.getMaterial();
              child.material = [...child.material];
              loadedScreenMesh = child;
              child.name = 'SCREEN_QUAD';
              child.userData = { width: 0.448, height: 0.366 };
            }
          } else if (
            child.name === 'SCREEN_QUAD' ||
            child.name.toLowerCase().includes('screen') ||
            (child.material &&
              'name' in child.material &&
              child.material.name === 'classic_laptop_screen')
          ) {
            loadedScreenMesh = child;
            child.name = 'SCREEN_QUAD';
            child.material = this.screenRenderer.getMaterial();
            child.userData = { width: 0.448, height: 0.366 };
          }
        }
      });

      let screenMesh: THREE.Mesh;
      if (loadedScreenMesh !== null) {
        const found = loadedScreenMesh as THREE.Mesh;
        found.geometry.dispose();
        // The laptop screen mesh local space has width 2.0 and height 1.635
        found.geometry = new THREE.PlaneGeometry(2.0, 1.635);
        found.material = this.screenRenderer.getMaterial();
        found.position.z += 0.002;
        found.userData = { width: 0.448, height: 0.366 };
        screenMesh = found;
      } else {
        const screenGeo = new THREE.PlaneGeometry(0.38, 0.24);
        screenMesh = new THREE.Mesh(screenGeo, this.screenRenderer.getMaterial());
        screenMesh.name = 'SCREEN_QUAD';
        screenMesh.userData = { width: 0.38, height: 0.24 };
        screenMesh.position.set(0, 0.7875 + 0.33, -3.32 - 0.207);
        this.group.add(screenMesh);
        this.glbChildren.push(screenMesh);
      }

      this.screenMesh = screenMesh;
      this.screenGlowLight = new THREE.PointLight(accentColor, 0.4, 1.4);
      this.screenGlowLight.position.set(0, 0.7875 + 0.33, -3.32 - 0.207 + 0.28);
      this.group.add(this.screenGlowLight);
      this.glbChildren.push(this.screenGlowLight);

      // Force initial render of the desktop texture
      this.screenRenderer.update(0.016);

      // Scale material envMapIntensity on desk and computer props to prevent specular clipping
      [desk, chair, computer, propsDesk].forEach(group => {
        group.traverse(child => {
          if (child instanceof THREE.Mesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach(mat => {
              if ('envMapIntensity' in mat) {
                mat.envMapIntensity = 0.25;
              }
            });
          }
        });
      });

      // Remove procedural fallback and attach loaded GLBs
      this.proceduralChildren.forEach(child => this.group.remove(child));
      this.proceduralChildren = [];

      this.group.add(desk);
      this.group.add(chair);
      this.group.add(computer);
      this.group.add(propsDesk);

      this.cyberDeskProps = this.buildCybersecurityDeskProps(this.group);
      this.glbChildren = [desk, chair, computer, propsDesk, this.cyberDeskProps];

      this.isUsingGLB = true;
      this.isLoaded = true;

      // Extract anchors from loaded object
      const anchors = loadWorkstationAnchorsFromObject(this.group);
      this.options.onLoaded?.(anchors);

      return true;
    } catch (err) {
      console.warn(
        '[WorkstationProps] GLB loading failed or offline, using procedural fallback:',
        err
      );
      this.isLoaded = true;
      this.isUsingGLB = false;
      this.options.onLoaded?.(DEFAULT_WORKSTATION_ANCHORS);
      return false;
    }
  }

  private buildProceduralFallback(_isCedarline: boolean, accentColor: number): void {
    const deskTopMat = new THREE.MeshStandardMaterial({
      color: 0x1b2430,
      roughness: 0.45,
      metalness: 0.15,
    });
    const deskSteelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.8,
    });
    const laptopChassisMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.35,
      metalness: 0.85,
    });
    const chairFabricMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.85,
      metalness: 0.1,
    });
    const chairChromeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.2,
      metalness: 0.9,
    });

    // Desk
    const deskGroup = new THREE.Group();
    deskGroup.position.set(0, 0, -3.4);
    this.group.add(deskGroup);
    this.proceduralChildren.push(deskGroup);

    const topMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.045, 0.95), deskTopMat);
    topMesh.position.y = 0.765;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    deskGroup.add(topMesh);

    // Chair
    const chairGroup = new THREE.Group();
    chairGroup.name = 'SEAT_ANCHOR';
    chairGroup.position.set(0, 0, -2.85);
    this.group.add(chairGroup);
    this.proceduralChildren.push(chairGroup);

    const seatMesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.48), chairFabricMat);
    seatMesh.position.set(0, 0.48, 0);
    chairGroup.add(seatMesh);

    const baseCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12),
      chairChromeMat
    );
    baseCenter.position.y = 0.12;
    chairGroup.add(baseCenter);

    // Laptop & Fallback Screen
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0, 0.7875, -3.32);
    this.group.add(laptopGroup);
    this.proceduralChildren.push(laptopGroup);

    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.015, 0.26), laptopChassisMat);
    baseMesh.position.set(0, 0.0075, 0);
    laptopGroup.add(baseMesh);

    const wellMesh = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.004, 0.13), deskSteelMat);
    wellMesh.name = 'KEYBOARD_ANCHOR';
    wellMesh.position.set(0, 0.015, -0.035);
    laptopGroup.add(wellMesh);

    const screenGeo = new THREE.PlaneGeometry(0.36, 0.23);
    this.screenMesh = new THREE.Mesh(screenGeo, this.screenRenderer.getMaterial());
    this.screenMesh.name = 'SCREEN_QUAD';
    this.screenMesh.userData = { width: 0.36, height: 0.23 };
    this.screenMesh.position.set(0, 0.18, -0.12);
    laptopGroup.add(this.screenMesh);

    this.screenGlowLight = new THREE.PointLight(accentColor, 0.45, 1.2);
    this.screenGlowLight.position.set(0, 0.18, 0.05);
    laptopGroup.add(this.screenGlowLight);

    // Mouse
    const mouseGroup = new THREE.Group();
    mouseGroup.name = 'MOUSE_ANCHOR';
    mouseGroup.position.set(0.28, 0.7875, -3.32);
    this.group.add(mouseGroup);
    this.proceduralChildren.push(mouseGroup);

    const mouseBody = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.025, 0.11), laptopChassisMat);
    mouseBody.position.y = 0.0125;
    mouseGroup.add(mouseBody);

    // Attach cybersecurity equipment to desk surface
    this.cyberDeskProps = this.buildCybersecurityDeskProps(this.group);
    this.proceduralChildren.push(this.cyberDeskProps);
  }

  private buildCybersecurityDeskProps(parent: THREE.Group): THREE.Group {
    const group = new THREE.Group();
    group.name = 'CybersecurityDeskProps';

    const plasticMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
      metalness: 0.2,
    });
    const keyMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.6,
      metalness: 0.1,
    });
    const lcdScreenMat = new THREE.MeshStandardMaterial({
      color: 0x064e3b, // Dark LCD green
      emissive: 0x059669,
      emissiveIntensity: 0.35,
      roughness: 0.2,
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.95,
      roughness: 0.2,
    });
    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.7,
      metalness: 0.3,
    });
    const notebookMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      roughness: 0.65,
      metalness: 0.1,
    });
    const paperMat = new THREE.MeshStandardMaterial({
      color: 0xfef08a,
      roughness: 0.8,
    });
    const cyanNoteMat = new THREE.MeshStandardMaterial({
      color: 0x67e8f9,
      roughness: 0.8,
    });
    const ssdBumperMat = new THREE.MeshStandardMaterial({
      color: 0xf97316, // Orange rugged bumper
      roughness: 0.7,
      metalness: 0.1,
    });
    const mugMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.1,
    });

    const deskY = 0.7875;

    // 1. Programmer / Scientific Calculator with LCD display
    const calcGroup = new THREE.Group();
    calcGroup.position.set(-0.38, deskY, -3.2);
    calcGroup.rotation.y = 0.12;

    const calcChassis = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.016, 0.18), plasticMat);
    calcChassis.position.y = 0.008;
    calcChassis.castShadow = true;
    calcChassis.receiveShadow = true;
    calcGroup.add(calcChassis);

    // Calculator LCD display (tilted slightly)
    const calcLcd = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.004, 0.035), lcdScreenMat);
    calcLcd.position.set(0, 0.017, -0.055);
    calcGroup.add(calcLcd);

    // Calculator Keypad (4x4 matrix of small keys)
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const keyMesh = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.004, 0.015), keyMat);
        keyMesh.position.set(-0.032 + c * 0.021, 0.017, -0.015 + r * 0.024);
        calcGroup.add(keyMesh);
      }
    }
    group.add(calcGroup);

    // 2. Hardware Security Key (YubiKey 5 NFC / FIDO2 Token)
    const yubikeyGroup = new THREE.Group();
    yubikeyGroup.position.set(-0.21, deskY, -3.14);
    yubikeyGroup.rotation.y = -0.25;

    const yubikeyBody = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.003, 0.042), plasticMat);
    yubikeyBody.position.y = 0.0015;
    yubikeyGroup.add(yubikeyBody);

    const goldContact = new THREE.Mesh(
      new THREE.CylinderGeometry(0.004, 0.004, 0.004, 10),
      goldMat
    );
    goldContact.position.set(0, 0.002, 0.004);
    yubikeyGroup.add(goldContact);

    const keyRing = new THREE.Mesh(new THREE.TorusGeometry(0.003, 0.001, 6, 12), goldMat);
    keyRing.rotation.x = Math.PI / 2;
    keyRing.position.set(0, 0.002, 0.019);
    yubikeyGroup.add(keyRing);
    group.add(yubikeyGroup);

    // 3. ALFA Long-Range USB Penetration Testing Adapter (AWUS036ACH dual antenna)
    const alfaGroup = new THREE.Group();
    alfaGroup.position.set(0.42, deskY, -3.28);
    alfaGroup.rotation.y = -0.15;

    const alfaBody = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.016, 0.055), plasticMat);
    alfaBody.position.y = 0.008;
    alfaBody.castShadow = true;
    alfaBody.receiveShadow = true;
    alfaGroup.add(alfaBody);

    // Cyan activity LED
    const alfaLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.003, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0x06b6d4 })
    );
    alfaLed.position.set(0, 0.017, 0.015);
    alfaGroup.add(alfaLed);

    // Dual High-Gain Articulated Antennas
    [-0.024, 0.024].forEach((ax, idx) => {
      const antBase = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, 0.016, 8),
        antennaMat
      );
      antBase.position.set(ax, 0.016, -0.026);
      alfaGroup.add(antBase);

      const antRod = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.002, 0.14, 8), antennaMat);
      antRod.position.set(ax + (idx === 0 ? -0.025 : 0.025), 0.08, -0.035);
      antRod.rotation.z = idx === 0 ? 0.35 : -0.35;
      antRod.rotation.x = -0.2;
      antRod.castShadow = true;
      alfaGroup.add(antRod);
    });
    group.add(alfaGroup);

    // 4. Forensic Incident Response Notebook & Pen
    const notebookGroup = new THREE.Group();
    notebookGroup.position.set(0.38, deskY, -3.05);
    notebookGroup.rotation.y = 0.08;

    const notebook = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.012, 0.2), notebookMat);
    notebook.position.y = 0.006;
    notebook.castShadow = true;
    notebook.receiveShadow = true;
    notebookGroup.add(notebook);

    // Paper edge trim
    const paperEdge = new THREE.Mesh(
      new THREE.BoxGeometry(0.134, 0.009, 0.008),
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9 })
    );
    paperEdge.position.set(0, 0.006, 0.098);
    notebookGroup.add(paperEdge);

    // Metal Ballpoint Pen lying across notebook
    const pen = new THREE.Mesh(
      new THREE.CylinderGeometry(0.003, 0.003, 0.14, 8),
      new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8, roughness: 0.3 })
    );
    pen.rotation.z = Math.PI / 2.3;
    pen.position.set(0.01, 0.015, -0.02);
    pen.castShadow = true;
    notebookGroup.add(pen);
    group.add(notebookGroup);

    // 5. Ruggedized Encrypted External SSD (Orange & Black Bumper)
    const ssdGroup = new THREE.Group();
    ssdGroup.position.set(-0.36, deskY, -3.02);
    ssdGroup.rotation.y = -0.18;

    const ssdCore = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.095), plasticMat);
    ssdCore.position.y = 0.006;
    ssdCore.castShadow = true;
    ssdGroup.add(ssdCore);

    const ssdBumper = new THREE.Mesh(new THREE.BoxGeometry(0.066, 0.014, 0.102), ssdBumperMat);
    ssdBumper.position.y = 0.006;
    ssdGroup.add(ssdBumper);

    const ssdLed = new THREE.Mesh(
      new THREE.SphereGeometry(0.002, 6, 6),
      new THREE.MeshBasicMaterial({ color: 0x10b981 })
    );
    ssdLed.position.set(0.02, 0.014, 0.04);
    ssdGroup.add(ssdLed);
    group.add(ssdGroup);

    // 6. Tactical Sticky Notes (Port 445 SMB & SOC Notes)
    const noteYellow = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.001, 0.065), paperMat);
    noteYellow.position.set(-0.19, deskY + 0.001, -3.06);
    noteYellow.rotation.y = 0.15;
    group.add(noteYellow);

    const noteCyan = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.001, 0.06), cyanNoteMat);
    noteCyan.position.set(-0.21, deskY + 0.002, -3.12);
    noteCyan.rotation.y = -0.2;
    group.add(noteCyan);

    // 7. Ceramic Cybersecurity Coffee Mug
    const mugGroup = new THREE.Group();
    mugGroup.position.set(-0.46, deskY, -3.34);

    const mugBody = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.09, 16), mugMat);
    mugBody.position.y = 0.045;
    mugBody.castShadow = true;
    mugGroup.add(mugBody);

    const mugHandle = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.006, 8, 16), mugMat);
    mugHandle.position.set(-0.04, 0.045, 0);
    mugHandle.rotation.y = Math.PI / 2;
    mugGroup.add(mugHandle);

    const coffeeSurface = new THREE.Mesh(
      new THREE.CylinderGeometry(0.034, 0.034, 0.005, 16),
      new THREE.MeshStandardMaterial({ color: 0x2b1810, roughness: 0.1, metalness: 0.1 })
    );
    coffeeSurface.position.y = 0.082;
    mugGroup.add(coffeeSurface);
    group.add(mugGroup);

    parent.add(group);
    return group;
  }

  private buildFirstPersonHands(): THREE.Group {
    const handsGroup = new THREE.Group();
    handsGroup.name = 'FirstPersonHands';
    handsGroup.position.set(0, 0.7875, -2.85);
    handsGroup.visible = false;

    const skinMat = new THREE.MeshStandardMaterial({
      color: 0x5c3826,
      roughness: 0.8,
    });
    const jacketSleeveMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.6,
    });

    // Left Forearm & Hand
    this.fpLeftArm = new THREE.Group();
    this.fpLeftArm.position.set(-0.14, 0.18, 0.22);
    handsGroup.add(this.fpLeftArm);

    const lSleeveMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.038, 0.28, 10),
      jacketSleeveMat
    );
    lSleeveMesh.rotation.x = -Math.PI / 2.8;
    lSleeveMesh.position.set(0, 0.04, -0.12);
    this.fpLeftArm.add(lSleeveMesh);

    this.fpLeftHand = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.02, 0.08), skinMat);
    this.fpLeftHand.position.set(0, 0.01, -0.32);
    this.fpLeftArm.add(this.fpLeftHand);

    // Right Forearm & Hand
    this.fpRightArm = new THREE.Group();
    this.fpRightArm.position.set(0.24, 0.18, 0.22);
    handsGroup.add(this.fpRightArm);

    const rSleeveMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.038, 0.28, 10),
      jacketSleeveMat
    );
    rSleeveMesh.rotation.x = -Math.PI / 2.8;
    rSleeveMesh.position.set(0, 0.04, -0.12);
    this.fpRightArm.add(rSleeveMesh);

    this.fpRightHand = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.02, 0.08), skinMat);
    this.fpRightHand.position.set(0, 0.01, -0.32);
    this.fpRightArm.add(this.fpRightHand);

    return handsGroup;
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  public isGlbLoaded(): boolean {
    return this.isUsingGLB;
  }

  public isAssetLoaded(): boolean {
    return this.isLoaded;
  }

  public async whenLoaded(): Promise<boolean> {
    return this.loadPromise;
  }

  public setFirstPersonMode(isFP: boolean): void {
    this.fpHandsGroup.visible = isFP;
  }

  public triggerTyping(): void {
    this.typingTimer = 0.35;
  }

  public triggerMouseUse(): void {
    this.mouseTimer = 0.4;
  }

  public updateTerminalOutput(lines: string[]): void {
    this.screenRenderer.setTerminalLines(lines);
  }

  public updateDesktopState(state: Partial<ScreenDesktopState>): void {
    this.screenRenderer.updateDesktopState(state);
  }

  public getScreenRenderer(): ScreenRenderer {
    return this.screenRenderer;
  }

  public renderScreenTexture(timeString: string): void {
    this.screenRenderer.updateDesktopState({ simulationTime: timeString });
  }

  public update(deltaTime: number, simulationTimeStr = '08:00 AM'): void {
    this.timePhase += deltaTime;

    // Update screen renderer
    this.screenRenderer.updateDesktopState({ simulationTime: simulationTimeStr });
    this.screenRenderer.update(deltaTime);

    // First person hands animation
    if (this.fpHandsGroup.visible) {
      if (this.typingTimer > 0) {
        this.typingTimer -= deltaTime;
        const tap = Math.sin(this.timePhase * 24.0) * 0.012;
        this.fpLeftHand.position.y = 0.01 + tap;
        this.fpRightHand.position.y = 0.01 - tap;
      } else if (this.mouseTimer > 0) {
        this.mouseTimer -= deltaTime;
        const mouseNudge = Math.sin(this.timePhase * 6.0) * 0.015;
        this.fpRightHand.position.x = mouseNudge;
        this.fpRightHand.position.z = -0.32 + mouseNudge * 0.5;
      } else {
        // Resting on desk
        this.fpLeftHand.position.y = 0.01;
        this.fpRightHand.position.y = 0.01;
      }
    }
  }

  public getGlbChildren(): THREE.Object3D[] {
    return this.glbChildren;
  }

  public dispose(): void {
    if (this.screenRenderer) {
      this.screenRenderer.dispose();
    }
    this.glbChildren.forEach(child => {
      this.group.remove(child);
    });
    this.glbChildren = [];
    this.proceduralChildren.forEach(child => {
      this.group.remove(child);
    });
    this.proceduralChildren = [];

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
