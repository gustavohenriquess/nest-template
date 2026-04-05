import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case';
import { CheckIntegrationsUseCase } from '../../application/use-cases/check-integrations.use-case';

// Mocking @prisma/client to avoid module resolution issues
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: class {},
  };
});

describe('HealthController', () => {
  let controller: HealthController;
  let checkHealth: jest.Mocked<CheckHealthUseCase>;
  let checkIntegrations: jest.Mocked<CheckIntegrationsUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: CheckHealthUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CheckIntegrationsUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    checkHealth = module.get(CheckHealthUseCase);
    checkIntegrations = module.get(CheckIntegrationsUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handle', () => {
    it('should return health status', () => {
      const mockResult = {
        healthCheck: {
          status: 'ok',
          timestamp: new Date(),
          details: 'all good',
          memoryUsage: { heapTotal: 0, heapUsed: 0, rss: 0 },
          cpuLoad: [0, 0, 0],
          uptime: 0,
          uptimeHuman: '0s',
          nodeVersion: '18',
        },
      };
      checkHealth.execute.mockReturnValue(
        mockResult as unknown as ReturnType<CheckHealthUseCase['execute']>,
      );

      const result = controller.handle();

      expect(result).toEqual({
        status: 'ok',
        timestamp: mockResult.healthCheck.timestamp,
        details: 'all good',
        memoryUsage: { heapTotal: 0, heapUsed: 0, rss: 0 },
        cpuLoad: [0, 0, 0],
        uptime: 0,
        uptimeHuman: '0s',
        nodeVersion: '18',
      });
    });
  });

  describe('handleIntegrations', () => {
    it('should return integrations status', async () => {
      const mockResult = {
        bigquery: { status: 'integrated', message: '' },
        pubsub: { status: 'integrated', message: '123' },
        storage: { status: 'integrated', message: '' },
        prisma: { status: 'integrated', message: '' },
      };
      checkIntegrations.execute.mockResolvedValue(
        mockResult as unknown as never,
      );

      const result = await controller.handleIntegrations();

      expect(result).toEqual(mockResult);
    });
  });
});
