import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { CacheService } from '@/core/cache/cache.service';

/* istanbul ignore next */
@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  /* istanbul ignore next */
  constructor(private cacheService: CacheService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const client = this.cacheService.getClient();
    let isHealthy: boolean;

    if (!client) {
      throw new HealthCheckError(
        'Redis connection is not initialized',
        this.getStatus(key, false, { message: 'Redis is disabled' }),
      );
    }

    try {
      const ping = await client.ping();
      isHealthy = ping === 'PONG';
    } catch {
      isHealthy = false;
    }

    const result = this.getStatus(key, isHealthy);
    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError('RedisHealthCheck failed', result);
  }
}
