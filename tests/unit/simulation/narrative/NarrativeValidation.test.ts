import { describe, it, expect } from 'vitest';
import {
  validateNarrativeDataCatalog,
  NarrativeDataCatalog,
} from '@/simulation/narrative/narrativeValidator';
import {
  STORY_ARCS,
  STORY_CHAPTERS,
  NARRATIVE_MISSIONS,
  FACTION_DEFINITIONS,
  INVESTIGATIVE_CONCLUSIONS,
} from '@/simulation/narrative/narrativeData';

describe('Milestone 14 — Narrative Definition Validation', () => {
  it('validates that the authored narrative catalog is 100% structurally valid with zero errors', () => {
    const catalog: NarrativeDataCatalog = {
      arcs: STORY_ARCS,
      chapters: STORY_CHAPTERS,
      missions: NARRATIVE_MISSIONS,
      factions: FACTION_DEFINITIONS,
      conclusions: INVESTIGATIVE_CONCLUSIONS,
    };

    const result = validateNarrativeDataCatalog(catalog);
    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  describe('Error Detection & Defensive Validation', () => {
    it('catches missing IDs on story arcs', () => {
      const brokenCatalog: NarrativeDataCatalog = {
        arcs: [{ ...STORY_ARCS[0]!, id: '' }],
        chapters: STORY_CHAPTERS,
        missions: NARRATIVE_MISSIONS,
        factions: FACTION_DEFINITIONS,
        conclusions: INVESTIGATIVE_CONCLUSIONS,
      };

      const result = validateNarrativeDataCatalog(brokenCatalog);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_FIELD' && e.entityType === 'ARC')).toBe(true);
    });

    it('catches duplicate story arc IDs', () => {
      const brokenCatalog: NarrativeDataCatalog = {
        arcs: [STORY_ARCS[0]!, STORY_ARCS[0]!],
        chapters: STORY_CHAPTERS,
        missions: NARRATIVE_MISSIONS,
        factions: FACTION_DEFINITIONS,
        conclusions: INVESTIGATIVE_CONCLUSIONS,
      };

      const result = validateNarrativeDataCatalog(brokenCatalog);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'DUPLICATE_ID' && e.entityType === 'ARC')).toBe(true);
    });

    it('catches chapters referencing non-existent story arcs', () => {
      const brokenCatalog: NarrativeDataCatalog = {
        arcs: STORY_ARCS,
        chapters: [{ ...STORY_CHAPTERS[0]!, arcId: 'non_existent_arc' }],
        missions: NARRATIVE_MISSIONS,
        factions: FACTION_DEFINITIONS,
        conclusions: INVESTIGATIVE_CONCLUSIONS,
      };

      const result = validateNarrativeDataCatalog(brokenCatalog);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          e => e.code === 'MISSING_REFERENCE' && e.message.includes('non_existent_arc')
        )
      ).toBe(true);
    });

    it('catches story arcs referencing non-existent chapter IDs', () => {
      const brokenCatalog: NarrativeDataCatalog = {
        arcs: [{ ...STORY_ARCS[0]!, chapterIds: ['ch_ghost_chapter'] }],
        chapters: STORY_CHAPTERS,
        missions: NARRATIVE_MISSIONS,
        factions: FACTION_DEFINITIONS,
        conclusions: INVESTIGATIVE_CONCLUSIONS,
      };

      const result = validateNarrativeDataCatalog(brokenCatalog);
      expect(result.isValid).toBe(false);
      expect(
        result.errors.some(
          e => e.code === 'MISSING_REFERENCE' && e.message.includes('ch_ghost_chapter')
        )
      ).toBe(true);
    });

    it('catches missions referencing non-existent chapters or factions', () => {
      const brokenCatalog: NarrativeDataCatalog = {
        arcs: STORY_ARCS,
        chapters: STORY_CHAPTERS,
        missions: [
          {
            ...NARRATIVE_MISSIONS[0]!,
            chapterId: 'ch_invalid',
            assignedFactionId: 'faction_fake',
          },
        ],
        factions: FACTION_DEFINITIONS,
        conclusions: INVESTIGATIVE_CONCLUSIONS,
      };

      const result = validateNarrativeDataCatalog(brokenCatalog);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('ch_invalid'))).toBe(true);
      expect(result.errors.some(e => e.message.includes('faction_fake'))).toBe(true);
    });

    it('catches objectives with broken alternativeObjectiveId references', () => {
      const brokenCatalog: NarrativeDataCatalog = {
        arcs: STORY_ARCS,
        chapters: STORY_CHAPTERS,
        missions: [
          {
            ...NARRATIVE_MISSIONS[0]!,
            objectives: [
              {
                id: 'obj_1',
                type: 'INVESTIGATE_EVIDENCE',
                title: 'Obj 1',
                description: 'Desc',
                alternativeObjectiveId: 'obj_does_not_exist',
              },
            ],
          },
        ],
        factions: FACTION_DEFINITIONS,
        conclusions: INVESTIGATIVE_CONCLUSIONS,
      };

      const result = validateNarrativeDataCatalog(brokenCatalog);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_REFERENCE' && e.message.includes('obj_does_not_exist'))).toBe(true);
    });

    it('catches factions with initialStanding out of range [-100, 100]', () => {
      const brokenCatalog: NarrativeDataCatalog = {
        arcs: STORY_ARCS,
        chapters: STORY_CHAPTERS,
        missions: NARRATIVE_MISSIONS,
        factions: [{ ...FACTION_DEFINITIONS[0]!, initialStanding: 150 }],
        conclusions: INVESTIGATIVE_CONCLUSIONS,
      };

      const result = validateNarrativeDataCatalog(brokenCatalog);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'INVALID_RANGE' && e.entityType === 'FACTION')).toBe(true);
    });

    it('catches conclusions referencing non-existent arcs or invalid confidence scores', () => {
      const brokenCatalog: NarrativeDataCatalog = {
        arcs: STORY_ARCS,
        chapters: STORY_CHAPTERS,
        missions: NARRATIVE_MISSIONS,
        factions: FACTION_DEFINITIONS,
        conclusions: [{ ...INVESTIGATIVE_CONCLUSIONS[0]!, arcId: 'arc_ghost', confidenceScore: -10 }],
      };

      const result = validateNarrativeDataCatalog(brokenCatalog);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.code === 'MISSING_REFERENCE')).toBe(true);
      expect(result.errors.some(e => e.code === 'INVALID_RANGE')).toBe(true);
    });
  });
});
