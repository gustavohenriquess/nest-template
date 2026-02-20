import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case';
import { HealthCheck } from '../../domain/entities/health-check.entity';

describe('HealthController', () => {
    let controller: HealthController;
    let useCase: CheckHealthUseCase;

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
            ],
        }).compile();

        controller = module.get<HealthController>(HealthController);
        useCase = module.get<CheckHealthUseCase>(CheckHealthUseCase);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should return health check status', async () => {
        const timestamp = new Date();
        jest.spyOn(useCase, 'execute').mockResolvedValue({
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
});
