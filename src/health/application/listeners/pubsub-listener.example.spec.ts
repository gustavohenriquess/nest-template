import { Test, TestingModule } from '@nestjs/testing';
import { PubSubListenerExample } from './pubsub-listener.example';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';

describe('PubSubListenerExample', () => {
  let service: PubSubListenerExample;
  let pubsubService: jest.Mocked<PubSubService>;

  beforeEach(async () => {
    jest.useFakeTimers();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PubSubListenerExample,
        {
          provide: PubSubService,
          useValue: {
            listenForMessages: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PubSubListenerExample>(PubSubListenerExample);
    pubsubService = module.get(PubSubService);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should setup listener on module init (delayed)', () => {
    service.onModuleInit();

    // At this point it shouldn't have been called yet
    expect(pubsubService.listenForMessages.mock.calls.length).toBe(0);

    // Advance timers
    jest.advanceTimersByTime(1100);

    expect(pubsubService.listenForMessages.mock.calls.length).toBe(1);
    expect(pubsubService.listenForMessages.mock.calls[0][0]).toBe(
      'health-check-subscription',
    );
    expect(pubsubService.listenForMessages.mock.calls[0][1]).toBeInstanceOf(
      Function,
    );
  });

  it('should handle incoming message correctly', () => {
    service.onModuleInit();
    jest.advanceTimersByTime(1100);

    const handler = pubsubService.listenForMessages.mock.calls[0][1];

    const mockData = { test: 'data' };
    const mockMessage = {
      data: Buffer.from(JSON.stringify(mockData)),
      ack: jest.fn(),
    };

    handler(mockMessage);

    expect(mockMessage.ack).toHaveBeenCalled();
  });

  it('should handle malformed message gracefully', () => {
    service.onModuleInit();
    jest.advanceTimersByTime(1100);

    const handler = pubsubService.listenForMessages.mock.calls[0][1];

    const mockMessage = {
      data: Buffer.from('invalid-json'),
      ack: jest.fn(),
    };

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    handler(mockMessage);

    expect(mockMessage.ack).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
