import { describe, it, expect, beforeEach } from 'vitest';
import { MemoryStorageAdapter } from '../../../src/application/persistence/adapters/MemoryStorageAdapter';
import { createInitialSimulationState } from '../../../src/simulation/core/initialState';
import { createSaveMetadata } from '../../../src/application/persistence/schema';
import { calculateStateChecksum } from '../../../src/application/persistence/checksum';
import type { SaveGameRecord } from '../../../src/application/persistence/types';

describe('Persistence Storage Adapters', () => {
  let storage: MemoryStorageAdapter;

  beforeEach(async () => {
    storage = new MemoryStorageAdapter();
    await storage.init();
  });

  function createTestRecord(slotId: string, revision = 1): SaveGameRecord {
    const state = createInitialSimulationState();
    const metadata = createSaveMetadata(state, slotId);
    const checksum = calculateStateChecksum(state);
    return {
      metadata: { ...metadata, revision },
      state,
      checksum,
    };
  }

  it('initializes cleanly and starts with empty slots', async () => {
    const slots = await storage.listSlots();
    expect(slots.length).toBe(3);
    expect(slots.every(s => s.status === 'EMPTY')).toBe(true);
    expect(slots.every(s => !s.hasBackup)).toBe(true);
  });

  it('saves and loads a valid save record atomically', async () => {
    const record = createTestRecord('slot_1', 1);
    await storage.save('slot_1', record);

    const loaded = await storage.load('slot_1');
    expect(loaded).not.toBeNull();
    expect(loaded?.metadata.slotId).toBe('slot_1');
    expect(loaded?.metadata.revision).toBe(1);
    expect(loaded?.checksum).toBe(record.checksum);

    const slots = await storage.listSlots();
    const slot1 = slots.find(s => s.slotId === 'slot_1');
    expect(slot1?.status).toBe('VALID');
    expect(slot1?.metadata?.revision).toBe(1);
  });

  it('creates shadow backup when overwriting an existing slot', async () => {
    const record1 = createTestRecord('slot_1', 1);
    await storage.save('slot_1', record1);
    expect(await storage.hasBackup('slot_1')).toBe(false);

    const record2 = createTestRecord('slot_1', 2);
    await storage.save('slot_1', record2);
    expect(await storage.hasBackup('slot_1')).toBe(true);

    const active = await storage.load('slot_1');
    expect(active?.metadata.revision).toBe(2);

    // Restore backup
    const restored = await storage.restoreBackup('slot_1');
    expect(restored?.metadata.revision).toBe(1);

    const current = await storage.load('slot_1');
    expect(current?.metadata.revision).toBe(1);
  });

  it('handles simulated storage write failures gracefully without corrupting existing save', async () => {
    const initialRecord = createTestRecord('slot_1', 10);
    await storage.save('slot_1', initialRecord);

    // Simulate quota exceeded / disk full failure
    storage.setSimulatedFailure(new Error('QuotaExceededError: Local storage is full'));

    await expect(storage.save('slot_1', createTestRecord('slot_1', 11))).rejects.toThrow(
      'QuotaExceededError'
    );

    // Remove simulated error and confirm original save survived
    storage.setSimulatedFailure(null);
    const loaded = await storage.load('slot_1');
    expect(loaded?.metadata.revision).toBe(10);
  });

  it('deletes slot and shadow backup completely', async () => {
    const record = createTestRecord('slot_2', 1);
    await storage.save('slot_2', record);
    await storage.save('slot_2', { ...record, metadata: { ...record.metadata, revision: 2 } });

    expect(await storage.load('slot_2')).not.toBeNull();
    expect(await storage.hasBackup('slot_2')).toBe(true);

    await storage.delete('slot_2');

    expect(await storage.load('slot_2')).toBeNull();
    expect(await storage.hasBackup('slot_2')).toBe(false);
  });

  it('clears all slots on clearAll', async () => {
    await storage.save('slot_1', createTestRecord('slot_1', 1));
    await storage.save('slot_2', createTestRecord('slot_2', 1));

    await storage.clearAll();

    expect(await storage.load('slot_1')).toBeNull();
    expect(await storage.load('slot_2')).toBeNull();
  });
});
