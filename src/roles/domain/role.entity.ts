import { Permission } from '@/permissions/domain/permission.entity';

export class Role {
  id!: string;
  name!: string;
  description?: string | null;
  permissions?: Permission[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: Partial<Role>) {
    Object.assign(this, props);
  }
}
