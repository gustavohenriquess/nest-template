import { Injectable, Inject } from '@nestjs/common';
import { PERMISSION_REPOSITORY } from '../../domain/permission.repository';
import type { PermissionRepository } from '../../domain/permission.repository';
import { PermissionResponseDto } from '../../interface/dto/permission.dto';
import { PaginatedResponseDto } from '@/core/dto/paginated-response.dto';

@Injectable()
export class GetPermissionsUseCase {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(
    page: number,
    limit: number,
  ): Promise<PaginatedResponseDto<PermissionResponseDto>> {
    const { permissions, total } = await this.permissionRepository.findAll(
      page,
      limit,
    );
    const items = permissions.map((i) => new PermissionResponseDto(i));
    return PaginatedResponseDto.create(items, total, page, limit);
  }
}
