/**
 * Cyberlife — Milestone 16: Network Analysis Domain Types
 *
 * Defines the authoritative domain types for fictional network topologies,
 * synthetic traffic events, protocol layer metadata, and stream queries.
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated, in-memory domain models.
 * Zero real external sockets · Zero raw packet sniffing · Zero host execution.
 */

// ============================================================================
// 1. TOPOLOGY & ASSET MODELS
// ============================================================================

export type NetworkSegmentId =
  | 'seg-corp-lan'
  | 'seg-dmz'
  | 'seg-mgmt-soc'
  | 'seg-isolated-lab'
  | 'seg-external-threat';

export type HostCategory =
  | 'workstation'
  | 'application_server'
  | 'file_server'
  | 'domain_controller'
  | 'dns_server'
  | 'gateway_router'
  | 'monitoring_siem'
  | 'isolated_sandbox'
  | 'external_endpoint';

export interface SimulatedServiceEndpoint {
  readonly port: number;
  readonly protocol: 'tcp' | 'udp';
  readonly name: string;
  readonly product: string;
  readonly version: string;
  readonly isApproved: boolean;
  readonly banner?: string;
  readonly description: string;
}

export interface SimulatedNetworkNode {
  readonly id: string;
  readonly hostname: string;
  readonly fqdn: string;
  readonly ipAddress: string;
  readonly macAddress: string;
  readonly segmentId: NetworkSegmentId;
  readonly organization: string;
  readonly category: HostCategory;
  readonly roleLabel: string;
  readonly os: string;
  readonly status: 'ONLINE' | 'DEGRADED' | 'ISOLATED' | 'OFFLINE';
  readonly location: string;
  readonly services: readonly SimulatedServiceEndpoint[];
  readonly investigationRelevance: 'CRITICAL_TARGET' | 'SUSPICIOUS' | 'ROUTINE_BENIGN' | 'MONITORING';
  readonly description: string;
  readonly icon: string;
  readonly coordinates: { readonly x: number; readonly y: number }; // Relative topology canvas [0..1000]
}

export interface NetworkSegmentDefinition {
  readonly id: NetworkSegmentId;
  readonly name: string;
  readonly cidr: string;
  readonly vlanId: number;
  readonly gatewayIp: string;
  readonly securityZone: 'INTERNAL' | 'DMZ' | 'RESTRICTED' | 'AIR_GAPPED' | 'EXTERNAL_UNTRUSTED';
  readonly description: string;
  readonly color: string;
}

export interface TopologyLink {
  readonly id: string;
  readonly sourceHostId: string;
  readonly targetHostId: string;
  readonly connectionType: 'ETHERNET_TRUNK' | 'LAN_ACCESS' | 'DMZ_FORWARD' | 'VPN_TUNNEL' | 'WAN_EGRESS';
  readonly label: string;
  readonly isEncrypted: boolean;
  readonly isObservedActive: boolean;
}

// ============================================================================
// 2. SYNTHETIC TRAFFIC & CONNECTION MODELS
// ============================================================================

export type ProtocolType = 'TCP' | 'UDP' | 'DNS' | 'HTTP' | 'TLS' | 'SMB2' | 'ARP' | 'ICMP';

export type ConnectionOutcome =
  | 'ESTABLISHED'
  | 'COMPLETED'
  | 'RESET'
  | 'REJECTED'
  | 'TIMEOUT'
  | 'DROPPED';

export type TrafficDirection = 'INBOUND' | 'OUTBOUND' | 'INTERNAL_LATERAL';

export type TrafficClassification =
  | 'BENIGN_ROUTINE'
  | 'BENIGN_ADMIN'
  | 'BENIGN_FALSE_POSITIVE'
  | 'SUSPICIOUS_BEACON'
  | 'SUSPICIOUS_EXFILTRATION'
  | 'UNAUTHORIZED_ACCESS'
  | 'ANOMALOUS_PROTOCOL';

// Protocol-specific metadata models
export interface DnsMetadata {
  readonly queryName: string;
  readonly queryType: 'A' | 'AAAA' | 'TXT' | 'CNAME' | 'PTR' | 'MX';
  readonly responseCode: 'NOERROR' | 'NXDOMAIN' | 'SERVFAIL' | 'REFUSED';
  readonly resolvedRecords: readonly string[];
  readonly ttl: number;
  readonly isHighEntropyTunneling?: boolean;
}

export interface HttpMetadata {
  readonly method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD';
  readonly uri: string;
  readonly statusCode: number;
  readonly statusText: string;
  readonly userAgent: string;
  readonly contentType?: string;
  readonly contentLength?: number;
  readonly requestHeaders?: Readonly<Record<string, string>>;
  readonly responseHeaders?: Readonly<Record<string, string>>;
  readonly payloadSnippet?: string;
}

export interface TlsMetadata {
  readonly sni: string;
  readonly version: 'TLSv1.2' | 'TLSv1.3';
  readonly cipherSuite: string;
  readonly certificateSubject: string;
  readonly certificateIssuer: string;
  readonly certificateFingerprintSha256: string;
  readonly isSelfSigned: boolean;
  readonly ja3Fingerprint?: string;
}

export interface TcpMetadata {
  readonly srcPort: number;
  readonly dstPort: number;
  readonly flags: readonly ('SYN' | 'ACK' | 'FIN' | 'RST' | 'PSH' | 'URG')[];
  readonly sequenceNumber: number;
  readonly ackNumber: number;
  readonly windowSize: number;
  readonly mss?: number;
}

export interface Smb2Metadata {
  readonly command: 'NEGOTIATE' | 'SESSION_SETUP' | 'TREE_CONNECT' | 'CREATE' | 'READ' | 'WRITE' | 'CLOSE';
  readonly sharePath: string;
  readonly filename?: string;
  readonly userPrincipal: string;
  readonly status: 'STATUS_SUCCESS' | 'STATUS_ACCESS_DENIED' | 'STATUS_OBJECT_NAME_NOT_FOUND';
}

export interface UdpMetadata {
  readonly srcPort: number;
  readonly dstPort: number;
  readonly length: number;
  readonly serviceType?: 'NTP' | 'SYSLOG' | 'SNMP' | 'DNS_TRANSPORT';
}

export interface SyntheticTrafficEvent {
  readonly id: string;
  readonly sequenceNo: number;
  readonly simTimestampSeconds: number;
  readonly formattedTime: string; // e.g. "08:14:22.104"
  readonly sourceHostId: string;
  readonly sourceIp: string;
  readonly sourcePort?: number;
  readonly destinationHostId: string;
  readonly destinationIp: string;
  readonly destinationPort?: number;
  readonly protocol: ProtocolType;
  readonly lengthBytes: number;
  readonly direction: TrafficDirection;
  readonly outcome: ConnectionOutcome;
  readonly conversationId: string; // Stream/session grouping
  readonly summaryInfo: string;
  readonly classification: TrafficClassification;
  readonly details: {
    readonly frameLayer: string;
    readonly ethernetLayer: string;
    readonly ipLayer: string;
    readonly transportLayer?: string;
    readonly applicationLayer?: string;
  };
  readonly hexDump: readonly string[];
  readonly dns?: DnsMetadata;
  readonly http?: HttpMetadata;
  readonly tls?: TlsMetadata;
  readonly tcp?: TcpMetadata;
  readonly smb2?: Smb2Metadata;
  readonly udp?: UdpMetadata;
  readonly associatedEvidenceId?: string;
  readonly analystNotes?: string;
  readonly educationalContext?: string; // Pedagogical explanation of why this matters
}

// Conversation stream grouping
export interface TrafficConversation {
  readonly id: string;
  readonly protocol: ProtocolType;
  readonly clientHostId: string;
  readonly clientIp: string;
  readonly serverHostId: string;
  readonly serverIp: string;
  readonly serverPort: number;
  readonly packetCount: number;
  readonly totalBytes: number;
  readonly startSimTime: number;
  readonly endSimTime: number;
  readonly durationSeconds: number;
  readonly classification: TrafficClassification;
  readonly packetIds: readonly string[];
  readonly summarySnippet: string;
}

// Filter and query parameters
export interface TrafficFilterOptions {
  readonly searchQuery?: string;
  readonly protocol?: ProtocolType | 'ALL';
  readonly hostId?: string | 'ALL';
  readonly port?: number;
  readonly outcome?: ConnectionOutcome | 'ALL';
  readonly classification?: TrafficClassification | 'ALL';
  readonly conversationId?: string;
  readonly timeRange?: { readonly minSimTime: number; readonly maxSimTime: number };
}
