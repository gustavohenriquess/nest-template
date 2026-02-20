/* istanbul ignore file */
import { Controller, Get } from '@nestjs/common';
import { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case';
import { CheckIntegrationsUseCase } from '../../application/use-cases/check-integrations.use-case';

@Controller('health')
export class HealthController {
    constructor(
        private readonly checkHealth: CheckHealthUseCase,
        private readonly checkIntegrations: CheckIntegrationsUseCase,
    ) { }

    @Get()
    async handle() {
        const { healthCheck } = await this.checkHealth.execute();

        return {
            status: healthCheck.status,
            timestamp: healthCheck.timestamp,
            details: healthCheck.details,
        };
    }

    @Get('integrations')
    async handleIntegrations() {
        return this.checkIntegrations.execute();
    }
}
