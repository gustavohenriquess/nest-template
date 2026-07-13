/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import request from 'supertest';
import { E2EHelper } from './utils/e2e-helper';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import * as argon2 from 'argon2';
import { INestApplication } from '@nestjs/common';

describe('PermissionsController (e2e)', () => {
  const helper = new E2EHelper();
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;

  beforeAll(async () => {
    app = await helper.bootstrap();
    prismaService = app.get<PrismaService>(PrismaService);

    await prismaService.permission.deleteMany();
    await prismaService.user.deleteMany();

    const password = 'StrongPassword123!';
    const hashedPassword = await argon2.hash(password);

    await prismaService.user.create({
      data: {
        email: 'admin_perm@example.com',
        name: 'Admin User',
        password: hashedPassword,
        status: 'ACTIVE',
      },
    });

    const loginRes = await request(app.getHttpServer() as never)
      .post('/api/v1/auth/login')
      .send({ email: 'admin_perm@example.com', password });

    adminToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prismaService.permission.deleteMany();
    await prismaService.user.deleteMany();
    await helper.teardown();
  });

  it('/api/v1/permissions (POST) - should create a permission', async () => {
    const res = await request(app.getHttpServer() as never)
      .post('/api/v1/permissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'users:read', description: 'Read users' })
      .expect(201);

    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe('users:read');
  });

  it('/api/v1/permissions (GET) - should return paginated permissions', async () => {
    await prismaService.permission.create({
      data: { name: 'users:write', description: 'Write users' },
    });

    const res = await request(app.getHttpServer() as never)
      .get('/api/v1/permissions?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.meta.pagination.total).toBeGreaterThanOrEqual(1);
  });

  it('/api/v1/permissions/:id (GET) - should return a permission', async () => {
    const permission = await prismaService.permission.create({
      data: { name: 'users:delete' },
    });

    const res = await request(app.getHttpServer() as never)
      .get(`/api/v1/permissions/${permission.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data.name).toBe('users:delete');
  });

  it('/api/v1/permissions/:id (PATCH) - should update a permission', async () => {
    const permission = await prismaService.permission.create({
      data: { name: 'posts:read' },
    });

    const res = await request(app.getHttpServer() as never)
      .patch(`/api/v1/permissions/${permission.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated description' })
      .expect(200);

    expect(res.body.data.description).toBe('Updated description');
  });

  it('/api/v1/permissions/:id (DELETE) - should delete a permission', async () => {
    const permission = await prismaService.permission.create({
      data: { name: 'posts:write' },
    });

    await request(app.getHttpServer() as never)
      .delete(`/api/v1/permissions/${permission.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const deleted = await prismaService.permission.findUnique({
      where: { id: permission.id },
    });
    expect(deleted).toBeNull();
  });
});
