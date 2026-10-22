/**
 * Cyberlife: Milestone 14: Authored Narrative Data
 *
 * Authored definitions for Factions, Story Arcs, Chapters, Missions, and Investigative Conclusions.
 */

import {
  FactionDefinition,
  StoryArcDefinition,
  StoryChapterDefinition,
  NarrativeMissionDefinition,
  InvestigativeConclusion,
} from './narrativeTypes';

// ============================================================================
// FACTIONS
// ============================================================================

export const FACTION_DEFINITIONS: readonly FactionDefinition[] = [
  {
    id: 'faction_cedarline',
    name: 'Cedarline Services Ltd.',
    shortName: 'Cedarline',
    category: 'CORPORATE',
    description: 'Enterprise cloud infrastructure and logistics platforms provider headquartered at Marina Tower.',
    headquartersLocationId: 'cedarline_interior',
    initialStanding: 10,
    alliedFactionIds: ['faction_eko_bank'],
    rivalFactionIds: ['faction_inquirer', 'faction_0xlagos'],
    perksSummary: ['Access to Marina Tower Floor 14 SOC', 'Enterprise Incident Response Retainers'],
  },
  {
    id: 'faction_eko_bank',
    name: 'Eko Merchant Bank',
    shortName: 'EMB',
    category: 'FINANCIAL',
    description: 'Tier-1 commercial bank on Broad Street managing interbank settlement and corporate trade finance.',
    headquartersLocationId: 'neighborhood',
    initialStanding: 0,
    alliedFactionIds: ['faction_cedarline', 'faction_krest_ir'],
    rivalFactionIds: ['faction_crcii'],
    perksSummary: ['Broad Street Financial Clearance', 'High-value banking penetration test contracts'],
  },
  {
    id: 'faction_krest_ir',
    name: 'Krest Incident Response & Data Solutions',
    shortName: 'Krest IR',
    category: 'MSSP',
    description: 'High-end corporate cybersecurity consulting firm specializing in confidential breach containment.',
    headquartersLocationId: 'neighborhood',
    initialStanding: -5,
    alliedFactionIds: ['faction_eko_bank'],
    rivalFactionIds: ['faction_0xlagos', 'faction_inquirer'],
    perksSummary: ['Proprietary digital forensics tools', 'Lucrative crisis consulting contracts'],
  },
  {
    id: 'faction_0xlagos',
    name: '0xLagos Research Syndicate',
    shortName: '0xLagos',
    category: 'COMMUNITY',
    description: 'Decentralized collective of ethical hackers and vulnerability researchers meeting along Marina Seawall.',
    headquartersLocationId: 'neighborhood',
    initialStanding: 5,
    alliedFactionIds: ['faction_inquirer'],
    rivalFactionIds: ['faction_cedarline', 'faction_krest_ir'],
    perksSummary: ['Bug bounty network payouts', 'Custom zero-day mitigation scripts'],
  },
  {
    id: 'faction_inquirer',
    name: 'The Lagos Inquirer',
    shortName: 'The Inquirer',
    category: 'MEDIA',
    description: 'Independent investigative newsroom at Tinubu Square exposing corporate negligence and public corruption.',
    headquartersLocationId: 'neighborhood',
    initialStanding: 0,
    alliedFactionIds: ['faction_0xlagos', 'faction_crcii'],
    rivalFactionIds: ['faction_cedarline', 'faction_krest_ir'],
    perksSummary: ['Whistleblower legal protection', 'Public disclosure platform'],
  },
  {
    id: 'faction_crcii',
    name: 'Civic Rights & Cyber Integrity Initiative',
    shortName: 'CRCII',
    category: 'CIVIL_SOCIETY',
    description: 'Public-interest digital rights NGO fighting tenant privacy violations and financial consumer fraud.',
    headquartersLocationId: 'neighborhood',
    initialStanding: 10,
    alliedFactionIds: ['faction_inquirer', 'faction_balogun_traders'],
    rivalFactionIds: ['faction_eko_bank'],
    perksSummary: ['Pro bono legal defense', 'Consumer protection audit tenders'],
  },
  {
    id: 'faction_balogun_traders',
    name: 'Balogun Traders Electronic Union',
    shortName: 'Balogun Union',
    category: 'COMMUNITY',
    description: 'Merchant association coordinating security and trade for hundreds of market electronics stalls.',
    headquartersLocationId: 'neighborhood',
    initialStanding: 15,
    alliedFactionIds: ['faction_crcii'],
    rivalFactionIds: [],
    perksSummary: ['Discounted electronics parts', 'Street-level human intelligence network'],
  },
  {
    id: 'faction_ndsrc',
    name: 'National Digital Security Regulatory Commission',
    shortName: 'NDSRC',
    category: 'REGULATORY',
    description: 'Statutory agency enforcing national cybersecurity frameworks and critical infrastructure standards.',
    headquartersLocationId: 'neighborhood',
    initialStanding: 0,
    alliedFactionIds: [],
    rivalFactionIds: [],
    perksSummary: ['Official expert witness accreditation', 'Statutory audit authority'],
  },
];

// ============================================================================
// STORY ARCS
// ============================================================================

export const STORY_ARCS: readonly StoryArcDefinition[] = [
  {
    id: 'arc_aster_incident',
    title: 'The Aster Anomaly',
    description:
      'Investigate the over-privileged autonomous assistant breach at Cedarline Services, uncover the prompt injection vector, and decide the fate of junior administrator Barry.',
    category: 'CORE_MYSTERY',
    chapterIds: ['ch_triage_broad_street', 'ch_infrastructure_dilemma', 'ch_containment_remediation'],
    completionRewards: {
      rewardXp: 500,
      rewardKobo: 300_000,
      factionStandingDeltas: {
        faction_cedarline: 20,
      },
      setFlags: {
        flag_arc_aster_completed: true,
      },
    },
  },
  {
    id: 'arc_eko_nexus',
    title: 'The Eko Nexus Pipeline',
    description:
      'Trace the anomalous cross-tenant queries from Cedarline into Eko Merchant Bank and analyze the curbside removable media beacon found near Broad Street.',
    category: 'CORE_MYSTERY',
    chapterIds: ['ch_curbside_beacon', 'ch_balogun_whispers', 'ch_interbank_staging'],
    prerequisites: {
      requiredFlags: {
        flag_arc_aster_completed: true,
      },
    },
    completionRewards: {
      rewardXp: 750,
      rewardKobo: 500_000,
      setFlags: {
        flag_arc_nexus_completed: true,
      },
    },
  },
  {
    id: 'arc_sovereign_corridor',
    title: 'Shadows Over Marina Tower',
    description:
      'Synthesize preserved digital evidence, confront corporate leadership, and present verified findings to the chosen authority (Management, Regulators, Press, or Syndicate).',
    category: 'CORE_MYSTERY',
    chapterIds: ['ch_whistleblower_ledger', 'ch_grand_presentation'],
    prerequisites: {
      requiredFlags: {
        flag_arc_nexus_completed: true,
      },
    },
    completionRewards: {
      rewardXp: 1200,
      rewardKobo: 1_000_000,
      setFlags: {
        flag_campaign_completed: true,
      },
    },
  },
];

// ============================================================================
// CHAPTERS
// ============================================================================

export const STORY_CHAPTERS: readonly StoryChapterDefinition[] = [
  // Arc 1 Chapters
  {
    id: 'ch_triage_broad_street',
    arcId: 'arc_aster_incident',
    chapterNumber: 1,
    title: 'Triage on Broad Street',
    synopsis: 'Meet Lead Analyst Blessing in the Cedarline SOC, scan the local corporate subnet, and review SIEM alert telemetry.',
    missionIds: ['miss_triage_alert'],
  },
  {
    id: 'ch_infrastructure_dilemma',
    arcId: 'arc_aster_incident',
    chapterNumber: 2,
    title: 'The Infrastructure Dilemma',
    synopsis: 'Interview Barry and Mercy to discover how svc-aster received wildcard permissions and who crafted the prompt injection.',
    missionIds: ['miss_audit_credentials'],
    branchingPaths: [
      {
        conditionFlags: ['flag_marcus_protected'],
        nextChapterId: 'ch_containment_remediation',
        description: 'Collaborate with Barry to remediate credentials without corporate exposure.',
      },
      {
        conditionFlags: ['flag_marcus_exposed'],
        nextChapterId: 'ch_containment_remediation',
        description: 'Formally cite Barry in the incident report to executive management.',
      },
    ],
  },
  {
    id: 'ch_containment_remediation',
    arcId: 'arc_aster_incident',
    chapterNumber: 3,
    title: 'Containment & Remediation',
    synopsis: 'Preserve cryptographic evidence, isolate svc-aster, apply least-privilege IAM policy, and file the certified report.',
    missionIds: ['miss_contain_remediate'],
  },

  // Arc 2 Chapters
  {
    id: 'ch_curbside_beacon',
    arcId: 'arc_eko_nexus',
    chapterNumber: 4,
    title: 'The Curbside Beacon',
    synopsis: 'Examine a dropped USB drive safely in the air-gapped lab and trace physical access badges at Marina Tower.',
    missionIds: ['miss_curbside_forensics'],
  },
  {
    id: 'ch_balogun_whispers',
    arcId: 'arc_eko_nexus',
    chapterNumber: 5,
    title: 'Whispers in Balogun Market',
    synopsis: 'Help Mama Esther triage suspicious POS merchant terminals and meet Tsharp along the Marina Seawall.',
    missionIds: ['miss_balogun_pos_audit'],
  },
  {
    id: 'ch_interbank_staging',
    arcId: 'arc_eko_nexus',
    chapterNumber: 6,
    title: 'The Interbank Infiltration',
    synopsis: 'Audit the cross-tenant clearing gateway connecting Cedarline and Eko Merchant Bank under authorized rules of engagement.',
    missionIds: ['miss_interbank_staging'],
  },

  // Arc 3 Chapters
  {
    id: 'ch_whistleblower_ledger',
    arcId: 'arc_sovereign_corridor',
    chapterNumber: 7,
    title: 'The Whistleblower’s Ledger',
    synopsis: 'Assemble corroborating forensic evidence proving root cause, systemic negligence, or intentional tampering.',
    missionIds: ['miss_whistleblower_disclosure'],
  },
  {
    id: 'ch_grand_presentation',
    arcId: 'arc_sovereign_corridor',
    chapterNumber: 8,
    title: 'The Grand Presentation',
    synopsis: 'Formulate your final investigative conclusion and submit the package to your chosen stakeholder.',
    missionIds: ['miss_final_presentation'],
  },
];

// ============================================================================
// NARRATIVE MISSIONS
// ============================================================================

export const NARRATIVE_MISSIONS: readonly NarrativeMissionDefinition[] = [
  // Arc 1 Missions
  {
    id: 'miss_triage_alert',
    chapterId: 'ch_triage_broad_street',
    title: 'Triage the Aster Anomaly',
    summary: 'Receive initial briefing from Blessing and inspect Cedarline subnet hosts and authentication alerts.',
    briefing:
      'Lead Security Analyst Blessing flagged an anomalous SMB query originating from app-portal-01 targeting filesrv-01. Initiate triage and locate active hosts.',
    assignedFactionId: 'faction_cedarline',
    investigativeRole: 'BLUE_DEFENDER',
    clearanceLevelRequired: 1,
    allowedSubnets: ['10.0.4.0/24'],
    objectives: [
      {
        id: 'obj_triage_speak_amina',
        type: 'INTERVIEW_WITNESS',
        title: 'Speak with Lead Analyst Blessing',
        description: 'Meet Blessing in the Cedarline SOC or open the Incident Portal app on your workstation.',
        hint: 'Blessing is at the main SOC console near the office entrance.',
        targetId: 'npc_amina',
      },
      {
        id: 'obj_triage_scan_subnet',
        type: 'INVESTIGATE_EVIDENCE',
        title: 'Discover Corporate Subnet Nodes',
        description: "Run 'netmap hosts' in the terminal to identify app-portal-01 and filesrv-01.",
        hint: 'Open Terminal and scan discovered inventory.',
        targetId: 'app-portal-01',
      },
      {
        id: 'obj_triage_review_logs',
        type: 'INVESTIGATE_EVIDENCE',
        title: 'Audit Anomalous Authentication Logs',
        description: "Query security logs using 'logview filter --severity=WARN' to isolate svc-aster queries.",
        hint: 'Inspect authentication logs around timestamp 07:42.',
        targetId: 'LOG-2026-103B',
      },
    ],
    consequences: {
      rewardXp: 150,
      rewardKobo: 100_000,
      factionStandingDeltas: {
        faction_cedarline: 5,
      },
    },
  },
  {
    id: 'miss_audit_credentials',
    chapterId: 'ch_infrastructure_dilemma',
    title: 'Audit the Over-Scoped Credentials',
    summary: 'Confront junior administrator Barry and AI Engineer Mercy regarding svc-aster permissions.',
    briefing:
      'The service account svc-aster possesses wildcard corporate-admin scopes. Determine who assigned this policy and whether prompt injection bypassed boundary controls.',
    assignedFactionId: 'faction_cedarline',
    clearanceLevelRequired: 1,
    objectives: [
      {
        id: 'obj_audit_speak_marcus',
        type: 'INTERVIEW_WITNESS',
        title: 'Interview Junior Administrator Barry',
        description: 'Locate Barry near the server rack room or Broad Street to question his role assignment.',
        hint: 'Barry is pacing nervously near the rack enclosures.',
        targetId: 'npc_marcus',
        alternativeObjectiveId: 'obj_audit_marcus_phone_call',
        failureRecoveryDescription: 'If Barry refuses to speak, inspect his discarded terminal commit notes.',
      },
      {
        id: 'obj_audit_marcus_phone_call',
        type: 'INTERVIEW_WITNESS',
        title: 'Examine Barry’s Infrastructure Commit History',
        description: 'Recover Barry’s staging notes regarding the emergency deployment deadline.',
        isOptional: true,
        targetId: 'marcus_commit_logs',
      },
      {
        id: 'obj_audit_speak_elena',
        type: 'INTERVIEW_WITNESS',
        title: 'Consult Lead AI Engineer Mercy',
        description: 'Review the Aster agent tool-calling loop and system prompt guardrails with Mercy.',
        targetId: 'npc_elena',
      },
    ],
    consequences: {
      rewardXp: 200,
      rewardKobo: 120_000,
      relationshipDeltas: {
        npc_amina: 5,
      },
    },
  },
  {
    id: 'miss_contain_remediate',
    chapterId: 'ch_containment_remediation',
    title: 'Contain and Remediate Aster Service',
    summary: 'Preserve forensic evidence artifacts, isolate svc-aster, apply least-privilege IAM policy, and file certified incident report.',
    briefing:
      'Execute authorized containment to stop unauthorized queries, downgrade the policy role to kb-assistant, and verify system recovery.',
    assignedFactionId: 'faction_cedarline',
    investigativeRole: 'BLUE_DEFENDER',
    clearanceLevelRequired: 2,
    objectives: [
      {
        id: 'obj_contain_preserve_evidence',
        type: 'INVESTIGATE_EVIDENCE',
        title: 'Preserve Cryptographic Evidence Artifacts',
        description: 'Capture SHA-256 snapshots of EVD-2026-001 through EVD-2026-004 in the Incident Portal.',
        requiredEvidenceIds: ['EVD-2026-001', 'EVD-2026-004'],
      },
      {
        id: 'obj_contain_execute_isolation',
        type: 'CONTAIN_SERVICE',
        title: 'Isolate Aster Core Service Account',
        description: "Execute authorized containment using 'aster-admin contain' or the Incident Portal.",
        targetId: 'svc-aster',
      },
      {
        id: 'obj_contain_apply_policy',
        type: 'REMEDIATE_POLICY',
        title: 'Apply Least-Privilege IAM Policy',
        description: "Reconfigure Aster to 'kb-assistant' role removing SMB and direct database access.",
        targetId: 'kb-assistant',
      },
      {
        id: 'obj_contain_verify_recovery',
        type: 'RUN_VERIFICATION',
        title: 'Execute Recovery & Security Verification Suite',
        description: 'Run automated verification tests proving legitimate queries succeed and unauthorized access is blocked.',
      },
    ],
    consequences: {
      rewardXp: 300,
      rewardKobo: 250_000,
      setFlags: {
        flag_aster_remediation_completed: true,
      },
      factionStandingDeltas: {
        faction_cedarline: 15,
      },
    },
  },

  // Arc 2 Missions
  {
    id: 'miss_curbside_forensics',
    chapterId: 'ch_curbside_beacon',
    title: 'Curbside USB Forensic Carving',
    summary: 'Safely mount and carve forensic artifacts from dropped USB media inside the Broad Street air-gapped lab.',
    briefing:
      'A weathered USB drive labeled "Q4 Payroll Audit" was found at the Broad Street Danfo stop. Analyze its contents in the air-gapped lab without connecting to production.',
    assignedFactionId: 'faction_crcii',
    investigativeRole: 'INDEPENDENT_INVESTIGATOR',
    objectives: [
      {
        id: 'obj_usb_mount_airgap',
        type: 'SECURE_PHYSICAL_ACCESS',
        title: 'Enter Air-Gapped Forensic Lab',
        description: 'Proceed to the isolated hardware workbench at Adeola Street.',
        targetId: 'airgap_lab',
      },
      {
        id: 'obj_usb_carve_artifacts',
        type: 'INVESTIGATE_EVIDENCE',
        title: 'Carve Filesystem Artifacts',
        description: 'Extract staging scripts and cryptographic keys from the flash storage partition.',
        targetId: 'EVD-2026-PHYS-001',
      },
    ],
    consequences: {
      rewardXp: 250,
      rewardKobo: 150_000,
      setFlags: {
        flag_usb_airgap_analyzed: true,
      },
      factionStandingDeltas: {
        faction_crcii: 10,
        faction_0xlagos: 10,
      },
    },
  },
  {
    id: 'miss_balogun_pos_audit',
    chapterId: 'ch_balogun_whispers',
    title: 'Balogun Market POS Terminal Audit',
    summary: 'Assist Mama Esther by analyzing counterfeit firmware and SMS phishing patterns affecting market merchants.',
    briefing:
      'Balogun electronics traders are being hit by fraudulent POS firmware that intercepts customer debit cards. Inspect the terminal dumps for connections to Eko Nexus.',
    assignedFactionId: 'faction_balogun_traders',
    investigativeRole: 'PURPLE_ENGINEER',
    objectives: [
      {
        id: 'obj_pos_speak_nkechi',
        type: 'INTERVIEW_WITNESS',
        title: 'Meet with Mama Esther',
        description: 'Visit Mama Esther’s electronics stall in Balogun Market to collect the suspect POS unit.',
        targetId: 'npc_nkechi',
      },
      {
        id: 'obj_pos_firmware_diff',
        type: 'INVESTIGATE_EVIDENCE',
        title: 'Inspect Terminal Firmware Variance',
        description: 'Compare suspect firmware against vendor reference signatures.',
        targetId: 'EVD-2026-POS-002',
      },
    ],
    consequences: {
      rewardXp: 300,
      rewardKobo: 180_000,
      relationshipDeltas: {
        npc_nkechi: 15,
      },
      factionStandingDeltas: {
        faction_balogun_traders: 20,
      },
    },
  },
  {
    id: 'miss_interbank_staging',
    chapterId: 'ch_interbank_staging',
    title: 'Eko Nexus Gateway Security Audit',
    summary: 'Conduct authorized assessment of the interbank clearing gateway connecting Cedarline and Eko Merchant Bank.',
    briefing:
      'Under strict Rules of Engagement, use Web Application Proxy to evaluate BOLA/IDOR access controls on the interbank staging endpoint.',
    assignedFactionId: 'faction_eko_bank',
    investigativeRole: 'RED_SIMULATOR',
    allowedSubnets: ['10.0.5.0/24'],
    objectives: [
      {
        id: 'obj_interbank_roe_review',
        type: 'AUDIT_CREDENTIALS',
        title: 'Review Authorized Rules of Engagement',
        description: 'Verify RoE authorization bounds before initiating web proxy inspection.',
        targetId: 'ROE-2026-RED-001',
      },
      {
        id: 'obj_interbank_proxy_tamper',
        type: 'INVESTIGATE_EVIDENCE',
        title: 'Identify BOLA/IDOR Data Leak',
        description: 'Replay modified requests against app-portal-01 to demonstrate unauthorized record exposure.',
        targetId: 'EVD-2026-WEB-003',
      },
    ],
    consequences: {
      rewardXp: 400,
      rewardKobo: 300_000,
      factionStandingDeltas: {
        faction_eko_bank: 15,
      },
    },
  },

  // Arc 3 Missions
  {
    id: 'miss_whistleblower_disclosure',
    chapterId: 'ch_whistleblower_ledger',
    title: 'The Whistleblower’s Ledger',
    summary: 'Gather all corroborating evidence packages and meet with an external authority to prepare the final disclosure.',
    briefing:
      'The complete picture of the Eko Nexus breach is now clear. Correlate technical artifacts, interview transcripts, and cryptographic hashes.',
    objectives: [
      {
        id: 'obj_whistleblower_assemble_evidence',
        type: 'INVESTIGATE_EVIDENCE',
        title: 'Synthesize Verified Evidence Package',
        description: 'Ensure critical evidence items are preserved in your Evidence Vault.',
        requiredEvidenceIds: ['EVD-2026-001', 'EVD-2026-004'],
      },
      {
        id: 'obj_whistleblower_consult_authority',
        type: 'INTERVIEW_WITNESS',
        title: 'Consult Independent Stakeholder',
        description: 'Meet Mary at Tinubu Square or Tsharp at Marina Seawall.',
        targetId: 'npc_tunde',
      },
    ],
    consequences: {
      rewardXp: 500,
      rewardKobo: 250_000,
      setFlags: {
        flag_whistleblower_ledger_ready: true,
      },
    },
  },
  {
    id: 'miss_final_presentation',
    chapterId: 'ch_grand_presentation',
    title: 'The Sovereign Resolution',
    summary: 'Formulate your definitive investigative conclusion and submit it to determine the fate of the Marina corridor.',
    briefing:
      'Submit your final investigative conclusion to Cedarline Management, the NDSRC Regulatory Commission, The Lagos Inquirer, or 0xLagos.',
    objectives: [
      {
        id: 'obj_final_formulate_conclusion',
        type: 'INVESTIGATE_EVIDENCE',
        title: 'Formulate Investigative Conclusion',
        description: 'Select and formulate your substantiated theory in the Incident Portal.',
      },
      {
        id: 'obj_final_submit_resolution',
        type: 'PUBLISH_DISCLOSURE',
        title: 'Submit Final Finding Package',
        description: 'Deliver the verified dossier to your chosen recipient faction.',
      },
    ],
    consequences: {
      rewardXp: 800,
      rewardKobo: 500_000,
      setFlags: {
        flag_final_resolution_submitted: true,
      },
    },
  },
];

// ============================================================================
// INVESTIGATIVE CONCLUSIONS
// ============================================================================

export const INVESTIGATIVE_CONCLUSIONS: readonly InvestigativeConclusion[] = [
  {
    id: 'conc_marcus_scapegoat',
    arcId: 'arc_aster_incident',
    title: 'Theory A: Corporate Cover-Up & Scapegoating',
    hypothesis:
      'Cedarline executive management intentionally bypassed mandatory security reviews ahead of a foreign acquisition audit, coercing junior admin Barry into assigning wildcard IAM permissions and subsequently attempting to position him as the sole responsible party.',
    requiredEvidenceIds: ['EVD-2026-001', 'EVD-2026-002', 'EVD-2026-004'],
    corroboratingLogIds: ['LOG-2026-103B', 'LOG-2026-107B'],
    validatingRole: 'INDEPENDENT_INVESTIGATOR',
    confidenceScore: 92,
    conclusionType: 'EXECUTIVE_COVERUP',
  },
  {
    id: 'conc_financial_espionage',
    arcId: 'arc_eko_nexus',
    title: 'Theory B: Targeted Financial Espionage via Eko Nexus',
    hypothesis:
      'A sophisticated external actor crafted an indirect prompt injection payload specifically designed to traverse Cedarline’s cross-tenant interconnect into Eko Merchant Bank staging tables, attempting to extract executive compensation and credit scoring models.',
    requiredEvidenceIds: ['EVD-2026-001', 'EVD-2026-003'],
    corroboratingLogIds: ['LOG-2026-109B'],
    validatingRole: 'BLUE_DEFENDER',
    confidenceScore: 88,
    conclusionType: 'MALICIOUS_INTRUSION',
  },
  {
    id: 'conc_phantom_weaver',
    arcId: 'arc_eko_nexus',
    title: 'Theory C: Phantom Weaver Autonomous Agent Contagion',
    hypothesis:
      'The incident was triggered by an autonomous prompt injection worm ("Phantom Weaver") circulating across West African enterprise APIs, exploiting unconstrained agentic tool-calling loops without human verification gates.',
    requiredEvidenceIds: ['EVD-2026-001', 'EVD-2026-004'],
    corroboratingLogIds: ['LOG-2026-103B'],
    validatingRole: 'PURPLE_ENGINEER',
    confidenceScore: 85,
    conclusionType: 'SUPPLY_CHAIN_TAMPERING',
  },
  {
    id: 'conc_forced_audit',
    arcId: 'arc_sovereign_corridor',
    title: 'Theory D: Internal Whistleblower Forced Audit',
    hypothesis:
      'An internal whistleblower with knowledge of systemic cloud data exposure deliberately fed the prompt payload to Aster to trigger an undeniable SOC alert, forcing an external regulatory audit before live customer funds were compromised.',
    requiredEvidenceIds: ['EVD-2026-001', 'EVD-2026-002', 'EVD-2026-004'],
    corroboratingLogIds: ['LOG-2026-107B', 'LOG-2026-109B'],
    validatingRole: 'INDEPENDENT_INVESTIGATOR',
    confidenceScore: 90,
    conclusionType: 'WHISTLEBLOWER_FORCED_AUDIT',
  },
];
