/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as argon2 from 'argon2';
import { CacheService } from '@/core/cache/cache.service';
import { LoginUseCase } from './login.use-case';
import { UserStatus } from '@/users/domain/user.entity';
import {
  USER_REPOSITORY,
  UserRepository,
} from '@/users/domain/user.repository';
import { UnauthorizedError, ForbiddenError } from '@/core/errors/domain.error';

jest.mock('argon2');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;
  let configService: jest.Mocked<ConfigService>;
  let cacheService: jest.Mocked<CacheService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUseCase,
        {
          provide: USER_REPOSITORY,
          useValue: {
            findByEmailWithRolesAndPermissions: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: CacheService,
          useValue: {
            set: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get(USER_REPOSITORY);
    jwtService = module.get(JwtService);
    configService = module.get(ConfigService);
    cacheService = module.get(CacheService);

    // Mock config return values
    configService.get.mockImplementation((key: string) => {
      if (key === 'AUTH_ROLES_CLAIM_PATH') return 'roles';
      if (key === 'AUTH_PERMISSIONS_CLAIM_PATH') return 'permissions';
      return null;
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    id: 'user-id-1',
    email: 'test@example.com',
    password: 'hashed-password',
    status: UserStatus.ATIVO,
    roles: [
      {
        name: 'ADMIN',
        permissions: [{ name: 'users:read' }, { name: 'users:write' }],
      },
    ],
    permissions: [{ name: 'posts:read' }],
  };

  const loginDto = {
    email: 'test@example.com',
    password: 'password123',
  };

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should successfully login and return an access token', async () => {
    (
      userRepository.findByEmailWithRolesAndPermissions as jest.Mock
    ).mockResolvedValue(mockUser);
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('mocked-jwt-token');
    cacheService.set.mockResolvedValue();

    const result = await useCase.execute(loginDto);

    expect(result).toEqual({ accessToken: 'mocked-jwt-token' });
    expect(
      userRepository.findByEmailWithRolesAndPermissions,
    ).toHaveBeenCalledWith(loginDto.email);
    expect(argon2.verify).toHaveBeenCalledWith(
      'hashed-password',
      'password123',
    );
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'user-id-1',
        email: 'test@example.com',
        roles: ['ADMIN'],
        permissions: ['users:read', 'users:write', 'posts:read'],
      }),
    );
    // expect(cacheService.set).toHaveBeenCalledWith(
    //   'user:user-id-1:session',
    //   expect.any(Object),
    //   86400,
    // );
  });

  it('should throw UnauthorizedError if user is not found', async () => {
    (
      userRepository.findByEmailWithRolesAndPermissions as jest.Mock
    ).mockResolvedValue(null);

    await expect(useCase.execute(loginDto)).rejects.toThrow(UnauthorizedError);
    expect(argon2.verify).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedError if password is incorrect', async () => {
    (
      userRepository.findByEmailWithRolesAndPermissions as jest.Mock
    ).mockResolvedValue(mockUser);
    (argon2.verify as jest.Mock).mockResolvedValue(false);

    await expect(useCase.execute(loginDto)).rejects.toThrow(UnauthorizedError);
  });

  it('should throw ForbiddenError if user status is not ATIVO', async () => {
    const inactiveUser = { ...mockUser, status: UserStatus.INATIVO };
    (
      userRepository.findByEmailWithRolesAndPermissions as jest.Mock
    ).mockResolvedValue(inactiveUser);
    (argon2.verify as jest.Mock).mockResolvedValue(true);

    await expect(useCase.execute(loginDto)).rejects.toThrow(ForbiddenError);
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('should handle undefined roles, permissions and custom claim paths', async () => {
    const userWithoutRolesAndPermissions = {
      id: 'user-id-2',
      email: 'test2@example.com',
      password: 'hashed-password',
      status: UserStatus.ATIVO,
      // explicitly omitting roles and permissions to test fallbacks
    };

    (
      userRepository.findByEmailWithRolesAndPermissions as jest.Mock
    ).mockResolvedValue(userWithoutRolesAndPermissions);
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('mocked-jwt-token-2');
    cacheService.set.mockResolvedValue();

    // mock configService to return null, forcing the use of fallback paths
    configService.get.mockReturnValue(null);

    const result = await useCase.execute(loginDto);

    expect(result).toEqual({ accessToken: 'mocked-jwt-token-2' });
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'user-id-2',
        email: 'test2@example.com',
        roles: [],
        permissions: [],
      }),
    );
  });

  it('should handle roles with undefined permissions', async () => {
    const userWithRolesWithoutPermissions = {
      id: 'user-id-3',
      email: 'test3@example.com',
      password: 'hashed-password',
      status: UserStatus.ATIVO,
      roles: [{ id: 'role-1', name: 'USER' }], // permissions undefined
    };

    (
      userRepository.findByEmailWithRolesAndPermissions as jest.Mock
    ).mockResolvedValue(userWithRolesWithoutPermissions);
    (argon2.verify as jest.Mock).mockResolvedValue(true);
    jwtService.sign.mockReturnValue('mocked-jwt-token-3');
    cacheService.set.mockResolvedValue();

    const result = await useCase.execute(loginDto);

    expect(result).toEqual({ accessToken: 'mocked-jwt-token-3' });
    expect(jwtService.sign).toHaveBeenCalledWith(
      expect.objectContaining({
        sub: 'user-id-3',
        email: 'test3@example.com',
        roles: ['USER'],
        permissions: [],
      }),
    );
  });
});
