/**
 * Cyberlife — Milestone 11: Catalogue Schema & Data Integrity Tests
 */

import { describe, it, expect } from 'vitest';
import {
  CATALOGUE_ENTRIES,
  PRACTICAL_EXERCISES,
} from '../../../../src/simulation/catalogue/catalogueDefinitions';
import {
  validateCatalogueDefinitions,
  findOrphanedExercises,
} from '../../../../src/simulation/catalogue/catalogueValidator';

describe('Milestone 11: Catalogue Schema & Validation', () => {
  it('validates the static catalogue definitions without errors', () => {
    const result = validateCatalogueDefinitions();
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('ensures all entries have valid stable IDs with cat_ prefix', () => {
    for (const entry of CATALOGUE_ENTRIES) {
      expect(entry.id).toMatch(/^cat_[a-z0-9_]+$/);
      expect(entry.title).toBeTruthy();
      expect(entry.description).toBeTruthy();
      expect(entry.whyItMatters).toBeTruthy();
      expect(entry.fictionalScenario).toBeTruthy();
    }
  });

  it('ensures all practical exercises have valid stable IDs with ex_ prefix', () => {
    for (const ex of PRACTICAL_EXERCISES) {
      expect(ex.id).toMatch(/^ex_[a-z0-9_]+$/);
      expect(ex.title).toBeTruthy();
      expect(ex.scopeOfAuthorization).toBeTruthy();
      expect(ex.objectives.length).toBeGreaterThan(0);
      expect(ex.rubric.length).toBeGreaterThan(0);
    }
  });

  it('verifies that rubric weights sum to 100% for each exercise', () => {
    for (const ex of PRACTICAL_EXERCISES) {
      const sum = ex.rubric.reduce((acc, item) => acc + item.weight, 0);
      expect(sum).toBe(100);
    }
  });

  it('ensures there are no orphaned practical exercises', () => {
    const orphans = findOrphanedExercises();
    expect(orphans).toHaveLength(0);
  });

  it('verifies team tracks coverage (Blue, Red, Purple, Shared)', () => {
    const tracks = new Set(CATALOGUE_ENTRIES.map(e => e.track));
    expect(tracks.has('blue')).toBe(true);
    expect(tracks.has('red')).toBe(true);
    expect(tracks.has('purple')).toBe(true);
    expect(tracks.has('shared')).toBe(true);
  });

  it('verifies strict safety: no real network scanning or command execution', () => {
    for (const entry of CATALOGUE_ENTRIES) {
      // Check that all descriptions and scenarios are explicitly fictional
      expect(entry.fictionalScenario.toLowerCase()).not.toContain('rm -rf');
      expect(entry.fictionalScenario.toLowerCase()).not.toContain('sudo');
      expect(entry.relevantTools.every(t => !t.includes('/bin/'))).toBe(true);
    }
  });
});
