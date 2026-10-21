/**
 * Cyberlife — Milestone 22: Exploration Discovery Catalogue
 *
 * Authored set of discoveries the player can find by:
 *  - Being at a specific location at a specific time of day
 *  - Observing NPCs in their routines
 *  - Noticing environmental clues while exploring
 *  - Hearing ambient rumors at market stalls or community boards
 *
 * Each discovery connects the living city to meaningful game opportunities
 * (contracts, relationships, skill exercises, flagged story beats).
 *
 * SAFETY: All data is 100% in-memory authored content. No real-world queries.
 */

import type { ExplorationDiscovery } from './types';

export const EXPLORATION_DISCOVERIES: readonly ExplorationDiscovery[] = [

  // =========================================================================
  // NEIGHBORHOOD (Outdoor Lagos Island)
  // =========================================================================

  {
    id: 'disc_noticeboard_cyber_warning',
    category: 'AMBIENT_RUMOR',
    title: 'Community Cybersecurity Alert',
    description:
      'A hand-typed notice on the Tinubu Square community board warns residents of a surge in SIM-swap scams targeting GTBank accounts on Lagos Island. An anonymous tip references the same IP range Cedarline flagged in the Aster incident.',
    requiredLocationId: 'neighborhood',
    availableHours: [7, 22],
    setsFlag: { has_read_community_noticeboard: true },
    unlocksActivityId: 'act_blue_broad_street_triage',
    isRepeatable: false,
  },

  {
    id: 'disc_mama_esther_intel',
    category: 'NPC_INTEL',
    title: "Mama Esther's Suspicious Customer",
    description:
      "At her provisions stall, Mama Esther mentions a well-dressed stranger who bought three burner SIMs in cash this morning and asked about the \"government computers on Marina\". She noted his Hausa accent and Lagos State registration plate (KJA-442-DA).",
    requiredLocationId: 'neighborhood',
    requiredNpcId: 'npc_nkechi',
    availableHours: [8, 17],
    unlocksActivityId: 'act_story_broad_street_intel',
    setsFlag: { mama_esther_informant_active: true },
    isRepeatable: false,
  },

  {
    id: 'disc_uncle_ola_fountain_chat',
    category: 'NPC_INTEL',
    title: 'Uncle Ola at the Civic Fountain',
    description:
      "Uncle Ola is sitting at the Tinubu Square fountain bench reading his phone. He mentions a recent power outage at Broad Street 14-18 that coincided with what he believes was an ATM card skimmer installation on the FCMB kiosk. He'll share more if your relationship is warm.",
    requiredLocationId: 'neighborhood',
    requiredNpcId: 'npc_segun',
    availableHours: [17, 21],
    setsFlag: { uncle_ola_atm_tip_known: true },
    isRepeatable: false,
  },

  {
    id: 'disc_tsharp_marina_handoff',
    category: 'NPC_INTEL',
    title: 'Tsharp at the Marina Seawall',
    description:
      'Tsharp (Tunde) is leaning on the Marina seawall railings at dusk, scrolling on a hardened laptop. He spots you and discreetly mentions a Tor-routed darknet listing that appeared this week offering Cedarline credential dumps. He can share the onion address.',
    requiredLocationId: 'neighborhood',
    requiredNpcId: 'npc_tunde',
    availableHours: [19, 24],
    unlocksActivityId: 'act_blue_broad_street_triage',
    setsFlag: { tsharp_darknet_tip_known: true },
    isRepeatable: false,
  },

  {
    id: 'disc_danfo_stop_eavesdrop',
    category: 'AMBIENT_RUMOR',
    title: 'Danfo Driver Argument',
    description:
      'Two danfo drivers at the Balogun bus shelter are loudly arguing about "government people" who blocked their route near Marina last Tuesday. One mentions police vans and men in suits. The date matches a Cedarline building security incident.',
    requiredLocationId: 'neighborhood',
    availableHours: [6, 10],
    setsFlag: { marina_incident_date_known: true },
    isRepeatable: false,
  },

  {
    id: 'disc_balogun_market_hardware',
    category: 'SKILL_PRACTICE',
    title: 'Hardware Lab: Balogun Electronics Stall',
    description:
      'The Balogun Electronics & Cables stall has a bin of USB drives, serial adapters, and network diagnostic cables. The proprietor lets you test a cable continuity tester and practice distinguishing USB-A vs USB-C power delivery specs — it\'s a free hands-on hardware session.',
    requiredLocationId: 'neighborhood',
    availableHours: [9, 18],
    isRepeatable: true,
  },

  {
    id: 'disc_broad_street_evening_patrol',
    category: 'ENVIRONMENTAL_CLUE',
    title: 'Private Security Pattern Observation',
    description:
      'Between 20:00 and 22:00, two uniformed private security guards from "Covenant Shield Ltd" walk a fixed 8-minute patrol loop around the Cedarline HQ building. The western blind spot lasts roughly 90 seconds. Useful intelligence for physical security assessments.',
    requiredLocationId: 'neighborhood',
    availableHours: [20, 22],
    setsFlag: { cedarline_patrol_pattern_known: true },
    isRepeatable: false,
  },

  {
    id: 'disc_anjola_recruiter_encounter',
    category: 'CONTRACT_LEAD',
    title: 'Anjola Talent Scouting',
    description:
      'Anjola (Folake) is conducting informal talent interviews at a white plastic table outside the Eko Bistro. She sees you and waves — she has a Lagos-based fintech client (Paystack partner) seeking a freelance security auditor for a 3-day contract.',
    requiredLocationId: 'neighborhood',
    requiredNpcId: 'npc_folake',
    availableHours: [9, 15],
    unlocksActivityId: 'act_freelance_paystack_bounty',
    setsFlag: { anjola_contract_offer_seen: true },
    isRepeatable: false,
  },

  // =========================================================================
  // CEDARLINE INTERIOR
  // =========================================================================

  {
    id: 'disc_cedarline_server_log_anomaly',
    category: 'ENVIRONMENTAL_CLUE',
    title: 'Unusual Server Rack Blinking Pattern',
    description:
      'The Cedarline server rack in the main room has an unusual amber-red LED alternation on bay 3 that doesn\'t match normal traffic patterns. Closer inspection reveals svc-aster\'s scheduled sync jobs have been running 12x more frequently than configured.',
    requiredLocationId: 'cedarline_interior',
    availableHours: [8, 22],
    requiredFlags: { mission_aster_active: true },
    setsFlag: { aster_overrun_frequency_noted: true },
    isRepeatable: false,
  },

  {
    id: 'disc_blessing_whiteboard_notes',
    category: 'NPC_INTEL',
    title: "Blessing's Investigation Whiteboard",
    description:
      "On Blessing's desk is a printed sticky note with three internal IP ranges circled in red marker: 10.0.4.15, 10.0.4.20, and 10.0.4.88. These match the lateral movement signatures in the Aster incident logs. She\'s already narrowed the attack surface.",
    requiredLocationId: 'cedarline_interior',
    requiredNpcId: 'npc_amina',
    availableHours: [8, 20],
    setsFlag: { aster_ips_known: true },
    isRepeatable: false,
  },

  {
    id: 'disc_cedarline_soc_access_badge',
    category: 'VENUE_UNLOCK',
    title: 'SOC Access Badge Available',
    description:
      'Femi (Gabriel) is at the Cedarline reception and mentions the temporary contractor access cards are now available — you can collect your SECURITY_SECOPS badge at the front desk. This grants access to the Level 4 SOC workstation for the duration of the Aster investigation.',
    requiredLocationId: 'cedarline_interior',
    requiredNpcId: 'npc_femi',
    availableHours: [8, 18],
    requiredFlags: { mission_aster_active: true },
    setsFlag: { cedarline_soc_badge_collected: true },
    isRepeatable: false,
  },

  // =========================================================================
  // APARTMENT INTERIOR
  // =========================================================================

  {
    id: 'disc_apartment_packet_capture',
    category: 'SKILL_PRACTICE',
    title: 'Home Lab: Packet Capture Practice',
    description:
      'Your apartment workstation has a loopback packet capture running on tun0. You can run a simulated Wireshark session on the loopback interface and practice identifying DNS, HTTP, and TLS handshake patterns — a useful warm-up before real incident analysis.',
    requiredLocationId: 'apartment_interior',
    availableHours: [0, 24],
    isRepeatable: true,
  },

  {
    id: 'disc_apartment_morning_briefing',
    category: 'AMBIENT_RUMOR',
    title: 'Morning Threat Intelligence Feed',
    description:
      'At 07:00, your research workstation automatically aggregates overnight OSINT feeds. Today\'s digest includes: a new CVE in the Cedarline-adjacent FortiGate firmware, a Mandiant report on West African banking trojans, and a Signal message from Tsharp referencing "something big at Marina".',
    requiredLocationId: 'apartment_interior',
    availableHours: [7, 9],
    setsFlag: { morning_osint_digest_seen: true },
    isRepeatable: true,
  },
];

/**
 * Returns all authored discoveries available at the given location + simulation hour,
 * filtered by required flags from the current game state.
 */
export function getAvailableDiscoveries(
  locationId: string,
  simulationHour: number,
  worldFlags: Readonly<Record<string, boolean | string | number>> = {},
  presentNpcIds: readonly string[] = []
): readonly ExplorationDiscovery[] {
  return EXPLORATION_DISCOVERIES.filter(disc => {
    // Location match
    if (disc.requiredLocationId !== 'any' && disc.requiredLocationId !== locationId) {
      return false;
    }

    // Hour window
    if (disc.availableHours) {
      const [start, end] = disc.availableHours;
      if (start <= end) {
        if (simulationHour < start || simulationHour >= end) return false;
      } else {
        // Wraps midnight
        if (simulationHour < start && simulationHour >= end) return false;
      }
    }

    // Required NPC present
    if (disc.requiredNpcId && !presentNpcIds.includes(disc.requiredNpcId)) {
      return false;
    }

    // Required world flags
    if (disc.requiredFlags) {
      const flags = worldFlags ?? {};
      for (const [key, val] of Object.entries(disc.requiredFlags)) {
        if (flags[key] !== val) return false;
      }
    }

    return true;
  });
}

/**
 * Returns a specific discovery by ID.
 */
export function getDiscovery(id: string): ExplorationDiscovery | undefined {
  return EXPLORATION_DISCOVERIES.find(d => d.id === id);
}
