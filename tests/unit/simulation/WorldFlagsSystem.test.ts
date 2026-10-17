import { describe, it, expect } from 'vitest';
import {
  setWorldFlag,
  getWorldFlag,
  validateFlagKey,
  validateFlagValue,
  WorldFlagValue,
} from '@/simulation';
import { ValidationError, InvalidArgumentError } from '@/domain/errors/DomainError';

describe('World Flags System', () => {
  it('sets boolean, string, and number flags immutably', () => {
    const flags: Record<string, WorldFlagValue> = {};

    const { flags: f1, changed: c1 } = setWorldFlag(flags, 'apartment_unlocked', true);
    expect(c1).toBe(true);
    expect(f1['apartment_unlocked']).toBe(true);

    const { flags: f2, changed: c2 } = setWorldFlag(f1, 'current_quest_node', 'step_02');
    expect(c2).toBe(true);
    expect(f2['current_quest_node']).toBe('step_02');

    const { flags: f3, changed: c3 } = setWorldFlag(f2, 'noticeboard_reads_count', 3);
    expect(c3).toBe(true);
    expect(f3['noticeboard_reads_count']).toBe(3);

    // Initial flags remained untouched
    expect(flags).toEqual({});
  });

  it('detects no-op when setting flag to current value', () => {
    const flags: Record<string, WorldFlagValue> = {
      apartment_unlocked: true,
    };

    const { flags: fNext, changed } = setWorldFlag(flags, 'apartment_unlocked', true);
    expect(changed).toBe(false);
    expect(fNext).toBe(flags);
  });

  it('retrieves world flags with optional default fallback', () => {
    const flags: Record<string, WorldFlagValue> = {
      apartment_unlocked: true,
      visit_count: 5,
    };

    expect(getWorldFlag(flags, 'apartment_unlocked')).toBe(true);
    expect(getWorldFlag(flags, 'visit_count')).toBe(5);
    expect(getWorldFlag(flags, 'missing_flag', false)).toBe(false);
    expect(getWorldFlag(flags, 'missing_flag')).toBeUndefined();
  });

  it('rejects invalid flag keys', () => {
    expect(() => validateFlagKey('')).toThrow(InvalidArgumentError);
    expect(() => validateFlagKey(' ')).toThrow(ValidationError);
    expect(() => validateFlagKey('a')).toThrow(ValidationError); // Min length 2
    expect(() => validateFlagKey('key with spaces')).toThrow(ValidationError);
    expect(() => validateFlagKey('key$with$special')).toThrow(ValidationError);
  });

  it('rejects invalid flag values (null, undefined, object, symbol, NaN)', () => {
    expect(() => validateFlagValue(null)).toThrow(ValidationError);
    expect(() => validateFlagValue(undefined)).toThrow(ValidationError);
    expect(() => validateFlagValue({ foo: 'bar' })).toThrow(ValidationError);
    expect(() => validateFlagValue(Symbol('sym'))).toThrow(ValidationError);
    expect(() => validateFlagValue(NaN)).toThrow(ValidationError);
    expect(() => validateFlagValue(Infinity)).toThrow(ValidationError);
  });
});
