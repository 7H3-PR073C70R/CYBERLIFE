/**
 * Cyberlife — Trace System: Data-Driven Noise Table & Log Catalog
 *
 * Defines the central data-driven action noise table, target sensitivity profiles,
 * and authentic synthetic log templates (CEF, Sysmon, Suricata, Nginx, iptables).
 *
 * STRICT SAFETY BOUNDARY:
 * All logs and signatures reference strictly fictional in-game entities
 * (Cedarline, Broad Street, Eko Nexus, Orion OS, 10.0.4.0/24).
 */

import { ActionNoiseDefinition, LogArtifactFormat } from './types';

export const NOISE_ACTION_CATALOG: Record<string, ActionNoiseDefinition> = {
  // --- Passive Intelligence & DNS ---
  passive_osint: {
    id: 'passive_osint',
    name: 'Passive OSINT & Intelligence Search',
    category: 'OSINT_PASSIVE',
    baseNoise: 5,
    attckTechniqueId: 'T1596',
    attckTechniqueName: 'Search Open Technical Databases',
    logFormat: 'DNS_QUERY',
    detectionReason: 'Queries public technical repositories and public registries. Target experiences zero inbound traffic.',
    opsecMitigation: 'Use Tor Browser or public proxies to prevent attribution of the querying client IP.',
  },
  passive_whois: {
    id: 'passive_whois',
    name: 'Passive WHOIS / ASN Lookup',
    category: 'OSINT_PASSIVE',
    baseNoise: 2,
    attckTechniqueId: 'T1596',
    attckTechniqueName: 'Search Open Technical Databases',
    logFormat: 'DNS_QUERY',
    detectionReason: 'Queries public regional registries (AFRINIC). Target infrastructure generates zero telemetry.',
    opsecMitigation: 'Use public web mirrors or Tor Browser to prevent attribution of the querying client IP.',
  },
  passive_ct_search: {
    id: 'passive_ct_search',
    name: 'Certificate Transparency Log Search',
    category: 'OSINT_PASSIVE',
    baseNoise: 3,
    attckTechniqueId: 'T1596.003',
    attckTechniqueName: 'Search Open Technical Databases: Certificate Authorities',
    logFormat: 'DNS_QUERY',
    detectionReason: 'Aggregates certificates from public append-only logs (crt.sh). Never connects to target servers.',
    opsecMitigation: 'Completely passive. No mitigation required as target network receives no packets.',
  },
  dns_lookup: {
    id: 'dns_lookup',
    name: 'Target DNS Record Lookup',
    category: 'OSINT_DNS',
    baseNoise: 5,
    attckTechniqueId: 'T1590.002',
    attckTechniqueName: 'Gather Victim Network Information: DNS',
    logFormat: 'DNS_QUERY',
    detectionReason: 'Hits target authoritative name server for A/MX/TXT records. Low volume but logged in resolver logs.',
    opsecMitigation: 'Query via public recursive resolvers (1.1.1.1, 8.8.8.8) or Tor rather than target nameserver directly.',
  },
  dns_subdomain_brute: {
    id: 'dns_subdomain_brute',
    name: 'DNS Subdomain Enumeration Burst',
    category: 'OSINT_DNS',
    baseNoise: 35,
    attckTechniqueId: 'T1590.002',
    attckTechniqueName: 'Gather Victim Network Information: DNS',
    logFormat: 'DNS_QUERY',
    detectionReason: 'Hundreds of NXDOMAIN responses in brief interval trigger DNS anomaly monitors.',
    opsecMitigation: 'Rate limit queries to <2 queries/second; use passive permutation sources.',
  },

  // --- Network Reconnaissance & Port Scanning ---
  portscan_slow: {
    id: 'portscan_slow',
    name: 'Stealth SYN Port Probe (Low Rate)',
    category: 'RECON_ACTIVE',
    baseNoise: 20,
    attckTechniqueId: 'T1046',
    attckTechniqueName: 'Network Service Discovery',
    logFormat: 'FIREWALL_IPTABLES',
    detectionReason: 'Firewall logs dropped SYN packets to non-listening ports, but low PPS stays under IDS tripwire.',
    opsecMitigation: 'Randomize scan port order and insert 5-10s jitter delays between consecutive probes.',
  },
  scan_port_slow: {
    id: 'scan_port_slow',
    name: 'Stealth SYN Port Probe (Low Rate)',
    category: 'RECON_ACTIVE',
    baseNoise: 20,
    attckTechniqueId: 'T1046',
    attckTechniqueName: 'Network Service Discovery',
    logFormat: 'FIREWALL_IPTABLES',
    detectionReason: 'Firewall logs dropped SYN packets to non-listening ports, but low PPS stays under IDS tripwire.',
    opsecMitigation: 'Randomize scan port order and insert 5-10s jitter delays between consecutive probes.',
  },
  portscan_aggressive: {
    id: 'portscan_aggressive',
    name: 'Aggressive SYN Port Scan (-T4)',
    category: 'RECON_ACTIVE',
    baseNoise: 60,
    attckTechniqueId: 'T1046',
    attckTechniqueName: 'Network Service Discovery',
    logFormat: 'SURICATA_JSON',
    detectionReason: 'Rapid multi-port SYN flood triggers Suricata ET SCAN signature immediately.',
    opsecMitigation: 'Never run aggressive timing templates (-T4/-T5) against defended perimeters. Scope to top 20 ports.',
  },
  scan_port_aggressive: {
    id: 'scan_port_aggressive',
    name: 'Aggressive SYN Port Scan (-T4/-A)',
    category: 'RECON_ACTIVE',
    baseNoise: 60,
    attckTechniqueId: 'T1046',
    attckTechniqueName: 'Network Service Discovery',
    logFormat: 'SURICATA_JSON',
    detectionReason: 'Rapid burst of TCP SYN packets across >1,000 ports triggers Suricata ET SCAN signature immediately.',
    opsecMitigation: 'Never run aggressive timing templates (-T4/-T5) against defended perimeters. Scope to top 20 ports.',
  },

  // --- Service Enumeration & Web Probing ---
  service_inspect: {
    id: 'service_inspect',
    name: 'HTTP Service Fingerprint Inspection',
    category: 'ENUMERATION',
    baseNoise: 25,
    attckTechniqueId: 'T1595.002',
    attckTechniqueName: 'Active Scanning: Vulnerability Scanning',
    logFormat: 'NGINX_ACCESS',
    detectionReason: 'Web server access log captures anomalous scanner User-Agent, OPTIONS method, and header queries.',
    opsecMitigation: 'Mimic legitimate browser User-Agent headers and match standard browser request order.',
  },
  svcscan_inspect: {
    id: 'svcscan_inspect',
    name: 'HTTP Service Fingerprint & Header Inspection',
    category: 'ENUMERATION',
    baseNoise: 25,
    attckTechniqueId: 'T1595.002',
    attckTechniqueName: 'Active Scanning: Vulnerability Scanning',
    logFormat: 'NGINX_ACCESS',
    detectionReason: 'Web server access log captures anomalous User-Agent, OPTIONS method, and rapid header queries.',
    opsecMitigation: 'Mimic legitimate browser User-Agent headers and match standard browser request order.',
  },
  web_probe: {
    id: 'web_probe',
    name: 'Targeted Web Endpoint Probe',
    category: 'ENUMERATION',
    baseNoise: 15,
    attckTechniqueId: 'T1595.002',
    attckTechniqueName: 'Active Scanning: Vulnerability Scanning',
    logFormat: 'NGINX_ACCESS',
    detectionReason: 'Single HTTP probe logged in web access log.',
    opsecMitigation: 'Use Tor and normal headers.',
  },
  web_dir_bruteforce: {
    id: 'web_dir_bruteforce',
    name: 'Web Directory Wordlist Fuzzing',
    category: 'ENUMERATION',
    baseNoise: 50,
    attckTechniqueId: 'T1595.002',
    attckTechniqueName: 'Active Scanning: Vulnerability Scanning',
    logFormat: 'NGINX_ACCESS',
    detectionReason: 'Concentrated flood of HTTP 404 responses trips ModSecurity WAF threshold rules within seconds.',
    opsecMitigation: 'Rely on targeted wordlists; respect 429 backoff; analyze robots.txt and sitemaps passively first.',
  },
  web_dir_fuzz: {
    id: 'web_dir_fuzz',
    name: 'Web Directory Wordlist Fuzzing',
    category: 'ENUMERATION',
    baseNoise: 50,
    attckTechniqueId: 'T1595.002',
    attckTechniqueName: 'Active Scanning: Vulnerability Scanning',
    logFormat: 'NGINX_ACCESS',
    detectionReason: 'Concentrated flood of HTTP 404 responses trips ModSecurity WAF threshold rules within seconds.',
    opsecMitigation: 'Rely on targeted wordlists; respect 429 backoff; analyze robots.txt and sitemaps passively first.',
  },

  // --- Authentication Abuse & Exploitation ---
  credential_stuffing: {
    id: 'credential_stuffing',
    name: 'API Credential Stuffing & Spraying',
    category: 'EXPLOITATION',
    baseNoise: 70,
    attckTechniqueId: 'T1110.003',
    attckTechniqueName: 'Brute Force: Password Spraying',
    logFormat: 'SYSMON',
    detectionReason: 'Multiple failed authentication events (Event 4625) against single endpoint from identical source IP.',
    opsecMitigation: 'Stay strictly below account lockout limits (max 2 attempts per hour per account).',
  },
  cred_stuffing: {
    id: 'cred_stuffing',
    name: 'API Credential Stuffing Attempt',
    category: 'EXPLOITATION',
    baseNoise: 70,
    attckTechniqueId: 'T1110.003',
    attckTechniqueName: 'Brute Force: Password Spraying',
    logFormat: 'SYSMON',
    detectionReason: 'Multiple failed authentication events (Event 4625) against single endpoint from identical source IP.',
    opsecMitigation: 'Stay strictly below account lockout limits (max 2 attempts per hour per account).',
  },
  exploit_attempt: {
    id: 'exploit_attempt',
    name: 'Exploit Injection / Memory Corruption',
    category: 'EXPLOITATION',
    baseNoise: 85,
    attckTechniqueId: 'T1203',
    attckTechniqueName: 'Exploitation for Client Execution',
    logFormat: 'SURICATA_JSON',
    detectionReason: 'Known CVE payload byte sequence detected by intrusion prevention system.',
    opsecMitigation: 'Use verified living-off-the-land techniques rather than signatured exploit binaries.',
  },

  // --- Authenticated Operations & Exfiltration ---
  auth_read_normal: {
    id: 'auth_read_normal',
    name: 'Authorized Service Read (Normal Hours)',
    category: 'AUTHORIZED_ACCESS',
    baseNoise: 10,
    attckTechniqueId: 'T1078',
    attckTechniqueName: 'Valid Accounts',
    logFormat: 'CEF',
    detectionReason: 'Normal credentialed access matching standard working hours baseline in SOC analytics.',
    opsecMitigation: 'Optimal OPSEC. Ensure actions blend seamlessly with typical user roles and schedules.',
  },
  auth_read_afterhours: {
    id: 'auth_read_afterhours',
    name: 'Anomalous Read Query (After-Hours)',
    category: 'UNAUTHORIZED_ACCESS',
    baseNoise: 35,
    attckTechniqueId: 'T1078',
    attckTechniqueName: 'Valid Accounts',
    logFormat: 'CEF',
    detectionReason: 'User Behavior Analytics (UBA) flags administrative reads occurring between 23:00 and 06:00 WAT.',
    opsecMitigation: 'Schedule automated queries to align with scheduled overnight backup windows.',
  },
  bulk_download: {
    id: 'bulk_download',
    name: 'High-Volume Data Extraction / Exfiltration',
    category: 'EXFILTRATION',
    baseNoise: 80,
    attckTechniqueId: 'T1048',
    attckTechniqueName: 'Exfiltration Over Alternative Protocol',
    logFormat: 'SURICATA_JSON',
    detectionReason: 'Network egress monitoring logs sudden 50MB+ continuous outbound data transfer.',
    opsecMitigation: 'Split data into low-bandwidth chunks under 500KB; introduce random delay intervals.',
  },
  bulk_download_exfil: {
    id: 'bulk_download_exfil',
    name: 'High-Volume Data Extraction / Exfiltration',
    category: 'EXFILTRATION',
    baseNoise: 80,
    attckTechniqueId: 'T1048',
    attckTechniqueName: 'Exfiltration Over Alternative Protocol',
    logFormat: 'SURICATA_JSON',
    detectionReason: 'Network egress monitoring logs sudden 50MB+ continuous outbound data transfer.',
    opsecMitigation: 'Split data into low-bandwidth chunks under 500KB; introduce random delay intervals.',
  },

  // --- Anti-Forensics & Cleanup ---
  log_cleanup_wipe: {
    id: 'log_cleanup_wipe',
    name: 'Volatile History & Shell Cleanup',
    category: 'CLEANUP',
    baseNoise: 10,
    attckTechniqueId: 'T1070.003',
    attckTechniqueName: 'Indicator Removal: Clear Command History',
    logFormat: 'SYSMON',
    detectionReason: 'Process creation of shred / rm or history truncation can be observed by host EDR.',
    opsecMitigation: 'Unset HISTFILE prior to executing commands rather than clearing history after the fact.',
  },
};

/**
 * Target sensitivity profiles determine how aggressively a host reacts to noise.
 */
export const TARGET_SENSITIVITY_PROFILES: Record<
  string,
  { multiplier: number; defenderName: string; defendedType: 'CRITICAL_PERIMETER' | 'INTERNAL_SERVER' | 'PUBLIC_SERVICE' | 'MONITOR_SIEM' }
> = {
  'app-portal-01': {
    multiplier: 1.0,
    defenderName: 'Cedarline Edge WAF & Suricata IDS',
    defendedType: 'CRITICAL_PERIMETER',
  },
  'filesrv-01': {
    multiplier: 1.0,
    defenderName: 'Internal Host-Based Sysmon & Windows Defender',
    defendedType: 'INTERNAL_SERVER',
  },
  'dc-core-01': {
    multiplier: 2.0,
    defenderName: 'Active Directory Advanced Threat Analytics',
    defendedType: 'CRITICAL_PERIMETER',
  },
  'mon-siem-01': {
    multiplier: 2.0,
    defenderName: 'Wazuh SIEM Security Heartbeat Monitor',
    defendedType: 'MONITOR_SIEM',
  },
  'external-dns': {
    multiplier: 1.0,
    defenderName: 'Public Root Resolver',
    defendedType: 'PUBLIC_SERVICE',
  },
};

/**
 * Formats a realistic synthetic log line for the purple-team debrief.
 */
export function generateSyntheticLogLine(
  format: LogArtifactFormat,
  action: ActionNoiseDefinition,
  target: string,
  timestampIso: string,
  sourceIp: string
): string {
  switch (format) {
    case 'CEF':
      return `CEF:0|CedarlineSec|OrionSIEM|2026.1|${action.id.toUpperCase()}|${action.name}|${action.baseNoise > 50 ? '7' : '3'}|src=${sourceIp} dst=${target} msg=${action.detectionReason}`;

    case 'SYSMON':
      return `[Microsoft-Windows-Sysmon/Operational] EventID: 3, Level: Warning, Time: ${timestampIso}, SourceIp: ${sourceIp}, DestinationHostname: ${target}, Protocol: tcp, ProcessName: C:\\Windows\\System32\\services.exe, User: svc-aster, RuleName: technique_id=${action.attckTechniqueId}`;

    case 'SURICATA_JSON':
      return `{"timestamp":"${timestampIso}","event_type":"alert","src_ip":"${sourceIp}","dest_ip":"${target}","alert":{"action":"allowed","gid":1,"signature_id":2026042,"rev":1,"signature":"ET POLICY ${action.name} from external subnet","category":"Attempted Information Leak","severity":${action.baseNoise > 50 ? 1 : 2},"metadata":{"attck_id":["${action.attckTechniqueId}"]}}}`;

    case 'NGINX_ACCESS':
      return `${sourceIp} - - [${timestampIso}] "GET /api/v1/auth HTTP/1.1" 404 182 "-" "Mozilla/5.0 (Compatible; OrionScan/1.2; +https://eko.sec)" host="${target}"`;

    case 'FIREWALL_IPTABLES':
      return `kernel: [IPTABLES-DROP-SYN] IN=eth0 OUT= MAC=00:1a:2b:3c:4d:5e SRC=${sourceIp} DST=${target} LEN=60 TOS=0x00 PREC=0x00 TTL=52 ID=18492 DF PROTO=TCP SPT=48291 DPT=8080 WINDOW=29200 SYN`;

    case 'DNS_QUERY':
    default:
      return `${timestampIso} client @0x7f88 ${sourceIp}#49120 (${target}): query: ${target} IN A +E(0)K (10.0.4.1)`;
  }
}
