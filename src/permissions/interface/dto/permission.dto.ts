import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UseZodSchema } from '@/core/decorators/zod.decorator';
import { Permission } from '../../domain/permission.entity';

export const createPermissionSchema = z.object({
  name: z.string().min(3).max(255),
  description: z.string().optional().nullable(),
});

export const updatePermissionSchema = createPermissionSchema.partial();

@UseZodSchema(createPermissionSchema)
export class CreatePermissionDto {
  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string;
}

@UseZodSchema(updatePermissionSchema)
export class UpdatePermissionDto {
  @ApiPropertyOptional()
  name?: string;

  @ApiPropertyOptional()
  description?: string;
}

export class PermissionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional()
  description?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(permission: Permission) {
    this.id = permission.id;
    this.name = permission.name;
    this.description = permission.description;
    this.createdAt = permission.createdAt!;
    this.updatedAt = permission.updatedAt!;
  }
}
