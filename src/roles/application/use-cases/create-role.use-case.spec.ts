/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { CreateRoleUseCase } from './create-role.use-case';
import { ConflictError } from '@/core/errors/domain.error';

describe('CreateRoleUseCase', () => {
  let useCase: CreateRoleUseCase;
  let roleRepository: any;
  let logger: any;

  beforeEach(() => {
    roleRepository = {
      findByName: jest.fn(),
      create: jest.fn(),
    };
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
    useCase = new CreateRoleUseCase(roleRepository, logger);
  });

  it('should throw ConflictError if role name already exists', async () => {
    roleRepository.findByName.mockResolvedValue({ id: '1', name: 'ADMIN' });

    await expect(useCase.execute({ name: 'ADMIN' })).rejects.toThrow(
      ConflictError,
    );
  });

  it('should successfully create a role', async () => {
    roleRepository.findByName.mockResolvedValue(null);
    roleRepository.create.mockResolvedValue({
      id: '1',
      name: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({ name: 'ADMIN' });
    expect(result.id).toBeDefined();
    expect(result.name).toBe('ADMIN');
    expect(roleRepository.create).toHaveBeenCalled();
  });
});
