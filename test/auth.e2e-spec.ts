/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import request from 'supertest';
import { E2EHelper } from './utils/e2e-helper';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import * as argon2 from 'argon2';
import { INestApplication } from '@nestjs/common';

describe('AuthController (e2e)', () => {
  const helper = new E2EHelper();
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await helper.bootstrap();
    prisma = app.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await helper.teardown();
  });

  beforeEach(async () => {
    // Clean up users before each test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'active@example.com',
            'wrongpass@example.com',
            'notfound@example.com',
            'inactive@example.com',
          ],
        },
      },
    });
  });

  describe('/api/v1/auth/login (POST)', () => {
    it('should return 200 and access token for valid credentials', async () => {
      const password = 'StrongPassword123!';
      const hashedPassword = await argon2.hash(password);

      // Create an active user
      await prisma.user.create({
        data: {
          email: 'active@example.com',
          name: 'Active User',
          password: hashedPassword,
          status: 'ACTIVE',
        },
      });

      const response = await request(app.getHttpServer() as never)
        .post('/api/v1/auth/login')
        .send({
          email: 'active@example.com',
          password: password,
        })
        .expect(200);

      expect(response.body.data).toHaveProperty('accessToken');
      expect(typeof response.body.data.accessToken).toBe('string');

      expect(response.headers['set-cookie']).toBeDefined();
      expect(response.headers['set-cookie'][0]).toMatch(/accessToken=/);
    });

    it('should return 401 for invalid password', async () => {
      const password = 'StrongPassword123!';
      const hashedPassword = await argon2.hash(password);

      await prisma.user.create({
        data: {
          email: 'wrongpass@example.com',
          name: 'Wrong Pass User',
          password: hashedPassword,
          status: 'ACTIVE',
        },
      });

      await request(app.getHttpServer() as never)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrongpass@example.com',
          password: 'WrongPassword456!',
        })
        .expect(401);
    });

    it('should return 401 for non-existent user', async () => {
      await request(app.getHttpServer() as never)
        .post('/api/v1/auth/login')
        .send({
          email: 'notfound@example.com',
          password: 'SomePassword123!',
        })
        .expect(401);
    });

    it('should return 403 for inactive user', async () => {
      const password = 'StrongPassword123!';
      const hashedPassword = await argon2.hash(password);

      await prisma.user.create({
        data: {
          email: 'inactive@example.com',
          name: 'Inactive User',
          password: hashedPassword,
          status: 'INACTIVE', // Or PENDING
        },
      });

      await request(app.getHttpServer() as never)
        .post('/api/v1/auth/login')
        .send({
          email: 'inactive@example.com',
          password: password,
        })
        .expect(403);
    });

    it('should return 400 for invalid dto (bad email format)', async () => {
      await request(app.getHttpServer() as never)
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: 'SomePassword123!',
        })
        .expect(400);
    });
  });
});
