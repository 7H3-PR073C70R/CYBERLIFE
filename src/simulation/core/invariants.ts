import { SimulationState } from './types';
import { InvariantViolationError } from '../../domain/errors/DomainError';
import { MIN_ATTRIBUTE_VALUE, MAX_ATTRIBUTE_VALUE } from '../systems/playerSystem';
import { validateFlagKey, validateFlagValue } from '../systems/worldFlagsSystem';

/**
 * Validates that all authoritative domain invariants hold on a simulation state snapshot.
 * Throws InvariantViolationError if any invariant is broken.
 */
export function validateSimulationState(state: SimulationState): void {
  if (!state) {
    throw new InvariantViolationError('Simulation state cannot be null or undefined');
  }

  // 1. Metadata invariants
  const { metadata } = state;
  if (!metadata) {
    throw new InvariantViolationError('Simulation metadata is missing');
  }
  if (!Number.isSafeInteger(metadata.schemaVersion) || metadata.schemaVersion < 1) {
    throw new InvariantViolationError(
      `Invalid schemaVersion: expected integer >= 1, received ${metadata.schemaVersion}`
    );
  }
  if (!Number.isSafeInteger(metadata.revision) || metadata.revision < 0) {
    throw new InvariantViolationError(
      `Invalid state revision: expected safe integer >= 0, received ${metadata.revision}`
    );
  }
  if (!metadata.scenarioId || typeof metadata.scenarioId !== 'string') {
    throw new InvariantViolationError('Scenario ID must be a non-empty string');
  }

  // 2. Time invariants
  const { time } = state;
  if (!time) {
    throw new InvariantViolationError('Simulation time is missing');
  }
  if (!Number.isFinite(time.simulationTimeSeconds) || time.simulationTimeSeconds < 0) {
    throw new InvariantViolationError(
      `Invalid simulationTimeSeconds: expected non-negative number, received ${time.simulationTimeSeconds}`
    );
  }
  if (!time.calendar || !time.calendar.iso) {
    throw new InvariantViolationError('Simulation calendar time is missing or invalid');
  }

  // 3. Player invariants
  const { player } = state;
  if (!player) {
    throw new InvariantViolationError('Player attributes are missing');
  }
  if (!player.id || typeof player.id !== 'string') {
    throw new InvariantViolationError('Player ID must be a non-empty string');
  }
  if (
    !Number.isFinite(player.health) ||
    player.health < MIN_ATTRIBUTE_VALUE ||
    player.health > MAX_ATTRIBUTE_VALUE
  ) {
    throw new InvariantViolationError(
      `Player health out of bounds: expected [${MIN_ATTRIBUTE_VALUE}, ${MAX_ATTRIBUTE_VALUE}], received ${player.health}`
    );
  }
  if (
    !Number.isFinite(player.energy) ||
    player.energy < MIN_ATTRIBUTE_VALUE ||
    player.energy > MAX_ATTRIBUTE_VALUE
  ) {
    throw new InvariantViolationError(
      `Player energy out of bounds: expected [${MIN_ATTRIBUTE_VALUE}, ${MAX_ATTRIBUTE_VALUE}], received ${player.energy}`
    );
  }
  if (!Number.isSafeInteger(player.moneyKobo) || player.moneyKobo < 0) {
    throw new InvariantViolationError(
      `Player moneyKobo must be a non-negative safe integer, received ${player.moneyKobo}`
    );
  }
  if (!player.locationId || typeof player.locationId !== 'string') {
    throw new InvariantViolationError('Player locationId must be a non-empty string');
  }

  // 4. Inventory invariants
  const { inventory } = state;
  if (!inventory || !Array.isArray(inventory.slots)) {
    throw new InvariantViolationError('Simulation inventory is missing or invalid');
  }
  const seenItems = new Set<string>();
  for (const slot of inventory.slots) {
    if (!slot.itemId || typeof slot.itemId !== 'string') {
      throw new InvariantViolationError('Inventory slot has missing or invalid itemId');
    }
    if (seenItems.has(slot.itemId)) {
      throw new InvariantViolationError(`Duplicate item slot detected for itemId "${slot.itemId}"`);
    }
    seenItems.add(slot.itemId);

    if (!Number.isSafeInteger(slot.quantity) || slot.quantity <= 0) {
      throw new InvariantViolationError(
        `Inventory slot quantity for "${slot.itemId}" must be a positive safe integer, received ${slot.quantity}`
      );
    }
  }

  // 5. World flags invariants
  const { flags } = state;
  if (!flags || typeof flags !== 'object') {
    throw new InvariantViolationError('World flags must be an object');
  }
  for (const [key, value] of Object.entries(flags)) {
    validateFlagKey(key);
    validateFlagValue(value);
  }

  // 6. Timers invariants
  const { timers } = state;
  if (!Array.isArray(timers)) {
    throw new InvariantViolationError('Simulation timers must be an array');
  }
  const seenTimerIds = new Set<string>();
  for (const timer of timers) {
    if (!timer.id || typeof timer.id !== 'string') {
      throw new InvariantViolationError('Timer id must be a non-empty string');
    }
    if (seenTimerIds.has(timer.id)) {
      throw new InvariantViolationError(`Duplicate timer detected with id "${timer.id}"`);
    }
    seenTimerIds.add(timer.id);

    if (!Number.isFinite(timer.dueSimulationTime) || timer.dueSimulationTime < 0) {
      throw new InvariantViolationError(
        `Timer "${timer.id}" dueSimulationTime must be a non-negative number, received ${timer.dueSimulationTime}`
      );
    }
    if (!Number.isSafeInteger(timer.sequence) || timer.sequence < 0) {
      throw new InvariantViolationError(
        `Timer "${timer.id}" sequence must be a non-negative integer, received ${timer.sequence}`
      );
    }
  }

  if (!Number.isSafeInteger(state.nextTimerSequence) || state.nextTimerSequence < 0) {
    throw new InvariantViolationError(
      `nextTimerSequence must be a non-negative safe integer, received ${state.nextTimerSequence}`
    );
  }

  // 7. Mission invariants (if present)
  if (state.mission) {
    const { mission } = state;
    if (mission.missionId !== 'the_aster_incident') {
      throw new InvariantViolationError(`Unknown missionId: "${mission.missionId}"`);
    }
    const validPhases = [
      'briefing',
      'initial_assessment',
      'investigation',
      'evidence_preservation',
      'containment',
      'remediation',
      'verification',
      'reporting',
      'completed',
    ];
    if (!validPhases.includes(mission.phase)) {
      throw new InvariantViolationError(`Invalid mission phase: "${mission.phase}"`);
    }
    if (!Array.isArray(mission.objectives)) {
      throw new InvariantViolationError('Mission objectives must be an array');
    }
  }

  // 8. NPC invariants (if present)
  if (state.npcs) {
    if (typeof state.npcs !== 'object') {
      throw new InvariantViolationError('NPC state must be an object');
    }
    for (const [npcId, npc] of Object.entries(state.npcs)) {
      if (!npc || typeof npc !== 'object') {
        throw new InvariantViolationError(`Invalid NPC state entry for "${npcId}"`);
      }
      if (npc.id !== npcId) {
        throw new InvariantViolationError(
          `NPC key "${npcId}" does not match internal npc.id "${npc.id}"`
        );
      }
      if (
        !Number.isSafeInteger(npc.relationship) ||
        npc.relationship < -100 ||
        npc.relationship > 100
      ) {
        throw new InvariantViolationError(
          `NPC "${npcId}" relationship out of bounds: expected [-100, 100], received ${npc.relationship}`
        );
      }
      if (!npc.memory || typeof npc.memory !== 'object') {
        throw new InvariantViolationError(`NPC "${npcId}" memory is missing or invalid`);
      }
      if (typeof npc.memory.met !== 'boolean') {
        throw new InvariantViolationError(`NPC "${npcId}" memory.met must be a boolean`);
      }
      if (!Number.isSafeInteger(npc.memory.conversationCount) || npc.memory.conversationCount < 0) {
        throw new InvariantViolationError(
          `NPC "${npcId}" memory.conversationCount must be a non-negative integer`
        );
      }
      if (
        !Array.isArray(npc.memory.topicsDiscussed) ||
        !Array.isArray(npc.memory.choicesMade) ||
        !Array.isArray(npc.memory.sharedFacts) ||
        !Array.isArray(npc.memory.commitments)
      ) {
        throw new InvariantViolationError(`NPC "${npcId}" memory list fields must be arrays`);
      }
    }
  }

  // 9. Active dialogue invariants (if present)
  if (state.activeDialogue) {
    const { activeDialogue } = state;
    if (!activeDialogue.npcId || typeof activeDialogue.npcId !== 'string') {
      throw new InvariantViolationError('activeDialogue.npcId must be a non-empty string');
    }
    if (!activeDialogue.currentNodeId || typeof activeDialogue.currentNodeId !== 'string') {
      throw new InvariantViolationError('activeDialogue.currentNodeId must be a non-empty string');
    }
  }

  // 10. Career invariants (if present)
  if (state.career) {
    const { career } = state;
    if (!career.currentPathId || typeof career.currentPathId !== 'string') {
      throw new InvariantViolationError('career.currentPathId must be a non-empty string');
    }
    if (!Number.isSafeInteger(career.currentLevel) || career.currentLevel < 1) {
      throw new InvariantViolationError(
        `career.currentLevel must be a positive safe integer >= 1, received ${career.currentLevel}`
      );
    }
    if (!career.roleTitle || typeof career.roleTitle !== 'string') {
      throw new InvariantViolationError('career.roleTitle must be a non-empty string');
    }
    if (!career.employer || typeof career.employer !== 'string') {
      throw new InvariantViolationError('career.employer must be a non-empty string');
    }
    if (!Number.isSafeInteger(career.xp) || career.xp < 0) {
      throw new InvariantViolationError(
        `career.xp must be a non-negative safe integer, received ${career.xp}`
      );
    }
  }

  // 11. Job board invariants (if present)
  if (state.jobs) {
    const { jobs } = state;
    if (!Array.isArray(jobs.availableJobIds)) {
      throw new InvariantViolationError('jobs.availableJobIds must be an array');
    }
    if (!Array.isArray(jobs.activeJobs)) {
      throw new InvariantViolationError('jobs.activeJobs must be an array');
    }
    if (!Array.isArray(jobs.completedJobHistory)) {
      throw new InvariantViolationError('jobs.completedJobHistory must be an array');
    }
  }

  // 12. Skills invariants (if present)
  if (state.skills) {
    const { skills } = state;
    if (typeof skills !== 'object' || skills === null) {
      throw new InvariantViolationError('skills state must be an object');
    }
    for (const [skillId, skill] of Object.entries(skills)) {
      if (!skill || typeof skill !== 'object') {
        throw new InvariantViolationError(`Invalid skill state for "${skillId}"`);
      }
      if (!Number.isSafeInteger(skill.level) || skill.level < 1 || skill.level > 10) {
        throw new InvariantViolationError(
          `Skill "${skillId}" level must be an integer in [1, 10], received ${skill.level}`
        );
      }
      if (!Number.isSafeInteger(skill.xp) || skill.xp < 0) {
        throw new InvariantViolationError(
          `Skill "${skillId}" xp must be a non-negative integer, received ${skill.xp}`
        );
      }
      if (!Number.isSafeInteger(skill.totalXp) || skill.totalXp < 0) {
        throw new InvariantViolationError(
          `Skill "${skillId}" totalXp must be a non-negative integer, received ${skill.totalXp}`
        );
      }
    }
  }

  // 13. Economy invariants (if present)
  if (state.economy) {
    const { economy } = state;
    if (!Array.isArray(economy.transactions)) {
      throw new InvariantViolationError('economy.transactions must be an array');
    }
    for (const tx of economy.transactions) {
      if (!tx.id || typeof tx.id !== 'string') {
        throw new InvariantViolationError('FinancialTransaction.id must be a non-empty string');
      }
      if (!Number.isSafeInteger(tx.amountKobo) || tx.amountKobo <= 0) {
        throw new InvariantViolationError(
          `FinancialTransaction.amountKobo must be a positive safe integer, received ${tx.amountKobo}`
        );
      }
      if (!Number.isSafeInteger(tx.balanceAfterKobo) || tx.balanceAfterKobo < 0) {
        throw new InvariantViolationError(
          `FinancialTransaction.balanceAfterKobo must be a non-negative safe integer, received ${tx.balanceAfterKobo}`
        );
      }
    }
    if (!Array.isArray(economy.recurringExpenses)) {
      throw new InvariantViolationError('economy.recurringExpenses must be an array');
    }
    for (const exp of economy.recurringExpenses) {
      if (!exp.id || typeof exp.id !== 'string') {
        throw new InvariantViolationError('RecurringExpense.id must be a non-empty string');
      }
      if (!Number.isSafeInteger(exp.amountKobo) || exp.amountKobo <= 0) {
        throw new InvariantViolationError(
          `RecurringExpense.amountKobo must be a positive safe integer, received ${exp.amountKobo}`
        );
      }
      if (!Number.isSafeInteger(exp.intervalSeconds) || exp.intervalSeconds <= 0) {
        throw new InvariantViolationError(
          `RecurringExpense.intervalSeconds must be a positive safe integer, received ${exp.intervalSeconds}`
        );
      }
    }
  }

  // 12. Onboarding invariants (if present)
  if (state.onboarding) {
    const { onboarding } = state;
    if (typeof onboarding.introCompleted !== 'boolean') {
      throw new InvariantViolationError('onboarding.introCompleted must be a boolean');
    }
    if (typeof onboarding.introSkipped !== 'boolean') {
      throw new InvariantViolationError('onboarding.introSkipped must be a boolean');
    }
    if (onboarding.guidanceMode !== 'guided' && onboarding.guidanceMode !== 'experienced') {
      throw new InvariantViolationError(
        `onboarding.guidanceMode must be "guided" or "experienced", received "${onboarding.guidanceMode}"`
      );
    }
    if (!Array.isArray(onboarding.completedStepIds)) {
      throw new InvariantViolationError('onboarding.completedStepIds must be an array');
    }
    const seenSteps = new Set<string>();
    for (const stepId of onboarding.completedStepIds) {
      if (!stepId || typeof stepId !== 'string') {
        throw new InvariantViolationError(
          'onboarding.completedStepIds items must be non-empty strings'
        );
      }
      if (seenSteps.has(stepId)) {
        throw new InvariantViolationError(`Duplicate step ID "${stepId}" in completedStepIds`);
      }
      seenSteps.add(stepId);
    }
    if (!Array.isArray(onboarding.dismissedHintIds)) {
      throw new InvariantViolationError('onboarding.dismissedHintIds must be an array');
    }
    const seenHints = new Set<string>();
    for (const hintId of onboarding.dismissedHintIds) {
      if (!hintId || typeof hintId !== 'string') {
        throw new InvariantViolationError(
          'onboarding.dismissedHintIds items must be non-empty strings'
        );
      }
      if (seenHints.has(hintId)) {
        throw new InvariantViolationError(`Duplicate hint ID "${hintId}" in dismissedHintIds`);
      }
      seenHints.add(hintId);
    }
    if (onboarding.activeStepId !== null && typeof onboarding.activeStepId !== 'string') {
      throw new InvariantViolationError('onboarding.activeStepId must be a string or null');
    }
  }

  // 14. Catalogue invariants (if present)
  if (state.catalogue) {
    const { catalogue } = state;
    if (!Array.isArray(catalogue.completedEntryIds)) {
      throw new InvariantViolationError('catalogue.completedEntryIds must be an array');
    }
    const seenEntries = new Set<string>();
    for (const id of catalogue.completedEntryIds) {
      if (!id || typeof id !== 'string') {
        throw new InvariantViolationError(
          'catalogue.completedEntryIds items must be non-empty strings'
        );
      }
      if (seenEntries.has(id)) {
        throw new InvariantViolationError(`Duplicate entry ID "${id}" in completedEntryIds`);
      }
      seenEntries.add(id);
    }

    if (!Array.isArray(catalogue.completedExerciseIds)) {
      throw new InvariantViolationError('catalogue.completedExerciseIds must be an array');
    }
    const seenExercises = new Set<string>();
    for (const id of catalogue.completedExerciseIds) {
      if (!id || typeof id !== 'string') {
        throw new InvariantViolationError(
          'catalogue.completedExerciseIds items must be non-empty strings'
        );
      }
      if (seenExercises.has(id)) {
        throw new InvariantViolationError(`Duplicate exercise ID "${id}" in completedExerciseIds`);
      }
      seenExercises.add(id);
    }

    if (!Array.isArray(catalogue.detectionRules)) {
      throw new InvariantViolationError('catalogue.detectionRules must be an array');
    }

    if (!Array.isArray(catalogue.purpleRunHistory)) {
      throw new InvariantViolationError('catalogue.purpleRunHistory must be an array');
    }

    if (!Array.isArray(catalogue.redFindings)) {
      throw new InvariantViolationError('catalogue.redFindings must be an array');
    }

    if (
      !Number.isSafeInteger(catalogue.totalExercisesCompleted) ||
      catalogue.totalExercisesCompleted < 0
    ) {
      throw new InvariantViolationError(
        'catalogue.totalExercisesCompleted must be a non-negative safe integer'
      );
    }
  }

  // 15. Narrative invariants (if present)
  if (state.narrative) {
    const { narrative } = state;
    if (narrative.activeArcId !== null && typeof narrative.activeArcId !== 'string') {
      throw new InvariantViolationError('narrative.activeArcId must be a string or null');
    }
    if (!Array.isArray(narrative.completedArcIds)) {
      throw new InvariantViolationError('narrative.completedArcIds must be an array');
    }
    const seenArcs = new Set<string>();
    for (const arcId of narrative.completedArcIds) {
      if (!arcId || typeof arcId !== 'string') {
        throw new InvariantViolationError('narrative.completedArcIds items must be non-empty strings');
      }
      if (seenArcs.has(arcId)) {
        throw new InvariantViolationError(`Duplicate arc ID "${arcId}" in completedArcIds`);
      }
      seenArcs.add(arcId);
    }

    if (narrative.activeChapterId !== null && typeof narrative.activeChapterId !== 'string') {
      throw new InvariantViolationError('narrative.activeChapterId must be a string or null');
    }
    if (!Array.isArray(narrative.completedChapterIds)) {
      throw new InvariantViolationError('narrative.completedChapterIds must be an array');
    }
    if (!Array.isArray(narrative.activeMissionIds)) {
      throw new InvariantViolationError('narrative.activeMissionIds must be an array');
    }
    if (!Array.isArray(narrative.completedMissionIds)) {
      throw new InvariantViolationError('narrative.completedMissionIds must be an array');
    }
    if (!Array.isArray(narrative.failedMissionIds)) {
      throw new InvariantViolationError('narrative.failedMissionIds must be an array');
    }
    if (!Array.isArray(narrative.completedObjectiveIds)) {
      throw new InvariantViolationError('narrative.completedObjectiveIds must be an array');
    }

    if (!narrative.factions || typeof narrative.factions !== 'object') {
      throw new InvariantViolationError('narrative.factions must be an object');
    }
    for (const [factionId, fState] of Object.entries(narrative.factions)) {
      if (!fState || typeof fState !== 'object') {
        throw new InvariantViolationError(`narrative.factions["${factionId}"] must be an object`);
      }
      if (
        !Number.isSafeInteger(fState.standing) ||
        fState.standing < -100 ||
        fState.standing > 100
      ) {
        throw new InvariantViolationError(
          `Faction "${factionId}" standing must be safe integer in [-100, 100], received ${fState.standing}`
        );
      }
      const validBands = ['HOSTILE', 'DISTRUSTED', 'NEUTRAL', 'FAVORED', 'ALLIED'];
      if (!validBands.includes(fState.band)) {
        throw new InvariantViolationError(
          `Faction "${factionId}" has invalid band: ${fState.band}`
        );
      }
    }

    if (!narrative.evidenceVault || typeof narrative.evidenceVault !== 'object') {
      throw new InvariantViolationError('narrative.evidenceVault must be an object');
    }
    for (const [evId, item] of Object.entries(narrative.evidenceVault)) {
      if (!item || !item.evidenceId || !item.hash) {
        throw new InvariantViolationError(`Evidence vault item "${evId}" is missing evidenceId or hash`);
      }
    }

    if (!Array.isArray(narrative.discoveredConclusions)) {
      throw new InvariantViolationError('narrative.discoveredConclusions must be an array');
    }
    if (!Array.isArray(narrative.submittedConclusions)) {
      throw new InvariantViolationError('narrative.submittedConclusions must be an array');
    }
  }

  // 16. Network investigation domain invariants
  const { networkInvestigation } = state;
  if (networkInvestigation) {
    if (!networkInvestigation.scenarioId || typeof networkInvestigation.scenarioId !== 'string') {
      throw new InvariantViolationError('networkInvestigation.scenarioId must be a non-empty string');
    }
    if (!networkInvestigation.title || typeof networkInvestigation.title !== 'string') {
      throw new InvariantViolationError('networkInvestigation.title must be a non-empty string');
    }
    const validPhases = [
      'BRIEFING',
      'TOPOLOGY_TRIAGE',
      'TRAFFIC_INSPECTION',
      'THREAT_CORRELATION',
      'EVIDENCE_SYNTHESIS',
      'CONCLUSION_SUBMISSION',
      'COMPLETED',
    ];
    if (!validPhases.includes(networkInvestigation.activePhase)) {
      throw new InvariantViolationError(
        `Invalid networkInvestigation.activePhase: ${networkInvestigation.activePhase}`
      );
    }
    if (!Array.isArray(networkInvestigation.objectives)) {
      throw new InvariantViolationError('networkInvestigation.objectives must be an array');
    }
    for (const obj of networkInvestigation.objectives) {
      if (!obj || typeof obj !== 'object' || !obj.id || typeof obj.title !== 'string') {
        throw new InvariantViolationError('networkInvestigation objective is malformed');
      }
    }
    if (!Array.isArray(networkInvestigation.inspectedHostIds)) {
      throw new InvariantViolationError('networkInvestigation.inspectedHostIds must be an array');
    }
    if (!Array.isArray(networkInvestigation.inspectedEventIds)) {
      throw new InvariantViolationError('networkInvestigation.inspectedEventIds must be an array');
    }
    if (!Array.isArray(networkInvestigation.correlatedIndicatorIds)) {
      throw new InvariantViolationError('networkInvestigation.correlatedIndicatorIds must be an array');
    }
    if (!Array.isArray(networkInvestigation.collectedEvidenceIds)) {
      throw new InvariantViolationError('networkInvestigation.collectedEvidenceIds must be an array');
    }
    if (!networkInvestigation.indicatorReviews || typeof networkInvestigation.indicatorReviews !== 'object') {
      throw new InvariantViolationError('networkInvestigation.indicatorReviews must be an object');
    }
    if (!Array.isArray(networkInvestigation.analystNotes)) {
      throw new InvariantViolationError('networkInvestigation.analystNotes must be an array');
    }
  }

  // 17. Red Team assessment domain invariants
  const { redTeamAssessment } = state;
  if (redTeamAssessment) {
    if (!redTeamAssessment.scenarioId || typeof redTeamAssessment.scenarioId !== 'string') {
      throw new InvariantViolationError('redTeamAssessment.scenarioId must be a non-empty string');
    }
    if (!redTeamAssessment.scenarioTitle || typeof redTeamAssessment.scenarioTitle !== 'string') {
      throw new InvariantViolationError('redTeamAssessment.scenarioTitle must be a non-empty string');
    }
    const validPhases = [
      'BRIEFING_SCOPE',
      'RECON_DISCOVERY',
      'TARGET_ASSESSMENT',
      'FINDING_VALIDATION',
      'REPORT_GENERATION',
      'COMPLETED',
    ];
    if (!validPhases.includes(redTeamAssessment.activePhase)) {
      throw new InvariantViolationError(
        `Invalid redTeamAssessment.activePhase: ${redTeamAssessment.activePhase}`
      );
    }
    if (!redTeamAssessment.roe || typeof redTeamAssessment.roe !== 'object') {
      throw new InvariantViolationError('redTeamAssessment.roe must be an object');
    }
    if (!redTeamAssessment.roe.assessmentId || typeof redTeamAssessment.roe.assessmentId !== 'string') {
      throw new InvariantViolationError('redTeamAssessment.roe.assessmentId must be a non-empty string');
    }
    if (!Array.isArray(redTeamAssessment.targets)) {
      throw new InvariantViolationError('redTeamAssessment.targets must be an array');
    }
    for (const t of redTeamAssessment.targets) {
      if (!t || typeof t !== 'object' || !t.id || typeof t.hostname !== 'string' || typeof t.inScope !== 'boolean') {
        throw new InvariantViolationError('redTeamAssessment target is malformed');
      }
    }
    if (!Array.isArray(redTeamAssessment.availableTools)) {
      throw new InvariantViolationError('redTeamAssessment.availableTools must be an array');
    }
    if (!Array.isArray(redTeamAssessment.objectives)) {
      throw new InvariantViolationError('redTeamAssessment.objectives must be an array');
    }
    for (const obj of redTeamAssessment.objectives) {
      if (!obj || typeof obj !== 'object' || !obj.id || typeof obj.title !== 'string' || typeof obj.isCompleted !== 'boolean') {
        throw new InvariantViolationError('redTeamAssessment objective is malformed');
      }
    }
    if (!Array.isArray(redTeamAssessment.findings)) {
      throw new InvariantViolationError('redTeamAssessment.findings must be an array');
    }
    for (const f of redTeamAssessment.findings) {
      if (!f || typeof f !== 'object' || !f.id || typeof f.title !== 'string' || !f.severity || !f.status) {
        throw new InvariantViolationError('redTeamAssessment finding is malformed');
      }
    }
    if (!Array.isArray(redTeamAssessment.evidenceVault)) {
      throw new InvariantViolationError('redTeamAssessment.evidenceVault must be an array');
    }
    if (!Array.isArray(redTeamAssessment.auditLog)) {
      throw new InvariantViolationError('redTeamAssessment.auditLog must be an array');
    }
    if (!Array.isArray(redTeamAssessment.analystNotes)) {
      throw new InvariantViolationError('redTeamAssessment.analystNotes must be an array');
    }
  }

  // 18. Defensive Ops & Purple Team domain invariants
  const { defensiveOps } = state;
  if (defensiveOps) {
    if (!defensiveOps.scenarioId || typeof defensiveOps.scenarioId !== 'string') {
      throw new InvariantViolationError('defensiveOps.scenarioId must be a non-empty string');
    }
    if (!defensiveOps.title || typeof defensiveOps.title !== 'string') {
      throw new InvariantViolationError('defensiveOps.title must be a non-empty string');
    }
    const validTabs = ['telemetry', 'rules', 'alerts', 'investigation', 'response', 'purple', 'mission'];
    if (!validTabs.includes(defensiveOps.activeTab)) {
      throw new InvariantViolationError(`Invalid defensiveOps.activeTab: ${defensiveOps.activeTab}`);
    }
    if (!Array.isArray(defensiveOps.telemetryEvents)) {
      throw new InvariantViolationError('defensiveOps.telemetryEvents must be an array');
    }
    if (!Array.isArray(defensiveOps.rules)) {
      throw new InvariantViolationError('defensiveOps.rules must be an array');
    }
    for (const r of defensiveOps.rules) {
      if (!r || typeof r !== 'object' || !r.id || typeof r.name !== 'string') {
        throw new InvariantViolationError('defensiveOps rule is malformed');
      }
    }
    if (!Array.isArray(defensiveOps.alerts)) {
      throw new InvariantViolationError('defensiveOps.alerts must be an array');
    }
    for (const a of defensiveOps.alerts) {
      if (!a || typeof a !== 'object' || !a.id || typeof a.title !== 'string') {
        throw new InvariantViolationError('defensiveOps alert is malformed');
      }
    }
    if (!Array.isArray(defensiveOps.objectives)) {
      throw new InvariantViolationError('defensiveOps.objectives must be an array');
    }
    for (const obj of defensiveOps.objectives) {
      if (!obj || typeof obj !== 'object' || !obj.id || typeof obj.title !== 'string') {
        throw new InvariantViolationError('defensiveOps objective is malformed');
      }
    }
    if (!Array.isArray(defensiveOps.hypotheses)) {
      throw new InvariantViolationError('defensiveOps.hypotheses must be an array');
    }
    if (!Array.isArray(defensiveOps.executedResponses)) {
      throw new InvariantViolationError('defensiveOps.executedResponses must be an array');
    }
    if (!Array.isArray(defensiveOps.blockedIndicators)) {
      throw new InvariantViolationError('defensiveOps.blockedIndicators must be an array');
    }
    if (!Array.isArray(defensiveOps.isolatedHostIds)) {
      throw new InvariantViolationError('defensiveOps.isolatedHostIds must be an array');
    }
    if (!Array.isArray(defensiveOps.lockedUserAccounts)) {
      throw new InvariantViolationError('defensiveOps.lockedUserAccounts must be an array');
    }
    if (!defensiveOps.purpleEmulationResults || typeof defensiveOps.purpleEmulationResults !== 'object') {
      throw new InvariantViolationError('defensiveOps.purpleEmulationResults must be an object');
    }
  }

  // 19. Bounty Hunting & Security Contracts domain invariants
  const { bountyHub } = state;
  if (bountyHub) {
    if (!Array.isArray(bountyHub.contracts)) {
      throw new InvariantViolationError('bountyHub.contracts must be an array');
    }
    for (const c of bountyHub.contracts) {
      if (!c || typeof c !== 'object' || !c.id || typeof c.title !== 'string') {
        throw new InvariantViolationError('bountyHub contract is malformed');
      }
    }
    if (!bountyHub.reputation || typeof bountyHub.reputation !== 'object') {
      throw new InvariantViolationError('bountyHub.reputation must be an object');
    }
    if (!Number.isFinite(bountyHub.reputation.score) || bountyHub.reputation.score < 0) {
      throw new InvariantViolationError('bountyHub.reputation.score must be a non-negative number');
    }
    if (!Array.isArray(bountyHub.completedContractHistory)) {
      throw new InvariantViolationError('bountyHub.completedContractHistory must be an array');
    }
    if (bountyHub.activeContract) {
      const ac = bountyHub.activeContract;
      if (!ac.contractId || typeof ac.contractId !== 'string') {
        throw new InvariantViolationError('bountyHub.activeContract.contractId must be a non-empty string');
      }
      if (!Array.isArray(ac.objectives)) {
        throw new InvariantViolationError('bountyHub.activeContract.objectives must be an array');
      }
      if (!Array.isArray(ac.auditEvents)) {
        throw new InvariantViolationError('bountyHub.activeContract.auditEvents must be an array');
      }
    }
  }

  // 20. Activity Director & Shared Activity Framework invariants
  const { activityDirector } = state;
  if (activityDirector) {
    if (!activityDirector.activities || typeof activityDirector.activities !== 'object') {
      throw new InvariantViolationError('activityDirector.activities must be a valid object');
    }
    if (!Array.isArray(activityDirector.recommendedActivityIds)) {
      throw new InvariantViolationError('activityDirector.recommendedActivityIds must be an array');
    }
    if (!Array.isArray(activityDirector.completedHistory)) {
      throw new InvariantViolationError('activityDirector.completedHistory must be an array');
    }
    if (!Array.isArray(activityDirector.longTermGoals)) {
      throw new InvariantViolationError('activityDirector.longTermGoals must be an array');
    }
  }

  // 21. World Simulation invariants (M22)
  const { worldSim } = state;
  if (worldSim) {
    if (!worldSim.locationVisits || typeof worldSim.locationVisits !== 'object') {
      throw new InvariantViolationError('worldSim.locationVisits must be a valid object');
    }
    if (!Array.isArray(worldSim.claimedDiscoveries)) {
      throw new InvariantViolationError('worldSim.claimedDiscoveries must be an array');
    }
    if (!Array.isArray(worldSim.pendingDiscoveryIds)) {
      throw new InvariantViolationError('worldSim.pendingDiscoveryIds must be an array');
    }
    if (!Array.isArray(worldSim.explorationUnlockedActivityIds)) {
      throw new InvariantViolationError('worldSim.explorationUnlockedActivityIds must be an array');
    }
  }
}

export function checkSimulationInvariants(state: SimulationState): string[] {
  try {
    validateSimulationState(state);
    return [];
  } catch (err: unknown) {
    if (err instanceof InvariantViolationError) {
      return [err.message];
    }
    return [String(err)];
  }
}



