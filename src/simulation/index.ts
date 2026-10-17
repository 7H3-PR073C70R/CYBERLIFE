/**
 * Cyberlife — Simulation Layer Public API.
 * Exported types, state factories, commands, events, and engine interfaces.
 */

// Engine
export {
  SimulationEngine,
  createSimulationEngine,
  type SimulationEngineOptions,
  type StateListener,
  type EventListener,
} from './SimulationEngine';

// Core State
export {
  type SimulationState,
  type SimulationMetadata,
  type SimulationTimeState,
  type CalendarTime,
  type PlayerAttributes,
  type InventorySlot,
  type SimulationInventoryState,
  type WorldFlagValue,
  type SimulationTimerState,
} from './core/types';
export { createInitialSimulationState, type InitialStateOverrides } from './core/initialState';
export { validateSimulationState } from './core/invariants';
export { deepFreeze, deepClone } from './core/stateUtils';

// Commands
export {
  type SimulationCommand,
  type CommandResult,
  type SimulationErrorCode,
  type AdvanceSimulationTimeCommand,
  type ChangePlayerAttributeCommand,
  type SetPlayerAttributeCommand,
  type CreditMoneyCommand,
  type DebitMoneyCommand,
  type AddInventoryItemCommand,
  type RemoveInventoryItemCommand,
  type SetWorldFlagCommand,
  type SetLogicalPlayerLocationCommand,
  type ScheduleTimerCommand,
  type CancelTimerCommand,
} from './commands/types';
export { handleCommand } from './commands/commandHandler';

// Events
export {
  type SimulationEvent,
  type SimulationEventType,
  type BaseSimulationEvent,
  type SimulationTimeAdvancedEvent,
  type PlayerAttributeChangedEvent,
  type PlayerMoneyChangedEvent,
  type InventoryItemAddedEvent,
  type InventoryItemRemovedEvent,
  type WorldFlagChangedEvent,
  type LogicalPlayerLocationChangedEvent,
  type SimulationTimerTriggeredEvent,
  type SimulationTimerScheduledEvent,
  type SimulationTimerCancelledEvent,
} from './events/types';
export { createSimulationEvent, resetEventCounter } from './events/eventFactory';

// Time & Timers
export { calculateCalendarTime, DEFAULT_SIMULATION_START_ISO } from './time/calendar';
export {
  scheduleTimer,
  cancelTimer,
  processDueTimers,
  type ScheduleTimerOptions,
} from './time/timerManager';

// Systems
export {
  ITEM_REGISTRY,
  type ItemDefinition,
  addItemToInventory,
  removeItemFromInventory,
  hasItem,
  getItemQuantity,
  findItemSlot,
  validateItemQuantity,
} from './systems/inventorySystem';
export {
  MIN_ATTRIBUTE_VALUE,
  MAX_ATTRIBUTE_VALUE,
  type BoundedAttribute,
  changePlayerAttribute,
  setPlayerAttribute,
  creditPlayerMoney,
  debitPlayerMoney,
  setPlayerLocation,
} from './systems/playerSystem';
export {
  setWorldFlag,
  getWorldFlag,
  validateFlagKey,
  validateFlagValue,
} from './systems/worldFlagsSystem';

// Domain Re-exports
export { Money } from '../domain/common/Money';
export {
  DomainError,
  ValidationError,
  InsufficientFundsError,
  InvalidArgumentError,
  InvariantViolationError,
} from '../domain/errors/DomainError';
