import { Test, TestingModule } from '@nestjs/testing';
import { HealthIntegrationsService } from './health-integrations.service';
import { PrismaHealthIndicator } from '../indicators/prisma.health';
import { PubSubHealthIndicator } from '../indicators/pubsub.health';
import { BigQueryHealthIndicator } from '../indicators/bigquery.health';
import { StorageHealthIndicator } from '../indicators/storage.health';
import { RedisHealthIndicator } from '../indicators/redis.health';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

describe('HealthIntegrationsService', () => {
  let service: HealthIntegrationsService;
  let prismaIndicator: PrismaHealthIndicator;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthIntegrationsService,
        {
          provide: PrismaHealthIndicator,
          useValue: { isHealthy: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: PubSubHealthIndicator,
          useValue: { isHealthy: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: BigQueryHealthIndicator,
          useValue: { isHealthy: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: StorageHealthIndicator,
          useValue: { isHealthy: jest.fn().mockResolvedValue({}) },
        },
        {
          provide: RedisHealthIndicator,
          useValue: { isHealthy: jest.fn().mockResolvedValue({}) },
        },
        { provide: BigQueryService, useValue: {} },
        { provide: PubSubService, useValue: {} },
        { provide: StorageService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue(true) },
        },
      ],
    }).compile();

    service = module.get<HealthIntegrationsService>(HealthIntegrationsService);
    prismaIndicator = module.get<PrismaHealthIndicator>(PrismaHealthIndicator);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return 5 indicator functions when cache is enabled', () => {
    const indicators = service.getIndicators();
    expect(indicators).toHaveLength(5);
    indicators.forEach((fn) => expect(typeof fn).toBe('function'));
  });

  it('should call indicators correctly when functions are executed', async () => {
    const indicators = service.getIndicators();
    for (const fn of indicators) {
      await fn();
    }
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(prismaIndicator.isHealthy).toHaveBeenCalledTimes(1);
  });
});
