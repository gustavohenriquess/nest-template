import {
  EntityNotFoundError,
  BusinessRuleError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
} from './domain.error';
import { ErrorCode } from './error-codes';

describe('Domain Errors', () => {
  it('EntityNotFoundError should have correct code and message', () => {
    const error = new EntityNotFoundError('Not found');
    expect(error.message).toBe('Not found');
    expect(error.code).toBe(ErrorCode.NOT_FOUND);
  });

  it('BusinessRuleError should have default code when not provided', () => {
    const error = new BusinessRuleError('Business error');
    expect(error.message).toBe('Business error');
    expect(error.code).toBe(ErrorCode.BUSINESS_RULE_VIOLATION);
  });

  it('BusinessRuleError should use provided code', () => {
    const error = new BusinessRuleError('Custom error', 'CUSTOM_CODE');
    expect(error.code).toBe('CUSTOM_CODE');
  });

  it('ConflictError should have correct code and message', () => {
    const error = new ConflictError('Conflict');
    expect(error.message).toBe('Conflict');
    expect(error.code).toBe(ErrorCode.CONFLICT);
  });

  it('UnauthorizedError should have correct code and default message', () => {
    const error = new UnauthorizedError();
    expect(error.message).toBe('Unauthorized');
    expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
  });

  it('UnauthorizedError should use provided message', () => {
    const error = new UnauthorizedError('Custom unauth');
    expect(error.message).toBe('Custom unauth');
  });

  it('ForbiddenError should have correct code and default message', () => {
    const error = new ForbiddenError();
    expect(error.message).toBe('Forbidden');
    expect(error.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('ForbiddenError should use provided message', () => {
    const error = new ForbiddenError('Custom forbidden');
    expect(error.message).toBe('Custom forbidden');
  });
});
