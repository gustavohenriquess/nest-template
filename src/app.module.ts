import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { HealthModule } from './health/health.module';
import { LoggingMiddleware } from './core/infrastructure/middleware/logging.middleware';

@Module({
  imports: [HealthModule],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
