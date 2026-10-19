/**
 * Cyberlife — Milestone 9: Persistence Types
 *
 * Defines versioned save game data structures, slot management types,
 * integrity metadata, and storage state.
 */

import type { SimulationState } from '../../simulation/core/types';

export const CURRENT_SAVE_SCHEMA_VERSION = 1;
export const SUPPORTED_SAVE_SLOT_IDS = ['slot_1', 'slot_2', 'slot_3'] as const;
export type SaveSlotId = (typeof SUPPORTED_SAVE_SLOT_IDS)[number];

export type SaveSlotStatus = 'EMPTY' | 'VALID' | 'CORRUPT' | 'INCOMPATIBLE';

export type SaveStatus = 'IDLE' | 'SAVING' | 'SAVED' | 'ERROR';

export type SaveErrorType =
  | 'STORAGE_UNAVAILABLE'
  | 'QUOTA_EXCEEDED'
  | 'VALIDATION_FAILED'
  | 'CHECKSUM_MISMATCH'
  | 'UNSUPPORTED_VERSION'
  | 'SLOT_NOT_FOUND'
  | 'UNKNOWN';

export interface SaveGameMetadata {
  readonly slotId: string;
  readonly schemaVersion: number;
  readonly createdAtIso: string;
  readonly updatedAtIso: string;
  readonly revision: number;
  readonly simulationTimeSeconds: number;
  readonly simulationDateString: string;
  readonly simulationTimeString: string;
  readonly playerLocationId: string;
  readonly playerRole: string;
  readonly moneyKobo: number;
  readonly careerLevel: number;
  readonly completedJobsCount: number;
  readonly asterIncidentPhase: string;
  readonly notes?: string;
}

export interface SaveGameRecord {
  readonly metadata: SaveGameMetadata;
  readonly state: SimulationState;
  readonly checksum: string;
}

export interface SaveSlotSummary {
  readonly slotId: string;
  readonly status: SaveSlotStatus;
  readonly metadata?: SaveGameMetadata;
  readonly hasBackup: boolean;
  readonly errorMessage?: string;
}

export interface SaveResult {
  readonly success: boolean;
  readonly slotId: string;
  readonly metadata?: SaveGameMetadata;
  readonly error?: string;
  readonly errorType?: SaveErrorType;
}

export interface LoadResult {
  readonly success: boolean;
  readonly slotId: string;
  readonly record?: SaveGameRecord;
  readonly error?: string;
  readonly errorType?: SaveErrorType;
  readonly wasMigrated?: boolean;
  readonly recoveredFromBackup?: boolean;
}

import type { SaveManager } from './SaveManager';
import type { PersistencePort } from '../../domain/ports/PersistencePort';
import type { ReactNode } from 'react';

export interface PersistenceContextValue {
  readonly saveManager: SaveManager;
  readonly status: SaveStatus;
  readonly lastSavedTime: Date | null;
  readonly lastError: string | null;
  readonly activeSlotId: string;
  readonly slots: ReadonlyArray<SaveSlotSummary>;
  readonly isInitialized: boolean;
  readonly refreshSlots: () => Promise<void>;
  readonly saveGame: (slotId?: string, notes?: string) => Promise<SaveResult>;
  readonly loadGame: (slotId?: string) => Promise<LoadResult>;
  readonly restoreFromBackup: (slotId: string) => Promise<LoadResult>;
  readonly deleteSlot: (slotId: string) => Promise<void>;
  readonly resetToNewGame: () => void;
  readonly isSaveModalOpen: boolean;
  readonly openSaveModal: () => void;
  readonly closeSaveModal: () => void;
}

export interface PersistenceProviderProps {
  readonly children: ReactNode;
  readonly storageOverride?: PersistencePort;
  readonly autoLoadOnStart?: boolean;
}
