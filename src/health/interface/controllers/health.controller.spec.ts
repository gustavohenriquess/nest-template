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
    it('should return health status', async () => {
      const mockResult = {
        healthCheck: {
          status: 'ok',
          timestamp: new Date(),
          details: 'all good',
        },
      };
      checkHealth.execute.mockResolvedValue(mockResult as any);

      const result = await controller.handle();

      expect(result).toEqual({
        status: 'ok',
        timestamp: mockResult.healthCheck.timestamp,
        details: 'all good',
      });
    });
  });

  describe('handleIntegrations', () => {
    it('should return integrations status', async () => {
      const mockResult = {
        bigquery: { status: 'integrated' },
        pubsub: { status: 'integrated', messageId: '123' },
        prisma: { status: 'integrated' },
      };
      checkIntegrations.execute.mockResolvedValue(mockResult as any);

      const result = await controller.handleIntegrations();

      expect(result).toEqual(mockResult);
    });
  });
});
