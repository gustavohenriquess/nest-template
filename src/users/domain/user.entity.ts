export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export interface UserRole {
  id: string;
  name: string;
  description?: string | null;
  permissions?: UserPermission[];
}

export interface UserPermission {
  id: string;
  name: string;
  description?: string | null;
}

export class User {
  id!: string;
  name!: string;
  email!: string;
  password?: string;
  avatarUrl?: string | null;
  status!: UserStatus;
  roles?: UserRole[];
  permissions?: UserPermission[];
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE && !this.deletedAt;
  }
}
