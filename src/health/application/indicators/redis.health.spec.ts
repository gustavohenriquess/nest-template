import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError } from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis.health';
import { CacheService } from '@/core/cache/cache.service';

describe('RedisHealthIndicator', () => {
  let indicator: RedisHealthIndicator;
  let mockCacheService: Partial<CacheService>;
  let mockClient: { ping: jest.Mock };

  beforeEach(async () => {
    mockClient = {
      ping: jest.fn(),
    };

    mockCacheService = {
      getClient: jest.fn().mockReturnValue(mockClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisHealthIndicator,
        { provide: CacheService, useValue: mockCacheService },
      ],
    }).compile();

    indicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  it('should be defined and constructable', () => {
    const directInstance = new RedisHealthIndicator(
      mockCacheService as CacheService,
    );
    expect(directInstance).toBeDefined();
    expect(indicator).toBeDefined();
  });

  it('should throw HealthCheckError if client is undefined', async () => {
    (mockCacheService.getClient as jest.Mock).mockReturnValue(undefined);

    await expect(indicator.isHealthy('redis')).rejects.toThrow(
      HealthCheckError,
    );
  });

  it('should return healthy if ping returns PONG', async () => {
    mockClient.ping.mockResolvedValue('PONG');
    const result = await indicator.isHealthy('redis');

    expect(result).toEqual({ redis: { status: 'up' } });
  });

  it('should throw HealthCheckError if ping returns something else', async () => {
    mockClient.ping.mockResolvedValue('PONG_FAIL');

    await expect(indicator.isHealthy('redis')).rejects.toThrow(
      HealthCheckError,
    );
  });

  it('should throw HealthCheckError if ping rejects', async () => {
    mockClient.ping.mockRejectedValue(new Error('Connection lost'));

    await expect(indicator.isHealthy('redis')).rejects.toThrow(
      HealthCheckError,
    );
  });
});
