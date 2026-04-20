import { SetMetadata } from '@nestjs/common';
import { ZodSchema } from 'zod';

export const ZOD_SCHEMA_KEY = 'zod:schema';

/**
 * Decorator to associate a Zod schema with a DTO class.
 * This metadata is used by the global ZodValidationPipe to know which schema to apply.
 */
export const UseZodSchema = (schema: ZodSchema) =>
  SetMetadata(ZOD_SCHEMA_KEY, schema);
