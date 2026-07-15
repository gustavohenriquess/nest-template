/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { GetRoleUseCase } from './get-role.use-case';
import { EntityNotFoundError } from '@/core/errors/domain.error';

describe('GetRoleUseCase', () => {
  let useCase: GetRoleUseCase;
  let roleRepository: any;
  let logger: any;

  beforeEach(() => {
    roleRepository = {
      findById: jest.fn(),
    };
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
    useCase = new GetRoleUseCase(roleRepository, logger);
  });

  it('should throw EntityNotFoundError if role not found', async () => {
    roleRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute('1')).rejects.toThrow(EntityNotFoundError);
  });

  it('should return a role', async () => {
    roleRepository.findById.mockResolvedValue({
      id: '1',
      name: 'ADMIN',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const result = await useCase.execute('1');
    expect(result.id).toBe('1');
  });
});
