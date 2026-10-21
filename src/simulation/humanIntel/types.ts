/**
 * Cyberlife — Milestone 21: Human Intelligence, Social Investigation
 * & Physical Security Assessment Types
 *
 * Defines the authoritative domain contracts for:
 * - Observation and environmental investigation
 * - Interview sessions and witness testimony
 * - Evidence comparison (human testimony vs technical records)
 * - Investigative conclusions with confidence grading
 * - Social-engineering awareness scenario evaluation
 * - Authorized physical-security assessment findings
 *
 * STRICT SIMULATION SANDBOX:
 * 100% deterministic, in-memory domain model.
 * Zero real-world targets · Zero real credentials · Zero actual intrusion.
 */

import type { WorldFlagValue } from '../core/types';

// ============================================================================
// 1. Observation & Environmental Investigation
// ============================================================================

export type ObservationCategory =
  | 'DOCUMENT'        // Physical document, printed record, sign-in sheet
  | 'DEVICE'          // Visible device, terminal, badge reader, camera
  | 'PROCEDURE'       // Observed staff behaviour or procedural step
  | 'ACCESS_CONTROL'  // Door, gate, badge terminal, escorted area
  | 'ENVIRONMENT'     // Room layout, cabling, signage, physical condition
  | 'ANOMALY';        // Something unexpected relative to documented policy

export type ObservationStatus =
  | 'OBSERVED'          // Fact recorded; no interpretation yet
  | 'INTERPRETED'       // A contextual explanation has been attached
  | 'LINKED_TO_EVIDENCE'// Connected to existing technical evidence
  | 'FINDING_RAISED';   // Escalated to a formal assessment finding

export interface ObservationRecord {
  readonly id: string;
  readonly activityId: string;
  readonly locationId: string;
  readonly objectId: string;          // In-world object identifier
  readonly category: ObservationCategory;
  readonly status: ObservationStatus;
  readonly description: string;       // What was observed (factual)
  readonly interpretation?: string;   // Player's annotation or inference
  readonly linkedEvidenceIds: readonly string[];
  readonly recordedAtSimTime: number;
  readonly discoveredByFlag?: string; // Optional world-flag that triggers discovery
}

// ============================================================================
// 2. Interview Sessions & Witness Testimony
// ============================================================================

export type TestimonyReliability =
  | 'FIRSTHAND'       // Direct observation or personal experience
  | 'SECONDHAND'      // Heard from someone else
  | 'BELIEF'          // What the character believes, not confirmed
  | 'SPECULATIVE'     // Guess or inference
  | 'WITHHELD';       // Character is concealing part of what they know

export interface WitnessStatement {
  readonly statementId: string;
  readonly npcId: string;
  readonly questionId: string;
  readonly responseText: string;
  readonly reliability: TestimonyReliability;
  readonly claimedFact?: string;          // The core factual assertion (if any)
  readonly potentialContradiction?: string; // Tag to identify conflicting statements
  readonly evidenceIdMentioned?: string;  // If NPC references a technical artifact
  readonly recordedAtSimTime: number;
}

export interface InterviewSession {
  readonly sessionId: string;
  readonly activityId: string;
  readonly npcId: string;
  readonly startedAtSimTime: number;
  readonly completedAtSimTime?: number;
  readonly questionsAsked: readonly string[];   // Question IDs
  readonly statementsRecorded: readonly WitnessStatement[];
  readonly evidencePresentedIds: readonly string[];
  readonly status: 'ACTIVE' | 'COMPLETED' | 'ABANDONED';
  readonly trustBeforeInterview: number;       // NPC relationship at start
  readonly trustAfterInterview?: number;       // NPC relationship at end
}

// ============================================================================
// 3. Evidence Comparison — Human Testimony vs Technical Records
// ============================================================================

export type ComparisonVerdict =
  | 'CONSISTENT'          // Testimony matches technical record
  | 'CONTRADICTED'        // Testimony directly conflicts
  | 'PARTIALLY_CONSISTENT'// Consistent on some points, differs on others
  | 'INCONCLUSIVE'        // Insufficient information to judge
  | 'PERSPECTIVE_DIFFERENCE'; // Both valid but different frames of reference

export interface EvidenceComparisonRecord {
  readonly id: string;
  readonly activityId: string;
  readonly statementId: string;
  readonly technicalEvidenceId: string;      // Evidence vault or access log id
  readonly playerVerdict: ComparisonVerdict;
  readonly playerRationale: string;
  readonly systemVerdict: ComparisonVerdict; // Ground-truth evaluation
  readonly systemRationale: string;
  readonly isCorrect: boolean;               // Player verdict matches system verdict
  readonly recordedAtSimTime: number;
}

// ============================================================================
// 4. Investigative Conclusions
// ============================================================================

export type M21ConclusionType =
  | 'SUPPORTED'               // Evidence clearly supports the conclusion
  | 'CONTRADICTED'            // Evidence refutes the conclusion
  | 'INCONCLUSIVE'            // Not enough evidence either way
  | 'REQUIRES_FURTHER_INVESTIGATION'; // More leads needed

export interface M21InvestigativeConclusion {
  readonly id: string;
  readonly activityId: string;
  readonly title: string;
  readonly hypothesisText: string;
  readonly supportingStatementIds: readonly string[];
  readonly supportingEvidenceIds: readonly string[];
  readonly contradictingStatementIds: readonly string[];
  readonly playerConclusionType: M21ConclusionType;
  readonly systemConclusionType: M21ConclusionType;   // Ground truth
  readonly isCorrect: boolean;
  readonly feedbackText: string;
  readonly submittedAtSimTime: number;
  readonly consequenceFlags: Readonly<Record<string, WorldFlagValue>>;
}

// ============================================================================
// 5. Social-Engineering Awareness Scenario Evaluation
// ============================================================================

export type SocEngDecision =
  | 'VERIFIED_AND_APPROVED' // Verified identity through appropriate channel, then approved
  | 'VERIFIED_AND_DENIED'   // Verified identity; determined request is illegitimate
  | 'ESCALATED_TO_SUPERVISOR'
  | 'REPORTED_TO_SOC'
  | 'APPROVED_WITHOUT_VERIFICATION' // Poor decision — granted access without checking
  | 'DENIED_WITHOUT_VERIFICATION'   // Denied but no documentation/escalation
  | 'IGNORED';                      // Failed to act

export type SocEngOutcomeRating = 'EXCELLENT' | 'GOOD' | 'ACCEPTABLE' | 'POOR' | 'CRITICAL_FAILURE';

export interface SocEngScenarioEvaluation {
  readonly evaluationId: string;
  readonly activityId: string;
  readonly scenarioId: string;
  readonly playerDecision: SocEngDecision;
  readonly outcomeRating: SocEngOutcomeRating;
  readonly feedbackText: string;
  readonly consequenceFlags: Readonly<Record<string, WorldFlagValue>>;
  readonly reputationDelta: number;
  readonly evaluatedAtSimTime: number;
}

// ============================================================================
// 6. Physical Security Assessment Findings
// ============================================================================

export type FindingSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';

export type FindingCategory =
  | 'ACCESS_CONTROL'
  | 'VISITOR_MANAGEMENT'
  | 'PHYSICAL_MEDIA'
  | 'CCTV_COVERAGE'
  | 'TAILGATING'
  | 'CLEAN_DESK_POLICY'
  | 'SECURITY_AWARENESS'
  | 'DOCUMENTATION';

export interface PhysicalAssessmentFinding {
  readonly findingId: string;
  readonly activityId: string;
  readonly facilityId: string;
  readonly roomId?: string;
  readonly category: FindingCategory;
  readonly severity: FindingSeverity;
  readonly title: string;
  readonly observationSummary: string;           // What the player observed
  readonly policyReference: string;             // Fictional policy requirement breached
  readonly remediationRecommendation: string;
  readonly linkedObservationIds: readonly string[];
  readonly raisedAtSimTime: number;
  readonly isVerified: boolean;                 // Corroborated by a second observation or NPC
}

export interface PhysicalAssessmentReport {
  readonly reportId: string;
  readonly activityId: string;
  readonly facilityId: string;
  readonly assessorName: string;
  readonly scope: string;
  readonly authorizationReference: string;
  readonly findings: readonly PhysicalAssessmentFinding[];
  readonly executiveSummary: string;
  readonly overallRiskRating: FindingSeverity;
  readonly submittedAtSimTime: number;
  readonly clientFeedback?: string;
}

// ============================================================================
// 7. M21 Interview Question Definitions
// ============================================================================

export interface InterviewQuestion {
  readonly id: string;
  /** Which NPC this question applies to (or '*' for any) */
  readonly targetNpcId: string | '*';
  readonly activityId: string;
  /** Player-facing question text */
  readonly questionText: string;
  /** NPC's response */
  readonly responseText: string;
  /** Reliability of the testimony */
  readonly reliability: TestimonyReliability;
  /** Optional world-flag conditions required for this question to be available */
  readonly requiredFlags?: Readonly<Record<string, WorldFlagValue>>;
  /** Optional flag that must NOT be set */
  readonly prohibitedFlags?: readonly string[];
  /** Minimum NPC relationship score to unlock */
  readonly minRelationship?: number;
  /** World flags set after this question is asked */
  readonly flagsToSet?: Readonly<Record<string, WorldFlagValue>>;
  /** Relationship delta applied after asking */
  readonly relationshipDelta?: number;
  /** Optional evidence ID the NPC mentions */
  readonly evidenceIdMentioned?: string;
  /** Optional contradiction tag */
  readonly potentialContradiction?: string;
  /** The claimed fact (core assertion) */
  readonly claimedFact?: string;
}

// ============================================================================
// 8. In-World Inspectable Object
// ============================================================================

export interface InspectableWorldObject {
  readonly id: string;
  readonly locationId: string;
  readonly displayName: string;
  readonly shortDescription: string;
  /** Full description shown when player examines the object */
  readonly examineDescription: string;
  readonly category: ObservationCategory;
  /** World flag set when this object is examined */
  readonly flagOnExamine: string;
  /** Required flag to make this object available for inspection */
  readonly requiredFlag?: string;
  /** Observation record created when examined */
  readonly observationTemplate: Omit<ObservationRecord, 'id' | 'recordedAtSimTime'>;
}

// ============================================================================
// 9. M21 Simulation State Slice
// ============================================================================

export interface HumanIntelState {
  readonly observations: Readonly<Record<string, ObservationRecord>>;
  readonly interviewSessions: Readonly<Record<string, InterviewSession>>;
  readonly comparisons: Readonly<Record<string, EvidenceComparisonRecord>>;
  readonly conclusions: Readonly<Record<string, M21InvestigativeConclusion>>;
  readonly socEngEvaluations: Readonly<Record<string, SocEngScenarioEvaluation>>;
  readonly assessmentFindings: Readonly<Record<string, PhysicalAssessmentFinding>>;
  readonly assessmentReports: Readonly<Record<string, PhysicalAssessmentReport>>;
  /** Which interview question IDs have been asked (per NPC) */
  readonly askedQuestions: Readonly<Record<string, readonly string[]>>;
}

export function createInitialHumanIntelState(): HumanIntelState {
  return {
    observations: {},
    interviewSessions: {},
    comparisons: {},
    conclusions: {},
    socEngEvaluations: {},
    assessmentFindings: {},
    assessmentReports: {},
    askedQuestions: {},
  };
}
