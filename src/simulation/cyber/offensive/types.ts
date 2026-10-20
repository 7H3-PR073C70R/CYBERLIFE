/**
 * Cyberlife — Milestone 14: Authorized Offensive Simulation Domain Types
 *
 * Defines the authoritative contracts for safe, deterministic offensive security
 * assessments under explicit Rules of Engagement (RoE).
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated, in-memory domain model.
 * Zero host shell execution · Zero real network sockets · Zero real payload delivery.
 */

import { FictionalEvidenceItem, FictionalVulnerabilityFinding } from '../range/types';
import { RulesOfEngagement, ScopeEvaluationResult } from '../humanPhysical/types';

export type ExploitCategory =
  | 'buffer_bounds'
  | 'auth_bypass'
  | 'unauthenticated_service'
  | 'token_signature_bypass'
  | 'input_injection'
  | 'insecure_direct_object_ref'
  | 'denial_of_service_prohibited';

export type ExploitSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ExploitExecutionMode = 'dry_run' | 'simulation';

export type ExploitResultStatus =
  | 'SUCCESS'
  | 'BLOCKED_OUT_OF_SCOPE'
  | 'BLOCKED_PROHIBITED'
  | 'BLOCKED_UNAUTHORIZED'
  | 'FAILED_PATCHED'
  | 'INCONCLUSIVE';

export interface ExploitLabModule {
  readonly id: string;
  readonly name: string;
  readonly cve: string;
  readonly category: ExploitCategory;
  readonly severity: ExploitSeverity;
  readonly description: string;
  readonly prerequisites: readonly string[];
  readonly requiredClearanceTier: 1 | 2;
  readonly targetService: string;
  readonly defaultPort: number;
  readonly payloadSnippet: string;
  readonly safeTargetRequirement: string;
  readonly dryRunSupported: boolean;
  readonly remediationAdvice: string;
}

export interface OffensiveTargetAsset {
  readonly id: string;
  readonly hostname: string;
  readonly ipAddress: string;
  readonly subnetId: string;
  readonly openPorts: readonly number[];
  readonly primaryService: string;
  readonly osDescription: string;
  readonly isVulnerable: boolean;
  readonly activeVulnerabilities: readonly string[]; // module IDs
  readonly isPatched: boolean;
  readonly appliedRemediations: readonly string[];
  readonly description: string;
}

export interface OffensiveAuditEvent {
  readonly id: string;
  readonly timestamp: string;
  readonly actor: string;
  readonly action: string;
  readonly target: string;
  readonly status: 'AUTHORIZED' | 'SCOPE_VIOLATION' | 'PROHIBITED_VIOLATION' | 'EXPIRED_ROE';
  readonly details: string;
  readonly violationReason?: string;
}

export type RetestStatus = 'NOT_RETESTED' | 'VERIFIED_REMEDIATED' | 'STILL_VULNERABLE';

export interface ExploitExecutionResult {
  readonly executionId: string;
  readonly timestamp: string;
  readonly moduleId: string;
  readonly moduleName: string;
  readonly targetAsset: string;
  readonly targetPort: number;
  readonly mode: ExploitExecutionMode;
  readonly status: ExploitResultStatus;
  readonly scopeEvaluation: ScopeEvaluationResult;
  readonly executionLogs: readonly string[];
  readonly vulnerabilityFinding?: FictionalVulnerabilityFinding;
  readonly evidenceItem?: FictionalEvidenceItem;
  readonly impactDescription: string;
  readonly remediationAdvice: string;
  readonly retestStatus: RetestStatus;
}

export interface RemediationPatch {
  readonly targetId: string;
  readonly moduleId: string;
  readonly patchTitle: string;
  readonly patchDescription: string;
  readonly configChanges: readonly string[];
}

export interface ExploitLabState {
  readonly activeEngagement: RulesOfEngagement;
  readonly targets: readonly OffensiveTargetAsset[];
  readonly modules: readonly ExploitLabModule[];
  readonly findings: readonly FictionalVulnerabilityFinding[];
  readonly executionHistory: readonly ExploitExecutionResult[];
  readonly auditLogs: readonly OffensiveAuditEvent[];
  readonly savedEvidenceIds: readonly string[];
}
