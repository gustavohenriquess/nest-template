/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { GetRolesUseCase } from './get-roles.use-case';

describe('GetRolesUseCase', () => {
  let useCase: GetRolesUseCase;
  let roleRepository: any;

  beforeEach(() => {
    roleRepository = {
      findAll: jest.fn(),
    };
    useCase = new GetRolesUseCase(roleRepository);
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
