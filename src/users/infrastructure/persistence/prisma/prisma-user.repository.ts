import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import { UserRepository } from '../../../domain/user.repository';
import { User, UserStatus } from '../../../domain/user.entity';

@Injectable()
export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const created = await this.prisma.user.create({
      data: {
        name: user.name,
        email: user.email,
        password: user.password as string,
        avatarUrl: user.avatarUrl,
        status: user.status,
      },
    });
    return this.mapToDomain(created);
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }> {
    const where = { deletedAt: null };
    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { users: users.map((u) => this.mapToDomain(u)), total };
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    return user ? this.mapToDomain(user) : null;
  }

  async findByEmailWithRolesAndPermissions(
    email: string,
  ): Promise<User | null> {
    const prismaUser = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
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

    return this.mapToDomain(prismaUser);
  }

  async update(id: string, user: Partial<User>): Promise<User> {
    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        name: user.name,
        email: user.email,
        password: user.password,
        avatarUrl: user.avatarUrl,
        status: user.status,
      },
    });
    return this.mapToDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date(),
      },
    });
  }

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  private mapToDomain(prismaUser: any): User {
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
      deletedAt: prismaUser.deletedAt,
    });
  }
}
