/**
 * Cyberlife — Shared Fictional Cyber Range Data Models
 *
 * Defines the comprehensive, typed models representing the simulated
 * Marina Tower enterprise infrastructure (Cedarline Insurance & Financial Services).
 *
 * Zero real external network traffic · Zero host access · Purely synthetic fixtures.
 */

export interface FictionalOrganization {
  readonly id: string;
  readonly name: string;
  readonly legalName: string;
  readonly sector: string;
  readonly headquarters: string;
  readonly rootDomain: string;
  readonly primaryContact: string;
  readonly businessUnits: readonly {
    readonly id: string;
    readonly name: string;
    readonly description: string;
    readonly subnetIds: readonly string[];
  }[];
}

export interface FictionalSubnet {
  readonly id: string;
  readonly name: string;
  readonly cidr: string; // e.g. "10.0.4.0/24"
  readonly vlanId: number;
  readonly gatewayIp: string;
  readonly netmask: string;
  readonly zone: 'internal_lan' | 'dmz' | 'management' | 'guest';
  readonly description: string;
}

export type HostRole =
  | 'workstation'
  | 'file_server'
  | 'application_server'
  | 'network_gateway'
  | 'monitoring_system'
  | 'domain_controller';

export type ReachabilityStatus = 'LOCAL_HOST' | 'INTERNAL_LAN' | 'GATEWAY' | 'RESTRICTED_LAN';

export interface FictionalHost {
  readonly id: string;
  readonly hostname: string;
  readonly fqdn: string;
  readonly ipAddress: string;
  readonly macAddress: string;
  readonly subnetId: string;
  readonly role: HostRole;
  readonly roleLabel: string;
  readonly os: string;
  readonly status: 'UP' | 'FILTERED' | 'DOWN';
  readonly reachability: ReachabilityStatus;
  readonly location: string;
  readonly approvedServices: readonly string[];
  readonly description: string;
  readonly requiredTier: 1 | 2;
}

export interface FictionalService {
  readonly id: string;
  readonly hostId: string;
  readonly port: number;
  readonly protocol: 'tcp' | 'udp';
  readonly serviceName: string;
  readonly product: string;
  readonly version: string;
  readonly state: 'OPEN' | 'FILTERED' | 'CLOSED';
  readonly approved: boolean;
  readonly banner?: string;
  readonly expectedPurpose: string;
  readonly securityNotes: string;
}

export interface FictionalUserIdentity {
  readonly id: string;
  readonly username: string;
  readonly displayName: string;
  readonly email: string;
  readonly role: string;
  readonly department: string;
  readonly clearanceTier: 1 | 2;
  readonly groups: readonly string[];
  readonly status: 'ACTIVE' | 'LOCKED' | 'SUSPENDED';
  readonly assignedHostId?: string;
  readonly isServiceAccount: boolean;
}

export type DnsRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'PTR' | 'SRV';

export interface FictionalDnsRecord {
  readonly id: string;
  readonly name: string;
  readonly type: DnsRecordType;
  readonly value: string;
  readonly ttl: number;
  readonly description?: string;
}

export interface FictionalCertificate {
  readonly id: string;
  readonly subjectCn: string;
  readonly issuerCn: string;
  readonly serialNumber: string;
  readonly validFrom: string;
  readonly validTo: string;
  readonly sha256Fingerprint: string;
  readonly keyAlgorithm: string;
  readonly isExpired: boolean;
  readonly isSelfSigned: boolean;
}

export interface SyntheticPacketLayer {
  readonly layerName: string;
  readonly summary: string;
  readonly fields: Record<string, string | number>;
}

export interface SyntheticPacketFrame {
  readonly no: number;
  readonly timestampOffsetSeconds: number;
  readonly timeFormatted: string;
  readonly sourceIp: string;
  readonly destIp: string;
  readonly sourcePort?: number;
  readonly destPort?: number;
  readonly protocol: 'TCP' | 'SMB2' | 'ARP' | 'HTTP' | 'DNS' | 'ICMP';
  readonly lengthBytes: number;
  readonly summaryInfo: string;
  readonly layers: readonly SyntheticPacketLayer[];
  readonly hexDump: readonly string[];
  readonly flags?: readonly string[];
}

export type LogSeverity = 'INFO' | 'NOTICE' | 'WARN' | 'ERROR' | 'CRITICAL';

export interface FictionalLogEntry {
  readonly id: string;
  readonly timestamp: string;
  readonly source: 'auth' | 'system' | 'firewall' | 'app-portal' | 'file-server' | 'edr';
  readonly severity: LogSeverity;
  readonly eventType: string;
  readonly hostId: string;
  readonly user?: string;
  readonly message: string;
  readonly details?: string;
}

export interface FictionalEndpointTelemetry {
  readonly eventId: string;
  readonly timestamp: string;
  readonly hostId: string;
  readonly processId: number;
  readonly parentProcessId: number;
  readonly processName: string;
  readonly commandLine: string;
  readonly executedBy: string;
  readonly sha256Hash: string;
  readonly networkConnection?: {
    readonly destIp: string;
    readonly destPort: number;
    readonly protocol: 'tcp' | 'udp';
  };
}

export interface FictionalVulnerabilityFinding {
  readonly id: string;
  readonly title: string;
  readonly targetHost: string;
  readonly targetService: string;
  readonly cve?: string;
  readonly severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  readonly attackVector: string;
  readonly evidenceId: string;
  readonly rootCause: string;
  readonly remediationAdvice: string;
  readonly discoveredAt: string;
}

export interface FictionalSecurityAlert {
  readonly id: string;
  readonly ruleId: string;
  readonly ruleName: string;
  readonly timestamp: string;
  readonly severity: 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';
  readonly sourceHost: string;
  readonly targetHost: string;
  readonly matchedField: string;
  readonly matchedValue: string;
  readonly status: 'NEW' | 'TRIAGED' | 'DISMISSED' | 'CONFIRMED_INCIDENT';
}

export interface ChainOfCustodyEntry {
  readonly time: string;
  readonly handler: string;
  readonly action: string;
  readonly signature: string;
}

export interface FictionalEvidenceItem {
  readonly id: string;
  readonly title: string;
  readonly source: string;
  readonly collectionTime: string;
  readonly evidenceType: string;
  readonly integrityStatus: 'VERIFIED' | 'UNVERIFIED' | 'TAMPERED';
  readonly hashSha256: string;
  readonly description: string;
  readonly chainOfCustody: readonly ChainOfCustodyEntry[];
  readonly requiredTier: 1 | 2;
  readonly artifactSnippet: readonly string[];
}

export interface FictionalCyberRange {
  readonly organization: FictionalOrganization;
  readonly subnets: readonly FictionalSubnet[];
  readonly hosts: readonly FictionalHost[];
  readonly services: readonly FictionalService[];
  readonly identities: readonly FictionalUserIdentity[];
  readonly dnsRecords: readonly FictionalDnsRecord[];
  readonly certificates: readonly FictionalCertificate[];
  readonly packetFrames: readonly SyntheticPacketFrame[];
  readonly logs: readonly FictionalLogEntry[];
  readonly endpointEvents: readonly FictionalEndpointTelemetry[];
  readonly evidenceItems: readonly FictionalEvidenceItem[];
  readonly vulnerabilityFindings: readonly FictionalVulnerabilityFinding[];
  readonly securityAlerts: readonly FictionalSecurityAlert[];
}
