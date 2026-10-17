import { WorldFlagValue } from '../core/types';

export type SimulationEventType =
  | 'SIMULATION_TIME_ADVANCED'
  | 'PLAYER_ATTRIBUTE_CHANGED'
  | 'PLAYER_MONEY_CHANGED'
  | 'INVENTORY_ITEM_ADDED'
  | 'INVENTORY_ITEM_REMOVED'
  | 'WORLD_FLAG_CHANGED'
  | 'LOGICAL_PLAYER_LOCATION_CHANGED'
  | 'SIMULATION_TIMER_TRIGGERED'
  | 'SIMULATION_TIMER_SCHEDULED'
  | 'SIMULATION_TIMER_CANCELLED';

export interface BaseSimulationEvent<TType extends SimulationEventType, TPayload> {
  readonly id: string;
  readonly type: TType;
  readonly timestamp: number; // Simulation time in seconds
  readonly revision: number; // State revision after the event
  readonly payload: Readonly<TPayload>;
}

export type SimulationTimeAdvancedEvent = BaseSimulationEvent<
  'SIMULATION_TIME_ADVANCED',
  {
    readonly deltaSeconds: number;
    readonly totalSimulationSeconds: number;
    readonly calendarIso: string;
    readonly calendarTimeString: string;
  }
>;

export type PlayerAttributeChangedEvent = BaseSimulationEvent<
  'PLAYER_ATTRIBUTE_CHANGED',
  {
    readonly attribute: 'health' | 'energy';
    readonly previousValue: number;
    readonly newValue: number;
    readonly delta: number;
  }
>;

export type PlayerMoneyChangedEvent = BaseSimulationEvent<
  'PLAYER_MONEY_CHANGED',
  {
    readonly previousKobo: number;
    readonly newKobo: number;
    readonly deltaKobo: number;
    readonly operation: 'CREDIT' | 'DEBIT';
    readonly reason?: string;
  }
>;

export type InventoryItemAddedEvent = BaseSimulationEvent<
  'INVENTORY_ITEM_ADDED',
  {
    readonly itemId: string;
    readonly quantityAdded: number;
    readonly totalQuantity: number;
  }
>;

export type InventoryItemRemovedEvent = BaseSimulationEvent<
  'INVENTORY_ITEM_REMOVED',
  {
    readonly itemId: string;
    readonly quantityRemoved: number;
    readonly remainingQuantity: number;
  }
>;

export type WorldFlagChangedEvent = BaseSimulationEvent<
  'WORLD_FLAG_CHANGED',
  {
    readonly key: string;
    readonly previousValue: WorldFlagValue | undefined;
    readonly newValue: WorldFlagValue;
  }
>;

export type LogicalPlayerLocationChangedEvent = BaseSimulationEvent<
  'LOGICAL_PLAYER_LOCATION_CHANGED',
  {
    readonly previousLocationId: string;
    readonly newLocationId: string;
  }
>;

export type SimulationTimerTriggeredEvent = BaseSimulationEvent<
  'SIMULATION_TIMER_TRIGGERED',
  {
    readonly timerId: string;
    readonly label: string;
    readonly dueSimulationTime: number;
    readonly payload?: Readonly<Record<string, unknown>>;
  }
>;

export type SimulationTimerScheduledEvent = BaseSimulationEvent<
  'SIMULATION_TIMER_SCHEDULED',
  {
    readonly timerId: string;
    readonly label: string;
    readonly dueSimulationTime: number;
    readonly durationSeconds: number;
  }
>;

export type SimulationTimerCancelledEvent = BaseSimulationEvent<
  'SIMULATION_TIMER_CANCELLED',
  {
    readonly timerId: string;
  }
>;

export type SimulationEvent =
  | SimulationTimeAdvancedEvent
  | PlayerAttributeChangedEvent
  | PlayerMoneyChangedEvent
  | InventoryItemAddedEvent
  | InventoryItemRemovedEvent
  | WorldFlagChangedEvent
  | LogicalPlayerLocationChangedEvent
  | SimulationTimerTriggeredEvent
  | SimulationTimerScheduledEvent
  | SimulationTimerCancelledEvent;
