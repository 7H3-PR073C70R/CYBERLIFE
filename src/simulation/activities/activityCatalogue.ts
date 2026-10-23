/**
 * Cyberlife — Milestone 20: Authored Activity Catalogue & Procedural Contract Generator
 *
 * Provides a rich set of cybersecurity activities across the Lagos Island tech landscape:
 * - High-stakes Broad Street banking hubs & merchant networks
 * - Incident investigation & forensics
 * - Authorized Red Team assessments
 * - Blue Team & Purple Team defense operations
 * - Freelance bug bounty contracts
 * - Career progression and continuous life simulation goals
 *
 * STRICT SAFETY BOUNDARY:
 * 100% simulated in-memory activities.
 */

import type {
  ActivityDefinition,
  ActivityRuntimeState,
  ActivityDirectorState,
  LongTermCareerGoal,
} from './types';
import type { CareerPathId } from '../career/types';

export const AUTHORED_ACTIVITIES: Readonly<Record<string, ActivityDefinition>> = {
  // 1. Primary Story Mission — The Aster Incident
  act_story_aster_investigation: {
    id: 'act_story_aster_investigation',
    type: 'STORY_MISSION',
    title: 'The Aster Incident: Containment & Remediation',
    shortTitle: 'Aster Incident',
    description:
      'Investigate the over-privileged svc-aster knowledgebase agent at Cedarline InfoSec, contain unauthorized SMB/DB traversal, and submit an executive remediation report.',
    narrativeContext:
      'A late-night telemetry anomaly indicates Cedarline internal systems were probed by an AI service account with administrative delegation.',
    source: 'SecOps Dispatch',
    priority: 'PRIMARY_OBJECTIVE',
    locationId: 'cedarline_interior',
    prerequisites: {
      minCareerLevel: 1,
    },
    objectives: [
      {
        id: 'obj_aster_inspect_logs',
        title: 'Analyze Ingestion Logs',
        description: 'Examine suspicious authentication logs from 10.0.4.15 and 10.0.4.20.',
        type: 'RUN_TOOL',
        target: 'logview',
        isCompleted: false,
        hint: 'Use the LogView tool or Terminal command `logview --inspect` to review security logs.',
        actionPrompt: 'Inspect authentication and query logs in LogView.',
        explanation: 'Auditing access logs reveals token abuse and query injection patterns.',
      },
      {
        id: 'obj_aster_contain_service',
        title: 'Apply Least-Privilege Containment',
        description: 'Constrain the svc-aster service role to kb-assistant and revoke database access.',
        type: 'EXECUTE_ACTION',
        target: 'containment_policy',
        isCompleted: false,
        hint: 'Adjust operational policy role from corporate-admin to kb-assistant in Policy Manager.',
        actionPrompt: 'Update service role in Incident Portal or Terminal.',
        explanation: 'Restricting service account permissions immediately isolates compromised credentials.',
      },
      {
        id: 'obj_aster_submit_report',
        title: 'Submit Incident Closure Report',
        description: 'Formulate findings, verify SMB isolation, and submit approved incident debrief.',
        type: 'SUBMIT_REPORT',
        target: 'incident_report',
        isCompleted: false,
        hint: 'Review verification telemetry and submit the incident report in Incident Portal.',
        actionPrompt: 'Submit completed report for SecOps approval.',
        explanation: 'Documenting root cause and remediation prevents systemic recurrence.',
      },
    ],
    reward: {
      payoutKobo: 250_000, // ₦2,500.00
      careerXp: 180,
      skillRewards: {
        incident_response: 120,
        log_analysis: 100,
        evidence_handling: 80,
      },
      reputationPoints: 45,
      factionStanding: { factionId: 'cedarline_secops', delta: 15 },
      unlockedActivityIds: ['act_blue_broad_street_triage', 'act_story_broad_street_intel'],
      // M21: completing Aster opens the human-intelligence follow-up investigations
      flagsToSet: { mission_aster_completed: true, m21_humint_unlocked: true },
    },
    consequences: {
      reputationPenalty: 10,
      recoveryGuidance: 'Review log indicators again and ensure service policy is reverted before resubmitting.',
    },
    isRepeatable: false,
    whyRecommended: 'Initial orientation and central investigation at Cedarline Security.',
    relatedEntityId: 'the_aster_incident',
  },

  // 2. Threat Intelligence & Network Investigation — Broad Street Syndicate
  act_story_broad_street_intel: {
    id: 'act_story_broad_street_intel',
    type: 'INVESTIGATION',
    title: 'Broad Street Syndicate: Traffic Analysis & Correlation',
    shortTitle: 'Syndicate Intel',
    description:
      'Inspect suspicious encrypted command-and-control beacons crossing the Marina gateway into the commercial banking district.',
    narrativeContext:
      'Uncorrelated network spikes on port 8443 match known adversary infrastructure observed during the Aster investigation.',
    source: 'Threat Intelligence Desk',
    priority: 'RECOMMENDED',
    locationId: 'cedarline_interior',
    prerequisites: {
      minCareerLevel: 1,
      requiredSkills: { log_analysis: 1, network_fundamentals: 1 },
    },
    objectives: [
      {
        id: 'obj_intel_analyze_pcap',
        title: 'Analyze Packet Capture Streams',
        description: 'Filter pcap traces for beaconing intervals and TLS fingerprint anomalies.',
        type: 'ANALYZE_TRAFFIC',
        target: 'packet_lens',
        isCompleted: false,
        hint: 'Open PacketLens and apply beacon detection filter on external gateway telemetry.',
        actionPrompt: 'Analyze TLS stream patterns in PacketLens.',
      },
      {
        id: 'obj_intel_correlate_ioc',
        title: 'Correlate Threat Indicators',
        description: 'Correlate domain registrars, autonomous system numbers, and staging IPs.',
        type: 'RECORD_FINDING',
        target: 'threat_correlation',
        isCompleted: false,
        hint: 'Use the Threat Correlation panel to link C2 node signatures.',
        actionPrompt: 'Tag and preserve correlated threat indicator finding.',
      },
    ],
    reward: {
      payoutKobo: 320_000, // ₦3,200.00
      careerXp: 140,
      skillRewards: {
        network_fundamentals: 110,
        evidence_handling: 90,
      },
      reputationPoints: 35,
      unlockedActivityIds: ['act_bounty_atm_audit'],
      flagsToSet: { broad_street_intel_verified: true },
    },
    consequences: {
      reputationPenalty: 5,
      recoveryGuidance: 'Filter specifically for TLS JA3 hashes matching adversary beacons.',
    },
    isRepeatable: false,
    whyRecommended: 'Direct follow-up to the Aster Incident network anomalies.',
    relatedEntityId: 'net-inv-broad-street-01',
  },

  // 3. Blue Team Defensive Operations — Balogun Merchant Security
  act_blue_broad_street_triage: {
    id: 'act_blue_broad_street_triage',
    type: 'DEFENSIVE_OPERATION',
    title: 'Balogun Cooperative: Alert Triage & Sigma Tuning',
    shortTitle: 'Alert Triage',
    description:
      'Review pending security alerts from Balogun market payment terminals, tune high-fidelity Sigma detection rules, and isolate rogue terminals.',
    narrativeContext:
      'Multiple merchant terminals reported unexpected PowerShell invocations masquerading as inventory updates.',
    source: 'Balogun Market Security Cooperative',
    priority: 'RECOMMENDED',
    locationId: 'neighborhood',
    prerequisites: {
      minCareerLevel: 1,
      requiredSkills: { security_fundamentals: 1 },
    },
    objectives: [
      {
        id: 'obj_triage_alerts',
        title: 'Triage Pending Alerts',
        description: 'Inspect alert queue in Defensive Operations and classify false positives.',
        type: 'RESOLVE_INCIDENT',
        target: 'alert_triage',
        isCompleted: false,
        hint: 'Navigate to Alert Queue in DefensiveOps app and review terminal telemetry.',
        actionPrompt: 'Classify and prioritize incoming security alerts.',
      },
      {
        id: 'obj_tune_detection_rule',
        title: 'Tune Sigma Detection Rule',
        description: 'Enable and tune detection rule for suspicious encoded terminal commands.',
        type: 'TUNE_RULE',
        target: 'detection_tune',
        isCompleted: false,
        hint: 'Open RuleTuner or DefensiveOps Detection Studio and activate the high-confidence rule.',
        actionPrompt: 'Deploy tuned Sigma detection rule.',
      },
    ],
    reward: {
      payoutKobo: 280_000, // ₦2,800.00
      careerXp: 150,
      skillRewards: {
        incident_response: 100,
        detection_engineering: 120,
      },
      reputationPoints: 30,
      flagsToSet: { balogun_defense_verified: true },
    },
    consequences: {
      reputationPenalty: 8,
      recoveryGuidance: 'Ensure alert severity thresholds match the merchant payment gateway profile.',
    },
    isRepeatable: true,
    whyRecommended: 'Valuable practice for Blue Team analysts building detection engineering skills.',
    relatedEntityId: 'def-ops-balogun-coop',
  },

  // 4. Red Team Assessment — Balogun Merchant Gateway Audit
  act_red_balogun_assessment: {
    id: 'act_red_balogun_assessment',
    type: 'RED_TEAM_ASSESSMENT',
    title: 'Authorized Assessment: Balogun Merchant Gateway',
    shortTitle: 'Gateway PenTest',
    description:
      'Perform scoped penetration testing against the Balogun Merchant API gateway. Respect Rules of Engagement and validate vulnerabilities.',
    narrativeContext:
      'The merchants council commissioned an authorized assessment before launching a new multi-bank settlement interface.',
    source: 'Balogun Chamber of Commerce',
    priority: 'OPTIONAL',
    locationId: 'neighborhood',
    prerequisites: {
      minCareerLevel: 1,
      requiredSkills: { security_fundamentals: 1, troubleshooting: 1 },
    },
    objectives: [
      {
        id: 'obj_red_accept_roe',
        title: 'Review & Accept Rules of Engagement',
        description: 'Review in-scope subnets (10.0.12.0/24) and explicitly accept non-destructive testing conditions.',
        type: 'EXECUTE_ACTION',
        target: 'accept_roe',
        isCompleted: false,
        hint: 'Open RedTeam app and review the Scope of Engagement charter before proceeding.',
        actionPrompt: 'Accept Rules of Engagement.',
      },
      {
        id: 'obj_red_validate_vuln',
        title: 'Validate Vulnerability Finding',
        description: 'Execute authorized simulated port scan and record finding with CVSS rating.',
        type: 'RECORD_FINDING',
        target: 'red_finding',
        isCompleted: false,
        hint: 'Run authorized scanner in RedTeam Console against designated target 10.0.12.45.',
        actionPrompt: 'Record validated finding with technical evidence.',
      },
      {
        id: 'obj_red_submit_findings',
        title: 'Submit Scoped Assessment Report',
        description: 'Deliver executive summary and remediation roadmap to the merchant council.',
        type: 'SUBMIT_REPORT',
        target: 'red_team_report',
        isCompleted: false,
        hint: 'Compile report and submit for client sign-off in RedTeam app.',
        actionPrompt: 'Submit assessment deliverables.',
      },
    ],
    reward: {
      payoutKobo: 450_000, // ₦4,500.00
      careerXp: 200,
      skillRewards: {
        attack_simulation: 140,
        reporting: 110,
      },
      reputationPoints: 50,
      flagsToSet: { red_balogun_audit_passed: true },
    },
    consequences: {
      penaltyKobo: 50_000,
      reputationPenalty: 20,
      recoveryGuidance: 'Strictly avoid targeting out-of-scope payment switches outside 10.0.12.0/24.',
    },
    isRepeatable: false,
    whyRecommended: 'Hands-on Red Team workflow testing authorized methodologies and reporting.',
    relatedEntityId: 'red-balogun-gateway-01',
  },

  // 5. Purple Team Emulation — Lagos Shield Cyber Defense
  act_purple_eko_emulation: {
    id: 'act_purple_eko_emulation',
    type: 'DEFENSIVE_OPERATION',
    title: 'Operation Lagos Shield: Purple Team Emulation Studio',
    shortTitle: 'Purple Emulation',
    description:
      'Emulate adversary lateral movement techniques and verify that defensive detection rules trigger with under 2-minute alert latency.',
    narrativeContext:
      'Collaborative exercise between internal red assessors and defensive monitoring teams to close detection gaps.',
    source: 'Cedarline Purple Team Lead',
    priority: 'OPTIONAL',
    locationId: 'cedarline_interior',
    prerequisites: {
      minCareerLevel: 2,
      requiredSkills: { attack_simulation: 1, detection_engineering: 1 },
    },
    objectives: [
      {
        id: 'obj_purple_run_scenario',
        title: 'Execute Emulation Run',
        description: 'Run automated emulation scenario mimicking credential dumping across staging hosts.',
        type: 'EXECUTE_ACTION',
        target: 'purple_scenario',
        isCompleted: false,
        hint: 'Select credential dumping scenario in Purple Team Studio and start execution.',
        actionPrompt: 'Execute Purple Team emulation scenario.',
      },
      {
        id: 'obj_purple_verify_detection',
        title: 'Verify Detection Coverage',
        description: 'Confirm SIEM collector logs detection alert and records valid timeline.',
        type: 'VERIFY_SERVICE',
        target: 'purple_replay',
        isCompleted: false,
        hint: 'Review replay results and ensure detection status reads DETECTED.',
        actionPrompt: 'Verify detection telemetry.',
      },
    ],
    reward: {
      payoutKobo: 400_000, // ₦4,000.00
      careerXp: 180,
      skillRewards: {
        attack_simulation: 100,
        detection_engineering: 150,
      },
      reputationPoints: 40,
      flagsToSet: { purple_emulation_certified: true },
    },
    consequences: {
      reputationPenalty: 5,
      recoveryGuidance: 'Adjust Sigma rule query syntax to match the process creation parameters.',
    },
    isRepeatable: true,
    whyRecommended: 'Bridges offensive attack knowledge with defensive engineering.',
    relatedEntityId: 'scen-purple-lagos-shield',
  },

  // 6. Bug Bounty Contract — Eko Atlantic ATM Network
  act_bounty_atm_audit: {
    id: 'act_bounty_atm_audit',
    type: 'CYBER_CONTRACT',
    title: 'Eko Bounty Network: Broad Street ATM Telemetry Investigation',
    shortTitle: 'ATM Bounty',
    description:
      'Investigate intermittent heartbeat dropouts on Broad Street commercial ATM gateways without disrupting live cash dispensaries.',
    narrativeContext:
      'Commercial bank consortium posted a private bounty following unverified reports of man-in-the-middle transaction anomalies.',
    source: 'Eko Bounty Network',
    priority: 'RECOMMENDED',
    locationId: 'neighborhood',
    prerequisites: {
      minCareerLevel: 1,
      minReputationPoints: 100,
    },
    objectives: [
      {
        id: 'obj_bounty_accept_contract',
        title: 'Accept Bounty Contract',
        description: 'Accept the contract on Eko Bounty Network and review client deliverables rubric.',
        type: 'EXECUTE_ACTION',
        target: 'accept_contract',
        isCompleted: false,
        hint: 'Open BountyApp from Orion OS desktop or top panel and click Accept Contract.',
        actionPrompt: 'Accept contract in Bounty Marketplace.',
      },
      {
        id: 'obj_bounty_run_tool',
        title: 'Execute Simulated Non-Destructive Action',
        description: 'Perform diagnostic packet inspection on authorized ATM subnet 10.0.8.0/24.',
        type: 'RUN_TOOL',
        target: 'bounty_action',
        isCompleted: false,
        hint: 'In Active Workspace, run simulated network audit against 10.0.8.12.',
        actionPrompt: 'Execute diagnostic scan on authorized target.',
      },
      {
        id: 'obj_bounty_submit_findings',
        title: 'Package Deliverables & Submit',
        description: 'Package findings with SHA-256 evidence link in Submission Studio and submit for client review.',
        type: 'SUBMIT_REPORT',
        target: 'bounty_submission',
        isCompleted: false,
        hint: 'Navigate to Submission Studio, verify evidence hash, and submit deliverables.',
        actionPrompt: 'Submit bounty deliverables for evaluation.',
      },
    ],
    reward: {
      payoutKobo: 750_000, // ₦7,500.00
      careerXp: 220,
      skillRewards: {
        network_fundamentals: 130,
        reporting: 120,
      },
      reputationPoints: 60,
      flagsToSet: { bounty_atm_completed: true },
    },
    consequences: {
      penaltyKobo: 75_000,
      reputationPenalty: 25,
      recoveryGuidance: 'Avoid contacting prohibited subnets outside 10.0.8.0/24.',
    },
    isRepeatable: false,
    whyRecommended: 'High-payout contract with verified client review on the Eko Bounty Network.',
    relatedEntityId: 'ct-eko-atm-investigation',
  },

  // 7. Career Development & IT Support — Workstation Hardware Maintenance
  act_career_junior_support: {
    id: 'act_career_junior_support',
    type: 'CAREER_ASSIGNMENT',
    title: 'Cedarline Workstation: Diagnostics & Hardware Upgrade',
    shortTitle: 'Workstation Setup',
    description:
      'Perform hardware diagnostics, review RAM utilization, and procure memory upgrade modules from the hardware shop.',
    narrativeContext:
      'Keeping workstation resources optimized prevents dropped packets during high-speed traffic capture.',
    source: 'Internal IT Helpdesk',
    priority: 'OPTIONAL',
    locationId: 'cedarline_interior',
    prerequisites: {
      minCareerLevel: 1,
    },
    objectives: [
      {
        id: 'obj_support_sysinfo',
        title: 'Inspect System Specifications',
        description: 'Open System Information on Orion OS desktop to review kernel and memory stats.',
        type: 'RUN_TOOL',
        target: 'sysinfo',
        isCompleted: false,
        hint: 'Launch System Information application from Desktop or Applications menu.',
        actionPrompt: 'Inspect system specifications.',
      },
      {
        id: 'obj_support_study',
        title: 'Review Cybersecurity Study Guide',
        description: 'Read the foundational security study guide to build core technical troubleshooting skills.',
        type: 'EXECUTE_ACTION',
        target: 'study_guide',
        isCompleted: false,
        hint: 'Access Career & Market app and study learning material or purchase study resources.',
        actionPrompt: 'Complete study session.',
      },
    ],
    reward: {
      payoutKobo: 150_000, // ₦1,500.00
      careerXp: 100,
      skillRewards: {
        troubleshooting: 100,
        security_fundamentals: 80,
      },
      reputationPoints: 20,
      flagsToSet: { workstation_optimized: true },
    },
    consequences: {
      recoveryGuidance: 'Ensure all required applications are reviewed in Orion OS.',
    },
    isRepeatable: true,
    whyRecommended: 'Foundational career maintenance and skill building.',
    relatedEntityId: 'job_ticket_01',
  },

  // 8. Personal Goal & Life Simulation — Broad Street Coffee & Networking
  act_social_marina_coffee: {
    id: 'act_social_marina_coffee',
    type: 'SOCIAL_COMMITMENT',
    title: 'Marina Promenade: Networking & Incident Debrief',
    shortTitle: 'Marina Networking',
    description:
      'Meet with local Lagos security practitioners on the Marina waterfront to discuss emerging adversary techniques.',
    narrativeContext:
      'Informal intelligence sharing among Broad Street analysts frequently uncovers threats before official CVE bulletins.',
    source: 'Personal Calendar',
    priority: 'OPTIONAL',
    locationId: 'neighborhood',
    prerequisites: {
      minCareerLevel: 1,
    },
    objectives: [
      {
        id: 'obj_social_visit_marina',
        title: 'Visit Marina Promenade',
        description: 'Explore the Lagos Island waterfront district near Broad Street and interact with local contacts.',
        type: 'VISIT_LOCATION',
        target: 'neighborhood',
        isCompleted: false,
        hint: 'Step outside the workstation and walk toward Marina Promenade.',
        actionPrompt: 'Travel to Marina Promenade.',
      },
      {
        id: 'obj_social_talk_contact',
        title: 'Consult Professional Contact',
        description: 'Open the Contacts directory or speak with a colleague regarding local security updates.',
        type: 'TALK_TO_NPC',
        target: 'npc_amina',
        isCompleted: false,
        hint: 'Open Contacts app on the desktop or initiate dialogue with Blessing.',
        actionPrompt: 'Engage with professional contact.',
      },
    ],
    reward: {
      payoutKobo: 80_000,
      careerXp: 80,
      skillRewards: {
        security_fundamentals: 60,
      },
      reputationPoints: 25,
      flagsToSet: { marina_networking_completed: true },
    },
    consequences: {
      recoveryGuidance: 'Check the Contacts application for availability hours.',
    },
    isRepeatable: true,
    whyRecommended: 'Expands your professional network across Lagos Island.',
    relatedEntityId: 'npc_contact_event_01',
  },

  // ── M21: Human Intelligence, Social Investigation & Physical Security ────

  // M21 Scenario A — Conflicting Accounts (HUMINT Investigation)
  act_m21_conflicting_accounts: {
    id: 'act_m21_conflicting_accounts',
    type: 'INVESTIGATION',
    title: 'The Server Room Discrepancy',
    shortTitle: 'Conflicting Accounts',
    description:
      'Two staff members have given contradictory accounts about who accessed the restricted server room on the night of the Aster Incident. Badge logs and testimonies conflict. Interview both witnesses, compare their statements against the physical access record, and reach a defensible investigative conclusion.',
    narrativeContext:
      'Following the Aster containment, physical access logs reveal that badge credential CED-2026-B-0247 (assigned to Barry) was used to enter Room 4B at 19:47 — over an hour after Barry claims to have left for the day. Blessing confirms seeing Barry depart around 18:15. The discrepancy requires face-to-face investigation.',
    source: 'Cedarline Security Office (Internal Review)',
    priority: 'RECOMMENDED',
    locationId: 'cedarline_interior',
    prerequisites: {
      requiredFlags: { m21_humint_unlocked: true },
    },
    objectives: [
      {
        id: 'obj_m21a_review_badge_log',
        title: 'Review the Physical Access Log',
        description: 'Examine the badge access log evidence for Room 4B on Tuesday evening.',
        type: 'RECORD_FINDING',
        isCompleted: false,
        hint: 'The badge log evidence is added to your vault when you start the first interview.',
        actionPrompt: 'Start your first interview to unlock the badge log evidence.',
      },
      {
        id: 'obj_m21a_interview_marcus',
        title: 'Interview Barry (Infra Admin)',
        description: 'Conduct a formal interview with Barry regarding his whereabouts on Tuesday evening.',
        type: 'TALK_TO_NPC',
        target: 'npc_marcus',
        isCompleted: false,
        hint: 'Use StartInterview → AskInterviewQuestion → ConcludeInterview.',
        actionPrompt: 'Locate Barry in Cedarline and begin the interview.',
      },
      {
        id: 'obj_m21a_interview_amina',
        title: 'Interview Blessing (Lead Analyst)',
        description: 'Gather corroborating or conflicting testimony from Blessing regarding the same evening.',
        type: 'TALK_TO_NPC',
        target: 'npc_amina',
        isCompleted: false,
        hint: 'Ask Blessing about what she observed on Tuesday evening.',
        actionPrompt: 'Speak with Blessing after interviewing Barry.',
      },
      {
        id: 'obj_m21a_compare_testimony',
        title: 'Compare Testimony vs Badge Log',
        description: "Use the CompareEvidenceWithTestimony command to formally compare Barry's initial statement against the physical badge access log.",
        type: 'RECORD_FINDING',
        isCompleted: false,
        hint: 'Statement ID: q_a_marcus_whereabouts | Evidence ID: ev_phys_badge_log_tuesday',
        actionPrompt: 'Compare the conflicting claim with the physical record.',
      },
      {
        id: 'obj_m21a_submit_conclusion',
        title: 'Submit Investigative Conclusion',
        description: 'Formulate and submit your conclusion about what actually happened on Tuesday evening.',
        type: 'RECORD_FINDING',
        isCompleted: false,
        hint: "Use SubmitM21Conclusion. Consider: does the evidence support a policy breach, an insider threat, or something else?",
        actionPrompt: 'Submit your investigative conclusion to the Security Office.',
      },
    ],
    reward: {
      payoutKobo: 350_000,
      careerXp: 180,
      skillRewards: {
        attack_simulation: 80,
        security_fundamentals: 60,
      },
      reputationPoints: 40,
      flagsToSet: { m21a_investigation_complete: true },
      unlockedActivityIds: ['act_m21_facility_audit'],
    },
    consequences: {
      recoveryGuidance:
        'Return to Cedarline to locate the available witnesses. Review the badge log evidence before forming a conclusion.',
    },
    isRepeatable: false,
    whyRecommended:
      'Develops human intelligence and interview skills that are essential for insider threat investigations.',
  },

  // M21 Scenario B — Suspicious Vendor Access Request (SocEng Awareness)
  act_m21_vendor_request: {
    id: 'act_m21_vendor_request',
    type: 'INVESTIGATION',
    title: 'Unusual Vendor Access Request',
    shortTitle: 'Vendor Request',
    description:
      'An urgent email arrives from a supposed third-party vendor claiming emergency access to the restricted server room. The message contains multiple social-engineering red flags. Analyse the request, identify the deceptive indicators, and decide how to respond — your professional judgment and Cedarline\'s physical security are on the line.',
    narrativeContext:
      'A message has arrived in your Cedarline secure mailbox from "Kolade Adeniyi <k.adeniyi@telekron-ng.example.sim>" claiming to be a power-systems engineer requiring unescorted access to Room 4B and administrator credentials — today, within four hours. No maintenance is scheduled in the facilities calendar.',
    source: 'Cedarline Incoming Mail',
    priority: 'RECOMMENDED',
    prerequisites: {
      requiredFlags: { m21_humint_unlocked: true },
    },
    objectives: [
      {
        id: 'obj_m21b_review_message',
        title: 'Analyse the Vendor Message',
        description: 'Read the vendor email and identify the social-engineering indicators present.',
        type: 'RECORD_FINDING',
        isCompleted: false,
        hint: 'Look for: domain anomalies, unusual access requests, artificial urgency, and credential demands.',
        actionPrompt: 'Open the Human Intel panel and review the vendor message.',
      },
      {
        id: 'obj_m21b_make_decision',
        title: 'Make an Access Decision',
        description: 'Use EvaluateSocEngDecision to formally record your response to the vendor request.',
        type: 'EXECUTE_ACTION',
        isCompleted: false,
        hint: 'Choose the response that best protects physical security while maintaining professional conduct.',
        actionPrompt: 'Submit your access decision.',
      },
      {
        id: 'obj_m21b_report_soc',
        title: 'Report to Security Operations',
        description: 'Escalate the suspicious request to the SOC for threat intelligence logging.',
        type: 'EXECUTE_ACTION',
        isOptional: true,
        isCompleted: false,
        hint: 'Choose a decision that includes SOC notification for maximum outcome rating.',
        actionPrompt: 'Report to SOC (optional bonus).',
      },
    ],
    reward: {
      payoutKobo: 200_000,
      careerXp: 120,
      skillRewards: {
        attack_simulation: 120,
      },
      reputationPoints: 30,
      flagsToSet: { m21b_scenario_complete: true },
    },
    consequences: {
      recoveryGuidance:
        'Review the vendor message indicators carefully. If you approved access without verification, escalate immediately to the SOC and document the incident.',
    },
    isRepeatable: false,
    whyRecommended:
      'Builds critical social engineering awareness and physical access control judgment — essential for any security role.',
  },

  // M21 Scenario C — Authorized Facility Security Assessment
  act_m21_facility_audit: {
    id: 'act_m21_facility_audit',
    type: 'RED_TEAM_ASSESSMENT',
    title: 'Cedarline Visitor Management Audit',
    shortTitle: 'Facility Audit',
    description:
      'Conduct an authorized inspection of Cedarline\'s visitor check-in, badge issuance, and escort procedures. Walk through the lobby and restricted corridor, record your observations of physical controls, identify policy gaps, raise formal findings, and submit a risk-rated assessment report.',
    narrativeContext:
      'Cedarline\'s Facilities Director has granted formal authorization for a physical security assessment following concerns raised during the Aster Incident investigation. Your rules of engagement require you to remain within the lobby and approved corridors, produce written findings for each control weakness, and submit a report before end-of-business.',
    source: 'Cedarline Facilities Director (Authorized Assessment)',
    priority: 'OPTIONAL',
    locationId: 'cedarline_interior',
    prerequisites: {
      completedActivityIds: ['act_m21_conflicting_accounts'],
    },
    objectives: [
      {
        id: 'obj_m21c_inspect_objects',
        title: 'Inspect Physical Controls (≥ 3)',
        description:
          'Use InspectWorldObject to examine at least three physical security controls in the Cedarline lobby and corridor.',
        type: 'VISIT_LOCATION',
        isCompleted: false,
        hint: 'Examine: visitor sign-in sheet, badge printer, corridor door, CCTV camera, policy poster.',
        actionPrompt: 'Inspect physical security controls in the Cedarline lobby.',
      },
      {
        id: 'obj_m21c_raise_findings',
        title: 'Raise At Least 2 Findings',
        description:
          'Use RaiseAssessmentFinding to formally document at least two distinct control weaknesses, each linked to a recorded observation.',
        type: 'RECORD_FINDING',
        isCompleted: false,
        hint: 'Each finding must reference at least one observation and include a policy reference and remediation recommendation.',
        actionPrompt: 'Raise formal security findings.',
      },
      {
        id: 'obj_m21c_submit_report',
        title: 'Submit Assessment Report',
        description:
          'Compile your observations and findings into a Physical Assessment Report using SubmitPhysicalAssessmentReport.',
        type: 'SUBMIT_REPORT',
        isCompleted: false,
        hint: 'Include an executive summary and authorization reference. More findings = better client rating.',
        actionPrompt: 'Submit the assessment report to Facilities Director.',
      },
    ],
    reward: {
      payoutKobo: 500_000,
      careerXp: 250,
      skillRewards: {
        attack_simulation: 60,
        security_fundamentals: 100,
      },
      reputationPoints: 60,
      flagsToSet: { m21c_audit_complete: true },
    },
    consequences: {
      recoveryGuidance:
        'Return to the Cedarline lobby. Inspect objects in the lobby and corridor before raising findings. Each finding must link to at least one observation.',
    },
    isRepeatable: false,
    deadlineDurationSeconds: 14400, // 4 in-game hours
    whyRecommended:
      'Authorized physical security assessments are a highly valued specialist skill. Completing this unlocks advanced physical pen-testing contracts.',
  },

  // M23 — Additional Playable Professions Authored Activities
  act_forensics_marina_breach: {
    id: 'act_forensics_marina_breach',
    type: 'INVESTIGATION',
    title: 'Marina Maritime: USB Exfiltration & Anti-Forensic Tampering Analysis',
    shortTitle: 'Forensic Analysis',
    description:
      'Verify cryptographic evidence chain-of-custody, parse Master File Table records to detect anti-forensic timestomping, and extract exfiltrated file archive.',
    narrativeContext:
      'Marina Logistics internal controls detected an unauthorized USB mass storage device connected to the port manifest server. The operator claims innocence, but telemetry indicates file transfers.',
    source: 'Marina Legal & Integrity Chambers',
    priority: 'RECOMMENDED',
    locationId: 'cedarline_interior',
    prerequisites: {
      minCareerLevel: 1,
    },
    objectives: [
      {
        id: 'obj_m23_forensics_hash',
        title: 'Verify Cryptographic Evidence Hash',
        description: 'Verify SHA-256 cryptographic hash of evidence image using forensics CLI.',
        type: 'RUN_TOOL',
        target: 'forensics',
        isCompleted: false,
        hint: 'Use `forensics hash /evidence/marina_exfil_usb.dd` to verify integrity against baseline.',
        actionPrompt: 'Verify evidence image cryptographic hash.',
      },
      {
        id: 'obj_m23_forensics_mft',
        title: 'Detect Timestomped Files via MFT Analysis',
        description: 'Analyze Master File Table records and identify timestomped exfiltration files.',
        type: 'RECORD_FINDING',
        target: 'forensics',
        isCompleted: false,
        hint: 'Run `forensics mft` to inspect timestamp discrepancies between $STANDARD_INFO and $FILE_NAME.',
        actionPrompt: 'Analyze filesystem timeline for anti-forensic tampering.',
      },
      {
        id: 'obj_m23_forensics_report',
        title: 'Compile Certified Forensic Disclosure',
        description: 'Compile defensible digital forensic disclosure report with verified chain of custody.',
        type: 'SUBMIT_REPORT',
        target: 'forensics',
        isCompleted: false,
        hint: 'Run `forensics report` to generate and file the certified investigative report.',
        actionPrompt: 'Submit certified forensic report.',
      },
    ],
    reward: {
      payoutKobo: 450_000,
      careerXp: 180,
      skillRewards: {
        evidence_handling: 100,
        log_analysis: 80,
        reporting: 60,
      },
      reputationPoints: 45,
      flagsToSet: { m23_forensics_completed: true },
    },
    consequences: {
      recoveryGuidance: 'Review evidence hash verification and MFT timeline discrepancies before generating final report.',
    },
    isRepeatable: false,
    whyRecommended: 'Critical digital forensics engagement advancing the Independent Investigator path.',
  },

  act_soc_triage_interbank: {
    id: 'act_soc_triage_interbank',
    type: 'DEFENSIVE_OPERATION',
    title: 'Broad Street Interbank: Peak-Hour Alert Triage & Incident Scoping',
    shortTitle: 'SOC Alert Triage',
    description:
      'Triage high-priority security events on the core interbank switch, differentiate critical brute force / C2 beacons from routine payroll jobs, and isolate compromised nodes.',
    narrativeContext:
      'Broad Street Interbank gateway generates high-volume telemetry. 4 alerts flagged during peak trading requiring rapid triage and containment.',
    source: 'Cedarline SecOps Dispatch',
    priority: 'RECOMMENDED',
    locationId: 'cedarline_interior',
    prerequisites: {
      minCareerLevel: 1,
    },
    objectives: [
      {
        id: 'obj_m23_soc_queue',
        title: 'Review Active SIEM Telemetry Queue',
        description: 'Review pending alert queue using soctriage CLI tool.',
        type: 'RUN_TOOL',
        target: 'soctriage',
        isCompleted: false,
        hint: 'Run `soctriage list` and `soctriage inspect <alert-id>` to investigate telemetry.',
        actionPrompt: 'Review and inspect active alert queue.',
      },
      {
        id: 'obj_m23_soc_contain',
        title: 'Apply Containment Actions',
        description: 'Isolate compromised endpoints, block malicious IPs, and suppress legitimate false positives.',
        type: 'EXECUTE_ACTION',
        target: 'soctriage',
        isCompleted: false,
        hint: 'Use `soctriage action <alert-id> <isolate|block_ip|suppress|escalate>` to apply containment.',
        actionPrompt: 'Apply network containment and suppression rules.',
      },
      {
        id: 'obj_m23_soc_submit',
        title: 'Submit Graded Incident Escalation Ticket',
        description: 'Submit graded SOC triage bundle and incident escalation ticket.',
        type: 'SUBMIT_REPORT',
        target: 'soctriage',
        isCompleted: false,
        hint: 'Run `soctriage submit` to finalize incident scoping and review response grading.',
        actionPrompt: 'Submit incident escalation ticket.',
      },
    ],
    reward: {
      payoutKobo: 500_000,
      careerXp: 190,
      skillRewards: {
        incident_response: 100,
        log_analysis: 90,
      },
      reputationPoints: 50,
      flagsToSet: { m23_soctriage_completed: true },
    },
    consequences: {
      recoveryGuidance: 'Inspect raw payloads with `soctriage inspect` to distinguish C2 beacons from authorized batch cron jobs.',
    },
    isRepeatable: false,
    whyRecommended: 'Real-time alert triage and containment for Tier 2/3 SOC Analysts.',
  },

  act_audit_fintech_compliance: {
    id: 'act_audit_fintech_compliance',
    type: 'CAREER_ASSIGNMENT',
    title: 'Paystack Partner: Pre-Launch Security & NDPR Compliance Audit',
    shortTitle: 'Fintech Audit',
    description:
      'Execute comprehensive pre-launch regulatory audit across Paystack partner infrastructure. Verify database encryption, detect leaked production API keys in staging code, and issue compliance certification.',
    narrativeContext:
      'A fast-growing fintech startup on Broad Street is preparing to launch a merchant payment processing gateway. The Central Bank and NDPR mandate an external security and data protection audit before production API keys can be activated.',
    source: 'Lagos Tech Corridor Compliance Alliance',
    priority: 'RECOMMENDED',
    locationId: 'cedarline_interior',
    prerequisites: {
      minCareerLevel: 1,
    },
    objectives: [
      {
        id: 'obj_m23_audit_scans',
        title: 'Execute Technical Control Domain Audits',
        description: 'Inspect encryption, API secrets, IAM, and cryptographic storage using complianceaudit tool.',
        type: 'RUN_TOOL',
        target: 'complianceaudit',
        isCompleted: false,
        hint: 'Run `complianceaudit scan <ndpr|secrets|iam|crypto>` to evaluate each compliance domain.',
        actionPrompt: 'Perform compliance domain audits.',
      },
      {
        id: 'obj_m23_audit_remediation',
        title: 'Formulate Prioritized Remediation Matrix',
        description: 'Compile prioritized remediation matrix for critical and high severity audit findings.',
        type: 'RECORD_FINDING',
        target: 'complianceaudit',
        isCompleted: false,
        hint: 'Run `complianceaudit remediate` to generate actionable guidance for engineering.',
        actionPrompt: 'Compile remediation advisory matrix.',
      },
      {
        id: 'obj_m23_audit_verdict',
        title: 'Issue Regulatory Compliance Attestation',
        description: 'Issue formal regulatory attestation and conditional launch authorization certificate.',
        type: 'SUBMIT_REPORT',
        target: 'complianceaudit',
        isCompleted: false,
        hint: 'Run `complianceaudit sign conditional` to certify audit findings and authorize restricted launch.',
        actionPrompt: 'Issue certified compliance verdict.',
      },
    ],
    reward: {
      payoutKobo: 600_000,
      careerXp: 210,
      skillRewards: {
        security_fundamentals: 110,
        reporting: 90,
        log_analysis: 60,
      },
      reputationPoints: 55,
      flagsToSet: { m23_complianceaudit_completed: true },
    },
    consequences: {
      recoveryGuidance: 'Check all 4 control domains with `complianceaudit status` and verify remediation recommendations.',
    },
    isRepeatable: false,
    whyRecommended: 'Foundational enterprise audit contract establishing the Security Consultant & Auditor career path.',
  },
};

export const ACTIVITY_CATALOGUE = AUTHORED_ACTIVITIES;

export const INITIAL_LONG_TERM_GOALS: ReadonlyArray<LongTermCareerGoal> = [
  {
    id: 'goal_career_specialist',
    title: 'Achieve Tier 2 Specialist Standing',
    description: 'Advance your career level to Tier 2 (Security Analyst or Penetration Tester) through completed assignments.',
    currentProgress: 1,
    maxProgress: 2,
    isCompleted: false,
    unlockedReward: 'Unlocks high-value commercial tenders and advanced network simulation targets.',
    relatedCareerPath: 'career_sec_analyst',
  },
  {
    id: 'goal_reputation_master',
    title: 'Build 5-Star Freelance Standing',
    description: 'Earn 300+ reputation points on the Eko Bounty Network with zero unmitigated scope violations.',
    currentProgress: 120,
    maxProgress: 300,
    isCompleted: false,
    unlockedReward: 'Unlocks Master Tier contracts and VIP security briefings.',
    relatedCareerPath: 'career_bounty_hunter',
  },
  {
    id: 'goal_master_investigator',
    title: 'Unmask the Broad Street Threat Actor',
    description: 'Correlate forensic evidence from the Aster Incident and live network beacons to identify the threat actor.',
    currentProgress: 1,
    maxProgress: 4,
    isCompleted: false,
    unlockedReward: 'Permanent recognition in Lagos Island cybersecurity history.',
  },
];

/**
 * Creates the initial runtime state for all authored activities.
 */
export function createInitialActivityDirectorState(
  simTimeSeconds = 0
): ActivityDirectorState {
  const activities: Record<string, ActivityRuntimeState> = {};

  for (const [id, def] of Object.entries(AUTHORED_ACTIVITIES)) {
    const isPrimary = def.priority === 'PRIMARY_OBJECTIVE';
    activities[id] = {
      definitionId: id,
      status: isPrimary ? 'ACTIVE' : 'AVAILABLE',
      discoveredAt: simTimeSeconds,
      acceptedAt: isPrimary ? simTimeSeconds : undefined,
      objectives: def.objectives.map(o => ({ ...o })),
      progressPercentage: 0,
      rewardClaimed: false,
    };
  }

  return {
    activities,
    activeActivityId: 'act_story_aster_investigation',
    primaryObjectiveId: 'act_story_aster_investigation',
    recommendedActivityIds: [
      'act_story_broad_street_intel',
      'act_blue_broad_street_triage',
      'act_bounty_atm_audit',
      'act_forensics_marina_breach',
      'act_soc_triage_interbank',
      'act_audit_fintech_compliance',
    ],
    completedHistory: [],
    longTermGoals: INITIAL_LONG_TERM_GOALS,
    guidanceFilter: 'ALL',
    lastEvaluatedSimulationTime: simTimeSeconds,
  };
}

/**
 * Procedural contract generator for ongoing freelance gameplay beyond story completion.
 */
export function generateProceduralContract(
  index: number,
  playerCareerLevel: number,
  careerPath?: CareerPathId
): ActivityDefinition {
  const targetSubnets = ['10.0.14.0/24', '10.0.18.0/24', '10.0.22.0/24', '10.0.26.0/24'];
  const targetOrgs = [
    'Eko Atlantic Cloud Services',
    'Victoria Island Investment Bank',
    'Apapa Logistics Port Authority',
    'Lekki Energy Grid Cooperative',
  ];
  const targetTypes: Array<'CYBER_CONTRACT' | 'DEFENSIVE_OPERATION' | 'RED_TEAM_ASSESSMENT'> = [
    'CYBER_CONTRACT',
    'DEFENSIVE_OPERATION',
    'RED_TEAM_ASSESSMENT',
  ];

  const org = targetOrgs[index % targetOrgs.length]!;
  const subnet = targetSubnets[index % targetSubnets.length]!;
  const actType = targetTypes[index % targetTypes.length]!;
  const baseReward = 300_000 + (playerCareerLevel * 100_000);
  const baseCareerXp = 120 + (playerCareerLevel * 40);

  const id = `procedural_contract_${Date.now()}_${index}`;

  return {
    id,
    type: actType,
    title: `${org}: Continuous Security Assessment #${index + 1}`,
    shortTitle: `Assessment #${index + 1}`,
    description: `Conduct scheduled cybersecurity assessment for ${org} across authorized subnet ${subnet}.`,
    narrativeContext: `${org} has retained independent security verification as part of their quarterly compliance mandate.`,
    source: 'Eko Bounty Network — Open Market',
    priority: 'RECOMMENDED',
    locationId: 'neighborhood',
    prerequisites: {
      minCareerLevel: Math.max(1, Math.min(playerCareerLevel, 3)),
      careerPath,
    },
    objectives: [
      {
        id: `${id}_obj_1`,
        title: 'Inspect Target Perimeter',
        description: `Execute simulated diagnostic scan against ${subnet}.`,
        type: 'RUN_TOOL',
        target: 'procedural_scan',
        isCompleted: false,
        hint: `Use authorized testing tools targeting ${subnet}.`,
        actionPrompt: 'Execute diagnostic scan on target perimeter.',
      },
      {
        id: `${id}_obj_2`,
        title: 'Compile & Submit Findings',
        description: 'Document discovered telemetry and submit signed verification report.',
        type: 'SUBMIT_REPORT',
        target: 'procedural_report',
        isCompleted: false,
        hint: 'Submit verified deliverables for client authorization.',
        actionPrompt: 'Submit report for review.',
      },
    ],
    reward: {
      payoutKobo: baseReward,
      careerXp: baseCareerXp,
      skillRewards: {
        security_fundamentals: 90,
        troubleshooting: 80,
      },
      reputationPoints: 30,
    },
    consequences: {
      penaltyKobo: Math.floor(baseReward * 0.1),
      reputationPenalty: 15,
      recoveryGuidance: `Ensure only systems in ${subnet} are scanned.`,
    },
    isRepeatable: true,
    whyRecommended: 'Fresh commercial assignment generated by Eko Bounty Network.',
  };
}
