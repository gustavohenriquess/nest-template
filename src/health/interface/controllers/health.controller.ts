/* istanbul ignore file */
import { Controller, Get } from '@nestjs/common';
import { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case';
import { CheckIntegrationsUseCase } from '../../application/use-cases/check-integrations.use-case';
import { ResponseMeta } from '@/core/decorators/response-meta.decorator';

@Controller('health')
export class HealthController {
    constructor(
        private readonly checkHealth: CheckHealthUseCase,
        private readonly checkIntegrations: CheckIntegrationsUseCase,
    ) { }

    @Get()
    @ResponseMeta({ module: 'health', severity: 'low' })
    async handle() {
        const { healthCheck } = await this.checkHealth.execute();

        return {
            status: healthCheck.status,
            timestamp: healthCheck.timestamp,
            details: healthCheck.details,
        };
    }

    @Get('integrations')
    @ResponseMeta({ module: 'health', severity: 'high' })
    async handleIntegrations() {
        return this.checkIntegrations.execute();
    }
}
