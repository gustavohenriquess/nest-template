/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { UpdateRoleUseCase } from './update-role.use-case';
import { EntityNotFoundError, ConflictError } from '@/core/errors/domain.error';

describe('UpdateRoleUseCase', () => {
  let useCase: UpdateRoleUseCase;
  let roleRepository: any;

  beforeEach(() => {
    roleRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      update: jest.fn(),
    };
    useCase = new UpdateRoleUseCase(roleRepository);
  });

  it('should throw EntityNotFoundError if role not found', async () => {
    roleRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('1', { name: 'ADMIN' })).rejects.toThrow(
      EntityNotFoundError,
    );
  });

  it('should throw ConflictError if name is taken by another role', async () => {
    roleRepository.findById.mockResolvedValue({ id: '1', name: 'OLD_ROLE' });
    roleRepository.findByName.mockResolvedValue({ id: '2', name: 'ADMIN' });

    await expect(useCase.execute('1', { name: 'ADMIN' })).rejects.toThrow(
      ConflictError,
    );
  });

  it('should update role', async () => {
    roleRepository.findById.mockResolvedValue({ id: '1', name: 'OLD_ROLE' });
    roleRepository.findByName.mockResolvedValue(null);
    roleRepository.update.mockResolvedValue({
      id: '1',
      name: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute('1', { name: 'ADMIN' });
    expect(result.name).toBe('ADMIN');
  });
});
