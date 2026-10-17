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
   * Builds tropical royal palm trees for Tinubu Square and Marina promenade.
   */
  public static createPalmTree(x: number, z: number, height = 5.5): THREE.Group {
    const group = new THREE.Group();
    group.name = 'PalmTree';
    group.position.set(x, 0, z);

    // Segmented curved trunk
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3e2b, roughness: 0.9 });
    const segments = 6;
    const segH = height / segments;

    for (let i = 0; i < segments; i++) {
      const radius = 0.22 - i * 0.02;
      const segGeo = new THREE.CylinderGeometry(radius * 0.85, radius, segH, 8);
      const seg = new THREE.Mesh(segGeo, trunkMat);
      seg.position.y = i * segH + segH / 2;
      // Slight tropical curve
      seg.position.x = Math.sin((i / segments) * 1.2) * 0.25;
      group.add(seg);
    }

    // Spreading Fronds at crown
    const frondMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.6,
      side: THREE.DoubleSide,
    });
    const frondGeo = new THREE.ConeGeometry(0.7, 3.2, 5);

    const frondCount = 8;
    for (let f = 0; f < frondCount; f++) {
      const angle = (f / frondCount) * Math.PI * 2;
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(Math.cos(angle) * 1.2, height - 0.2, Math.sin(angle) * 1.2);
      frond.rotation.z = Math.cos(angle) * 0.85;
      frond.rotation.x = Math.sin(angle) * 0.85;
      frond.rotation.y = angle;
      group.add(frond);
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
