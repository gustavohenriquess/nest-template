import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './interface/controllers/health.controller';
import { PrismaHealthIndicator } from './application/indicators/prisma.health';
import { PubSubHealthIndicator } from './application/indicators/pubsub.health';
import { BigQueryHealthIndicator } from './application/indicators/bigquery.health';
import { StorageHealthIndicator } from './application/indicators/storage.health';
import { RedisHealthIndicator } from './application/indicators/redis.health';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';
// import { PubSubListenerExample } from './application/listeners/pubsub-listener.example';
import { HealthIntegrationsService } from './application/services/health-integrations.service';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [
    PrismaHealthIndicator,
    PubSubHealthIndicator,
    BigQueryHealthIndicator,
    StorageHealthIndicator,
    RedisHealthIndicator,
    // PubSubListenerExample,
    HealthIntegrationsService,

    {
      provide: BigQueryService,
      useFactory: (configService: ConfigService) => {
        const projectId =
          configService.get<string>('GCP_PRIMARY_PROJECT_ID') ||
          'primary-project-id';
        return new BigQueryService(projectId);
      },
      inject: [ConfigService],
    },
    {
      provide: PubSubService,
      useFactory: (configService: ConfigService) => {
        const projectId =
          configService.get<string>('GCP_PRIMARY_PROJECT_ID') ||
          'primary-project-id';
        return new PubSubService(projectId);
      },
      inject: [ConfigService],
    },
    {
      provide: StorageService,
      useFactory: (configService: ConfigService) => {
        const projectId =
          configService.get<string>('GCP_PRIMARY_PROJECT_ID') ||
          'primary-project-id';
        return new StorageService(projectId);
      },
      inject: [ConfigService],
    },
  ],
})
export class HealthModule {}
