import request from 'supertest';
import { E2EHelper } from './utils/e2e-helper';
import { JwtService } from '@nestjs/jwt';

describe('HealthController (e2e)', () => {
  const helper = new E2EHelper();
  let jwtService: JwtService;

  beforeAll(async () => {
    await helper.bootstrap();
    jwtService = helper.getApp().get<JwtService>(JwtService);
  });

  afterAll(async () => {
    await helper.teardown();
  });

  it('/v1/health (GET)', () => {
    return request(helper.getApp().getHttpServer() as never)
      .get('/v1/health')
      .expect(200)
      .expect((res) => {
        const { meta, data } = res.body as {
          meta: {
            module: string;
            severity: string;
          };
          data: {
            status: string;
            info: Record<string, unknown>;
          };
        };

        expect(meta).toBeDefined();
        expect(meta.module).toBe('health');
        expect(meta.severity).toBe('low');

        expect(data.status).toBe('ok');
        expect(data.info).toHaveProperty('memory_heap');
        expect(data.info).toHaveProperty('memory_rss');
      });
  });

  it('/v1/health/integrations (GET)', () => {
    const token = jwtService.sign({ sub: 'e2e-user', roles: [] });

    return request(helper.getApp().getHttpServer() as never)
      .get('/v1/health/integrations')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect((res) => {
        const { meta, data } = res.body as {
          meta: {
            module: string;
            severity: string;
          };
          data: {
            status: string;
            info: Record<string, unknown>;
          };
        };

        expect(meta.severity).toBe('high');
        expect(meta.module).toBe('health');

        expect(data.status).toBe('ok');
        // Check standard indicators are present via info object returned by Terminus
        expect(data.info).toHaveProperty('prisma_default');

        expect(data.info).toHaveProperty('pubsub');
        expect(data.info).toHaveProperty('bigquery');
        expect(data.info).toHaveProperty('storage');
      });
  });
});
