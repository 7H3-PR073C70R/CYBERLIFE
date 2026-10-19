import { describe, it, expect } from 'vitest';
import {
  validateSaveRecord,
  createSaveMetadata,
} from '../../../src/application/persistence/schema';
import {
  calculateStateChecksum,
  verifyStateChecksum,
} from '../../../src/application/persistence/checksum';
import {
  migrateSaveRecord,
  UnsupportedFutureVersionError,
} from '../../../src/application/persistence/migrations';
import { createInitialSimulationState } from '../../../src/simulation/core/initialState';
import type { SaveGameRecord } from '../../../src/application/persistence/types';

describe('Save Schema, Checksums & Migrations', () => {
  it('validates a valid current-version save record', () => {
    const state = createInitialSimulationState();
    const metadata = createSaveMetadata(state, 'slot_1');
    const checksum = calculateStateChecksum(state);

    const record: SaveGameRecord = {
      metadata,
      state,
      checksum,
    };

    const result = validateSaveRecord(record);
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.data).toBeDefined();
  });

  it('rejects malformed records missing essential metadata', () => {
    const state = createInitialSimulationState();
    const record = {
      metadata: {
        slotId: '', // invalid empty slotId
        schemaVersion: -1, // invalid negative version
      },
      state,
      checksum: 'abc',
    };

    const result = validateSaveRecord(record);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('detects domain invariant violations in state', () => {
    const state = createInitialSimulationState();
    // Tamper with state to violate domain invariant
    const invalidState = {
      ...state,
      player: {
        ...state.player,
        moneyKobo: -500, // Negative money invariant violation!
      },
    };

    const metadata = createSaveMetadata(state, 'slot_1');
    const checksum = calculateStateChecksum(invalidState);

    const record = {
      metadata,
      state: invalidState,
      checksum,
    };

    const result = validateSaveRecord(record);
    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Domain invariant violation'))).toBe(true);
  });

  it('calculates deterministic checksums and detects state tampering', () => {
    const state = createInitialSimulationState();
    const checksum1 = calculateStateChecksum(state);
    const checksum2 = calculateStateChecksum(state);

    expect(checksum1).toBe(checksum2);
    expect(checksum1).toMatch(/^[0-9a-f]{8}$/i);
    expect(verifyStateChecksum(state, checksum1)).toBe(true);

    // Tamper with a flag
    const tamperedState = {
      ...state,
      flags: {
        ...state.flags,
        unauthorized_flag: true,
      },
    };

    expect(verifyStateChecksum(tamperedState, checksum1)).toBe(false);
  });

  it('migrates a Schema V0 fixture to V1 preserving existing progress and backfilling career/skills', () => {
    const baseState = createInitialSimulationState();
    // Simulate a legacy V0 save that predated M8 career and economy
    const v0State = {
      metadata: baseState.metadata,
      time: baseState.time,
      player: {
        ...baseState.player,
        moneyKobo: 500_000, // ₦5,000.00
      },
      inventory: baseState.inventory,
      flags: {
        ...baseState.flags,
        mission_aster_phase: 'investigation',
      },
      timers: baseState.timers,
      nextTimerSequence: baseState.nextTimerSequence,
      mission: baseState.mission,
      npcs: baseState.npcs,
      // No career, jobs, skills, or economy!
    };

    const v0Raw = {
      metadata: {
        slotId: 'slot_1',
        schemaVersion: 0,
        createdAtIso: '2026-10-15T08:00:00.000Z',
        updatedAtIso: '2026-10-15T09:00:00.000Z',
        revision: 4,
        simulationTimeSeconds: 3600,
      },
      state: v0State,
      checksum: 'legacy_checksum',
    };

    const migration = migrateSaveRecord(v0Raw);
    expect(migration.wasMigrated).toBe(true);
    expect(migration.fromVersion).toBe(0);
    expect(migration.toVersion).toBe(1);

    const migratedState = migration.record.state;
    // Check preserved progress
    expect(migratedState.player.moneyKobo).toBe(500_000);
    expect(migratedState.flags['mission_aster_phase']).toBe('investigation');

    // Check backfilled career, jobs, skills, economy
    expect(migratedState.career).toBeDefined();
    expect(migratedState.career?.currentPathId).toBe('career_sec_analyst');
    expect(migratedState.jobs).toBeDefined();
    expect(migratedState.jobs?.availableJobIds.length).toBeGreaterThan(0);
    expect(migratedState.skills).toBeDefined();
    expect(migratedState.skills?.log_analysis.level).toBe(1);
    expect(migratedState.economy).toBeDefined();
    expect(migratedState.economy?.transactions[0]?.amountKobo).toBe(500_000);

    // Migrated record must validate completely
    const validation = validateSaveRecord(migration.record);
    expect(validation.isValid).toBe(true);
  });

  it('safely rejects unsupported future schema versions with descriptive error', () => {
    const futureRaw = {
      metadata: {
        slotId: 'slot_1',
        schemaVersion: 99, // Future version 99
      },
      state: {},
      checksum: 'future_hash',
    };

    expect(() => migrateSaveRecord(futureRaw)).toThrow(UnsupportedFutureVersionError);
  });
});
