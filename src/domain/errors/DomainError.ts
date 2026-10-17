/**
 * Domain error hierarchy for Cyberlife.
 * All domain and simulation errors inherit from this base class.
 */
export class DomainError extends Error {
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(message: string, code = 'DOMAIN_ERROR', details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;

    // Maintain proper prototype chain in ES environments
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', details);
  }
}

export class InsufficientFundsError extends DomainError {
  constructor(
    message = 'Insufficient funds to complete transaction',
    details?: Record<string, unknown>
  ) {
    super(message, 'INSUFFICIENT_FUNDS', details);
  }
}

export class InvalidArgumentError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INVALID_ARGUMENT', details);
  }
}

export class InvariantViolationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INVARIANT_VIOLATION', details);
  }
}
