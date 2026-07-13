import { Module } from '@nestjs/common';
import { PermissionsController } from './interface/controllers/permissions.controller';
import { CreatePermissionUseCase } from './application/use-cases/create-permission.use-case';
import { GetPermissionsUseCase } from './application/use-cases/get-permissions.use-case';
import { GetPermissionUseCase } from './application/use-cases/get-permission.use-case';
import { UpdatePermissionUseCase } from './application/use-cases/update-permission.use-case';
import { DeletePermissionUseCase } from './application/use-cases/delete-permission.use-case';
import { PrismaPermissionRepository } from './infrastructure/persistence/prisma/prisma-permission.repository';
import { PERMISSION_REPOSITORY } from './domain/permission.repository';
import { PrismaModule } from '@/core/infrastructure/persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PermissionsController],
  providers: [
    {
      provide: PERMISSION_REPOSITORY,
      useClass: PrismaPermissionRepository,
    },
    CreatePermissionUseCase,
    GetPermissionsUseCase,
    GetPermissionUseCase,
    UpdatePermissionUseCase,
    DeletePermissionUseCase,
  ],
  exports: [PERMISSION_REPOSITORY],
})
export class PermissionsModule {}
