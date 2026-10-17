# Presentation Layer (`src/presentation/`)

The Presentation layer is the outermost UI and rendering layer.

## Architectural Contracts
1. **Three.js Renders Only**: Visual 3D scene elements, meshes, lights, shaders, and camera controllers live in `src/presentation/world/`. They own **zero** authoritative gameplay rules.
2. **React Displays & Dispatches**: UI components (`hud/`, `desktop/`, `dialogue/`) display read-only projections of simulation state and dispatch typed `Command` objects to the application layer.
3. **No Direct Simulation Mutation**: UI components never mutate game state properties directly.
4. **No Direct Domain Invariant Logic**: Checking whether an action is permitted (e.g., spending money, revoking tokens) is evaluated by the simulation engine, not inside React components.

## Subdirectories
- `world/`: Three.js scene graph, canvas mount, cameras (1st/3rd person), mesh loaders, and spatial trigger volumes.
- `hud/`: Head-up display (compass, time of day, player energy/stress, notification toasts, quick overlay notes).
- `desktop/`: Virtual workstation window manager, taskbar, dock, and simulated desktop apps (Terminal, SIEM Viewer, File Explorer, Mail, Browser).
- `dialogue/`: Branching dialogue modal, NPC portrait display, dialogue choices, and text typewriter animation.
