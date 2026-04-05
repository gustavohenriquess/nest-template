import { Logger } from '@nestjs/common';
import { PubSub, Topic, Message } from '@google-cloud/pubsub';

export class PubSubService {
  private pubsub: PubSub;
  private readonly logger = new Logger(PubSubService.name);

  constructor(projectId: string) {
    this.pubsub = new PubSub({ projectId });
    this.logger.log(`PubSubService initialized for project: ${projectId}`);
  }

  async publishMessage(topicName: string, data: unknown): Promise<string> {
    try {
      const dataBuffer = Buffer.from(JSON.stringify(data));
      const messageId = await this.pubsub
        .topic(topicName)
        .publishMessage({ data: dataBuffer });
      this.logger.log(`Message ${messageId} published to topic ${topicName}`);
      return messageId;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error publishing message to ${topicName}:`, message);
      throw error;
    }
  }

  async createTopic(topicName: string): Promise<Topic> {
    try {
      const [topic] = await this.pubsub.createTopic(topicName);
      this.logger.log(`Topic ${topic.name} created.`);
      return topic;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error creating topic ${topicName}:`, message);
      throw error;
    }
  }

  async listenForMessages(
    subscriptionName: string,
    messageHandler: (message: Message) => void,
  ) {
    try {
      const subscription = await Promise.resolve(
        this.pubsub.subscription(subscriptionName),
      );

      subscription.on('message', (message: Message) => {
        this.logger.log(`Received message ${message.id}:`);
        messageHandler(message);
      });

      subscription.on('error', (error) => {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.error(
          `Received error from subscription ${subscriptionName}:`,
          message,
        );
      });

      this.logger.log(
        `Listening for messages on subscription: ${subscriptionName}`,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `Failed to initialize listener for ${subscriptionName}:`,
        message,
      );
    }
  }
}
