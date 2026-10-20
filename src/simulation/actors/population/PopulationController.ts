/**
 * Cyberlife — Population & Location Simulation Controller
 *
 * Provides authoritative calculation of dynamic crowd densities, tier resolution,
 * venue operating hours validation, and contextual interaction eligibility across
 * all 9 urban environment profiles and interior destinations.
 */

import {
  NpcTier,
  UrbanEnvironmentProfile,
  InteriorVenueDefinition,
  VenueAccessStatus,
} from './types';
import { URBAN_ENVIRONMENT_PROFILES } from './districtProfiles';
import { LAGOS_ISLAND_VENUES } from './venues';

export class PopulationController {
  /**
   * Calculates the target ambient pedestrian density for a specific
   * urban environment profile at a given simulation hour (0-23).
   */
  public static calculateTargetDensity(
    profileOrId: UrbanEnvironmentProfile | string,
    simulationHour: number
  ): number {
    const profile =
      typeof profileOrId === 'string'
        ? URBAN_ENVIRONMENT_PROFILES.find(p => p.id === profileOrId)
        : profileOrId;

    if (!profile) return 0;

    const hour = Math.max(0, Math.min(23, Math.floor(simulationHour)));
    const matchingModifier = profile.hourlyModifiers.find(
      m => hour >= m.startHour && hour < m.endHour
    );

    const multiplier = matchingModifier ? matchingModifier.multiplier : 1.0;
    return Math.round(profile.basePedestrianDensity * multiplier);
  }

  /**
   * Evaluates whether an interior venue is currently open and whether
   * the player possesses the required badge or clearance to enter.
   */
  public static evaluateVenueAccess(
    venueOrId: InteriorVenueDefinition | string,
    simulationHour: number,
    dayOfWeek = 1, // 0 = Sunday, 1 = Monday, etc.
    playerBadges: readonly string[] = []
  ): VenueAccessStatus {
    const venue =
      typeof venueOrId === 'string'
        ? LAGOS_ISLAND_VENUES.find(v => v.venueId === venueOrId)
        : venueOrId;

    if (!venue) {
      return {
        venueId: typeof venueOrId === 'string' ? venueOrId : 'unknown',
        isOpen: false,
        isPlayerPermitted: false,
        denialReason: 'CLOSED_FOR_NIGHT',
      };
    }

    const { openingHours, accessPolicy, requiredBadgeType } = venue;
    const hour = Math.floor(simulationHour);

    // 1. Day of week check
    if (!openingHours.openDaysOfWeek.includes(dayOfWeek)) {
      return {
        venueId: venue.venueId,
        isOpen: false,
        isPlayerPermitted: false,
        denialReason: 'CLOSED_TODAY',
        nextOpenTimeString: 'Next scheduled business day at 08:00 AM',
      };
    }

    // 2. Hour of day check
    let isOpen = false;
    if (openingHours.is24Hours) {
      isOpen = true;
    } else if (openingHours.closeHour > openingHours.openHour) {
      isOpen = hour >= openingHours.openHour && hour < openingHours.closeHour;
    } else {
      // Over-midnight schedule
      isOpen = hour >= openingHours.openHour || hour < openingHours.closeHour;
    }

    if (!isOpen) {
      return {
        venueId: venue.venueId,
        isOpen: false,
        isPlayerPermitted: false,
        denialReason: 'CLOSED_FOR_NIGHT',
        nextOpenTimeString: `Opens at ${String(openingHours.openHour).padStart(2, '0')}:00`,
      };
    }

    // 3. Access policy check
    if (accessPolicy === 'RESTRICTED_OFFLIMITS') {
      return {
        venueId: venue.venueId,
        isOpen: true,
        isPlayerPermitted: false,
        denialReason: 'RESTRICTED_SECURITY_ZONE',
      };
    }

    if (accessPolicy === 'BADGE_REQUIRED' && requiredBadgeType) {
      const hasBadge = playerBadges.includes(requiredBadgeType);
      if (!hasBadge) {
        return {
          venueId: venue.venueId,
          isOpen: true,
          isPlayerPermitted: false,
          denialReason: 'BADGE_REQUIRED',
        };
      }
    }

    if (accessPolicy === 'ESCORT_REQUIRED') {
      const hasEscort = playerBadges.includes('SECURITY_ESCORT_ACTIVE');
      if (!hasEscort) {
        return {
          venueId: venue.venueId,
          isOpen: true,
          isPlayerPermitted: false,
          denialReason: 'ESCORT_REQUIRED',
        };
      }
    }

    return {
      venueId: venue.venueId,
      isOpen: true,
      isPlayerPermitted: true,
    };
  }

  /**
   * Resolves the appropriate population tier for an actor identifier.
   */
  public static resolveNpcTier(npcId: string): NpcTier {
    const storyCriticalIds = new Set([
      'npc_amina',
      'npc_marcus',
      'npc_elena',
      'npc_femi',
      'npc_nkechi',
      'npc_segun',
      'npc_folake',
      'npc_tunde',
    ]);

    if (storyCriticalIds.has(npcId)) {
      return 'TIER_4_STORY_CRITICAL';
    }

    if (npcId.startsWith('npc_contact_') || npcId.startsWith('npc_vendor_') || npcId.startsWith('npc_guard_')) {
      return 'TIER_3_INTERACTIVE_NPC';
    }

    if (npcId.startsWith('ped_routine_') || npcId.startsWith('journey_')) {
      return 'TIER_2_ROUTINE_NPC';
    }

    return 'TIER_1_AMBIENT_CROWD';
  }

  /**
   * Validates whether a meaningful conversation is contextually appropriate.
   * Street sidewalk encounters are restricted to quick greetings or urgent alibis;
   * deep investigative dialogue requires appropriate interiors or designated meeting spots.
   */
  public static isMeaningfulInteractionAllowed(
    locationId: string,
    npcId: string,
    isUrgentStoryPhase = false
  ): { readonly allowed: boolean; readonly reason: string } {
    if (isUrgentStoryPhase) {
      return {
        allowed: true,
        reason: 'Urgent active incident phase permits field briefing.',
      };
    }

    if (locationId === 'cedarline_interior' || locationId === 'apartment_interior') {
      return {
        allowed: true,
        reason: 'Interior environment supports secure, confidential discussion.',
      };
    }

    // On the street ('neighborhood'), only specific designated spots or brief interactions are allowed
    const outdoorDesignatedSpots: Record<string, string> = {
      npc_nkechi: 'Balogun electronics stall',
      npc_segun: 'Tinubu Square civic fountain bench',
      npc_tunde: 'Marina seawall railings',
    };

    if (outdoorDesignatedSpots[npcId]) {
      return {
        allowed: true,
        reason: `Permitted at authored contextual location (${outdoorDesignatedSpots[npcId]}).`,
      };
    }

    return {
      allowed: false,
      reason:
        'Street thoroughfare is too exposed for sensitive corporate investigations. Meet in an appropriate interior (e.g. Cedarline SOC, Eko Bistro, or private apartment).',
    };
  }
}
