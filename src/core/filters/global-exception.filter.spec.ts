import { HttpException, HttpStatus, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './global-exception.filter';
import { EntityNotFoundError, BusinessRuleError, ConflictError, UnauthorizedError, DomainError } from '../errors/domain.error';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: any;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      method: 'GET',
      url: '/test',
    };
    mockArgumentsHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  it('should handle HttpException correctly', () => {
    const exception = new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'HTTP', // HttpException -> HTTP
        message: 'Forbidden',
      }),
    }));
  });

  it('should handle generic DomainError and return 400', () => {
    class SomeDomainError extends DomainError {
      constructor() { super('Generic error', 'GENERIC_CODE'); }
    }
    const error = new SomeDomainError();
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'GENERIC_CODE',
      }),
    }));
  });

  it('should handle complex HttpException correctly', () => {
    const resBody = { message: 'Custom error', error: 'CUSTOM_CODE', details: { foo: 'bar' } };
    const exception = new HttpException(resBody, HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: {
        code: 'CUSTOM_CODE',
        message: 'Custom error',
        details: { foo: 'bar' },
      },
    }));
  });

  it('should handle HttpException with empty object response', () => {
    const exception = new HttpException({}, HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'HTTP_EXCEPTION',
        message: 'Http Exception',
      }),
    }));
  });

  it('should map EntityNotFoundError to 404', () => {
    const error = new EntityNotFoundError('User not found');
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'ENTITY_NOT_FOUND',
        message: 'User not found',
      }),
    }));
  });

  it('should map BusinessRuleError to 400', () => {
    const error = new BusinessRuleError('Invalid state');
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'BUSINESS_RULE_VIOLATION',
      }),
    }));
  });

  it('should map ConflictError to 409', () => {
    const error = new ConflictError('Already exists');
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'CONFLICT',
      }),
    }));
  });

  it('should map UnauthorizedError to 401', () => {
    const error = new UnauthorizedError();
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'UNAUTHORIZED',
      }),
    }));
  });

  it('should handle generic Error and return 500', () => {
    const error = new Error('Unexpected problem');
    filter.catch(error, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unexpected problem',
      }),
    }));
  });

  it('should handle non-Error objects and return 500', () => {
    filter.catch('some weird error', mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.objectContaining({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      }),
    }));
  });
});
