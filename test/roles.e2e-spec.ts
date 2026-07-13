/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import request from 'supertest';
import { E2EHelper } from './utils/e2e-helper';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import * as argon2 from 'argon2';
import { INestApplication } from '@nestjs/common';

describe('RolesController (e2e)', () => {
  const helper = new E2EHelper();
  let app: INestApplication;
  let prismaService: PrismaService;
  let adminToken: string;
  let testPermissionId: string;

  beforeAll(async () => {
    app = await helper.bootstrap();
    prismaService = app.get<PrismaService>(PrismaService);

    await prismaService.role.deleteMany();
    await prismaService.permission.deleteMany();
    await prismaService.user.deleteMany();

    const password = 'StrongPassword123!';
    const hashedPassword = await argon2.hash(password);

    await prismaService.user.create({
      data: {
        email: 'admin_role@example.com',
        name: 'Admin User',
        password: hashedPassword,
        status: 'ACTIVE',
      },
    });

    const perm = await prismaService.permission.create({
      data: { name: 'test:permission' },
    });
    testPermissionId = perm.id;

    const loginRes = await request(app.getHttpServer() as never)
      .post('/api/v1/auth/login')
      .send({ email: 'admin_role@example.com', password });

    adminToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prismaService.role.deleteMany();
    await prismaService.permission.deleteMany();
    await prismaService.user.deleteMany();
    await helper.teardown();
  });

  it('/api/v1/roles (POST) - should create a role', async () => {
    const res = await request(app.getHttpServer() as never)
      .post('/api/v1/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'TEST_ROLE', permissionIds: [testPermissionId] })
      .expect(201);

    expect(res.body.data.id).toBeDefined();
    expect(res.body.data.name).toBe('TEST_ROLE');
    expect(res.body.data.permissions).toBeDefined();
    expect(res.body.data.permissions[0].id).toBe(testPermissionId);
  });

  it('/api/v1/roles (GET) - should return paginated roles', async () => {
    await prismaService.role.create({
      data: { name: 'OTHER_ROLE' },
    });

    const res = await request(app.getHttpServer() as never)
      .get('/api/v1/roles?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.meta.pagination.total).toBeGreaterThanOrEqual(1);
  });

  it('/api/v1/roles/:id (GET) - should return a role', async () => {
    const role = await prismaService.role.create({
      data: { name: 'VIEW_ROLE' },
    });

    const res = await request(app.getHttpServer() as never)
      .get(`/api/v1/roles/${role.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data.name).toBe('VIEW_ROLE');
  });

  it('/api/v1/roles/:id (PATCH) - should update a role', async () => {
    const role = await prismaService.role.create({
      data: { name: 'UPDATE_ROLE' },
    });

    const res = await request(app.getHttpServer() as never)
      .patch(`/api/v1/roles/${role.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Updated description', permissionIds: [] })
      .expect(200);

    expect(res.body.data.description).toBe('Updated description');
  });

  it('/api/v1/roles/:id (DELETE) - should delete a role', async () => {
    const role = await prismaService.role.create({
      data: { name: 'DELETE_ROLE' },
    });

    await request(app.getHttpServer() as never)
      .delete(`/api/v1/roles/${role.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const deleted = await prismaService.role.findUnique({
      where: { id: role.id },
    });
    expect(deleted).toBeNull();
  });
});
