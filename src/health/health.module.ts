/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { HealthController } from './interface/controllers/health.controller';
import { CheckHealthUseCase } from './application/use-cases/check-health.use-case';
import { CheckGcpIntegrationUseCase } from './application/use-cases/check-gcp-integration.use-case';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { PubSubListenerExample } from './application/listeners/pubsub-listener.example';

@Module({
    controllers: [HealthController],
    providers: [
        CheckHealthUseCase,
        CheckGcpIntegrationUseCase,
        PubSubListenerExample,
        // Exemplo: Instanciando serviços para diferentes projetos GCP
        {
            provide: 'GCP_PROJECT_A_BIGQUERY',
            useFactory: () => new BigQueryService('project-a-id'),
        },
        {
            provide: 'GCP_PROJECT_B_BIGQUERY',
            useFactory: () => new BigQueryService('project-b-id'),
        },
        {
            provide: 'GCP_PROJECT_A_PUBSUB',
            useFactory: () => new PubSubService('project-a-id'),
        },
        // Provendo instâncias padrão para compatibilidade com os Use Cases atuais
        {
            provide: BigQueryService,
            useFactory: () => new BigQueryService('primary-project-id'),
        },
        {
            provide: PubSubService,
            useFactory: () => new PubSubService('primary-project-id'),
        },
    ],
})
export class HealthModule { }
