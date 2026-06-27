/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => {
    const handlers: Record<string, (...args: any[]) => void> = {};
    return {
      on: jest
        .fn()
        .mockImplementation(
          (event: string, handler: (...args: any[]) => void) => {
            handlers[event] = handler;
          },
        ),
      emit: (event: string, ...args: any[]) => {
        if (handlers[event]) handlers[event](...args);
      },
      connect: jest.fn().mockResolvedValue(true),
      disconnect: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      incr: jest.fn(),
    };
  });
});

describe('CacheService', () => {
  let service: CacheService;
  let mockConfigService: Partial<ConfigService>;

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('When CACHE_ENABLED is false', () => {
    beforeEach(async () => {
      mockConfigService = {
        get: jest.fn().mockReturnValue(false),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CacheService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<CacheService>(CacheService);
    });

    it('should be defined and constructable', () => {
      expect(service).toBeDefined();
      expect(
        new CacheService(mockConfigService as ConfigService),
      ).toBeDefined();
    });

    it('should run onModuleDestroy safely when redis is not initialized', () => {
      expect(() => service.onModuleDestroy()).not.toThrow();
    });

    it('should not instantiate Redis', () => {
      expect(service.getClient()).toBeUndefined();
    });

    it('should bypass get method and return null', async () => {
      const result = await service.get('any-key');
      expect(result).toBeNull();
    });

    it('should bypass set method silently', async () => {
      await expect(service.set('any-key', 'any-value')).resolves.not.toThrow();
    });

    it('should bypass del method silently', async () => {
      await expect(service.del('any-key')).resolves.not.toThrow();
    });

    it('should bypass getNamespaceVersion and return 0', async () => {
      const result = await service.getNamespaceVersion('users');
      expect(result).toBe(0);
    });

    it('should bypass incrementNamespaceVersion silently', async () => {
      await expect(
        service.incrementNamespaceVersion('users'),
      ).resolves.not.toThrow();
    });
  });

  describe('When CACHE_ENABLED is undefined (fallback to false)', () => {
    beforeEach(async () => {
      mockConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CacheService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<CacheService>(CacheService);
    });

    it('should fallback to false and not instantiate Redis', () => {
      expect(service.getClient()).toBeUndefined();
    });
  });

  describe('When CACHE_ENABLED is true', () => {
    beforeEach(async () => {
      mockConfigService = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'CACHE_ENABLED') return true;
          if (key === 'REDIS_HOST') return 'localhost';
          if (key === 'REDIS_PORT') return 6379;
          if (key === 'REDIS_PASSWORD') return 'pass';
          return null;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CacheService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      service = module.get<CacheService>(CacheService);
    });

    it('should instantiate Redis', () => {
      expect(service.getClient()).toBeDefined();
    });

    it('should call redis get and parse JSON', async () => {
      const redisInstance = service.getClient() as any;
      redisInstance.get.mockResolvedValueOnce(
        JSON.stringify({ hello: 'world' }),
      );

      const result = await service.get('my-key');
      expect(redisInstance.get).toHaveBeenCalledWith('my-key');
      expect(result).toEqual({ hello: 'world' });
    });

    it('should return null when redis get returns null', async () => {
      const redisInstance = service.getClient() as any;
      redisInstance.get.mockResolvedValueOnce(null);

      const result = await service.get('my-key');
      expect(result).toBeNull();
    });

    it('should call redis set with serialized JSON and TTL', async () => {
      const redisInstance = service.getClient() as any;
      await service.set('my-key', { foo: 'bar' }, 60);

      expect(redisInstance.set).toHaveBeenCalledWith(
        'my-key',
        JSON.stringify({ foo: 'bar' }),
        'EX',
        60,
      );
    });

    it('should call redis set with serialized JSON and no TTL', async () => {
      const redisInstance = service.getClient() as any;
      await service.set('my-key', { foo: 'bar' });

      expect(redisInstance.set).toHaveBeenCalledWith(
        'my-key',
        JSON.stringify({ foo: 'bar' }),
      );
    });

    it('should call redis del', async () => {
      const redisInstance = service.getClient() as any;
      await service.del('my-key');

      expect(redisInstance.del).toHaveBeenCalledWith('my-key');
    });

    it('should handle error when set rejects', async () => {
      const redisInstance = service.getClient() as any;
      redisInstance.set.mockRejectedValueOnce(new Error('set error'));

      await expect(service.set('my-key', 'val')).resolves.not.toThrow();
    });

    it('should handle error when del rejects', async () => {
      const redisInstance = service.getClient() as any;
      redisInstance.del.mockRejectedValueOnce(new Error('del error'));

      await expect(service.del('my-key')).resolves.not.toThrow();
    });

    it('should handle error when get rejects', async () => {
      const redisInstance = service.getClient() as any;
      redisInstance.get.mockRejectedValueOnce(new Error('get error'));

      const result = await service.get('my-key');
      expect(result).toBeNull();
    });

    it('should get namespace version correctly', async () => {
      const redisInstance = service.getClient() as any;
      redisInstance.get.mockResolvedValueOnce('5');

      const result = await service.getNamespaceVersion('users');
      expect(redisInstance.get).toHaveBeenCalledWith('version:users');
      expect(result).toBe(5);
    });

    it('should return 0 for getNamespaceVersion if not exists', async () => {
      const redisInstance = service.getClient() as any;
      redisInstance.get.mockResolvedValueOnce(null);

      const result = await service.getNamespaceVersion('users');
      expect(result).toBe(0);
    });

    it('should handle error when getNamespaceVersion rejects', async () => {
      const redisInstance = service.getClient() as any;
      redisInstance.get.mockRejectedValueOnce(new Error('error'));

      const result = await service.getNamespaceVersion('users');
      expect(result).toBe(0);
    });

    it('should call incr for incrementNamespaceVersion', async () => {
      const redisInstance = service.getClient() as any;
      await service.incrementNamespaceVersion('users');

      expect(redisInstance.incr).toHaveBeenCalledWith('version:users');
    });

    it('should handle error when incrementNamespaceVersion rejects', async () => {
      const redisInstance = service.getClient() as any;
      redisInstance.incr.mockRejectedValueOnce(new Error('error'));

      await expect(
        service.incrementNamespaceVersion('users'),
      ).resolves.not.toThrow();
    });

    it('should log on connect event', () => {
      const redisInstance = service.getClient() as any;
      expect(() => redisInstance.emit('connect')).not.toThrow();
    });

    it('should log on error event', () => {
      const redisInstance = service.getClient() as any;
      expect(() =>
        redisInstance.emit('error', new Error('test err')),
      ).not.toThrow();
    });

    it('should call disconnect on onModuleDestroy', () => {
      const redisInstance = service.getClient() as any;
      service.onModuleDestroy();
      expect(redisInstance.disconnect).toHaveBeenCalled();
    });
  });

  describe('When CACHE_ENABLED is true but connect fails', () => {
    it('should log connection error during initialization', async () => {
      const mockConfigService = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'CACHE_ENABLED') return true;
          return null;
        }),
      };

      const RedisMock = Redis as unknown as jest.Mock;
      RedisMock.mockImplementationOnce(() => ({
        on: jest.fn(),
        connect: jest.fn().mockRejectedValue(new Error('init err')),
        disconnect: jest.fn(),
        get: jest.fn(),
        set: jest.fn(),
        del: jest.fn(),
        incr: jest.fn(),
      }));

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CacheService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      const svc = module.get<CacheService>(CacheService);

      await new Promise(process.nextTick);

      expect(svc.getClient()).toBeDefined();
    });
  });
});
