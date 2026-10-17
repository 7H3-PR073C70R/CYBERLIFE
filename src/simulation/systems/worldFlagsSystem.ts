import { WorldFlagValue } from '../core/types';
import { ValidationError, InvalidArgumentError } from '../../domain/errors/DomainError';

const FLAG_KEY_REGEX = /^[a-zA-Z0-9_.-]{2,64}$/;

/**
 * Validates a world flag key.
 */
export function validateFlagKey(key: string): void {
  if (!key || typeof key !== 'string') {
    throw new InvalidArgumentError('Flag key must be a non-empty string');
  }

  const trimmed = key.trim();
  if (!FLAG_KEY_REGEX.test(trimmed)) {
    throw new ValidationError(
      `Flag key "${trimmed}" is invalid. Must be 2-64 characters matching [a-zA-Z0-9_.-]`
    );
  }
}

/**
 * Validates a world flag value.
 */
export function validateFlagValue(value: unknown): asserts value is WorldFlagValue {
  if (typeof value === 'boolean') return;
  if (typeof value === 'string') return;
  if (typeof value === 'number' && Number.isFinite(value)) return;

  throw new ValidationError(
    `Flag value must be a boolean, string, or finite number, received: ${String(value)}`
  );
}

/**
 * Sets a world flag safely and immutably.
 * Returns the new flags dictionary and a boolean indicating whether a change actually occurred.
 */
export function setWorldFlag(
  currentFlags: Readonly<Record<string, WorldFlagValue>>,
  key: string,
  value: WorldFlagValue
): { readonly flags: Readonly<Record<string, WorldFlagValue>>; readonly changed: boolean } {
  validateFlagKey(key);
  validateFlagValue(value);

  const trimmedKey = key.trim();
  const currentValue = currentFlags[trimmedKey];

  if (currentValue === value) {
    return {
      flags: currentFlags,
      changed: false,
    };
  }

  return {
    flags: {
      ...currentFlags,
      [trimmedKey]: value,
    },
    changed: true,
  };
}

/**
 * Retrieves a world flag value with optional default fallback.
 */
export function getWorldFlag<T extends WorldFlagValue>(
  flags: Readonly<Record<string, WorldFlagValue>>,
  key: string,
  defaultValue?: T
): T | undefined {
  validateFlagKey(key);
  const value = flags[key.trim()];
  return (value as T) ?? defaultValue;
}
