import { Test, TestingModule } from '@nestjs/testing';
import { BigQueryHealthIndicator } from './bigquery.health';
import { HealthCheckError } from '@nestjs/terminus';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';

describe('BigQueryHealthIndicator', () => {
  let indicator: BigQueryHealthIndicator;
  let bqMock: jest.Mocked<BigQueryService>;

  beforeEach(async () => {
    bqMock = {
      query: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BigQueryHealthIndicator,
        { provide: BigQueryService, useValue: bqMock },
      ],
    }).compile();

    indicator = module.get<BigQueryHealthIndicator>(BigQueryHealthIndicator);
  });

  it('should return healthy if query succeeds', async () => {
    bqMock.query.mockResolvedValue([1]);
    const result = await indicator.isHealthy('bigquery', bqMock);
    expect(result).toEqual({ bigquery: { status: 'up' } });
  });

  it('should throw HealthCheckError if query fails', async () => {
    bqMock.query.mockRejectedValue(new Error('Query failed'));
    await expect(indicator.isHealthy('bigquery', bqMock)).rejects.toThrow(
      HealthCheckError,
    );
  });

  it('should handle non-error rejections', async () => {
    bqMock.query.mockRejectedValue('String error');
    await expect(indicator.isHealthy('bigquery', bqMock)).rejects.toThrow(
      HealthCheckError,
    );
  });
});
