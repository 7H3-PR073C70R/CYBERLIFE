/**
 * Cyberlife — Milestone 11: Catalogue Schema & Integrity Validator
 *
 * Performs deterministic static checks:
 * 1. Unique and stable catalogue entry IDs.
 * 2. Valid prerequisite references (all prerequisites point to known catalogue IDs).
 * 3. Prerequisite cycle detection (no circular dependencies).
 * 4. Valid exerciseId references (all playable entries point to an existing PracticalExercise).
 * 5. Required field completeness (title, summary, learning objectives, rubric).
 * 6. Stable ID format checking (valid regex [a-z0-9_]+).
 */

import { CatalogueEntry, PracticalExercise } from './types';

export interface ValidationIssue {
  readonly type: 'error' | 'warning';
  readonly code: string;
  readonly message: string;
  readonly entityId?: string;
}

export interface CatalogueValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly ValidationIssue[];
  readonly warnings: readonly ValidationIssue[];
  readonly totalEntries: number;
  readonly playableEntriesCount: number;
}

const STABLE_ID_REGEX = /^[a-z0-9_]+$/;

/**
 * Validates the complete catalogue entries and practical exercises catalogs.
 */
export function validateCatalogue(
  entries: readonly CatalogueEntry[],
  exercises: readonly PracticalExercise[]
): CatalogueValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  const entryIds = new Set<string>();
  const exerciseIds = new Set<string>();

  // 1. Check entry ID uniqueness and format
  for (const entry of entries) {
    if (!entry.id || !STABLE_ID_REGEX.test(entry.id)) {
      errors.push({
        type: 'error',
        code: 'INVALID_ID_FORMAT',
        message: `Catalogue entry ID '${entry.id}' is missing or does not match regex [a-z0-9_]+.`,
        entityId: entry.id,
      });
    }

    if (entryIds.has(entry.id)) {
      errors.push({
        type: 'error',
        code: 'DUPLICATE_ENTRY_ID',
        message: `Duplicate catalogue entry ID detected: '${entry.id}'.`,
        entityId: entry.id,
      });
    } else {
      entryIds.add(entry.id);
    }

    // Required fields check
    if (!entry.title || entry.title.trim().length === 0) {
      errors.push({
        type: 'error',
        code: 'MISSING_TITLE',
        message: `Catalogue entry '${entry.id}' is missing a title.`,
        entityId: entry.id,
      });
    }

    if (!entry.summary || entry.summary.trim().length === 0) {
      errors.push({
        type: 'error',
        code: 'MISSING_SUMMARY',
        message: `Catalogue entry '${entry.id}' is missing a summary.`,
        entityId: entry.id,
      });
    }

    if (!entry.learningObjectives || entry.learningObjectives.length === 0) {
      errors.push({
        type: 'error',
        code: 'EMPTY_LEARNING_OBJECTIVES',
        message: `Catalogue entry '${entry.id}' must provide at least one learning objective.`,
        entityId: entry.id,
      });
    }
  }

  // 2. Check exercise ID uniqueness and format
  for (const ex of exercises) {
    if (!ex.id || !STABLE_ID_REGEX.test(ex.id)) {
      errors.push({
        type: 'error',
        code: 'INVALID_EXERCISE_ID_FORMAT',
        message: `Exercise ID '${ex.id}' is missing or does not match regex [a-z0-9_]+.`,
        entityId: ex.id,
      });
    }

    if (exerciseIds.has(ex.id)) {
      errors.push({
        type: 'error',
        code: 'DUPLICATE_EXERCISE_ID',
        message: `Duplicate practical exercise ID detected: '${ex.id}'.`,
        entityId: ex.id,
      });
    } else {
      exerciseIds.add(ex.id);
    }

    // Check exercise points back to a valid catalogue entry
    if (!entryIds.has(ex.catalogueEntryId)) {
      errors.push({
        type: 'error',
        code: 'BROKEN_CATALOGUE_REFERENCE',
        message: `Exercise '${ex.id}' references unknown catalogueEntryId '${ex.catalogueEntryId}'.`,
        entityId: ex.id,
      });
    }

    // Check exercise rubric has positive weight summing to 100
    if (!ex.rubric || ex.rubric.length === 0) {
      errors.push({
        type: 'error',
        code: 'MISSING_RUBRIC',
        message: `Exercise '${ex.id}' must provide an assessment rubric.`,
        entityId: ex.id,
      });
    } else {
      const totalWeight = ex.rubric.reduce((sum, item) => sum + item.weight, 0);
      if (Math.abs(totalWeight - 100) > 0.01) {
        warnings.push({
          type: 'warning',
          code: 'RUBRIC_WEIGHT_MISMATCH',
          message: `Exercise '${ex.id}' rubric total weight is ${totalWeight}%, expected 100%.`,
          entityId: ex.id,
        });
      }
    }
  }

  // 3. Check broken prerequisite references and playable exercise link
  for (const entry of entries) {
    for (const prereqId of entry.prerequisites) {
      if (!entryIds.has(prereqId)) {
        errors.push({
          type: 'error',
          code: 'BROKEN_PREREQUISITE',
          message: `Catalogue entry '${entry.id}' references nonexistent prerequisite '${prereqId}'.`,
          entityId: entry.id,
        });
      }
    }

    if (entry.status === 'playable') {
      if (!entry.exerciseId) {
        errors.push({
          type: 'error',
          code: 'PLAYABLE_WITHOUT_EXERCISE',
          message: `Catalogue entry '${entry.id}' is marked 'playable' but has no exerciseId.`,
          entityId: entry.id,
        });
      } else if (!exerciseIds.has(entry.exerciseId)) {
        errors.push({
          type: 'error',
          code: 'BROKEN_EXERCISE_LINK',
          message: `Catalogue entry '${entry.id}' references unknown exerciseId '${entry.exerciseId}'.`,
          entityId: entry.id,
        });
      }
    }
  }

  // 4. Prerequisite Cycle Detection (DFS)
  const entryMap = new Map(entries.map(e => [e.id, e]));
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function detectCycle(nodeId: string, path: string[]): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const node = entryMap.get(nodeId);
    if (node) {
      for (const neighborId of node.prerequisites) {
        if (!visited.has(neighborId)) {
          if (detectCycle(neighborId, [...path, neighborId])) {
            return true;
          }
        } else if (recursionStack.has(neighborId)) {
          errors.push({
            type: 'error',
            code: 'CIRCULAR_PREREQUISITE_DEPENDENCY',
            message: `Circular prerequisite cycle detected: ${[...path, neighborId].join(' -> ')}`,
            entityId: nodeId,
          });
          return true;
        }
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const entry of entries) {
    if (!visited.has(entry.id)) {
      detectCycle(entry.id, [entry.id]);
    }
  }

  const playableCount = entries.filter(e => e.status === 'playable').length;

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    totalEntries: entries.length,
    playableEntriesCount: playableCount,
  };
}
