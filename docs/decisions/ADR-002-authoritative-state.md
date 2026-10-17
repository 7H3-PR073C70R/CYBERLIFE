# ADR-002: Decoupled Authoritative Headless Simulation Engine with Command-Event Pattern

- **Status**: Accepted
- **Date**: 2026-10-17
- **Deciders**: Lead Software Architect & Core Engineering Team

---

## Context

In web-based games combining 3D rendering (Three.js) and complex user interfaces (React), teams frequently succumb to architectural coupling:
- Attaching authoritative gameplay properties directly to Three.js Object3D meshes (e.g. `mesh.userData.money = 500`).
- Scattering business rules, mission conditions, and transaction logic inside React UI components or lifecycle hooks (`useEffect`, `useState`).
- Allowing UI buttons or terminal windows to directly mutate shared state objects without validation.

These practices introduce fatal defects:
1. **Untestable Core Logic**: Simulation logic cannot be verified without mounting a browser DOM and WebGL canvas.
2. **State Desynchronization**: Multiple UI overlays, 3D meshes, and dialogue trees get out of sync regarding player inventory, token states, or mission progress.
3. **Save/Load Fragility**: Persisting game state requires traversing messy UI and scene-graph object trees.

---

## Decision

We establish that **authoritative gameplay state is owned entirely by a decoupled, headless simulation engine** utilizing a unidirectional **Command-Event (CQRS-inspired) pattern**:

1. **Headless Engine**:
   - `src/simulation/` contains the authoritative state tree, simulation tick loop, and reducers.
   - It is written in pure TypeScript with zero imports of `three`, `react`, `react-dom`, or browser DOM APIs.
2. **Unidirectional Command-Event Cycle**:
   - State mutations may **only** occur by dispatching typed `Command` objects through the `CommandBus`.
   - The engine validates commands against domain invariants and transitions the state tree through pure reducers.
   - Successful state transitions emit typed `DomainEvent` objects.
3. **Read-Only Presentation Projections**:
   - Three.js (`src/presentation/world/`) reads position, rotation, and animation state to render 3D visuals. It owns zero gameplay truth.
   - React UI (`src/presentation/desktop/`, `hud/`, `dialogue/`) subscribes to state slices via reactive stores and dispatches commands in response to user inputs.

---

## Consequences

### Positive
- **Blazing Fast Headless Testing**: 100% of the game simulation, economy rules, terminal tools, and mission objectives can be tested in Node.js / Vitest in milliseconds without WebGL mocking.
- **Single Source of Truth**: Eliminates race conditions and desynchronization between 3D world rendering and 2D desktop windows.
- **Trivial Serialization**: The simulation state tree is pure, plain JSON-serializable data, enabling clean IndexedDB persistence and automated schema migrations.
- **Clean Architecture Enforcement**: Presentation layers can be redesigned, replaced, or upgraded without touching domain or simulation rules.

### Negative / Trade-offs
- **Boilerplate Discipline**: Requires defining explicit `Command`, `CommandHandler`, and `DomainEvent` types for every gameplay action rather than writing quick ad-hoc state mutations.
- **Event Synchronization**: Presentation layers must cleanly subscribe and unsubscribe to state changes to avoid memory leaks.
