/**
 * Cyberlife — Milestone 14: Narrative Command Handler
 *
 * Deterministic command transitions for Story Arcs, Chapters, Missions, Faction Standings,
 * Evidence Vault, and Investigative Conclusions.
 */

import { SimulationState } from '../core/types';
import {
  StartStoryArcCommand,
  AdvanceStoryChapterCommand,
  CompleteNarrativeMissionCommand,
  FailNarrativeMissionCommand,
  RecordInvestigativeEvidenceCommand,
  FormulateConclusionCommand,
  SubmitInvestigativeConclusionCommand,
  ChangeFactionStandingCommand,
  CommandResult,
} from '../commands/types';
import { SimulationEvent } from '../events/types';
import { createSimulationEvent } from '../events/eventFactory';
import { deepFreeze } from '../core/stateUtils';
import {
  STORY_ARCS,
  STORY_CHAPTERS,
  NARRATIVE_MISSIONS,
  FACTION_DEFINITIONS,
  INVESTIGATIVE_CONCLUSIONS,
} from './narrativeData';
import {
  clampFactionStanding,
  getFactionStandingBand,
  isNarrativePrerequisiteMet,
  canFormulateConclusion,
  calculateConclusionConfidence,
} from './narrativeEvaluator';
import { createInitialNarrativeState } from './initialNarrativeState';
import { creditPlayerMoney } from '../systems/playerSystem';

function getOrInitNarrative(state: Readonly<SimulationState>) {
  return state.narrative ? { ...state.narrative } : createInitialNarrativeState();
}

/**
 * Handles starting a new Story Arc.
 */
export function handleStartStoryArc(
  currentState: Readonly<SimulationState>,
  command: StartStoryArcCommand
): CommandResult {
  const arc = STORY_ARCS.find(a => a.id === command.arcId);
  if (!arc) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'STORY_ARC_NOT_FOUND',
      message: `Story arc "${command.arcId}" not found in catalogue.`,
    };
  }

  const narrative = getOrInitNarrative(currentState);

  // Check prerequisites
  const evalContext = {
    flags: currentState.flags,
    careerLevel: currentState.career?.currentLevel,
    completedJobs: currentState.jobs?.completedJobHistory.map(j => j.jobId),
    skills: currentState.skills
      ? Object.fromEntries(Object.entries(currentState.skills).map(([k, v]) => [k, v.level]))
      : undefined,
    factionStandings: Object.fromEntries(
      Object.entries(narrative.factions).map(([k, v]) => [k, v.standing])
    ),
    preservedEvidenceIds: Object.keys(narrative.evidenceVault),
  };

  if (!isNarrativePrerequisiteMet(arc.prerequisites, evalContext)) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'NARRATIVE_PREREQUISITES_NOT_MET',
      message: `Prerequisites for story arc "${arc.title}" are not satisfied.`,
    };
  }

  const firstChapterId = arc.chapterIds[0] ?? null;
  const firstChapter = firstChapterId ? STORY_CHAPTERS.find(c => c.id === firstChapterId) : null;
  const activeMissionIds = firstChapter ? [...firstChapter.missionIds] : [];

  const updatedNarrative = {
    ...narrative,
    activeArcId: arc.id,
    activeChapterId: firstChapterId,
    activeMissionIds,
  };

  const nextRevision = currentState.metadata.revision + 1;
  const simTime = currentState.time.simulationTimeSeconds;
  const events: SimulationEvent[] = [
    createSimulationEvent('STORY_ARC_STARTED', simTime, nextRevision, {
      arcId: arc.id,
      title: arc.title,
    }),
  ];

  if (firstChapterId) {
    events.push(
      createSimulationEvent('STORY_CHAPTER_ADVANCED', simTime, nextRevision, {
        arcId: arc.id,
        previousChapterId: narrative.activeChapterId,
        currentChapterId: firstChapterId,
      })
    );
  }

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    narrative: updatedNarrative,
  };

  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Started story arc "${arc.title}"`,
  };
}

/**
 * Handles advancing to a new chapter within the active arc.
 */
export function handleAdvanceStoryChapter(
  currentState: Readonly<SimulationState>,
  command: AdvanceStoryChapterCommand
): CommandResult {
  const chapter = STORY_CHAPTERS.find(c => c.id === command.chapterId);
  if (!chapter) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'STORY_CHAPTER_NOT_FOUND',
      message: `Story chapter "${command.chapterId}" not found.`,
    };
  }

  const narrative = getOrInitNarrative(currentState);
  const prevChapterId = narrative.activeChapterId;
  const completedChapters = [...narrative.completedChapterIds];
  if (prevChapterId && !completedChapters.includes(prevChapterId)) {
    completedChapters.push(prevChapterId);
  }

  const updatedNarrative = {
    ...narrative,
    activeArcId: chapter.arcId,
    activeChapterId: chapter.id,
    completedChapterIds: completedChapters,
    activeMissionIds: [...chapter.missionIds],
  };

  const nextRevision = currentState.metadata.revision + 1;
  const simTime = currentState.time.simulationTimeSeconds;

  const events: SimulationEvent[] = [
    createSimulationEvent('STORY_CHAPTER_ADVANCED', simTime, nextRevision, {
      arcId: chapter.arcId,
      previousChapterId: prevChapterId,
      currentChapterId: chapter.id,
    }),
  ];

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    narrative: updatedNarrative,
  };

  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Advanced to chapter "${chapter.title}"`,
  };
}

/**
 * Handles completing a narrative mission.
 */
export function handleCompleteNarrativeMission(
  currentState: Readonly<SimulationState>,
  command: CompleteNarrativeMissionCommand
): CommandResult {
  const mission = NARRATIVE_MISSIONS.find(m => m.id === command.missionId);
  if (!mission) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'NARRATIVE_MISSION_NOT_FOUND',
      message: `Narrative mission "${command.missionId}" not found.`,
    };
  }

  const narrative = getOrInitNarrative(currentState);
  const activeMissions = narrative.activeMissionIds.filter(id => id !== mission.id);
  const completedMissions = [...narrative.completedMissionIds];
  if (!completedMissions.includes(mission.id)) {
    completedMissions.push(mission.id);
  }

  // Apply consequences: flags
  const updatedFlags = { ...currentState.flags, ...(mission.consequences.setFlags ?? {}) };

  // Apply consequences: faction standings
  const updatedFactions = { ...narrative.factions };
  const nextRevision = currentState.metadata.revision + 1;
  const simTime = currentState.time.simulationTimeSeconds;
  const events: SimulationEvent[] = [];

  if (mission.consequences.factionStandingDeltas) {
    for (const [fId, delta] of Object.entries(mission.consequences.factionStandingDeltas)) {
      const existing = updatedFactions[fId] ?? {
        factionId: fId,
        standing: 0,
        band: getFactionStandingBand(0),
        history: [],
      };
      const prevStanding = existing.standing;
      const newStanding = clampFactionStanding(prevStanding + delta);
      const actualDelta = newStanding - prevStanding;

      updatedFactions[fId] = {
        ...existing,
        standing: newStanding,
        band: getFactionStandingBand(newStanding),
        history: [
          ...existing.history,
          { delta, reason: `Completed mission ${mission.title}`, timestamp: simTime },
        ],
      };

      events.push(
        createSimulationEvent('FACTION_STANDING_CHANGED', simTime, nextRevision, {
          factionId: fId,
          previousStanding: prevStanding,
          newStanding,
          delta: actualDelta,
          reason: `Completed mission ${mission.title}`,
          band: getFactionStandingBand(newStanding),
        })
      );
    }
  }

  // Apply money reward if present
  let updatedPlayer = currentState.player;
  if (mission.consequences.rewardKobo && mission.consequences.rewardKobo > 0) {
    updatedPlayer = creditPlayerMoney(
      currentState.player,
      mission.consequences.rewardKobo
    );
  }

  // Apply XP if career is active
  let updatedCareer = currentState.career;
  if (mission.consequences.rewardXp && updatedCareer) {
    updatedCareer = {
      ...updatedCareer,
      xp: updatedCareer.xp + mission.consequences.rewardXp,
    };
  }

  events.push(
    createSimulationEvent('NARRATIVE_MISSION_COMPLETED', simTime, nextRevision, {
      missionId: mission.id,
      chapterId: mission.chapterId,
      rewardXp: mission.consequences.rewardXp,
      rewardKobo: mission.consequences.rewardKobo,
    })
  );

  const updatedNarrative = {
    ...narrative,
    activeMissionIds: activeMissions,
    completedMissionIds: completedMissions,
    factions: updatedFactions,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    player: updatedPlayer,
    career: updatedCareer,
    flags: updatedFlags,
    narrative: updatedNarrative,
  };

  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Completed mission "${mission.title}"`,
  };
}

/**
 * Handles failing a narrative mission with a recovery branch.
 */
export function handleFailNarrativeMission(
  currentState: Readonly<SimulationState>,
  command: FailNarrativeMissionCommand
): CommandResult {
  const mission = NARRATIVE_MISSIONS.find(m => m.id === command.missionId);
  if (!mission) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'NARRATIVE_MISSION_NOT_FOUND',
      message: `Narrative mission "${command.missionId}" not found.`,
    };
  }

  const narrative = getOrInitNarrative(currentState);
  const activeMissions = narrative.activeMissionIds.filter(id => id !== mission.id);
  const failedMissions = [...narrative.failedMissionIds];
  if (!failedMissions.includes(mission.id)) {
    failedMissions.push(mission.id);
  }

  // If a recovery branch exists, activate it
  if (mission.failureRecoveryBranchMissionId) {
    if (!activeMissions.includes(mission.failureRecoveryBranchMissionId)) {
      activeMissions.push(mission.failureRecoveryBranchMissionId);
    }
  }

  const nextRevision = currentState.metadata.revision + 1;
  const simTime = currentState.time.simulationTimeSeconds;

  const events: SimulationEvent[] = [
    createSimulationEvent('NARRATIVE_MISSION_FAILED', simTime, nextRevision, {
      missionId: mission.id,
      reason: command.reason,
      recoveryBranchMissionId: mission.failureRecoveryBranchMissionId,
    }),
  ];

  const updatedNarrative = {
    ...narrative,
    activeMissionIds: activeMissions,
    failedMissionIds: failedMissions,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    narrative: updatedNarrative,
  };

  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Mission "${mission.title}" failed. Recovery route activated: ${mission.failureRecoveryBranchMissionId ?? 'None'}`,
  };
}

/**
 * Handles recording/preserving an investigative digital evidence item in the Evidence Vault.
 */
export function handleRecordInvestigativeEvidence(
  currentState: Readonly<SimulationState>,
  command: RecordInvestigativeEvidenceCommand
): CommandResult {
  const narrative = getOrInitNarrative(currentState);
  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const evidenceItem = {
    evidenceId: command.evidenceId,
    source: command.source,
    title: command.title,
    description: command.description,
    hash: command.hash,
    collectedAtSimTime: simTime,
    integrityVerified: true,
    tags: command.tags ?? ['forensic_artifact'],
  };

  const updatedVault = {
    ...narrative.evidenceVault,
    [command.evidenceId]: evidenceItem,
  };

  const events: SimulationEvent[] = [
    createSimulationEvent('INVESTIGATIVE_EVIDENCE_RECORDED', simTime, nextRevision, {
      evidenceId: command.evidenceId,
      source: command.source,
      title: command.title,
      hash: command.hash,
    }),
  ];

  const updatedNarrative = {
    ...narrative,
    evidenceVault: updatedVault,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    narrative: updatedNarrative,
  };

  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Preserved evidence artifact "${command.title}" [${command.hash.slice(0, 8)}...]`,
  };
}

/**
 * Handles formulating an investigative conclusion once sufficient evidence is assembled.
 */
export function handleFormulateConclusion(
  currentState: Readonly<SimulationState>,
  command: FormulateConclusionCommand
): CommandResult {
  const conclusion = INVESTIGATIVE_CONCLUSIONS.find(c => c.id === command.conclusionId);
  if (!conclusion) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'CONCLUSION_NOT_FOUND',
      message: `Investigative conclusion "${command.conclusionId}" not found.`,
    };
  }

  const narrative = getOrInitNarrative(currentState);
  const preservedEvidenceIds = Object.keys(narrative.evidenceVault);

  if (!canFormulateConclusion(conclusion, preservedEvidenceIds)) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'INSUFFICIENT_EVIDENCE',
      message: `Cannot formulate "${conclusion.title}": missing required preserved evidence.`,
    };
  }

  const discovered = [...narrative.discoveredConclusions];
  if (!discovered.includes(conclusion.id)) {
    discovered.push(conclusion.id);
  }

  const confidenceScore = calculateConclusionConfidence(conclusion, preservedEvidenceIds);
  const nextRevision = currentState.metadata.revision + 1;
  const simTime = currentState.time.simulationTimeSeconds;

  const events: SimulationEvent[] = [
    createSimulationEvent('INVESTIGATIVE_CONCLUSION_FORMULATED', simTime, nextRevision, {
      conclusionId: conclusion.id,
      hypothesis: conclusion.hypothesis,
      confidenceScore,
    }),
  ];

  const updatedNarrative = {
    ...narrative,
    discoveredConclusions: discovered,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    narrative: updatedNarrative,
  };

  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Formulated conclusion "${conclusion.title}" with confidence score ${confidenceScore}%`,
  };
}

/**
 * Handles submitting an investigative conclusion to a chosen stakeholder faction.
 */
export function handleSubmitInvestigativeConclusion(
  currentState: Readonly<SimulationState>,
  command: SubmitInvestigativeConclusionCommand
): CommandResult {
  const conclusion = INVESTIGATIVE_CONCLUSIONS.find(c => c.id === command.conclusionId);
  if (!conclusion) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'CONCLUSION_NOT_FOUND',
      message: `Investigative conclusion "${command.conclusionId}" not found.`,
    };
  }

  const faction = FACTION_DEFINITIONS.find(f => f.id === command.recipientFactionId);
  if (!faction) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'FACTION_NOT_FOUND',
      message: `Faction "${command.recipientFactionId}" not found.`,
    };
  }

  const narrative = getOrInitNarrative(currentState);
  const submitted = [...narrative.submittedConclusions];
  if (!submitted.includes(conclusion.id)) {
    submitted.push(conclusion.id);
  }

  const nextRevision = currentState.metadata.revision + 1;
  const simTime = currentState.time.simulationTimeSeconds;

  const events: SimulationEvent[] = [
    createSimulationEvent('INVESTIGATIVE_CONCLUSION_SUBMITTED', simTime, nextRevision, {
      conclusionId: conclusion.id,
      recipientFactionId: command.recipientFactionId,
    }),
  ];

  const updatedNarrative = {
    ...narrative,
    submittedConclusions: submitted,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    narrative: updatedNarrative,
  };

  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Submitted "${conclusion.title}" to ${faction.name}`,
  };
}

/**
 * Handles modifying faction standing directly or as a consequence.
 */
export function handleChangeFactionStanding(
  currentState: Readonly<SimulationState>,
  command: ChangeFactionStandingCommand
): CommandResult {
  const faction = FACTION_DEFINITIONS.find(f => f.id === command.factionId);
  if (!faction) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'FACTION_NOT_FOUND',
      message: `Faction "${command.factionId}" not found.`,
    };
  }

  const narrative = getOrInitNarrative(currentState);
  const existing = narrative.factions[command.factionId] ?? {
    factionId: command.factionId,
    standing: 0,
    band: getFactionStandingBand(0),
    history: [],
  };

  const prevStanding = existing.standing;
  const newStanding = clampFactionStanding(prevStanding + command.delta);
  const actualDelta = newStanding - prevStanding;

  const simTime = currentState.time.simulationTimeSeconds;
  const nextRevision = currentState.metadata.revision + 1;

  const updatedFactions = {
    ...narrative.factions,
    [command.factionId]: {
      ...existing,
      standing: newStanding,
      band: getFactionStandingBand(newStanding),
      history: [
        ...existing.history,
        { delta: command.delta, reason: command.reason, timestamp: simTime },
      ],
    },
  };

  const events: SimulationEvent[] = [
    createSimulationEvent('FACTION_STANDING_CHANGED', simTime, nextRevision, {
      factionId: command.factionId,
      previousStanding: prevStanding,
      newStanding,
      delta: actualDelta,
      reason: command.reason,
      band: getFactionStandingBand(newStanding),
    }),
  ];

  const updatedNarrative = {
    ...narrative,
    factions: updatedFactions,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    narrative: updatedNarrative,
  };

  return {
    success: true,
    state: deepFreeze(nextState),
    events,
    message: `Standing with ${faction.name} changed by ${actualDelta > 0 ? '+' : ''}${actualDelta} (New: ${newStanding}, Band: ${getFactionStandingBand(newStanding)})`,
  };
}
