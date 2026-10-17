import * as THREE from 'three';

export interface WorkstationOptions {
  isCedarline?: boolean;
  accentColor?: number;
}

export class WorkstationProps {
  private group: THREE.Group;
  private screenCanvas: HTMLCanvasElement;
  private screenCtx: CanvasRenderingContext2D | null;
  private screenTexture: THREE.CanvasTexture;
  private screenMesh: THREE.Mesh;
  private screenGlowLight: THREE.PointLight;

  // First-person hands rig (visible during first-person workstation mode)
  private fpHandsGroup: THREE.Group;
  private fpLeftArm: THREE.Group;
  private fpRightArm: THREE.Group;
  private fpLeftHand: THREE.Mesh;
  private fpRightHand: THREE.Mesh;

  private typingTimer = 0;
  private mouseTimer = 0;
  private timePhase = 0;
  private terminalLines: string[] = [
    'tade@parrot-sec-ws04:~$ uname -a',
    'Linux cyberlife 6.8.0-parrot-enterprise x86_64',
    'tade@parrot-sec-ws04:~$ status',
    '[OK] 10.0.4.15/24 SYNTHETIC NODE READY',
    'tade@parrot-sec-ws04:~$ _',
  ];

  constructor(options: WorkstationOptions = {}) {
    const isCedarline = options.isCedarline ?? true;
    const accentColor = options.accentColor ?? (isCedarline ? 0x00e5ff : 0x00e676);

    this.group = new THREE.Group();
    this.group.name = 'PhysicalWorkstation';

    // Materials
    const deskTopMat = new THREE.MeshStandardMaterial({
      color: 0x1b2430, // Technical graphite walnut
      roughness: 0.45,
      metalness: 0.15,
    });
    const deskSteelMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Powder-coated steel
      roughness: 0.6,
      metalness: 0.8,
    });
    const laptopChassisMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Anodized dark aluminum
      roughness: 0.35,
      metalness: 0.85,
    });
    const keycapMat = new THREE.MeshStandardMaterial({
      color: 0x090d16, // Low-profile mechanical keycaps
      roughness: 0.5,
      metalness: 0.2,
    });
    const chairFabricMat = new THREE.MeshStandardMaterial({
      color: 0x111827, // Dark technical mesh
      roughness: 0.85,
      metalness: 0.1,
    });
    const chairChromeMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Polished chrome base
      roughness: 0.2,
      metalness: 0.9,
    });

    // -------------------------------------------------------------
    // 1. Detailed Executive Technical Desk
    // Tabletop at height 0.74m, Center at Z = -3.4m, Width: 2.2m, Depth: 1.0m
    // -------------------------------------------------------------
    const deskGroup = new THREE.Group();
    deskGroup.position.set(0, 0, -3.4);
    this.group.add(deskGroup);

    // Desk Top Slab (bevelled)
    const topGeo = new THREE.BoxGeometry(2.2, 0.045, 1.0);
    const topMesh = new THREE.Mesh(topGeo, deskTopMat);
    topMesh.position.y = 0.72;
    topMesh.castShadow = true;
    topMesh.receiveShadow = true;
    deskGroup.add(topMesh);

    // Cable Management Grommet
    const grommetGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.05, 16);
    const grommet = new THREE.Mesh(grommetGeo, deskSteelMat);
    grommet.position.set(0.65, 0.725, -0.32);
    deskGroup.add(grommet);

    // Steel Frame Under-Desk Rails
    const railGeo = new THREE.BoxGeometry(2.0, 0.04, 0.04);
    const railF = new THREE.Mesh(railGeo, deskSteelMat);
    railF.position.set(0, 0.68, 0.38);
    railF.castShadow = true;
    deskGroup.add(railF);

    const railB = new THREE.Mesh(railGeo, deskSteelMat);
    railB.position.set(0, 0.68, -0.38);
    railB.castShadow = true;
    deskGroup.add(railB);

    // 4 Steel T-Legs with Floor Levelers
    const legPositions: [number, number][] = [
      [-0.98, -0.38],
      [-0.98, 0.38],
      [0.98, -0.38],
      [0.98, 0.38],
    ];
    legPositions.forEach(([lx, lz]) => {
      const legGeo = new THREE.BoxGeometry(0.05, 0.7, 0.05);
      const legMesh = new THREE.Mesh(legGeo, deskSteelMat);
      legMesh.position.set(lx, 0.35, lz);
      legMesh.castShadow = true;
      deskGroup.add(legMesh);

      // Foot glide
      const glideGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.015, 12);
      const glide = new THREE.Mesh(glideGeo, deskSteelMat);
      glide.position.set(lx, 0.01, lz);
      deskGroup.add(glide);
    });

    // -------------------------------------------------------------
    // 2. Ergonomic Office Mesh Chair
    // Positioned in front of the desk at Z = -2.85m, facing -Z
    // -------------------------------------------------------------
    const chairGroup = new THREE.Group();
    chairGroup.position.set(0, 0, -2.85);
    this.group.add(chairGroup);

    // 5-Star Arched Base
    const baseCenter = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.06, 12),
      chairChromeMat
    );
    baseCenter.position.y = 0.12;
    chairGroup.add(baseCenter);

    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5;
      const legSpoke = new THREE.Group();
      legSpoke.rotation.y = angle;

      const spokeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.28), chairChromeMat);
      spokeMesh.position.set(0, 0.08, 0.14);
      spokeMesh.rotation.x = -0.15;
      spokeMesh.castShadow = true;
      legSpoke.add(spokeMesh);

      // Caster wheel
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.02, 12),
        deskSteelMat
      );
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(0, 0.025, 0.28);
      legSpoke.add(wheel);

      chairGroup.add(legSpoke);
    }

    // Gas Lift Cylinder Column
    const cylinderMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.34, 12),
      chairChromeMat
    );
    cylinderMesh.position.y = 0.28;
    chairGroup.add(cylinderMesh);

    // Contoured Padded Seat Cushion (Height = 0.48m)
    const seatGeo = new THREE.BoxGeometry(0.48, 0.07, 0.46);
    const seatMesh = new THREE.Mesh(seatGeo, chairFabricMat);
    seatMesh.position.set(0, 0.48, 0);
    seatMesh.castShadow = true;
    chairGroup.add(seatMesh);

    // Ergonomic Curved Mesh Backrest
    const backrestGroup = new THREE.Group();
    backrestGroup.position.set(0, 0.52, 0.22);
    chairGroup.add(backrestGroup);

    const backSpine = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.52, 0.03), chairChromeMat);
    backSpine.position.set(0, 0.26, 0.03);
    backrestGroup.add(backSpine);

    const backrestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.48, 0.04), chairFabricMat);
    backrestMesh.position.set(0, 0.26, 0);
    backrestMesh.rotation.x = -0.08;
    backrestMesh.castShadow = true;
    backrestGroup.add(backrestMesh);

    // Headrest
    const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.05), chairFabricMat);
    headrest.position.set(0, 0.56, -0.02);
    backrestGroup.add(headrest);

    // Adjustable Armrests
    [-0.24, 0.24].forEach(ax => {
      const armStrut = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.2, 0.04), chairChromeMat);
      armStrut.position.set(ax, 0.56, 0.02);
      chairGroup.add(armStrut);

      const armPad = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.025, 0.22), chairFabricMat);
      armPad.position.set(ax, 0.66, -0.02);
      armPad.castShadow = true;
      chairGroup.add(armPad);
    });

    // -------------------------------------------------------------
    // 3. Detailed Physical Laptop Computer
    // Positioned on the desk at Z = -3.32m, Y = 0.7425m, facing +Z
    // -------------------------------------------------------------
    const laptopGroup = new THREE.Group();
    laptopGroup.position.set(0, 0.7425, -3.32);
    this.group.add(laptopGroup);

    // Laptop Base Chassis (W: 0.36m, D: 0.25m, H: 0.012m)
    const baseGeo = new THREE.BoxGeometry(0.36, 0.012, 0.25);
    const baseMesh = new THREE.Mesh(baseGeo, laptopChassisMat);
    baseMesh.position.set(0, 0.006, 0);
    baseMesh.castShadow = true;
    laptopGroup.add(baseMesh);

    // Keyboard Well Recess
    const wellGeo = new THREE.BoxGeometry(0.32, 0.003, 0.13);
    const wellMat = new THREE.MeshStandardMaterial({ color: 0x161b22, roughness: 0.8 });
    const wellMesh = new THREE.Mesh(wellGeo, wellMat);
    wellMesh.position.set(0, 0.0125, -0.035);
    laptopGroup.add(wellMesh);

    // Individual Key Rows (5 realistic rows)
    const rowZ = [-0.08, -0.06, -0.04, -0.02, 0.0];
    rowZ.forEach((rz, rowIdx) => {
      const keyCols = rowIdx === 4 ? 6 : 10;
      const kw = (0.3 - (keyCols - 1) * 0.004) / keyCols;
      for (let c = 0; c < keyCols; c++) {
        const kx = -0.15 + kw / 2 + c * (kw + 0.004);
        const keyGeo = new THREE.BoxGeometry(kw, 0.004, 0.014);
        const keyMesh = new THREE.Mesh(keyGeo, keycapMat);
        keyMesh.position.set(kx, 0.014, rz);
        laptopGroup.add(keyMesh);
      }
    });

    // Spacebar Accent
    const spaceGeo = new THREE.BoxGeometry(0.12, 0.004, 0.014);
    const spaceMesh = new THREE.Mesh(spaceGeo, keycapMat);
    spaceMesh.position.set(0, 0.014, 0.02);
    laptopGroup.add(spaceMesh);

    // Trackpad
    const padGeo = new THREE.BoxGeometry(0.12, 0.001, 0.07);
    const padMat = new THREE.MeshStandardMaterial({
      color: 0x21262d,
      roughness: 0.3,
      metalness: 0.5,
    });
    const padMesh = new THREE.Mesh(padGeo, padMat);
    padMesh.position.set(0, 0.0126, 0.075);
    laptopGroup.add(padMesh);

    // Screen Hinge Cylinder
    const hingeGeo = new THREE.CylinderGeometry(0.007, 0.007, 0.32, 16);
    const hinge = new THREE.Mesh(hingeGeo, laptopChassisMat);
    hinge.rotation.z = Math.PI / 2;
    hinge.position.set(0, 0.012, -0.12);
    laptopGroup.add(hinge);

    // Laptop Lid & Screen Display (Angled back at 108 degrees)
    const lidGroup = new THREE.Group();
    lidGroup.position.set(0, 0.012, -0.12);
    lidGroup.rotation.x = -Math.PI / 2 + 0.32; // Open angled screen
    laptopGroup.add(lidGroup);

    // Outer Back Lid
    const lidGeo = new THREE.BoxGeometry(0.36, 0.24, 0.008);
    const lidMesh = new THREE.Mesh(lidGeo, laptopChassisMat);
    lidMesh.position.set(0, 0.12, -0.004);
    lidMesh.castShadow = true;
    lidGroup.add(lidMesh);

    // Subtle Glowing Cyber Logo on Lid Back
    const logoGeo = new THREE.PlaneGeometry(0.05, 0.05);
    const logoMat = new THREE.MeshBasicMaterial({ color: accentColor, side: THREE.DoubleSide });
    const logoMesh = new THREE.Mesh(logoGeo, logoMat);
    logoMesh.position.set(0, 0.12, -0.009);
    logoMesh.rotation.y = Math.PI;
    lidGroup.add(logoMesh);

    // Screen Bezel Inner Border
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0x0d1117, roughness: 0.7 });
    const bezelMesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.23, 0.002), bezelMat);
    bezelMesh.position.set(0, 0.12, 0.001);
    lidGroup.add(bezelMesh);

    // Webcam Dot
    const camGeo = new THREE.CircleGeometry(0.0025, 8);
    const camMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const camMesh = new THREE.Mesh(camGeo, camMat);
    camMesh.position.set(0, 0.228, 0.0025);
    lidGroup.add(camMesh);

    // -------------------------------------------------------------
    // Dynamic Active Screen Display (512x320 Canvas Texture)
    // -------------------------------------------------------------
    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 512;
    this.screenCanvas.height = 320;
    this.screenCtx = this.screenCanvas.getContext('2d');

    this.renderScreenTexture('08:00 AM');

    this.screenTexture = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTexture.generateMipmaps = false;
    this.screenTexture.minFilter = THREE.LinearFilter;
    this.screenTexture.magFilter = THREE.LinearFilter;

    const screenGeo = new THREE.PlaneGeometry(0.32, 0.2);
    const screenMat = new THREE.MeshBasicMaterial({
      map: this.screenTexture,
      toneMapped: false,
    });
    this.screenMesh = new THREE.Mesh(screenGeo, screenMat);
    this.screenMesh.position.set(0, 0.118, 0.003);
    lidGroup.add(this.screenMesh);

    // Subtle Screen Glow Light casting on keyboard and hands
    this.screenGlowLight = new THREE.PointLight(accentColor, 1.2, 1.2);
    this.screenGlowLight.position.set(0, 0.15, 0.1);
    lidGroup.add(this.screenGlowLight);

    // -------------------------------------------------------------
    // 4. Mouse & Stitched Mousepad
    // -------------------------------------------------------------
    const mouseGroup = new THREE.Group();
    mouseGroup.position.set(0.28, 0.7425, -3.32);
    this.group.add(mouseGroup);

    // Mousepad
    const padMatGeo = new THREE.BoxGeometry(0.18, 0.003, 0.22);
    const padMatSurface = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const padMeshMat = new THREE.Mesh(padMatGeo, padMatSurface);
    padMeshMat.position.set(0, 0.0015, 0);
    mouseGroup.add(padMeshMat);

    // Optical Mouse
    const mouseBodyGeo = new THREE.BoxGeometry(0.06, 0.024, 0.1);
    const mouseBodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.3,
    });
    const mouseBody = new THREE.Mesh(mouseBodyGeo, mouseBodyMat);
    mouseBody.position.set(0, 0.015, 0);
    mouseBody.castShadow = true;
    mouseGroup.add(mouseBody);

    // Scroll Wheel
    const wheelGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.006, 10);
    const wheelMat = new THREE.MeshBasicMaterial({ color: accentColor });
    const wheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
    wheelMesh.rotation.z = Math.PI / 2;
    wheelMesh.position.set(0, 0.027, -0.02);
    mouseGroup.add(wheelMesh);

    // -------------------------------------------------------------
    // 5. First-Person Forearms / Hands Rig
    // Positioned right in front of first-person camera facing the desk
    // Visible only during First-Person Workstation mode!
    // -------------------------------------------------------------
    this.fpHandsGroup = new THREE.Group();
    this.fpHandsGroup.name = 'FirstPersonHands';
    this.fpHandsGroup.position.set(0, 0.74, -2.85);
    this.fpHandsGroup.visible = false;
    this.group.add(this.fpHandsGroup);

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
    this.fpHandsGroup.add(this.fpLeftArm);

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
    this.fpHandsGroup.add(this.fpRightArm);

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
  }

  public getMesh(): THREE.Group {
    return this.group;
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
    this.terminalLines = lines.slice(-5);
  }

  /**
   * Renders the dynamic 2D canvas texture displaying the Parrot OS desktop
   * on the 3D laptop screen.
   */
  public renderScreenTexture(timeString: string): void {
    if (!this.screenCtx) return;
    const ctx = this.screenCtx;
    const w = this.screenCanvas.width;
    const h = this.screenCanvas.height;

    // Background gradient (Parrot dark obsidian)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0a0f14');
    bgGrad.addColorStop(1, '#121820');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Top System Bar
    ctx.fillStyle = '#05080c';
    ctx.fillRect(0, 0, w, 22);

    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('PARROT SEC OS // ENTERPRISE', 10, 15);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '9px monospace';
    ctx.fillText('CPU: 14%  RAM: 2.1/16GB  NET: 10.0.4.15', 200, 15);

    ctx.fillStyle = '#00e676';
    ctx.fillText(timeString, 440, 15);

    // Terminal Window Area
    ctx.fillStyle = '#04070a';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 32, w - 32, h - 50);
    ctx.fillRect(16, 32, w - 32, h - 50);

    // Terminal Header
    ctx.fillStyle = '#161b22';
    ctx.fillRect(16, 32, w - 32, 18);
    ctx.fillStyle = '#38bdf8';
    ctx.font = '10px monospace';
    ctx.fillText('bash - cyberlife@parrot-rig (sandboxed)', 24, 45);

    // Terminal Window Dots
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(w - 28, 41, 4, 0, Math.PI * 2);
    ctx.fill();

    // Render Terminal Lines
    ctx.fillStyle = '#00e676';
    ctx.font = '11px monospace';
    let yPos = 72;
    this.terminalLines.forEach(line => {
      ctx.fillText(line, 26, yPos);
      yPos += 20;
    });

    if (this.screenTexture) {
      this.screenTexture.needsUpdate = true;
    }
  }

  public update(deltaTime: number, simulationTimeStr = '08:00 AM'): void {
    this.timePhase += deltaTime;

    // Periodically redraw screen (approx 5Hz is plenty for 3D world readability)
    if (Math.floor(this.timePhase * 5) !== Math.floor((this.timePhase - deltaTime) * 5)) {
      this.renderScreenTexture(simulationTimeStr);
    }

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

  public dispose(): void {
    if (this.screenTexture) {
      this.screenTexture.dispose();
    }
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
