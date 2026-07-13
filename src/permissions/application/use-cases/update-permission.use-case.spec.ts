/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { UpdatePermissionUseCase } from './update-permission.use-case';
import { EntityNotFoundError, ConflictError } from '@/core/errors/domain.error';

describe('UpdatePermissionUseCase', () => {
  let useCase: UpdatePermissionUseCase;
  let permissionRepository: any;

  beforeEach(() => {
    permissionRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
    };
    useCase = new UpdatePermissionUseCase(permissionRepository);
  });

  it('should throw EntityNotFoundError if permission not found', async () => {
    permissionRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('1', { name: 'admin' })).rejects.toThrow(
      EntityNotFoundError,
    );
  });

  it('should throw ConflictError if name is taken by another permission', async () => {
    permissionRepository.findById.mockResolvedValue({
      id: '1',
      name: 'old_name',
    });
    permissionRepository.findByName.mockResolvedValue({
      id: '2',
      name: 'admin',
    });

    await expect(useCase.execute('1', { name: 'admin' })).rejects.toThrow(
      ConflictError,
    );
  });

  it('should update permission', async () => {
    permissionRepository.findById.mockResolvedValue({
      id: '1',
      name: 'old_name',
    });
    permissionRepository.findByName.mockResolvedValue(null);
    permissionRepository.update.mockResolvedValue({
      id: '1',
      name: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute('1', { name: 'admin' });
    expect(result.name).toBe('admin');
  });
});
