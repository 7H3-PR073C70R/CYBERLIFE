# Cyberlife

> **A browser-based 3D cybersecurity life RPG built with Three.js, TypeScript, and React.**

Cyberlife places you in the shoes of an independent cybersecurity specialist living in a compact, atmospheric urban neighborhood. By combining tactical command-line investigation, physical urban reconnaissance, personal life simulation, and modern AI-era threat scenarios, Cyberlife delivers an immersive, educational simulation of contemporary digital defense.

---

## 1. Project Overview

Cyberlife blends four distinct gameplay traditions into a unified browser experience:
- **Desktop Cybersecurity Depth** *(inspired by Hacker Simulator)*: Authentic terminal workflows, synthetic SIEM logs, packet analysis, identity audits, and incident forensics.
- **Physical Urban Exploration** *(inspired by GTA)*: Walkable city block explorable in switchable first-person or third-person perspective, featuring apartments, cafes, corporate offices, and observant NPCs.
- **Personal Life & Progression** *(inspired by The Sims)*: Managing personal finances, paying rent, balancing fatigue and focus, upgrading workstation hardware, and building professional reputation.
- **Emerging AI-Era Threat Modeling**: Investigating simulated autonomous AI agents, excessive IAM privileges, indirect prompt injection, tool-calling hijackings, and data exposure.

All gameplay runs locally in modern desktop web browsers without external game servers, live cloud connections, or third-party AI APIs. Crucially, **no prior cybersecurity knowledge or command-line experience is required**—an accessible, progressive player guidance system provides step-by-step instructions, visual evidence cues, and plain-language explanations throughout every mission (see [PLAYER_GUIDANCE.md](file:///Users/protector/Documents/projects/cyberlife/docs/PLAYER_GUIDANCE.md)).

---

## 2. Core Design Pillars

1. **Persistent and Coherent World Simulation**: In-game actions produce permanent, logical consequences across digital systems, physical locations, NPC memories, and economic balances.
2. **Meaningful Cybersecurity Gameplay**: Investigations reflect authentic defensive methodologies—threat modeling, log correlation, least-privilege auditing, evidence preservation, and root-cause remediation.
3. **Player-Directed Exploration and Personal Life**: Players seamlessly transition between walking neighborhood streets, talking with residents, sitting at workstations, and managing personal wellbeing.
4. **AI-Native Simulated Threats**: Focuses on modern and emerging vulnerabilities—autonomous AI agents, prompt injection vectors, context poisoning, and privilege escalation.
5. **Transferable Cybersecurity Learning**: Teaches real conceptual reasoning (how systems fail and how to defend them) without ever exposing or teaching weaponized exploit payloads.
6. **Accessible, Step-by-Step Player Guidance**: Designed for beginners with numbered actionable tasks, exact simulated command copy/paste, visual evidence highlights, contextual hints without penalties, and plain-language jargon explanations (see [PLAYER_GUIDANCE.md](file:///Users/protector/Documents/projects/cyberlife/docs/PLAYER_GUIDANCE.md)).
7. **Progression and Ownership**: Hard-won incident bounties translate into tangible hardware upgrades, higher consulting tiers, and an improved living environment.
8. **Player Wellbeing and Privacy**: Strictly client-side execution with zero trackers, zero data harvesting, and no predatory monetization mechanics.

---

## 3. Technical Stack & Responsibilities

The planned technological baseline for Cyberlife has been architected for strict separation of concerns, performance, and testability:

| Technology | Layer | Status | Responsibility |
|---|---|---|---|
| **TypeScript** | Universal | Implemented & Verified (M1) | Strict type-safety, strict compiler checks, interface contracts |
| **Three.js** | Presentation | Implemented & Verified (M1) | 3D rendering, canvas management, camera projection, animation loop |
| **React** | Presentation | Implemented & Verified (M1) | Game HUD, status overlays, accessible guidance panels, shell composition |
| **Vite** | Build & Dev Tooling | Implemented & Verified (M1) | Fast HMR dev server, optimized production bundling, code-splitting |
| **Vitest** | Testing | Implemented & Verified (M1) | Fast, headless unit & component test runner with V8 coverage |
| **Zod** | Validation & Persistence | Planned (M3, M9) | Runtime schema validation for content, commands, and save game states |
| **Playwright** | Testing | Planned (M11) | Cross-browser end-to-end regression testing across Chromium, Firefox, WebKit |
| **IndexedDB** | Persistence | Planned (M9) | Non-blocking, versioned local browser storage with schema migrations |

> **Verification Note**: At Milestone 0, the repository structure, documentation, and architectural contracts are established. Runtime packages (`node_modules`) and build configurations will be installed and verified in Milestone 1.

---

## 4. Simulation Safety Boundary

Cyberlife enforces an **absolute, non-negotiable simulation safety boundary** (see [ADR-001](file:///Users/protector/Documents/projects/cyberlife/docs/decisions/ADR-001-simulation-boundary.md)):

```
       +----------------------------------------------------------------+
       |                  IN-GAME VIRTUAL SHELL                         |
       |  (Pure AST Parser - Allow-listed Virtual Commands Only)         |
       +-------------------------------+--------------------------------+
                                       │
                                       ▼  (Pure In-Memory Evaluation)
       +----------------------------------------------------------------+
       |               SYNTHETIC SIMULATION STATE                       |
       |  - Virtual Networks (RFC 1918 Private Subnets)                 |
       |  - Virtual DNS (*.cedarline.internal)                          |
       |  - Virtual IAM (Synthetic Principals, Roles, & Tokens)         |
       |  - Virtual SIEM Logs (In-Memory JSON Event Buffer)             |
       +----------------------------------------------------------------+
                                       ✕  NO ESCAPE / NO BRIDGING
==================================================================================
                 [ ISOLATION BARRIER: BROWSER SANDBOX ]
==================================================================================
                                       ✕  NO REAL TRAFFIC
       +----------------------------------------------------------------+
       |                   REAL WORLD / HOST SYSTEM                     |
       |  - No host OS execution (no bash, child_process, or cmd)        |
       |  - No real network scanning or external socket connections     |
       |  - No access to real accounts, credentials, or live APIs       |
       +----------------------------------------------------------------+
```

1. **Zero Host Execution**: The virtual terminal parses commands against an allow-list (`nmap`, `curl`, `grep`, `cat`, `ssh`, etc.) and evaluates them against an in-memory virtual file system and network model. It never executes host operating-system binaries.
2. **Zero External Network Traffic**: Network commands query an in-memory virtual network graph. No real network requests, socket connections, or scans leave the browser.
3. **Purely Synthetic Identities**: All organizations (e.g. Cedarline Services), IP addresses (`10.0.x.x`), user credentials, domains, and incident logs are completely fictional.

---

## 5. Planned First Playable Experience: The Aster Incident

The vertical slice (Milestones M1–M6) centers on **The Aster Incident** at fictional company **Cedarline Services**:

1. **Explore the Neighborhood**: The player navigates the walkable street in 3rd or 1st person, absorbing environmental storytelling and discovering local points of interest.
2. **Speak to an Employee**: The player talks with Marcus, an anxious Cedarline sysadmin seated outside the local coffee shop, receiving a consulting tip-off and VPN access credentials.
3. **Open the Virtual Desktop**: Returning to their apartment workstation, the player boots the virtual desktop operating system and logs into Cedarline's telemetry gateway.
4. **Investigate Simulated Alerts**: Using `siem-query` and the SIEM Viewer app, the player triages anomalous token consumption and database read spikes associated with autonomous agent "Aster".
5. **Trace Root Cause & Preserve Evidence**: The player inspects execution logs to discover an indirect prompt injection payload delivered via support ticket, and discovers an excessive IAM privilege (`AdminS3FullAccess`). The player preserves cryptographic SHA-256 evidence hashes in their Evidence Locker.
6. **Contain the Incident**: The player issues containment commands to revoke the compromised API token (`tok_cedar_aster_prod`) and isolate the staging agent subnet.
7. **Remediate & Validate**: The player updates Aster's IAM policy to enforce least-privilege boundaries, configures input delimiter guards, and executes the in-game automated validation test.
8. **Submit a Report**: Using the Report Authoring app, the player compiles findings and submits the incident report to Cedarline management.
9. **Receive Rewards & Consequences**: The report is graded, issuing a bounty payout and reputation boost. In-game emails and NPC dialogue react to the outcome.
10. **Save and Reload**: The game automatically checkpoints progress to IndexedDB, allowing seamless recovery upon browser reload.

---

## 6. Architecture Overview

Cyberlife strictly implements **Clean Architecture** with a unidirectional **Command-Event flow** (see [ARCHITECTURE.md](file:///Users/protector/Documents/projects/cyberlife/docs/ARCHITECTURE.md) and [ADR-002](file:///Users/protector/Documents/projects/cyberlife/docs/decisions/ADR-002-authoritative-state.md)):

```
  +-----------------------------------------------------------------------+
  | PRESENTATION LAYER                                                    |
  | Three.js World (3D Canvas, Cameras) | React UI (HUD, Desktop, Modals) |
  +-----------------------------------▲-----------------------------------+
                                      │ Reads State / Dispatches Commands
  +-----------------------------------▼-----------------------------------+
  | APPLICATION LAYER                                                     |
  | CommandBus | InteractionRouter | MissionLifecycle | PersistencePort   |
  +-----------------------------------▲-----------------------------------+
                                      │ Orchestrates Use Cases
  +-----------------------------------▼-----------------------------------+
  | AUTHORITATIVE SIMULATION ENGINE (Headless, 100% Deterministic)        |
  | World Clock | Actors & NPCs | Cyber Simulation | Economy | Narrative  |
  +-----------------------------------▲-----------------------------------+
                                      │ Enforces Invariants
  +-----------------------------------▼-----------------------------------+
  | DOMAIN LAYER                                                          |
  | Pure Entities | Value Objects | Domain Events | Domain Errors         |
  +-----------------------------------------------------------------------+
```

- **Presentation (`src/presentation/`)**: Three.js renders 3D graphics; React renders 2D UI windows. Neither owns authoritative gameplay rules.
- **Application (`src/application/`)**: Routes commands, orchestrates multi-step workflows, and connects ports to adapters.
- **Simulation (`src/simulation/`)**: The authoritative state machine. Testable headlessly in Node.js without WebGL, DOM, or React.
- **Domain (`src/domain/`)**: Pure business models and contracts with zero external dependencies.
- **Persistence (`src/application/persistence/`)**: Serializes simulation state to IndexedDB with versioned schema migrations.
- **Content (`src/content/`, `public/content/`)**: Declarative JSON scenarios, mission graphs, and dialogue definitions.

---

## 7. Repository Structure

```
cyberlife/
├── README.md                           # Master project guide (this document)
├── CONTRIBUTING.md                     # Contribution standards, milestone gating, conventions
├── .gitignore                          # Zero-secrets policy and build/test exclusions
├── .editorconfig                       # Cross-editor formatting specifications
│
├── docs/                               # Comprehensive project documentation
│   ├── VISION.md                       # Inspirations, creative philosophy, game vision
│   ├── ARCHITECTURE.md                 # Layer contracts, data flow, headless engine design
│   ├── MILESTONES.md                   # M0–M11 roadmap with Definition of Done
│   ├── DEVELOPMENT_GUIDE.md            # Onboarding tutorials, how-tos, coding standards
│   ├── SIMULATION_RULES.md             # Virtual network, IAM, prompt injection, and SIEM rules
│   ├── ACCEPTANCE_CRITERIA.md          # Milestone verification matrices and quality gates
│   ├── PLAYER_GUIDANCE.md              # Player assistance, instruction format, Aster walkthrough
│   └── decisions/                      # Architecture Decision Records
│       ├── ADR-001-simulation-boundary.md  # Virtual sandbox & host isolation
│       ├── ADR-002-authoritative-state.md  # Headless engine & Command-Event CQRS
│       └── ADR-003-persistence-strategy.md# IndexedDB storage & schema migrations
│
├── public/                             # Static assets served directly by Vite
│   ├── assets/                         # Binary assets (models, audio, textures)
│   │   ├── environment/                # 3D buildings, streets, lighting maps
│   │   ├── characters/                 # 3D character meshes and animation rigs
│   │   ├── props/                      # Interactable item models (workstations, doors)
│   │   └── audio/                      # Ambient loops, keystroke sounds, UI chimes
│   └── content/                        # Declarative scenario definitions
│       ├── missions/                   # Mission JSON files (e.g. aster-incident.json)
│       ├── organizations/              # Organization profiles, topologies, SIEM logs
│       └── dialogue/                   # Branching dialogue trees
│
├── src/                                # Source code
│   ├── app/                            # Composition root & dependency injection wiring
│   ├── presentation/                   # Outer visual layer (Three.js & React UI)
│   │   ├── world/                      # Three.js canvas, scene, cameras, spatial triggers
│   │   ├── hud/                        # Status overlays, reticle, notifications
│   │   ├── desktop/                    # Virtual desktop, window manager, terminal, apps
│   │   └── dialogue/                   # Branching dialogue modal & player choice UI
│   ├── application/                    # Application orchestration
│   │   ├── commands/                   # Command definitions, validation, CommandBus
│   │   ├── interaction/                # Proximity routing & interaction state machine
│   │   ├── missions/                   # Mission lifecycle & objective coordinators
│   │   └── persistence/                # IndexedDB adapter & schema migration runner
│   ├── simulation/                     # Authoritative headless game engine
│   │   ├── engine/                     # Simulation loop, tick scheduler, reducer pipeline
│   │   ├── world/                      # In-game calendar, time elapsed, zone metadata
│   │   ├── actors/                     # NPC knowledge trees, trust ratings, schedules
│   │   ├── cyber/                      # Virtual network, IAM, AI agent, SIEM, terminal
│   │   ├── economy/                    # Bank ledger, expenses, fatigue/energy curves
│   │   └── narrative/                  # Incident containment status & narrative triggers
│   ├── domain/                         # Pure domain entities, value objects, events, errors
│   ├── content/                        # Content schemas, loaders, and Zod validators
│   └── styles/                         # Global styles, typography, theme tokens
│
└── tests/                              # Automated testing suites
    ├── unit/                           # Headless domain & simulation tests (<10ms)
    ├── integration/                    # Multi-subsystem command & mission flow tests
    ├── e2e/                            # Playwright automated browser tests
    └── fixtures/                       # Deterministic test data & save game snapshots
```

---

## 8. Prerequisites

To develop on Cyberlife, ensure your local environment meets the following requirements:

- **Node.js**: `v20.0.0` or higher (verified on Node.js `v25.9.0`).
- **Package Manager**: `npm` `v10.0.0` or higher (verified on npm `v11.12.1`).
- **Operating System**: macOS, Linux, or Windows (WSL2 recommended for Windows).
- **Web Browser**: Modern desktop browser supporting WebGL2 (Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari).
- **Version Control**: Git `v2.30+` (verified on Git `v2.50.1`).

---

## 9. Installation and Startup

```bash
# 1. Clone the repository
git clone https://github.com/7H3-PR073C70R/CYBERLIFE.git
cd cyberlife

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

### Verified Development & Quality Commands

All commands below are configured and validated:

| Command | Status | Description |
|---|---|---|
| `npm install` | **Verified** | Install pinned dependencies |
| `npm run dev` | **Verified** | Start Vite local development server with HMR at `http://localhost:5173` |
| `npm run build` | **Verified** | Compile production bundle into `dist/` with chunk splitting |
| `npm run preview` | **Verified** | Locally preview production build |
| `npm run typecheck` | **Verified** | Run strict TypeScript compiler verification (`tsc --noEmit`) |
| `npm run lint` | **Verified** | Run ESLint with `@typescript-eslint` and `react-hooks` |
| `npm run lint:fix` | **Verified** | Auto-fix supported linter issues |
| `npm run format` | **Verified** | Format codebase using Prettier |
| `npm run format:check` | **Verified** | Verify formatting compliance with Prettier |
| `npm run test` | **Verified** | Run Vitest unit, component, and lifecycle tests |
| `npm run test:watch` | **Verified** | Run Vitest in interactive watch mode |
| `npm run test:coverage` | **Verified** | Generate V8 test code coverage report |

---

## 10. Development Workflow

1. **Verify Milestone Scope**: Before beginning any task, consult [MILESTONES.md](file:///Users/protector/Documents/projects/cyberlife/docs/MILESTONES.md) to confirm the active milestone and its explicit exclusions.
2. **Follow Inward Dependency Rules**:
   - Write pure business logic and invariants in `src/domain/`.
   - Implement state transition rules in `src/simulation/`. Write unit tests in `tests/unit/` and verify headlessly.
   - Implement application use cases and commands in `src/application/`.
   - Implement rendering and UI in `src/presentation/`.
3. **Validate Simulation Safety**: Ensure terminal tools only query the virtual simulation state. Never add network calls to external URLs or host OS execution.
4. **Enforce Test-Driven Invariants**: Write unit tests alongside all new domain entities and simulation reducers.
5. **Comply with Milestone Gates**: Every milestone must satisfy its Definition of Done and Acceptance Criteria before the subsequent milestone starts.

For full developer tutorials, consult [DEVELOPMENT_GUIDE.md](file:///Users/protector/Documents/projects/cyberlife/docs/DEVELOPMENT_GUIDE.md).

---

## 11. Current Status

- **Active Milestone**: **Milestone 4 — Virtual Desktop & Interaction Systems** (Completed and Verified).
- **Completed Deliverables**:
  - **In-World Workstation Integration (`WorldEnvironment.ts`, `WorldSceneManager.ts`, `WorldViewport.tsx`)**:
    - Proximity interactable workstation desks in Cedarline corporate lobby and Apartment interior with prompt `access Cedarline corporate terminal [E]`.
    - Seamless transition to virtual desktop with strict 3D movement and camera isolation (`PlayerController.isInputDisabled`, `WorldCameraController.setEnabled(false)`, `exitPointerLock()`).
    - Smooth return-to-world on `Escape` key or `Exit Desktop` taskbar action, restoring player controls with zero position loss.
  - **Virtual Desktop Environment (`src/presentation/desktop/`)**:
    - Glassmorphism CyberOS desktop with wallpaper, watermark, desktop icons, and empty desktop hint.
    - Draggable window manager (`useWindowManager`, `WindowFrame.tsx`) with boundary clamping, minimizing, restoring, and z-index focus stacking.
    - Single-instance application policy focusing existing windows on duplicate launch.
    - Taskbar (`Taskbar.tsx`) with CyberOS Start menu, active window tabs, live M3 simulation clock, green `Simulated OS` host isolation badge, and `Exit Desktop` button.
  - **Headless Terminal Engine (`src/simulation/cyber/terminal/`)**:
    - Pure parser and registry (`TerminalCommandParser.ts`, `TerminalCommandRegistry.ts`) with zero outer dependencies.
    - Explicit M4 command set: `help`, `clear`, `whoami`, `date`, `status`, `history`.
    - `date` command synchronously reading authoritative M3 simulation clock (`08:00 AM, Monday, Oct 12, 2026`).
    - Absolute host sandbox isolation: zero host execution, shell injection prevention (`;`, `|`, `&`, `>`, `<` rejected with friendly guidance).
  - **Discoverable Applications**:
    - `TerminalApp`: Prompt, scrollable output, Up/Down arrow history recall, 1-click quick command suggestion chips (`[help]`, `[whoami]`, `[date]`, `[status]`, `[history]`, `[clear]`), and beginner hint banner.
    - `FieldGuideApp`: Multi-tab cybersecurity reference book (Basics, Command Reference, Core Concepts, and Safety Guarantee).
    - `SystemInfoApp`: Read-only virtual node specs synchronized with M3 state revision and simulation clock.
    - `NotesApp`: IT onboarding memo and session scratchpad.
  - **Accessible Player Guidance (`ObjectiveTrackerHUD.tsx`)**:
    - First-time desktop orientation modal explaining fictional sandbox nature and safety guarantee.
    - 8-part task guidance structure with `[Repeat Instructions]` toggle.
  - **Automated Test Suite**:
    - 239 passing tests across 33 test files with 0 failures in headless Node/Vitest.
    - 16 terminal parser tests, 8 window manager tests, 8 terminal app tests, 7 desktop shell tests, and 6 workstation integration tests.
  - **Real Browser Verification**:
    - Live browser validation confirming workstation approach, desktop transition, window management, terminal commands, quick chips, and clean exit back to 3D world.
- **Explicit Exclusions (Deferred to M5+)**:
  - Full cybersecurity tools (`nmap`, `curl`, `grep`, `siem-query`) and virtual network topology (deferred to M5).
  - Complete Aster Incident investigation mission graph (deferred to M6).
- **Next Milestone**: **Milestone 5 — Cybersecurity Simulation & Tools** (Synthetic subnets, IAM policies, SIEM logs, simulated AI agent, and cybersecurity terminal tools).

---

## 12. Player Controls Reference

| Action | Primary Control | Secondary Control | Notes |
|---|---|---|---|
| **Move Forward** | `W` | `Up Arrow` | Normalized diagonal speed (isolated while in Desktop) |
| **Move Backward** | `S` | `Down Arrow` | Normalized diagonal speed (isolated while in Desktop) |
| **Move Left** | `A` | `Left Arrow` | Camera-relative lateral motion (isolated while in Desktop) |
| **Move Right** | `D` | `Right Arrow` | Camera-relative lateral motion (isolated while in Desktop) |
| **Switch Camera Mode** | `V` | HUD Toggle Button | Toggles between 3rd-Person and 1st-Person |
| **Interact / Enter Workstation** | `E` | HUD `[E] Activate` | Activates workstation desk, door, or noticeboard |
| **Exit Desktop / Release Look** | `Escape` | Taskbar `Exit Desktop` | Closes virtual desktop and restores 3D controls |
| **Look Around** | `Mouse` | — | Active in 1st-person mode with pointer lock |
| **Terminal Command History** | `Up / Down Arrows`| — | Cycles through previously entered terminal commands |
| **Quick Command Execution** | Click suggestion chip | — | 1-click execution for `[help]`, `[whoami]`, `[date]`, etc. |
| **Toggle Controls Guide**| HUD `Controls [WASD]`| HUD `Hide Guide [X]` | Opens/dismisses accessible controls help |
| **Open Dev Sim Drawer** | HUD `[Dev Sim]` | HUD `[Close]` | Opens developer simulation inspector |

---

## 13. Milestone Roadmap Summary

| Milestone | Title | Focus Area | Status |
|---|---|---|---|
| **M0** | Repository Foundation & Documentation | Architecture, directory layout, ADRs, documentation | **Completed** |
| **M1** | Bootable Application Foundation | Vite, React, Three.js canvas mount, TypeScript strictness, CI tests | **Completed** |
| **M2** | 3D Neighborhood & Player Controller | Walkable 3D city block, collision, 1st/3rd person camera, triggers | **Completed** |
| **M2.5** | Lagos Island Environment | Authentic Lagos Island district: Broad St, Marina, Balogun market, Danfo | **Completed** |
| **M3** | Simulation Engine & State Management | Headless authoritative state machine, CommandBus, pure reducers | **Completed** |
| **M4** | Virtual Desktop & Interaction Systems | In-world workstation, window manager, terminal, apps, guidance | **Completed** |
| **M5** | Cybersecurity Simulation & Tools | Virtual network, IAM, SIEM logs, simulated AI agent, terminal tools | *Next* |
| **M6** | Aster Incident Mission | Complete 10-stage investigation, containment, remediation, reporting |
| **M7** | NPCs & Persistent Consequences | NPC memory, reactive dialogue, simulated email and news feeds |
| **M8** | Career, Economy, & Life Simulation | Banking, rent, workstation hardware upgrades, energy/fatigue |
| **M9** | Persistence & Recovery | IndexedDB save/load, auto-save checkpoints, schema migrations |
| **M10** | Onboarding & Learning | Interactive tutorial, in-game Field Guide, transfer scenario |
| **M11** | Quality & Release Readiness | Cross-browser QA, Playwright E2E suite, performance optimization |

See [MILESTONES.md](file:///Users/protector/Documents/projects/cyberlife/docs/MILESTONES.md) for complete deliverables, exclusions, and acceptance criteria.

---

## 13. Contribution & Project Principles

- **Milestone Gating**: Work proceeds sequentially. Features outside the active milestone cannot be merged.
- **Strict Clean Architecture**: Simulation logic must remain 100% testable without WebGL or DOM.
- **Security-First Simulation**: Zero real-world command execution or external network scanning.
- **Zero Secrets**: Never commit real credentials, tokens, or environment secrets to git.
- **Accessibility & Contrast**: Interfaces must support keyboard navigation and meet WCAG 2.1 AA standards.

Please review [CONTRIBUTING.md](file:///Users/protector/Documents/projects/cyberlife/CONTRIBUTING.md) for commit standards, pull request templates, and code review criteria.
