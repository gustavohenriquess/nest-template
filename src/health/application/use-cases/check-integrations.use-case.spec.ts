import { Test, TestingModule } from '@nestjs/testing';
import { CheckIntegrationsUseCase } from './check-integrations.use-case';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

// Mocking @prisma/client to avoid module resolution issues
jest.mock('@prisma/client', () => {
    return {
        PrismaClient: class {
            $queryRaw = jest.fn();
        },
    };
});

describe('CheckIntegrationsUseCase', () => {
    let useCase: CheckIntegrationsUseCase;
    let bigquery: jest.Mocked<BigQueryService>;
    let pubsub: jest.Mocked<PubSubService>;
    let prisma: jest.Mocked<PrismaService>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CheckIntegrationsUseCase,
                {
                    provide: BigQueryService,
                    useValue: { query: jest.fn() },
                },
                {
                    provide: PubSubService,
                    useValue: { publishMessage: jest.fn() },
                },
                {
                    provide: PrismaService,
                    useValue: { $queryRaw: jest.fn() },
                },
            ],
        }).compile();

        useCase = module.get<CheckIntegrationsUseCase>(CheckIntegrationsUseCase);
        bigquery = module.get(BigQueryService);
        pubsub = module.get(PubSubService);
        prisma = module.get(PrismaService);
    });

    it('should return integrated status when all services respond correctly', async () => {
        bigquery.query.mockResolvedValue([{ check: 1 }]);
        pubsub.publishMessage.mockResolvedValue('msg-id');

        // Mocking $queryRaw specifically for tagged template usage
        const queryMock = jest.fn().mockResolvedValue([1]);
        (prisma as any).$queryRaw = queryMock;

        const result = await useCase.execute();

        expect(result).toEqual({
            bigquery: { status: 'integrated' },
            pubsub: { status: 'integrated', messageId: 'msg-id' },
            prisma: { status: 'integrated' },
        });
    });

    it('should return simulated status when services fail', async () => {
        bigquery.query.mockRejectedValue(new Error('BQ Error'));
        pubsub.publishMessage.mockRejectedValue(new Error('PS Error'));

        const queryMock = jest.fn().mockRejectedValue(new Error('Prisma Error'));
        (prisma as any).$queryRaw = queryMock;

        const result = await useCase.execute();

        expect(result).toEqual({
            bigquery: { status: 'simulated' },
            pubsub: { status: 'simulated', messageId: 'mock-id' },
            prisma: { status: 'simulated' },
        });
    });
});
