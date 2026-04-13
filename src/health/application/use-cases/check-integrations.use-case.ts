/* istanbul ignore file */
import { Injectable, Logger, Inject } from '@nestjs/common';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

/* istanbul ignore next */
@Injectable()
export class CheckIntegrationsUseCase {
  private readonly logger = new Logger(CheckIntegrationsUseCase.name);

  @Inject(BigQueryService)
  private readonly bigQueryService: BigQueryService;

  @Inject(PubSubService)
  private readonly pubSubService: PubSubService;

  @Inject(StorageService)
  private readonly storageService: StorageService;

  @Inject(PrismaService)
  private readonly prismaService: PrismaService;

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
      await this.withTimeout(bqPromise, 5000, 'BigQuery timeout');
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
      await this.withTimeout(psPromise, 5000, 'PubSub timeout');
      results.pubsub = { status: 'ok', message: 'Message published' };
    } catch (error) {
      const message = this.extractErrorMessage(error);
      this.logger.warn(`PubSub check failed: ${message}`);
      results.pubsub = { status: 'error', message };
    }

    // Storage Check
    try {
      const stPromise = this.storageService.listBuckets();
      await this.withTimeout(stPromise, 5000, 'Storage timeout');
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

  private async withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    errorMessage: string,
  ): Promise<T> {
    let timeoutHandle: ReturnType<typeof setTimeout>;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error(errorMessage)), ms);
    });

    try {
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      clearTimeout(timeoutHandle!);
    }
  }
}
