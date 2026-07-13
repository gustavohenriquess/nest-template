import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UseZodSchema } from '@/core/decorators/zod.decorator';
import { PermissionResponseDto } from '@/permissions/interface/dto/permission.dto';
import { Role } from '../../domain/role.entity';

export const createRoleSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional().nullable(),
  permissionIds: z.array(z.string().uuid()).optional(),
});

export const updateRoleSchema = createRoleSchema.partial();

@UseZodSchema(createRoleSchema)
export class CreateRoleDto {
  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  permissionIds?: string[];
}

@UseZodSchema(updateRoleSchema)
export class UpdateRoleDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional({ type: [String] })
  permissionIds?: string[];
}

export class RoleResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiPropertyOptional({ type: () => [PermissionResponseDto] })
  permissions?: PermissionResponseDto[];

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(role: Role) {
    this.id = role.id;
    this.name = role.name;
    this.description = role.description;
    this.createdAt = role.createdAt!;
    this.updatedAt = role.updatedAt!;
    if (role.permissions) {
      this.permissions = role.permissions.map(
        (p) => new PermissionResponseDto(p),
      );
    }
  }
}
