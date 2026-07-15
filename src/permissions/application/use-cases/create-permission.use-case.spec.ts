/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { CreatePermissionUseCase } from './create-permission.use-case';
import { ConflictError } from '@/core/errors/domain.error';

describe('CreatePermissionUseCase', () => {
  let useCase: CreatePermissionUseCase;
  let permissionRepository: any;
  let logger: any;

  beforeEach(() => {
    permissionRepository = {
      findByName: jest.fn(),
      create: jest.fn(),
    };
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
    useCase = new CreatePermissionUseCase(permissionRepository, logger);
  });

  it('should throw ConflictError if permission name already exists', async () => {
    permissionRepository.findByName.mockResolvedValue({
      id: '1',
      name: 'admin',
    });

    await expect(useCase.execute({ name: 'admin' })).rejects.toThrow(
      ConflictError,
    );
  });

  it('should successfully create a permission', async () => {
    permissionRepository.findByName.mockResolvedValue(null);
    permissionRepository.create.mockResolvedValue({
      id: '1',
      name: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({ name: 'admin' });
    expect(result.id).toBeDefined();
    expect(result.name).toBe('admin');
    expect(permissionRepository.create).toHaveBeenCalled();
  });
});
