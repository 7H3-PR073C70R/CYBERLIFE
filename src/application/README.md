# Application Layer (`src/application/`)

The Application layer coordinates use cases, orchestrates command routing, and connects domain ports to infrastructure adapters.

## Architectural Contracts
1. **Command Bus**: Validates incoming player intents (via Zod or domain value objects) and routes commands to appropriate simulation handlers.
2. **Event Dispatcher**: Listens for domain events emitted by the simulation engine and triggers side effects (audio playback, notifications, auto-save debounce).
3. **No Direct Domain Mutation**: Coordinates workflows without mutating entity internals directly.
4. **Ports & Adapters**: Defines interfaces for external infrastructure (such as IndexedDB persistence) and provides concrete implementations.

## Subdirectories
- `commands/`: Command definitions (`RevokeTokenCommand`, `SpendMoneyCommand`, `SubmitReportCommand`) and their handler orchestrators.
- `interaction/`: Interaction router mapping 3D spatial triggers and keybindings to application commands and UI modals.
- `missions/`: Mission lifecycle coordinator tracking objective prerequisites and triggering stage transitions.
- `persistence/`: Save/load orchestrator and IndexedDB adapter implementing `PersistencePort`, with schema migrations.
