/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import request from 'supertest';
import { E2EHelper } from './utils/e2e-helper';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import * as argon2 from 'argon2';
import { INestApplication } from '@nestjs/common';

describe('UsersController (e2e)', () => {
  const helper = new E2EHelper();
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;

  beforeAll(async () => {
    app = await helper.bootstrap();
    prismaService = app.get<PrismaService>(PrismaService);

    // Clean up to avoid conflicts
    await prismaService.user.deleteMany();

    // Create an Admin user to get the token
    const password = 'StrongPassword123!';
    const hashedPassword = await argon2.hash(password);

    await prismaService.user.create({
      data: {
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        status: 'ACTIVE',
        roles: {
          connectOrCreate: {
            where: { name: 'ADMIN' },
            create: { name: 'ADMIN' },
          },
        },
      },
    });

    const loginRes = await request(app.getHttpServer() as never)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        password: password,
      });

    adminToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prismaService.user.deleteMany();
    await prismaService.role.deleteMany();
    await helper.teardown();
  });

  afterEach(async () => {
    // We want to delete the non-admin users only, or we can just delete all and recreate, but it's simpler to just clear specific emails
    await prismaService.user.deleteMany({
      where: {
        email: { not: 'admin@example.com' },
      },
    });
  });

  it('/api/v1/users (POST) - should create a user', async () => {
    const res = await request(app.getHttpServer() as never)
      .post('/api/v1/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'Password123!',
      })
      .expect(201);

    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe('John Doe');
    expect(res.body.data.email).toBe('john@example.com');
    expect(res.body.data.status).toBe('PENDING');
  });

  it('/api/v1/users (GET) - should return paginated users', async () => {
    await prismaService.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
      },
    });

    const res = await request(app.getHttpServer() as never)
      .get('/api/v1/users?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    // We have the Admin + John Doe = 2 users
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.meta.pagination.total).toBeGreaterThanOrEqual(1);
    expect(res.body.meta.pagination.page).toBe(1);
  });

  it('/api/v1/users/:id (PATCH) - should update user', async () => {
    const user = await prismaService.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
      },
    });

    const res = await request(app.getHttpServer() as never)
      .patch(`/api/v1/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'John Updated',
      })
      .expect(200);

    expect(res.body.data.name).toBe('John Updated');
  });

  it('/api/v1/users/:id (DELETE) - should soft delete user', async () => {
    const user = await prismaService.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hashed-password',
      },
    });

    await request(app.getHttpServer() as never)
      .delete(`/api/v1/users/${user.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    const deletedUser = await prismaService.user.findFirst({
      where: { id: user.id },
    });

    expect(deletedUser?.status).toBe('INACTIVE');
    expect(deletedUser?.deletedAt).toBeDefined();
  });
});
