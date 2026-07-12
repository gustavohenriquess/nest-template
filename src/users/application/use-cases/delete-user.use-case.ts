import { Injectable, Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import { EntityNotFoundError } from '@/core/errors/domain.error';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new EntityNotFoundError('User not found');
    }

    await this.userRepository.delete(id);
  }
}
