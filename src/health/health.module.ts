/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { HealthController } from './interface/controllers/health.controller';
import { CheckHealthUseCase } from './application/use-cases/check-health.use-case';
import { CheckIntegrationsUseCase } from './application/use-cases/check-integrations.use-case';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { PubSubListenerExample } from './application/listeners/pubsub-listener.example';

@Module({
    controllers: [HealthController],
    providers: [
        CheckHealthUseCase,
        CheckIntegrationsUseCase,
        PubSubListenerExample,
        // Exemplo: Instanciando múltiplos databases com Prisma
        {
            provide: 'PRIMARY_PRISMA',
            useFactory: () => new PrismaService('postgresql://user:pass@localhost:5432/primary'),
        },
        {
            provide: 'SECONDARY_PRISMA',
            useFactory: () => new PrismaService('postgresql://user:pass@localhost:5432/secondary'),
        },
        // Provendo instâncias padrão
        {
            provide: BigQueryService,
            useFactory: () => new BigQueryService('primary-project-id'),
        },
        {
            provide: PubSubService,
            useFactory: () => new PubSubService('primary-project-id'),
        },
        {
            provide: PrismaService,
            useFactory: () => new PrismaService('postgresql://user:pass@localhost:5432/default'),
        },
    ],
})
export class HealthModule { }
