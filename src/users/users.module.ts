import { Module } from '@nestjs/common';
import { USER_REPOSITORY } from './domain/user.repository';
import { PrismaUserRepository } from './infrastructure/persistence/prisma/prisma-user.repository';

@Module({
  imports: [],
  controllers: [],
  providers: [
    {
      provide: USER_REPOSITORY,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
