export type CameraMode = 'FIRST_PERSON' | 'THIRD_PERSON';

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
  // Boundaries of the outdoor neighborhood block
  boundaries: {
    minX: -28,
    maxX: 28,
    minZ: -28,
    maxZ: 28,
  },

  // Player physical dimensions
  player: {
    radius: 0.45,
    height: 1.8,
    eyeHeight: 1.65,
    walkSpeed: 6.0, // units per second
    turnSpeed: 3.5, // radians per second (keyboard turn if applicable)
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
  },

  // Locations in M2
  locations: {
    neighborhood: {
      id: 'neighborhood',
      name: 'Downtown Urban Block',
      description: 'The fictional city street outside your apartment and local tech offices.',
      type: 'OUTDOOR',
      spawnPosition: [0, 0, 14],
      spawnYaw: 0, // facing north
    } as LocationDefinition,

    cedarlineInterior: {
      id: 'cedarline_interior',
      name: 'Cedarline Services — Lobby & Staging',
      description: 'The secure ground-floor entrance and reception of Cedarline Services.',
      type: 'INTERIOR',
      spawnPosition: [0, 0, 1.5],
      spawnYaw: 0,
    } as LocationDefinition,

    apartmentInterior: {
      id: 'apartment_interior',
      name: 'Player Apartment — Room 3B',
      description: 'Your private apartment, modest desk, and independent security research setup.',
      type: 'INTERIOR',
      spawnPosition: [0, 0, 1.5],
      spawnYaw: 0,
    } as LocationDefinition,
  },
} as const;
