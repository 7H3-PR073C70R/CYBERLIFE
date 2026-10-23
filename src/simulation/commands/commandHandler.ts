import { SimulationState } from '../core/types';
import { SimulationCommand, CommandResult, SimulationErrorCode } from './types';
import { SimulationEvent } from '../events/types';
import { createSimulationEvent } from '../events/eventFactory';
import { validateSimulationState } from '../core/invariants';
import { calculateCalendarTime } from '../time/calendar';
import { scheduleTimer, cancelTimer, processDueTimers } from '../time/timerManager';
import {
  addItemToInventory,
  removeItemFromInventory,
  getItemQuantity,
} from '../systems/inventorySystem';
import {
  changePlayerAttribute,
  setPlayerAttribute,
  creditPlayerMoney,
  debitPlayerMoney,
  setPlayerLocation,
} from '../systems/playerSystem';
import { setWorldFlag } from '../systems/worldFlagsSystem';
import { deepFreeze } from '../core/stateUtils';
import { DomainError } from '../../domain/errors/DomainError';
import { createInitialAsterIncidentMissionState } from '../missions/initialMissionState';
import {
  validateRootCauseAssessment,
  validateIncidentReport,
  runSimulatedVerification,
} from '../missions/asterIncidentGroundTruth';
import { clampRelationship, getRelationshipBand, NpcSimulationState } from '../actors/types';
import { getNpcProfile } from '../actors/npcProfiles';
import { getDialogueGraph } from '../../content/dialogue/npcDialogueData';
import { isDialogueConditionMet } from '../narrative/dialogueEvaluator';
import { DialogueEvaluationContext } from '../narrative/dialogueTypes';
import {
  handleAcceptJob,
  handleCompleteJob,
  handlePromoteCareer,
  handlePurchaseItem,
  handleStudyLearningMaterial,
  handlePayRecurringExpense,
  processRecurringExpensesOnTimeAdvance,
} from '../career/careerSystem';
import { JOB_LISTINGS } from '../career/jobDefinitions';
import {
  handleCompleteOnboardingStep,
  handleSkipOnboarding,
  handleResetOnboarding,
  handleDismissGuidanceHint,
  handleSetGuidanceMode,
} from '../onboarding/onboardingHandler';
import {
  handleSimulationStartCatalogueExercise,
  handleSimulationSubmitExerciseAction,
  handleSimulationTuneDetectionRule,
  handleSimulationRunPurpleScenario,
  handleSimulationSubmitRedTeamFinding,
  handleSimulationCompleteCatalogueExercise,
  handleSimulationResetCatalogueExercise,
} from '../catalogue/catalogueHandler';
import {
  handleStartStoryArc,
  handleAdvanceStoryChapter,
  handleCompleteNarrativeMission,
  handleFailNarrativeMission,
  handleRecordInvestigativeEvidence,
  handleFormulateConclusion,
  handleSubmitInvestigativeConclusion,
  handleChangeFactionStanding,
} from '../narrative/narrativeCommandHandler';
import {
  handleSetIndicatorReviewStatus,
  handleRecordNetworkAnalystNote,
  handleAdvanceNetworkObjective,
  handleSubmitNetworkInvestigationConclusion,
} from '../cyber/investigation/networkInvestigationCommandHandler';
import {
  handleAcceptRulesOfEngagement,
  handleExecuteRedTeamAction,
  handleValidateVulnerabilityFinding,
  handleRecordRedTeamAnalystNote,
  handlePreserveRedTeamEvidence,
  handleSubmitAssessmentReport,
} from '../cyber/redteam/redTeamCommandHandler';
import {
  handleTriageSecurityAlert,
  handleToggleDetectionRule,
  handleExecuteDefensiveResponse,
  handleRecordDefensiveHypothesis,
  handleAdvanceDefensiveObjective,
  handleRunPurpleTeamScenario,
  handleSubmitDefensiveIncidentReport,
} from '../cyber/defensive/defensiveCommandHandler';
import {
  handleAcceptContract,
  handleWithdrawContract,
  handleClarifyContractScope,
  handleExecuteContractSimulatedAction,
  handleUpdateContractSubmissionDraft,
  handleSubmitContractDeliverables,
  handleResubmitContractRevision,
  handleSelectBountyContract,
  handleSetBountyCategoryFilter,
  handleSetBountyTab,
} from '../cyber/contracts/bountyCommandHandler';
import {
  handleAcceptActivity,
  handleAbandonActivity,
  handleResolveActivity,
  handleSetPrimaryActivity,
  handleSetActivityGuidanceFilter,
} from '../activities/activityCommandHandler';
import { clampFactionStanding, getFactionStandingBand } from '../narrative/narrativeEvaluator';
import {
  handleStartInterview,
  handleAskInterviewQuestion,
  handlePresentEvidenceToNpc,
  handleConcludeInterview,
  handleInspectWorldObject,
  handleCompareEvidenceWithTestimony,
  handleSubmitM21Conclusion,
  handleEvaluateSocEngDecision,
  handleRaiseAssessmentFinding,
  handleSubmitPhysicalAssessmentReport,
} from '../humanIntel/humanIntelCommandHandler';
import {
  handleClaimExplorationDiscovery,
  handleRecordLocationVisit,
} from '../world/worldCommandHandler';
import { WorldSimulationService } from '../world/WorldSimulationService';
import {
  startEpisode,
  completeEpisodeBeat,
  dismissTitleCard,
  dismissBlackout,
  triggerBlackoutBeat,
  setGuidanceMode,
  unlockJournalEntry,
} from '../narrative/episodeDirector';


function makeFailure(
  state: Readonly<SimulationState>,
  errorCode: SimulationErrorCode,
  message: string
): CommandResult {
  return {
    success: false,
    state,
    events: [],
    errorCode,
    message,
    isNoOp: false,
  };
}

function makeNoOp(state: Readonly<SimulationState>, message: string): CommandResult {
  return {
    success: true,
    state,
    events: [],
    message,
    isNoOp: true,
  };
}

function makeSuccess(
  state: Readonly<SimulationState>,
  events: ReadonlyArray<SimulationEvent>,
  message: string
): CommandResult {
  return {
    success: true,
    state,
    events,
    message,
    isNoOp: false,
  };
}

/**
 * Authoritative, pure command handler for the simulation engine.
 * Receives current state and a requested command; returns the deterministic CommandResult.
 */
export function handleCommand(
  currentState: Readonly<SimulationState>,
  command: SimulationCommand
): CommandResult {
  if (!command || typeof command !== 'object' || !('type' in command)) {
    return makeFailure(currentState, 'INVALID_COMMAND', 'Command must be an object with a type');
  }

  try {
    switch (command.type) {
      case 'AdvanceSimulationTime': {
        const { deltaSeconds } = command;
        if (!Number.isFinite(deltaSeconds) || deltaSeconds < 0) {
          return makeFailure(
            currentState,
            'INVALID_TIME_DELTA',
            `Time advance delta must be a non-negative finite number, received: ${deltaSeconds}`
          );
        }

        if (deltaSeconds === 0) {
          return makeNoOp(currentState, 'Time advanced by 0 seconds (no-op)');
        }

        const nextRevision = currentState.metadata.revision + 1;
        const newSimTime = currentState.time.simulationTimeSeconds + deltaSeconds;
        const newCalendar = calculateCalendarTime(
          newSimTime,
          currentState.metadata.initializedAtIso
        );

        // Process scheduled timers that become due
        const { dueTimers, remainingTimers } = processDueTimers(currentState.timers, newSimTime);

        const events: SimulationEvent[] = [];

        // Time advanced event
        events.push(
          createSimulationEvent('SIMULATION_TIME_ADVANCED', newSimTime, nextRevision, {
            deltaSeconds,
            totalSimulationSeconds: newSimTime,
            calendarIso: newCalendar.iso,
            calendarTimeString: newCalendar.timeString,
          })
        );

        // Due timer triggered events in deterministic order
        for (const timer of dueTimers) {
          events.push(
            createSimulationEvent('SIMULATION_TIMER_TRIGGERED', newSimTime, nextRevision, {
              timerId: timer.id,
              label: timer.label,
              dueSimulationTime: timer.dueSimulationTime,
              payload: timer.payload,
            })
          );
        }

        // Process recurring living expenses (e.g. apartment rent, fiber internet)
        const {
          player: expPlayer,
          economy: expEconomy,
          events: expEvents,
        } = processRecurringExpensesOnTimeAdvance(currentState, newSimTime, nextRevision);
        events.push(...expEvents);

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          time: {
            simulationTimeSeconds: newSimTime,
            calendar: newCalendar,
          },
          player: expPlayer,
          economy: expEconomy,
          timers: remainingTimers,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events,
          message: `Advanced simulation time by ${deltaSeconds}s to ${newCalendar.timeString}`,
        };
      }

      case 'ChangePlayerAttribute': {
        const { attribute, delta } = command;
        if (attribute !== 'health' && attribute !== 'energy') {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            `Unknown attribute "${String(attribute)}"`
          );
        }
        if (!Number.isFinite(delta)) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            `Attribute delta must be a finite number, received: ${delta}`
          );
        }

        const previousValue = currentState.player[attribute];
        const { player: updatedPlayer, actualDelta } = changePlayerAttribute(
          currentState.player,
          attribute,
          delta
        );

        if (actualDelta === 0) {
          return makeNoOp(
            currentState,
            `Attribute "${attribute}" already at boundary (${previousValue})`
          );
        }

        const nextRevision = currentState.metadata.revision + 1;
        const event = createSimulationEvent(
          'PLAYER_ATTRIBUTE_CHANGED',
          currentState.time.simulationTimeSeconds,
          nextRevision,
          {
            attribute,
            previousValue,
            newValue: updatedPlayer[attribute],
            delta: actualDelta,
          }
        );

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          player: updatedPlayer,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Player ${attribute} changed by ${actualDelta > 0 ? '+' : ''}${actualDelta} to ${updatedPlayer[attribute]}`,
        };
      }

      case 'SetPlayerAttribute': {
        const { attribute, value } = command;
        if (attribute !== 'health' && attribute !== 'energy') {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            `Unknown attribute "${String(attribute)}"`
          );
        }
        if (!Number.isFinite(value) || value < 0 || value > 100) {
          return makeFailure(
            currentState,
            'ATTRIBUTE_OUT_OF_BOUNDS',
            `Attribute value must be between 0 and 100, received: ${value}`
          );
        }

        const previousValue = currentState.player[attribute];
        if (previousValue === value) {
          return makeNoOp(
            currentState,
            `Player attribute "${attribute}" is already ${value} (no-op)`
          );
        }

        const { player: updatedPlayer } = setPlayerAttribute(currentState.player, attribute, value);

        const nextRevision = currentState.metadata.revision + 1;
        const delta = value - previousValue;
        const event = createSimulationEvent(
          'PLAYER_ATTRIBUTE_CHANGED',
          currentState.time.simulationTimeSeconds,
          nextRevision,
          {
            attribute,
            previousValue,
            newValue: value,
            delta,
          }
        );

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          player: updatedPlayer,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Player ${attribute} set from ${previousValue} to ${value}`,
        };
      }

      case 'CreditMoney': {
        const { amountKobo, reason } = command;
        if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
          return makeFailure(
            currentState,
            'INVALID_CURRENCY_AMOUNT',
            `Credit amount must be a positive safe integer in kobo, received: ${amountKobo}`
          );
        }

        const previousKobo = currentState.player.moneyKobo;
        const updatedPlayer = creditPlayerMoney(currentState.player, amountKobo);
        const nextRevision = currentState.metadata.revision + 1;

        const event = createSimulationEvent(
          'PLAYER_MONEY_CHANGED',
          currentState.time.simulationTimeSeconds,
          nextRevision,
          {
            previousKobo,
            newKobo: updatedPlayer.moneyKobo,
            deltaKobo: amountKobo,
            operation: 'CREDIT' as const,
            reason,
          }
        );

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          player: updatedPlayer,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Credited ₦${(amountKobo / 100).toFixed(2)} to player balance${reason ? ` (${reason})` : ''}`,
        };
      }

      case 'DebitMoney': {
        const { amountKobo, reason } = command;
        if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
          return makeFailure(
            currentState,
            'INVALID_CURRENCY_AMOUNT',
            `Debit amount must be a positive safe integer in kobo, received: ${amountKobo}`
          );
        }

        if (amountKobo > currentState.player.moneyKobo) {
          const reqStr = `₦${(amountKobo / 100).toFixed(2)}`;
          const availStr = `₦${(currentState.player.moneyKobo / 100).toFixed(2)}`;
          return makeFailure(
            currentState,
            'INSUFFICIENT_FUNDS',
            `Insufficient funds: Cannot debit ${reqStr}, only ${availStr} available`
          );
        }

        const previousKobo = currentState.player.moneyKobo;
        const updatedPlayer = debitPlayerMoney(currentState.player, amountKobo);
        const nextRevision = currentState.metadata.revision + 1;

        const event = createSimulationEvent(
          'PLAYER_MONEY_CHANGED',
          currentState.time.simulationTimeSeconds,
          nextRevision,
          {
            previousKobo,
            newKobo: updatedPlayer.moneyKobo,
            deltaKobo: -amountKobo,
            operation: 'DEBIT' as const,
            reason,
          }
        );

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          player: updatedPlayer,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Debited ₦${(amountKobo / 100).toFixed(2)} from player balance${reason ? ` (${reason})` : ''}`,
        };
      }

      case 'AddInventoryItem': {
        const { itemId, quantity } = command;
        if (!itemId || typeof itemId !== 'string' || itemId.trim().length === 0) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'Item ID must be a non-empty string'
          );
        }
        if (!Number.isSafeInteger(quantity) || quantity <= 0) {
          return makeFailure(
            currentState,
            'INVALID_ITEM_QUANTITY',
            `Item quantity must be a positive safe integer, received: ${quantity}`
          );
        }

        const trimmedId = itemId.trim();
        const updatedInventory = addItemToInventory(currentState.inventory, trimmedId, quantity);
        const totalQuantity = getItemQuantity(updatedInventory, trimmedId);

        const nextRevision = currentState.metadata.revision + 1;
        const event = createSimulationEvent(
          'INVENTORY_ITEM_ADDED',
          currentState.time.simulationTimeSeconds,
          nextRevision,
          {
            itemId: trimmedId,
            quantityAdded: quantity,
            totalQuantity,
          }
        );

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          inventory: updatedInventory,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Added ${quantity}x "${trimmedId}" to inventory (total: ${totalQuantity})`,
        };
      }

      case 'RemoveInventoryItem': {
        const { itemId, quantity } = command;
        if (!itemId || typeof itemId !== 'string' || itemId.trim().length === 0) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'Item ID must be a non-empty string'
          );
        }
        if (!Number.isSafeInteger(quantity) || quantity <= 0) {
          return makeFailure(
            currentState,
            'INVALID_ITEM_QUANTITY',
            `Item quantity must be a positive safe integer, received: ${quantity}`
          );
        }

        const trimmedId = itemId.trim();
        const available = getItemQuantity(currentState.inventory, trimmedId);
        if (available === 0) {
          return makeFailure(
            currentState,
            'ITEM_NOT_FOUND',
            `Item "${trimmedId}" is not present in player inventory`
          );
        }
        if (quantity > available) {
          return makeFailure(
            currentState,
            'INSUFFICIENT_ITEM_QUANTITY',
            `Cannot remove ${quantity}x "${trimmedId}": Only ${available} available`
          );
        }

        const updatedInventory = removeItemFromInventory(
          currentState.inventory,
          trimmedId,
          quantity
        );
        const remainingQuantity = getItemQuantity(updatedInventory, trimmedId);

        const nextRevision = currentState.metadata.revision + 1;
        const event = createSimulationEvent(
          'INVENTORY_ITEM_REMOVED',
          currentState.time.simulationTimeSeconds,
          nextRevision,
          {
            itemId: trimmedId,
            quantityRemoved: quantity,
            remainingQuantity,
          }
        );

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          inventory: updatedInventory,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Removed ${quantity}x "${trimmedId}" from inventory (remaining: ${remainingQuantity})`,
        };
      }

      case 'SetWorldFlag': {
        const { key, value } = command;
        if (!key || typeof key !== 'string') {
          return makeFailure(currentState, 'INVALID_FLAG_KEY', 'Flag key must be a string');
        }

        const trimmedKey = key.trim();
        const flagKeyRegex = /^[a-zA-Z0-9_.-]{2,64}$/;
        if (!flagKeyRegex.test(trimmedKey)) {
          return makeFailure(
            currentState,
            'INVALID_FLAG_KEY',
            `Flag key "${trimmedKey}" is invalid. Must be 2-64 chars matching [a-zA-Z0-9_.-]`
          );
        }

        if (
          typeof value !== 'boolean' &&
          typeof value !== 'string' &&
          (typeof value !== 'number' || !Number.isFinite(value))
        ) {
          return makeFailure(
            currentState,
            'INVALID_FLAG_VALUE',
            `Flag value must be a boolean, string, or finite number, received: ${String(value)}`
          );
        }

        const previousValue = currentState.flags[trimmedKey];
        const { flags: updatedFlags, changed } = setWorldFlag(
          currentState.flags,
          trimmedKey,
          value
        );

        if (!changed) {
          return makeNoOp(
            currentState,
            `Flag "${trimmedKey}" is already set to ${String(value)} (no-op)`
          );
        }

        const nextRevision = currentState.metadata.revision + 1;
        const event = createSimulationEvent(
          'WORLD_FLAG_CHANGED',
          currentState.time.simulationTimeSeconds,
          nextRevision,
          {
            key: trimmedKey,
            previousValue,
            newValue: value,
          }
        );

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          flags: updatedFlags,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Set world flag "${trimmedKey}" to ${String(value)}`,
        };
      }

      case 'SetLogicalPlayerLocation': {
        const { locationId } = command;
        if (!locationId || typeof locationId !== 'string' || locationId.trim().length === 0) {
          return makeFailure(
            currentState,
            'INVALID_LOCATION',
            'Location ID must be a non-empty string'
          );
        }

        const trimmedLocation = locationId.trim();
        if (currentState.player.locationId === trimmedLocation) {
          return makeNoOp(
            currentState,
            `Player already at logical location "${trimmedLocation}" (no-op)`
          );
        }

        const previousLocationId = currentState.player.locationId;
        const updatedPlayer = setPlayerLocation(currentState.player, trimmedLocation);
        const nextRevision = currentState.metadata.revision + 1;

        const event = createSimulationEvent(
          'LOGICAL_PLAYER_LOCATION_CHANGED',
          currentState.time.simulationTimeSeconds,
          nextRevision,
          {
            previousLocationId,
            newLocationId: trimmedLocation,
          }
        );

        // M22: Record visit & queue discoveries
        let updatedWorldSim = currentState.worldSim;
        if (updatedWorldSim) {
          updatedWorldSim = WorldSimulationService.recordLocationVisit(
            updatedWorldSim,
            trimmedLocation,
            currentState.time.simulationTimeSeconds,
            currentState.time.calendar.hour
          );
          updatedWorldSim = WorldSimulationService.queueNewDiscoveries(
            updatedWorldSim,
            trimmedLocation,
            currentState.time.calendar.hour,
            currentState.flags
          );
        }

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          player: updatedPlayer,
          worldSim: updatedWorldSim ?? currentState.worldSim,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Player moved from "${previousLocationId}" to "${trimmedLocation}"`,
        };
      }

      case 'ScheduleTimer': {
        const { id, durationSeconds, label, payload, repeatIntervalSeconds } = command;
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'Timer ID must be a non-empty string'
          );
        }
        if (currentState.timers.some(t => t.id === id.trim())) {
          return makeFailure(
            currentState,
            'TIMER_ALREADY_EXISTS',
            `Timer with ID "${id.trim()}" is already active`
          );
        }
        if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            `Timer duration must be a positive finite number, received: ${durationSeconds}`
          );
        }
        if (
          repeatIntervalSeconds !== undefined &&
          (!Number.isFinite(repeatIntervalSeconds) || repeatIntervalSeconds <= 0)
        ) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            `Repeat interval must be a positive finite number, received: ${repeatIntervalSeconds}`
          );
        }

        const { timers: updatedTimers, nextSequence } = scheduleTimer(
          currentState.timers,
          currentState.time.simulationTimeSeconds,
          currentState.nextTimerSequence,
          {
            id: id.trim(),
            durationSeconds,
            label: label?.trim() || id.trim(),
            payload,
            repeatIntervalSeconds,
          }
        );

        const nextRevision = currentState.metadata.revision + 1;
        const dueTime = currentState.time.simulationTimeSeconds + durationSeconds;
        const event = createSimulationEvent(
          'SIMULATION_TIMER_SCHEDULED',
          currentState.time.simulationTimeSeconds,
          nextRevision,
          {
            timerId: id.trim(),
            label: label?.trim() || id.trim(),
            dueSimulationTime: dueTime,
            durationSeconds,
          }
        );

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          timers: updatedTimers,
          nextTimerSequence: nextSequence,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Scheduled timer "${id.trim()}" to trigger in ${durationSeconds}s (at ${dueTime}s)`,
        };
      }

      case 'CancelTimer': {
        const { id } = command;
        if (!id || typeof id !== 'string' || id.trim().length === 0) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'Timer ID must be a non-empty string'
          );
        }

        const trimmedId = id.trim();
        if (!currentState.timers.some(t => t.id === trimmedId)) {
          return makeFailure(
            currentState,
            'TIMER_NOT_FOUND',
            `Cannot cancel: Timer with ID "${trimmedId}" not found`
          );
        }

        const updatedTimers = cancelTimer(currentState.timers, trimmedId);
        const nextRevision = currentState.metadata.revision + 1;

        const event = createSimulationEvent(
          'SIMULATION_TIMER_CANCELLED',
          currentState.time.simulationTimeSeconds,
          nextRevision,
          {
            timerId: trimmedId,
          }
        );

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          timers: updatedTimers,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Cancelled timer "${trimmedId}"`,
        };
      }

      case 'RecordCyberActivity': {
        const { activityId, tool, action, target, summary, success, metadata } = command;
        if (!activityId || typeof activityId !== 'string' || !activityId.trim()) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'RecordCyberActivity requires a non-empty string activityId'
          );
        }
        if (!tool || typeof tool !== 'string' || !tool.trim()) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'RecordCyberActivity requires a non-empty string tool'
          );
        }
        if (!action || typeof action !== 'string' || !action.trim()) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'RecordCyberActivity requires a non-empty string action'
          );
        }
        if (!summary || typeof summary !== 'string') {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'RecordCyberActivity requires a string summary'
          );
        }

        const nextRevision = currentState.metadata.revision + 1;
        const currentCount =
          typeof currentState.flags['cyber_tools_executed_count'] === 'number'
            ? (currentState.flags['cyber_tools_executed_count'] as number)
            : 0;

        const event = createSimulationEvent(
          'CYBER_ACTIVITY_RECORDED',
          currentState.time.simulationTimeSeconds,
          nextRevision,
          {
            activityId: activityId.trim(),
            tool: tool.trim(),
            action: action.trim(),
            target: target?.trim(),
            summary: summary.trim(),
            success: Boolean(success),
            metadata,
          }
        );

        const toolLower = tool.trim().toLowerCase();
        const nextFlags = {
          ...currentState.flags,
          cyber_last_activity_id: activityId.trim(),
          cyber_last_tool: tool.trim(),
          cyber_tools_executed_count: currentCount + 1,
          [`cyber_tool_executed_${toolLower}`]: true,
          [`ran_tool_${toolLower}`]: true,
        };

        // Auto-progress active mission objectives when corresponding cyber tools execute
        let nextMission = currentState.mission;
        if (nextMission && success) {
          const simTime = currentState.time.simulationTimeSeconds;
          let discoveredHosts = [...nextMission.discoveredHosts];
          let inspectedServices = [...nextMission.inspectedServices];
          let analyzedLogIds = [...nextMission.analyzedLogIds];

          if (toolLower === 'netmap' || toolLower === 'nmap') {
            const hostsToAdd = ['app-portal-01', 'filesrv-01', 'gw-core-01', 'ws-sec-04', 'mon-siem-01', 'vault-core-01'];
            discoveredHosts = Array.from(new Set([...discoveredHosts, ...hostsToAdd]));
          } else if (toolLower === 'svcscan') {
            const targetHost = target?.trim() || 'app-portal-01';
            inspectedServices = Array.from(new Set([...inspectedServices, targetHost, 'filesrv-01']));
          } else if (toolLower === 'logview') {
            const logId = target?.trim() || 'LOG-2026-107B';
            analyzedLogIds = Array.from(new Set([...analyzedLogIds, logId, 'LOG-2026-109B']));
          }

          const updatedObjectives = nextMission.objectives.map(obj => {
            if (obj.id === 'obj-assess-01' && (toolLower === 'netmap' || toolLower === 'nmap')) {
              return { ...obj, isCompleted: true, completedAt: simTime };
            }
            if (obj.id === 'obj-investigate-01' && toolLower === 'svcscan') {
              return { ...obj, isCompleted: true, completedAt: simTime };
            }
            if (obj.id === 'obj-investigate-02' && toolLower === 'logview') {
              return { ...obj, isCompleted: true, completedAt: simTime };
            }
            if (obj.id === 'obj-evidence-01' && toolLower === 'evidence') {
              return { ...obj, isCompleted: true, completedAt: simTime };
            }
            return obj;
          });

          let nextPhase = nextMission.phase;
          if (nextPhase === 'initial_assessment' && (toolLower === 'netmap' || toolLower === 'nmap')) {
            nextPhase = 'investigation';
          }

          nextMission = {
            ...nextMission,
            phase: nextPhase,
            discoveredHosts,
            inspectedServices,
            analyzedLogIds,
            objectives: updatedObjectives,
          };
        }

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          flags: nextFlags,
          ...(nextMission ? { mission: nextMission } : {}),
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Recorded cyber activity "${activityId}" for tool "${tool}"`,
        };
      }

      // ======================================================================
      // Milestone 6: The Aster Incident Mission Commands
      // ======================================================================

      case 'StartAsterMission': {
        const mission = currentState.mission ?? createInitialAsterIncidentMissionState();
        const nextRevision = currentState.metadata.revision + 1;
        const event = createSimulationEvent(
          'MISSION_STARTED',
          currentState.time.simulationTimeSeconds,
          nextRevision,
          {
            missionId: mission.missionId,
            title: mission.title,
          }
        );

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          flags: {
            ...currentState.flags,
            mission_aster_active: true,
            mission_aster_phase: mission.phase,
          },
          mission: {
            ...mission,
            hasStarted: true,
          },
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Mission "${mission.title}" is active.`,
        };
      }

      case 'AdvanceAsterMissionPhase': {
        const mission = currentState.mission;
        if (!mission) {
          return makeFailure(currentState, 'INVALID_ARGUMENT', 'No mission active to advance');
        }
        const { targetPhase } = command;
        const currentPhase = mission.phase;

        if (currentPhase === targetPhase) {
          return makeNoOp(currentState, `Mission is already in phase "${targetPhase}".`);
        }

        // Validate phase prerequisites
        if (targetPhase === 'remediation' && !mission.isContained) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'Cannot advance to remediation: Aster must first be contained to mitigate active data exfiltration.'
          );
        }
        if (targetPhase === 'verification' && !mission.isRemediated) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'Cannot advance to verification: Aster permissions have not been remediated.'
          );
        }
        if (targetPhase === 'reporting' && !mission.isVerified) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'Cannot advance to reporting: Remediation has not been verified.'
          );
        }
        if (
          targetPhase === 'completed' &&
          (!mission.incidentReport || !mission.incidentReport.isApproved)
        ) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'Cannot complete mission: Incident report has not been submitted and approved.'
          );
        }

        const nextRevision = currentState.metadata.revision + 1;
        const simTime = currentState.time.simulationTimeSeconds;

        const event = createSimulationEvent('MISSION_PHASE_ADVANCED', simTime, nextRevision, {
          missionId: mission.missionId,
          previousPhase: currentPhase,
          currentPhase: targetPhase,
        });

        const updatedObjectives = mission.objectives.map(obj => {
          if (obj.phase === currentPhase && !obj.isCompleted) {
            return { ...obj, isCompleted: true, completedAt: simTime };
          }
          return obj;
        });

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          flags: {
            ...currentState.flags,
            mission_aster_phase: targetPhase,
          },
          mission: {
            ...mission,
            phase: targetPhase,
            objectives: updatedObjectives,
          },
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Mission advanced from "${currentPhase}" to "${targetPhase}".`,
        };
      }

      case 'RecordMissionFinding': {
        const mission = currentState.mission;
        if (!mission) {
          return makeFailure(currentState, 'INVALID_ARGUMENT', 'No mission active');
        }
        const { findingType, targetId } = command;
        const cleanTarget = targetId.trim();

        let discoveredHosts = mission.discoveredHosts;
        let inspectedServices = mission.inspectedServices;
        let analyzedLogIds = mission.analyzedLogIds;

        if (findingType === 'host' && !discoveredHosts.includes(cleanTarget)) {
          discoveredHosts = [...discoveredHosts, cleanTarget];
        } else if (findingType === 'service' && !inspectedServices.includes(cleanTarget)) {
          inspectedServices = [...inspectedServices, cleanTarget];
        } else if (findingType === 'log' && !analyzedLogIds.includes(cleanTarget)) {
          analyzedLogIds = [...analyzedLogIds, cleanTarget];
        }

        const simTime = currentState.time.simulationTimeSeconds;
        const updatedObjectives = mission.objectives.map(obj => {
          if (findingType === 'host' && obj.id === 'obj-assess-01' && !obj.isCompleted) {
            return { ...obj, isCompleted: true, completedAt: simTime };
          }
          if (
            findingType === 'service' &&
            obj.id === 'obj-investigate-01' &&
            inspectedServices.length >= 2 &&
            !obj.isCompleted
          ) {
            return { ...obj, isCompleted: true, completedAt: simTime };
          }
          if (findingType === 'log' && obj.id === 'obj-investigate-02' && !obj.isCompleted) {
            return { ...obj, isCompleted: true, completedAt: simTime };
          }
          return obj;
        });

        const nextRevision = currentState.metadata.revision + 1;
        const event = createSimulationEvent('MISSION_FINDING_RECORDED', simTime, nextRevision, {
          missionId: mission.missionId,
          findingType,
          targetId: cleanTarget,
        });

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          mission: {
            ...mission,
            discoveredHosts,
            inspectedServices,
            analyzedLogIds,
            objectives: updatedObjectives,
          },
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Recorded ${findingType} finding: "${cleanTarget}"`,
        };
      }

      case 'PreserveMissionEvidence': {
        const mission = currentState.mission;
        if (!mission) {
          return makeFailure(currentState, 'INVALID_ARGUMENT', 'No mission active');
        }
        const { evidenceId } = command;
        const cleanId = evidenceId.trim().toUpperCase();

        if (mission.preservedEvidenceIds.includes(cleanId)) {
          return makeNoOp(currentState, `Evidence "${cleanId}" has already been preserved.`);
        }

        const preservedEvidenceIds = [...mission.preservedEvidenceIds, cleanId];
        const simTime = currentState.time.simulationTimeSeconds;

        const updatedObjectives = mission.objectives.map(obj => {
          if (obj.id === 'obj-evidence-01' && !obj.isCompleted) {
            return { ...obj, isCompleted: true, completedAt: simTime };
          }
          return obj;
        });

        const nextRevision = currentState.metadata.revision + 1;
        const hashSha256 = '3a5f9c12e82b4a11c3ab8bf7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa';
        const event = createSimulationEvent('MISSION_EVIDENCE_PRESERVED', simTime, nextRevision, {
          missionId: mission.missionId,
          evidenceId: cleanId,
          hashSha256,
        });

        const updatedVault = currentState.narrative
          ? {
              ...currentState.narrative.evidenceVault,
              [cleanId]: currentState.narrative.evidenceVault[cleanId] ?? {
                evidenceId: cleanId,
                source: 'forensic_capture',
                title: `Preserved Evidence ${cleanId}`,
                description: `Forensic evidence artifact preserved during incident triage.`,
                hash: hashSha256,
                collectedAtSimTime: simTime,
                integrityVerified: true,
                tags: ['forensics', 'incident_evidence'],
              },
            }
          : undefined;

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          flags: {
            ...currentState.flags,
            evidence_preserved_count: preservedEvidenceIds.length,
          },
          mission: {
            ...mission,
            preservedEvidenceIds,
            objectives: updatedObjectives,
          },
          narrative: currentState.narrative
            ? {
                ...currentState.narrative,
                evidenceVault: updatedVault!,
              }
            : undefined,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Forensic evidence "${cleanId}" preserved with SHA-256 integrity hash.`,
        };
      }

      case 'SubmitRootCauseAssessment': {
        const mission = currentState.mission;
        if (!mission) {
          return makeFailure(currentState, 'INVALID_ARGUMENT', 'No mission active');
        }

        const result = validateRootCauseAssessment({
          suspectedRootCause: command.suspectedRootCause,
          affectedComponent: command.affectedComponent,
          observedImpact: command.observedImpact,
          supportingEvidenceIds: command.supportingEvidenceIds,
        });

        const nextRevision = currentState.metadata.revision + 1;
        const simTime = currentState.time.simulationTimeSeconds;

        const event = createSimulationEvent('MISSION_ASSESSMENT_SUBMITTED', simTime, nextRevision, {
          missionId: mission.missionId,
          isAccurate: result.isAccurate,
          feedback: result.feedback,
        });

        const assessment = {
          suspectedRootCause: command.suspectedRootCause,
          affectedComponent: command.affectedComponent,
          observedImpact: command.observedImpact,
          supportingEvidenceIds: command.supportingEvidenceIds,
          uncertaintyOrNotes: command.uncertaintyOrNotes,
          submittedAt: simTime,
          isAccurate: result.isAccurate,
          feedback: result.feedback,
        };

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          flags: {
            ...currentState.flags,
            assessment_accurate: result.isAccurate,
          },
          mission: {
            ...mission,
            rootCauseAssessment: assessment,
          },
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: result.feedback,
        };
      }

      case 'ExecuteContainment': {
        const mission = currentState.mission;
        if (!mission) {
          return makeFailure(currentState, 'INVALID_ARGUMENT', 'No mission active');
        }
        if (mission.isContained) {
          return makeNoOp(currentState, 'Aster AI service is already in CONTAINED mode.');
        }

        const nextRevision = currentState.metadata.revision + 1;
        const simTime = currentState.time.simulationTimeSeconds;

        const event = createSimulationEvent('MISSION_CONTAINMENT_EXECUTED', simTime, nextRevision, {
          missionId: mission.missionId,
          action: command.action,
          targetHost: mission.asterService.hostId,
        });

        const updatedObjectives = mission.objectives.map(obj => {
          if (obj.id === 'obj-containment-01' && !obj.isCompleted) {
            return { ...obj, isCompleted: true, completedAt: simTime };
          }
          return obj;
        });

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          flags: {
            ...currentState.flags,
            mission_aster_contained: true,
            mission_aster_phase: 'remediation',
          },
          mission: {
            ...mission,
            isContained: true,
            containmentTimestamp: simTime,
            phase: mission.phase === 'containment' ? 'remediation' : mission.phase,
            asterService: {
              ...mission.asterService,
              operationalMode: 'CONTAINED',
              smbAccessAllowed: false,
              databaseAccessAllowed: false,
            },
            objectives: updatedObjectives,
          },
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message:
            'Containment successful: Aster AI service isolated from departmental storage & SMB shares. Active data exfiltration mitigated.',
        };
      }

      case 'RemediatePermissions': {
        const mission = currentState.mission;
        if (!mission) {
          return makeFailure(currentState, 'INVALID_ARGUMENT', 'No mission active');
        }
        const { targetPolicyRole, removeSmbAccess, removeDatabaseAccess, grantedScopes } = command;

        if (targetPolicyRole !== 'kb-assistant' || !removeSmbAccess) {
          return makeFailure(
            currentState,
            'INVALID_ARGUMENT',
            'Remediation Rejected: Applying excessive role or retaining SMB file server access violates the Principle of Least Privilege. Select role:kb-assistant and remove SMB access.'
          );
        }

        const nextRevision = currentState.metadata.revision + 1;
        const simTime = currentState.time.simulationTimeSeconds;

        const event = createSimulationEvent('MISSION_REMEDIATION_APPLIED', simTime, nextRevision, {
          missionId: mission.missionId,
          role: targetPolicyRole,
          previousRole: mission.asterService.activePolicyRole,
        });

        const updatedObjectives = mission.objectives.map(obj => {
          if (obj.id === 'obj-remediation-01' && !obj.isCompleted) {
            return { ...obj, isCompleted: true, completedAt: simTime };
          }
          return obj;
        });

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          flags: {
            ...currentState.flags,
            mission_aster_remediated: true,
            mission_aster_phase: 'verification',
          },
          mission: {
            ...mission,
            isRemediated: true,
            remediationTimestamp: simTime,
            phase: mission.phase === 'remediation' ? 'verification' : mission.phase,
            asterService: {
              ...mission.asterService,
              operationalMode: 'REMEDIATED',
              activePolicyRole: 'kb-assistant',
              grantedScopes: grantedScopes.length > 0 ? grantedScopes : ['docs:read', 'kb:search'],
              smbAccessAllowed: false,
              databaseAccessAllowed: !removeDatabaseAccess ? false : false,
              lastPolicyUpdateAt: simTime,
            },
            objectives: updatedObjectives,
          },
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message:
            'Remediation Applied: Reconfigured svc-aster to least-privilege role "role:kb-assistant". Wildcard scopes and SMB access revoked.',
        };
      }

      case 'VerifyRemediation': {
        const mission = currentState.mission;
        if (!mission) {
          return makeFailure(currentState, 'INVALID_ARGUMENT', 'No mission active');
        }
        const simTime = currentState.time.simulationTimeSeconds;
        const verificationResult = runSimulatedVerification(mission.asterService, simTime);

        const nextRevision = currentState.metadata.revision + 1;
        const event = createSimulationEvent(
          'MISSION_VERIFICATION_COMPLETED',
          simTime,
          nextRevision,
          {
            missionId: mission.missionId,
            passed: verificationResult.passed,
            message: verificationResult.message,
          }
        );

        const updatedObjectives = mission.objectives.map(obj => {
          if (obj.id === 'obj-verification-01' && verificationResult.passed && !obj.isCompleted) {
            return { ...obj, isCompleted: true, completedAt: simTime };
          }
          return obj;
        });

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          flags: {
            ...currentState.flags,
            mission_aster_verified: verificationResult.passed,
            mission_aster_phase: verificationResult.passed ? 'reporting' : mission.phase,
          },
          mission: {
            ...mission,
            isVerified: verificationResult.passed,
            verificationResult,
            phase:
              verificationResult.passed && mission.phase === 'verification'
                ? 'reporting'
                : mission.phase,
            objectives: updatedObjectives,
          },
        };

        validateSimulationState(nextState);
        return {
          success: verificationResult.passed,
          state: deepFreeze(nextState),
          events: [event],
          message: verificationResult.message,
        };
      }

      case 'SubmitIncidentReport': {
        const mission = currentState.mission;
        if (!mission) {
          return makeFailure(currentState, 'INVALID_ARGUMENT', 'No mission active');
        }
        const report = command.report;
        const result = validateIncidentReport(report, {
          isContained: mission.isContained,
          isRemediated: mission.isRemediated,
          isVerified: mission.isVerified,
          asterService: mission.asterService,
        });

        const nextRevision = currentState.metadata.revision + 1;
        const simTime = currentState.time.simulationTimeSeconds;

        const reportEvent = createSimulationEvent(
          'MISSION_REPORT_SUBMITTED',
          simTime,
          nextRevision,
          {
            missionId: mission.missionId,
            isApproved: result.isApproved,
            score: result.score,
            feedback: result.reviewerFeedback,
          }
        );

        const events: SimulationEvent[] = [reportEvent];

        if (result.isApproved) {
          const completeEvent = createSimulationEvent('MISSION_COMPLETED', simTime, nextRevision, {
            missionId: mission.missionId,
            finalScore: result.score,
            outcomeSummary: result.reviewerFeedback,
          });
          events.push(completeEvent);
        }

        const updatedObjectives = mission.objectives.map(obj => {
          if (result.isApproved) {
            return { ...obj, isCompleted: true, completedAt: obj.completedAt ?? simTime };
          }
          if (obj.id === 'obj-reporting-01' && result.isApproved && !obj.isCompleted) {
            return { ...obj, isCompleted: true, completedAt: simTime };
          }
          return obj;
        });

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          flags: {
            ...currentState.flags,
            mission_aster_report_approved: result.isApproved,
            mission_aster_completed: result.isApproved,
            mission_aster_score: result.score,
            mission_aster_phase: result.isApproved ? 'completed' : mission.phase,
          },
          mission: {
            ...mission,
            incidentReport: {
              ...report,
              submittedAt: simTime,
              score: result.score,
              isApproved: result.isApproved,
              reviewerFeedback: result.reviewerFeedback,
            },
            isCompleted: result.isApproved ? true : mission.isCompleted,
            completedAt: result.isApproved ? simTime : mission.completedAt,
            finalScore: result.isApproved ? result.score : mission.finalScore,
            outcomeFeedback: result.reviewerFeedback,
            phase: result.isApproved ? 'completed' : mission.phase,
            objectives: updatedObjectives,
          },
        };

        validateSimulationState(nextState);
        return {
          success: result.isApproved,
          state: deepFreeze(nextState),
          events,
          message: result.reviewerFeedback,
        };
      }

      case 'StartNpcDialogue': {
        const { npcId, initialNodeId } = command;
        if (!npcId || typeof npcId !== 'string') {
          return makeFailure(currentState, 'INVALID_ARGUMENT', 'npcId must be a non-empty string');
        }

        const graph = getDialogueGraph(npcId);
        if (!graph) {
          return makeFailure(
            currentState,
            'NPC_NOT_FOUND',
            `No dialogue graph found for NPC "${npcId}"`
          );
        }

        const profile = getNpcProfile(npcId);
        const existingNpc = currentState.npcs?.[npcId] ?? {
          id: npcId,
          relationship: profile?.initialRelationship ?? 0,
          memory: {
            met: false,
            conversationCount: 0,
            topicsDiscussed: [],
            choicesMade: [],
            sharedFacts: [],
            commitments: [],
          },
        };

        const simTime = currentState.time.simulationTimeSeconds;
        const evalContext: DialogueEvaluationContext = {
          relationship: existingNpc.relationship,
          memory: existingNpc.memory,
          flags: currentState.flags,
          missionPhase: currentState.mission?.phase,
          careerLevel: currentState.career?.currentLevel,
          completedJobs: currentState.jobs?.completedJobHistory.map(j => j.jobId),
          skills: currentState.skills
            ? Object.fromEntries(Object.entries(currentState.skills).map(([k, v]) => [k, v.level]))
            : undefined,
          factionStandings: currentState.narrative?.factions
            ? Object.fromEntries(
                Object.entries(currentState.narrative.factions).map(([k, v]) => [k, v.standing])
              )
            : undefined,
          preservedEvidenceIds: currentState.narrative?.evidenceVault
            ? Object.keys(currentState.narrative.evidenceVault)
            : undefined,
          currentChapterId: currentState.narrative?.activeChapterId ?? undefined,
        };

        const selectedNodeId =
          initialNodeId ??
          (graph.getInitialNodeId ? graph.getInitialNodeId(evalContext) : graph.defaultNodeId);

        if (!graph.nodes[selectedNodeId]) {
          return makeFailure(
            currentState,
            'DIALOGUE_NODE_NOT_FOUND',
            `Node "${selectedNodeId}" does not exist in dialogue graph for "${npcId}"`
          );
        }

        const nextRevision = currentState.metadata.revision + 1;
        const events: SimulationEvent[] = [];

        const updatedMemory = {
          ...existingNpc.memory,
          met: true,
          metAtSimulationTime: existingNpc.memory.metAtSimulationTime ?? simTime,
          conversationCount: existingNpc.memory.conversationCount + 1,
          lastInteractionTime: simTime,
        };

        const updatedNpc: NpcSimulationState = {
          ...existingNpc,
          memory: updatedMemory,
        };

        events.push(
          createSimulationEvent('NPC_DIALOGUE_STARTED', simTime, nextRevision, {
            npcId,
            initialNodeId: selectedNodeId,
          })
        );

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          npcs: {
            ...(currentState.npcs ?? {}),
            [npcId]: updatedNpc,
          },
          activeDialogue: {
            npcId,
            currentNodeId: selectedNodeId,
          },
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events,
          message: `Started conversation with ${profile?.name ?? npcId}`,
        };
      }

      case 'SelectDialogueChoice': {
        const { npcId, choiceId } = command;
        if (!currentState.activeDialogue || currentState.activeDialogue.npcId !== npcId) {
          return makeFailure(
            currentState,
            'NO_ACTIVE_DIALOGUE',
            `No active dialogue session with NPC "${npcId}"`
          );
        }

        const graph = getDialogueGraph(npcId);
        if (!graph) {
          return makeFailure(
            currentState,
            'NPC_NOT_FOUND',
            `Dialogue graph not found for "${npcId}"`
          );
        }

        const currentNode = graph.nodes[currentState.activeDialogue.currentNodeId];
        if (!currentNode) {
          return makeFailure(
            currentState,
            'DIALOGUE_NODE_NOT_FOUND',
            `Current node "${currentState.activeDialogue.currentNodeId}" not found in graph`
          );
        }

        const choice = currentNode.choices.find(c => c.id === choiceId);
        if (!choice) {
          return makeFailure(
            currentState,
            'DIALOGUE_CHOICE_NOT_FOUND',
            `Choice "${choiceId}" not found on node "${currentNode.id}"`
          );
        }

        const npcState = currentState.npcs?.[npcId];
        if (!npcState) {
          return makeFailure(currentState, 'NPC_NOT_FOUND', `NPC state for "${npcId}" not found`);
        }

        const simTime = currentState.time.simulationTimeSeconds;
        const evalContext: DialogueEvaluationContext = {
          relationship: npcState.relationship,
          memory: npcState.memory,
          flags: currentState.flags,
          missionPhase: currentState.mission?.phase,
          careerLevel: currentState.career?.currentLevel,
          completedJobs: currentState.jobs?.completedJobHistory.map(j => j.jobId),
          skills: currentState.skills
            ? Object.fromEntries(Object.entries(currentState.skills).map(([k, v]) => [k, v.level]))
            : undefined,
          factionStandings: currentState.narrative?.factions
            ? Object.fromEntries(
                Object.entries(currentState.narrative.factions).map(([k, v]) => [k, v.standing])
              )
            : undefined,
          preservedEvidenceIds: currentState.narrative?.evidenceVault
            ? Object.keys(currentState.narrative.evidenceVault)
            : undefined,
          currentChapterId: currentState.narrative?.activeChapterId ?? undefined,
        };

        if (!isDialogueConditionMet(choice.condition, evalContext)) {
          return makeFailure(
            currentState,
            'DIALOGUE_CONDITION_NOT_MET',
            `Conditions for choice "${choiceId}" are not satisfied`
          );
        }

        const nextRevision = currentState.metadata.revision + 1;
        const events: SimulationEvent[] = [];

        let currentRel = npcState.relationship;
        let lastRelDelta: { delta: number; reason: string; timestamp: number } | undefined;
        let lastFacDelta:
          | { factionId: string; delta: number; reason: string; timestamp: number }
          | undefined;
        const updatedFlags = { ...currentState.flags };
        let updatedMission = currentState.mission ? { ...currentState.mission } : undefined;
        let updatedJobs = currentState.jobs ? { ...currentState.jobs } : undefined;
        let updatedNarrative = currentState.narrative ? { ...currentState.narrative } : undefined;
        const newTopics = [...npcState.memory.topicsDiscussed];
        const newChoices = [...npcState.memory.choicesMade];
        if (!newChoices.includes(choiceId)) {
          newChoices.push(choiceId);
        }
        const newFacts = [...npcState.memory.sharedFacts];
        const newCommitments = [...npcState.memory.commitments];

        // Process choice actions
        if (choice.actions) {
          for (const action of choice.actions) {
            switch (action.type) {
              case 'CHANGE_RELATIONSHIP': {
                const prev = currentRel;
                currentRel = clampRelationship(currentRel + action.delta);
                const actualDelta = currentRel - prev;
                lastRelDelta = {
                  delta: action.delta,
                  reason: action.reason,
                  timestamp: simTime,
                };
                events.push(
                  createSimulationEvent('NPC_RELATIONSHIP_CHANGED', simTime, nextRevision, {
                    npcId,
                    previousValue: prev,
                    newValue: currentRel,
                    delta: actualDelta,
                    reason: action.reason,
                    band: getRelationshipBand(currentRel),
                  })
                );
                break;
              }
              case 'SET_FLAG': {
                const prevVal = updatedFlags[action.key];
                updatedFlags[action.key] = action.value;
                events.push(
                  createSimulationEvent('WORLD_FLAG_CHANGED', simTime, nextRevision, {
                    key: action.key,
                    previousValue: prevVal,
                    newValue: action.value,
                  })
                );
                break;
              }
              case 'RECORD_MEMORY': {
                if (action.topic && !newTopics.includes(action.topic)) {
                  newTopics.push(action.topic);
                }
                if (action.fact && !newFacts.includes(action.fact)) {
                  newFacts.push(action.fact);
                }
                events.push(
                  createSimulationEvent('NPC_MEMORY_RECORDED', simTime, nextRevision, {
                    npcId,
                    topic: action.topic,
                    fact: action.fact,
                  })
                );
                break;
              }
              case 'ADVANCE_MISSION_PHASE': {
                if (updatedMission && updatedMission.phase !== action.targetPhase) {
                  const prevPhase = updatedMission.phase;
                  updatedMission = {
                    ...updatedMission,
                    phase: action.targetPhase,
                  };
                  events.push(
                    createSimulationEvent('MISSION_PHASE_ADVANCED', simTime, nextRevision, {
                      missionId: updatedMission.missionId,
                      previousPhase: prevPhase,
                      currentPhase: action.targetPhase,
                    })
                  );
                }
                break;
              }
              case 'RECORD_FINDING': {
                if (updatedMission) {
                  events.push(
                    createSimulationEvent('MISSION_FINDING_RECORDED', simTime, nextRevision, {
                      missionId: updatedMission.missionId,
                      findingType: action.findingType,
                      targetId: action.targetId,
                    })
                  );
                }
                break;
              }
              case 'ACCEPT_JOB': {
                if (
                  updatedJobs &&
                  !updatedJobs.activeJobs.some(j => j.listingId === action.jobId)
                ) {
                  const listing = JOB_LISTINGS[action.jobId];
                  if (listing) {
                    updatedJobs = {
                      ...updatedJobs,
                      availableJobIds: updatedJobs.availableJobIds.filter(
                        id => id !== action.jobId
                      ),
                      activeJobs: [
                        ...updatedJobs.activeJobs,
                        {
                          listingId: action.jobId,
                          acceptedAtSimulationSeconds: simTime,
                          objectives: listing.objectives.map(o => ({
                            ...o,
                            isCompleted: false,
                          })),
                        },
                      ],
                    };
                    events.push(
                      createSimulationEvent('JOB_ACCEPTED', simTime, nextRevision, {
                        jobId: listing.id,
                        title: listing.title,
                        employer: listing.employer,
                        payoutKobo: listing.payoutKobo,
                      })
                    );
                  }
                }
                break;
              }
              case 'CHANGE_FACTION_STANDING': {
                if (updatedNarrative) {
                  const existing = updatedNarrative.factions[action.factionId] ?? {
                    factionId: action.factionId,
                    standing: 0,
                    band: getFactionStandingBand(0),
                    history: [],
                  };
                  const prevStanding = existing.standing;
                  const newStanding = clampFactionStanding(prevStanding + action.delta);
                  const actualDelta = newStanding - prevStanding;
                  updatedNarrative = {
                    ...updatedNarrative,
                    factions: {
                      ...updatedNarrative.factions,
                      [action.factionId]: {
                        ...existing,
                        standing: newStanding,
                        band: getFactionStandingBand(newStanding),
                        history: [
                          ...existing.history,
                          { delta: action.delta, reason: action.reason, timestamp: simTime },
                        ],
                      },
                    },
                  };
                  lastFacDelta = {
                    factionId: action.factionId,
                    delta: action.delta,
                    reason: action.reason,
                    timestamp: simTime,
                  };
                  events.push(
                    createSimulationEvent('FACTION_STANDING_CHANGED', simTime, nextRevision, {
                      factionId: action.factionId,
                      previousStanding: prevStanding,
                      newStanding,
                      delta: actualDelta,
                      reason: action.reason,
                      band: getFactionStandingBand(newStanding),
                    })
                  );
                }
                break;
              }
              case 'RECORD_INVESTIGATIVE_CONCLUSION': {
                if (
                  updatedNarrative &&
                  !updatedNarrative.discoveredConclusions.includes(action.conclusionId)
                ) {
                  updatedNarrative = {
                    ...updatedNarrative,
                    discoveredConclusions: [
                      ...updatedNarrative.discoveredConclusions,
                      action.conclusionId,
                    ],
                  };
                  events.push(
                    createSimulationEvent(
                      'INVESTIGATIVE_CONCLUSION_FORMULATED',
                      simTime,
                      nextRevision,
                      {
                        conclusionId: action.conclusionId,
                        hypothesis: 'Discovered through dialogue testimony',
                        confidenceScore: 80,
                      }
                    )
                  );
                }
                break;
              }
              case 'RECORD_INVESTIGATIVE_EVIDENCE': {
                if (updatedNarrative && action.evidenceId) {
                  const evId = action.evidenceId;
                  if (!updatedNarrative.evidenceVault[evId]) {
                    updatedNarrative = {
                      ...updatedNarrative,
                      evidenceVault: {
                        ...updatedNarrative.evidenceVault,
                        [evId]: {
                          evidenceId: evId,
                          source: action.source ?? 'dialogue_disclosure',
                          title: action.title ?? 'Forensic Evidence',
                          description: action.description ?? 'Evidence acquired from testimony',
                          collectedAtSimTime: simTime,
                          hash: action.hash ?? 'sha256-evidence-hash',
                          integrityVerified: true,
                          tags: action.tags ?? ['whistleblower'],
                        },
                      },
                    };
                    events.push(
                      createSimulationEvent('MISSION_EVIDENCE_PRESERVED', simTime, nextRevision, {
                        missionId: currentState.mission?.missionId ?? 'aster-incident-01',
                        evidenceId: evId,
                        hashSha256: action.hash ?? '3a5f9c12e82b4a11c3ab8bf7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa',
                      })
                    );
                  }
                }
                break;
              }
              case 'ADVANCE_STORY_CHAPTER': {
                if (updatedNarrative && updatedNarrative.activeChapterId !== action.chapterId) {
                  const prevCh = updatedNarrative.activeChapterId;
                  const compChapters = [...updatedNarrative.completedChapterIds];
                  if (prevCh && !compChapters.includes(prevCh)) {
                    compChapters.push(prevCh);
                  }
                  updatedNarrative = {
                    ...updatedNarrative,
                    activeChapterId: action.chapterId,
                    completedChapterIds: compChapters,
                  };
                  events.push(
                    createSimulationEvent('STORY_CHAPTER_ADVANCED', simTime, nextRevision, {
                      arcId: updatedNarrative.activeArcId ?? 'unknown',
                      previousChapterId: prevCh,
                      currentChapterId: action.chapterId,
                    })
                  );
                }
                break;
              }
            }
          }
        }

        const nextNode = graph.nodes[choice.nextNodeId];
        const isTerminal = Boolean(
          !nextNode || nextNode.isTerminal || nextNode.choices.length === 0
        );

        events.push(
          createSimulationEvent('NPC_DIALOGUE_CHOICE_SELECTED', simTime, nextRevision, {
            npcId,
            choiceId,
            previousNodeId: currentNode.id,
            nextNodeId: choice.nextNodeId,
            isTerminal,
          })
        );

        if (isTerminal) {
          events.push(
            createSimulationEvent('NPC_DIALOGUE_ENDED', simTime, nextRevision, {
              npcId,
            })
          );
        }

        const updatedNpc: NpcSimulationState = {
          ...npcState,
          relationship: currentRel,
          memory: {
            ...npcState.memory,
            topicsDiscussed: newTopics,
            choicesMade: newChoices,
            sharedFacts: newFacts,
            commitments: newCommitments,
            lastInteractionTime: simTime,
          },
        };

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          flags: updatedFlags,
          mission: updatedMission,
          jobs: updatedJobs,
          narrative: updatedNarrative,
          npcs: {
            ...(currentState.npcs ?? {}),
            [npcId]: updatedNpc,
          },
          activeDialogue: isTerminal
            ? undefined
            : {
                npcId,
                currentNodeId: choice.nextNodeId,
                lastChoiceId: choiceId,
                lastRelationshipDelta:
                  lastRelDelta ?? currentState.activeDialogue.lastRelationshipDelta,
                lastFactionDelta:
                  lastFacDelta ?? currentState.activeDialogue.lastFactionDelta,
              },
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events,
          message: isTerminal
            ? `Conversation with ${npcId} ended.`
            : `Advanced dialogue to "${choice.nextNodeId}".`,
        };
      }

      case 'EndDialogue': {
        if (!currentState.activeDialogue) {
          return makeNoOp(currentState, 'No active dialogue to end');
        }

        const npcId = command.npcId ?? currentState.activeDialogue.npcId;
        const nextRevision = currentState.metadata.revision + 1;
        const simTime = currentState.time.simulationTimeSeconds;

        const event = createSimulationEvent('NPC_DIALOGUE_ENDED', simTime, nextRevision, {
          npcId,
        });

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          activeDialogue: undefined,
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Ended dialogue with ${npcId}`,
        };
      }

      case 'ChangeNpcRelationship': {
        const { npcId, delta, reason } = command;
        if (!npcId || typeof npcId !== 'string') {
          return makeFailure(currentState, 'INVALID_ARGUMENT', 'npcId must be a non-empty string');
        }

        const profile = getNpcProfile(npcId);
        const existingNpc = currentState.npcs?.[npcId] ?? {
          id: npcId,
          relationship: profile?.initialRelationship ?? 0,
          memory: {
            met: false,
            conversationCount: 0,
            topicsDiscussed: [],
            choicesMade: [],
            sharedFacts: [],
            commitments: [],
          },
        };

        const prev = existingNpc.relationship;
        const newRel = clampRelationship(prev + delta);

        if (prev === newRel) {
          return makeNoOp(
            currentState,
            `Relationship with ${npcId} is already at ${newRel} (no-op)`
          );
        }

        const nextRevision = currentState.metadata.revision + 1;
        const simTime = currentState.time.simulationTimeSeconds;

        const event = createSimulationEvent('NPC_RELATIONSHIP_CHANGED', simTime, nextRevision, {
          npcId,
          previousValue: prev,
          newValue: newRel,
          delta: newRel - prev,
          reason,
          band: getRelationshipBand(newRel),
        });

        const updatedNpc: NpcSimulationState = {
          ...existingNpc,
          relationship: newRel,
        };

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          npcs: {
            ...(currentState.npcs ?? {}),
            [npcId]: updatedNpc,
          },
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Changed relationship with ${npcId} by ${newRel - prev} to ${newRel} (${reason})`,
        };
      }

      case 'RecordNpcMemory': {
        const { npcId, topic, choice, fact, commitment } = command;
        if (!npcId || typeof npcId !== 'string') {
          return makeFailure(currentState, 'INVALID_ARGUMENT', 'npcId must be a non-empty string');
        }

        const profile = getNpcProfile(npcId);
        const existingNpc = currentState.npcs?.[npcId] ?? {
          id: npcId,
          relationship: profile?.initialRelationship ?? 0,
          memory: {
            met: false,
            conversationCount: 0,
            topicsDiscussed: [],
            choicesMade: [],
            sharedFacts: [],
            commitments: [],
          },
        };

        const mem = existingNpc.memory;
        const newTopics =
          topic && !mem.topicsDiscussed.includes(topic)
            ? [...mem.topicsDiscussed, topic]
            : mem.topicsDiscussed;
        const newChoices =
          choice && !mem.choicesMade.includes(choice)
            ? [...mem.choicesMade, choice]
            : mem.choicesMade;
        const newFacts =
          fact && !mem.sharedFacts.includes(fact) ? [...mem.sharedFacts, fact] : mem.sharedFacts;
        const newCommitments =
          commitment && !mem.commitments.includes(commitment)
            ? [...mem.commitments, commitment]
            : mem.commitments;

        if (
          newTopics === mem.topicsDiscussed &&
          newChoices === mem.choicesMade &&
          newFacts === mem.sharedFacts &&
          newCommitments === mem.commitments
        ) {
          return makeNoOp(currentState, `No new memory items to record for "${npcId}"`);
        }

        const nextRevision = currentState.metadata.revision + 1;
        const simTime = currentState.time.simulationTimeSeconds;

        const event = createSimulationEvent('NPC_MEMORY_RECORDED', simTime, nextRevision, {
          npcId,
          topic,
          choice,
          fact,
          commitment,
        });

        const updatedNpc: NpcSimulationState = {
          ...existingNpc,
          memory: {
            ...mem,
            topicsDiscussed: newTopics,
            choicesMade: newChoices,
            sharedFacts: newFacts,
            commitments: newCommitments,
            lastInteractionTime: simTime,
          },
        };

        const nextState: SimulationState = {
          ...currentState,
          metadata: {
            ...currentState.metadata,
            revision: nextRevision,
          },
          npcs: {
            ...(currentState.npcs ?? {}),
            [npcId]: updatedNpc,
          },
        };

        validateSimulationState(nextState);
        return {
          success: true,
          state: deepFreeze(nextState),
          events: [event],
          message: `Recorded memory for ${npcId}`,
        };
      }

      case 'AcceptJob': {
        return handleAcceptJob(currentState, command.jobId);
      }

      case 'CompleteJob': {
        return handleCompleteJob(currentState, command.jobId);
      }

      case 'PromoteCareer': {
        return handlePromoteCareer(currentState, command.targetPathId);
      }

      case 'PurchaseItem': {
        return handlePurchaseItem(currentState, command.itemId);
      }

      case 'StudyLearningMaterial': {
        return handleStudyLearningMaterial(currentState, command.itemId);
      }

      case 'PayRecurringExpense': {
        return handlePayRecurringExpense(currentState, command.expenseId);
      }

      case 'CompleteOnboardingStep': {
        return handleCompleteOnboardingStep(currentState, command.stepId, command.nextStepId);
      }

      case 'SkipOnboarding': {
        return handleSkipOnboarding(currentState);
      }

      case 'ResetOnboarding': {
        return handleResetOnboarding(currentState);
      }

      case 'DismissGuidanceHint': {
        return handleDismissGuidanceHint(currentState, command.hintId);
      }

      case 'SetGuidanceMode': {
        return handleSetGuidanceMode(currentState, command.mode);
      }

      case 'StartCatalogueExercise': {
        return handleSimulationStartCatalogueExercise(currentState, command.exerciseId);
      }

      case 'SubmitExerciseAction': {
        return handleSimulationSubmitExerciseAction(
          currentState,
          command.actionType,
          command.payload
        );
      }

      case 'TuneDetectionRule': {
        return handleSimulationTuneDetectionRule(currentState, command.ruleId, command.updates);
      }

      case 'RunPurpleScenario': {
        return handleSimulationRunPurpleScenario(currentState, command.runType);
      }

      case 'SubmitRedTeamFinding': {
        return handleSimulationSubmitRedTeamFinding(currentState, command.findingData);
      }

      case 'CompleteCatalogueExercise': {
        return handleSimulationCompleteCatalogueExercise(currentState, command.exerciseId);
      }

      case 'ResetCatalogueExercise': {
        return handleSimulationResetCatalogueExercise(currentState, command.exerciseId);
      }

      case 'StartStoryArc': {
        return handleStartStoryArc(currentState, command);
      }

      case 'AdvanceStoryChapter': {
        return handleAdvanceStoryChapter(currentState, command);
      }

      case 'CompleteNarrativeMission': {
        return handleCompleteNarrativeMission(currentState, command);
      }

      case 'FailNarrativeMission': {
        return handleFailNarrativeMission(currentState, command);
      }

      case 'RecordInvestigativeEvidence': {
        return handleRecordInvestigativeEvidence(currentState, command);
      }

      case 'FormulateConclusion': {
        return handleFormulateConclusion(currentState, command);
      }

      case 'SubmitInvestigativeConclusion': {
        return handleSubmitInvestigativeConclusion(currentState, command);
      }

      case 'ChangeFactionStanding': {
        return handleChangeFactionStanding(currentState, command);
      }

      case 'SetIndicatorReviewStatus': {
        return handleSetIndicatorReviewStatus(currentState, command);
      }

      case 'RecordNetworkAnalystNote': {
        return handleRecordNetworkAnalystNote(currentState, command);
      }

      case 'AdvanceNetworkObjective': {
        return handleAdvanceNetworkObjective(currentState, command);
      }

      case 'SubmitNetworkInvestigationConclusion': {
        return handleSubmitNetworkInvestigationConclusion(currentState, command);
      }

      case 'AcceptRulesOfEngagement': {
        return handleAcceptRulesOfEngagement(currentState, command);
      }

      case 'ExecuteRedTeamAction': {
        return handleExecuteRedTeamAction(currentState, command);
      }

      case 'ValidateVulnerabilityFinding': {
        return handleValidateVulnerabilityFinding(currentState, command);
      }

      case 'RecordRedTeamAnalystNote': {
        return handleRecordRedTeamAnalystNote(currentState, command);
      }

      case 'PreserveRedTeamEvidence': {
        return handlePreserveRedTeamEvidence(currentState, command);
      }

      case 'SubmitAssessmentReport': {
        return handleSubmitAssessmentReport(currentState, command);
      }

      case 'TriageSecurityAlert': {
        return handleTriageSecurityAlert(currentState, command);
      }

      case 'ToggleDetectionRule': {
        return handleToggleDetectionRule(currentState, command);
      }

      case 'ExecuteDefensiveResponse': {
        return handleExecuteDefensiveResponse(currentState, command);
      }

      case 'RecordDefensiveHypothesis': {
        return handleRecordDefensiveHypothesis(currentState, command);
      }

      case 'AdvanceDefensiveObjective': {
        return handleAdvanceDefensiveObjective(currentState, command);
      }

      case 'RunPurpleTeamScenario': {
        return handleRunPurpleTeamScenario(currentState, command);
      }

      case 'SubmitDefensiveIncidentReport': {
        return handleSubmitDefensiveIncidentReport(currentState, command);
      }

      case 'AcceptContract': {
        return handleAcceptContract(currentState, command);
      }

      case 'WithdrawContract': {
        return handleWithdrawContract(currentState, command);
      }

      case 'ClarifyContractScope': {
        return handleClarifyContractScope(currentState, command);
      }

      case 'ExecuteContractSimulatedAction': {
        return handleExecuteContractSimulatedAction(currentState, command);
      }

      case 'UpdateContractSubmissionDraft': {
        return handleUpdateContractSubmissionDraft(currentState, command);
      }

      case 'SubmitContractDeliverables': {
        return handleSubmitContractDeliverables(currentState, command);
      }

      case 'ResubmitContractRevision': {
        return handleResubmitContractRevision(currentState);
      }

      case 'SelectBountyContract': {
        return handleSelectBountyContract(currentState, command);
      }

      case 'SetBountyCategoryFilter': {
        return handleSetBountyCategoryFilter(currentState, command);
      }

      case 'SetBountyTab': {
        return handleSetBountyTab(currentState, command);
      }

      case 'AcceptActivity': {
        return handleAcceptActivity(currentState, command.activityId);
      }

      case 'AbandonActivity': {
        return handleAbandonActivity(currentState, command.activityId);
      }

      case 'ResolveActivity': {
        return handleResolveActivity(currentState, command.activityId);
      }

      case 'SetPrimaryActivity': {
        return handleSetPrimaryActivity(currentState, command.activityId);
      }

      case 'SetActivityGuidanceFilter': {
        return handleSetActivityGuidanceFilter(currentState, command.filter);
      }

      case 'StartInterview': {
        return handleStartInterview(currentState, command);
      }

      case 'AskInterviewQuestion': {
        return handleAskInterviewQuestion(currentState, command);
      }

      case 'PresentEvidenceToNpc': {
        return handlePresentEvidenceToNpc(currentState, command);
      }

      case 'ConcludeInterview': {
        return handleConcludeInterview(currentState, command);
      }

      case 'InspectWorldObject': {
        return handleInspectWorldObject(currentState, command);
      }

      case 'CompareEvidenceWithTestimony': {
        return handleCompareEvidenceWithTestimony(currentState, command);
      }

      case 'SubmitM21Conclusion': {
        return handleSubmitM21Conclusion(currentState, command);
      }

      case 'EvaluateSocEngDecision': {
        return handleEvaluateSocEngDecision(currentState, command);
      }

      case 'RaiseAssessmentFinding': {
        return handleRaiseAssessmentFinding(currentState, command);
      }

      case 'SubmitPhysicalAssessmentReport': {
        return handleSubmitPhysicalAssessmentReport(currentState, command);
      }

      case 'ClaimExplorationDiscovery': {
        return handleClaimExplorationDiscovery(currentState, command);
      }

      case 'RecordLocationVisit': {
        return handleRecordLocationVisit(currentState, command);
      }

      case 'StartEpisode': {
        const result = startEpisode(currentState, command.episodeId);
        return makeSuccess(result.state, result.events, `Episode "${command.episodeId}" started`);
      }

      case 'AdvanceEpisodeBeat': {
        if (!currentState.episode?.activeEpisodeId) {
          return makeFailure(currentState, 'EPISODE_NOT_FOUND', 'No active episode to advance');
        }
        return makeSuccess(currentState, [], 'Episode beat evaluated');
      }

      case 'CompleteEpisodeBeat': {
        const result = completeEpisodeBeat(currentState, command.beatId);
        return makeSuccess(result.state, result.events, `Episode beat "${command.beatId}" completed`);
      }

      case 'DismissEpisodeTitleCard': {
        const result = dismissTitleCard(currentState);
        return makeSuccess(result.state, result.events, 'Episode title card dismissed');
      }

      case 'TriggerBlackoutBeat': {
        const result = triggerBlackoutBeat(currentState, command.beatId);
        return makeSuccess(result.state, result.events, 'Blackout beat triggered');
      }

      case 'DismissEpisodeBlackout': {
        const result = dismissBlackout(currentState);
        return makeSuccess(result.state, result.events, 'Episode blackout dismissed');
      }

      case 'SetEpisodeGuidanceMode': {
        const result = setGuidanceMode(currentState, command.mode);
        return makeSuccess(result.state, result.events, `Episode guidance mode set to "${command.mode}"`);
      }

      case 'UnlockJournalEntry': {
        const result = unlockJournalEntry(currentState, command.entryId);
        return makeSuccess(result.state, result.events, `Journal entry "${command.entryId}" unlocked`);
      }

      default: {

        const unknownCmd = command as { type?: string };
        return makeFailure(
          currentState,
          'INVALID_COMMAND',
          `Unsupported or unknown simulation command: "${String(unknownCmd?.type)}"`
        );
      }
    }
  } catch (err) {
    if (err instanceof DomainError) {
      return makeFailure(currentState, 'INVARIANT_VIOLATION', err.message);
    }
    const message = err instanceof Error ? err.message : String(err);
    return makeFailure(currentState, 'INVARIANT_VIOLATION', `Unexpected error: ${message}`);
  }
}
