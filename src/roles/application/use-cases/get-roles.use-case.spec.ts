/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { GetRolesUseCase } from './get-roles.use-case';

describe('GetRolesUseCase', () => {
  let useCase: GetRolesUseCase;
  let roleRepository: any;
  let logger: any;

  beforeEach(() => {
    roleRepository = {
      findAll: jest.fn(),
    };
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
    useCase = new GetRolesUseCase(roleRepository, logger);
  });

  it('should return paginated roles', async () => {
    roleRepository.findAll.mockResolvedValue({
      roles: [
        {
          id: '1',
          name: 'ADMIN',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      total: 1,
    });

    const result = await useCase.execute(1, 10);
    expect(result.data).toHaveLength(1);
    expect(result.meta.pagination.total).toBe(1);
  });
});
