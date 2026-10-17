# Cyberlife — Milestone Acceptance Criteria & Verification Matrices

This document provides explicit verification checklists, quality gates, and automated test protocols required for each milestone in Cyberlife.

---

## 1. Universal Quality Gates (Applied to All Milestones)

Every milestone deliverable must satisfy the following baseline quality gates:

1. **TypeScript Strictness**:
   - `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`.
   - Zero compiler warnings or errors (`tsc --noEmit`).
2. **Clean Code & Architecture**:
   - Inward dependency flow verified: zero imports of React or Three.js inside `src/domain` or `src/simulation`.
   - No dead code, empty catch blocks, or untyped `any`.
3. **Simulation Safety & Security**:
   - Zero host operating-system commands or processes invoked.
   - Zero external HTTP/WebSocket network calls for gameplay simulation.
   - Zero hardcoded passwords, secrets, or API keys in source control.
4. **Automated Testing**:
   - All unit and integration tests passing.
   - Deterministic test execution without race conditions or wall-clock dependencies.
5. **Player Guidance & Accessibility Baseline** (see [PLAYER_GUIDANCE.md](file:///Users/protector/Documents/projects/cyberlife/docs/PLAYER_GUIDANCE.md)):
   - A non-technical first-time player can understand every mission objective without prior cybersecurity knowledge.
   - Every required action has explicit, actionable instructions following the standard 8-part format.
   - Every required command is supported by the simulated terminal and documented in context with 1-click paste.
   - Players always know where to act, what to observe, and how to confirm success.
   - Technical terminology is explained in plain language at the point of use.
   - Invalid actions produce understandable, recoverable feedback.
   - Contextual hints are available on demand without restarting missions and without reducing rewards.
   - Players can replay instructions and review discovered evidence via the Mission Journal.
   - Guidance does not contradict actual simulation state or expected output.
   - Independent play is available without withholding essential mission information.
   - Core progression never depends on external AI or an internet connection.

---

## 2. Milestone Acceptance Checklists

### Milestone M0: Repository Foundation & Documentation *(Current)*
- [x] **Repository Initialized**: Git tracking enabled with clean initial commit.
- [x] **Directory Structure**: All foundational directories created across presentation, application, simulation, domain, content, and tests.
- [x] **Boundary Documentation**: Architectural boundaries and layer responsibilities documented in directory READMEs.
- [x] **Root README**: Comprehensive README covering overview, pillars, stack, safety boundary, Aster Incident, architecture, repository structure, prerequisites, workflow, status, roadmap, player guidance, and contributing standards.
- [x] **Core Docs**: Complete set of initial documents created:
  - `docs/VISION.md`
  - `docs/ARCHITECTURE.md`
  - `docs/MILESTONES.md`
  - `docs/DEVELOPMENT_GUIDE.md`
  - `docs/SIMULATION_RULES.md`
  - `docs/ACCEPTANCE_CRITERIA.md`
  - `docs/PLAYER_GUIDANCE.md`
  - `docs/decisions/ADR-001-simulation-boundary.md`
  - `docs/decisions/ADR-002-authoritative-state.md`
  - `docs/decisions/ADR-003-persistence-strategy.md`
- [x] **Safety Boundary Enshrined**: Explicit prohibition of real-world command execution and network scanning codified.
- [x] **Player Guidance Contract Established**: Comprehensive player guidance specification ([PLAYER_GUIDANCE.md](file:///Users/protector/Documents/projects/cyberlife/docs/PLAYER_GUIDANCE.md)) created and cross-referenced, defining 8-part instruction format, 3 assistance tiers, terminal teaching contract, and Aster walkthrough without premature gameplay implementation in M0.

---

### Milestone M1: Bootable Application Foundation *(Completed)*
- [x] `package.json` created with verified dependencies (React, Three.js, Vite, TypeScript, Vitest, Zod).
- [x] `vite.config.ts` configured and serving app locally with HMR.
- [x] `npm run dev` boots the application with zero terminal errors.
- [x] `npm run build` generates optimized production bundle in `dist/`.
- [x] `npm run typecheck` passes with zero diagnostics.
- [x] `npm run lint` passes with zero warnings.
- [x] Three.js WebGL canvas mounts and renders animated test geometry at 60 FPS.
- [x] Vitest test runner runs headless test suite and passes.

---

### Milestone M2: 3D Neighborhood & Player Controller *(Completed)*
- [x] 3D neighborhood block geometry procedural generation and rendering with lighting, materials, and distinct landmarks (Player Apartment, Cedarline Services HQ, Neighborhood Hub).
- [x] Player character moves smoothly via WASD / Arrow keys with normalized diagonal velocity and collision detection against buildings, props, and world boundaries.
- [x] Wall-sliding collision resolution prevents sticking or tunnelling along solid obstacles.
- [x] Camera toggle between 1st person (pointer lock, pitch clamping ±78°, hidden avatar) and 3rd person (orbit/follow, visible avatar) operates seamlessly via `V` key and HUD button.
- [x] Entering interaction volumes around key objects triggers proximity HUD prompts (`[E] Enter Cedarline Services`, `[E] Enter Player Apartment`, `[E] Read Noticeboard`).
- [x] Location transition system provides seamless movement between outdoor neighborhood and interior destinations with safe spawn placement and return memory.
- [x] Accessible controls guide (`F1` / HUD click) provides beginner-friendly, plain-language navigation and interaction assistance.
- [x] Zero regressions on M1 pipeline; 57 unit/integration tests passing; clean lint/typecheck/build; interactive browser smoke testing verified.
- [x] Frame rate remains $\ge 60$ FPS on standard desktop displays.

---

### Milestone M2.5: Lagos Island Environment *(Completed)*
- [x] Historic Lagos Island street network modeled and rendered with Broad Street, Marina Road, Balogun Market Lane, and Tinubu Square.
- [x] Varied architectural palette reflecting real Lagos Island heritage: Afro-Brazilian residences with arched windows and balconies, modern commercial banking towers, and market storefronts with roll-down metal shutters and striped awnings.
- [x] Authentic local environmental details: iconic yellow Danfo commercial minibus with twin black racing stripes, Balogun market stalls with display crates, concrete utility poles with overhead wires, official Lagos State green/white street signs, and rooftop GeePee water tanks.
- [x] Marina waterfront seawall with safety railings, mooring bollards, palm promenade, and deep blue Lagos Lagoon waters.
- [x] Tinubu Square civic plaza with central commemorative fountain monument, benches, royal palms, and functional community noticeboard.
- [x] Full collision blocking and wall-sliding resolution on all buildings, seawalls, Danfo bus, market stalls, and monuments.
- [x] Seamless entrance and return transitions for Player Apartment (Broad Street 14) and Cedarline Services HQ (Marina Tower).
- [x] 100% test pass rate across 16 test files (72 tests passing, >93% line coverage); strict type checking, linting, formatting, and production build verified.
- [x] Real in-browser visual verification confirmed at 60 FPS.

---

### Milestone M3: Simulation Engine & State Management *(Completed)*
- [x] Authoritative `SimulationEngine` executes deterministically in headless Node.js / Vitest with 0 DOM/Three.js dependencies.
- [x] In-game clock ticks and advances game time correctly; calendar maps elapsed simulation seconds to civil date/time (`08:00 AM, Monday, Oct 12, 2026`).
- [x] State mutations occur strictly through validated `Command` dispatch; rejected commands leave state untouched; accepted no-op commands preserve revision.
- [x] `DomainEvent` emissions notify subscribers of state transitions; errors in listeners are isolated and cannot corrupt state.
- [x] Unit test suite achieves $\ge 90\%$ branch coverage across core reducers (`commandHandler.ts` at 93.18%, `invariants.ts` at 100%, `playerSystem.ts` at 96.29%, `inventorySystem.ts` at 96.29%, `worldFlagsSystem.ts` at 100%).
- [x] Non-negative integer currency (`Money` in kobo) prevents floating-point inaccuracy across all financial calculations.
- [x] Duration timers execute deterministically without `setTimeout`.
- [x] React integration (`SimulationProvider`, `useSimulation`, `useOptionalSimulation`) updates HUD and dev simulation drawer without creating duplicate engines or render loops.

---

### Milestone M4: Interaction System & Hybrid Desktop
- [ ] Pressing `E` near NPCs launches the branching dialogue interface.
- [ ] Dialogue choices update simulation state and unlock progression flags.
- [ ] Sitting at the workstation desk opens the virtual desktop environment.
- [ ] Virtual desktop window manager supports opening, dragging, minimizing, maximizing, focusing, and closing windows.
- [ ] Terminal application window renders text prompt, captures keyboard input, and maintains command history.
- [ ] `ObjectiveTrackerHUD` displays active numbered tasks following the 8-part standard format with `[Repeat Instructions]` button.
- [ ] Virtual terminal includes 1-click `[Insert Command]` button allowing instant copy/paste of guidance commands.
- [ ] In Guided mode, target UI windows and buttons display subtle animated focus rings.

---

### Milestone M5: Cybersecurity Simulation & Tools
- [ ] Virtual network graph models Cedarline subnets, servers, and DNS records.
- [ ] In-game terminal executes allow-listed utilities: `nmap`, `curl`, `grep`, `cat`, `ssh`, `siem-query`.
- [ ] Inputting non-allowed commands displays simulated Unix command-not-found error without host breakout.
- [ ] Every simulated tool provides comprehensive `--help` documentation explaining parameters and expected outputs.
- [ ] Command syntax errors or typos provide constructive recovery suggestions (e.g., *"Did you mean: token-audit?"*).
- [ ] Simulated AI agent "Aster" maintains observable execution logs and tool-calling audit trail.
- [ ] SIEM log queries return structured synthetic events matching simulated network events.

---

### Milestone M6: Aster Incident Mission
- [ ] Complete 10-step mission workflow playable from trigger to bounty payout.
- [ ] A non-technical player can complete all 10 steps of the Aster Incident using guided assistance.
- [ ] Every step provides explicit instructions: goal, why it matters, where to go, what to do, what to look for, and how to confirm success.
- [ ] Evidence preservation system calculates and stores verifiable SHA-256 hashes of logs.
- [ ] Revoking compromised token terminates unauthorized agent database access in simulation.
- [ ] Tightening IAM policies and enabling prompt injection guards successfully remediates the incident.
- [ ] Automated incident report submission grades player findings accurately.
- [ ] Payout and reputation awards are idempotent (no double rewards on re-submission).

---

### Milestone M7: NPCs & Persistent World Consequences
- [ ] Key NPCs (Marcus, Elena) exhibit memory of incident outcome.
- [ ] Post-incident dialogue branches reflect player performance (clean resolution vs. data leak).
- [ ] In-game emails and simulated news feeds publish responsive articles based on incident resolution.
- [ ] NPC relationships persist across building transitions and save reloads.

---

### Milestone M8: Career, Economy, & Life Simulation
- [ ] Financial transactions correctly deduct rent and credit bounty payouts.
- [ ] Player apartment features functional bed, kitchen, and desk.
- [ ] Resting in bed restores energy and advances time.
- [ ] Workstation hardware upgrades (RAM, monitor, network adapter) can be purchased and apply functional perks.
- [ ] Low energy triggers visual fatigue cues and increased terminal typo simulation.

---

### Milestone M9: Persistence & Recovery
- [ ] Complete game state serializes to IndexedDB with versioned schema.
- [ ] Browser refresh completely restores 3D position, camera mode, terminal history, finances, and mission state.
- [ ] Schema migration script successfully upgrades legacy save payloads to new version.
- [ ] Corrupted save slots are detected and fall back gracefully to the last valid checkpoint.

---

### Milestone M10: Onboarding & Learning
- [ ] First-time player tutorial smoothly guides movement, interaction, and desktop usage in $<5$ minutes.
- [ ] Players can toggle between `Guided`, `Standard`, and `Independent` assistance tiers without penalty.
- [ ] Persistent Mission Journal retains discovered clues, hashes, and narrative theories across sessions.
- [ ] Contextual 2-tier hint engine (Nudge -> Explicit Fallback) provides guidance without deducting rewards or marking completions inferior.
- [ ] In-game Field Guide provides clear explanations of IAM, least privilege, prompt injection, and log auditing.
- [ ] Secondary transfer scenario ("The Vector Injection") verifies that player can apply prompt-injection defense skills to a new context without jargon memorization.

---

### Milestone M11: Quality & Release Readiness
- [ ] 100% pass rate on Playwright end-to-end regression suite across Chromium, Firefox, and WebKit.
- [ ] Zero memory leaks observed over 30 minutes of continuous gameplay.
- [ ] WCAG 2.1 AA contrast compliance across terminal and desktop UI.
- [ ] Lighthouse Performance score $\ge 90$ on desktop.
- [ ] Release documentation, changelog, and static deployment build verified.
