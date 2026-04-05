/* istanbul ignore file */
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SimpleSpanProcessor,
  SpanProcessor,
  ReadableSpan,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Logger } from '@nestjs/common';
import { TraceContext } from './core/utils/trace-context';

const logger = new Logger('OpenTelemetry');

/**
 * Manual implementation of a MultiSpanProcessor since it's not exported publicly in some versions.
 */
class MultiSpanProcessor implements SpanProcessor {
  constructor(private processors: SpanProcessor[]) {}
  onStart(span: any, parentContext: any): void {
    this.processors.forEach((p) => p.onStart(span, parentContext));
  }
  onEnd(span: ReadableSpan): void {
    this.processors.forEach((p) => p.onEnd(span));
  }
  async shutdown(): Promise<void> {
    await Promise.all(this.processors.map((p) => p.shutdown()));
  }
  async forceFlush(): Promise<void> {
    await Promise.all(this.processors.map((p) => p.forceFlush()));
  }
}

/**
 * Custom SpanProcessor to automatically inject Correlation IDs from the TraceContext.
 * This bridges the gap between logs and traces using AsyncLocalStorage (TraceContext).
 */
class BaggageSpanProcessor implements SpanProcessor {
  onStart(span: any): void {
    const correlationId = TraceContext.getCorrelationId();
    if (correlationId) {
      span.setAttribute('correlation.id', correlationId);
    }
  }
  onEnd(): void {}
  async shutdown(): Promise<void> {}
  async forceFlush(): Promise<void> {}
}

const otlpEndpoint =
  process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

const traceExporter = new OTLPTraceExporter({
  url: `${otlpEndpoint}/v1/traces`,
});

export const otelSDK = new NodeSDK({
  // Using singular spanProcessor with MultiSpanProcessor for maximum compatibility
  spanProcessor: new MultiSpanProcessor([
    new SimpleSpanProcessor(traceExporter),
    new BaggageSpanProcessor(),
  ]),
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
    new PrismaInstrumentation(),
  ],
});

// Graceful shutdown
process.on('SIGTERM', () => {
  otelSDK
    .shutdown()
    .then(
      () => logger.log('SDK shut down successfully'),
      (err) => logger.error('Error shutting down SDK', err),
    )
    .finally(() => process.exit(0));
});
