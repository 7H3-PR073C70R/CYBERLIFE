/**
 * Cyberlife — Milestone 14: Data-Driven Narrative Architecture Types
 *
 * Defines the authoritative domain types for story arcs, chapters, narrative missions,
 * factions, faction standings, evidence preservation, and investigative conclusions.
 */

import { WorldFlagValue } from '../core/types';

// ============================================================================
// FACTIONS & REPUTATION
// ============================================================================

export type FactionId =
  | 'faction_cedarline'
  | 'faction_eko_bank'
  | 'faction_krest_ir'
  | 'faction_0xlagos'
  | 'faction_inquirer'
  | 'faction_crcii'
  | 'faction_balogun_traders'
  | 'faction_ndsrc';

export type FactionStandingBand =
  | 'HOSTILE'     // -100 to -50
  | 'DISTRUSTED'  // -49 to -15
  | 'NEUTRAL'     // -14 to +14
  | 'FAVORED'     // +15 to +49
  | 'ALLIED';     // +50 to +100

export interface FactionStandingHistoryEntry {
  readonly delta: number;
  readonly reason: string;
  readonly timestamp: number;
}

export interface FactionStandingState {
  readonly factionId: string;
  readonly standing: number; // -100 to +100
  readonly band: FactionStandingBand;
  readonly history: readonly FactionStandingHistoryEntry[];
}

export interface FactionDefinition {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly category: 'CORPORATE' | 'FINANCIAL' | 'MSSP' | 'COMMUNITY' | 'MEDIA' | 'CIVIL_SOCIETY' | 'REGULATORY';
  readonly description: string;
  readonly headquartersLocationId: string;
  readonly initialStanding: number;
  readonly alliedFactionIds: readonly string[];
  readonly rivalFactionIds: readonly string[];
  readonly perksSummary: readonly string[];
}

// ============================================================================
// INVESTIGATIVE EVIDENCE & CONCLUSIONS
// ============================================================================

export type InvestigativeConclusionType =
  | 'PROCEDURAL_FAULT'         // Marcus/admin error under pressure
  | 'MALICIOUS_INTRUSION'       // Targeted prompt injection & data exfiltration
  | 'SUPPLY_CHAIN_TAMPERING'    // Compromised third-party agent weights or APIs
  | 'EXECUTIVE_COVERUP'         // Management rushed launch, concealed vulnerability
  | 'WHISTLEBLOWER_FORCED_AUDIT'; // Insider deliberately triggered alert to force external audit

export interface InvestigativeConclusion {
  readonly id: string;
  readonly arcId: string;
  readonly title: string;
  readonly hypothesis: string;
  readonly requiredEvidenceIds: readonly string[];
  readonly corroboratingLogIds: readonly string[];
  readonly validatingRole: 'BLUE_DEFENDER' | 'PURPLE_ENGINEER' | 'RED_SIMULATOR' | 'INDEPENDENT_INVESTIGATOR';
  readonly confidenceScore: number; // 0 to 100
  readonly conclusionType: InvestigativeConclusionType;
  readonly submittedAtSimTime?: number;
  readonly submittedToFactionId?: string;
}

export interface EvidenceVaultItem {
  readonly evidenceId: string;
  readonly source: string;
  readonly title: string;
  readonly description: string;
  readonly hash: string; // Cryptographic SHA-256 fingerprint
  readonly collectedAtSimTime: number;
  readonly integrityVerified: boolean;
  readonly tags: readonly string[];
}

// ============================================================================
// NARRATIVE OBJECTIVES & MISSIONS
// ============================================================================

export type NarrativeObjectiveType =
  | 'INVESTIGATE_EVIDENCE'
  | 'INTERVIEW_WITNESS'
  | 'AUDIT_CREDENTIALS'
  | 'CONTAIN_SERVICE'
  | 'REMEDIATE_POLICY'
  | 'RUN_VERIFICATION'
  | 'PUBLISH_DISCLOSURE'
  | 'SECURE_PHYSICAL_ACCESS';

export interface NarrativeObjectiveDefinition {
  readonly id: string;
  readonly type: NarrativeObjectiveType;
  readonly title: string;
  readonly description: string;
  readonly hint?: string;
  readonly targetId?: string;
  readonly requiredEvidenceIds?: readonly string[];
  readonly alternativeObjectiveId?: string;
  readonly isOptional?: boolean;
  readonly failureRecoveryDescription?: string;
}

export interface NarrativePrerequisites {
  readonly requiredFlags?: Readonly<Record<string, WorldFlagValue>>;
  readonly forbiddenFlags?: readonly string[];
  readonly minCareerLevel?: number;
  readonly requiredCompletedJobId?: string;
  readonly minSkillLevel?: { readonly skillId: string; readonly level: number };
  readonly requiredFactionStanding?: { readonly factionId: string; readonly minStanding: number };
  readonly requiredEvidenceIds?: readonly string[];
  readonly clearanceLevelRequired?: number;
  readonly allowedSubnets?: readonly string[];
}

export interface NarrativeConsequences {
  readonly setFlags?: Readonly<Record<string, WorldFlagValue>>;
  readonly factionStandingDeltas?: Readonly<Record<string, number>>;
  readonly relationshipDeltas?: Readonly<Record<string, number>>;
  readonly rewardXp?: number;
  readonly rewardKobo?: number;
  readonly unlockJobIds?: readonly string[];
  readonly grantEvidenceIds?: readonly string[];
}

export interface NarrativeMissionDefinition {
  readonly id: string;
  readonly chapterId: string;
  readonly title: string;
  readonly summary: string;
  readonly briefing: string;
  readonly assignedFactionId?: string;
  readonly investigativeRole?: 'BLUE_DEFENDER' | 'PURPLE_ENGINEER' | 'RED_SIMULATOR' | 'INDEPENDENT_INVESTIGATOR';
  readonly prerequisites?: NarrativePrerequisites;
  readonly clearanceLevelRequired?: number;
  readonly allowedSubnets?: readonly string[];
  readonly objectives: readonly NarrativeObjectiveDefinition[];
  readonly failureRecoveryBranchMissionId?: string;
  readonly consequences: NarrativeConsequences;
}

// ============================================================================
// CHAPTERS & STORY ARCS
// ============================================================================

export interface BranchingPathDefinition {
  readonly conditionFlags: readonly string[];
  readonly nextChapterId: string;
  readonly description: string;
}

export interface StoryChapterDefinition {
  readonly id: string;
  readonly arcId: string;
  readonly chapterNumber: number;
  readonly title: string;
  readonly synopsis: string;
  readonly missionIds: readonly string[];
  readonly branchingPaths?: readonly BranchingPathDefinition[];
}

export interface StoryArcDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly category: 'CORE_MYSTERY' | 'CAREER_FACTION' | 'COMMUNITY_OPTIONAL';
  readonly chapterIds: readonly string[];
  readonly prerequisites?: NarrativePrerequisites;
  readonly completionRewards: NarrativeConsequences;
}

// ============================================================================
// NARRATIVE SIMULATION STATE
// ============================================================================

export interface NarrativeState {
  readonly activeArcId: string | null;
  readonly completedArcIds: readonly string[];
  readonly activeChapterId: string | null;
  readonly completedChapterIds: readonly string[];
  readonly activeMissionIds: readonly string[];
  readonly completedMissionIds: readonly string[];
  readonly failedMissionIds: readonly string[];
  readonly completedObjectiveIds: readonly string[];
  readonly factions: Readonly<Record<string, FactionStandingState>>;
  readonly evidenceVault: Readonly<Record<string, EvidenceVaultItem>>;
  readonly discoveredConclusions: readonly string[];
  readonly submittedConclusions: readonly string[];
  readonly narrativeFlags: Readonly<Record<string, WorldFlagValue>>;
}
