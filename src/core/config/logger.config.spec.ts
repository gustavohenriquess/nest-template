import { Params } from 'nestjs-pino';
import { loggerConfig } from './logger.config';
import { TraceContext } from '../utils/trace-context';

interface PinoTransportTarget {
  target: string;
  level?: string;
  options?: {
    resourceAttributes: Record<string, string>;
    logRecordProcessorOptions: {
      recordProcessorType: string;
      exporterOptions: {
        protocol: string;
        url: string;
      };
    };
  };
}

interface PinoTransportOptions {
  targets: PinoTransportTarget[];
}

interface PinoHttpOptions {
  genReqId?: (req: any) => string;
  mixin?: (req: any, res: any) => Record<string, any>;
  customSuccessMessage?: (req: any, res: any, time: number) => string;
  customErrorMessage?: (req: any, res: any, err: Error) => string;
  transport?: PinoTransportOptions;
  serializers?: Record<string, (val: any) => any>;
  redact?: {
    paths: string[];
    censor: string;
  };
}

jest.mock('../utils/trace-context');

describe('loggerConfig', () => {
  const mockReq = {
    method: 'GET',
    url: '/test',
    headers: {},
  };

  const mockRes = {
    statusCode: 200,
  };

  describe('pinoHttp options', () => {
    // Cast to local interface for type safety in tests
    const pinoHttp = loggerConfig.pinoHttp as PinoHttpOptions;

    describe('redact', () => {
      it('should be configured with sensitive paths and [REDACTED] censor', () => {
        expect(pinoHttp.redact).toBeDefined();
        expect(pinoHttp.redact?.censor).toBe('[REDACTED]');
        expect(pinoHttp.redact?.paths).toEqual(
          expect.arrayContaining([
            'req.headers.authorization',
            'req.headers.cookie',
            'password',
            'password_confirmation',
            'token',
            'accessToken',
            'refreshToken',
            'secret',
            'client_secret',
          ]),
        );
      });
    });

    describe('serializers', () => {
      it('should partially mask values using maskValue logic', () => {
        const mask = pinoHttp.serializers?.serialized;
        expect(mask).toBeDefined();
        expect(mask!('123456')).toBe('****56****');
        expect(mask!(123)).toBe(123);
      });
    });

    describe('genReqId', () => {
      it('should return x-correlation-id from headers if present', () => {
        const req = {
          headers: { 'x-correlation-id': 'existing-id' },
        };
        if (!pinoHttp.genReqId) {
          throw new Error('genReqId not found');
        }
        expect(pinoHttp.genReqId(req)).toBe('existing-id');
      });

      it('should generate a new randomUUID if x-correlation-id is missing', () => {
        const req = { headers: {} };

        const id = pinoHttp.genReqId!(req as any);
        expect(id).toBeDefined();
        expect(typeof id).toBe('string');
        // Validate it's a UUID (basic check)
        expect(id.split('-').length).toBe(5);
      });
    });

    describe('mixin', () => {
      it('should return correlationId from TraceContext', () => {
        (TraceContext.getCorrelationId as jest.Mock).mockReturnValue('mock-id');
        const result = pinoHttp.mixin!(undefined as any, undefined as any);
        expect(result).toEqual({ correlationId: 'mock-id' });
        // eslint-disable-next-line @typescript-eslint/unbound-method
        expect(TraceContext.getCorrelationId).toHaveBeenCalled();
      });
    });

    describe('customSuccessMessage', () => {
      it('should return a formatted string with method, url, status and time', () => {
        const time = 100;
        const message = pinoHttp.customSuccessMessage!(
          mockReq as any,
          mockRes as any,
          time,
        );
        expect(message).toBe('GET /test 200 +100ms');
      });
    });

    describe('customErrorMessage', () => {
      it('should return a formatted string with method, url, status and error message', () => {
        const error = new Error('Something went wrong');
        const message = pinoHttp.customErrorMessage!(
          mockReq as any,
          mockRes as any,
          error,
        );
        expect(message).toBe('GET /test 200 - Something went wrong');
      });
    });

    describe('transport targets', () => {
      const originalEnv = process.env.NODE_ENV;

      afterEach(() => {
        process.env.NODE_ENV = originalEnv;
        jest.resetModules();
      });

      it('should include pino-pretty when NODE_ENV is not production', () => {
        process.env.NODE_ENV = 'development';
        // Re-import the config to re-evaluate the NODE_ENV branch
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { loggerConfig: devConfig } = require('./logger.config') as {
          loggerConfig: Params;
        };
        const targets = (devConfig.pinoHttp as PinoHttpOptions).transport!
          .targets;
        const prettyTarget = targets.find((t) =>
          t.target.includes('pino-pretty'),
        );
        expect(prettyTarget).toBeDefined();
      });

      it('should NOT include pino-pretty when NODE_ENV is production', () => {
        process.env.NODE_ENV = 'production';
        // Re-import the config
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { loggerConfig: prodConfig } = require('./logger.config') as {
          loggerConfig: Params;
        };
        const targets = (prodConfig.pinoHttp as PinoHttpOptions).transport!
          .targets;
        const prettyTarget = targets.find((t) =>
          t.target.includes('pino-pretty'),
        );
        expect(prettyTarget).toBeUndefined();
      });

      it('should always include the otlp-http transport', () => {
        const targets = (
          (loggerConfig.pinoHttp as PinoHttpOptions)
            .transport as PinoTransportOptions
        ).targets;
        const otlpTarget = targets.find((t) =>
          t.target.includes('pino-opentelemetry-transport'),
        );
        if (!otlpTarget) {
          throw new Error('OTLP transport not found');
        }
        expect(otlpTarget).toBeDefined();
        expect(otlpTarget.level).toBe('info');
      });

      describe('OTLP transport options branches', () => {
        const originalEnv = { ...process.env };

        beforeEach(() => {
          jest.resetModules();
        });

        afterEach(() => {
          process.env = { ...originalEnv };
        });

        it('should use default values when environment variables are missing', () => {
          delete process.env.OTEL_SERVICE_NAME;
          delete process.env.npm_package_version;
          delete process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { loggerConfig: config } = require('./logger.config') as {
            loggerConfig: Params;
          };
          const transport = (config.pinoHttp as PinoHttpOptions)
            .transport as PinoTransportOptions;
          const otlpTarget = transport.targets.find((t) =>
            t.target.includes('pino-opentelemetry-transport'),
          );

          expect(otlpTarget?.options?.resourceAttributes['service.name']).toBe(
            'nest-template',
          );
          expect(
            otlpTarget?.options?.resourceAttributes['service.version'],
          ).toBe('0.0.1');
          expect(
            otlpTarget?.options?.logRecordProcessorOptions.exporterOptions.url,
          ).toBe('http://localhost:4318/v1/logs');
        });

        it('should use environment variables when provided', () => {
          process.env.OTEL_SERVICE_NAME = 'custom-service';
          process.env.npm_package_version = '1.2.3';
          process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://custom-otel:4318';

          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { loggerConfig: config } = require('./logger.config') as {
            loggerConfig: Params;
          };
          const transport = (config.pinoHttp as PinoHttpOptions)
            .transport as PinoTransportOptions;
          const otlpTarget = transport.targets.find((t) =>
            t.target.includes('pino-opentelemetry-transport'),
          );

          expect(otlpTarget?.options?.resourceAttributes['service.name']).toBe(
            'custom-service',
          );
          expect(
            otlpTarget?.options?.resourceAttributes['service.version'],
          ).toBe('1.2.3');
          expect(
            otlpTarget?.options?.logRecordProcessorOptions.exporterOptions.url,
          ).toBe('http://custom-otel:4318/v1/logs');
        });
      });
    });
  });
});
