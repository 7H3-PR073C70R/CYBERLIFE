import * as THREE from 'three';
import { AABB } from '../CollisionWorld';

export interface LagosPropResult {
  mesh: THREE.Group;
  aabb?: AABB;
}

/**
 * Procedural prop generators for authentic Lagos Island urban details:
 * - Danfo commercial minibus (yellow with twin black racing stripes)
 * - Market stalls with striped canvas awnings & display crates
 * - Concrete utility poles with cross-arms and transformers
 * - Official Lagos State green & white street name signposts
 * - Tropical royal palm trees
 * - Marina seawall with safety railings and mooring bollards
 * - Tinubu Square central monument & fountain
 * - Rooftop black polyethylene water storage tanks
 */
export class LagosProps {
  /**
   * Builds the iconic Lagos Danfo commercial minibus:
   * Recognizable yellow body (#facc15), twin black horizontal stripes,
   * passenger windows, wheels/tires, headlights, and front grille.
   */
  public static createDanfoMinibus(x: number, z: number, rotationY = 0): LagosPropResult {
    const group = new THREE.Group();
    group.name = 'DanfoMinibus';
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;

    // Dimensions: Length: 4.8m, Width: 2.0m, Height: 2.2m
    const bodyW = 2.0;
    const bodyH = 1.4;
    const bodyL = 4.8;
    const chassisY = 0.5;

    // 1. Lower Body Chassis (Classic Lagos Danfo Yellow)
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.4,
      metalness: 0.1,
    });
    const lowerBodyGeo = new THREE.BoxGeometry(bodyW, bodyH, bodyL);
    const lowerBody = new THREE.Mesh(lowerBodyGeo, yellowMat);
    lowerBody.position.y = chassisY + bodyH / 2;
    lowerBody.castShadow = true;
    lowerBody.receiveShadow = true;
    group.add(lowerBody);

    // 2. Twin Black Horizontal Stripes (Iconic Lagos Danfo livery)
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const stripeGeo = new THREE.BoxGeometry(bodyW + 0.04, 0.12, bodyL + 0.02);

    const stripeUpper = new THREE.Mesh(stripeGeo, stripeMat);
    stripeUpper.position.y = chassisY + 0.85;
    group.add(stripeUpper);

    const stripeLower = new THREE.Mesh(stripeGeo, stripeMat);
    stripeLower.position.y = chassisY + 0.6;
    group.add(stripeLower);

    // 3. Cabin & Roof (White / Light Roof common on Toyota HiAce / VW T3 Danfos)
    const roofH = 0.65;
    const roofGeo = new THREE.BoxGeometry(bodyW - 0.1, roofH, bodyL - 0.3);
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 });
    const roof = new THREE.Mesh(roofGeo, roofMat);
    roof.position.y = chassisY + bodyH + roofH / 2;
    roof.castShadow = true;
    group.add(roof);

    // 4. Windows (Front Windshield, Rear, Sides)
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      metalness: 0.9,
    });
    // Windshield (Front at +Z)
    const windshieldGeo = new THREE.BoxGeometry(bodyW - 0.2, 0.55, 0.1);
    const windshield = new THREE.Mesh(windshieldGeo, glassMat);
    windshield.position.set(0, chassisY + bodyH + 0.25, bodyL / 2 - 0.1);
    windshield.rotation.x = -0.2;
    group.add(windshield);

    // Rear Window (at -Z)
    const rearWinGeo = new THREE.BoxGeometry(bodyW - 0.3, 0.5, 0.1);
    const rearWin = new THREE.Mesh(rearWinGeo, glassMat);
    rearWin.position.set(0, chassisY + bodyH + 0.25, -bodyL / 2 + 0.1);
    group.add(rearWin);

    // Side Windows
    const sideWinGeo = new THREE.BoxGeometry(bodyW + 0.04, 0.45, 1.1);
    for (let s = -1.2; s <= 1.2; s += 1.2) {
      const sideWin = new THREE.Mesh(sideWinGeo, glassMat);
      sideWin.position.set(0, chassisY + bodyH + 0.25, s);
      group.add(sideWin);
    }

    // 5. Wheels (4 black rubber tires with grey rims)
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.7 });
    const tireGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 12);
    const rimGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.32, 12);

    const wheelOffsets: [number, number][] = [
      [-bodyW / 2 + 0.05, 1.4],
      [bodyW / 2 - 0.05, 1.4],
      [-bodyW / 2 + 0.05, -1.4],
      [bodyW / 2 - 0.05, -1.4],
    ];

    wheelOffsets.forEach(([wx, wz]) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(wx, 0.38, wz);
      wheelGroup.rotation.z = Math.PI / 2;

      const tire = new THREE.Mesh(tireGeo, tireMat);
      const rim = new THREE.Mesh(rimGeo, rimMat);
      wheelGroup.add(tire, rim);
      group.add(wheelGroup);
    });

    // 6. Headlights and Front Bumper
    const bumperGeo = new THREE.BoxGeometry(bodyW + 0.1, 0.3, 0.3);
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const bumper = new THREE.Mesh(bumperGeo, bumperMat);
    bumper.position.set(0, chassisY + 0.15, bodyL / 2 + 0.1);
    group.add(bumper);

    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const headGeo = new THREE.BoxGeometry(0.35, 0.2, 0.1);
    const hl1 = new THREE.Mesh(headGeo, headlightMat);
    hl1.position.set(-0.65, chassisY + 0.45, bodyL / 2 + 0.05);
    const hl2 = new THREE.Mesh(headGeo, headlightMat);
    hl2.position.set(0.65, chassisY + 0.45, bodyL / 2 + 0.05);
    group.add(hl1, hl2);

    // Collision Bounding Box (accounting for rotation)
    const halfW = (rotationY !== 0 ? bodyL : bodyW) / 2;
    const halfL = (rotationY !== 0 ? bodyW : bodyL) / 2;
    const aabb: AABB = {
      minX: x - halfW,
      maxX: x + halfW,
      minZ: z - halfL,
      maxZ: z + halfL,
      label: 'Vehicle: Lagos Danfo Bus',
    };

    return { mesh: group, aabb };
  }

  /**
   * Builds an authentic Balogun market stall with wooden frame,
   * striped awning canopy, and stacked display goods/crates.
   */
  public static createMarketStall(
    x: number,
    z: number,
    rotationY = 0,
    awningColor1 = 0xd97706,
    awningColor2 = 0xfef3c7,
    name = 'Balogun Market Stall'
  ): LagosPropResult {
    const group = new THREE.Group();
    group.name = `MarketStall_${name}`;
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;

    const stallW = 2.8;
    const stallD = 2.0;
    const tableH = 0.9;

    // 1. Wooden Table Counter
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 });
    const topGeo = new THREE.BoxGeometry(stallW, 0.12, stallD);
    const tableTop = new THREE.Mesh(topGeo, woodMat);
    tableTop.position.y = tableH;
    tableTop.castShadow = true;
    tableTop.receiveShadow = true;
    group.add(tableTop);

    // 4 Corner Wooden Legs
    const legGeo = new THREE.BoxGeometry(0.12, tableH, 0.12);
    const legPositions: [number, number][] = [
      [-stallW / 2 + 0.1, -stallD / 2 + 0.1],
      [stallW / 2 - 0.1, -stallD / 2 + 0.1],
      [-stallW / 2 + 0.1, stallD / 2 - 0.1],
      [stallW / 2 - 0.1, stallD / 2 - 0.1],
    ];
    legPositions.forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, woodMat);
      leg.position.set(lx, tableH / 2, lz);
      group.add(leg);
    });

    // 2. Canopy Support Poles (extending to 2.4m height)
    const poleGeo = new THREE.BoxGeometry(0.08, 1.6, 0.08);
    const p1 = new THREE.Mesh(poleGeo, woodMat);
    p1.position.set(-stallW / 2 + 0.1, tableH + 0.8, -stallD / 2 + 0.1);
    const p2 = new THREE.Mesh(poleGeo, woodMat);
    p2.position.set(stallW / 2 - 0.1, tableH + 0.8, -stallD / 2 + 0.1);
    const p3 = new THREE.Mesh(poleGeo, woodMat);
    p3.position.set(-stallW / 2 + 0.1, tableH + 0.65, stallD / 2 - 0.1);
    const p4 = new THREE.Mesh(poleGeo, woodMat);
    p4.position.set(stallW / 2 - 0.1, tableH + 0.65, stallD / 2 - 0.1);
    group.add(p1, p2, p3, p4);

    // 3. Striped Canvas Awning (slanted forward)
    const awningGroup = new THREE.Group();
    awningGroup.position.set(0, tableH + 1.45, 0);
    awningGroup.rotation.x = 0.15; // Slant forward to shed tropical rain

    const stripeCount = 6;
    const stripeW = (stallW + 0.3) / stripeCount;
    const stripeGeo = new THREE.BoxGeometry(stripeW, 0.04, stallD + 0.4);
    const mat1 = new THREE.MeshStandardMaterial({
      color: awningColor1,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const mat2 = new THREE.MeshStandardMaterial({
      color: awningColor2,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });

    for (let i = 0; i < stripeCount; i++) {
      const sMesh = new THREE.Mesh(stripeGeo, i % 2 === 0 ? mat1 : mat2);
      sMesh.position.x = -((stallW + 0.3) / 2) + (i + 0.5) * stripeW;
      sMesh.castShadow = true;
      awningGroup.add(sMesh);
    }
    group.add(awningGroup);

    // 4. Wares / Crates on Counter
    const crateGeo = new THREE.BoxGeometry(0.6, 0.35, 0.5);
    const crateMat1 = new THREE.MeshStandardMaterial({ color: 0x059669 }); // Produce green
    const crateMat2 = new THREE.MeshStandardMaterial({ color: 0xe11d48 }); // Textiles red
    const crateMat3 = new THREE.MeshStandardMaterial({ color: 0x0284c7 }); // Electronics blue

    const c1 = new THREE.Mesh(crateGeo, crateMat1);
    c1.position.set(-0.7, tableH + 0.22, 0);
    const c2 = new THREE.Mesh(crateGeo, crateMat2);
    c2.position.set(0, tableH + 0.22, 0.1);
    const c3 = new THREE.Mesh(crateGeo, crateMat3);
    c3.position.set(0.7, tableH + 0.22, -0.1);
    group.add(c1, c2, c3);

    const aabb: AABB = {
      minX: x - stallW / 2 - 0.2,
      maxX: x + stallW / 2 + 0.2,
      minZ: z - stallD / 2 - 0.2,
      maxZ: z + stallD / 2 + 0.2,
      label: `Stall: ${name}`,
    };

    return { mesh: group, aabb };
  }

  /**
   * Builds concrete utility poles with cross-arms and transformer canister.
   */
  public static createUtilityPole(x: number, z: number): LagosPropResult {
    const group = new THREE.Group();
    group.name = 'UtilityPole';
    group.position.set(x, 0, z);

    const poleH = 7.0;
    const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, poleH, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.9 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = poleH / 2;
    pole.castShadow = true;
    group.add(pole);

    // Cross-arms
    const armGeo = new THREE.BoxGeometry(2.0, 0.12, 0.12);
    const armMat = new THREE.MeshStandardMaterial({ color: 0x475569 });

    const armUpper = new THREE.Mesh(armGeo, armMat);
    armUpper.position.set(0, poleH - 0.4, 0);
    group.add(armUpper);

    const armLower = new THREE.Mesh(armGeo, armMat);
    armLower.position.set(0, poleH - 1.2, 0);
    group.add(armLower);

    // Ceramic Insulators
    const insGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.15, 6);
    const insMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });
    [-0.8, -0.3, 0.3, 0.8].forEach(ix => {
      const ins1 = new THREE.Mesh(insGeo, insMat);
      ins1.position.set(ix, poleH - 0.3, 0);
      const ins2 = new THREE.Mesh(insGeo, insMat);
      ins2.position.set(ix, poleH - 1.1, 0);
      group.add(ins1, ins2);
    });

    // Transformer Canister on pole
    const transGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.9, 10);
    const transMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      metalness: 0.6,
      roughness: 0.4,
    });
    const transformer = new THREE.Mesh(transGeo, transMat);
    transformer.position.set(0.3, poleH - 2.2, 0);
    group.add(transformer);

    const aabb: AABB = {
      minX: x - 0.35,
      maxX: x + 0.35,
      minZ: z - 0.35,
      maxZ: z + 0.35,
      label: 'Utility Pole',
    };

    return { mesh: group, aabb };
  }

  /**
   * Builds an official Lagos State green & white enamel street name sign.
   */
  public static createStreetSign(
    x: number,
    z: number,
    streetName: string,
    rotationY = 0
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `StreetSign_${streetName}`;
    group.position.set(x, 0, z);
    group.rotation.y = rotationY;

    // Pole
    const poleGeo = new THREE.CylinderGeometry(0.05, 0.05, 3.2, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 1.6;
    group.add(pole);

    // Lagos Green Signboard
    const signW = Math.max(1.4, streetName.length * 0.11);
    const signH = 0.32;
    const signGeo = new THREE.BoxGeometry(signW, signH, 0.04);
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Official Lagos State green
      roughness: 0.4,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, 3.0, 0);
    group.add(sign);

    // White Border Trim
    const borderGeo = new THREE.BoxGeometry(signW + 0.04, signH + 0.04, 0.03);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0, 3.0, 0);
    group.add(border);

    // Contrasting White Lettering Bar Accent
    const textBarGeo = new THREE.BoxGeometry(signW - 0.15, 0.12, 0.05);
    const textBarMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const textBar = new THREE.Mesh(textBarGeo, textBarMat);
    textBar.position.set(0, 3.0, 0);
    group.add(textBar);

    return group;
  }

  /**
   * Builds realistic tropical royal palm trees with natural curved segmented trunks,
   * swollen fiber base, coconut clusters, smooth green crownshaft, and cascading feathered fronds.
   */
  public static createPalmTree(x: number, z: number, height = 6.2): THREE.Group {
    const group = new THREE.Group();
    group.name = 'PalmTree';
    group.position.set(x, 0, z);

    // 1. Swollen Trunk Base (Boot)
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x3d271d,
      roughness: 0.9,
    });
    const baseGeo = new THREE.CylinderGeometry(0.38, 0.48, 0.6, 12);
    const trunkBase = new THREE.Mesh(baseGeo, baseMat);
    trunkBase.position.y = 0.3;
    trunkBase.castShadow = true;
    group.add(trunkBase);

    // 2. Segmented Curved Trunk with Bark Ring Geometry
    const trunkMat = new THREE.MeshStandardMaterial({
      color: 0x5a3e2b,
      roughness: 0.85,
    });
    const segments = 8;
    const trunkHeight = height - 1.2;
    const segH = trunkHeight / segments;

    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const radiusBottom = 0.36 - t * 0.12;
      const radiusTop = 0.36 - (t + 1 / segments) * 0.12;
      const segGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, segH, 12);
      const seg = new THREE.Mesh(segGeo, trunkMat);
      seg.position.y = 0.6 + i * segH + segH / 2;
      // Graceful organic tropical lean
      seg.position.x = Math.sin(t * 1.4) * 0.35;
      seg.position.z = Math.sin(t * 0.8) * 0.15;
      seg.castShadow = true;
      group.add(seg);

      // Bark Ring Collar
      const ringGeo = new THREE.TorusGeometry(radiusBottom * 1.05, 0.02, 6, 12);
      const ring = new THREE.Mesh(ringGeo, baseMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.set(seg.position.x, 0.6 + i * segH, seg.position.z);
      group.add(ring);
    }

    const crownX = Math.sin(1.4) * 0.35;
    const crownZ = Math.sin(0.8) * 0.15;
    const crownBaseY = 0.6 + trunkHeight;

    // 3. Smooth Green Crownshaft (characteristic of Royal Palms)
    const crownshaftMat = new THREE.MeshStandardMaterial({
      color: 0x166534,
      roughness: 0.5,
    });
    const crownshaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.24, 0.9, 12),
      crownshaftMat
    );
    crownshaft.position.set(crownX, crownBaseY + 0.45, crownZ);
    crownshaft.castShadow = true;
    group.add(crownshaft);

    // 4. Hanging Coconut / Date Clusters
    const nutMat = new THREE.MeshStandardMaterial({
      color: 0x78350f,
      roughness: 0.7,
    });
    const nutGeo = new THREE.SphereGeometry(0.12, 8, 8);
    for (let n = 0; n < 8; n++) {
      const angle = (n / 8) * Math.PI * 2;
      const nut = new THREE.Mesh(nutGeo, nutMat);
      nut.position.set(
        crownX + Math.cos(angle) * 0.28,
        crownBaseY + 0.2 + (n % 2) * 0.1,
        crownZ + Math.sin(angle) * 0.28
      );
      group.add(nut);
    }

    // 5. Gracefully Arching Lush Compound Palm Fronds (3 tiers of radial fronds)
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });

    const frondTiers = [
      { count: 6, droop: 0.45, length: 3.4, yOffset: 0.9 }, // Top canopy
      { count: 7, droop: 0.85, length: 3.8, yOffset: 0.7 }, // Mid canopy
      { count: 7, droop: 1.25, length: 3.6, yOffset: 0.5 }, // Drooping lower canopy
    ];

    frondTiers.forEach((tier, tierIdx) => {
      for (let f = 0; f < tier.count; f++) {
        const angle = (f / tier.count) * Math.PI * 2 + tierIdx * 0.4;
        const frondGroup = new THREE.Group();
        frondGroup.position.set(crownX, crownBaseY + tier.yOffset, crownZ);
        frondGroup.rotation.y = angle;

        // Curved arching stem
        const stemMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.7 });
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.02, 0.05, tier.length, 6),
          stemMat
        );
        stem.rotation.z = tier.droop;
        stem.position.set(Math.sin(tier.droop) * (tier.length / 2), Math.cos(tier.droop) * (tier.length / 2), 0);
        frondGroup.add(stem);

        // Feathered Leaf Blades along stem
        const bladeCount = 6;
        for (let b = 1; b <= bladeCount; b++) {
          const bt = b / bladeCount;
          const bladeW = (1 - bt * 0.6) * 0.75;
          const bladeL = 0.55;
          const bladeGeo = new THREE.PlaneGeometry(bladeW, bladeL);
          const blade = new THREE.Mesh(bladeGeo, frondMat);
          blade.rotation.x = Math.PI / 2;
          blade.rotation.z = tier.droop;
          blade.position.set(
            Math.sin(tier.droop) * (tier.length * bt),
            Math.cos(tier.droop) * (tier.length * bt),
            0
          );
          blade.castShadow = true;
          frondGroup.add(blade);
        }

        group.add(frondGroup);
      }
    });

    return group;
  }

  /**
   * Builds high-resolution commercial LED advertising billboard displays:
   * Authentic Nigerian brands (MTN 5G, Flutterwave, Cyberlife OS, GTCO Private Bank)
   * mounted on heavy structural steel truss frames with overhead gooseneck LED spotlight fixtures.
   */
  public static createBillboardAd(
    x: number,
    y: number,
    z: number,
    rotationY: number,
    brand: 'MTN_5G' | 'FLUTTERWAVE' | 'CYBERLIFE_OS' | 'GTCO_BANK',
    width = 7.0,
    height = 3.6
  ): THREE.Group {
    const group = new THREE.Group();
    group.name = `BillboardAd_${brand}`;
    group.position.set(x, y, z);
    group.rotation.y = rotationY;

    // 1. Dynamic High-Res Advertising Texture via HTML Canvas
    let adTexture: THREE.CanvasTexture | null = null;
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        if (brand === 'MTN_5G') {
          // Vibrant MTN Yellow & Black Brand
          ctx.fillStyle = '#facc15';
          ctx.fillRect(0, 0, 1024, 512);

          // Subtle circuit lines
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(880, 256, 180, 0, Math.PI * 2);
          ctx.arc(880, 256, 260, 0, Math.PI * 2);
          ctx.stroke();

          // MTN Oval Logo
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.ellipse(160, 110, 80, 48, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 36px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('MTN', 160, 122);

          // 5G Headline
          ctx.fillStyle = '#0f172a';
          ctx.font = '900 68px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('5G IS HERE', 80, 240);

          ctx.font = 'bold 38px sans-serif';
          ctx.fillText('LAGOS ISLAND HIGH-SPEED GRID', 80, 300);

          ctx.fillStyle = '#1e293b';
          ctx.font = '28px sans-serif';
          ctx.fillText('Ultra-low latency across Broad Street & Marina Boulevard', 80, 360);

          // Footer pill
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(80, 410, 380, 56);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('EVERYWHERE YOU GO • 5G+', 100, 446);
        } else if (brand === 'FLUTTERWAVE') {
          // Modern Fintech Indigo / Midnight Blue & Cyan Wave
          const grad = ctx.createLinearGradient(0, 0, 1024, 512);
          grad.addColorStop(0, '#0b1329');
          grad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, 1024, 512);

          // Glowing wave ribbon
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 12;
          ctx.beginPath();
          ctx.moveTo(0, 400);
          ctx.bezierCurveTo(300, 250, 700, 450, 1024, 180);
          ctx.stroke();

          // Logo & Headline
          ctx.fillStyle = '#ffffff';
          ctx.font = '900 64px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('flutterwave', 80, 150);

          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 44px sans-serif';
          ctx.fillText('Endless Possibilities for Global Commerce', 80, 240);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '30px sans-serif';
          ctx.fillText('Powering millions of transactions across African tech ecosystems', 80, 310);

          // Button pill
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(80, 380, 320, 60);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 26px sans-serif';
          ctx.fillText('ACCEPT PAYMENTS →', 105, 420);
        } else if (brand === 'CYBERLIFE_OS') {
          // Cyberlife Neural Defense Grid
          ctx.fillStyle = '#09090b';
          ctx.fillRect(0, 0, 1024, 512);

          // Neon Grid overlay
          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2;
          for (let gx = 0; gx < 1024; gx += 64) {
            ctx.beginPath();
            ctx.moveTo(gx, 0);
            ctx.lineTo(gx, 512);
            ctx.stroke();
          }
          for (let gy = 0; gy < 512; gy += 64) {
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(1024, gy);
            ctx.stroke();
          }

          // Glowing Header
          ctx.fillStyle = '#00f0ff';
          ctx.font = '900 60px monospace';
          ctx.textAlign = 'left';
          ctx.fillText('CYBERLIFE OS 4.0', 80, 140);

          ctx.fillStyle = '#ef4444';
          ctx.font = 'bold 36px monospace';
          ctx.fillText('[!] NEURAL SECURITY GRID ONLINE', 80, 220);

          ctx.fillStyle = '#e2e8f0';
          ctx.font = '28px sans-serif';
          ctx.fillText('Real-time biometric surveillance & endpoint intrusion monitoring', 80, 290);
          ctx.fillText('Broad Street Security Subnet 07: SECURE', 80, 340);

          ctx.fillStyle = '#10b981';
          ctx.fillRect(80, 390, 400, 50);
          ctx.fillStyle = '#09090b';
          ctx.font = 'bold 26px monospace';
          ctx.fillText('PROTECT YOUR SYSTEM', 105, 425);
        } else {
          // GTCO Private Banking
          ctx.fillStyle = '#111827';
          ctx.fillRect(0, 0, 1024, 512);

          // Gold Accent Bar
          ctx.fillStyle = '#d97706';
          ctx.fillRect(0, 0, 1024, 24);

          ctx.fillStyle = '#f8fafc';
          ctx.font = '900 56px sans-serif';
          ctx.textAlign = 'left';
          ctx.fillText('GTCO PRIVATE BANKING', 80, 160);

          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 38px sans-serif';
          ctx.fillText('Marina Waterfront Financial Center', 80, 240);

          ctx.fillStyle = '#94a3b8';
          ctx.font = '28px sans-serif';
          ctx.fillText('Dedicated private wealth management for corporate leaders', 80, 320);

          ctx.strokeStyle = '#d97706';
          ctx.lineWidth = 4;
          ctx.strokeRect(80, 380, 340, 56);
          ctx.fillStyle = '#facc15';
          ctx.font = 'bold 24px sans-serif';
          ctx.fillText('SCHEDULE A CONSULTATION', 100, 416);
        }

        adTexture = new THREE.CanvasTexture(canvas);
        adTexture.colorSpace = THREE.SRGBColorSpace;
      }
    }

    // 2. Front Billboard Panel
    const boardMat = new THREE.MeshStandardMaterial({
      map: adTexture,
      emissiveMap: adTexture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.1,
    });
    const boardGeo = new THREE.BoxGeometry(width, height, 0.12);
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardMesh.castShadow = true;
    boardMesh.receiveShadow = true;
    group.add(boardMesh);

    // 3. Heavy Steel Outer Bezel
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.85,
      roughness: 0.3,
    });
    const frameGeo = new THREE.BoxGeometry(width + 0.3, height + 0.3, 0.16);
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.z = -0.04;
    group.add(frameMesh);

    // 4. Rear Steel Lattice Truss Support
    const trussMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const rearTruss = new THREE.Mesh(new THREE.BoxGeometry(width * 0.9, height * 0.8, 0.4), trussMat);
    rearTruss.position.z = -0.3;
    group.add(rearTruss);

    // 5. Dual Overhead Gooseneck LED Spotlight Fixtures
    const spotLampMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8 });
    const lensMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // warm spotlight glow

    [-width * 0.3, width * 0.3].forEach(lx => {
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.9, 8), spotLampMat);
      arm.rotation.x = -Math.PI / 3;
      arm.position.set(lx, height / 2 + 0.35, 0.35);
      group.add(arm);

      const lampHead = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, 0.25), spotLampMat);
      lampHead.position.set(lx, height / 2 + 0.65, 0.65);
      lampHead.rotation.x = Math.PI / 4;
      group.add(lampHead);

      const lens = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.15), lensMat);
      lens.position.set(lx, height / 2 + 0.6, 0.72);
      lens.rotation.x = Math.PI / 4;
      group.add(lens);
    });

    return group;
  }

  /**
   * Builds the iconic Broad Street Overhead Portal Arch / District Gateway Gantry:
   * Spanning across the 10m roadway from sidewalk to sidewalk at z = -36.
   * Clear roadway clearance under the arch allows buses and cars to drive freely underneath.
   */
  public static createWelcomePortalArch(z = -36): THREE.Group {
    const group = new THREE.Group();
    group.name = 'BroadStreetWelcomePortal';
    group.position.set(0, 0, z);

    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Concrete & reinforced steel
      roughness: 0.8,
      metalness: 0.3,
    });
    const trussMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.85,
    });

    // 1. Twin Side Support Pillars (placed safely on sidewalks at x = -5.8 and x = 5.8)
    const pillarHeight = 6.4;
    const pillarGeo = new THREE.BoxGeometry(0.8, pillarHeight, 0.8);

    [-5.8, 5.8].forEach(px => {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, pillarHeight / 2, 0);
      pillar.castShadow = true;
      group.add(pillar);

      // Flashing Caution Beacon Light at top
      const beaconMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), beaconMat);
      beacon.position.set(px, pillarHeight + 0.15, 0);
      group.add(beacon);
    });

    // 2. Overhead Structural Box Truss Beam (clearance height: 5.6m)
    const trussW = 12.4;
    const trussH = 0.9;
    const trussGeo = new THREE.BoxGeometry(trussW, trussH, 0.7);
    const trussMesh = new THREE.Mesh(trussGeo, trussMat);
    trussMesh.position.set(0, pillarHeight - trussH / 2, 0);
    trussMesh.castShadow = true;
    group.add(trussMesh);

    // 3. Highway Sign Panel (Official Lagos State Green & White)
    const signMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Lagos State highway green
      roughness: 0.4,
    });
    const signGeo = new THREE.BoxGeometry(10.2, 1.4, 0.12);
    const signBoard = new THREE.Mesh(signGeo, signMat);
    signBoard.position.set(0, pillarHeight - 0.1, 0.42);
    group.add(signBoard);

    // White reflective border trim
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const borderGeo = new THREE.BoxGeometry(10.3, 1.5, 0.08);
    const border = new THREE.Mesh(borderGeo, borderMat);
    border.position.set(0, pillarHeight - 0.1, 0.38);
    group.add(border);

    // Dynamic sign text via canvas
    if (typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#15803d';
        ctx.fillRect(0, 0, 1024, 256);

        // White border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 10;
        ctx.strokeRect(10, 10, 1004, 236);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 44px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LAGOS STATE CENTRAL BUSINESS DISTRICT', 512, 75);

        ctx.fillStyle = '#fef08a';
        ctx.font = '900 52px sans-serif';
        ctx.fillText('BROAD STREET  •  TINUBU SQUARE', 512, 145);

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 34px sans-serif';
        ctx.fillText('↓ MARINA WATERFRONT | BALOGUN MARKET →', 512, 210);

        const tex = new THREE.CanvasTexture(canvas);
        tex.colorSpace = THREE.SRGBColorSpace;
        const textMesh = new THREE.Mesh(
          new THREE.PlaneGeometry(10.0, 1.3),
          new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.3,
            emissiveMap: tex,
            emissive: new THREE.Color(0xffffff),
            emissiveIntensity: 0.3,
          })
        );
        textMesh.position.set(0, pillarHeight - 0.1, 0.49);
        group.add(textMesh);
      }
    }

    return group;
  }

  /**
   * Builds the Marina waterfront seawall, safety railings, and mooring bollards.
   */
  public static createSeawall(z: number, minX: number, maxX: number): LagosPropResult {
    const group = new THREE.Group();
    group.name = 'MarinaSeawall';

    const wallW = maxX - minX;
    const wallH = 1.2;
    const wallD = 1.6;
    const centerX = (minX + maxX) / 2;

    // 1. Concrete Seawall Coping
    const wallGeo = new THREE.BoxGeometry(wallW, wallH, wallD);
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x475569, // weathered seawall concrete
      roughness: 0.9,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(centerX, wallH / 2, z);
    wall.receiveShadow = true;
    wall.castShadow = true;
    group.add(wall);

    // 2. Safety Railings (Steel stanchions and top rail)
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.8,
      roughness: 0.3,
    });
    const topRailGeo = new THREE.BoxGeometry(wallW, 0.08, 0.08);
    const topRail = new THREE.Mesh(topRailGeo, railMat);
    topRail.position.set(centerX, wallH + 0.6, z);
    group.add(topRail);

    const midRailGeo = new THREE.BoxGeometry(wallW, 0.05, 0.05);
    const midRail = new THREE.Mesh(midRailGeo, railMat);
    midRail.position.set(centerX, wallH + 0.3, z);
    group.add(midRail);

    // Posts along railing every 4m
    const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 8);
    for (let px = minX + 2; px <= maxX - 2; px += 4) {
      const post = new THREE.Mesh(postGeo, railMat);
      post.position.set(px, wallH + 0.32, z);
      group.add(post);

      // Mooring Bollards on seawall edge every 8m
      if (Math.abs(px % 8) < 1) {
        const bollardGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.5, 10);
        const bollardMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.7 });
        const bollard = new THREE.Mesh(bollardGeo, bollardMat);
        bollard.position.set(px, wallH + 0.25, z - 0.4);
        group.add(bollard);
      }
    }

    const aabb: AABB = {
      minX,
      maxX,
      minZ: z - wallD / 2 - 0.2,
      maxZ: z + wallD / 2 + 0.2,
      label: 'Marina Waterfront Seawall',
    };

    return { mesh: group, aabb };
  }

  /**
   * Builds the historic Tinubu Square central commemorative fountain & monument.
   */
  public static createTinubuMonument(x: number, z: number): LagosPropResult {
    const group = new THREE.Group();
    group.name = 'TinubuSquareMonument';
    group.position.set(x, 0, z);

    // 1. Decorative Circular Stone Basin (Octagonal approximation)
    const baseGeo = new THREE.CylinderGeometry(4.2, 4.5, 0.7, 16);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Light granite stone
      roughness: 0.7,
    });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.35;
    base.receiveShadow = true;
    base.castShadow = true;
    group.add(base);

    // Water surface inside basin
    const waterGeo = new THREE.CylinderGeometry(3.9, 3.9, 0.1, 16);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.position.y = 0.65;
    group.add(water);

    // 2. Central Tiered Plinth
    const plinthGeo = new THREE.BoxGeometry(2.0, 1.2, 2.0);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 1.2;
    plinth.castShadow = true;
    group.add(plinth);

    // 3. Central Commemorative Pillar / Obelisk (Dedicated to Madam Efunroye Tinubu)
    const pillarGeo = new THREE.CylinderGeometry(0.35, 0.6, 4.2, 8);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // White marble / polished limestone
      roughness: 0.3,
    });
    const pillar = new THREE.Mesh(pillarGeo, pillarMat);
    pillar.position.y = 3.9;
    pillar.castShadow = true;
    group.add(pillar);

    // 4. Bronze commemorative plaque on plinth
    const plaqueGeo = new THREE.BoxGeometry(0.9, 0.5, 0.05);
    const plaqueMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Bronze / copper
      metalness: 0.8,
      roughness: 0.3,
    });
    const plaque = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaque.position.set(0, 1.2, 1.03);
    group.add(plaque);

    const aabb: AABB = {
      minX: x - 4.4,
      maxX: x + 4.4,
      minZ: z - 4.4,
      maxZ: z + 4.4,
      label: 'Civic Landmark: Tinubu Square Fountain Monument',
    };

    return { mesh: group, aabb };
  }

  /**
   * Builds the ubiquitous Nigerian black cylindrical polyethylene overhead water tank
   * on a steel elevated roof rack.
   */
  public static createWaterTank(x: number, y: number, z: number): THREE.Group {
    const group = new THREE.Group();
    group.name = 'RooftopWaterTank';
    group.position.set(x, y, z);

    // Steel support stand
    const standH = 0.8;
    const standGeo = new THREE.BoxGeometry(1.6, standH, 1.6);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
    const stand = new THREE.Mesh(standGeo, standMat);
    stand.position.y = standH / 2;
    group.add(stand);

    // Black cylindrical plastic tank
    const tankH = 1.6;
    const tankGeo = new THREE.CylinderGeometry(0.75, 0.75, tankH, 14);
    const tankMat = new THREE.MeshStandardMaterial({
      color: 0x09090b, // deep black polyethylene
      roughness: 0.3,
      metalness: 0.1,
    });
    const tank = new THREE.Mesh(tankGeo, tankMat);
    tank.position.y = standH + tankH / 2;
    tank.castShadow = true;
    group.add(tank);

    // Lid
    const lidGeo = new THREE.CylinderGeometry(0.8, 0.77, 0.15, 14);
    const lid = new THREE.Mesh(lidGeo, tankMat);
    lid.position.y = standH + tankH + 0.08;
    group.add(lid);

    return group;
  }
}
