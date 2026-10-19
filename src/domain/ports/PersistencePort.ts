/**
 * Cyberlife — Persistence Port Interface (Clean Architecture)
 *
 * Defines the contract for persistent storage of game save records.
 * Decoupled from concrete storage mechanisms (IndexedDB, in-memory, localStorage).
 */

import type { SaveGameRecord, SaveSlotSummary } from '../../application/persistence/types';

export interface PersistencePort {
  /**
   * Initializes the storage mechanism (e.g. opens database, creates object stores).
   */
  init(): Promise<void>;

  /**
   * Atomically saves a game record to the specified slot.
   * If a previous valid record exists, a backup should be preserved.
   */
  save(slotId: string, record: SaveGameRecord): Promise<void>;

  /**
   * Loads a game record from the specified slot.
   * Returns null if the slot is empty.
   */
  load(slotId: string): Promise<SaveGameRecord | null>;

  /**
   * Lists summaries of all known save slots.
   */
  listSlots(): Promise<ReadonlyArray<SaveSlotSummary>>;

  /**
   * Deletes a save slot and its backup.
   */
  delete(slotId: string): Promise<void>;

  /**
   * Checks whether a backup exists for the given slot.
   */
  hasBackup(slotId: string): Promise<boolean>;

  /**
   * Restores a save record from the backup of the specified slot.
   */
  restoreBackup(slotId: string): Promise<SaveGameRecord | null>;

  /**
   * Clears all save slots (for test teardown or hard reset).
   */
  clearAll(): Promise<void>;
}
