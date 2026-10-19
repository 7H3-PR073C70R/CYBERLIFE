/**
 * Cyberlife — Milestone 9: In-Memory Storage Adapter
 *
 * Implements PersistencePort for headless tests, server-side environments,
 * and test harness scenarios. Supports simulated storage failures.
 */

import type { PersistencePort } from '../../../domain/ports/PersistencePort';
import type { SaveGameRecord, SaveSlotSummary } from '../types';
import { SUPPORTED_SAVE_SLOT_IDS } from '../types';

export class MemoryStorageAdapter implements PersistencePort {
  private _saves = new Map<string, SaveGameRecord>();
  private _backups = new Map<string, SaveGameRecord>();
  private _simulateFailure: Error | null = null;
  private _isInitialized = false;

  public async init(): Promise<void> {
    if (this._simulateFailure) {
      throw this._simulateFailure;
    }
    this._isInitialized = true;
  }

  public setSimulatedFailure(error: Error | null): void {
    this._simulateFailure = error;
  }

  public async save(slotId: string, record: SaveGameRecord): Promise<void> {
    if (this._simulateFailure) {
      throw this._simulateFailure;
    }

    // Backup existing slot if present
    const existing = this._saves.get(slotId);
    if (existing) {
      this._backups.set(slotId, JSON.parse(JSON.stringify(existing)));
    }

    // Save cloned record
    this._saves.set(slotId, JSON.parse(JSON.stringify(record)));
  }

  public async load(slotId: string): Promise<SaveGameRecord | null> {
    if (this._simulateFailure) {
      throw this._simulateFailure;
    }
    const item = this._saves.get(slotId);
    return item ? JSON.parse(JSON.stringify(item)) : null;
  }

  public async listSlots(): Promise<ReadonlyArray<SaveSlotSummary>> {
    if (this._simulateFailure) {
      throw this._simulateFailure;
    }

    const summaries: SaveSlotSummary[] = [];

    for (const slotId of SUPPORTED_SAVE_SLOT_IDS) {
      const record = this._saves.get(slotId);
      const hasBackup = this._backups.has(slotId);

      if (!record) {
        summaries.push({
          slotId,
          status: 'EMPTY',
          hasBackup,
        });
      } else {
        summaries.push({
          slotId,
          status: 'VALID',
          metadata: record.metadata,
          hasBackup,
        });
      }
    }

    return summaries;
  }

  public async delete(slotId: string): Promise<void> {
    if (this._simulateFailure) {
      throw this._simulateFailure;
    }
    this._saves.delete(slotId);
    this._backups.delete(slotId);
  }

  public async hasBackup(slotId: string): Promise<boolean> {
    if (this._simulateFailure) {
      throw this._simulateFailure;
    }
    return this._backups.has(slotId);
  }

  public async restoreBackup(slotId: string): Promise<SaveGameRecord | null> {
    if (this._simulateFailure) {
      throw this._simulateFailure;
    }
    const backup = this._backups.get(slotId);
    if (!backup) {
      return null;
    }
    this._saves.set(slotId, JSON.parse(JSON.stringify(backup)));
    return JSON.parse(JSON.stringify(backup));
  }

  public async clearAll(): Promise<void> {
    this._saves.clear();
    this._backups.clear();
  }

  public get isInitialized(): boolean {
    return this._isInitialized;
  }
}
