import { Injectable, Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import { UserResponseDto } from '../../interface/dto/user.dto';
import { EntityNotFoundError } from '@/core/errors/domain.error';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
@Injectable()
export class GetUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @InjectPinoLogger(GetUserUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(id: string): Promise<UserResponseDto> {
    const user = await this.userRepository.findById(id);

    if (!user) {
      throw new EntityNotFoundError('User not found', this.logger);
    }

    return new UserResponseDto(user);
  }
}
