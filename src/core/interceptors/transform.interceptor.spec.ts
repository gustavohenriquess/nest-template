import { ExecutionContext, CallHandler } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

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

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
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
      expect(result.meta.timestamp).toBeDefined();
      expect(result.meta.count).toBeUndefined();
      done();
    });
  });

  it('should merge custom metadata from reflector', (done) => {
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue({ version: '1.2.3' });
    
    interceptor.intercept(executionContext, callHandler).subscribe((result) => {
      expect(result.meta).toMatchObject({
        version: '1.2.3',
        path: '/test-path',
      });
      done();
    });
  });

  it('should include count when data is an array', (done) => {
    callHandler.handle = jest.fn().mockReturnValue(of(['item1', 'item2']));
    interceptor.intercept(executionContext, callHandler).subscribe((result) => {
      expect(result.data).toHaveLength(2);
      expect(result.meta.count).toBe(2);
      done();
    });
  });

  it('should include correct timestamp in meta', (done) => {
    const now = new Date().toISOString();
    interceptor.intercept(executionContext, callHandler).subscribe((result) => {
      expect(result.meta.timestamp.slice(0, 10)).toBe(now.slice(0, 10));
      done();
    });
  });
});
