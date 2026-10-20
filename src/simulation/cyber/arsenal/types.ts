/**
 * Cyberlife — Cybersecurity Arsenal Architecture Types
 *
 * Defines the shared contracts, schemas, and metadata models for all
 * simulated cybersecurity tools across Blue, Red, Purple, Intelligence,
 * Forensics, and Shared disciplines.
 *
 * All operations execute strictly within Cyberlife's deterministic, fictional simulation.
 * Zero host execution · Zero real network sockets · Zero dynamic code execution.
 */

export type TeamTrack = 'blue' | 'red' | 'purple' | 'shared' | 'intelligence';

export type CapabilityStatus = 'playable' | 'partial' | 'reference_only' | 'planned';

export type ToolCategory =
  | 'network_discovery'
  | 'traffic_analysis'
  | 'intelligence_recon'
  | 'attack_simulation'
  | 'app_security'
  | 'blue_team_siem'
  | 'network_detection'
  | 'endpoint_telemetry'
  | 'digital_forensics'
  | 'reverse_engineering'
  | 'detection_engineering'
  | 'purple_team'
  | 'learning_reporting'
  | 'system_utilities';

export type InterfaceMode = 'terminal' | 'gui' | 'both';

export type SafetyConstraint =
  | 'synthetic_only'
  | 'read_only'
  | 'isolated_sandbox'
  | 'clearance_restricted'
  | 'no_host_execution'
  | 'roe_enforced'
  | 'deterministic_seed';

export type EvidenceType =
  | 'network_scan_report'
  | 'pcap_packet_trace'
  | 'siem_event_log'
  | 'cryptographic_hash'
  | 'vulnerability_finding'
  | 'detection_rule'
  | 'decompiled_pseudocode'
  | 'incident_timeline_event'
  | 'forensic_artifact'
  | 'chain_of_custody_record';

export interface InputArgumentRule {
  readonly name: string;
  readonly type: 'string' | 'number' | 'boolean' | 'cidr' | 'ip' | 'port' | 'choice';
  readonly required: boolean;
  readonly description: string;
  readonly default?: unknown;
  readonly choices?: readonly string[];
  readonly validationRegex?: string;
}

export interface InputValidationSchema {
  readonly minArgs?: number;
  readonly maxArgs?: number;
  readonly flags?: readonly {
    readonly flag: string;
    readonly alias?: string;
    readonly type: 'boolean' | 'string' | 'number';
    readonly description: string;
    readonly allowedValues?: readonly string[];
  }[];
  readonly positional?: readonly InputArgumentRule[];
}

export interface SupportedWorkflow {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly actionType:
    'query' | 'scan' | 'inspect' | 'verify' | 'remediate' | 'replay' | 'simulate';
  readonly parameters?: readonly InputArgumentRule[];
  readonly expectedOutput: EvidenceType;
  readonly requiresClearanceTier?: 1 | 2;
}

export interface SimulatedCommandSpec {
  readonly canonicalCommand: string;
  readonly syntax: string;
  readonly aliases: readonly string[];
  readonly examples: readonly string[];
  readonly subcommands?: readonly string[];
}

export interface LearningObjective {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly bloomsLevel: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
}

export interface CyberToolDefinition {
  readonly schemaVersion: '1.0.0';
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly icon: string;
  readonly description: string;
  readonly extendedOverview: string;
  readonly category: ToolCategory;
  readonly categoryLabel: string;
  readonly primaryTeam: TeamTrack;
  readonly supportedTeams: readonly TeamTrack[];
  readonly status: CapabilityStatus;
  readonly targetMilestone: string;
  readonly interfaceMode: InterfaceMode;

  // Educational & Progression
  readonly learningObjectives: readonly LearningObjective[];
  readonly prerequisites: readonly string[];
  readonly requiredClearanceTier: 1 | 2;
  readonly relatedLearningModules: readonly string[];
  readonly relatedExerciseIds: readonly string[];

  // Workflows & Commands
  readonly supportedWorkflows: readonly SupportedWorkflow[];
  readonly commandSpec?: SimulatedCommandSpec;
  readonly inputSchema: InputValidationSchema;

  // Data & Evidence
  readonly outputEvidenceTypes: readonly EvidenceType[];
  readonly syntheticDataSources: readonly string[];
  readonly safetyConstraints: readonly SafetyConstraint[];

  // Cross-References & Limitations
  readonly linkedAppId?: string;
  readonly relatedToolIds: readonly string[];
  readonly realWorldInspiration: string;
  readonly knownLimitations: readonly string[];
  readonly completionEvidenceRequired: string;
}
