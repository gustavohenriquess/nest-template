import { ZodValidationPipe } from './zod-validation.pipe';
import { z, ZodSchema } from 'zod';
import { BadRequestException, ArgumentMetadata } from '@nestjs/common';

describe('ZodValidationPipe', () => {
  let pipe: ZodValidationPipe;
  const schema = z.object({
    name: z.string(),
  });

  beforeEach(() => {
    pipe = new ZodValidationPipe(schema);
  });

  it('should validate and return value', () => {
    const value = { name: 'test' };
    expect(pipe.transform(value, {} as unknown as ArgumentMetadata)).toEqual(
      value,
    );
  });

  it('should throw BadRequestException on validation failure', () => {
    expect(() =>
      pipe.transform({ name: 123 }, {} as unknown as ArgumentMetadata),
    ).toThrow(BadRequestException);
  });

  it('should throw generic BadRequestException on unknown error', () => {
    const errorSchema = {
      parse: () => {
        throw new Error('unknown');
      },
    };
    const errorPipe = new ZodValidationPipe(
      errorSchema as unknown as ZodSchema,
    );
    expect(() =>
      errorPipe.transform({}, {} as unknown as ArgumentMetadata),
    ).toThrow(BadRequestException);
  });
});
