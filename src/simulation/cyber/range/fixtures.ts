/**
 * Cyberlife : Shared Fictional Cyber Range Fixtures
 *
 * Provides a unified, deterministic representation of the Cedarline Services
 * enterprise infrastructure on Lagos Island (Marina Tower).
 *
 * Consolidates synthetic hosts, services, subnets, identities, logs, PCAP packets,
 * and forensic evidence for cross-tool reuse without data duplication.
 */

import {
  FictionalCyberRange,
  FictionalOrganization,
  FictionalSubnet,
  FictionalHost,
  FictionalService,
  FictionalUserIdentity,
  FictionalDnsRecord,
  FictionalCertificate,
  SyntheticPacketFrame,
  FictionalLogEntry,
  FictionalEndpointTelemetry,
  FictionalVulnerabilityFinding,
  FictionalSecurityAlert,
} from './types';
import { FICTIONAL_HOSTS } from '../tools/data/fictionalHosts';
import { FICTIONAL_SERVICES } from '../tools/data/fictionalServices';
import { FICTIONAL_LOGS } from '../tools/data/fictionalLogs';
import { FICTIONAL_EVIDENCE } from '../tools/data/fictionalEvidence';

export const CEDARLINE_ORGANIZATION: FictionalOrganization = {
  id: 'org-cedarline',
  name: 'Cedarline Services Ltd',
  legalName: 'Cedarline Insurance & Financial Services Plc',
  sector: 'Financial Technology & Commercial Insurance',
  headquarters: 'Marina Tower, 4th–6th Floors, Marina Street, Lagos Island, Nigeria',
  rootDomain: 'cedarline.corp.local',
  primaryContact: 'secops@cedarline.corp.local',
  businessUnits: [
    {
      id: 'bu-secops',
      name: 'Security Operations & Incident Response',
      description: '24/7 Security Operations Center monitoring Marina Tower cluster.',
      subnetIds: ['subnet-corp-lan', 'subnet-mgmt'],
    },
    {
      id: 'bu-finance',
      name: 'Finance & Treasury',
      description: 'Departmental billing, payroll calculation, and banking integration.',
      subnetIds: ['subnet-corp-lan'],
    },
    {
      id: 'bu-tech',
      name: 'Core Systems & Infrastructure',
      description: 'Enterprise portals, AI agent platforms, and file services.',
      subnetIds: ['subnet-corp-lan', 'subnet-dmz'],
    },
  ],
};

export const FICTIONAL_SUBNETS: readonly FictionalSubnet[] = [
  {
    id: 'subnet-corp-lan',
    name: 'Marina Tower Internal Corporate LAN',
    cidr: '10.0.4.0/24',
    vlanId: 40,
    gatewayIp: '10.0.4.1',
    netmask: '255.255.255.0',
    zone: 'internal_lan',
    description: 'Workstations, file servers, and internal application hosts on Floors 3–6.',
  },
  {
    id: 'subnet-dmz',
    name: 'Marina DMZ & Extranet Portal',
    cidr: '10.0.1.0/24',
    vlanId: 10,
    gatewayIp: '10.0.1.1',
    netmask: '255.255.255.0',
    zone: 'dmz',
    description: 'Customer-facing insurance quote portal and reverse proxy gateways.',
  },
  {
    id: 'subnet-mgmt',
    name: 'Hardened SOC & Management Subnet',
    cidr: '10.0.99.0/24',
    vlanId: 99,
    gatewayIp: '10.0.99.1',
    netmask: '255.255.255.0',
    zone: 'management',
    description: 'Isolated out-of-band server management and forensic vault storage.',
  },
];

// Enrich hosts with explicit subnet and FQDN references
export const ENRICHED_HOSTS: readonly FictionalHost[] = FICTIONAL_HOSTS.map(h => ({
  ...h,
  subnetId: 'subnet-corp-lan',
  fqdn: h.hostname.includes('.') ? h.hostname : `${h.hostname}.corp.local`,
}));

export const FICTIONAL_IDENTITIES: readonly FictionalUserIdentity[] = [
  {
    id: 'usr-adebayo',
    username: 'analyst',
    displayName: 'Protector',
    email: 'tade.adebayo@cedarline.corp.local',
    role: 'Tier 1 SOC Analyst (Intern)',
    department: 'Security Operations',
    clearanceTier: 1,
    groups: ['secops-analysts', 'domain-users'],
    status: 'ACTIVE',
    assignedHostId: 'ws-sec-04',
    isServiceAccount: false,
  },
  {
    id: 'usr-okafor',
    username: 'chidi.okafor',
    displayName: 'Michael',
    email: 'chidi.okafor@cedarline.corp.local',
    role: 'Lead Incident Responder & SecOps Commander',
    department: 'Security Operations',
    clearanceTier: 2,
    groups: ['secops-leads', 'incident-commanders', 'domain-admins'],
    status: 'ACTIVE',
    assignedHostId: 'ws-sec-01',
    isServiceAccount: false,
  },
  {
    id: 'usr-alabi',
    username: 'folake.alabi',
    displayName: 'Anjola',
    email: 'folake.alabi@cedarline.corp.local',
    role: 'Director of Accounting & Treasury',
    department: 'Finance & Treasury',
    clearanceTier: 1,
    groups: ['finance-execs', 'payroll-approvers', 'domain-users'],
    status: 'ACTIVE',
    assignedHostId: 'ws-finance-02',
    isServiceAccount: false,
  },
  {
    id: 'usr-svc-aster',
    username: 'svc-aster',
    displayName: 'Aster AI Assistant Service Principal',
    email: 'svc-aster-daemon@cedarline.corp.local',
    role: 'Automated Application Service Principal',
    department: 'Core Systems',
    clearanceTier: 2,
    groups: ['service-accounts', 'share-readers', 'app-portal-operators'],
    status: 'ACTIVE',
    assignedHostId: 'app-portal-01',
    isServiceAccount: true,
  },
  {
    id: 'usr-nwosu',
    username: 'emeka.nwosu',
    displayName: 'Emeka Nwosu',
    email: 'emeka.nwosu@cedarline.corp.local',
    role: 'Senior Systems & Network Administrator',
    department: 'Core Infrastructure',
    clearanceTier: 2,
    groups: ['infrastructure-admins', 'domain-admins'],
    status: 'ACTIVE',
    isServiceAccount: false,
  },
];

export const FICTIONAL_DNS_RECORDS: readonly FictionalDnsRecord[] = [
  {
    id: 'dns-01',
    name: 'cedarline.corp.local',
    type: 'A',
    value: '10.0.4.1',
    ttl: 3600,
    description: 'Internal domain root resolving to Marina core gateway.',
  },
  {
    id: 'dns-02',
    name: 'filesrv-01.corp.local',
    type: 'A',
    value: '10.0.4.50',
    ttl: 3600,
    description: 'Central Samba departmental file repository.',
  },
  {
    id: 'dns-03',
    name: 'app-portal-01.corp.local',
    type: 'A',
    value: '10.0.4.10',
    ttl: 3600,
    description: 'Internal employee intranet & Aster AI assistant host.',
  },
  {
    id: 'dns-04',
    name: 'mon-siem-01.corp.local',
    type: 'A',
    value: '10.0.4.5',
    ttl: 3600,
    description: 'Cedarline central SIEM log collector and alert hub.',
  },
  {
    id: 'dns-05',
    name: 'secops.cedarline.corp.local',
    type: 'CNAME',
    value: 'mon-siem-01.corp.local',
    ttl: 3600,
    description: 'Convenience alias for analyst browser portal.',
  },
  {
    id: 'dns-06',
    name: 'cedarline.corp.local',
    type: 'TXT',
    value: 'v=spf1 ip4:10.0.1.0/24 -all',
    ttl: 86400,
    description: 'Simulated SPF record for anti-spoofing lab exercises.',
  },
];

export const FICTIONAL_CERTIFICATES: readonly FictionalCertificate[] = [
  {
    id: 'cert-cedarline-ca',
    subjectCn: 'Cedarline Internal Enterprise Root CA',
    issuerCn: 'Cedarline Internal Enterprise Root CA',
    serialNumber: '4C:91:A8:12:00:01',
    validFrom: '2025-01-01 00:00:00 UTC',
    validTo: '2035-01-01 00:00:00 UTC',
    sha256Fingerprint: '9c58b193f4128f645a4a11b65e94b29ad57112ea11b85f26938dc462ba94a320',
    keyAlgorithm: 'RSA 4096 / SHA-256',
    isExpired: false,
    isSelfSigned: true,
  },
  {
    id: 'cert-app-portal',
    subjectCn: 'app-portal-01.corp.local',
    issuerCn: 'Cedarline Internal Enterprise Root CA',
    serialNumber: '4C:91:A8:12:00:84',
    validFrom: '2026-01-15 00:00:00 UTC',
    validTo: '2027-01-15 00:00:00 UTC',
    sha256Fingerprint: '3b821a4f0288cd74ef9a18012489ac4758b91920dfa5e849921bc8201ad98214',
    keyAlgorithm: 'ECDSA P-384 / SHA-256',
    isExpired: false,
    isSelfSigned: false,
  },
];

export const SYNTHETIC_PACKET_FRAMES: readonly SyntheticPacketFrame[] = [
  {
    no: 1,
    timestampOffsetSeconds: 0.0,
    timeFormatted: '0.000000',
    sourceIp: '10.0.4.15',
    destIp: '10.0.4.1',
    protocol: 'ARP',
    lengthBytes: 42,
    summaryInfo: 'Who has 10.0.4.1? Tell 10.0.4.15',
    layers: [
      {
        layerName: 'Frame 1',
        summary: '42 bytes on wire (336 bits), 42 bytes captured on interface eth0',
        fields: { bytes: 42, interface: 'eth0' },
      },
      {
        layerName: 'Ethernet II',
        summary: 'Src: 02:42:0a:00:04:0f, Dst: ff:ff:ff:ff:ff:ff (Broadcast)',
        fields: { src: '02:42:0a:00:04:0f', dst: 'ff:ff:ff:ff:ff:ff' },
      },
      {
        layerName: 'Address Resolution Protocol (request)',
        summary: 'Sender IP: 10.0.4.15, Target IP: 10.0.4.1',
        fields: { senderIp: '10.0.4.15', targetIp: '10.0.4.1' },
      },
    ],
    hexDump: [
      '0000  ff ff ff ff ff ff 02 42  0a 00 04 0f 08 06 00 01  .......B........',
      '0010  08 00 06 04 00 01 02 42  0a 00 04 0f 0a 00 04 0f  .......B........',
      '0020  00 00 00 00 00 00 0a 00  04 01                    ..........',
    ],
  },
  {
    no: 2,
    timestampOffsetSeconds: 0.000842,
    timeFormatted: '0.000842',
    sourceIp: '10.0.4.1',
    destIp: '10.0.4.15',
    protocol: 'ARP',
    lengthBytes: 42,
    summaryInfo: '10.0.4.1 is at 02:42:0a:00:04:01',
    layers: [
      {
        layerName: 'Frame 2',
        summary: '42 bytes on wire (336 bits), 42 bytes captured on interface eth0',
        fields: { bytes: 42, interface: 'eth0' },
      },
      {
        layerName: 'Ethernet II',
        summary: 'Src: 02:42:0a:00:04:01, Dst: 02:42:0a:00:04:0f',
        fields: { src: '02:42:0a:00:04:01', dst: '02:42:0a:00:04:0f' },
      },
      {
        layerName: 'Address Resolution Protocol (reply)',
        summary: 'Sender MAC: 02:42:0a:00:04:01, Sender IP: 10.0.4.1',
        fields: { senderMac: '02:42:0a:00:04:01', senderIp: '10.0.4.1' },
      },
    ],
    hexDump: [
      '0000  02 42 0a 00 04 0f 02 42  0a 00 04 01 08 06 00 01  .B.....B........',
      '0010  08 00 06 04 00 02 02 42  0a 00 04 01 0a 00 04 01  .......B........',
      '0020  02 42 0a 00 04 0f 0a 00  04 0f                    .B........',
    ],
  },
  {
    no: 3,
    timestampOffsetSeconds: 0.01241,
    timeFormatted: '0.012410',
    sourceIp: '10.0.4.10',
    destIp: '10.0.4.20',
    sourcePort: 51204,
    destPort: 445,
    protocol: 'TCP',
    lengthBytes: 74,
    summaryInfo: '51204 → 445 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM',
    layers: [
      {
        layerName: 'Frame 3',
        summary: '74 bytes on wire (592 bits), 74 bytes captured on interface eth0',
        fields: { bytes: 74 },
      },
      {
        layerName: 'IPv4',
        summary: 'Src: 10.0.4.10 (app-portal-01), Dst: 10.0.4.20 (filesrv-01), TTL: 64',
        fields: { src: '10.0.4.10', dst: '10.0.4.20', ttl: 64 },
      },
      {
        layerName: 'TCP',
        summary: 'Src Port: 51204, Dst Port: 445 (microsoft-ds), Seq: 0, Flags: [SYN]',
        fields: { srcPort: 51204, dstPort: 445, flags: 'SYN' },
      },
    ],
    hexDump: [
      '0000  02 42 0a 00 04 14 02 42  0a 00 04 0a 08 00 45 00  .B.....B......E.',
      '0010  00 3c a1 2f 40 00 40 06  b7 81 0a 00 04 0a 0a 00  .<./@.@.........',
      '0020  04 14 c8 04 01 bd 3f 41  2b 9a 00 00 00 00 a0 02  ......?A+.......',
      '0030  fa f0 31 2a 00 00 02 04  05 b4 04 02 08 0a 12 34  ..1*...........4',
    ],
  },
  {
    no: 4,
    timestampOffsetSeconds: 0.01289,
    timeFormatted: '0.012890',
    sourceIp: '10.0.4.20',
    destIp: '10.0.4.10',
    sourcePort: 445,
    destPort: 51204,
    protocol: 'TCP',
    lengthBytes: 74,
    summaryInfo: '445 → 51204 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460',
    layers: [
      {
        layerName: 'Frame 4',
        summary: '74 bytes on wire (592 bits), 74 bytes captured on interface eth0',
        fields: { bytes: 74 },
      },
      {
        layerName: 'TCP',
        summary: 'Src Port: 445, Dst Port: 51204, Flags: [SYN, ACK]',
        fields: { srcPort: 445, dstPort: 51204, flags: 'SYN,ACK' },
      },
    ],
    hexDump: [
      '0000  02 42 0a 00 04 0a 02 42  0a 00 04 14 08 00 45 00  .B.....B......E.',
      '0010  00 3c 11 90 40 00 40 06  47 21 0a 00 04 14 0a 00  .<..@.@.G!......',
      '0020  04 0a 01 bd c8 04 88 12  91 00 3f 41 2b 9b a0 12  ..........?A+...',
    ],
  },
  {
    no: 5,
    timestampOffsetSeconds: 0.01312,
    timeFormatted: '0.013120',
    sourceIp: '10.0.4.10',
    destIp: '10.0.4.20',
    sourcePort: 51204,
    destPort: 445,
    protocol: 'SMB2',
    lengthBytes: 128,
    summaryInfo: 'SMB2 Negotiate Protocol Request',
    layers: [
      {
        layerName: 'Frame 5',
        summary: '128 bytes on wire, captured on eth0',
        fields: { bytes: 128 },
      },
      {
        layerName: 'SMB2 Header',
        summary: 'Command: Negotiate (0x0000), Process ID: 1422, Session ID: 0x0',
        fields: { command: 'Negotiate', pid: 1422 },
      },
    ],
    hexDump: [
      '0000  fe 53 4d 42 40 00 00 00  00 00 00 00 00 00 00 00  .SMB@...........',
      '0010  00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ................',
    ],
  },
];

export const FICTIONAL_ENDPOINT_TELEMETRY: readonly FictionalEndpointTelemetry[] = [
  {
    eventId: 'EDR-2026-001',
    timestamp: '2026-10-12T07:44:10Z',
    hostId: 'app-portal-01',
    processId: 4128,
    parentProcessId: 1042,
    processName: 'aster_agent_daemon.bin',
    commandLine: '/opt/tools/aster_agent_daemon.bin --config=/etc/security/aster.conf',
    executedBy: 'svc-aster',
    sha256Hash: '4a91c890f124be81203487c90123ef891234abcd567890ef1234567890abcdef',
    networkConnection: {
      destIp: '10.0.4.20',
      destPort: 445,
      protocol: 'tcp',
    },
  },
];

export const FICTIONAL_VULNERABILITY_FINDINGS: readonly FictionalVulnerabilityFinding[] = [
  {
    id: 'VULN-2026-001',
    title: 'Over-permissioned Domain Share Lateral Movement',
    targetHost: 'filesrv-01',
    targetService: 'SMB (Port 445)',
    cve: 'CVE-2026-MOCK-SMB',
    severity: 'HIGH',
    attackVector:
      'Stolen service account session ticket reused on unrestricted internal file share.',
    evidenceId: 'EVD-2026-001',
    rootCause: 'Privileged service account tokens accepted without host-origin verification.',
    remediationAdvice:
      'Enforce strict SMB signing, restrict svc-aster logon rights to app-portal-01 only, and segment subnet 10.0.4.0/24.',
    discoveredAt: '2026-10-12T07:55:00Z',
  },
];

export const FICTIONAL_SECURITY_ALERTS: readonly FictionalSecurityAlert[] = [
  {
    id: 'ALERT-2026-01',
    ruleId: 'RULE-DET-SMB-LATERAL',
    ruleName: 'Service Account Anomalous Share Access',
    timestamp: '2026-10-12 07:46:12 WAT',
    severity: 'CRITICAL',
    sourceHost: 'app-portal-01 (10.0.4.10)',
    targetHost: 'filesrv-01 (10.0.4.20)',
    matchedField: 'user.name',
    matchedValue: 'svc-aster',
    status: 'CONFIRMED_INCIDENT',
  },
];

export const SHARED_CYBER_RANGE: FictionalCyberRange = {
  organization: CEDARLINE_ORGANIZATION,
  subnets: FICTIONAL_SUBNETS,
  hosts: ENRICHED_HOSTS,
  services: FICTIONAL_SERVICES,
  identities: FICTIONAL_IDENTITIES,
  dnsRecords: FICTIONAL_DNS_RECORDS,
  certificates: FICTIONAL_CERTIFICATES,
  packetFrames: SYNTHETIC_PACKET_FRAMES,
  logs: FICTIONAL_LOGS,
  endpointEvents: FICTIONAL_ENDPOINT_TELEMETRY,
  evidenceItems: FICTIONAL_EVIDENCE,
  vulnerabilityFindings: FICTIONAL_VULNERABILITY_FINDINGS,
  securityAlerts: FICTIONAL_SECURITY_ALERTS,
};

// ----------------------------------------------------------------------------
// Typed Accessor Utilities
// ----------------------------------------------------------------------------

export function getRangeHost(idOrIp: string): FictionalHost | undefined {
  const query = idOrIp.trim().toLowerCase();
  return ENRICHED_HOSTS.find(
    h =>
      h.id.toLowerCase() === query ||
      h.ipAddress.toLowerCase() === query ||
      h.hostname.toLowerCase() === query
  );
}

export function getRangeServicesForHost(hostId: string): readonly FictionalService[] {
  return FICTIONAL_SERVICES.filter(s => s.hostId === hostId);
}

export function getRangeSubnet(subnetId: string): FictionalSubnet | undefined {
  return FICTIONAL_SUBNETS.find(s => s.id === subnetId);
}

export function getRangePackets(filterProtocol?: string): readonly SyntheticPacketFrame[] {
  if (!filterProtocol || filterProtocol === 'ALL') {
    return SYNTHETIC_PACKET_FRAMES;
  }
  const q = filterProtocol.toUpperCase();
  return SYNTHETIC_PACKET_FRAMES.filter(p => p.protocol === q);
}

export function getRangeLogs(filter?: {
  source?: string;
  severity?: string;
  hostId?: string;
}): readonly FictionalLogEntry[] {
  return FICTIONAL_LOGS.filter(entry => {
    if (filter?.source && entry.source !== filter.source) return false;
    if (filter?.severity && entry.severity !== filter.severity) return false;
    if (filter?.hostId && entry.hostId !== filter.hostId) return false;
    return true;
  });
}

export function getRangeIdentities(): readonly FictionalUserIdentity[] {
  return FICTIONAL_IDENTITIES;
}
