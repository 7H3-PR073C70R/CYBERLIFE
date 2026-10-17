import * as THREE from 'three';
import { CollisionWorld } from './CollisionWorld';
import { InteractionRegistry } from './InteractionRegistry';
import { Building } from './entities/Building';
import { InteractableMarker } from './entities/InteractableMarker';
import { WORLD_CONFIG } from './worldConfig';

export class WorldEnvironment {
  private group: THREE.Group;
  private collisionWorld: CollisionWorld;
  private interactionRegistry: InteractionRegistry;

  private buildings: Building[] = [];
  private markers: InteractableMarker[] = [];
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
   * Constructs the compact outdoor urban block with streets, sidewalks, 3 distinct landmarks,
   * streetlights, benches, and collision obstacles.
   */
  public buildOutdoorNeighborhood(): void {
    this.clear();
    this.isOutdoor = true;

    // Set outdoor boundary limits
    this.collisionWorld.setBounds(WORLD_CONFIG.boundaries);

    // 1. Walkable Ground (Asphalt Main Street + Sidewalks)
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0b1120, // Dark asphalt
      roughness: 0.9,
      metalness: 0.1,
    });
    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    this.group.add(groundMesh);

    // Sidewalks (Raised slabs)
    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      metalness: 0.2,
    });

    // West Sidewalk (under Apartment)
    const swWestGeo = new THREE.BoxGeometry(14, 0.12, 56);
    const swWest = new THREE.Mesh(swWestGeo, sidewalkMat);
    swWest.position.set(-15, 0.06, 0);
    swWest.receiveShadow = true;
    this.group.add(swWest);

    // East Sidewalk (under Cedarline)
    const swEastGeo = new THREE.BoxGeometry(14, 0.12, 56);
    const swEast = new THREE.Mesh(swEastGeo, sidewalkMat);
    swEast.position.set(15, 0.06, 0);
    swEast.receiveShadow = true;
    this.group.add(swEast);

    // Road Divider Dashes
    const dashMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
    const dashGeo = new THREE.BoxGeometry(0.3, 0.02, 2.5);
    for (let z = -25; z <= 25; z += 6) {
      const dash = new THREE.Mesh(dashGeo, dashMat);
      dash.position.set(0, 0.015, z);
      this.group.add(dash);
    }

    // 2. Landmark 1: Player Apartment Building
    const apartment = new Building({
      name: 'Player Apartment',
      x: -15,
      z: 4,
      width: 10,
      height: 12,
      depth: 12,
      color: 0x1e293b,
      trimColor: 0x0f172a,
      accentColor: 0x38bdf8,
      entranceSide: 'EAST', // Facing the street
    });
    this.buildings.push(apartment);
    this.group.add(apartment.getMesh());
    this.collisionWorld.addObstacle(
      apartment.getBoundingBox().minX,
      apartment.getBoundingBox().maxX,
      apartment.getBoundingBox().minZ,
      apartment.getBoundingBox().maxZ,
      'Building: Player Apartment'
    );

    // Apartment Entrance Marker & Interaction
    const aptMarker = new InteractableMarker(-9.5, 4, 0x38bdf8, 'Apartment Entrance');
    this.markers.push(aptMarker);
    this.group.add(aptMarker.getMesh());

    this.interactionRegistry.register({
      id: 'interact_apartment_entrance',
      name: 'Player Apartment',
      promptAction: 'enter your studio apartment [E]',
      description: 'Your home base and workstation desk for cybersecurity operations.',
      position: [-9.5, 0, 4],
      radius: 2.5,
      targetLocationId: 'apartment_interior',
    });

    // 3. Landmark 2: Cedarline Services Corporate HQ
    const cedarline = new Building({
      name: 'Cedarline Services',
      x: 15,
      z: -4,
      width: 12,
      height: 16,
      depth: 14,
      color: 0x0f172a,
      trimColor: 0x0284c7,
      accentColor: 0x10b981,
      entranceSide: 'WEST', // Facing the street
    });
    this.buildings.push(cedarline);
    this.group.add(cedarline.getMesh());
    this.collisionWorld.addObstacle(
      cedarline.getBoundingBox().minX,
      cedarline.getBoundingBox().maxX,
      cedarline.getBoundingBox().minZ,
      cedarline.getBoundingBox().maxZ,
      'Building: Cedarline Services'
    );

    // Cedarline Entrance Marker & Interaction
    const cedarMarker = new InteractableMarker(8.5, -4, 0x10b981, 'Cedarline Services Entrance');
    this.markers.push(cedarMarker);
    this.group.add(cedarMarker.getMesh());

    this.interactionRegistry.register({
      id: 'interact_cedarline_entrance',
      name: 'Cedarline Services HQ',
      promptAction: 'enter Cedarline Services corporate lobby [E]',
      description: 'Headquarters of Cedarline Services — origin of the Aster incident.',
      position: [8.5, 0, -4],
      radius: 2.5,
      targetLocationId: 'cedarline_interior',
    });

    // 4. Landmark 3: Neighborhood Public Plaza & Noticeboard
    this.buildNeighborhoodHub();

    // 5. Environmental Street Furniture & Perimeter Barriers
    this.buildStreetDecorations();
  }

  /**
   * Builds Landmark 3: The Public Hub / Noticeboard in the center-north of the block.
   */
  private buildNeighborhoodHub(): void {
    // Noticeboard Kiosk
    const kioskGroup = new THREE.Group();
    kioskGroup.position.set(0, 0, -12);

    const postGeo = new THREE.BoxGeometry(0.2, 2.4, 0.2);
    const postMat = new THREE.MeshStandardMaterial({ color: 0x334155 });
    const p1 = new THREE.Mesh(postGeo, postMat);
    p1.position.set(-0.9, 1.2, 0);
    const p2 = new THREE.Mesh(postGeo, postMat);
    p2.position.set(0.9, 1.2, 0);
    kioskGroup.add(p1, p2);

    const boardGeo = new THREE.BoxGeometry(2.0, 1.3, 0.15);
    const boardMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5 });
    const boardMesh = new THREE.Mesh(boardGeo, boardMat);
    boardMesh.position.set(0, 1.5, 0);
    boardMesh.castShadow = true;
    kioskGroup.add(boardMesh);

    const signHeaderGeo = new THREE.BoxGeometry(2.1, 0.3, 0.2);
    const signHeaderMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
    const signHeader = new THREE.Mesh(signHeaderGeo, signHeaderMat);
    signHeader.position.set(0, 2.25, 0);
    kioskGroup.add(signHeader);

    this.group.add(kioskGroup);

    // Add collision for kiosk
    this.collisionWorld.addObstacle(-1.2, 1.2, -12.4, -11.6, 'Kiosk: Community Noticeboard');

    // Add marker and interaction for noticeboard
    const kioskMarker = new InteractableMarker(0, -10.5, 0xf59e0b, 'Public Noticeboard');
    this.markers.push(kioskMarker);
    this.group.add(kioskMarker.getMesh());

    this.interactionRegistry.register({
      id: 'interact_noticeboard',
      name: 'Neighborhood Noticeboard',
      promptAction: 'read community bulletin and incident alerts [E]',
      description: 'Local notices, cybersecurity warnings, and community tips.',
      position: [0, 0, -10.5],
      radius: 2.5,
    });
  }

  /**
   * Builds streetlights, planters, and perimeter boundary rails.
   */
  private buildStreetDecorations(): void {
    // Streetlight Lamp Posts
    const lampPositions: [number, number][] = [
      [-7, 10],
      [7, 10],
      [-7, -10],
      [7, -10],
    ];

    const poleGeo = new THREE.CylinderGeometry(0.08, 0.1, 4.0);
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x475569 });
    const lampHeadGeo = new THREE.BoxGeometry(0.5, 0.2, 0.5);
    const lampHeadMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    lampPositions.forEach(([lx, lz]) => {
      const lampGroup = new THREE.Group();
      lampGroup.position.set(lx, 0, lz);

      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 2.0;
      pole.castShadow = true;
      lampGroup.add(pole);

      const head = new THREE.Mesh(lampHeadGeo, lampHeadMat);
      head.position.y = 4.0;
      lampGroup.add(head);

      const light = new THREE.PointLight(0x38bdf8, 0.9, 12);
      light.position.y = 3.8;
      lampGroup.add(light);

      this.group.add(lampGroup);

      // Add collision obstacle for light pole
      this.collisionWorld.addObstacle(lx - 0.3, lx + 0.3, lz - 0.3, lz + 0.3, 'Streetlight');
    });

    // Perimeter boundary visual barriers (along North and South edges)
    const barrierMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.8 });
    const barrierGeo = new THREE.BoxGeometry(56, 1.2, 0.4);

    const northBarrier = new THREE.Mesh(barrierGeo, barrierMat);
    northBarrier.position.set(0, 0.6, -27.5);
    this.group.add(northBarrier);
    this.collisionWorld.addObstacle(-28, 28, -28, -27, 'North Boundary Wall');

    const southBarrier = new THREE.Mesh(barrierGeo, barrierMat);
    southBarrier.position.set(0, 0.6, 27.5);
    this.group.add(southBarrier);
    this.collisionWorld.addObstacle(-28, 28, 27, 28, 'South Boundary Wall');
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

    // Interior Furniture (Desk / Terminal Stand)
    const deskGeo = new THREE.BoxGeometry(4.0, 0.85, 1.6);
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.6 });
    const desk = new THREE.Mesh(deskGeo, deskMat);
    desk.position.set(0, 0.42, -3.8);
    desk.castShadow = true;
    desk.receiveShadow = true;
    this.group.add(desk);
    this.collisionWorld.addObstacle(-2.5, 2.5, -4.8, -2.8, 'Workstation Desk');

    // Terminal Monitor on desk
    const monitorGeo = new THREE.BoxGeometry(1.6, 0.9, 0.15);
    const monitorMat = new THREE.MeshBasicMaterial({ color: accentColor });
    const monitor = new THREE.Mesh(monitorGeo, monitorMat);
    monitor.position.set(0, 1.35, -3.7);
    this.group.add(monitor);

    // Exit Doorway Marker at (0, 0, 5.0)
    const exitMarker = new InteractableMarker(0, 5.0, accentColor, 'Exit Door');
    this.markers.push(exitMarker);
    this.group.add(exitMarker.getMesh());

    this.interactionRegistry.register({
      id: 'interact_exit_door',
      name: isCedarline ? 'Cedarline Services Exit' : 'Apartment Exit',
      promptAction: 'return to the outdoor neighborhood [E]',
      description: 'Exit the building and return to the outdoor street block.',
      position: [0, 0, 5.0],
      radius: 3.0,
      targetLocationId: 'neighborhood',
    });
  }

  public update(deltaTime: number): void {
    this.markers.forEach(m => m.update(deltaTime));
  }

  public clear(): void {
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
          if (obj instanceof THREE.Mesh) {
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
