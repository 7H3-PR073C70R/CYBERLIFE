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
  - Initializing and driving the Three.js render loop (`requestAnimationFrame`).
  - Managing first-person and third-person camera projections, frustum culling, post-processing, and spatial audio.
  - Rendering UI via React: the game HUD, dialogue trees, notification toasts, inventory docks, and the multi-window virtual desktop.
  - Capturing raw input (keyboard, mouse movement, pointer lock) and passing normalized user intents to the Application layer.
- **Strict Invariants**:
  - **No Authoritative State**: Must never calculate or store authoritative player currency, mission progress, incident containment status, or cyber credentials.
  - **No Simulation Logic**: React components must not contain business validation rules (e.g., checking if a user has admin privileges to execute a command).
  - **Unidirectional Input**: User interactions must be converted into typed `Command` payloads and dispatched to the Application layer.

### 2.2 The Application Layer (`src/application/`)
- **Responsibilities**:
  - Providing the central `CommandBus` to validate and route incoming player actions to the simulation engine.
  - Subscribing to simulation `DomainEvents` to trigger application-level side effects (audio cues, save-game triggers, toast notifications).
  - Orchestrating multi-step workflows like loading a saved game, exporting incident reports, or switching camera modes.
- **Strict Invariants**:
  - Does not mutate domain entities directly; delegates all mutations to the simulation engine via commands.
  - Implements ports/adapters to isolate third-party infrastructure (e.g., IndexedDB, Web Audio API).

### 2.3 The Simulation Layer (`src/simulation/`)
- **Responsibilities**:
  - The deterministic, tick-based or event-driven heart of Cyberlife.
  - **Cyber Subsystem (`src/simulation/cyber`)**:
    - Synthetic network graph: switches, firewalls, subnets, IP routes, DNS resolvers.
    - Identity and Access Management (IAM): users, service accounts, roles, access tokens, permissions.
    - Virtual Operating Systems: synthetic file trees, environment variables, running processes.
    - Simulated AI Agent System: agent context, system prompt templates, tool-calling interfaces, permission boundaries, prompt-injection vulnerability evaluation.
    - Security Information and Event Management (SIEM): telemetry logs, connection records, authentication attempts, audit events.
  - **World Subsystem (`src/simulation/world`)**:
    - In-game clock and day/night cycle.
    - Location zones, indoor/outdoor transitions, collision bounds metadata.
  - **Life & Economy Subsystem (`src/simulation/economy`)**:
    - Player balance, bank accounts, expenses, equipment inventory.
    - Stamina, fatigue, stress curves affecting player performance.
  - **Narrative Subsystem (`src/simulation/narrative`)**:
    - NPC awareness states, relationship scores, dialogue condition flags.
    - Active mission state machine and objective evaluators.
- **Strict Invariants**:
  - **Zero WebGL / DOM Imports**: Must run completely headlessly in Node.js or Vitest.
  - **Pure State Transition**: Given initial state $S$ and command $C$, the engine produces state $S'$ and events $E$ deterministically.
  - **Idempotent Incident Rewards**: Re-evaluating completed objectives or re-submitting reports must never grant duplicate currency or reputation.

### 2.4 The Domain Layer (`src/domain/`)
- **Responsibilities**:
  - Defining pure TypeScript entities, value objects, domain errors, and interfaces.
  - Enforcing invariants at construction time (e.g., valid IP format, non-negative currency, valid SHA-256 hash format).
- **Strict Invariants**:
  - Zero external dependencies (no libraries, no React, no Three.js).
  - Entities encapsulate business logic and invariants; they are not anemic data bags.

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
