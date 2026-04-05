/* istanbul ignore file */
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthController } from './interface/controllers/health.controller';
import { CheckHealthUseCase } from './application/use-cases/check-health.use-case';
import { CheckIntegrationsUseCase } from './application/use-cases/check-integrations.use-case';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { PubSubListenerExample } from './application/listeners/pubsub-listener.example';

@Module({
  controllers: [HealthController],
  providers: [
    CheckHealthUseCase,
    CheckIntegrationsUseCase,
    PubSubListenerExample,
    // Exemplo: Instanciando múltiplos databases com Prisma usando ConfigService
    {
      provide: 'PRIMARY_PRISMA',
      useFactory: (configService: ConfigService) => {
        const url =
          configService.get<string>('DATABASE_URL_PRIMARY') ||
          'postgresql://user:pass@localhost:5432/primary';
        return new PrismaService(url);
      },
      inject: [ConfigService],
    },
    {
      provide: 'SECONDARY_PRISMA',
      useFactory: (configService: ConfigService) => {
        const url =
          configService.get<string>('DATABASE_URL_SECONDARY') ||
          'postgresql://user:pass@localhost:5432/secondary';
        return new PrismaService(url);
      },
      inject: [ConfigService],
    },
    // Provendo instâncias padrão com ConfigService
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
    {
      provide: PrismaService,
      useFactory: (configService: ConfigService) => {
        const url =
          configService.get<string>('DATABASE_URL') ||
          'postgresql://user:pass@localhost:5432/default';
        return new PrismaService(url);
      },
      inject: [ConfigService],
    },
  ],
})
export class HealthModule {}
