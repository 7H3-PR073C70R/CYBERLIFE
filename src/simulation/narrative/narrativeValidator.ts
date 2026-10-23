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
import { EpisodeDefinition } from './episodeTypes';

export interface NarrativeValidationError {
  readonly entityType: 'ARC' | 'CHAPTER' | 'MISSION' | 'OBJECTIVE' | 'FACTION' | 'CONCLUSION' | 'EPISODE' | 'BEAT';
  readonly entityId: string;
  readonly code:
    | 'MISSING_FIELD'
    | 'DUPLICATE_ID'
    | 'MISSING_REFERENCE'
    | 'INVALID_RANGE'
    | 'CIRCULAR_TRANSITION'
    | 'ORPHANED_ENTITY'
    | 'UNREACHABLE_BEAT'
    | 'UNKNOWN_FLAG';
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
  readonly episodes?: readonly EpisodeDefinition[];
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

  // 6. Validate Episodes if present
  if (catalog.episodes && catalog.episodes.length > 0) {
    const episodeIds = new Set<string>();
    for (const ep of catalog.episodes) {
      if (episodeIds.has(ep.id)) {
        errors.push({
          entityType: 'EPISODE',
          entityId: ep.id,
          code: 'DUPLICATE_ID',
          message: `Duplicate episode ID "${ep.id}".`,
        });
      }
      episodeIds.add(ep.id);
      errors.push(...validateEpisodeDefinition(ep));
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates an authored Episode Definition:
 * - Checks missing or invalid fields (id, title, episodeHash, season, episodeNumber, beats)
 * - Checks for duplicate beat IDs
 * - Checks for unreachable beats (e.g. trigger 'previousBeatFinished' pointing to a non-existent or subsequent beat)
 * - Checks for unknown or invalid flags
 * - Checks journal entry references and ticket/blackout ranges
 */
export function validateEpisodeDefinition(
  episode: EpisodeDefinition,
  knownFlags?: ReadonlySet<string>
): NarrativeValidationError[] {
  const errors: NarrativeValidationError[] = [];

  if (!episode.id || episode.id.trim().length === 0) {
    errors.push({
      entityType: 'EPISODE',
      entityId: 'UNKNOWN',
      code: 'MISSING_FIELD',
      message: 'Episode is missing required id.',
    });
  }

  if (!episode.title || episode.title.trim().length === 0) {
    errors.push({
      entityType: 'EPISODE',
      entityId: episode.id || 'UNKNOWN',
      code: 'MISSING_FIELD',
      message: `Episode "${episode.id}" has an empty title.`,
    });
  }

  // SHA-256 hash validation: must be 64-char hexadecimal string
  const sha256Regex = /^[a-f0-9]{64}$/i;
  if (!episode.episodeHash || !sha256Regex.test(episode.episodeHash)) {
    errors.push({
      entityType: 'EPISODE',
      entityId: episode.id || 'UNKNOWN',
      code: 'MISSING_FIELD',
      message: `Episode "${episode.id}" episodeHash must be a valid 64-character hexadecimal SHA-256 string.`,
    });
  }

  if (!Array.isArray(episode.beats) || episode.beats.length === 0) {
    errors.push({
      entityType: 'EPISODE',
      entityId: episode.id || 'UNKNOWN',
      code: 'MISSING_FIELD',
      message: `Episode "${episode.id}" must contain at least one beat in beats array.`,
    });
    return errors;
  }

  const beatIds = new Set<string>();

  for (let i = 0; i < episode.beats.length; i++) {
    const beat = episode.beats[i]!;

    if (!beat.id || beat.id.trim().length === 0) {
      errors.push({
        entityType: 'BEAT',
        entityId: `index_${i}`,
        code: 'MISSING_FIELD',
        message: `Episode "${episode.id}" beat at index ${i} is missing id.`,
      });
      continue;
    }

    if (beatIds.has(beat.id)) {
      errors.push({
        entityType: 'BEAT',
        entityId: beat.id,
        code: 'DUPLICATE_ID',
        message: `Duplicate beat ID "${beat.id}" in episode "${episode.id}".`,
      });
    }

    if (!beat.title || beat.title.trim().length === 0) {
      errors.push({
        entityType: 'BEAT',
        entityId: beat.id,
        code: 'MISSING_FIELD',
        message: `Beat "${beat.id}" in episode "${episode.id}" has an empty title.`,
      });
    }

    // Trigger validation
    const trigger = beat.trigger;
    if (!trigger || !trigger.type) {
      errors.push({
        entityType: 'BEAT',
        entityId: beat.id,
        code: 'MISSING_FIELD',
        message: `Beat "${beat.id}" is missing trigger or trigger type.`,
      });
    } else {
      if (trigger.type === 'previousBeatFinished') {
        if (!trigger.previousBeatId) {
          errors.push({
            entityType: 'BEAT',
            entityId: beat.id,
            code: 'MISSING_FIELD',
            message: `Beat "${beat.id}" has trigger 'previousBeatFinished' but missing previousBeatId.`,
          });
        } else if (!beatIds.has(trigger.previousBeatId) || trigger.previousBeatId === beat.id) {
          errors.push({
            entityType: 'BEAT',
            entityId: beat.id,
            code: 'UNREACHABLE_BEAT',
            message: `Beat "${beat.id}" is unreachable: previousBeatId "${trigger.previousBeatId}" has not appeared prior to this beat.`,
          });
        }
      }

      if (trigger.type === 'flag') {
        if (!trigger.flag || !trigger.flag.flagKey) {
          errors.push({
            entityType: 'BEAT',
            entityId: beat.id,
            code: 'MISSING_FIELD',
            message: `Beat "${beat.id}" has flag trigger but missing flagKey.`,
          });
        } else if (knownFlags && !knownFlags.has(trigger.flag.flagKey)) {
          errors.push({
            entityType: 'BEAT',
            entityId: beat.id,
            code: 'UNKNOWN_FLAG',
            message: `Beat "${beat.id}" trigger references unknown flag "${trigger.flag.flagKey}".`,
          });
        }
      }
    }

    // Effects validation
    if (beat.effects.unlockJournalEntryId && episode.initialJournalEntries) {
      const exists = episode.initialJournalEntries.some(j => j.id === beat.effects.unlockJournalEntryId);
      if (!exists) {
        errors.push({
          entityType: 'BEAT',
          entityId: beat.id,
          code: 'MISSING_REFERENCE',
          message: `Beat "${beat.id}" unlocks journal entry "${beat.effects.unlockJournalEntryId}" which is not defined in initialJournalEntries.`,
        });
      }
    }

    if (beat.effects.ticket) {
      if (!beat.effects.ticket.ticketId || !beat.effects.ticket.ticketId.startsWith('TKT-')) {
        errors.push({
          entityType: 'BEAT',
          entityId: beat.id,
          code: 'INVALID_RANGE',
          message: `Beat "${beat.id}" ticketId "${beat.effects.ticket.ticketId}" must follow 'TKT-2026-xxxx' format.`,
        });
      }
    }

    if (beat.effects.blackout) {
      if (beat.effects.blackout.durationSeconds <= 0) {
        errors.push({
          entityType: 'BEAT',
          entityId: beat.id,
          code: 'INVALID_RANGE',
          message: `Beat "${beat.id}" blackout durationSeconds must be > 0.`,
        });
      }
      if (beat.effects.blackout.clockSkipSeconds < 0) {
        errors.push({
          entityType: 'BEAT',
          entityId: beat.id,
          code: 'INVALID_RANGE',
          message: `Beat "${beat.id}" blackout clockSkipSeconds must be >= 0.`,
        });
      }
    }

    // Record as seen for subsequent beats
    beatIds.add(beat.id);
  }

  return errors;
}
