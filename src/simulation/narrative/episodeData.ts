/**
 * Cyberlife — Season 1 Episode Definitions & Ground Truth Datasets
 *
 * Authored data catalog for narrative episodes, beats, triggers, tickets,
 * encrypted journal entries, choices, and blackout mutations.
 */

import { EpisodeDefinition, JournalEntry } from './episodeTypes';

export const EPISODE_01_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'ep01_journal_01',
    episodeId: 'ep01_triage_init',
    timestampString: 'Oct 12, 2026 — 07:42 WAT',
    title: 'Monday Morning // Before the Marina Tower Shift',
    text: 'The power cut out twice last night on Odunlami Street. You woke up with the ceiling fan silent and your inverter down to 11.8V. Before you could even finish your instant coffee, Blessing called: Cedarline\'s autonomous assistant svc-aster had been making after-hours SMB reads against filesrv-01. You know the machine did not hallucinate those packets, but you are certain nobody touched the external perimeter gateway.',
    claims: [
      {
        claimId: 'ep01_claim_01',
        statement: 'You did not touch Cedarline\'s external transit gateway or export corporate tokens.',
        truthfulness: 'TRUE',
      },
      {
        claimId: 'ep01_claim_02',
        statement: 'The Aster query was strictly an internal staging misconfiguration with zero external C2 egress.',
        truthfulness: 'CONTRADICTED',
        evidenceRef: 'EVD-2026-001.pcap',
      },
    ],
  },
  {
    id: 'ep01_journal_02',
    episodeId: 'ep01_triage_init',
    timestampString: 'Oct 12, 2026 — 23:45 WAT',
    title: 'Midnight Reflection // Odunlami Dark',
    text: 'The day shift at Marina Tower felt like holding back a broken dam with bare hands. Michael wanted the incident report scrubbed clean for the European acquisition audit. Then Tsharp\'s Onion ping landed: offshore IPs were scanning app-portal-01 on port 8080 during the exact window Aster queried the confidential payroll share. You closed your workstation, but the questions followed you home.',
    claims: [
      {
        claimId: 'ep01_claim_03',
        statement: '0xLagos off-grid telemetry detected external scans targeting port 8080 from offshore subnets.',
        truthfulness: 'TRUE',
      },
      {
        claimId: 'ep01_claim_04',
        statement: 'Mercy had no involvement in provisioning Aster\'s wildcard IAM tokens or staging the export pipeline.',
        truthfulness: 'CONTRADICTED',
        evidenceRef: 'EVD-2026-004',
      },
    ],
  },
];

export const EPISODE_01_DEFINITION: EpisodeDefinition = {
  id: 'ep01_triage_init',
  title: 'ep01_triage_init.pcap',
  episodeHash: 'c7b9148d2f5a6b0981e4c7310df0b968c9284218a5e82110c7104bfa3513a011',
  season: 1,
  episodeNumber: 1,
  synopsis:
    'Monday morning SOC triage at Cedarline reveals anomalous SMB queries from autonomous assistant svc-aster. What begins as an internal IAM permission check twists into an unauthorized handshake with the Eko Nexus pipeline.',
  kernelBanner: 'EkoSec Linux 6.12.0-cyberlife-arm64 #1 SMP PREEMPT_DYNAMIC WAT 2026',
  initialJournalEntries: EPISODE_01_JOURNAL_ENTRIES,
  beats: [
    // ------------------------------------------------------------------------
    // BEAT 1: Cold Open Bootloader Title Card
    // ------------------------------------------------------------------------
    {
      id: 'ep01_beat_01_title',
      type: 'titleCard',
      title: 'Boot Sequence: ep01_triage_init.pcap',
      description: 'Cold-open terminal boot sequence displaying UTC+1 timestamp, SHA-256 hash, and episode title.',
      trigger: {
        type: 'immediate',
      },
      effects: {
        setFlags: {
          flag_ep01_title_shown: true,
        },
        unlockJournalEntryId: 'ep01_journal_01',
        notification: {
          title: 'Encrypted Journal Updated',
          body: 'New entry unlocked in ~/.vault/journal.enc',
          icon: '📓',
        },
      },
    },

    // ------------------------------------------------------------------------
    // BEAT 2: Apartment Morning (Blessing Dispatch Call)
    // ------------------------------------------------------------------------
    {
      id: 'ep01_beat_02_morning',
      type: 'call',
      title: 'Odunlami Morning & Blessing Dispatch Call',
      description: 'Morning wake-up on Odunlami Street. Urgent dispatch call from SecOps Lead Blessing.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_01_title',
      },
      effects: {
        setFlags: {
          flag_ep01_morning_started: true,
          flag_blessing_called_morning: true,
        },
        call: {
          id: 'call-blessing-morning',
          callerId: 'npc_amina',
          callerName: 'Blessing',
          callerRole: 'Lead SecOps Architect',
          callerOrg: 'Cedarline SecOps',
          dialogue: [
            {
              text: 'Protector, good morning. Don’t waste time with breakfast. Get to Marina Tower now; svc-aster is pulling files it shouldn’t touch.',
              delayMs: 3000,
              speech: "Protector, good morning. Don't waste time with breakfast. Get to Marina Tower now, service aster is pulling files it shouldn't touch.",
              delivery: 'urgent',
            },
            {
              text: 'I’ve suppressed the automated alert from the executive dashboard for now, but Michael is already asking questions. Hurry up.',
              delayMs: 4000,
              speech: "I've suppressed the automated alert from the executive dashboard for now, but Michael is already asking questions. Hurry up.",
              delivery: 'urgent',
            },
          ],
        },
        notification: {
          title: 'Urgent Dispatch // Blessing',
          body: 'Get to Marina Tower now; svc-aster is querying restricted shares.',
          icon: '📞',
        },
      },
    },

    // ------------------------------------------------------------------------
    // BEAT 3: Marina Transit Walk (Barry Commute Encounter)
    // ------------------------------------------------------------------------
    {
      id: 'ep01_beat_03_commute',
      type: 'call',
      title: 'Broad Street Commute & Barry Encounter',
      description: 'Commute past Broad Street vendors. Brief evasive encounter with junior sysadmin Barry.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_02_morning',
      },
      effects: {
        setFlags: {
          flag_ep01_commute_done: true,
          flag_barry_sweating_seen: true,
        },
        call: {
          id: 'call-barry-street',
          callerId: 'npc_marcus',
          callerName: 'Barry',
          callerRole: 'Junior Systems Administrator',
          callerOrg: 'Cedarline Infrastructure',
          dialogue: [
            {
              text: 'Protector! Ah... good morning. Hot morning, abi? I’m just running to grab meat pie. Server room AC was acting up all weekend, no be small thing.',
              delayMs: 3200,
              speech: "Protector! Ah, good morning. Hot morning, abi? I'm just running to grab meat pie. Server room A C was acting up all weekend, no be small thing.",
              delivery: 'anxious',
            },
            {
              text: 'If anyone asks, I was only doing cooling rack maintenance on Saturday! Nothing else!',
              delayMs: 3500,
              speech: "If anyone asks, I was only doing cooling rack maintenance on Saturday! Nothing else!",
              delivery: 'anxious',
            },
          ],
        },
        notification: {
          title: 'Street Encounter // Broad Street',
          body: 'Barry appeared visibly sweating and nervous near the Marina commercial corridor.',
          icon: '🚶',
        },
      },
    },

    // ------------------------------------------------------------------------
    // BEAT 4: Cedarline Dispatch Ticket ALT-2026-1012
    // ------------------------------------------------------------------------
    {
      id: 'ep01_beat_04_ticket',
      type: 'ticket',
      title: 'Cedarline Incident Dispatch ALT-2026-1012',
      description: 'Official corporate incident ticket assigned by Blessing with authorized RoE scope.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_03_commute',
      },
      effects: {
        setFlags: {
          flag_ep01_ticket_dispatched: true,
        },
        ticket: {
          ticketId: 'ALT-2026-1012',
          title: 'Priority SOC Triage: svc-aster SMB Queries on filesrv-01',
          requester: 'Blessing (Lead SecOps Architect)',
          organization: 'Cedarline Solutions Nigeria Ltd.',
          severity: 'HIGH',
          targetSystem: 'filesrv-01.cedarline.internal (10.0.4.20)',
          scope: '10.0.4.0/24 internal staging subnet (app-portal-01, filesrv-01)',
          description:
            'Autonomous assistant svc-aster executed unauthorized SMB reads against filesrv-01. Determine if confidential payroll data was accessed and isolate the service if required.',
          instructions: [
            'Enumerate subnet hosts using "netmap hosts"',
            'Inspect Aster listening services with "svcscan inspect app-portal-01"',
            'Filter SIEM alerts with "logview filter --severity=WARN"',
            'Analyze traffic capture in Packet Lens with "smb2.cmd == 5 && ip.addr == 10.0.4.15"',
            'Preserve forensic evidence EVD-2026-004 in Incident Portal',
          ],
        },
        notification: {
          title: 'Incident Portal Alert',
          body: 'New Ticket Assigned: ALT-2026-1012 (svc-aster triage)',
          icon: '🎫',
        },
      },
    },

    // ------------------------------------------------------------------------
    // BEAT 5: Subnet Reconnaissance & SIEM Triage
    // ------------------------------------------------------------------------
    {
      id: 'ep01_beat_05_recon',
      type: 'dayCase',
      title: 'Subnet Reconnaissance & SIEM Triage',
      description: 'Enumerate subnet topology with netmap and triage CEF alerts from mon-siem-01.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_04_ticket',
      },
      effects: {
        setFlags: {
          flag_ep01_recon_active: true,
        },
      },
    },

    // ------------------------------------------------------------------------
    // BEAT 6: Packet Lens Deep SMB2 Dissection
    // ------------------------------------------------------------------------
    {
      id: 'ep01_beat_06_packetlens',
      type: 'dayCase',
      title: 'Packet Lens: SMB2 Tree Connect & Eko Nexus Anomaly',
      description: 'Filter capture for smb2.cmd == 5 && ip.addr == 10.0.4.15 to isolate Tree Connect and outbound TLS anomaly.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_05_recon',
      },
      effects: {
        setFlags: {
          flag_ep01_packetlens_ready: true,
        },
      },
    },

    // ------------------------------------------------------------------------
    // BEAT 7: Cryptographic Evidence Preservation & Aster Containment
    // ------------------------------------------------------------------------
    {
      id: 'ep01_beat_07_containment',
      type: 'dayCase',
      title: 'Cryptographic Evidence Preservation & Aster Containment',
      description: 'Preserve EVD-2026-004 and execute aster-admin contain, remediate, and verify.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_06_packetlens',
      },
      effects: {
        setFlags: {
          flag_ep01_containment_ready: true,
        },
      },
    },

    // ------------------------------------------------------------------------
    // BEAT 8: The Corporate Dilemma: Escalate vs. Shield
    // ------------------------------------------------------------------------
    {
      id: 'ep01_beat_08_choice',
      type: 'choice',
      title: 'The Corporate Dilemma: Escalate vs. Shield',
      description: 'VP Michael calls with pressure. Player decides whether to escalate external pipeline staging or shield the team.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_07_containment',
      },
      effects: {
        setFlags: {
          flag_ep01_choice_pending: true,
        },
        call: {
          id: 'call-michael-pressure',
          callerId: 'npc_femi',
          callerName: 'Michael',
          callerRole: 'VP of Technology Infrastructure',
          callerOrg: 'Cedarline Solutions',
          dialogue: [
            {
              text: 'Protector. Blessing tells me you’re leading the Aster review. I have the European acquisition audit in forty-eight hours. Is this contained?',
              delayMs: 3000,
              speech: "Protector. Blessing tells me you're leading the Aster review. I have the European acquisition audit in forty-eight hours. Is this contained?",
              delivery: 'urgent',
            },
            {
              text: 'I don’t need a lecture on MITRE techniques. I need clean incident sign-off showing zero external exposure. Do not invent ghosts on my network.',
              delayMs: 4000,
              speech: "I don't need a lecture on MITRE techniques. I need clean incident sign-off showing zero external exposure. Do not invent ghosts on my network.",
              delivery: 'tense',
            },
          ],
        },
        choice: {
          choiceId: 'ep01_choice_escalate_vs_shield',
          title: 'Incident ALT-2026-1012 Escalation Decision',
          prompt:
            'Michael is pressuring you to sign off on a simple internal misconfiguration. Packet Lens proved svc-aster initiated an outbound TLS handshake to vault-core-01.transit.internal (Eko Nexus). Barry begs you to shield the team. How do you file the final incident report?',
          options: [
            {
              id: 'A',
              label: 'Choice A: Escalate Pipeline Staging Anomaly',
              description:
                'Log the outbound TLS connection to vault-core-01.transit.internal into the official ticket report and escalate directly to the executive board. Truthful documentation; exposes Barry and challenges Michael.',
              factionStandingDeltas: {
                faction_cedarline: 10,
                faction_0xlagos: 5,
              },
              flagsToSet: {
                flag_ep01_choice_escalate: true,
                flag_barry_exposed: true,
                flag_nexus_escalated: true,
              },
              legalExposureDelta: 0,
            },
            {
              id: 'B',
              label: 'Choice B: Shield Team & Contain Internally',
              description:
                'Mark the ticket as an internal IAM permission misconfiguration. Sever Aster’s SMB routes quietly to shield Barry from executive termination, and investigate the Nexus address off-the-books.',
              factionStandingDeltas: {
                faction_cedarline: -5,
              },
              flagsToSet: {
                flag_ep01_choice_shield: true,
                flag_barry_protected: true,
                flag_investigate_quietly: true,
              },
              legalExposureDelta: 10,
            },
          ],
        },
      },
    },

    // ------------------------------------------------------------------------
    // BEAT 9: Enterprise Day Case Debrief
    // ------------------------------------------------------------------------
    {
      id: 'ep01_beat_09_day_debrief',
      type: 'debrief',
      title: 'Enterprise SOC Debrief: ALT-2026-1012',
      description: 'Educational debrief mapping T1021.002, T1071.001, proxy correlation, and incident triage score.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_08_choice',
      },
      effects: {
        setFlags: {
          flag_ep01_day_debrief_shown: true,
        },
        debrief: {
          attckMappings: [
            'T1021.002: Remote Services — SMB/Windows Admin Shares',
            'T1071.001: Command and Control — Web Protocols',
          ],
          realWorldSummary:
            'Tier-1 analysts frequently encounter internal service misconfigurations that conceal subtle outbound C2 channels. Verifying boundary packet captures and proxy logs against local application logs is critical before closing containment tickets.',
          nextStudyTopics: [
            'SANS SEC503: Network Intrusion Analysis',
            'NIST SP 800-61r2: Computer Security Incident Handling Guide',
            'RFC 2474: DiffServ Architecture',
          ],
        },
      },
    },

    // ------------------------------------------------------------------------
    // BEAT 10: The Midnight Query (Night Job Gray Zone Recon)
    // ------------------------------------------------------------------------
    {
      id: 'ep01_beat_10_night_recon',
      type: 'nightJob',
      title: 'The Midnight Query: Gray-Zone Reconnaissance',
      description: 'Tsharp tips you off to offshore port 8080 scans. Passive OSINT stays quiet; active scanning trips trace and triggers defender response.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_09_day_debrief',
      },
      effects: {
        setFlags: {
          flag_ep01_night_job_active: true,
        },
        onionMessage: {
          id: 'msg-tsharp-ep01',
          contactId: 'tsharp',
          contactName: 'Tsharp',
          text: 'Yo Protector. 0xLagos telemetry caught offshore subnets scanning port 8080 on Cedarline\'s app portal. Whatever Blessing put on your desk, check the network perimeter before management sweeps the logs.',
          timestampString: '21:30',
          typingDelayMs: 1500,
          isEncrypted: true,
        },
        notification: {
          title: 'Onion Chat (Encrypted)',
          body: 'New message from Tsharp: "0xLagos telemetry caught offshore subnets..."',
          icon: '🧅',
        },
      },
    },

    // ------------------------------------------------------------------------
    // BEAT 11: Encrypted Journal Midnight Reflection
    // ------------------------------------------------------------------------
    {
      id: 'ep01_beat_11_journal_night',
      type: 'journalEntry',
      title: 'Encrypted Journal: Midnight Reflection',
      description: 'Protector logs second reflection in ~/.vault/journal.enc with seeds of contradiction.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_10_night_recon',
      },
      effects: {
        setFlags: {
          flag_ep01_night_journal_unlocked: true,
        },
        unlockJournalEntryId: 'ep01_journal_02',
        notification: {
          title: 'Encrypted Journal Updated',
          body: 'Second reflection logged in ~/.vault/journal.enc',
          icon: '📓',
        },
      },
    },

    // ------------------------------------------------------------------------
    // BEAT 12: Cliffhanger Blackout Beat
    // ------------------------------------------------------------------------
    {
      id: 'ep01_beat_12_cliffhanger',
      type: 'blackout',
      title: 'The Disconnect & Dump: Municipal Grid Cut',
      description: 'Municipal power cut, inverter alarm, 90-minute time jump, and nexus_handshake_dump.pcap drop.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_11_journal_night',
      },
      effects: {
        setFlags: {
          flag_ep01_blackout_triggered: true,
          flag_nexus_discovered: true,
        },
        blackout: {
          durationSeconds: 4,
          clockSkipSeconds: 5400, // 90 minutes
          mutations: [
            {
              type: 'WRITE_FILE',
              targetPath: '/tmp/nexus_handshake_dump.pcap',
              content:
                '[SYNTHETIC PCAP ARTIFACT: TLS 1.3 Handshake to vault-core-01.transit.internal:8443 // SNI: vault-core-01.transit.internal // JA3: 72c6499890bace0f12d8a011a0098f9a // Eko Nexus Clearing Relay // Captured 01:14:02 WAT // Frame 1: Client Hello, Cipher: TLS_AES_128_GCM_SHA256 // Frame 2: Server Hello, KeyShare: X25519 // Status: ESTABLISHED]',
            },
            {
              type: 'SET_FLAG',
              flagKey: 'flag_nexus_pcap_in_tmp',
              flagValue: true,
            },
            {
              type: 'TIME_SKIP',
              skipMinutes: 90,
            },
          ],
        },
        onionMessage: {
          id: 'msg-nexus-anon-ep01',
          contactId: 'anonymous_nexus',
          contactName: '[Unknown Relay]',
          text: 'You saw the Nexus address. Walk away.',
          timestampString: '02:44 AM',
          typingDelayMs: 2000,
          isEncrypted: true,
        },
        notification: {
          title: 'Power Restored (Battery Mode)',
          body: 'Workstation re-established on emergency inverter reserve (11.8V). Artifact detected in /tmp.',
          icon: '⚡',
        },
      },
    },
  ],
};

export const AUTHORED_EPISODES: readonly EpisodeDefinition[] = [EPISODE_01_DEFINITION];

export function getEpisodeById(id: string): EpisodeDefinition | null {
  return AUTHORED_EPISODES.find(ep => ep.id === id) ?? null;
}

export function getAllEpisodes(): readonly EpisodeDefinition[] {
  return AUTHORED_EPISODES;
}
