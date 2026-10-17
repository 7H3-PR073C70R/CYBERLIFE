# ADR-003: Versioned IndexedDB Storage with Schema Migrations and Snapshot-Delta Recovery

- **Status**: Accepted
- **Date**: 2026-10-17
- **Deciders**: Lead Software Architect & Core Engineering Team

---

## Context

A browser-based RPG requires dependable client-side persistence. Players invest significant time investigating incidents, configuring workstations, accumulating currency, and advancing relationships. 

Alternative client storage options present major drawbacks:
1. **`localStorage`**:
   - Synchronous, blocking I/O on the main JavaScript thread causes noticeable frame hitching during 3D rendering.
   - Strict 5MB storage limit is insufficient for storing extensive terminal logs, command histories, and mission evidence graphs.
   - String-only storage requires repetitive serialization overhead.
2. **Cloud-Only Save Backends**:
   - Violates the core offline-capable, standalone product configuration for the single-player MVP.
   - Requires ongoing backend infrastructure, authentication servers, and hosting maintenance.

---

## Decision

We decide to implement **Versioned Local Browser Persistence using IndexedDB with strict Zod schema validation and a migration pipeline**:

1. **IndexedDB as Storage Engine**:
   - Asynchronous, non-blocking transactional storage.
   - Generous browser storage quotas (typically hundreds of megabytes).
   - Encapsulated behind an application port: `PersistencePort`.
2. **Schema Versioning & Runtime Validation**:
   - Every save payload includes an integer `schemaVersion` field.
   - Payloads are validated upon write and read using runtime Zod schemas.
   - A sequential migration runner applies forward migrations (e.g. `migrateV1ToV2`, `migrateV2ToV3`) when loading saves from earlier game versions.
3. **Save Slot Architecture**:
   - 3 Manual Save Slots + 1 Auto-Save / Checkpoint Slot.
   - Checkpoints occur automatically at key mission state transitions (e.g. incident containment completed, report submitted).
4. **Resilience & Fallback**:
   - If an active save slot fails schema validation or becomes corrupted, the system alerts the player and falls back gracefully to the most recent uncorrupted checkpoint rather than failing to boot.

---

## Consequences

### Positive
- **Smooth 60 FPS Performance**: Asynchronous persistence operations never block the Three.js render loop or React UI responsiveness.
- **Ample Storage Capacity**: Seamlessly accommodates comprehensive SIEM logs, command history buffers, and evidence graphs.
- **Future-Proof Evolution**: Game updates that modify domain entity structures will not break existing player save files due to automated migrations.
- **Zero Cloud Dependence**: Full offline capability and player privacy preservation.

### Negative / Trade-offs
- **IndexedDB API Complexity**: Requires a robust wrapper/adapter to handle browser-specific IndexedDB quirks, database version upgrades, and transaction aborts.
- **Browser Cache Clearing Risk**: If a user clears their browser storage/cookies, saves can be wiped unless an explicit JSON export/import feature is provided (included in M9).
