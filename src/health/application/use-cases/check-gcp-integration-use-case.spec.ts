import { Test, TestingModule } from '@nestjs/testing';
import { CheckGcpIntegrationUseCase } from './check-gcp-integration.use-case';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';

describe('CheckGcpIntegrationUseCase', () => {
    let useCase: CheckGcpIntegrationUseCase;
    let bigquery: jest.Mocked<BigQueryService>;
    let pubsub: jest.Mocked<PubSubService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CheckGcpIntegrationUseCase,
                {
                    provide: BigQueryService,
                    useValue: {
                        query: jest.fn(),
                    },
                },
                {
                    provide: PubSubService,
                    useValue: {
                        publishMessage: jest.fn(),
                    },
                },
            ],
        }).compile();

        useCase = module.get<CheckGcpIntegrationUseCase>(CheckGcpIntegrationUseCase);
        bigquery = module.get(BigQueryService);
        pubsub = module.get(PubSubService);
    });

    it('should return integrated status when services respond correctly', async () => {
        bigquery.query.mockResolvedValue([{ check: 1 }]);
        pubsub.publishMessage.mockResolvedValue('msg-id');

        const result = await useCase.execute();

        expect(result).toEqual({
            bigquery: { status: 'integrated' },
            pubsub: { status: 'integrated', messageId: 'msg-id' },
        });
    });

    it('should return simulated status when services fail', async () => {
        bigquery.query.mockRejectedValue(new Error('BQ Error'));
        pubsub.publishMessage.mockRejectedValue(new Error('PS Error'));

        const result = await useCase.execute();

        expect(result).toEqual({
            bigquery: { status: 'simulated' },
            pubsub: { status: 'simulated', messageId: 'mock-id' },
        });
    });
});
