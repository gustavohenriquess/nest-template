/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-assignment */
import { PrismaUserRepository } from './prisma-user.repository';
import { User, UserStatus } from '@/users/domain/user.entity';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: any;

  beforeEach(() => {
    prismaService = {
      user: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };
    repository = new PrismaUserRepository(prismaService);
  });

  const mockPrismaUser = {
    id: '1',
    name: 'Test',
    email: 'test@test.com',
    password: 'hash',
    avatarUrl: null,
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    roles: [],
  };

  it('should find by id', async () => {
    prismaService.user.findFirst.mockResolvedValue(mockPrismaUser);
    const user = await repository.findById('1');
    expect(user?.name).toBe('Test');
    expect(prismaService.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1', deletedAt: null } }),
    );
  });

  it('should return null if find by id not found', async () => {
    prismaService.user.findFirst.mockResolvedValue(null);
    const user = await repository.findById('1');
    expect(user).toBeNull();
  });

  it('should find by email with roles and permissions', async () => {
    prismaService.user.findFirst.mockResolvedValue(mockPrismaUser);
    const user =
      await repository.findByEmailWithRolesAndPermissions('test@test.com');
    expect(user?.email).toBe('test@test.com');
    expect(prismaService.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'test@test.com', deletedAt: null },
        include: {
          permissions: true,
          roles: { include: { permissions: true } },
        },
      }),
    );
  });

  it('should find by email and handle missing roles', async () => {
    prismaService.user.findFirst.mockResolvedValue({
      ...mockPrismaUser,
      roles: undefined,
    });
    const user =
      await repository.findByEmailWithRolesAndPermissions('test@test.com');
    expect(user?.roles).toBeUndefined();
  });

  it('should return null if find by email is not found', async () => {
    prismaService.user.findFirst.mockResolvedValue(null);
    const user =
      await repository.findByEmailWithRolesAndPermissions('notfound@test.com');
    expect(user).toBeNull();
  });

  it('should create user', async () => {
    prismaService.user.create.mockResolvedValue(mockPrismaUser);
    const data = {
      name: 'Test',
      email: 'test@test.com',
      password: 'hash',
      status: 'ACTIVE' as UserStatus,
    };
    const user = await repository.create(new User(data));
    expect(user.id).toBe('1');
    expect(prismaService.user.create).toHaveBeenCalled();
  });

  it('should find all paginated', async () => {
    prismaService.user.findMany.mockResolvedValue([mockPrismaUser]);
    prismaService.user.count.mockResolvedValue(1);

    const result = await repository.findAll(1, 10);
    expect(result.users).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(prismaService.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        where: { deletedAt: null },
      }),
    );
  });

  it('should update user', async () => {
    prismaService.user.update.mockResolvedValue({
      ...mockPrismaUser,
      name: 'New',
    });
    const user = await repository.update('1', { name: 'New' });
    expect(user.name).toBe('New');
    expect(prismaService.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: '1' }, data: { name: 'New' } }),
    );
  });

  it('should soft delete user', async () => {
    prismaService.user.update.mockResolvedValue(mockPrismaUser);
    await repository.delete('1');
    expect(prismaService.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1' },
        data: { status: 'INACTIVE', deletedAt: expect.any(Date) },
      }),
    );
  });
});
