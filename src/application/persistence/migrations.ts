/**
 * Cyberlife — Milestone 9: Save Migration Pipeline
 *
 * Implements versioned schema migrations to ensure backward compatibility
 * as save formats evolve across milestones.
 */

import type { SimulationState } from '../../simulation/core/types';
import type { SaveGameRecord, SaveGameMetadata } from './types';
import { CURRENT_SAVE_SCHEMA_VERSION } from './types';
import { calculateStateChecksum } from './checksum';
import { createInitialSkillState } from '../../simulation/career/skillDefinitions';
import { DEFAULT_RECURRING_EXPENSES } from '../../simulation/career/shopDefinitions';
import { createInitialCatalogueState } from '../../simulation/catalogue/catalogueHandler';

export class MigrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MigrationError';
  }
}

export class UnsupportedFutureVersionError extends MigrationError {
  readonly version: number;
  constructor(version: number) {
    super(
      `Save file was created with a newer version of Cyberlife (schema v${version} > supported v${CURRENT_SAVE_SCHEMA_VERSION}). Please update Cyberlife to load this save.`
    );
    this.name = 'UnsupportedFutureVersionError';
    this.version = version;
  }
}

export interface MigrationResult {
  readonly wasMigrated: boolean;
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly record: SaveGameRecord;
}

/**
 * Migrates a raw save record up to the current schema version.
 * If the record is already at current version, returns it unchanged.
 * If the record is from a future version, throws UnsupportedFutureVersionError.
 */
export function migrateSaveRecord(raw: unknown): MigrationResult {
  if (!raw || typeof raw !== 'object') {
    throw new MigrationError('Invalid save record: null or non-object');
  }

  const record = raw as Record<string, unknown>;
  const metadata = (record.metadata ?? {}) as Record<string, unknown>;
  const schemaVersion = typeof metadata.schemaVersion === 'number' ? metadata.schemaVersion : 0;

  if (schemaVersion > CURRENT_SAVE_SCHEMA_VERSION) {
    throw new UnsupportedFutureVersionError(schemaVersion);
  }

  if (schemaVersion === CURRENT_SAVE_SCHEMA_VERSION) {
    return {
      wasMigrated: false,
      fromVersion: schemaVersion,
      toVersion: CURRENT_SAVE_SCHEMA_VERSION,
      record: raw as SaveGameRecord,
    };
  }

  let currentState = JSON.parse(JSON.stringify(record.state ?? {})) as SimulationState;
  let currentMetadata = JSON.parse(JSON.stringify(metadata)) as SaveGameMetadata;
  let currentVersion = schemaVersion;

  // Stepwise migrations:
  // V0 -> V1: Add Career, Jobs, Skills, and Economy if missing
  if (currentVersion === 0) {
    const migrated = migrateV0ToV1(currentState, currentMetadata);
    currentState = migrated.state;
    currentMetadata = migrated.metadata;
    currentVersion = 1;
  }

  // Calculate new checksum for the migrated state
  const newChecksum = calculateStateChecksum(currentState);

  const migratedRecord: SaveGameRecord = {
    metadata: currentMetadata,
    state: currentState,
    checksum: newChecksum,
  };

  return {
    wasMigrated: true,
    fromVersion: schemaVersion,
    toVersion: CURRENT_SAVE_SCHEMA_VERSION,
    record: migratedRecord,
  };
}

/**
 * Migration from Schema V0 (pre-M8 or prototype save) to Schema V1.
 * Safely backfills career, skills, and economy without altering existing progress.
 */
function migrateV0ToV1(
  state: Partial<SimulationState>,
  meta: Partial<SaveGameMetadata>
): { state: SimulationState; metadata: SaveGameMetadata } {
  // Deep copy state to ensure non-mutation
  const nextState = { ...state } as Record<string, unknown>;

  // 1. Ensure career state exists
  if (!nextState.career) {
    nextState.career = {
      currentPathId: 'career_sec_analyst',
      currentLevel: 1,
      roleTitle: 'Trainee Security Analyst',
      employer: 'Cedarline Services (Marina Branch)',
      xp: 0,
      promotionsEarned: 0,
      promotionEligible: false,
    };
  }

  // 2. Ensure jobs state exists
  if (!nextState.jobs) {
    nextState.jobs = {
      availableJobIds: ['job_cedarline_triage', 'job_marina_port_audit'],
      activeJobs: [],
      completedJobHistory: [],
    };
  }

  // 3. Ensure skills state exists
  if (!nextState.skills) {
    nextState.skills = createInitialSkillState();
  }

  // 4. Ensure economy state exists
  if (!nextState.economy) {
    const moneyKobo = (nextState.player as { moneyKobo?: number })?.moneyKobo ?? 250000;
    nextState.economy = {
      transactions: [
        {
          id: 'tx_migrated_initial',
          type: 'INITIAL_BALANCE',
          amountKobo: moneyKobo,
          direction: 'CREDIT',
          balanceAfterKobo: moneyKobo,
          timestamp:
            (nextState.time as { simulationTimeSeconds?: number })?.simulationTimeSeconds ?? 0,
          description: 'Migrated starting funds',
        },
      ],
      recurringExpenses: [...DEFAULT_RECURRING_EXPENSES],
    };
  }

  // 5. Ensure onboarding state exists
  if (!nextState.onboarding) {
    nextState.onboarding = {
      introCompleted: false,
      introSkipped: false,
      completedStepIds: [],
      dismissedHintIds: [],
      guidanceMode: 'guided',
      activeStepId: 'step_intro_welcome',
    };
  }

  // 6. Ensure catalogue state exists
  if (!nextState.catalogue) {
    nextState.catalogue = createInitialCatalogueState();
  }

  const now = new Date().toISOString();
  const nextMeta: SaveGameMetadata = {
    slotId: meta.slotId ?? 'slot_1',
    schemaVersion: 1,
    createdAtIso: meta.createdAtIso ?? now,
    updatedAtIso: now,
    revision: (meta.revision ?? 0) + 1,
    simulationTimeSeconds:
      (nextState.time as { simulationTimeSeconds?: number })?.simulationTimeSeconds ?? 0,
    simulationDateString:
      (nextState.time as { calendar?: { dateString?: string } })?.calendar?.dateString ??
      'Monday, Oct 12, 2026',
    simulationTimeString:
      (nextState.time as { calendar?: { timeString?: string } })?.calendar?.timeString ??
      '08:00 AM',
    playerLocationId: (nextState.player as { locationId?: string })?.locationId ?? 'neighborhood',
    playerRole:
      (nextState.career as { roleTitle?: string })?.roleTitle ?? 'Trainee Security Analyst',
    moneyKobo: (nextState.player as { moneyKobo?: number })?.moneyKobo ?? 250000,
    careerLevel: (nextState.career as { currentLevel?: number })?.currentLevel ?? 1,
    completedJobsCount:
      (nextState.jobs as { completedJobHistory?: unknown[] })?.completedJobHistory?.length ?? 0,
    asterIncidentPhase: (nextState.mission as { phase?: string })?.phase ?? 'briefing',
    notes: 'Migrated from v0 schema',
  };

  return {
    state: nextState as unknown as SimulationState,
    metadata: nextMeta,
  };
}
