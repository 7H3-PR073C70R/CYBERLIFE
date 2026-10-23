/**
 * Cyberlife — Simulation Cyber Tools Contracts & Types
 *
 * Defines the framework contracts for simulated cybersecurity tools:
 * - Deterministic, testable business logic
 * - Zero host OS execution / zero network packets
 * - Clear separation of command parsing, argument validation, access control,
 *   data retrieval, and output formatting
 * - Explicit educational metadata and interpretation guidance
 */

import { TerminalCommandResult, TerminalExecutionContext } from '../terminal/types';

export type AccessTier = 1 | 2; // 1 = Intern / Tier 1 Analyst; 2 = Senior / IR Lead

export interface AccessControlResult {
  allowed: boolean;
  reason?: string;
  requiredTier?: AccessTier;
  currentRole?: string;
}

export type ToolParseResult<TArgs> =
  { success: true; args: TArgs } | { success: false; error: string; hint?: string };

export interface CyberToolMetadata {
  readonly id: string;
  readonly name: string;
  readonly displayName: string;
  readonly description: string;
  readonly learningObjective: string;
  readonly syntax: string;
  readonly examples: readonly string[];
  readonly requiredTier: AccessTier;
}

/**
 * Interface that all simulated cybersecurity tools implement.
 */
export interface CyberTool<TArgs = unknown, TResult = unknown> {
  readonly metadata: CyberToolMetadata;

  /**
   * Parses and validates raw string arguments into a typed argument structure.
   */
  parseArgs(args: readonly string[]): ToolParseResult<TArgs>;

  /**
   * Checks whether the active in-game user persona has the required permission/clearance.
   */
  checkAccess(context: TerminalExecutionContext, args?: TArgs): AccessControlResult;

  /**
   * Pure deterministic execution over in-game simulation data.
   */
  execute(args: TArgs, context: TerminalExecutionContext): TResult;

  /**
   * Formats the typed result into beginner-friendly terminal output with educational guidance.
   */
  formatOutput(
    result: TResult,
    args: TArgs,
    context: TerminalExecutionContext
  ): TerminalCommandResult;
}

// ============================================================================
// Fictional Data Models
// ============================================================================

export type HostRole =
  'workstation' | 'file_server' | 'application_server' | 'network_gateway' | 'monitoring_system';

export type ReachabilityStatus = 'LOCAL_HOST' | 'INTERNAL_LAN' | 'GATEWAY' | 'RESTRICTED_LAN';

export interface FictionalHost {
  readonly id: string; // e.g. "ws-sec-04", "filesrv-01"
  readonly hostname: string; // e.g. "cedarline-sec-ws04.corp.local"
  readonly ipAddress: string; // e.g. "10.0.4.15"
  readonly macAddress: string; // e.g. "00:50:56:a4:01:15"
  readonly role: HostRole;
  readonly roleLabel: string;
  readonly os: string;
  readonly status: 'UP' | 'FILTERED' | 'DOWN';
  readonly reachability: ReachabilityStatus;
  readonly location: string;
  readonly approvedServices: readonly string[];
  readonly description: string;
  readonly requiredTier: AccessTier;
}

export interface FictionalService {
  readonly id: string; // e.g. "svc-filesrv-smb"
  readonly hostId: string;
  readonly port: number;
  readonly protocol: 'tcp' | 'udp';
  readonly serviceName: string;
  readonly product: string;
  readonly version: string;
  readonly state: 'OPEN' | 'FILTERED' | 'CLOSED';
  readonly approved: boolean;
  readonly expectedPurpose: string;
  readonly securityNotes: string;
}

export type LogSeverity = 'INFO' | 'NOTICE' | 'WARN' | 'ERROR';

export interface FictionalLogEntry {
  readonly id: string; // e.g. "LOG-2026-101"
  readonly timestamp: string; // e.g. "07:35:45 AM"
  readonly source: 'auth' | 'system' | 'firewall' | 'app-portal' | 'file-server' | 'siem' | 'sysmon';
  readonly severity: LogSeverity;
  readonly eventType: string;
  readonly hostId: string;
  readonly user?: string;
  readonly message: string;
  readonly details?: string;
  readonly rawCef?: string;
  readonly sysmon?: {
    readonly eventId: number;
    readonly processId?: number;
    readonly image?: string;
    readonly commandLine?: string;
    readonly user?: string;
    readonly parentImage?: string;
    readonly protocol?: string;
    readonly destinationIp?: string;
    readonly destinationPort?: number;
    readonly destinationHostname?: string;
  };
}

export interface ChainOfCustodyEntry {
  readonly time: string;
  readonly handler: string;
  readonly action: string;
  readonly signature: string;
}

export interface FictionalEvidenceItem {
  readonly id: string; // e.g. "EVD-2026-001"
  readonly title: string;
  readonly source: string;
  readonly collectionTime: string;
  readonly evidenceType: string;
  readonly integrityStatus: 'VERIFIED' | 'UNVERIFIED' | 'TAMPERED';
  readonly hashSha256: string;
  readonly description: string;
  readonly chainOfCustody: readonly ChainOfCustodyEntry[];
  readonly requiredTier: AccessTier;
  readonly artifactSnippet: readonly string[];
}
