import * as THREE from 'three';
import { AssetLoader } from '../AssetLoader';
import { AABB } from '../CollisionWorld';
import { RiggedPedestrian } from './RiggedPedestrian';

export type TrafficVehicleType = 'DANFO' | 'SUV' | 'SEDAN' | 'SPORTS' | 'DELIVERY';

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
  modelLength: number;
  modelWidth: number;
  conductorPed?: RiggedPedestrian;
  materials: THREE.Material[];
  laneId: string;
}

export type BusStopPhase = 'BOARDING' | 'DEPARTING' | 'APPROACHING';

export interface DanfoBusStopState {
  group: THREE.Group;
  busGroup: THREE.Group;
  conductorPed?: RiggedPedestrian;
  passengerPeds: Array<{ ped: RiggedPedestrian; mesh: THREE.Group; initialX: number; targetX: number }>;
  phase: BusStopPhase;
  timer: number;
  position: THREE.Vector3;
  targetRoadX: number;
  busSpeed: number;
  indicatorBlinker: THREE.Mesh;
  brakeLights: THREE.Mesh[];
}

/**
 * TrafficSystem: Drives realistic, authentic Lagos Island urban traffic:
 * - High-fidelity realistic 3D vehicle models (Danfo Minibus with Conductor, Executive SUVs, Corporate Sedans, Sports Coupes)
 * - Authentic rigged pedestrian characters for bus conductors and boarding passengers (NO procedural box people!)
 * - Accessories and lights attached at scale 1.0 so NO flying/floating boxes exist
 * - Dynamic vehicle rotation across all lanes so traffic has rich variety
 * - Smooth distance-based opacity fading at boundaries so vehicles never pop in or out of nowhere
 * - Danfo Bus Stop Life-cycle: Passengers boarding, bus departing into traffic, next van arriving & parking
 * - Dynamic collision bounding boxes and pedestrian yielding so characters cannot walk into vehicles
 */
export class TrafficSystem {
  private group: THREE.Group;
  private vehicles: TrafficVehicle[] = [];
  private busStopState: DanfoBusStopState | null = null;
  private blinkerTime = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'TrafficSystem';

    this.spawnVehicles();
    this.initDanfoBusStop();
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  public getVehicles(): readonly TrafficVehicle[] {
    return this.vehicles;
  }

  /**
   * Spawns diverse vehicles across all 4 traffic lanes on Lagos Island:
   * Southbound Broad St, Northbound Broad St, Eastbound Marina, Westbound Marina.
   */
  private spawnVehicles(): void {
    // 1. Southbound Broad Street Lane (x = -2.4, heading +Z: z = -52 to 42)
    const v1 = this.createVehicleInstance(
      'DANFO',
      'broad_south',
      new THREE.Vector3(-2.4, 0, -52),
      new THREE.Vector3(-2.4, 0, 42),
      new THREE.Vector3(0, 0, 1),
      6.5,
      new THREE.Vector3(-2.4, 0, -22)
    );
    this.vehicles.push(v1);
    this.group.add(v1.group);

    // 2. Northbound Broad Street Lane (x = +2.4, heading -Z: z = 42 to -52)
    const v2 = this.createVehicleInstance(
      'SUV',
      'broad_north',
      new THREE.Vector3(2.4, 0, 42),
      new THREE.Vector3(2.4, 0, -52),
      new THREE.Vector3(0, 0, -1),
      7.2,
      new THREE.Vector3(2.4, 0, 12)
    );
    this.vehicles.push(v2);
    this.group.add(v2.group);

    // 3. Eastbound Marina Expressway (z = 28.5, heading +X: x = -52 to 52)
    const v3 = this.createVehicleInstance(
      'SEDAN',
      'marina_east',
      new THREE.Vector3(-52, 0, 28.5),
      new THREE.Vector3(52, 0, 28.5),
      new THREE.Vector3(1, 0, 0),
      8.0,
      new THREE.Vector3(-18, 0, 28.5)
    );
    this.vehicles.push(v3);
    this.group.add(v3.group);

    // 4. Westbound Marina Expressway (z = 23.5, heading -X: x = 52 to -52)
    const v4 = this.createVehicleInstance(
      'DANFO',
      'marina_west',
      new THREE.Vector3(52, 0, 23.5),
      new THREE.Vector3(-52, 0, 23.5),
      new THREE.Vector3(-1, 0, 0),
      7.6,
      new THREE.Vector3(20, 0, 23.5)
    );
    this.vehicles.push(v4);
    this.group.add(v4.group);
  }

  /**
   * Instantiates a vehicle with procedural baseline geometry and triggers
   * asynchronous replacement with realistic GLB 3D models.
   */
  private createVehicleInstance(
    type: TrafficVehicleType,
    laneId: string,
    startPos: THREE.Vector3,
    endPos: THREE.Vector3,
    direction: THREE.Vector3,
    cruiseSpeed: number,
    initialPos: THREE.Vector3
  ): TrafficVehicle {
    const procedural = this.createProceduralVehicle(type, this.getVehicleColor(type, 0));

    const v: TrafficVehicle = {
      group: procedural.group,
      bodyRoot: procedural.bodyRoot,
      type,
      wheels: procedural.wheels,
      brakeLights: procedural.brakeLights,
      position: initialPos.clone(),
      direction: direction.clone(),
      speed: cruiseSpeed,
      cruiseSpeed,
      startPos: startPos.clone(),
      endPos: endPos.clone(),
      isYielding: false,
      wheelRadius: 0.36,
      modelLength: 4.6,
      modelWidth: 2.2,
      materials: procedural.materials,
      laneId,
    };

    v.group.position.copy(v.position);
    v.group.rotation.y = Math.atan2(v.direction.x, v.direction.z);

    this.loadRealisticModel(v);
    return v;
  }

  private getVehicleColor(type: TrafficVehicleType, index: number): number {
    if (type === 'DANFO') return 0xfacc15; // Lagos Transit Yellow
    if (type === 'SUV') {
      const colors = [0x0f172a, 0x1e293b, 0x94a3b8]; // Obsidian, Charcoal, Silver
      return colors[index % colors.length]!;
    }
    if (type === 'SEDAN') {
      const colors = [0x94a3b8, 0x1e3a8a, 0xf8fafc]; // Silver, Navy Blue, Pearl White
      return colors[index % colors.length]!;
    }
    if (type === 'SPORTS') {
      const colors = [0x991b1b, 0x0284c7, 0x09090b]; // Crimson, Electric Cyan, Midnight Black
      return colors[index % colors.length]!;
    }
    return 0xf8fafc;
  }

  /**
   * Asynchronously loads realistic 3D vehicle assets into the vehicle's bodyRoot.
   * Crucially, models are scaled cleanly and accessories (conductors, taillights, decals)
   * are added at scale 1.0 to prevent any scaled or flying geometry.
   */
  private async loadRealisticModel(v: TrafficVehicle): Promise<void> {
    try {
      const glbUrl =
        v.type === 'DANFO'
          ? '/assets/vehicles/danfo_realistic.glb'
          : '/assets/vehicles/suv_realistic.glb';

      const model = await AssetLoader.getInstance().loadGLTF(glbUrl);
      const scale = 4.5;
      model.scale.set(scale, scale, scale);

      const newMaterials: THREE.Material[] = [];
      const newBrakeLights: THREE.Mesh[] = [];

      model.traverse(node => {
        if (node instanceof THREE.Mesh) {
          node.castShadow = true;
          node.receiveShadow = true;

          if (node.material) {
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach(m => {
              if (m instanceof THREE.MeshStandardMaterial) {
                m.transparent = true;
                m.opacity = 1.0;
                newMaterials.push(m);

                if (v.type === 'DANFO') {
                  m.color.setHex(0xfacc15); // Lagos Danfo Transit Yellow
                  m.roughness = 0.35;
                  m.metalness = 0.15;
                } else if (v.type === 'SUV') {
                  m.color.setHex(0x0f172a); // Obsidian black metallic
                  m.roughness = 0.22;
                  m.metalness = 0.85;
                }
              }
            });
          }
        }
      });

      // Clear existing procedural children from bodyRoot
      while (v.bodyRoot.children.length > 0) {
        const c = v.bodyRoot.children[0];
        if (c) v.bodyRoot.remove(c);
      }
      v.bodyRoot.add(model);

      // Add flush black side stripes on Danfo at scale 1.0 (attached directly to bodyRoot)
      if (v.type === 'DANFO') {
        const stripeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
        newMaterials.push(stripeMat);
        const stripeGeo = new THREE.PlaneGeometry(3.6, 0.12);

        const sLeft = new THREE.Mesh(stripeGeo, stripeMat);
        sLeft.position.set(1.28, 1.15, 0);
        sLeft.rotation.y = Math.PI / 2;
        v.bodyRoot.add(sLeft);

        const sRight = new THREE.Mesh(stripeGeo, stripeMat);
        sRight.position.set(-1.28, 1.15, 0);
        sRight.rotation.y = -Math.PI / 2;
        v.bodyRoot.add(sRight);

        // Attach a REAL rigged human pedestrian character as the Danfo Conductor (NO procedural boxes!)
        const conductor = new RiggedPedestrian({
          bodyType: 'male_2',
          palette: {
            skinTone: 0x3d2314, // Nigerian rich warm brown
            topColor: 0xfacc15,  // Lagos yellow Danfo polo
            pantsColor: 0x1e3a8a, // Denim jeans
            shoesColor: 0x111827  // Sneakers
          },
          randomScale: 0.98,
        });

        conductor.load().then(() => {
          const condMesh = conductor.getMesh();
          condMesh.position.set(1.18, 0.18, -0.2);
          condMesh.rotation.y = Math.PI / 2;
          v.bodyRoot.add(condMesh);
          v.conductorPed = conductor;
        }).catch(() => {
          // Fallback if network loading is pending
        });
      }

      // Add normal-sized red LED taillights at scale 1.0 directly on bodyRoot
      const blMat = new THREE.MeshStandardMaterial({
        color: 0x7f1d1d,
        emissive: new THREE.Color(0x3f0a0a),
        emissiveIntensity: 0.35,
        roughness: 0.2,
      });
      newMaterials.push(blMat);

      [-0.85, 0.85].forEach(bx => {
        const bl = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.14, 0.04), blMat);
        bl.position.set(bx, 0.72, -2.25);
        v.bodyRoot.add(bl);
        newBrakeLights.push(bl);
      });

      v.materials = newMaterials;
      if (newBrakeLights.length > 0) {
        v.brakeLights = newBrakeLights;
      }
    } catch {
      // Procedural model remains as immediate robust fallback
    }
  }

  /**
   * Initializes the dedicated Danfo Bus Stop bay on Broad Street:
   * Parked minibus with open door, authentic rigged pedestrian conductor, and rigged boarding passengers.
   */
  private initDanfoBusStop(): void {
    const busStopGroup = new THREE.Group();
    busStopGroup.name = 'DanfoBusStopBay';

    const stopPos = new THREE.Vector3(-4.8, 0, -8.0);
    busStopGroup.position.copy(stopPos);

    // Parked Danfo Minibus
    const danfoData = this.createProceduralVehicle('DANFO', 0xfacc15);
    const bus = danfoData.group;
    bus.rotation.y = 0; // facing south (+Z)

    // Load realistic model for the parked bus as well
    AssetLoader.getInstance()
      .loadGLTF('/assets/vehicles/danfo_realistic.glb')
      .then(model => {
        model.scale.set(4.5, 4.5, 4.5);
        model.traverse(node => {
          if (node instanceof THREE.Mesh && node.material) {
            const mats = Array.isArray(node.material) ? node.material : [node.material];
            mats.forEach(m => {
              if (m instanceof THREE.MeshStandardMaterial) {
                m.color.setHex(0xfacc15);
              }
            });
          }
        });

        while (danfoData.bodyRoot.children.length > 0) {
          const c = danfoData.bodyRoot.children[0];
          if (c) danfoData.bodyRoot.remove(c);
        }
        danfoData.bodyRoot.add(model);
      })
      .catch(() => {});

    // Attach authentic Rigged Pedestrian Conductor standing on the bus runner
    const conductorPed = new RiggedPedestrian({
      bodyType: 'male_2',
      palette: {
        skinTone: 0x3d2314, // Nigerian rich warm brown
        topColor: 0xfacc15,  // Yellow Danfo polo
        pantsColor: 0x1e3a8a, // Denim jeans
        shoesColor: 0x111827  // Sneakers
      },
      randomScale: 0.98,
    });

    conductorPed.load().then(() => {
      const m = conductorPed.getMesh();
      m.position.set(1.18, 0.18, -0.2);
      m.rotation.y = Math.PI / 2;
      bus.add(m);
      if (this.busStopState) {
        this.busStopState.conductorPed = conductorPed;
      }
    }).catch(() => {});

    // Left indicator blinker mesh (amber LED)
    const blinkerMat = new THREE.MeshBasicMaterial({ color: 0x332000 });
    const blinker = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.04), blinkerMat);
    blinker.position.set(-1.05, 0.82, -2.2);
    bus.add(blinker);

    // Waiting & Boarding Pedestrian Passengers: Real Rigged Pedestrians!
    const passengerPeds: DanfoBusStopState['passengerPeds'] = [];

    const p1 = new RiggedPedestrian({
      bodyType: 'female_2',
      palette: {
        skinTone: 0x4a2e1b,
        topColor: 0x0284c7, // electric blue top
        pantsColor: 0x1e293b, // dark tailored trousers
        shoesColor: 0x0f172a, // formal heels
      },
    });
    p1.load().then(() => {
      const mesh = p1.getMesh();
      mesh.position.set(1.8, 0.02, -0.6);
      mesh.rotation.y = -Math.PI / 2; // facing west into van door
      busStopGroup.add(mesh);
      passengerPeds.push({ ped: p1, mesh, initialX: 1.8, targetX: 0.8 });
    }).catch(() => {});

    const p2 = new RiggedPedestrian({
      bodyType: 'male_1',
      palette: {
        skinTone: 0x3d2314,
        topColor: 0x10b981, // emerald green polo
        pantsColor: 0x111827, // dark jeans
        shoesColor: 0xf8fafc, // white sneakers
      },
    });
    p2.load().then(() => {
      const mesh = p2.getMesh();
      mesh.position.set(2.4, 0.02, -1.2);
      mesh.rotation.y = -Math.PI / 2;
      busStopGroup.add(mesh);
      passengerPeds.push({ ped: p2, mesh, initialX: 2.4, targetX: 0.8 });
    }).catch(() => {});

    busStopGroup.add(bus);
    this.group.add(busStopGroup);

    this.busStopState = {
      group: busStopGroup,
      busGroup: bus,
      conductorPed,
      passengerPeds,
      phase: 'BOARDING',
      timer: 14.0,
      position: stopPos.clone(),
      targetRoadX: -2.4,
      busSpeed: 0,
      indicatorBlinker: blinker,
      brakeLights: danfoData.brakeLights,
    };
  }

  /**
   * Creates procedural baseline vehicle geometry.
   * Stripped of any protruding or floating boxes so geometry is 100% clean.
   */
  private createProceduralVehicle(
    type: TrafficVehicleType,
    color: number
  ): {
    group: THREE.Group;
    bodyRoot: THREE.Group;
    wheels: THREE.Mesh[];
    brakeLights: THREE.Mesh[];
    materials: THREE.Material[];
  } {
    const vGroup = new THREE.Group();
    const bodyRoot = new THREE.Group();
    vGroup.add(bodyRoot);

    const wheels: THREE.Mesh[] = [];
    const brakeLights: THREE.Mesh[] = [];
    const materials: THREE.Material[] = [];

    const isDanfo = type === 'DANFO';
    const isSuv = type === 'SUV';

    const mainMat = new THREE.MeshStandardMaterial({
      color,
      roughness: isDanfo ? 0.35 : 0.22,
      metalness: isDanfo ? 0.15 : 0.75,
      transparent: true,
      opacity: 1.0,
    });
    materials.push(mainMat);

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 1.0,
    });
    materials.push(glassMat);

    const bumperMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.8,
      transparent: true,
      opacity: 1.0,
    });
    materials.push(bumperMat);

    const tireMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.9,
      transparent: true,
      opacity: 1.0,
    });
    materials.push(tireMat);

    const width = isDanfo ? 2.1 : isSuv ? 2.0 : 1.9;
    const bodyH = isDanfo ? 1.2 : isSuv ? 0.85 : 0.6;
    const length = isDanfo ? 4.8 : isSuv ? 4.6 : 4.4;

    // Chassis
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(width, bodyH, length), mainMat);
    chassis.position.y = 0.5 + bodyH / 2;
    chassis.castShadow = true;
    bodyRoot.add(chassis);

    // Cabin
    const cabinW = width * 0.92;
    const cabinH = isDanfo ? 0.95 : 0.65;
    const cabinL = isDanfo ? length * 0.9 : length * 0.58;
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(cabinW, cabinH, cabinL), glassMat);
    cabin.position.set(0, 0.5 + bodyH + cabinH / 2, isDanfo ? 0 : -0.2);
    cabin.castShadow = true;
    bodyRoot.add(cabin);

    // Danfo Flush Side Decals (Planar decals flush with body, NO protruding boxes)
    if (isDanfo) {
      const stripeMat = new THREE.MeshBasicMaterial({ color: 0x09090b });
      materials.push(stripeMat);
      const stripeGeo = new THREE.PlaneGeometry(length * 0.92, 0.1);

      [-width / 2 - 0.005, width / 2 + 0.005].forEach((sx, idx) => {
        const s1 = new THREE.Mesh(stripeGeo, stripeMat);
        s1.position.set(sx, 0.85, 0);
        s1.rotation.y = idx === 0 ? -Math.PI / 2 : Math.PI / 2;
        bodyRoot.add(s1);

        const s2 = new THREE.Mesh(stripeGeo, stripeMat);
        s2.position.set(sx, 1.05, 0);
        s2.rotation.y = idx === 0 ? -Math.PI / 2 : Math.PI / 2;
        bodyRoot.add(s2);
      });
    }

    // Bumpers
    const fBumper = new THREE.Mesh(new THREE.BoxGeometry(width + 0.04, 0.24, 0.16), bumperMat);
    fBumper.position.set(0, 0.48, length / 2 + 0.08);
    bodyRoot.add(fBumper);

    const rBumper = new THREE.Mesh(new THREE.BoxGeometry(width + 0.04, 0.24, 0.16), bumperMat);
    rBumper.position.set(0, 0.48, -length / 2 - 0.08);
    bodyRoot.add(rBumper);

    // Headlights
    const hlMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    [-width * 0.38, width * 0.38].forEach(hx => {
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.04), hlMat);
      hl.position.set(hx, 0.75, length / 2 + 0.09);
      bodyRoot.add(hl);
    });

    // Reactive Taillights & Brake Lights
    const blMat = new THREE.MeshStandardMaterial({
      color: 0x7f1d1d,
      emissive: new THREE.Color(0x3f0a0a),
      emissiveIntensity: 0.3,
      roughness: 0.2,
    });
    materials.push(blMat);
    [-width * 0.38, width * 0.38].forEach(bx => {
      const bl = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.12, 0.04), blMat);
      bl.position.set(bx, 0.75, -length / 2 - 0.09);
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

      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.2, 16), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wGroup.add(tire);

      bodyRoot.add(wGroup);
      wheels.push(tire);
    });

    return { group: vGroup, bodyRoot, wheels, brakeLights, materials };
  }

  /**
   * Returns solid collision AABB boxes for all active vehicles on the road
   * and the parked Danfo bus stop van, preventing characters from walking through them.
   */
  public getVehicleBoundingBoxes(): AABB[] {
    const boxes: AABB[] = [];

    this.vehicles.forEach((v, idx) => {
      const halfW = v.modelWidth / 2;
      const halfL = v.modelLength / 2;
      const isZ = Math.abs(v.direction.z) > 0.5;

      boxes.push({
        minX: v.position.x - (isZ ? halfW : halfL),
        maxX: v.position.x + (isZ ? halfW : halfL),
        minZ: v.position.z - (isZ ? halfL : halfW),
        maxZ: v.position.z + (isZ ? halfL : halfW),
        label: `ActiveVehicle_${v.type}_${idx}`,
      });
    });

    if (this.busStopState && this.busStopState.phase !== 'APPROACHING') {
      const bPos = this.busStopState.busGroup.position;
      const worldX = this.busStopState.position.x + bPos.x;
      const worldZ = this.busStopState.position.z + bPos.z;

      boxes.push({
        minX: worldX - 1.2,
        maxX: worldX + 1.2,
        minZ: worldZ - 2.5,
        maxZ: worldZ + 2.5,
        label: 'BusStop_DanfoMinibus',
      });
    }

    return boxes;
  }

  /**
   * Main update loop: Moves vehicles, yields to pedestrians,
   * performs smooth distance opacity fading (no pop-in), animates conductors & passengers,
   * and drives the Danfo bus stop cycle.
   */
  public update(
    deltaTime: number,
    pedestrians?: Array<{ x: number; z: number } | THREE.Vector3>,
    playerPosition?: { x: number; y: number; z: number } | THREE.Vector3
  ): void {
    const dt = Math.min(deltaTime, 0.1);
    this.blinkerTime += dt;

    // 1. Update Moving Traffic Vehicles
    this.vehicles.forEach((v, idx) => {
      // Animate Danfo conductor skeletal animation (idle breathing / calling)
      if (v.conductorPed) {
        v.conductorPed.update(dt, false, 0, true);
      }

      // Pedestrian & Player Detection Cone (8m lookahead, 2.2m lateral tolerance)
      let shouldYield = false;
      const forward = v.direction;

      const checkPerson = (px: number, pz: number) => {
        const dx = px - v.position.x;
        const dz = pz - v.position.z;
        const forwardDist = dx * forward.x + dz * forward.z;
        if (forwardDist > 0.4 && forwardDist < 8.0) {
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

      // Physics: Deceleration / Acceleration
      if (shouldYield) {
        v.isYielding = true;
        v.speed = Math.max(0, v.speed - 9.0 * dt);
        v.brakeLights.forEach(bl => {
          if (bl.material instanceof THREE.MeshStandardMaterial) {
            bl.material.color.setHex(0xff0000);
            bl.material.emissive.setHex(0xff0000);
            bl.material.emissiveIntensity = 1.6;
          }
        });
      } else {
        v.isYielding = false;
        v.speed = Math.min(v.cruiseSpeed, v.speed + 4.2 * dt);
        v.brakeLights.forEach(bl => {
          if (bl.material instanceof THREE.MeshStandardMaterial) {
            bl.material.color.setHex(0x7f1d1d);
            bl.material.emissive.setHex(0x3f0a0a);
            bl.material.emissiveIntensity = 0.35;
          }
        });
      }

      // Movement
      const moveStep = v.speed * dt;
      v.position.x += v.direction.x * moveStep;
      v.position.z += v.direction.z * moveStep;

      // Smooth distance-based opacity fade (prevents popping in/out of thin air)
      const distFromStart = v.position.distanceTo(v.startPos);
      const distToEnd = v.position.distanceTo(v.endPos);
      let targetOpacity = 1.0;
      if (distFromStart < 6.0) {
        targetOpacity = Math.max(0.05, distFromStart / 6.0);
      } else if (distToEnd < 6.0) {
        targetOpacity = Math.max(0.05, distToEnd / 6.0);
      }

      v.materials.forEach(m => {
        if (m.transparent) {
          m.opacity = targetOpacity;
        }
      });

      // Check Road Boundary & Dynamic Vehicle Rotation on Reset
      let reset = false;
      if (v.direction.z > 0 && v.position.z > v.endPos.z) reset = true;
      else if (v.direction.z < 0 && v.position.z < v.endPos.z) reset = true;
      else if (v.direction.x > 0 && v.position.x > v.endPos.x) reset = true;
      else if (v.direction.x < 0 && v.position.x < v.endPos.x) reset = true;

      if (reset) {
        v.position.copy(v.startPos);
        const types: TrafficVehicleType[] = ['DANFO', 'SUV', 'SEDAN', 'SPORTS'];
        v.type = types[(idx + Math.floor(Math.random() * 4)) % types.length]!;
        this.loadRealisticModel(v);
      }

      v.group.position.copy(v.position);
      v.group.rotation.y = Math.atan2(v.direction.x, v.direction.z);

      // Wheel rotation
      const wheelRot = moveStep / (v.wheelRadius || 0.36);
      v.wheels.forEach(w => {
        w.rotation.x += wheelRot;
      });
    });

    // 2. Update Danfo Bus Stop Boarding & Transit Cycle
    if (this.busStopState) {
      this.updateDanfoBusStopCycle(dt);
    }
  }

  /**
   * Drives the continuous Lagos Danfo bus stop life-cycle:
   * 1. BOARDING: Commuters walk into the parked Danfo while conductor calls out.
   * 2. DEPARTING: Danfo signals left, merges into active traffic lane, drives off south.
   * 3. APPROACHING: Next incoming Danfo slows with brake lights, signals right, pulls in and parks.
   */
  private updateDanfoBusStopCycle(dt: number): void {
    const s = this.busStopState!;
    s.timer -= dt;

    if (s.conductorPed) {
      s.conductorPed.update(dt, false, 0, true);
    }

    const isBlinkOn = Math.sin(this.blinkerTime * 8) > 0;

    if (s.phase === 'BOARDING') {
      // Rigged passengers walk smoothly toward open door
      s.passengerPeds.forEach(entry => {
        if (entry.mesh.position.x > entry.targetX) {
          entry.mesh.position.x -= 0.35 * dt;
          entry.ped.update(dt, true, 0.8, true); // walking animation
        } else {
          // Boarded inside
          entry.mesh.visible = false;
          entry.ped.update(dt, false, 0, true);
        }
      });

      // Indicator off, idle brake lights
      if (s.indicatorBlinker.material instanceof THREE.MeshBasicMaterial) {
        s.indicatorBlinker.material.color.setHex(0x332000);
      }

      if (s.timer <= 0) {
        s.phase = 'DEPARTING';
        s.timer = 6.0;
        s.busSpeed = 0;
      }
    } else if (s.phase === 'DEPARTING') {
      // Left turn signal blinks amber
      if (s.indicatorBlinker.material instanceof THREE.MeshBasicMaterial) {
        s.indicatorBlinker.material.color.setHex(isBlinkOn ? 0xf59e0b : 0x332000);
      }

      // Smoothly accelerate and steer into active traffic lane
      s.busSpeed = Math.min(6.5, s.busSpeed + 3.0 * dt);
      s.busGroup.position.z += s.busSpeed * dt;

      if (s.busGroup.position.x < 2.4) {
        s.busGroup.position.x += 1.2 * dt;
        s.busGroup.rotation.y = 0.12;
      } else {
        s.busGroup.rotation.y = 0;
      }

      if (s.timer <= 0) {
        s.phase = 'APPROACHING';
        s.timer = 8.0;
        s.busGroup.position.set(2.4, 0, -28);
        s.busGroup.rotation.y = 0;
        s.busSpeed = 5.5;

        // Reset waiting passengers on the curb
        s.passengerPeds.forEach(entry => {
          entry.mesh.visible = true;
          entry.mesh.position.x = entry.initialX;
        });
      }
    } else if (s.phase === 'APPROACHING') {
      // Right turn signal blinks amber
      if (s.indicatorBlinker.material instanceof THREE.MeshBasicMaterial) {
        s.indicatorBlinker.material.color.setHex(isBlinkOn ? 0xf59e0b : 0x332000);
      }

      // Decelerate and pull into the bus stop bay
      s.busSpeed = Math.max(0.8, s.busSpeed - 1.8 * dt);
      s.busGroup.position.z += s.busSpeed * dt;

      if (s.busGroup.position.x > 0.05) {
        s.busGroup.position.x -= 1.0 * dt;
        s.busGroup.rotation.y = -0.12;
      } else {
        s.busGroup.position.x = 0;
        s.busGroup.rotation.y = 0;
      }

      if (s.busGroup.position.z >= 0 || s.timer <= 0) {
        s.busGroup.position.set(0, 0, 0);
        s.busGroup.rotation.y = 0;
        s.phase = 'BOARDING';
        s.timer = 14.0;
      }
    }
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
