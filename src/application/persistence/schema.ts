/**
 * Cyberlife — Milestone 9: Save Schema Runtime Validation
 *
 * Uses Zod and domain invariant validation to safely validate save records at runtime.
 * Guarantees that untrusted or damaged save data cannot crash the application.
 */

import { z } from 'zod';
import { validateSimulationState } from '../../simulation/core/invariants';
import type { SimulationState } from '../../simulation/core/types';
import type { SaveGameMetadata, SaveGameRecord } from './types';
import { CURRENT_SAVE_SCHEMA_VERSION } from './types';

export const SaveGameMetadataSchema = z.object({
  slotId: z.string().min(1),
  schemaVersion: z.number().int().positive(),
  createdAtIso: z.string().datetime(),
  updatedAtIso: z.string().datetime(),
  revision: z.number().int().nonnegative(),
  simulationTimeSeconds: z.number().nonnegative(),
  simulationDateString: z.string().min(1),
  simulationTimeString: z.string().min(1),
  playerLocationId: z.string().min(1),
  playerRole: z.string().min(1),
  moneyKobo: z.number().int().nonnegative(),
  careerLevel: z.number().int().positive(),
  completedJobsCount: z.number().int().nonnegative(),
  asterIncidentPhase: z.string().min(1),
  notes: z.string().optional(),
});

export const SaveGameRecordSchema = z.object({
  metadata: SaveGameMetadataSchema,
  state: z.record(z.unknown()), // Will be checked via validateSimulationState
  checksum: z.string().min(1),
});

export interface SchemaValidationResult {
  readonly isValid: boolean;
  readonly errors: ReadonlyArray<string>;
  readonly data?: SaveGameRecord;
}

/**
 * Validates a loaded save game record against the schema and domain invariants.
 */
export function validateSaveRecord(raw: unknown): SchemaValidationResult {
  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      errors: ['Save data is null, undefined, or not an object'],
    };
  }

  const parsed = SaveGameRecordSchema.safeParse(raw);
  if (!parsed.success) {
    const errorMessages = parsed.error.issues.map(
      issue => `${issue.path.join('.') || 'root'}: ${issue.message}`
    );
    return {
      isValid: false,
      errors: errorMessages,
    };
  }

  const record = parsed.data as unknown as SaveGameRecord;

  // Validate state against domain invariants
  try {
    validateSimulationState(record.state as SimulationState);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isValid: false,
      errors: [`Domain invariant violation in saved simulation state: ${message}`],
    };
  }

  return {
    isValid: true,
    errors: [],
    data: record,
  };
}

/**
 * Creates valid SaveGameMetadata from current authoritative SimulationState and slotId.
 */
export function createSaveMetadata(
  state: SimulationState,
  slotId: string,
  existingMetadata?: SaveGameMetadata
): SaveGameMetadata {
  const now = new Date().toISOString();
  return {
    slotId,
    schemaVersion: CURRENT_SAVE_SCHEMA_VERSION,
    createdAtIso: existingMetadata?.createdAtIso ?? now,
    updatedAtIso: now,
    revision: state.metadata.revision,
    simulationTimeSeconds: state.time.simulationTimeSeconds,
    simulationDateString: state.time.calendar.dateString,
    simulationTimeString: state.time.calendar.timeString,
    playerLocationId: state.player.locationId,
    playerRole: state.career?.roleTitle ?? 'Analyst Intern',
    moneyKobo: state.player.moneyKobo,
    careerLevel: state.career?.currentLevel ?? 1,
    completedJobsCount: state.jobs?.completedJobHistory.length ?? 0,
    asterIncidentPhase: state.mission?.phase ?? 'briefing',
  };
}
