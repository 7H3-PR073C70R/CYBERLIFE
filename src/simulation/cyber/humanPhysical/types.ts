/**
 * Cyberlife — Human Attack Surface & Physical Security Simulation Types
 *
 * Defines the authoritative contracts for the human and physical cybersecurity
 * simulation, including interpersonal trust, credibility, physical access control,
 * visitor escorts, removable media telemetry, pretexting, insider risk, and
 * shared physical-to-digital evidence correlation.
 *
 * STRICT SIMULATION SANDBOX:
 * 100% deterministic, in-memory domain model.
 * Zero real malware · Zero real network traffic · Zero host execution.
 */

// ============================================================================
// 1. Human Trust, Credibility, Authority & Suspicion
// ============================================================================

export interface HumanTrustMetrics {
  /** Interpersonal goodwill and rapport (-100 to +100) */
  readonly trust: number;
  /** Professional/factual believability backed by badges or evidence (0 to 100) */
  readonly credibility: number;
  /** Perceived organizational, technical, or regulatory seniority (0 to 100) */
  readonly authority: number;
  /** Counter-intelligence caution raised by evasiveness or anomalies (0 to 100) */
  readonly suspicion: number;
}

export type NpcSecurityReaction =
  | 'COMPLIANT'       // Willing to follow request without challenge
  | 'COOPERATIVE'     // Helpful within standard policy boundaries
  | 'SKEPTICAL'       // Demands identification or supervisor confirmation
  | 'RESISTANT'       // Refuses request citing corporate policy
  | 'HOSTILE'         // Immediately alerts security or management
  | 'EVASIVE';        // Conceals information (potential insider risk)

export interface TrustEvaluationContext {
  readonly currentMetrics: HumanTrustMetrics;
  readonly requesterRole: string;
  readonly hasValidBadge: boolean;
  readonly hasSignedRoE: boolean;
  readonly locationSecurityTier: number;
  readonly isOffHours: boolean;
  readonly requestSensitivity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

// ============================================================================
// 2. Physical Facilities, Zones & Access Control
// ============================================================================

export type SecurityClearanceLevel =
  | 'PUBLIC'          // Level 0: Street, public lobbies, retail areas
  | 'GUEST'           // Level 1: Escorted visitor areas, reception conference rooms
  | 'STANDARD'        // Level 2: General employee workstations, cafeteria, breakrooms
  | 'RESTRICTED'      // Level 3: IT staging, network closets, management offices
  | 'SECURE_VAULT'    // Level 4: Core datacenter / server rooms, SOC consoles, executive safe
  | 'AIRGAPPED_LAB';  // Level 5: Isolated air-gapped forensic and malware analysis labs

export interface PhysicalFacility {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly organizationId: string;
  readonly operatingHours: {
    readonly openHour: number;  // 0-23
    readonly closeHour: number; // 0-23
    readonly is24Hours: boolean;
  };
  readonly securityStaffed: boolean;
  readonly cctvCoverage: 'NONE' | 'PERIMETER' | 'CORRIDORS' | 'FULL_INTERNAL';
  readonly rooms: readonly FacilityRoom[];
}

export interface FacilityRoom {
  readonly id: string;
  readonly facilityId: string;
  readonly name: string;
  readonly floor: number;
  readonly requiredClearance: SecurityClearanceLevel;
  readonly requiresEscortForGuests: boolean;
  readonly badgeReaderId?: string;
  readonly containsEndpoints: readonly string[];
  readonly containsPhysicalEvidence: readonly string[];
  readonly description: string;
}

export type BadgeType =
  | 'VISITOR_GUEST'
  | 'CONTRACTOR_TEMPORARY'
  | 'EMPLOYEE_STANDARD'
  | 'IT_INFRASTRUCTURE'
  | 'SECURITY_SECOPS'
  | 'EXECUTIVE_LEADERSHIP';

export interface PhysicalBadge {
  readonly badgeId: string;
  readonly badgeNumber: string; // e.g. "CED-2026-B-0412"
  readonly assignedUserId?: string;
  readonly holderName: string;
  readonly holderOrganization: string;
  readonly badgeType: BadgeType;
  readonly clearanceLevel: SecurityClearanceLevel;
  readonly issuedAt: string;
  readonly expiresAt: string;
  readonly isActive: boolean;
  readonly isClonedOrTampered?: boolean;
}

export interface PhysicalAccessLogEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly facilityId: string;
  readonly roomId: string;
  readonly badgeId: string;
  readonly holderName: string;
  readonly accessGranted: boolean;
  readonly denialReason?: 'INSUFFICIENT_CLEARANCE' | 'BADGE_EXPIRED' | 'OFF_HOURS' | 'REVOKED';
  readonly tailgatingAlert: boolean;
  readonly doorHeldOpenSeconds?: number;
  readonly cctvSnapshotId?: string;
}

// ============================================================================
// 3. Fictional Removable Media & Isolated Endpoints
// ============================================================================

export type RemovableMediaType =
  | 'USB_MASS_STORAGE'
  | 'USB_KEYBOARD_INJECTOR'
  | 'SD_CARD'
  | 'EXTERNAL_ENCRYPTED_SSD';

export interface SyntheticFileManifestEntry {
  readonly path: string;
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly sha256Hash: string;
  readonly isExecutable: boolean;
  readonly isHidden: boolean;
  readonly syntheticClassification: 'BENIGN' | 'CONFIDENTIAL' | 'MALICIOUS_SIMULATION';
  readonly simulatedBehaviorSummary: string;
}

export interface FictionalRemovableDevice {
  readonly deviceId: string;
  readonly serialNumber: string;
  readonly vendorName: string;
  readonly productName: string;
  readonly mediaType: RemovableMediaType;
  readonly capacityBytes: number;
  readonly physicalCondition: 'PRISTINE' | 'WEATHERED' | 'TAMPERED' | 'DISCARDED';
  readonly foundLocationId: string;
  readonly labelText?: string; // e.g. "Q4 Payroll Audit - Do Not Remove"
  readonly fileManifest: readonly SyntheticFileManifestEntry[];
  readonly isHardwareWriteProtected: boolean;
}

export interface RemovableMediaTelemetryEvent {
  readonly eventId: string;
  readonly timestamp: string;
  readonly hostId: string;
  readonly hostName: string;
  readonly loggedInUser: string;
  readonly deviceSerial: string;
  readonly vendorProduct: string;
  readonly action: 'DEVICE_CONNECTED' | 'PARTITION_MOUNTED' | 'FILE_ACCESSED' | 'DEVICE_REMOVED';
  readonly mountPoint: string;
  readonly processGenerated?: {
    readonly processId: number;
    readonly processName: string;
    readonly commandLine: string;
    readonly parentProcessName: string;
    readonly sha256: string;
  };
  readonly networkActivityDetected?: {
    readonly destIp: string;
    readonly destPort: number;
    readonly protocol: string;
    readonly bytesTransferred: number;
  };
}

// ============================================================================
// 4. Social Engineering, Pretexting & Identity Verification
// ============================================================================

export type PretextVector =
  | 'PHONE_CALL'
  | 'EMAIL_PHISHING'
  | 'HELP_DESK_WALKUP'
  | 'PHYSICAL_ONSITE_VISITOR'
  | 'VENDOR_MAINTENANCE';

export interface PretextPersona {
  readonly personaId: string;
  readonly claimedName: string;
  readonly claimedTitle: string;
  readonly claimedOrganization: string;
  readonly targetNpcId: string;
  readonly vector: PretextVector;
  readonly objective: string;
  readonly pretextStory: string;
  readonly supportingArtifacts: readonly string[]; // e.g. "Forged Work Order #WO-8819", "Spoofed Caller ID"
  readonly flawOrTell: string; // The clue players/defenders notice to detect pretext
}

export interface VerificationChallenge {
  readonly challengeType: 'CALLBACK_NUMBER' | 'EMPLOYEE_ID' | 'MANAGER_APPROVAL' | 'MFA_PROMPT';
  readonly promptText: string;
  readonly validResponse: string;
  readonly providedResponse?: string;
  readonly isPassed: boolean;
}

export interface SocialEngineeringScenarioResult {
  readonly scenarioId: string;
  readonly persona: PretextPersona;
  readonly chosenVector: PretextVector;
  readonly targetReaction: NpcSecurityReaction;
  readonly trustMetricsAfter: HumanTrustMetrics;
  readonly verificationAttempted: boolean;
  readonly verificationPassed: boolean;
  readonly authorizedUnderRoE: boolean;
  readonly evidenceGenerated: readonly string[];
  readonly outcomeDescription: string;
}

// ============================================================================
// 5. Phishing, Awareness & Employee Reporting
// ============================================================================

export interface SimulatedEmailLure {
  readonly emailId: string;
  readonly timestamp: string;
  readonly envelopeSender: string;
  readonly displayName: string;
  readonly replyToAddress: string;
  readonly recipientEmail: string;
  readonly subject: string;
  readonly bodyText: string;
  readonly syntheticAttachment?: {
    readonly fileName: string;
    readonly sha256Hash: string;
    readonly fileSizeBytes: number;
  };
  readonly spoofIndicators: readonly {
    readonly indicator: string;
    readonly explanation: string;
    readonly headerField: string;
  }[];
  readonly targetedDepartment: string;
}

export interface EmployeeSecurityReportEvent {
  readonly reportId: string;
  readonly reporterNpcId: string;
  readonly reporterName: string;
  readonly timestamp: string;
  readonly incidentCategory: 'PHISHING_SUSPICION' | 'UNESCORTED_VISITOR' | 'UNATTENDED_USB' | 'IMPERSONATION_ATTEMPT';
  readonly subjectSummary: string;
  readonly detailedNotes: string;
  readonly reportedArtifactId?: string;
  readonly socTriageStatus: 'PENDING' | 'VALIDATED_THREAT' | 'FALSE_POSITIVE' | 'CLOSED_RESOLVED';
}

// ============================================================================
// 6. Rules of Engagement, Scope & Authorization
// ============================================================================

export interface RulesOfEngagement {
  readonly engagementId: string;
  readonly clientName: string;
  readonly authorizedAssessorName: string;
  readonly effectiveStartDate: string;
  readonly effectiveEndDate: string;
  readonly authorizedRoles: readonly ('BLUE_TEAM' | 'PURPLE_TEAM' | 'RED_TEAM' | 'INDEPENDENT_INVESTIGATOR')[];
  readonly allowedTechniques: readonly string[];
  readonly prohibitedTechniques: readonly string[];
  readonly inScopeTargets: readonly {
    readonly targetType: 'SUBNET' | 'HOST' | 'FACILITY_ROOM' | 'EMPLOYEE_GROUP';
    readonly identifier: string;
    readonly description: string;
  }[];
  readonly emergencyContactPhone: string;
  readonly signatureSha256: string;
  readonly isSignedAndActive: boolean;
}

export interface ScopeEvaluationResult {
  readonly isAuthorized: boolean;
  readonly violatesRoE: boolean;
  readonly reason: string;
  readonly targetedResource: string;
  readonly attemptedAction: string;
}

// ============================================================================
// 7. Shared Physical-to-Digital Correlated Evidence
// ============================================================================

export interface CorrelatedInvestigationIncident {
  readonly incidentId: string;
  readonly title: string;
  readonly primaryVector: 'PHYSICAL_INTRUSION' | 'REMOVABLE_MEDIA' | 'HELP_DESK_PRETEXT' | 'INSIDER_RISK';
  readonly leadNpcId: string;
  readonly targetHostId: string;
  readonly targetRoomId: string;
  readonly correlationTimestamp: string;
  readonly physicalAccessLogId: string;
  readonly removableMediaSerial?: string;
  readonly endpointTelemetryEventId: string;
  readonly networkPacketFrameId?: number;
  readonly siemAlertId: string;
  readonly chainOfCustodyIds: readonly string[];
  readonly investigativeRoles: {
    readonly blueTeamAction: string;
    readonly purpleTeamAction: string;
    readonly redTeamAssessmentAction: string;
    readonly investigatorAuditAction: string;
  };
}
