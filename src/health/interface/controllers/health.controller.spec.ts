import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { PrismaHealthIndicator } from '../../application/indicators/prisma.health';
import { PubSubHealthIndicator } from '../../application/indicators/pubsub.health';
import { BigQueryHealthIndicator } from '../../application/indicators/bigquery.health';
import { StorageHealthIndicator } from '../../application/indicators/storage.health';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let health: jest.Mocked<HealthCheckService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: { check: jest.fn() },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: { checkHeap: jest.fn(), checkRSS: jest.fn() },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: { isHealthy: jest.fn() },
        },
        {
          provide: PubSubHealthIndicator,
          useValue: { isHealthy: jest.fn() },
        },
        {
          provide: BigQueryHealthIndicator,
          useValue: { isHealthy: jest.fn() },
        },
        {
          provide: StorageHealthIndicator,
          useValue: { isHealthy: jest.fn() },
        },
        {
          provide: BigQueryService,
          useValue: { query: jest.fn() },
        },
        {
          provide: PubSubService,
          useValue: { publishMessage: jest.fn() },
        },
        {
          provide: StorageService,
          useValue: { listBuckets: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: { $queryRaw: jest.fn() },
        },
        {
          provide: 'PRIMARY_PRISMA',
          useValue: { $queryRaw: jest.fn() },
        },
        {
          provide: 'SECONDARY_PRISMA',
          useValue: { $queryRaw: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    health = module.get<HealthCheckService>(
      HealthCheckService,
    ) as unknown as jest.Mocked<HealthCheckService>;
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handle', () => {
    it('should call health.check with memory indicators', async () => {
      const mockResult = { status: 'ok', details: {} } as HealthCheckResult;
      health.check.mockImplementation(async (fns: Array<() => unknown>) => {
        for (const fn of fns) await fn();
        return mockResult;
      });

      const result = await controller.handle();

      expect(result).toEqual(mockResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(health.check).toHaveBeenCalled();
    });
  });

  describe('handleIntegrations', () => {
    it('should call health.check with all integration indicators', async () => {
      const mockResult = { status: 'ok', details: {} } as HealthCheckResult;
      health.check.mockImplementation(async (fns: Array<() => unknown>) => {
        for (const fn of fns) await fn();
        return mockResult;
      });

      const result = await controller.handleIntegrations();

      expect(result).toEqual(mockResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(health.check).toHaveBeenCalled();
    });
  });
});
