import { Injectable, Inject } from '@nestjs/common';
import { PERMISSION_REPOSITORY } from '../../domain/permission.repository';
import type { PermissionRepository } from '../../domain/permission.repository';
import { EntityNotFoundError } from '@/core/errors/domain.error';

@Injectable()
export class DeletePermissionUseCase {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new EntityNotFoundError('Permission not found');
    }
    await this.permissionRepository.delete(id);
  }
}
