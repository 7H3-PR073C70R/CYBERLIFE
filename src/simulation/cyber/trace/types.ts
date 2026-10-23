/**
 * Cyberlife — Trace & Legal Exposure System: Authoritative Domain Types
 *
 * Defines the domain models for:
 * 1. ActionNoise events emitted by player interactions against simulated targets.
 * 2. Short-term Trace meter (0-100) and deterministic Defender Responses.
 * 3. Long-term Legal Exposure meter (0-100) and narrative milestones.
 * 4. Scope and Rules of Engagement (RoE) validation.
 * 5. Purple-team Defender View debrief timeline and log artifacts.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% in-memory deterministic simulation against fictional targets.
 * Zero real network sockets · Zero real exploit execution.
 */

export type NoiseCategory =
  | 'OSINT_PASSIVE'
  | 'OSINT_DNS'
  | 'RECON_ACTIVE'
  | 'ENUMERATION'
  | 'EXPLOITATION'
  | 'AUTHORIZED_ACCESS'
  | 'UNAUTHORIZED_ACCESS'
  | 'EXFILTRATION'
  | 'CLEANUP';

export type DefenderResponseType =
  | 'RATE_LIMIT'
  | 'HONEYPOT_EXPOSURE'
  | 'SOC_ALERT'
  | 'IP_BLOCK'
  | 'FULL_LOCKOUT';

export type LogArtifactFormat =
  | 'CEF'
  | 'SYSMON'
  | 'SURICATA_JSON'
  | 'NGINX_ACCESS'
  | 'FIREWALL_IPTABLES'
  | 'DNS_QUERY';

export interface ActionNoiseDefinition {
  readonly id: string;
  readonly name: string;
  readonly category: NoiseCategory;
  readonly baseNoise: number; // 0 to 100
  readonly attckTechniqueId: string;
  readonly attckTechniqueName: string;
  readonly logFormat: LogArtifactFormat;
  readonly detectionReason: string;
  readonly opsecMitigation: string;
}

export interface ActionNoiseEvent {
  readonly id: string;
  readonly actionId: string;
  readonly category: NoiseCategory;
  readonly target: string; // e.g. 'app-portal-01' or '10.0.4.15'
  readonly noiseValue: number; // calculated noise after OPSEC modifiers (0-100)
  readonly inScope: boolean;
  readonly timestampSimTime: number;
  readonly generatedLog: string;
  readonly attckTechniqueId: string;
  readonly attckTechniqueName: string;
  readonly detected: boolean;
  readonly detectionReason: string;
  readonly opsecMitigation: string;
}

export interface DefenderResponseEvent {
  readonly id: string;
  readonly type: DefenderResponseType;
  readonly target: string;
  readonly triggeredAtTraceLevel: number;
  readonly timestampSimTime: number;
  readonly message: string;
  readonly logSignature: string;
  readonly isDismissed?: boolean;
}

export interface AuthorizedScopeDefinition {
  readonly jobId: string;
  readonly clientName: string;
  readonly missionName?: string;
  readonly authorizingClient?: string;
  readonly authorizedHosts: readonly string[];
  readonly authorizedPorts: readonly number[];
  readonly allowedCategories?: readonly NoiseCategory[];
  readonly prohibitedTargets: readonly string[];
  readonly validTimeWindow?: {
    readonly startHour: number;
    readonly endHour: number;
  };
  readonly timeWindowStart?: string;
  readonly timeWindowEnd?: string;
  readonly rulesOfEngagement?: readonly string[];
  readonly description: string;
}

export interface ScopeWarning {
  readonly target: string;
  readonly attemptedAction: string;
  readonly reason: string;
  readonly timestampSimTime: number;
  readonly pendingActionPayload: Readonly<Record<string, unknown>>;
}

export interface OpsecModifiers {
  readonly useTor: boolean;
  readonly useVpn: boolean;
  readonly isOffHours: boolean;
  readonly cleanedLogs: boolean;
}

export interface DefenderViewEntry {
  readonly id: string;
  readonly timestampString: string;
  readonly timestampSimTime: number;
  readonly target: string;
  readonly actionName: string;
  readonly logLine: string;
  readonly logFormat: LogArtifactFormat;
  readonly status: 'DETECTED' | 'SUSPICIOUS' | 'MISSED';
  readonly attckTechniqueId: string;
  readonly attckTechniqueName: string;
  readonly blueTeamInsight: string;
  readonly redTeamLesson: string;
}

export interface DefenderViewDebrief {
  readonly jobId: string;
  readonly completedAtSimTime: number;
  readonly finalTraceLevel: number;
  readonly finalLegalExposure: number;
  readonly totalActions: number;
  readonly detectedCount: number;
  readonly entries: readonly DefenderViewEntry[];
  readonly overallVerdict: 'STEALTHY' | 'SURVEILLED' | 'BURNED';
  readonly feedbackSummary: string;
}

export interface TraceSystemState {
  readonly traceMeter: number; // 0 to 100 (short term)
  readonly legalExposureMeter: number; // 0 to 100 (persists across episodes)
  readonly isNightJobActive: boolean;
  readonly activeJobId: string | null;
  readonly activeScope: AuthorizedScopeDefinition | null;
  readonly pendingScopeWarning: ScopeWarning | null;
  readonly opsecModifiers: OpsecModifiers;
  readonly actionHistory: readonly ActionNoiseEvent[];
  readonly activeDefenderResponses: readonly DefenderResponseEvent[];
  readonly taintedEvidenceIds: readonly string[];
  readonly lastDecaySimTime: number;
  readonly storyTriggersFired: readonly string[];
  readonly completedDebriefs: readonly DefenderViewDebrief[];
  readonly activeDebrief: DefenderViewDebrief | null;
}
