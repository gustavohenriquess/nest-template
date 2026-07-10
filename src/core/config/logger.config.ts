import { randomUUID } from 'crypto';
import { Params } from 'nestjs-pino';
import { TraceContext } from '../utils/trace-context';

const maskValue = (val: unknown) =>
  typeof val === 'string' ? `****${val.slice(-2)}****` : val;

const redactFields = [
  'password',
  'password_confirmation',
  'token',
  'accessToken',
  'refreshToken',
  'secret',
  'client_secret',
  'email',
];

const redactPaths = redactFields.flatMap((field) => [
  field,
  `*.${field}`,
  `*.*.${field}`,
  `*.*.*.${field}`,
  `*.*.*.*.${field}`,
  `*.*.*.*.*.${field}`,
]);

export const loggerConfig: Params = {
  pinoHttp: {
    genReqId: (req) => req.headers['x-correlation-id'] || randomUUID(),
    mixin: () => ({
      correlationId: TraceContext.getCorrelationId(),
    }),
    serializers: {
      serialized: maskValue,
    },
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        ...redactPaths,
      ],
      censor: '[REDACTED]',
    },
    customSuccessMessage: (req, res, time) =>
      `${req.method} ${req.url} ${res.statusCode} +${time}ms`,
    customErrorMessage: (req, res, err) =>
      `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
    transport: {
      targets: [
        // Dev: Logs formatados e legíveis no terminal
        ...(process.env.NODE_ENV !== 'production'
          ? [
              {
                // require.resolve garante o path absoluto para worker threads
                target: require.resolve('pino-pretty'),
                level: 'debug',
                options: {
                  singleLine: true,
                  messageFormat:
                    '{if correlationId}[{correlationId}] {end}{if context}[{context}] {end}{msg}{if trace}\n{trace}{end}',
                  ignore:
                    'pid,hostname,req,res,responseTime,correlationId,context,trace',
                },
              },
            ]
          : []),
        // Todos os ambientes: Envio dos logs via OTLP para o Collector
        {
          // require.resolve garante o path absoluto para worker threads
          target: require.resolve('pino-opentelemetry-transport'),
          level: 'info',
          options: {
            resourceAttributes: {
              'service.name': process.env.OTEL_SERVICE_NAME || 'nest-template',
              'service.version': process.env.npm_package_version || '0.0.1',
            },
            logRecordProcessorOptions: {
              recordProcessorType: 'batch',
              exporterOptions: {
                protocol: 'http',
                url: `${process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318'}/v1/logs`,
              },
            },
          },
        },
      ],
    },
  },
};
