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
        this.logger.log('Initializing PubSub Listener Example...');
        this.setupListener();
    }

    private setupListener() {
        const subscriptionName = 'health-check-subscription';

        this.pubsub.listenForMessages(subscriptionName, (message: Message) => {
            this.handleMessage(message);
        });
    }

    private handleMessage(message: Message) {
        try {
            const data = JSON.parse(message.data.toString());
            this.logger.log(`Received message content: ${JSON.stringify(data)}`);
            message.ack();
        } catch (error) {
            this.logger.error('Error handling message:', error.message);
            // In a real scenario, you might want to nack or handle differently
            message.ack();
        }
    }
}
