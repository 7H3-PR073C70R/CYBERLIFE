/**
 * Cyberlife — Milestone 17: Red Team & Authorized Assessment Domain Types
 *
 * Defines the authoritative domain types for structured, permission-driven
 * penetration testing, Rules of Engagement (RoE), scope validation,
 * simulated security testing actions, finding validation, cryptographic evidence,
 * and executive penetration testing report evaluation.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% in-memory deterministic simulation.
 * Zero host shell execution · Zero real network sockets · Zero external requests.
 */

export type AssessmentStatus =
  | 'PENDING_ACCEPTANCE'
  | 'IN_PROGRESS'
  | 'REPORT_DRAFTING'
  | 'EVALUATED_APPROVED'
  | 'EVALUATED_REJECTED';

export type AssessmentPhase =
  | 'BRIEFING_SCOPE'
  | 'RECON_DISCOVERY'
  | 'TARGET_ASSESSMENT'
  | 'FINDING_VALIDATION'
  | 'REPORT_GENERATION'
  | 'COMPLETED';

export type ActionCategory =
  | 'RECONNAISSANCE'
  | 'CONFIG_AUDIT'
  | 'WEB_APP_ASSESSMENT'
  | 'AUTH_ACCESS_CONTROL'
  | 'FINDING_VALIDATION'
  | 'REPORT_GENERATION';

export type AuthorizationDecision =
  | 'AUTHORIZED'
  | 'BLOCKED_OUT_OF_SCOPE'
  | 'BLOCKED_PROHIBITED'
  | 'BLOCKED_UNAUTHORIZED'
  | 'BLOCKED_EXPIRED';

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type FindingConfidence = 'CONFIRMED' | 'SUSPECTED' | 'UNRESOLVED' | 'BENIGN_FALSE_POSITIVE';

export type FindingStatus = 'VALIDATED' | 'REJECTED' | 'SUSPECTED' | 'UNRESOLVED';

export interface RulesOfEngagement {
  readonly assessmentId: string;
  readonly clientOrganization: string;
  readonly authorizingOfficial: string;
  readonly authorizingRole: string;
  readonly authorizedAssessorName: string;
  readonly legalFramework: string;
  readonly validFromIso: string;
  readonly validUntilIso: string;
  readonly emergencyStopContact: string;
  readonly authorizedSubnets: readonly string[];
  readonly allowedActionCategories: readonly ActionCategory[];
  readonly prohibitedActions: readonly string[];
  readonly rulesSummary: readonly string[];
  readonly isSignedAndActive: boolean;
  readonly playerAcceptedAtSimTime?: number;
}

export interface AssessmentTargetService {
  readonly port: number;
  readonly protocol: 'tcp' | 'udp';
  readonly name: string;
  readonly product: string;
  readonly version: string;
  readonly banner?: string;
  readonly description: string;
  readonly isVulnerable: boolean;
  readonly securityControls: readonly string[];
}

export interface AssessmentTargetAsset {
  readonly id: string;
  readonly hostname: string;
  readonly ipAddress: string;
  readonly fqdn: string;
  readonly segmentId: string;
  readonly segmentName: string;
  readonly organization: string;
  readonly category: 'application_server' | 'file_server' | 'gateway_router' | 'workstation' | 'monitoring_siem' | 'domain_controller' | 'external_endpoint';
  readonly roleLabel: string;
  readonly os: string;
  readonly inScope: boolean;
  readonly scopeJustification: string;
  readonly allowedActionCategories: readonly ActionCategory[];
  readonly prohibitedActions: readonly string[];
  readonly services: readonly AssessmentTargetService[];
  readonly knownVulnerabilities: readonly string[];
  readonly environmentType: 'STAGING_LAB' | 'INTERNAL_ENTERPRISE' | 'DMZ_CLUSTER' | 'OUT_OF_SCOPE_PRODUCTION' | 'EXTERNAL_UNTRUSTED';
}

export interface ScopeEvaluationResult {
  readonly isAuthorized: boolean;
  readonly decision: AuthorizationDecision;
  readonly reason: string;
  readonly targetedResource: string;
  readonly attemptedAction: string;
  readonly actionCategory: ActionCategory;
  readonly timestampSimTime: number;
}

export interface RedTeamToolDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: ActionCategory;
  readonly defaultTargetId?: string;
  readonly description: string;
  readonly pedagogicalExplanation: {
    readonly whatItEvaluates: string;
    readonly requiredTargetInput: string;
    readonly whyPermittedInRoE: string;
    readonly whatResultEstablishes: string;
    readonly whatResultDoesNotEstablish: string;
    readonly followUpRecommendations: string;
  };
}

export interface RedTeamEvidenceItem {
  readonly id: string;
  readonly assessmentId: string;
  readonly targetId: string;
  readonly title: string;
  readonly source: string;
  readonly collectionTimeSimTime: number;
  readonly evidenceType: 'RECON_OBSERVATION' | 'CONFIG_EVALUATION' | 'WEB_API_TRACE' | 'AUTH_POLICY_DIFF' | 'FINDING_VALIDATION';
  readonly integrityStatus: 'VERIFIED';
  readonly hashSha256: string;
  readonly artifactSnippet: readonly string[];
  readonly chainOfCustody: readonly {
    readonly time: number;
    readonly handler: string;
    readonly action: string;
    readonly signature: string;
  }[];
  readonly analystNotes?: string;
}

export interface RedTeamActionResult {
  readonly actionId: string;
  readonly assessmentId: string;
  readonly targetId: string;
  readonly toolId: string;
  readonly toolName: string;
  readonly category: ActionCategory;
  readonly status: 'SUCCESS' | 'BLOCKED' | 'INCONCLUSIVE' | 'DEFENSE_PREVENTED';
  readonly scopeEvaluation: ScopeEvaluationResult;
  readonly simulatedTimestamp: number;
  readonly executionLogs: readonly string[];
  readonly observations: readonly string[];
  readonly candidateFindingId?: string;
  readonly generatedEvidence?: RedTeamEvidenceItem;
  readonly limitationExplanation: string;
}

export interface FindingValidationEvent {
  readonly timestampSimTime: number;
  readonly handler: string;
  readonly action: 'VALIDATE' | 'REJECT' | 'MARK_UNRESOLVED' | 'UPDATE_SEVERITY' | 'ADD_NOTE';
  readonly previousStatus: FindingStatus;
  readonly newStatus: FindingStatus;
  readonly rationale: string;
}

export interface VulnerabilityFinding {
  readonly id: string;
  readonly assessmentId: string;
  readonly targetId: string;
  readonly targetHostname: string;
  readonly targetService: string;
  readonly title: string;
  readonly category: ActionCategory;
  readonly cveOrCwe: string;
  readonly cvssScore: number;
  readonly cvssVector: string;
  readonly severity: FindingSeverity;
  readonly confidence: FindingConfidence;
  readonly status: FindingStatus;
  readonly technicalDescription: string;
  readonly businessImpact: string;
  readonly safeReproductionSummary: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly remediationRecommendation: string;
  readonly analystNotes: string;
  readonly isFalsePositive: boolean;
  readonly falsePositiveReason?: string;
  readonly validationHistory: readonly FindingValidationEvent[];
  readonly discoveredAtSimTime: number;
}

export interface RedTeamObjective {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly hint: string;
  readonly isCompleted: boolean;
  readonly completedAtSimTime?: number;
  readonly requiredAction:
    | 'ACCEPT_ROE'
    | 'RUN_RECONNAISSANCE'
    | 'AUDIT_SERVICE_CONFIG'
    | 'ASSESS_WEB_APPLICATION'
    | 'EVALUATE_AUTH_ACCESS_CONTROL'
    | 'REJECT_BENIGN_FALSE_POSITIVE'
    | 'VALIDATE_TRUE_FINDINGS'
    | 'PRESERVE_CRYPTOGRAPHIC_EVIDENCE'
    | 'SUBMIT_ASSESSMENT_REPORT';
}

export interface RedTeamAnalystNote {
  readonly id: string;
  readonly timestampSimTime: number;
  readonly title: string;
  readonly content: string;
  readonly category: 'SCOPE' | 'OBSERVATION' | 'FINDING' | 'REMEDIATION';
  readonly linkedTargetId?: string;
  readonly linkedFindingId?: string;
}

export interface RedTeamReportSubmission {
  readonly assessmentId: string;
  readonly executiveSummary: string;
  readonly overallRiskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  readonly validatedFindingIds: readonly string[];
  readonly rejectedFalsePositiveIds: readonly string[];
  readonly limitationsDisclosed: readonly string[];
  readonly remediationRoadmap: readonly string[];
  readonly preservedEvidenceIds: readonly string[];
  readonly submittedAtSimTime: number;
  readonly assessorSignature: string;
}

export interface RedTeamEvaluationResult {
  readonly isApproved: boolean;
  readonly scorePercentage: number; // 0 to 100
  readonly feedbackSummary: string;
  readonly correctFindingsCount: number;
  readonly totalExpectedFindings: number;
  readonly falsePositiveCorrectlyIdentified: boolean;
  readonly falsePositiveIncorrectlyReportedAsReal: boolean;
  readonly outOfScopeAssetsRespected: boolean;
  readonly evidenceCompletenessScore: number;
  readonly missingEvidenceIds: readonly string[];
  readonly evaluatorFeedback: readonly string[];
}

export interface RedTeamAssessmentState {
  readonly scenarioId: string;
  readonly scenarioTitle: string;
  readonly issuingOrganization: string;
  readonly activePhase: AssessmentPhase;
  readonly roe: RulesOfEngagement;
  readonly isAcceptedByPlayer: boolean;
  readonly acceptedAtSimTime?: number;
  readonly targets: readonly AssessmentTargetAsset[];
  readonly availableTools: readonly RedTeamToolDefinition[];
  readonly objectives: readonly RedTeamObjective[];
  readonly executedActionIds: readonly string[];
  readonly actionHistory: readonly RedTeamActionResult[];
  readonly findings: readonly VulnerabilityFinding[];
  readonly evidenceVault: readonly RedTeamEvidenceItem[];
  readonly auditLog: readonly {
    readonly id: string;
    readonly timestampSimTime: number;
    readonly actor: string;
    readonly action: string;
    readonly target: string;
    readonly status: AuthorizationDecision | 'ACTION_COMPLETED';
    readonly details: string;
  }[];
  readonly analystNotes: readonly RedTeamAnalystNote[];
  readonly reportSubmission?: RedTeamReportSubmission;
  readonly evaluationResult?: RedTeamEvaluationResult;
}
