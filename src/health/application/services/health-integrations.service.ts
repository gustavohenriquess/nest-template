import { Inject, Injectable } from '@nestjs/common';
import { PrismaHealthIndicator } from '../indicators/prisma.health';
import { PubSubHealthIndicator } from '../indicators/pubsub.health';
import { BigQueryHealthIndicator } from '../indicators/bigquery.health';
import { StorageHealthIndicator } from '../indicators/storage.health';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class HealthIntegrationsService {
  @Inject(PrismaService)
  private readonly defaultPrisma!: PrismaService;

  @Inject('PRIMARY_PRISMA')
  private readonly primaryPrisma!: PrismaService;

  @Inject('SECONDARY_PRISMA')
  private readonly secondaryPrisma!: PrismaService;

  private readonly prisma: PrismaHealthIndicator;
  private readonly pubsub: PubSubHealthIndicator;
  private readonly bigquery: BigQueryHealthIndicator;
  private readonly storage: StorageHealthIndicator;
  private readonly bigqueryService: BigQueryService;
  private readonly pubsubService: PubSubService;
  private readonly storageService: StorageService;

  constructor(
    prisma: PrismaHealthIndicator,
    pubsub: PubSubHealthIndicator,
    bigquery: BigQueryHealthIndicator,
    storage: StorageHealthIndicator,
    bigqueryService: BigQueryService,
    pubsubService: PubSubService,
    storageService: StorageService,
  ) {
    this.prisma = prisma;
    this.pubsub = pubsub;
    this.bigquery = bigquery;
    this.storage = storage;
    this.bigqueryService = bigqueryService;
    this.pubsubService = pubsubService;
    this.storageService = storageService;
  }

  getIndicators() {
    return [
      () => this.prisma.isHealthy('prisma_default', this.defaultPrisma),
      () => this.prisma.isHealthy('prisma_primary', this.primaryPrisma),
      () => this.prisma.isHealthy('prisma_secondary', this.secondaryPrisma),
      () => this.pubsub.isHealthy('pubsub', this.pubsubService),
      () => this.bigquery.isHealthy('bigquery', this.bigqueryService),
      () => this.storage.isHealthy('storage', this.storageService),
    ];
  }
}
