import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';

@Injectable()
export class PubSubHealthIndicator extends HealthIndicator {
  /**
   * Verifies connectivity to PubSub by attempting to publish a message
   * to a health-check topic.
   */
  async isHealthy(
    key: string,
    service: PubSubService,
  ): Promise<HealthIndicatorResult> {
    try {
      await service.publishMessage('health-check-topic', {
        ping: true,
      });
      return this.getStatus(key, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new HealthCheckError(
        'PubSub check failed',
        this.getStatus(key, false, { message }),
      );
    }
  }
}
