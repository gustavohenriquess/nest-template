import { Injectable, Inject } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/role.repository';
import type { RoleRepository } from '../../domain/role.repository';
import { RoleResponseDto } from '../../interface/dto/role.dto';
import { EntityNotFoundError } from '@/core/errors/domain.error';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';
@Injectable()
export class GetRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @InjectPinoLogger(GetRoleUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(id: string): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new EntityNotFoundError('Role not found', this.logger);
    }
    return new RoleResponseDto(role);
  }
}
