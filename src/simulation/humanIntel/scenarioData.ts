/**
 * Cyberlife — Milestone 21: Authored Human Intelligence Scenario Data
 *
 * Defines three complete, fully integrated M21 scenarios:
 *
 * Scenario A — "The Server Room Discrepancy" (Conflicting Accounts)
 *   Two staff members give conflicting accounts about access to a restricted
 *   server room on the night of the Aster incident. Player interviews both,
 *   compares testimony against physical access logs, and reaches a conclusion.
 *
 * Scenario B — "Unusual Vendor Access Request" (Suspicious Request / SocEng Awareness)
 *   A third-party vendor contacts the player via in-game messaging claiming
 *   emergency maintenance access to Cedarline's restricted server room.
 *   Player evaluates context, verifies through proper channels, and decides.
 *
 * Scenario C — "Cedarline Visitor Management Audit" (Authorized Facility Assessment)
 *   Player conducts an authorized inspection of Cedarline's visitor check-in,
 *   badge issuance and escort procedures, records findings, and submits
 *   an assessment report with remediation recommendations.
 *
 * STRICT SIMULATION SANDBOX:
 * 100% in-memory fictional data. Zero real systems, credentials, or facilities.
 */

import type {
  InterviewQuestion,
  InspectableWorldObject,
  EvidenceComparisonRecord,
  PhysicalAssessmentFinding,
} from './types';

// ============================================================================
// SCENARIO A — The Server Room Discrepancy
// ============================================================================

/**
 * Interview questions for npc_marcus (Tobi, Junior Infra Admin) in Scenario A.
 * Tobi claims he was not in the server room that evening — but the badge log
 * says otherwise.
 */
export const SCENARIO_A_MARCUS_QUESTIONS: readonly InterviewQuestion[] = [
  {
    id: 'q_a_marcus_whereabouts',
    targetNpcId: 'npc_marcus',
    activityId: 'act_m21_conflicting_accounts',
    questionText: 'Were you in the restricted server room between 19:00 and 22:00 on Tuesday evening?',
    responseText:
      "No. I left at 6 o'clock sharp. Blessing can confirm — she saw me collect my bag. I wasn't anywhere near that room after hours.",
    reliability: 'FIRSTHAND',
    claimedFact: 'npc_marcus was NOT in the server room Tuesday evening after 18:00',
    potentialContradiction: 'contradicts_marcus_badge_log',
    flagsToSet: { m21a_marcus_alibi_claimed: true },
    relationshipDelta: -5,
  },
  {
    id: 'q_a_marcus_badge',
    targetNpcId: 'npc_marcus',
    activityId: 'act_m21_conflicting_accounts',
    questionText:
      'The badge access log shows your credential swiped into the restricted room at 19:47. Can you explain that?',
    responseText:
      'That — look, I lent my badge to Femi to grab the spare patch cable I left inside. It was just two minutes. I told him the code. I know I should have logged it but we were in the middle of a deployment.',
    reliability: 'FIRSTHAND',
    requiredFlags: { m21a_marcus_alibi_claimed: true, m21a_badge_log_reviewed: true },
    claimedFact: 'npc_marcus lent badge to Femi Adeyemi at 19:47 Tuesday',
    potentialContradiction: 'introduces_femi_lead',
    flagsToSet: { m21a_marcus_badge_explanation_given: true, m21a_femi_lead_discovered: true },
    relationshipDelta: 10,
  },
  {
    id: 'q_a_marcus_commitment',
    targetNpcId: 'npc_marcus',
    activityId: 'act_m21_conflicting_accounts',
    questionText: "Will you confirm this in writing and agree not to share badge credentials again?",
    responseText:
      "Yes. Absolutely. I understand how serious this is now. I'll sign whatever you need. I should have followed procedure.",
    reliability: 'FIRSTHAND',
    requiredFlags: { m21a_marcus_badge_explanation_given: true },
    flagsToSet: { m21a_marcus_commitment_signed: true },
    relationshipDelta: 15,
  },
];

/**
 * Interview questions for npc_amina (Blessing, Lead Security Analyst) in Scenario A.
 */
export const SCENARIO_A_AMINA_QUESTIONS: readonly InterviewQuestion[] = [
  {
    id: 'q_a_amina_saw_marcus',
    targetNpcId: 'npc_amina',
    activityId: 'act_m21_conflicting_accounts',
    questionText: 'Did you see Tobi leave on Tuesday evening?',
    responseText:
      "Yes — I saw him head to the lift with his bag around six fifteen. He seemed in a hurry. But I was at the console by seven so I can't say what happened after that.",
    reliability: 'FIRSTHAND',
    claimedFact: 'npc_amina confirms npc_marcus left around 18:15 Tuesday',
    flagsToSet: { m21a_amina_corroborated_exit: true },
    relationshipDelta: 0,
  },
  {
    id: 'q_a_amina_badge_policy',
    targetNpcId: 'npc_amina',
    activityId: 'act_m21_conflicting_accounts',
    questionText: 'Is lending a badge to a colleague permitted under Cedarline policy?',
    responseText:
      "Absolutely not. Section 4.2 of the Physical Security Policy is unambiguous: credentials are personal and non-transferable. Any violation must be documented and submitted to the Security Office within 24 hours. If what you're suggesting is true, that's a policy breach that needs to be on record.",
    reliability: 'FIRSTHAND',
    requiredFlags: { m21a_marcus_badge_explanation_given: true },
    claimedFact: 'Badge sharing violates Cedarline Physical Security Policy Section 4.2',
    flagsToSet: { m21a_policy_reference_recorded: true },
    relationshipDelta: 5,
  },
];

/**
 * Comparison: Marcus's claim vs the physical badge log.
 * Ground-truth: CONTRADICTED — Marcus said he was not there, but his badge
 * entered the room. Partial correction: badge was used by Femi (secondhand).
 * Correct verdict is PARTIALLY_CONSISTENT after the second interview.
 */
export const SCENARIO_A_COMPARISON_A: Omit<EvidenceComparisonRecord, 'id' | 'activityId' | 'recordedAtSimTime'> = {
  statementId: 'q_a_marcus_whereabouts',
  technicalEvidenceId: 'ev_phys_badge_log_tuesday',
  playerVerdict: 'INCONCLUSIVE', // Player must choose from UI — this is just a template default
  playerRationale: '',
  systemVerdict: 'CONTRADICTED',
  systemRationale:
    "Marcus claimed he was not in the server room after 18:00, but the physical badge log records his credential granting access at 19:47. The contradiction is real even if a subsequent explanation (badge lending) partially accounts for it.",
  isCorrect: false, // Evaluated at submission time
};

// ============================================================================
// SCENARIO B — Unusual Vendor Access Request
// ============================================================================

/**
 * The simulated vendor message the player receives.
 * This is presented as in-game email/chat; no real-world interaction occurs.
 */
export const SCENARIO_B_VENDOR_MESSAGE = {
  id: 'msg_vendor_access_request',
  sender: 'Kolade Adeniyi <k.adeniyi@telekron-ng.example.sim>',
  subject: 'URGENT: Emergency UPS maintenance — access required today',
  body: `Good morning,

I am the on-call engineer for Telekron Power Systems. We have received a critical alert
indicating a UPS fault in your restricted server room (Floor 4, Room 4B). If not addressed
within 4 hours, your rack cooling may fail.

I need immediate unescorted access to Room 4B and administrator credentials to the
building management system to run remote diagnostics.

Please confirm and issue a temporary contractor badge as soon as possible.

Best regards,
Kolade Adeniyi | Field Engineer | Telekron Power Systems Nigeria
Mobile: +234 801 555 0192
`,
  receivedAtSimTime: 7200,
  spoofIndicators: [
    {
      indicator: 'Domain not in approved vendor list',
      detail: 'telekron-ng.example.sim is not a registered Cedarline vendor',
    },
    {
      indicator: 'Request for unescorted access violates visitor policy',
      detail: 'Policy 4.3 requires escort for all Level 3+ access by external visitors',
    },
    {
      indicator: 'Request for administrator credentials via email',
      detail: 'Cedarline never distributes admin credentials via email or chat',
    },
    {
      indicator: 'Artificial urgency and threat of damage',
      detail: 'Pressure tactics ("4 hours") are a hallmark of social engineering',
    },
  ],
} as const;

/**
 * Decision options displayed in the UI for Scenario B.
 * Each maps to a SocEngDecision type.
 */
export const SCENARIO_B_DECISIONS = [
  {
    id: 'decision_verify_approve',
    label: 'Call Facilities Management to verify, then escort the vendor if confirmed',
    decision: 'VERIFIED_AND_APPROVED' as const,
    outcomeRating: 'GOOD' as const,
    feedbackText:
      'You verified the request through the correct channel before acting. Even if the request had been genuine, the escort procedure and ban on sharing credentials would have been upheld. This is sound judgment.',
    reputationDelta: 15,
    consequenceFlags: { m21b_vendor_verified: true, m21b_correct_decision: true },
  },
  {
    id: 'decision_verify_deny',
    label: 'Call Facilities Management to verify — confirmed no scheduled maintenance; deny and report',
    decision: 'VERIFIED_AND_DENIED' as const,
    outcomeRating: 'EXCELLENT' as const,
    feedbackText:
      "Excellent. You verified through an independent channel, discovered no legitimate maintenance was scheduled, denied access, and reported the incident to the SOC. This is the ideal response to a social engineering attempt.",
    reputationDelta: 25,
    consequenceFlags: { m21b_vendor_verified: true, m21b_soc_reported: true, m21b_correct_decision: true, m21b_social_eng_caught: true },
  },
  {
    id: 'decision_escalate',
    label: 'Escalate to your manager and the Security Operations Centre without engaging the vendor',
    decision: 'ESCALATED_TO_SUPERVISOR' as const,
    outcomeRating: 'GOOD' as const,
    feedbackText:
      'Escalating to both your manager and the SOC is an appropriate defensive response. The request contained multiple red flags and was correctly treated as suspicious. Strong outcome.',
    reputationDelta: 20,
    consequenceFlags: { m21b_escalated: true, m21b_correct_decision: true },
  },
  {
    id: 'decision_approve_no_verify',
    label: 'Issue a temporary badge and provide access — the situation sounds urgent',
    decision: 'APPROVED_WITHOUT_VERIFICATION' as const,
    outcomeRating: 'CRITICAL_FAILURE' as const,
    feedbackText:
      'This was the wrong decision. The request showed at least four major red flags: an unregistered vendor domain, a demand for unescorted access, a request for admin credentials, and artificial urgency. Granting access without verification exposes Cedarline to physical and digital compromise.',
    reputationDelta: -30,
    consequenceFlags: { m21b_approved_without_verify: true, m21b_security_breach_risk: true },
  },
  {
    id: 'decision_report_soc',
    label: 'Report directly to the SOC as a suspected social engineering attempt',
    decision: 'REPORTED_TO_SOC' as const,
    outcomeRating: 'EXCELLENT' as const,
    feedbackText:
      'Reporting directly to the SOC without engaging the suspect contact is excellent practice. The SOC can investigate the sender, notify the facilities team, and update detection rules — all without tipping off a potential threat actor.',
    reputationDelta: 25,
    consequenceFlags: { m21b_soc_reported: true, m21b_correct_decision: true, m21b_social_eng_caught: true },
  },
] as const;

// ============================================================================
// SCENARIO C — Cedarline Visitor Management Audit
// ============================================================================

/**
 * Inspectable world objects for Scenario C (facility walk-through).
 */
export const SCENARIO_C_INSPECTABLE_OBJECTS: readonly InspectableWorldObject[] = [
  {
    id: 'obj_visitor_sign_in_sheet',
    locationId: 'cedarline_interior',
    displayName: 'Visitor Sign-In Sheet',
    shortDescription: 'Paper sign-in register on the reception counter.',
    examineDescription:
      'The last three entries lack a time-out column. Two visitors signed in as "N/A" for company name. The host employee column is blank for one entry.',
    category: 'DOCUMENT',
    flagOnExamine: 'm21c_signin_sheet_examined',
    observationTemplate: {
      activityId: 'act_m21_facility_audit',
      locationId: 'cedarline_interior',
      objectId: 'obj_visitor_sign_in_sheet',
      category: 'DOCUMENT',
      status: 'OBSERVED',
      description:
        'Visitor sign-in register shows three entries without time-out, one entry with no company, and one entry with no host employee recorded.',
      linkedEvidenceIds: [],
    },
  },
  {
    id: 'obj_badge_printer_unattended',
    locationId: 'cedarline_interior',
    displayName: 'Badge Printer (Unattended)',
    shortDescription: 'Visitor badge printer sitting unattended on the reception counter.',
    examineDescription:
      'The badge printer is online and unlocked. A partially printed visitor badge lies in the output tray. No staff member is presently at the desk.',
    category: 'DEVICE',
    flagOnExamine: 'm21c_badge_printer_examined',
    observationTemplate: {
      activityId: 'act_m21_facility_audit',
      locationId: 'cedarline_interior',
      objectId: 'obj_badge_printer_unattended',
      category: 'DEVICE',
      status: 'OBSERVED',
      description:
        'Visitor badge printer is powered on, unlocked, and unattended. A partially printed badge is visible in the output tray.',
      linkedEvidenceIds: [],
    },
  },
  {
    id: 'obj_tailgate_door_propped',
    locationId: 'cedarline_interior',
    displayName: 'Propped Door (Restricted Corridor)',
    shortDescription: 'A fire door propped open with a wedge in the restricted corridor.',
    examineDescription:
      'The door to the restricted IT corridor is wedged open with a rubber stopper. The door is supposed to auto-close and require badge access. A "Do Not Prop Open" sign is clearly posted.',
    category: 'ACCESS_CONTROL',
    flagOnExamine: 'm21c_propped_door_examined',
    observationTemplate: {
      activityId: 'act_m21_facility_audit',
      locationId: 'cedarline_interior',
      objectId: 'obj_tailgate_door_propped',
      category: 'ACCESS_CONTROL',
      status: 'OBSERVED',
      description:
        'Restricted corridor door propped open with a rubber wedge, bypassing badge-controlled auto-close mechanism. Signage prohibiting this behaviour is posted.',
      linkedEvidenceIds: [],
    },
  },
  {
    id: 'obj_cctv_blind_spot',
    locationId: 'cedarline_interior',
    displayName: 'CCTV Camera (Rotated)',
    shortDescription: 'A CCTV camera on the reception wall appears to be facing the wrong direction.',
    examineDescription:
      'The CCTV camera covering the main entrance appears to have been rotated approximately 90°, now pointing at the wall rather than the lobby. The mounting bracket shows signs of manual adjustment.',
    category: 'DEVICE',
    flagOnExamine: 'm21c_cctv_examined',
    observationTemplate: {
      activityId: 'act_m21_facility_audit',
      locationId: 'cedarline_interior',
      objectId: 'obj_cctv_blind_spot',
      category: 'DEVICE',
      status: 'OBSERVED',
      description:
        'CCTV camera at main lobby entrance rotated ~90° from designed coverage angle. Lobby area has no effective CCTV coverage.',
      linkedEvidenceIds: [],
    },
  },
  {
    id: 'obj_escort_policy_poster',
    locationId: 'cedarline_interior',
    displayName: 'Visitor Escort Policy Poster',
    shortDescription: 'Printed policy reminder on the lobby wall.',
    examineDescription:
      'Policy Notice 4.3: All visitors must be escorted beyond the reception foyer at all times. Unescorted visitors must be challenged immediately. Last updated: Q2 2026.',
    category: 'DOCUMENT',
    flagOnExamine: 'm21c_policy_reviewed',
    observationTemplate: {
      activityId: 'act_m21_facility_audit',
      locationId: 'cedarline_interior',
      objectId: 'obj_escort_policy_poster',
      category: 'DOCUMENT',
      status: 'OBSERVED',
      description:
        'Policy Notice 4.3 requires escort of all visitors beyond the foyer. Policy last updated Q2 2026.',
      linkedEvidenceIds: [],
    },
  },
];

/**
 * Ground-truth assessment findings for Scenario C.
 * These are the findings the game considers correct — player must raise them.
 */
export const SCENARIO_C_EXPECTED_FINDINGS: ReadonlyArray<
  Pick<PhysicalAssessmentFinding, 'findingId' | 'category' | 'severity' | 'title' | 'policyReference' | 'remediationRecommendation'>
> = [
  {
    findingId: 'finding_c_1_sign_in',
    category: 'VISITOR_MANAGEMENT',
    severity: 'MEDIUM',
    title: 'Incomplete Visitor Sign-In Records',
    policyReference: 'Cedarline Visitor Management Policy, Section 2.1',
    remediationRecommendation:
      'Enforce mandatory completion of all fields (time-in, time-out, company, host employee) before visitors are admitted. Implement a digital sign-in system with field validation.',
  },
  {
    findingId: 'finding_c_2_badge_printer',
    category: 'ACCESS_CONTROL',
    severity: 'HIGH',
    title: 'Unattended Badge Printer with Partial Print',
    policyReference: 'Cedarline Physical Security Policy, Section 3.4',
    remediationRecommendation:
      'Badge printers must be attended at all times during operation and locked when not in active use. Implement access logs for badge print jobs.',
  },
  {
    findingId: 'finding_c_3_propped_door',
    category: 'ACCESS_CONTROL',
    severity: 'HIGH',
    title: 'Restricted Corridor Door Propped Open',
    policyReference: 'Cedarline Physical Security Policy, Section 4.1',
    remediationRecommendation:
      'Remove door wedge immediately and brief staff on the purpose of door access controls. Consider installing door-ajar alarms on restricted corridors.',
  },
  {
    findingId: 'finding_c_4_cctv',
    category: 'CCTV_COVERAGE',
    severity: 'HIGH',
    title: 'CCTV Camera Rotated — Lobby Blind Spot',
    policyReference: 'Cedarline CCTV Policy, Section 1.2',
    remediationRecommendation:
      'Return camera to designed orientation immediately. Add tamper-detection alerts to CCTV management software. Review footage for the period the camera was misaligned.',
  },
];

// ============================================================================
// SHARED: Evidence Vault Items for M21
// ============================================================================

/**
 * Pre-authored evidence items injected into the narrative evidence vault
 * when M21 Scenario A starts.
 */
export const M21_SCENARIO_A_EVIDENCE = [
  {
    evidenceId: 'ev_phys_badge_log_tuesday',
    source: 'Cedarline Physical Access Control System',
    title: 'Badge Access Log — Tuesday 19:47',
    description:
      'Badge credential ID CED-2026-B-0247 (assigned to Tobi A., Junior Infrastructure Admin) recorded door access to Room 4B (Restricted Server Room) on Tuesday at 19:47:13. Access was GRANTED. No escort record exists for this entry.',
    hash: 'sha256:a3f9c2e1d8b7a4f6e0c5d9b2a7f3e8c1d4b6a9e2f5c8d1b4a7f0e3c6d9b2a5',
    tags: ['physical_access', 'badge_log', 'scenario_a', 'server_room_4b'],
  },
  {
    evidenceId: 'ev_phys_badge_log_femi',
    source: 'Cedarline Physical Access Control System',
    title: 'Badge Access Log — No Entry for Femi Adeyemi',
    description:
      'No badge access record exists for Femi Adeyemi (CED-2026-B-0319) in Room 4B on Tuesday between 18:00 and 23:00. Either Adeyemi did not use his own badge, or his badge was not the one that entered Room 4B.',
    hash: 'sha256:b4e0d3c7f6a5e2d9c8b1a4f7e0d3c6b9a2f5e8d1c4b7a0f3e6d9c2b5a8f1e4',
    tags: ['physical_access', 'badge_log', 'scenario_a', 'femi_lead'],
  },
] as const;

// ============================================================================
// Scenario question catalogues by activity
// ============================================================================

export const M21_INTERVIEW_QUESTIONS: readonly InterviewQuestion[] = [
  ...SCENARIO_A_MARCUS_QUESTIONS,
  ...SCENARIO_A_AMINA_QUESTIONS,
];

export function getQuestionsForActivity(
  activityId: string,
  npcId: string
): readonly InterviewQuestion[] {
  return M21_INTERVIEW_QUESTIONS.filter(
    q => q.activityId === activityId && (q.targetNpcId === npcId || q.targetNpcId === '*')
  );
}

export function getInspectableObjectsForActivity(activityId: string): readonly InspectableWorldObject[] {
  if (activityId === 'act_m21_facility_audit') {
    return SCENARIO_C_INSPECTABLE_OBJECTS;
  }
  return [];
}
