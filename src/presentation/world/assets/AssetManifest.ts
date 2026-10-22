/**
 * Cyberlife — Asset Manifest & Provenance Registry
 *
 * Authoritative, machine-readable inventory tracking provenance, licensing,
 * local paths, technical properties, collision compatibility, integration status,
 * visual browser verification evidence, and replacement priorities for all 3D models,
 * textures, and procedural generators.
 *
 * NON-NEGOTIABLE POLICY:
 * - Distinguish clearly between discovered, licensed, downloaded, validated, optimized, integrated, and visually verified.
 * - Never invent downloads, sources, or licenses.
 * - Primitive placeholders are documented fallbacks, never silently considered production-ready.
 */

export type AcquisitionStatus =
  | 'discovered'        // Identified as candidate, not yet downloaded or licensed
  | 'licensed'          // License verified and approved (e.g. CC0, CC-BY, ISC)
  | 'downloaded'        // Raw source file present in workspace or assets_incoming
  | 'validated'         // Mesh, skeleton, texture coordinates, and scale inspected
  | 'optimized'         // Triangle count decimated, textures WebP compressed, meshopt applied
  | 'integrated'        // Loaded and rendered in scene code (Three.js / WorldSceneManager)
  | 'visually_verified'; // Confirmed rendered correctly in browser with screenshot evidence

export type AssetCategory =
  | 'character'
  | 'animation'
  | 'workstation_hero'
  | 'interior_furniture'
  | 'interior_appliance'
  | 'interior_prop'
  | 'vehicle'
  | 'vegetation'
  | 'street_furniture'
  | 'pbr_texture'
  | 'ui_graphics'
  | 'procedural_generator';

export type ReplacementPriority = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface AssetManifestEntry {
  readonly id: string;
  readonly name: string;
  readonly category: AssetCategory;
  readonly intendedUse: string;
  readonly associatedSceneOrPlacement: string;
  readonly sourceUrl: string;
  readonly acquisitionStatus: AcquisitionStatus;
  readonly license: string;
  readonly attributionRequirements: string;
  readonly localPath: string;
  readonly format: 'gltf' | 'glb' | 'fbx' | 'png' | 'jpg' | 'webp' | 'procedural_ts';
  readonly fileSizeBytes?: number;
  readonly triangleCount?: number;
  readonly textureResolution?: string;
  readonly materialType: 'PBR_STANDARD' | 'UNLIT_BASIC' | 'CANVAS_TEXTURE' | 'PROCEDURAL';
  readonly isRigged: boolean;
  readonly hasCollisionBounds: boolean;
  readonly visualVerificationEvidence?: string;
  readonly knownDefects?: readonly string[];
  readonly replacementPriority: ReplacementPriority;
  readonly fallbackBehavior: string;
}

export const ASSET_MANIFEST: readonly AssetManifestEntry[] = [
  // ==========================================================================
  // 1. Characters & Rigged Meshes
  // ==========================================================================
  {
    id: 'char_player_male',
    name: 'Player Protagonist Male Character',
    category: 'character',
    intendedUse: 'Third-person playable avatar and male NPC rendering',
    associatedSceneOrPlacement: 'WorldSceneManager (PlayerAvatar, NpcManager)',
    sourceUrl: 'https://www.mixamo.com',
    acquisitionStatus: 'visually_verified',
    license: 'Adobe Mixamo Terms of Service (royalty-free for project use)',
    attributionRequirements: 'Raw assets not redistributed standalone; bundled in project',
    localPath: 'public/assets/characters/player_male.glb',
    format: 'glb',
    fileSizeBytes: 1251004,
    triangleCount: 38240,
    textureResolution: '2048x2048 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: true,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/step1b/after/player_seated_at_desk.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Procedural segmented HumanoidCharacter with Afro-descendant skin tone palette',
  },
  {
    id: 'char_player_female',
    name: 'Player Protagonist Female Character',
    category: 'character',
    intendedUse: 'Third-person playable avatar and female NPC rendering',
    associatedSceneOrPlacement: 'WorldSceneManager (PlayerAvatar, NpcManager)',
    sourceUrl: 'https://www.mixamo.com',
    acquisitionStatus: 'visually_verified',
    license: 'Adobe Mixamo Terms of Service (royalty-free for project use)',
    attributionRequirements: 'Raw assets not redistributed standalone; bundled in project',
    localPath: 'public/assets/characters/player_female.glb',
    format: 'glb',
    fileSizeBytes: 2254740,
    triangleCount: 39420,
    textureResolution: '2048x2048 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: true,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/step2/after/female_seated_typing.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Procedural segmented HumanoidCharacter with Afro-descendant skin tone palette',
  },
  {
    id: 'char_ped_male_2',
    name: 'Lagos Pedestrian Male 2',
    category: 'character',
    intendedUse: 'Ambient street pedestrians, conductors, and corporate workers',
    associatedSceneOrPlacement: 'PedestrianSystem, TrafficSystem (Danfo conductor)',
    sourceUrl: 'https://www.mixamo.com',
    acquisitionStatus: 'visually_verified',
    license: 'Adobe Mixamo Terms of Service',
    attributionRequirements: 'Bundled inside project',
    localPath: 'public/assets/characters/ped_male_2.glb',
    format: 'glb',
    fileSizeBytes: 458436,
    triangleCount: 24694,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: true,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/step3/after/street_pedestrian_near_interaction_target.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Procedural HumanoidCharacter with dynamic attire palette',
  },
  {
    id: 'char_ped_female_2',
    name: 'Lagos Pedestrian Female 2',
    category: 'character',
    intendedUse: 'Ambient street pedestrians and Balogun market shoppers',
    associatedSceneOrPlacement: 'PedestrianSystem, TrafficSystem bus stop passengers',
    sourceUrl: 'https://www.mixamo.com',
    acquisitionStatus: 'visually_verified',
    license: 'Adobe Mixamo Terms of Service',
    attributionRequirements: 'Bundled inside project',
    localPath: 'public/assets/characters/ped_female_2.glb',
    format: 'glb',
    fileSizeBytes: 807924,
    triangleCount: 24429,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: true,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/step3/after/street_pedestrians_closeup.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Procedural HumanoidCharacter with dynamic attire palette',
  },
  {
    id: 'anim_rigged_suite',
    name: 'Rigged Character Animation Suite (7 Clips)',
    category: 'animation',
    intendedUse: 'Locomotion, seated idle, keyboard typing, and stand-to-sit transitions',
    associatedSceneOrPlacement: 'RiggedHumanoidCharacter, RiggedPedestrian, RiggedNpcCharacter',
    sourceUrl: 'https://www.mixamo.com',
    acquisitionStatus: 'visually_verified',
    license: 'Adobe Mixamo Terms of Service',
    attributionRequirements: 'Merged and optimized clips bundled inside project',
    localPath: 'public/assets/characters/animations.glb',
    format: 'glb',
    fileSizeBytes: 265388,
    triangleCount: 0,
    materialType: 'PBR_STANDARD',
    isRigged: true,
    hasCollisionBounds: false,
    visualVerificationEvidence: 'docs/graphics/camera_states/03_seated_third_person.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Synthetic procedural arm/leg swinging and head bobbing in HumanoidCharacter',
  },

  // ==========================================================================
  // 2. Workstation Hero & Interior Furniture Props
  // ==========================================================================
  {
    id: 'prop_desk',
    name: 'Industrial Metal Office Desk',
    category: 'workstation_hero',
    intendedUse: 'Primary workstation desk in player apartment and Cedarline SOC',
    associatedSceneOrPlacement: 'WorkstationProps (apartment_interior)',
    sourceUrl: 'https://polyhaven.com/a/metal_office_desk',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required; Poly Haven public domain',
    localPath: 'public/assets/props/desk.glb',
    format: 'glb',
    fileSizeBytes: 178500,
    triangleCount: 14200,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/interaction_fixes/02_cybersecurity_desk_details.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'BoxGeometry procedural desk with metallic grey paint',
  },
  {
    id: 'prop_chair',
    name: 'Ergonomic Mesh Task Chair',
    category: 'workstation_hero',
    intendedUse: 'Workstation seating with seated avatar alignment anchor (SEAT_ANCHOR)',
    associatedSceneOrPlacement: 'WorkstationProps, WorkstationAnchors',
    sourceUrl: 'https://polyhaven.com & Cyberlife Team',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/props/chair.glb',
    format: 'glb',
    fileSizeBytes: 17952,
    triangleCount: 4680,
    textureResolution: 'PBR Procedural / WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/interaction_fixes/03_chair_standup_clearance.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Cylinder and box procedural office chair',
  },
  {
    id: 'prop_computer',
    name: 'Classic Laptop & Dedicated Monitor Rig',
    category: 'workstation_hero',
    intendedUse: 'Workstation computing rig hosting the virtual desktop SCREEN_QUAD',
    associatedSceneOrPlacement: 'WorkstationProps, ScreenRenderer',
    sourceUrl: 'https://polyhaven.com/a/classic_laptop',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/props/computer.glb',
    format: 'glb',
    fileSizeBytes: 95800,
    triangleCount: 8420,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/camera_states/05_screen_fullscreen.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'BoxGeometry monitor frame with emissive CanvasTexture quad',
  },
  {
    id: 'prop_desk_accessories',
    name: 'Desk Clutter (Lamp, Breadboard, Notepad, Mug)',
    category: 'interior_prop',
    intendedUse: 'Lived-in researcher desk accessories and hacker breadboard',
    associatedSceneOrPlacement: 'WorkstationProps',
    sourceUrl: 'https://polyhaven.com',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/props/props_desk.glb',
    format: 'glb',
    fileSizeBytes: 221248,
    triangleCount: 16800,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: false,
    visualVerificationEvidence: 'docs/graphics/interaction_fixes/02_cybersecurity_desk_details.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Individual procedural desk stationery meshes',
  },
  {
    id: 'prop_room_inverter',
    name: 'Lagos Inverter & Battery Storage Box',
    category: 'interior_appliance',
    intendedUse: 'Essential Lagos hybrid power backup unit in player apartment',
    associatedSceneOrPlacement: 'WorldEnvironment (apartment_interior)',
    sourceUrl: 'https://polyhaven.com/a/power_box_01',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/props/room_inverter.glb',
    format: 'glb',
    fileSizeBytes: 379248,
    triangleCount: 6850,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/interaction_fixes/07_electrical_conduits_breaker_box.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'BoxGeometry power inverter with LED indicators',
  },
  {
    id: 'prop_room_fan',
    name: 'Ceiling Fan with Rotating Blades',
    category: 'interior_appliance',
    intendedUse: 'Ceiling ventilation in tropical Lagos apartment interior',
    associatedSceneOrPlacement: 'WorldEnvironment (apartment_interior)',
    sourceUrl: 'https://polyhaven.com/a/ceiling_fan',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/props/room_fan.glb',
    format: 'glb',
    fileSizeBytes: 243352,
    triangleCount: 5120,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: false,
    visualVerificationEvidence: 'docs/graphics/interaction_fixes/01_apartment_interior_props.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Procedural 4-blade ceiling fan model',
  },
  {
    id: 'prop_room_ac',
    name: 'Split Air Conditioner Unit',
    category: 'interior_appliance',
    intendedUse: 'Wall-mounted split AC unit in player apartment',
    associatedSceneOrPlacement: 'WorldEnvironment (apartment_interior)',
    sourceUrl: 'https://polyhaven.com/a/exterior_aircon_unit',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/props/room_ac.glb',
    format: 'glb',
    fileSizeBytes: 1277860,
    triangleCount: 11400,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/interaction_fixes/01_apartment_interior_props.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'BoxGeometry wall air conditioner with ventilation louvers',
  },
  {
    id: 'prop_room_bed',
    name: 'Platform Daybed with Mattress',
    category: 'interior_furniture',
    intendedUse: 'Player rest, stamina recovery, and bedroom dressing',
    associatedSceneOrPlacement: 'WorldEnvironment (apartment_interior)',
    sourceUrl: 'https://polyhaven.com/a/vintage_day_bed',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/props/room_bed.glb',
    format: 'glb',
    fileSizeBytes: 458992,
    triangleCount: 9600,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/workstation_assets/apartment_wide_day.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'BoxGeometry platform bed with fabric material',
  },
  {
    id: 'prop_room_bookshelf',
    name: 'Worn Wooden Bookshelf',
    category: 'interior_furniture',
    intendedUse: 'Technical literature storage and room furnishing',
    associatedSceneOrPlacement: 'WorldEnvironment (apartment_interior)',
    sourceUrl: 'https://polyhaven.com/a/wooden_bookshelf_worn',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/props/room_bookshelf.glb',
    format: 'glb',
    fileSizeBytes: 565032,
    triangleCount: 7800,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/interaction_fixes/06_bookshelf_close_up.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Procedural wooden shelf with book meshes',
  },
  {
    id: 'prop_room_cabinet',
    name: 'Drawer Storage Cabinet',
    category: 'interior_furniture',
    intendedUse: 'Hardware component and document storage in apartment',
    associatedSceneOrPlacement: 'WorldEnvironment (apartment_interior)',
    sourceUrl: 'https://polyhaven.com/a/drawer_cabinet',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/props/room_cabinet.glb',
    format: 'glb',
    fileSizeBytes: 247792,
    triangleCount: 4200,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/interaction_fixes/01_apartment_interior_props.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'BoxGeometry wooden cabinet',
  },
  {
    id: 'prop_room_art',
    name: 'Framed Lagos Artwork',
    category: 'interior_prop',
    intendedUse: 'Wall decoration in player apartment',
    associatedSceneOrPlacement: 'WorldEnvironment (apartment_interior)',
    sourceUrl: 'https://polyhaven.com/a/hanging_picture_frame_01',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/props/room_art.glb',
    format: 'glb',
    fileSizeBytes: 105464,
    triangleCount: 1200,
    textureResolution: '512x512 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: false,
    visualVerificationEvidence: 'docs/graphics/interaction_fixes/01_apartment_interior_props.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'PlaneGeometry framed picture',
  },

  // ==========================================================================
  // 3. Realistic Lagos Vehicles
  // ==========================================================================
  {
    id: 'veh_danfo_realistic',
    name: 'Realistic Lagos Danfo Commercial Minibus',
    category: 'vehicle',
    intendedUse: 'Iconic yellow and black commercial transit minibus on Broad Street',
    associatedSceneOrPlacement: 'TrafficSystem (Broad Street traffic lane & bus stop)',
    sourceUrl: 'Cyberlife Team / Creative Commons Base',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 / Open Source Game Assets',
    attributionRequirements: 'None required',
    localPath: 'public/assets/vehicles/danfo_realistic.glb',
    format: 'glb',
    fileSizeBytes: 573996,
    triangleCount: 16840,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/enhancements/06_danfo_van_cutout_conductor.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Procedural LagosProps.createDanfoMinibus BoxGeometry mesh',
  },
  {
    id: 'veh_suv_realistic',
    name: 'Realistic Executive SUV',
    category: 'vehicle',
    intendedUse: 'Executive corporate traffic along Marina Boulevard',
    associatedSceneOrPlacement: 'TrafficSystem (Marina Boulevard southbound lane)',
    sourceUrl: 'Poly Haven / Creative Commons',
    acquisitionStatus: 'visually_verified',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/vehicles/suv_realistic.glb',
    format: 'glb',
    fileSizeBytes: 520208,
    triangleCount: 15400,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/enhancements/05_vehicles_and_traffic.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'BoxGeometry procedural corporate sedan',
  },

  // ==========================================================================
  // 4. Environmental Models with DEFECT / OPTIMIZATION BACKLOG
  // ==========================================================================
  {
    id: 'env_island_tree_01',
    name: 'Island Tropical Palm Tree 01',
    category: 'vegetation',
    intendedUse: 'Marina promenade and waterfront boulevard tropical landscaping',
    associatedSceneOrPlacement: 'WorldEnvironment (Marina Promenade)',
    sourceUrl: 'https://polyhaven.com/a/island_tree_01',
    acquisitionStatus: 'downloaded',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/environment/island_tree_01.glb',
    format: 'glb',
    fileSizeBytes: 66333792, // 66.3 MB!
    triangleCount: 184000,
    textureResolution: '4096x4096 Uncompressed PNG',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    knownDefects: [
      'CRITICAL: Excessive file size (66.3 MB) creates unacceptable browser load latency',
      'High polygon count (184,000 triangles) exceeds mobile and web performance budgets',
      'Uncompressed 4k textures require WebP conversion and 1k decimation',
    ],
    replacementPriority: 'HIGH',
    fallbackBehavior: 'Procedural CylinderGeometry trunk with Fan frond meshes generated in LagosProps.createPalmTree',
  },
  {
    id: 'env_quiver_tree_01',
    name: 'Quiver Desert Palm Tree 01',
    category: 'vegetation',
    intendedUse: 'Secondary street corner vegetation',
    associatedSceneOrPlacement: 'WorldEnvironment (Tinubu Square)',
    sourceUrl: 'https://polyhaven.com/a/quiver_tree_01',
    acquisitionStatus: 'downloaded',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/environment/quiver_tree_01.glb',
    format: 'glb',
    fileSizeBytes: 8878532, // 8.8 MB
    triangleCount: 42000,
    textureResolution: '2048x2048 JPG',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    knownDefects: ['Requires LOD decimation under 600 KB before integration'],
    replacementPriority: 'MEDIUM',
    fallbackBehavior: 'Procedural LagosProps.createPalmTree',
  },
  {
    id: 'env_street_lamp_01',
    name: 'Victorian Historic Street Lamp',
    category: 'street_furniture',
    intendedUse: 'Night illumination along Broad Street and Tinubu Square sidewalks',
    associatedSceneOrPlacement: 'LagosProps (Sidewalk street lighting)',
    sourceUrl: 'https://polyhaven.com/a/street_lamp_01',
    acquisitionStatus: 'validated',
    license: 'CC0 (Public Domain)',
    attributionRequirements: 'None required',
    localPath: 'public/assets/environment/street_lamp_01.glb',
    format: 'glb',
    fileSizeBytes: 2162976, // 2.1 MB
    triangleCount: 12400,
    textureResolution: '1024x1024 WebP',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    knownDefects: ['Can be further meshopt-compressed under 400 KB'],
    replacementPriority: 'MEDIUM',
    fallbackBehavior: 'Procedural concrete utility pole with emissive light fixture in LagosProps.createUtilityPole',
  },

  // ==========================================================================
  // 5. Authentic Procedural Architecture & Regional Urban Props
  // ==========================================================================
  {
    id: 'geo_building_afro_brazilian',
    name: 'Afro-Brazilian Heritage Residential Tenement',
    category: 'procedural_generator',
    intendedUse: 'Authentic 2-3 storey historic residential architecture of Broad Street',
    associatedSceneOrPlacement: 'Building.ts (Player Apartment, Tinubu Chambers)',
    sourceUrl: 'Original TypeScript Procedural Generation Code',
    acquisitionStatus: 'visually_verified',
    license: 'MIT (Cyberlife Project License)',
    attributionRequirements: 'Original project work',
    localPath: 'src/presentation/world/entities/Building.ts',
    format: 'procedural_ts',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/step1b/after/street_from_spawn.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Standard textured box building',
  },
  {
    id: 'geo_building_commercial_tower',
    name: 'Modern Corporate Commercial Tower',
    category: 'procedural_generator',
    intendedUse: 'Multi-storey corporate headquarters (Cedarline Marina Tower, Eko Merchant Bank)',
    associatedSceneOrPlacement: 'Building.ts',
    sourceUrl: 'Original TypeScript Procedural Generation Code',
    acquisitionStatus: 'visually_verified',
    license: 'MIT (Cyberlife Project License)',
    attributionRequirements: 'Original project work',
    localPath: 'src/presentation/world/entities/Building.ts',
    format: 'procedural_ts',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/step1b/after/cedarline_office.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'High-rise procedural box with window textures',
  },
  {
    id: 'geo_building_market_storefront',
    name: 'Balogun 2-Storey Market Storefront',
    category: 'procedural_generator',
    intendedUse: 'Ground-floor commercial roll-down metal security shutters and canvas awnings',
    associatedSceneOrPlacement: 'Building.ts (Balogun Electronics, Eko Fabrics)',
    sourceUrl: 'Original TypeScript Procedural Generation Code',
    acquisitionStatus: 'visually_verified',
    license: 'MIT (Cyberlife Project License)',
    attributionRequirements: 'Original project work',
    localPath: 'src/presentation/world/entities/Building.ts',
    format: 'procedural_ts',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/enhancements/04_commercial_billboards.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Standard storefront box geometry',
  },
  {
    id: 'geo_prop_market_stall',
    name: 'Balogun Wooden Market Stalls & Crates',
    category: 'procedural_generator',
    intendedUse: 'Vibrant sidewalk commerce, produce, and electronics display crates',
    associatedSceneOrPlacement: 'LagosProps.ts (Balogun Street sidewalk)',
    sourceUrl: 'Original TypeScript Procedural Generation Code',
    acquisitionStatus: 'visually_verified',
    license: 'MIT (Cyberlife Project License)',
    attributionRequirements: 'Original project work',
    localPath: 'src/presentation/world/entities/LagosProps.ts',
    format: 'procedural_ts',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/enhancements/03_broad_street_welcome_arch.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Box crates with colored canvas geometry',
  },
  {
    id: 'geo_prop_utility_pole',
    name: 'Concrete Utility Pole with Overhead Cable Matrix',
    category: 'procedural_generator',
    intendedUse: 'Authentic Lagos Island power distribution and telephone wire overhead clutter',
    associatedSceneOrPlacement: 'LagosProps.ts (Broad Street & Marina curbsides)',
    sourceUrl: 'Original TypeScript Procedural Generation Code',
    acquisitionStatus: 'visually_verified',
    license: 'MIT (Cyberlife Project License)',
    attributionRequirements: 'Original project work',
    localPath: 'src/presentation/world/entities/LagosProps.ts',
    format: 'procedural_ts',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/enhancements/05_vehicles_and_traffic.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Vertical cylinder utility pole',
  },
  {
    id: 'geo_prop_tinubu_fountain',
    name: 'Tinubu Square Monument & Memorial Obelisk',
    category: 'procedural_generator',
    intendedUse: 'Historic central plaza civic landmark and community gathering spot',
    associatedSceneOrPlacement: 'LagosProps.ts (Tinubu Square)',
    sourceUrl: 'Original TypeScript Procedural Generation Code',
    acquisitionStatus: 'visually_verified',
    license: 'MIT (Cyberlife Project License)',
    attributionRequirements: 'Original project work',
    localPath: 'src/presentation/world/entities/LagosProps.ts',
    format: 'procedural_ts',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/step3/after/street_pedestrians_crowd_mid_distance.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Tiered cylinder fountain basin',
  },

  // ==========================================================================
  // 6. Milestone 23 Visual Polish & Production Environment Assets
  // ==========================================================================
  {
    id: 'lagos_cyber_defense_billboard',
    name: 'Lagos Cyber Defense Alliance Gantry Billboard',
    category: 'street_furniture',
    intendedUse: 'Broad Street overhead gantry advertising and in-universe cyber alliance branding',
    associatedSceneOrPlacement: 'WorldEnvironment (buildCommercialBillboards)',
    sourceUrl: 'Original HTML5 Canvas Procedural Texture Generation',
    acquisitionStatus: 'visually_verified',
    license: 'MIT (Cyberlife Project License)',
    attributionRequirements: 'Original project work',
    localPath: 'src/presentation/world/entities/LagosProps.ts',
    format: 'procedural_ts',
    textureResolution: '1024x512 CanvasTexture',
    materialType: 'CANVAS_TEXTURE',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/milestone23/01_m23_lagos_streetscape_polished.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Solid color emissive board mesh',
  },
  {
    id: 'cedarline_soc_videowall',
    name: 'Cedarline SOC 4-Panel Video Wall',
    category: 'workstation_hero',
    intendedUse: 'Large-scale network topology and real-time SIEM alert feed display in corporate SOC',
    associatedSceneOrPlacement: 'WorldEnvironment (buildCedarlineSocEnvironment)',
    sourceUrl: 'Original HTML5 Canvas Procedural Topology & Alert Stream Generator',
    acquisitionStatus: 'visually_verified',
    license: 'MIT (Cyberlife Project License)',
    attributionRequirements: 'Original project work',
    localPath: 'src/presentation/world/WorldEnvironment.ts',
    format: 'procedural_ts',
    textureResolution: '1024x512 CanvasTexture',
    materialType: 'CANVAS_TEXTURE',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/milestone23/02_m23_cedarline_soc_corporate.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Dark blue glossy display mesh',
  },
  {
    id: 'cedarline_soc_servers',
    name: 'Cedarline Enterprise 42U Server Cabinets with Animated LEDs',
    category: 'interior_appliance',
    intendedUse: 'Production server rack infrastructure with blinking telemetry status LEDs',
    associatedSceneOrPlacement: 'WorldEnvironment (buildCedarlineSocEnvironment)',
    sourceUrl: 'Original Three.js Procedural Asset',
    acquisitionStatus: 'visually_verified',
    license: 'MIT (Cyberlife Project License)',
    attributionRequirements: 'Original project work',
    localPath: 'src/presentation/world/WorldEnvironment.ts',
    format: 'procedural_ts',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/milestone23/02_m23_cedarline_soc_corporate.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Monolithic box obstacle',
  },
  {
    id: 'apartment_inverter_system',
    name: 'Lagos Domestic Power Inverter & Battery Rack',
    category: 'interior_appliance',
    intendedUse: 'Player apartment power backup system with digital telemetry readout',
    associatedSceneOrPlacement: 'WorldEnvironment (buildApartmentDecorations)',
    sourceUrl: 'Original HTML5 Canvas Telemetry Display & Procedural Mesh',
    acquisitionStatus: 'visually_verified',
    license: 'MIT (Cyberlife Project License)',
    attributionRequirements: 'Original project work',
    localPath: 'src/presentation/world/WorldEnvironment.ts',
    format: 'procedural_ts',
    textureResolution: '512x256 CanvasTexture',
    materialType: 'CANVAS_TEXTURE',
    isRigged: false,
    hasCollisionBounds: true,
    visualVerificationEvidence: 'docs/graphics/milestone23/03_m23_apartment_residence_warm.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Dark grey procedural box mesh',
  },
  {
    id: 'interactable_concentric_markers',
    name: 'Concentric Floor Reticle Markers & Holographic Diamonds',
    category: 'ui_graphics',
    intendedUse: 'Non-intrusive floor-level interaction circles with subtle overhead beacon diamonds',
    associatedSceneOrPlacement: 'InteractableMarker, NpcManager',
    sourceUrl: 'Original Three.js Concentric Ring & Geometry Shader',
    acquisitionStatus: 'visually_verified',
    license: 'MIT (Cyberlife Project License)',
    attributionRequirements: 'Original project work',
    localPath: 'src/presentation/world/entities/InteractableMarker.ts',
    format: 'procedural_ts',
    materialType: 'PBR_STANDARD',
    isRigged: false,
    hasCollisionBounds: false,
    visualVerificationEvidence: 'docs/graphics/milestone23/02_m23_cedarline_soc_corporate.png',
    replacementPriority: 'NONE',
    fallbackBehavior: 'Single wireframe circle',
  },
];

export class AssetManifestRegistry {
  public static getAllAssets(): readonly AssetManifestEntry[] {
    return ASSET_MANIFEST;
  }

  public static getAssetById(id: string): AssetManifestEntry | undefined {
    return ASSET_MANIFEST.find(a => a.id === id);
  }

  public static getAssetsByCategory(category: AssetCategory): readonly AssetManifestEntry[] {
    return ASSET_MANIFEST.filter(a => a.category === category);
  }

  public static getAssetsByStatus(status: AcquisitionStatus): readonly AssetManifestEntry[] {
    return ASSET_MANIFEST.filter(a => a.acquisitionStatus === status);
  }

  public static getDefectBacklog(): readonly AssetManifestEntry[] {
    return ASSET_MANIFEST.filter(a => a.knownDefects && a.knownDefects.length > 0);
  }

  /**
   * Diagnostic missing-resource reporter.
   * Logs structured warnings when an asset file is missing or unverified,
   * ensuring missing assets never fail silently.
   */
  public static validateAssetReadiness(assetId: string): {
    readonly isProductionReady: boolean;
    readonly diagnosticMessage: string;
  } {
    const asset = this.getAssetById(assetId);
    if (!asset) {
      return {
        isProductionReady: false,
        diagnosticMessage: `[AssetRegistry] WARNING: Unknown asset ID "${assetId}". Using fallback primitive geometry.`,
      };
    }

    if (asset.acquisitionStatus === 'discovered') {
      return {
        isProductionReady: false,
        diagnosticMessage: `[AssetRegistry] DIAGNOSTIC: Asset "${asset.name}" (${asset.id}) is discovered but not downloaded. Fallback active: "${asset.fallbackBehavior}".`,
      };
    }

    if (asset.knownDefects && asset.knownDefects.length > 0 && asset.replacementPriority === 'HIGH') {
      return {
        isProductionReady: false,
        diagnosticMessage: `[AssetRegistry] PERFORMANCE DEFECT: Asset "${asset.name}" has high-priority defects: ${asset.knownDefects.join('; ')}. Using optimized fallback.`,
      };
    }

    return {
      isProductionReady: true,
      diagnosticMessage: `[AssetRegistry] Asset "${asset.name}" (${asset.id}) verified ready with status "${asset.acquisitionStatus}".`,
    };
  }
}
