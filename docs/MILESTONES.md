# Cyberlife — Milestone Roadmap & Definition of Done

This document establishes the official sequential milestone roadmap for Cyberlife. 

### Milestone Gating Policy
1. Milestones are strictly sequential. Work on Milestone $N+1$ may not commence until Milestone $N$ passes 100% of its Acceptance Criteria, Required Validation, and Definition of Done.
2. Scope creep is prohibited. Features listed under **Explicit Exclusions** must not be pulled into an active milestone.
3. Every milestone deliverable must be verified in the codebase with automated tests or smoke-test procedures.

---

## Milestone Index
- [M0 — Repository Foundation & Documentation](#m0--repository-foundation--documentation)
- [M1 — Bootable Application Foundation](#m1--bootable-application-foundation)
- [M2 — 3D Neighborhood & Player Controller](#m2--3d-neighborhood--player-controller)
- [M2.5 — Lagos Island Environment](#m25--lagos-island-environment)
- [M3 — Simulation Engine & State Management](#m3--simulation-engine--state-management)
- [M4 — Interaction System & Hybrid Desktop](#m4--interaction-system--hybrid-desktop)
- [M5 — Cybersecurity Simulation & Tools](#m5--cybersecurity-simulation--tools)
- [M6 — Aster Incident Mission](#m6--aster-incident-mission)
- [M7 — NPCs & Persistent World Consequences](#m7--npcs--persistent-world-consequences)
- [M8 — Career, Economy, & Life Simulation](#m8--career-economy--life-simulation)
- [M9 — Persistence & Recovery](#m9--persistence--recovery)
- [M10 — Onboarding & Learning](#m10--onboarding--learning)
- [M11 — Quality & Release Readiness](#m11--quality--release-readiness)
- [M12 — Workstation & Living World Immersion](#m12--workstation--living-world-immersion)
- [M13 — Cybersecurity Arsenal Audit, Human Attack Surface, Living City & Asset Provenance](#m13--cybersecurity-arsenal-audit-human-attack-surface-living-city--asset-provenance)
- [M14 — Narrative, Factions, World Bible & Branching Story](#m14--narrative-factions-world-bible--branching-story)
- [M15 — Original Identity, Music, Ambience & Audio Systems](#m15--original-identity-music-ambience--audio-systems)
- [M16 — Network Analysis & Threat Intelligence](#m16--network-analysis--threat-intelligence)
- [M17 — Red Team & Authorized Assessment Workflows](#m17--red-team--authorized-assessment-workflows)
- [M18 — Blue Team & Purple Team Workflows](#m18--blue-team--purple-team-workflows)
- [M19 — Bounty Hunting & Contracts](#m19--bounty-hunting--contracts)
- [M20 — Gameplay Loop, Player Progression, Career Structure & Activity Director](#m20--gameplay-loop-player-progression-career-structure--activity-director)
- [M21 — Social Engineering, Physical Security & Human-Centered Missions](#m21--social-engineering-physical-security--human-centered-missions)
- [M22 — Living City, Meaningful Locations, NPC Routines & World Simulation](#m22--living-city-meaningful-locations-npc-routines--world-simulation)
- [M23 — Asset Acquisition, Integration, Visual Quality & Additional Professions](#m23--asset-acquisition-integration-visual-quality--additional-professions)
- [M24 — Integrated Missions, Cross-System Validation & Release Readiness](#m24--integrated-missions-cross-system-validation--release-readiness) *(Completed & Verified)*

---

## M0 — Repository Foundation & Documentation

- **Purpose**: Inspect the workspace, establish the directory structure, establish architectural contracts, and define development guidelines so all subsequent engineering is built upon an unshakeable foundation.
- **Scope**:
  - Workspace inspection and environment verification.
  - Project directory layout across presentation, application, simulation, domain, content, and tests.
  - Core project documentation (`README.md`, `CONTRIBUTING.md`, `docs/VISION.md`, `docs/ARCHITECTURE.md`, `docs/MILESTONES.md`, `docs/DEVELOPMENT_GUIDE.md`, `docs/SIMULATION_RULES.md`, `docs/ACCEPTANCE_CRITERIA.md`, `docs/PLAYER_GUIDANCE.md`, and initial ADRs).
  - Version control configurations (`.gitignore`, `.editorconfig`).
- **Dependencies**: None.
- **Deliverables**:
  - Validated repository structure with boundary documentation.
  - Root `README.md` containing all thirteen required project specifications.
  - Architectural specifications detailing layer isolation, command-event lifecycles, and headless simulation boundaries.
  - Player guidance specification ([PLAYER_GUIDANCE.md](file:///Users/protector/Documents/projects/cyberlife/docs/PLAYER_GUIDANCE.md)) defining 8-part instruction format, 3 assistance tiers, terminal teaching contract, and Aster walkthrough.
  - Milestone roadmap with explicit gating and verification criteria.
  - Initial Architecture Decision Records (ADR-001, ADR-002, ADR-003).
- **Acceptance Criteria**:
  - [x] Repository initialized with clean Git tracking.
  - [x] All required directories created with boundary documentation explaining responsibilities and constraints.
  - [x] Non-negotiable simulation safety boundary codified in documentation and ADRs.
  - [x] Architectural separation between Three.js rendering, React UI, and authoritative headless simulation documented.
  - [x] Player guidance contract and accessibility standards fully documented without premature M0 runtime code.
  - [x] Milestone roadmap established from M0 to M11 with explicit Definition of Done.
- **Explicit Exclusions**:
  - Application runtime code (Vite, React components, Three.js canvas setup deferred to M1).
  - Runtime implementation of tutorial or guidance components (deferred to M4, M6, M10).
  - 3D asset imports or graphics shaders.
  - Live database integrations.
- **Required Validation**:
  - File presence check for all documented specifications and directory boundaries.
  - Verification of `.gitignore` preventing accidental commits of secrets and dependencies.
- **Definition of Done**:
  - M0 documentation, player guidance contracts, and repository structure committed to the `main` branch. Developer review confirms complete clarity for M1 kickoff.

---

## M1 — Bootable Application Foundation *(Completed)*

- **Status**: Completed and Verified.
- **Purpose**: Establish a functioning, verified TypeScript, React, Vite, and Three.js application shell with strict type checking, linting, testing pipelines, and WebGL rendering capability.
- **Scope**:
  - Project manifest initialization (`package.json`) with pinned dependencies.
  - Vite build and local development server configuration.
  - TypeScript configuration (`tsconfig.json`) with strict type checking enabled (`strict: true`, `noImplicitAny: true`).
  - ESLint, Prettier, and code quality linting configuration.
  - Vitest test runner configuration for unit and headless testing.
  - Basic Three.js canvas mount inside a React root shell with a basic render loop and viewport resizing.
- **Dependencies**: M0.
- **Deliverables**:
  - `package.json` with scripts: `dev`, `build`, `preview`, `typecheck`, `lint`, `test`, `test:coverage`.
  - Configured `vite.config.ts`, `tsconfig.json`, and `.eslintrc.cjs`.
  - Minimal root `App.tsx` rendering a Three.js WebGL viewport alongside a React HUD container.
  - Automated smoke test verifying the app shell boots and renders without console errors.
- **Acceptance Criteria**:
  - `npm run dev` starts development server without compilation warnings.
  - `npm run build` completes production build with zero TypeScript or asset errors.
  - `npm run typecheck` passes with zero diagnostics.
  - `npm run test` executes successfully and reports passing test suite.
  - WebGL viewport mounts and renders a basic test scene at 60 FPS on standard desktop browsers.
- **Explicit Exclusions**:
  - 3D neighborhood geometry and complex shaders (deferred to M2).
  - Virtual desktop applications or terminal emulation (deferred to M4).
  - Simulation state engine implementation (deferred to M3).
- **Required Validation**:
  - CI/local script execution: verify `npm run lint && npm run typecheck && npm run test && npm run build` exit code 0.
- **Definition of Done**:
  - Application builds cleanly in production mode; test runner passes in headless environment; canvas renders without WebGL warnings.

---

## M2 — 3D Neighborhood & Player Controller *(Completed)*

- **Status**: Completed and Verified.
- **Purpose**: Build the explorable, compact 3D urban neighborhood with smooth character movement, collision detection, switchable camera modes, and spatial interaction zones.
- **Scope**:
  - Compact urban neighborhood block (street, sidewalk, Player Apartment, Cedarline Services HQ, Neighborhood Hub, streetlights, props).
  - First-person and third-person camera system with smooth toggle (`V` key or HUD toggle button).
  - Responsive character controller (WASD / Arrow keys movement, normalized diagonal velocity, collision resolution with wall-sliding).
  - Spatial interaction trigger zones registering player proximity to interactable entities (doors, entrance markers, noticeboards).
  - Seamless location transitions between outdoor block and indoor environments with spawn memory.
- **Dependencies**: M1.
- **Deliverables**:
  - Modular 3D scene environment in `src/presentation/world/` (`WorldEnvironment.ts`, `Building.ts`, `InteractableMarker.ts`, `PlayerAvatar.ts`).
  - `WorldCameraController` supporting first-person (pointer lock, pitch clamp ±78°) and third-person follow camera with avatar visibility toggle.
  - `PlayerController` with collision bounds, wall-sliding resolution, frame-rate independent delta time, blur reset, and input isolation.
  - `CollisionWorld` implementing 2D circle-vs-AABB intersection tests, boundary clamping, and sliding resolution.
  - `InteractionRegistry` for proximity queries and deterministic nearest-target resolution.
  - `LocationTransitionController` coordinating indoor/outdoor transitions and spawn memory.
  - Accessible HUD components (`MovementHelp.tsx`, `InteractionPrompt.tsx`, `StatusOverlay.tsx`).
- **Acceptance Criteria**:
  - [x] Player can smoothly navigate the neighborhood without falling through geometry or clipping through solid walls.
  - [x] Camera toggles between 1st person and 3rd person seamlessly with preserved orientation and position.
  - [x] Entering an interaction volume displays a clear HUD prompt (e.g., "[E] Enter Cedarline Services", "[E] Enter Player Apartment", "[E] Read Noticeboard").
  - [x] Location transitions between outdoor neighborhood and interior room function reliably with safe spawn placement.
  - [x] Sustained 60 FPS performance on standard integrated graphics hardware.
- **Explicit Exclusions**:
  - Complex character facial animations or ragdoll physics (deferred to later milestones).
  - Large procedural city generation (neighborhood is compact and authored).
  - In-depth dialogue execution or cyber terminals (deferred to M4 and M5).
- **Required Validation**:
  - Automated test suite (13 test suites, 57 unit/integration tests passing with 0 failures).
  - Browser testing validating canvas mount, movement, camera switching, interaction prompt trigger, and dialog activation.
- **Definition of Done**:
  - Neighborhood geometry is complete, walkable, bounded, and triggers interaction prompts reliably. All acceptance criteria verified in test suite and browser smoke run.

---

## M2.5 — Lagos Island Environment *(Completed)*

- **Status**: Completed and Verified.
- **Purpose**: Transform the generic procedural urban neighborhood into an authentic, explorable slice of historic Lagos Island, Nigeria.
- **Scope**:
  - Coherent street layout: Broad Street commercial spine, Marina waterfront boulevard, Balogun / Idumota market street, and Tinubu Square civic plaza.
  - Multi-style architectural palette: Afro-Brazilian heritage buildings (arched windows, decorative balconies, warm ochre plaster), commercial corporate towers (window ribbons, chillers, antenna masts), and market storefronts (roll-down shutters, striped awnings).
  - Authentic environmental details: parked yellow Danfo minibus with twin black stripes, Balogun market stalls with display crates, concrete utility poles with overhead electrical cables, official Lagos State green/white street signs, rooftop GeePee water tanks, and tropical royal palm trees.
  - Marina waterfront with concrete seawall, safety railings, mooring bollards, and deep blue Lagos Lagoon waters.
  - Tinubu Square central fountain & obelisk monument, perimeter benches, and Community Noticeboard.
  - 100% preservation of M2 movement, wall-sliding collision physics, camera modes, and interior room transitions.
- **Dependencies**: M2.
- **Deliverables**:
  - Upgraded `WorldEnvironment.ts` with complete Lagos Island street network and procedural district generation.
  - `src/presentation/world/entities/Building.ts` supporting `AFRO_BRAZILIAN`, `COMMERCIAL_TOWER`, and `MARKET_STOREFRONT` styles.
  - `src/presentation/world/entities/LagosProps.ts` procedural generators for Danfo bus, market stalls, utility poles, street signs, seawall, water tanks, and Tinubu monument.
  - Expanded world bounds (`[-38, 38] × [-38, 38]`) and spawn configuration in `worldConfig.ts`.
  - Realistic tropical daylighting with warm sunlight and coastal sky in `WorldSceneManager.ts`.
- **Acceptance Criteria**:
  - [x] Initial scene visibly reads as a dense, locally grounded Lagos Island district rather than a generic Western block.
  - [x] Broad Street, Marina Road, Balogun Market Lane, and Tinubu Square form a coherent, navigable urban layout.
  - [x] Market-inspired area features distinct storefronts, colorful awnings, stalls, and parked Danfo minibus.
  - [x] Marina waterfront and Lagos Lagoon are visually distinct with seawall, safety railings, and palm trees.
  - [x] Player can walk throughout the district with robust collision blocking and wall-sliding on all buildings and props.
  - [x] Player Apartment and Cedarline Services HQ entrances and transitions remain functional in both directions.
  - [x] Tinubu Square Community Noticeboard interaction functions with localized bulletin content.
  - [x] Dual-mode camera (1st and 3rd person) functions seamlessly across the district.
  - [x] 100% pass rate across automated tests (16 test files, 72 unit/component tests, >93% coverage).
- **Explicit Exclusions**:
  - Full metropolitan Lagos generation (scope is compact historic Lagos Island slice).
  - Headless authoritative simulation engine (deferred to M3).
  - Vehicle traffic simulation or pedestrian AI (deferred to future milestones).
- **Required Validation**:
  - Automated test suite (72 unit and component tests passing with 0 errors).
  - Browser smoke testing verifying rendering, Danfo minibus, Balogun market, noticeboard, and interior transitions.
- **Definition of Done**:
  - Lagos Island environment is complete, walkable, authentic, and fully integrated with existing player movement, collision, camera, and interaction systems.

## M3 — Simulation Engine & State Management *(Completed)*

- **Status**: Completed and Verified.
- **Purpose**: Build the authoritative, deterministic, headless game state machine that coordinates world, player attributes, currency, inventory, world flags, and scheduled timers without relying on DOM, WebGL, or Three.js.
- **Scope**:
  - Deterministic simulation clock and calendar calculation (elapsed seconds, civil calendar time `08:00 AM, Monday, Oct 12, 2026`).
  - Authoritative duration timers evaluated during clock advancement with deterministic ordering (`dueTime`, `creationSequence`, `timerId`) without browser `setTimeout`.
  - Strictly typed, versioned, immutable state model (`SimulationState`) covering metadata, time, player, inventory, world flags, and timers.
  - Non-negative integer kobo currency model (`Money`) eliminating floating-point math inaccuracies.
  - Synchronous command dispatch with atomic pre-validation, invariant checks, and transition execution for 11 commands.
  - Consistent no-op policy returning `isNoOp: true`, preserving revision, and emitting no events when commands produce zero state delta.
  - Monotonically indexed typed domain events emitted exclusively for accepted state changes with isolated listener error handling.
  - React application integration (`SimulationProvider`, `useSimulation`, `useOptionalSimulation`) and developer verification drawer (`DevSimulationDrawer`).
- **Dependencies**: M1.
- **Deliverables**:
  - `SimulationEngine` class in `src/simulation/SimulationEngine.ts`.
  - Domain currency value object `src/domain/common/Money.ts` and error hierarchy `src/domain/errors/DomainError.ts`.
  - Core state definitions, initial state creation, invariants, and freezing utilities in `src/simulation/core/`.
  - Pure subsystems in `src/simulation/systems/` (`playerSystem.ts`, `inventorySystem.ts`, `worldFlagsSystem.ts`).
  - Command definitions and pure reducer in `src/simulation/commands/` (`commandHandler.ts`).
  - Domain event definitions and factory in `src/simulation/events/`.
  - Simulation clock and timer manager in `src/simulation/time/`.
  - React provider and hooks in `src/application/simulation/`.
  - HUD integration and `DevSimulationDrawer.tsx` in `src/presentation/hud/`.
  - Comprehensive unit and integration test suite (194 tests across 28 test files).
- **Acceptance Criteria**:
  - [x] Simulation state advances deterministically given an initial seed and a sequence of commands.
  - [x] Invalid commands are rejected with stable error codes without corrupting the state tree or emitting success events.
  - [x] Simulation layer has zero dependencies on Three.js, React, or browser DOM.
  - [x] Unit tests execute entirely in headless Node.js / Vitest environment.
  - [x] Invariants strictly enforce non-negative integer currency, bounded player attributes [0, 100], and valid inventory stacking.
- **Explicit Exclusions**:
  - Three.js visual bindings inside simulation (rendering listens to events/state; simulation knows nothing of rendering).
  - Virtual desktop and window manager (deferred to M4).
  - Simulated cyber terminal tools, IAM, and SIEM logs (deferred to M5).
  - Aster incident mission graph (deferred to M6).
- **Required Validation**:
  - Headless unit test suite with $\ge 90\%$ branch coverage across simulation reducers and command handlers (`commandHandler.ts` at 93.18%, `invariants.ts` at 100%, `systems/` at 96-100%).
  - Full project check passing: `typecheck`, `test`, `lint`, `format:check`, `build`.
- **Definition of Done**:
  - State machine runs headlessly; commands update state reliably; domain events are properly received by subscribers; application HUD and dev drawer reflect simulation state accurately.

---

## M4 — Interaction System & Hybrid Desktop *(Completed)*

- **Status**: Completed and Verified.
- **Purpose**: Implement the dual-mode interaction layer: in-world workstation triggers, the high-fidelity virtual desktop with window management, a sandboxed command-line terminal, discoverable applications, and foundational player guidance surfaces.
- **Scope**:
  - In-world workstation interactables registered in Cedarline lobby and Apartment interior (`interact_cedarline_workstation`, `interact_apartment_workstation`) with proximity prompt `access Cedarline corporate terminal [E]`.
  - Seamless desktop modal transition with 3D player movement and camera controls isolated (`isInputDisabled = true`, `WorldCameraController.setEnabled(false)`, `exitPointerLock()`).
  - Virtual desktop environment (`DesktopShell`): draggable window manager, taskbar with Start menu, running window tabs, live M3 simulation clock, green `Simulated OS` host isolation indicator, and desktop watermark.
  - Multi-window management (`useWindowManager`): opening, minimizing, restoring, focusing (z-index stacking), dragging within safe boundaries, single-instance application policy, and empty desktop state.
  - Headless terminal command parser and registry (`src/simulation/cyber/terminal/`):
    - Explicit commands: `help`, `clear`, `whoami`, `date` (reading M3 simulation clock), `status` (read-only node specs), `history`.
    - Sanitized tokenization: whitespace trimming, case-insensitivity, argument quote extraction.
    - Security boundaries: zero host execution, shell injection prevention (`;`, `|`, `&`, `>`, `<` rejected with friendly guidance).
    - Synchronous deterministic evaluation using `TerminalExecutionContext`.
  - Discoverable Core Applications:
    - `TerminalApp`: scrollable synthetic stream, Up/Down arrow history, quick command suggestion chips (`[help]`, `[whoami]`, `[date]`, `[status]`, `[history]`, `[clear]`), and beginner hint banner.
    - `FieldGuideApp`: multi-tab reference book (Basics, Command Reference, Core Concepts, and Safety Guarantee).
    - `SystemInfoApp`: read-only virtual node specifications synchronized with M3 state revision and simulation clock.
    - `NotesApp`: IT onboarding memo and session scratchpad.
  - Accessible Player Guidance:
    - First-time desktop orientation modal explaining fictional sandbox nature and safety guarantee.
    - `ObjectiveTrackerHUD` with 8-part task guidance structure and `[Repeat Instructions]` toggle.
- **Dependencies**: M2, M3.
- **Deliverables**:
  - Headless terminal subsystem in `src/simulation/cyber/terminal/` (`TerminalCommandParser.ts`, `TerminalCommandRegistry.ts`, `types.ts`, `index.ts`).
  - Virtual desktop presentation subsystem in `src/presentation/desktop/` (`DesktopShell.tsx`, `Taskbar.tsx`, `WindowFrame.tsx`, `useWindowManager.ts`, `types.ts`, `apps/TerminalApp.tsx`, `apps/FieldGuideApp.tsx`, `apps/SystemInfoApp.tsx`, `apps/NotesApp.tsx`, `index.ts`).
  - Workstation interactables, triggers, and input isolation in `src/presentation/world/` (`PlayerController.ts`, `WorldCameraController.ts`, `WorldEnvironment.ts`, `WorldSceneManager.ts`, `WorldViewport.tsx`).
  - Enhanced `ObjectiveTrackerHUD.tsx` in `src/presentation/hud/`.
  - Complete glassmorphism desktop theme in `src/styles/index.css`.
  - Comprehensive automated test suite: 239 tests passing across 33 test files (0 failures).
- **Acceptance Criteria**:
  - [x] Approaching workstation desk in 3D world shows contextual prompt; pressing `E` launches virtual desktop.
  - [x] Pressing `Escape` or clicking `Exit Desktop [Esc]` cleanly closes desktop and restores player movement and camera controls.
  - [x] Typing into terminal never moves the 3D player avatar or rotates the camera.
  - [x] Virtual desktop windows can be opened, dragged, minimized, restored, focused, and closed without off-screen clipping.
  - [x] Single-instance application policy focuses existing window on duplicate launch request.
  - [x] Terminal executes safe initial commands (`help`, `clear`, `whoami`, `date`, `status`, `history`).
  - [x] Terminal `date` outputs exact M3 simulation calendar time (`08:00 AM, Monday, Oct 12, 2026`).
  - [x] Terminal strictly rejects host breakout and shell operators (`|`, `;`, `&`, `>`, `<`) with friendly educational feedback.
  - [x] 1-click quick command suggestion chips allow instant command insertion.
  - [x] Terminal command history supports navigation via Up/Down arrow keys.
  - [x] Objective Tracker displays active numbered tasks following the 8-part standard format with `[Repeat Instructions]` toggle.
  - [x] Zero real host commands or external network traffic.
- **Explicit Exclusions**:
  - Real OS shell integration (strictly synthetic terminal).
  - Full suite of M5 cybersecurity tools (`nmap`, `curl`, `grep`, `siem-query` deferred to M5).
  - Complete Aster Incident mission graph (deferred to M6).
- **Required Validation**:
  - Headless parser unit tests asserting valid, invalid, empty, case-insensitive, and shell-operator commands (16/16 tests passing).
  - Window manager tests asserting open, close, minimize, restore, focus, and drag bounds (8/8 tests passing).
  - Terminal app component tests asserting input submission, output rendering, clear, and history (8/8 tests passing).
  - Desktop shell component tests asserting welcome banner, launch, taskbar, and escape key handling (7/7 tests passing).
  - Workstation integration tests asserting proximity detection, desktop launch, and input isolation (6/6 tests passing).
  - Live in-browser visual verification confirming workstation approach, desktop launch, terminal execution, and exit back to 3D world.
- **Definition of Done**:
  - Player can approach workstation, press E to launch virtual desktop, manage multiple application windows, run safe simulated terminal commands reading M3 clock, navigate history, consult field guide, and return to the 3D world with all controls cleanly restored.

---

## M5 — Cybersecurity Simulation & Tools

- **Purpose**: Implement the simulated cyber ecosystem: virtual networks, identities, access control, SIEM logs, simulated AI agent execution, and command-line investigation tools designed with accessible teaching contracts.
- **Scope**:
  - Virtual network graph (IP addressing, subnets, routers, DNS, firewall rules).
  - Synthetic IAM (service accounts, user roles, API tokens, permission scopes).
  - Synthetic SIEM engine generating structured event logs (authentication, API calls, error spikes).
  - Simulated AI Agent model ("Aster"): system prompt template, tool-calling permissions, conversation log buffer.
  - Virtual terminal utilities: `nmap`, `curl`, `grep`, `cat`, `ssh`, `token-audit`, `siem-query`.
  - Terminal teaching contract: understandable output, comprehensive `--help` flags, and plain-language mistake recovery suggestions.
- **Dependencies**: M3, M4.
- **Deliverables**:
  - Cyber simulation subsystem in `src/simulation/cyber/`.
  - Synthetic terminal command evaluator with command allow-list parser and mistake-recovery suggestion engine.
  - Fictional Cedarline Services network and telemetry fixture data.
  - Interactive terminal tools supporting search, log filtering, and token inspection with clear tabular output.
- **Acceptance Criteria**:
  - All terminal commands operate exclusively on simulated data structures; zero host OS or external network calls.
  - Terminal commands produce consistent, reproducible output matching simulated network state.
  - Every tool supports a standard `--help` flag with clear explanations and example usage.
  - Entering an unrecognized command or typo provides an immediate constructive suggestion (e.g. *"Did you mean: token-audit?"*).
  - Simulated AI agent displays observable audit trail of tool invocations and token consumption.
- **Explicit Exclusions**:
  - Live LLM API calls (all AI behaviors are model-simulated deterministically).
  - Actual weaponized exploit payloads or real network penetration capabilities.
- **Required Validation**:
  - Unit tests for every terminal utility verifying parameter parsing, output generation, and `--help` text.
  - Security audit test verifying terminal evaluator rejects dangerous shell escape sequences.
- **Definition of Done**:
  - Player can open in-game terminal, query simulated servers, read logs, inspect tokens, and observe AI agent behavior safely with clear explanations.

---

## M6 — Aster Incident Mission

- **Purpose**: Build and integrate the complete end-to-end investigation mission: the Aster Incident at Cedarline Services, delivered as a fully guided, accessible experience.
- **Scope**:
  - End-to-end incident lifecycle: Alert -> Triage -> Evidence Preservation -> Root Cause Analysis -> Containment -> Remediation -> Validation -> Reporting -> Reward.
  - 10-step guided walkthrough implemented in accordance with [PLAYER_GUIDANCE.md](file:///Users/protector/Documents/projects/cyberlife/docs/PLAYER_GUIDANCE.md).
  - Evidence collection system: capturing log hashes, exporting token audit records, recording prompt injection vectors.
  - Containment action: revoking compromised IAM access token.
  - Remediation action: tightening AI agent tool permissions and updating prompt validation filters.
  - Incident verification engine: synthetic automated test running in-game to validate the threat is eradicated.
  - Structured Incident Report submission UI with automated grading and idempotent bounty delivery.
- **Dependencies**: M4, M5.
- **Deliverables**:
  - Mission definition file `public/content/missions/aster-incident.json` containing 8-part task definitions for all 10 stages.
  - Evidence Locker UI in virtual desktop with 1-click SHA-256 hash generation and verification.
  - Incident Containment & Remediation terminal actions.
  - Incident Report authoring application and submission evaluation logic.
- **Acceptance Criteria**:
  - A first-time player with zero technical background can successfully complete all 10 stages of the Aster Incident using guided assistance.
  - Every step provides explicit instructions: goal, why it matters, where to go, what to do, what to look for, and how to confirm success.
  - Evidence hashes match synthetic artifact integrity checks.
  - Containment action correctly isolates the compromised resource in the simulation state.
  - Report grading evaluates factual accuracy of player conclusions and issues appropriate bounty payout.
  - Re-submitting or reloading after completion does not grant duplicate payouts (idempotency).
- **Explicit Exclusions**:
  - Additional enterprise missions (focused exclusively on perfecting Aster Incident vertical slice).
- **Required Validation**:
  - End-to-end automated integration test walking through the entire mission from command line to payout.
  - Non-technical user walkthrough validation verifying step clarity and mistake recovery.
- **Definition of Done**:
  - The Aster Incident is 100% playable, challenging, educational, and rewards are cleanly awarded.

---

## M7 — NPCs & Persistent World Consequences

- **Purpose**: Implement structured NPC knowledge, memory, conditional dialogue, and organization-level reactions to the player's investigation outcomes.
- **Scope**:
  - NPC entity model: knowledge flags, mood, trust level towards player, routine schedules.
  - Cedarline employees: Barry (frightened sysadmin), Mercy (lead AI engineer), and external observers.
  - Reactive dialogue: NPCs acknowledge whether the incident was resolved quietly, escalated, or bungled.
  - In-game news alerts and simulated email inbox updates reflecting the aftermath of the incident.
- **Dependencies**: M4, M6.
- **Deliverables**:
  - NPC state manager in `src/simulation/actors/`.
  - Email client application (`CedarMail`) on virtual desktop.
  - Dynamic dialogue scripts responding to player's mission score and choices.
- **Acceptance Criteria**:
  - Talking to Barry after solving the Aster Incident triggers new dialogue thanking the player and providing future leads.
  - Failing to contain the incident before reporting results in reputational damage and critical emails.
  - World states persist across player transitions between buildings.
- **Explicit Exclusions**:
  - Full procedural NPC daily schedules across dozens of characters (limited to key scenario NPCs).
- **Required Validation**:
  - State machine tests checking that dialogue branches accurately reflect incident outcome states.
- **Definition of Done**:
  - World feels responsive to the player's investigative actions; NPCs react coherently to incident resolution.

---

## M8 — Career, Economy, & Life Simulation

- **Purpose**: Implement financial progression, personal needs, apartment living, and equipment procurement to deliver the "Sims" life-simulation dimension.
- **Scope**:
  - Financial ledger: bank account, daily rent deductions, bounty income, equipment expenses.
  - Player life stats: Energy/Fatigue, Focus, and Hunger/Hydration.
  - Player apartment: bed (rest/save game), kitchen (consume food/coffee), workstation desk (investigation).
  - Hardware store shop interface: buying workstation monitor upgrades, faster network adapters, and books.
  - Career rating and reputation level unlocking higher-tier consulting gigs.
- **Dependencies**: M3, M6.
- **Deliverables**:
  - Economy subsystem in `src/simulation/economy/`.
  - Apartment interior scene with interactive bed, fridge, and workstation.
  - Banking & Hardware Shop desktop applications.
  - Status HUD showing time of day, player funds, and energy level.
- **Acceptance Criteria**:
  - Resting in bed restores player energy and advances in-game clock.
  - Low energy applies a visual blur/focus penalty to terminal investigation.
  - Bounties earned from missions can be spent on tangible workstation upgrades that improve simulation capabilities.
  - Overdue rent triggers notification warnings from landlord.
- **Explicit Exclusions**:
  - Complex interior decorating or wall-painting customization.
  - Romantic relationships or family simulation.
- **Required Validation**:
  - Unit tests for financial ledger preventing negative balance glitches and double spending.
- **Definition of Done**:
  - Complete gameplay loop: solve incident -> earn money -> pay rent & upgrade equipment -> rest -> wake up ready for next gig.

---

## M9 — Persistence & Recovery

- **Purpose**: Implement robust, versioned local browser saves using IndexedDB with schema migration, auto-save, and corruption recovery.
- **Scope**:
  - IndexedDB storage adapter implementing `PersistencePort`.
  - Versioned serialization schemas using Zod for runtime type checking.
  - Schema migration runner enabling future save upgrades without data loss.
  - Multiple save slots + automatic checkpointing upon key mission milestones.
  - Protection against corrupted state with fallback to last valid checkpoint.
- **Dependencies**: M3, M6, M8.
- **Deliverables**:
  - `IndexedDbSaveAdapter` in `src/application/persistence/`.
  - Save/Load manager UI in main menu and settings pause screen.
  - Migration test suite verifying save payload compatibility across version bumps.
- **Acceptance Criteria**:
  - Refreshing the browser preserves player position, inventory, terminal history, mission state, and finances.
  - Loading a save file restores exact simulation state without Three.js desynchronization.
  - Corrupt or invalid JSON save files are safely rejected without crashing the application.
  - Manual save slots allow player to maintain multiple investigation branches.
- **Explicit Exclusions**:
  - Cloud server save syncing (strictly local browser storage for MVP).
- **Required Validation**:
  - Automated round-trip test: Serialize simulation state -> write to IndexedDB -> read -> deserialize -> assert deep equality.
- **Definition of Done**:
  - Save/Load cycle is seamless, resilient to browser refresh, versioned, and protected against data corruption.

---

## M10 — Onboarding & Learning

- **Purpose**: Create an intuitive player onboarding flow, interactive tutorial, configurable assistance tiers, persistent Mission Journal, in-game Field Guide, and a secondary transfer-of-learning scenario.
- **Scope**:
  - First-time user tutorial introducing 3D movement, NPC interaction, and virtual desktop navigation.
  - Three configurable assistance tiers: `Guided`, `Standard`, and `Independent` (see [PLAYER_GUIDANCE.md](file:///Users/protector/Documents/projects/cyberlife/docs/PLAYER_GUIDANCE.md)).
  - Persistent Mission Journal retaining discovered clues, evidence hashes, and plain-language progress summaries.
  - Interactive "Field Guide" desktop application explaining core cybersecurity concepts (IAM, least privilege, prompt injection, evidence hashing).
  - Contextual progressive hints (Level 1 Nudge -> Level 2 Explicit fallback) without reward penalties.
  - Second mini-scenario ("The Vector Injection") to test whether the player can transfer learning from the Aster Incident to a new prompt-injection case.
- **Dependencies**: M6, M8, M9.
- **Deliverables**:
  - Tutorial overlay and onboarding quest tracker.
  - Assistance tier selector in game settings and HUD.
  - `MissionJournalApp` desktop application retaining discovered clues and narrative theories.
  - `FieldGuideApp` desktop application with searchable reference articles.
  - Transfer scenario definition `public/content/missions/vector-injection.json`.
- **Acceptance Criteria**:
  - New players can complete the initial orientation in under 5 minutes without external instructions.
  - Players can toggle between `Guided`, `Standard`, and `Independent` modes at any time without losing progress or rewards.
  - Using hints or playing on `Guided` mode never reduces mission rewards or marks completions as inferior.
  - Field Guide provides accurate, pedagogical explanations of concepts encountered in gameplay.
  - Player successfully transfers knowledge of prompt injection to identify and remediate the secondary scenario without jargon memorization.
- **Explicit Exclusions**:
  - Unskippable, locked-input rail tutorials.
- **Required Validation**:
  - User testing walkthrough verifying all tutorial prompts trigger and dismiss correctly.
  - Verification that toggling assistance tiers does not alter simulation state or financial balances.
- **Definition of Done**:
  - Onboarding is frictionless; educational concepts are clearly documented in-game; assistance tiers and journal work seamlessly; transfer scenario validates learning retention.

---

## M11 — Quality & Release Readiness

- **Purpose**: Final polish, browser compatibility testing, performance optimization, accessibility enhancements, and end-to-end vertical slice validation.
- **Scope**:
  - Cross-browser testing on Chrome, Firefox, Edge, and Safari.
  - Performance profiling ensuring steady 60 FPS on mid-tier hardware and low memory footprint (<500MB heap).
  - Accessibility improvements: full keyboard navigation for desktop UI, high-contrast terminal theme, font scaling.
  - Comprehensive Playwright end-to-end test suite running through the complete vertical slice.
  - Final documentation review and release packaging.
- **Dependencies**: M0 through M10.
- **Deliverables**:
  - Optimized production bundle with code splitting and lazy-loaded assets.
  - Playwright automated regression test suite.
  - Accessibility audit report.
  - Release build verified and hosted on static preview server.
- **Acceptance Criteria**:
  - Playwright E2E suite passes 100% reliably in headless CI.
  - Zero critical accessibility issues in desktop and terminal UI.
  - No memory leaks detected over 30 minutes of continuous gameplay.
  - Lighthouse performance score >90 on desktop.
- **Explicit Exclusions**:
  - Mobile touch controls (desktop browser first).
- **Required Validation**:
  - Full automated regression suite pass + manual QA verification checklist completion.
- **Definition of Done**:
  - The vertical slice of Cyberlife is rock-solid, polished, performant, accessible, and ready for public playtesting.

---

## M12 — Workstation & Living World Immersion

- **Purpose**: Bridge the first-person/third-person physical world exploration and the in-game hacker workstation with smooth camera transitions, authentic Lagos audio/visual ambience, and lived-in environment props.
- **Scope**:
  - Seamless 7-state camera dolly transition from third-person walking to seated workstation view (`WorkstationCameraStates`).
  - Lived-in Lagos apartment props (power inverter, battery bank, ceiling fan, split AC, workstation desk, ergonomic mesh chair).
  - Day/night lighting cycle with warm interior desk lamps and Lagos street glow.
  - Realistic Danfo minibus and pedestrian traffic integration along Broad Street.
- **Dependencies**: M1 through M11.
- **Status**: **COMPLETED**.

---

## M13 — Cybersecurity Arsenal Audit, Human Attack Surface, Living City & Asset Provenance

- **Purpose**: Foundational architecture and audit milestone establishing source-backed tool verification, data-driven human/physical security simulation, 4-tier population hierarchy, 9 urban environment profiles, authentic interior venues, machine-readable asset manifest, and multi-role investigation contracts.
- **Scope**:
  - **Part 1 — Cybersecurity Arsenal Audit & Tool Architecture**:
    - Source-backed audit of all 28 tools (`playable`, `partial`, `reference_only`, `planned`).
    - Discriminated tool execution contract enforcing input schemas, clearance levels, Rules of Engagement (RoE), and zero host/network side-effects.
    - Fictional Cedarline Marina Tower range models (subnets, hosts, synthetic PCAPs, auth tokens).
    - CyberCatalogue desktop application mode switcher and live tool browser.
  - **Part 2 (Addendum) — Human & Physical Security Architecture**:
    - Deterministic trust, credibility, authority, and suspicion evaluation engine (`HumanPhysicalEngine.ts`).
    - Physical facility security: multi-zone access control (Clearance Levels 0–5: Public to Air-Gapped Lab), badge validation, tailgating sensor alarms, and door held open metrics.
    - Removable media incident simulation generating synthetic endpoint process telemetry (`rundll32.exe`, `cscript.exe`) and network egress, strictly isolated from host execution.
    - Air-gapped forensic lab environment suppressing synthetic network egress.
    - Pretexting personas and challenge-response identity verification controls.
  - **Part 3 — Living City & NPC Population Architecture**:
    - 4-Tier population hierarchy (`TIER_1_AMBIENT_CROWD`, `TIER_2_ROUTINE_NPC`, `TIER_3_INTERACTIVE_NPC`, `TIER_4_STORY_CRITICAL`).
    - 9 Urban environment population profiles with hourly density modifiers and attire styles.
    - Meaningful interior venues with operating hours, badge checks, and non-constant access.
  - **Part 4 — Asset Manifest & Provenance Pipeline**:
    - Machine-readable asset manifest (`AssetManifest.ts` and `public/assets/asset_manifest.json`) tracking licensing, local paths, LOD, collision, visual verification evidence, and defect backlogs.
    - Honest tracking of unoptimized assets (e.g. 66.3 MB `island_tree_01.glb` defect backlog with procedural palm fallback).
  - **Part 5 — Narrative & Career Multi-Role Integration**:
    - Expanded careers: `career_bounty_hunter`, `career_independent_investigator`, `career_blue_team`, `career_purple_team`, `career_red_team`.
    - Multi-role investigation approaches for the Aster Incident and removable media drop.
    - Persistent story flags tracking player choices and moral consequences.
- **Dependencies**: M1 through M12.
- **Status**: **COMPLETED & VERIFIED** (85/85 test files, 623/623 tests passing).

---

## M14 — Narrative, Factions, World Bible & Branching Story

- **Purpose**: Establish the foundational narrative identity, world bible, central mystery, factions, recurring characters, branching story structure, player agency, and data-driven narrative architecture for Cyberlife.
- **Scope & Implementation**:
  - **Part 1 — Narrative Bible & Worldbuilding (`docs/narrative/cyberlife-world-bible.md`)**:
    - Grounded near-future (2026–2027) Lagos Island setting (Broad Street, Marina Waterfront, Balogun Market, Tinubu Square, CMS Transit Hub, residential lofts).
    - Socio-technological landscape balancing high-speed fiber landings and autonomous AI agent adoption against municipal power realities, diesel generator economics, and POS agency banking.
    - Fictional technology ecosystem and strict simulation security boundaries (zero host execution, zero external sockets).
  - **Part 2 — Central Mystery & Story Arcs (`docs/narrative/central-mystery-and-story-arcs.md`)**:
    - The Eko Nexus Pipeline anomaly: Multi-tenant interconnect breach connecting Cedarline Services, Eko Merchant Bank, and Port logistics.
    - The Four Investigative Hypotheses: Theory A (Corporate Cover-Up & Scapegoating), Theory B (Targeted Financial Espionage), Theory C (Phantom Weaver Agent Contagion), Theory D (Whistleblower Forced Audit).
    - 3 Overarching Story Arcs: Arc 1 (The Aster Anomaly), Arc 2 (The Eko Nexus Pipeline), Arc 3 (Shadows Over Marina Tower).
  - **Part 3 — Factions & Organizations (`docs/narrative/factions-and-organizations.md`)**:
    - 8 nuanced factions: Cedarline Services Ltd., Eko Merchant Bank, Krest Incident Response, 0xLagos Research Syndicate, The Lagos Inquirer, Civic Rights & Cyber Integrity Initiative (CRCII), Balogun Traders Electronic Union, and National Digital Security Regulatory Commission (NDSRC).
    - Continuous faction standing scale (-100 Hostile to +100 Allied) with 5 qualitative bands, perks, and access barriers.
  - **Part 4 — Recurring Cast & Interpersonal Dynamics (`docs/narrative/recurring-characters-and-relationships.md`)**:
    - 11 authored characters: Blessing, Barry, Mercy, Michael, Mama Esther, Uncle Segun, Goodness, Tsharp, Mary, Daniel, and Choker.
    - Explicit knowledge boundaries, conflicting loyalties, schedules, and progressive dialogue branches.
  - **Part 5 — Player Agency & Consequence Architecture (`docs/narrative/player-agency-and-consequences.md`)**:
    - 4 Ethical Alignments: Strict Procedural, Ethical Mentor, Uncompromising Truth, Pragmatic Commercial.
    - Multi-dimensional agency, evidence integrity synthesis, persistent world flags, and failure recovery paths.
  - **Part 6 — Data-Driven Narrative Architecture (`src/simulation/narrative/`)**:
    - Type-safe, validated domain models for Story Arcs, Chapters, Missions, Objectives, Factions, Evidence Vault, and Investigative Conclusions.
    - Authoritative validation engine (`narrativeValidator.ts`) detecting missing references, malformed prerequisites, and invalid state transitions.
    - Integrated with authoritative `SimulationState`, deterministic `commandHandler`, and save/load persistence.
    - Playable end-to-end story slice connecting technical evidence, dialogue, faction standing, and branching consequences.
- **Dependencies**: M13.
- **Status**: **COMPLETED & VERIFIED**.

> [!NOTE]
> **Existing Out-of-Sequence Offensive & Social Simulation Capabilities**:
> Prior engineering work delivered interactive offensive security tools (`ExploitLabEngine.ts`, `WebProxyEngine.ts`, `SocialPretextEngine.ts`, desktop apps, terminal commands, and tests documented in `docs/milestone-14-offensive-simulation-report.md`). That work is preserved and fully intact in the codebase as valuable, verified simulation capabilities, but does not satisfy the narrative scope of M14. These capabilities serve as foundational building blocks mapped to the authoritative roadmap:
> - Exploit Lab & Web Proxy map to **M17 — Red Team and authorized assessment workflows**.
> - Social Pretexting & physical security badges map to **M21 — Social engineering, physical security and human-centered missions**.

---

## M15 — Original Identity, Music, Ambience & Audio Systems

- **Purpose**: Establish the complete auditory identity of Cyberlife, including original adaptive music, dynamic Lagos ambient soundscapes, workstation sound design, and voice dialogue audio integration.
- **Scope**:
  - Original musical score combining modern techno-thriller synth textures with contemporary West African rhythmic undertones (Afrobeats polyrhythms, organic percussion, tense ambient pulses).
  - Procedural time-of-day ambient audio: Broad Street morning traffic, Balogun Market bustle, generator hums, coastal Marina lagoon waves, and nocturnal quiet.
  - Workstation interactive sound effects: mechanical keyboard clicks, terminal bell chirps, drive seek acoustics, alert stingers.
  - Positional audio emitter system in 3D world tied to physical venues.
- **Dependencies**: M14.
- **Status**: **COMPLETED & VERIFIED**.
- **Deliverables**:
  - `docs/audio/cyberlife-sonic-identity.md`: Authoritative sonic identity specification balancing analog synthesizers, contemplative Rhodes piano, Afro-electronic syncopation, and believable Lagos soundscapes.
  - `docs/audio/audio-asset-manifest.md`: Complete asset register and provenance table auditing all 26 bundled Opus/MP3 audio files.
  - `docs/milestone-15-audio-system-report.md`: Milestone 15 completion report detailing architecture, tests, browser validation, and performance.
  - 7 Original Music Themes & Stingers: `music_main_menu` ("Echoes of Marina"), `music_world_exploration` ("Broad Street Protocol"), `music_apartment_ambient` ("Broad Street 14 / Downtime"), `music_workstation_focus` ("Deep Trace"), `music_investigation_tension` ("The Anomaly"), `music_discovery_revelation`, and `music_mission_resolved`.
  - 4 Location-Aware Environmental Ambiences: `ambience_lagos_streets`, `ambience_apartment`, `ambience_cedarline_lobby`, `ambience_workstation`.
  - 15 Tactile Sound Effects: Mechanical switch keystrokes with pitch variation and 25 Hz throttling, terminal enter/success/error chimes, window open/close, workstation enter/exit, and evidence preservation bells.
  - 6-Bus Web Audio Routing Graph (`master`, `voice`, `sfx`, `ambience`, `music`, `ui`) with ducking and 24-source concurrency limiter.
  - Interactive Title Screen Overlay (`MainMenuOverlay.tsx`) with browser autoplay unlock and audio settings access.
  - Workstation & Experience Settings Modal (`WorkstationSettingsModal.tsx`) with volume sliders, mute toggle, test audio output button, and reset defaults.
  - Automated Unit Tests (`AudioSubsystemM15.test.ts`): 22/22 tests passing covering lifecycle, mixing, crossfades, location switching, rate limiting, and persistence.
  - Production verification: Zero TypeScript errors, clean ESLint, successful production build, and headless browser verification with visual screenshots.

---

## M16 — Network Analysis & Threat Intelligence

- **Purpose**: Implement a technically credible, interactive network-analysis and threat-intelligence system backed by simulated network state, multi-protocol dissection, local threat intelligence correlation, narrative evidence integration, and structured objective evaluation.
- **Scope**:
  - **Interactive Network Topology**: 5 distinct network segments (`seg-corp-lan`, `seg-dmz`, `seg-dc-internal`, `seg-mgmt-soc`, `seg-wan-ext`), 12 simulated nodes with authentic IP, MAC, services (including Aster Assistant API proxy on `app-portal-01:8080`), and directional connection links.
  - **Multi-Protocol Traffic Stream**: Synthetic packet trace across Frame, Ethernet, IPv4, TCP, UDP, DNS, HTTP, TLS, and SMB2 protocols, with forensic filtering, text search, conversation grouping, and hexadecimal payload inspection.
  - **Local Threat Intelligence Registry**: 7 authored local fictional IOC records across IPv4 addresses, domain names, SHA-256 hashes, regex patterns, and JA3 TLS fingerprints, with clear distinction between adversary severity and observational confidence.
  - **Explainable Correlation Engine**: Pure domain correlation engine matching network events against indicators with human-readable rationale and explicit benign allowlist warnings for internal SOC scanners (`mon-siem-01`).
  - **Evidence Collection Integration**: 1-click forensic preservation creating cryptographic evidence items in the player's Evidence Vault with SHA-256 hash provenance and audio feedback.
  - **Playable Scenario ("Operation Marina Nexus")**: Authored 7-objective investigation tracking the Aster agent exfiltration breach and Eko Nexus C2 beaconing anomaly with ground-truth evaluation and pedagogical critique.
  - **EkoSec Packet Lens App**: 4-tab desktop GUI suite (`Network Topology`, `Traffic Stream`, `Threat Intelligence`, `Investigation & Findings`) plus in-game CLI commands (`packetview`, `threatintel`, `topology`).
  - **Safety Boundaries**: 100% simulated in-memory state; zero host network operations, zero external API lookups, zero shell escapes.
- **Dependencies**: M14.
- **Status**: **COMPLETED**.

---

## M17 — Red Team & Authorized Assessment Workflows

- **Purpose**: Formalize comprehensive penetration testing and offensive assessment gameplay under strict Rules of Engagement (RoE).
- **Scope**:
  - **Rules of Engagement (RoE) & Authorization Gate**: Authoritative domain gate evaluating in-scope subnets (10.0.1.0/24, 10.0.4.0/24), authorized techniques (`RECONNAISSANCE`, `CONFIG_AUDIT`, `WEB_APP_ASSESSMENT`, `AUTH_ACCESS_CONTROL`), and strictly prohibiting destructive tactics (`denial_of_service`, `dos_stress_testing`, `data_destruction`, `persistence_implant`, `exfiltration`).
  - **Target Inventory & Boundary Enforcement**: Simulated targets distinguishing authorized staging assets (`app-portal-01`, `filesrv-01`, `api-gw-01`) from strictly out-of-scope enterprise infrastructure (`dc-core-01`, `mon-siem-01`, `c2-nexus-01`) with 100% rejection without state modification or network calls.
  - **Deterministic Assessment Tool Suite**: In-memory tools (`tool-recon-enum`, `tool-config-smb-audit`, `tool-web-api-idor`, `tool-auth-header-spoof`, `tool-crypto-cipher-eval`) providing pedagogical explanations, required inputs, and diagnostic execution traces.
  - **Candidate Findings Validation Studio**: Structured vulnerability triage workflow validating genuine flaws (`VULN-CEDAR-001` BOLA, `VULN-CEDAR-002` SMB Signing, `VULN-CEDAR-003` Envoy Header Spoofing) and correctly eliminating benign false positives (`VULN-CEDAR-004` TLS 1.2 Cipher).
  - **Cryptographic Evidence Vault**: Immutable audit trail, SHA-256 artifact provenance hashes, RFC 3161-style chain of custody stamps, and analyst note categorization (`SCOPE`, `OBSERVATION`, `FINDING`, `REMEDIATION`).
  - **Executive Penetration Testing Report & CISO Evaluation**: Comprehensive deliverable generator with CVSS v3.1 scoring, strategic remediation roadmaps, and client CISO evaluation scorecard with Grade A sign-off.
  - **Virtual Desktop Application (`redTeam`) & Terminal CLI (`redteam`)**: Complete Orion OS GUI workspace with 6 dedicated tabs (`scope`, `targets`, `console`, `findings`, `evidence`, `report`) and terminal CLI suite.
  - **Safety Boundaries**: 100% simulated in-memory state; zero host commands, zero socket probing, zero live network traffic.
- **Dependencies**: M14, M16.
- **Status**: **COMPLETED & VERIFIED**.

---

## M18 — Blue Team & Purple Team Workflows

- **Purpose**: Deliver integrated defensive operations, automated detection coverage verification, and adversary emulation.
- **Scope**:
  - **Synthetic Security Telemetry Stream**: Multi-source security telemetry across six categories (`AUTHENTICATION`, `PROCESS_EXECUTION`, `NETWORK_CONNECTION`, `PRIVILEGE_CHANGE`, `WEB_APPLICATION`, `FILE_INTEGRITY`) with stable IDs, timestamps, RFC 1918/5737 IPs, and SHA-256 evidence linkages.
  - **Detection Engineering Engine**: 8 Sigma-inspired detection rules (`RULE-SEC-001` through `RULE-SEC-008`) with distinct adversary severity vs confidence scoring, inline test harness, and deduplicated alert triggering.
  - **Alert Triage Console**: Mathematically derived priority matrix ($P_1$ Critical through $P_4$ Low), 4-state triage workflow (`NEW`, `UNDER_INVESTIGATION`, `RESOLVED`, `FALSE_POSITIVE`), and justification logging.
  - **Incident Investigation Workspace**: Interactive attack timeline reconstruction, confirmed facts vs hypotheses tracking, and 1-click Evidence Vault integration.
  - **Simulated Defensive Response (SOAR/EDR)**: 6 active mitigation actions (`ISOLATE_ENDPOINT`, `RESTORE_ENDPOINT`, `BLOCK_INDICATOR`, `DISABLE_ACCOUNT`, `APPLY_CONTAINMENT_POLICY`, `ESCALATE_INCIDENT`) with consequence modeling and audit history.
  - **Purple Team Adversary Emulation**: 6 MITRE ATT&CK atomic scenarios (`SCEN-PT-01` to `SCEN-PT-06`), coverage status analyzer, gap remediation reports, and M17 Red Team integration adapter.
  - **Playable Scenario ("Operation Lagos Shield: Broad Street Defense")**: Authored 7-objective Blue/Purple team incident defense with decoy SOC scanner (`mon-siem-01`) and ground-truth evaluation.
  - **In-Game Virtual Desktop Integration & CLI**: GUI app `defensiveOps` with 7 dedicated tabs (`telemetry`, `rules`, `alerts`, `investigation`, `response`, `purple`, `mission`) and terminal commands (`blueops`, `purpleteam`).
  - **Safety Boundaries**: 100% simulated in-memory state; zero host network operations, zero socket sniffing, zero shell execution.
- **Dependencies**: M16, M17.
- **Status**: **COMPLETED & VERIFIED**.

---

## M19 — Bounty Hunting & Contracts

- **Purpose**: Implement open-market bug bounty networks, private sector consulting tenders, and competitive freelance security contracts with strict scope enforcement, evidence verification, and deterministic client evaluation.
- **Scope**:
  - Eko Bounty Network portal listing verified corporate disclosure programs, market audits, forensic investigations, and defensive validation contracts across Lagos Island.
  - Strict Scope of Engagement & Rules of Engagement Gate enforcing in-scope targets, pre-engagement ambiguity clarification, and audit penalties for out-of-scope actions.
  - Deliverables packaging studio with executive summaries, CVSS vulnerability findings, and SHA-256 Evidence Vault cryptographic linkages.
  - Deterministic 100-point client evaluation rubric grading objectives, findings, cryptographic evidence, executive reporting, and remediation clarity.
  - Freelance reputation ledger with 5 career tiers, integer kobo payouts (`payoutKobo`), idempotent payout guards, and review debriefs.
  - Virtual desktop application (`bountyHub`) with 5 dedicated workflow tabs and unified career hub integration.
- **Dependencies**: M14, M16, M17, M18.
- **Status**: **COMPLETED & VERIFIED**.

---

## M20 — Gameplay Loop, Player Progression, Career Structure & Activity Director

- **Purpose**: Establish the shared gameplay foundation that transforms Cyberlife into a continuously playable cybersecurity career and life simulation — connecting every prior milestone system into a coherent, player-facing loop.
- **Scope**:
  - **Shared Activity & Objective Framework**: Domain interfaces (`ActivityDefinition`, `ActivityInstance`, `ActivityDirectorState`, `CareerSkillMatrix`) and command lifecycle (`StartActivity`, `ResolveActivity`, `AbandonActivity`, `RefreshOpportunities`) with full persistence integration.
  - **Activity Director Engine**: Transparent, testable multi-factor scoring and prioritization across urgency, career level, skill alignment, recency, and time-sensitivity. Safeguards against duplicates, invalid prerequisites, endless regeneration, and settled-activity resurrection.
  - **Integration Adapters**: Five adapters (M14 Story, M16 Investigation, M17 Red Team, M18 Defensive Ops, M19 Bounty) bridge the shared framework with each completed milestone's real domain state.
  - **Authored Activity Catalogue**: 9 authored activities spanning all career paths plus a procedural contract generator with variation guards.
  - **Career Skill Matrix**: 9 gameplay-connected skills (`networkAnalysis`, `threatIntelligence`, `defensiveOps`, `offensiveSecurity`, `forensicInvestigation`, `incidentResponse`, `contractManagement`, `technicalAnalysis`, `professionalCommunication`) influencing eligibility and displayed progression.
  - **ActivityApp Desktop Workspace**: 4-tab virtual desktop application (Active Mission, Opportunities, Career & Goals, Audit Log) with deep URL linking.
  - **ObjectiveTrackerHUD Integration**: Real-time synchronization of active activity objectives, title, and technical rationale in the gameplay HUD.
  - **Idempotent Settlement**: Rewards, reputation deltas, and skill progression applied exactly once — guarded against double application across reload cycles.
  - **Immutable Audit Ledger**: Timestamped settlement records visible in the Audit Log tab.
  - **Persistence Integration**: `activityDirector` state fully persists and restores via the existing `SaveManager` with roundtrip test coverage.
- **Dependencies**: M14, M16, M17, M18, M19.
- **Status**: **COMPLETED & VERIFIED**.

---

## M21 — Social Engineering, Physical Security & Human-Centered Missions

- **Purpose**: Expand Cyberlife beyond computer-based security into human intelligence — interviewing witnesses, weighing testimony against technical evidence, recognising social-engineering attempts, and running authorized physical-security assessments.
- **Scope (implemented)**:
  - **HumanIntel Domain Slice** (`src/simulation/humanIntel/`): observations, interview sessions, witness statements with reliability ratings, evidence comparisons, graded conclusions, social-engineering evaluations, assessment findings and reports.
  - **10 Commands**: `StartInterview`, `AskInterviewQuestion`, `PresentEvidenceToNpc`, `ConcludeInterview`, `InspectWorldObject`, `CompareEvidenceWithTestimony`, `SubmitM21Conclusion`, `EvaluateSocEngDecision`, `RaiseAssessmentFinding`, `SubmitPhysicalAssessmentReport`, all routed through the main command handler.
  - **3 Authored Activities**: *The Server Room Discrepancy* (HUMINT investigation), *Unusual Vendor Access Request* (social-engineering awareness), *Cedarline Visitor Management Audit* (authorized physical assessment).
  - **Activity Integration**: `M21HumanIntelAdapter` syncs objectives with the M20 Activity Director; unlocked by completing the Aster Incident.
  - **Persistence**: `humanIntel` slice backfilled on load for older saves.
- **Scope (outstanding)**:
  - `HumanIntelApp` desktop application so players can actually run the scenarios.
  - Headless screenshot verification (`docs/graphics/milestone21/`).
  - Align scenario character names with NPC profiles.
- **Report**: [`milestone-21-human-intelligence-report.md`](./milestone-21-human-intelligence-report.md)
- **Dependencies**: M14, M17, M20.
- **Status**: **IN PROGRESS** — simulation layer complete (57 tests, 1011/1011 suite passing); player-facing UI pending.

---

## M22 — Living City, Meaningful Locations, NPC Routines & World Simulation

- **Purpose**: Transform the 3D environment into a believable, interactive, Lagos-inspired city where locations have purpose, NPCs follow plausible diurnal routines, exploration reveals genuine cybersecurity opportunities, and the living world connects to the player's career and personal progression.
- **Scope**:
  - **Living Simulation Layer** (`src/simulation/world/`): Pure, headless `WorldSimulationService` querying live NPC routine snapshots, ambient pedestrian/traffic density, venue operating hours, and authored exploration discoveries.
  - **Authored Exploration Catalogue** (`src/simulation/world/explorationDiscoveries.ts`): 12 authored discoveries across all 3 game locations (Broad Street/Tinubu Square, Cedarline HQ, Player Apartment) and 6 discovery categories (`CONTRACT_LEAD`, `NPC_INTEL`, `ENVIRONMENTAL_CLUE`, `AMBIENT_RUMOR`, `VENUE_UNLOCK`, `SKILL_PRACTICE`).
  - **Diurnal NPC Routines** (`src/simulation/actors/npcProfiles.ts`, `npcSchedules.ts`): Full 24-hour schedules for all 8 named characters (Blessing, Michael, Mama Esther, Uncle Ola, Goodness, Tsharp, Bank Security Lead, Barry) with location transitions, animations, and interaction eligibility.
  - **World Integration & Command Set**: Commands `ClaimExplorationDiscovery` and `RecordLocationVisit`, with automatic visit and discovery queuing upon `SetLogicalPlayerLocation` location changes.
  - **M20 Shared Activity Framework Integration**: Exploration leads dynamically unlock contracts and story activities (`act_blue_broad_street_triage`, `act_story_broad_street_intel`, `act_freelance_paystack_bounty`) without creating a separate quest system.
  - **Persistence & Reconciliation**: `worldSim` state (`locationVisits`, `claimedDiscoveries`, `pendingDiscoveryIds`, `explorationUnlockedActivityIds`) persists via `SaveManager` with legacy save backfilling.
  - **3D World Time Synchronization**: `WorldSceneManager.setSimulationTime` notifies `NpcManager.updateForSimulationHour` to update NPC presence and routines dynamically at schedule boundaries.
- **Dependencies**: M14, M20, M21.
- **Status**: **COMPLETED & VERIFIED**.
- **Evidence**:
  - 60/60 M22 unit and integration tests passing (`tests/unit/simulation/LivingCityAndWorldSim.test.ts`).
  - 1071/1071 full test suite passing across 125 test files (zero regressions).
  - Production build clean (`tsc --noEmit && vite build`).
  - 6 authentic headless browser screenshots captured (`docs/graphics/milestone22/`).
  - Full report documented in [`milestone-22-living-city-report.md`](./milestone-22-living-city-report.md).

---

## M23 — Asset Acquisition, Integration, Visual Quality & Additional Professions

- **Purpose**: Production-quality asset integration, visual polish, browser rendering optimization, and expanded playable cybersecurity professions.
- **Scope**:
  - **Visual Polish & Asset Pipeline**: Authentic Lagos Island streetscape branding (overhead 'CYBER DEFENSE' gantry billboard), bounding-box-locked vehicle taillights, and concentric floor interaction markers (`InteractableMarker.ts`).
  - **Corporate & Workplace Environments**: Cedarline corporate SOC multi-monitor telemetry video wall, dual 42U server racks with animated LEDs, and seated analyst workstations with ergonomic chairs for Tobi (`npc_tobi`) and Blessing (`npc_amina`).
  - **Living Quarters Polish**: Player apartment upgraded with authentic Lagos domestic backup power inverter system (`NEPA GRID: ACTIVE [230V] // BATTERY: 98%`), morning window sunlight, bookshelves, and Orion OS posters.
  - **Ergonomic Workstation Alignment**: Calibrated desk, chair, monitor, and camera angles for seamless first-person/third-person seated computer gameplay.
  - **Three Playable Additional Professions**:
    1. *Digital Forensics Analyst* (`career_independent_investigator`): `act_forensics_marina_breach`, `job_marina_forensic_timeline`, and `forensics` CLI tool analyzing MFT timestomping ($STANDARD_INFO vs $FILE_NAME discrepancy) and cryptographic SHA-256 evidence integrity.
    2. *Security Operations Analyst* (`career_sec_analyst`): `act_soc_triage_interbank`, `job_interbank_siem_triage`, and `soctriage` CLI tool triaging brute force, DNS tunneling, false-positive backup syncs, and isolating compromised payment switches.
    3. *Security Consultant & Auditor* (`career_security_consultant`): New 3-tier career path, `act_audit_fintech_compliance`, `job_fintech_compliance_audit`, and `complianceaudit` CLI tool identifying exposed API keys and enforcing conditional NDPR/PCI-DSS launch certification.
  - **Asset Provenance & Licensing**: Documented and verified in `AssetManifest.ts` with automated unit testing.
  - **Rendering Optimization**: Shadow pass optimization, texture memoization, and shared geometry primitives.
- **Dependencies**: M22.
- **Status**: **COMPLETED & VERIFIED**.
- **Evidence**:
  - 31/31 M23 unit and integration tests passing (`tests/unit/simulation/M23ProductionAssetsAndProfessions.test.ts`, `tests/unit/presentation/world/AssetManifestValidation.test.ts`).
  - 1,096/1,096 full test suite passing across 126 test files (zero regressions).
  - Production build clean (`tsc --noEmit && vite build`).
  - 6 authentic headless browser screenshots captured (`docs/graphics/milestone23/`).
  - Full report documented in [`milestone-23-production-assets-report.md`](./milestone-23-production-assets-report.md).

---

## M24 — Integrated Missions, Cross-System Validation & Release Readiness

- **Purpose**: Final end-to-end audit, cross-system integration, simulation boundary enforcement, defect remediation, and commercial release readiness for Cyberlife.
- **Scope & Implementation**:
  - **Whole-Game Audit (M0–M23)**: Complete audit of all architectural layers, state transitions, domain models, CLI tools (34 registered commands), desktop applications (11 apps), and 12-chapter narrative arc.
  - **Defect Remediation**:
    1. Fixed critical P1 bug in `SimulationEngine.ts:107` where actions with empty event arrays dropped state transitions.
    2. Implemented `M23ProfessionsAdapter.ts` and wired runtime objective evaluation for digital forensics, SOC triage, and compliance audit activities in `activityDirectorEngine.ts`.
    3. Implemented M21 Human Intelligence & Physical Security Portal (`HumanIntelApp.tsx`) with 4 interactive tabs, OS icon, window management, and registered `humint` CLI command.
    4. Guarded `forensicsCommand.ts` against undefined execution contexts in headless/test environments.
  - **Simulation Safety Boundary**: 100% isolated virtual execution verified with zero host command execution, zero real socket creation, zero external scanning, and zero exfiltration.
  - **Comprehensive End-to-End Traces**: All 6 required journeys (Journeys A through F) verified working with end-to-end simulation, career progression, rewards, persistence, and post-story continuation.
- **Dependencies**: M0 through M23.
- **Status**: **COMPLETED & VERIFIED**.
- **Evidence**:
  - 127/127 test files passed, 1,107/1,107 tests passing (100% pass rate, zero regressions).
  - TypeScript typecheck (`tsc -b`): Clean (0 errors).
  - ESLint: Clean (0 errors).
  - Production build (`tsc -b && vite build`): Clean in 3.52s with optimized bundles and zero dev artifacts.
  - 6 authentic headless browser screenshots captured (`docs/graphics/milestone24/`).
  - Full comprehensive 11-section report and audit matrix documented in [`milestone-24-release-readiness-report.md`](./milestone-24-release-readiness-report.md).


