import { otelSDK } from './tracing';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import { CorrelationLoggerService } from './core/infrastructure/logger/correlation-logger.service';
import { AppModule } from './app.module';

async function bootstrap() {
  // Start the OpenTelemetry SDK
  otelSDK.start();

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (err, origin) => {
    console.error(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
  });

  const app = await NestFactory.create(AppModule, {
    logger: new CorrelationLoggerService(),
  });

  const configService = app.get(ConfigService);
  const allowedOriginsStr = configService.get<string>('ALLOWED_ORIGINS') || '*';
  const allowedOrigins =
    allowedOriginsStr === '*'
      ? '*'
      : allowedOriginsStr.split(',').map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('NestJS Enterprise Template')
    .setDescription(
      'API documentation for the enterprise-ready NestJS template.',
    )
    .setVersion('1.0')
    .addTag('Health', 'System health and integration monitoring')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
