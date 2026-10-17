import * as THREE from 'three';
import { AABB } from '../CollisionWorld';
import { LagosProps } from './LagosProps';

export type LagosArchitecturalStyle =
  'COMMERCIAL_TOWER' | 'AFRO_BRAZILIAN' | 'MARKET_STOREFRONT' | 'MODERN_OFFICE';

export interface BuildingOptions {
  name: string;
  x: number;
  z: number;
  width: number;
  height: number;
  depth: number;
  color: number;
  trimColor?: number;
  accentColor?: number;
  entranceSide?: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST';
  style?: LagosArchitecturalStyle;
  storefrontName?: string;
  awningColors?: [number, number];
  hasWaterTank?: boolean;
  hasBalcony?: boolean;
  roofEquipment?: boolean;
}

/**
 * Building entity generator supporting historic Lagos Island architectural styles:
 * - Afro-Brazilian heritage residential buildings with arched windows and balconies
 * - Multi-storey commercial office towers with window ribbons and rooftop equipment
 * - Market storefronts with roll-down metal shutters and striped awnings
 * - Modern commercial office structures
 */
export class Building {
  private group: THREE.Group;
  private boundingBox: AABB;
  private name: string;

  constructor(options: BuildingOptions) {
    this.name = options.name;
    this.group = new THREE.Group();
    this.group.name = `Building_${options.name}`;
    this.group.position.set(options.x, 0, options.z);

    const halfW = options.width / 2;
    const halfD = options.depth / 2;

    // Calculate AABB in world coordinates
    this.boundingBox = {
      minX: options.x - halfW,
      maxX: options.x + halfW,
      minZ: options.z - halfD,
      maxZ: options.z + halfD,
      label: options.name,
    };

    const style = options.style ?? 'MODERN_OFFICE';

    // 1. Main Facade Block
    const mainGeo = new THREE.BoxGeometry(options.width, options.height, options.depth);
    const mainMat = new THREE.MeshStandardMaterial({
      color: options.color,
      roughness: style === 'COMMERCIAL_TOWER' ? 0.3 : 0.8,
      metalness: style === 'COMMERCIAL_TOWER' ? 0.4 : 0.1,
    });
    const mainMesh = new THREE.Mesh(mainGeo, mainMat);
    mainMesh.position.y = options.height / 2;
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    this.group.add(mainMesh);

    // 2. Base / Plinth Molding (Common in Lagos Island street architecture)
    const baseH = 0.8;
    const baseGeo = new THREE.BoxGeometry(options.width + 0.15, baseH, options.depth + 0.15);
    const baseMat = new THREE.MeshStandardMaterial({
      color: options.trimColor ?? 0x334155,
      roughness: 0.9,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = baseH / 2;
    baseMesh.receiveShadow = true;
    this.group.add(baseMesh);

    // 3. Roof Trim Accent & Parapet
    const trimHeight = 0.5;
    const trimMargin = 0.3;
    const trimGeo = new THREE.BoxGeometry(
      options.width + trimMargin,
      trimHeight,
      options.depth + trimMargin
    );
    const trimMat = new THREE.MeshStandardMaterial({
      color: options.trimColor ?? 0x0f172a,
      roughness: 0.5,
      metalness: 0.4,
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = options.height + trimHeight / 2;
    trimMesh.castShadow = true;
    this.group.add(trimMesh);

    // 4. Style-Specific Architectural Features
    if (style === 'AFRO_BRAZILIAN') {
      this.buildAfroBrazilianDetails(options);
    } else if (style === 'MARKET_STOREFRONT') {
      this.buildMarketStorefrontDetails(options);
    } else if (style === 'COMMERCIAL_TOWER') {
      this.buildCommercialTowerDetails(options);
    } else {
      this.addWindowAccents(options);
    }

    // 5. Entrance Canopy & Indicator (if specified)
    const entranceSide = options.entranceSide ?? 'SOUTH';
    this.addEntranceFeature(options, entranceSide);

    // 6. Rooftop Water Tank (ubiquitous black GeePee/Storex tank)
    if (options.hasWaterTank) {
      const tank = LagosProps.createWaterTank(
        options.width / 4,
        options.height + trimHeight,
        -options.depth / 4
      );
      this.group.add(tank);
    }

    // 7. Rooftop Equipment (for commercial towers / modern offices)
    if (options.roofEquipment || style === 'COMMERCIAL_TOWER') {
      this.buildRoofEquipment(options);
    }
  }

  /**
   * Adds historic Afro-Brazilian architectural features:
   * Arched window hoods, second-floor decorative balcony with wrought-iron railings.
   */
  private buildAfroBrazilianDetails(options: BuildingOptions): void {
    const halfD = options.depth / 2;
    const halfW = options.width / 2;

    // Arched Window Hoods & Frames
    const winMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      opacity: 0.6,
      transparent: true,
    });
    const hoodMat = new THREE.MeshStandardMaterial({
      color: options.trimColor ?? 0x78350f,
      roughness: 0.7,
    });

    const winGeo = new THREE.PlaneGeometry(1.2, 1.8);
    const hoodGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.15, 8, 1, false, 0, Math.PI);

    const floors = Math.max(1, Math.floor(options.height / 3.8));
    for (let f = 1; f <= floors; f++) {
      const y = f * 3.6;
      if (y >= options.height - 1.5) continue;

      [-halfW * 0.5, halfW * 0.5].forEach(wx => {
        // Window glass
        const win = new THREE.Mesh(winGeo, winMat);
        win.position.set(wx, y, halfD + 0.03);
        this.group.add(win);

        // Decorative arch hood above window
        const hood = new THREE.Mesh(hoodGeo, hoodMat);
        hood.rotation.z = Math.PI / 2;
        hood.position.set(wx, y + 1.0, halfD + 0.08);
        this.group.add(hood);
      });
    }

    // Projecting Balcony on 2nd Floor
    if (options.hasBalcony !== false) {
      const balconyY = 4.0;
      const balcGeo = new THREE.BoxGeometry(options.width * 0.7, 0.25, 1.4);
      const balcMat = new THREE.MeshStandardMaterial({ color: options.trimColor ?? 0x475569 });
      const balcony = new THREE.Mesh(balcGeo, balcMat);
      balcony.position.set(0, balconyY, halfD + 0.7);
      balcony.castShadow = true;
      this.group.add(balcony);

      // Wrought-iron style railing
      const railGeo = new THREE.BoxGeometry(options.width * 0.7, 0.9, 0.06);
      const railMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.8 });
      const frontRail = new THREE.Mesh(railGeo, railMat);
      frontRail.position.set(0, balconyY + 0.55, halfD + 1.37);
      this.group.add(frontRail);
    }
  }

  /**
   * Adds Market Storefront features:
   * Ground-floor roll-down metal shutters, colorful striped awning, and painted shop signboard.
   */
  private buildMarketStorefrontDetails(options: BuildingOptions): void {
    const halfD = options.depth / 2;
    const halfW = options.width / 2;
    const groundH = 3.2;

    // 1. Roll-Down Metal Security Shutters on Ground Floor
    const shutterMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // galvanized corrugated steel
      roughness: 0.6,
      metalness: 0.5,
    });
    const shutterGeo = new THREE.BoxGeometry(options.width * 0.4, 2.5, 0.1);

    const s1 = new THREE.Mesh(shutterGeo, shutterMat);
    s1.position.set(-halfW * 0.45, groundH / 2, halfD + 0.04);
    const s2 = new THREE.Mesh(shutterGeo, shutterMat);
    s2.position.set(halfW * 0.45, groundH / 2, halfD + 0.04);
    this.group.add(s1, s2);

    // 2. Projecting Striped Awning above storefront
    const awningW = options.width + 0.2;
    const awningD = 1.6;
    const awningGroup = new THREE.Group();
    awningGroup.position.set(0, groundH + 0.2, halfD + 0.8);
    awningGroup.rotation.x = 0.25; // slant downward

    const color1 = options.awningColors ? options.awningColors[0] : 0xd97706; // amber
    const color2 = options.awningColors ? options.awningColors[1] : 0x15803d; // green
    const stripeCount = 8;
    const stripeW = awningW / stripeCount;
    const stripeGeo = new THREE.BoxGeometry(stripeW, 0.05, awningD);
    const mat1 = new THREE.MeshStandardMaterial({ color: color1, roughness: 0.5 });
    const mat2 = new THREE.MeshStandardMaterial({ color: color2, roughness: 0.5 });

    for (let i = 0; i < stripeCount; i++) {
      const s = new THREE.Mesh(stripeGeo, i % 2 === 0 ? mat1 : mat2);
      s.position.x = -awningW / 2 + (i + 0.5) * stripeW;
      s.castShadow = true;
      awningGroup.add(s);
    }
    this.group.add(awningGroup);

    // 3. Shop Signboard
    const signW = options.width * 0.85;
    const signH = 0.65;
    const signGeo = new THREE.BoxGeometry(signW, signH, 0.15);
    const signMat = new THREE.MeshStandardMaterial({
      color: options.accentColor ?? 0xfacc15,
      roughness: 0.3,
    });
    const sign = new THREE.Mesh(signGeo, signMat);
    sign.position.set(0, groundH + 1.2, halfD + 0.1);
    this.group.add(sign);

    // Sign trim border
    const signBorderGeo = new THREE.BoxGeometry(signW + 0.1, signH + 0.1, 0.1);
    const signBorderMat = new THREE.MeshBasicMaterial({ color: 0x0f172a });
    const signBorder = new THREE.Mesh(signBorderGeo, signBorderMat);
    signBorder.position.set(0, groundH + 1.2, halfD + 0.06);
    this.group.add(signBorder);

    // Upper Floor Windows
    this.addWindowAccents(options, groundH + 1.6);
  }

  /**
   * Adds Commercial Tower features:
   * Repeating horizontal window ribbons with tinted glass and vertical structural mullions.
   */
  private buildCommercialTowerDetails(options: BuildingOptions): void {
    const halfD = options.depth / 2;
    const winRibbonMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Corporate blue reflective glass
      roughness: 0.1,
      metalness: 0.8,
    });

    const floors = Math.max(2, Math.floor(options.height / 3.0));
    const ribbonH = 1.3;
    const ribbonGeo = new THREE.BoxGeometry(options.width * 0.85, ribbonH, 0.08);

    for (let f = 1; f < floors; f++) {
      const y = f * 3.0;
      if (y >= options.height - 1.5) continue;

      const ribbon = new THREE.Mesh(ribbonGeo, winRibbonMat);
      ribbon.position.set(0, y, halfD + 0.03);
      this.group.add(ribbon);

      // Back side window ribbon
      const backRibbon = new THREE.Mesh(ribbonGeo, winRibbonMat);
      backRibbon.position.set(0, y, -halfD - 0.03);
      this.group.add(backRibbon);
    }
  }

  /**
   * Adds rooftop mechanical equipment:
   * AC chiller boxes, telecommunications antenna mast.
   */
  private buildRoofEquipment(options: BuildingOptions): void {
    const roofY = options.height + 0.5;

    // AC Chiller Box
    const chillerGeo = new THREE.BoxGeometry(2.5, 1.2, 2.0);
    const chillerMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.6,
      roughness: 0.5,
    });
    const chiller = new THREE.Mesh(chillerGeo, chillerMat);
    chiller.position.set(-options.width / 4, roofY + 0.6, 0);
    chiller.castShadow = true;
    this.group.add(chiller);

    // Rooftop Antenna Mast
    const mastGeo = new THREE.CylinderGeometry(0.06, 0.1, 4.5, 8);
    const mastMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.8 });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(options.width / 4, roofY + 2.25, 0);
    this.group.add(mast);

    // Antenna Beacon Light
    const beaconGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const beaconMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(options.width / 4, roofY + 4.5, 0);
    this.group.add(beacon);
  }

  private addEntranceFeature(
    options: BuildingOptions,
    side: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'
  ): void {
    const halfW = options.width / 2;
    const halfD = options.depth / 2;
    const doorW = 2.4;
    const doorH = 3.0;

    const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.2);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Glass door tone
      roughness: 0.2,
      metalness: 0.8,
    });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);

    const signGeo = new THREE.BoxGeometry(doorW + 0.8, 0.5, 0.4);
    const signMat = new THREE.MeshBasicMaterial({
      color: options.accentColor ?? 0x38bdf8,
    });
    const signMesh = new THREE.Mesh(signGeo, signMat);

    // Overhead Entrance Canopy Slab
    const canopyGeo = new THREE.BoxGeometry(doorW + 1.2, 0.2, 1.6);
    const canopyMat = new THREE.MeshStandardMaterial({
      color: options.trimColor ?? 0x0f172a,
      metalness: 0.5,
      roughness: 0.4,
    });
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    canopyMesh.castShadow = true;

    if (side === 'SOUTH') {
      doorMesh.position.set(0, doorH / 2, halfD + 0.05);
      signMesh.position.set(0, doorH + 0.4, halfD + 0.15);
      canopyMesh.position.set(0, doorH + 0.1, halfD + 0.8);
    } else if (side === 'NORTH') {
      doorMesh.position.set(0, doorH / 2, -halfD - 0.05);
      signMesh.position.set(0, doorH + 0.4, -halfD - 0.15);
      canopyMesh.position.set(0, doorH + 0.1, -halfD - 0.8);
    } else if (side === 'EAST') {
      doorMesh.rotation.y = Math.PI / 2;
      doorMesh.position.set(halfW + 0.05, doorH / 2, 0);
      signMesh.rotation.y = Math.PI / 2;
      signMesh.position.set(halfW + 0.15, doorH + 0.4, 0);
      canopyMesh.rotation.y = Math.PI / 2;
      canopyMesh.position.set(halfW + 0.8, doorH + 0.1, 0);
    } else {
      doorMesh.rotation.y = -Math.PI / 2;
      doorMesh.position.set(-halfW - 0.05, doorH / 2, 0);
      signMesh.rotation.y = -Math.PI / 2;
      signMesh.position.set(-halfW - 0.15, doorH + 0.4, 0);
      canopyMesh.rotation.y = -Math.PI / 2;
      canopyMesh.position.set(-halfW - 0.8, doorH + 0.1, 0);
    }

    this.group.add(doorMesh);
    this.group.add(signMesh);
    this.group.add(canopyMesh);
  }

  private addWindowAccents(options: BuildingOptions, startY?: number): void {
    const winMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a, // Warm illuminated windows
      transparent: true,
      opacity: 0.5,
    });

    const rows = Math.max(1, Math.floor(options.height / 3.5));
    const winGeo = new THREE.PlaneGeometry(1.0, 1.2);
    const initialY = startY ?? 3.2;

    for (let r = 1; r <= rows; r++) {
      const y = initialY + (r - 1) * 3.2;
      if (y >= options.height - 1) continue;

      // Front side windows
      const w1 = new THREE.Mesh(winGeo, winMat);
      w1.position.set(-options.width / 4, y, options.depth / 2 + 0.02);
      this.group.add(w1);

      const w2 = new THREE.Mesh(winGeo, winMat);
      w2.position.set(options.width / 4, y, options.depth / 2 + 0.02);
      this.group.add(w2);
    }
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  public getBoundingBox(): AABB {
    return { ...this.boundingBox };
  }

  public getName(): string {
    return this.name;
  }

  public dispose(): void {
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();

    this.group.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry) geometries.add(obj.geometry);
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach(m => materials.add(m));
          } else {
            materials.add(obj.material);
          }
        }
      }
    });

    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());

    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
