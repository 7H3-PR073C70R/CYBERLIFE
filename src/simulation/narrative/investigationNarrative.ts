/**
 * Cyberlife — Multi-Role Investigation Narrative & Consequential Decisions
 *
 * Establishes the techno-thriller narrative contracts allowing players to investigate
 * incidents through distinct professional lenses (Blue Team Defender, Purple Team Engineer,
 * Red Team Simulator, Independent Bounty Hunter / Integrity Investigator) without
 * forcing players into a single linear morality or predefined class.
 */

export type InvestigativeRole =
  | 'BLUE_DEFENDER'
  | 'PURPLE_ENGINEER'
  | 'RED_SIMULATOR'
  | 'INDEPENDENT_INVESTIGATOR';

export type NarrativeEthicsAlignment =
  | 'STRICT_PROCEDURAL'     // Adheres strictly to corporate handbook and management chain
  | 'ETHICAL_MENTOR'        // Prioritizes protecting young talent (e.g. Marcus) from corporate scapegoating
  | 'UNCOMPROMISING_TRUTH'  // Whistleblower approach, insists on full unvarnished disclosure
  | 'PRAGMATIC_COMMERCIAL'; // Balances client liability, PR impact, and business continuity

export interface NarrativeStoryFlag {
  readonly flagKey: string;
  readonly description: string;
  readonly category: 'INCIDENT_OUTCOME' | 'RELATIONSHIP_CONSEQUENCE' | 'REPUTATION_TIER';
  readonly defaultValue: boolean;
}

export const PERSISTENT_NARRATIVE_FLAGS: readonly NarrativeStoryFlag[] = [
  {
    flagKey: 'flag_marcus_protected',
    description: 'Player collaborated with Marcus to remediate Aster IAM credentials without reporting him to VP Femi Martins.',
    category: 'RELATIONSHIP_CONSEQUENCE',
    defaultValue: false,
  },
  {
    flagKey: 'flag_marcus_exposed',
    description: 'Player formally cited Marcus Adebayo as the root cause in the executive audit report.',
    category: 'RELATIONSHIP_CONSEQUENCE',
    defaultValue: false,
  },
  {
    flagKey: 'flag_aster_quiet_remediation',
    description: 'The over-privileged svc-aster role was silently restricted without disrupting business operations.',
    category: 'INCIDENT_OUTCOME',
    defaultValue: false,
  },
  {
    flagKey: 'flag_femi_audit_passed',
    description: 'VP Femi Martins accepted the compliance report, unlocking enterprise consulting referrals.',
    category: 'INCIDENT_OUTCOME',
    defaultValue: false,
  },
  {
    flagKey: 'flag_bounty_independent_claimed',
    description: 'Player submitted prompt-injection proof-of-concept to Eko Bounty Network for independent payout.',
    category: 'REPUTATION_TIER',
    defaultValue: false,
  },
  {
    flagKey: 'flag_usb_airgap_analyzed',
    description: 'Curbside USB drive was safely analyzed in the Broad Street air-gapped lab before reporting to SOC.',
    category: 'INCIDENT_OUTCOME',
    defaultValue: false,
  },
  {
    flagKey: 'flag_physical_tailgating_reported',
    description: 'Security officers were notified of unescorted visitor tailgating at Level 4 server room.',
    category: 'INCIDENT_OUTCOME',
    defaultValue: false,
  },
];

export interface RoleInvestigationApproach {
  readonly role: InvestigativeRole;
  readonly roleTitle: string;
  readonly primaryObjective: string;
  readonly requiredEvidenceTypes: readonly string[];
  readonly keyToolsUsed: readonly string[];
  readonly clientDeliverable: string;
  readonly rewardXp: number;
  readonly rewardKobo: number;
}

export interface MultiRoleInvestigationScenario {
  readonly scenarioId: string;
  readonly title: string;
  readonly incidentId: string;
  readonly narrativeHook: string;
  readonly primaryFactions: readonly string[];
  readonly involvedNpcIds: readonly string[];
  readonly approaches: Readonly<Record<InvestigativeRole, RoleInvestigationApproach>>;
}

export const MULTI_ROLE_SCENARIOS: readonly MultiRoleInvestigationScenario[] = [
  // 1. The Aster Incident
  {
    scenarioId: 'scen_aster_incident_multirole',
    title: 'The Aster Agent Indirect Prompt Injection Incident',
    incidentId: 'the_aster_incident',
    narrativeHook:
      'Autonomous customer assistant Aster begins executing unauthorized SMB queries across Cedarline corporate file shares after handling customer support tickets.',
    primaryFactions: ['Cedarline Services Ltd', 'Eko Tech Partners', 'Independent Research Network'],
    involvedNpcIds: ['npc_amina', 'npc_marcus', 'npc_elena', 'npc_femi', 'npc_tunde'],
    approaches: {
      BLUE_DEFENDER: {
        role: 'BLUE_DEFENDER',
        roleTitle: 'Corporate Incident Responder',
        primaryObjective: 'Isolate compromised service account, preserve log integrity, and restore SLA compliance.',
        requiredEvidenceTypes: ['siem_event_log', 'cryptographic_hash', 'incident_report'],
        keyToolsUsed: ['tool_netmap', 'tool_svcscan', 'tool_logview', 'tool_evidence', 'tool_incident'],
        clientDeliverable: 'Certified Incident Remediation & Root Cause Report',
        rewardXp: 300,
        rewardKobo: 250_000, // ₦2,500.00
      },
      PURPLE_ENGINEER: {
        role: 'PURPLE_ENGINEER',
        roleTitle: 'Detection Validation Engineer',
        primaryObjective: 'Emulate Aster prompt injection attack path and author Sigma rules detecting service account anomalies.',
        requiredEvidenceTypes: ['detection_rule', 'pcap_packet_trace'],
        keyToolsUsed: ['tool_packet_lens', 'tool_rule_tuner', 'tool_logview'],
        clientDeliverable: 'Sigma Detection Rule Package & Attack Emulation Validation Trace',
        rewardXp: 350,
        rewardKobo: 280_000,
      },
      RED_SIMULATOR: {
        role: 'RED_SIMULATOR',
        roleTitle: 'Authorized Penetration Tester',
        primaryObjective: 'Demonstrate proof-of-concept lateral traversal via svc-aster wildcard permissions under strict RoE.',
        requiredEvidenceTypes: ['vulnerability_finding', 'network_scan_report'],
        keyToolsUsed: ['tool_recon_path', 'tool_netmap', 'tool_svcscan'],
        clientDeliverable: 'Executive Pen Test Finding with CVSS Risk Rating',
        rewardXp: 320,
        rewardKobo: 260_000,
      },
      INDEPENDENT_INVESTIGATOR: {
        role: 'INDEPENDENT_INVESTIGATOR',
        roleTitle: 'Forensic Integrity Auditor & Bounty Hunter',
        primaryObjective: 'Reconstruct independent tamper-proof timeline, audit vendor liability, and claim vulnerability bounty.',
        requiredEvidenceTypes: ['chain_of_custody_record', 'forensic_artifact'],
        keyToolsUsed: ['tool_evidence', 'tool_files', 'tool_logview'],
        clientDeliverable: 'Independent Forensic Verification & Bug Bounty Disclosure',
        rewardXp: 340,
        rewardKobo: 300_000,
      },
    },
  },

  // 2. Curbside Removable Media Incident
  {
    scenarioId: 'scen_removable_media_multirole',
    title: 'Curbside Removable Media Beaconing Incident',
    incidentId: 'INC-2026-PHYS-002',
    narrativeHook:
      'A weathered USB drive labeled "Q4 Payroll Audit" dropped near Broad Street Danfo stop is connected to an unisolated Finance workstation.',
    primaryFactions: ['Cedarline Services Ltd', 'Lagos Island Cyber Defense Lab'],
    involvedNpcIds: ['npc_amina', 'npc_marcus', 'npc_nkechi', 'npc_tunde'],
    approaches: {
      BLUE_DEFENDER: {
        role: 'BLUE_DEFENDER',
        roleTitle: 'Endpoint Defense Analyst',
        primaryObjective: 'Triage SIEM alert, isolate ws-fin-04 from the corporate LAN, and revoke affected credentials.',
        requiredEvidenceTypes: ['siem_event_log', 'cryptographic_hash'],
        keyToolsUsed: ['tool_logview', 'tool_evidence', 'tool_aster_admin'],
        clientDeliverable: 'Host Quarantine Record & Disinfection Certificate',
        rewardXp: 280,
        rewardKobo: 220_000,
      },
      PURPLE_ENGINEER: {
        role: 'PURPLE_ENGINEER',
        roleTitle: 'Endpoint Detection Engineer',
        primaryObjective: 'Analyze parent-child telemetry (explorer.exe -> cscript.exe) and tune EDR process creation detection rules.',
        requiredEvidenceTypes: ['detection_rule', 'siem_event_log'],
        keyToolsUsed: ['tool_rule_tuner', 'tool_logview'],
        clientDeliverable: 'Removable Media Execution Detection Rule Specification',
        rewardXp: 300,
        rewardKobo: 240_000,
      },
      RED_SIMULATOR: {
        role: 'RED_SIMULATOR',
        roleTitle: 'Physical Red Team Specialist',
        primaryObjective: 'Evaluate facility receptionist visitor procedures and test badge escort controls under signed RoE.',
        requiredEvidenceTypes: ['vulnerability_finding'],
        keyToolsUsed: ['tool_recon_path', 'tool_netmap'],
        clientDeliverable: 'Physical Security & Social Engineering Assessment Report',
        rewardXp: 310,
        rewardKobo: 250_000,
      },
      INDEPENDENT_INVESTIGATOR: {
        role: 'INDEPENDENT_INVESTIGATOR',
        roleTitle: 'Air-Gapped Forensic Investigator',
        primaryObjective: 'Safely mount device in isolated air-gapped lab, extract LNK payload hash, and trace vendor supply chain origin.',
        requiredEvidenceTypes: ['forensic_artifact', 'cryptographic_hash'],
        keyToolsUsed: ['tool_evidence', 'tool_files'],
        clientDeliverable: 'Physical Device Forensic Examination Report',
        rewardXp: 330,
        rewardKobo: 270_000,
      },
    },
  },
];

export function getScenarioForRole(
  scenarioId: string,
  role: InvestigativeRole
): RoleInvestigationApproach | undefined {
  const scenario = MULTI_ROLE_SCENARIOS.find(s => s.scenarioId === scenarioId);
  return scenario?.approaches[role];
}
