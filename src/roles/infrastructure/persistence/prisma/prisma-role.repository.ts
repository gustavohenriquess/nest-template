import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import type { RoleRepository } from '../../../domain/role.repository';
import { Role } from '../../../domain/role.entity';
import { Permission } from '@/permissions/domain/permission.entity';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
  private mapToDomain(data: any): Role {
    const permissions = data.permissions
      ? data.permissions.map((p: any) => new Permission(p))
      : undefined;
    return new Role({ ...data, permissions });
  }
  /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */

  async create(role: Role, permissionIds?: string[]): Promise<Role> {
    const data = await this.prisma.role.create({
      data: {
        name: role.name,
        description: role.description,
        permissions: permissionIds
          ? { connect: permissionIds.map((id) => ({ id })) }
          : undefined,
      },
      include: { permissions: true },
    });
    return this.mapToDomain(data);
  }

  async findById(id: string): Promise<Role | null> {
    const data = await this.prisma.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findByName(name: string): Promise<Role | null> {
    const data = await this.prisma.role.findUnique({
      where: { name },
      include: { permissions: true },
    });
    return data ? this.mapToDomain(data) : null;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ roles: Role[]; total: number }> {
    const skip = (page - 1) * limit;
    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        skip,
        take: limit,
        include: { permissions: true },
      }),
      this.prisma.role.count(),
    ]);

    return {
      roles: roles.map((item) => this.mapToDomain(item)),
      total,
    };
  }

  async update(
    id: string,
    role: Partial<Role>,
    permissionIds?: string[],
  ): Promise<Role> {
    const data = await this.prisma.role.update({
      where: { id },
      data: {
        name: role.name,
        description: role.description,
        permissions: permissionIds
          ? { set: permissionIds.map((pid) => ({ id: pid })) }
          : undefined,
      },
      include: { permissions: true },
    });
    return this.mapToDomain(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.role.delete({
      where: { id },
    });
  }
}
