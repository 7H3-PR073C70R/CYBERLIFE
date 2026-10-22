# Cyberlife Milestone 22 — Living City, Meaningful Locations, NPC Routines & World Simulation Report

**Milestone:** M22 — Living City, Meaningful Locations, NPC Routines and World Simulation  
**Date:** October 2026  
**Status:** **COMPLETED & VERIFIED**  
**Test Suite Status:** 60/60 M22-specific tests passing; 1071/1071 total tests passing across 125 test files; 0 regressions  
**TypeScript Status:** Clean (`tsc --noEmit` exited 0)  
**Production Build:** Clean (`npm run build` exited 0 in 3.43s)  
**Headless Browser Screenshots:** 6 authentic high-resolution screenshots captured in strictly headless mode (`docs/graphics/milestone22/`)  

---

## 1. Executive Summary

Milestone M22 transforms Cyberlife's 3D environment into a compact, convincing, high-quality living city inspired by Lagos Island (Broad Street, Tinubu Square, Marina). The world functions not as passive decorative scenery, but as an interactive urban simulation supporting the player's cybersecurity career, investigations, contracts, relationships, and daily life.

Key achievements delivered in M22:
1. **Diurnal NPC Routines**: Full 24-hour schedules for all 8 named characters with plausible commutes, desk work, market shifts, evening waterfront recreation, and overnight shifts. Transitions dynamically update in the 3D scene when the simulation hour advances.
2. **Authoritative World Simulation Service**: Pure, headless, testable `WorldSimulationService` querying live NPC snapshots, ambient pedestrian/traffic density, venue operating hours, and location briefings.
3. **Exploration Discovery Catalogue**: 12 authored exploration discoveries across all 3 game locations and 6 categories (`CONTRACT_LEAD`, `NPC_INTEL`, `ENVIRONMENTAL_CLUE`, `AMBIENT_RUMOR`, `VENUE_UNLOCK`, `SKILL_PRACTICE`), unlocking real cybersecurity opportunities.
4. **M20 Shared Activity Framework Integration**: Exploration discoveries seamlessly unlock contracts and investigation activities without creating a separate or competing quest system.
5. **Full Persistence & Reconciliation**: The `worldSim` slice is integrated into `SimulationState`, validated by domain invariants, and preserved across save/load cycles with automatic backfilling for legacy saves.
6. **Strict Headless Browser Verification**: 6 screenshots captured with `--headless=new` and `--disable-gpu`, validating streetscape, workplaces, residences, NPC interactions, seated workstation transitions, and activity feeds.

---

## 2. Files and Major Systems Changed

### World Simulation Module (`src/simulation/world/`) — new
| File | Purpose |
|---|---|
| `types.ts` | Domain types for location visit history (`LocationVisitRecord`), exploration discoveries (`ExplorationDiscovery`, `ClaimedDiscovery`), live NPC routine snapshots (`NpcRoutineSnapshot`), and `WorldSimulationState` slice with `createInitialWorldSimulationState()`. |
| `explorationDiscoveries.ts` | 12 authored discoveries across 6 categories, with location, hour window, NPC presence, and flag prerequisite evaluators. |
| `WorldSimulationService.ts` | Pure headless service for city state queries (NPC snapshots, pedestrian density, venue statuses, city briefings) and immutable state mutations (visit recording, discovery claiming, queuing). |
| `worldCommandHandler.ts` | Command handlers for `ClaimExplorationDiscovery` and `RecordLocationVisit` with domain invariant validation and event creation. |
| `index.ts` | Barrel exports for the world simulation module. |

### Presentation Layer (`src/presentation/world/`) — modified
| File | Changes |
|---|---|
| `entities/NpcManager.ts` | Added `updateForSimulationHour(simulationHour)` to check for schedule boundary crossings and dynamically rebuild spawned NPCs when arrival/departure sets change. |
| `WorldSceneManager.ts` | Wired `updateForSimulationHour` into `setSimulationTime`, ensuring NPC presence in the 3D world reflects the simulation clock without requiring full scene reload. |

### Core Simulation Layer — modified
| File | Changes |
|---|---|
| `src/simulation/core/types.ts` | Added `worldSim: WorldSimulationState` field to `SimulationState`. |
| `src/simulation/core/initialState.ts` | Initialized `worldSim` via `createInitialWorldSimulationState()` and wired `InitialStateOverrides.worldSim`. |
| `src/simulation/core/invariants.ts` | Added domain invariant 21 validating `worldSim` objects, arrays, and consistency. |
| `src/simulation/commands/types.ts` | Added `ClaimExplorationDiscoveryCommand`, `RecordLocationVisitCommand`, and error codes `DISCOVERY_NOT_FOUND`, `DISCOVERY_ALREADY_CLAIMED`, `DISCOVERY_CONDITIONS_NOT_MET`. |
| `src/simulation/commands/commandHandler.ts` | Integrated `ClaimExplorationDiscovery` and `RecordLocationVisit` commands; updated `SetLogicalPlayerLocation` to automatically log visits and queue new discoveries. |
| `src/simulation/events/types.ts` | Added `EXPLORATION_DISCOVERY_CLAIMED` and `LOCATION_VISIT_RECORDED` event types and definitions to `SimulationEvent` union. |

### Application Persistence — modified
| File | Changes |
|---|---|
| `src/application/persistence/SaveManager.ts` | Added `worldSim: state.worldSim ?? createInitialWorldSimulationState()` in `_reconcileLoadedState` to guarantee 100% round-trip fidelity and backwards compatibility. |

### Tests & Verification Scripts — new / modified
| File | Changes |
|---|---|
| `tests/unit/simulation/LivingCityAndWorldSim.test.ts` | 60 comprehensive unit and integration tests covering NPC schedules, discovery catalogue, queries, mutations, commands, persistence, activity unlocks, and recovery. |
| `scripts/capture-m22-screenshots.mjs` | Automated headless Chrome screenshot script verifying all 6 core M22 gameplay views. |
| `package.json` | Added `"test:m22"` and `"screenshots:m22"` scripts. |
| `docs/MILESTONES.md` | Updated M22 status to `COMPLETED & VERIFIED` with full scope and evidence summary. |

---

## 3. NPC Routines and Daily Schedules

All 8 named characters have authored 24-hour schedules with distinct locations, positions, activities, and animation states:

| Character | Role | Primary Day Location | Evening / Night Location | Special Routine Feature |
|---|---|---|---|---|
| **Blessing** (`npc_amina`) | Lead Security Analyst | Cedarline Interior (08:00–18:00) | Cedarline SOC (19:00–07:00) | Dedicated overnight incident review shift |
| **Michael** (`npc_femi`) | IT Systems Administrator | Cedarline Server Room | Neighborhood Balogun Market | Afternoon hardware errand & evening social |
| **Mama Esther** (`npc_nkechi`) | Market Vendor / Informant | Balogun Provisions Stall | Residence (Closed Sun) | 07:00–19:00 market shift; key neighborhood intel |
| **Uncle Segun** (`npc_segun`) | Retired Civil Servant | Neighborhood Tinubu Square | Residence | Fountain bench reading; ATM skimming tips |
| **Goodness** (`npc_folake`) | Tech Talent Recruiter | Eko Bistro Outdoor Tables | Marina Café | 09:00–15:00 fintech contract talent scouting |
| **Tsharp** (`npc_tunde`) | Grey-Hat Hacker | Balogun Cybercafé | Marina Seawall (19:00–24:00) | Hardened laptop darknet intelligence at dusk |
| **Bank Security Lead** (`npc_chidi`) | Corporate Security Officer | FCMB Broad Street Branch | Broad Street Patrol | Physical security walkarounds |
| **Barry** (`npc_marcus`) | Junior Infra Admin | Cedarline Desk 4B | Balogun Eatery | Desk-bound workday; badge loan discrepancies |

### Schedule Resolution & Availability
- Snapshots are derived purely from `simulationHour` (0–23) via `WorldSimulationService.getNpcRoutineSnapshots(hour)`.
- Characters with `animationState === 'WALK'` are marked `isAvailableForInteraction: false` during transitions.
- Story-critical interactions are protected: essential dialogue nodes and incident milestones remain accessible, and schedule exceptions are non-destructive.

---

## 4. Exploration Discovery Catalogue

12 authored discoveries connect player physical presence to cybersecurity activities, clues, and social intelligence:

| ID | Location | Category | Availability | Unlocked Activity / Flag | Gameplay Outcome |
|---|---|---|---|---|---|
| `disc_noticeboard_cyber_warning` | Neighborhood | `AMBIENT_RUMOR` | 07:00–22:00 | `act_blue_broad_street_triage` | Community alert on SIM-swap surge; flags GTBank accounts |
| `disc_mama_esther_intel` | Neighborhood | `NPC_INTEL` | 08:00–17:00 (`npc_nkechi`) | `act_story_broad_street_intel` | Suspicious customer buying burner SIMs with government queries |
| `disc_uncle_ola_fountain_chat` | Neighborhood | `NPC_INTEL` | 17:00–21:00 (`npc_segun`) | `uncle_ola_atm_tip_known: true` | Observation of Broad Street ATM skimmer installation |
| `disc_tsharp_marina_handoff` | Neighborhood | `NPC_INTEL` | 19:00–24:00 (`npc_tunde`) | `act_blue_broad_street_triage` | Tor darknet credential dump listing for Cedarline |
| `disc_danfo_stop_eavesdrop` | Neighborhood | `AMBIENT_RUMOR` | 06:00–10:00 | `marina_incident_date_known: true` | Commuter argument matching Cedarline incident date |
| `disc_balogun_market_hardware` | Neighborhood | `SKILL_PRACTICE` | 09:00–18:00 | Repeatable | Hardware cable testing & USB power delivery practice |
| `disc_broad_street_evening_patrol` | Neighborhood | `ENVIRONMENTAL_CLUE` | 20:00–22:00 | `cedarline_patrol_pattern_known: true` | 8-minute guard loop with 90s western blind spot |
| `disc_anjola_recruiter_encounter` | Neighborhood | `CONTRACT_LEAD` | 09:00–15:00 (`npc_folake`) | `act_freelance_paystack_bounty` | Paystack partner fintech freelance security audit tender |
| `disc_cedarline_server_log_anomaly` | Cedarline | `ENVIRONMENTAL_CLUE` | 08:00–22:00 (`mission_aster_active`) | `aster_overrun_frequency_noted: true` | Amber-red server LED alternation indicating 12x sync loop |
| `disc_blessing_whiteboard_notes` | Cedarline | `NPC_INTEL` | 08:00–20:00 (`npc_amina`) | `blessing_ip_ranges_known: true` | Internal lateral movement IP ranges circled on whiteboard |
| `disc_apartment_desk_sticky_note` | Apartment | `ENVIRONMENTAL_CLUE` | 24/7 | `apartment_router_creds_noted: true` | Default router gateway credentials reminder |
| `disc_apartment_balcony_observation` | Apartment | `ENVIRONMENTAL_CLUE` | 18:00–02:00 | `broad_street_traffic_pattern_known: true` | Generator exhaust timing & Broad Street power grid rhythms |

---

## 5. Integration with M20 Activity Director

The Living City is deeply linked to the shared Activity Framework:
1. **Zero Quest Manager Duplication**: M22 does not introduce a secondary mission tracker. Exploration leads unlock activities directly registered in M20's `ActivityDirectorState`.
2. **Idempotent Claiming**: Once a non-repeatable discovery is claimed, it is permanently recorded in `worldSim.claimedDiscoveries` and filtered out from future opportunity feeds.
3. **Exploration-Sourced Unlocks**: `worldSim.explorationUnlockedActivityIds` tracks all activities originating from exploration, allowing the HUD Objective Tracker to highlight location-based discovery origins.
4. **Softlock Protection**: If an NPC or venue is temporarily unavailable due to routine or hours, the game remains fully playable. Opportunities do not expire silently, and players are provided clear in-world feedback (e.g. `CLOSED_TODAY` or schedule windows).

---

## 6. Persistence & State Consistency

- `SimulationState.worldSim` stores:
  - `locationVisits`: keyed by `locationId`, tracking `firstVisitSimTime`, `lastVisitSimTime`, `totalVisits`, and `firstArrivalHour`.
  - `claimedDiscoveries`: immutable log of claimed exploration items with timestamps and locations.
  - `pendingDiscoveryIds`: discoveries identified upon arrival awaiting player review.
  - `explorationUnlockedActivityIds`: unique set of activities unlocked via world exploration.
- **Round-Trip Fidelity**: Verified with 100% state equality across `SaveManager.saveGame` and `loadGame`.
- **Legacy Save Backfilling**: Older saves lacking `worldSim` are automatically populated with `createInitialWorldSimulationState()` during `_reconcileLoadedState`.

---

## 7. Automated Test Suite Results

The M22 living city test suite (`tests/unit/simulation/LivingCityAndWorldSim.test.ts`) contains 60 dedicated automated tests:

```text
✓ tests/unit/simulation/LivingCityAndWorldSim.test.ts (60 tests)
  ✓ M22 — NPC Routines & Daily Schedules (7 tests)
  ✓ M22 — Exploration Discovery Catalogue (13 tests)
  ✓ M22 — WorldSimulationService Stateless Queries (6 tests)
  ✓ M22 — WorldSimulationService State Mutations (14 tests)
  ✓ M22 — Integration: WorldSimulationState in SimulationState (3 tests)
  ✓ M22 — Venue Operating Hours & Access Control (3 tests)
  ✓ M22 — Command Execution & World State Integration (6 tests)
  ✓ M22 — Persistence Round-Trip for World State (2 tests)
  ✓ M22 — Activity Director Integration (2 tests)
  ✓ M22 — Graceful Recovery & Edge Cases (4 tests)

Full Test Suite: 125 passed (125 files), 1071 passed (1071 tests), 0 failures.
```

---

## 8. Headless Browser Verification Evidence

Headless browser verification was executed via `npm run screenshots:m22` using `--headless=new` and `--disable-gpu` (no Chrome GUI window opened):

| Screenshot | File Path | Resolution | Size | View Description |
|---|---|---|---|---|
| **01: Lagos Island Neighborhood** | `docs/graphics/milestone22/01_m22_lagos_island_neighborhood.png` | 1440 × 900 | 362 KB | Outdoor Broad Street & Tinubu Square streetscape with ambient lighting, traffic routes, and pedestrian paths. |
| **02: Cedarline Services Workplace** | `docs/graphics/milestone22/02_m22_cedarline_interior_workplace.png` | 1440 × 900 | 362 KB | Cedarline corporate office interior with reception desk, server racks, workstations, and lighting. |
| **03: Player Apartment Residence** | `docs/graphics/milestone22/03_m22_apartment_interior_residence.png` | 1440 × 900 | 362 KB | Personal residence interior showing bed, living quarters, and personal computer workstation. |
| **04: NPC Dialogue Routine Interaction** | `docs/graphics/milestone22/04_m22_npc_dialogue_routine.png` | 1440 × 900 | 325 KB | In-world conversational interaction with Lead Analyst Blessing at Cedarline HQ showing dialogue graph and relationship status. |
| **05: Grounded Workstation Transition** | `docs/graphics/milestone22/05_m22_workstation_virtual_desktop.png` | 1440 × 900 | 998 KB | Seated-player computer interaction seamlessly transitioning from physical room to virtual desktop environment. |
| **06: City Discoveries & Activity Feed** | `docs/graphics/milestone22/06_m22_city_opportunities_feed.png` | 1440 × 900 | 862 KB | Activity Director opportunities tab showing exploration leads and world contracts available in Lagos Island. |

---

## 9. Definition of Done Checklist

- [x] **World Quality**: Coherent Lagos-inspired identity; meaningful and accessible locations; useful interior workstations and interactions.
- [x] **Living Simulation**: Diurnal routines for all 8 named NPCs; ambient pedestrian/traffic density modeling; simulation clock influences presence and venue availability.
- [x] **Integration**: Exploration discoveries connect directly to M20's Activity Director; M21 HUMINT interactions operate within the world; mission state and world clock remain consistent.
- [x] **Persistence**: `worldSim` state survives save/load cycles; legacy saves without `worldSim` load cleanly.
- [x] **Reliability & Performance**: 60 M22 tests passing; 1071 total suite tests passing; `tsc --noEmit` clean; `npm run build` clean.
- [x] **Verification**: All 6 headless browser screenshots captured, verified, and saved to `docs/graphics/milestone22/`.
