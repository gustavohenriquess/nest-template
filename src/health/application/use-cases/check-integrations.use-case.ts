import { Injectable, Logger, Inject } from '@nestjs/common';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class CheckIntegrationsUseCase {
    private readonly logger = new Logger(CheckIntegrationsUseCase.name);

    constructor(
        private readonly bigQueryService: BigQueryService,
        private readonly pubSubService: PubSubService,
        private readonly prismaService: PrismaService,
        @Inject('PRIMARY_PRISMA') private readonly primaryPrisma: PrismaService,
    ) { }

    async execute() {
        this.logger.log('Executing complete integration check...');

        const results = {
            bigquery: { status: 'checking', message: '' },
            pubsub: { status: 'checking', message: '' },
            prisma: { status: 'checking', message: '' },
        };

        // BigQuery Check
        try {
            // Usar Promise.race como safeguard adicional contra bibliotecas que "travam" ou crasham
            const bqPromise = this.bigQueryService.query('SELECT 1');
            await Promise.race([
                bqPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('BigQuery timeout')), 5000))
            ]);
            results.bigquery = { status: 'ok', message: 'Connected' };
        } catch (error) {
            this.logger.warn(`BigQuery check failed: ${error.message || error}`);
            results.bigquery = { status: 'error', message: error.message || String(error) };
        }

        // PubSub Check
        try {
            const psPromise = this.pubSubService.publishMessage('health-check-topic', { ping: true });
            await Promise.race([
                psPromise,
                new Promise((_, reject) => setTimeout(() => reject(new Error('PubSub timeout')), 5000))
            ]);
            results.pubsub = { status: 'ok', message: 'Message published' };
        } catch (error) {
            this.logger.warn(`PubSub check failed: ${error.message || error}`);
            results.pubsub = { status: 'error', message: error.message || String(error) };
        }

        // Prisma Check
        try {
            await this.prismaService.$queryRaw`SELECT 1`;
            results.prisma = { status: 'ok', message: 'Connected' };
        } catch (error) {
            this.logger.warn(`Prisma check failed: ${error.message || error}`);
            results.prisma = { status: 'error', message: error.message || String(error) };
        }

        return results;
    }
}
