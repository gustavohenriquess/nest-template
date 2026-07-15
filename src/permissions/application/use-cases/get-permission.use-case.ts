import { Injectable, Inject } from '@nestjs/common';
import { PERMISSION_REPOSITORY } from '../../domain/permission.repository';
import type { PermissionRepository } from '../../domain/permission.repository';
import { PermissionResponseDto } from '../../interface/dto/permission.dto';
import { EntityNotFoundError } from '@/core/errors/domain.error';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class GetPermissionUseCase {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
    @InjectPinoLogger(GetPermissionUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(id: string): Promise<PermissionResponseDto> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new EntityNotFoundError('Permission not found', this.logger);
    }
    return new PermissionResponseDto(permission);
  }
}
