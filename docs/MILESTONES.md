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
  - Core project documentation (`README.md`, `CONTRIBUTING.md`, `docs/VISION.md`, `docs/ARCHITECTURE.md`, `docs/MILESTONES.md`, `docs/DEVELOPMENT_GUIDE.md`, `docs/SIMULATION_RULES.md`, `docs/ACCEPTANCE_CRITERIA.md`, and initial ADRs).
  - Version control configurations (`.gitignore`, `.editorconfig`).
- **Dependencies**: None.
- **Deliverables**:
  - Validated repository structure with boundary documentation.
  - Root `README.md` containing all thirteen required project specifications.
  - Architectural specifications detailing layer isolation, command-event lifecycles, and headless simulation boundaries.
  - Milestone roadmap with explicit gating and verification criteria.
  - Initial Architecture Decision Records (ADR-001, ADR-002, ADR-003).
- **Acceptance Criteria**:
  - [x] Repository initialized with clean Git tracking.
  - [x] All required directories created with boundary documentation explaining responsibilities and constraints.
  - [x] Non-negotiable simulation safety boundary codified in documentation and ADRs.
  - [x] Architectural separation between Three.js rendering, React UI, and authoritative headless simulation documented.
  - [x] Milestone roadmap established from M0 to M11 with explicit Definition of Done.
- **Explicit Exclusions**:
  - Application runtime code (Vite, React components, Three.js canvas setup deferred to M1).
  - 3D asset imports or graphics shaders.
  - Live database integrations.
- **Required Validation**:
  - File presence check for all documented specifications and directory boundaries.
  - Verification of `.gitignore` preventing accidental commits of secrets and dependencies.
- **Definition of Done**:
  - M0 documentation and repository structure committed to the `main` branch. Developer review confirms complete clarity for M1 kickoff.

---

## M1 — Bootable Application Foundation

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

## M2 — 3D Neighborhood & Player Controller

- **Purpose**: Build the explorable, compact 3D urban neighborhood with smooth character movement, collision detection, switchable camera modes, and spatial interaction zones.
- **Scope**:
  - Compact urban neighborhood block (street, cafe exterior/interior, apartment building, alleyway, electronics shop).
  - First-person and third-person camera system with smooth toggle (`V` key or settings).
  - Responsive character controller (WASD movement, sprinting, collision resolution against obstacles).
  - Spatial trigger zones registering player proximity to interactable entities (doors, terminals, NPCs).
  - Basic day/night ambient lighting cycle.
- **Dependencies**: M1.
- **Deliverables**:
  - Modular 3D scene environment in `src/presentation/world/`.
  - `CameraController` supporting first-person and third-person views with mouse look.
  - `PlayerController` with collision bounds and movement physics.
  - `SpatialTriggerSystem` emitting proximity events to the UI layer.
- **Acceptance Criteria**:
  - Player can smoothly navigate the neighborhood without falling through geometry or clipping through solid walls.
  - Camera toggles between 1st person and 3rd person seamlessly with preserved orientation.
  - Entering an interaction volume displays a clear HUD prompt (e.g., "[E] Talk to Marcus", "[E] Access Workstation").
  - Sustained 60 FPS performance on standard integrated graphics hardware.
- **Explicit Exclusions**:
  - Complex character facial animations or ragdoll physics.
  - Large procedural city generation (neighborhood is compact and authored).
  - In-depth dialogue execution (deferred to M4).
- **Required Validation**:
  - Manual walk-through test validating collision on all neighborhood buildings and boundaries.
  - Unit tests verifying camera math and vector coordinate transformations.
- **Definition of Done**:
  - Neighborhood geometry is complete, walkable, bounded, and triggers interaction prompts reliably.

---

## M3 — Simulation Engine & State Management

- **Purpose**: Build the authoritative, deterministic, headless game state machine that coordinates all world, cyber, life, and mission data without relying on DOM or WebGL.
- **Scope**:
  - Simulation loop and clock manager (in-game ticks, calendar time, duration timers).
  - Immutable state tree storing world state, player attributes, cyber entities, and missions.
  - Command dispatcher validating incoming actions against domain invariants.
  - Pure state reducers generating state deltas and publishing typed domain events.
  - Complete headless test harness verifying deterministic state transitions.
- **Dependencies**: M1.
- **Deliverables**:
  - `SimulationEngine` class in `src/simulation/engine/`.
  - State reducers for world time, actor location, player stats, and inventory.
  - `CommandBus` and `EventBus` interfaces in `src/application/`.
  - Test suite proving 100% testability of game logic without browser APIs.
- **Acceptance Criteria**:
  - Simulation state advances deterministically given an initial seed and a sequence of commands.
  - Invalid commands are rejected with typed domain errors without corrupting the state tree.
  - Unit tests execute entirely in Node.js environment in under 1 second.
- **Explicit Exclusions**:
  - Three.js visual bindings (rendering listens to events; simulation knows nothing of rendering).
  - Complex cyber exploits (abstract data structures only; full tools built in M5).
- **Required Validation**:
  - Headless unit test suite with 90%+ code coverage across simulation reducers and command handlers.
- **Definition of Done**:
  - State machine runs headlessly; commands update state reliably; domain events are properly received by subscribers.

---

## M4 — Interaction System & Hybrid Desktop

- **Purpose**: Implement the dual-mode interaction layer: in-world interaction prompts, branching dialogue interface, and the high-fidelity virtual desktop with window management.
- **Scope**:
  - World-space to screen-space interaction prompt rendering.
  - Authoritative dialogue execution engine supporting branching dialogue trees, player choices, and conditional unlocks.
  - Virtual desktop environment: draggable, resizable windows, taskbar, dock, notification tray.
  - Virtual terminal window shell with command input buffer, history, and ANSI text rendering.
  - Quick-access mobile overlay HUD for notifications and field notes.
- **Dependencies**: M2, M3.
- **Deliverables**:
  - `InteractionManager` linking spatial triggers to UI presentation.
  - `DialogueBox` React component supporting branching dialogue with NPC portrait and choice list.
  - `DesktopShell` window manager supporting minimize, maximize, drag, focus, and close.
  - `TerminalApp` component capable of receiving keyboard input and displaying synthetic stream output.
- **Acceptance Criteria**:
  - Pressing `E` near an interactable object opens the appropriate interface (dialogue or virtual desktop).
  - Pressing `Esc` closes desktop or exits dialogue cleanly, restoring 3D player movement controls.
  - Virtual desktop windows can be opened, dragged, focused, and resized without glitching.
  - Dialogue choices accurately dispatch commands and trigger narrative state updates.
- **Explicit Exclusions**:
  - Real OS shell integration (strictly synthetic terminal).
  - Full suite of cyber tools (deferred to M5).
- **Required Validation**:
  - UI component tests verifying window stacking order (z-index), drag constraints, and focus management.
  - Dialogue tree integration test asserting choice branch resolution.
- **Definition of Done**:
  - Player can interact with NPCs in-world to talk, sit at desk to launch virtual desktop, and interact with multiple windows smoothly.

---

## M5 — Cybersecurity Simulation & Tools

- **Purpose**: Implement the simulated cyber ecosystem: virtual networks, identities, access control, SIEM logs, simulated AI agent execution, and command-line investigation tools.
- **Scope**:
  - Virtual network graph (IP addressing, subnets, routers, DNS, firewall rules).
  - Synthetic IAM (service accounts, user roles, API tokens, permission scopes).
  - Synthetic SIEM engine generating structured event logs (authentication, API calls, error spikes).
  - Simulated AI Agent model ("Aster"): system prompt template, tool-calling permissions, conversation log buffer.
  - Virtual terminal utilities: `nmap`, `curl`, `grep`, `cat`, `ssh`, `token-audit`, `siem-query`.
- **Dependencies**: M3, M4.
- **Deliverables**:
  - Cyber simulation subsystem in `src/simulation/cyber/`.
  - Synthetic terminal command evaluator with command allow-list parser.
  - Fictional Cedarline Services network and telemetry fixture data.
  - Interactive terminal tools supporting search, log filtering, and token inspection.
- **Acceptance Criteria**:
  - All terminal commands operate exclusively on simulated data structures; zero host OS or external network calls.
  - Terminal commands produce consistent, reproducible output matching simulated network state.
  - Simulated AI agent displays observable audit trail of tool invocations and token consumption.
  - Inputting invalid or unknown commands outputs standard Unix-style error messages without crashing.
- **Explicit Exclusions**:
  - Live LLM API calls (all AI behaviors are model-simulated deterministically).
  - Actual weaponized exploit payloads or real network penetration capabilities.
- **Required Validation**:
  - Unit tests for every terminal utility verifying parameter parsing and output generation.
  - Security audit test verifying terminal evaluator rejects dangerous shell escape sequences.
- **Definition of Done**:
  - Player can open in-game terminal, query simulated servers, read logs, inspect tokens, and observe AI agent behavior safely.

---

## M6 — Aster Incident Mission

- **Purpose**: Build and integrate the complete end-to-end investigation mission: the Aster Incident at Cedarline Services.
- **Scope**:
  - End-to-end incident lifecycle: Alert -> Triage -> Evidence Preservation -> Root Cause Analysis -> Containment -> Remediation -> Validation -> Reporting -> Reward.
  - Evidence collection system: capturing log hashes, exporting token audit records, recording prompt injection vectors.
  - Containment action: revoking compromised IAM access token.
  - Remediation action: tightening AI agent tool permissions and updating prompt validation filters.
  - Incident verification engine: synthetic automated test running in-game to validate the threat is eradicated.
  - Structured Incident Report submission UI with automated grading and idempotent bounty delivery.
- **Dependencies**: M4, M5.
- **Deliverables**:
  - Mission definition file `public/content/missions/aster-incident.json`.
  - Evidence Locker UI in virtual desktop.
  - Incident Containment & Remediation terminal actions.
  - Incident Report authoring application and submission evaluation logic.
- **Acceptance Criteria**:
  - Player can complete all 10 stages of the Aster Incident from initial NPC dialogue to report submission.
  - Evidence hashes must match synthetic artifact integrity checks.
  - Containment action correctly isolates the compromised resource in the simulation state.
  - Report grading evaluates factual accuracy of player conclusions and issues appropriate bounty payout.
  - Re-submitting or reloading after completion does not grant duplicate payouts (idempotency).
- **Explicit Exclusions**:
  - Additional enterprise missions (focused exclusively on perfecting Aster Incident vertical slice).
- **Required Validation**:
  - End-to-end automated integration test walking through the entire mission from command line to payout.
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

- **Purpose**: Create an intuitive player onboarding flow, interactive tutorial, in-game Field Guide, and a secondary transfer-of-learning scenario.
- **Scope**:
  - First-time user tutorial introducing 3D movement, NPC interaction, and virtual desktop navigation.
  - Interactive "Field Guide" desktop application explaining core cybersecurity concepts (IAM, least privilege, prompt injection, evidence hashing).
  - Contextual investigative hints triggered when player is stuck for extended durations.
  - Second mini-scenario ("The Vector Injection") to test whether the player can transfer learning from the Aster Incident to a new prompt-injection case.
- **Dependencies**: M6, M8, M9.
- **Deliverables**:
  - Tutorial overlay and onboarding quest tracker.
  - `FieldGuideApp` desktop application with searchable reference articles.
  - Transfer scenario definition `public/content/missions/vector-injection.json`.
- **Acceptance Criteria**:
  - New players can complete the initial orientation in under 5 minutes without external instructions.
  - Field Guide provides accurate, pedagogical explanations of concepts encountered in gameplay.
  - Player successfully transfers knowledge of prompt injection to identify and remediate the secondary scenario.
- **Explicit Exclusions**:
  - Unskippable, locked-input rail tutorials.
- **Required Validation**:
  - User testing walkthrough verifying all tutorial prompts trigger and dismiss correctly.
- **Definition of Done**:
  - Onboarding is frictionless; educational concepts are clearly documented in-game; transfer scenario validates learning retention.

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

## Future Work Outside Vertical Slice

The following features are formally recorded as **future roadmap items** and must **not** be incorporated into Milestones M0 through M11:

1. **Expanded Metro Map & Multiple Neighborhoods**: Industrial server farm district, corporate downtown high-rises, underground hacker hackerspace.
2. **Consultancy Management**: Hiring junior analysts, assigning tickets, and scaling an independent security agency.
3. **Procedural Incident Campaigns**: Dynamically generated enterprise compromise scenarios with randomized network topologies.
4. **Autonomous NPC Daily Life**: Fully simulated 24-hour schedules with dozens of independent town residents.
5. **Multiplayer Cooperative Blue-Teaming**: Multi-terminal SOC operations where players collaborate in real time on large breaches.
6. **Scenario Creator & Community Modding SDK**: In-browser tools for educators and players to design, package, and share custom cybersecurity scenarios.
