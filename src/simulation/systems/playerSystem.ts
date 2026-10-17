import { PlayerAttributes } from '../core/types';
import {
  ValidationError,
  InsufficientFundsError,
  InvalidArgumentError,
} from '../../domain/errors/DomainError';
import { Money } from '../../domain/common/Money';

export const MIN_ATTRIBUTE_VALUE = 0;
export const MAX_ATTRIBUTE_VALUE = 100;

export type BoundedAttribute = 'health' | 'energy';

/**
 * Validates that an attribute change delta or target value is a finite number.
 */
function validateNumericValue(val: number, label: string): void {
  if (!Number.isFinite(val)) {
    throw new InvalidArgumentError(`${label} must be a finite number, received: ${val}`);
  }
}

/**
 * Changes a player attribute (health or energy) by a delta, clamping to [0, 100].
 * Returns the updated player and the actual delta applied.
 */
export function changePlayerAttribute(
  player: PlayerAttributes,
  attribute: BoundedAttribute,
  delta: number
): { readonly player: PlayerAttributes; readonly actualDelta: number } {
  validateNumericValue(delta, 'Attribute delta');

  const currentValue = player[attribute];
  const targetValue = Math.max(
    MIN_ATTRIBUTE_VALUE,
    Math.min(MAX_ATTRIBUTE_VALUE, currentValue + delta)
  );

  const actualDelta = targetValue - currentValue;

  if (actualDelta === 0) {
    return { player, actualDelta: 0 };
  }

  return {
    player: {
      ...player,
      [attribute]: targetValue,
    },
    actualDelta,
  };
}

/**
 * Sets a player attribute to an explicit target value in [0, 100].
 */
export function setPlayerAttribute(
  player: PlayerAttributes,
  attribute: BoundedAttribute,
  value: number
): { readonly player: PlayerAttributes; readonly previousValue: number } {
  validateNumericValue(value, 'Attribute value');

  if (value < MIN_ATTRIBUTE_VALUE || value > MAX_ATTRIBUTE_VALUE) {
    throw new ValidationError(
      `Attribute "${attribute}" must be between ${MIN_ATTRIBUTE_VALUE} and ${MAX_ATTRIBUTE_VALUE}, received: ${value}`
    );
  }

  const previousValue = player[attribute];
  if (previousValue === value) {
    return { player, previousValue };
  }

  return {
    player: {
      ...player,
      [attribute]: value,
    },
    previousValue,
  };
}

/**
 * Credits money (in kobo) to the player balance.
 */
export function creditPlayerMoney(player: PlayerAttributes, amountKobo: number): PlayerAttributes {
  if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
    throw new InvalidArgumentError(
      `Credit amount must be a positive safe integer in kobo, received: ${amountKobo}`
    );
  }

  const currentMoney = Money.fromKobo(player.moneyKobo);
  const creditMoney = Money.fromKobo(amountKobo);
  const newMoney = currentMoney.add(creditMoney);

  return {
    ...player,
    moneyKobo: newMoney.kobo,
  };
}

/**
 * Debits money (in kobo) from the player balance.
 * Throws InsufficientFundsError if debit exceeds current balance.
 */
export function debitPlayerMoney(player: PlayerAttributes, amountKobo: number): PlayerAttributes {
  if (!Number.isSafeInteger(amountKobo) || amountKobo <= 0) {
    throw new InvalidArgumentError(
      `Debit amount must be a positive safe integer in kobo, received: ${amountKobo}`
    );
  }

  if (amountKobo > player.moneyKobo) {
    const requested = Money.fromKobo(amountKobo).format();
    const available = Money.fromKobo(player.moneyKobo).format();
    throw new InsufficientFundsError(
      `Insufficient funds: Cannot debit ${requested}, only ${available} available in player balance`
    );
  }

  const currentMoney = Money.fromKobo(player.moneyKobo);
  const debitMoney = Money.fromKobo(amountKobo);
  const newMoney = currentMoney.subtract(debitMoney);

  return {
    ...player,
    moneyKobo: newMoney.kobo,
  };
}

/**
 * Updates the player's logical gameplay location.
 */
export function setPlayerLocation(player: PlayerAttributes, locationId: string): PlayerAttributes {
  if (!locationId || typeof locationId !== 'string' || locationId.trim().length === 0) {
    throw new InvalidArgumentError('Location id must be a non-empty string');
  }

  const trimmedLocationId = locationId.trim();
  if (player.locationId === trimmedLocationId) {
    return player;
  }

  return {
    ...player,
    locationId: trimmedLocationId,
  };
}
