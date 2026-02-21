import { Test, TestingModule } from '@nestjs/testing';
import { CheckIntegrationsUseCase } from './check-integrations.use-case';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';

// Mocking @prisma/client to avoid module resolution issues
jest.mock('@prisma/client', () => {
    return {
        PrismaClient: class {
            $queryRaw = jest.fn();
        },
    };
});

jest.setTimeout(30000);

describe('CheckIntegrationsUseCase', () => {
    // ... (rest of setup)
    let useCase: CheckIntegrationsUseCase;
    let bigquery: jest.Mocked<BigQueryService>;
    let pubsub: jest.Mocked<PubSubService>;
    let storage: jest.Mocked<StorageService>;
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
                    provide: StorageService,
                    useValue: { listBuckets: jest.fn() },
                },
                {
                    provide: PrismaService,
                    useValue: { $queryRaw: jest.fn() },
                },
                {
                    provide: 'PRIMARY_PRISMA',
                    useValue: { $queryRaw: jest.fn() },
                },
            ],
        }).compile();

        useCase = module.get<CheckIntegrationsUseCase>(CheckIntegrationsUseCase);
        bigquery = module.get(BigQueryService);
        pubsub = module.get(PubSubService);
        storage = module.get(StorageService);
        prisma = module.get(PrismaService);
    });

    it('should return ok status when all services respond correctly', async () => {
        bigquery.query.mockResolvedValue([{ check: 1 }]);
        pubsub.publishMessage.mockResolvedValue('msg-id' as any);
        storage.listBuckets.mockResolvedValue([] as any);

        // Mocking $queryRaw specifically for tagged template usage
        const queryMock = jest.fn().mockResolvedValue([1]);
        (prisma as any).$queryRaw = queryMock;

        const result = await useCase.execute();

        expect(result).toEqual({
            bigquery: { status: 'ok', message: 'Connected' },
            pubsub: { status: 'ok', message: 'Message published' },
            storage: { status: 'ok', message: 'Connected' },
            prisma: { status: 'ok', message: 'Connected' },
        });
    });

    it('should return error status when services fail', async () => {
        bigquery.query.mockRejectedValue(new Error('BQ Error'));
        pubsub.publishMessage.mockRejectedValue(new Error('PS Error'));
        storage.listBuckets.mockRejectedValue(new Error('ST Error'));

        const queryMock = jest.fn().mockRejectedValue(new Error('Prisma Error'));
        (prisma as any).$queryRaw = queryMock;

        const result = await useCase.execute();

        expect(result).toEqual({
            bigquery: { status: 'error', message: 'BQ Error' },
            pubsub: { status: 'error', message: 'PS Error' },
            storage: { status: 'error', message: 'ST Error' },
            prisma: { status: 'error', message: 'Prisma Error' },
        });
    });

    it('should handle various error types across all services to cover branches', async () => {
        // Test 1: Errors with message
        bigquery.query.mockRejectedValue(new Error('BQ Message'));
        pubsub.publishMessage.mockRejectedValue(new Error('PS Message'));
        storage.listBuckets.mockRejectedValue(new Error('ST Message'));
        (prisma as any).$queryRaw = jest.fn().mockRejectedValue(new Error('PR Message'));

        let result = await useCase.execute();
        expect(result.bigquery.message).toBe('BQ Message');
        expect(result.pubsub.message).toBe('PS Message');
        expect(result.storage.message).toBe('ST Message');
        expect(result.prisma.message).toBe('PR Message');

        // Test 2: Errors without message (strings, objects, null, undefined)
        bigquery.query.mockRejectedValue('BQ String');
        pubsub.publishMessage.mockRejectedValue({ custom: 'error' });
        storage.listBuckets.mockRejectedValue(null);
        (prisma as any).$queryRaw = jest.fn().mockRejectedValue(undefined);

        result = await useCase.execute();
        expect(result.bigquery.message).toBe('BQ String');
        expect(result.pubsub.message).toBe('[object Object]');
        expect(result.storage.message).toBe('null');
        expect(result.prisma.message).toBe('undefined');

        // Test 3: Other truthy primitives (boolean, number) to cover !error and typeof check
        bigquery.query.mockRejectedValue(true);
        pubsub.publishMessage.mockRejectedValue(123);
        storage.listBuckets.mockRejectedValue(0); // falsy number
        (prisma as any).$queryRaw = jest.fn().mockRejectedValue(false); // falsy boolean

        result = await useCase.execute();
        expect(result.bigquery.message).toBe('true');
        expect(result.pubsub.message).toBe('123');
        expect(result.storage.message).toBe('0');
        expect(result.prisma.message).toBe('false');
    });

    it('should return error status when services timeout', async () => {
        jest.useFakeTimers();

        // Mocks that stay pending
        bigquery.query.mockReturnValue(new Promise(() => { }));
        pubsub.publishMessage.mockReturnValue(new Promise(() => { }));
        storage.listBuckets.mockReturnValue(new Promise(() => { }));

        const executePromise = useCase.execute();

        // Sequential timeouts need multiple advancements because they started one after another
        for (let i = 0; i < 4; i++) {
            jest.advanceTimersByTime(5100);
            await Promise.resolve();
            await Promise.resolve();
            await Promise.resolve();
        }

        const result = await executePromise;

        expect(result.bigquery.status).toBe('error');
        expect(result.bigquery.message).toContain('timeout');
        expect(result.pubsub.status).toBe('error');
        expect(result.pubsub.message).toContain('timeout');
        expect(result.storage.status).toBe('error');
        expect(result.storage.message).toContain('timeout');

        jest.useRealTimers();
    });
});
