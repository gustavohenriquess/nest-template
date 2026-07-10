/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { UpdateUserUseCase } from './update-user.use-case';
import { EntityNotFoundError, ConflictError } from '@/core/errors/domain.error';
import * as argon2 from 'argon2';

jest.mock('argon2');

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
  let userRepository: any;
  let logger: any;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      findByEmailWithRolesAndPermissions: jest.fn(),
      update: jest.fn(),
    };
    logger = {
      info: jest.fn(),
    };
    useCase = new UpdateUserUseCase(logger, userRepository);
    (argon2.hash as jest.Mock).mockResolvedValue('hashed_password');
  });

  it('should throw EntityNotFoundError if user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('1', {})).rejects.toThrow(EntityNotFoundError);
  });

  it('should throw ConflictError if email is already in use by another user', async () => {
    userRepository.findById.mockResolvedValue({
      id: '1',
      email: 'old@test.com',
    });
    userRepository.findByEmailWithRolesAndPermissions.mockResolvedValue({
      id: '2',
    });

    await expect(
      useCase.execute('1', { email: 'new@test.com' }),
    ).rejects.toThrow(ConflictError);
  });

  it('should update user successfully', async () => {
    const user = {
      id: '1',
      email: 'old@test.com',
      password: 'old',
      name: 'Old',
    };
    userRepository.findById.mockResolvedValue(user);
    userRepository.update.mockResolvedValue({ ...user, name: 'New' });

    const result = await useCase.execute('1', { name: 'New' });

    expect(result.name).toBe('New');
    expect(logger.info).toHaveBeenCalled();
  });

  it('should hash password if provided', async () => {
    const user = {
      id: '1',
      email: 'old@test.com',
      password: 'old',
      name: 'Old',
    };
    userRepository.findById.mockResolvedValue(user);
    userRepository.update.mockResolvedValue({ ...user, name: 'New' });

    await useCase.execute('1', { password: 'newpassword' });

    expect(argon2.hash).toHaveBeenCalledWith('newpassword');
  });

  it('should not check email if not provided', async () => {
    const user = { id: '1', email: 'old@test.com', name: 'Old' };
    userRepository.findById.mockResolvedValue(user);
    userRepository.update.mockResolvedValue({ ...user, name: 'New' });

    await useCase.execute('1', { name: 'New' });

    expect(
      userRepository.findByEmailWithRolesAndPermissions,
    ).not.toHaveBeenCalled();
  });

  it('should not check email if email is the same as existing', async () => {
    const user = { id: '1', email: 'old@test.com', name: 'Old' };
    userRepository.findById.mockResolvedValue(user);
    userRepository.update.mockResolvedValue({ ...user, name: 'New' });

    await useCase.execute('1', { email: 'old@test.com' });

    expect(
      userRepository.findByEmailWithRolesAndPermissions,
    ).not.toHaveBeenCalled();
  });

  it('should update email if new email is not in use', async () => {
    const user = { id: '1', email: 'old@test.com', name: 'Old' };
    userRepository.findById.mockResolvedValue(user);
    userRepository.findByEmailWithRolesAndPermissions.mockResolvedValue(null);
    userRepository.update.mockResolvedValue({ ...user, email: 'new@test.com' });

    const result = await useCase.execute('1', { email: 'new@test.com' });

    expect(result.email).toBe('new@test.com');
    expect(
      userRepository.findByEmailWithRolesAndPermissions,
    ).toHaveBeenCalledWith('new@test.com');
  });
});
