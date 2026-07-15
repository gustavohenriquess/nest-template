/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { CreateUserUseCase } from './create-user.use-case';
import { ConflictError } from '@/core/errors/domain.error';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: any;
  let logger: any;

  beforeEach(() => {
    userRepository = {
      findByEmailWithRolesAndPermissions: jest.fn(),
      create: jest.fn(),
    };
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
    useCase = new CreateUserUseCase(userRepository, logger);
    (argon2.hash as jest.Mock).mockResolvedValue('hashed_password');
  });

  it('should throw ConflictError if email is already in use', async () => {
    userRepository.findByEmailWithRolesAndPermissions.mockResolvedValue({
      id: '1',
    });

    await expect(
      useCase.execute({
        name: 'Test',
        email: 'test@test.com',
        password: 'password',
      }),
    ).rejects.toThrow(ConflictError);
  });

  it('should successfully create a user', async () => {
    userRepository.findByEmailWithRolesAndPermissions.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      id: '1',
      name: 'Test',
      email: 'test@test.com',
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      name: 'Test',
      email: 'test@test.com',
      password: 'password',
    });

    expect(result).toBeDefined();
    expect(result.name).toBe('Test');
    expect(argon2.hash).toHaveBeenCalledWith('password');
    expect(userRepository.create).toHaveBeenCalled();
  });
});
