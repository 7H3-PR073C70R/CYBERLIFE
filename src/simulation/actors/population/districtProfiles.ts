/**
 * Cyberlife : Nine Urban Environment Population Profiles
 *
 * Provides authoritative definitions for the 9 distinct urban environments across
 * the Lagos Island district, capturing time-of-day crowd dynamics, attire, and activities.
 */

import { UrbanEnvironmentProfile } from './types';

export const URBAN_ENVIRONMENT_PROFILES: readonly UrbanEnvironmentProfile[] = [
  // 1. Residential Neighborhoods
  {
    id: 'residential_neighborhood',
    name: 'Broad Street Residential & Tenement Blocks',
    districtName: 'Lagos Island West Residential',
    description:
      'Historic 2-3 storey Afro-Brazilian residential tenements, private balconies, quiet inner courtyards, and baseboard conduits.',
    basePedestrianDensity: 8,
    hourlyModifiers: [
      { startHour: 0, endHour: 6, multiplier: 0.15 },
      { startHour: 6, endHour: 9, multiplier: 1.5 },   // Morning departure rush
      { startHour: 9, endHour: 17, multiplier: 0.6 },  // Daytime quiet
      { startHour: 17, endHour: 21, multiplier: 1.4 }, // Evening return & neighborhood greetings
      { startHour: 21, endHour: 24, multiplier: 0.4 },
    ],
    dominantAttireStyles: ['STREETWEAR', 'SMART_CASUAL'],
    typicalActivities: [
      'Walking home with provisions',
      'Checking apartment mailbox',
      'Sitting on front entrance steps',
      'Morning fitness jogging',
    ],
    conversationalContext:
      'Personal life, local landlord gossip, quiet discussions with neighbors, confidential hacker tip-offs away from corporate ears.',
  },

  // 2. Commercial Streets & Markets
  {
    id: 'commercial_street_market',
    name: 'Balogun & Idumota Commercial Market Corridor',
    districtName: 'Balogun Trade District',
    description:
      'Dense, vibrant market artery packed with electronics display crates, canvas canopies, phone repair umbrellas, and relentless commerce.',
    basePedestrianDensity: 24,
    hourlyModifiers: [
      { startHour: 0, endHour: 7, multiplier: 0.05 },  // Shutters locked
      { startHour: 7, endHour: 10, multiplier: 1.2 },  // Morning stall setup
      { startHour: 10, endHour: 17, multiplier: 2.0 }, // Peak trading frenzy
      { startHour: 17, endHour: 19, multiplier: 1.3 }, // Bargain hunting before dusk
      { startHour: 19, endHour: 24, multiplier: 0.1 }, // Metal shutters pulled down
    ],
    dominantAttireStyles: ['VIBRANT_ANKARA', 'STREETWEAR'],
    typicalActivities: [
      'Bargaining over mobile adapters and cables',
      'Carrying wholesale merchandise cartons',
      'Street trading and mobile POS transactions',
      'Calling out daily specials to passers-by',
    ],
    conversationalContext:
      'Street intelligence, hardware acquisition (USB drives, serial adapters), rumors of cyber syndicates targeting local bank accounts.',
  },

  // 3. Cafés & Coffee Shops
  {
    id: 'cafe_coffee_shop',
    name: 'Eko Bistro & High-Speed Tech Coffee',
    districtName: 'Broad Street Financial Fringe',
    description:
      'Modern air-conditioned cafe with high-speed fiber Wi-Fi, power strips at every table, iced cold brew, and laptop workers.',
    basePedestrianDensity: 6,
    hourlyModifiers: [
      { startHour: 0, endHour: 7, multiplier: 0.0 },   // Closed
      { startHour: 7, endHour: 11, multiplier: 1.6 },  // Morning coffee rush & remote workers
      { startHour: 11, endHour: 15, multiplier: 1.3 }, // Midday working lunches
      { startHour: 15, endHour: 19, multiplier: 1.1 }, // Afternoon recruiter catchups
      { startHour: 19, endHour: 24, multiplier: 0.2 }, // Closing down
    ],
    dominantAttireStyles: ['SMART_CASUAL', 'ELITE_SUIT'],
    typicalActivities: [
      'Typing on laptops with headphones on',
      'Quiet confidential client interviews',
      'Sipping espresso while reviewing code diffs',
      'Taking phone calls on outdoor patio',
    ],
    conversationalContext:
      'Talent recruitment interviews with Anjola, independent bug bounty collaborations, discreet laptop screen peeking.',
  },

  // 4. Restaurants & Food Venues
  {
    id: 'restaurant_food_venue',
    name: 'Mama Esther Buka & Marina Dining',
    districtName: 'Broad Street Eateries',
    description:
      'Bustling lunchtime dining venue serving smoky jollof rice, pounded yam, pepper soup, and cold malt drinks.',
    basePedestrianDensity: 12,
    hourlyModifiers: [
      { startHour: 0, endHour: 11, multiplier: 0.2 },
      { startHour: 11, endHour: 15, multiplier: 2.2 }, // Intense lunch hour peak
      { startHour: 15, endHour: 18, multiplier: 0.5 },
      { startHour: 18, endHour: 22, multiplier: 1.5 }, // Dinner crowds
      { startHour: 22, endHour: 24, multiplier: 0.1 },
    ],
    dominantAttireStyles: ['ELITE_SUIT', 'VIBRANT_ANKARA', 'SMART_CASUAL'],
    typicalActivities: [
      'Sharing a table over steaming hot plates',
      'Corporate lunch debriefs',
      'Friendly heated debates on Nigerian football and politics',
      'Resting from the midday tropical heat',
    ],
    conversationalContext:
      'Overhearing unguarded corporate table talk, casual encounters with sysadmins taking breaks away from the office.',
  },

  // 5. Nightlife Venues & Events
  {
    id: 'nightlife_venue',
    name: 'Marina Lagoon View Lounge & Rooftop',
    districtName: 'Marina Waterfront South',
    description:
      'Atmospheric open-air lounge overlooking Lagos Lagoon with neon lighting, low-tempo Afrobeats, craft cocktails, and night breeze.',
    basePedestrianDensity: 10,
    hourlyModifiers: [
      { startHour: 0, endHour: 2, multiplier: 1.2 },   // Late night crowd
      { startHour: 2, endHour: 18, multiplier: 0.05 }, // Closed during daylight
      { startHour: 18, endHour: 21, multiplier: 1.4 }, // After-work unwind
      { startHour: 21, endHour: 24, multiplier: 2.0 }, // Peak nightlife
    ],
    dominantAttireStyles: ['SMART_CASUAL', 'STREETWEAR'],
    typicalActivities: [
      'Leaning over balcony looking at ships on the lagoon',
      'Networking with fintech founders and diaspora investors',
      'Listening to live DJ sets',
      'Relaxing after intense incident response shifts',
    ],
    conversationalContext:
      'Underground hacker alibis, high-stakes freelance contracts, unrecorded conversations with Tsharp "ZeroDay" Bakare.',
  },

  // 6. Corporate Offices & Reception Areas
  {
    id: 'corporate_office_reception',
    name: 'Marina Tower Ground Lobby & Security Turnstiles',
    districtName: 'Marina Corporate Boulevard',
    description:
      'Polished granite and stainless steel corporate foyer, optical turnstiles, uniformed security guards, and corporate receptionists.',
    basePedestrianDensity: 10,
    hourlyModifiers: [
      { startHour: 0, endHour: 7, multiplier: 0.1 },   // Night guards only
      { startHour: 7, endHour: 9, multiplier: 2.4 },   // Major badge swipe rush
      { startHour: 9, endHour: 12, multiplier: 1.1 },  // Visitor check-ins
      { startHour: 12, endHour: 14, multiplier: 1.7 }, // Lunch exit/entry rush
      { startHour: 14, endHour: 17, multiplier: 1.0 },
      { startHour: 17, endHour: 19, multiplier: 2.2 }, // Evening departure rush
      { startHour: 19, endHour: 24, multiplier: 0.2 },
    ],
    dominantAttireStyles: ['ELITE_SUIT', 'SMART_CASUAL'],
    typicalActivities: [
      'Swiping RFID cards at turnstiles',
      'Signing the physical visitor ledger at the front desk',
      'Waiting on reception leather couches for an escort',
      'Corporate executives stepping out to meet chauffeurs',
    ],
    conversationalContext:
      'Visitor registration, badge escort negotiations, physical pretexting challenges with security receptionists.',
  },

  // 7. Repair Shops & Internet Cafés
  {
    id: 'repair_shop_cybercafe',
    name: 'Tinubu Square Tech Hub & Internet Cyberlounge',
    districtName: 'Tinubu Civic Precinct',
    description:
      'Boutique computer repair shop with soldering irons, replacement display panels, optical disk drives, and high-spec gaming desktops.',
    basePedestrianDensity: 7,
    hourlyModifiers: [
      { startHour: 0, endHour: 8, multiplier: 0.0 },   // Closed
      { startHour: 8, endHour: 12, multiplier: 1.1 },  // Hardware drop-offs
      { startHour: 12, endHour: 18, multiplier: 1.5 }, // Peak diagnostic work
      { startHour: 18, endHour: 21, multiplier: 1.2 }, // Evening pickup
      { startHour: 21, endHour: 24, multiplier: 0.1 },
    ],
    dominantAttireStyles: ['STREETWEAR', 'SMART_CASUAL'],
    typicalActivities: [
      'Soldering capacitor replacements on motherboard',
      'Extracting files from scratched hard drives with adapter',
      'Testing refurbished laptops on repair benches',
      'Surfing on secondary air-gapped terminal workstations',
    ],
    conversationalContext:
      'Hardware diagnostics, USB drive inspection on clean bench, purchase of specialized physical penetration tools (dropboxes, adapters).',
  },

  // 8. Security Operations Centers & Technical Labs
  {
    id: 'soc_technical_lab',
    name: 'Cedarline Level 4 SOC & Infrastructure Lab',
    districtName: 'Marina Tower Internal Floors',
    description:
      'Climate-controlled, quiet technical workspace with multi-monitor desks, SIEM alert dashboards, server rack status LEDs, and emergency phones.',
    basePedestrianDensity: 5,
    hourlyModifiers: [
      { startHour: 0, endHour: 7, multiplier: 0.8 },   // Night shift analysts
      { startHour: 7, endHour: 19, multiplier: 1.5 },  // Primary day shift
      { startHour: 19, endHour: 24, multiplier: 0.9 }, // Evening handover
    ],
    dominantAttireStyles: ['SMART_CASUAL', 'ELITE_SUIT'],
    typicalActivities: [
      'Monitoring real-time SIEM alert queues',
      'Correlating firewall drops with endpoint telemetry',
      'Inspecting physical datacenter temperature monitors',
      'Conducting formal incident triage meetings',
    ],
    conversationalContext:
      'High-stakes incident investigations with Blessing, root cause technical debriefs with Dr. Elizabeth, formal evidence handover.',
  },

  // 9. Transit Areas & Public Streets
  {
    id: 'transit_hub_street',
    name: 'Broad Street & Danfo Minibus Interchange',
    districtName: 'Broad Street Transportation Spine',
    description:
      'Public thoroughfare with bustling Danfo buses, pedestrian crosswalks, street vendors, and continuous vehicular movement.',
    basePedestrianDensity: 18,
    hourlyModifiers: [
      { startHour: 0, endHour: 5, multiplier: 0.1 },
      { startHour: 5, endHour: 8, multiplier: 1.8 },   // Early morning transit rush
      { startHour: 8, endHour: 16, multiplier: 1.2 },  // Continuous city flow
      { startHour: 16, endHour: 20, multiplier: 2.1 }, // Massive evening rush hour
      { startHour: 20, endHour: 24, multiplier: 0.5 },
    ],
    dominantAttireStyles: ['VIBRANT_ANKARA', 'STREETWEAR', 'ELITE_SUIT', 'SMART_CASUAL'],
    typicalActivities: [
      'Calling out bus destinations ("CMS! Obalende! Broad Street!")',
      'Boarding and alighting from commercial minibuses',
      'Weaving through curbside sidewalk traffic',
      'Checking wristwatches while waiting at pedestrian crossings',
    ],
    conversationalContext:
      'Fleeting ambient comments, street vendor offers; NOT the default location for deep confidential investigations.',
  },
];

export function getEnvironmentProfile(id: string): UrbanEnvironmentProfile | undefined {
  return URBAN_ENVIRONMENT_PROFILES.find(p => p.id === id);
}
