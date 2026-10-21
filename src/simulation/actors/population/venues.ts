/**
 * Cyberlife : Meaningful Interior Venues & Access Policies
 *
 * Defines explicit interior destinations across Lagos Island with realistic
 * operating hours, access restrictions (badges, escorts), available services,
 * and context-appropriate resident NPCs.
 */

import { InteriorVenueDefinition } from './types';

export const LAGOS_ISLAND_VENUES: readonly InteriorVenueDefinition[] = [
  // 1. Player Apartment
  {
    venueId: 'venue-player-apartment',
    name: 'Player Apartment : Broad Street 14',
    address: '14 Broad Street, 2nd Floor, Lagos Island',
    environmentType: 'residential_neighborhood',
    correspondingLocationId: 'apartment_interior',
    openingHours: {
      openHour: 0,
      closeHour: 23,
      is24Hours: true,
      openDaysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    },
    accessPolicy: 'PUBLIC', // Player's own residence
    maxCapacity: 4,
    availableServices: ['SECURE_WORKSTATION', 'REST_AND_RECOVERY', 'WIFI_HOTSPOT'],
    residentNpcIds: [],
    ambientSoundscape: 'Subtle street hum through windows, ceiling fan hum, inverter battery relay click.',
    description:
      'Your private home base. Features an independent research workstation, daybed, inverter power buffer, and desk clutter.',
  },

  // 2. Cedarline Marina Tower Lobby & Reception
  {
    venueId: 'venue-cedarline-reception',
    name: 'Cedarline Services : Marina Tower Ground Reception',
    address: '14–18 Marina Boulevard, Ground Floor',
    environmentType: 'corporate_office_reception',
    correspondingLocationId: 'cedarline_interior',
    openingHours: {
      openHour: 7,
      closeHour: 20,
      is24Hours: false,
      openDaysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
    },
    accessPolicy: 'PUBLIC', // Reception is public, inner turnstiles require badge
    maxCapacity: 25,
    availableServices: ['JOB_BOARD_NOTICE'],
    residentNpcIds: ['npc_femi'],
    ambientSoundscape: 'Turnstile RFID chimes, polished stone footsteps, telephone rings, elevator arrival bell.',
    description:
      'Polished marble reception with corporate turnstiles, security sign-in ledger, and executive elevator banks.',
  },

  // 3. Cedarline Level 4 SOC
  {
    venueId: 'venue-cedarline-soc',
    name: 'Cedarline Services : Security Operations Center (Floor 4)',
    address: '14–18 Marina Boulevard, Floor 4',
    environmentType: 'soc_technical_lab',
    correspondingLocationId: 'cedarline_interior',
    openingHours: {
      openHour: 0,
      closeHour: 23,
      is24Hours: true,
      openDaysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    },
    accessPolicy: 'BADGE_REQUIRED',
    requiredBadgeType: 'SECURITY_SECOPS',
    maxCapacity: 12,
    availableServices: ['INCIDENT_CONSOLE', 'SECURE_WORKSTATION'],
    residentNpcIds: ['npc_amina', 'npc_marcus', 'npc_elena'],
    ambientSoundscape: 'Server chiller hum, keyboard mechanical chatter, low-volume phone alerts.',
    description:
      'Restricted corporate SOC console room where Blessing and the incident response team triage network telemetry.',
  },

  // 4. Balogun Electronics & Hardware Stall
  {
    venueId: 'venue-mama-nkechi-market',
    name: 'Mama Esther Electronics & Provisions Stall',
    address: 'Corner of Balogun Street & Broad Street',
    environmentType: 'commercial_street_market',
    correspondingLocationId: 'neighborhood',
    openingHours: {
      openHour: 7,
      closeHour: 19,
      is24Hours: false,
      openDaysOfWeek: [1, 2, 3, 4, 5, 6], // Mon - Sat
    },
    accessPolicy: 'PUBLIC',
    maxCapacity: 15,
    availableServices: ['AIRTIME_DATA_TOPUP', 'HARDWARE_REPAIR'],
    residentNpcIds: ['npc_nkechi'],
    ambientSoundscape: 'Market chatter in Pidgin/Yoruba, transistor radio playing highlife, generator thrum.',
    description:
      'Beloved street-level electronics stall offering hardware adapters, mobile airtime, and sharp local neighborhood news.',
  },

  // 5. Eko Tech Bistro & Coffee
  {
    venueId: 'venue-eko-tech-bistro',
    name: 'Eko Tech Bistro & Work Café',
    address: '22 Broad Street, Lagos Island',
    environmentType: 'cafe_coffee_shop',
    correspondingLocationId: 'neighborhood',
    openingHours: {
      openHour: 7,
      closeHour: 21,
      is24Hours: false,
      openDaysOfWeek: [1, 2, 3, 4, 5, 6],
    },
    accessPolicy: 'PATRONS_ONLY',
    maxCapacity: 30,
    availableServices: ['WIFI_HOTSPOT', 'COFFEE_AND_FOOD', 'JOB_BOARD_NOTICE'],
    residentNpcIds: ['npc_folake'],
    ambientSoundscape: 'Espresso machine steam hiss, quiet laptop keystrokes, mellow bossa/Afrobeats.',
    description:
      'Premier hub for Lagos Island tech freelancers, talent recruiters, and discreet off-the-record meetings.',
  },

  // 6. Tinubu Square Internet Lounge & Hardware Lab
  {
    venueId: 'venue-tinubu-cyber-lounge',
    name: 'Tinubu Square Cyber Lounge & Repair Lab',
    address: '8 Tinubu Square, Ground Floor',
    environmentType: 'repair_shop_cybercafe',
    correspondingLocationId: 'neighborhood',
    openingHours: {
      openHour: 8,
      closeHour: 22,
      is24Hours: false,
      openDaysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    },
    accessPolicy: 'PUBLIC',
    maxCapacity: 20,
    availableServices: ['HARDWARE_REPAIR', 'SECURE_WORKSTATION', 'WIFI_HOTSPOT'],
    residentNpcIds: ['npc_segun', 'npc_tunde'],
    ambientSoundscape: 'Solder iron ventilation fan, keyboard clicks, gaming desktop cooling fans.',
    description:
      'Community cyber café and hardware diagnostic workshop equipped with specialized cable testers and air-gapped terminal benches.',
  },
];

export function getVenue(venueId: string): InteriorVenueDefinition | undefined {
  return LAGOS_ISLAND_VENUES.find(v => v.venueId === venueId);
}

export function getVenuesByLocation(locationId: string): readonly InteriorVenueDefinition[] {
  return LAGOS_ISLAND_VENUES.filter(v => v.correspondingLocationId === locationId);
}
