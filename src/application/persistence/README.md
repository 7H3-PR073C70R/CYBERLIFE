# Persistence & Storage Adapters (`src/application/persistence/`)
Implements the domain `PersistencePort` with IndexedDB. Handles serialization, deserialization, save slot management, and sequential schema migrations.
Never saves Three.js scene graphs or ephemeral UI state.
