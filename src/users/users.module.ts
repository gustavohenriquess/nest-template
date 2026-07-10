import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './domain/user.repository';
import { PrismaUserRepository } from './infrastructure/persistence/prisma/prisma-user.repository';
import { UsersController } from './interface/controllers/users.controller';
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { GetUserUseCase } from './application/use-cases/get-user.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';

@Module({
  imports: [],
  controllers: [UsersController],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
    CreateUserUseCase,
    GetUsersUseCase,
    GetUserUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
