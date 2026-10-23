/**
 * Cyberlife — Season 1 Episode Definitions & Ground Truth Datasets
 *
 * Authored data catalog for narrative episodes, beats, triggers, tickets,
 * encrypted journal entries, and blackout mutations.
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
    {
      id: 'ep01_beat_02_ticket',
      type: 'ticket',
      title: 'Cedarline Incident Dispatch TKT-2026-1012',
      description: 'Corporate ticket from SecOps Lead Blessing regarding anomalous svc-aster activity.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_01_title',
      },
      effects: {
        setFlags: {
          flag_ep01_ticket_dispatched: true,
        },
        ticket: {
          ticketId: 'TKT-2026-1012',
          title: 'Priority SOC Triage: svc-aster SMB Queries on filesrv-01',
          requester: 'Blessing (Lead SecOps Architect)',
          organization: 'Cedarline Solutions Nigeria Ltd.',
          severity: 'HIGH',
          targetSystem: 'filesrv-01.cedarline.internal (10.0.4.20)',
          scope: '10.0.4.0/24 internal staging subnet',
          description:
            'Autonomous assistant svc-aster executed unauthorized SMB reads against filesrv-01. Determine if confidential payroll data was accessed and isolate the service if required.',
          instructions: [
            'Scan corporate network topology using netmap hosts',
            'Enumerate listening services with svcscan inspect filesrv-01',
            'Filter SIEM alerts with logview filter --severity=WARN',
            'Preserve forensic evidence EVD-2026-004 in Incident Portal',
          ],
        },
        notification: {
          title: 'Incident Portal Alert',
          body: 'New Ticket Assigned: TKT-2026-1012 (svc-aster triage)',
          icon: '🎫',
        },
      },
    },
    {
      id: 'ep01_beat_03_onion',
      type: 'onionMessage',
      title: '0xLagos Ping from Tsharp',
      description: 'Encrypted warning from independent researcher Tsharp about external reconnaissance.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_02_ticket',
      },
      effects: {
        setFlags: {
          flag_ep01_tsharp_warned: true,
        },
        onionMessage: {
          id: 'msg-tsharp-ep01',
          contactId: 'tsharp',
          contactName: 'Tsharp',
          text: 'Yo Protector. 0xLagos telemetry caught offshore subnets scanning port 8080 on Cedarline\'s app portal. Whatever Blessing put on your desk, check the network perimeter before management sweeps the logs.',
          timestampString: '08:05 AM',
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
    {
      id: 'ep01_beat_04_call',
      type: 'call',
      title: 'Urgent VoIP Call from Barry',
      description: 'Distressed call from junior administrator Barry begging for confidentiality.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_03_onion',
      },
      effects: {
        setFlags: {
          flag_ep01_barry_called: true,
        },
        call: {
          id: 'call-barry-ep01',
          callerId: 'barry-adebayo',
          callerName: 'Barry',
          callerRole: 'Junior Systems Administrator',
          dialogue: [
            {
              text: 'Protector! Please tell me you haven\'t submitted the preliminary triage yet...',
              delayMs: 2500,
            },
            {
              text: 'I was only in the server closet on Saturday fixing the backup AC unit. I didn\'t touch Aster\'s configuration!',
              delayMs: 3800,
            },
            {
              text: 'If VP Michael sees my name near this ticket, I\'m finished. Just verify the IAM roles before you write the report.',
              delayMs: 4000,
            },
          ],
        },
      },
    },
    {
      id: 'ep01_beat_05_daycase',
      type: 'dayCase',
      title: 'Cedarline Enterprise Triage Shift',
      description: 'Complete the authorized incident investigation for Aster on the SOC workstation.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_04_call',
      },
      effects: {
        setFlags: {
          flag_ep01_daycase_active: true,
        },
        factionStandingDeltas: {
          faction_cedarline: 5,
        },
      },
    },
    {
      id: 'ep01_beat_06_blackout',
      type: 'blackout',
      title: 'Cliffhanger Blackout & Lost Time Mutator',
      description: 'Municipal power cut, 1 kHz inverter alarm, 90-minute time jump, and nexus_handshake_dump.pcap drop.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_05_daycase',
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
                '[BINARY PCAP ARTIFACT: TLS Handshake to vault-core-01.transit.internal // JA3: 72c6499890ba // Eko Nexus Clearing Relay // Captured 01:14 WAT]',
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
          body: 'Workstation re-established on emergency inverter reserve (11.8V).',
          icon: '⚡',
        },
      },
    },
    {
      id: 'ep01_beat_07_debrief',
      type: 'debrief',
      title: 'Episode 01 Debrief: ATT&CK Mapping & Post-Incident Analysis',
      description: 'Educational debrief mapping T1021.002 and T1071.001 with real-world incident response parallels.',
      trigger: {
        type: 'previousBeatFinished',
        previousBeatId: 'ep01_beat_06_blackout',
      },
      effects: {
        setFlags: {
          flag_ep01_completed: true,
        },
        debrief: {
          attckMappings: ['T1021.002: SMB/Windows Admin Shares', 'T1071.001: Web Protocols'],
          realWorldSummary:
            'Tier-1 analysts frequently encounter internal service misconfigurations that conceal subtle outbound C2 channels. Verifying boundary packet captures against local application logs is critical before closing containment tickets.',
          nextStudyTopics: ['SANS SEC503: Network Intrusion Analysis', 'RFC 2474: DiffServ Architecture'],
        },
        factionStandingDeltas: {
          faction_0xlagos: 10,
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
