import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  MemoryHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { HealthIntegrationsService } from '../../application/services/health-integrations.service';

describe('HealthController', () => {
  let controller: HealthController;
  let health: jest.Mocked<HealthCheckService>;
  let integrations: jest.Mocked<HealthIntegrationsService>;

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
          provide: HealthIntegrationsService,
          useValue: { getIndicators: jest.fn().mockReturnValue([]) },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    health = module.get<HealthCheckService>(
      HealthCheckService,
    ) as unknown as jest.Mocked<HealthCheckService>;
    integrations = module.get<HealthIntegrationsService>(
      HealthIntegrationsService,
    ) as unknown as jest.Mocked<HealthIntegrationsService>;
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
    it('should call health.check with integration service indicators', async () => {
      const mockResult = { status: 'ok', details: {} } as HealthCheckResult;
      const mockIndicators = [jest.fn()];
      integrations.getIndicators.mockReturnValue(mockIndicators);

      health.check.mockResolvedValue(mockResult);

      const result = await controller.handleIntegrations();

      expect(result).toEqual(mockResult);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(health.check).toHaveBeenCalledWith(mockIndicators);
    });
  });
});
