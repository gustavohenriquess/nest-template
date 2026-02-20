import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case';
import { CheckGcpIntegrationUseCase } from '../../application/use-cases/check-gcp-integration.use-case';
import { HealthCheck } from '../../domain/entities/health-check.entity';

describe('HealthController', () => {
    let controller: HealthController;
    let checkHealth: CheckHealthUseCase;
    let checkGcp: CheckGcpIntegrationUseCase;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                {
                    provide: CheckHealthUseCase,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
                {
                    provide: CheckGcpIntegrationUseCase,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<HealthController>(HealthController);
        checkHealth = module.get<CheckHealthUseCase>(CheckHealthUseCase);
        checkGcp = module.get<CheckGcpIntegrationUseCase>(CheckGcpIntegrationUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return health check status', async () => {
        const timestamp = new Date();
        jest.spyOn(checkHealth, 'execute').mockResolvedValue({
            healthCheck: HealthCheck.create({
                status: 'ok',
                timestamp,
                details: 'ok',
            }),
        });

        const response = await controller.handle();

        expect(response).toEqual({
            status: 'ok',
            timestamp,
            details: 'ok',
        });
    });

    it('should return gcp integration status', async () => {
        const mockResult = { bigquery: { status: 'integrated' }, pubsub: { status: 'integrated', messageId: 'id' } };
        jest.spyOn(checkGcp, 'execute').mockResolvedValue(mockResult as any);

        const response = await controller.handleGcp();

        expect(response).toBe(mockResult);
        expect(checkGcp.execute).toHaveBeenCalled();
    });
});
