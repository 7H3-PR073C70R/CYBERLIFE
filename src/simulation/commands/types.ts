import { WorldFlagValue, SimulationState } from '../core/types';
import { SimulationEvent } from '../events/types';
import { BoundedAttribute } from '../systems/playerSystem';

export type SimulationErrorCode =
  | 'INVALID_COMMAND'
  | 'INVALID_ARGUMENT'
  | 'INVALID_TIME_DELTA'
  | 'ATTRIBUTE_OUT_OF_BOUNDS'
  | 'INSUFFICIENT_FUNDS'
  | 'INVALID_CURRENCY_AMOUNT'
  | 'ITEM_NOT_FOUND'
  | 'INSUFFICIENT_ITEM_QUANTITY'
  | 'INVALID_ITEM_QUANTITY'
  | 'INVALID_FLAG_KEY'
  | 'INVALID_FLAG_VALUE'
  | 'INVALID_LOCATION'
  | 'TIMER_ALREADY_EXISTS'
  | 'TIMER_NOT_FOUND'
  | 'INVARIANT_VIOLATION';

export interface AdvanceSimulationTimeCommand {
  readonly type: 'AdvanceSimulationTime';
  readonly deltaSeconds: number;
}

export interface ChangePlayerAttributeCommand {
  readonly type: 'ChangePlayerAttribute';
  readonly attribute: BoundedAttribute;
  readonly delta: number;
}

export interface SetPlayerAttributeCommand {
  readonly type: 'SetPlayerAttribute';
  readonly attribute: BoundedAttribute;
  readonly value: number;
}

export interface CreditMoneyCommand {
  readonly type: 'CreditMoney';
  readonly amountKobo: number;
  readonly reason?: string;
}

export interface DebitMoneyCommand {
  readonly type: 'DebitMoney';
  readonly amountKobo: number;
  readonly reason?: string;
}

export interface AddInventoryItemCommand {
  readonly type: 'AddInventoryItem';
  readonly itemId: string;
  readonly quantity: number;
}

export interface RemoveInventoryItemCommand {
  readonly type: 'RemoveInventoryItem';
  readonly itemId: string;
  readonly quantity: number;
}

export interface SetWorldFlagCommand {
  readonly type: 'SetWorldFlag';
  readonly key: string;
  readonly value: WorldFlagValue;
}

export interface SetLogicalPlayerLocationCommand {
  readonly type: 'SetLogicalPlayerLocation';
  readonly locationId: string;
}

export interface ScheduleTimerCommand {
  readonly type: 'ScheduleTimer';
  readonly id: string;
  readonly durationSeconds: number;
  readonly label: string;
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly repeatIntervalSeconds?: number;
}

export interface CancelTimerCommand {
  readonly type: 'CancelTimer';
  readonly id: string;
}

export type SimulationCommand =
  | AdvanceSimulationTimeCommand
  | ChangePlayerAttributeCommand
  | SetPlayerAttributeCommand
  | CreditMoneyCommand
  | DebitMoneyCommand
  | AddInventoryItemCommand
  | RemoveInventoryItemCommand
  | SetWorldFlagCommand
  | SetLogicalPlayerLocationCommand
  | ScheduleTimerCommand
  | CancelTimerCommand;

export interface CommandResult {
  readonly success: boolean;
  readonly state: Readonly<SimulationState>;
  readonly events: ReadonlyArray<SimulationEvent>;
  readonly errorCode?: SimulationErrorCode;
  readonly message: string;
  readonly isNoOp?: boolean;
}
