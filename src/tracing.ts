import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { ExpressInstrumentation } from '@opentelemetry/instrumentation-express';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PrismaInstrumentation } from '@prisma/instrumentation';
import { Logger } from '@nestjs/common';

const logger = new Logger('OpenTelemetry');

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318';

const traceExporter = new OTLPTraceExporter({
    url: `${otlpEndpoint}/v1/traces`,
});

export const otelSDK = new NodeSDK({
    spanProcessor: new SimpleSpanProcessor(traceExporter),
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
