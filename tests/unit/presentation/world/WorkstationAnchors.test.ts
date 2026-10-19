import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  DEFAULT_WORKSTATION_ANCHORS,
  deriveCameraScreen,
  loadWorkstationAnchorsFromObject,
  ScreenQuad,
} from '@/presentation/world/WorkstationAnchors';

describe('WorkstationAnchors', () => {
  describe('Default Anchors & Baseline Coordinates', () => {
    it('provides valid SEAT_ANCHOR with forward facing yaw', () => {
      const seat = DEFAULT_WORKSTATION_ANCHORS.SEAT_ANCHOR;
      expect(seat.position.x).toBeCloseTo(0.0, 2);
      expect(seat.position.z).toBeCloseTo(-2.85, 2);
      expect(seat.facingYaw).toBe(0.0);
    });

    it('matches required third-person and first-person seated baseline positions', () => {
      const tp = DEFAULT_WORKSTATION_ANCHORS.CAMERA_SEATED_TP;
      expect(tp.position.x).toBeCloseTo(0.48, 2);
      expect(tp.position.y).toBeCloseTo(1.34, 2);
      expect(tp.position.z).toBeCloseTo(-2.05, 2);
      expect(tp.lookTarget.x).toBeCloseTo(-0.02, 2);
      expect(tp.lookTarget.y).toBeCloseTo(0.94, 2);
      expect(tp.lookTarget.z).toBeCloseTo(-3.32, 2);

      const fp = DEFAULT_WORKSTATION_ANCHORS.CAMERA_SEATED_FP;
      expect(fp.position.x).toBeCloseTo(0.0, 2);
      expect(fp.position.y).toBeCloseTo(1.16, 2);
      expect(fp.position.z).toBeCloseTo(-2.82, 2);
      expect(fp.lookTarget.x).toBeCloseTo(0.0, 2);
      expect(fp.lookTarget.y).toBeCloseTo(0.92, 2);
      expect(fp.lookTarget.z).toBeCloseTo(-3.32, 2);
    });

    it('has properly oriented SCREEN_QUAD with normalized normal vector', () => {
      const quad = DEFAULT_WORKSTATION_ANCHORS.SCREEN_QUAD;
      expect(quad.width).toBeGreaterThan(0.2);
      expect(quad.height).toBeGreaterThan(0.1);
      expect(quad.normal.length()).toBeCloseTo(1, 4);
    });
  });

  describe('deriveCameraScreen', () => {
    it('calculates camera position in front of screen quad along normal vector', () => {
      const quad: ScreenQuad = {
        center: new THREE.Vector3(0, 1.0, -3.0),
        normal: new THREE.Vector3(0, 0.3, 0.954).normalize(),
        width: 0.32,
        height: 0.2,
      };

      const framing = deriveCameraScreen(quad, 52, 0.85);

      // Look target must equal quad center
      expect(framing.lookTarget.x).toBeCloseTo(quad.center.x, 3);
      expect(framing.lookTarget.y).toBeCloseTo(quad.center.y, 3);
      expect(framing.lookTarget.z).toBeCloseTo(quad.center.z, 3);

      // Distance from camera to look target must match derived optimal viewing distance
      const dist = framing.position.distanceTo(framing.lookTarget);
      expect(dist).toBeGreaterThan(0.15);
      expect(dist).toBeLessThan(0.6);

      // Vector from target to camera must be parallel to quad normal
      const camDir = new THREE.Vector3().subVectors(framing.position, framing.lookTarget).normalize();
      expect(camDir.dot(quad.normal)).toBeCloseTo(1.0, 3);
    });
  });

  describe('loadWorkstationAnchorsFromObject', () => {
    it('returns default anchors when given an empty 3D hierarchy', () => {
      const root = new THREE.Group();
      const anchors = loadWorkstationAnchorsFromObject(root);

      expect(anchors.CAMERA_SEATED_TP.position.x).toBeCloseTo(
        DEFAULT_WORKSTATION_ANCHORS.CAMERA_SEATED_TP.position.x
      );
      expect(anchors.SEAT_ANCHOR.position.y).toBeCloseTo(
        DEFAULT_WORKSTATION_ANCHORS.SEAT_ANCHOR.position.y
      );
    });

    it('extracts overrides when custom empty objects with anchor names exist', () => {
      const root = new THREE.Group();

      const customSeat = new THREE.Object3D();
      customSeat.name = 'SEAT_ANCHOR';
      customSeat.position.set(1.5, 0.45, -4.0);
      root.add(customSeat);

      const customScreen = new THREE.Object3D();
      customScreen.name = 'SCREEN_QUAD';
      customScreen.position.set(1.5, 0.98, -4.5);
      root.add(customScreen);

      const customKb = new THREE.Object3D();
      customKb.name = 'KEYBOARD_ANCHOR';
      customKb.position.set(1.5, 0.76, -4.3);
      root.add(customKb);

      const customMouse = new THREE.Object3D();
      customMouse.name = 'MOUSE_ANCHOR';
      customMouse.position.set(1.75, 0.76, -4.3);
      root.add(customMouse);

      const anchors = loadWorkstationAnchorsFromObject(root);

      expect(anchors.SEAT_ANCHOR.position.x).toBeCloseTo(1.5);
      expect(anchors.SEAT_ANCHOR.position.z).toBeCloseTo(-4.0);
      expect(anchors.SCREEN_QUAD.center.x).toBeCloseTo(1.5);
      expect(anchors.KEYBOARD_ANCHOR.position.x).toBeCloseTo(1.5);
      expect(anchors.MOUSE_ANCHOR.position.x).toBeCloseTo(1.75);

      // CAMERA_SCREEN is derived automatically from the new SCREEN_QUAD
      expect(anchors.CAMERA_SCREEN.lookTarget.x).toBeCloseTo(1.5);
    });
  });
});
