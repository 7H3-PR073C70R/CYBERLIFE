import * as THREE from 'three';
import { WORLD_CONFIG } from './worldConfig';

export interface SeatAnchor {
  position: THREE.Vector3;
  facingYaw: number;
}

export interface ScreenQuad {
  center: THREE.Vector3;
  normal: THREE.Vector3;
  width: number;
  height: number;
}

export interface PointAnchor {
  position: THREE.Vector3;
}

export interface CameraFraming {
  position: THREE.Vector3;
  lookTarget: THREE.Vector3;
  fov?: number;
}

export interface WorkstationAnchorSet {
  SEAT_ANCHOR: SeatAnchor;
  SCREEN_QUAD: ScreenQuad;
  KEYBOARD_ANCHOR: PointAnchor;
  MOUSE_ANCHOR: PointAnchor;
  CAMERA_SEATED_TP: CameraFraming;
  CAMERA_SEATED_FP: CameraFraming;
  CAMERA_SCREEN: CameraFraming;
}

/**
 * Derives the optimal camera position and look target in front of a ScreenQuad
 * such that the screen fills a chosen fraction of the viewport width.
 */
export function deriveCameraScreen(
  quad: ScreenQuad,
  fovDeg: number = WORLD_CONFIG.camera.workstation.screenFov,
  fillFraction: number = WORLD_CONFIG.camera.workstation.screenFillFraction,
  aspect = 16 / 10
): CameraFraming {
  const alphaRad = (fovDeg * Math.PI) / 180;
  // Horizontal FOV: 2 * atan(aspect * tan(alpha / 2))
  // Visible width = 2 * d * aspect * tan(alpha / 2)
  // quad.width = fillFraction * visible width
  const denom = 2 * fillFraction * aspect * Math.tan(alphaRad / 2);
  const distance = denom > 0 ? quad.width / denom : 0.25;

  const normalNorm = quad.normal.clone().normalize();
  const position = quad.center.clone().add(normalNorm.multiplyScalar(distance));
  const lookTarget = quad.center.clone();

  return {
    position,
    lookTarget,
    fov: fovDeg,
  };
}

// ---------------------------------------------------------------------------
// Verified Baseline Anchors (Matching physical placeholder workstation geometry)
// Laptop at (0, 0.7425, -3.32), Lid tilted back at -1.25 rad
// ---------------------------------------------------------------------------

const DEFAULT_SEAT: SeatAnchor = {
  position: new THREE.Vector3(0.0, 0.0, -2.85),
  facingYaw: 0.0, // facing north (-Z)
};

const DEFAULT_SCREEN_QUAD: ScreenQuad = {
  center: new THREE.Vector3(0.0, 0.7945, -3.5511),
  normal: new THREE.Vector3(0.0, 0.9492, 0.3146).normalize(),
  width: 0.32,
  height: 0.2,
};

const DEFAULT_KEYBOARD: PointAnchor = {
  position: new THREE.Vector3(0.0, 0.755, -3.355),
};

const DEFAULT_MOUSE: PointAnchor = {
  position: new THREE.Vector3(0.28, 0.755, -3.32),
};

const DEFAULT_CAM_SEATED_TP: CameraFraming = {
  position: new THREE.Vector3(0.48, 1.34, -2.05),
  lookTarget: new THREE.Vector3(-0.02, 0.94, -3.32),
  fov: WORLD_CONFIG.camera.fov,
};

const DEFAULT_CAM_SEATED_FP: CameraFraming = {
  position: new THREE.Vector3(0.0, 1.16, -2.82),
  lookTarget: new THREE.Vector3(0.0, 0.92, -3.32),
  fov: WORLD_CONFIG.camera.fov,
};

export const DEFAULT_WORKSTATION_ANCHORS: WorkstationAnchorSet = {
  SEAT_ANCHOR: DEFAULT_SEAT,
  SCREEN_QUAD: DEFAULT_SCREEN_QUAD,
  KEYBOARD_ANCHOR: DEFAULT_KEYBOARD,
  MOUSE_ANCHOR: DEFAULT_MOUSE,
  CAMERA_SEATED_TP: DEFAULT_CAM_SEATED_TP,
  CAMERA_SEATED_FP: DEFAULT_CAM_SEATED_FP,
  CAMERA_SCREEN: deriveCameraScreen(DEFAULT_SCREEN_QUAD),
};

// Export individual default anchors for direct access
export const SEAT_ANCHOR = DEFAULT_WORKSTATION_ANCHORS.SEAT_ANCHOR;
export const SCREEN_QUAD = DEFAULT_WORKSTATION_ANCHORS.SCREEN_QUAD;
export const KEYBOARD_ANCHOR = DEFAULT_WORKSTATION_ANCHORS.KEYBOARD_ANCHOR;
export const MOUSE_ANCHOR = DEFAULT_WORKSTATION_ANCHORS.MOUSE_ANCHOR;
export const CAMERA_SEATED_TP = DEFAULT_WORKSTATION_ANCHORS.CAMERA_SEATED_TP;
export const CAMERA_SEATED_FP = DEFAULT_WORKSTATION_ANCHORS.CAMERA_SEATED_FP;
export const CAMERA_SCREEN = DEFAULT_WORKSTATION_ANCHORS.CAMERA_SCREEN;

/**
 * Inspects a loaded 3D hierarchy (e.g. from an imported GLB) and extracts
 * anchor empties/nodes named SEAT_ANCHOR, SCREEN_QUAD, KEYBOARD_ANCHOR, MOUSE_ANCHOR.
 * Falls back to default values for any missing anchors.
 */
export function loadWorkstationAnchorsFromObject(
  root: THREE.Object3D,
  fallback: WorkstationAnchorSet = DEFAULT_WORKSTATION_ANCHORS
): WorkstationAnchorSet {
  const result: WorkstationAnchorSet = {
    SEAT_ANCHOR: {
      position: fallback.SEAT_ANCHOR.position.clone(),
      facingYaw: fallback.SEAT_ANCHOR.facingYaw,
    },
    SCREEN_QUAD: {
      center: fallback.SCREEN_QUAD.center.clone(),
      normal: fallback.SCREEN_QUAD.normal.clone(),
      width: fallback.SCREEN_QUAD.width,
      height: fallback.SCREEN_QUAD.height,
    },
    KEYBOARD_ANCHOR: {
      position: fallback.KEYBOARD_ANCHOR.position.clone(),
    },
    MOUSE_ANCHOR: {
      position: fallback.MOUSE_ANCHOR.position.clone(),
    },
    CAMERA_SEATED_TP: {
      position: fallback.CAMERA_SEATED_TP.position.clone(),
      lookTarget: fallback.CAMERA_SEATED_TP.lookTarget.clone(),
      fov: fallback.CAMERA_SEATED_TP.fov,
    },
    CAMERA_SEATED_FP: {
      position: fallback.CAMERA_SEATED_FP.position.clone(),
      lookTarget: fallback.CAMERA_SEATED_FP.lookTarget.clone(),
      fov: fallback.CAMERA_SEATED_FP.fov,
    },
    CAMERA_SCREEN: {
      position: fallback.CAMERA_SCREEN.position.clone(),
      lookTarget: fallback.CAMERA_SCREEN.lookTarget.clone(),
      fov: fallback.CAMERA_SCREEN.fov,
    },
  };

  root.traverse(child => {
    if (child.name === 'SEAT_ANCHOR') {
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      const worldQuat = new THREE.Quaternion();
      child.getWorldQuaternion(worldQuat);
      const euler = new THREE.Euler().setFromQuaternion(worldQuat, 'YXZ');
      result.SEAT_ANCHOR = { position: worldPos, facingYaw: euler.y };
    } else if (child.name === 'SCREEN_QUAD') {
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      const worldDir = new THREE.Vector3(0, 0, 1);
      child.getWorldDirection(worldDir);

      let width = fallback.SCREEN_QUAD.width;
      let height = fallback.SCREEN_QUAD.height;
      if (typeof child.userData?.width === 'number') width = child.userData.width;
      if (typeof child.userData?.height === 'number') height = child.userData.height;

      result.SCREEN_QUAD = {
        center: worldPos,
        normal: worldDir.normalize(),
        width,
        height,
      };
      result.CAMERA_SCREEN = deriveCameraScreen(result.SCREEN_QUAD);
    } else if (child.name === 'KEYBOARD_ANCHOR') {
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      result.KEYBOARD_ANCHOR = { position: worldPos };
    } else if (child.name === 'MOUSE_ANCHOR') {
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      result.MOUSE_ANCHOR = { position: worldPos };
    } else if (child.name === 'CAMERA_SEATED_TP') {
      const worldPos = new THREE.Vector3();
      child.getWorldPosition(worldPos);
      result.CAMERA_SEATED_TP.position = worldPos;
    }
  });

  return result;
}
