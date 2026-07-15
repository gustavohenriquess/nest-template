import { PinoLogger } from 'nestjs-pino';
import { ErrorCode } from './error-codes';

export abstract class DomainError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly logger?: PinoLogger,
  ) {
    if (logger) logger.error(message, { code });
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(message: string, logger?: PinoLogger) {
    super(message, ErrorCode.NOT_FOUND, logger);
  }
}

export class BusinessRuleError extends DomainError {
  constructor(
    message: string,
    code: string = ErrorCode.BUSINESS_RULE_VIOLATION,
    logger?: PinoLogger,
  ) {
    super(message, code, logger);
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, logger?: PinoLogger) {
    super(message, ErrorCode.CONFLICT, logger);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Unauthorized', logger?: PinoLogger) {
    super(message, ErrorCode.UNAUTHORIZED, logger);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Forbidden', logger?: PinoLogger) {
    super(message, ErrorCode.FORBIDDEN, logger);
  }
}
