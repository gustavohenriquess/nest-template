/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { DeleteRoleUseCase } from './delete-role.use-case';
import { EntityNotFoundError } from '@/core/errors/domain.error';

describe('DeleteRoleUseCase', () => {
  let useCase: DeleteRoleUseCase;
  let roleRepository: any;
  let logger: any;

  beforeEach(() => {
    roleRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
    useCase = new DeleteRoleUseCase(roleRepository, logger);
  });

  it('should throw EntityNotFoundError if role not found', async () => {
    roleRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('1')).rejects.toThrow(EntityNotFoundError);
  });

  it('should delete role', async () => {
    roleRepository.findById.mockResolvedValue({ id: '1', name: 'ADMIN' });
    roleRepository.delete.mockResolvedValue();

    await useCase.execute('1');
    expect(roleRepository.delete).toHaveBeenCalledWith('1');
  });
});
