# Cyberlife Episode Delivery Framework Architecture Design

## 1. Executive Summary & Architectural Alignment

This document specifies the architecture for the **Episode Delivery Framework** in Cyberlife. The framework introduces data-driven episode progression, diegetic storytelling channels (terminal boot title cards, incident portal dispatch tickets, encrypted Onion Chat pings, urgent hacker VoIP calls, file drops, encrypted journal entries, and blackout beats), and dual guidance modes (`Guided` vs `Immersive`).

Following Cyberlife's strict architectural boundary:
- **Simulation Layer (`src/simulation`)**: Owns authoritative episode state, beat progression, trigger evaluation, deterministic clock-skips, and file mutations. It emits domain events and is 100% save-safe and replayable.
- **Presentation Layer (`src/presentation`)**: Renders visual and audio manifestations (title cards, screen brownout flicker, Web Audio inverter tone, journal app, notification toasts). It dispatches commands to the simulation and never mutates story state directly.
- **Persistence Layer (`src/application/persistence`)**: Serializes and deserializes episode state alongside core simulation state with zero data loss and schema verification.
- **Zero New Dependencies**: Uses existing React, Three.js, Web Audio API, and TypeScript infrastructure.

---

## 2. Current Architecture Inspection

### 2.1 Story State & Narrative Engine (`src/simulation/narrative`)
- Story state is maintained in `SimulationState.narrative` (`NarrativeState`), tracking arcs, chapters, missions, objective IDs, factions, evidence vault items, and conclusions.
- Mutations are driven by domain commands in `narrativeCommandHandler.ts` (`StartStoryArc`, `AdvanceStoryChapter`, `ActivateNarrativeMission`, `CompleteNarrativeObjective`, etc.).
- Global conditions are stored in `SimulationState.flags` (`Record<string, WorldFlagValue>`), validated by `worldFlagsSystem.ts`.
- Validation is handled by `narrativeValidator.ts` (`validateNarrativeDataCatalog`), checking integrity, uniqueness, and dangling references.

### 2.2 Missions & Activity Director (`src/simulation/activities`)
- Missions operate on two layers:
  1. Primary procedural missions like the Aster Incident (`SimulationState.mission`).
  2. Opportunity & Activity Director (`SimulationState.activityDirector`), which evaluates prerequisites (`requiredFlags`, `careerPath`, `minCareerLevel`), scores activities, and manages lifecycle states (`AVAILABLE`, `ACTIVE`, `COMPLETED`, `FAILED`).
- Guidance is currently anchored by `ObjectiveTrackerHUD.tsx` displaying active goals, hints, and instructions.

### 2.3 Simulation Clock (`src/simulation/core`, `src/simulation/time`)
- Clock state is tracked in `SimulationState.time`: `simulationTimeSeconds` (monotonic) and `calendar` (`CalendarTime` with ISO timestamp, date, time string, day of week, hours, minutes, seconds).
- Advanced via `AdvanceSimulationTimeCommand`: calculates new calendar time deterministically from `initializedAtIso` and fires due scheduled timers (`SimulationTimerState`).
- The clock supports arbitrary discrete jumps (e.g., jumping 90–180 minutes during a blackout lost-time beat).

### 2.4 Virtual Filesystem (`src/simulation/cyber/filesystem`)
- `VirtualFilesystemManager` provides an in-memory, deterministic Unix-like file hierarchy (`/`, `/home/analyst`, `/mnt/evidence`, `/var/log`, `/opt/tools`).
- Supports `readFile`, `writeFile`, `listDirectory`, `getEntry`, `exists`, `reset`. Paths starting with `~` resolve to `/home/analyst`.
- Blackout mutations and file drops require deterministic directory creation (e.g. `/home/analyst/.vault`, `/tmp`, `/evidence`) and file writing through simulation commands.

### 2.5 Persistence & Save System (`src/application/persistence`)
- `SaveManager` captures full `SimulationState`, strips transient UI state (`activeDialogue`), validates domain invariants via `validateSimulationState`, computes a SHA-256 checksum, and saves atomically.
- Restoring verifies checksum, validates schema (`validateSaveRecord`), reconciles timers, and calls `SimulationEngine.loadState`.
- Adding `episode?: EpisodeDirectorState` to `SimulationState` automatically participates in the existing save/load lifecycle.

---

## 3. Hooking the Framework In

```
                             ┌───────────────────────────────────────┐
                             │       Episode Definition (Data)       │
                             │  (id, title, hash, beats[], triggers) │
                             └───────────────────┬───────────────────┘
                                                 │
                                                 ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ SIMULATION LAYER (Authoritative, Deterministic, Headless)                              │
│                                                                                        │
│  SimulationEngine.dispatch(command)                                                    │
│    │                                                                                   │
│    ├── AdvanceEpisodeBeatCommand ──► EpisodeDirectorEngine                             │
│    ├── CompleteEpisodeBeatCommand        │                                             │
│    ├── TriggerBlackoutCommand            ├─► Evaluates triggers (clock, flag, etc.)    │
│    ├── UnlockJournalEntryCommand         ├─► Applies effects (flags, standing, files)  │
│    └── AdvanceSimulationTime             └─► Updates EpisodeDirectorState in state     │
│                                                          │                             │
│                                                          ▼                             │
│                                              SimulationEvent Published                 │
│                                              (EPISODE_BEAT_TRIGGERED, etc.)            │
└──────────────────────────────────────────────────────────┬─────────────────────────────┘
                                                           │
                                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER (Pure Rendering & UI Interaction)                                   │
│                                                                                        │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────────────┐  │
│  │   TitleCardOverlay   │  │   BlackoutOverlay    │  │   JournalApp & 'journal' CLI │  │
│  │ (Boot typewriter,    │  │ (Flicker, brownout,  │  │ (Reads ~/.vault/journal.enc  │  │
│  │  UTC+1, SHA256 hash) │  │  1kHz inverter tone) │  │  displays unlocked claims)   │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────────────────┘  │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────────────┐  │
│  │     IncidentApp      │  │     OnionChatApp     │  │      HackerCallOverlay       │  │
│  │ (TKT-2026-xxxx tabs) │  │ (Typing delays)      │  │ (VoicePlayer + oscilloscope) │  │
│  └──────────────────────┘  └──────────────────────┘  └──────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Guidance Mode: 'Guided' (HUD checklist) vs 'Immersive' (Diegetic + Mentor Pings) │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Episode Data Model (`src/simulation/narrative/episodeTypes.ts`)
- **`EpisodeDefinition`**:
  - `id`: string (e.g. `'ep01_triage_init'`)
  - `title`: string (e.g. `'ep01_triage_init.pcap'`)
  - `hash`: string (SHA-256 fingerprint)
  - `season`: number (1)
  - `episodeNumber`: number (1)
  - `synopsis`: string
  - `beats`: `EpisodeBeatDefinition[]`
- **10 Beat Types**:
  1. `titleCard`: Boot banner, UTC+1 timestamp, episode hash, typewriter title.
  2. `ticket`: Cedarline dispatch ticket (`TKT-2026-xxxx`) into Incident Portal.
  3. `onionMessage`: Encrypted ping in Onion Chat with contact ID and typing delay.
  4. `call`: Urgent hacker VoIP call pop-up with VoicePlayer dialogue.
  5. `fileDrop`: File written to virtual filesystem with notification badge.
  6. `journalEntry`: Unlocks encrypted journal entry in `~/.vault/journal.enc`.
  7. `blackout`: Brownout shader flicker, 1 kHz inverter alarm, lost-time clock skip, and filesystem/flag mutations.
  8. `dayCase`: Authorized daytime enterprise ticket case at Cedarline.
  9. `nightJob`: Gray-zone nighttime research/bounty investigation.
  10. `debrief`: Technical debrief, ATT&CK mapping, and faction consequences.
- **Triggers**:
  - `clockTime`: Hour and minute in simulation calendar.
  - `flag`: Required world flag value.
  - `previousBeatFinished`: Prior beat ID completion.
  - `appOpened`: Desktop app ID opened.
  - `manual`: Direct command.
- **Effects**:
  - `setFlags`: Sets world flags.
  - `factionStandingDeltas`: Updates faction reputation.
  - `fileDrops`: Injects files into `virtualFilesystem`.
  - `clockSkipMinutes`: Fast-forwards simulation clock.
  - `unlockJournalEntryId`: Reveals journal entry.

### 3.2 EpisodeDirector (`src/simulation/narrative/episodeDirector.ts`)
- Evaluates triggers on simulation ticks and command dispatches.
- Maintains `EpisodeDirectorState` in `SimulationState`:
  - `activeEpisodeId: string | null`
  - `activeBeatId: string | null`
  - `completedBeatIds: string[]`
  - `unlockedJournalEntryIds: string[]`
  - `activeTickets: EpisodeTicket[]`
  - `deliveredMessages: EpisodeMessage[]`
  - `pendingVisualEffects: EpisodeVisualEffect[]`
  - `guidanceMode: 'Guided' | 'Immersive'`
- Fully deterministic and saved/loaded seamlessly.

### 3.3 Diegetic Guidance System
- In `'Guided'` mode: The existing `ObjectiveTrackerHUD` checklist banner is displayed.
- In `'Immersive'` mode: The checklist banner is hidden. Blessing sends subtle mentor guidance messages via Onion Chat if the player is stalled or opens relevant apps.

### 3.4 Encrypted Journal System
- Backed by `~/.vault/journal.enc` in the virtual filesystem.
- Entries store: `id`, `timestamp`, `title`, `text`, and `claims[]` (`claimId`, `statement`, `truthfulness`, optional `evidenceRef`).
- Addressed strictly to the player (`you`), gender-neutral.
- Accessible via:
  1. New desktop app: `JournalApp` (`appId: 'journal'`).
  2. Terminal command: `journal` in `TerminalCommandRegistry.ts`.

### 3.5 Blackout Beat
- Clock skip: Simulation command dispatches `AdvanceSimulationTime` by the lost-time duration.
- Mutations: Simulation commands write files (e.g. `/tmp/nexus_handshake_dump.pcap`), mutate flags, and log entries.
- Presentation: `BlackoutOverlay` triggers a CSS flicker brownout, screensaver dim, and invokes `AudioManager.synthesizeInverterAlarm(duration)`. Respects `reduceMotion`.

---

## 4. Verification Plan
- **Unit Tests**:
  - Episode director beat advancement, trigger evaluation, determinism, and save/load integrity.
  - Validator checks for orphaned beats, invalid flags, missing IDs.
  - Journal entry unlock filtering and claims rendering.
  - Blackout lost-time simulation command and file mutations.
- **Component Tests**:
  - Title card typewriter timing, key-skip, and sound triggers.
  - JournalApp reader and claims display.
  - BlackoutOverlay respect for `reduceMotion`.
- **Automated Screenshots**:
  - Title card, ticket arrival in Incident Portal, Onion Chat ping, JournalApp, and Blackout brownout flicker.
