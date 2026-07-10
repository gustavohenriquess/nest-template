import { Injectable, Inject } from '@nestjs/common';
import { PaginationQueryDto } from '@/core/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@/core/dto/paginated-response.dto';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../domain/user.repository';
import { UserResponseDto } from '../../interface/dto/user.dto';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(
    query: PaginationQueryDto,
  ): Promise<PaginatedResponseDto<UserResponseDto>> {
    const page = query.page || 1;
    const limit = query.limit || 10;

    const { users, total } = await this.userRepository.findAll(page, limit);

    const data = users.map((user) => new UserResponseDto(user));

    return PaginatedResponseDto.create(data, total, page, limit);
  }
}
