/**
 * Cyberlife — Milestone 9: IndexedDB Storage Adapter
 *
 * Implements PersistencePort using native browser IndexedDB with atomic transactions,
 * shadow backups, and resilience against storage errors.
 */

import type { PersistencePort } from '../../../domain/ports/PersistencePort';
import type { SaveGameRecord, SaveSlotSummary } from '../types';
import { SUPPORTED_SAVE_SLOT_IDS } from '../types';

export const DB_NAME = 'cyberlife_persistence_db';
export const DB_VERSION = 1;
export const STORE_SAVES = 'saves';
export const STORE_BACKUPS = 'backups';

export class IndexedDBStorageAdapter implements PersistencePort {
  private _db: IDBDatabase | null = null;
  private _initPromise: Promise<void> | null = null;

  public async init(): Promise<void> {
    if (this._db) return;
    if (this._initPromise) return this._initPromise;

    this._initPromise = new Promise<void>((resolve, reject) => {
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB is not supported in this runtime environment'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_SAVES)) {
          db.createObjectStore(STORE_SAVES, { keyPath: 'slotId' });
        }
        if (!db.objectStoreNames.contains(STORE_BACKUPS)) {
          db.createObjectStore(STORE_BACKUPS, { keyPath: 'slotId' });
        }
      };

      request.onsuccess = event => {
        this._db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = event => {
        const error = (event.target as IDBOpenDBRequest).error;
        reject(
          new Error(`Failed to open IndexedDB "${DB_NAME}": ${error?.message ?? 'Unknown error'}`)
        );
      };

      request.onblocked = () => {
        reject(new Error(`IndexedDB open blocked: Another tab has an older version open.`));
      };
    });

    return this._initPromise;
  }

  private async _ensureDb(): Promise<IDBDatabase> {
    if (!this._db) {
      await this.init();
    }
    if (!this._db) {
      throw new Error('IndexedDB database is not initialized');
    }
    return this._db;
  }

  public async save(slotId: string, record: SaveGameRecord): Promise<void> {
    const db = await this._ensureDb();

    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_SAVES, STORE_BACKUPS], 'readwrite');
      const savesStore = tx.objectStore(STORE_SAVES);
      const backupsStore = tx.objectStore(STORE_BACKUPS);

      // 1. Read existing record to create shadow backup
      const getReq = savesStore.get(slotId);

      getReq.onsuccess = () => {
        const existing = getReq.result;
        if (existing) {
          // Store existing copy in backups
          backupsStore.put({
            slotId,
            record: existing.record,
            savedAt: new Date().toISOString(),
          });
        }

        // 2. Put new record into saves store
        savesStore.put({
          slotId,
          record,
          savedAt: new Date().toISOString(),
        });
      };

      getReq.onerror = () => {
        tx.abort();
        reject(new Error(`Failed reading existing save for slot "${slotId}"`));
      };

      tx.oncomplete = () => {
        resolve();
      };

      tx.onerror = () => {
        reject(new Error(`Save transaction failed for slot "${slotId}": ${tx.error?.message}`));
      };

      tx.onabort = () => {
        reject(new Error(`Save transaction aborted for slot "${slotId}": ${tx.error?.message}`));
      };
    });
  }

  public async load(slotId: string): Promise<SaveGameRecord | null> {
    const db = await this._ensureDb();

    return new Promise<SaveGameRecord | null>((resolve, reject) => {
      const tx = db.transaction(STORE_SAVES, 'readonly');
      const store = tx.objectStore(STORE_SAVES);
      const req = store.get(slotId);

      req.onsuccess = () => {
        const res = req.result;
        resolve(res ? (res.record as SaveGameRecord) : null);
      };

      req.onerror = () => {
        reject(new Error(`Failed to load save from slot "${slotId}": ${req.error?.message}`));
      };
    });
  }

  public async listSlots(): Promise<ReadonlyArray<SaveSlotSummary>> {
    await this._ensureDb();

    const summaries: SaveSlotSummary[] = [];

    for (const slotId of SUPPORTED_SAVE_SLOT_IDS) {
      const [record, hasBackup] = await Promise.all([
        this.load(slotId).catch(() => null),
        this.hasBackup(slotId).catch(() => false),
      ]);

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
    const db = await this._ensureDb();

    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_SAVES, STORE_BACKUPS], 'readwrite');
      tx.objectStore(STORE_SAVES).delete(slotId);
      tx.objectStore(STORE_BACKUPS).delete(slotId);

      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(new Error(`Failed to delete slot "${slotId}": ${tx.error?.message}`));
      tx.onabort = () => reject(new Error(`Delete transaction aborted for slot "${slotId}"`));
    });
  }

  public async hasBackup(slotId: string): Promise<boolean> {
    const db = await this._ensureDb();

    return new Promise<boolean>((resolve, reject) => {
      const tx = db.transaction(STORE_BACKUPS, 'readonly');
      const store = tx.objectStore(STORE_BACKUPS);
      const req = store.get(slotId);

      req.onsuccess = () => {
        resolve(!!req.result);
      };

      req.onerror = () => {
        reject(new Error(`Failed to check backup for slot "${slotId}": ${req.error?.message}`));
      };
    });
  }

  public async restoreBackup(slotId: string): Promise<SaveGameRecord | null> {
    const db = await this._ensureDb();

    return new Promise<SaveGameRecord | null>((resolve, reject) => {
      const tx = db.transaction([STORE_SAVES, STORE_BACKUPS], 'readwrite');
      const backupsStore = tx.objectStore(STORE_BACKUPS);
      const savesStore = tx.objectStore(STORE_SAVES);

      const getReq = backupsStore.get(slotId);

      getReq.onsuccess = () => {
        const backupEntry = getReq.result;
        if (!backupEntry || !backupEntry.record) {
          resolve(null);
          return;
        }

        const backupRecord = backupEntry.record as SaveGameRecord;
        savesStore.put({
          slotId,
          record: backupRecord,
          restoredAt: new Date().toISOString(),
        });
      };

      getReq.onerror = () => {
        tx.abort();
        reject(new Error(`Failed to read backup for slot "${slotId}"`));
      };

      tx.oncomplete = () => {
        // Return restored record
        this.load(slotId).then(resolve).catch(reject);
      };

      tx.onerror = () => {
        reject(new Error(`Restore transaction failed for slot "${slotId}": ${tx.error?.message}`));
      };
    });
  }

  public async clearAll(): Promise<void> {
    const db = await this._ensureDb();

    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction([STORE_SAVES, STORE_BACKUPS], 'readwrite');
      tx.objectStore(STORE_SAVES).clear();
      tx.objectStore(STORE_BACKUPS).clear();

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(new Error(`Failed to clear database: ${tx.error?.message}`));
    });
  }
}
