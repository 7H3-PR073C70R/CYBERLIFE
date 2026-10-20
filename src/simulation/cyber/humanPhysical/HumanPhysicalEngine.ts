/**
 * Cyberlife — Human & Physical Security Simulation Engine
 *
 * Provides deterministic simulation logic for human trust dynamics, physical badge
 * validation, removable media sandboxing, pretexting verification, and cross-domain
 * physical-to-digital evidence correlation.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% in-memory computation.
 * Zero real malware · Zero real network requests · Zero host command execution.
 */

import {
  HumanTrustMetrics,
  NpcSecurityReaction,
  TrustEvaluationContext,
  PhysicalBadge,
  FacilityRoom,
  PhysicalAccessLogEntry,
  FictionalRemovableDevice,
  RemovableMediaTelemetryEvent,
  PretextPersona,
  VerificationChallenge,
  SocialEngineeringScenarioResult,
  RulesOfEngagement,
  ScopeEvaluationResult,
  CorrelatedInvestigationIncident,
} from './types';
import { AUTHORIZED_ROE_CEDARLINE } from './fixtures';

export class HumanPhysicalEngine {
  /**
   * Deterministically evaluates how an NPC reacts to a request based on
   * interpersonal trust, credibility, authority, and situational suspicion.
   */
  public static evaluateTrustReaction(context: TrustEvaluationContext): {
    readonly reaction: NpcSecurityReaction;
    readonly netScore: number;
    readonly updatedMetrics: HumanTrustMetrics;
    readonly rationale: string;
  } {
    const { currentMetrics, hasValidBadge, hasSignedRoE, locationSecurityTier, isOffHours, requestSensitivity } = context;

    let netScore =
      currentMetrics.trust * 0.35 +
      currentMetrics.credibility * 0.35 +
      currentMetrics.authority * 0.30 -
      currentMetrics.suspicion * 0.70;

    if (hasValidBadge) netScore += 15;
    if (hasSignedRoE) netScore += 20;
    if (isOffHours) netScore -= 25;

    // Sensitivity penalty
    const sensitivityPenalties = {
      LOW: 0,
      MEDIUM: 15,
      HIGH: 30,
      CRITICAL: 50,
    };
    netScore -= sensitivityPenalties[requestSensitivity];

    // High location tier demands higher baseline
    netScore -= (locationSecurityTier - 1) * 10;

    let reaction: NpcSecurityReaction;
    let rationale: string;

    if (currentMetrics.suspicion >= 75) {
      reaction = 'HOSTILE';
      rationale = 'High suspicion triggered security alert threshold; request rejected immediately.';
    } else if (netScore >= 50) {
      reaction = 'COMPLIANT';
      rationale = 'High credibility and authorization verified; full compliance granted.';
    } else if (netScore >= 20) {
      reaction = 'COOPERATIVE';
      rationale = 'Reasonable trust established; cooperative within standard procedures.';
    } else if (netScore >= -10) {
      reaction = 'SKEPTICAL';
      rationale = 'Uncertain identity or unusual request; demands secondary verification or callback.';
    } else if (netScore >= -40) {
      reaction = 'RESISTANT';
      rationale = 'Policy violations detected; firmly denies request.';
    } else {
      reaction = 'HOSTILE';
      rationale = 'Blatant inconsistency or suspicious pretext detected; reporting to facility security.';
    }

    // Dynamic metrics update (bounded)
    const updatedMetrics: HumanTrustMetrics = {
      trust: Math.max(-100, Math.min(100, currentMetrics.trust)),
      credibility: Math.max(0, Math.min(100, currentMetrics.credibility)),
      authority: Math.max(0, Math.min(100, currentMetrics.authority)),
      suspicion: Math.max(
        0,
        Math.min(
          100,
          reaction === 'HOSTILE' || reaction === 'RESISTANT'
            ? currentMetrics.suspicion + 15
            : reaction === 'COMPLIANT'
            ? Math.max(0, currentMetrics.suspicion - 10)
            : currentMetrics.suspicion
        )
      ),
    };

    return { reaction, netScore: Math.round(netScore), updatedMetrics, rationale };
  }

  /**
   * Verifies a physical badge against a target room's security clearance requirements.
   */
  public static verifyPhysicalBadge(
    badge: PhysicalBadge,
    room: FacilityRoom,
    simulationHour = 10,
    tailgatingOccurred = false
  ): PhysicalAccessLogEntry {
    const clearanceRanks: Record<string, number> = {
      PUBLIC: 0,
      GUEST: 1,
      STANDARD: 2,
      RESTRICTED: 3,
      SECURE_VAULT: 4,
      AIRGAPPED_LAB: 5,
    };

    const isExpired = new Date(badge.expiresAt).getTime() <= new Date('2026-10-20T12:00:00Z').getTime();
    const isOffHours = simulationHour < 7 || simulationHour >= 20;

    let accessGranted = false;
    let denialReason: PhysicalAccessLogEntry['denialReason'] | undefined;

    if (!badge.isActive || badge.isClonedOrTampered) {
      accessGranted = false;
      denialReason = 'REVOKED';
    } else if (isExpired) {
      accessGranted = false;
      denialReason = 'BADGE_EXPIRED';
    } else if (
      (clearanceRanks[badge.clearanceLevel] ?? 0) < (clearanceRanks[room.requiredClearance] ?? 0)
    ) {
      accessGranted = false;
      denialReason = 'INSUFFICIENT_CLEARANCE';
    } else if (isOffHours && badge.badgeType !== 'SECURITY_SECOPS' && badge.badgeType !== 'EXECUTIVE_LEADERSHIP') {
      accessGranted = false;
      denialReason = 'OFF_HOURS';
    } else {
      accessGranted = true;
    }

    return {
      id: `phys-log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      facilityId: room.facilityId,
      roomId: room.id,
      badgeId: badge.badgeId,
      holderName: badge.holderName,
      accessGranted,
      denialReason,
      tailgatingAlert: tailgatingOccurred,
      doorHeldOpenSeconds: tailgatingOccurred ? 30 : 4,
    };
  }

  /**
   * Simulates inserting a fictional removable device into an endpoint.
   * Generates deterministic, synthetic telemetry without ANY host OS actions.
   */
  public static mountRemovableDevice(
    device: FictionalRemovableDevice,
    targetHostId: string,
    targetHostName: string,
    username: string,
    isAirGapped = false
  ): RemovableMediaTelemetryEvent {
    // Locate executable or simulation payload if present
    const payload = device.fileManifest.find(f => f.isExecutable || f.syntheticClassification === 'MALICIOUS_SIMULATION');

    const event: RemovableMediaTelemetryEvent = {
      eventId: `telem-usb-${Date.now()}`,
      timestamp: new Date().toISOString(),
      hostId: targetHostId,
      hostName: targetHostName,
      loggedInUser: username,
      deviceSerial: device.serialNumber,
      vendorProduct: `${device.vendorName} ${device.productName}`,
      action: 'DEVICE_CONNECTED',
      mountPoint: 'D:\\',
      processGenerated: payload
        ? {
            processId: 5120 + Math.floor(Math.random() * 500),
            processName: payload.fileName.endsWith('.vbs') ? 'cscript.exe' : 'rundll32.exe',
            commandLine: `cscript.exe //nologo D:\\${payload.fileName}`,
            parentProcessName: 'explorer.exe',
            sha256: payload.sha256Hash,
          }
        : undefined,
      networkActivityDetected:
        payload && !isAirGapped
          ? {
              destIp: '10.0.4.1',
              destPort: 445,
              protocol: 'SMB2',
              bytesTransferred: 512,
            }
          : undefined,
    };

    return event;
  }

  /**
   * Evaluates a pretexting challenge (e.g. Help-Desk password reset or telecom tech).
   */
  public static evaluatePretextAttempt(
    persona: PretextPersona,
    challenge: VerificationChallenge,
    providedAnswer: string,
    currentMetrics: HumanTrustMetrics,
    roe: RulesOfEngagement = AUTHORIZED_ROE_CEDARLINE
  ): SocialEngineeringScenarioResult {
    const isAnswerCorrect = providedAnswer.trim().toLowerCase() === challenge.validResponse.trim().toLowerCase();
    const isAuthorized = roe.isSignedAndActive && roe.allowedTechniques.some(t => t.toLowerCase().includes('social'));

    let reaction: NpcSecurityReaction;
    let trustDelta = 0;
    let suspicionDelta = 0;

    if (isAnswerCorrect) {
      reaction = 'COMPLIANT';
      trustDelta = 20;
      suspicionDelta = -15;
    } else {
      reaction = 'SKEPTICAL';
      trustDelta = -30;
      suspicionDelta = 35;
    }

    const updatedTrust: HumanTrustMetrics = {
      trust: Math.max(-100, Math.min(100, currentMetrics.trust + trustDelta)),
      credibility: Math.max(0, Math.min(100, currentMetrics.credibility + (isAnswerCorrect ? 15 : -25))),
      authority: currentMetrics.authority,
      suspicion: Math.max(0, Math.min(100, currentMetrics.suspicion + suspicionDelta)),
    };

    return {
      scenarioId: `scenario-${persona.personaId}-${Date.now()}`,
      persona,
      chosenVector: persona.vector,
      targetReaction: reaction,
      trustMetricsAfter: updatedTrust,
      verificationAttempted: true,
      verificationPassed: isAnswerCorrect,
      authorizedUnderRoE: isAuthorized,
      evidenceGenerated: [
        `Verification Challenge: ${challenge.promptText}`,
        `Provided Answer: ${providedAnswer} [${isAnswerCorrect ? 'MATCH' : 'MISMATCH'}]`,
        `Outcome: ${reaction}`,
      ],
      outcomeDescription: isAnswerCorrect
        ? 'Identity challenge successfully verified; access approved per standard operating procedure.'
        : `Verification failed. Identity mismatch flagged: ${persona.flawOrTell}`,
    };
  }

  /**
   * Validates whether a proposed assessment action falls strictly within
   * the authorized Rules of Engagement (RoE).
   */
  public static verifyScopeAndRoE(
    roe: RulesOfEngagement,
    targetIdentifier: string,
    techniqueName: string
  ): ScopeEvaluationResult {
    if (!roe.isSignedAndActive) {
      return {
        isAuthorized: false,
        violatesRoE: true,
        reason: 'Rules of Engagement are not currently active or signed by the client.',
        targetedResource: targetIdentifier,
        attemptedAction: techniqueName,
      };
    }

    // Check prohibited techniques
    const isProhibited = roe.prohibitedTechniques.some(p =>
      techniqueName.toLowerCase().includes(p.toLowerCase()) || p.toLowerCase().includes(techniqueName.toLowerCase())
    );
    if (isProhibited) {
      return {
        isAuthorized: false,
        violatesRoE: true,
        reason: `Technique "${techniqueName}" is explicitly prohibited under engagement RoE.`,
        targetedResource: targetIdentifier,
        attemptedAction: techniqueName,
      };
    }

    // Check in-scope targets
    const inScope = roe.inScopeTargets.some(t =>
      t.identifier.toLowerCase() === targetIdentifier.toLowerCase()
    );
    if (!inScope) {
      return {
        isAuthorized: false,
        violatesRoE: true,
        reason: `Target resource "${targetIdentifier}" is OUT OF SCOPE. Only authorized targets in RoE may be assessed.`,
        targetedResource: targetIdentifier,
        attemptedAction: techniqueName,
      };
    }

    return {
      isAuthorized: true,
      violatesRoE: false,
      reason: 'Action is fully authorized under active Rules of Engagement.',
      targetedResource: targetIdentifier,
      attemptedAction: techniqueName,
    };
  }

  /**
   * Correlates physical and digital evidence into an authoritative incident record.
   */
  public static correlateEvidenceChain(
    incident: CorrelatedInvestigationIncident,
    accessLogs: readonly PhysicalAccessLogEntry[],
    usbTelemetry: readonly RemovableMediaTelemetryEvent[]
  ): {
    readonly isCorrelated: boolean;
    readonly physicalEvent?: PhysicalAccessLogEntry;
    readonly digitalEvent?: RemovableMediaTelemetryEvent;
    readonly timelineSummary: readonly string[];
  } {
    const physicalEvent = accessLogs.find(l => l.id === incident.physicalAccessLogId);
    const digitalEvent = usbTelemetry.find(u => u.eventId === incident.endpointTelemetryEventId);

    const isCorrelated = Boolean(physicalEvent && digitalEvent);

    const timelineSummary: string[] = [];
    if (physicalEvent) {
      timelineSummary.push(
        `[PHYSICAL] ${physicalEvent.timestamp}: Badge swipe by ${physicalEvent.holderName} at ${physicalEvent.roomId} (Granted: ${physicalEvent.accessGranted})`
      );
    }
    if (digitalEvent) {
      timelineSummary.push(
        `[ENDPOINT] ${digitalEvent.timestamp}: Device ${digitalEvent.deviceSerial} mounted on ${digitalEvent.hostName} by ${digitalEvent.loggedInUser}`
      );
      if (digitalEvent.processGenerated) {
        timelineSummary.push(
          `[PROCESS] Executed: ${digitalEvent.processGenerated.commandLine} (PID: ${digitalEvent.processGenerated.processId}, Hash: ${digitalEvent.processGenerated.sha256.substring(0, 16)}...)`
        );
      }
      if (digitalEvent.networkActivityDetected) {
        timelineSummary.push(
          `[NETWORK] Beacon traffic to ${digitalEvent.networkActivityDetected.destIp}:${digitalEvent.networkActivityDetected.destPort} (${digitalEvent.networkActivityDetected.protocol})`
        );
      }
    }

    return {
      isCorrelated,
      physicalEvent,
      digitalEvent,
      timelineSummary,
    };
  }
}
