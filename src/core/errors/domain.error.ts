import { ErrorCode } from './error-codes';

export abstract class DomainError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(message: string) {
    super(message, ErrorCode.NOT_FOUND);
  }
}

export class BusinessRuleError extends DomainError {
  constructor(
    message: string,
    code: string = ErrorCode.BUSINESS_RULE_VIOLATION,
  ) {
    super(message, code);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, ErrorCode.CONFLICT);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized') {
    super(message, ErrorCode.UNAUTHORIZED);
  }
}
