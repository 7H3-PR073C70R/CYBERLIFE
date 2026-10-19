/**
 * Cyberlife — Milestone 9: React Persistence Context & Hooks
 *
 * Exposes SaveManager operations to the React presentation layer,
 * HUD components, and Virtual Desktop applications.
 */

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useSimulation } from '../simulation/SimulationContext';
import { SaveManager } from './SaveManager';
import { IndexedDBStorageAdapter } from './adapters/IndexedDBStorageAdapter';
import { MemoryStorageAdapter } from './adapters/MemoryStorageAdapter';
import type { PersistencePort } from '../../domain/ports/PersistencePort';
import { PersistenceContext } from './context';
import type {
  SaveSlotSummary,
  SaveStatus,
  SaveResult,
  LoadResult,
  PersistenceContextValue,
  PersistenceProviderProps,
} from './types';

export const PersistenceProvider: React.FC<PersistenceProviderProps> = ({
  children,
  storageOverride,
  autoLoadOnStart = true,
}) => {
  const { engine } = useSimulation();

  const storage = useMemo<PersistencePort>(() => {
    if (storageOverride) return storageOverride;
    if (typeof indexedDB !== 'undefined') {
      return new IndexedDBStorageAdapter();
    }
    return new MemoryStorageAdapter();
  }, [storageOverride]);

  const saveManager = useMemo(() => {
    return new SaveManager({
      engine,
      storage,
      defaultSlotId: 'slot_1',
      enableAutosave: true,
      autosaveDebounceMs: 1500,
    });
  }, [engine, storage]);

  const [status, setStatus] = useState<SaveStatus>(saveManager.status);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(saveManager.lastSavedTime);
  const [lastError, setLastError] = useState<string | null>(saveManager.lastError);
  const [activeSlotId, setActiveSlotId] = useState<string>(saveManager.activeSlotId);
  const [slots, setSlots] = useState<ReadonlyArray<SaveSlotSummary>>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);

  const refreshSlots = useCallback(async () => {
    try {
      const summaries = await saveManager.listSlots();
      setSlots(summaries);
    } catch {
      // Ignore slot list refresh errors
    }
  }, [saveManager]);

  useEffect(() => {
    let isMounted = true;

    const initPersistence = async () => {
      try {
        await saveManager.init();
        if (!isMounted) return;

        const summaries = await saveManager.listSlots();
        if (!isMounted) return;
        setSlots(summaries);

        // Check for startup auto-load if enabled
        if (autoLoadOnStart) {
          const defaultSlot = summaries.find(s => s.slotId === 'slot_1');
          if (defaultSlot && defaultSlot.status === 'VALID') {
            await saveManager.loadGame('slot_1');
          }
        }
      } catch (err) {
        if (!isMounted) return;
        setLastError(err instanceof Error ? err.message : String(err));
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    initPersistence();

    const unsubscribe = saveManager.subscribe(state => {
      if (!isMounted) return;
      setStatus(state.status);
      setLastSavedTime(state.lastSavedTime);
      setLastError(state.lastError);
      setActiveSlotId(state.activeSlotId);
    });

    return () => {
      isMounted = false;
      unsubscribe();
      saveManager.dispose();
    };
  }, [saveManager, autoLoadOnStart]);

  const saveGame = useCallback(
    async (slotId?: string, notes?: string): Promise<SaveResult> => {
      const res = await saveManager.saveGame(slotId, notes);
      await refreshSlots();
      return res;
    },
    [saveManager, refreshSlots]
  );

  const loadGame = useCallback(
    async (slotId?: string): Promise<LoadResult> => {
      const res = await saveManager.loadGame(slotId);
      await refreshSlots();
      return res;
    },
    [saveManager, refreshSlots]
  );

  const restoreFromBackup = useCallback(
    async (slotId: string): Promise<LoadResult> => {
      const res = await saveManager.restoreFromBackup(slotId);
      await refreshSlots();
      return res;
    },
    [saveManager, refreshSlots]
  );

  const deleteSlot = useCallback(
    async (slotId: string): Promise<void> => {
      await saveManager.deleteSlot(slotId);
      await refreshSlots();
    },
    [saveManager, refreshSlots]
  );

  const resetToNewGame = useCallback(() => {
    saveManager.resetToNewGame();
    refreshSlots();
  }, [saveManager, refreshSlots]);

  const openSaveModal = useCallback(() => setIsSaveModalOpen(true), []);
  const closeSaveModal = useCallback(() => setIsSaveModalOpen(false), []);

  const value: PersistenceContextValue = {
    saveManager,
    status,
    lastSavedTime,
    lastError,
    activeSlotId,
    slots,
    isInitialized,
    refreshSlots,
    saveGame,
    loadGame,
    restoreFromBackup,
    deleteSlot,
    resetToNewGame,
    isSaveModalOpen,
    openSaveModal,
    closeSaveModal,
  };

  return <PersistenceContext.Provider value={value}>{children}</PersistenceContext.Provider>;
};
