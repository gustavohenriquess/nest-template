/* istanbul ignore file */
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { Message } from '@google-cloud/pubsub';

@Injectable()
export class PubSubListenerExample implements OnModuleInit {
    private readonly logger = new Logger(PubSubListenerExample.name);

    constructor(
        private readonly pubsub: PubSubService,
    ) { }

    onModuleInit() {
        // Envolver em um timeout ou try/catch para garantir que não trave o bootstrap
        // Em um template, é melhor ser resiliente a falhas de infra local
        setTimeout(() => {
            this.logger.log('Initializing PubSub Listener Example (Delayed)...');
            this.setupListener();
        }, 1000);
    }

    private setupListener() {
        const subscriptionName = 'health-check-subscription';

        try {
            this.pubsub.listenForMessages(subscriptionName, (message: Message) => {
                this.handleMessage(message);
            });
        } catch (error) {
            this.logger.error(`Failed to setup PubSub listener: ${error.message}`);
        }
    }

    private handleMessage(message: Message) {
        try {
            const data = JSON.parse(message.data.toString());
            this.logger.log(`Received message content: ${JSON.stringify(data)}`);
            message.ack();
        } catch (error) {
            this.logger.error('Error handling message:', error.message);
            message.ack();
        }
    }
}
