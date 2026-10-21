/**
 * Cyberlife : Milestone 6: The Aster Incident Mission Types
 *
 * Defines the authoritative state shape, phases, objectives, containment,
 * remediation, verification, and incident report data models.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated, in-memory domain model. Zero external network access or real system changes.
 */

export type AsterIncidentPhase =
  | 'briefing'
  | 'initial_assessment'
  | 'investigation'
  | 'evidence_preservation'
  | 'containment'
  | 'remediation'
  | 'verification'
  | 'reporting'
  | 'completed';

export interface MissionObjective {
  readonly id: string;
  readonly phase: AsterIncidentPhase;
  readonly title: string;
  readonly description: string;
  readonly isCompleted: boolean;
  readonly completedAt?: number; // simulation time seconds
  readonly hint?: string;
  readonly requiredAction?: string;
}

export interface RootCauseAssessment {
  readonly suspectedRootCause: string;
  readonly affectedComponent: string;
  readonly observedImpact: string;
  readonly supportingEvidenceIds: readonly string[];
  readonly uncertaintyOrNotes?: string;
  readonly submittedAt?: number;
  readonly isAccurate: boolean;
  readonly feedback: string;
}

export type AsterPolicyRole = 'corporate-admin' | 'kb-assistant' | 'custom-unrestricted';

export interface AsterServiceStatus {
  readonly hostId: string;
  readonly serviceName: string;
  readonly operationalMode: 'NORMAL' | 'CONTAINED' | 'REMEDIATED';
  readonly activePolicyRole: AsterPolicyRole;
  readonly grantedScopes: readonly string[];
  readonly allowedSubnets: readonly string[];
  readonly smbAccessAllowed: boolean;
  readonly databaseAccessAllowed: boolean;
  readonly lastPolicyUpdateAt?: number;
}

export interface VerificationResult {
  readonly legitimateDocsAccessible: boolean;
  readonly fileServerAccessBlocked: boolean;
  readonly databaseAccessBlocked: boolean;
  readonly auditLogVerified: boolean;
  readonly passed: boolean;
  readonly testedAt: number;
  readonly message: string;
  readonly checkDetails: readonly {
    readonly checkName: string;
    readonly passed: boolean;
    readonly description: string;
  }[];
}

export interface IncidentReportData {
  readonly executiveSummary: string;
  readonly timeline: string;
  readonly affectedSystems: readonly string[];
  readonly rootCause: string;
  readonly impactAssessment: string;
  readonly containmentActions: string;
  readonly remediationActions: string;
  readonly verificationResults: string;
  readonly recommendations: string;
  readonly submittedAt?: number;
  readonly score?: number;
  readonly isApproved?: boolean;
  readonly reviewerFeedback?: string;
}

export interface AsterIncidentMissionState {
  readonly missionId: 'the_aster_incident';
  readonly title: string;
  readonly hasStarted: boolean;
  readonly phase: AsterIncidentPhase;
  readonly objectives: readonly MissionObjective[];
  readonly discoveredHosts: readonly string[];
  readonly inspectedServices: readonly string[];
  readonly analyzedLogIds: readonly string[];
  readonly preservedEvidenceIds: readonly string[];
  readonly asterService: AsterServiceStatus;
  readonly rootCauseAssessment?: RootCauseAssessment;
  readonly isContained: boolean;
  readonly containmentTimestamp?: number;
  readonly isRemediated: boolean;
  readonly remediationTimestamp?: number;
  readonly isVerified: boolean;
  readonly verificationResult?: VerificationResult;
  readonly incidentReport?: IncidentReportData;
  readonly isCompleted: boolean;
  readonly completedAt?: number;
  readonly finalScore?: number;
  readonly outcomeFeedback?: string;
}
