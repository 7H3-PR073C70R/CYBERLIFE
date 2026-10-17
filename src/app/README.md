# Application Entry & Composition Root (`src/app/`)

The application bootstrapping and dependency injection composition root.

## Responsibilities (Planned for M1+)
- Instantiates the `SimulationEngine` and binds domain ports to concrete adapters (IndexedDB, audio, clock).
- Sets up the `CommandBus` and `EventBus`.
- Mounts the root React component tree (`App.tsx`).
- Orchestrates initial save game loading or new game initialization.
