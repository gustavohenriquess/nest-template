/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { GetPermissionUseCase } from './get-permission.use-case';
import { EntityNotFoundError } from '@/core/errors/domain.error';

describe('GetPermissionUseCase', () => {
  let useCase: GetPermissionUseCase;
  let permissionRepository: any;

  beforeEach(() => {
    permissionRepository = {
      findById: jest.fn(),
    };
    useCase = new GetPermissionUseCase(permissionRepository);
  });

  it('should throw EntityNotFoundError if permission not found', async () => {
    permissionRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('1')).rejects.toThrow(EntityNotFoundError);
  });

  it('should return a permission', async () => {
    permissionRepository.findById.mockResolvedValue({
      id: '1',
      name: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await useCase.execute('1');
    expect(result.id).toBe('1');
  });
});
