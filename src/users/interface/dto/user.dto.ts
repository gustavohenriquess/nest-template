import { z } from 'zod';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UseZodSchema } from '@/core/decorators/zod.decorator';

// Base schema for reuse
export const UserBaseSchema = z.object({
  name: z.string().min(3).max(100),
  email: z.string().email(),
  avatarUrl: z.string().url().optional().nullable(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).default('PENDING'),
});

// Create User Schema
export const CreateUserSchema = UserBaseSchema.extend({
  password: z.string().min(8),
});

// Update User Schema
export const UpdateUserSchema = UserBaseSchema.partial().extend({
  password: z.string().min(8).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
});

@UseZodSchema(CreateUserSchema)
export class CreateUserDto {
  @ApiProperty({ description: 'Full name of the user', example: 'John Doe' })
  name!: string;

  @ApiProperty({ description: 'Email address', example: 'john@example.com' })
  email!: string;

  @ApiProperty({ description: 'Strong password', example: 'StrongPass123!' })
  password!: string;
}

@UseZodSchema(UpdateUserSchema)
export class UpdateUserDto {
  @ApiPropertyOptional({ description: 'Full name of the user' })
  name?: string;

  @ApiPropertyOptional({ description: 'Email address' })
  email?: string;

  @ApiPropertyOptional({ description: 'Avatar URL' })
  avatarUrl?: string;

  @ApiPropertyOptional({
    description: 'User status',
    enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
  })
  status?: 'ACTIVE' | 'INACTIVE' | 'PENDING';

  @ApiPropertyOptional({ description: 'New password' })
  password?: string;
}

export class UserResponseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ required: false })
  avatarUrl?: string | null;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE', 'PENDING'] })
  status!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  // Constructor to map User entity to DTO and remove sensitive info
  constructor(partial: Partial<UserResponseDto>) {
    this.id = partial.id!;
    this.name = partial.name!;
    this.email = partial.email!;
    this.avatarUrl = partial.avatarUrl;
    this.status = partial.status!;
    this.createdAt = partial.createdAt!;
    this.updatedAt = partial.updatedAt!;
  }
}
