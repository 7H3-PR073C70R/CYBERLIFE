export type CameraMode = 'FIRST_PERSON' | 'THIRD_PERSON';

export type PlayerCharacterGender = 'male' | 'female';

function getInitialPlayerCharacter(): PlayerCharacterGender {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const param = params.get('character') || params.get('gender');
    if (param === 'female' || param === 'male') {
      return param;
    }
  }
  return 'male';
}

export const PLAYER_CHARACTER: PlayerCharacterGender = getInitialPlayerCharacter();

export interface LocationDefinition {
  id: string;
  name: string;
  description: string;
  type: 'OUTDOOR' | 'INTERIOR';
  spawnPosition: [number, number, number];
  spawnYaw: number;
}

export interface InteractableDefinition {
  id: string;
  name: string;
  promptAction: string;
  description: string;
  position: [number, number, number];
  radius: number;
  targetLocationId?: string;
  returnLocationId?: string;
}

export const WORLD_CONFIG = {
  // Boundaries of the explorable Lagos Island district slice
  boundaries: {
    minX: -38,
    maxX: 38,
    minZ: -38,
    maxZ: 38,
  },

  // Player physical dimensions
  player: {
    radius: 0.45,
    height: 1.8,
    eyeHeight: 1.65,
    walkSpeed: 6.0, // units per second
    turnSpeed: 3.5, // radians per second
    mouseSensitivity: 0.0022,
  },

  // Camera parameters
  camera: {
    fov: 65,
    near: 0.1,
    far: 500,
    thirdPersonOffset: { x: 0, y: 2.2, z: 4.8 },
    thirdPersonLookOffset: { x: 0, y: 1.3, z: 0 },
    firstPersonOffset: { x: 0, y: 1.65, z: 0 },
    pitchLimitMin: -Math.PI / 2.3, // ~-78 deg
    pitchLimitMax: Math.PI / 2.3, // ~+78 deg
    // Dedicated Workstation Camera Transitions & Framing
    workstation: {
      sitDuration: 0.8, // s
      dollyDuration: 0.7, // s
      peekOutDuration: 0.6, // s
      standDuration: 0.7, // s
      reducedMotionDuration: 0.25, // s
      screenFov: 52, // deg (narrower for crisp, undistorted monitor framing)
      screenFillFraction: 0.85, // screen fills ~85% of viewport width
      overlayCrossfadeStart: 0.7, // start DOM opacity crossfade at 70% of dolly
      overlayCrossfadeDuration: 0.25, // s
    },
  },

  // Locations in M2.5 (Historic Lagos Island)
  locations: {
    neighborhood: {
      id: 'neighborhood',
      name: 'Lagos Island — Broad Street & Marina',
      description:
        'The historic commercial heart of Lagos Island, featuring Broad Street, Tinubu Square, Balogun Market, and the Marina waterfront.',
      type: 'OUTDOOR',
      spawnPosition: [0, 0, 10], // Broad Street pedestrian area near Marina
      spawnYaw: 0, // facing north towards Tinubu Square
    } as LocationDefinition,

    cedarlineInterior: {
      id: 'cedarline_interior',
      name: 'Cedarline Services — Marina Tower Lobby',
      description:
        'The secure ground-floor entrance and reception of Cedarline Services HQ on Marina Road.',
      type: 'INTERIOR',
      spawnPosition: [0, 0, 1.5],
      spawnYaw: 0,
    } as LocationDefinition,

    apartmentInterior: {
      id: 'apartment_interior',
      name: 'Player Apartment — Broad Street 14',
      description:
        'Your private apartment, modest desk, and independent security research setup overlooking Broad Street.',
      type: 'INTERIOR',
      spawnPosition: [0, 0, 1.5],
      spawnYaw: 0,
    } as LocationDefinition,

    ekoBankInterior: {
      id: 'eko_bank_interior',
      name: 'Eko Merchant Bank — Executive Loft',
      description:
        'High-ceiling executive banking loft with private vaults and interbank settlement terminals.',
      type: 'INTERIOR',
      spawnPosition: [0, 0, 1.5],
      spawnYaw: 0,
    } as LocationDefinition,

    krestInterior: {
      id: 'krest_interior',
      name: 'Krest Independent Risk — Cyber War Room',
      description:
        'Confidential corporate intelligence and forensic investigation war room.',
      type: 'INTERIOR',
      spawnPosition: [0, 0, 1.5],
      spawnYaw: 0,
    } as LocationDefinition,

    inquirerInterior: {
      id: 'inquirer_interior',
      name: 'The Lagos Inquirer — Investigative Newsroom',
      description:
        'Busy investigative press room with editorial desks and public records microfiche.',
      type: 'INTERIOR',
      spawnPosition: [0, 0, 1.5],
      spawnYaw: 0,
    } as LocationDefinition,
  },
} as const;
