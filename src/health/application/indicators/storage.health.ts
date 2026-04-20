import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';

@Injectable()
export class StorageHealthIndicator extends HealthIndicator {
  /**
   * Verifies connectivity to Storage by listing buckets.
   */
  async isHealthy(
    key: string,
    service: StorageService,
  ): Promise<HealthIndicatorResult> {
    try {
      await service.listBuckets();
      return this.getStatus(key, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HealthCheckError(
        'Storage check failed',
        this.getStatus(key, false, { message }),
      );
    }
  }
}
