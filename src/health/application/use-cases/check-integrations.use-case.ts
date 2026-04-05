import { Injectable, Logger, Inject } from '@nestjs/common';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class CheckIntegrationsUseCase {
  private readonly logger = new Logger(CheckIntegrationsUseCase.name);

  private readonly bigQueryService: BigQueryService;
  private readonly pubSubService: PubSubService;
  private readonly storageService: StorageService;
  private readonly prismaService: PrismaService;

  constructor(
    @Inject(BigQueryService) bigQueryService: BigQueryService,
    @Inject(PubSubService) pubSubService: PubSubService,
    @Inject(StorageService) storageService: StorageService,
    @Inject(PrismaService) prismaService: PrismaService,
  ) {
    this.bigQueryService = bigQueryService;
    this.pubSubService = pubSubService;
    this.storageService = storageService;
    this.prismaService = prismaService;
  }

  async execute() {
    this.logger.log('Executing complete integration check...');

    const results = {
      bigquery: { status: 'checking', message: '' },
      pubsub: { status: 'checking', message: '' },
      storage: { status: 'checking', message: '' },
      prisma: { status: 'checking', message: '' },
    };

    // BigQuery Check
    try {
      const bqPromise = this.bigQueryService.query('SELECT 1');
      await Promise.race([
        bqPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('BigQuery timeout')), 5000),
        ),
      ]);
      results.bigquery = { status: 'ok', message: 'Connected' };
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.logger.warn(`BigQuery check failed: ${message}`);
      results.bigquery = { status: 'error', message };
    }

    // PubSub Check
    try {
      const psPromise = this.pubSubService.publishMessage(
        'health-check-topic',
        { ping: true },
      );
      await Promise.race([
        psPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('PubSub timeout')), 5000),
        ),
      ]);
      results.pubsub = { status: 'ok', message: 'Message published' };
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.logger.warn(`PubSub check failed: ${message}`);
      results.pubsub = { status: 'error', message };
    }

    // Storage Check
    try {
      const stPromise = this.storageService.listBuckets();
      await Promise.race([
        stPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Storage timeout')), 5000),
        ),
      ]);
      results.storage = { status: 'ok', message: 'Connected' };
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.logger.warn(`Storage check failed: ${message}`);
      results.storage = { status: 'error', message };
    }

    // Prisma Check
    try {
      await this.prismaService.$queryRaw`SELECT 1`;
      results.prisma = { status: 'ok', message: 'Connected' };
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.logger.warn(`Prisma check failed: ${message}`);
      results.prisma = { status: 'error', message };
    }

    return results;
  }

  private extractErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }
}
