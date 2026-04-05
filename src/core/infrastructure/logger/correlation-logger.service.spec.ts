import { CorrelationLoggerService } from './correlation-logger.service';
import { TraceContext } from '@/core/utils/trace-context';
import { trace, context } from '@opentelemetry/api';

jest.mock('@opentelemetry/api', () => ({
  trace: {
    getSpanContext: jest.fn(),
  },
  context: {
    active: jest.fn(),
  },
}));

jest.mock('@/core/utils/trace-context', () => ({
  TraceContext: {
    getCorrelationId: jest.fn(),
  },
}));

describe('CorrelationLoggerService', () => {
  let logger: CorrelationLoggerService;

  beforeEach(() => {
    logger = new CorrelationLoggerService();
    jest.clearAllMocks();
  });

  it('should include correlation ID from TraceContext in the log message', () => {
    (TraceContext.getCorrelationId as jest.Mock).mockReturnValue(
      'context-id-123',
    );

    // Using protected method access for testing via cast or by calling a public method that uses it
    // In NestJS ConsoleLogger, we can test by calling 'log' and seeing the output or just test the formatMessage directly
    const formatted = (logger as any).formatMessage(
      'log',
      'test message',
      'pid',
      'LOG',
      'Context',
      'diff',
    );

    expect(formatted).toContain('[context-id-123]');
    expect(formatted).toContain('test message');
  });

  it('should fallback to OTEL traceId if TraceContext is NOT available', () => {
    (TraceContext.getCorrelationId as jest.Mock).mockReturnValue(undefined);
    (trace.getSpanContext as jest.Mock).mockReturnValue({
      traceId: 'otel-id-456',
    });

    const formatted = (logger as any).formatMessage(
      'log',
      'test message',
      'pid',
      'LOG',
      'Context',
      'diff',
    );

    expect(formatted).toContain('[otel-id-456]');
    expect(formatted).toContain('test message');
  });

  it('should not include prefix if no ID is available', () => {
    (TraceContext.getCorrelationId as jest.Mock).mockReturnValue(undefined);
    (trace.getSpanContext as jest.Mock).mockReturnValue(undefined);

    const formatted = (logger as any).formatMessage(
      'log',
      'test message',
      'pid',
      'LOG',
      'Context',
      'diff',
    );

    // Should not start with a bracketed ID, but can contain brackets later (e.g. [Nest])
    expect(formatted.startsWith('[')).toBe(false);
    expect(formatted).toContain('test message');
  });
});
