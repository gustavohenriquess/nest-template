import { otelSDK, startHostMetrics } from './tracing';
import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import { AppModule } from './app.module';

async function bootstrap() {
  // Start the OpenTelemetry SDK
  otelSDK.start();
  startHostMetrics();

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  const logger = app.get(Logger);
  // Register global error handlers using the injected logger
  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { promise, reason });
  });

  process.on('uncaughtException', (err, origin) => {
    logger.error('Caught exception', { err, origin });
  });

  // Use the injected logger for NestJS logging
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const allowedOriginsStr = configService.get<string>('ALLOWED_ORIGINS') || '*';
  const allowedOrigins =
    allowedOriginsStr === '*'
      ? '*'
      : allowedOriginsStr.split(',').map((o) => o.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: allowedOrigins !== '*',
  });

  app.setGlobalPrefix('api');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());
  app.enableShutdownHooks();

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
