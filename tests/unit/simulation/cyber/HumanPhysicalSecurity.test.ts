import { describe, it, expect } from 'vitest';
import { HumanPhysicalEngine } from '@/simulation/cyber/humanPhysical/HumanPhysicalEngine';
import {
  MARINA_TOWER_FACILITY,
  AIRGAPPED_LAB_FACILITY,
  PHYSICAL_BADGES,
  FICTIONAL_REMOVABLE_DEVICES,
  PRETEXT_PERSONAS,
  AUTHORIZED_ROE_CEDARLINE,
} from '@/simulation/cyber/humanPhysical/fixtures';
import {
  HumanTrustMetrics,
  TrustEvaluationContext,
  VerificationChallenge,
} from '@/simulation/cyber/humanPhysical/types';

describe('Human & Physical Security Simulation Engine', () => {
  describe('Trust, Credibility, Authority & Suspicion Dynamics', () => {
    const baselineMetrics: HumanTrustMetrics = {
      trust: 10,
      credibility: 40,
      authority: 20,
      suspicion: 10,
    };

    it('grants COMPLIANT reaction when valid badge, signed RoE, and low suspicion are present', () => {
      const context: TrustEvaluationContext = {
        currentMetrics: { ...baselineMetrics, credibility: 60, authority: 40 },
        requesterRole: 'Senior Security Analyst',
        hasValidBadge: true,
        hasSignedRoE: true,
        locationSecurityTier: 2,
        isOffHours: false,
        requestSensitivity: 'LOW',
      };

      const result = HumanPhysicalEngine.evaluateTrustReaction(context);
      expect(result.reaction).toBe('COMPLIANT');
      expect(result.netScore).toBeGreaterThanOrEqual(50);
      expect(result.updatedMetrics.suspicion).toBeLessThanOrEqual(10);
    });

    it('returns SKEPTICAL when request sensitivity is HIGH without strong authority', () => {
      const context: TrustEvaluationContext = {
        currentMetrics: baselineMetrics,
        requesterRole: 'Junior Contractor',
        hasValidBadge: true,
        hasSignedRoE: false,
        locationSecurityTier: 3,
        isOffHours: false,
        requestSensitivity: 'HIGH',
      };

      const result = HumanPhysicalEngine.evaluateTrustReaction(context);
      expect(['SKEPTICAL', 'RESISTANT']).toContain(result.reaction);
      expect(result.netScore).toBeLessThan(20);
    });

    it('triggers HOSTILE reaction and escalates when suspicion threshold exceeds 75', () => {
      const context: TrustEvaluationContext = {
        currentMetrics: { ...baselineMetrics, suspicion: 85 },
        requesterRole: 'Unidentified Visitor',
        hasValidBadge: false,
        hasSignedRoE: false,
        locationSecurityTier: 4,
        isOffHours: true,
        requestSensitivity: 'CRITICAL',
      };

      const result = HumanPhysicalEngine.evaluateTrustReaction(context);
      expect(result.reaction).toBe('HOSTILE');
      expect(result.rationale).toContain('High suspicion');
    });

    it('bounds updated metrics within valid numerical ranges (-100..100 for trust, 0..100 for others)', () => {
      const context: TrustEvaluationContext = {
        currentMetrics: { trust: -95, credibility: 10, authority: 5, suspicion: 95 },
        requesterRole: 'Suspicious Individual',
        hasValidBadge: false,
        hasSignedRoE: false,
        locationSecurityTier: 4,
        isOffHours: true,
        requestSensitivity: 'CRITICAL',
      };

      const result = HumanPhysicalEngine.evaluateTrustReaction(context);
      expect(result.updatedMetrics.trust).toBeGreaterThanOrEqual(-100);
      expect(result.updatedMetrics.trust).toBeLessThanOrEqual(100);
      expect(result.updatedMetrics.suspicion).toBeLessThanOrEqual(100);
    });
  });

  describe('Physical Badge Validation & Facility Access Control', () => {
    const serverRoom = MARINA_TOWER_FACILITY.rooms.find(r => r.id === 'room-floor5-server')!;
    const financeSuite = MARINA_TOWER_FACILITY.rooms.find(r => r.id === 'room-floor3-finance')!;

    it('grants access to Server Room 2B for SECURE_VAULT clearance holders during normal hours', () => {
      const aminaBadge = PHYSICAL_BADGES.find(b => b.badgeId === 'badge-amina-01')!;
      const log = HumanPhysicalEngine.verifyPhysicalBadge(aminaBadge, serverRoom, 11, false);

      expect(log.accessGranted).toBe(true);
      expect(log.denialReason).toBeUndefined();
      expect(log.tailgatingAlert).toBe(false);
    });

    it('denies access to Server Room 2B for Junior Sysadmin due to INSUFFICIENT_CLEARANCE', () => {
      const marcusBadge = PHYSICAL_BADGES.find(b => b.badgeId === 'badge-marcus-02')!;
      const log = HumanPhysicalEngine.verifyPhysicalBadge(marcusBadge, serverRoom, 11, false);

      expect(log.accessGranted).toBe(false);
      expect(log.denialReason).toBe('INSUFFICIENT_CLEARANCE');
    });

    it('denies access to tampered or revoked badges immediately', () => {
      const forgedBadge = PHYSICAL_BADGES.find(b => b.badgeId === 'badge-forged-audit')!;
      const log = HumanPhysicalEngine.verifyPhysicalBadge(forgedBadge, financeSuite, 11, false);

      expect(log.accessGranted).toBe(false);
      expect(log.denialReason).toBe('REVOKED');
    });

    it('flags tailgating incidents when door held open sensor exceeds standard duration', () => {
      const aminaBadge = PHYSICAL_BADGES.find(b => b.badgeId === 'badge-amina-01')!;
      const log = HumanPhysicalEngine.verifyPhysicalBadge(aminaBadge, serverRoom, 14, true);

      expect(log.accessGranted).toBe(true);
      expect(log.tailgatingAlert).toBe(true);
      expect(log.doorHeldOpenSeconds).toBe(30);
    });
  });

  describe('Removable Media Simulation & Sandboxed Endpoints', () => {
    const droppedUsb = FICTIONAL_REMOVABLE_DEVICES.find(d => d.deviceId === 'usb-parking-drop-01')!;

    it('generates synthetic endpoint telemetry on connection without real host commands', () => {
      const event = HumanPhysicalEngine.mountRemovableDevice(
        droppedUsb,
        'ws-fin-04',
        'WS-FIN-04.cedarline.corp.local',
        'biodun.ade',
        false
      );

      expect(event.action).toBe('DEVICE_CONNECTED');
      expect(event.deviceSerial).toBe(droppedUsb.serialNumber);
      expect(event.mountPoint).toBe('D:\\');
      expect(event.processGenerated).toBeDefined();
      expect(['rundll32.exe', 'cscript.exe']).toContain(event.processGenerated?.processName);
      expect(event.networkActivityDetected).toBeDefined();
      expect(event.networkActivityDetected?.destIp).toBe('10.0.4.1');
    });

    it('suppresses simulated network egress when mounted inside isolated air-gapped lab', () => {
      expect(AIRGAPPED_LAB_FACILITY.rooms[0]?.requiredClearance).toBe('AIRGAPPED_LAB');

      const event = HumanPhysicalEngine.mountRemovableDevice(
        droppedUsb,
        'ws-isolated-forensic-01',
        'AIRGAP-WS01.local',
        'analyst.player',
        true // isAirGapped
      );

      expect(event.action).toBe('DEVICE_CONNECTED');
      expect(event.processGenerated).toBeDefined();
      expect(event.networkActivityDetected).toBeUndefined(); // Zero network traffic in air-gap!
    });
  });

  describe('Pretexting Challenges & Identity Verification', () => {
    const persona = PRETEXT_PERSONAS.find(p => p.personaId === 'pretext-telecom-tech')!;
    const challenge: VerificationChallenge = {
      challengeType: 'EMPLOYEE_ID',
      promptText: 'Please state your Eko Telecom contract work order authorization number.',
      validResponse: 'WO-8819',
      isPassed: false,
    };
    const currentTrust: HumanTrustMetrics = {
      trust: 0,
      credibility: 25,
      authority: 30,
      suspicion: 20,
    };

    it('successfully validates identity when correct response is provided', () => {
      const result = HumanPhysicalEngine.evaluatePretextAttempt(
        persona,
        challenge,
        'WO-8819',
        currentTrust,
        AUTHORIZED_ROE_CEDARLINE
      );

      expect(result.verificationPassed).toBe(true);
      expect(result.targetReaction).toBe('COMPLIANT');
      expect(result.trustMetricsAfter.trust).toBe(20);
      expect(result.trustMetricsAfter.suspicion).toBe(5);
    });

    it('rejects identity and raises suspicion when provided answer is invalid', () => {
      const result = HumanPhysicalEngine.evaluatePretextAttempt(
        persona,
        challenge,
        'INVALID-999',
        currentTrust,
        AUTHORIZED_ROE_CEDARLINE
      );

      expect(result.verificationPassed).toBe(false);
      expect(result.targetReaction).toBe('SKEPTICAL');
      expect(result.trustMetricsAfter.suspicion).toBe(55);
      expect(result.outcomeDescription).toContain(persona.flawOrTell);
    });
  });

  describe('Simulation Isolation & Sandbox Enforcement', () => {
    it('verifies RoE authorizes in-scope target subnets and hosts', () => {
      const scopeCheck = HumanPhysicalEngine.verifyScopeAndRoE(
        AUTHORIZED_ROE_CEDARLINE,
        'ws-fin-04',
        'Subnet discovery & port enumeration (netmap, svcscan)'
      );

      expect(scopeCheck.isAuthorized).toBe(true);
      expect(scopeCheck.violatesRoE).toBe(false);
    });

    it('strictly rejects actions targeting out-of-scope or external infrastructure', () => {
      const scopeCheck = HumanPhysicalEngine.verifyScopeAndRoE(
        AUTHORIZED_ROE_CEDARLINE,
        '8.8.8.8', // Real external internet address
        'Port scanning'
      );

      expect(scopeCheck.isAuthorized).toBe(false);
      expect(scopeCheck.violatesRoE).toBe(true);
      expect(scopeCheck.reason).toContain('OUT OF SCOPE');
    });

    it('strictly blocks prohibited destructive techniques even on in-scope hosts', () => {
      const scopeCheck = HumanPhysicalEngine.verifyScopeAndRoE(
        AUTHORIZED_ROE_CEDARLINE,
        'ws-fin-04',
        'Destructive formatting of server storage arrays'
      );

      expect(scopeCheck.isAuthorized).toBe(false);
      expect(scopeCheck.violatesRoE).toBe(true);
      expect(scopeCheck.reason).toContain('explicitly prohibited');
    });
  });
});
