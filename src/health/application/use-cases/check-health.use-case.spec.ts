import { CheckHealthUseCase } from './check-health.use-case';

describe('CheckHealthUseCase', () => {
  let sut: CheckHealthUseCase;

  beforeEach(() => {
    sut = new CheckHealthUseCase();
  });

  it('should be able to check health with system metrics', () => {
    const { healthCheck } = sut.execute();

    expect(healthCheck.status).toBe('ok');
    expect(healthCheck.timestamp).toBeInstanceOf(Date);
    expect(healthCheck.details).toBe('Service is running correctly');
    expect(healthCheck.memoryUsage.heapTotal).toBeGreaterThan(0);
    expect(healthCheck.memoryUsage.heapUsed).toBeGreaterThan(0);
    expect(healthCheck.memoryUsage.rss).toBeGreaterThan(0);
    expect(Array.isArray(healthCheck.cpuLoad)).toBe(true);
    expect(healthCheck.uptime).toBeGreaterThanOrEqual(0);
    expect(healthCheck.uptimeHuman).toBeDefined();
    expect(healthCheck.nodeVersion).toContain('v');
  });
});
