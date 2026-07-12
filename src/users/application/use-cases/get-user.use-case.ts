import { Injectable, Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import { UserResponseDto } from '../../interface/dto/user.dto';
import { EntityNotFoundError } from '@/core/errors/domain.error';

@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new EntityNotFoundError('User not found');
    }

    return new UserResponseDto(user);
  }
}
