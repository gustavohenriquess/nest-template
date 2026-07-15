import { Injectable, Inject } from '@nestjs/common';
import {
  CreatePermissionDto,
  PermissionResponseDto,
} from '../../interface/dto/permission.dto';
import { PERMISSION_REPOSITORY } from '../../domain/permission.repository';
import type { PermissionRepository } from '../../domain/permission.repository';
import { Permission } from '../../domain/permission.entity';
import { ConflictError } from '@/core/errors/domain.error';
import { PinoLogger, InjectPinoLogger } from 'nestjs-pino';

@Injectable()
export class CreatePermissionUseCase {
  constructor(
    @Inject(PERMISSION_REPOSITORY)
    private readonly permissionRepository: PermissionRepository,
    @InjectPinoLogger(CreatePermissionUseCase.name)
    private readonly logger: PinoLogger,
  ) {}

  async execute(dto: CreatePermissionDto): Promise<PermissionResponseDto> {
    const existing = await this.permissionRepository.findByName(dto.name);
    if (existing) {
      throw new ConflictError('Permission already exists', this.logger);
    }
    const permission = new Permission(dto);
    const created = await this.permissionRepository.create(permission);
    return new PermissionResponseDto(created);
  }
}
