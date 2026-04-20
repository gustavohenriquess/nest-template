import { Test, TestingModule } from '@nestjs/testing';
import { LifecycleService } from './lifecycle.service';
import { otelSDK } from '../../tracing';
import { Logger } from '@nestjs/common';

jest.mock('../../tracing', () => ({
  otelSDK: {
    shutdown: jest.fn(),
  },
}));

describe('LifecycleService', () => {
  let service: LifecycleService;
  let loggerLogSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LifecycleService],
    }).compile();

    service = module.get<LifecycleService>(LifecycleService);

    // Mock logger to avoid flooding console during tests
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onApplicationShutdown', () => {
    it('should shutdown otelSDK successfully', async () => {
      (otelSDK.shutdown as jest.Mock).mockResolvedValue(undefined);

      await service.onApplicationShutdown('SIGTERM');

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(otelSDK.shutdown).toHaveBeenCalled();
      expect(loggerLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Received signal: SIGTERM'),
      );
      expect(loggerLogSpy).toHaveBeenCalledWith(
        'OpenTelemetry SDK shut down successfully',
      );
    });

    it('should log error when otelSDK shutdown fails', async () => {
      const error = new Error('Shutdown failed');
      (otelSDK.shutdown as jest.Mock).mockRejectedValue(error);

      await service.onApplicationShutdown();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(otelSDK.shutdown).toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        'Error shutting down OpenTelemetry SDK',
        error,
      );
    });

    it('should skip signal logging if not provided', async () => {
      (otelSDK.shutdown as jest.Mock).mockResolvedValue(undefined);

      await service.onApplicationShutdown();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(otelSDK.shutdown).toHaveBeenCalled();
      expect(loggerLogSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('Received signal'),
      );
    });
  });
});
