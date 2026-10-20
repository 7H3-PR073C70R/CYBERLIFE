import * as THREE from 'three';
import { AssetLoader } from '../AssetLoader';

export type TrafficVehicleType = 'DANFO' | 'SUV' | 'SEDAN' | 'DELIVERY';

export interface TrafficVehicle {
  group: THREE.Group;
  bodyRoot: THREE.Group;
  type: TrafficVehicleType;
  wheels: THREE.Object3D[];
  brakeLights: THREE.Mesh[];
  position: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  cruiseSpeed: number;
  startPos: THREE.Vector3;
  endPos: THREE.Vector3;
  isYielding: boolean;
  wheelRadius: number;
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
    // 1. Southbound Broad Street Danfo Minibus (Iconic yellow Toyota HiAce with twin black stripes)
    const danfo1 = this.createProceduralVehicle('DANFO', 0xfacc15);
    const v1: TrafficVehicle = {
      group: danfo1.group,
      bodyRoot: danfo1.bodyRoot,
      type: 'DANFO',
      wheels: danfo1.wheels,
      brakeLights: danfo1.brakeLights,
      position: new THREE.Vector3(-2.4, 0, -32),
      direction: new THREE.Vector3(0, 0, 1),
      speed: 6.5,
      cruiseSpeed: 6.5,
      startPos: new THREE.Vector3(-2.4, 0, -34),
      endPos: new THREE.Vector3(-2.4, 0, 18),
      isYielding: false,
      wheelRadius: 0.36,
    };
    this.vehicles.push(v1);
    this.group.add(v1.group);
    this.loadGlbVehicle(v1, '/assets/vehicles/van.glb', 1.25, 0xfacc15, true);

    // 2. Northbound Broad Street Executive Luxury SUV (Metallic Obsidian Black Range Rover / Prado)
    const suv1 = this.createProceduralVehicle('SUV', 0x0f172a);
    const v2: TrafficVehicle = {
      group: suv1.group,
      bodyRoot: suv1.bodyRoot,
      type: 'SUV',
      wheels: suv1.wheels,
      brakeLights: suv1.brakeLights,
      position: new THREE.Vector3(2.4, 0, 16),
      direction: new THREE.Vector3(0, 0, -1),
      speed: 7.2,
      cruiseSpeed: 7.2,
      startPos: new THREE.Vector3(2.4, 0, 18),
      endPos: new THREE.Vector3(2.4, 0, -34),
      isYielding: false,
      wheelRadius: 0.38,
    };
    this.vehicles.push(v2);
    this.group.add(v2.group);
    this.loadGlbVehicle(v2, '/assets/vehicles/suv.glb', 1.25, 0x0f172a, false);

    // 3. Eastbound Marina Road Danfo Minibus (Waterfront express commercial bus)
    const danfo2 = this.createProceduralVehicle('DANFO', 0xfacc15);
    const v3: TrafficVehicle = {
      group: danfo2.group,
      bodyRoot: danfo2.bodyRoot,
      type: 'DANFO',
      wheels: danfo2.wheels,
      brakeLights: danfo2.brakeLights,
      position: new THREE.Vector3(-32, 0, 28.5),
      direction: new THREE.Vector3(1, 0, 0),
      speed: 8.0,
      cruiseSpeed: 8.0,
      startPos: new THREE.Vector3(-34, 0, 28.5),
      endPos: new THREE.Vector3(34, 0, 28.5),
      isYielding: false,
      wheelRadius: 0.36,
    };
    this.vehicles.push(v3);
    this.group.add(v3.group);
    this.loadGlbVehicle(v3, '/assets/vehicles/van.glb', 1.25, 0xfacc15, true);

    // 4. Westbound Marina Road City Sedan (Sleek tech silver corporate sedan)
    const sedan1 = this.createProceduralVehicle('SEDAN', 0x94a3b8);
    const v4: TrafficVehicle = {
      group: sedan1.group,
      bodyRoot: sedan1.bodyRoot,
      type: 'SEDAN',
      wheels: sedan1.wheels,
      brakeLights: sedan1.brakeLights,
      position: new THREE.Vector3(30, 0, 23.5),
      direction: new THREE.Vector3(-1, 0, 0),
      speed: 7.8,
      cruiseSpeed: 7.8,
      startPos: new THREE.Vector3(34, 0, 23.5),
      endPos: new THREE.Vector3(-34, 0, 23.5),
      isYielding: false,
      wheelRadius: 0.32,
    };
    this.vehicles.push(v4);
    this.group.add(v4.group);
    this.loadGlbVehicle(v4, '/assets/vehicles/sedan.glb', 1.25, 0x94a3b8, false);
  }

  /**
   * Asynchronously loads a real 3D vehicle model and seamlessly replaces the procedural body.
   */
  private async loadGlbVehicle(
    v: TrafficVehicle,
    glbUrl: string,
    scale: number,
    bodyColor: number,
    isDanfo: boolean
  ): Promise<void> {
    try {
      const gltf = await AssetLoader.getInstance().loadGLTF(glbUrl);
      const newModel = gltf;
      newModel.scale.set(scale, scale, scale);

      // Collect new wheels and configure PBR materials
      const newWheels: THREE.Object3D[] = [];
      const newBrakeLights: THREE.Mesh[] = [];

      const danfoYellowMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.35,
        metalness: 0.15,
      });
      const blackStripeMat = new THREE.MeshStandardMaterial({
        color: 0x09090b,
        roughness: 0.5,
        metalness: 0.1,
      });
      const carPaintMat = new THREE.MeshStandardMaterial({
        color: bodyColor,
        roughness: 0.28,
        metalness: 0.65,
      });
      const glassMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.1,
        metalness: 0.9,
      });

      newModel.traverse(node => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.receiveShadow = true;

          const name = (node.name || '').toLowerCase();
          if (name.includes('wheel')) {
            newWheels.push(node);
          } else if (name.includes('body')) {
            if (isDanfo) {
              node.material = danfoYellowMat;
            } else {
              node.material = carPaintMat;
            }
          } else if (name.includes('glass') || name.includes('window')) {
            node.material = glassMat;
          }
        }
      });

      // If Danfo minibus, add the iconic twin black horizontal stripes
      if (isDanfo) {
        const stripe1 = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.08, 3.2), blackStripeMat);
        stripe1.position.y = 0.72;
        newModel.add(stripe1);

        const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.08, 3.2), blackStripeMat);
        stripe2.position.y = 0.9;
        newModel.add(stripe2);
      }

      // Add high-visibility reactive red LED taillights / brake lights
      const brakeMat = new THREE.MeshStandardMaterial({
        color: 0x7f1d1d,
        emissive: new THREE.Color(0x3f0a0a),
        emissiveIntensity: 0.3,
        roughness: 0.2,
      });
      [-0.55, 0.55].forEach(bx => {
        const bl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.04), brakeMat);
        bl.position.set(bx, 0.65, -1.55);
        newModel.add(bl);
        newBrakeLights.push(bl);
      });

      // Add warm white headlights
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      [-0.55, 0.55].forEach(hx => {
        const hl = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.04), hlMat);
        hl.position.set(hx, 0.65, 1.55);
        newModel.add(hl);
      });

      // Swap out procedural meshes
      while (v.bodyRoot.children.length > 0) {
        const c = v.bodyRoot.children[0];
        if (c) v.bodyRoot.remove(c);
      }
      v.bodyRoot.add(newModel);

      if (newWheels.length > 0) {
        v.wheels = newWheels;
      }
      if (newBrakeLights.length > 0) {
        v.brakeLights = newBrakeLights;
      }
    } catch {
      // Procedural model remains as reliable immediate fallback
    }
  }

  /**
   * Creates an immediate high-fidelity procedural vehicle mesh.
   */
  private createProceduralVehicle(
    type: TrafficVehicleType,
    color: number
  ): { group: THREE.Group; bodyRoot: THREE.Group; wheels: THREE.Mesh[]; brakeLights: THREE.Mesh[] } {
    const vGroup = new THREE.Group();
    const bodyRoot = new THREE.Group();
    vGroup.add(bodyRoot);

    const wheels: THREE.Mesh[] = [];
    const brakeLights: THREE.Mesh[] = [];

    const isDanfo = type === 'DANFO';
    const isSuv = type === 'SUV';

    const mainMat = new THREE.MeshStandardMaterial({
      color,
      roughness: isDanfo ? 0.4 : 0.25,
      metalness: isDanfo ? 0.2 : 0.65,
    });
    const stripeMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.5 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
    const bumperMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.9 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.85, roughness: 0.25 });

    const width = isDanfo ? 2.0 : isSuv ? 1.95 : 1.85;
    const bodyH = isDanfo ? 1.1 : isSuv ? 0.85 : 0.55;
    const length = isDanfo ? 4.6 : isSuv ? 4.5 : 4.3;

    // Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(width, bodyH, length), mainMat);
    chassis.position.y = 0.5 + bodyH / 2;
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    bodyRoot.add(chassis);

    // Upper Cabin
    const cabinW = width * 0.92;
    const cabinH = isDanfo ? 0.95 : isSuv ? 0.75 : 0.55;
    const cabinL = isDanfo ? length * 0.9 : length * 0.58;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabinW, cabinH, cabinL), glassMat);
    cabin.position.set(0, 0.5 + bodyH + cabinH / 2, isDanfo ? 0 : -0.2);
    cabin.castShadow = true;
    bodyRoot.add(cabin);

    // Danfo Twin Black Racing Stripes
    if (isDanfo) {
      const s1 = new THREE.Mesh(new THREE.BoxGeometry(width + 0.02, 0.09, length + 0.02), stripeMat);
      s1.position.y = 0.85;
      bodyRoot.add(s1);

      const s2 = new THREE.Mesh(new THREE.BoxGeometry(width + 0.02, 0.09, length + 0.02), stripeMat);
      s2.position.y = 1.05;
      bodyRoot.add(s2);
    }

    // Bumpers
    const fBumper = new THREE.Mesh(new THREE.BoxGeometry(width + 0.04, 0.24, 0.18), bumperMat);
    fBumper.position.set(0, 0.48, length / 2 + 0.09);
    bodyRoot.add(fBumper);

    const rBumper = new THREE.Mesh(new THREE.BoxGeometry(width + 0.04, 0.24, 0.18), bumperMat);
    rBumper.position.set(0, 0.48, -length / 2 - 0.09);
    bodyRoot.add(rBumper);

    // Headlights
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-width * 0.38, width * 0.38].forEach(hx => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.05), hlMat);
      hl.position.set(hx, 0.75, length / 2 + 0.1);
      bodyRoot.add(hl);
    });

    // Reactive Taillights & Brake Lights
    const blMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      emissive: new THREE.Color(0x3f0a0a),
      emissiveIntensity: 0.3,
      roughness: 0.2,
    });
    [-width * 0.38, width * 0.38].forEach(bx => {
      const bl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.05), blMat);
      bl.position.set(bx, 0.75, -length / 2 - 0.1);
      bodyRoot.add(bl);
      brakeLights.push(bl);
    });

    // 4 Wheels
    const wheelZ = length * 0.32;
    const wheelX = width / 2 + 0.04;
    const wheelY = 0.36;
    const wheelPositions: [number, number, number][] = [
      [-wheelX, wheelY, wheelZ],
      [wheelX, wheelY, wheelZ],
      [-wheelX, wheelY, -wheelZ],
      [wheelX, wheelY, -wheelZ],
    ];

    wheelPositions.forEach(([wx, wy, wz]) => {
      const wGroup = new THREE.Group();
      wGroup.position.set(wx, wy, wz);

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.22, 16), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.23, 12), rimMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);

      bodyRoot.add(wGroup);
      wheels.push(tire);
    });

    return { group: vGroup, bodyRoot, wheels, brakeLights };
  }

  /**
   * Updates vehicle movement, wheel rotations, boundary resets,
   * and yields / brakes smoothly whenever pedestrians or the player are walking in front.
   */
  public update(
    deltaTime: number,
    pedestrians?: Array<{ x: number; z: number } | THREE.Vector3>,
    playerPosition?: { x: number; y: number; z: number } | THREE.Vector3
  ): void {
    const dt = Math.min(deltaTime, 0.1);

    this.vehicles.forEach(v => {
      // 1. Forward Obstacle & Pedestrian Detection Cone (8.0m forward lookahead, 2.2m lane tolerance)
      let shouldYield = false;
      const forward = v.direction;

      const checkPerson = (px: number, pz: number) => {
        const dx = px - v.position.x;
        const dz = pz - v.position.z;
        // Project onto forward vector
        const forwardDist = dx * forward.x + dz * forward.z;
        if (forwardDist > 0.4 && forwardDist < 8.0) {
          // Project onto lateral vector
          const lateralDist = Math.abs(-dx * forward.z + dz * forward.x);
          if (lateralDist < 2.2) {
            shouldYield = true;
          }
        }
      };

      if (playerPosition) {
        checkPerson(playerPosition.x, playerPosition.z);
      }
      if (pedestrians) {
        for (let i = 0; i < pedestrians.length; i++) {
          const p = pedestrians[i];
          if (p) {
            checkPerson(p.x, p.z);
            if (shouldYield) break;
          }
        }
      }

      // 2. Realistic Acceleration & Deceleration Physics
      if (shouldYield) {
        v.isYielding = true;
        // Smoothly brake to a halt
        v.speed = Math.max(0, v.speed - 9.0 * dt);
        // Active bright red brake lights
        v.brakeLights.forEach(bl => {
          if (bl.material instanceof THREE.MeshStandardMaterial) {
            bl.material.color.setHex(0xff0000);
            bl.material.emissive.setHex(0xff0000);
            bl.material.emissiveIntensity = 1.5;
          }
        });
      } else {
        v.isYielding = false;
        // Accelerate smoothly to cruising speed
        v.speed = Math.min(v.cruiseSpeed, v.speed + 4.0 * dt);
        // Idle running red lights
        v.brakeLights.forEach(bl => {
          if (bl.material instanceof THREE.MeshStandardMaterial) {
            bl.material.color.setHex(0x7f1d1d);
            bl.material.emissive.setHex(0x3f0a0a);
            bl.material.emissiveIntensity = 0.3;
          }
        });
      }

      // 3. Move vehicle along its assigned roadway lane
      const moveStep = v.speed * dt;
      v.position.x += v.direction.x * moveStep;
      v.position.z += v.direction.z * moveStep;

      // 4. Check road boundaries and loop cleanly
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
      const wheelRotation = moveStep / (v.wheelRadius || 0.36);
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
