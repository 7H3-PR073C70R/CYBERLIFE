import { ValidationError } from '../errors/DomainError';

/**
 * Immutable value object representing financial currency in Cyberlife.
 * Uses integer kobo internally (100 kobo = 1 Nigerian Naira ₦) to eliminate
 * floating-point currency representation errors (such as 0.1 + 0.2 !== 0.3).
 */
export class Money {
  private readonly _kobo: number;

  private constructor(kobo: number) {
    if (!Number.isSafeInteger(kobo)) {
      throw new ValidationError(
        `Currency amount must be a safe integer in kobo, received: ${kobo}`
      );
    }
    if (kobo < 0) {
      throw new ValidationError(`Currency amount cannot be negative, received: ${kobo} kobo`);
    }
    this._kobo = kobo;
  }

  /**
   * Create Money from integer kobo amount.
   */
  public static fromKobo(kobo: number): Money {
    return new Money(kobo);
  }

  /**
   * Create Money from Naira amount. Converts to integer kobo using exact rounding.
   */
  public static fromNaira(naira: number): Money {
    if (!Number.isFinite(naira)) {
      throw new ValidationError(`Naira amount must be a finite number, received: ${naira}`);
    }
    if (naira < 0) {
      throw new ValidationError(`Naira amount cannot be negative, received: ${naira}`);
    }
    // Round to nearest integer kobo to eliminate floating point artifacts from input
    const kobo = Math.round(naira * 100);
    return new Money(kobo);
  }

  public static zero(): Money {
    return new Money(0);
  }

  public get kobo(): number {
    return this._kobo;
  }

  public toNaira(): number {
    return this._kobo / 100;
  }

  public add(other: Money): Money {
    return new Money(this._kobo + other._kobo);
  }

  public subtract(other: Money): Money {
    if (other._kobo > this._kobo) {
      throw new ValidationError(
        `Cannot subtract ${other.format()} from ${this.format()}: result would be negative`
      );
    }
    return new Money(this._kobo - other._kobo);
  }

  public equals(other: Money): boolean {
    return this._kobo === other._kobo;
  }

  public isGreaterThan(other: Money): boolean {
    return this._kobo > other._kobo;
  }

  public isGreaterThanOrEqual(other: Money): boolean {
    return this._kobo >= other._kobo;
  }

  public isLessThan(other: Money): boolean {
    return this._kobo < other._kobo;
  }

  public isLessThanOrEqual(other: Money): boolean {
    return this._kobo <= other._kobo;
  }

  /**
   * Formats money as Nigerian Naira string (e.g., "₦1,500.00").
   */
  public format(): string {
    const naira = this.toNaira();
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(naira);
  }

  public toJSON(): number {
    return this._kobo;
  }
}
