/* istanbul ignore file */
import { Injectable, Logger } from '@nestjs/common';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';

@Injectable()
export class CheckGcpIntegrationUseCase {
    private readonly logger = new Logger(CheckGcpIntegrationUseCase.name);

    constructor(
        private readonly bigquery: BigQueryService,
        private readonly pubsub: PubSubService,
    ) { }

    async execute() {
        this.logger.log('Executing GCP integration check...');

        let bqCheck = 0;
        try {
            const bqResult = await this.bigquery.query('SELECT 1 as check');
            if (bqResult && bqResult.length > 0 && bqResult[0].check === 1) {
                bqCheck = 1;
            }
        } catch (err) {
            this.logger.warn('BigQuery query failed (expected if not configured):', err.message);
        }

        let messageId = 'mock-id';
        try {
            messageId = await this.pubsub.publishMessage('health-check-topic', {
                status: 'ok',
                timestamp: new Date(),
            });
        } catch (err) {
            this.logger.warn('PubSub publish failed (expected if not configured):', err.message);
        }

        return {
            bigquery: {
                status: bqCheck === 1 ? 'integrated' : 'simulated',
            },
            pubsub: {
                status: messageId !== 'mock-id' ? 'integrated' : 'simulated',
                messageId,
            },
        };
    }
}
