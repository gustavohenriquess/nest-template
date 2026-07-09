/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { User, UserStatus } from '../../../domain/user.entity';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prismaService: jest.Mocked<PrismaService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
    prismaService = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  it('should return a user domain entity when user is found', async () => {
    const email = 'test@example.com';
    const mockPrismaUser = {
      id: 'uuid-1',
      name: 'Test Name',
      email: email,
      password: 'hashed-password',
      avatarUrl: null,
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 'role-1', name: 'ADMIN' }],
      permissions: [{ id: 'perm-1', name: 'users:read' }],
    };

    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(
      mockPrismaUser,
    );

    const result = await repository.findByEmailWithRolesAndPermissions(email);

    expect(prismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email },
      include: {
        roles: { include: { permissions: true } },
        permissions: true,
      },
    });

    expect(result).toBeInstanceOf(User);
    expect(result?.id).toBe(mockPrismaUser.id);
    expect(result?.name).toBe(mockPrismaUser.name);
    expect(result?.status).toBe(UserStatus.ACTIVE);
    expect(result?.roles).toHaveLength(1);
    expect(result?.permissions).toHaveLength(1);
  });

  it('should return null when user is not found', async () => {
    (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

    const result = await repository.findByEmailWithRolesAndPermissions(
      'notfound@example.com',
    );

    expect(result).toBeNull();
    expect(prismaService.user.findUnique).toHaveBeenCalled();
  });
});
