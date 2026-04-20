import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';

@Injectable()
export class BigQueryHealthIndicator extends HealthIndicator {
  /**
   * Verifies connectivity to BigQuery by running a simple query.
   */
  async isHealthy(
    key: string,
    service: BigQueryService,
  ): Promise<HealthIndicatorResult> {
    try {
      await service.query('SELECT 1');
      return this.getStatus(key, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HealthCheckError(
        'BigQuery check failed',
        this.getStatus(key, false, { message }),
      );
    }
  }
}
