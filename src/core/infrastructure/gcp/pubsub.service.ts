import { Logger } from '@nestjs/common';
import { PubSub, Topic, Message } from '@google-cloud/pubsub';

export class PubSubService {
    private pubsub: PubSub;
    private readonly logger = new Logger(PubSubService.name);

    constructor(projectId: string) {
        this.pubsub = new PubSub({ projectId });
        this.logger.log(`PubSubService initialized for project: ${projectId}`);
    }

    async publishMessage(topicName: string, data: any): Promise<string> {
        try {
            const dataBuffer = Buffer.from(JSON.stringify(data));
            const messageId = await this.pubsub.topic(topicName).publishMessage({ data: dataBuffer });
            this.logger.log(`Message ${messageId} published to topic ${topicName}`);
            return messageId;
        } catch (error) {
            this.logger.error(`Error publishing message to ${topicName}:`, error);
            throw error;
        }
    }

    async createTopic(topicName: string): Promise<Topic> {
        try {
            const [topic] = await this.pubsub.createTopic(topicName);
            this.logger.log(`Topic ${topic.name} created.`);
            return topic;
        } catch (error) {
            this.logger.error(`Error creating topic ${topicName}:`, error);
            throw error;
        }
    }

    async listenForMessages(subscriptionName: string, messageHandler: (message: Message) => void) {
        const subscription = this.pubsub.subscription(subscriptionName);

        subscription.on('message', (message: Message) => {
            this.logger.log(`Received message ${message.id}:`);
            messageHandler(message);
        });

        subscription.on('error', (error) => {
            this.logger.error(`Received error from subscription ${subscriptionName}:`, error);
        });
    }
}
