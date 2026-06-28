import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { validate } from './core/config/env.schema';
import { HealthModule } from './health/health.module';
import { AuthModule } from './core/auth/auth.module';
import { TransformInterceptor } from './core/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';
import { CorrelationIdMiddleware } from './core/infrastructure/middleware/correlation-id.middleware';
import { ContextMiddleware } from './core/infrastructure/context/context.middleware';
import { loggerConfig } from './core/config/logger.config';
import { LifecycleService } from './core/infrastructure/lifecycle.service';
import { ZodValidationPipe } from './core/pipes/zod-validation.pipe';
import { CacheModule } from './core/cache/cache.module';
import { CacheInterceptor } from './core/cache/interceptors/cache.interceptor';
import { CustomThrottlerGuard } from './core/auth/guards/custom-throttler.guard';

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
          name: 'global',
          ttl: config.get<number>('THROTTLE_TTL') ?? 60000,
          limit: config.get<number>('THROTTLE_LIMIT') ?? 10,
        },
        {
          name: 'authenticated',
          ttl: config.get<number>('THROTTLE_TTL') ?? 60000,
          limit: config.get<number>('THROTTLE_LIMIT_AUTHENTICATED') ?? 500,
        },
      ],
    }),
    LoggerModule.forRoot(loggerConfig),
    AuthModule,
    CacheModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
    LifecycleService,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ContextMiddleware, CorrelationIdMiddleware).forRoutes('*');
  }
}
