import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { Message } from '@google-cloud/pubsub';

@Injectable()
export class PubSubListenerExample implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PubSubListenerExample.name);
  private initTimeout: NodeJS.Timeout | null = null;

  constructor(private readonly pubsub: PubSubService) {}

  onModuleInit() {
    // Envolver em um timeout ou try/catch para garantir que não trave o bootstrap
    // Em um template, é melhor ser resiliente a falhas de infra local
    this.initTimeout = setTimeout(() => {
      this.logger.log('Initializing PubSub Listener Example (Delayed)...');
      this.setupListener();
    }, 1000);
  }

  onModuleDestroy() {
    if (this.initTimeout) {
      clearTimeout(this.initTimeout);
    }
  }

  private setupListener() {
    const subscriptionName = 'health-check-subscription';

    try {
      void this.pubsub.listenForMessages(
        subscriptionName,
        (message: Message) => {
          this.handleMessage(message);
        },
      );
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to setup PubSub listener: ${errorMsg}`);
    }
  }

  private handleMessage(message: Message) {
    try {
      const data = JSON.parse(message.data.toString()) as unknown;
      this.logger.log(`Received message content: ${JSON.stringify(data)}`);
      message.ack();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error('Error handling message:', errorMsg);
      message.ack();
    }
  }
}
