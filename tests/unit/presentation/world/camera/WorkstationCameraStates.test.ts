import { describe, it, expect, vi } from 'vitest';
import * as THREE from 'three';
import {
  WorkstationCameraStateMachine,
  easeInOutCubic,
} from '@/presentation/world/camera/WorkstationCameraStates';
import { DEFAULT_WORKSTATION_ANCHORS } from '@/presentation/world/WorkstationAnchors';

describe('WorkstationCameraStates', () => {
  describe('easeInOutCubic Easing Function', () => {
    it('returns exact boundary values at t=0, t=0.5, and t=1', () => {
      expect(easeInOutCubic(0)).toBe(0);
      expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
      expect(easeInOutCubic(1)).toBe(1);
    });

    it('clamps inputs below 0 and above 1', () => {
      expect(easeInOutCubic(-0.5)).toBe(0);
      expect(easeInOutCubic(1.5)).toBe(1);
    });

    it('is strictly monotonic and smooth (C1 continuous)', () => {
      let previous = -1;
      for (let t = 0; t <= 1; t += 0.05) {
        const value = easeInOutCubic(t);
        expect(value).toBeGreaterThanOrEqual(previous);
        previous = value;
      }
    });

    it('exhibits symmetric ease-in and ease-out acceleration', () => {
      const easeInPart = easeInOutCubic(0.2);
      const easeOutPart = 1 - easeInOutCubic(0.8);
      expect(easeInPart).toBeCloseTo(easeOutPart, 5);
    });
  });

  describe('WorkstationCameraStateMachine State Transitions', () => {
    it('initializes in WALKING state with zero overlay opacity', () => {
      const sm = new WorkstationCameraStateMachine();
      expect(sm.getState()).toBe('WALKING');
      expect(sm.isWorkstationActive()).toBe(false);
      expect(sm.isMovementBlocked()).toBe(false);
      expect(sm.isTransitioning()).toBe(false);
      expect(sm.getOverlayOpacity()).toBe(0);
    });

    it('enters workstation and sequences from SITTING_DOWN to SCREEN_FULLSCREEN', () => {
      const events = {
        onSitStart: vi.fn(),
        onDollyStart: vi.fn(),
        onFullscreenEnter: vi.fn(),
        onStateChange: vi.fn(),
      };
      const sm = new WorkstationCameraStateMachine(
        { sitDuration: 0.8, dollyDuration: 0.7 },
        events
      );

      const walkingPos = new THREE.Vector3(0, 1.7, 0);
      const walkingLook = new THREE.Vector3(0, 1.7, -3);

      sm.enterWorkstation('THIRD_PERSON', walkingPos, walkingLook);

      expect(sm.getState()).toBe('SITTING_DOWN');
      expect(sm.isWorkstationActive()).toBe(true);
      expect(sm.isMovementBlocked()).toBe(true);
      expect(sm.isTransitioning()).toBe(true);
      expect(events.onSitStart).toHaveBeenCalledTimes(1);

      // Advance through sitDuration (0.8s) in steps
      sm.update(0.4);
      expect(sm.getState()).toBe('SITTING_DOWN');
      expect(sm.getCurrentPosition().x).toBeGreaterThan(0);

      sm.update(0.4); // Total 0.8s
      // Completing SITTING_DOWN sequences into DOLLY_TO_SCREEN
      expect(sm.getState()).toBe('DOLLY_TO_SCREEN');
      expect(events.onDollyStart).toHaveBeenCalledTimes(1);

      // During early dolly, overlayOpacity is 0
      sm.update(0.2); // 0.2 / 0.7 = 28%
      expect(sm.getOverlayOpacity()).toBe(0);

      // At 75% of dolly, crossfade begins
      sm.update(0.35); // total 0.55 / 0.7 = 78%
      expect(sm.getOverlayOpacity()).toBeGreaterThan(0);
      expect(sm.getOverlayOpacity()).toBeLessThan(1);

      // Completing dolly enters SCREEN_FULLSCREEN
      sm.update(0.2); // total > 0.7s
      expect(sm.getState()).toBe('SCREEN_FULLSCREEN');
      expect(sm.getOverlayOpacity()).toBe(1.0);
      expect(sm.isTransitioning()).toBe(false);
      expect(events.onFullscreenEnter).toHaveBeenCalledTimes(1);
    });

    it('supports direct entry into SCREEN_FULLSCREEN', () => {
      const sm = new WorkstationCameraStateMachine();
      sm.enterWorkstationDirectly('THIRD_PERSON');

      expect(sm.getState()).toBe('SCREEN_FULLSCREEN');
      expect(sm.isWorkstationActive()).toBe(true);
      expect(sm.getOverlayOpacity()).toBe(1.0);
      expect(sm.getCurrentPosition().x).toBeCloseTo(
        DEFAULT_WORKSTATION_ANCHORS.CAMERA_SCREEN.position.x
      );
    });

    it('handles peekOut and togglePeek between full-screen and seated third-person', () => {
      const events = {
        onPeekOut: vi.fn(),
        onDollyStart: vi.fn(),
      };
      const sm = new WorkstationCameraStateMachine(
        { peekOutDuration: 0.6, dollyDuration: 0.7 },
        events
      );
      sm.enterWorkstationDirectly('THIRD_PERSON');

      // Peek out to third person
      sm.peekOut();
      expect(sm.getState()).toBe('PEEK_OUT');
      expect(events.onPeekOut).toHaveBeenCalledTimes(1);

      sm.update(0.6); // Complete peek out
      expect(sm.getState()).toBe('SEATED_THIRD_PERSON');
      expect(sm.getOverlayOpacity()).toBe(0.0);
      expect(sm.isWorkstationActive()).toBe(true); // Session remains alive!

      // Toggle back to screen
      sm.togglePeek();
      expect(sm.getState()).toBe('DOLLY_TO_SCREEN');
      expect(events.onDollyStart).toHaveBeenCalledTimes(1);

      sm.update(0.7);
      expect(sm.getState()).toBe('SCREEN_FULLSCREEN');
    });

    it('handles standUp (Esc) safely from any workstation state', () => {
      const sm = new WorkstationCameraStateMachine({ standDuration: 0.7 });
      sm.enterWorkstationDirectly('THIRD_PERSON');

      const walkingPos = new THREE.Vector3(0, 1.7, 0);
      const walkingLook = new THREE.Vector3(0, 1.7, -3);

      sm.standUp(walkingPos, walkingLook);
      expect(sm.getState()).toBe('STANDING_UP');
      expect(sm.isWorkstationActive()).toBe(false); // Session has ended
      expect(sm.isTransitioning()).toBe(true);

      sm.update(0.7);
      expect(sm.getState()).toBe('WALKING');
      expect(sm.isWorkstationActive()).toBe(false);
      expect(sm.isMovementBlocked()).toBe(false);
      expect(sm.getCurrentPosition().y).toBeCloseTo(walkingPos.y);
    });

    it('ignores invalid transitions safely', () => {
      const sm = new WorkstationCameraStateMachine();
      expect(sm.getState()).toBe('WALKING');

      // Cannot peekOut when walking
      sm.peekOut();
      expect(sm.getState()).toBe('WALKING');

      // Cannot dollyToScreen when walking
      sm.dollyToScreen();
      expect(sm.getState()).toBe('WALKING');

      // Calling standUp when already walking does nothing
      sm.standUp(new THREE.Vector3(), new THREE.Vector3());
      expect(sm.getState()).toBe('WALKING');
    });

    it('produces frame-rate independent elapsed timing at 30 fps vs 144 fps', () => {
      const sitDuration = 0.8;

      // Run simulation at 30 fps (dt ≈ 0.0333s)
      const sm30 = new WorkstationCameraStateMachine({ sitDuration });
      sm30.enterWorkstation('THIRD_PERSON', new THREE.Vector3(), new THREE.Vector3());
      const dt30 = 1 / 30;
      let steps30 = 0;
      while (sm30.getState() === 'SITTING_DOWN') {
        sm30.update(dt30);
        steps30++;
      }

      // Run simulation at 144 fps (dt ≈ 0.00694s)
      const sm144 = new WorkstationCameraStateMachine({ sitDuration });
      sm144.enterWorkstation('THIRD_PERSON', new THREE.Vector3(), new THREE.Vector3());
      const dt144 = 1 / 144;
      let steps144 = 0;
      while (sm144.getState() === 'SITTING_DOWN') {
        sm144.update(dt144);
        steps144++;
      }

      const totalTime30 = steps30 * dt30;
      const totalTime144 = steps144 * dt144;

      // Both must complete right at sitDuration (within one frame step)
      expect(totalTime30).toBeCloseTo(sitDuration, 1);
      expect(totalTime144).toBeCloseTo(sitDuration, 1);
      expect(steps144).toBeGreaterThan(steps30 * 4); // ~116 steps vs ~24 steps
    });

    it('honors reduceMotion setting (shortens durations and preserves base FOV)', () => {
      const sm = new WorkstationCameraStateMachine({
        reduceMotion: true,
        reducedMotionDuration: 0.25,
        baseFov: 65,
        screenFov: 52,
      });

      sm.enterWorkstation(
        'THIRD_PERSON',
        new THREE.Vector3(0, 1.7, 0),
        new THREE.Vector3(0, 1.7, -3)
      );
      expect(sm.getState()).toBe('SITTING_DOWN');

      // Takes only 0.25s to complete sit down
      sm.update(0.26);
      expect(sm.getState()).toBe('DOLLY_TO_SCREEN');

      // FOV remains at baseFov (65) with no distortion
      sm.update(0.26);
      expect(sm.getState()).toBe('SCREEN_FULLSCREEN');
      expect(sm.getCurrentFov()).toBe(65);
    });

    it('honors skipSitAfterFirst setting', () => {
      const sm = new WorkstationCameraStateMachine({
        skipSitAfterFirst: true,
        sitDuration: 0.8,
        dollyDuration: 0.7,
      });

      // First time: plays full sit down
      sm.enterWorkstation('THIRD_PERSON', new THREE.Vector3(), new THREE.Vector3());
      expect(sm.getState()).toBe('SITTING_DOWN');
      sm.update(0.8);
      expect(sm.getState()).toBe('DOLLY_TO_SCREEN');
      sm.update(0.7);
      expect(sm.getState()).toBe('SCREEN_FULLSCREEN');

      // Stand up
      sm.standUp(new THREE.Vector3(), new THREE.Vector3());
      sm.update(0.7);
      expect(sm.getState()).toBe('WALKING');

      // Second time: skips SITTING_DOWN and starts immediately in DOLLY_TO_SCREEN
      sm.enterWorkstation('THIRD_PERSON', new THREE.Vector3(), new THREE.Vector3());
      expect(sm.getState()).toBe('DOLLY_TO_SCREEN');
    });
  });
});
