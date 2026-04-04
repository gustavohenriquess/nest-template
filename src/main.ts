import { otelSDK } from './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // Start the OpenTelemetry SDK
  await otelSDK.start();

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (err, origin) => {
    console.error(`Caught exception: ${err}\n` + `Exception origin: ${origin}`);
  });

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
