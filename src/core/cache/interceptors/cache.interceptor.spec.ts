import { Test, TestingModule } from '@nestjs/testing';
import { CacheInterceptor } from './cache.interceptor';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../cache.service';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, firstValueFrom } from 'rxjs';
import { CACHE_METADATA_KEY } from '../decorators/cache.decorator';
import { INVALIDATE_CACHE_METADATA_KEY } from '../decorators/invalidate-cache.decorator';

describe('CacheInterceptor', () => {
  let interceptor: CacheInterceptor;
  let mockReflector: Partial<Reflector>;
  let mockCacheService: Partial<CacheService>;
  let mockConfigService: Partial<ConfigService>;

  let mockExecutionContext: Partial<ExecutionContext>;
  let mockCallHandler: Partial<CallHandler>;

  beforeEach(async () => {
    mockReflector = {
      get: jest.fn(),
    };

    mockCacheService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      getNamespaceVersion: jest.fn().mockResolvedValue(1),
      incrementNamespaceVersion: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'CACHE_ENABLED') return true;
        if (key === 'CACHE_DEFAULT_TTL') return 60;
        return null;
      }),
    };

    mockExecutionContext = {
      getHandler: jest.fn().mockReturnValue(function testHandler() {}),
      getClass: jest.fn().mockReturnValue(class TestController {}),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          query: { q: 'search' },
          params: { id: '123' },
        }),
      }),
    };

    mockCallHandler = {
      handle: jest.fn().mockReturnValue(of('new_response')),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheInterceptor,
        { provide: Reflector, useValue: mockReflector },
        { provide: CacheService, useValue: mockCacheService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    interceptor = module.get<CacheInterceptor>(CacheInterceptor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined and constructable', () => {
    expect(interceptor).toBeDefined();
    expect(
      new CacheInterceptor(
        mockReflector as Reflector,
        mockCacheService as CacheService,
        mockConfigService as ConfigService,
      ),
    ).toBeDefined();
  });

  it('should bypass cache if CACHE_ENABLED is false', async () => {
    (mockConfigService.get as jest.Mock).mockReturnValue(false);

    const result = await interceptor.intercept(
      mockExecutionContext as ExecutionContext,
      mockCallHandler as CallHandler,
    );

    await firstValueFrom(result);
    expect(mockCallHandler.handle).toHaveBeenCalled();
    expect(mockReflector.get).not.toHaveBeenCalled();
  });

  it('should bypass cache if CACHE_ENABLED is undefined', async () => {
    (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
      if (key === 'CACHE_ENABLED') return undefined;
      return null;
    });

    const result = await interceptor.intercept(
      mockExecutionContext as ExecutionContext,
      mockCallHandler as CallHandler,
    );

    await firstValueFrom(result);
    expect(mockCallHandler.handle).toHaveBeenCalled();
    expect(mockReflector.get).not.toHaveBeenCalled();
  });

  it('should bypass cache if no metadata is present', async () => {
    (mockReflector.get as jest.Mock).mockReturnValue(undefined);

    const result = await interceptor.intercept(
      mockExecutionContext as ExecutionContext,
      mockCallHandler as CallHandler,
    );

    await firstValueFrom(result);
    expect(mockCallHandler.handle).toHaveBeenCalled();
    expect(mockCacheService.get).not.toHaveBeenCalled();
  });

  describe('InvalidateCache', () => {
    it('should invalidate specific key', async () => {
      (mockReflector.get as jest.Mock).mockImplementation(
        (metadataKey: string) => {
          if (metadataKey === INVALIDATE_CACHE_METADATA_KEY) {
            return { key: 'custom_key' };
          }
          return undefined;
        },
      );

      const result = await interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      await firstValueFrom(result);
      expect(mockCallHandler.handle).toHaveBeenCalled();
      expect(mockCacheService.incrementNamespaceVersion).toHaveBeenCalledWith(
        'custom_key',
      );
    });

    it('should invalidate auto key', async () => {
      (mockReflector.get as jest.Mock).mockImplementation(
        (metadataKey: string) => {
          if (metadataKey === INVALIDATE_CACHE_METADATA_KEY) {
            return {}; // no explicit key
          }
          return undefined;
        },
      );

      const result = await interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      await firstValueFrom(result);
      expect(mockCallHandler.handle).toHaveBeenCalled();
      expect(mockCacheService.incrementNamespaceVersion).toHaveBeenCalledWith(
        'TestController',
      );
    });
  });

  describe('Cache', () => {
    it('should return cached response if hit', async () => {
      (mockReflector.get as jest.Mock).mockImplementation(
        (metadataKey: string) => {
          if (metadataKey === CACHE_METADATA_KEY) {
            return { key: 'my_cache_key', ttl: 120 };
          }
          return undefined;
        },
      );

      (mockCacheService.get as jest.Mock).mockResolvedValue('cached_response');

      const result = await interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      const value: unknown = await firstValueFrom(result);
      expect(value).toEqual('cached_response');
      expect(mockCallHandler.handle).not.toHaveBeenCalled();
      expect(mockCacheService.get).toHaveBeenCalledWith(
        'my_cache_key:v1:testHandler:{"query":{"q":"search"},"params":{"id":"123"}}',
      );
    });

    it('should set cache if miss using auto key and default TTL', async () => {
      (mockReflector.get as jest.Mock).mockImplementation(
        (metadataKey: string) => {
          if (metadataKey === CACHE_METADATA_KEY) {
            return {}; // no explicit key or ttl
          }
          return undefined;
        },
      );

      (mockCacheService.get as jest.Mock).mockResolvedValue(null);

      const result = await interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      const value: unknown = await firstValueFrom(result);
      expect(value).toEqual('new_response');
      expect(mockCallHandler.handle).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'TestController:v1:testHandler:{"query":{"q":"search"},"params":{"id":"123"}}',
        'new_response',
        60, // default from config
      );
    });

    it('should set cache with 60 fallback TTL when CACHE_DEFAULT_TTL is undefined', async () => {
      (mockConfigService.get as jest.Mock).mockImplementation((key: string) => {
        if (key === 'CACHE_ENABLED') return true;
        if (key === 'CACHE_DEFAULT_TTL') return undefined; // trigger ?? 60
        return null;
      });

      (mockReflector.get as jest.Mock).mockImplementation(
        (metadataKey: string) => {
          if (metadataKey === CACHE_METADATA_KEY) return {};
          return undefined;
        },
      );

      (mockCacheService.get as jest.Mock).mockResolvedValue(null);

      const result = await interceptor.intercept(
        mockExecutionContext as ExecutionContext,
        mockCallHandler as CallHandler,
      );

      await firstValueFrom(result);
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'TestController:v1:testHandler:{"query":{"q":"search"},"params":{"id":"123"}}',
        'new_response',
        60, // hardcoded fallback in the code ?? 60
      );
    });
  });
});
