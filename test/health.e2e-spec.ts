import request from 'supertest';
import { E2EHelper } from './utils/e2e-helper';

describe('HealthController (e2e)', () => {
  const helper = new E2EHelper();

  beforeAll(async () => {
    await helper.bootstrap();
  });

  afterAll(async () => {
    await helper.teardown();
  });

  it('/health (GET)', () => {
    return request(helper.getApp().getHttpServer() as never)
      .get('/health')
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

  it('/health/integrations (GET)', () => {
    return request(helper.getApp().getHttpServer() as never)
      .get('/health/integrations')
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
        expect(data.info).toHaveProperty('prisma_primary');
        expect(data.info).toHaveProperty('prisma_secondary');
        expect(data.info).toHaveProperty('pubsub');
        expect(data.info).toHaveProperty('bigquery');
        expect(data.info).toHaveProperty('storage');
      });
  });
});
