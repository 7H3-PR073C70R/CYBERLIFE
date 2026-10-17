# Domain Layer (`src/domain/`)

The innermost architectural core of Cyberlife.

## Architectural Contracts
1. **Zero External Dependencies**: Must not import external libraries, frameworks, UI components, or rendering engines.
2. **Pure Business Logic**: Defines entities, value objects, domain events, domain error types, and repository interfaces.
3. **Invariant Enforcement**: Value objects validate invariants at construction time (e.g. valid IP addresses, positive currency amounts, non-empty IDs).
4. **No Serialization Details**: Entities do not know about JSON or database schemas. DTO conversion lives in adapters.

## Core Domain Models (Planned for M3+)
- `entities/`: `Player`, `VirtualHost`, `IAMToken`, `Incident`, `EvidenceArtifact`, `NPC`, `Organization`.
- `value_objects/`: `IpAddress`, `MacAddress`, `Money`, `CryptographicHash`, `EnergyLevel`.
- `events/`: `IncidentDetectedEvent`, `TokenRevokedEvent`, `MissionObjectiveAchievedEvent`, `SaveTriggeredEvent`.
- `errors/`: `DomainError`, `InvalidIpAddressError`, `InsufficientFundsError`, `PermissionDeniedSimError`.
- `ports/`: `PersistencePort`, `EventPublisherPort`, `ClockPort`.
