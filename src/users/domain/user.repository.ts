import { User } from './user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  create(user: User): Promise<User>;
  findAll(
    page: number,
    limit: number,
  ): Promise<{ users: User[]; total: number }>;
  findById(id: string): Promise<User | null>;
  findByEmailWithRolesAndPermissions(email: string): Promise<User | null>;
  update(id: string, user: Partial<User>): Promise<User>;
  delete(id: string): Promise<void>;
}
