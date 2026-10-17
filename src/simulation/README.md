# Authoritative Simulation Layer (`src/simulation/`)

The Simulation layer is the authoritative, deterministic core of Cyberlife.

## Critical Invariant: 100% Headless & Isolated
- **Zero WebGL / Three.js Imports**: This layer must **never** import `three`, meshes, cameras, or shaders.
- **Zero DOM / React Imports**: Must not import `react`, `react-dom`, HTML elements, or browser hooks.
- **Pure Node/Vitest Testability**: All simulation rules, network graphs, terminal tools, and economy math must be fully executable and verifiable in pure Node.js in milliseconds.

## Subsystems
- `engine/`: The core `SimulationEngine` coordinating tick loops, event dispatching, and state transitions.
- `world/`: In-game clock, day/night cycles, spatial coordinates, and zone metadata.
- `actors/`: Player state, NPC knowledge trees, trust ratings, and movement routines.
- `cyber/`: Synthetic networks, subnets, DNS resolvers, IAM policies, SIEM telemetry, simulated AI agents, and virtual terminal tools.
- `economy/`: Bank balances, daily rent deductions, bounty payouts, equipment inventory, and energy/fatigue curves.
- `narrative/`: Mission condition evaluations, incident containment state, and world news generation.
