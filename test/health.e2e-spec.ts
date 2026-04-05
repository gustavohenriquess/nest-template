import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('HealthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health (GET)', () => {
    return request(app.getHttpServer() as never)
      .get('/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as {
          status: string;
          timestamp: string;
          details: string;
        };
        expect(body.status).toBe('ok');
        expect(body).toHaveProperty('timestamp');
        expect(body.details).toBe('Service is running correctly');
      });
  });
});
