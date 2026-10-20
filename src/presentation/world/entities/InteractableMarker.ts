import * as THREE from 'three';

export class InteractableMarker {
  private group: THREE.Group;
  private ringMesh: THREE.Mesh;
  private beaconMesh: THREE.Mesh;
  private elapsed = 0;

  constructor(x: number, z: number, color: number = 0x38bdf8, label?: string) {
    this.group = new THREE.Group();
    this.group.name = `InteractableMarker_${label ?? 'target'}`;
    this.group.position.set(x, 0, z);

    // 1. Ground Circle Marker
    const ringGeo = new THREE.RingGeometry(0.8, 1.0, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    this.ringMesh = new THREE.Mesh(ringGeo, ringMat);
    this.ringMesh.rotation.x = -Math.PI / 2;
    this.ringMesh.position.y = 0.03;
    this.group.add(this.ringMesh);

    // 2. Floating Diamond / Tech Indicator
    const beaconGeo = new THREE.OctahedronGeometry(0.3, 0);
    const beaconMat = new THREE.MeshBasicMaterial({
      color,
      wireframe: true,
    });
    this.beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
    this.beaconMesh.position.y = 1.3;
    this.group.add(this.beaconMesh);
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  public setBeaconVisible(visible: boolean): void {
    this.beaconMesh.visible = visible;
  }

  public update(deltaTime: number): void {
    this.elapsed += deltaTime;
    this.beaconMesh.rotation.y += deltaTime * 1.5;
    this.beaconMesh.position.y = 1.3 + Math.sin(this.elapsed * 3) * 0.12;
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
