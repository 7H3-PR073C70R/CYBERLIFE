/**
 * Cyberlife — Milestone 14: Initial Narrative State Factory
 *
 * Constructs the default authoritative NarrativeState for a new simulation session.
 */

import { NarrativeState, FactionStandingState } from './narrativeTypes';
import { FACTION_DEFINITIONS } from './narrativeData';
import { getFactionStandingBand } from './narrativeEvaluator';

export function createInitialNarrativeState(): NarrativeState {
  const factions: Record<string, FactionStandingState> = {};

  for (const def of FACTION_DEFINITIONS) {
    factions[def.id] = {
      factionId: def.id,
      standing: def.initialStanding,
      band: getFactionStandingBand(def.initialStanding),
      history: [],
    };
  }

  return {
    activeArcId: 'arc_aster_incident',
    completedArcIds: [],
    activeChapterId: 'ch_triage_broad_street',
    completedChapterIds: [],
    activeMissionIds: ['miss_triage_alert'],
    completedMissionIds: [],
    failedMissionIds: [],
    completedObjectiveIds: [],
    factions,
    evidenceVault: {},
    discoveredConclusions: [],
    submittedConclusions: [],
    narrativeFlags: {},
  };
}
