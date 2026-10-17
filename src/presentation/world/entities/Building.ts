import * as THREE from 'three';
import { AABB } from '../CollisionWorld';

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
}

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

    // 1. Main Facade Block
    const mainGeo = new THREE.BoxGeometry(options.width, options.height, options.depth);
    const mainMat = new THREE.MeshStandardMaterial({
      color: options.color,
      roughness: 0.7,
      metalness: 0.2,
    });
    const mainMesh = new THREE.Mesh(mainGeo, mainMat);
    mainMesh.position.y = options.height / 2;
    mainMesh.castShadow = true;
    mainMesh.receiveShadow = true;
    this.group.add(mainMesh);

    // 2. Roof Trim Accent
    const trimHeight = 0.4;
    const trimMargin = 0.3;
    const trimGeo = new THREE.BoxGeometry(
      options.width + trimMargin,
      trimHeight,
      options.depth + trimMargin
    );
    const trimMat = new THREE.MeshStandardMaterial({
      color: options.trimColor ?? 0x0f172a,
      roughness: 0.5,
      metalness: 0.5,
    });
    const trimMesh = new THREE.Mesh(trimGeo, trimMat);
    trimMesh.position.y = options.height + trimHeight / 2;
    trimMesh.castShadow = true;
    this.group.add(trimMesh);

    // 3. Entrance Canopy & Indicator (if specified)
    const entranceSide = options.entranceSide ?? 'SOUTH';
    this.addEntranceFeature(options, entranceSide);

    // 4. Window Grid Accents
    this.addWindowAccents(options);
  }

  private addEntranceFeature(
    options: BuildingOptions,
    side: 'NORTH' | 'SOUTH' | 'EAST' | 'WEST'
  ): void {
    const halfW = options.width / 2;
    const halfD = options.depth / 2;
    const doorW = 2.2;
    const doorH = 2.8;

    const doorGeo = new THREE.BoxGeometry(doorW, doorH, 0.2);
    const doorMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Glass door tone
      roughness: 0.2,
      metalness: 0.8,
    });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);

    const signGeo = new THREE.BoxGeometry(doorW + 0.6, 0.45, 0.3);
    const signMat = new THREE.MeshBasicMaterial({
      color: options.accentColor ?? 0x38bdf8,
    });
    const signMesh = new THREE.Mesh(signGeo, signMat);

    if (side === 'SOUTH') {
      doorMesh.position.set(0, doorH / 2, halfD + 0.05);
      signMesh.position.set(0, doorH + 0.35, halfD + 0.15);
    } else if (side === 'NORTH') {
      doorMesh.position.set(0, doorH / 2, -halfD - 0.05);
      signMesh.position.set(0, doorH + 0.35, -halfD - 0.15);
    } else if (side === 'EAST') {
      doorMesh.rotation.y = Math.PI / 2;
      doorMesh.position.set(halfW + 0.05, doorH / 2, 0);
      signMesh.rotation.y = Math.PI / 2;
      signMesh.position.set(halfW + 0.15, doorH + 0.35, 0);
    } else {
      doorMesh.rotation.y = -Math.PI / 2;
      doorMesh.position.set(-halfW - 0.05, doorH / 2, 0);
      signMesh.rotation.y = -Math.PI / 2;
      signMesh.position.set(-halfW - 0.15, doorH + 0.35, 0);
    }

    this.group.add(doorMesh);
    this.group.add(signMesh);
  }

  private addWindowAccents(options: BuildingOptions): void {
    const winMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a, // Warm illuminated windows
      transparent: true,
      opacity: 0.5,
    });

    const rows = Math.max(1, Math.floor(options.height / 3.5));
    const winGeo = new THREE.PlaneGeometry(1.0, 1.2);

    for (let r = 1; r <= rows; r++) {
      const y = r * 3.2;
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
