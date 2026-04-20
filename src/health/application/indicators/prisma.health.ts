import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaHealthIndicator extends HealthIndicator {
  /**
   * Checks if the Prisma connection is healthy.
   * @param key The key to use in the health check result.
   * @param client The Prisma client instance to verify.
   */
  async isHealthy(
    key: string,
    client: PrismaClient,
  ): Promise<HealthIndicatorResult> {
    try {
      await client.$queryRaw`SELECT 1`;
      return this.getStatus(key, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HealthCheckError(
        `${key} is not reachable`,
        this.getStatus(key, false, { message }),
      );
    }
  }
}
