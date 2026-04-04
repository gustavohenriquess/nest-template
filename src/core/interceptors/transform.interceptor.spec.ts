import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';
import { formatSuccessResponse } from './transform-response.helper';

describe('TransformResponseHelper', () => {
  it('should format simple object correctly', () => {
    const result = formatSuccessResponse('data', '/path', {}, undefined);
    expect(result.data).toBe('data');
    expect(result.meta.path).toBe('/path');
    expect(result.meta.count).toBeUndefined();
  });

  it('should format array and include count', () => {
    const result = formatSuccessResponse(['a', 'b'], '/path', {}, undefined);
    expect(result.data).toHaveLength(2);
    expect(result.meta.count).toBe(2);
  });

  it('should merge custom metadata', () => {
    const result = formatSuccessResponse('data', '/path', {}, { foo: 'bar' });
    expect(result.meta.foo).toBe('bar');
  });

  it('should work with undefined customMeta', () => {
    const result = formatSuccessResponse('data', '/path', {}, undefined);
    expect(result.meta.timestamp).toBeDefined();
  });
});

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;
  let executionContext: ExecutionContext;
  let callHandler: CallHandler;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    interceptor = new TransformInterceptor(reflector);
    executionContext = {
      getType: jest.fn().mockReturnValue('http'),
      switchToHttp: jest.fn().mockReturnThis(),
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getRequest: jest.fn().mockReturnValue({ 
        url: '/test-path',
        query: { search: 'term' } 
      }),
    } as any;
    callHandler = {
      handle: jest.fn().mockReturnValue(of('test-data')),
    };
  });

  it('should return original data if context type is not http', (done) => {
    (executionContext.getType as jest.Mock).mockReturnValue('rpc');
    interceptor.intercept(executionContext, callHandler).subscribe((result) => {
      expect(result).toBe('test-data');
      done();
    });
  });

  it('should transform response to { data, meta }', (done) => {
    interceptor.intercept(executionContext, callHandler).subscribe((result) => {
      expect(result).toMatchObject({
        data: 'test-data',
        meta: {
          path: '/test-path',
          filters: { search: 'term' }
        },
      });
      done();
    });
  });
});
