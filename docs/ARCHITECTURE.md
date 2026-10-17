# Cyberlife — Architectural Specification & Contracts

## 1. Architectural Philosophy & Principles

Cyberlife strictly adheres to **Clean Architecture** (The Dependency Rule) and **Command-Query Responsibility Segregation (CQRS)** principles:

1. **Inward Dependency Direction**: Source dependencies point solely inward. Inner layers never import or depend on outer layers.
2. **Decoupled Simulation Engine**: The authoritative gameplay simulation is 100% headless. It operates independently of Three.js, WebGL, the browser DOM, and React.
3. **Single Source of Truth**: The simulation engine owns all gameplay state (player location, inventory, financial balances, network topologies, compromised hosts, active missions, and NPC relations). The presentation layer renders read-only reflections of this state.
4. **Deterministic Command-Event Flow**: All state modifications are driven by typed, validated `Commands` that transition the engine through pure reducers and emit typed `DomainEvents`.

```
+-----------------------------------------------------------------------------------------+
| PRESENTATION LAYER (Outer Circle)                                                       |
|   Three.js 3D Scene (Meshes, Lights, Cameras, Animation)                                |
|   React UI (HUD Overlays, Window Manager, Virtual Desktop Apps, Dialogue Panels)        |
+--------------------------------------------▲--------------------------------------------+
                                             │ Reads State / Dispatches Commands
+--------------------------------------------▼--------------------------------------------+
| APPLICATION LAYER (Coordination Circle)                                                 |
|   Command Dispatcher, Interaction Router, Mission Orchestrator, Save/Load Coordinator   |
+--------------------------------------------▲--------------------------------------------+
                                             │ Orchestrates Use Cases
+--------------------------------------------▼--------------------------------------------+
| SIMULATION ENGINE (Authoritative Core)                                                  |
|   World Simulation (Time, Neighborhood Nodes, Spatial Triggers)                         |
|   Cyber Simulation (Virtual Networks, DNS, IAM, SIEM Logs, AI Agents, Exploitation)    |
|   Life & Economy Simulation (Finances, Energy, Stress, Career Progression)              |
|   Narrative Simulation (NPC Knowledge, Dialogue State, Faction Reputation)              |
+--------------------------------------------▲--------------------------------------------+
                                             │ Enforces Domain Invariants
+--------------------------------------------▼--------------------------------------------+
| DOMAIN LAYER (Innermost Core)                                                           |
|   Entities (Player, Asset, Incident, NPC, Organization, SaveGame)                       |
|   Value Objects (IPAddress, MacAddress, AccessToken, Money, CryptographicHash)          |
|   Domain Events (IncidentDetected, TokenRevoked, MissionCompleted, DialogueChoiceMade)  |
|   Contracts & Interfaces (PersistencePort, EventPublisherPort, ClockPort)               |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Layer Specifications & Contracts

### 2.1 The Presentation Layer (`src/presentation/`)
- **Responsibilities**:
  - Initializing and driving the Three.js render loop (`requestAnimationFrame`) with frame-rate-independent delta times.
  - Managing first-person and third-person camera projections, frustum culling, post-processing, and spatial audio.
  - Rendering UI via React: the game HUD, contextual interaction prompts, accessible movement controls, and prototype overlays.
  - Capturing raw input (keyboard, mouse movement, pointer lock) and passing normalized user intents to the appropriate controllers.
- **M2 & M2.5 Subsystems & Architecture Boundaries**:
  - **`WorldSceneManager`**: Owns the WebGLRenderer, Three.js Scene, PerspectiveCamera, tropical daylight lighting, ResizeObserver, and animation loop. Orchestrates the player avatar, Lagos Island environment, collision queries, camera tracking, and callbacks to React.
  - **`WorldEnvironment`**: Procedurally builds the explorable historic Lagos Island district: Broad Street commercial spine, Marina waterfront boulevard, Balogun / Idumota market street, and Tinubu Square civic plaza, as well as interior destination scenes (`cedarline_interior`, `apartment_interior`). Implements safe, set-based geometry and material disposal to prevent double-disposal and WebGL context leakage.
  - **`Building` (`src/presentation/world/entities/Building.ts`)**: Procedural building generator supporting multiple authentic architectural styles:
    - *`AFRO_BRAZILIAN`*: Textured ochre/terracotta plaster facades, arched window hoods, decorative 2nd-floor wrought-iron style balconies, and parapet rooflines (e.g., Player Apartment at Broad Street 14, Tinubu Chambers).
    - *`COMMERCIAL_TOWER`*: Multi-storey corporate office towers with reflective horizontal window ribbons, cantilevered entrance canopies, rooftop mechanical chillers, telecommunications antenna masts, and red warning beacons (e.g., Cedarline Services Marina HQ, Eko Merchant Bank Tower).
    - *`MARKET_STOREFRONT`*: 2-storey commercial buildings featuring ground-floor corrugated roll-down metal security shutters, colorful striped canvas awnings, and painted commercial signboards (e.g., Balogun Electronics & Cables, Eko Fabrics & Lace Emporium).
  - **`LagosProps` (`src/presentation/world/entities/LagosProps.ts`)**: Procedural generators for distinct Lagos Island environmental elements:
    - *Danfo Commercial Minibus*: The iconic yellow commercial minibus with twin black racing stripes parked curbside on Broad Street with collision bounds.
    - *Balogun Market Stalls*: Wooden market stalls with striped canvas canopies and display crates (produce, textiles, electronics).
    - *Utility Poles & Overhead Cables*: Concrete utility poles with dual cross-arms, insulators, transformers, and connecting overhead electrical wires.
    - *Official Lagos State Street Signs*: Green & white enamel signposts for `"BROAD STREET"`, `"MARINA ROAD"`, `"BALOGUN STREET"`, and `"TINUBU SQUARE"`.
    - *Marina Seawall & Water*: Concrete seawall with safety railings, mooring bollards, palm promenade, and Lagos Lagoon waters.
    - *Tinubu Square Monument*: Tiered stone fountain basin with commemorative central pillar/obelisk and bronze plaque.
    - *Rooftop Water Tanks*: Ubiquitous black cylindrical polyethylene water storage tanks on elevated steel stands.
  - **`CollisionWorld`**: Manages 2D horizontal axis-aligned bounding boxes (AABBs) for buildings, stalls, seawalls, Danfo bus, kiosks, desks, and boundaries. Tests player circular footprint against obstacles and resolves collisions with wall-sliding along unblocked axes.
  - **`PlayerController`**: Listens for keyboard movement inputs (`WASD`, arrow keys), normalizes diagonal vectors, applies camera-relative motion, tests collision resolution with `CollisionWorld`, handles window blur/focus loss, and prevents input capture while interacting with UI modals or form inputs.
  - **`WorldCameraController`**: Controls active camera mode:
    - *Third-Person*: Positions camera behind and slightly above avatar (`offset: { x: 0, y: 2.2, z: 4.8 }`), orbits based on player yaw, and shows player mesh.
    - *First-Person*: Places camera at player eye height (`1.65m`), hides avatar mesh to prevent clipping, and applies mouse-look with vertical pitch clamping (`±78°`).
  - **`InteractionRegistry`**: Registers world interactables with coordinates and radii. Evaluates proximity each frame, selects nearest eligible target deterministically, and notifies HUD listeners.
  - **`LocationTransitionController`**: Safely switches scenes between the outdoor Lagos Island district and interior destinations. Debounces transitions (150ms cooldown), clears input state, teleports player and camera to safe spawn coordinates, and remembers outdoor return positions.
  - **`HUDShell` & Components (`MovementHelp`, `InteractionPrompt`, `StatusOverlay`)**: React presentation overlays positioned above the 3D canvas, displaying current location badge, camera mode toggle, contextual interaction cards, and accessible guidance.
- **Strict Invariants**:
  - **No Authoritative State**: Must never calculate or store authoritative player currency, mission progress, incident containment status, or cyber credentials.
  - **No Simulation Logic**: React components must not contain business validation rules (e.g., checking if a user has admin privileges to execute a command).
  - **Unidirectional Input**: User interactions must be converted into typed `Command` payloads and dispatched to the Application layer.
  - **Independent Testability**: Algorithms for movement normalization, collision resolution, camera pitch clamping, and target selection are decoupled from WebGL to permit fast, deterministic unit testing.

### 2.2 The Application Layer (`src/application/`)
- **Responsibilities**:
  - Providing the `SimulationProvider` and React integration hooks (`useSimulation`, `useOptionalSimulation`).
  - Connecting presentation components (HUD, Viewport) to the authoritative simulation engine without creating competing state copies.
  - Subscribing to simulation `DomainEvents` to trigger application-level side effects (audio cues, notifications, location sync).
  - Orchestrating multi-step workflows like loading a saved game, exporting incident reports, or switching camera modes.
- **Strict Invariants**:
  - Does not mutate domain entities directly; delegates all mutations to the simulation engine via commands.
  - Viewports and controllers use optional simulation adapters to operate cleanly both inside and outside the provider context during headless unit testing.

### 2.3 The Simulation Layer (`src/simulation/`)
- **Responsibilities**:
  - The deterministic, authoritative, headless heart of Cyberlife.
  - **Core State & Invariants (`src/simulation/core/`)**:
    - `SimulationState`: Authoritative typed model covering metadata (`schemaVersion: 1`, `revision`), `time`, `player`, `inventory`, `worldFlags`, and `timers`.
    - `initialState.ts`: Predictable baseline state initialization.
    - `invariants.ts`: Comprehensive invariant validator checking bounded attributes (0..100), non-negative integer currency, valid inventory stacking and quantities, flag key/value constraints, and chronological timer order.
    - `stateUtils.ts`: Immutable state freezing and deep cloning utilities.
  - **Time & Calendar Subsystem (`src/simulation/time/`)**:
    - `calendar.ts`: Pure functional civil calendar calculation mapping elapsed simulation seconds to year, month, day, day-of-week, hour, minute, second, and formatted strings (`08:00 AM`, `Monday, Oct 12, 2026`).
    - `timerManager.ts`: Deterministic in-game duration timer scheduling and execution without browser `setTimeout`. Prioritizes due timers by `dueTime`, `creationSequence`, and `timerId`.
  - **Systems Subsystem (`src/simulation/systems/`)**:
    - `playerSystem.ts`: Attribute clamped updates (`health`, `energy`), integer currency crediting and debiting, logical player location changes.
    - `inventorySystem.ts`: Canonical item registry, adding/removing items, slot capacity, max stack enforcement, and item availability checks.
    - `worldFlagsSystem.ts`: Typed string-keyed flag store supporting boolean, number, string, or null values with strict key format validation (`/^[a-z0-9_-]{1,64}$/i`).
  - **Commands Subsystem (`src/simulation/commands/`)**:
    - `commandHandler.ts`: Pure reducer executing atomic transitions for 11 distinct command types:
      - `AdvanceSimulationTime`
      - `ChangePlayerAttribute`, `SetPlayerAttribute`
      - `CreditPlayerMoney`, `DebitPlayerMoney`
      - `AddInventoryItem`, `RemoveInventoryItem`
      - `SetWorldFlag`
      - `SetLogicalPlayerLocation`
      - `ScheduleTimer`, `CancelTimer`
    - No-op commands return `isNoOp: true`, preserving state revision and emitting zero events.
    - Invariant checks run before and after execution; invalid commands return structured error results with stable error codes without state mutation.
  - **Events Subsystem (`src/simulation/events/`)**:
    - Monotonically indexed typed domain events emitted exclusively for accepted state changes.
  - **`SimulationEngine` (`src/simulation/SimulationEngine.ts`)**:
    - Public facade providing synchronous command processing (`dispatch`), state queries (`getState`), state/event subscriptions (`subscribe`, `on`), isolated listener error handling, and clean disposal (`dispose`).
- **Strict Invariants**:
  - **Zero WebGL / DOM / Three.js / React Imports**: Must run completely headlessly in Node.js or Vitest.
  - **Pure State Transition**: Given state $S$ and command $C$, produces next state $S'$ and events $E$ deterministically.

### 2.4 The Domain Layer (`src/domain/`)
- **Responsibilities**:
  - Pure domain value objects, entities, and error definitions.
  - **Integer Currency Model (`src/domain/common/Money.ts`)**:
    - Value object representing currency as an exact, non-negative integer number of kobo (100 kobo = ₦1.00 Naira).
    - Prevents floating-point rounding errors in all financial transactions.
    - Exposes immutable arithmetic (`add`, `subtract`, `multiply`), relational comparisons (`greaterThan`, `lessThan`, `equals`), and currency formatting (`format() -> "₦2,500.00"`).
  - **Domain Errors (`src/domain/errors/DomainError.ts`)**:
    - Typed error hierarchy: `ValidationError`, `InsufficientFundsError`, `InvalidArgumentError`, `InvariantViolationError`.
- **Strict Invariants**:
  - Zero external dependencies (no libraries, no React, no Three.js).

### 2.5 The Persistence Layer (`src/application/persistence/`)
- **Responsibilities**:
  - Serialization, versioning, and storage of the authoritative simulation state.
  - Schema migration runner ensuring backward compatibility between game updates.
  - IndexedDB storage adapter implementing the domain `PersistencePort`.
- **Strict Invariants**:
  - Save payloads must validate against strict Zod/TypeScript runtime schemas.
  - Three.js scene graphs, meshes, materials, and ephemeral React UI states are never persisted. Only raw simulation state is saved.

### 2.6 The Content Layer (`src/content/` & `public/content/`)
- **Responsibilities**:
  - Authoring declarative data: mission definitions, organization profiles, dialogue scripts, initial network topologies, and log generation templates.
  - Loaded into the simulation engine at startup or mission trigger time.

---

## 3. The Non-Negotiable Simulation Safety Boundary

To ensure the player's host system is never exposed to risk, Cyberlife implements a sandboxed simulation engine:

```
[ In-Game Player Input: "curl http://10.0.4.15/api/token -H 'Auth: test'" ]
                               │
                               ▼
            [ Application Layer Command Sanitizer ]
                               │
                               ▼
        [ Simulation Virtual Shell & Command Router ]
                               │
                               ├── Validates against Synthetic Allow-List:
                               │   ['nmap', 'curl', 'grep', 'ssh', 'cat', 'diff', 'ls', ...]
                               │
                               ├── Rejects any host OS bridging, shell escapes, or network calls
                               │
                               ▼
           [ Synthetic Virtual Network & Server Model ]
                               │
                               ├── Looks up virtual IP: 10.0.4.15 (Cedarline Internal Gateway)
                               ├── Evaluates synthetic ACL / Firewall rules
                               ├── Generates synthetic HTTP response & SIEM log entry
                               │
                               ▼
         [ Emits TerminalOutputEvent & SIEMUpdatedEvent ]
```

1. **Virtual Shell Isolation**: In-game terminal inputs are parsed by an abstract syntax tree (AST) parser in `src/simulation/cyber/terminal`. Commands are evaluated against virtual file systems and virtual processes.
2. **Virtual Network Stack**: IP routing, port binding, and DNS queries resolve strictly against an in-memory graph of virtual hosts. No socket or fetch calls leave the browser.
3. **Synthetic AI Agent Sandbox**: The autonomous AI agent "Aster" is simulated via stateful mock execution trees with modeled tool calling. It does not invoke live LLM APIs during core gameplay.

---

## 4. Command-Event Execution Lifecycle

Every player action moves through a standardized lifecycle:

```
[User Action] (e.g. clicks "Revoke Token" or types "revoke-token --id tok_982")
     │
     ▼
[Presentation] ──▶ Builds typed `RevokeTokenCommand { tokenId: 'tok_982', actorId: 'player' }`
     │
     ▼
[CommandBus] ──▶ Validates command schema & verifies authentication context
     │
     ▼
[Simulation Engine]
     ├── Checks invariant: Does token exist? Is it already revoked?
     ├── Mutates simulation state: Marks token as `REVOKED`, cuts active sessions
     └── Emits Domain Events:
            ├── `TokenRevocationCommittedEvent`
            ├── `SIEMSecurityAlertLoggedEvent`
            └── `MissionObjectiveUpdatedEvent` (e.g., Containment step satisfied)
     │
     ▼
[EventBus / State Projection]
     ├── Presentation (React): Re-renders Virtual Desktop with "Token Revoked" status
     ├── Presentation (Audio): Plays security action confirmation chime
     ├── Persistence: Flags state as dirty for auto-save debounce
     └── Narrative: Triggers NPC sysadmin reaction in next dialogue turn
```

---

## 5. Error Handling & Observability

- **Operational Domain Errors**: Modeled as distinct typed classes extending `DomainError` (e.g., `InvalidIpAddressError`, `PermissionDeniedSimError`, `TokenNotFoundError`, `MissionPreconditionFailedError`).
- **Input Validation**: Boundary inputs from UI forms or terminal prompts are validated with Zod schemas before being converted to commands.
- **Structured Game Logging**: Simulation events emit structured JSON log entries to an in-memory ring buffer accessible via the in-game developer console and automated test assertions.
- **Fail-Fast Invariant Enforcement**: Invalid state transitions throw explicit domain errors rather than silently corrupting game state.

---

## 6. Testing Strategy & Separation Matrix

| Layer | Testing Target | Test Type | Tooling | Dependencies Allowed |
|---|---|---|---|---|
| **Domain** | Entities, Value Objects, Invariants | Unit | Vitest | None (Pure TypeScript) |
| **Simulation** | Network routing, IAM, AI agent exploits, mission logic, economy | Unit & Integration | Vitest | Domain, Content definitions |
| **Application** | Command routing, event subscriptions, save/load pipeline | Integration | Vitest | Simulation, Persistence Mock |
| **Presentation** | React HUD, Window Manager, Dialogue UI | Component / Visual | Vitest + Testing Library | React, Tailwind/CSS |
| **Presentation** | Three.js rendering, camera switching, mesh loading | Rendering Smoke | Vitest + Mock Canvas | Three.js |
| **Full Game** | End-to-end Aster Incident investigation & completion | E2E | Playwright | Full Browser Environment |

---

## 7. Player Guidance & Accessible Task Assistance Architecture

To support players with zero technical or command-line background (see [PLAYER_GUIDANCE.md](file:///Users/protector/Documents/projects/cyberlife/docs/PLAYER_GUIDANCE.md)), Cyberlife integrates an accessible guidance architecture across all layers without violating Clean Architecture:

```
+-----------------------------------------------------------------------------------------+
| PRESENTATION LAYER                                                                      |
| - Objective Tracker HUD: Numbered micro-tasks, progress bars, [Repeat Instructions]     |
| - Terminal Helper: 1-click [Insert Command] button & syntax autocomplete                |
| - UI Focus System: Unobtrusive pulse rings on target windows/buttons in Guided mode     |
| - 3D Waypoint Markers: Proximity outlines and navigation beacons in the physical world   |
+-------------------------------------------▲---------------------------------------------+
                                            │ Projections & User Actions
+-------------------------------------------▼---------------------------------------------+
| APPLICATION LAYER                                                                       |
| - GuidanceCoordinator: Manages current 8-part task step and active AssistanceTier       |
| - HintProvider: Evaluates idle timeouts/mistakes to offer 2-tier hints (Nudge/Explicit) |
| - MissionJournalService: Persists discovered clues, hashes, and plain-language summaries|
+-------------------------------------------▲---------------------------------------------+
                                            │ Listens to Domain Events
+-------------------------------------------▼---------------------------------------------+
| SIMULATION ENGINE & DOMAIN CORE                                                         |
| - Evaluates authoritative objective criteria (e.g. was token tok_01 actually revoked?)  |
| - Emits `MissionObjectiveAchievedEvent` upon validated state changes                    |
| - Invariant: Guidance helpers dispatch standard Commands; they never bypass domain rules|
+-----------------------------------------------------------------------------------------+
```

### Architectural Guarantees for Guidance
1. **Unidirectional Guidance Flow**: Guidance state is a pure projection of the authoritative simulation state. If the simulation state indicates an incident is not contained, the guidance system cannot falsely display it as complete.
2. **Deterministic Mistake Recovery**: When an invalid command is entered into the virtual terminal, the application layer matches the error against known common beginner mistakes and returns a constructive recovery hint without crashing or penalizing the player.
3. **Assistance Tier Decoupling**: Switching between `Guided`, `Standard`, and `Independent` modes adjusts UI projections and hint visibility only; it has zero impact on simulation rules, mission rewards, or persistent state.

