import { Injectable, Inject } from '@nestjs/common';
import {
  UpdatePermissionDto,
  PermissionResponseDto,
} from '../../interface/dto/permission.dto';
import { PERMISSION_REPOSITORY } from '../../domain/permission.repository';
import type { PermissionRepository } from '../../domain/permission.repository';
import { EntityNotFoundError, ConflictError } from '@/core/errors/domain.error';

@Injectable()
export class UpdatePermissionUseCase {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(
    id: string,
    dto: UpdatePermissionDto,
  ): Promise<PermissionResponseDto> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new EntityNotFoundError('Permission not found');
    }

    if (dto.name && dto.name !== permission.name) {
      const existing = await this.permissionRepository.findByName(dto.name);
      if (existing) {
        throw new ConflictError('Permission already exists');
      }
    }

    const updated = await this.permissionRepository.update(id, dto);
    return new PermissionResponseDto(updated);
  }
}
