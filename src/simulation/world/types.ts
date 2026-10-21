/**
 * Cyberlife — Milestone 22: Living City, Meaningful Locations & World Simulation
 *
 * Types for:
 *  - Location visit history (when player was where)
 *  - Exploration discovery records (clues, leads, opportunities)
 *  - NPC routine snapshots (where each NPC is right now, what they're doing)
 *  - City simulation state (persistent, stored in SimulationState)
 */

// ============================================================================
// 1. Location Visit Records
// ============================================================================

/** A single logged visit by the player to a world location. */
export interface LocationVisitRecord {
  readonly locationId: string;
  readonly firstVisitSimTime: number;   // seconds from epoch
  readonly lastVisitSimTime: number;
  readonly totalVisits: number;
  /** Simulation hour (0-23) of first arrival - affects what discoveries are available. */
  readonly firstArrivalHour: number;
}

// ============================================================================
// 2. Exploration Discoveries
// ============================================================================

export type DiscoveryCategory =
  | 'CONTRACT_LEAD'       // An available activity / job unlocked by presence
  | 'NPC_INTEL'           // Overhearing, observing, or being told something by an NPC
  | 'ENVIRONMENTAL_CLUE'  // Physical evidence noticed in the environment
  | 'AMBIENT_RUMOR'       // Street talk / community board notice
  | 'VENUE_UNLOCK'        // A restricted venue now accessible (gained badge, met escort)
  | 'SKILL_PRACTICE';     // An improvised skill exercise available at this location

export interface ExplorationDiscovery {
  readonly id: string;
  readonly category: DiscoveryCategory;
  readonly title: string;
  readonly description: string;
  /**
   * Which location must the player be in to discover this.
   * 'any' means the discovery is global once triggered.
   */
  readonly requiredLocationId: string | 'any';
  /** Which NPC (if any) must be present at the location for this discovery. */
  readonly requiredNpcId?: string;
  /** Which simulation hour window (inclusive) the discovery is available. */
  readonly availableHours?: readonly [number, number]; // [startHour, endHour]
  /** World flags that must be truthy for discovery to be available. */
  readonly requiredFlags?: Readonly<Record<string, boolean | string | number>>;
  /** Optional activity ID to unlock when player claims this discovery. */
  readonly unlocksActivityId?: string;
  /** Optional flag to set when player claims this discovery. */
  readonly setsFlag?: Readonly<Record<string, boolean | string | number>>;
  readonly isRepeatable: boolean;
}

/** A claimed/found instance of an exploration discovery in game state. */
export interface ClaimedDiscovery {
  readonly discoveryId: string;
  readonly claimedAtSimTime: number;
  readonly claimedAtLocationId: string;
}

// ============================================================================
// 3. NPC Routine Snapshot
// ============================================================================

/**
 * A lightweight live snapshot of where an NPC is and what they're doing.
 * Derived each time from NPC profiles + simulation hour - NOT persisted raw.
 */
export interface NpcRoutineSnapshot {
  readonly npcId: string;
  readonly npcName: string;
  readonly locationId: string;
  readonly position: readonly [number, number, number];
  readonly activity: string;
  readonly animationState: string;
  readonly isAvailableForInteraction: boolean;
}

// ============================================================================
// 4. City / World Simulation State  (persisted in SimulationState)
// ============================================================================

export interface WorldSimulationState {
  /**
   * Map from locationId -> visit record.
   * Updated every time the player enters a location.
   */
  readonly locationVisits: Readonly<Record<string, LocationVisitRecord>>;

  /**
   * All discoveries the player has found/claimed during this session.
   */
  readonly claimedDiscoveries: readonly ClaimedDiscovery[];

  /**
   * IDs of discoveries the player has been shown but not yet acted on
   * (pending modal / journal notification).
   */
  readonly pendingDiscoveryIds: readonly string[];

  /**
   * Set of activity IDs that have been unlocked specifically by exploration
   * (on top of story flags). Mirrors ActivityDirector's unlocked list,
   * but scoped to world exploration origin.
   */
  readonly explorationUnlockedActivityIds: readonly string[];
}

export function createInitialWorldSimulationState(): WorldSimulationState {
  return {
    locationVisits: {},
    claimedDiscoveries: [],
    pendingDiscoveryIds: [],
    explorationUnlockedActivityIds: [],
  };
}
