/**
 * Cyberlife — Milestone 18: Sigma-Inspired Detection Rules Catalog
 *
 * Defines the simulation-only detection rules with:
 * - Distinct severity and confidence ratings.
 * - Sigma-like query definitions and category matchers.
 * - Human-readable match explanations explaining the exact detection trigger.
 * - MITRE ATT&CK technique classifications.
 *
 * STRICT SAFETY INVARIANT:
 * 100% in-memory rule engine. Evaluates against synthetic telemetry only.
 */

import { DetectionRule, TelemetryEvent } from './types';

export const DETECTION_RULES_CATALOG: readonly DetectionRule[] = [
  {
    id: 'RULE-SEC-001',
    name: 'Rapid Credential Guessing & Password Spraying',
    description: 'Detects bursts of authentication failures against multiple accounts from a single client IP within a short time window.',
    author: 'EkoSec Detection Engineering Team',
    version: '1.3.0',
    category: 'AUTHENTICATION',
    severity: 'HIGH',
    confidenceScore: 88,
    mitreTechniques: ['T1110.003', 'T1110.001'],
    isEnabled: true,
    queryDefinition: 'event.category == "AUTHENTICATION" && auth.status == "FAILURE" && auth.consecutiveFailures >= 3',
    rationale: 'Password spraying attempts to guess simple passwords across many accounts to avoid lockouts, generating multiple failed login events.',
    evaluateMatch: (event: TelemetryEvent): boolean => {
      if (event.category !== 'AUTHENTICATION') return false;
      return (
        event.auth?.authStatus === 'FAILURE' &&
        (event.auth?.consecutiveFailures ?? 0) >= 3
      );
    },
    matchExplanation: (event: TelemetryEvent): string | null => {
      if (!event.auth || event.auth.authStatus !== 'FAILURE') return null;
      return `Detected ${event.auth.consecutiveFailures ?? 'multiple'} consecutive authentication failures from IP ${event.sourceIp} targeting principal(s): ${event.auth.userPrincipal}.`;
    },
  },
  {
    id: 'RULE-SEC-002',
    name: 'Web Server Anomalous Child Process Spawn (Webshell / RCE)',
    description: 'Detects web application server daemons (http-proxy, nginx, apache) spawning interactive command shells (sh, bash, cmd).',
    author: 'EkoSec SOC Defense Operations',
    version: '2.1.0',
    category: 'PROCESS_EXECUTION',
    severity: 'CRITICAL',
    confidenceScore: 95,
    mitreTechniques: ['T1505.003', 'T1059.004'],
    isEnabled: true,
    queryDefinition: 'event.category == "PROCESS_EXECUTION" && process.parent in ["http-proxy", "nginx", "apache"] && process.name in ["sh", "bash", "cmd", "powershell"]',
    rationale: 'Legitimate web servers do not spawn interactive shells unless exploited via remote code execution (RCE) or webshell implantation.',
    evaluateMatch: (event: TelemetryEvent): boolean => {
      if (event.category !== 'PROCESS_EXECUTION' || !event.process) return false;
      const parent = event.process.parentProcessName.toLowerCase();
      const child = event.process.processName.toLowerCase();
      const suspiciousParents = ['http-proxy', 'nginx', 'apache', 'node', 'python'];
      const suspiciousChildren = ['sh', 'bash', 'cmd', 'powershell', 'zsh'];
      return suspiciousParents.some(p => parent.includes(p)) && suspiciousChildren.some(c => child.includes(c));
    },
    matchExplanation: (event: TelemetryEvent): string | null => {
      if (!event.process) return null;
      return `Web server process "${event.process.parentProcessName}" (PID ${event.process.ppid}) spawned interactive shell "${event.process.processName}" (PID ${event.process.pid}) executing: ${event.process.commandLine}.`;
    },
  },
  {
    id: 'RULE-SEC-003',
    name: 'Outbound Command & Control (C2) Beaconing',
    description: 'Detects outbound connections to external addresses matching high-confidence threat intelligence indicators or known adversary relays.',
    author: 'Krest Incident Response & EkoSec Intelligence',
    version: '1.4.2',
    category: 'NETWORK_CONNECTION',
    severity: 'CRITICAL',
    confidenceScore: 92,
    mitreTechniques: ['T1071.001', 'T1573'],
    isEnabled: true,
    queryDefinition: 'event.category == "NETWORK_CONNECTION" && (event.correlatedThreatIndicatorId != null || destination.ip == "198.51.100.45")',
    rationale: 'Compromised systems communicate with external C2 servers to receive instructions and stage data exfiltration.',
    evaluateMatch: (event: TelemetryEvent): boolean => {
      if (event.category !== 'NETWORK_CONNECTION') return false;
      if (event.isKnownBenign) return false;
      return (
        event.correlatedThreatIndicatorId === 'ioc-c2-ip-01' ||
        event.destinationIp === '198.51.100.45' ||
        event.tags.includes('c2')
      );
    },
    matchExplanation: (event: TelemetryEvent): string | null => {
      return `Outbound network connection from ${event.sourceHostId} (${event.sourceIp}) to adversary C2 host ${event.destinationIp}:${event.destinationPort} matched threat indicator ${event.correlatedThreatIndicatorId ?? 'ioc-c2-ip-01'}.`;
    },
  },
  {
    id: 'RULE-SEC-004',
    name: 'High-Entropy DNS Exfiltration Tunneling',
    description: 'Detects DNS queries with encoded high-entropy subdomain labels indicative of data exfiltration or staging channels.',
    author: 'NDSRC Threat Research Group',
    version: '1.1.0',
    category: 'NETWORK_CONNECTION',
    severity: 'HIGH',
    confidenceScore: 85,
    mitreTechniques: ['T1048.003', 'T1071.004'],
    isEnabled: true,
    queryDefinition: 'event.category == "NETWORK_CONNECTION" && event.tags contains "tunneling" && destination.port == 53',
    rationale: 'Adversaries tunnel stolen data through DNS TXT queries to bypass strict egress firewalls that permit recursive DNS lookups.',
    evaluateMatch: (event: TelemetryEvent): boolean => {
      if (event.category !== 'NETWORK_CONNECTION') return false;
      return (
        (event.destinationPort === 53 || event.tags.includes('dns')) &&
        (event.tags.includes('tunneling') || event.correlatedThreatIndicatorId === 'ioc-dns-tunnel-regex-01')
      );
    },
    matchExplanation: (event: TelemetryEvent): string | null => {
      return `Observed high-entropy DNS query from ${event.sourceHostId} matching staging tunneling pattern (${event.correlatedThreatIndicatorId ?? 'ioc-dns-tunnel-regex-01'}).`;
    },
  },
  {
    id: 'RULE-SEC-005',
    name: 'Unsanctioned Wildcard IAM Role & Scope Elevation',
    description: 'Detects assignment of administrative wildcard scopes or excessive permissions to non-human service accounts.',
    author: 'EkoSec Cloud Identity Audit',
    version: '1.2.0',
    category: 'PRIVILEGE_CHANGE',
    severity: 'CRITICAL',
    confidenceScore: 90,
    mitreTechniques: ['T1098', 'T1078.004'],
    isEnabled: true,
    queryDefinition: 'event.category == "PRIVILEGE_CHANGE" && privilege.isUnsanctionedWildcard == true',
    rationale: 'Over-privileged service accounts allow attackers who compromise a single service to move laterally and access confidential data.',
    evaluateMatch: (event: TelemetryEvent): boolean => {
      if (event.category !== 'PRIVILEGE_CHANGE' || !event.privilege) return false;
      return event.privilege.isUnsanctionedWildcard || event.privilege.roleGranted?.includes('wildcard') === true;
    },
    matchExplanation: (event: TelemetryEvent): string | null => {
      if (!event.privilege) return null;
      return `Service principal "${event.privilege.userPrincipal}" was granted unsanctioned wildcard privileges: "${event.privilege.roleGranted ?? event.privilege.scopeSummary}".`;
    },
  },
  {
    id: 'RULE-SEC-006',
    name: 'Adversarial Prompt Injection & Guardrail Bypass',
    description: 'Detects input payloads submitted to autonomous AI assistant endpoints containing instruction override or exfiltration commands.',
    author: 'Cedarline AI Safety Unit',
    version: '2.0.0',
    category: 'WEB_APPLICATION',
    severity: 'HIGH',
    confidenceScore: 82,
    mitreTechniques: ['T1190', 'T1059'],
    isEnabled: true,
    queryDefinition: 'event.category == "WEB_APPLICATION" && web.attackType == "PROMPT_INJECTION"',
    rationale: 'Prompt injection subverts LLM system instructions, tricking autonomous agents into misusing tool authorizations to leak data.',
    evaluateMatch: (event: TelemetryEvent): boolean => {
      if (event.category !== 'WEB_APPLICATION' || !event.web) return false;
      return event.web.attackType === 'PROMPT_INJECTION' || (event.web.payloadSnippet?.toLowerCase().includes('ignore previous') ?? false);
    },
    matchExplanation: (event: TelemetryEvent): string | null => {
      if (!event.web) return null;
      return `Adversarial prompt injection pattern detected in HTTP ${event.web.method} to ${event.web.uri}: "${event.web.payloadSnippet}".`;
    },
  },
  {
    id: 'RULE-SEC-007',
    name: 'Critical Security Binary or Configuration Tampering',
    description: 'Detects unauthorized modifications to critical daemon binaries or security configurations where actual file hash differs from baseline.',
    author: 'EkoSec Host Integrity Monitor',
    version: '1.0.4',
    category: 'FILE_INTEGRITY',
    severity: 'HIGH',
    confidenceScore: 86,
    mitreTechniques: ['T1565.001', 'T1546'],
    isEnabled: true,
    queryDefinition: 'event.category == "FILE_INTEGRITY" && fim.isSystemCritical == true && fim.expectedHash != fim.actualHash',
    rationale: 'Attackers modify binaries or daemon configurations to install persistent backdoors and bypass access controls.',
    evaluateMatch: (event: TelemetryEvent): boolean => {
      if (event.category !== 'FILE_INTEGRITY' || !event.fim) return false;
      return (
        event.fim.isSystemCritical &&
        event.fim.expectedHashSha256 !== undefined &&
        event.fim.actualHashSha256 !== undefined &&
        event.fim.expectedHashSha256 !== event.fim.actualHashSha256
      );
    },
    matchExplanation: (event: TelemetryEvent): string | null => {
      if (!event.fim) return null;
      return `Critical system file "${event.fim.filePath}" was altered. Expected hash ${event.fim.expectedHashSha256?.slice(0, 12)}... differs from actual ${event.fim.actualHashSha256?.slice(0, 12)}...`;
    },
  },
  {
    id: 'RULE-SEC-008',
    name: 'Broad Inbound Port Sweep / Service Enumeration',
    description: 'Detects sequential connection attempts across multiple ports targeting network segment endpoints.',
    author: 'NDSRC Network Baseline Ruleset',
    version: '1.0.1',
    category: 'NETWORK_CONNECTION',
    severity: 'MEDIUM',
    confidenceScore: 65, // Lower confidence due to routine internal scanning!
    mitreTechniques: ['T1046'],
    isEnabled: true,
    queryDefinition: 'event.category == "NETWORK_CONNECTION" && event.tags contains "scanner"',
    rationale: 'Port scanning maps accessible network services prior to exploitation, but is also commonly run by authorized internal vulnerability scanners.',
    evaluateMatch: (event: TelemetryEvent): boolean => {
      if (event.category !== 'NETWORK_CONNECTION') return false;
      return event.tags.includes('scanner') || event.summary.toLowerCase().includes('port sweep');
    },
    matchExplanation: (event: TelemetryEvent): string | null => {
      return `Port sweep observed from source IP ${event.sourceIp} targeting ${event.destinationIp}. (Note: Check if source is on authorized SOC scanner allowlist).`;
    },
  },
];
