/**
 * Cyberlife — Milestone 18: Blue Team & Purple Team Defensive Operations Domain Types
 *
 * Defines the authoritative domain types for:
 * 1. Multi-source synthetic security telemetry (auth, network, process, web, privilege, FIM).
 * 2. Sigma-inspired detection rules with distinct severity and confidence.
 * 3. Security alerts with explainable derived priority and triage statuses.
 * 4. Incident investigation workspace with evidence linking and hypothesis tracking.
 * 5. Simulated defensive response actions with consequence modeling and audit logging.
 * 6. Purple Team adversary behavior scenarios, coverage verification, and scorecard.
 * 7. M17 (Red Team) integration adapter contracts and fixture fallback.
 * 8. Playable defensive mission state and ground-truth evaluation.
 *
 * STRICT SAFETY INVARIANT:
 * 100% simulated, in-memory domain models.
 * Zero real external sockets · Zero raw packet sniffing · Zero host execution · Zero live threat feeds.
 */

// ============================================================================
// 1. SYNTHETIC TELEMETRY MODELS
// ============================================================================

export type TelemetryCategory =
  | 'AUTHENTICATION'
  | 'NETWORK_CONNECTION'
  | 'PROCESS_EXECUTION'
  | 'PRIVILEGE_CHANGE'
  | 'WEB_APPLICATION'
  | 'FILE_INTEGRITY';

export type TelemetrySeverity =
  | 'INFORMATIONAL'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'CRITICAL';

export interface ProcessAttributes {
  readonly pid: number;
  readonly ppid: number;
  readonly processName: string;
  readonly commandLine: string;
  readonly parentProcessName: string;
  readonly executablePath: string;
  readonly user: string;
  readonly hashSha256?: string;
}

export interface AuthAttributes {
  readonly userPrincipal: string;
  readonly logonType: 'NETWORK' | 'INTERACTIVE' | 'SERVICE' | 'REMOTE_DESKTOP';
  readonly authStatus: 'SUCCESS' | 'FAILURE';
  readonly failureReason?: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'EXPIRED_PASSWORD' | 'UNAUTHORIZED_IP';
  readonly consecutiveFailures?: number;
  readonly clientIp: string;
}

export interface PrivilegeAttributes {
  readonly userPrincipal: string;
  readonly action: 'IAM_ROLE_ATTACHED' | 'SUDO_EXECUTION' | 'PERMISSION_GRANT' | 'GROUP_MEMBERSHIP_ADDED';
  readonly roleGranted?: string;
  readonly scopeSummary: string;
  readonly isUnsanctionedWildcard: boolean;
}

export interface WebSecurityAttributes {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  readonly uri: string;
  readonly httpStatus: number;
  readonly userAgent: string;
  readonly attackType?: 'PROMPT_INJECTION' | 'SQLI_ATTEMPT' | 'PATH_TRAVERSAL' | 'API_TOKEN_ABUSE';
  readonly payloadSnippet?: string;
}

export interface FileIntegrityAttributes {
  readonly filePath: string;
  readonly changeType: 'MODIFIED' | 'CREATED' | 'DELETED' | 'PERMISSIONS_ALTERED';
  readonly expectedHashSha256?: string;
  readonly actualHashSha256?: string;
  readonly isSystemCritical: boolean;
}

export interface TelemetryEvent {
  readonly id: string;
  readonly simTimestampSeconds: number;
  readonly formattedTime: string; // e.g. "08:14:22"
  readonly category: TelemetryCategory;
  readonly severity: TelemetrySeverity;
  readonly sourceHostId: string;
  readonly sourceIp: string;
  readonly destinationHostId?: string;
  readonly destinationIp?: string;
  readonly destinationPort?: number;
  readonly eventSource: string; // e.g. "sysmon-agent", "auth-daemon", "waf-gateway", "suricata-nids", "auditd-fim"
  readonly title: string;
  readonly summary: string;
  readonly isKnownBenign: boolean;
  readonly tags: readonly string[];
  readonly process?: ProcessAttributes;
  readonly auth?: AuthAttributes;
  readonly privilege?: PrivilegeAttributes;
  readonly web?: WebSecurityAttributes;
  readonly fim?: FileIntegrityAttributes;
  readonly correlatedThreatIndicatorId?: string; // Links to M16 ThreatIndicatorRecord
  readonly correlatedPacketId?: string; // Links to M16 SyntheticTrafficEvent
  readonly associatedEvidenceId?: string; // Links to Narrative Evidence Vault
}

// ============================================================================
// 2. DETECTION RULES & MATCHER MODELS
// ============================================================================

export type DetectionSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface DetectionRule {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly author: string;
  readonly version: string;
  readonly category: TelemetryCategory;
  readonly severity: DetectionSeverity;
  readonly confidenceScore: number; // 0 to 100 (kept conceptually distinct from severity!)
  readonly mitreTechniques: readonly string[];
  readonly isEnabled: boolean;
  readonly queryDefinition: string; // Sigma-like human-readable query representation
  readonly rationale: string; // Pedagogical explanation of why this rule detects attacks
  readonly matchExplanation: (event: TelemetryEvent) => string | null;
  readonly evaluateMatch: (event: TelemetryEvent) => boolean;
}

// ============================================================================
// 3. SECURITY ALERTS & TRIAGE
// ============================================================================

export type AlertTriageStatus =
  | 'NEW'
  | 'UNDER_INVESTIGATION'
  | 'RESOLVED'
  | 'FALSE_POSITIVE';

export type PriorityLevel = 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export interface DerivedPriority {
  readonly level: PriorityLevel;
  readonly score: number; // 0 to 100
  readonly formulaRationale: string;
}

export interface SecurityAlert {
  readonly id: string;
  readonly createdAtSimTime: number;
  readonly formattedTime: string;
  readonly ruleId: string;
  readonly ruleName: string;
  readonly category: TelemetryCategory;
  readonly title: string;
  readonly summary: string;
  readonly severity: DetectionSeverity;
  readonly confidenceScore: number; // 0 to 100
  readonly priority: DerivedPriority;
  readonly affectedHostId: string;
  readonly affectedUser?: string;
  readonly matchingTelemetryIds: readonly string[];
  readonly matchingReason: string;
  readonly mitreTechniques: readonly string[];
  readonly triageStatus: AlertTriageStatus;
  readonly assignedAnalyst?: string;
  readonly triageNotes?: string;
  readonly triageReason?: string;
  readonly triagedAtSimTime?: number;
  readonly deduplicationKey: string;
  readonly associatedEvidenceId?: string;
}

// ============================================================================
// 4. INCIDENT INVESTIGATION WORKSPACE
// ============================================================================

export interface InvestigationHypothesis {
  readonly id: string;
  readonly title: string;
  readonly hypothesisText: string;
  readonly isConfirmedFact: boolean; // Confirmed fact vs unproven hypothesis
  readonly linkedAlertIds: readonly string[];
  readonly linkedTelemetryIds: readonly string[];
  readonly linkedHostIds: readonly string[];
  readonly linkedIndicatorIds: readonly string[];
  readonly createdAtSimTime: number;
}

export interface IncidentReportSubmission {
  readonly incidentTitle: string;
  readonly suspectedAttacker: string;
  readonly primaryVector: string;
  readonly initialCompromisedHostId: string;
  readonly lateralMovementTargetId?: string;
  readonly exfiltrationTargetIp?: string;
  readonly falsePositiveHostId: string; // Fictional SIEM scanner recognition
  readonly confirmedFindingIds: readonly string[];
  readonly appliedResponseActionIds: readonly string[];
  readonly rootCauseSummary: string;
  readonly submittedAtSimTime: number;
}

export interface DefensiveEvaluationResult {
  readonly isApproved: boolean;
  readonly scorePercentage: number; // 0 to 100
  readonly critiqueSummary: string;
  readonly correctActor: boolean;
  readonly correctInitialHost: boolean;
  readonly correctVector: boolean;
  readonly correctFalsePositiveRecognition: boolean;
  readonly responseAdequacyScore: number; // 0 to 100
  readonly evidenceScore: number; // 0 to 100
  readonly feedbackNotes: readonly string[];
}

// ============================================================================
// 5. SIMULATED DEFENSIVE RESPONSES
// ============================================================================

export type DefensiveActionType =
  | 'ISOLATE_ENDPOINT'
  | 'RESTORE_ENDPOINT'
  | 'DISABLE_ACCOUNT'
  | 'RESTRICT_ACCOUNT_PERMISSIONS'
  | 'BLOCK_INDICATOR'
  | 'UNBLOCK_INDICATOR'
  | 'APPLY_CONTAINMENT_POLICY'
  | 'ESCALATE_INCIDENT';

export interface DefensiveResponseAction {
  readonly id: string;
  readonly actionType: DefensiveActionType;
  readonly targetEntityId: string; // e.g. "app-portal-01", "svc-aster", "198.51.100.45"
  readonly targetLabel: string;
  readonly executedAtSimTime: number;
  readonly actor: string; // e.g. "Security Analyst (Player)"
  readonly reason: string;
  readonly isSuccess: boolean;
  readonly consequences: readonly string[];
  readonly auditLogEntry: string;
  readonly affectedEntityIds: readonly string[];
}

// ============================================================================
// 6. PURPLE TEAM ADVERSARY EMULATION & COVERAGE ANALYSIS
// ============================================================================

export type CoverageStatus = 'DETECTED' | 'PARTIALLY_DETECTED' | 'UNDETECTED';

export interface PurpleTeamScenario {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly mitreTechniqueId: string;
  readonly mitreTechniqueName: string;
  readonly tactics: readonly string[];
  readonly targetHostId: string;
  readonly simulatedActor: string;
  readonly generatedTelemetryIds: readonly string[];
  readonly relevantRuleIds: readonly string[];
  readonly expectedDetectionSummary: string;
  readonly gapAnalysisIfMissed: string;
  readonly remediationRecommendation: string;
}

export interface EmulationCoverageResult {
  readonly scenarioId: string;
  readonly status: CoverageStatus;
  readonly matchedRuleIds: readonly string[];
  readonly generatedAlertIds: readonly string[];
  readonly detectionNotes: string;
  readonly executedAtSimTime?: number;
}

export interface PurpleTeamScorecard {
  readonly totalScenarios: number;
  readonly detectedCount: number;
  readonly partialCount: number;
  readonly undetectedCount: number;
  readonly coveragePercentage: number; // 0 to 100
  readonly evaluationNotes: string;
}

// ============================================================================
// 7. M17 INTEGRATION ADAPTER CONTRACT
// ============================================================================

export interface AssessmentEventContract {
  readonly assessmentId: string;
  readonly timestampSeconds: number;
  readonly toolName: string; // e.g. "exploitlab", "nmap_probe", "webproxy_tamper"
  readonly targetHost: string;
  readonly actionType: string;
  readonly success: boolean;
  readonly payloadSummary: string;
  readonly isSyntheticFixture: boolean; // True if falling back to M18 internal fixture
}

export interface RedTeamAssessmentAdapter {
  readonly isM17Available: boolean;
  readonly getSimulatedAssessmentEvents: () => readonly AssessmentEventContract[];
  readonly convertToDefensiveTelemetry: (event: AssessmentEventContract) => TelemetryEvent;
}

// ============================================================================
// 8. PLAYABLE DEFENSIVE MISSION STATE
// ============================================================================

export interface DefensiveMissionObjective {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly hint: string;
  readonly isCompleted: boolean;
  readonly completedAtSimTime?: number;
  readonly requiredAction:
    | 'MONITOR_TELEMETRY'
    | 'TRIAGE_SECURITY_ALERTS'
    | 'DISTINGUISH_FALSE_POSITIVE'
    | 'INVESTIGATE_INCIDENT_TIMELINE'
    | 'PRESERVE_DEFENSIVE_EVIDENCE'
    | 'EXECUTE_DEFENSIVE_RESPONSE'
    | 'VALIDATE_PURPLE_COVERAGE'
    | 'SUBMIT_INCIDENT_REPORT';
}

export interface DefensiveOpsState {
  readonly scenarioId: string;
  readonly title: string;
  readonly activeTab: 'telemetry' | 'rules' | 'alerts' | 'investigation' | 'response' | 'purple' | 'mission';
  readonly telemetryEvents: readonly TelemetryEvent[];
  readonly rules: readonly DetectionRule[];
  readonly alerts: readonly SecurityAlert[];
  readonly selectedAlertId?: string;
  readonly selectedTelemetryId?: string;
  readonly selectedScenarioId?: string;
  readonly hypotheses: readonly InvestigationHypothesis[];
  readonly executedResponses: readonly DefensiveResponseAction[];
  readonly blockedIndicators: readonly string[]; // IP / domain blocks
  readonly isolatedHostIds: readonly string[]; // Isolated endpoints
  readonly lockedUserAccounts: readonly string[]; // Disabled accounts
  readonly objectives: readonly DefensiveMissionObjective[];
  readonly purpleEmulationResults: Readonly<Record<string, EmulationCoverageResult>>;
  readonly incidentSubmission?: IncidentReportSubmission;
  readonly evaluationResult?: DefensiveEvaluationResult;
}
