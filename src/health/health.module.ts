import { Module } from '@nestjs/common';
import { HealthController } from './interface/controllers/health.controller';
import { CheckHealthUseCase } from './application/use-cases/check-health.use-case';

@Module({
    controllers: [HealthController],
    providers: [CheckHealthUseCase],
})
export class HealthModule { }
