import { Test, TestingModule } from '@nestjs/testing';
import { PrismaHealthIndicator } from './prisma.health';
import { HealthCheckError } from '@nestjs/terminus';
import { PrismaClient } from '@prisma/client';

describe('PrismaHealthIndicator', () => {
  let indicator: PrismaHealthIndicator;
  let prismaMock: jest.Mocked<PrismaClient>;

  beforeEach(async () => {
    prismaMock = {
      $queryRaw: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaHealthIndicator],
    }).compile();

    indicator = module.get<PrismaHealthIndicator>(PrismaHealthIndicator);
  });

  it('should return healthy if query succeeds', async () => {
    (prismaMock.$queryRaw as jest.Mock).mockResolvedValue([1]);
    const result = await indicator.isHealthy('database', prismaMock);
    expect(result).toEqual({ database: { status: 'up' } });
  });

  it('should throw HealthCheckError if query fails', async () => {
    (prismaMock.$queryRaw as jest.Mock).mockRejectedValue(
      new Error('Connection failed'),
    );
    await expect(indicator.isHealthy('database', prismaMock)).rejects.toThrow(
      HealthCheckError,
    );
  });

  it('should handle non-error rejections', async () => {
    (prismaMock.$queryRaw as jest.Mock).mockRejectedValue('String error');
    await expect(indicator.isHealthy('database', prismaMock)).rejects.toThrow(
      HealthCheckError,
    );
  });
});
