import { Injectable, Inject } from '@nestjs/common';
import * as argon2 from 'argon2';
import { CreateUserDto, UserResponseDto } from '../../interface/dto/user.dto';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import { User, UserStatus } from '../../domain/user.entity';
import { ConflictError } from '@/core/errors/domain.error';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    @InjectPinoLogger(CreateUserUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(dto: CreateUserDto): Promise<UserResponseDto> {
    const existingUser =
      await this.userRepository.findByEmailWithRolesAndPermissions(dto.email);
    if (existingUser) {
      throw new ConflictError('Email is already in use', this.logger);
    }

    const hashedPassword = await argon2.hash(dto.password);

    const user = new User({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      status: UserStatus.PENDING,
    });

    const createdUser = await this.userRepository.create(user);

    return new UserResponseDto(createdUser);
  }
}
