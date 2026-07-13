import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/infrastructure/persistence/prisma/prisma.service';
import type { PermissionRepository } from '../../../domain/permission.repository';
import { Permission } from '../../../domain/permission.entity';

@Injectable()
export class PrismaPermissionRepository implements PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(permission: Permission): Promise<Permission> {
    const data = await this.prisma.permission.create({
      data: {
        name: permission.name,
        description: permission.description,
      },
    });
    return new Permission(data);
  }

  async findById(id: string): Promise<Permission | null> {
    const data = await this.prisma.permission.findUnique({
      where: { id },
    });
    return data ? new Permission(data) : null;
  }

  async findByName(name: string): Promise<Permission | null> {
    const data = await this.prisma.permission.findUnique({
      where: { name },
    });
    return data ? new Permission(data) : null;
  }

  async findAll(
    page: number,
    limit: number,
  ): Promise<{ permissions: Permission[]; total: number }> {
    const skip = (page - 1) * limit;
    const [permissions, total] = await Promise.all([
      this.prisma.permission.findMany({ skip, take: limit }),
      this.prisma.permission.count(),
    ]);

    return {
      permissions: permissions.map((item) => new Permission(item)),
      total,
    };
  }

  async update(
    id: string,
    permission: Partial<Permission>,
  ): Promise<Permission> {
    const data = await this.prisma.permission.update({
      where: { id },
      data: {
        name: permission.name,
        description: permission.description,
      },
    });
    return new Permission(data);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.permission.delete({
      where: { id },
    });
  }
}
