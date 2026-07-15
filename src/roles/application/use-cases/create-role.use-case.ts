import { Injectable, Inject } from '@nestjs/common';
import { CreateRoleDto, RoleResponseDto } from '../../interface/dto/role.dto';
import { ROLE_REPOSITORY } from '../../domain/role.repository';
import type { RoleRepository } from '../../domain/role.repository';
import { Role } from '../../domain/role.entity';
import { ConflictError } from '@/core/errors/domain.error';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class CreateRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @InjectPinoLogger(CreateRoleUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(dto: CreateRoleDto): Promise<RoleResponseDto> {
    const existing = await this.roleRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictError('Role already exists', this.logger);
    }
    const role = new Role(dto);
    const created = await this.roleRepository.create(role, dto.permissionIds);
    return new RoleResponseDto(created);
  }
}
