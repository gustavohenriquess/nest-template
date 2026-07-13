/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaRoleRepository } from './prisma-role.repository';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { Role } from '../../../domain/role.entity';

describe('PrismaRoleRepository', () => {
  let repository: PrismaRoleRepository;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      role: {
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
        PrismaRoleRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<PrismaRoleRepository>(PrismaRoleRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should create role', async () => {
    const role = new Role({ name: 'ADMIN' });
    prisma.role.create.mockResolvedValue({
      id: '1',
      name: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await repository.create(role);
    expect(result.name).toBe('ADMIN');
  });

  it('should create role with permissions', async () => {
    const role = new Role({ name: 'ADMIN' });
    prisma.role.create.mockResolvedValue({
      id: '1',
      name: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [{ id: '1', name: 'users' }],
    });

    const result = await repository.create(role, ['1']);
    expect(result.permissions).toBeDefined();
  });

  it('should find by id', async () => {
    prisma.role.findUnique.mockResolvedValue({
      id: '1',
      name: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await repository.findById('1');
    expect(result?.id).toBe('1');
  });

  it('should return null if findById not found', async () => {
    prisma.role.findUnique.mockResolvedValue(null);
    const result = await repository.findById('1');
    expect(result).toBeNull();
  });

  it('should find by name', async () => {
    prisma.role.findUnique.mockResolvedValue({
      id: '1',
      name: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await repository.findByName('ADMIN');
    expect(result?.name).toBe('ADMIN');
  });

  it('should return null if findByName not found', async () => {
    prisma.role.findUnique.mockResolvedValue(null);
    const result = await repository.findByName('ADMIN');
    expect(result).toBeNull();
  });

  it('should map to domain without permissions', async () => {
    prisma.role.findUnique.mockResolvedValue({
      id: '1',
      name: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: undefined,
    });
    const result = await repository.findById('1');
    expect(result?.permissions).toBeUndefined();
  });

  it('should find all paginated', async () => {
    prisma.role.findMany.mockResolvedValue([
      { id: '1', name: 'ADMIN', createdAt: new Date(), updatedAt: new Date() },
    ]);
    prisma.role.count.mockResolvedValue(1);

    const result = await repository.findAll(1, 10);
    expect(result.roles).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it('should update role', async () => {
    prisma.role.update.mockResolvedValue({
      id: '1',
      name: 'UPDATED',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await repository.update('1', { name: 'UPDATED' });
    expect(result.name).toBe('UPDATED');
  });

  it('should update role with permissions', async () => {
    prisma.role.update.mockResolvedValue({
      id: '1',
      name: 'UPDATED',
      createdAt: new Date(),
      updatedAt: new Date(),
      permissions: [],
    });
    const result = await repository.update('1', { name: 'UPDATED' }, ['2']);
    expect(result.name).toBe('UPDATED');
  });

  it('should delete role', async () => {
    prisma.role.delete.mockResolvedValue({});
    await repository.delete('1');
    expect(prisma.role.delete).toHaveBeenCalled();
  });
});
