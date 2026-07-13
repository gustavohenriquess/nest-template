import type { Permission } from './permission.entity';

export const PERMISSION_REPOSITORY = Symbol('PERMISSION_REPOSITORY');

export interface PermissionRepository {
  create(permission: Permission): Promise<Permission>;
  findById(id: string): Promise<Permission | null>;
  findByName(name: string): Promise<Permission | null>;
  findAll(
    page: number,
    limit: number,
  ): Promise<{ permissions: Permission[]; total: number }>;
  update(id: string, permission: Partial<Permission>): Promise<Permission>;
  delete(id: string): Promise<void>;
}
