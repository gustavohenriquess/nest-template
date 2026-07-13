import { Injectable, Inject } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/role.repository';
import type { RoleRepository } from '../../domain/role.repository';
import { RoleResponseDto } from '../../interface/dto/role.dto';
import { PaginatedResponseDto } from '@/core/dto/paginated-response.dto';

@Injectable()
export class GetRolesUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(
    page: number,
    limit: number,
  ): Promise<PaginatedResponseDto<RoleResponseDto>> {
    const { roles, total } = await this.roleRepository.findAll(page, limit);
    const items = roles.map((i) => new RoleResponseDto(i));
    return PaginatedResponseDto.create(items, total, page, limit);
  }
}
