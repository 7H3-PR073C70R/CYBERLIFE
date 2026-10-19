import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SimulationEngine } from '../../../src/simulation/SimulationEngine';
import { SaveManager } from '../../../src/application/persistence/SaveManager';
import { MemoryStorageAdapter } from '../../../src/application/persistence/adapters/MemoryStorageAdapter';

describe('SaveManager Lifecycle, Autocomplete & Events', () => {
  let engine: SimulationEngine;
  let storage: MemoryStorageAdapter;
  let saveManager: SaveManager;

  beforeEach(async () => {
    vi.useFakeTimers();
    engine = new SimulationEngine();
    storage = new MemoryStorageAdapter();
    await storage.init();
    saveManager = new SaveManager({
      engine,
      storage,
      defaultSlotId: 'slot_1',
      enableAutosave: true,
      autosaveDebounceMs: 200,
    });
    await saveManager.init();
  });

  it('manages active slots and informs listeners', async () => {
    const listener = vi.fn();
    saveManager.subscribe(listener);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'IDLE',
        activeSlotId: 'slot_1',
      })
    );

    saveManager.setActiveSlotId('slot_2');
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        activeSlotId: 'slot_2',
      })
    );
  });

  it('performs manual save and updates status', async () => {
    const saveRes = await saveManager.saveGame('slot_1');
    expect(saveRes.success).toBe(true);
    expect(saveManager.status).toBe('SAVED');
    expect(saveManager.lastSavedTime).not.toBeNull();
  });

  it('fails gracefully when loading an empty slot', async () => {
    const loadRes = await saveManager.loadGame('slot_3');
    expect(loadRes.success).toBe(false);
    expect(loadRes.errorType).toBe('SLOT_NOT_FOUND');
  });

  it('triggers debounced autosave on checkpoint domain events', async () => {
    // Dispatch a purchase item command which emits ItemPurchased event
    const cmdResult = engine.dispatch({
      type: 'PurchaseItem',
      itemId: 'item_privacy_screen_filter',
    });
    expect(cmdResult.success).toBe(true);

    // Fast-forward debounce timer
    await vi.advanceTimersByTimeAsync(250);

    const slot1 = await storage.load('slot_1');
    expect(slot1).not.toBeNull();
    expect(saveManager.status).toBe('SAVED');
  });

  it('detects checksum corruption and allows recovery from shadow backup', async () => {
    // 1. Initial valid save
    await saveManager.saveGame('slot_1');

    // 2. Second valid save (creates shadow backup of save 1)
    engine.dispatch({ type: 'CreditMoney', amountKobo: 50_000 });
    await saveManager.saveGame('slot_1');

    // 3. Corrupt the active save record's checksum
    const active = await storage.load('slot_1');
    expect(active).not.toBeNull();
    const corruptedRecord = {
      ...active!,
      checksum: 'bad_checksum_1234',
    };
    // Directly inject corrupted record into storage without creating backup
    (storage as unknown as { _saves: Map<string, unknown> })._saves.set('slot_1', corruptedRecord);

    // 4. Loading corrupted slot fails checksum
    const loadCorrupt = await saveManager.loadGame('slot_1');
    expect(loadCorrupt.success).toBe(false);
    expect(loadCorrupt.errorType).toBe('CHECKSUM_MISMATCH');

    // 5. Restore from shadow backup succeeds
    const restoreRes = await saveManager.restoreFromBackup('slot_1');
    expect(restoreRes.success).toBe(true);
    expect(restoreRes.recoveredFromBackup).toBe(true);
  });

  it('resets game to new session and resets save status', () => {
    engine.dispatch({ type: 'CreditMoney', amountKobo: 100_000 });
    expect(engine.getState().player.moneyKobo).toBe(350_000);

    saveManager.resetToNewGame();

    expect(engine.getState().player.moneyKobo).toBe(250_000);
    expect(saveManager.status).toBe('IDLE');
  });
});
