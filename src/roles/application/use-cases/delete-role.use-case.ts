import { Injectable, Inject } from '@nestjs/common';
import { ROLE_REPOSITORY } from '../../domain/role.repository';
import type { RoleRepository } from '../../domain/role.repository';
import { EntityNotFoundError } from '@/core/errors/domain.error';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

@Injectable()
export class DeleteRoleUseCase {
  constructor(
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepository,
    @InjectPinoLogger(DeleteRoleUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(id: string): Promise<void> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new EntityNotFoundError('Role not found', this.logger);
    }
    await this.roleRepository.delete(id);
  }
}
