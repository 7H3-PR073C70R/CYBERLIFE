/**
 * Cyberlife — Milestone 14: Narrative Definition Validator
 *
 * Validates structural integrity, referenced IDs, and safe state transitions
 * for all authored Story Arcs, Chapters, Missions, Factions, and Conclusions.
 */

import {
  StoryArcDefinition,
  StoryChapterDefinition,
  NarrativeMissionDefinition,
  FactionDefinition,
  InvestigativeConclusion,
} from './narrativeTypes';

export interface NarrativeValidationError {
  readonly entityType: 'ARC' | 'CHAPTER' | 'MISSION' | 'OBJECTIVE' | 'FACTION' | 'CONCLUSION';
  readonly entityId: string;
  readonly code:
    | 'MISSING_FIELD'
    | 'DUPLICATE_ID'
    | 'MISSING_REFERENCE'
    | 'INVALID_RANGE'
    | 'CIRCULAR_TRANSITION'
    | 'ORPHANED_ENTITY';
  readonly message: string;
}

export interface NarrativeValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly NarrativeValidationError[];
}

export interface NarrativeDataCatalog {
  readonly arcs: readonly StoryArcDefinition[];
  readonly chapters: readonly StoryChapterDefinition[];
  readonly missions: readonly NarrativeMissionDefinition[];
  readonly factions: readonly FactionDefinition[];
  readonly conclusions: readonly InvestigativeConclusion[];
}

/**
 * Validates the entire narrative data catalog.
 */
export function validateNarrativeDataCatalog(
  catalog: NarrativeDataCatalog
): NarrativeValidationResult {
  const errors: NarrativeValidationError[] = [];

  // Maps for reference checking
  const arcMap = new Map<string, StoryArcDefinition>();
  const chapterMap = new Map<string, StoryChapterDefinition>();
  const missionMap = new Map<string, NarrativeMissionDefinition>();
  const factionMap = new Map<string, FactionDefinition>();
  const conclusionMap = new Map<string, InvestigativeConclusion>();

  // 1. Validate Factions
  for (const faction of catalog.factions) {
    if (!faction.id) {
      errors.push({
        entityType: 'FACTION',
        entityId: 'UNKNOWN',
        code: 'MISSING_FIELD',
        message: 'Faction definition is missing id.',
      });
      continue;
    }
    if (factionMap.has(faction.id)) {
      errors.push({
        entityType: 'FACTION',
        entityId: faction.id,
        code: 'DUPLICATE_ID',
        message: `Duplicate faction ID "${faction.id}".`,
      });
    }
    factionMap.set(faction.id, faction);

    if (!faction.name || faction.name.trim().length === 0) {
      errors.push({
        entityType: 'FACTION',
        entityId: faction.id,
        code: 'MISSING_FIELD',
        message: `Faction "${faction.id}" has empty name.`,
      });
    }
    if (faction.initialStanding < -100 || faction.initialStanding > 100) {
      errors.push({
        entityType: 'FACTION',
        entityId: faction.id,
        code: 'INVALID_RANGE',
        message: `Faction "${faction.id}" initialStanding ${faction.initialStanding} out of range [-100, 100].`,
      });
    }
  }

  // 2. Validate Arcs
  for (const arc of catalog.arcs) {
    if (!arc.id) {
      errors.push({
        entityType: 'ARC',
        entityId: 'UNKNOWN',
        code: 'MISSING_FIELD',
        message: 'Story arc definition is missing id.',
      });
      continue;
    }
    if (arcMap.has(arc.id)) {
      errors.push({
        entityType: 'ARC',
        entityId: arc.id,
        code: 'DUPLICATE_ID',
        message: `Duplicate story arc ID "${arc.id}".`,
      });
    }
    arcMap.set(arc.id, arc);

    if (!arc.title || arc.title.trim().length === 0) {
      errors.push({
        entityType: 'ARC',
        entityId: arc.id,
        code: 'MISSING_FIELD',
        message: `Story arc "${arc.id}" has empty title.`,
      });
    }
    if (!arc.chapterIds || arc.chapterIds.length === 0) {
      errors.push({
        entityType: 'ARC',
        entityId: arc.id,
        code: 'MISSING_FIELD',
        message: `Story arc "${arc.id}" has no chapterIds defined.`,
      });
    }
  }

  // 3. Validate Chapters
  for (const chapter of catalog.chapters) {
    if (!chapter.id) {
      errors.push({
        entityType: 'CHAPTER',
        entityId: 'UNKNOWN',
        code: 'MISSING_FIELD',
        message: 'Chapter definition is missing id.',
      });
      continue;
    }
    if (chapterMap.has(chapter.id)) {
      errors.push({
        entityType: 'CHAPTER',
        entityId: chapter.id,
        code: 'DUPLICATE_ID',
        message: `Duplicate chapter ID "${chapter.id}".`,
      });
    }
    chapterMap.set(chapter.id, chapter);

    if (!chapter.title || chapter.title.trim().length === 0) {
      errors.push({
        entityType: 'CHAPTER',
        entityId: chapter.id,
        code: 'MISSING_FIELD',
        message: `Chapter "${chapter.id}" has empty title.`,
      });
    }
    if (!arcMap.has(chapter.arcId)) {
      errors.push({
        entityType: 'CHAPTER',
        entityId: chapter.id,
        code: 'MISSING_REFERENCE',
        message: `Chapter "${chapter.id}" references non-existent arcId "${chapter.arcId}".`,
      });
    }
    if (!chapter.missionIds || chapter.missionIds.length === 0) {
      errors.push({
        entityType: 'CHAPTER',
        entityId: chapter.id,
        code: 'MISSING_FIELD',
        message: `Chapter "${chapter.id}" has no missionIds defined.`,
      });
    }
  }

  // Check that arc chapterIds point to valid chapters
  for (const arc of catalog.arcs) {
    for (const chId of arc.chapterIds) {
      if (!chapterMap.has(chId)) {
        errors.push({
          entityType: 'ARC',
          entityId: arc.id,
          code: 'MISSING_REFERENCE',
          message: `Arc "${arc.id}" references non-existent chapterId "${chId}".`,
        });
      }
    }
  }

  // 4. Validate Missions
  for (const mission of catalog.missions) {
    if (!mission.id) {
      errors.push({
        entityType: 'MISSION',
        entityId: 'UNKNOWN',
        code: 'MISSING_FIELD',
        message: 'Mission definition is missing id.',
      });
      continue;
    }
    if (missionMap.has(mission.id)) {
      errors.push({
        entityType: 'MISSION',
        entityId: mission.id,
        code: 'DUPLICATE_ID',
        message: `Duplicate mission ID "${mission.id}".`,
      });
    }
    missionMap.set(mission.id, mission);

    if (!mission.title || mission.title.trim().length === 0) {
      errors.push({
        entityType: 'MISSION',
        entityId: mission.id,
        code: 'MISSING_FIELD',
        message: `Mission "${mission.id}" has empty title.`,
      });
    }
    if (!chapterMap.has(mission.chapterId)) {
      errors.push({
        entityType: 'MISSION',
        entityId: mission.id,
        code: 'MISSING_REFERENCE',
        message: `Mission "${mission.id}" references non-existent chapterId "${mission.chapterId}".`,
      });
    }
    if (mission.assignedFactionId && !factionMap.has(mission.assignedFactionId)) {
      errors.push({
        entityType: 'MISSION',
        entityId: mission.id,
        code: 'MISSING_REFERENCE',
        message: `Mission "${mission.id}" references non-existent assignedFactionId "${mission.assignedFactionId}".`,
      });
    }

    // Validate Objectives
    if (!mission.objectives || mission.objectives.length === 0) {
      errors.push({
        entityType: 'MISSION',
        entityId: mission.id,
        code: 'MISSING_FIELD',
        message: `Mission "${mission.id}" has no objectives.`,
      });
    } else {
      const objIds = new Set<string>();
      for (const obj of mission.objectives) {
        if (!obj.id) {
          errors.push({
            entityType: 'OBJECTIVE',
            entityId: 'UNKNOWN',
            code: 'MISSING_FIELD',
            message: `Objective in mission "${mission.id}" is missing id.`,
          });
          continue;
        }
        if (objIds.has(obj.id)) {
          errors.push({
            entityType: 'OBJECTIVE',
            entityId: obj.id,
            code: 'DUPLICATE_ID',
            message: `Duplicate objective ID "${obj.id}" in mission "${mission.id}".`,
          });
        }
        objIds.add(obj.id);

        if (obj.alternativeObjectiveId && !mission.objectives.some(o => o.id === obj.alternativeObjectiveId)) {
          errors.push({
            entityType: 'OBJECTIVE',
            entityId: obj.id,
            code: 'MISSING_REFERENCE',
            message: `Objective "${obj.id}" references non-existent alternativeObjectiveId "${obj.alternativeObjectiveId}".`,
          });
        }
      }
    }
  }

  // Check that chapter missionIds point to valid missions
  for (const chapter of catalog.chapters) {
    for (const mId of chapter.missionIds) {
      if (!missionMap.has(mId)) {
        errors.push({
          entityType: 'CHAPTER',
          entityId: chapter.id,
          code: 'MISSING_REFERENCE',
          message: `Chapter "${chapter.id}" references non-existent missionId "${mId}".`,
        });
      }
    }

    if (chapter.branchingPaths) {
      for (const branch of chapter.branchingPaths) {
        if (!chapterMap.has(branch.nextChapterId)) {
          errors.push({
            entityType: 'CHAPTER',
            entityId: chapter.id,
            code: 'MISSING_REFERENCE',
            message: `Chapter "${chapter.id}" branch points to non-existent nextChapterId "${branch.nextChapterId}".`,
          });
        }
      }
    }
  }

  // 5. Validate Conclusions
  for (const conclusion of catalog.conclusions) {
    if (!conclusion.id) {
      errors.push({
        entityType: 'CONCLUSION',
        entityId: 'UNKNOWN',
        code: 'MISSING_FIELD',
        message: 'Conclusion is missing id.',
      });
      continue;
    }
    if (conclusionMap.has(conclusion.id)) {
      errors.push({
        entityType: 'CONCLUSION',
        entityId: conclusion.id,
        code: 'DUPLICATE_ID',
        message: `Duplicate conclusion ID "${conclusion.id}".`,
      });
    }
    conclusionMap.set(conclusion.id, conclusion);

    if (!arcMap.has(conclusion.arcId)) {
      errors.push({
        entityType: 'CONCLUSION',
        entityId: conclusion.id,
        code: 'MISSING_REFERENCE',
        message: `Conclusion "${conclusion.id}" references non-existent arcId "${conclusion.arcId}".`,
      });
    }
    if (conclusion.confidenceScore < 0 || conclusion.confidenceScore > 100) {
      errors.push({
        entityType: 'CONCLUSION',
        entityId: conclusion.id,
        code: 'INVALID_RANGE',
        message: `Conclusion "${conclusion.id}" confidenceScore ${conclusion.confidenceScore} out of range [0, 100].`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
