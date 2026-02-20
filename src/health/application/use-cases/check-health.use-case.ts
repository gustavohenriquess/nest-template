import { Injectable } from '@nestjs/common';
import { HealthCheck } from '../../domain/entities/health-check.entity';

@Injectable()
export class CheckHealthUseCase {
    async execute() {
        const healthCheck = HealthCheck.create({
            status: 'ok',
            timestamp: new Date(),
            details: 'Service is running correctly',
        });

        return {
            healthCheck,
        };
    }
}
