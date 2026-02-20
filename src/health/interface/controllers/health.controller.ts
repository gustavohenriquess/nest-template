/* istanbul ignore file */
import { Controller, Get } from '@nestjs/common';
import { CheckHealthUseCase } from '../../application/use-cases/check-health.use-case';
import { CheckGcpIntegrationUseCase } from '../../application/use-cases/check-gcp-integration.use-case';

@Controller('health')
export class HealthController {
    constructor(
        private readonly checkHealth: CheckHealthUseCase,
        private readonly checkGcp: CheckGcpIntegrationUseCase,
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

    @Get('gcp')
    async handleGcp() {
        return this.checkGcp.execute();
    }
}
