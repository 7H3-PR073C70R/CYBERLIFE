/**
 * Cyberlife — Milestone 19: Bounty Hunting, Security Contracts & Freelance Operations Domain Types
 *
 * Defines the authoritative domain types for:
 * 1. Fictional client profiles and verified bug bounty programs.
 * 2. Contract listings, scopes of engagement, authorized assets, and prohibited actions.
 * 3. Prerequisites (career level, skills, faction standing, freelance reputation).
 * 4. Active contract tracking, simulated technical objectives, and scope clarification.
 * 5. Deliverables packaging, evidence vault references, and submission snapshots.
 * 6. Deterministic client evaluation, grading criteria, revision cycles, and payout processing.
 * 7. Freelance reputation, earnings ledger, and career progression.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated, in-memory domain model.
 * Zero external sockets · Zero real host tool execution · Zero live payment services.
 */

import { SkillId } from '../../career/types';
import { FactionId } from '../../narrative/narrativeTypes';

// ============================================================================
// 1. CONTRACT CATEGORIES & STATUS
// ============================================================================

export type ContractCategory =
  | 'CONFIG_AUDIT'
  | 'INVESTIGATION'
  | 'WEB_APP_ASSESSMENT'
  | 'DETECTION_VALIDATION'
  | 'RESEARCH_TRIAGE'
  | 'AMBIGUOUS_SCOPE_DISPUTE';

export type ContractDifficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type ContractStatus =
  | 'AVAILABLE'
  | 'ACTIVE'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUESTED'
  | 'APPROVED'
  | 'REJECTED'
  | 'EXPIRED'
  | 'WITHDRAWN';

export type ReviewOutcome =
  | 'ACCEPTED'
  | 'ACCEPTED_WITH_FEEDBACK'
  | 'REVISION_REQUESTED'
  | 'REJECTED';

// ============================================================================
// 2. CLIENT PROFILES & ORGANIZATIONS
// ============================================================================

export type ClientOrgCategory =
  | 'RETAIL_ENTERPRISE'
  | 'COMMERCIAL_BANK'
  | 'SAAS_PLATFORM'
  | 'MSSP_SECOPS'
  | 'VENTURE_RESEARCH'
  | 'REGULATORY_BODY'
  | 'COMMUNITY_COLLECTIVE';

export interface ClientProfile {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly category: ClientOrgCategory;
  readonly factionId?: FactionId | string;
  readonly isVerifiedProgram: boolean;
  readonly reputationRating: number; // 1.0 to 5.0
  readonly contactPerson: string;
  readonly contactRole: string;
  readonly profileSummary: string;
  readonly websiteDomain: string; // Fictional, e.g. "balogunmerchants.ng"
}

// ============================================================================
// 3. TARGET ASSETS & SCOPE SPECIFICATIONS
// ============================================================================

export interface ContractTargetAsset {
  readonly id: string;
  readonly hostname: string;
  readonly ipAddress: string;
  readonly fqdn: string;
  readonly port: number;
  readonly protocol: 'tcp' | 'udp' | 'http' | 'https';
  readonly serviceName: string;
  readonly environment: 'STAGING_LAB' | 'INTERNAL_ENTERPRISE' | 'DMZ_CLUSTER' | 'OUT_OF_SCOPE_PRODUCTION';
  readonly inScope: boolean;
  readonly scopeJustification: string;
  readonly allowedActions: readonly string[];
  readonly prohibitedActions: readonly string[];
}

export interface ScopeClarificationOption {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly isSafeProfessionalChoice: boolean;
  readonly resultingResolutionNotes: string;
  readonly reputationImpact: number;
}

export interface ScopeOfEngagement {
  readonly authorizedTargets: readonly ContractTargetAsset[];
  readonly outOfScopeTargets: readonly string[]; // Hostnames, subnets, or descriptions
  readonly authorizedActionCategories: readonly string[];
  readonly prohibitedActions: readonly string[];
  readonly hasScopeAmbiguity: boolean;
  readonly ambiguityDescription?: string;
  readonly clarificationOptions?: readonly ScopeClarificationOption[];
}

// ============================================================================
// 4. PREREQUISITES & FINANCIAL TERMS
// ============================================================================

export interface ContractPrerequisites {
  readonly minCareerLevel: number;
  readonly requiredSkills: Readonly<Partial<Record<SkillId, number>>>;
  readonly minFreelanceReputation: number;
  readonly minFactionStanding?: {
    readonly factionId: string;
    readonly minScore: number;
  };
}

export interface ContractFinancialTerms {
  readonly rewardKobo: number; // Always positive integer in kobo
  readonly currency: 'NGN';
  readonly operationalExpensesKobo: number; // e.g. lab compute or proxy token costs
  readonly penaltyKobo: number; // Deducted on abandonment or gross breach
  readonly paymentConditions: string;
}

// ============================================================================
// 5. CONTRACT DEFINITIONS & LISTINGS
// ============================================================================

export interface DeliverableRequirement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly isMandatory: boolean;
  readonly minimumConfidence?: 'CONFIRMED' | 'SUSPECTED';
}

export interface BountyContract {
  readonly id: string;
  readonly title: string;
  readonly category: ContractCategory;
  readonly client: ClientProfile;
  readonly problemStatement: string;
  readonly businessContext: string;
  readonly difficulty: ContractDifficulty;
  readonly estimatedEffortMinutes: number;
  readonly prerequisites: ContractPrerequisites;
  readonly financialTerms: ContractFinancialTerms;
  readonly scope: ScopeOfEngagement;
  readonly acceptanceCriteria: readonly string[];
  readonly requiredDeliverables: readonly DeliverableRequirement[];
  readonly deadlineSeconds?: number;
  readonly initialObjectives: readonly ContractObjectiveTemplate[];
}

export interface ContractObjectiveTemplate {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly requiredAction: string;
  readonly targetAssetId?: string;
  readonly hint: string;
}

// ============================================================================
// 6. ACTIVE CONTRACT STATE & SIMULATED TECHNICAL ACTIONS
// ============================================================================

export interface ContractObjective {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly requiredAction: string;
  readonly targetAssetId?: string;
  readonly hint: string;
  readonly isCompleted: boolean;
  readonly completedAtSimTime?: number;
}

export interface ContractAuditEvent {
  readonly id: string;
  readonly timestampSimTime: number;
  readonly actionName: string;
  readonly targetResource: string;
  readonly decision: 'AUTHORIZED' | 'BLOCKED_OUT_OF_SCOPE' | 'BLOCKED_PROHIBITED' | 'BLOCKED_AMBIGUOUS_SCOPE';
  readonly details: string;
  readonly violationRecorded: boolean;
}

export interface ContractFinding {
  readonly id: string;
  readonly title: string;
  readonly affectedComponent: string;
  readonly severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  readonly confidence: 'CONFIRMED' | 'SUSPECTED' | 'BENIGN_FALSE_POSITIVE';
  readonly description: string;
  readonly proofOfConceptOrObservation: string;
  readonly remediationRecommendation: string;
}

export interface ContractSubmissionDraft {
  readonly executiveSummary: string;
  readonly methodologyNotes: string;
  readonly findings: readonly ContractFinding[];
  readonly linkedEvidenceIds: readonly string[];
  readonly scopeComplianceAffirmed: boolean;
  readonly riskImpactSummary: string;
  readonly remediationRecommendations: readonly string[];
  readonly remainingUncertainties: string;
}

export interface ContractSubmissionReport {
  readonly submissionId: string;
  readonly contractId: string;
  readonly submittedAtSimTime: number;
  readonly revisionNumber: number;
  readonly executiveSummary: string;
  readonly methodologyNotes: string;
  readonly findings: readonly ContractFinding[];
  readonly linkedEvidenceIds: readonly string[];
  readonly scopeComplianceAffirmed: boolean;
  readonly riskImpactSummary: string;
  readonly remediationRecommendations: readonly string[];
  readonly remainingUncertainties: string;
}

export interface AcceptanceCheckResult {
  readonly checkName: string;
  readonly passed: boolean;
  readonly feedback: string;
}

export interface ClientReviewResult {
  readonly reviewId: string;
  readonly contractId: string;
  readonly outcome: ReviewOutcome;
  readonly reviewedAtSimTime: number;
  readonly revisionNumber: number;
  readonly overallScore: number; // 0 to 100
  readonly clientFeedbackTitle: string;
  readonly clientFeedbackBody: string;
  readonly itemizedChecks: readonly AcceptanceCheckResult[];
  readonly payoutKobo: number;
  readonly careerXpAwarded: number;
  readonly freelanceReputationDelta: number;
  readonly factionStandingDelta?: {
    readonly factionId: string;
    readonly delta: number;
  };
  readonly payoutProcessed: boolean;
}

export interface ActiveContractState {
  readonly contractId: string;
  readonly status: ContractStatus;
  readonly acceptedAtSimTime: number;
  readonly acceptedScopeVersion: number;
  readonly deadlineSimTime?: number;
  readonly objectives: readonly ContractObjective[];
  readonly scopeClarified: boolean;
  readonly scopeClarificationNotes?: string;
  readonly activeDraft: ContractSubmissionDraft;
  readonly submittedReportSnapshot?: ContractSubmissionReport;
  readonly latestReviewResult?: ClientReviewResult;
  readonly revisionCount: number;
  readonly auditEvents: readonly ContractAuditEvent[];
}

// ============================================================================
// 7. FREELANCE REPUTATION & CONTRACT HISTORY
// ============================================================================

export type FreelanceTier = 'ROOKIE' | 'VERIFIED' | 'SPECIALIST' | 'ELITE' | 'MASTER';

export interface FreelanceReputationState {
  readonly score: number; // 0 to 1000, starts at 100
  readonly tier: FreelanceTier;
  readonly completedContractsCount: number;
  readonly successfulDisclosuresCount: number;
  readonly revisionsCompletedCount: number;
  readonly scopeViolationsCount: number;
  readonly totalEarningsKobo: number;
  readonly clientRatingAverage: number; // 0 to 5.0
}

export interface ClientReviewRecord {
  readonly contractId: string;
  readonly contractTitle: string;
  readonly clientName: string;
  readonly outcome: ReviewOutcome;
  readonly completedAtSimTime: number;
  readonly payoutKobo: number;
  readonly reputationDelta: number;
  readonly overallScore: number;
  readonly feedbackSummary: string;
}

// ============================================================================
// 8. BOUNTY HUB STATE
// ============================================================================

export type BountyAppTab =
  | 'marketplace'
  | 'activeContract'
  | 'submissionStudio'
  | 'reviewDebrief'
  | 'reputationLedger';

export type ContractCategoryFilter = 'ALL' | ContractCategory;

export interface BountyHubState {
  readonly contracts: readonly BountyContract[];
  readonly activeContract?: ActiveContractState;
  readonly completedContractHistory: readonly ClientReviewRecord[];
  readonly reputation: FreelanceReputationState;
  readonly selectedContractId: string;
  readonly categoryFilter: ContractCategoryFilter;
  readonly activeTab: BountyAppTab;
}
