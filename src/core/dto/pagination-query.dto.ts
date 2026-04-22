import { z } from 'zod';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { UseZodSchema } from '../decorators/zod.decorator';

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

@UseZodSchema(PaginationQuerySchema)
export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (starts at 1)',
    default: 1,
    minimum: 1,
    type: Number,
  })
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page (max 100)',
    default: 10,
    minimum: 1,
    maximum: 100,
    type: Number,
  })
  limit?: number;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    type: String,
  })
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort order (asc or desc)',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  sortOrder?: 'asc' | 'desc';
}
