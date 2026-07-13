/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaPermissionRepository } from './prisma-permission.repository';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { Permission } from '../../../domain/permission.entity';

describe('PrismaPermissionRepository', () => {
  let repository: PrismaPermissionRepository;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      permission: {
        create: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaPermissionRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<PrismaPermissionRepository>(
      PrismaPermissionRepository,
    );
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should create permission', async () => {
    const perm = new Permission({ name: 'admin' });
    prisma.permission.create.mockResolvedValue({
      id: '1',
      name: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await repository.create(perm);
    expect(result.name).toBe('admin');
  });

  it('should find by id', async () => {
    prisma.permission.findUnique.mockResolvedValue({
      id: '1',
      name: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await repository.findById('1');
    expect(result?.id).toBe('1');
  });

  it('should return null if findById not found', async () => {
    prisma.permission.findUnique.mockResolvedValue(null);
    const result = await repository.findById('1');
    expect(result).toBeNull();
  });

  it('should find by name', async () => {
    prisma.permission.findUnique.mockResolvedValue({
      id: '1',
      name: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await repository.findByName('admin');
    expect(result?.name).toBe('admin');
  });

  it('should return null if findByName not found', async () => {
    prisma.permission.findUnique.mockResolvedValue(null);
    const result = await repository.findByName('admin');
    expect(result).toBeNull();
  });

  it('should find all paginated', async () => {
    prisma.permission.findMany.mockResolvedValue([
      { id: '1', name: 'admin', createdAt: new Date(), updatedAt: new Date() },
    ]);
    prisma.permission.count.mockResolvedValue(1);

    const result = await repository.findAll(1, 10);
    expect(result.permissions).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should update permission', async () => {
    prisma.permission.update.mockResolvedValue({
      id: '1',
      name: 'updated',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await repository.update('1', { name: 'updated' });
    expect(result.name).toBe('updated');
  });

  it('should delete permission', async () => {
    prisma.permission.delete.mockResolvedValue({});
    await repository.delete('1');
    expect(prisma.permission.delete).toHaveBeenCalled();
  });
});
