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
