import * as THREE from 'three';

export class PlayerAvatar {
  private group: THREE.Group;
  private bodyMesh: THREE.Mesh;
  private headMesh: THREE.Mesh;
  private visorMesh: THREE.Mesh;
  private shadowDecalMesh: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'PlayerAvatar';

    // 1. Stylized Torso/Body (Cyber jacket style)
    const bodyGeo = new THREE.CylinderGeometry(0.35, 0.32, 1.0, 16);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Slate navy cyberjacket
      roughness: 0.5,
      metalness: 0.3,
    });
    this.bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    this.bodyMesh.position.y = 0.85;
    this.bodyMesh.castShadow = true;
    this.group.add(this.bodyMesh);

    // 2. Head
    const headGeo = new THREE.SphereGeometry(0.24, 16, 16);
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.7,
      metalness: 0.1,
    });
    this.headMesh = new THREE.Mesh(headGeo, headMat);
    this.headMesh.position.y = 1.55;
    this.headMesh.castShadow = true;
    this.group.add(this.headMesh);

    // 3. Cybernetic Visor / Directional Indicator (Forward-facing on -Z or +Z)
    // In our coordinate system, facing direction vector is forward (along -Z by default in Three.js)
    const visorGeo = new THREE.BoxGeometry(0.3, 0.1, 0.18);
    const visorMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8, // Cyan neon visor
    });
    this.visorMesh = new THREE.Mesh(visorGeo, visorMat);
    this.visorMesh.position.set(0, 1.55, 0.18);
    this.group.add(this.visorMesh);

    // 4. Subtle Ground Shadow / Ring
    const shadowGeo = new THREE.RingGeometry(0.1, 0.45, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide,
    });
    this.shadowDecalMesh = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowDecalMesh.rotation.x = -Math.PI / 2;
    this.shadowDecalMesh.position.y = 0.02;
    this.group.add(this.shadowDecalMesh);
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

  public dispose(): void {
    this.group.traverse(obj => {
      if (obj instanceof THREE.Mesh) {
        if (obj.geometry) {
          obj.geometry.dispose();
        }
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
