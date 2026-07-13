export class Permission {
  id!: string;
  name!: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(props: Partial<Permission>) {
    Object.assign(this, props);
  }
}
