import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { trace, context } from '@opentelemetry/api';
import { TraceContext } from '@/core/utils/trace-context';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const spanContext = trace.getSpanContext(context.active());
    const otelId = spanContext?.traceId;
    
    // Accept external correlation ID or fallback to OTEL trace ID
    const correlationId = (req.headers['x-correlation-id'] as string) || otelId || 'no-trace-id';

    res.setHeader('x-correlation-id', correlationId);

    // Sync with OpenTelemetry Span
    const span = trace.getSpan(context.active());
    if (span) {
      span.setAttribute('correlation.id', correlationId);
    }

    // Run the rest of the request within the trace context (ALS Bridge)
    TraceContext.run(correlationId, () => {
      next();
    });
  }
}
