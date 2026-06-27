import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import { AppModule } from '@/app.module';
import { BigQueryService } from '@/core/infrastructure/gcp/bigquery.service';
import { PubSubService } from '@/core/infrastructure/gcp/pubsub.service';
import { StorageService } from '@/core/infrastructure/gcp/storage.service';

export class E2EHelper {
  private app: INestApplication;

  async bootstrap() {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      // Overriding GCP services with mocks to avoid real connections in E2E
      .overrideProvider(MemoryHealthIndicator)
      .useValue({
        checkHeap: jest
          .fn()
          .mockResolvedValue({ memory_heap: { status: 'up' } }),
        checkRSS: jest.fn().mockResolvedValue({ memory_rss: { status: 'up' } }),
      })
      .overrideProvider(BigQueryService)
      .useValue({
        query: jest.fn().mockResolvedValue([]),
        createDataset: jest.fn().mockResolvedValue({}),
        insertRows: jest.fn().mockResolvedValue({}),
      })
      .overrideProvider(PubSubService)
      .useValue({
        publishMessage: jest.fn().mockResolvedValue('msg-id'),
        createTopic: jest.fn().mockResolvedValue({}),
        listenForMessages: jest.fn().mockResolvedValue({}),
      })
      .overrideProvider(StorageService)
      .useValue({
        listBuckets: jest.fn().mockResolvedValue([]),
        uploadFile: jest.fn().mockResolvedValue({}),
        downloadFile: jest.fn().mockResolvedValue(Buffer.from('')),
        deleteFile: jest.fn().mockResolvedValue({}),
      })

      .compile();

    this.app = moduleFixture.createNestApplication({ bufferLogs: true });

    // Silence logger or use a simple one for E2E
    this.app.useLogger(this.app.get(Logger));

    this.app.setGlobalPrefix('api');

    this.app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    await this.app.init();
    return this.app;
  }

  async teardown() {
    if (this.app) {
      await this.app.close();
    }
  }

  getApp() {
    if (!this.app) {
      throw new Error('App not bootstrapped! Call bootstrap() first.');
    }
    return this.app;
  }
}
