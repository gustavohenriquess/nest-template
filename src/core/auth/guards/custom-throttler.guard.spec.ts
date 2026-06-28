import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { CustomThrottlerGuard } from './custom-throttler.guard';
import {
  ThrottlerStorage,
  ThrottlerRequest,
  ThrottlerLimitDetail,
} from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';

interface MockRequest {
  ip: string;
  user?: {
    sub: string;
  };
  headers?: {
    authorization?: string;
  };
}

describe('CustomThrottlerGuard', () => {
  let guard: CustomThrottlerGuard;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        CustomThrottlerGuard,
        {
          provide: 'THROTTLER:MODULE_OPTIONS',
          useValue: {
            throttlers: [],
          },
        },
        {
          provide: ThrottlerStorage,
          useValue: {
            increment: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = moduleRef.get<CustomThrottlerGuard>(CustomThrottlerGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('throwThrottlingException', () => {
    it('should set headers and throw ThrottlerException', async () => {
      const mockResponse = {
        header: jest.fn(),
      };

      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
          getResponse: jest.fn().mockReturnValue(mockResponse),
        }),
      } as unknown as ExecutionContext;

      const detail: ThrottlerLimitDetail = {
        timeToExpire: 5, // Already in seconds in v6
        limit: 10,
        ttl: 60,
        key: 'test-key',
        totalHits: 1,
        name: 'global',
        throttler: { name: 'global', limit: 10, ttl: 60 },
        blockDuration: 0,
        getTracker: jest.fn(),
        generateKey: jest.fn(),
      };

      await expect(
        guard['throwThrottlingException'](mockContext, detail),
      ).rejects.toThrow();

      expect(mockResponse.header).toHaveBeenCalledWith(
        'X-RateLimit-Remaining',
        '0',
      );
      expect(mockResponse.header).toHaveBeenCalledWith(
        'X-RateLimit-Reset',
        '5',
      );
      expect(mockResponse.header).toHaveBeenCalledWith('Retry-After', '5');
    });

    it('should not set headers if response is not an HTTP response', async () => {
      const mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({}),
          getResponse: jest.fn().mockReturnValue(undefined),
        }),
      } as unknown as ExecutionContext;

      const detail: ThrottlerLimitDetail = {
        timeToExpire: 5,
        limit: 10,
        ttl: 60,
        key: 'test-key',
        totalHits: 1,
        name: 'global',
        throttler: { name: 'global', limit: 10, ttl: 60 },
        blockDuration: 0,
        getTracker: jest.fn(),
        generateKey: jest.fn(),
      };

      await expect(
        guard['throwThrottlingException'](mockContext, detail),
      ).rejects.toThrow();
    });
  });

  describe('handleRequest', () => {
    let mockContext: ExecutionContext;
    let mockRequest: MockRequest;
    let superHandleRequestSpy: jest.SpyInstance;

    beforeEach(() => {
      mockRequest = {
        ip: '127.0.0.1',
      };

      mockContext = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue(mockRequest),
          getResponse: jest.fn(),
        }),
        getType: jest.fn().mockReturnValue('http'),
      } as unknown as ExecutionContext;

      superHandleRequestSpy = jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(guard)),
          'handleRequest',
        )
        .mockResolvedValue(true);
    });

    afterEach(() => {
      if (superHandleRequestSpy) {
        superHandleRequestSpy.mockRestore();
      }
    });

    it('should skip authenticated throttler if user is not authenticated', async () => {
      const requestProps: ThrottlerRequest = {
        context: mockContext,
        limit: 10,
        ttl: 60,
        throttler: { name: 'authenticated', limit: 10, ttl: 60 },
        blockDuration: 0,
        getTracker: function (
          _req: Record<string, any>,
          _context: ExecutionContext,
        ): Promise<string> | string {
          throw new Error('Function not implemented.');
        },
        generateKey: function (
          _context: ExecutionContext,
          _trackerString: string,
          _throttlerName: string,
        ): string {
          throw new Error('Function not implemented.');
        },
      };

      const result = await guard['handleRequest'](requestProps);

      expect(result).toBe(true);
      expect(superHandleRequestSpy).not.toHaveBeenCalled();
    });

    it('should track by user sub for authenticated throttler when user is authenticated', async () => {
      mockRequest.user = { sub: 'user-123' };

      const requestProps: ThrottlerRequest = {
        context: mockContext,
        limit: 10,
        ttl: 60,
        throttler: { name: 'authenticated', limit: 10, ttl: 60 },
        blockDuration: 0,
        getTracker: function (
          _req: Record<string, any>,
          _context: ExecutionContext,
        ): Promise<string> | string {
          throw new Error('Function not implemented.');
        },
        generateKey: function (
          _context: ExecutionContext,
          _trackerString: string,
          _throttlerName: string,
        ): string {
          throw new Error('Function not implemented.');
        },
      };

      const result = await guard['handleRequest'](requestProps);

      expect(result).toBe(true);
      expect(requestProps.getTracker).toBeDefined();
      const tracker = await requestProps.getTracker(mockRequest);
      expect(tracker).toBe('user:user-123');
      expect(superHandleRequestSpy).toHaveBeenCalledWith(requestProps);
    });

    it('should skip global throttler if user is authenticated', async () => {
      mockRequest.user = { sub: 'user-123' };

      const requestProps: ThrottlerRequest = {
        context: mockContext,
        limit: 10,
        ttl: 60,
        throttler: { name: 'global', limit: 10, ttl: 60 },
        blockDuration: 0,
        getTracker: function (
          _req: Record<string, any>,
          _context: ExecutionContext,
        ): Promise<string> | string {
          throw new Error('Function not implemented.');
        },
        generateKey: function (
          _context: ExecutionContext,
          _trackerString: string,
          _throttlerName: string,
        ): string {
          throw new Error('Function not implemented.');
        },
      };

      const result = await guard['handleRequest'](requestProps);

      expect(result).toBe(true);
      expect(superHandleRequestSpy).not.toHaveBeenCalled();
    });

    it('should manually parse bearer token if user is not yet populated', async () => {
      mockRequest.headers = { authorization: 'Bearer valid-token' };
      const jwtService = moduleRef.get<JwtService>(JwtService);
      jest.spyOn(jwtService, 'verify').mockReturnValue({ sub: 'user-789' });

      const requestProps: ThrottlerRequest = {
        context: mockContext,
        limit: 10,
        ttl: 60,
        throttler: { name: 'authenticated', limit: 10, ttl: 60 },
        blockDuration: 0,
        getTracker: function (
          _req: Record<string, any>,
          _context: ExecutionContext,
        ): Promise<string> | string {
          throw new Error('Function not implemented.');
        },
        generateKey: function (
          _context: ExecutionContext,
          _trackerString: string,
          _throttlerName: string,
        ): string {
          throw new Error('Function not implemented.');
        },
      };

      const result = await guard['handleRequest'](requestProps);

      expect(result).toBe(true);
      expect(requestProps.getTracker).toBeDefined();
      const tracker = await requestProps.getTracker(mockRequest);
      expect(tracker).toBe('user:user-789');
      expect(superHandleRequestSpy).toHaveBeenCalledWith(requestProps);
    });

    it('should track by IP for other throttlers', async () => {
      const requestProps: ThrottlerRequest = {
        context: mockContext,
        limit: 10,
        ttl: 60,
        throttler: { name: 'global', limit: 10, ttl: 60 },
        blockDuration: 0,
        getTracker: function (
          _req: Record<string, any>,
          _context: ExecutionContext,
        ): Promise<string> | string {
          throw new Error('Function not implemented.');
        },
        generateKey: function (
          _context: ExecutionContext,
          _trackerString: string,
          _throttlerName: string,
        ): string {
          throw new Error('Function not implemented.');
        },
      };

      const result = await guard['handleRequest'](requestProps);

      expect(result).toBe(true);
      expect(requestProps.getTracker).toBeDefined();
      const tracker = await requestProps.getTracker(mockRequest);
      expect(tracker).toBe('127.0.0.1');
      expect(superHandleRequestSpy).toHaveBeenCalledWith(requestProps);
    });

    it('should not authenticate if token payload does not have a string sub', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-payload' };
      const jwtService = moduleRef.get<JwtService>(JwtService);
      jest
        .spyOn(jwtService, 'verify')
        .mockReturnValue({ email: 'test@example.com' });

      const requestProps: ThrottlerRequest = {
        context: mockContext,
        limit: 10,
        ttl: 60,
        throttler: { name: 'authenticated', limit: 10, ttl: 60 },
        blockDuration: 0,
        getTracker: jest.fn(),
        generateKey: jest.fn(),
      };

      const result = await guard['handleRequest'](requestProps);
      expect(result).toBe(true);
      expect(mockRequest.user).toBeUndefined();
    });

    it('should ignore and catch token verification errors', async () => {
      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      const jwtService = moduleRef.get<JwtService>(JwtService);
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('JWT expired');
      });

      const requestProps: ThrottlerRequest = {
        context: mockContext,
        limit: 10,
        ttl: 60,
        throttler: { name: 'authenticated', limit: 10, ttl: 60 },
        blockDuration: 0,
        getTracker: jest.fn(),
        generateKey: jest.fn(),
      };

      const result = await guard['handleRequest'](requestProps);
      expect(result).toBe(true);
      expect(mockRequest.user).toBeUndefined();
    });
  });
});
