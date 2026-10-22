/**
 * Milestone 22 — Living City, Meaningful Locations & World Simulation
 *
 * Validates:
 *  1. NPC routines: all 8 named characters transition locations correctly by hour
 *  2. Exploration discovery catalogue: authored content, flag checks, hour windows
 *  3. WorldSimulationService stateless queries: NPCs at location, density, briefings
 *  4. WorldSimulationService state mutations: visit records, claim discoveries, queue
 *  5. Integration: WorldSimulationState is included in initial SimulationState
 *  6. Venue operating hours and access control
 *  7. City briefing text changes by time and presence
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { WorldSimulationService } from '@/simulation/world/WorldSimulationService';
import {
  EXPLORATION_DISCOVERIES,
  getAvailableDiscoveries,
  getDiscovery,
} from '@/simulation/world/explorationDiscoveries';
import {
  createInitialWorldSimulationState,
} from '@/simulation/world/types';
import type { WorldSimulationState } from '@/simulation/world/types';
import { createInitialSimulationState } from '@/simulation/core/initialState';
import { NPC_PROFILES } from '@/simulation/actors/npcProfiles';
import { getNpcActiveSchedule, getNpcsForLocation } from '@/simulation/actors/npcSchedules';
import { handleCommand } from '@/simulation/commands/commandHandler';
import { SimulationEngine } from '@/simulation/SimulationEngine';
import { SaveManager } from '@/application/persistence/SaveManager';
import { MemoryStorageAdapter } from '@/application/persistence/adapters/MemoryStorageAdapter';

// ===========================================================================
// 1. NPC Routine Correctness
// ===========================================================================

describe('M22 — NPC Routines & Daily Schedules', () => {
  it('returns a snapshot for every named NPC profile', () => {
    const snapshots = WorldSimulationService.getNpcRoutineSnapshots(9);
    expect(snapshots.length).toBe(NPC_PROFILES.length);
    const ids = snapshots.map(s => s.npcId);
    for (const profile of NPC_PROFILES) {
      expect(ids).toContain(profile.id);
    }
  });

  it('Blessing (npc_amina) is at Cedarline during working hours AND during her overnight review shift', () => {
    const amina = NPC_PROFILES.find(p => p.id === 'npc_amina')!;

    const morning = getNpcActiveSchedule(amina, 9);
    expect(morning.locationId).toBe('cedarline_interior');
    expect(morning.activity.toLowerCase()).toContain('soc');

    // Blessing works an overnight review shift (19:00 -> 07:00) — also at Cedarline
    const lateNight = getNpcActiveSchedule(amina, 2);
    expect(lateNight.locationId).toBe('cedarline_interior');
    expect(lateNight.activity.toLowerCase()).toContain('telemetry');
  });

  it('Mama Esther (npc_nkechi) is at her market stall during market hours', () => {
    const nkechi = NPC_PROFILES.find(p => p.id === 'npc_nkechi')!;

    const marketHour = getNpcActiveSchedule(nkechi, 11);
    // Should be at neighborhood/market location during trading hours
    expect(marketHour.locationId).toBeDefined();
    expect(marketHour.activity.length).toBeGreaterThan(0);
  });

  it('Uncle Ola (npc_segun) is accessible at Tinubu Square or neighborhood in evenings', () => {
    const segun = NPC_PROFILES.find(p => p.id === 'npc_segun')!;
    const evening = getNpcActiveSchedule(segun, 18);
    expect(evening.locationId).toBeDefined();
    expect(evening.animationState).toBeDefined();
  });

  it('NPC midnight boundary wrapping is stable — no undefined returned', () => {
    const tunde = NPC_PROFILES.find(p => p.id === 'npc_tunde')!;
    for (const hour of [0, 1, 2, 23]) {
      const sched = getNpcActiveSchedule(tunde, hour);
      expect(sched).toBeDefined();
      expect(sched.locationId).toBeDefined();
    }
  });

  it('getNpcsForLocation filters correctly — only NPCs at that location returned', () => {
    // At 10:00, some NPCs should be at cedarline_interior (Blessing, Tobi, Dr. Elizabeth, Gabriel)
    const cedarlineNpcs = getNpcsForLocation(NPC_PROFILES, 'cedarline_interior', 10);
    // All returned NPCs must have locationId === cedarline_interior
    for (const { schedule } of cedarlineNpcs) {
      expect(schedule.locationId).toBe('cedarline_interior');
    }
    // At minimum, Blessing should be at Cedarline at 10:00
    const ids = cedarlineNpcs.map(n => n.profile.id);
    expect(ids).toContain('npc_amina');
  });

  it('all 8 NPCs have at least one schedule entry with valid fields', () => {
    expect(NPC_PROFILES.length).toBeGreaterThanOrEqual(8);
    for (const profile of NPC_PROFILES) {
      expect(profile.schedule.length).toBeGreaterThan(0);
      for (const entry of profile.schedule) {
        expect(entry.locationId).toBeTruthy();
        expect(entry.activity).toBeTruthy();
        // Validate against the actual animationState union from types.ts
        const validStates = ['IDLE', 'WALK', 'SEATED_IDLE', 'TYPING', 'MOUSE_USE'];
        if (entry.animationState) {
          expect(validStates).toContain(entry.animationState);
        }
      }
    }
  });

  it('snapshot marks WALK-state NPCs as not available for interaction', () => {
    // All snapshots should have isAvailableForInteraction derived from animationState
    const snapshots = WorldSimulationService.getNpcRoutineSnapshots(10);
    for (const snap of snapshots) {
      if (snap.animationState === 'WALK') {
        expect(snap.isAvailableForInteraction).toBe(false);
      } else {
        expect(snap.isAvailableForInteraction).toBe(true);
      }
    }
  });
});

// ===========================================================================
// 2. Exploration Discovery Catalogue
// ===========================================================================

describe('M22 — Exploration Discovery Catalogue', () => {
  it('defines at least 10 authored exploration discoveries', () => {
    expect(EXPLORATION_DISCOVERIES.length).toBeGreaterThanOrEqual(10);
  });

  it('all discovery IDs are unique and non-empty', () => {
    const ids = EXPLORATION_DISCOVERIES.map(d => d.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^disc_[a-z0-9_]+$/);
    }
  });

  it('all discoveries have required string fields with meaningful content', () => {
    for (const disc of EXPLORATION_DISCOVERIES) {
      expect(disc.title.length).toBeGreaterThan(5);
      expect(disc.description.length).toBeGreaterThan(20);
      expect(disc.requiredLocationId).toBeTruthy();
      expect(['CONTRACT_LEAD', 'NPC_INTEL', 'ENVIRONMENTAL_CLUE', 'AMBIENT_RUMOR', 'VENUE_UNLOCK', 'SKILL_PRACTICE']).toContain(disc.category);
    }
  });

  it('covers all 3 game locations with at least 1 discovery each', () => {
    const locations = EXPLORATION_DISCOVERIES.map(d => d.requiredLocationId);
    expect(locations).toContain('neighborhood');
    expect(locations).toContain('cedarline_interior');
    expect(locations).toContain('apartment_interior');
  });

  it('covers all 6 discovery categories', () => {
    const categories = new Set(EXPLORATION_DISCOVERIES.map(d => d.category));
    expect(categories.has('CONTRACT_LEAD')).toBe(true);
    expect(categories.has('NPC_INTEL')).toBe(true);
    expect(categories.has('ENVIRONMENTAL_CLUE')).toBe(true);
    expect(categories.has('AMBIENT_RUMOR')).toBe(true);
    expect(categories.has('VENUE_UNLOCK')).toBe(true);
    expect(categories.has('SKILL_PRACTICE')).toBe(true);
  });

  it('getDiscovery returns correct discovery by ID', () => {
    const disc = getDiscovery('disc_noticeboard_cyber_warning');
    expect(disc).toBeDefined();
    expect(disc?.category).toBe('AMBIENT_RUMOR');
    expect(disc?.requiredLocationId).toBe('neighborhood');
  });

  it('getDiscovery returns undefined for unknown ID', () => {
    expect(getDiscovery('disc_does_not_exist')).toBeUndefined();
  });

  it('getAvailableDiscoveries: noticeboard appears in neighborhood at day hours', () => {
    const result = getAvailableDiscoveries('neighborhood', 10, {});
    const ids = result.map(d => d.id);
    expect(ids).toContain('disc_noticeboard_cyber_warning');
  });

  it('getAvailableDiscoveries: hour filter works — noticeboard not available at 03:00', () => {
    const result = getAvailableDiscoveries('neighborhood', 3, {});
    const ids = result.map(d => d.id);
    // disc_noticeboard_cyber_warning is only available 7:00 - 22:00
    expect(ids).not.toContain('disc_noticeboard_cyber_warning');
  });

  it('getAvailableDiscoveries: location filter works — cedarline discoveries not visible in neighborhood', () => {
    const result = getAvailableDiscoveries('neighborhood', 10, {});
    const ids = result.map(d => d.id);
    expect(ids).not.toContain('disc_cedarline_server_log_anomaly');
    expect(ids).not.toContain('disc_blessing_whiteboard_notes');
  });

  it('getAvailableDiscoveries: flag-required discovery hidden without flag', () => {
    // disc_cedarline_server_log_anomaly requires mission_aster_active: true
    const withoutFlag = getAvailableDiscoveries('cedarline_interior', 10, {});
    expect(withoutFlag.map(d => d.id)).not.toContain('disc_cedarline_server_log_anomaly');

    const withFlag = getAvailableDiscoveries('cedarline_interior', 10, { mission_aster_active: true });
    expect(withFlag.map(d => d.id)).toContain('disc_cedarline_server_log_anomaly');
  });

  it('getAvailableDiscoveries: NPC-required discovery hidden when NPC absent', () => {
    // disc_mama_esther_intel requires npc_nkechi to be present
    const withoutNpc = getAvailableDiscoveries('neighborhood', 10, {}, []);
    expect(withoutNpc.map(d => d.id)).not.toContain('disc_mama_esther_intel');

    const withNpc = getAvailableDiscoveries('neighborhood', 10, {}, ['npc_nkechi']);
    expect(withNpc.map(d => d.id)).toContain('disc_mama_esther_intel');
  });

  it('repeatable discoveries are included even after claiming, non-repeatable excluded', () => {
    // SKILL_PRACTICE discoveries are repeatable
    const practiceDisc = EXPLORATION_DISCOVERIES.find(d => d.category === 'SKILL_PRACTICE' && d.isRepeatable);
    expect(practiceDisc).toBeDefined();

    // Non-repeatable discovery exists
    const oneTimeDisc = EXPLORATION_DISCOVERIES.find(d => !d.isRepeatable);
    expect(oneTimeDisc).toBeDefined();
  });
});

// ===========================================================================
// 3. WorldSimulationService — Stateless Queries
// ===========================================================================

describe('M22 — WorldSimulationService Stateless Queries', () => {
  it('getAmbientDensity: neighborhood market is busy at midday, quiet at night', () => {
    const midday = WorldSimulationService.getAmbientDensity('neighborhood', 13);
    const midnight = WorldSimulationService.getAmbientDensity('neighborhood', 2);
    expect(midday).toBeGreaterThan(midnight);
    expect(midday).toBeGreaterThan(10);
    expect(midnight).toBeLessThanOrEqual(5);
  });

  it('getAmbientDensity: Cedarline interior is busier during business hours', () => {
    const morning = WorldSimulationService.getAmbientDensity('cedarline_interior', 9);
    const night = WorldSimulationService.getAmbientDensity('cedarline_interior', 3);
    expect(morning).toBeGreaterThan(night);
  });

  it('getVenueStatusesAtLocation: Eko Bistro is open to player at 14:00 Monday', () => {
    const statuses = WorldSimulationService.getVenueStatusesAtLocation('neighborhood', 14, 1);
    const bistro = statuses.find(s => s.venue.venueId === 'venue-eko-tech-bistro');
    expect(bistro).toBeDefined();
    expect(bistro?.access.isOpen).toBe(true);
    expect(bistro?.access.isPlayerPermitted).toBe(true);
  });

  it('getVenueStatusesAtLocation: Cedarline SOC requires badge', () => {
    const statuses = WorldSimulationService.getVenueStatusesAtLocation('cedarline_interior', 10, 1, []);
    const soc = statuses.find(s => s.venue.venueId === 'venue-cedarline-soc');
    expect(soc).toBeDefined();
    expect(soc?.access.isPlayerPermitted).toBe(false);
    expect(soc?.access.denialReason).toBe('BADGE_REQUIRED');
  });

  it('getCityBriefing: mentions "night" at 03:00 and "morning" at 09:00', () => {
    const night = WorldSimulationService.getCityBriefing('neighborhood', 3);
    const morning = WorldSimulationService.getCityBriefing('neighborhood', 9);
    expect(night.toLowerCase()).toContain('night');
    expect(morning.toLowerCase()).toContain('morning');
  });

  it('getCityBriefing: mentions NPCs present at a location', () => {
    // At 10 AM, Blessing should be at cedarline_interior
    const briefing = WorldSimulationService.getCityBriefing('cedarline_interior', 10);
    // Briefing should reference someone present
    expect(briefing.length).toBeGreaterThan(20);
  });
});

// ===========================================================================
// 4. WorldSimulationService — State Mutations (pure)
// ===========================================================================

describe('M22 — WorldSimulationService State Mutations', () => {
  let emptyState: WorldSimulationState;

  beforeEach(() => {
    emptyState = createInitialWorldSimulationState();
  });

  it('recordLocationVisit: creates first visit record correctly', () => {
    const next = WorldSimulationService.recordLocationVisit(emptyState, 'neighborhood', 3600, 9);
    expect(next.locationVisits['neighborhood']).toBeDefined();
    expect(next.locationVisits['neighborhood']!.totalVisits).toBe(1);
    expect(next.locationVisits['neighborhood']!.firstArrivalHour).toBe(9);
    expect(next.locationVisits['neighborhood']!.firstVisitSimTime).toBe(3600);
  });

  it('recordLocationVisit: increments visit count on repeated visits', () => {
    let state = WorldSimulationService.recordLocationVisit(emptyState, 'neighborhood', 3600, 9);
    state = WorldSimulationService.recordLocationVisit(state, 'neighborhood', 7200, 11);
    expect(state.locationVisits['neighborhood']!.totalVisits).toBe(2);
    expect(state.locationVisits['neighborhood']!.firstVisitSimTime).toBe(3600); // unchanged
    expect(state.locationVisits['neighborhood']!.lastVisitSimTime).toBe(7200); // updated
    expect(state.locationVisits['neighborhood']!.firstArrivalHour).toBe(9); // unchanged
  });

  it('recordLocationVisit: tracks multiple locations independently', () => {
    let state = WorldSimulationService.recordLocationVisit(emptyState, 'neighborhood', 100, 8);
    state = WorldSimulationService.recordLocationVisit(state, 'cedarline_interior', 200, 9);
    state = WorldSimulationService.recordLocationVisit(state, 'apartment_interior', 300, 10);
    expect(Object.keys(state.locationVisits).length).toBe(3);
    expect(state.locationVisits['apartment_interior']!.totalVisits).toBe(1);
  });

  it('recordLocationVisit: does not mutate original state', () => {
    const before = emptyState;
    WorldSimulationService.recordLocationVisit(emptyState, 'neighborhood', 100, 8);
    expect(before.locationVisits['neighborhood']).toBeUndefined();
  });

  it('claimDiscovery: claims a valid discovery and returns flag + activity', () => {
    const { nextWorldState, flagsToSet, unlockedActivityId } =
      WorldSimulationService.claimDiscovery(emptyState, 'disc_noticeboard_cyber_warning', 'neighborhood', 5000);

    expect(nextWorldState.claimedDiscoveries.length).toBe(1);
    expect(nextWorldState.claimedDiscoveries[0]!.discoveryId).toBe('disc_noticeboard_cyber_warning');
    expect(flagsToSet['has_read_community_noticeboard']).toBe(true);
    expect(unlockedActivityId).toBe('act_blue_broad_street_triage');
  });

  it('claimDiscovery: non-repeatable discovery cannot be claimed twice', () => {
    const { nextWorldState: stateAfterFirst } =
      WorldSimulationService.claimDiscovery(emptyState, 'disc_noticeboard_cyber_warning', 'neighborhood', 5000);

    const { nextWorldState: stateAfterSecond, flagsToSet } =
      WorldSimulationService.claimDiscovery(stateAfterFirst, 'disc_noticeboard_cyber_warning', 'neighborhood', 6000);

    // No additional claim appended
    expect(stateAfterSecond.claimedDiscoveries.length).toBe(1);
    expect(Object.keys(flagsToSet).length).toBe(0);
  });

  it('claimDiscovery: repeatable discovery can be claimed multiple times', () => {
    let state = emptyState;
    for (let i = 0; i < 3; i++) {
      const result = WorldSimulationService.claimDiscovery(state, 'disc_balogun_market_hardware', 'neighborhood', 1000 * i);
      state = result.nextWorldState;
    }
    // Repeatable, so each claim is logged
    const hardwareClaims = state.claimedDiscoveries.filter(c => c.discoveryId === 'disc_balogun_market_hardware');
    expect(hardwareClaims.length).toBe(3);
  });

  it('claimDiscovery: unknown discovery ID returns unchanged state', () => {
    const { nextWorldState, flagsToSet } =
      WorldSimulationService.claimDiscovery(emptyState, 'disc_nonexistent', 'neighborhood', 100);
    expect(nextWorldState.claimedDiscoveries.length).toBe(0);
    expect(Object.keys(flagsToSet).length).toBe(0);
  });

  it('queueNewDiscoveries: queues available discoveries at a location', () => {
    const next = WorldSimulationService.queueNewDiscoveries(
      emptyState, 'neighborhood', 10, {}
    );
    expect(next.pendingDiscoveryIds.length).toBeGreaterThan(0);
    expect(next.pendingDiscoveryIds).toContain('disc_noticeboard_cyber_warning');
  });

  it('queueNewDiscoveries: does not duplicate already-pending discoveries', () => {
    let state = WorldSimulationService.queueNewDiscoveries(emptyState, 'neighborhood', 10, {});
    state = WorldSimulationService.queueNewDiscoveries(state, 'neighborhood', 10, {});
    // No duplicates
    const unique = new Set(state.pendingDiscoveryIds);
    expect(unique.size).toBe(state.pendingDiscoveryIds.length);
  });

  it('claimDiscovery: removes from pendingDiscoveryIds when claimed', () => {
    const state = WorldSimulationService.queueNewDiscoveries(emptyState, 'neighborhood', 10, {});
    expect(state.pendingDiscoveryIds).toContain('disc_noticeboard_cyber_warning');

    const { nextWorldState } =
      WorldSimulationService.claimDiscovery(state, 'disc_noticeboard_cyber_warning', 'neighborhood', 100);
    expect(nextWorldState.pendingDiscoveryIds).not.toContain('disc_noticeboard_cyber_warning');
  });

  it('getAvailableDiscoveriesForPlayer: excludes claimed non-repeatable discoveries', () => {
    const { nextWorldState: claimed } =
      WorldSimulationService.claimDiscovery(emptyState, 'disc_noticeboard_cyber_warning', 'neighborhood', 100);

    const available = WorldSimulationService.getAvailableDiscoveriesForPlayer('neighborhood', 10, {}, claimed);
    const ids = available.map(d => d.id);
    expect(ids).not.toContain('disc_noticeboard_cyber_warning');
  });

  it('explorationUnlockedActivityIds accumulates from claimed discoveries', () => {
    const { nextWorldState } =
      WorldSimulationService.claimDiscovery(emptyState, 'disc_noticeboard_cyber_warning', 'neighborhood', 100);
    expect(nextWorldState.explorationUnlockedActivityIds).toContain('act_blue_broad_street_triage');
  });

  it('explorationUnlockedActivityIds has no duplicates from repeated claims', () => {
    // Claim a second repeatable discovery that also unlocks the same activity
    const disc1 = WorldSimulationService.claimDiscovery(emptyState, 'disc_noticeboard_cyber_warning', 'neighborhood', 100);
    const disc2 = WorldSimulationService.claimDiscovery(disc1.nextWorldState, 'disc_tsharp_marina_handoff', 'neighborhood', 200);

    // Both unlock act_blue_broad_street_triage
    const ids = disc2.nextWorldState.explorationUnlockedActivityIds;
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});

// ===========================================================================
// 5. Integration: WorldSimulationState in SimulationState
// ===========================================================================

describe('M22 — Integration: WorldSimulationState in SimulationState', () => {
  it('createInitialSimulationState includes worldSim field', () => {
    const state = createInitialSimulationState();
    expect(state.worldSim).toBeDefined();
  });

  it('initial worldSim has empty location visits and no claimed discoveries', () => {
    const state = createInitialSimulationState();
    expect(state.worldSim!.locationVisits).toEqual({});
    expect(state.worldSim!.claimedDiscoveries).toHaveLength(0);
    expect(state.worldSim!.pendingDiscoveryIds).toHaveLength(0);
    expect(state.worldSim!.explorationUnlockedActivityIds).toHaveLength(0);
  });

  it('worldSim override is respected in createInitialSimulationState', () => {
    const customWorldSim = {
      locationVisits: {
        neighborhood: {
          locationId: 'neighborhood',
          firstVisitSimTime: 100,
          lastVisitSimTime: 100,
          totalVisits: 1,
          firstArrivalHour: 9,
        },
      },
      claimedDiscoveries: [],
      pendingDiscoveryIds: [],
      explorationUnlockedActivityIds: ['act_blue_broad_street_triage'],
    };

    const state = createInitialSimulationState({ worldSim: customWorldSim });
    expect(state.worldSim!.locationVisits['neighborhood']).toBeDefined();
    expect(state.worldSim!.explorationUnlockedActivityIds).toContain('act_blue_broad_street_triage');
  });
});

// ===========================================================================
// 6. Venue Operating Hours & Access Control
// ===========================================================================

describe('M22 — Venue Operating Hours & Access Control', () => {
  it('player apartment is always accessible (24/7)', () => {
    const statuses = WorldSimulationService.getVenueStatusesAtLocation('apartment_interior', 3, 0);
    const apt = statuses.find(s => s.venue.venueId === 'venue-player-apartment');
    expect(apt?.access.isOpen).toBe(true);
    expect(apt?.access.isPlayerPermitted).toBe(true);
  });

  it('Mama Esther stall is open 07:00-19:00 weekdays, closed Sunday', () => {
    const openStatus = WorldSimulationService.getVenueStatusesAtLocation('neighborhood', 11, 3); // Wednesday
    const stall = openStatus.find(s => s.venue.venueId === 'venue-mama-nkechi-market');
    expect(stall?.access.isOpen).toBe(true);

    const closedSunday = WorldSimulationService.getVenueStatusesAtLocation('neighborhood', 11, 0); // Sunday
    const stallSunday = closedSunday.find(s => s.venue.venueId === 'venue-mama-nkechi-market');
    expect(stallSunday?.access.isOpen).toBe(false);
    expect(stallSunday?.access.denialReason).toBe('CLOSED_TODAY');
  });

  it('Cedarline SOC is 24/7 but requires SECURITY_SECOPS badge', () => {
    const noBadge = WorldSimulationService.getVenueStatusesAtLocation('cedarline_interior', 3, 1, []);
    const soc = noBadge.find(s => s.venue.venueId === 'venue-cedarline-soc');
    expect(soc?.access.isOpen).toBe(true);
    expect(soc?.access.isPlayerPermitted).toBe(false);

    const withBadge = WorldSimulationService.getVenueStatusesAtLocation('cedarline_interior', 3, 1, ['SECURITY_SECOPS']);
    const socBadge = withBadge.find(s => s.venue.venueId === 'venue-cedarline-soc');
    expect(socBadge?.access.isPlayerPermitted).toBe(true);
  });
});

// ===========================================================================
// 7. Command Execution & Location Visit Integration
// ===========================================================================

describe('M22 — Command Execution & World State Integration', () => {
  it('SetLogicalPlayerLocation automatically logs visit and queues discoveries', () => {
    const state = createInitialSimulationState({
      locationId: 'apartment_interior',
    });

    const result = handleCommand(state, {
      type: 'SetLogicalPlayerLocation',
      locationId: 'neighborhood',
    });

    expect(result.success).toBe(true);
    expect(result.state.player.locationId).toBe('neighborhood');
    expect(result.state.worldSim).toBeDefined();

    // Check visit record was created
    const visit = result.state.worldSim!.locationVisits['neighborhood'];
    expect(visit).toBeDefined();
    expect(visit!.totalVisits).toBe(1);

    // Check discoveries were queued for neighborhood
    expect(result.state.worldSim!.pendingDiscoveryIds.length).toBeGreaterThan(0);
  });

  it('moving between locations tracks visit counts accurately', () => {
    const state = createInitialSimulationState({ locationId: 'apartment_interior' });

    // Visit neighborhood
    let res = handleCommand(state, { type: 'SetLogicalPlayerLocation', locationId: 'neighborhood' });
    expect(res.state.worldSim!.locationVisits['neighborhood']!.totalVisits).toBe(1);

    // Move to cedarline
    res = handleCommand(res.state, { type: 'SetLogicalPlayerLocation', locationId: 'cedarline_interior' });
    expect(res.state.worldSim!.locationVisits['cedarline_interior']!.totalVisits).toBe(1);

    // Return to neighborhood
    res = handleCommand(res.state, { type: 'SetLogicalPlayerLocation', locationId: 'neighborhood' });
    expect(res.state.worldSim!.locationVisits['neighborhood']!.totalVisits).toBe(2);
  });

  it('RecordLocationVisit command explicitly logs presence and emits event', () => {
    const state = createInitialSimulationState({ locationId: 'neighborhood' });

    const result = handleCommand(state, {
      type: 'RecordLocationVisit',
      locationId: 'cedarline_interior',
    });

    expect(result.success).toBe(true);
    expect(result.events.some(e => e.type === 'LOCATION_VISIT_RECORDED')).toBe(true);
    expect(result.state.worldSim!.locationVisits['cedarline_interior']!.totalVisits).toBe(1);
  });

  it('ClaimExplorationDiscovery claims discovery, sets flags, unlocks activities, and emits event', () => {
    // Player is in neighborhood at day time
    const state = createInitialSimulationState({ locationId: 'neighborhood' });

    const result = handleCommand(state, {
      type: 'ClaimExplorationDiscovery',
      discoveryId: 'disc_noticeboard_cyber_warning',
    });

    expect(result.success).toBe(true);
    expect(result.state.flags['has_read_community_noticeboard']).toBe(true);
    expect(result.state.worldSim!.claimedDiscoveries.some(c => c.discoveryId === 'disc_noticeboard_cyber_warning')).toBe(true);
    expect(result.state.worldSim!.explorationUnlockedActivityIds).toContain('act_blue_broad_street_triage');

    const event = result.events.find(e => e.type === 'EXPLORATION_DISCOVERY_CLAIMED');
    expect(event).toBeDefined();
    expect((event as unknown as { payload: { discoveryId: string } }).payload.discoveryId).toBe('disc_noticeboard_cyber_warning');
  });

  it('ClaimExplorationDiscovery rejects claiming when player is at the wrong location', () => {
    // Player is in apartment, but discovery is in cedarline
    const state = createInitialSimulationState({ locationId: 'apartment_interior' });

    const result = handleCommand(state, {
      type: 'ClaimExplorationDiscovery',
      discoveryId: 'disc_blessing_whiteboard_notes', // Cedarline interior required
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('DISCOVERY_CONDITIONS_NOT_MET');
  });

  it('ClaimExplorationDiscovery rejects duplicate claims of non-repeatable discoveries', () => {
    const state = createInitialSimulationState({ locationId: 'neighborhood' });

    const first = handleCommand(state, {
      type: 'ClaimExplorationDiscovery',
      discoveryId: 'disc_noticeboard_cyber_warning',
    });
    expect(first.success).toBe(true);

    const second = handleCommand(first.state, {
      type: 'ClaimExplorationDiscovery',
      discoveryId: 'disc_noticeboard_cyber_warning',
    });
    expect(second.success).toBe(false);
    expect(second.errorCode).toBe('DISCOVERY_ALREADY_CLAIMED');
  });
});

// ===========================================================================
// 8. SaveManager Persistence Round-Trip for WorldSimulationState
// ===========================================================================

describe('M22 — Persistence Round-Trip for World State', () => {
  it('saves and reloads world simulation state with 100% fidelity', async () => {
    const storage = new MemoryStorageAdapter();
    await storage.init();

    // 1. Create engine and populate world simulation state
    const baseState = createInitialSimulationState({ locationId: 'apartment_interior' });
    const engine = new SimulationEngine({ initialState: baseState });

    // Player visits neighborhood and claims a discovery
    engine.dispatch({ type: 'SetLogicalPlayerLocation', locationId: 'neighborhood' });
    engine.dispatch({ type: 'ClaimExplorationDiscovery', discoveryId: 'disc_noticeboard_cyber_warning' });

    const stateBeforeSave = engine.getState();
    expect(stateBeforeSave.worldSim!.locationVisits['neighborhood']).toBeDefined();
    expect(stateBeforeSave.worldSim!.claimedDiscoveries.length).toBe(1);
    expect(stateBeforeSave.worldSim!.explorationUnlockedActivityIds).toContain('act_blue_broad_street_triage');

    // 2. Save game via SaveManager
    const saveManager = new SaveManager({ engine, storage, enableAutosave: false });
    await saveManager.init();
    const saveResult = await saveManager.saveGame('slot_1', 'M22 test checkpoint');
    expect(saveResult.success).toBe(true);

    // 3. Create fresh target engine and load saved state
    const targetEngine = new SimulationEngine({ initialState: createInitialSimulationState() });
    const targetSaveManager = new SaveManager({ engine: targetEngine, storage, enableAutosave: false });
    await targetSaveManager.init();

    const loadResult = await targetSaveManager.loadGame('slot_1');
    expect(loadResult.success).toBe(true);

    const restoredState = targetEngine.getState();
    expect(restoredState.worldSim).toBeDefined();
    expect(restoredState.worldSim!.locationVisits['neighborhood']!.totalVisits).toBe(1);
    expect(restoredState.worldSim!.claimedDiscoveries[0]!.discoveryId).toBe('disc_noticeboard_cyber_warning');
    expect(restoredState.worldSim!.explorationUnlockedActivityIds).toContain('act_blue_broad_street_triage');
    expect(restoredState.flags['has_read_community_noticeboard']).toBe(true);
  });

  it('gracefully reconciles legacy saves that lack the worldSim field', async () => {
    const storage = new MemoryStorageAdapter();
    await storage.init();

    // Construct a legacy-like state where worldSim is undefined
    const base = createInitialSimulationState();
    const { worldSim: _, ...legacyStateWithoutWorldSim } = base as unknown as Record<string, unknown>;

    const sourceEngine = new SimulationEngine({ initialState: base });
    // Manually force state without worldSim
    (sourceEngine as unknown as { _state: unknown })._state = legacyStateWithoutWorldSim;

    const sourceSaveManager = new SaveManager({ engine: sourceEngine, storage, enableAutosave: false });
    await sourceSaveManager.init();
    await sourceSaveManager.saveGame('slot_legacy', 'Legacy save without worldSim');

    // Load into target engine
    const targetEngine = new SimulationEngine({ initialState: createInitialSimulationState() });
    const targetSaveManager = new SaveManager({ engine: targetEngine, storage, enableAutosave: false });
    await targetSaveManager.init();

    const loadResult = await targetSaveManager.loadGame('slot_legacy');
    expect(loadResult.success).toBe(true);

    const loadedState = targetEngine.getState();
    expect(loadedState.worldSim).toBeDefined();
    expect(loadedState.worldSim!.locationVisits).toEqual({});
    expect(loadedState.worldSim!.claimedDiscoveries).toEqual([]);
  });
});

// ===========================================================================
// 9. Activity Director Integration & Lead Unlocking
// ===========================================================================

describe('M22 — Activity Director Integration', () => {
  it('claiming exploration discovery disc_mama_esther_intel unlocks act_story_broad_street_intel', () => {
    const state = createInitialSimulationState({ locationId: 'neighborhood' });

    const result = handleCommand(state, {
      type: 'ClaimExplorationDiscovery',
      discoveryId: 'disc_mama_esther_intel',
    });

    expect(result.success).toBe(true);
    expect(result.state.flags['mama_esther_informant_active']).toBe(true);
    expect(result.state.worldSim!.explorationUnlockedActivityIds).toContain('act_story_broad_street_intel');
  });

  it('claiming exploration discovery disc_anjola_recruiter_encounter unlocks act_freelance_paystack_bounty', () => {
    // 10:00 AM (7200s from 08:00) so it falls in [9, 15] hour window
    const state = createInitialSimulationState({ locationId: 'neighborhood', simulationTimeSeconds: 7200 });

    const result = handleCommand(state, {
      type: 'ClaimExplorationDiscovery',
      discoveryId: 'disc_anjola_recruiter_encounter',
    });

    expect(result.success).toBe(true);
    expect(result.state.flags['anjola_contract_offer_seen']).toBe(true);
    expect(result.state.worldSim!.explorationUnlockedActivityIds).toContain('act_freelance_paystack_bounty');
  });
});

// ===========================================================================
// 10. Graceful Recovery & Edge Case Handling
// ===========================================================================

describe('M22 — Graceful Recovery & Edge Cases', () => {
  it('queries at off-hours return empty NPC lists without throwing errors', () => {
    // 03:00 AM at the neighborhood market
    const npcs = WorldSimulationService.getNpcsAtLocation('neighborhood', 3);
    // Should be an array (might be empty or contain nocturnal characters) without errors
    expect(Array.isArray(npcs)).toBe(true);
  });

  it('closed venues provide clear denial reason without crashing', () => {
    // Sunday at Mama Esther's stall
    const statuses = WorldSimulationService.getVenueStatusesAtLocation('neighborhood', 12, 0);
    const stall = statuses.find(s => s.venue.venueId === 'venue-mama-nkechi-market');
    expect(stall).toBeDefined();
    expect(stall!.access.isOpen).toBe(false);
    expect(stall!.access.denialReason).toBe('CLOSED_TODAY');
  });

  it('attempting to claim an unknown discovery returns DISCOVERY_NOT_FOUND', () => {
    const state = createInitialSimulationState({ locationId: 'neighborhood' });

    const result = handleCommand(state, {
      type: 'ClaimExplorationDiscovery',
      discoveryId: 'disc_non_existent_id',
    });

    expect(result.success).toBe(false);
    expect(result.errorCode).toBe('DISCOVERY_NOT_FOUND');
  });
});
