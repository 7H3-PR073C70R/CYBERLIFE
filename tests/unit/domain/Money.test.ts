import { describe, it, expect } from 'vitest';
import { Money } from '@/domain/common/Money';
import { ValidationError } from '@/domain/errors/DomainError';

describe('Money Value Object', () => {
  it('creates money from integer kobo', () => {
    const money = Money.fromKobo(150_000);
    expect(money.kobo).toBe(150_000);
    expect(money.toNaira()).toBe(1500.0);
  });

  it('creates money from Naira with exact integer kobo conversion', () => {
    const money = Money.fromNaira(250.5);
    expect(money.kobo).toBe(25_050);
    expect(money.toNaira()).toBe(250.5);
  });

  it('eliminates floating-point addition errors (0.1 + 0.2 === 0.3)', () => {
    const m1 = Money.fromNaira(0.1);
    const m2 = Money.fromNaira(0.2);
    const sum = m1.add(m2);

    expect(sum.kobo).toBe(30);
    expect(sum.toNaira()).toBe(0.3);
  });

  it('creates zero balance with Money.zero()', () => {
    const zero = Money.zero();
    expect(zero.kobo).toBe(0);
    expect(zero.toNaira()).toBe(0);
  });

  it('rejects negative kobo or negative naira', () => {
    expect(() => Money.fromKobo(-500)).toThrow(ValidationError);
    expect(() => Money.fromNaira(-10)).toThrow(ValidationError);
  });

  it('rejects non-integer kobo or non-finite numbers', () => {
    expect(() => Money.fromKobo(12.34)).toThrow(ValidationError);
    expect(() => Money.fromNaira(NaN)).toThrow(ValidationError);
    expect(() => Money.fromNaira(Infinity)).toThrow(ValidationError);
  });

  it('performs exact addition and subtraction', () => {
    const a = Money.fromKobo(50_000); // ₦500.00
    const b = Money.fromKobo(20_000); // ₦200.00

    const sum = a.add(b);
    expect(sum.kobo).toBe(70_000);

    const diff = a.subtract(b);
    expect(diff.kobo).toBe(30_000);
  });

  it('throws ValidationError if subtraction would yield negative balance', () => {
    const a = Money.fromKobo(10_000);
    const b = Money.fromKobo(20_000);

    expect(() => a.subtract(b)).toThrow(ValidationError);
    expect(() => a.subtract(b)).toThrow(/result would be negative/i);
  });

  it('supports comparisons and equality', () => {
    const small = Money.fromKobo(10_000);
    const equalSmall = Money.fromKobo(10_000);
    const large = Money.fromKobo(50_000);

    expect(small.equals(equalSmall)).toBe(true);
    expect(small.equals(large)).toBe(false);

    expect(large.isGreaterThan(small)).toBe(true);
    expect(small.isGreaterThan(large)).toBe(false);
    expect(small.isGreaterThanOrEqual(equalSmall)).toBe(true);

    expect(small.isLessThan(large)).toBe(true);
    expect(large.isLessThan(small)).toBe(false);
    expect(small.isLessThanOrEqual(equalSmall)).toBe(true);
  });

  it('formats money as Nigerian Naira string', () => {
    const money = Money.fromKobo(250_000);
    const formatted = money.format();
    // In node/v8, Intl en-NG with NGN produces ₦2,500.00 or NGN 2,500.00
    expect(formatted).toMatch(/2,500\.00/);
  });

  it('serializes to integer kobo in toJSON', () => {
    const money = Money.fromKobo(75_400);
    expect(money.toJSON()).toBe(75_400);
  });
});
