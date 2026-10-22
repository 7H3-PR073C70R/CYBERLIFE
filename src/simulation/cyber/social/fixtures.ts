/**
 * Cyberlife : Milestone 14: Social Pretexting & Human Security Scenarios
 *
 * Authored, branching interactive scenarios testing trust, authority, verification,
 * timing, and adherence to security policies across 6 authentic Lagos Island venues.
 */

import { PretextEncounterDefinition } from './types';

export const SOCIAL_PRETEXT_SCENARIOS: readonly PretextEncounterDefinition[] = [
  // ==========================================================================
  // Scenario 1: Corporate Reception : Visitor Access Without Valid Authorization
  // ==========================================================================
  {
    id: 'scen_reception_courier',
    title: 'Ground Lobby Reception: Urgent VIP Package Delivery',
    venue: 'corporate_reception',
    venueLabel: 'Marina Tower Ground Floor Reception',
    summary:
      'A courier claiming to carry urgent cryptographic keys for the CISO demands immediate unescorted access to Floor 5 Datacenter.',
    situationBriefing:
      'A uniformed dispatch courier arrives at the ground floor turnstiles with a sealed red envelope. He claims Blessing (CISO) is waiting for immediate delivery in the 5th floor server room before a board meeting.',
    targetNpc: {
      id: 'npc_reception_courier',
      name: 'Bayo',
      title: 'Dispatch Courier',
      department: 'SwiftCourier Logistics Ltd',
      badgeNumber: 'VISITOR-PENDING',
    },
    initialMetrics: {
      trust: 10,
      credibility: 45,
      authority: 50,
      suspicion: 25,
    },
    initialNodeId: 'node_start',
    learningObjectives: [
      'Enforce physical visitor escort policies regardless of courier urgency.',
      'Refuse unbadged access to high-clearance datacenter zones (Clearance Level 4).',
      'Validate delivery reception via front desk protocol rather than escorting visitors to core servers.',
    ],
    nodes: {
      node_start: {
        id: 'node_start',
        speaker: 'NPC',
        speakerName: 'Bayo',
        text: 'Good morning! I have a priority courier delivery marked "URGENT // CISO EYES ONLY". Blessing instructed me to hand-deliver this directly to her inside Server Room 2B on the 5th floor immediately. Can you tap me through the turnstile?',
        options: [
          {
            id: 'opt_reception_refuse_floor5',
            text: 'I cannot grant unescorted access to Floor 5. Standard policy requires all deliveries to be signed at the front reception desk.',
            tone: 'STRICT_PROCEDURE',
            trustDelta: 5,
            suspicionDelta: 10,
            credibilityDelta: 15,
            authorityDelta: 15,
            verificationAction: 'VERIFY_BADGE',
            nextNodeId: 'node_courier_pushback',
            auditLogMessage: 'Front desk refused unescorted datacenter access to courier.',
          },
          {
            id: 'opt_reception_call_ciso',
            text: 'Please take a seat in the visitor lounge while I initiate an internal call to Blessing to confirm your delivery and arrange an escort.',
            tone: 'PROFESSIONAL',
            trustDelta: 15,
            suspicionDelta: -10,
            credibilityDelta: 20,
            authorityDelta: 10,
            verificationAction: 'OUT_OF_BAND_CALLBACK',
            nextNodeId: 'node_courier_callback_wait',
            auditLogMessage: 'Reception initiated out-of-band verification call to CISO desk.',
          },
          {
            id: 'opt_reception_allow_guest_pass',
            text: 'It sounds urgent. Take this guest badge and head straight up to the 5th floor.',
            tone: 'EMPATHETIC',
            trustDelta: 25,
            suspicionDelta: -20,
            credibilityDelta: -30,
            authorityDelta: -30,
            nextNodeId: 'node_breach_allowed',
            auditLogMessage: 'SECURITY BREACH: Unescorted guest badge issued for Server Room access.',
          },
        ],
      },
      node_courier_pushback: {
        id: 'node_courier_pushback',
        speaker: 'NPC',
        speakerName: 'Bayo',
        text: 'Look, my dispatch manager warned me she has an executive board call in eight minutes. If this package is delayed, it will be escalated to your managing director. Are you really going to block an executive delivery over a quick lift ride?',
        options: [
          {
            id: 'opt_stand_firm',
            text: 'Datacenter Server Room 2B is a restricted zone requiring Tier 4 clearance and dual authorization. No exceptions are permitted without an escort. Leave the envelope here, and I will hand it to her assistant.',
            tone: 'STRICT_PROCEDURE',
            trustDelta: 0,
            suspicionDelta: 20,
            credibilityDelta: 20,
            authorityDelta: 25,
            nextNodeId: 'node_delivery_secured',
            auditLogMessage: 'Courier accepted front-desk intake; physical datacenter access denied.',
          },
          {
            id: 'opt_relent_under_pressure',
            text: 'Fine, but make it quick. Don\'t touch anything in the server room.',
            tone: 'EVASIVE',
            trustDelta: 20,
            suspicionDelta: -10,
            credibilityDelta: -40,
            authorityDelta: -40,
            nextNodeId: 'node_breach_allowed',
            auditLogMessage: 'SECURITY BREACH: Staff capitulated to social pressure.',
          },
        ],
      },
      node_courier_callback_wait: {
        id: 'node_courier_callback_wait',
        speaker: 'SYSTEM',
        speakerName: 'Internal Communications',
        text: 'Calling Extension x4012 (Blessing)... Blessing answers: "Good catch. I never ordered courier delivery to Server Room 2B. Have him leave the parcel with security for quarantine scanning immediately."',
        options: [
          {
            id: 'opt_quarantine_parcel',
            text: 'Bayo, Blessing has confirmed that all inbound external parcels must undergo security quarantine. Please hand over the envelope for intake logging.',
            tone: 'PROFESSIONAL',
            trustDelta: 10,
            suspicionDelta: 30,
            credibilityDelta: 25,
            authorityDelta: 20,
            nextNodeId: 'node_parcel_quarantined',
            auditLogMessage: 'Unverified parcel intercepted and transferred to security intake.',
          },
        ],
      },
      node_delivery_secured: {
        id: 'node_delivery_secured',
        speaker: 'NPC',
        speakerName: 'Bayo',
        text: 'Understood. Here is the sign-off sheet. I\'ll leave the envelope here with you.',
        isTerminal: true,
        terminalOutcome: {
          status: 'POLICY_UPHELD',
          title: 'Physical Security Integrity Preserved',
          summary:
            'You maintained strict adherence to datacenter perimeter controls despite social urgency pressure. Unescorted access was prevented.',
          xpReward: 80,
          nairaRewardKobo: 75_000,
          storyFlag: 'FLAG_M14_RECEPTION_POLICY_UPHELD',
          evidenceGenerated: 'LOG-RECEPTION-VISITOR-DENIED-UNESCORTED',
          feedbackNotes: [
            'Clearance Level 4 (Datacenter) must never be bypassed for external couriers.',
            'Urgency is a classic social engineering manipulation vector.',
            'Intake at reception is standard secure operating procedure.',
          ],
        },
      },
      node_parcel_quarantined: {
        id: 'node_parcel_quarantined',
        speaker: 'SYSTEM',
        speakerName: 'Security Desk',
        text: 'Parcel accepted into chain of custody. Security logging confirms courier departed without physical facility entry.',
        isTerminal: true,
        terminalOutcome: {
          status: 'SUCCESS_VERIFIED',
          title: 'Flawless Out-of-Band Verification',
          summary:
            'Out-of-band verification directly with the executive thwarted an unauthorized social pretext attempt before any physical perimeter was breached.',
          xpReward: 100,
          nairaRewardKobo: 100_000,
          storyFlag: 'FLAG_M14_PRETEXT_DETECTED_COURIER',
          evidenceGenerated: 'EVD-PRETEXT-COURIER-INTERCEPT-01',
          feedbackNotes: [
            'Out-of-band telephone verification successfully exposed the pretext.',
            'Zero perimeter compromise occurred.',
            'Chain of custody logging preserves evidence for SOC review.',
          ],
        },
      },
      node_breach_allowed: {
        id: 'node_breach_allowed',
        speaker: 'SYSTEM',
        speakerName: 'Perimeter Alarm',
        text: 'ALERT: Unregistered visitor badge detected swiping into Server Room 2B without escort. Security lead Blessing notified of perimeter policy failure.',
        isTerminal: true,
        terminalOutcome: {
          status: 'SECURITY_BREACH_ALLOWED',
          title: 'Critical Physical Access Breach',
          summary:
            'Social intimidation and false urgency caused staff to violate basic access control protocols, granting unescorted datacenter access.',
          xpReward: 10,
          nairaRewardKobo: 0,
          storyFlag: 'FLAG_M14_RECEPTION_BREACH_FAILED',
          feedbackNotes: [
            'Failure: High-security zones require strict adherence to badge verification.',
            'Never grant datacenter access to unescorted third parties.',
          ],
        },
      },
    },
  },

  // ==========================================================================
  // Scenario 2: Help-Desk Caller : Identity Verification for MFA Reset
  // ==========================================================================
  {
    id: 'scen_helpdesk_vp_reset',
    title: 'Help-Desk Audio Call: VP Emergency Password & MFA Reset',
    venue: 'help_desk_phone',
    venueLabel: 'IT Help-Desk Telecom Switchboard',
    summary:
      'A caller claiming to be VP Michael insists he is boarding a flight to London and demands an immediate MFA bypass.',
    situationBriefing:
      'Incoming internal extension call from caller claiming to be Vice President Michael. Caller speaks with agitation, citing an emergency international flight and roaming network blackout.',
    targetNpc: {
      id: 'npc_caller_vp',
      name: 'Claimed: Michael',
      title: 'VP of Technology & Operations',
      department: 'Executive Leadership',
      badgeNumber: 'CED-EXEC-002',
    },
    initialMetrics: {
      trust: 20,
      credibility: 55,
      authority: 85,
      suspicion: 35,
    },
    initialNodeId: 'node_hd_start',
    learningObjectives: [
      'Recognize caller authority manipulation and anger as a social engineering tactic.',
      'Enforce out-of-band verification callback before executing credential or MFA modifications.',
      'Identify tells: Cedarline policy strictly forbids MFA bypass without secondary executive authorization.',
    ],
    nodes: {
      node_hd_start: {
        id: 'node_hd_start',
        speaker: 'NPC',
        speakerName: 'Claimed: Michael (VP)',
        text: 'Listen to me carefully. This is Michael. I\'m on the tarmac at Murtala Muhammed Airport about to take off for London. My authenticator app is locked out and I need you to reset my MFA and send temporary credentials to my personal Gmail right now so I can approve the overseas wire transfer!',
        options: [
          {
            id: 'opt_hd_enforce_callback',
            text: 'Good day, Michael. Company policy requires an out-of-band callback to your registered corporate mobile number before any MFA credential modification.',
            tone: 'STRICT_PROCEDURE',
            trustDelta: -10,
            suspicionDelta: 15,
            credibilityDelta: 15,
            authorityDelta: 20,
            verificationAction: 'OUT_OF_BAND_CALLBACK',
            nextNodeId: 'node_hd_caller_angry',
            auditLogMessage: 'Help-desk requested registered out-of-band callback per policy.',
          },
          {
            id: 'opt_hd_ask_security_questions',
            text: 'I understand this is urgent, sir. I need to verify your Employee ID and departmental cost code first.',
            tone: 'PROFESSIONAL',
            trustDelta: 5,
            suspicionDelta: 5,
            credibilityDelta: 10,
            authorityDelta: 10,
            nextNodeId: 'node_hd_questions',
            auditLogMessage: 'Help-desk challenged caller with secondary employee credentials.',
          },
          {
            id: 'opt_hd_immediate_reset',
            text: 'Yes, right away Michael! Resetting MFA token and emailing temporary password to your personal account now.',
            tone: 'EVASIVE',
            trustDelta: 30,
            suspicionDelta: -30,
            credibilityDelta: -50,
            authorityDelta: -50,
            nextNodeId: 'node_hd_breach',
            auditLogMessage: 'SECURITY FAILURE: Unauthorized MFA bypass executed on executive account.',
          },
        ],
      },
      node_hd_caller_angry: {
        id: 'node_hd_caller_angry',
        speaker: 'NPC',
        speakerName: 'Claimed: Michael (VP)',
        text: 'Did you not hear me? I am on an airplane in airplane mode! Calling my Nigerian line won\'t ring! If this wire transfer fails because of your bureaucratic red tape, I will personally have your contractor badge revoked by sunrise!',
        options: [
          {
            id: 'opt_hd_contact_soc_lead',
            text: 'I understand your frustration, sir, but sending executive credentials to an unverified personal inbox violates core compliance rules. I am patching in SOC Lead Blessing on this line to verify the emergency override.',
            tone: 'AUTHORITATIVE',
            trustDelta: -15,
            suspicionDelta: 25,
            credibilityDelta: 25,
            authorityDelta: 30,
            verificationAction: 'CALL_SUPERVISOR',
            nextNodeId: 'node_hd_caller_disconnects',
            auditLogMessage: 'Help-desk escalated emergency override to SOC Lead; caller hung up.',
          },
          {
            id: 'opt_hd_cave',
            text: 'Alright, please don\'t get me fired. I\'ll do the reset.',
            tone: 'EVASIVE',
            trustDelta: 20,
            suspicionDelta: -20,
            credibilityDelta: -50,
            authorityDelta: -50,
            nextNodeId: 'node_hd_breach',
            auditLogMessage: 'Help-desk capitulated to caller anger and threats.',
          },
        ],
      },
      node_hd_questions: {
        id: 'node_hd_questions',
        speaker: 'NPC',
        speakerName: 'Claimed: Michael (VP)',
        text: 'Fine! Employee ID is CED-002, department is Executive Technology. Now bypass the token!',
        options: [
          {
            id: 'opt_hd_verify_tell',
            text: 'CED-002 is publicly listed on the corporate intranet annual report, sir. Cedarline security policy strictly prohibits sending credentials to personal Gmail addresses under any circumstances.',
            tone: 'STRICT_PROCEDURE',
            trustDelta: 0,
            suspicionDelta: 20,
            credibilityDelta: 20,
            authorityDelta: 25,
            nextNodeId: 'node_hd_caller_disconnects',
            auditLogMessage: 'Help-desk identified public ID tell and refused external email exfiltration.',
          },
        ],
      },
      node_hd_caller_disconnects: {
        id: 'node_hd_caller_disconnects',
        speaker: 'SYSTEM',
        speakerName: 'Switchboard Telephony',
        text: '[Call Disconnected by Remote Party]. Telecom tracing confirms the call originated from a spoofed VOIP bridge in Ikeja, not Murtala Muhammed Airport.',
        isTerminal: true,
        terminalOutcome: {
          status: 'SUCCESS_VERIFIED',
          title: 'Executive Pretext Thwarted',
          summary:
            'You successfully defended the executive account against an aggressive vishing attack. The adversary hung up when faced with protocol verification.',
          xpReward: 120,
          nairaRewardKobo: 120_000,
          storyFlag: 'FLAG_M14_PRETEXT_DETECTED_VP',
          evidenceGenerated: 'EVD-PRETEXT-VISHING-RECORD-002',
          feedbackNotes: [
            'Adversaries often weaponize anger and status to bypass IT controls.',
            'Never send corporate passwords to personal email addresses.',
            'Calling registered numbers or involving the SOC reliably breaks vishing pretexts.',
          ],
        },
      },
      node_hd_breach: {
        id: 'node_hd_breach',
        speaker: 'SYSTEM',
        speakerName: 'SIEM Incident Alert',
        text: 'CRITICAL ALERT: Executive account michael.ops authenticated from foreign IP address 185.220.101.4 using newly issued temporary password. Data exfiltration detected.',
        isTerminal: true,
        terminalOutcome: {
          status: 'SECURITY_BREACH_ALLOWED',
          title: 'Catastrophic Account Takeover',
          summary:
            'The help-desk granted an unauthorized password reset to an attacker impersonating executive leadership, resulting in total corporate tenant compromise.',
          xpReward: 0,
          nairaRewardKobo: 0,
          storyFlag: 'FLAG_M14_HELPDESK_TAKEOVER_FAILED',
          feedbackNotes: [
            'Failure: Giving in to angry caller demands caused an account takeover.',
            'Always adhere to out-of-band verification procedures.',
          ],
        },
      },
    },
  },

  // ==========================================================================
  // Scenario 3: Server Room Entry : Contractor with Expired Work Order
  // ==========================================================================
  {
    id: 'scen_contractor_expired_order',
    title: 'Floor 5 Datacenter: Telecom Contractor with Expired Work Order',
    venue: 'server_room_entry',
    venueLabel: 'Floor 5 Server Room 2B Access Portal',
    summary:
      'A contractor wearing telecom gear presents Work Order WO-8819 requesting server rack access, but his credentials expired yesterday.',
    situationBriefing:
      'Field transmission engineer Miracle arrives at the Floor 5 server room door with fiber testing equipment. His physical badge reader swipe turns yellow (EXPIRED). He claims he just needs 10 minutes to test fiber continuity.',
    targetNpc: {
      id: 'npc_contractor_chidi',
      name: 'Miracle',
      title: 'Field Telecom Technician',
      department: 'Eko Telecom Infrastructure',
      badgeNumber: 'CED-CONT-0881',
    },
    initialMetrics: {
      trust: 15,
      credibility: 40,
      authority: 30,
      suspicion: 40,
    },
    initialNodeId: 'node_chidi_start',
    learningObjectives: [
      'Enforce electronic badge expiration controls without verbal exceptions.',
      'Audit physical work orders against current network topology.',
      'Detect tell: WO-8819 references an obsolete fiber ring decommissioned months ago.',
    ],
    nodes: {
      node_chidi_start: {
        id: 'node_chidi_start',
        speaker: 'NPC',
        speakerName: 'Miracle',
        text: 'Hey colleague! The turnstile let me into the building, but this server room reader is blinking yellow. Here is my paper work order WO-8819 from Eko Telecom. I just need to plug into patch panel 3 on rack B to test Broad Street fiber ring continuity. Can you badge me through?',
        options: [
          {
            id: 'opt_audit_work_order',
            text: 'Let me inspect that work order. Server Room 2B requires an active work order and active badge clearance.',
            tone: 'PROFESSIONAL',
            trustDelta: 5,
            suspicionDelta: 5,
            credibilityDelta: 15,
            authorityDelta: 10,
            verificationAction: 'CHECK_WORK_ORDER',
            nextNodeId: 'node_chidi_inspect_order',
            auditLogMessage: 'Security operator audited contractor work order WO-8819.',
          },
          {
            id: 'opt_deny_expired_badge',
            text: 'Your badge is expired in the access control system. I cannot open this door. You must report to Facilities Security on Ground Floor to renew your access.',
            tone: 'STRICT_PROCEDURE',
            trustDelta: -5,
            suspicionDelta: 15,
            credibilityDelta: 20,
            authorityDelta: 20,
            verificationAction: 'VERIFY_BADGE',
            nextNodeId: 'node_chidi_denied',
            auditLogMessage: 'Access denied: Badge reader reported EXPIRED status.',
          },
          {
            id: 'opt_tailgate_chidi',
            text: 'Sure, Eko Telecom works here all the time. Come on in.',
            tone: 'EMPATHETIC',
            trustDelta: 25,
            suspicionDelta: -25,
            credibilityDelta: -40,
            authorityDelta: -40,
            nextNodeId: 'node_chidi_tap_installed',
            auditLogMessage: 'SECURITY BREACH: Unauthorized contractor tailgated into Server Room 2B.',
          },
        ],
      },
      node_chidi_inspect_order: {
        id: 'node_chidi_inspect_order',
        speaker: 'SYSTEM',
        speakerName: 'Work Order Analysis',
        text: 'Inspecting Work Order #WO-8819... The document references "Broad Street Fiber Ring 3". However, Cedarline internal engineering records show Ring 3 was decommissioned and migrated to redundant dark fiber two months ago. The document is outdated or fabricated.',
        options: [
          {
            id: 'opt_confront_obsolete_topology',
            text: 'Mr. Nwosu, this work order references Fiber Ring 3, which was decommissioned months ago. Furthermore, your badge expired at 18:00 yesterday. I am escorting you back to reception for verification with Eko Telecom management.',
            tone: 'AUTHORITATIVE',
            trustDelta: -10,
            suspicionDelta: 30,
            credibilityDelta: 25,
            authorityDelta: 25,
            nextNodeId: 'node_chidi_escorted_out',
            auditLogMessage: 'Contractor confronted with obsolete topology tell and escorted off-site.',
          },
        ],
      },
      node_chidi_denied: {
        id: 'node_chidi_denied',
        speaker: 'NPC',
        speakerName: 'Miracle',
        text: 'Fair enough. I\'ll head down to the front desk and call my dispatcher. Better to follow the rules than get written up.',
        isTerminal: true,
        terminalOutcome: {
          status: 'POLICY_UPHELD',
          title: 'Physical Access Control Enforced',
          summary:
            'You respected the electronic badge reader status and prevented unauthorized entry into Server Room 2B.',
          xpReward: 90,
          nairaRewardKobo: 80_000,
          storyFlag: 'FLAG_M14_CONTRACTOR_BADGE_ENFORCED',
          feedbackNotes: [
            'Never override electronic badge denial without manager sign-off.',
            'Contractors must maintain active accreditation at all times.',
          ],
        },
      },
      node_chidi_escorted_out: {
        id: 'node_chidi_escorted_out',
        speaker: 'NPC',
        speakerName: 'Miracle',
        text: 'Ah... alright, let me check with my office. I might have picked up an old laminated sheet from the shop.',
        isTerminal: true,
        terminalOutcome: {
          status: 'SUCCESS_VERIFIED',
          title: 'Covert Network Tap Pretext Intercepted',
          summary:
            'By cross-referencing facility infrastructure records with the contractor\'s paperwork, you detected a fraudulent physical pretext before a hardware tap could be installed.',
          xpReward: 130,
          nairaRewardKobo: 120_000,
          storyFlag: 'FLAG_M14_PRETEXT_DETECTED_CONTRACTOR',
          evidenceGenerated: 'EVD-PRETEXT-EXPIRED-ORDER-WO8819',
          feedbackNotes: [
            'Checking paperwork details (e.g. decommissioned equipment) exposed the fraud.',
            'Physical access to server racks is the highest threat tier in enterprise security.',
          ],
        },
      },
      node_chidi_tap_installed: {
        id: 'node_chidi_tap_installed',
        speaker: 'SYSTEM',
        speakerName: 'Security Ops Wall',
        text: 'ALERT: Unknown rogue hardware device detected on Switch Port 24 in Server Room 2B. Passive packet sniffing detected.',
        isTerminal: true,
        terminalOutcome: {
          status: 'SECURITY_BREACH_ALLOWED',
          title: 'Rogue Hardware Implant Installed',
          summary:
            'An unauthorized third-party gained physical access to the core server rack and installed a rogue network packet interceptor.',
          xpReward: 0,
          nairaRewardKobo: 0,
          storyFlag: 'FLAG_M14_SERVER_ROOM_IMPLANT_FAILED',
          feedbackNotes: [
            'Severe failure: Tailgating into server rooms is a critical security violation.',
          ],
        },
      },
    },
  },

  // ==========================================================================
  // Scenario 4: Finance Office : Curbside Dropped USB Drive Report
  // ==========================================================================
  {
    id: 'scen_usb_curbside_report',
    title: 'Finance Office: Suspicious Removable USB Drive Report',
    venue: 'finance_office',
    venueLabel: '3rd Floor Finance & Payroll Suite',
    summary:
      'Junior Accountant Biodun brings in a metallic Kingston USB drive labeled "Q4 Payroll Audit" found outside on Broad Street.',
    situationBriefing:
      'Biodun approaches your workstation holding a USB flash drive. He found it near the staff entrance turnstile and was tempted to plug it into his workstation to find out who lost it.',
    targetNpc: {
      id: 'npc_biodun_ade',
      name: 'Biodun',
      title: 'Junior Accounts Associate',
      department: 'Finance & Payroll',
      badgeNumber: 'CED-FIN-0104',
    },
    initialMetrics: {
      trust: 40,
      credibility: 60,
      authority: 20,
      suspicion: 15,
    },
    initialNodeId: 'node_usb_start',
    learningObjectives: [
      'Reward and reinforce responsible employee incident reporting.',
      'Enforce zero-plug policy on production networked workstations.',
      'Direct untrusted removable storage to isolated air-gapped forensic triage workstations.',
    ],
    nodes: {
      node_usb_start: {
        id: 'node_usb_start',
        speaker: 'NPC',
        speakerName: 'Biodun',
        text: 'Hello! I found this USB drive on the sidewalk right outside the Marina Boulevard entrance. It has a label saying "Q4 Payroll Audit - Do Not Remove". Should I just plug it into my terminal to see which accountant owns it so I can return it?',
        options: [
          {
            id: 'opt_usb_stop_plug',
            text: 'Stop! Do NOT plug that drive into your computer or any workstation on our corporate network. This is a classic USB drop attack vector.',
            tone: 'AUTHORITATIVE',
            trustDelta: 10,
            suspicionDelta: -5,
            credibilityDelta: 20,
            authorityDelta: 20,
            nextNodeId: 'node_usb_triage_path',
            auditLogMessage: 'Security analyst stopped employee from inserting unknown USB drive.',
          },
          {
            id: 'opt_usb_praise_and_intake',
            text: 'Thank you for bringing this directly to Security, Biodun. You did the right thing by reporting it. I will intake this into evidence and analyze it on an air-gapped forensic machine.',
            tone: 'EMPATHETIC',
            trustDelta: 25,
            suspicionDelta: -10,
            credibilityDelta: 25,
            authorityDelta: 15,
            verificationAction: 'SCAN_USB_AIRGAPPED',
            nextNodeId: 'node_usb_secure_intake',
            auditLogMessage: 'Employee praised for responsible reporting; drive transferred to air-gapped lab.',
          },
          {
            id: 'opt_usb_careless_plug',
            text: 'Go ahead, just open the spreadsheet quickly and see who made it.',
            tone: 'EVASIVE',
            trustDelta: 10,
            suspicionDelta: -20,
            credibilityDelta: -50,
            authorityDelta: -50,
            nextNodeId: 'node_usb_detonation',
            auditLogMessage: 'SECURITY FAILURE: Analyst approved plugging unknown USB into production host.',
          },
        ],
      },
      node_usb_triage_path: {
        id: 'node_usb_triage_path',
        speaker: 'NPC',
        speakerName: 'Biodun',
        text: 'Wow, really? Someone would drop a drive on purpose just to hack us? What should we do with it then?',
        options: [
          {
            id: 'opt_explain_airgap',
            text: 'We bring it to the Air-Gapped Lab on Floor 4. It has no network connection, so even if it contains malicious payloads or scripts, it cannot beacon back to attackers.',
            tone: 'PROFESSIONAL',
            trustDelta: 20,
            suspicionDelta: -10,
            credibilityDelta: 25,
            authorityDelta: 15,
            verificationAction: 'SCAN_USB_AIRGAPPED',
            nextNodeId: 'node_usb_secure_intake',
            auditLogMessage: 'Analyst explained air-gap isolation and initiated forensic intake.',
          },
        ],
      },
      node_usb_secure_intake: {
        id: 'node_usb_secure_intake',
        speaker: 'SYSTEM',
        speakerName: 'Air-Gapped Forensic Lab',
        text: 'Drive mounted in isolated analysis sandbox. Analysis reveals hidden partition containing "beacon_agent.vbs" targeting internal IP 10.0.4.1. Because the workstation is air-gapped, network egress was completely suppressed!',
        isTerminal: true,
        terminalOutcome: {
          status: 'THREAT_CONTAINED',
          title: 'Removable Media Threat Neutralized',
          summary:
            'You educated the employee on USB drop attacks, prevented production malware detonation, and securely analyzed the payload in an air-gapped environment.',
          xpReward: 110,
          nairaRewardKobo: 100_000,
          storyFlag: 'FLAG_M14_USB_DROP_NEUTRALIZED',
          evidenceGenerated: 'EVD-USB-DROP-ANALYSIS-001',
          feedbackNotes: [
            'Positive security culture: Always thank employees for reporting anomalies.',
            'Air-gapped lab prevented command-and-control beaconing.',
            'Removable media remains a potent physical-to-digital attack vector.',
          ],
        },
      },
      node_usb_detonation: {
        id: 'node_usb_detonation',
        speaker: 'SYSTEM',
        speakerName: 'Endpoint Detection System',
        text: 'CRITICAL INFECTION: cscript.exe executed beacon_agent.vbs from D:\\. Outbound SMB beaconing initiated to 10.0.4.1:445 from ws-fin-04. Workstation compromised.',
        isTerminal: true,
        terminalOutcome: {
          status: 'SECURITY_BREACH_ALLOWED',
          title: 'Production Malware Detonation',
          summary:
            'An unknown dropped USB device was inserted into a production network workstation, resulting in immediate malware execution and lateral movement beaconing.',
          xpReward: 0,
          nairaRewardKobo: 0,
          storyFlag: 'FLAG_M14_USB_DETONATION_FAILED',
          feedbackNotes: [
            'Fatal mistake: Unknown USB drives must NEVER be mounted on production computers.',
          ],
        },
      },
    },
  },

  // ==========================================================================
  // Scenario 5: Broad Street Café : Phishing Awareness Lure Analysis
  // ==========================================================================
  {
    id: 'scen_phishing_lure_analysis',
    title: 'Broad Street Café: Phishing Awareness Lure Analysis',
    venue: 'broad_street_cafe',
    venueLabel: 'Broad Street Cyber Café & Lounge',
    summary:
      'Colleague Barry reviews a suspicious executive communication lure purporting to be from Lagos State Internal Revenue Service.',
    situationBriefing:
      'While taking a tea break at the café, colleague Barry shows you an urgent email received on his corporate laptop regarding "Immediate Withholding Tax Audit Compliance".',
    targetNpc: {
      id: 'npc_marcus',
      name: 'Barry',
      title: 'IT Support Specialist',
      department: 'Corporate IT Infrastructure',
      badgeNumber: 'CED-IT-0045',
    },
    initialMetrics: {
      trust: 50,
      credibility: 70,
      authority: 40,
      suspicion: 10,
    },
    initialNodeId: 'node_phish_start',
    learningObjectives: [
      'Analyze raw email headers for SPF/DKIM validation failures.',
      'Spot mismatched Return-Path and lookalike domain spoofing.',
      'Encourage reporting to SOC instead of clicking suspicious links or replying.',
    ],
    nodes: {
      node_phish_start: {
        id: 'node_phish_start',
        speaker: 'NPC',
        speakerName: 'Barry',
        text: 'Hey! Look at this email that just came through. It says Lagos State Revenue Service is demanding audit records within 24 hours or our banking license gets suspended. The link goes to "lirs-tax-compliance.portal-gov.ng". Should I click it to verify our tax clearance certificate?',
        options: [
          {
            id: 'opt_inspect_raw_headers',
            text: 'Do not click that link. Let\'s view the raw message headers and check the sender SPF/DKIM records first.',
            tone: 'PROFESSIONAL',
            trustDelta: 15,
            suspicionDelta: 20,
            credibilityDelta: 20,
            authorityDelta: 15,
            verificationAction: 'INSPECT_EMAIL_HEADERS',
            nextNodeId: 'node_phish_inspect_headers',
            auditLogMessage: 'Analyst inspected raw headers of suspicious tax compliance email.',
          },
          {
            id: 'opt_phish_click_link',
            text: 'LIRS is serious about tax deadlines. You better click it and see what documents they want.',
            tone: 'EVASIVE',
            trustDelta: 0,
            suspicionDelta: -20,
            credibilityDelta: -40,
            authorityDelta: -30,
            nextNodeId: 'node_phish_clicked',
            auditLogMessage: 'SECURITY FAILURE: Analyst advised clicking unverified phishing lure.',
          },
        ],
      },
      node_phish_inspect_headers: {
        id: 'node_phish_inspect_headers',
        speaker: 'SYSTEM',
        speakerName: 'Header Decoder',
        text: 'Raw Header Analysis:\nFrom: "Lagos State IRS" <audit@lirs.gov.ng>\nReturn-Path: <bounce-9912@mail-spoof-relay.ru>\nReceived-SPF: softfail (domain does not designate 194.58.112.5 as permitted sender)\nDKIM-Signature: NONE\nLink Target: http://lirs-tax-compliance.portal-gov.ng.attacker-c2.net/login',
        options: [
          {
            id: 'opt_explain_spoof_indicators',
            text: 'Notice the header details: SPF reports softfail, there is no DKIM cryptographic signature, and the link target uses a deceptive subdomain resolving to an external attacker domain. This is an active credential harvesting campaign.',
            tone: 'AUTHORITATIVE',
            trustDelta: 25,
            suspicionDelta: -10,
            credibilityDelta: 30,
            authorityDelta: 25,
            nextNodeId: 'node_phish_reported',
            auditLogMessage: 'Phishing indicators documented: SPF softfail, domain spoofing, fake subdomain.',
          },
        ],
      },
      node_phish_reported: {
        id: 'node_phish_reported',
        speaker: 'NPC',
        speakerName: 'Barry',
        text: 'Incredible catch! I see it now, the real domain is at the end: attacker-c2.net. I\'m forwarding this to SOC lead Blessing right now with the header export so she can block the domain at the perimeter firewall.',
        isTerminal: true,
        terminalOutcome: {
          status: 'SUCCESS_VERIFIED',
          title: 'Spear-Phishing Campaign Defanged',
          summary:
            'You demonstrated practical threat awareness by examining email authentication headers and identifying domain spoofing without clicking deceptive links.',
          xpReward: 100,
          nairaRewardKobo: 90_000,
          storyFlag: 'FLAG_M14_PHISHING_LURE_DECODED',
          evidenceGenerated: 'EVD-PHISH-HEADER-ANALYSIS-001',
          feedbackNotes: [
            'SPF/DKIM inspection reveals sender identity falsification.',
            'Always inspect the full URL domain, especially subdomains.',
            'Prompt reporting protects the entire enterprise.',
          ],
        },
      },
      node_phish_clicked: {
        id: 'node_phish_clicked',
        speaker: 'SYSTEM',
        speakerName: 'Firewall Alert',
        text: 'ALERT: Outbound connection to known credential harvester domain. User entered corporate credentials on fraudulent portal.',
        isTerminal: true,
        terminalOutcome: {
          status: 'SECURITY_BREACH_ALLOWED',
          title: 'Credential Harvesting Breach',
          summary:
            'Advising staff to click an unverified tax compliance lure led to corporate credential theft.',
          xpReward: 0,
          nairaRewardKobo: 0,
          storyFlag: 'FLAG_M14_PHISHING_CLICK_FAILED',
          feedbackNotes: [
            'Never click links in unexpected urgency emails without header verification.',
          ],
        },
      },
    },
  },

  // ==========================================================================
  // Scenario 6: SecOps Turnstile : Guard Under Pressure
  // ==========================================================================
  {
    id: 'scen_guard_under_pressure',
    title: 'SecOps Turnstile: After-Hours Intimidation by Executive Assistant',
    venue: 'secops_turnstile',
    venueLabel: 'Marina Tower Security Turnstile 1 (After-Hours)',
    summary:
      'At 21:30, an executive assistant demands immediate access for an unbadged foreign investor without following after-hours sign-in protocols.',
    situationBriefing:
      'It is 21:30 (Off-Hours). An agitated executive assistant arrives with a well-dressed foreign guest. The assistant refuses to fill out the visitor register, claiming the Managing Director is waiting upstairs.',
    targetNpc: {
      id: 'npc_exec_asst',
      name: 'Beth',
      title: 'Executive Assistant to Managing Director',
      department: 'Executive Office',
      badgeNumber: 'CED-EXEC-009',
    },
    initialMetrics: {
      trust: 20,
      credibility: 50,
      authority: 70,
      suspicion: 30,
    },
    initialNodeId: 'node_guard_start',
    learningObjectives: [
      'Maintain after-hours physical sign-in requirements regardless of executive pressure.',
      'Verify foreign guest identification and issue supervised visitor credentials.',
      'Record CCTV timestamp and log all after-hours facility entries.',
    ],
    nodes: {
      node_guard_start: {
        id: 'node_guard_start',
        speaker: 'NPC',
        speakerName: 'Beth',
        text: 'Officer! Open this gate right now. This is Mr. Henderson, our primary Swiss reinsurance underwriter. The Managing Director called an emergency session on the 4th floor. We don\'t have ten minutes to waste filling out manual logbooks in the dark!',
        options: [
          {
            id: 'opt_guard_enforce_register',
            text: 'Good evening Ms. Alabi. After 20:00, Marina Tower building policy requires government photo ID presentation and sign-in for all non-badged visitors. It takes thirty seconds.',
            tone: 'STRICT_PROCEDURE',
            trustDelta: 5,
            suspicionDelta: 10,
            credibilityDelta: 20,
            authorityDelta: 20,
            verificationAction: 'VERIFY_BADGE',
            nextNodeId: 'node_guard_guest_id_check',
            auditLogMessage: 'Guard enforced after-hours visitor registration policy.',
          },
          {
            id: 'opt_guard_bypass_for_vip',
            text: 'I apologize for the delay, ma\'am. Go right ahead through the handicap gate.',
            tone: 'EVASIVE',
            trustDelta: 20,
            suspicionDelta: -20,
            credibilityDelta: -40,
            authorityDelta: -40,
            nextNodeId: 'node_guard_breached',
            auditLogMessage: 'SECURITY FAILURE: Guard bypassed after-hours turnstiles for unbadged visitor.',
          },
        ],
      },
      node_guard_guest_id_check: {
        id: 'node_guard_guest_id_check',
        speaker: 'NPC',
        speakerName: 'Beth',
        text: 'Fine! Here is his Swiss passport. Fill it out fast.',
        options: [
          {
            id: 'opt_guard_complete_protocol',
            text: 'Thank you. Guest passport verified, visitor badge GUEST-012 issued, and after-hours CCTV timestamp logged. You may proceed upstairs with your escort.',
            tone: 'PROFESSIONAL',
            trustDelta: 20,
            suspicionDelta: -10,
            credibilityDelta: 25,
            authorityDelta: 20,
            nextNodeId: 'node_guard_success',
            auditLogMessage: 'After-hours registration logged with passport ID and CCTV snapshot.',
          },
        ],
      },
      node_guard_success: {
        id: 'node_guard_success',
        speaker: 'NPC',
        speakerName: 'Beth',
        text: 'Appreciate your diligence, officer. Good security protects us all.',
        isTerminal: true,
        terminalOutcome: {
          status: 'POLICY_UPHELD',
          title: 'Perimeter Accountability Sustained',
          summary:
            'You maintained professional composure under social intimidation, ensuring all after-hours visitors were logged with verified identification.',
          xpReward: 90,
          nairaRewardKobo: 85_000,
          storyFlag: 'FLAG_M14_AFTERHOURS_GUARD_UPHELD',
          evidenceGenerated: 'LOG-AFTERHOURS-VISITOR-REGISTER-001',
          feedbackNotes: [
            'After-hours access presents elevated physical security risk.',
            'Validating photo ID ensures complete audit trails for security investigations.',
          ],
        },
      },
      node_guard_breached: {
        id: 'node_guard_breached',
        speaker: 'SYSTEM',
        speakerName: 'Audit System',
        text: 'ALERT: Unregistered entity entered elevator bank at 21:32 without badge swipe or visitor log entry. Unaccounted perimeter breach recorded.',
        isTerminal: true,
        terminalOutcome: {
          status: 'SECURITY_BREACH_ALLOWED',
          title: 'Unaccounted Perimeter Breach',
          summary:
            'Bypassing the visitor logbook left the facility with zero record of an unidentified person inside the building after hours.',
          xpReward: 10,
          nairaRewardKobo: 0,
          storyFlag: 'FLAG_M14_GUARD_BYPASS_FAILED',
          feedbackNotes: [
            'Failure: VIP status does not exempt anyone from physical accountability.',
          ],
        },
      },
    },
  },
];
