/**
 * Cyberlife : Fictional Network Hosts Dataset
 *
 * Deterministic, purely synthetic host inventory for the Cedarline Services
 * Marina Tower subnet (10.0.4.0/24).
 *
 * STRICT INVARIANT:
 * Contains only fictional entities. Zero external network scanning or real IPs.
 */

import { FictionalHost } from '../types';

export const FICTIONAL_HOSTS: readonly FictionalHost[] = [
  {
    id: 'ws-sec-04',
    hostname: 'cedarline-sec-ws04.corp.local',
    ipAddress: '10.0.4.15',
    macAddress: '00:50:56:a4:01:15',
    role: 'workstation',
    roleLabel: 'Security Operations Analyst Workstation',
    os: 'Orion OS v4.5 (Sandboxed Linux Kernel)',
    status: 'UP',
    reachability: 'LOCAL_HOST',
    location: 'Marina Tower : 4th Floor SecOps Bullpen (Desk 04)',
    approvedServices: ['ssh (local management)'],
    description:
      'Primary desktop workstation assigned to intern analyst Protector. Configured with security monitoring tools and hardened kernel.',
    requiredTier: 1,
  },
  {
    id: 'ws-finance-02',
    hostname: 'cedarline-fin-ws02.corp.local',
    ipAddress: '10.0.4.22',
    macAddress: '00:50:56:a4:02:22',
    role: 'workstation',
    roleLabel: 'Finance & Accounting Desktop',
    os: 'Windows 11 Enterprise (Simulated Build 22631)',
    status: 'UP',
    reachability: 'INTERNAL_LAN',
    location: 'Marina Tower : 3rd Floor Finance Department',
    approvedServices: ['smb (file share client)', 'rdp (remote support)'],
    description:
      'Standard corporate desktop used by Anjola for payroll calculations and ERP client access. Communicates with file server and intranet portal.',
    requiredTier: 1,
  },
  {
    id: 'filesrv-01',
    hostname: 'filesrv-01.corp.local',
    ipAddress: '10.0.4.50',
    macAddress: '00:50:56:a4:03:50',
    role: 'file_server',
    roleLabel: 'Corporate Document Repository & File Server',
    os: 'Debian GNU/Linux 12 (Bookworm - Hardened)',
    status: 'UP',
    reachability: 'INTERNAL_LAN',
    location: 'Marina Tower : B1 Server Room Rack A-02',
    approvedServices: ['smb (Samba 4.18)', 'nfs (NFSv4)', 'ssh (Admin)'],
    description:
      'Central file storage host serving departmental shares for legal, HR, and finance. Enforces role-based POSIX ACLs.',
    requiredTier: 1,
  },
  {
    id: 'app-portal-01',
    hostname: 'app-portal-01.corp.local',
    ipAddress: '10.0.4.80',
    macAddress: '00:50:56:a4:04:80',
    role: 'application_server',
    roleLabel: 'Internal Employee Web Portal & Staging Host',
    os: 'Ubuntu Server 24.04 LTS',
    status: 'UP',
    reachability: 'INTERNAL_LAN',
    location: 'Marina Tower : B1 Server Room Rack B-01',
    approvedServices: ['http (nginx)', 'https (nginx)', 'tomcat (Payroll Staging)'],
    description:
      'Hosts the internal employee self-service portal and middleware staging services. Under maintenance for payroll API migrations.',
    requiredTier: 1,
  },
  {
    id: 'gw-core-01',
    hostname: 'gw-core-01.corp.local',
    ipAddress: '10.0.4.1',
    macAddress: '00:50:56:a4:00:01',
    role: 'network_gateway',
    roleLabel: 'Marina Subnet Perimeter Gateway & Firewall',
    os: 'VyOS Enterprise Router 1.4 (Simulated)',
    status: 'UP',
    reachability: 'GATEWAY',
    location: 'Marina Tower : B1 Telecommunications Demarcation',
    approvedServices: ['dns (CoreDNS)', 'ntp (Chrony)', 'ssh (Console)'],
    description:
      'Default gateway and packet inspection barrier connecting 10.0.4.0/24 to Cedarline regional WAN. Logs dropped packets to central SIEM.',
    requiredTier: 1,
  },
  {
    id: 'mon-siem-01',
    hostname: 'mon-siem-01.corp.local',
    ipAddress: '10.0.4.200',
    macAddress: '00:50:56:a4:05:20',
    role: 'monitoring_system',
    roleLabel: 'Security Information and Event Manager (SIEM)',
    os: 'Hardened Red Hat Enterprise Linux 9 (Simulated)',
    status: 'UP',
    reachability: 'RESTRICTED_LAN',
    location: 'Marina Tower : B1 High Security Enclosure',
    approvedServices: ['syslog (rsyslog)', 'https (SIEM Web Dashboard)'],
    description:
      'Centralized event collector aggregating auth, syslog, and firewall alerts from across the facility. High integrity log retention.',
    requiredTier: 1,
  },
  {
    id: 'vault-core-01',
    hostname: 'vault-core-01.restricted.corp.local',
    ipAddress: '10.0.4.250',
    macAddress: '00:50:56:a4:ff:01',
    role: 'monitoring_system',
    roleLabel: 'Executive Cryptographic Vault & Root HSM',
    os: 'Proprietary Hardware Appliance OS',
    status: 'FILTERED',
    reachability: 'RESTRICTED_LAN',
    location: 'Cedarline Executive Level : Secure Strongroom',
    approvedServices: ['mutual-tls (Restricted HSM)'],
    description:
      'Tier 2 restricted cryptographic vault housing organizational root certificates and high-value keys. Strict access control enforced.',
    requiredTier: 2, // Demonstrates permission restriction!
  },
];

export function getFictionalHosts(): readonly FictionalHost[] {
  return FICTIONAL_HOSTS;
}

export function findHostByIdOrIp(query: string): FictionalHost | undefined {
  const normalized = query.trim().toLowerCase();
  return FICTIONAL_HOSTS.find(
    h =>
      h.id.toLowerCase() === normalized ||
      h.hostname.toLowerCase() === normalized ||
      h.ipAddress === normalized
  );
}
