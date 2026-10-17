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

---

## 2. Milestone Acceptance Checklists

### Milestone M0: Repository Foundation & Documentation *(Current)*
- [x] **Repository Initialized**: Git tracking enabled with clean initial commit.
- [x] **Directory Structure**: All foundational directories created across presentation, application, simulation, domain, content, and tests.
- [x] **Boundary Documentation**: Architectural boundaries and layer responsibilities documented in directory READMEs.
- [x] **Root README**: Comprehensive README covering overview, pillars, stack, safety boundary, Aster Incident, architecture, repository structure, prerequisites, workflow, status, roadmap, and contributing standards.
- [x] **Core Docs**: Complete set of initial documents created:
  - `docs/VISION.md`
  - `docs/ARCHITECTURE.md`
  - `docs/MILESTONES.md`
  - `docs/DEVELOPMENT_GUIDE.md`
  - `docs/SIMULATION_RULES.md`
  - `docs/ACCEPTANCE_CRITERIA.md`
  - `docs/decisions/ADR-001-simulation-boundary.md`
  - `docs/decisions/ADR-002-authoritative-state.md`
  - `docs/decisions/ADR-003-persistence-strategy.md`
- [x] **Safety Boundary Enshrined**: Explicit prohibition of real-world command execution and network scanning codified.

---

### Milestone M1: Bootable Application Foundation
- [ ] `package.json` created with verified dependencies (React, Three.js, Vite, TypeScript, Vitest, Zod).
- [ ] `vite.config.ts` configured and serving app locally with HMR.
- [ ] `npm run dev` boots the application with zero terminal errors.
- [ ] `npm run build` generates optimized production bundle in `dist/`.
- [ ] `npm run typecheck` passes with zero diagnostics.
- [ ] `npm run lint` passes with zero warnings.
- [ ] Three.js WebGL canvas mounts and renders animated test geometry at 60 FPS.
- [ ] Vitest test runner runs headless test suite and passes.

---

### Milestone M2: 3D Neighborhood & Player Controller
- [ ] 3D neighborhood block geometry modeled/loaded and rendered with lighting and shadows.
- [ ] Player character moves smoothly via WASD keys with collision detection against buildings and fences.
- [ ] Camera toggle between 1st person and 3rd person operates seamlessly with `V` key.
- [ ] Entering interaction volumes around key objects triggers proximity HUD prompts.
- [ ] Frame rate remains $\ge 60$ FPS on standard desktop displays.

---

### Milestone M3: Simulation Engine & State Management
- [ ] Authoritative `SimulationEngine` executes deterministically in headless Node.js / Vitest.
- [ ] In-game clock ticks and advances game time correctly.
- [ ] State mutations occur strictly through validated `Command` dispatch.
- [ ] `DomainEvent` emissions notify subscribers of state transitions.
- [ ] Unit test suite achieves $\ge 90\%$ branch coverage across core reducers.

---

### Milestone M4: Interaction System & Hybrid Desktop
- [ ] Pressing `E` near NPCs launches the branching dialogue interface.
- [ ] Dialogue choices update simulation state and unlock progression flags.
- [ ] Sitting at the workstation desk opens the virtual desktop environment.
- [ ] Virtual desktop window manager supports opening, dragging, minimizing, maximizing, focusing, and closing windows.
- [ ] Terminal application window renders text prompt, captures keyboard input, and maintains command history.

---

### Milestone M5: Cybersecurity Simulation & Tools
- [ ] Virtual network graph models Cedarline subnets, servers, and DNS records.
- [ ] In-game terminal executes allow-listed utilities: `nmap`, `curl`, `grep`, `cat`, `ssh`, `siem-query`.
- [ ] Inputting non-allowed commands displays simulated Unix command-not-found error without host breakout.
- [ ] Simulated AI agent "Aster" maintains observable execution logs and tool-calling audit trail.
- [ ] SIEM log queries return structured synthetic events matching simulated network events.

---

### Milestone M6: Aster Incident Mission
- [ ] Complete 10-step mission workflow playable from trigger to bounty payout.
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
- [ ] In-game Field Guide provides clear explanations of IAM, least privilege, prompt injection, and log auditing.
- [ ] Contextual hint engine offers progressive guidance when player is idle or stuck.
- [ ] Secondary transfer scenario ("The Vector Injection") verifies that player can apply prompt-injection defense skills to a new context.

---

### Milestone M11: Quality & Release Readiness
- [ ] 100% pass rate on Playwright end-to-end regression suite across Chromium, Firefox, and WebKit.
- [ ] Zero memory leaks observed over 30 minutes of continuous gameplay.
- [ ] WCAG 2.1 AA contrast compliance across terminal and desktop UI.
- [ ] Lighthouse Performance score $\ge 90$ on desktop.
- [ ] Release documentation, changelog, and static deployment build verified.
