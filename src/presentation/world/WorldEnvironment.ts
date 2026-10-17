import * as THREE from 'three';
import { CollisionWorld } from './CollisionWorld';
import { InteractionRegistry } from './InteractionRegistry';
import { Building } from './entities/Building';
import { InteractableMarker } from './entities/InteractableMarker';
import { LagosProps } from './entities/LagosProps';
import { WorkstationProps } from './entities/WorkstationProps';
import { PedestrianSystem } from './entities/PedestrianSystem';
import { TrafficSystem } from './entities/TrafficSystem';
import { WORLD_CONFIG } from './worldConfig';

export class WorldEnvironment {
  private group: THREE.Group;
  private collisionWorld: CollisionWorld;
  private interactionRegistry: InteractionRegistry;

  private buildings: Building[] = [];
  private markers: InteractableMarker[] = [];
  private workstationProps: WorkstationProps | null = null;
  private pedestrianSystem: PedestrianSystem | null = null;
  private trafficSystem: TrafficSystem | null = null;
  private isOutdoor = true;

  constructor(collisionWorld: CollisionWorld, interactionRegistry: InteractionRegistry) {
    this.group = new THREE.Group();
    this.group.name = 'WorldEnvironment';
    this.collisionWorld = collisionWorld;
    this.interactionRegistry = interactionRegistry;

    this.buildOutdoorNeighborhood();
  }

  public getMesh(): THREE.Group {
    return this.group;
  }

  public isOutdoorScene(): boolean {
    return this.isOutdoor;
  }

  /**
   * Constructs the explorable Lagos Island urban environment:
   * - Broad Street commercial corridor and Marina waterfront boulevard
   * - Balogun / Idumota market street with stalls, canopies, and parked Danfo bus
   * - Tinubu Square civic plaza with central monument, palm trees, and community noticeboard
   * - Historic Afro-Brazilian architecture alongside multi-storey commercial towers
   * - Lagos Lagoon waterfront with concrete seawall, railings, and mooring bollards
   * - Complete collision registration and interaction triggers
   */
  public buildOutdoorNeighborhood(): void {
    this.clear();
    this.isOutdoor = true;

    // Set outdoor boundary limits
    this.collisionWorld.setBounds(WORLD_CONFIG.boundaries);

    // 1. Terrain, Roads & Pavements
    this.buildLagosStreetNetwork();

    // 2. Marina Waterfront & Lagos Lagoon
    this.buildMarinaWaterfront();

    // 3. Buildings & Architecture (Afro-Brazilian, Commercial Towers, Market Storefronts)
    this.buildLagosArchitecture();

    // 4. Tinubu Square Civic Landmark & Community Noticeboard
    this.buildTinubuSquare();

    // 5. Balogun Market Stalls & Commercial Details
    this.buildBalogunMarket();

    // 6. Street Furniture, Utility Poles, Cables & Official Street Signs
    this.buildStreetDetails();

    // 7. Perimeter Boundary Barriers
    this.buildPerimeterBoundaries();

    // 8. Living City: Animated Pedestrians & Moving Vehicles
    this.pedestrianSystem = new PedestrianSystem();
    this.group.add(this.pedestrianSystem.getMesh());

    this.trafficSystem = new TrafficSystem();
    this.group.add(this.trafficSystem.getMesh());
  }

  /**
   * Builds the coherent road network: Broad Street, Marina Road, sidewalks, and crossings.
   */
  private buildLagosStreetNetwork(): void {
    // 1. Base Ground Slab
    const groundGeo = new THREE.PlaneGeometry(84, 84);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b, // Base dark earth/asphalt tone
      roughness: 0.9,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.group.add(groundMesh);

    // 2. Main Asphalt Roadways
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Dark asphalt roadway
      roughness: 0.8,
      metalness: 0.1,
    });

    // Broad Street (North-South main spine, Width: 10m, Z: -36 to +20)
    const broadStGeo = new THREE.PlaneGeometry(10, 56);
    const broadSt = new THREE.Mesh(broadStGeo, asphaltMat);
    broadSt.rotation.x = -Math.PI / 2;
    broadSt.position.set(0, 0.01, -8);
    broadSt.receiveShadow = true;
    this.group.add(broadSt);

    // Marina Road (East-West waterfront boulevard, Width: 12m, X: -36 to +36, Z: 20 to 32)
    const marinaRdGeo = new THREE.PlaneGeometry(74, 12);
    const marinaRd = new THREE.Mesh(marinaRdGeo, asphaltMat);
    marinaRd.rotation.x = -Math.PI / 2;
    marinaRd.position.set(0, 0.012, 26);
    marinaRd.receiveShadow = true;
    this.group.add(marinaRd);

    // Balogun Market Lane (East-West market branch, Width: 10m, X: 5 to 36, Z: -15)
    const marketLaneGeo = new THREE.PlaneGeometry(31, 10);
    const marketLane = new THREE.Mesh(marketLaneGeo, asphaltMat);
    marketLane.rotation.x = -Math.PI / 2;
    marketLane.position.set(20.5, 0.011, -15);
    marketLane.receiveShadow = true;
    this.group.add(marketLane);

    // 3. Paved Sidewalks & Pedestrian Concourses
    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Concrete pedestrian slab
      roughness: 0.7,
      metalness: 0.2,
    });

    // Broad Street West Sidewalk (X: -12 to -5, Z: -36 to 20)
    const swWestGeo = new THREE.BoxGeometry(7, 0.14, 56);
    const swWest = new THREE.Mesh(swWestGeo, sidewalkMat);
    swWest.position.set(-8.5, 0.07, -8);
    swWest.receiveShadow = true;
    this.group.add(swWest);

    // Broad Street East Sidewalk (X: 5 to 12, Z: -10 to 20)
    const swEastGeo = new THREE.BoxGeometry(7, 0.14, 30);
    const swEast = new THREE.Mesh(swEastGeo, sidewalkMat);
    swEast.position.set(8.5, 0.07, 5);
    swEast.receiveShadow = true;
    this.group.add(swEast);

    // Marina Waterfront Promenade (Running along the water, Z: 15 to 20, X: -36 to 36)
    const marinaPromGeo = new THREE.BoxGeometry(74, 0.14, 6);
    const marinaProm = new THREE.Mesh(marinaPromGeo, sidewalkMat);
    marinaProm.position.set(0, 0.07, 17);
    marinaProm.receiveShadow = true;
    this.group.add(marinaProm);

    // 4. Road Dividers & Markings (Dashed yellow centerlines)
    const dashMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 }); // Yellow road marking
    const dashGeo = new THREE.BoxGeometry(0.25, 0.02, 2.5);

    // Broad Street Yellow Dashes
    for (let z = -34; z <= 18; z += 5) {
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.position.set(0, 0.02, z);
      this.group.add(dash);
    }

    // Marina Road Yellow Dashes
    const marinaDashGeo = new THREE.BoxGeometry(2.5, 0.02, 0.25);
    for (let x = -32; x <= 32; x += 5) {
      if (Math.abs(x) < 4) continue; // Leave intersection open
      const dash = new THREE.Mesh(marinaDashGeo, dashMat);
      dash.position.set(x, 0.02, 26);
      this.group.add(dash);
    }

    // 5. Zebra Crossings (Pedestrian Crossings)
    const zebraMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const zebraBarGeo = new THREE.BoxGeometry(0.6, 0.02, 4.0);

    // Broad Street / Marina Junction Crossing
    for (let bx = -4.2; bx <= 4.2; bx += 1.2) {
      const bar = new THREE.Mesh(zebraBarGeo, zebraMat);
      bar.position.set(bx, 0.022, 19.5);
      this.group.add(bar);
    }

    // Broad Street / Balogun Lane Crossing
    for (let bz = -18.5; bz <= -11.5; bz += 1.2) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.02, 0.6), zebraMat);
      bar.position.set(5.5, 0.022, bz);
      this.group.add(bar);
    }
  }

  /**
   * Builds the Marina waterfront, Lagos Lagoon water plane, and seawall.
   */
  private buildMarinaWaterfront(): void {
    // 1. Lagos Lagoon Water Surface (Z: 33 to 40, X: -40 to 40)
    const waterGeo = new THREE.PlaneGeometry(84, 10);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x0369a1, // Deep coastal Atlantic / Lagos Lagoon blue
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.9,
    });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(0, -0.4, 38);
    this.group.add(water);

    // 2. Marina Seawall with safety railings and mooring bollards at Z = 33
    const seawall = LagosProps.createSeawall(33, -36, 36);
    this.group.add(seawall.mesh);
    if (seawall.aabb) {
      this.collisionWorld.addObstacle(
        seawall.aabb.minX,
        seawall.aabb.maxX,
        seawall.aabb.minZ,
        seawall.aabb.maxZ,
        seawall.aabb.label ?? 'Marina Seawall'
      );
    }

    // 3. Tropical Palm Trees along the Marina Promenade
    const marinaPalms = [-28, -18, -8, 8, 18, 28];
    marinaPalms.forEach(px => {
      const palm = LagosProps.createPalmTree(px, 15, 6.0);
      this.group.add(palm);
    });
  }

  /**
   * Builds the diverse architectural buildings of Lagos Island:
   * - Player Apartment (Afro-Brazilian historic block)
   * - Cedarline Services HQ (Commercial corporate tower)
   * - Additional commercial towers, heritage chambers, and market storefronts.
   */
  private buildLagosArchitecture(): void {
    // ----------------------------------------------------
    // LANDMARK 1: Player Apartment (Broad Street 14)
    // ----------------------------------------------------
    // Historic Afro-Brazilian 3-storey building with warm ochre plaster,
    // decorative arched windows, 2nd-floor balcony with wrought-iron railing,
    // and rooftop GeePee water storage tank.
    const apartment = new Building({
      name: 'Player Apartment',
      x: -18,
      z: -14,
      width: 11,
      height: 12,
      depth: 12,
      style: 'AFRO_BRAZILIAN',
      color: 0xd97706, // Warm ochre plaster
      trimColor: 0x78350f, // Teak brown trim
      accentColor: 0x38bdf8,
      entranceSide: 'EAST', // Facing Broad Street sidewalk
      hasBalcony: true,
      hasWaterTank: true,
    });
    this.buildings.push(apartment);
    this.group.add(apartment.getMesh());
    this.collisionWorld.addObstacle(
      apartment.getBoundingBox().minX,
      apartment.getBoundingBox().maxX,
      apartment.getBoundingBox().minZ,
      apartment.getBoundingBox().maxZ,
      'Building: Player Apartment (Broad Street 14)'
    );

    // Apartment Entrance Marker & Interaction Trigger
    const aptMarker = new InteractableMarker(-12.0, -14, 0x38bdf8, 'Apartment Entrance');
    this.markers.push(aptMarker);
    this.group.add(aptMarker.getMesh());

    this.interactionRegistry.register({
      id: 'interact_apartment_entrance',
      name: 'Player Apartment',
      promptAction: 'enter your studio apartment [E]',
      description: 'Your home base and workstation desk overlooking Broad Street.',
      position: [-12.0, 0, -14],
      radius: 2.8,
      targetLocationId: 'apartment_interior',
    });

    // ----------------------------------------------------
    // LANDMARK 2: Cedarline Services Corporate HQ (Marina Tower)
    // ----------------------------------------------------
    // 6-storey modern corporate office tower on the corner of Broad Street and Marina Road,
    // featuring horizontal reflective window ribbons, cantilevered entrance canopy,
    // rooftop mechanical chillers, telecommunications antenna mast, and beacon light.
    const cedarline = new Building({
      name: 'Cedarline Services HQ',
      x: 18,
      z: 6,
      width: 14,
      height: 22,
      depth: 16,
      style: 'COMMERCIAL_TOWER',
      color: 0x0f172a, // Slate corporate stone
      trimColor: 0x0284c7, // Corporate blue
      accentColor: 0x10b981, // Emerald green brand signage
      entranceSide: 'WEST', // Facing Broad Street / Marina junction
      roofEquipment: true,
      hasWaterTank: true,
    });
    this.buildings.push(cedarline);
    this.group.add(cedarline.getMesh());
    this.collisionWorld.addObstacle(
      cedarline.getBoundingBox().minX,
      cedarline.getBoundingBox().maxX,
      cedarline.getBoundingBox().minZ,
      cedarline.getBoundingBox().maxZ,
      'Building: Cedarline Services Corporate HQ'
    );

    // Cedarline Entrance Marker & Interaction Trigger
    const cedarMarker = new InteractableMarker(10.5, 6, 0x10b981, 'Cedarline Services Entrance');
    this.markers.push(cedarMarker);
    this.group.add(cedarMarker.getMesh());

    this.interactionRegistry.register({
      id: 'interact_cedarline_entrance',
      name: 'Cedarline Services HQ',
      promptAction: 'enter Cedarline Services corporate lobby [E]',
      description: 'Headquarters of Cedarline Services — origin of the Aster incident.',
      position: [10.5, 0, 6],
      radius: 2.8,
      targetLocationId: 'cedarline_interior',
    });

    // ----------------------------------------------------
    // SECONDARY BUILDINGS & STREET CANYONS
    // ----------------------------------------------------
    // 3. Heritage Commercial Chambers ("Tinubu Chambers")
    const tinubuChambers = new Building({
      name: 'Tinubu Commercial Chambers',
      x: -28,
      z: -14,
      width: 10,
      height: 10,
      depth: 12,
      style: 'AFRO_BRAZILIAN',
      color: 0xb45309, // Terracotta plaster
      trimColor: 0xfef3c7,
      entranceSide: 'EAST',
      hasBalcony: false,
      hasWaterTank: true,
    });
    this.buildings.push(tinubuChambers);
    this.group.add(tinubuChambers.getMesh());
    this.collisionWorld.addObstacle(
      tinubuChambers.getBoundingBox().minX,
      tinubuChambers.getBoundingBox().maxX,
      tinubuChambers.getBoundingBox().minZ,
      tinubuChambers.getBoundingBox().maxZ,
      'Building: Tinubu Commercial Chambers'
    );

    // 4. Northwest Heritage Building ("Lagos Island Printing House")
    const printingHouse = new Building({
      name: 'Lagos Island Printing House',
      x: -18,
      z: -30,
      width: 11,
      height: 11,
      depth: 14,
      style: 'AFRO_BRAZILIAN',
      color: 0x78716c, // Weathered grey masonry
      trimColor: 0x334155,
      entranceSide: 'EAST',
      hasBalcony: true,
    });
    this.buildings.push(printingHouse);
    this.group.add(printingHouse.getMesh());
    this.collisionWorld.addObstacle(
      printingHouse.getBoundingBox().minX,
      printingHouse.getBoundingBox().maxX,
      printingHouse.getBoundingBox().minZ,
      printingHouse.getBoundingBox().maxZ,
      'Building: Lagos Island Printing House'
    );

    // 5. Commercial Bank Tower ("Eko Merchant Bank") along Marina Road
    const ekoBank = new Building({
      name: 'Eko Merchant Bank Tower',
      x: 20,
      z: 24,
      width: 14,
      height: 18,
      depth: 14,
      style: 'COMMERCIAL_TOWER',
      color: 0x1e293b,
      trimColor: 0xd97706, // Gold trim
      accentColor: 0xfacc15,
      entranceSide: 'NORTH',
      roofEquipment: true,
    });
    this.buildings.push(ekoBank);
    this.group.add(ekoBank.getMesh());
    this.collisionWorld.addObstacle(
      ekoBank.getBoundingBox().minX,
      ekoBank.getBoundingBox().maxX,
      ekoBank.getBoundingBox().minZ,
      ekoBank.getBoundingBox().maxZ,
      'Building: Eko Merchant Bank Tower'
    );

    // 6. West Marina Commercial Office ("Maritime House")
    const maritimeHouse = new Building({
      name: 'Lagos Maritime House',
      x: -22,
      z: 26,
      width: 16,
      height: 14,
      depth: 12,
      style: 'MODERN_OFFICE',
      color: 0x334155,
      trimColor: 0x0284c7,
      entranceSide: 'NORTH',
      roofEquipment: true,
    });
    this.buildings.push(maritimeHouse);
    this.group.add(maritimeHouse.getMesh());
    this.collisionWorld.addObstacle(
      maritimeHouse.getBoundingBox().minX,
      maritimeHouse.getBoundingBox().maxX,
      maritimeHouse.getBoundingBox().minZ,
      maritimeHouse.getBoundingBox().maxZ,
      'Building: Lagos Maritime House'
    );

    // 7. North Street Enclosure ("Idumota Wholesale Depot")
    const depot = new Building({
      name: 'Idumota Wholesale Depot',
      x: 0,
      z: -34,
      width: 14,
      height: 9,
      depth: 8,
      style: 'MODERN_OFFICE',
      color: 0x475569,
      trimColor: 0x1e293b,
      entranceSide: 'SOUTH',
    });
    this.buildings.push(depot);
    this.group.add(depot.getMesh());
    this.collisionWorld.addObstacle(
      depot.getBoundingBox().minX,
      depot.getBoundingBox().maxX,
      depot.getBoundingBox().minZ,
      depot.getBoundingBox().maxZ,
      'Building: Idumota Wholesale Depot'
    );
  }

  /**
   * Builds Landmark 3: Tinubu Square Civic Plaza, Monument, and Community Noticeboard.
   */
  private buildTinubuSquare(): void {
    const plazaCenterX = -18;
    const plazaCenterZ = 6;

    // 1. Plaza Paved Ground Apron (Warm terracotta / stone plaza paving)
    const plazaGeo = new THREE.PlaneGeometry(16, 16);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0, // Light stone paving
      roughness: 0.6,
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(plazaCenterX, 0.08, plazaCenterZ);
    plaza.receiveShadow = true;
    this.group.add(plaza);

    // 2. Central Tinubu Square Monument & Fountain
    const monument = LagosProps.createTinubuMonument(plazaCenterX, plazaCenterZ);
    this.group.add(monument.mesh);
    if (monument.aabb) {
      this.collisionWorld.addObstacle(
        monument.aabb.minX,
        monument.aabb.maxX,
        monument.aabb.minZ,
        monument.aabb.maxZ,
        monument.aabb.label ?? 'Tinubu Square Monument'
      );
    }

    // 3. Royal Palm Trees surrounding the square
    const palmOffsets: [number, number][] = [
      [plazaCenterX - 6, plazaCenterZ - 6],
      [plazaCenterX + 6, plazaCenterZ - 6],
      [plazaCenterX - 6, plazaCenterZ + 6],
      [plazaCenterX + 6, plazaCenterZ + 6],
    ];
    palmOffsets.forEach(([px, pz]) => {
      const palm = LagosProps.createPalmTree(px, pz, 6.0);
      this.group.add(palm);
    });

    // 4. Benches in Plaza
    const benchGeo = new THREE.BoxGeometry(2.2, 0.45, 0.6);
    const benchMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const b1 = new THREE.Mesh(benchGeo, benchMat);
    b1.position.set(plazaCenterX, 0.22, plazaCenterZ - 5);
    const b2 = new THREE.Mesh(benchGeo, benchMat);
    b2.position.set(plazaCenterX, 0.22, plazaCenterZ + 5);
    this.group.add(b1, b2);
    this.collisionWorld.addObstacle(
      plazaCenterX - 1.2,
      plazaCenterX + 1.2,
      plazaCenterZ - 5.4,
      plazaCenterZ - 4.6,
      'Plaza Bench North'
    );
    this.collisionWorld.addObstacle(
      plazaCenterX - 1.2,
      plazaCenterX + 1.2,
      plazaCenterZ + 4.6,
      plazaCenterZ + 5.4,
      'Plaza Bench South'
    );

    // 5. Community Noticeboard (Neighborhood Hub) at the east edge of the plaza
    const boardX = plazaCenterX + 6.5;
    const boardZ = plazaCenterZ;

    const kioskGroup = new THREE.Group();
    kioskGroup.position.set(boardX, 0, boardZ);

    const postGeo = new THREE.BoxGeometry(0.18, 2.4, 0.18);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const p1 = new THREE.Mesh(postGeo, postMat);
    p1.position.set(-0.85, 1.2, 0);
    const p2 = new THREE.Mesh(postGeo, postMat);
    p2.position.set(0.85, 1.2, 0);
    kioskGroup.add(p1, p2);

    const boardGeo = new THREE.BoxGeometry(1.9, 1.3, 0.12);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.8 }); // Cork board tone
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardMesh.position.set(0, 1.5, 0);
    boardMesh.castShadow = true;
    kioskGroup.add(boardMesh);

    // Green Lagos header
    const signHeaderGeo = new THREE.BoxGeometry(2.0, 0.35, 0.16);
    const signHeaderMat = new THREE.MeshStandardMaterial({ color: 0x15803d }); // Lagos Green
    const signHeader = new THREE.Mesh(signHeaderGeo, signHeaderMat);
    signHeader.position.set(0, 2.25, 0);
    kioskGroup.add(signHeader);

    this.group.add(kioskGroup);
    this.collisionWorld.addObstacle(
      boardX - 1.1,
      boardX + 1.1,
      boardZ - 0.4,
      boardZ + 0.4,
      'Kiosk: Tinubu Square Community Noticeboard'
    );

    // Noticeboard Marker & Interaction
    const kioskMarker = new InteractableMarker(
      boardX,
      boardZ + 1.2,
      0xf59e0b,
      'Public Noticeboard'
    );
    this.markers.push(kioskMarker);
    this.group.add(kioskMarker.getMesh());

    this.interactionRegistry.register({
      id: 'interact_noticeboard',
      name: 'Neighborhood Noticeboard',
      promptAction: 'read community bulletin and incident alerts [E]',
      description:
        'Tinubu Square community notices, cybersecurity warnings, and local business bulletins.',
      position: [boardX, 0, boardZ + 1.2],
      radius: 2.6,
    });
  }

  /**
   * Builds the vibrant Balogun / Idumota Market Cluster with storefronts,
   * market stalls, display crates, and the parked Danfo minibus.
   */
  private buildBalogunMarket(): void {
    // 1. Market Storefront 1: "Balogun Electronics & Cables"
    const electronicsShop = new Building({
      name: 'Balogun Electronics & Cables',
      x: 22,
      z: -14,
      width: 12,
      height: 9,
      depth: 8,
      style: 'MARKET_STOREFRONT',
      color: 0xf1f5f9,
      trimColor: 0x1e293b,
      accentColor: 0x0284c7, // Blue sign
      awningColors: [0x0284c7, 0xfacc15], // Blue & Yellow stripes
      entranceSide: 'SOUTH',
      hasWaterTank: true,
    });
    this.buildings.push(electronicsShop);
    this.group.add(electronicsShop.getMesh());
    this.collisionWorld.addObstacle(
      electronicsShop.getBoundingBox().minX,
      electronicsShop.getBoundingBox().maxX,
      electronicsShop.getBoundingBox().minZ,
      electronicsShop.getBoundingBox().maxZ,
      'Building: Balogun Electronics & Cables'
    );

    // 2. Market Storefront 2: "Eko Fabrics & Lace Emporium"
    const fabricsShop = new Building({
      name: 'Eko Fabrics & Lace Emporium',
      x: 22,
      z: -26,
      width: 12,
      height: 9,
      depth: 8,
      style: 'MARKET_STOREFRONT',
      color: 0xfef3c7,
      trimColor: 0x78350f,
      accentColor: 0xd97706, // Amber sign
      awningColors: [0xd97706, 0x15803d], // Amber & Green stripes
      entranceSide: 'SOUTH',
      hasWaterTank: true,
    });
    this.buildings.push(fabricsShop);
    this.group.add(fabricsShop.getMesh());
    this.collisionWorld.addObstacle(
      fabricsShop.getBoundingBox().minX,
      fabricsShop.getBoundingBox().maxX,
      fabricsShop.getBoundingBox().minZ,
      fabricsShop.getBoundingBox().maxZ,
      'Building: Eko Fabrics & Lace Emporium'
    );

    // 3. Four Colorful Market Stalls along Balogun Market Lane
    const stallsConfig = [
      { x: 10, z: -8, color1: 0x15803d, color2: 0xfef3c7, name: 'Mama Nkechi Provisions' },
      { x: 16, z: -8, color1: 0x0284c7, color2: 0xfacc15, name: 'Danfo Mobile Accessories' },
      { x: 22, z: -8, color1: 0xe11d48, color2: 0xfef3c7, name: 'Iya Basira Textiles' },
      { x: 28, z: -8, color1: 0xd97706, color2: 0x15803d, name: 'Lagos Fresh Citrus & Yams' },
    ];

    stallsConfig.forEach(cfg => {
      const stall = LagosProps.createMarketStall(cfg.x, cfg.z, 0, cfg.color1, cfg.color2, cfg.name);
      this.group.add(stall.mesh);
      if (stall.aabb) {
        this.collisionWorld.addObstacle(
          stall.aabb.minX,
          stall.aabb.maxX,
          stall.aabb.minZ,
          stall.aabb.maxZ,
          stall.aabb.label ?? `Stall: ${cfg.name}`
        );
      }
    });

    // 4. Iconic Lagos Danfo Minibus (parked curbside on Broad Street near Market Lane)
    const danfo = LagosProps.createDanfoMinibus(6.5, -4, 0);
    this.group.add(danfo.mesh);
    if (danfo.aabb) {
      this.collisionWorld.addObstacle(
        danfo.aabb.minX,
        danfo.aabb.maxX,
        danfo.aabb.minZ,
        danfo.aabb.maxZ,
        danfo.aabb.label ?? 'Danfo Minibus'
      );
    }
  }

  /**
   * Builds utility poles with overhead power lines, streetlights, and official street signs.
   */
  private buildStreetDetails(): void {
    // 1. Concrete Utility Poles with Overhead Lines
    const poleCoords: [number, number][] = [
      [-5.5, -24],
      [-5.5, -4],
      [5.5, -4],
      [5.5, 14],
    ];

    poleCoords.forEach(([px, pz]) => {
      const pole = LagosProps.createUtilityPole(px, pz);
      this.group.add(pole.mesh);
      if (pole.aabb) {
        this.collisionWorld.addObstacle(
          pole.aabb.minX,
          pole.aabb.maxX,
          pole.aabb.minZ,
          pole.aabb.maxZ,
          pole.aabb.label ?? 'Utility Pole'
        );
      }
    });

    // Overhead power line wires connecting poles
    const wireMat = new THREE.LineBasicMaterial({ color: 0x0f172a });
    const wirePointsWest = [
      new THREE.Vector3(-5.5, 6.6, -24),
      new THREE.Vector3(-5.5, 6.4, -14),
      new THREE.Vector3(-5.5, 6.6, -4),
    ];
    const wireGeoWest = new THREE.BufferGeometry().setFromPoints(wirePointsWest);
    const wireWest = new THREE.Line(wireGeoWest, wireMat);
    this.group.add(wireWest);

    const wirePointsEast = [
      new THREE.Vector3(5.5, 6.6, -4),
      new THREE.Vector3(5.5, 6.4, 5),
      new THREE.Vector3(5.5, 6.6, 14),
    ];
    const wireGeoEast = new THREE.BufferGeometry().setFromPoints(wirePointsEast);
    const wireEast = new THREE.Line(wireGeoEast, wireMat);
    this.group.add(wireEast);

    // Cross-street overhead wire connecting east and west poles
    const crossWirePoints = [
      new THREE.Vector3(-5.5, 6.6, -4),
      new THREE.Vector3(0, 6.2, -4),
      new THREE.Vector3(5.5, 6.6, -4),
    ];
    const crossWireGeo = new THREE.BufferGeometry().setFromPoints(crossWirePoints);
    const crossWire = new THREE.Line(crossWireGeo, wireMat);
    this.group.add(crossWire);

    // 2. Official Lagos State Green Street Signs
    const signs = [
      { x: -5.5, z: -18, name: 'BROAD STREET', rot: Math.PI / 2 },
      { x: -5.5, z: 18, name: 'MARINA ROAD', rot: 0 },
      { x: 5.5, z: -12, name: 'BALOGUN STREET', rot: 0 },
      { x: -10.0, z: 2, name: 'TINUBU SQUARE', rot: Math.PI / 2 },
    ];
    signs.forEach(s => {
      const signMesh = LagosProps.createStreetSign(s.x, s.z, s.name, s.rot);
      this.group.add(signMesh);
    });

    // 3. Streetlights with warm amber lanterns
    const streetlightCoords: [number, number][] = [
      [-5.5, -12],
      [-5.5, 8],
      [5.5, 2],
      [-14, 18],
      [14, 18],
    ];

    const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 4.2, 8);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const lampHeadGeo = new THREE.BoxGeometry(0.5, 0.25, 0.5);
    const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0xfef08a }); // Warm tropical streetlight

    streetlightCoords.forEach(([lx, lz]) => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(lx, 0, lz);

      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 2.1;
      pole.castShadow = true;
      lampGroup.add(pole);

      const head = new THREE.Mesh(lampHeadGeo, lampHeadMat);
      head.position.y = 4.2;
      lampGroup.add(head);

      const light = new THREE.PointLight(0xfef08a, 1.2, 14);
      light.position.y = 4.0;
      lampGroup.add(light);

      this.group.add(lampGroup);

      this.collisionWorld.addObstacle(lx - 0.3, lx + 0.3, lz - 0.3, lz + 0.3, 'Streetlight');
    });
  }

  /**
   * Builds perimeter safety barriers to contain the explorable slice.
   */
  private buildPerimeterBoundaries(): void {
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const barrierGeoH = new THREE.BoxGeometry(76, 1.4, 0.5);
    const barrierGeoV = new THREE.BoxGeometry(0.5, 1.4, 76);

    // North Boundary Wall
    const northBarrier = new THREE.Mesh(barrierGeoH, barrierMat);
    northBarrier.position.set(0, 0.7, -37.5);
    this.group.add(northBarrier);
    this.collisionWorld.addObstacle(-38, 38, -38, -37, 'North Boundary Wall');

    // South Boundary Wall (at the seawall edge)
    const southBarrier = new THREE.Mesh(barrierGeoH, barrierMat);
    southBarrier.position.set(0, 0.7, 37.5);
    this.group.add(southBarrier);
    this.collisionWorld.addObstacle(-38, 38, 37, 38, 'South Boundary Wall');

    // West Boundary Wall
    const westBarrier = new THREE.Mesh(barrierGeoV, barrierMat);
    westBarrier.position.set(-37.5, 0.7, 0);
    this.group.add(westBarrier);
    this.collisionWorld.addObstacle(-38, -37, -38, 38, 'West Boundary Wall');

    // East Boundary Wall
    const eastBarrier = new THREE.Mesh(barrierGeoV, barrierMat);
    eastBarrier.position.set(37.5, 0.7, 0);
    this.group.add(eastBarrier);
    this.collisionWorld.addObstacle(37, 38, -38, 38, 'East Boundary Wall');
  }

  /**
   * Constructs an interior scene (Cedarline Lobby or Apartment Room).
   */
  public buildInteriorScene(locationId: string): void {
    this.clear();
    this.isOutdoor = false;

    // Interior room bounds: spacious 16x14 room so 3rd person camera never clips outside
    const roomW = 16;
    const roomD = 14;
    const roomH = 5.0;
    const halfW = roomW / 2;
    const halfD = roomD / 2;

    this.collisionWorld.setBounds({
      minX: -halfW + 0.5,
      maxX: halfW - 0.5,
      minZ: -halfD + 0.5,
      maxZ: halfD - 0.5,
    });

    const isCedarline = locationId === 'cedarline_interior';
    const floorColor = isCedarline ? 0x0f172a : 0x1e293b;
    const wallColor = isCedarline ? 0x1e293b : 0x334155;
    const accentColor = isCedarline ? 0x10b981 : 0x38bdf8;

    // Interior Dedicated Lighting
    const interiorLight = new THREE.PointLight(0xffffff, 2.8, 30);
    interiorLight.position.set(0, 4.2, 0);
    interiorLight.castShadow = true;
    this.group.add(interiorLight);

    const interiorAccentLight = new THREE.PointLight(accentColor, 2.0, 15);
    interiorAccentLight.position.set(0, 2.0, -3.5);
    this.group.add(interiorAccentLight);

    const interiorAmbient = new THREE.AmbientLight(0xffffff, 0.7);
    this.group.add(interiorAmbient);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(roomW, roomD);
    const floorMat = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.3,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    this.group.add(floor);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.6,
      metalness: 0.1,
    });

    // North Wall (Behind Workstation)
    const nWallGeo = new THREE.BoxGeometry(roomW, roomH, 0.4);
    const nWall = new THREE.Mesh(nWallGeo, wallMat);
    nWall.position.set(0, roomH / 2, -halfD);
    nWall.receiveShadow = true;
    this.group.add(nWall);

    // East Wall
    const sideWallGeo = new THREE.BoxGeometry(0.4, roomH, roomD);
    const eWall = new THREE.Mesh(sideWallGeo, wallMat);
    eWall.position.set(halfW, roomH / 2, 0);
    eWall.receiveShadow = true;
    this.group.add(eWall);

    // West Wall
    const wWall = new THREE.Mesh(sideWallGeo, wallMat);
    wWall.position.set(-halfW, roomH / 2, 0);
    wWall.receiveShadow = true;
    this.group.add(wWall);

    // South Wall (with wide entrance doorway gap in middle)
    const sWallLGeo = new THREE.BoxGeometry(halfW - 2.0, roomH, 0.4);
    const sWallL = new THREE.Mesh(sWallLGeo, wallMat);
    sWallL.position.set(-(halfW / 2 + 1.0), roomH / 2, halfD);
    this.group.add(sWallL);

    const sWallR = new THREE.Mesh(sWallLGeo, wallMat);
    sWallR.position.set(halfW / 2 + 1.0, roomH / 2, halfD);
    this.group.add(sWallR);

    // Interior Furniture: Detailed Physical Workstation (Desk, Laptop, Chair, Mouse)
    this.workstationProps = new WorkstationProps({ isCedarline, accentColor });
    this.group.add(this.workstationProps.getMesh());
    this.collisionWorld.addObstacle(-2.5, 2.5, -4.8, -2.8, 'Workstation Desk');

    // Workstation Interaction Trigger & Marker in front of desk
    const wsMarker = new InteractableMarker(0, -2.4, accentColor, 'Workstation Terminal');
    this.markers.push(wsMarker);
    this.group.add(wsMarker.getMesh());

    this.interactionRegistry.register({
      id: isCedarline ? 'interact_cedarline_workstation' : 'interact_apartment_workstation',
      name: isCedarline ? 'Cedarline Workstation' : 'Research Workstation',
      promptAction: isCedarline
        ? 'access Cedarline corporate terminal [E]'
        : 'access personal research workstation [E]',
      description: isCedarline
        ? 'A secured enterprise terminal connected to the Cedarline internal network.'
        : 'Your personal cybersecurity research rig and simulated development terminal.',
      position: [0, 0, -2.4],
      radius: 2.2,
    });

    // Exit Doorway Marker at (0, 0, 5.0)
    const exitMarker = new InteractableMarker(0, 5.0, accentColor, 'Exit Door');
    this.markers.push(exitMarker);
    this.group.add(exitMarker.getMesh());

    this.interactionRegistry.register({
      id: 'interact_exit_door',
      name: isCedarline ? 'Cedarline Services Exit' : 'Apartment Exit',
      promptAction: 'return to the outdoor neighborhood [E]',
      description: 'Exit the building and return to Broad Street, Lagos Island.',
      position: [0, 0, 5.0],
      radius: 3.0,
      targetLocationId: 'neighborhood',
    });
  }

  public update(deltaTime: number, simulationTimeStr = '08:00 AM'): void {
    this.markers.forEach(m => m.update(deltaTime));
    if (this.pedestrianSystem && this.isOutdoor) {
      this.pedestrianSystem.update(deltaTime);
    }
    if (this.trafficSystem && this.isOutdoor) {
      this.trafficSystem.update(deltaTime);
    }
    if (this.workstationProps && !this.isOutdoor) {
      this.workstationProps.update(deltaTime, simulationTimeStr);
    }
  }

  public getWorkstationProps(): WorkstationProps | null {
    return this.workstationProps;
  }

  public getPedestrianSystem(): PedestrianSystem | null {
    return this.pedestrianSystem;
  }

  public getTrafficSystem(): TrafficSystem | null {
    return this.trafficSystem;
  }

  public clear(): void {
    if (this.workstationProps) {
      this.workstationProps.dispose();
      this.workstationProps = null;
    }
    if (this.pedestrianSystem) {
      this.pedestrianSystem.dispose();
      this.pedestrianSystem = null;
    }
    if (this.trafficSystem) {
      this.trafficSystem.dispose();
      this.trafficSystem = null;
    }

    this.buildings.forEach(b => b.dispose());
    this.buildings = [];

    this.markers.forEach(m => m.dispose());
    this.markers = [];

    this.collisionWorld.clear();
    this.interactionRegistry.clear();

    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();

    while (this.group.children.length > 0) {
      const child = this.group.children[0];
      if (child) {
        this.group.remove(child);
        child.traverse(obj => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.Line) {
            if (obj.geometry) geometries.add(obj.geometry);
            if (obj.material) {
              if (Array.isArray(obj.material)) obj.material.forEach(m => materials.add(m));
              else materials.add(obj.material);
            }
          }
        });
      }
    }

    geometries.forEach(g => g.dispose());
    materials.forEach(m => m.dispose());
  }

  public dispose(): void {
    this.clear();
    if (this.group.parent) {
      this.group.parent.remove(this.group);
    }
  }
}
