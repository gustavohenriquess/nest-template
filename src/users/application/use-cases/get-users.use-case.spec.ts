/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { GetUsersUseCase } from './get-users.use-case';

describe('GetUsersUseCase', () => {
  let useCase: GetUsersUseCase;
  let userRepository: any;

  beforeEach(() => {
    userRepository = {
      findAll: jest.fn(),
    };
    useCase = new GetUsersUseCase(userRepository);
  });

  it('should return a paginated list of users', async () => {
    const mockUsers = [{ id: '1', name: 'Test' }];
    userRepository.findAll.mockResolvedValue({ users: mockUsers, total: 1 });

    const result = await useCase.execute({ page: 1, limit: 10 });

    expect(result.data).toHaveLength(1);
    expect(result.data).toHaveLength(1);
    expect(result.meta.pagination.total).toBe(1);
  });

  it('should use default page and limit if not provided', async () => {
    const mockUsers = [{ id: '1', name: 'Test' }];
    userRepository.findAll.mockResolvedValue({ users: mockUsers, total: 1 });

    const result = await useCase.execute({});

    expect(userRepository.findAll).toHaveBeenCalledWith(1, 10);
    expect(result.data).toHaveLength(1);
  });
});
