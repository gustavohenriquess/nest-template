export abstract class DomainError extends Error {
  constructor(public readonly message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(message: string) {
    super(message, 'ENTITY_NOT_FOUND');
  }
}

export class BusinessRuleError extends DomainError {
  constructor(message: string, code = 'BUSINESS_RULE_VIOLATION') {
    super(message, code);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string) {
    super(message, 'CONFLICT');
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED');
  }
}
