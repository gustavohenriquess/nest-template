import { ConsoleLogger, Injectable, LogLevel } from '@nestjs/common';
import { trace, context } from '@opentelemetry/api';
import { TraceContext } from '@/core/utils/trace-context';

@Injectable()
export class CorrelationLoggerService extends ConsoleLogger {
  protected formatMessage(
    logLevel: LogLevel,
    message: unknown,
    pidMessage: string,
    formattedLogLevel: string,
    contextName: string,
    timestampDiff: string,
  ): string {
    const spanContext = trace.getSpanContext(context.active());
    const otelId = spanContext?.traceId;
    
    // Prioritize Context Storage or fallback to OTEL
    const traceId = TraceContext.getCorrelationId() || otelId;

    const correlationPrefix = traceId ? `[${traceId}] ` : '';
    const originalMessage = super.formatMessage(
      logLevel,
      message,
      pidMessage,
      formattedLogLevel,
      contextName,
      timestampDiff,
    );

    return `${correlationPrefix}${originalMessage}`;
  }
}
