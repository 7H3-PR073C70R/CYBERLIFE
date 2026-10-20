# Cyberlife — Milestone Roadmap & Definition of Done

This document establishes the official sequential milestone roadmap for Cyberlife. 

### Milestone Gating Policy
1. Milestones are strictly sequential. Work on Milestone $N+1$ may not commence until Milestone $N$ passes 100% of its Acceptance Criteria, Required Validation, and Definition of Done.
2. Scope creep is prohibited. Features listed under **Explicit Exclusions** must not be pulled into an active milestone.
3. Every milestone deliverable must be verified in the codebase with automated tests or smoke-test procedures.

---

## Milestone Index
- [M0 — Repository Foundation & Documentation](#m0--repository-foundation--documentation) *(Active / Completing)*
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
- [Future Work Outside Vertical Slice](#future-work-outside-vertical-slice)

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
  - Cedarline employees: Marcus (frightened sysadmin), Elena (lead AI engineer), and external observers.
  - Reactive dialogue: NPCs acknowledge whether the incident was resolved quietly, escalated, or bungled.
  - In-game news alerts and simulated email inbox updates reflecting the aftermath of the incident.
- **Dependencies**: M4, M6.
- **Deliverables**:
  - NPC state manager in `src/simulation/actors/`.
  - Email client application (`CedarMail`) on virtual desktop.
  - Dynamic dialogue scripts responding to player's mission score and choices.
- **Acceptance Criteria**:
  - Talking to Marcus after solving the Aster Incident triggers new dialogue thanking the player and providing future leads.
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

## M14 — Authorized Offensive Simulation & Social Pretexting Engine

- **Purpose**: Implement the interactive Red Team and penetration testing gameplay loop under strict, inspectable Rules of Engagement (RoE), simulated web request inspection, safe exploit-lab workflows, and human-centered social pretexting across authentic Lagos Island venues.
- **Scope & Implementation**:
  - `tool_exploit_lab` (Playable): Interactive dry-run exploit simulation engine (`ExploitLabEngine.ts`) with RoE authorization checks, target discovery, preflight dry-run analysis, simulated execution, structured findings, and reproducible forensic evidence generation (CVE-2026-ASTER-01, Redis RCE, Go Gin API bypass).
  - `tool_web_proxy` (Playable): Simulated HTTP/HTTPS web application proxy console (`WebProxyEngine.ts`) with request/response tampering, interactive replay, side-by-side diff highlighting, preset vulnerability scenarios (BOLA/IDOR CWE-639, SQL injection, Mass Assignment), and defense toggles.
  - `tool_social_eng` (Playable): Interactive social pretexting engine (`SocialPretextEngine.ts`) with 6 authentic Lagos Island scenarios across corporate lobbies, datacenters, and executive telecom switchboards; real-time dynamic gauges (Trust, Authority, Credibility, Suspicion); procedure verification challenges (out-of-band callbacks, badge validation).
  - Desktop & Terminal Integration: Mounted in EkoSec OS desktop (`ExploitLabApp.tsx`, `WebProxyApp.tsx`, `SocialPretextApp.tsx`), full CLI support (`exploitlab`, `webproxy`, `pretext`), and CyberCatalogue live inspection.
  - Strict Security Sandbox: 100% deterministic in-memory domain model. Zero host execution, zero external network sockets, zero live malware or phishing generation.
- **Dependencies**: M13.
- **Status**: **COMPLETED & VERIFIED** (92/92 test files, 667/667 tests passing; 35/35 M14 tests; 9/9 authentic high-resolution browser verification captures).

---

## M15 — Network Detection Engine & Endpoint Telemetry (EDR/SIEM)

- **Purpose**: Implement real-time packet inspection and endpoint process monitoring for Blue Team operations.
- **Scope**:
  - `tool_network_detect`: Suricata-inspired signature evaluation engine running against synthetic network streams and PCAP logs.
  - `tool_endpoint_telem`: Sysmon-inspired process execution tree, parent-child PID tracking, and file integrity monitoring (FIM).
  - Live SIEM event bus aggregating physical access events, firewall rejects, and EDR detections into correlated alert timelines.
- **Dependencies**: M13, M14.
- **Status**: **PLANNED**.

---

## M16 — Sigma Compiler & Air-Gapped Digital Forensics Workbench

- **Purpose**: Deliver detection engineering and forensic artifact carving capabilities.
- **Scope**:
  - `tool_sigma_rules`: Generic Sigma YAML rule compiler translating adversary behaviors into LogView SIEM queries.
  - `tool_artifact_foren`: Dedicated forensic workstation inside the air-gapped lab supporting disk image mounting, deleted file carving, and memory artifact analysis.
  - Formal evidence hashing and chain-of-custody courtroom packaging.
- **Dependencies**: M13, M15.
- **Status**: **PLANNED**.

---

## M17 — Offline Password Auditing & Enterprise IAM Vault

- **Purpose**: Expand identity and access management security simulation with realistic credential audits.
- **Scope**:
  - `tool_hash_audit`: Offline hash evaluation sandbox measuring hash resistance (MD5, SHA-256, bcrypt) against dictionary attacks with synthetic wordlists.
  - Enterprise IAM Vault: Active Directory/LDAP-inspired hierarchy simulating access control lists (ACLs), Kerberos ticket granting, and privilege escalation vectors.
- **Dependencies**: M14, M16.
- **Status**: **PLANNED**.

---

## M18 — Purple Team Adversary Emulation & Automated Detection Coverage

- **Purpose**: Unify offensive emulation and defensive telemetry into an automated Purple Team exercise platform.
- **Scope**:
  - `tool_purple_replay`: MITRE ATT&CK atomic test runner executing deterministic playbooks and measuring SIEM/EDR detection coverage.
  - Detection coverage matrix scorecards (Visibility, Detection, Prevention) with automated remediation recommendations.
- **Dependencies**: M14, M15, M16, M17.
- **Status**: **PLANNED**.

---

## M19 — Physical Facility Security & Access Control System

- **Purpose**: Implement interactive 3D physical security gameplay in Marina Tower and corporate interiors.
- **Scope**:
  - Interactive RFID badge turnstiles, biometric scanners, and electronic door strikes.
  - Tailgating mechanics: Timing player or NPC movement through access doors during door-held-open windows.
  - Security guard patrol routes, reception sign-in desks, visitor escort procedures, and CCTV camera sightline cones.
- **Dependencies**: M13, M14.
- **Status**: **PLANNED**.

---

## M20 — Living City Living Interiors & Scheduled Commuter Simulation

- **Purpose**: Bring the 4-tier population system and authentic interior venues to life with scheduled routine NPCs.
- **Scope**:
  - Tier 2 Routine NPCs following diurnal schedules (morning commute, workday office tasks, lunch at Mama Nkechi Market, evening lounge).
  - Tier 3 Interactive NPCs offering dynamic dialogue, rumors, freelance bounties, and hardware repair services.
  - Operating hours transitions: Venues locking doors, switching interior lights, and changing ambient music based on time of day.
- **Dependencies**: M13, M19.
- **Status**: **PLANNED**.

---

## M21 — Production Asset Pipeline, LOD Decimation & Browser Optimization

- **Purpose**: Decimate and optimize all external 3D assets to meet strict browser performance budgets.
- **Scope**:
  - Decimate defect backlog assets (e.g. `island_tree_01.glb` from 66.3 MB down to <500 KB using gltf-transform and meshopt).
  - Complete Level-of-Detail (LOD0, LOD1, LOD2) switching for all street architecture and vehicles.
  - 100% WebP texture conversion with mipmapping and progressive loading.
- **Dependencies**: M13.
- **Status**: **PLANNED**.

---

## M22 — Multi-Role Narrative Branching & Corporate Whistleblower Campaigns

- **Purpose**: Deliver the full techno-thriller narrative with diverging multi-career story arcs.
- **Scope**:
  - Complete 4-branch storyline for the Aster Incident and the Cedarline-Eko Merchant Bank conspiracy.
  - Divergent endings based on career path: Corporate Hero (Blue Team), Security Research Publication (Purple Team), Black Market Leaks (Bounty Hunter), Regulatory Whistleblower (Independent Investigator).
  - Dynamic reputation system affecting NPC dialogue, job board opportunities, and security clearance grants.
- **Dependencies**: M18, M20.
- **Status**: **PLANNED**.

---

## M23 — Threat Intelligence Feeds & Community Modding SDK

- **Purpose**: Provide extensible scenario authoring and external threat intel integration.
- **Scope**:
  - In-game Onion threat intel feed simulating darknet chatter, leaked credentials, and emerging zero-day advisories.
  - Scenario Creator SDK allowing educators and players to package custom investigation cases as signed JSON bundles.
- **Dependencies**: M18, M22.
- **Status**: **PLANNED**.

---

## M24 — Public Production Release & Cross-Browser Certification

- **Purpose**: Commercial-grade production release, cross-platform performance certification, and final security audit.
- **Scope**:
  - Rock-solid 60 FPS on desktop browsers (Chrome, Firefox, Safari, Edge) with memory consumption under 400 MB.
  - Full end-to-end automated Playwright regression suite passing across all career arcs.
  - Public documentation, player onboarding handbook, and educational courseware mapping.
- **Dependencies**: M13 through M23.
- **Status**: **PLANNED**.
