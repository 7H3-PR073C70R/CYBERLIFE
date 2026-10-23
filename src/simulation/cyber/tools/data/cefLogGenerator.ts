/**
 * Cyberlife — Generic CEF & Sysmon Alert Generator Engine
 *
 * Provides pure serialization functions for Common Event Format (CEF:0)
 * and Microsoft Sysmon telemetry (Event ID 1 Process Create, Event ID 3 Network Connect).
 * Reusable across all narrative episodes.
 *
 * SAFETY INVARIANT:
 * Zero host execution. Pure deterministic string generation.
 */

export interface CefAlertSpec {
  readonly deviceVendor: string;
  readonly deviceProduct: string;
  readonly deviceVersion: string;
  readonly signatureId: string;
  readonly name: string;
  readonly severity: number; // 0-10
  readonly extension: Record<string, string | number | undefined>;
}

export interface SysmonProcessCreateSpec {
  readonly utcTime: string;
  readonly processId: number;
  readonly image: string;
  readonly commandLine: string;
  readonly user: string;
  readonly parentImage: string;
  readonly hashesSha256?: string;
}

export interface SysmonNetworkConnectSpec {
  readonly utcTime: string;
  readonly processId: number;
  readonly image: string;
  readonly user: string;
  readonly protocol: 'tcp' | 'udp';
  readonly initiated: boolean;
  readonly sourceIp: string;
  readonly sourcePort: number;
  readonly destinationIp: string;
  readonly destinationPort: number;
  readonly destinationHostname?: string;
}

/**
 * Formats a specification into standard ArcSight CEF:0 string.
 * Format: CEF:Version|Device Vendor|Device Product|Device Version|Signature ID|Name|Severity|Extension
 */
export function formatCefAlert(spec: CefAlertSpec): string {
  const extParts = Object.entries(spec.extension)
    .filter(([_, val]) => val !== undefined)
    .map(([key, val]) => `${key}=${String(val).replace(/=/g, '\\=')}`);

  return `CEF:0|${spec.deviceVendor}|${spec.deviceProduct}|${spec.deviceVersion}|${spec.signatureId}|${spec.name}|${spec.severity}|${extParts.join(' ')}`;
}

/**
 * Formats a Sysmon Event ID 1 (Process Create) record.
 */
export function formatSysmonEvent1(spec: SysmonProcessCreateSpec): string {
  return [
    'SYSMON EVENT ID: 1 (Process Creation)',
    `  UtcTime:      ${spec.utcTime}`,
    `  ProcessGuid:  {4A91B012-98F1-4D02-BA81-0012CE048120}`,
    `  ProcessId:    ${spec.processId}`,
    `  Image:        ${spec.image}`,
    `  CommandLine:  ${spec.commandLine}`,
    `  User:         ${spec.user}`,
    `  ParentImage:  ${spec.parentImage}`,
    spec.hashesSha256 ? `  Hashes:       SHA256=${spec.hashesSha256}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}

/**
 * Formats a Sysmon Event ID 3 (Network Connection) record.
 */
export function formatSysmonEvent3(spec: SysmonNetworkConnectSpec): string {
  return [
    'SYSMON EVENT ID: 3 (Network Connection Initiated)',
    `  UtcTime:             ${spec.utcTime}`,
    `  ProcessId:           ${spec.processId}`,
    `  Image:               ${spec.image}`,
    `  User:                ${spec.user}`,
    `  Protocol:            ${spec.protocol}`,
    `  Initiated:           ${spec.initiated}`,
    `  SourceIp:            ${spec.sourceIp}`,
    `  SourcePort:          ${spec.sourcePort}`,
    `  DestinationIp:       ${spec.destinationIp}`,
    `  DestinationPort:     ${spec.destinationPort}`,
    spec.destinationHostname ? `  DestinationHostname: ${spec.destinationHostname}` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
