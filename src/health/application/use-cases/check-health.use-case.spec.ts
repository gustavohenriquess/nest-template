import { CheckHealthUseCase } from './check-health.use-case';

describe('CheckHealthUseCase', () => {
    let sut: CheckHealthUseCase;

    beforeEach(() => {
        sut = new CheckHealthUseCase();
    });

    it('should be able to check health', async () => {
        const { healthCheck } = await sut.execute();

        expect(healthCheck.status).toBe('ok');
        expect(healthCheck.details).toBe('Service is running correctly');
        expect(healthCheck.timestamp).toBeInstanceOf(Date);
    });
});
