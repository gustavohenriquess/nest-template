import { Inject, Injectable } from '@nestjs/common';
import { PrismaHealthIndicator } from '../indicators/prisma.health';
import { PubSubHealthIndicator } from '../indicators/pubsub.health';
import { BigQueryHealthIndicator } from '../indicators/bigquery.health';
import { StorageHealthIndicator } from '../indicators/storage.health';
import { RedisHealthIndicator } from '../indicators/redis.health';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

/* istanbul ignore next */
@Injectable()
export class HealthIntegrationsService {
  @Inject(PrismaService)
  private readonly defaultPrisma!: PrismaService;

  private readonly prisma: PrismaHealthIndicator;
  private readonly pubsub: PubSubHealthIndicator;
  private readonly bigquery: BigQueryHealthIndicator;
  private readonly storage: StorageHealthIndicator;
  private readonly redis: RedisHealthIndicator;
  private readonly bigqueryService: BigQueryService;
  private readonly pubsubService: PubSubService;
  private readonly storageService: StorageService;
  private readonly configService: ConfigService;

  constructor(
    prisma: PrismaHealthIndicator,
    pubsub: PubSubHealthIndicator,
    bigquery: BigQueryHealthIndicator,
    storage: StorageHealthIndicator,
    redis: RedisHealthIndicator,
    bigqueryService: BigQueryService,
    pubsubService: PubSubService,
    storageService: StorageService,
    configService: ConfigService,
  ) {
    this.prisma = prisma;
    this.pubsub = pubsub;
    this.bigquery = bigquery;
    this.storage = storage;
    this.redis = redis;
    this.bigqueryService = bigqueryService;
    this.pubsubService = pubsubService;
    this.storageService = storageService;
    this.configService = configService;
  }

  getIndicators() {
    const indicators = [
      () => this.prisma.isHealthy('prisma_default', this.defaultPrisma),
    ];
    if (this.configService.get<boolean>('PUBSUB_ENABLED')) {
      indicators.push(() =>
        this.pubsub.isHealthy('pubsub', this.pubsubService),
      );
    }

    if (this.configService.get<boolean>('BIGQUERY_ENABLED')) {
      indicators.push(() =>
        this.bigquery.isHealthy('bigquery', this.bigqueryService),
      );
    }

    if (this.configService.get<boolean>('STORAGE_ENABLED')) {
      indicators.push(() =>
        this.storage.isHealthy('storage', this.storageService),
      );
    }

    if (this.configService.get<boolean>('CACHE_ENABLED')) {
      indicators.push(() => this.redis.isHealthy('redis'));
    }

    return indicators;
  }
}
