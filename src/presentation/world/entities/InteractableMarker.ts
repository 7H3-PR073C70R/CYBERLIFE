import * as THREE from 'three';

export interface InteractableMarkerOptions {
  color?: number;
  label?: string;
  isFloorOnly?: boolean;
  radius?: number;
  beaconHeight?: number;
}

export class InteractableMarker {
  private group: THREE.Group;
  private ringMesh: THREE.Mesh;
  private innerRingMesh: THREE.Mesh;
  private beaconMesh: THREE.Mesh | null = null;
  private elapsed = 0;
  private baseBeaconY: number;

  constructor(
    x: number,
    z: number,
    color: number = 0x38bdf8,
    labelOrOptions?: string | InteractableMarkerOptions
  ) {
    const options: InteractableMarkerOptions =
      typeof labelOrOptions === 'object' && labelOrOptions !== null
        ? labelOrOptions
        : { label: typeof labelOrOptions === 'string' ? labelOrOptions : undefined };

    const markerColor = options.color ?? color;
    const isFloorOnly = options.isFloorOnly ?? false;
    const radius = options.radius ?? 0.85;
    this.baseBeaconY = options.beaconHeight ?? 2.15;

    this.group = new THREE.Group();
    this.group.name = `InteractableMarker_${options.label ?? 'target'}`;
    this.group.position.set(x, 0, z);

    // 1. Sleek Outer Ground Ring (flush with ground at y = 0.02)
    const ringGeo = new THREE.RingGeometry(radius * 0.82, radius, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: markerColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    });
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.x = -Math.PI / 2;
    this.ringMesh.position.y = 0.02;
    this.group.add(this.ringMesh);

    // 2. Subtle Inner Concentric Reticle Ring
    const innerRingGeo = new THREE.RingGeometry(radius * 0.35, radius * 0.44, 24);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: markerColor,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    });
    this.innerRingMesh = new THREE.Mesh(innerRingGeo, innerRingMat);
    this.innerRingMesh.rotation.x = -Math.PI / 2;
    this.innerRingMesh.position.y = 0.022;
    this.group.add(this.innerRingMesh);

    // 3. Compact Holographic Tech Diamond (unobtrusive, placed above head level)
    if (!isFloorOnly) {
      const beaconGeo = new THREE.OctahedronGeometry(0.1, 0);
      const beaconMat = new THREE.MeshStandardMaterial({
        color: markerColor,
        emissive: new THREE.Color(markerColor),
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.8,
        transparent: true,
        opacity: 0.85,
      });
      this.beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
      this.beaconMesh.position.y = this.baseBeaconY;
      this.group.add(this.beaconMesh);
    }
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  public setBeaconVisible(visible: boolean): void {
    if (this.beaconMesh) {
      this.beaconMesh.visible = visible;
    }
  }

  public update(deltaTime: number): void {
    this.elapsed += deltaTime;
    // Gentle rotation of inner ground ring
    this.innerRingMesh.rotation.z += deltaTime * 0.5;

    // Subtle pulsing ground ring opacity
    const pulse = 0.45 + Math.sin(this.elapsed * 2.5) * 0.15;
    (this.ringMesh.material as THREE.MeshBasicMaterial).opacity = pulse;

    // Smooth hover bobbing for overhead holographic marker
    if (this.beaconMesh && this.beaconMesh.visible) {
      this.beaconMesh.rotation.y += deltaTime * 1.8;
      this.beaconMesh.rotation.z = Math.sin(this.elapsed * 1.5) * 0.1;
      this.beaconMesh.position.y = this.baseBeaconY + Math.sin(this.elapsed * 2.2) * 0.06;
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

