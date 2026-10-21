/**
 * Cyberlife — Milestone 22: World Simulation Service
 *
 * Pure, headless service for querying the living city state.
 * Bridges NPC schedules, venue hours, population density, and exploration
 * discoveries into a single authoritative city-state query layer.
 *
 * - ZERO DOM / Three.js dependencies (fully testable in Vitest/Node)
 * - All state returned is immutable / read-only
 * - Designed to be called by the SimulationEngine command handler on
 *   PLAYER_ENTER_LOCATION and TIME_ADVANCE commands
 */

import { NPC_PROFILES } from '../actors/npcProfiles';
import { getNpcActiveSchedule, getNpcsForLocation } from '../actors/npcSchedules';
import { PopulationController } from '../actors/population/PopulationController';
import { getVenuesByLocation } from '../actors/population/venues';
import { EXPLORATION_DISCOVERIES, getAvailableDiscoveries } from './explorationDiscoveries';
import type { NpcRoutineSnapshot, WorldSimulationState, LocationVisitRecord, ClaimedDiscovery, ExplorationDiscovery } from './types';
import type { InteriorVenueDefinition, VenueAccessStatus } from '../actors/population/types';

// ============================================================================
// City Queries (stateless, no side effects)
// ============================================================================

export class WorldSimulationService {

  /**
   * Returns a snapshot of all NPC routines at the given simulation hour.
   * Tells the presentation layer exactly who is where and what they're doing.
   */
  public static getNpcRoutineSnapshots(simulationHour: number): readonly NpcRoutineSnapshot[] {
    return NPC_PROFILES.map(profile => {
      const schedule = getNpcActiveSchedule(profile, simulationHour);
      return {
        npcId: profile.id,
        npcName: profile.name,
        locationId: schedule.locationId,
        position: schedule.position,
        activity: schedule.activity,
        animationState: schedule.animationState ?? 'IDLE',
        isAvailableForInteraction: schedule.animationState !== 'WALK',
      } satisfies NpcRoutineSnapshot;
    });
  }

  /**
   * Returns NPC routine snapshots filtered to a specific location.
   */
  public static getNpcsAtLocation(locationId: string, simulationHour: number): readonly NpcRoutineSnapshot[] {
    const atLocation = getNpcsForLocation(NPC_PROFILES, locationId, simulationHour);
    return atLocation.map(({ profile, schedule }) => ({
      npcId: profile.id,
      npcName: profile.name,
      locationId: schedule.locationId,
      position: schedule.position,
      activity: schedule.activity,
      animationState: schedule.animationState ?? 'IDLE',
      isAvailableForInteraction: schedule.animationState !== 'WALK',
    } satisfies NpcRoutineSnapshot));
  }

  /**
   * Returns ambient pedestrian density for a location at a given hour.
   */
  public static getAmbientDensity(locationId: string, simulationHour: number): number {
    // Map game location IDs to urban environment profile IDs
    const locationToProfile: Record<string, string> = {
      neighborhood: 'commercial_street_market',
      cedarline_interior: 'corporate_office_reception',
      apartment_interior: 'residential_neighborhood',
    };
    const profileId = locationToProfile[locationId] ?? 'residential_neighborhood';
    return PopulationController.calculateTargetDensity(profileId, simulationHour);
  }

  /**
   * Returns venue access status for all venues at a location.
   */
  public static getVenueStatusesAtLocation(
    locationId: string,
    simulationHour: number,
    dayOfWeek: number,
    playerBadges: readonly string[] = []
  ): readonly { venue: InteriorVenueDefinition; access: VenueAccessStatus }[] {
    const venues = getVenuesByLocation(locationId);
    return venues.map(venue => ({
      venue,
      access: PopulationController.evaluateVenueAccess(venue, simulationHour, dayOfWeek, playerBadges),
    }));
  }

  /**
   * Returns the list of all authored exploration discoveries that are
   * currently available at the given location + hour + NPC presence.
   * Filters out already-claimed non-repeatable discoveries.
   */
  public static getAvailableDiscoveriesForPlayer(
    locationId: string,
    simulationHour: number,
    worldFlags: Readonly<Record<string, boolean | string | number>>,
    worldState: WorldSimulationState
  ): readonly ExplorationDiscovery[] {
    const claimedIds = new Set(worldState.claimedDiscoveries.map(c => c.discoveryId));

    // Get NPCs present at this location right now
    const presentNpcIds = WorldSimulationService
      .getNpcsAtLocation(locationId, simulationHour)
      .map(n => n.npcId);

    const available = getAvailableDiscoveries(locationId, simulationHour, worldFlags, presentNpcIds);

    // Filter out non-repeatable already-claimed discoveries
    return available.filter(disc => disc.isRepeatable || !claimedIds.has(disc.id));
  }

  // ============================================================================
  // State Mutations (pure — return new state, do not mutate)
  // ============================================================================

  /**
   * Records a player location visit. Returns updated WorldSimulationState.
   * Call this when the player enters a new location or changes location.
   */
  public static recordLocationVisit(
    worldState: WorldSimulationState,
    locationId: string,
    simulationTimeSeconds: number,
    simulationHour: number
  ): WorldSimulationState {
    const existing = worldState.locationVisits[locationId];
    const updated: LocationVisitRecord = existing
      ? {
          ...existing,
          lastVisitSimTime: simulationTimeSeconds,
          totalVisits: existing.totalVisits + 1,
        }
      : {
          locationId,
          firstVisitSimTime: simulationTimeSeconds,
          lastVisitSimTime: simulationTimeSeconds,
          totalVisits: 1,
          firstArrivalHour: simulationHour,
        };

    return {
      ...worldState,
      locationVisits: {
        ...worldState.locationVisits,
        [locationId]: updated,
      },
    };
  }

  /**
   * Marks a discovery as claimed. Returns updated WorldSimulationState.
   * Applies any flags/activity unlocks embedded in the discovery definition.
   * Call this when the player acknowledges / acts on a pending discovery.
   */
  public static claimDiscovery(
    worldState: WorldSimulationState,
    discoveryId: string,
    locationId: string,
    simulationTimeSeconds: number
  ): {
    nextWorldState: WorldSimulationState;
    flagsToSet: Readonly<Record<string, boolean | string | number>>;
    unlockedActivityId: string | undefined;
  } {
    const discovery = EXPLORATION_DISCOVERIES.find(d => d.id === discoveryId);
    if (!discovery) {
      return {
        nextWorldState: worldState,
        flagsToSet: {},
        unlockedActivityId: undefined,
      };
    }

    const alreadyClaimed = worldState.claimedDiscoveries.some(c => c.discoveryId === discoveryId);
    if (alreadyClaimed && !discovery.isRepeatable) {
      return {
        nextWorldState: worldState,
        flagsToSet: {},
        unlockedActivityId: undefined,
      };
    }

    const newClaim: ClaimedDiscovery = {
      discoveryId,
      claimedAtSimTime: simulationTimeSeconds,
      claimedAtLocationId: locationId,
    };

    const nextWorldState: WorldSimulationState = {
      ...worldState,
      claimedDiscoveries: [...worldState.claimedDiscoveries, newClaim],
      pendingDiscoveryIds: worldState.pendingDiscoveryIds.filter(id => id !== discoveryId),
      explorationUnlockedActivityIds: discovery.unlocksActivityId
        ? [...new Set([...worldState.explorationUnlockedActivityIds, discovery.unlocksActivityId])]
        : worldState.explorationUnlockedActivityIds,
    };

    return {
      nextWorldState,
      flagsToSet: discovery.setsFlag ?? {},
      unlockedActivityId: discovery.unlocksActivityId,
    };
  }

  /**
   * Queues new available discoveries as pending (to surface to the player via UI).
   * Should be called after recordLocationVisit to notify the player of new finds.
   */
  public static queueNewDiscoveries(
    worldState: WorldSimulationState,
    locationId: string,
    simulationHour: number,
    worldFlags: Readonly<Record<string, boolean | string | number>>
  ): WorldSimulationState {
    const available = WorldSimulationService.getAvailableDiscoveriesForPlayer(
      locationId, simulationHour, worldFlags, worldState
    );
    const currentPendingSet = new Set(worldState.pendingDiscoveryIds);
    const newPending = available
      .map(d => d.id)
      .filter(id => !currentPendingSet.has(id));

    if (newPending.length === 0) return worldState;

    return {
      ...worldState,
      pendingDiscoveryIds: [...worldState.pendingDiscoveryIds, ...newPending],
    };
  }

  /**
   * Returns a human-readable city briefing for the given location and hour.
   * Useful for journal entries and ambient atmosphere descriptions.
   */
  public static getCityBriefing(locationId: string, simulationHour: number): string {
    const npcs = WorldSimulationService.getNpcsAtLocation(locationId, simulationHour);
    const density = WorldSimulationService.getAmbientDensity(locationId, simulationHour);

    const timeLabel = simulationHour < 6
      ? 'deep night'
      : simulationHour < 12
        ? 'morning'
        : simulationHour < 17
          ? 'afternoon'
          : simulationHour < 21
            ? 'evening'
            : 'night';

    const locationLabels: Record<string, string> = {
      neighborhood: 'Lagos Island — Broad Street & Marina',
      cedarline_interior: 'Cedarline Services HQ',
      apartment_interior: 'your apartment',
    };

    const locationLabel = locationLabels[locationId] ?? locationId;

    let lines: string[] = [
      `It is ${timeLabel} at ${locationLabel}.`,
    ];

    if (density > 30) {
      lines.push('The streets are packed with traders, commuters, and market noise.');
    } else if (density > 10) {
      lines.push('A moderate crowd moves through the area.');
    } else if (density > 2) {
      lines.push('Only a few people are around.');
    } else {
      lines.push('The area is quiet and mostly deserted.');
    }

    if (npcs.length > 0) {
      const npcDescriptions = npcs
        .slice(0, 3)
        .map(n => `${n.npcName} (${n.activity.toLowerCase()})`)
        .join(', ');
      lines.push(`Nearby: ${npcDescriptions}.`);
    }

    return lines.join(' ');
  }
}
