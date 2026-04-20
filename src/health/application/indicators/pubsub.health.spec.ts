import { Test, TestingModule } from '@nestjs/testing';
import { PubSubHealthIndicator } from './pubsub.health';
import { HealthCheckError } from '@nestjs/terminus';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';

describe('PubSubHealthIndicator', () => {
  let indicator: PubSubHealthIndicator;
  let pubSubMock: jest.Mocked<PubSubService>;

  beforeEach(async () => {
    pubSubMock = {
      publishMessage: jest.fn(),
    } as unknown as jest.Mocked<PubSubService>;
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PubSubHealthIndicator,
        { provide: PubSubService, useValue: pubSubMock },
      ],
    }).compile();

    indicator = module.get<PubSubHealthIndicator>(PubSubHealthIndicator);
  });

  it('should return healthy if publish succeeds', async () => {
    pubSubMock.publishMessage.mockResolvedValue('msg-123');
    const result = await indicator.isHealthy('pubsub', pubSubMock);
    expect(result).toEqual({ pubsub: { status: 'up' } });
  });

  it('should throw HealthCheckError if publish fails', async () => {
    pubSubMock.publishMessage.mockRejectedValue(new Error('Auth failed'));
    await expect(indicator.isHealthy('pubsub', pubSubMock)).rejects.toThrow(
      HealthCheckError,
    );
  });

  it('should handle non-error rejections', async () => {
    pubSubMock.publishMessage.mockRejectedValue('String error');
    await expect(indicator.isHealthy('pubsub', pubSubMock)).rejects.toThrow(
      HealthCheckError,
    );
  });
});
