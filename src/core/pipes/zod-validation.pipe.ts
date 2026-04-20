import {
  PipeTransform,
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  Optional,
} from '@nestjs/common';
import * as zod from 'zod';
import { ZOD_SCHEMA_KEY } from '../decorators/zod.decorator';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  private readonly schema?: zod.ZodSchema;

  constructor(
    @Optional()
    schema: zod.ZodSchema | undefined = undefined,
  ) {
    this.schema = schema;
  }

  transform(value: unknown, metadata: ArgumentMetadata) {
    const schema = this.getSchema(metadata);

    if (!schema) {
      return value;
    }

    try {
      return schema.parse(value);
    } catch (error) {
      if (error instanceof zod.ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: error.flatten().fieldErrors,
        });
      }
      throw new BadRequestException('Validation failed');
    }
  }

  private getSchema(metadata: ArgumentMetadata): zod.ZodSchema | undefined {
    if (this.schema) {
      return this.schema;
    }

    if (metadata.metatype) {
      return Reflect.getMetadata(ZOD_SCHEMA_KEY, metadata.metatype) as
        | zod.ZodSchema
        | undefined;
    }

    return undefined;
  }
}
