/**
 * Cyberlife — Milestone 22: World Command Handler
 *
 * Handles:
 *  - ClaimExplorationDiscovery: claims an exploration lead/intel/clue, unlocks activities, sets flags
 *  - RecordLocationVisit: logs player presence at a world venue/location
 */

import type { SimulationState } from '../core/types';
import type {
  ClaimExplorationDiscoveryCommand,
  RecordLocationVisitCommand,
  CommandResult,
} from '../commands/types';
import { createSimulationEvent } from '../events/eventFactory';
import { deepFreeze } from '../core/stateUtils';
import { validateSimulationState } from '../core/invariants';
import { WorldSimulationService } from './WorldSimulationService';
import { EXPLORATION_DISCOVERIES } from './explorationDiscoveries';
import { createInitialWorldSimulationState } from './types';

export function handleClaimExplorationDiscovery(
  currentState: SimulationState,
  command: ClaimExplorationDiscoveryCommand
): CommandResult {
  const { discoveryId } = command;
  if (!discoveryId || typeof discoveryId !== 'string') {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'INVALID_ARGUMENT',
      message: 'Discovery ID must be a non-empty string',
    };
  }

  const discovery = EXPLORATION_DISCOVERIES.find(d => d.id === discoveryId);
  if (!discovery) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'DISCOVERY_NOT_FOUND',
      message: `Exploration discovery "${discoveryId}" does not exist in catalogue`,
    };
  }

  const worldSim = currentState.worldSim ?? createInitialWorldSimulationState();

  // Check if non-repeatable discovery was already claimed
  const alreadyClaimed = worldSim.claimedDiscoveries.some(c => c.discoveryId === discoveryId);
  if (alreadyClaimed && !discovery.isRepeatable) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'DISCOVERY_ALREADY_CLAIMED',
      message: `Exploration discovery "${discoveryId}" has already been claimed`,
    };
  }

  // Check required location if not 'any'
  if (discovery.requiredLocationId !== 'any' && discovery.requiredLocationId !== currentState.player.locationId) {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'DISCOVERY_CONDITIONS_NOT_MET',
      message: `Discovery "${discoveryId}" requires location "${discovery.requiredLocationId}", but player is at "${currentState.player.locationId}"`,
    };
  }

  // Check required hours if specified
  if (discovery.availableHours) {
    const currentHour = currentState.time.calendar.hour;
    const [startH, endH] = discovery.availableHours;
    const inWindow = startH <= endH
      ? (currentHour >= startH && currentHour <= endH)
      : (currentHour >= startH || currentHour <= endH);
    if (!inWindow) {
      return {
        success: false,
        state: currentState,
        events: [],
        errorCode: 'DISCOVERY_CONDITIONS_NOT_MET',
        message: `Discovery "${discoveryId}" is only available between ${startH}:00 and ${endH}:00 (current hour: ${currentHour})`,
      };
    }
  }

  // Check required flags if specified
  if (discovery.requiredFlags) {
    const flags = currentState.flags ?? {};
    for (const [key, expected] of Object.entries(discovery.requiredFlags)) {
      if (flags[key] !== expected) {
        return {
          success: false,
          state: currentState,
          events: [],
          errorCode: 'DISCOVERY_CONDITIONS_NOT_MET',
          message: `Discovery "${discoveryId}" requires world flag ${key}=${expected}`,
        };
      }
    }
  }

  // Claim through service
  const currentSimTime = currentState.time.simulationTimeSeconds;
  const { nextWorldState, flagsToSet, unlockedActivityId } = WorldSimulationService.claimDiscovery(
    worldSim,
    discoveryId,
    currentState.player.locationId,
    currentSimTime
  );

  const nextRevision = currentState.metadata.revision + 1;
  const event = createSimulationEvent(
    'EXPLORATION_DISCOVERY_CLAIMED',
    currentSimTime,
    nextRevision,
    {
      discoveryId,
      category: discovery.category,
      title: discovery.title,
      locationId: currentState.player.locationId,
      unlockedActivityId,
    }
  );

  // Merge any flags set by the discovery
  const updatedFlags = {
    ...(currentState.flags ?? {}),
    ...flagsToSet,
  };

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    flags: updatedFlags,
    worldSim: nextWorldState,
  };

  validateSimulationState(nextState);

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Claimed exploration discovery "${discovery.title}" (${discovery.category})`,
  };
}

export function handleRecordLocationVisit(
  currentState: SimulationState,
  command: RecordLocationVisitCommand
): CommandResult {
  const { locationId } = command;
  if (!locationId || typeof locationId !== 'string') {
    return {
      success: false,
      state: currentState,
      events: [],
      errorCode: 'INVALID_ARGUMENT',
      message: 'Location ID must be a non-empty string',
    };
  }

  const worldSim = currentState.worldSim ?? createInitialWorldSimulationState();
  const currentSimTime = currentState.time.simulationTimeSeconds;
  const currentHour = currentState.time.calendar.hour;

  let nextWorldState = WorldSimulationService.recordLocationVisit(
    worldSim,
    locationId,
    currentSimTime,
    currentHour
  );

  nextWorldState = WorldSimulationService.queueNewDiscoveries(
    nextWorldState,
    locationId,
    currentHour,
    currentState.flags ?? {}
  );

  const visitRecord = nextWorldState.locationVisits[locationId];
  const totalVisits = visitRecord?.totalVisits ?? 1;
  const nextRevision = currentState.metadata.revision + 1;

  const event = createSimulationEvent(
    'LOCATION_VISIT_RECORDED',
    currentSimTime,
    nextRevision,
    {
      locationId,
      totalVisits,
      arrivalHour: currentHour,
    }
  );

  const nextState: SimulationState = {
    ...currentState,
    metadata: {
      ...currentState.metadata,
      revision: nextRevision,
    },
    worldSim: nextWorldState,
  };

  validateSimulationState(nextState);

  return {
    success: true,
    state: deepFreeze(nextState),
    events: [event],
    message: `Recorded visit to "${locationId}" (visit #${totalVisits})`,
  };
}
