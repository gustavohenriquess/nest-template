import { Injectable, OnApplicationShutdown, Logger } from '@nestjs/common';
import { otelSDK } from '../../tracing';

@Injectable()
export class LifecycleService implements OnApplicationShutdown {
  private readonly logger = new Logger(LifecycleService.name);

  async onApplicationShutdown(signal?: string) {
    if (signal) {
      this.logger.log(`Received signal: ${signal}. Shutting down services...`);
    }

    try {
      this.logger.log('Shutting down OpenTelemetry SDK...');
      await otelSDK.shutdown();
      this.logger.log('OpenTelemetry SDK shut down successfully');
    } catch (error) {
      this.logger.error('Error shutting down OpenTelemetry SDK', error);
    }
  }
}
