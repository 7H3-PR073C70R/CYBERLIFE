/**
 * Cyberlife — Episode 01 Authored Mentor Hint Catalog (Blessing / SecOps Lead)
 *
 * Authored 3-level hint ladder from Blessing in authentic Nigerian English:
 * - Tier 1: Tactical nudge
 * - Tier 2: Directional guidance
 * - Tier 3: Concrete command / display filter answer
 */

import { MentorHintDefinition } from './mentorHintLadder';

export const EPISODE_01_MENTOR_HINTS: readonly MentorHintDefinition[] = [
  {
    beatId: 'ep01_beat_05_recon',
    idleThresholdSecondsTier1: 45,
    idleThresholdSecondsTier2: 90,
    idleThresholdSecondsTier3: 135,
    tier1Nudge:
      'Protector, start with subnet reconnaissance. Check which hosts are online on the 10.0.4.0/24 subnet before diving into logs.',
    tier2Direction:
      'Run netmap to confirm filesrv-01 and app-portal-01, then inspect Aster’s listening ports with svcscan.',
    tier3Answer:
      'Execute: "netmap hosts", then "svcscan inspect app-portal-01", and "logview filter --severity=WARN".',
  },
  {
    beatId: 'ep01_beat_06_packetlens',
    idleThresholdSecondsTier1: 45,
    idleThresholdSecondsTier2: 90,
    idleThresholdSecondsTier3: 135,
    tier1Nudge:
      'Protector, open Packet Lens on your desktop. We need to isolate the SMB2 Tree Connect request from app-portal-01.',
    tier2Direction:
      'In Packet Lens, apply a Wireshark display filter combining SMB2 command type 5 with the source IP address 10.0.4.15.',
    tier3Answer:
      'Enter the display filter: "smb2.cmd == 5 && ip.addr == 10.0.4.15" in Packet Lens. Check the share path in the dissected frame details.',
  },
  {
    beatId: 'ep01_beat_07_containment',
    idleThresholdSecondsTier1: 45,
    idleThresholdSecondsTier2: 90,
    idleThresholdSecondsTier3: 135,
    tier1Nudge:
      'Protector, remember NIST incident lifecycle: preserve your cryptographic evidence first, then isolate Aster before remediating IAM.',
    tier2Direction:
      'Preserve EVD-2026-004 in Incident Portal, then use aster-admin in terminal to contain and demote the role to kb-assistant.',
    tier3Answer:
      'Run: "aster-admin contain", then "aster-admin remediate --role=kb-assistant", and finish with "aster-admin verify".',
  },
  {
    beatId: 'ep01_beat_10_night_recon',
    idleThresholdSecondsTier1: 45,
    idleThresholdSecondsTier2: 90,
    idleThresholdSecondsTier3: 135,
    tier1Nudge:
      'Protector, Tsharp warned us that offshore scanners hit 8080. Check your trace status before sending any active network probes.',
    tier2Direction:
      'Passive intelligence gathering keeps your noise profile low. An active scan on app-portal-01:8080 will generate significant defender telemetry.',
    tier3Answer:
      'Type "trace status" to review OPSEC posture, or run "trace probe app-portal-01:8080" if you want to test perimeter detection response.',
  },
];

export function getMentorHintForBeat(beatId: string): MentorHintDefinition | undefined {
  return EPISODE_01_MENTOR_HINTS.find(h => h.beatId === beatId);
}
