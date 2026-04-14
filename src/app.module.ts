import { randomUUID } from 'crypto';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { validate } from './core/config/env.schema';
import { HealthModule } from './health/health.module';
import { TraceContext } from './core/utils/trace-context';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { CorrelationIdMiddleware } from './core/infrastructure/middleware/correlation-id.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate,
      isGlobal: true,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('THROTTLE_TTL') ?? 60000,
          limit: config.get<number>('THROTTLE_LIMIT') ?? 100,
        },
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) => req.headers['x-correlation-id'] || randomUUID(),
        mixin: () => ({
          correlationId: TraceContext.getCorrelationId(),
        }),
        customSuccessMessage: (req, res, time) =>
          `${req.method} ${req.url} ${res.statusCode} +${time}ms`,
        customErrorMessage: (req, res, err) =>
          `${req.method} ${req.url} ${res.statusCode} - ${err.message}`,
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  singleLine: true,
                  messageFormat:
                    '{if correlationId}[{correlationId}] {end}{if context}[{context}] {end}{msg}{if trace}\n{trace}{end}',
                  ignore:
                    'pid,hostname,req,res,responseTime,correlationId,context,trace',
                },
              }
            : undefined,
      },
    }),
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
