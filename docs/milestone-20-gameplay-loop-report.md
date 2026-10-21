# Cyberlife Milestone 20 — Gameplay Loop, Player Progression, Career Structure & Activity Director Completion Report

**Milestone:** M20 — Gameplay Loop, Player Progression & Activity Director  
**Date:** October 2026  
**Status:** **COMPLETED & VERIFIED**  
**Test Suite Status:** 23 M20-specific tests passing (8 domain, 8 UI, 7 HUD); 954/954 total tests passing; 0 regressions  
**TypeScript Status:** Clean (`tsc --noEmit` exited 0)  
**Build Status:** Clean (`vite build` exited 0)  
**Headless Browser Screenshots:** 6 authentic captures in `docs/graphics/milestone20/`

---

## 1. Executive Summary & What Was Implemented

Milestone 20 establishes the shared gameplay foundation that ties together every prior milestone into a continuously playable cybersecurity career and life simulation. Before M20, Cyberlife's systems (network analysis, red/blue team operations, bounty contracts, narrative) existed as independently excellent domains without a unifying player-facing loop. M20 fixes that.

The player can now:

1. **Discover opportunities** via a prioritized Activity Director that evaluates actual game state — career level, completed activities, active story branches, available tools, and reputation — to surface relevant, gated, non-duplicated next steps.
2. **Understand objectives** through the `ObjectiveTrackerHUD`, which synchronizes in real-time with the active activity's objective checklist and technical rationale.
3. **Accept and pursue activities** spanning M14 narrative story branches, M16 network investigations, M17 authorized assessments, M18 defensive operations, and M19 bounty contracts — all through a single shared framework.
4. **Receive results and consequences** via deterministic settlement: idempotent reward application, skill progression, reputation updates, and follow-up opportunity unlocks.
5. **Review career progression** through a 9-skill matrix and long-term goal tracking in the Career & Goals workspace.
6. **Consult an immutable audit log** of all settled activities with ledger entries, timestamps, and reward records.

The framework is built on clean domain separation: all eligibility evaluation, prioritization, objective assessment, and settlement logic is pure TypeScript with zero React or browser dependencies, making it fully headless-testable.

---

## 2. Files and Major Systems Changed

### Domain Layer (`src/simulation/activities/`)

- **`types.ts`** (163 lines): Domain interfaces — `ActivityDefinition`, `ActivityInstance`, `ActivityObjective`, `ActivityDirectorState`, `LongTermGoal`, `CareerSkillMatrix`, `ActivityReward`, `ActivityAuditEntry`, `OpportunityPresentation`, `RecommendationRationale`.
- **`activityDirectorEngine.ts`** (596 lines): Core evaluation and scoring engine:
  - `evaluateCandidateActivities()` — evaluates all catalogue entries against current game state with skill/career prerequisites, completed-history deduplication, and active-activity conflict checks.
  - `scoreAndRankOpportunities()` — transparent weighted scoring across urgency, career relevance, story progression, and time-sensitivity.
  - `assessObjectiveSatisfaction()` — pure domain objective evaluation with per-criterion status and feedback.
  - `settleActivity()` — idempotent reward application; checks `completedHistory` before awarding to prevent double rewards across save/reload cycles.
  - `abandonActivity()` — clean state reset releasing the active slot and recording abandonment reason.
  - `generateFollowUpOpportunities()` — derives follow-up recommendations from settlement outcomes.
- **`activityCatalogue.ts`** (676 lines): 9 authored activity definitions covering all career paths plus a procedural contract generator with variation guards. Export alias `ACTIVITY_CATALOGUE` provided for engine and test consumption.
- **`activityCommandHandler.ts`** (443 lines): Handlers for `StartActivity`, `UpdateActivityObjective`, `ResolveActivity`, `AbandonActivity`, `RefreshOpportunities`, `SetActivityDirectorTab`.
- **`index.ts`**: Public API barrel.

### Adapter Layer (`src/simulation/activities/adapters/`)

Five adapters bridge the shared framework with each completed milestone's domain state, reading real game state to surface authentic activities:

- **`M14StoryAdapter.ts`** — queries `narrativeState` for active/completed story arc progression.
- **`M16InvestigationAdapter.ts`** — reads `networkAnalysis` investigation and threat correlation status.
- **`M17RedTeamAdapter.ts`** — reads `redTeam` assessment engagement and evidence vault state.
- **`M18DefensiveOpsAdapter.ts`** — reads `defensiveOps` SOC alerts, detection coverage, purple team status.
- **`M19BountyAdapter.ts`** — reads `bountyHub` freelance reputation and contract state.
- **`index.ts`**: Barrel export.

### Core Simulation & Persistence Integration

- **`src/simulation/core/types.ts`**: Added `readonly activityDirector?: ActivityDirectorState` to `SimulationState`.
- **`src/simulation/core/initialState.ts`**: Initialized `activityDirector` via `createInitialActivityDirectorState()` — full catalogue, 9-skill matrix at level 0, empty completed history, seeded recommendations for new players.
- **`src/simulation/core/invariants.ts`**: Enforced structural validity — non-null activities map, array type guards for `recommendedActivityIds`, `completedHistory`, `longTermGoals`, and active activity referential integrity.
- **`src/simulation/commands/types.ts`**: Added all M20 command interfaces and error codes (`ACTIVITY_NOT_FOUND`, `ACTIVITY_PREREQUISITES_NOT_MET`, `ACTIVITY_ALREADY_ACTIVE`, `ACTIVITY_ALREADY_COMPLETED`, `NO_ACTIVE_ACTIVITY`).
- **`src/simulation/commands/commandHandler.ts`**: Dispatched all M20 activity commands to `handleActivityCommand`.

### Presentation Layer

- **`src/presentation/desktop/types.ts`**: Registered `'activity'` in `AppId` union and `APP_REGISTRY`.
- **`src/presentation/desktop/DesktopShell.tsx`**: Mounted `<ActivityApp workstationId={workstationId} />`.
- **`src/presentation/desktop/apps/ActivityApp.tsx`**: 4-tab desktop workspace — Active Mission, Opportunities, Career & Goals, Audit Log. Deep-linkable via `?app=activity&activityTab=*`.
- **`src/presentation/hud/ObjectiveTrackerHUD.tsx`**: Extended to sync with active `ActivityInstance` — renders activity title, objective checklist (complete/pending/failed), and technical rationale summary.

### Automated Test Suites

- **`tests/unit/simulation/cyber/ActivityDirectorM20.test.ts`** (197 lines, 8 tests): Eligibility gating, state transitions, objective satisfaction, idempotent settlement, abandonment cleanup, follow-up generation, duplicate prevention, dependency-unavailable recovery.
- **`tests/unit/presentation/desktop/ActivityApp.test.tsx`** (219 lines, 8 tests): Render states, start/resolve/abandon flows, skill matrix, audit log, tab persistence, URL deep-linking.
- **`tests/unit/presentation/hud/ObjectiveTrackerHUD.test.tsx`** (141 lines, 7 tests including M20): HUD sync to active activity, objective state rendering, null-activity graceful handling.
- **`tests/unit/persistence/PersistenceRoundTrip.test.ts`**: Extended to verify `activityDirector` state survives a full `saveGame` → `loadGame` cycle without data loss or duplicate reward application.

### Screenshot Automation

- **`scripts/capture-m20-screenshots.mjs`** (181 lines): Headless Chrome capture script (`--headless=new`, `--disable-gpu`, 1440×900). Auto-detects or spawns Vite dev server. 6 captures at 4.5s virtual-time budget.

---

## 3. Authored Activity Catalogue

| Activity ID | Type | Source Milestone | Prerequisite |
|:---|:---|:---|:---|
| `act_aster_m14_initial` | Story | M14 Narrative | None (new player entry) |
| `act_aster_m14_forensic_follow` | Story | M14 Narrative | M14 initial arc complete |
| `act_m16_marina_nexus` | Investigation | M16 Network Analysis | M14 complete |
| `act_m17_cedarline_assessment` | Red Team | M17 Authorized Assessment | M16 + Career Lv 2 |
| `act_m18_broad_street_defense` | Defensive | M18 Blue/Purple Team | M16 complete |
| `act_blue_broad_street_triage` | Defensive | M18 SOC | M18 defensive setup |
| `act_m19_balogun_pos_audit` | Bounty | M19 Contract | Career Lv 1 |
| `act_skill_network_fundamentals` | Career Dev | Director | Always available |
| `act_skill_threat_intel` | Career Dev | Director | M16 started |

---

## 4. Activity Director Scoring Model

| Factor | Weight | Source |
|:---|:---:|:---|
| Story urgency (active narrative arc) | 40 | `narrativeState` arc status |
| Career level match | 25 | `player.careerLevel` vs `minCareerLevel` |
| Skill domain alignment | 20 | Player's relevant skill vs activity skill path |
| Recency (avoid immediate repetition) | 10 | Last 3 entries in `completedHistory` |
| Time-sensitivity | 5 | Activity `hasDeadline` flag |

Presentation tiers: **Primary** (story/urgent) · **Recommended** (career-relevant) · **Optional** (skill/exploration) · **Time-Sensitive** (deadline-flagged). Director enforces max 2 primary objectives simultaneously and deduplicates against completed history and active activity.

---

## 5. Career Skill Matrix (9 Skills)

| Skill | Connected System |
|:---|:---|
| `networkAnalysis` | M16 Packet Lens |
| `threatIntelligence` | M16 IOC Registry |
| `defensiveOps` | M18 SOC / Detection |
| `offensiveSecurity` | M17 Red Team |
| `forensicInvestigation` | M14/M17 Evidence Vault |
| `incidentResponse` | M18 Purple Team |
| `contractManagement` | M19 Bounty Hub |
| `technicalAnalysis` | M14–M19 (general) |
| `professionalCommunication` | M14/M19 Reporting |

---

## 6. Simulation Safety Boundary

- Zero host OS commands or processes invoked.
- Zero external HTTP/WebSocket calls for gameplay simulation.
- Zero hardcoded secrets, API keys, or passwords.
- All financial rewards use non-negative integer kobo (`rewardKobo`).
- All organizations and targets are fictional Lagos Island entities.

---

## 7. Headless Browser Verification

| File | Scene | Size |
|:---|:---|---:|
| `01_m20_active_mission.png` | Active Mission — objectives, rationale, resolution controls | 868 KB |
| `02_m20_opportunity_director.png` | Opportunity Director — prioritized feed, scoring rationale | 883 KB |
| `03_m20_career_progression_goals.png` | Career & Goals — skill matrix, long-term milestones | 857 KB |
| `04_m20_audit_history_ledger.png` | Audit Log — settlement ledger, reward history | 856 KB |
| `05_m20_hud_objective_tracker.png` | HUD Objective Tracker — real-time sync | 151 KB |
| `06_m20_integrated_ecosystem.png` | Integrated Ecosystem — story, bounties & defense unified | 855 KB |

---

## 8. Acceptance Criteria Verification

| Criterion | Status |
|:---|:---:|
| Shared activity & objective framework implemented | ✅ |
| Activity director evaluates real game state | ✅ |
| Transparent, testable prioritization | ✅ |
| Duplicate/invalid opportunity prevention | ✅ |
| Idempotent settlement — no double rewards on reload | ✅ |
| Integration with M14/M16/M17/M18/M19 adapters | ✅ |
| ObjectiveTrackerHUD synced to active activity | ✅ |
| 9 gameplay-connected career skills | ✅ |
| Long-term goal tracking with visible progression | ✅ |
| Audit log with timestamped settlement records | ✅ |
| Persistence roundtrip preserves activity director state | ✅ |
| All controls perform advertised actions (no decorative buttons) | ✅ |
| 23 M20-specific tests passing | ✅ |
| 954/954 total tests; 0 regressions | ✅ |
| `tsc --noEmit` exits 0 | ✅ |
| 6 headless browser screenshots captured | ✅ |
| Zero simulation safety boundary violations | ✅ |
