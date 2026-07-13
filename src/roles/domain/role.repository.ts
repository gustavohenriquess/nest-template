import type { Role } from './role.entity';

export const ROLE_REPOSITORY = Symbol('ROLE_REPOSITORY');

export interface RoleRepository {
  create(role: Role, permissionIds?: string[]): Promise<Role>;
  findById(id: string): Promise<Role | null>;
  findByName(name: string): Promise<Role | null>;
  findAll(
    page: number,
    limit: number,
  ): Promise<{ roles: Role[]; total: number }>;
  update(
    id: string,
    role: Partial<Role>,
    permissionIds?: string[],
  ): Promise<Role>;
  delete(id: string): Promise<void>;
}
