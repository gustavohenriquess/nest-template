/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { DeletePermissionUseCase } from './delete-permission.use-case';
import { EntityNotFoundError } from '@/core/errors/domain.error';

describe('DeletePermissionUseCase', () => {
  let useCase: DeletePermissionUseCase;
  let permissionRepository: any;

  beforeEach(() => {
    permissionRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeletePermissionUseCase(permissionRepository);
  });

  it('should throw EntityNotFoundError if permission not found', async () => {
    permissionRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('1')).rejects.toThrow(EntityNotFoundError);
  });

  it('should delete permission', async () => {
    permissionRepository.findById.mockResolvedValue({ id: '1', name: 'admin' });
    permissionRepository.delete.mockResolvedValue();

    await useCase.execute('1');
    expect(permissionRepository.delete).toHaveBeenCalledWith('1');
  });
});
