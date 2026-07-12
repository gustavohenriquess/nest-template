import { Injectable, Inject } from '@nestjs/common';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
import * as argon2 from 'argon2';
import { UpdateUserDto, UserResponseDto } from '../../interface/dto/user.dto';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import { UserStatus } from '../../domain/user.entity';
import { EntityNotFoundError, ConflictError } from '@/core/errors/domain.error';

@Injectable()
export class UpdateUserUseCase {
  constructor(
    @InjectPinoLogger(UpdateUserUseCase.name)
    private readonly logger: PinoLogger,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(id: string, dto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.info({ dto }, `Updating user with ID: ${id}`);

    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new EntityNotFoundError('User not found');
    }

    if (dto.email && dto.email !== user.email) {
      const existingUser =
        await this.userRepository.findByEmailWithRolesAndPermissions(dto.email);
      if (existingUser) {
        throw new ConflictError('Email is already in use');
      }
    }

    let hashedPassword = user.password;
    if (dto.password) {
      hashedPassword = await argon2.hash(dto.password);
    }

    const updatedUser = await this.userRepository.update(id, {
      name: dto.name ?? user.name,
      email: dto.email ?? user.email,
      password: hashedPassword,
      avatarUrl: dto.avatarUrl ?? user.avatarUrl,
      status: (dto.status as UserStatus) ?? user.status,
    });

    return new UserResponseDto(updatedUser);
  }
}
