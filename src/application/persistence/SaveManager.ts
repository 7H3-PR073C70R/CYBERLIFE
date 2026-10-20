/**
 * Cyberlife — Milestone 9: Save & Persistence Orchestrator
 *
 * Coordinates authoritative simulation state, persistence ports,
 * slot management, migrations, checksums, and autosave checkpoints.
 */

import type { SimulationEngine } from '../../simulation/SimulationEngine';
import type { SimulationState, SimulationTimerState } from '../../simulation/core/types';
import type { PersistencePort } from '../../domain/ports/PersistencePort';
import type {
  SaveGameRecord,
  SaveSlotSummary,
  SaveStatus,
  SaveResult,
  LoadResult,
  SaveSlotId,
} from './types';
import { createSaveMetadata, validateSaveRecord } from './schema';
import { calculateStateChecksum, verifyStateChecksum } from './checksum';
import { migrateSaveRecord } from './migrations';
import { createInitialCatalogueState } from '../../simulation/catalogue/catalogueHandler';

export interface SaveManagerOptions {
  readonly engine: SimulationEngine;
  readonly storage: PersistencePort;
  readonly defaultSlotId?: SaveSlotId;
  readonly enableAutosave?: boolean;
  readonly autosaveDebounceMs?: number;
}

export type SaveManagerListener = (status: {
  status: SaveStatus;
  lastSavedTime: Date | null;
  lastError: string | null;
  activeSlotId: string;
}) => void;

export class SaveManager {
  private readonly _engine: SimulationEngine;
  private readonly _storage: PersistencePort;
  private _activeSlotId: string;
  private _status: SaveStatus = 'IDLE';
  private _lastSavedTime: Date | null = null;
  private _lastError: string | null = null;
  private readonly _listeners = new Set<SaveManagerListener>();

  private _isSaving = false;
  private _pendingSavePromise: Promise<SaveResult> | null = null;
  private _autosaveTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly _enableAutosave: boolean;
  private readonly _autosaveDebounceMs: number;
  private _engineUnsubscribe: (() => void) | null = null;

  constructor(options: SaveManagerOptions) {
    this._engine = options.engine;
    this._storage = options.storage;
    this._activeSlotId = options.defaultSlotId ?? 'slot_1';
    this._enableAutosave = options.enableAutosave ?? true;
    this._autosaveDebounceMs = options.autosaveDebounceMs ?? 1500;

    if (this._enableAutosave) {
      this._setupAutosave();
    }
  }

  public async init(): Promise<void> {
    await this._storage.init();
  }

  public subscribe(listener: SaveManagerListener): () => void {
    this._listeners.add(listener);
    listener({
      status: this._status,
      lastSavedTime: this._lastSavedTime,
      lastError: this._lastError,
      activeSlotId: this._activeSlotId,
    });
    return () => {
      this._listeners.delete(listener);
    };
  }

  private _notify(): void {
    for (const listener of this._listeners) {
      try {
        listener({
          status: this._status,
          lastSavedTime: this._lastSavedTime,
          lastError: this._lastError,
          activeSlotId: this._activeSlotId,
        });
      } catch {
        // Isolate listener errors
      }
    }
  }

  public get activeSlotId(): string {
    return this._activeSlotId;
  }

  public setActiveSlotId(slotId: string): void {
    this._activeSlotId = slotId;
    this._notify();
  }

  public get status(): SaveStatus {
    return this._status;
  }

  public get lastSavedTime(): Date | null {
    return this._lastSavedTime;
  }

  public get lastError(): string | null {
    return this._lastError;
  }

  /**
   * Saves the current simulation state to the given or active slot.
   * Concurrency-safe: serialized through a mutex queue.
   */
  public async saveGame(slotId?: string, notes?: string): Promise<SaveResult> {
    const targetSlotId = slotId ?? this._activeSlotId;

    if (this._isSaving) {
      // If a save is already in progress, wait for it then queue another save
      if (this._pendingSavePromise) {
        await this._pendingSavePromise;
      }
    }

    this._isSaving = true;
    this._status = 'SAVING';
    this._lastError = null;
    this._notify();

    this._pendingSavePromise = this._executeSave(targetSlotId, notes);
    try {
      const result = await this._pendingSavePromise;
      if (result.success) {
        this._status = 'SAVED';
        this._lastSavedTime = new Date();
        this._activeSlotId = targetSlotId;
      } else {
        this._status = 'ERROR';
        this._lastError = result.error ?? 'Save failed';
      }
      this._notify();
      return result;
    } finally {
      this._isSaving = false;
      this._pendingSavePromise = null;
    }
  }

  private async _executeSave(slotId: string, notes?: string): Promise<SaveResult> {
    try {
      const currentState = this._engine.getState();

      // Clean transient UI state (e.g. active ongoing dialogue window) from persistent record
      const persistentState: SimulationState = {
        ...currentState,
        activeDialogue: undefined,
      };

      const metadata = createSaveMetadata(persistentState, slotId);
      if (notes) {
        (metadata as { notes?: string }).notes = notes;
      }

      const checksum = calculateStateChecksum(persistentState);

      const record: SaveGameRecord = {
        metadata,
        state: persistentState,
        checksum,
      };

      // Write atomically via persistence port
      await this._storage.save(slotId, record);

      return {
        success: true,
        slotId,
        metadata,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        slotId,
        error: errorMsg,
        errorType: 'UNKNOWN',
      };
    }
  }

  /**
   * Loads a save record from the given or active slot and restores it into the engine.
   */
  public async loadGame(slotId?: string): Promise<LoadResult> {
    const targetSlotId = slotId ?? this._activeSlotId;

    try {
      const rawRecord = await this._storage.load(targetSlotId);
      if (!rawRecord) {
        return {
          success: false,
          slotId: targetSlotId,
          error: `Save slot "${targetSlotId}" is empty`,
          errorType: 'SLOT_NOT_FOUND',
        };
      }

      // Step 1: Run migration pipeline if needed
      const migrationResult = migrateSaveRecord(rawRecord);
      const record = migrationResult.record;

      // Step 2: Validate runtime schema and invariants
      const validation = validateSaveRecord(record);
      if (!validation.isValid) {
        return {
          success: false,
          slotId: targetSlotId,
          error: `Save file validation failed: ${validation.errors.join('; ')}`,
          errorType: 'VALIDATION_FAILED',
        };
      }

      // Step 3: Verify data integrity checksum
      const isChecksumValid = verifyStateChecksum(record.state, record.checksum);
      if (!isChecksumValid) {
        return {
          success: false,
          slotId: targetSlotId,
          error: `Save file integrity check failed (checksum mismatch). Data may be corrupted.`,
          errorType: 'CHECKSUM_MISMATCH',
        };
      }

      // Step 4: Reconcile loaded state before applying to simulation
      const reconciledState = this._reconcileLoadedState(record.state);

      // Step 5: Restore state into authoritative simulation engine
      this._engine.loadState(reconciledState);

      this._activeSlotId = targetSlotId;
      this._status = 'IDLE';
      this._lastSavedTime = new Date(record.metadata.updatedAtIso);
      this._lastError = null;
      this._notify();

      return {
        success: true,
        slotId: targetSlotId,
        record,
        wasMigrated: migrationResult.wasMigrated,
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this._status = 'ERROR';
      this._lastError = errorMsg;
      this._notify();

      return {
        success: false,
        slotId: targetSlotId,
        error: errorMsg,
        errorType: 'UNKNOWN',
      };
    }
  }

  /**
   * Reconciles loaded state: prunes already-expired one-shot timers so they don't fire erroneously.
   */
  private _reconcileLoadedState(state: SimulationState): SimulationState {
    const currentSimTime = state.time.simulationTimeSeconds;

    // Filter out expired one-shot timers
    const reconciledTimers = state.timers.filter((timer: SimulationTimerState) => {
      if (timer.dueSimulationTime < currentSimTime && !timer.repeatIntervalSeconds) {
        return false; // Expired one-shot timer, omit
      }
      return true;
    });

    let reconciledMission = state.mission;
    if (reconciledMission && (reconciledMission.isCompleted || state.flags?.mission_aster_completed)) {
      const allCompletedObjectives = reconciledMission.objectives.map(obj => ({
        ...obj,
        isCompleted: true,
        completedAt: obj.completedAt ?? currentSimTime,
      }));
      reconciledMission = {
        ...reconciledMission,
        isCompleted: true,
        phase: 'completed',
        objectives: allCompletedObjectives,
      };
    }

    return {
      ...state,
      timers: reconciledTimers,
      mission: reconciledMission,
      activeDialogue: undefined, // Ensure clean start with no frozen dialogue
      onboarding: state.onboarding ?? {
        introCompleted: false,
        introSkipped: false,
        completedStepIds: [],
        dismissedHintIds: [],
        guidanceMode: 'guided',
        activeStepId: 'step_intro_welcome',
      },
      catalogue: state.catalogue ?? createInitialCatalogueState(),
    };
  }

  /**
   * Restores a corrupted slot from its shadow backup.
   */
  public async restoreFromBackup(slotId: string): Promise<LoadResult> {
    try {
      const restored = await this._storage.restoreBackup(slotId);
      if (!restored) {
        return {
          success: false,
          slotId,
          error: `No backup available for slot "${slotId}"`,
          errorType: 'SLOT_NOT_FOUND',
        };
      }

      const loadRes = await this.loadGame(slotId);
      return {
        ...loadRes,
        recoveredFromBackup: true,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        slotId,
        error: `Failed to restore from backup: ${msg}`,
        errorType: 'UNKNOWN',
      };
    }
  }

  public async deleteSlot(slotId: string): Promise<void> {
    await this._storage.delete(slotId);
    this._notify();
  }

  public resetToNewGame(): void {
    this._engine.resetToNewGame();
    this._status = 'IDLE';
    this._lastSavedTime = null;
    this._lastError = null;
    this._notify();
  }

  public async listSlots(): Promise<ReadonlyArray<SaveSlotSummary>> {
    return this._storage.listSlots();
  }

  /**
   * Sets up autosave triggers on critical state events.
   */
  private _setupAutosave(): void {
    const checkpointEventTypes = new Set<string>([
      'ITEM_PURCHASED',
      'JOB_COMPLETED',
      'CAREER_PROMOTED',
      'MISSION_CONTAINMENT_EXECUTED',
      'MISSION_REMEDIATION_APPLIED',
      'MISSION_VERIFICATION_COMPLETED',
      'MISSION_REPORT_SUBMITTED',
      'MISSION_COMPLETED',
      'NPC_RELATIONSHIP_CHANGED',
      'RECURRING_EXPENSE_PAID',
      'ONBOARDING_STEP_COMPLETED',
      'ONBOARDING_SKIPPED',
    ]);

    this._engineUnsubscribe = this._engine.subscribe((_, events) => {
      const hasCheckpointEvent = events.some(e => checkpointEventTypes.has(e.type));
      if (hasCheckpointEvent) {
        this.triggerAutosave();
      }
    });
  }

  public triggerAutosave(): void {
    if (!this._enableAutosave) return;

    if (this._autosaveTimeout) {
      clearTimeout(this._autosaveTimeout);
    }

    this._autosaveTimeout = setTimeout(() => {
      this._autosaveTimeout = null;
      this.saveGame().catch(() => {
        // Silently capture background autosave error in status
      });
    }, this._autosaveDebounceMs);
  }

  public dispose(): void {
    if (this._autosaveTimeout) {
      clearTimeout(this._autosaveTimeout);
      this._autosaveTimeout = null;
    }
    if (this._engineUnsubscribe) {
      this._engineUnsubscribe();
      this._engineUnsubscribe = null;
    }
    this._listeners.clear();
  }
}
