import { PubSubService } from './pubsub.service';

jest.mock('@google-cloud/pubsub', () => {
  return {
    PubSub: jest.fn().mockImplementation(() => ({
      topic: jest.fn().mockReturnValue({
        publishMessage: jest.fn(),
      }),
      createTopic: jest.fn(),
      subscription: jest.fn().mockReturnValue({
        on: jest.fn(),
      }),
    })),
  };
});

describe('PubSubService', () => {
  let service: PubSubService;
  let pubsubMock: {
    topic: jest.Mock;
    createTopic: jest.Mock;
    subscription: jest.Mock;
  };
  const projectId = 'test-project';

  beforeEach(() => {
    service = new PubSubService(projectId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    pubsubMock = (service as any).pubsub as {
      topic: jest.Mock;
      createTopic: jest.Mock;
      subscription: jest.Mock;
    };
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('publishMessage', () => {
    it('should publish a message and return messageId', async () => {
      const topicName = 'test-topic';
      const data = { foo: 'bar' };
      const messageId = 'msg-123';
      const topicMock = {
        publishMessage: jest.fn().mockResolvedValue(messageId),
      };
      pubsubMock.topic.mockReturnValue(topicMock);

      const result = await service.publishMessage(topicName, data);

      expect(result).toBe(messageId);
      expect(pubsubMock.topic).toHaveBeenCalledWith(topicName);
      expect(topicMock.publishMessage).toHaveBeenCalledWith({
        data: Buffer.from(JSON.stringify(data)),
      });
    });

    it('should throw error if publishing fails', async () => {
      const topicName = 'test-topic';
      const error = new Error('Publish failed');
      const topicMock = { publishMessage: jest.fn().mockRejectedValue(error) };
      pubsubMock.topic.mockReturnValue(topicMock);

      await expect(service.publishMessage(topicName, {})).rejects.toThrow(
        error,
      );
    });

    it('should throw handled string error if publishing fails', async () => {
      const topicName = 'test-topic';
      const topicMock = {
        publishMessage: jest.fn().mockRejectedValue('String error'),
      };
      pubsubMock.topic.mockReturnValue(topicMock);

      await expect(service.publishMessage(topicName, {})).rejects.toBe(
        'String error',
      );
    });
  });

  describe('createTopic', () => {
    it('should create a topic', async () => {
      const topicName = 'test-topic';
      const topicMock = { name: topicName };
      pubsubMock.createTopic.mockResolvedValue([topicMock]);

      const result = await service.createTopic(topicName);

      expect(result).toBe(topicMock);
      expect(pubsubMock.createTopic).toHaveBeenCalledWith(topicName);
    });

    it('should throw error if creation fails', async () => {
      const topicName = 'test-topic';
      const error = new Error('Creation failed');
      pubsubMock.createTopic.mockRejectedValue(error);

      await expect(service.createTopic(topicName)).rejects.toThrow(error);
    });

    it('should throw handled string error if creation fails', async () => {
      const topicName = 'test-topic';
      pubsubMock.createTopic.mockRejectedValue('String error');

      await expect(service.createTopic(topicName)).rejects.toBe('String error');
    });
  });

  describe('listenForMessages', () => {
    it('should set up listeners for messages', async () => {
      const subscriptionName = 'test-sub';
      const handler = jest.fn();
      const subscriptionMock = {
        on: jest.fn(),
      };
      pubsubMock.subscription.mockReturnValue(subscriptionMock);

      await service.listenForMessages(subscriptionName, handler);

      expect(pubsubMock.subscription).toHaveBeenCalledWith(subscriptionName);
      expect(subscriptionMock.on).toHaveBeenCalledWith(
        'message',
        expect.any(Function),
      );
      expect(subscriptionMock.on).toHaveBeenCalledWith(
        'error',
        expect.any(Function),
      );

      // Simulate message
      const messageHandler = (
        subscriptionMock.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'message',
        ) as [string, (msg: unknown) => void]
      )[1];
      const message = { id: 'msg-1', ack: jest.fn() };
      messageHandler(message);
      expect(handler).toHaveBeenCalledWith(message);

      // Simulate error
      const errorHandler = (
        subscriptionMock.on.mock.calls.find(
          (call: unknown[]) => call[0] === 'error',
        ) as [string, (err: unknown) => void]
      )[1];
      errorHandler(new Error('error'));
      errorHandler('string error');
    });

    it('should handle error if setup fails', async () => {
      const subscriptionName = 'test-sub';
      const error = new Error('Setup failed');
      pubsubMock.subscription.mockImplementation(() => {
        throw error;
      });

      await service.listenForMessages(subscriptionName, jest.fn());

      expect(pubsubMock.subscription).toHaveBeenCalledWith(subscriptionName);
    });

    it('should handle string error if setup fails', async () => {
      const subscriptionName = 'test-sub';
      pubsubMock.subscription.mockImplementation(() => {
        // eslint-disable-next-line @typescript-eslint/only-throw-error
        throw 'String error setup failed';
      });

      await service.listenForMessages(subscriptionName, jest.fn());

      expect(pubsubMock.subscription).toHaveBeenCalledWith(subscriptionName);
    });
  });
});
