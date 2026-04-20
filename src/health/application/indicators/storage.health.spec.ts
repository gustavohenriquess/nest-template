import { Test, TestingModule } from '@nestjs/testing';
import { StorageHealthIndicator } from './storage.health';
import { HealthCheckError } from '@nestjs/terminus';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';

describe('StorageHealthIndicator', () => {
  let indicator: StorageHealthIndicator;
  let storageMock: jest.Mocked<StorageService>;

  beforeEach(async () => {
    storageMock = {
      listBuckets: jest.fn(),
    } as unknown as jest.Mocked<StorageService>;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageHealthIndicator,
        { provide: StorageService, useValue: storageMock },
      ],
    }).compile();

    indicator = module.get<StorageHealthIndicator>(StorageHealthIndicator);
  });

  it('should return healthy if listBuckets succeeds', async () => {
    storageMock.listBuckets.mockResolvedValue([]);
    const result = await indicator.isHealthy('storage', storageMock);
    expect(result).toEqual({ storage: { status: 'up' } });
  });

  it('should throw HealthCheckError if listBuckets fails', async () => {
    storageMock.listBuckets.mockRejectedValue(new Error('Auth failed'));
    await expect(indicator.isHealthy('storage', storageMock)).rejects.toThrow(
      HealthCheckError,
    );
  });

  it('should handle non-error rejections', async () => {
    storageMock.listBuckets.mockRejectedValue('String error');
    await expect(indicator.isHealthy('storage', storageMock)).rejects.toThrow(
      HealthCheckError,
    );
  });
});
