import * as THREE from 'three';
import { AssetLoader } from '../AssetLoader';
import { AABB } from '../CollisionWorld';
import { RiggedPedestrian } from './RiggedPedestrian';
import { LagosProps } from './LagosProps';

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

export type BusStopPhase = 'ALIGHTING' | 'BOARDING' | 'DEPARTING' | 'APPROACHING';

export interface DanfoBusStopPassenger {
  ped: RiggedPedestrian;
  mesh: THREE.Group;
  role: 'ALIGHTING' | 'BOARDING';
  state: 'WAITING' | 'WALKING' | 'DONE';
  startPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  currentPos: THREE.Vector3;
  directionYaw: number;
  speed: number;
}

export interface DanfoBusStopPassengerPedEntry {
  ped: RiggedPedestrian;
  mesh: THREE.Group;
  initialX: number;
  targetX: number;
}

export interface DanfoBusStopState {
  group: THREE.Group;
  busGroup: THREE.Group;
  conductorPed?: RiggedPedestrian;
  passengers: DanfoBusStopPassenger[];
  passengerPeds?: DanfoBusStopPassengerPedEntry[];
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

    // 5. Authentic Lagos Okada commercial motorcycle (x = 1.9, heading -Z: z = 42 to -52)
    const v5 = this.createVehicleInstance(
      'DELIVERY',
      'broad_north_okada',
      new THREE.Vector3(1.9, 0, 42),
      new THREE.Vector3(1.9, 0, -52),
      new THREE.Vector3(0, 0, -1),
      8.5,
      new THREE.Vector3(1.9, 0, -14)
    );
    this.vehicles.push(v5);
    this.group.add(v5.group);

    // 6. High-Performance Sports Coupe on Marina Expressway (z = 28.5, heading +X: x = -52 to 52)
    const v6 = this.createVehicleInstance(
      'SPORTS',
      'marina_east_sports',
      new THREE.Vector3(-52, 0, 28.5),
      new THREE.Vector3(52, 0, 28.5),
      new THREE.Vector3(1, 0, 0),
      9.6,
      new THREE.Vector3(-38, 0, 28.5)
    );
    this.vehicles.push(v6);
    this.group.add(v6.group);
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
      if (v.type === 'DANFO') {
        let danfoModel: THREE.Group;
        try {
          danfoModel = await AssetLoader.getInstance().loadNormalizedGLTF('/assets/vehicles/danfo_realistic.glb');
          danfoModel.traverse(node => {
            if (node instanceof THREE.Mesh) {
              node.castShadow = true;
              node.receiveShadow = true;
            }
          });
        } catch {
          // Fallback to high-fidelity Lagos Danfo with door cutout
          const danfoProp = LagosProps.createDanfoMinibus(0, 0, 0, {
            withDoorCutout: true,
            withConductorStep: true,
          });
          danfoModel = danfoProp.mesh;
        }

        while (v.bodyRoot.children.length > 0) {
          const c = v.bodyRoot.children[0];
          if (c) v.bodyRoot.remove(c);
        }
        v.bodyRoot.add(danfoModel);

        // Attach authentic photorealistic Nigerian Conductor standing on the door runner step
        AssetLoader.getInstance()
          .loadNormalizedGLTF('/assets/characters/conductor_trader_male.glb')
          .then(conductorModel => {
            conductorModel.position.set(-1.08, 0.22, 0.0);
            conductorModel.rotation.y = Math.PI / 2;
            v.bodyRoot.add(conductorModel);
          })
          .catch(() => {
            const conductor = new RiggedPedestrian({
              bodyType: 'male_2',
              palette: {
                skin: 0x3d2314, // Nigerian rich warm brown
                jacket: 0xfacc15, // Lagos yellow Danfo polo
                pants: 0x1e3a8a, // Denim jeans
                shoes: 0x111827, // Sneakers
              },
              randomScale: 0.98,
            });

            conductor.load().then(() => {
              const condMesh = conductor.getMesh();
              condMesh.position.set(-1.08, 0.22, 0.0);
              condMesh.rotation.y = Math.PI / 2;
              v.bodyRoot.add(condMesh);
              v.conductorPed = conductor;
            }).catch(() => {});
          });

        return;
      }

      const glbUrl =
        v.type === 'SUV'
          ? '/assets/vehicles/estate_hybrid_realistic.glb'
          : v.type === 'SEDAN'
          ? '/assets/vehicles/taxi_mondeo_realistic.glb'
          : v.type === 'DELIVERY'
          ? '/assets/vehicles/motorcycle_okada.glb'
          : '/assets/vehicles/mustang_coupe_realistic.glb';

      const model = await AssetLoader.getInstance().loadNormalizedGLTF(glbUrl);

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

      // Add red LED taillights accurately fitted to the vehicle's rear fascia
      const bbox = new THREE.Box3().setFromObject(model);
      const rearZ = bbox.min.z + 0.02;
      const lightY = Math.max(0.45, bbox.min.y + (bbox.max.y - bbox.min.y) * 0.38);
      const halfWidth = Math.max(0.4, (bbox.max.x - bbox.min.x) * 0.38);

      const blMat = new THREE.MeshStandardMaterial({
        color: 0x7f1d1d,
        emissive: new THREE.Color(0x3f0a0a),
        emissiveIntensity: 0.35,
        roughness: 0.2,
      });
      newMaterials.push(blMat);

      [-halfWidth, halfWidth].forEach(bx => {
        const bl = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.12, 0.03), blMat);
        bl.position.set(bx, lightY, rearZ);
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

    // Parked Danfo Minibus: Authentic high-fidelity Lagos Danfo with open sliding door cutout!
    const danfoProp = LagosProps.createDanfoMinibus(0, 0, 0, {
      withDoorCutout: true,
      withConductorStep: true,
    });
    const bus = danfoProp.mesh;
    bus.rotation.y = 0; // facing south (+Z)

    // Attach authentic Nigerian Conductor standing on the door runner step
    AssetLoader.getInstance()
      .loadNormalizedGLTF('/assets/characters/conductor_trader_male.glb')
      .then(m => {
        m.position.set(-1.08, 0.22, 0.0);
        m.rotation.y = Math.PI / 2;
        bus.add(m);
      })
      .catch(() => {
        const conductorPed = new RiggedPedestrian({
          bodyType: 'male_2',
          palette: {
            skin: 0x3d2314, // Nigerian rich warm brown
            jacket: 0xfacc15, // Yellow Danfo polo
            pants: 0x1e3a8a, // Denim jeans
            shoes: 0x111827, // Sneakers
          },
          randomScale: 0.98,
        });

        conductorPed.load().then(() => {
          const m = conductorPed.getMesh();
          m.position.set(-1.08, 0.22, 0.0);
          m.rotation.y = Math.PI / 2;
          bus.add(m);
          if (this.busStopState) {
            this.busStopState.conductorPed = conductorPed;
          }
        }).catch(() => {});
      });

    // Left indicator blinker mesh (amber LED)
    const blinkerMat = new THREE.MeshBasicMaterial({ color: 0x332000 });
    const blinker = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.04), blinkerMat);
    blinker.position.set(-1.05, 0.82, -2.2);
    bus.add(blinker);

    // Commuters: Real Rigged Pedestrians (Male and Female GLBs)
    // All coordinates are strictly on the West Sidewalk (local x <= -1.08, world x <= -5.88). NEVER in the road!
    const passengers: DanfoBusStopPassenger[] = [];

    // Alighting Passenger 1: female_2 (rich dark skin, office attire)
    const alighting1 = new RiggedPedestrian({
      bodyType: 'female_2',
      palette: {
        skin: 0x3a2012,
        jacket: 0xf1f5f9,
        pants: 0x1e293b,
        shoes: 0x0f172a,
      },
    });
    alighting1.load().then(() => {
      const mesh = alighting1.getMesh();
      // Starts on the doorway threshold step
      mesh.position.set(-1.08, 0.22, 0.2);
      mesh.rotation.y = Math.PI; // heading north along sidewalk
      busStopGroup.add(mesh);
      passengers.push({
        ped: alighting1,
        mesh,
        role: 'ALIGHTING',
        state: 'WAITING',
        startPos: new THREE.Vector3(-1.08, 0.22, 0.2),
        targetPos: new THREE.Vector3(-2.0, 0.02, -6.0),
        currentPos: new THREE.Vector3(-1.08, 0.22, 0.2),
        directionYaw: Math.PI,
        speed: 1.1,
      });
    }).catch(() => {});

    // Alighting Passenger 2: male_1 (bronze skin, smart casual)
    const alighting2 = new RiggedPedestrian({
      bodyType: 'male_1',
      palette: {
        skin: 0x523220,
        jacket: 0x0d9488,
        pants: 0xd97706,
        shoes: 0x451a03,
      },
    });
    alighting2.load().then(() => {
      const mesh = alighting2.getMesh();
      mesh.position.set(-1.08, 0.22, -0.2);
      mesh.rotation.y = 0; // heading south along sidewalk
      busStopGroup.add(mesh);
      passengers.push({
        ped: alighting2,
        mesh,
        role: 'ALIGHTING',
        state: 'WAITING',
        startPos: new THREE.Vector3(-1.08, 0.22, -0.2),
        targetPos: new THREE.Vector3(-1.9, 0.02, 6.0),
        currentPos: new THREE.Vector3(-1.08, 0.22, -0.2),
        directionYaw: 0,
        speed: 1.0,
      });
    }).catch(() => {});

    // Boarding Passenger 1: female_1 (waiting on sidewalk shelter, golden skin, vibrant)
    const boarding1 = new RiggedPedestrian({
      bodyType: 'female_1',
      palette: {
        skin: 0x7a4b2c,
        jacket: 0xdb2777,
        pants: 0x18181b,
        shoes: 0xf8fafc,
      },
    });
    boarding1.load().then(() => {
      const mesh = boarding1.getMesh();
      // Waiting on the sidewalk by the bus shelter
      mesh.position.set(-2.2, 0.02, -2.5);
      mesh.rotation.y = 0; // facing south toward incoming bus
      busStopGroup.add(mesh);
      passengers.push({
        ped: boarding1,
        mesh,
        role: 'BOARDING',
        state: 'WAITING',
        startPos: new THREE.Vector3(-2.2, 0.02, -2.5),
        targetPos: new THREE.Vector3(-1.08, 0.22, 0.0),
        currentPos: new THREE.Vector3(-2.2, 0.02, -2.5),
        directionYaw: -Math.PI / 2,
        speed: 0.9,
      });
    }).catch(() => {});

    // Boarding Passenger 2: male_2 (waiting on sidewalk shelter, mahogany skin, casual)
    const boarding2 = new RiggedPedestrian({
      bodyType: 'male_2',
      palette: {
        skin: 0x3d2314,
        jacket: 0x059669,
        pants: 0x1e1b4b,
        shoes: 0xffffff,
      },
    });
    boarding2.load().then(() => {
      const mesh = boarding2.getMesh();
      mesh.position.set(-2.4, 0.02, -1.8);
      mesh.rotation.y = 0;
      busStopGroup.add(mesh);
      passengers.push({
        ped: boarding2,
        mesh,
        role: 'BOARDING',
        state: 'WAITING',
        startPos: new THREE.Vector3(-2.4, 0.02, -1.8),
        targetPos: new THREE.Vector3(-1.08, 0.22, -0.3),
        currentPos: new THREE.Vector3(-2.4, 0.02, -1.8),
        directionYaw: -Math.PI / 2,
        speed: 0.85,
      });
    }).catch(() => {});

    busStopGroup.add(bus);
    this.group.add(busStopGroup);

    this.busStopState = {
      group: busStopGroup,
      busGroup: bus,
      conductorPed: undefined,
      passengers,
      passengerPeds: [],
      phase: 'ALIGHTING',
      timer: 5.5,
      position: stopPos.clone(),
      targetRoadX: 2.4, // offset to reach Broad St road lane x = -2.4 (-4.8 + 2.4 = -2.4)
      busSpeed: 0,
      indicatorBlinker: blinker,
      brakeLights: [],
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

    if (isDanfo) {
      const danfoProp = LagosProps.createDanfoMinibus(0, 0, 0, {
        withDoorCutout: true,
        withConductorStep: true,
      });
      bodyRoot.add(danfoProp.mesh);

      danfoProp.mesh.traverse(n => {
        if (n instanceof THREE.Mesh && n.material) {
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach(m => {
            if (!materials.includes(m)) materials.push(m);
          });
        }
      });

      return { group: vGroup, bodyRoot, wheels, brakeLights, materials };
    }

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

      const forward = v.direction;

      // 1. Vehicle-to-Vehicle Collision Avoidance (Following distance & intersection priority)
      let vehicleAheadDist = 999;
      let leadSpeed = 0;
      let shouldBrakeForVehicle = false;

      // Check other moving vehicles in the same lane ahead
      for (const other of this.vehicles) {
        if (other === v) continue;
        const dx = other.position.x - v.position.x;
        const dz = other.position.z - v.position.z;
        const fwdDist = dx * forward.x + dz * forward.z;
        const latDist = Math.abs(-dx * forward.z + dz * forward.x);

        if (fwdDist > 0.4 && fwdDist < 14.0 && latDist < 2.4) {
          shouldBrakeForVehicle = true;
          if (fwdDist < vehicleAheadDist) {
            vehicleAheadDist = fwdDist;
            leadSpeed = other.speed;
          }
        }
      }

      // Check Bus Stop Danfo (southbound Broad Street lane at x = -2.4)
      if (v.laneId === 'broad_south' && this.busStopState) {
        const busWorldPos = this.busStopState.position.clone().add(this.busStopState.busGroup.position);
        const dx = busWorldPos.x - v.position.x;
        const dz = busWorldPos.z - v.position.z;
        const fwdDist = dz; // heading +Z
        if (Math.abs(dx) < 2.4 && fwdDist > 0.4 && fwdDist < 14.0) {
          shouldBrakeForVehicle = true;
          if (fwdDist < vehicleAheadDist) {
            vehicleAheadDist = fwdDist;
            leadSpeed = this.busStopState.busSpeed;
          }
        }
      }

      // Intersection Collision Arbitration (Broad Street x Marina Junction)
      // Intersection zone: X [-5.0, 5.0], Z [20.0, 32.0]
      const isInIntersection = (pos: THREE.Vector3) =>
        pos.x >= -5.0 && pos.x <= 5.0 && pos.z >= 20.0 && pos.z <= 32.0;

      const vInIntersection = isInIntersection(v.position);

      const anyOtherInIntersection = this.vehicles.some(
        other => other !== v && isInIntersection(other.position)
      );

      const isApproachingIntersection =
        (v.laneId === 'broad_south' && v.position.z >= 10.0 && v.position.z < 20.0) ||
        (v.laneId === 'broad_north' && v.position.z <= 40.0 && v.position.z > 32.0) ||
        (v.laneId === 'marina_east' && v.position.x >= -16.0 && v.position.x < -5.0) ||
        (v.laneId === 'marina_west' && v.position.x <= 16.0 && v.position.x > 5.0);

      if (isApproachingIntersection && !vInIntersection) {
        if (anyOtherInIntersection) {
          // Intersection is occupied - hold before entering!
          shouldBrakeForVehicle = true;
          vehicleAheadDist = Math.min(vehicleAheadDist, 4.0);
          leadSpeed = 0;
        } else if (v.laneId === 'broad_south' || v.laneId === 'broad_north') {
          // Broad Street yields to Marina Expressway traffic approaching within 18m
          const marinaApproaching = this.vehicles.some(
            m =>
              (m.laneId === 'marina_east' && m.position.x >= -20.0 && m.position.x < 5.0) ||
              (m.laneId === 'marina_west' && m.position.x <= 20.0 && m.position.x > -5.0)
          );
          if (marinaApproaching) {
            shouldBrakeForVehicle = true;
            vehicleAheadDist = Math.min(vehicleAheadDist, 4.0);
            leadSpeed = 0;
          }
        }
      }

      // 2. Pedestrian & Player Detection Cone (8m lookahead, 2.2m lateral tolerance)
      let shouldYield = false;

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

      // 3. Physics: Deceleration / Acceleration
      if (shouldYield || shouldBrakeForVehicle) {
        v.isYielding = true;
        if (shouldYield || vehicleAheadDist < 5.5) {
          v.speed = Math.max(0, v.speed - 12.0 * dt);
        } else {
          v.speed = Math.max(0, Math.min(leadSpeed, v.speed - 5.5 * dt));
        }
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
        // Safe Respawn Clearance: Only respawn if start position area is clear (> 18m from any car)
        const laneBlocked = this.vehicles.some(
          other => other !== v && other.laneId === v.laneId && other.position.distanceTo(v.startPos) < 18.0
        );
        if (!laneBlocked) {
          v.position.copy(v.startPos);
          const types: TrafficVehicleType[] = ['DANFO', 'SUV', 'SEDAN', 'SPORTS'];
          v.type = types[(idx + Math.floor(Math.random() * 4)) % types.length]!;
          this.loadRealisticModel(v);
        }
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
   * 1. ALIGHTING: Commuters step down from van onto sidewalk and walk away.
   * 2. BOARDING: Waiting commuters on sidewalk walk into van while conductor calls out.
   * 3. DEPARTING: Danfo signals left, merges into active traffic lane, drives off south.
   * 4. APPROACHING: Next incoming Danfo slows with brake lights, signals right, pulls in and parks.
   * ALL commuters stay strictly on the sidewalk (x <= -5.88). NEVER in the road!
   */
  private updateDanfoBusStopCycle(dt: number): void {
    const s = this.busStopState!;
    s.timer -= dt;

    // Animate Conductor (Mixamo skeletal breathing & calling out)
    if (s.conductorPed) {
      s.conductorPed.update(dt, false, 0, true);
    }

    const isBlinkOn = Math.sin(this.blinkerTime * 8) > 0;

    if (s.phase === 'ALIGHTING') {
      // 1. Alighting commuters step down from door onto sidewalk and walk along sidewalk
      s.passengers.forEach(p => {
        if (p.role === 'ALIGHTING') {
          const toTarget = p.targetPos.clone().sub(p.currentPos);
          const dist = toTarget.length();
          if (dist > 0.15) {
            const step = Math.min(dist, p.speed * dt);
            toTarget.normalize().multiplyScalar(step);
            p.currentPos.add(toTarget);
            p.mesh.position.copy(p.currentPos);
            p.mesh.rotation.y = p.directionYaw;
            p.ped.update(dt, true, p.speed, true);
          } else {
            p.ped.update(dt, false, 0, true);
          }
        } else {
          // Boarding passengers stand patiently on the sidewalk shelter
          p.ped.update(dt, false, 0, true);
        }
      });

      if (s.timer <= 0) {
        s.phase = 'BOARDING';
        s.timer = 7.0;
      }
    } else if (s.phase === 'BOARDING') {
      // 2. Boarding commuters walk along the sidewalk towards the door cutout and enter
      s.passengers.forEach(p => {
        if (p.role === 'BOARDING') {
          const toDoor = p.targetPos.clone().sub(p.currentPos);
          const dist = toDoor.length();
          if (dist > 0.18) {
            const step = Math.min(dist, p.speed * dt);
            toDoor.normalize().multiplyScalar(step);
            p.currentPos.add(toDoor);
            p.mesh.position.copy(p.currentPos);
            p.mesh.rotation.y = Math.atan2(toDoor.x, toDoor.z);
            p.ped.update(dt, true, p.speed, true);
          } else {
            // Boarded inside the van
            p.mesh.visible = false;
            p.ped.update(dt, false, 0, true);
          }
        } else {
          // Alighting commuters continue walking or idle in distance
          p.ped.update(dt, false, 0, true);
        }
      });

      // Indicator off during boarding
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

      if (s.busGroup.position.x < s.targetRoadX) {
        s.busGroup.position.x += 1.2 * dt;
        s.busGroup.rotation.y = 0.12;
      } else {
        s.busGroup.rotation.y = 0;
      }

      if (s.timer <= 0) {
        s.phase = 'APPROACHING';
        s.timer = 8.0;
        s.busGroup.position.set(s.targetRoadX, 0, -28);
        s.busGroup.rotation.y = 0;
        s.busSpeed = 5.5;

        // Reset waiting and alighting passengers for the next cycle
        s.passengers.forEach(p => {
          p.currentPos.copy(p.startPos);
          p.mesh.position.copy(p.currentPos);
          p.mesh.visible = true;
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
        s.phase = 'ALIGHTING';
        s.timer = 5.5;
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
