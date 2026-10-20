/**
 * Cyberlife — 4-Tier Population Hierarchy & Urban Location System Types
 *
 * Defines the contracts for believable urban populations across Lagos Island,
 * establishing four distinct performance tiers, nine urban environment profiles,
 * and meaningful interior venues with realistic operating hours and access restrictions.
 */

// ============================================================================
// 1. Four-Tier Population Hierarchy
// ============================================================================

export type NpcTier =
  | 'TIER_1_AMBIENT_CROWD'    // Inexpensive instanced/procedural crowd, no individual memory
  | 'TIER_2_ROUTINE_NPC'      // Scheduled pedestrians with fixed journeys & daily commutes
  | 'TIER_3_INTERACTIVE_NPC'  // Merchants, receptionists & contacts with basic dialogue & memory
  | 'TIER_4_STORY_CRITICAL';  // Fully authored key narrative characters with persistent consequences

export interface PopulationTierDefinition {
  readonly tier: NpcTier;
  readonly name: string;
  readonly description: string;
  readonly maxActiveInstances: number;
  readonly hasMemory: boolean;
  readonly hasDialogue: boolean;
  readonly hasSchedules: boolean;
  readonly performanceCostScore: 1 | 2 | 3 | 4; // 1 = negligible, 4 = rich individual logic
}

export const POPULATION_TIERS: readonly PopulationTierDefinition[] = [
  {
    tier: 'TIER_1_AMBIENT_CROWD',
    name: 'Ambient Crowd Agents',
    description: 'Background pedestrians simulating bustling street density with lightweight pathing.',
    maxActiveInstances: 60,
    hasMemory: false,
    hasDialogue: false,
    hasSchedules: false,
    performanceCostScore: 1,
  },
  {
    tier: 'TIER_2_ROUTINE_NPC',
    name: 'Routine Schedule NPCs',
    description: 'Autonomous citizens with daily destinations: commutes, lunch breaks, and market stops.',
    maxActiveInstances: 24,
    hasMemory: false,
    hasDialogue: false,
    hasSchedules: true,
    performanceCostScore: 2,
  },
  {
    tier: 'TIER_3_INTERACTIVE_NPC',
    name: 'Interactive Contacts & Merchants',
    description: 'Shopkeepers, security desk guards, and café baristas supporting transactional interactions.',
    maxActiveInstances: 12,
    hasMemory: true,
    hasDialogue: true,
    hasSchedules: true,
    performanceCostScore: 3,
  },
  {
    tier: 'TIER_4_STORY_CRITICAL',
    name: 'Story-Critical Narrative Actors',
    description: 'Named techno-thriller characters (Amina, Marcus, Elena, Femi, etc.) with branching consequences.',
    maxActiveInstances: 8,
    hasMemory: true,
    hasDialogue: true,
    hasSchedules: true,
    performanceCostScore: 4,
  },
] as const;

// ============================================================================
// 2. Nine Urban Environment Population Profiles
// ============================================================================

export type EnvironmentProfileId =
  | 'residential_neighborhood'       // Broad Street residential apartments & alleyways
  | 'commercial_street_market'        // Balogun & Idumota market trading stalls
  | 'cafe_coffee_shop'                // Eko Bistro & freelancer work spots
  | 'restaurant_food_venue'           // Mama Nkechi Buka & local eateries
  | 'nightlife_venue'                 // Marina Lagoon Lounge & evening venues
  | 'corporate_office_reception'      // Marina Tower Ground Lobby & corporate checkpoints
  | 'repair_shop_cybercafe'           // Tinubu Tech Repair & Internet Cyberlounge
  | 'soc_technical_lab'               // Cedarline Floor 4 SOC & datacenters
  | 'transit_hub_street';             // Danfo bus terminal & Broad Street intersections

export interface HourlyDensityModifier {
  readonly startHour: number; // 0-23
  readonly endHour: number;   // 0-23
  readonly multiplier: number; // e.g. 0.2 (quiet), 1.0 (standard), 1.8 (peak rush)
}

export interface UrbanEnvironmentProfile {
  readonly id: EnvironmentProfileId;
  readonly name: string;
  readonly districtName: string;
  readonly description: string;
  readonly basePedestrianDensity: number; // target count at 1.0 multiplier
  readonly hourlyModifiers: readonly HourlyDensityModifier[];
  readonly dominantAttireStyles: readonly string[]; // 'ELITE_SUIT' | 'VIBRANT_ANKARA' | 'SMART_CASUAL' | 'STREETWEAR'
  readonly typicalActivities: readonly string[];
  readonly conversationalContext: string; // Guidance on what meaningful dialogue takes place here
}

// ============================================================================
// 3. Meaningful Interior Venues & Operating Hours
// ============================================================================

export type VenueAccessPolicy =
  | 'PUBLIC'             // Open to anyone during operating hours
  | 'PATRONS_ONLY'       // Must make a small purchase or have appointment
  | 'BADGE_REQUIRED'     // Requires corporate/employee RFID badge
  | 'ESCORT_REQUIRED'    // Requires security officer or host accompaniment
  | 'RESTRICTED_OFFLIMITS'; // Strict authorized personnel only

export type VenueServiceType =
  | 'WIFI_HOTSPOT'
  | 'COFFEE_AND_FOOD'
  | 'HARDWARE_REPAIR'
  | 'AIRTIME_DATA_TOPUP'
  | 'SECURE_WORKSTATION'
  | 'JOB_BOARD_NOTICE'
  | 'INCIDENT_CONSOLE'
  | 'REST_AND_RECOVERY';

export interface VenueOpeningHours {
  readonly openHour: number;  // 0-23
  readonly closeHour: number; // 0-23
  readonly is24Hours: boolean;
  readonly openDaysOfWeek: readonly number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
}

export interface InteriorVenueDefinition {
  readonly venueId: string;
  readonly name: string;
  readonly address: string;
  readonly environmentType: EnvironmentProfileId;
  readonly correspondingLocationId: string; // e.g. 'neighborhood' | 'cedarline_interior' | 'apartment_interior'
  readonly openingHours: VenueOpeningHours;
  readonly accessPolicy: VenueAccessPolicy;
  readonly requiredBadgeType?: string;
  readonly maxCapacity: number;
  readonly availableServices: readonly VenueServiceType[];
  readonly residentNpcIds: readonly string[];
  readonly ambientSoundscape: string;
  readonly description: string;
}

// ============================================================================
// 4. Venue Evaluation & Access Status
// ============================================================================

export interface VenueAccessStatus {
  readonly venueId: string;
  readonly isOpen: boolean;
  readonly isPlayerPermitted: boolean;
  readonly denialReason?:
    | 'CLOSED_FOR_NIGHT'
    | 'CLOSED_TODAY'
    | 'BADGE_REQUIRED'
    | 'ESCORT_REQUIRED'
    | 'RESTRICTED_SECURITY_ZONE';
  readonly nextOpenTimeString?: string;
}
