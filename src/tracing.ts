/* istanbul ignore file */
import { Context } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  SimpleSpanProcessor,
  SpanProcessor,
  ReadableSpan,
  Span,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import { HostMetrics } from '@opentelemetry/host-metrics';
import { TraceContext } from './core/utils/trace-context';

/**
 * Manual implementation of a MultiSpanProcessor since it's not exported publicly in some versions.
 */
class MultiSpanProcessor implements SpanProcessor {
  constructor(private processors: SpanProcessor[]) {}
  onStart(span: Span, parentContext: Context): void {
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
  onStart(span: Span): void {
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

const metricExporter = new OTLPMetricExporter({
  url: `${otlpEndpoint}/v1/metrics`,
});

const metricReader = new PeriodicExportingMetricReader({
  exporter: metricExporter,
  exportIntervalMillis: 10000, // Export metrics every 10 seconds
});

export const otelSDK = new NodeSDK({
  // Using singular spanProcessor with MultiSpanProcessor for maximum compatibility
  spanProcessor: new MultiSpanProcessor([
    new SimpleSpanProcessor(traceExporter),
    new BaggageSpanProcessor(),
  ]),
  metricReader,
  instrumentations: [
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
    new NestInstrumentation(),
    new PrismaInstrumentation(),
  ],
});

// Start collecting CPU, Memory, Network, and Disk usage
export const startHostMetrics = () => {
  const hostMetrics = new HostMetrics({
    name: 'nest-template-host-metrics',
  });
  hostMetrics.start();
};
