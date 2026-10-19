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
}
