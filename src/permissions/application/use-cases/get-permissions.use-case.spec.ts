/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { GetPermissionsUseCase } from './get-permissions.use-case';

describe('GetPermissionsUseCase', () => {
  let useCase: GetPermissionsUseCase;
  let permissionRepository: any;
  let logger: any;

  beforeEach(() => {
    permissionRepository = {
      findAll: jest.fn(),
    };
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
    useCase = new GetPermissionsUseCase(permissionRepository, logger);
  });

  it('should return paginated permissions', async () => {
    permissionRepository.findAll.mockResolvedValue({
      permissions: [
        {
          id: '1',
          name: 'admin',
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
