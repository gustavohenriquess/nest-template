import { Injectable, Inject } from '@nestjs/common';
import { UpdateRoleDto, RoleResponseDto } from '../../interface/dto/role.dto';
import { ROLE_REPOSITORY } from '../../domain/role.repository';
import type { RoleRepository } from '../../domain/role.repository';
import { EntityNotFoundError, ConflictError } from '@/core/errors/domain.error';

@Injectable()
export class UpdateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
  ) {}

  async execute(id: string, dto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new EntityNotFoundError('Role not found');
    }

    if (dto.name && dto.name !== role.name) {
      const existing = await this.roleRepository.findByName(dto.name);
      if (existing) {
        throw new ConflictError('Role already exists');
      }
    }

    const updated = await this.roleRepository.update(
      id,
      dto,
      dto.permissionIds,
    );
    return new RoleResponseDto(updated);
  }
}
