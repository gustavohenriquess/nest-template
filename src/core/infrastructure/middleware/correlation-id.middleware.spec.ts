import { CorrelationIdMiddleware } from './correlation-id.middleware';
import { Request, Response, NextFunction } from 'express';
import { trace, context } from '@opentelemetry/api';
import { TraceContext } from '@/core/utils/trace-context';

jest.mock('@opentelemetry/api', () => ({
  trace: {
    getSpanContext: jest.fn(),
    getSpan: jest.fn(),
  },
  context: {
    active: jest.fn(),
  },
}));

jest.mock('@/core/utils/trace-context', () => ({
  TraceContext: {
    run: jest.fn((id, next) => next()),
  },
}));

describe('CorrelationIdMiddleware', () => {
  let middleware: CorrelationIdMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new CorrelationIdMiddleware();
    req = { headers: {} };
    res = { setHeader: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should use traceId from OTEL span context if available', () => {
    (trace.getSpanContext as jest.Mock).mockReturnValue({
      traceId: 'otel-trace-id',
    });

    middleware.use(req as Request, res as Response, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'x-correlation-id',
      'otel-trace-id',
    );
    expect(TraceContext.run).toHaveBeenCalledWith(
      'otel-trace-id',
      expect.any(Function),
    );
  });

  it('should prefer x-correlation-id from request headers', () => {
    (trace.getSpanContext as jest.Mock).mockReturnValue({
      traceId: 'otel-trace-id',
    });
    req.headers = { 'x-correlation-id': 'custom-correlation-id' };

    middleware.use(req as Request, res as Response, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'x-correlation-id',
      'custom-correlation-id',
    );
    expect(TraceContext.run).toHaveBeenCalledWith(
      'custom-correlation-id',
      expect.any(Function),
    );
  });

  it('should set correlation.id attribute on active span', () => {
    const mockSpan = { setAttribute: jest.fn() };
    (trace.getSpanContext as jest.Mock).mockReturnValue({ traceId: 'otel-id' });
    (trace.getSpan as jest.Mock).mockReturnValue(mockSpan);

    middleware.use(req as Request, res as Response, next);

    expect(mockSpan.setAttribute).toHaveBeenCalledWith(
      'correlation.id',
      'otel-id',
    );
  });

  it('should fallback to "no-trace-id" if no ID is found', () => {
    (trace.getSpanContext as jest.Mock).mockReturnValue(undefined);

    middleware.use(req as Request, res as Response, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'x-correlation-id',
      'no-trace-id',
    );
  });
});
