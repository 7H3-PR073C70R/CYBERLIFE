/**
 * Cyberlife — Milestone 11: Cybersecurity Catalogue & Team Tracks Types
 *
 * Defines the typed, validated architecture for:
 * - Blue Team (Defenders)
 * - Red Team (Authorized Attack Simulators)
 * - Purple Team (Collaborative Security Improvement & Detection Engineering)
 * - Shared Foundations
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated in-memory domain model using deterministic fictional data.
 * Zero real-world exploits, zero external network scanning, zero operating system commands.
 */

import { SkillId } from '../career/types';

export type CyberTrack = 'blue' | 'red' | 'purple' | 'shared';

export type CyberDiscipline =
  // Blue Team
  | 'soc_operations'
  | 'incident_response'
  | 'network_defense'
  | 'iam_security'
  | 'threat_intel'
  | 'app_cloud_security'
  | 'governance_risk'
  // Red Team
  | 'red_recon'
  | 'vuln_assessment'
  | 'attack_path_analysis'
  | 'social_engineering'
  | 'adversary_emulation'
  | 'red_reporting'
  // Purple Team
  | 'detection_validation'
  | 'detection_engineering'
  | 'attack_mapping'
  | 'collaborative_exercises'
  // Shared
  | 'shared_foundations';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export type CatalogueEntryStatus = 'playable' | 'informational' | 'planned';

export interface AssessmentRubricItem {
  readonly id: string;
  readonly criterion: string;
  readonly weight: number; // 0 to 100 percentage
  readonly description: string;
}

export interface CatalogueEntry {
  readonly id: string;
  readonly track: CyberTrack;
  readonly discipline: CyberDiscipline;
  readonly title: string;
  readonly summary: string;
  readonly description: string;
  readonly whyItMatters: string;
  readonly fictionalScenario: string;
  readonly difficulty: DifficultyLevel;
  readonly learningObjectives: readonly string[];
  readonly requiredKnowledge: readonly string[];
  readonly relevantTools: readonly string[];
  readonly status: CatalogueEntryStatus;
  readonly exerciseId?: string;
  readonly relatedRoleIds: readonly string[];
  readonly prerequisites: readonly string[];
  readonly mitreAttackTechniques?: readonly string[];
  readonly careerSkills?: readonly {
    readonly skillId: SkillId;
    readonly targetLevel: number;
  }[];
  readonly expectedOutputDescription?: string;
  readonly commonMistakes?: readonly string[];
  readonly recoveryGuidance?: string;
}

// ============================================================================
// Practical Exercises Contract
// ============================================================================

export interface ExerciseObjective {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly isCompleted: boolean;
  readonly hint?: string;
}

export interface PracticalExercise {
  readonly id: string;
  readonly catalogueEntryId: string;
  readonly title: string;
  readonly track: CyberTrack;
  readonly scenarioContext: string;
  readonly scopeOfAuthorization: string; // Rules of Engagement / Fictional Scope
  readonly startingHostId: string;
  readonly availableTools: readonly string[];
  readonly expectedActions: readonly string[];
  readonly objectives: readonly ExerciseObjective[];
  readonly rubric: readonly AssessmentRubricItem[];
  readonly debrief: string;
  readonly rewardXp: number;
  readonly rewardKobo: number;
  readonly skillRewards: Partial<Record<SkillId, number>>;
}

// ============================================================================
// Detection Engineering & Purple Team Types
// ============================================================================

export type DetectionRuleField =
  | 'eventType'
  | 'hostId'
  | 'user'
  | 'severity'
  | 'source'
  | 'serviceName'
  | 'port';

export type DetectionRuleOperator = 'EQUALS' | 'CONTAINS' | 'STARTS_WITH';

export interface DetectionRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly enabled: boolean;
  readonly matchField: DetectionRuleField;
  readonly operator: DetectionRuleOperator;
  readonly matchValue: string;
  readonly alertSeverity: 'INFO' | 'WARN' | 'CRITICAL';
  readonly mitreTechnique: string;
  readonly isTuned: boolean; // Flag if player has tuned this rule
}

export interface PurpleScenarioRunResult {
  readonly runId: string;
  readonly scenarioId: string;
  readonly runType: 'baseline' | 'replay';
  readonly timestamp: number;
  readonly detected: boolean;
  readonly timeToDetectSeconds: number | null;
  readonly triggeredRuleId: string | null;
  readonly telemetryRecordsInspected: number;
  readonly falsePositiveCount: number;
  readonly detectionGapIdentified: boolean;
  readonly details: string;
}

export interface RedTeamFinding {
  readonly findingId: string;
  readonly title: string;
  readonly targetHost: string;
  readonly targetService: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly attackVector: string;
  readonly evidenceId: string;
  readonly rootCause: string;
  readonly remediationAdvice: string;
  readonly submittedAt: number;
  readonly isApproved: boolean;
}

// ============================================================================
// Authoritative Simulation State for Catalogue
// ============================================================================

export interface CatalogueSimulationState {
  readonly completedEntryIds: readonly string[];
  readonly completedExerciseIds: readonly string[];
  readonly activeExerciseId: string | null;
  readonly activeExercisePhase?: string;
  readonly activeExerciseState?: Readonly<Record<string, unknown>>;
  readonly detectionRules: readonly DetectionRule[];
  readonly purpleRunHistory: readonly PurpleScenarioRunResult[];
  readonly redFindings: readonly RedTeamFinding[];
  readonly totalExercisesCompleted: number;
}
