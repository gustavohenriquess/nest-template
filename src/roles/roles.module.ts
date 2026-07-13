import { Module } from '@nestjs/common';
import { RolesController } from './interface/controllers/roles.controller';
import { CreateRoleUseCase } from './application/use-cases/create-role.use-case';
import { GetRolesUseCase } from './application/use-cases/get-roles.use-case';
import { GetRoleUseCase } from './application/use-cases/get-role.use-case';
import { UpdateRoleUseCase } from './application/use-cases/update-role.use-case';
import { DeleteRoleUseCase } from './application/use-cases/delete-role.use-case';
import { PrismaRoleRepository } from './infrastructure/persistence/prisma/prisma-role.repository';
import { ROLE_REPOSITORY } from './domain/role.repository';
import { PrismaModule } from '@/core/infrastructure/persistence/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RolesController],
  providers: [
    {
      provide: ROLE_REPOSITORY,
      useClass: PrismaRoleRepository,
    },
    CreateRoleUseCase,
    GetRolesUseCase,
    GetRoleUseCase,
    UpdateRoleUseCase,
    DeleteRoleUseCase,
  ],
  exports: [ROLE_REPOSITORY],
})
export class RolesModule {}
