/**
 * Cyberlife — Fictional Host Services Dataset
 *
 * Deterministic service inventories for simulated hosts on the Marina Tower subnet.
 *
 * EDUCATIONAL OBJECTIVE:
 * Demonstrates to beginners that services represent running software listeners,
 * different server roles expose distinct services, and discovery alone does
 * not mean a vulnerability is present.
 */

import { FictionalService } from '../types';

export const FICTIONAL_SERVICES: readonly FictionalService[] = [
  // ws-sec-04 (Analyst Workstation)
  {
    id: 'svc-wssec-ssh',
    hostId: 'ws-sec-04',
    port: 22,
    protocol: 'tcp',
    serviceName: 'ssh',
    product: 'OpenSSH',
    version: '9.2p1 Debian-2+deb12u3',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'Local administrative console and secure shell bastion access.',
    securityNotes:
      'Normal operational service. Enforces Ed25519 public key authentication only; password logins disabled.',
  },

  // ws-finance-02 (Finance Desktop)
  {
    id: 'svc-wsfin-smb',
    hostId: 'ws-finance-02',
    port: 445,
    protocol: 'tcp',
    serviceName: 'microsoft-ds',
    product: 'Windows SMBv3',
    version: '10.0.22631',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'File and print sharing protocol for Windows domain workstations.',
    securityNotes:
      'Standard corporate desktop service. SMB signing enabled; anonymous access blocked.',
  },
  {
    id: 'svc-wsfin-rdp',
    hostId: 'ws-finance-02',
    port: 3389,
    protocol: 'tcp',
    serviceName: 'ms-wbt-server',
    product: 'Microsoft Remote Desktop',
    version: '10.0 (NLA Enabled)',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'Allows Cedarline IT Helpdesk to provide remote desktop troubleshooting.',
    securityNotes:
      'Approved helpdesk endpoint. Network Level Authentication (NLA) strictly enforced.',
  },

  // filesrv-01 (Corporate File Server)
  {
    id: 'svc-filesrv-smb',
    hostId: 'filesrv-01',
    port: 445,
    protocol: 'tcp',
    serviceName: 'netbios-ssn',
    product: 'Samba smbd',
    version: '4.18.2-Debian',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'Provides shared network drives for Accounting, Legal, and Management teams.',
    securityNotes:
      'Normal operational service. Bound to Active Directory Kerberos domain; IPC$ null sessions disabled.',
  },
  {
    id: 'svc-filesrv-nfs',
    hostId: 'filesrv-01',
    port: 2049,
    protocol: 'tcp',
    serviceName: 'nfs',
    product: 'Kernel NFSv4 Server',
    version: '4.2',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'Backup storage target for automated nightly server snapshots.',
    securityNotes:
      'Approved administrative protocol. IP-restricted export list; root squashing enabled.',
  },
  {
    id: 'svc-filesrv-ssh',
    hostId: 'filesrv-01',
    port: 22,
    protocol: 'tcp',
    serviceName: 'ssh',
    product: 'OpenSSH',
    version: '9.2p1 Debian',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'Systems administrator maintenance and patch orchestration.',
    securityNotes:
      'Normal operational service. Accessible only from designated administrator jump boxes.',
  },

  // app-portal-01 (Employee Intranet & Middleware)
  {
    id: 'svc-app-http',
    hostId: 'app-portal-01',
    port: 80,
    protocol: 'tcp',
    serviceName: 'http',
    product: 'nginx',
    version: '1.24.0 (Ubuntu)',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'Plaintext HTTP listener configured to issue HTTP 301 redirects to HTTPS.',
    securityNotes: 'Normal redirection service. Does not serve application data directly.',
  },
  {
    id: 'svc-app-https',
    hostId: 'app-portal-01',
    port: 443,
    protocol: 'tcp',
    serviceName: 'https',
    product: 'nginx',
    version: '1.24.0 (Ubuntu)',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'Cedarline Employee Intranet Portal and document submission workflow.',
    securityNotes:
      'Approved TLS 1.3 encrypted interface. Uses valid internal enterprise PKI certificate.',
  },
  {
    id: 'svc-app-tomcat',
    hostId: 'app-portal-01',
    port: 8080,
    protocol: 'tcp',
    serviceName: 'http-proxy',
    product: 'Apache Tomcat',
    version: '9.0.58 (Legacy Staging)',
    state: 'OPEN',
    approved: false, // REQUIRES REVIEW
    expectedPurpose: 'Experimental staging endpoint for payroll synchronization batch processor.',
    securityNotes:
      'REQUIRES REVIEW: Unencrypted HTTP management console exposed on port 8080. Recommended for remediation to bind only to loopback interface.',
  },

  // gw-core-01 (Perimeter Gateway)
  {
    id: 'svc-gw-dns',
    hostId: 'gw-core-01',
    port: 53,
    protocol: 'udp',
    serviceName: 'domain',
    product: 'CoreDNS',
    version: '1.11.1',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'Internal DNS resolution for *.corp.local domain and upstream caching.',
    securityNotes:
      'Normal infrastructure service. Recursion restricted to local subnet 10.0.4.0/24.',
  },
  {
    id: 'svc-gw-ntp',
    hostId: 'gw-core-01',
    port: 123,
    protocol: 'udp',
    serviceName: 'ntp',
    product: 'Chrony NTP Daemon',
    version: '4.4',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'Network time synchronization for all marina cluster nodes.',
    securityNotes:
      'Authoritative in-game time reference. Ensures log timestamps align across the enterprise.',
  },
  {
    id: 'svc-gw-ssh',
    hostId: 'gw-core-01',
    port: 22,
    protocol: 'tcp',
    serviceName: 'ssh',
    product: 'OpenSSH (VyOS)',
    version: '9.2p1',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'Network engineer routing and firewall administration console.',
    securityNotes: 'Approved management interface. Multi-factor hardware token authentication.',
  },

  // mon-siem-01 (SIEM Aggregator)
  {
    id: 'svc-mon-syslog',
    hostId: 'mon-siem-01',
    port: 514,
    protocol: 'udp',
    serviceName: 'syslog',
    product: 'Rsyslog Daemon',
    version: '8.2310.0',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'Receives streaming syslog UDP datagrams from routers and servers.',
    securityNotes:
      'Normal telemetry collector. Ingestion rate monitored; alerts generated on threshold spikes.',
  },
  {
    id: 'svc-mon-https',
    hostId: 'mon-siem-01',
    port: 8443,
    protocol: 'tcp',
    serviceName: 'https-alt',
    product: 'Elasticsearch / Kibana SIEM Web UI',
    version: '8.13.0',
    state: 'OPEN',
    approved: true,
    expectedPurpose: 'Security Operations Center analyst dashboard and search interface.',
    securityNotes:
      'Approved analyst portal. Requires role-based authentication and TLS encryption.',
  },

  // vault-core-01 (Tier 2 Restricted)
  {
    id: 'svc-vault-hsm',
    hostId: 'vault-core-01',
    port: 9443,
    protocol: 'tcp',
    serviceName: 'mutual-tls',
    product: 'Hardware Security Module (HSM) Cryptoki Daemon',
    version: '3.1.0-FIPS',
    state: 'FILTERED',
    approved: true,
    expectedPurpose: 'Cryptographic signing and decryption key management.',
    securityNotes: 'Tier 2 Restricted service. Strict mutual TLS and physical tamper resistance.',
  },
];

export function getServicesForHost(hostId: string): readonly FictionalService[] {
  const normalized = hostId.trim().toLowerCase();
  return FICTIONAL_SERVICES.filter(s => s.hostId.toLowerCase() === normalized);
}

export function getAllServices(): readonly FictionalService[] {
  return FICTIONAL_SERVICES;
}
