/* istanbul ignore file */
import { Injectable, Logger } from '@nestjs/common';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

@Injectable()
export class CheckIntegrationsUseCase {
    private readonly logger = new Logger(CheckIntegrationsUseCase.name);

    constructor(
        private readonly bigquery: BigQueryService,
        private readonly pubsub: PubSubService,
        private readonly prisma: PrismaService,
    ) { }

    async execute() {
        this.logger.log('Executing complete integration check...');

        const integrations = {
            bigquery: await this.checkBigQuery(),
            pubsub: await this.checkPubSub(),
            prisma: await this.checkPrisma(),
        };

        return integrations;
    }

    private async checkBigQuery() {
        try {
            const result = await this.bigquery.query('SELECT 1 as check');
            return {
                status: result && result.length > 0 && result[0].check === 1 ? 'integrated' : 'simulated',
            };
        } catch (err) {
            this.logger.warn('BigQuery check failed:', err.message);
            return { status: 'simulated' };
        }
    }

    private async checkPubSub() {
        try {
            const messageId = await this.pubsub.publishMessage('health-check-topic', { status: 'ok' });
            return { status: 'integrated', messageId };
        } catch (err) {
            this.logger.warn('PubSub check failed:', err.message);
            return { status: 'simulated', messageId: 'mock-id' };
        }
    }

    private async checkPrisma() {
        try {
            // No Prisma, podemos tentar um comando simples como $queryRaw ou apenas verificar a conexão
            // Como é um exemplo, vamos simular uma query
            await this.prisma.$queryRaw`SELECT 1`;
            return { status: 'integrated' };
        } catch (err) {
            this.logger.warn('Prisma check failed:', err.message);
            return { status: 'simulated' };
        }
    }
}
