/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { DeleteUserUseCase } from './delete-user.use-case';
import { EntityNotFoundError } from '@/core/errors/domain.error';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let userRepository: any;

  beforeEach(() => {
    userRepository = {
      findById: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteUserUseCase(userRepository);
  });

  it('should throw EntityNotFoundError if user not found', async () => {
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('1')).rejects.toThrow(EntityNotFoundError);
  });

  it('should delete user if found', async () => {
    userRepository.findById.mockResolvedValue({ id: '1' });
    userRepository.delete.mockResolvedValue(undefined);

    await useCase.execute('1');

    expect(userRepository.delete).toHaveBeenCalledWith('1');
  });
});
