import { Injectable, Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import { EntityNotFoundError } from '@/core/errors/domain.error';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class DeleteUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @InjectPinoLogger(DeleteUserUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new EntityNotFoundError('User not found', this.logger);
    }

    await this.userRepository.delete(id);
  }
}
