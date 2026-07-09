import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { UserRepository } from '../../../domain/user.repository';
import { User, UserStatus } from '../../../domain/user.entity';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmailWithRolesAndPermissions(
    email: string,
  ): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          include: {
            permissions: true,
          },
        },
        permissions: true,
      },
    });

    if (!prismaUser) {
      return null;
    }

    return new User({
      id: prismaUser.id,
      name: prismaUser.name,
      email: prismaUser.email,
      password: prismaUser.password,
      avatarUrl: prismaUser.avatarUrl,
      status: prismaUser.status as UserStatus,
      roles: prismaUser.roles,
      permissions: prismaUser.permissions,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
