import * as THREE from 'three';

export interface TrafficVehicle {
  group: THREE.Group;
  type: 'DANFO' | 'SEDAN';
  wheels: THREE.Mesh[];
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
}

export class TrafficSystem {
  private group: THREE.Group;
  private vehicles: TrafficVehicle[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'TrafficSystem';

    this.spawnVehicles();
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  private spawnVehicles(): void {
    // 1. Southbound Broad Street Danfo Minibus (Iconic yellow with black stripes)
    const danfo1 = this.createDanfoMesh();
    this.vehicles.push({
      group: danfo1.mesh,
      type: 'DANFO',
      wheels: danfo1.wheels,
      position: new THREE.Vector3(-2.4, 0, -34),
      direction: new THREE.Vector3(0, 0, 1),
      speed: 6.5,
      startPos: new THREE.Vector3(-2.4, 0, -36),
      endPos: new THREE.Vector3(-2.4, 0, 18),
    });
    this.group.add(danfo1.mesh);

    // 2. Northbound Broad Street Sedan (Sleek tech silver)
    const sedan1 = this.createSedanMesh(0x94a3b8);
    this.vehicles.push({
      group: sedan1.mesh,
      type: 'SEDAN',
      wheels: sedan1.wheels,
      position: new THREE.Vector3(2.4, 0, 16),
      direction: new THREE.Vector3(0, 0, -1),
      speed: 7.2,
      startPos: new THREE.Vector3(2.4, 0, 18),
      endPos: new THREE.Vector3(2.4, 0, -36),
    });
    this.group.add(sedan1.mesh);

    // 3. Eastbound Marina Road Danfo Minibus
    const danfo2 = this.createDanfoMesh();
    this.vehicles.push({
      group: danfo2.mesh,
      type: 'DANFO',
      wheels: danfo2.wheels,
      position: new THREE.Vector3(-34, 0, 28.5),
      direction: new THREE.Vector3(1, 0, 0),
      speed: 8.0,
      startPos: new THREE.Vector3(-36, 0, 28.5),
      endPos: new THREE.Vector3(36, 0, 28.5),
    });
    this.group.add(danfo2.mesh);

    // 4. Westbound Marina Road Sedan (Deep corporate emerald)
    const sedan2 = this.createSedanMesh(0x064e3b);
    this.vehicles.push({
      group: sedan2.mesh,
      type: 'SEDAN',
      wheels: sedan2.wheels,
      position: new THREE.Vector3(32, 0, 23.5),
      direction: new THREE.Vector3(-1, 0, 0),
      speed: 7.8,
      startPos: new THREE.Vector3(36, 0, 23.5),
      endPos: new THREE.Vector3(-36, 0, 23.5),
    });
    this.group.add(sedan2.mesh);
  }

  private createDanfoMesh(): { mesh: THREE.Group; wheels: THREE.Mesh[] } {
    const vGroup = new THREE.Group();
    const wheels: THREE.Mesh[] = [];

    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15, // Authentic Lagos Danfo yellow
      roughness: 0.4,
      metalness: 0.2,
    });
    const blackStripeMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Twin black racing stripes
      roughness: 0.5,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.1,
      metalness: 0.9,
    });
    const bumperMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      metalness: 0.3,
    });
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.9,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.3,
    });

    // Lower Chassis Body
    const bodyLower = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.9, 4.4), yellowMat);
    bodyLower.position.y = 0.85;
    bodyLower.castShadow = true;
    bodyLower.receiveShadow = true;
    vGroup.add(bodyLower);

    // Twin Black Racing Stripes
    const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.1, 4.42), blackStripeMat);
    stripe1.position.y = 0.85;
    vGroup.add(stripe1);

    const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(2.02, 0.1, 4.42), blackStripeMat);
    stripe2.position.y = 1.05;
    vGroup.add(stripe2);

    // Upper Cabin & Roof
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.9, 4.2), yellowMat);
    cabin.position.y = 1.7;
    cabin.castShadow = true;
    vGroup.add(cabin);

    // Windshield & Windows
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.6, 0.1), glassMat);
    windshield.position.set(0, 1.65, 2.06);
    vGroup.add(windshield);

    const rearWindow = new THREE.Mesh(new THREE.BoxGeometry(1.82, 0.55, 0.1), glassMat);
    rearWindow.position.set(0, 1.65, -2.06);
    vGroup.add(rearWindow);

    // Bumpers
    const fBumper = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.22, 0.2), bumperMat);
    fBumper.position.set(0, 0.5, 2.22);
    vGroup.add(fBumper);

    const rBumper = new THREE.Mesh(new THREE.BoxGeometry(2.04, 0.22, 0.2), bumperMat);
    rBumper.position.set(0, 0.5, -2.22);
    vGroup.add(rBumper);

    // Headlights (Glowing warm white)
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-0.75, 0.75].forEach(hx => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.05), headlightMat);
      hl.position.set(hx, 0.75, 2.21);
      vGroup.add(hl);
    });

    // Taillights (Red)
    const taillightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    [-0.75, 0.75].forEach(hx => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.05), taillightMat);
      tl.position.set(hx, 0.75, -2.21);
      vGroup.add(tl);
    });

    // 4 Wheels
    const wheelPositions: [number, number, number][] = [
      [-1.02, 0.38, 1.3],
      [1.02, 0.38, 1.3],
      [-1.02, 0.38, -1.3],
      [1.02, 0.38, -1.3],
    ];

    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(wx, wy, wz);

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.24, 16), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.25, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      vGroup.add(wheelGroup);
      wheels.push(tire);
    });

    return { mesh: vGroup, wheels };
  }

  private createSedanMesh(color: number): { mesh: THREE.Group; wheels: THREE.Mesh[] } {
    const vGroup = new THREE.Group();
    const wheels: THREE.Mesh[] = [];

    const carMat = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
      metalness: 0.6,
    });
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.95,
    });
    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.9,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.2,
    });

    // Lower Aerodynamic Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 4.2), carMat);
    chassis.position.y = 0.55;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    vGroup.add(chassis);

    // Sloped Glass Cabin
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.52, 2.2), glassMat);
    cabin.position.set(0, 1.05, -0.2);
    cabin.castShadow = true;
    vGroup.add(cabin);

    // Roof Top
    const roof = new THREE.Mesh(new THREE.BoxGeometry(1.48, 0.05, 1.8), carMat);
    roof.position.set(0, 1.32, -0.2);
    roof.castShadow = true;
    vGroup.add(roof);

    // Headlights & Taillights
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    [-0.65, 0.65].forEach(hx => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.05), hlMat);
      hl.position.set(hx, 0.58, 2.11);
      vGroup.add(hl);
    });

    const tlMat = new THREE.MeshBasicMaterial({ color: 0xdc2626 });
    [-0.65, 0.65].forEach(hx => {
      const tl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.05), tlMat);
      tl.position.set(hx, 0.58, -2.11);
      vGroup.add(tl);
    });

    // 4 Wheels
    const wheelPositions: [number, number, number][] = [
      [-0.92, 0.32, 1.2],
      [0.92, 0.32, 1.2],
      [-0.92, 0.32, -1.2],
      [0.92, 0.32, -1.2],
    ];

    wheelPositions.forEach(([wx, wy, wz]) => {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(wx, wy, wz);

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.22, 16), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wheelGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.23, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wheelGroup.add(rim);

      vGroup.add(wheelGroup);
      wheels.push(tire);
    });

    return { mesh: vGroup, wheels };
  }

  public update(deltaTime: number): void {
    this.vehicles.forEach(v => {
      const moveStep = v.speed * deltaTime;

      v.position.x += v.direction.x * moveStep;
      v.position.z += v.direction.z * moveStep;

      // Check loop boundary
      let reset = false;
      if (v.direction.z > 0 && v.position.z > v.endPos.z) reset = true;
      else if (v.direction.z < 0 && v.position.z < v.endPos.z) reset = true;
      else if (v.direction.x > 0 && v.position.x > v.endPos.x) reset = true;
      else if (v.direction.x < 0 && v.position.x < v.endPos.x) reset = true;

      if (reset) {
        v.position.copy(v.startPos);
      }

      v.group.position.copy(v.position);

      // Rotate vehicle heading towards movement direction
      const heading = Math.atan2(v.direction.x, v.direction.z);
      v.group.rotation.y = heading;

      // Rotate wheels as car moves
      const wheelRotation = moveStep / 0.35;
      v.wheels.forEach(w => {
        w.rotation.x += wheelRotation;
      });
    });
  }

  public setVisible(visible: boolean): void {
    this.group.visible = visible;
  }

  public dispose(): void {
    this.vehicles.forEach(v => {
      v.group.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
            else obj.material.dispose();
          }
        }
      });
    });
    this.vehicles = [];
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
