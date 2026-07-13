import { Injectable, Inject } from '@nestjs/common';
import {
  CreatePermissionDto,
  PermissionResponseDto,
} from '../../interface/dto/permission.dto';
import { PERMISSION_REPOSITORY } from '../../domain/permission.repository';
import type { PermissionRepository } from '../../domain/permission.repository';
import { Permission } from '../../domain/permission.entity';
import { ConflictError } from '@/core/errors/domain.error';

@Injectable()
export class CreatePermissionUseCase {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(dto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const existing = await this.permissionRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictError('Permission already exists');
    }
    const permission = new Permission(dto);
    const created = await this.permissionRepository.create(permission);
    return new PermissionResponseDto(created);
  }
}
