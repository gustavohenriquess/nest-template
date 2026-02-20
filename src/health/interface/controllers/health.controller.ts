import { Controller, Get } from '@nestjs/common';
import { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case';

@Controller('health')
export class HealthController {
    constructor(private readonly checkHealth: CheckHealthUseCase) { }

    @Get()
    async handle() {
        const { healthCheck } = await this.checkHealth.execute();

        return {
            status: healthCheck.status,
            timestamp: healthCheck.timestamp,
            details: healthCheck.details,
        };
    }
}
