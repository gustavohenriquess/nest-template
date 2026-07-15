/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { GetUserUseCase } from './get-user.use-case';
import { EntityNotFoundError } from '@/core/errors/domain.error';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let userRepository: any;
  let logger: any;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
    };
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };
    useCase = new GetUserUseCase(userRepository, logger);
  });

  it('should throw EntityNotFoundError if user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('1')).rejects.toThrow(EntityNotFoundError);
  });

  it('should return user if found', async () => {
    userRepository.findById.mockResolvedValue({ id: '1', name: 'Test' });

    const result = await useCase.execute('1');

    expect(result.name).toBe('Test');
  });
});
