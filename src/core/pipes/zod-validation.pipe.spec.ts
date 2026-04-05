import { ZodValidationPipe } from './zod-validation.pipe';
import { z } from 'zod';
import { BadRequestException } from '@nestjs/common';

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
    expect(pipe.transform(value, {} as any)).toEqual(value);
  });

  it('should throw BadRequestException on validation failure', () => {
    expect(() => pipe.transform({ name: 123 }, {} as any)).toThrow(
      BadRequestException,
    );
  });

  it('should throw generic BadRequestException on unknown error', () => {
    const errorSchema = {
      parse: () => {
        throw new Error('unknown');
      },
    };
    const errorPipe = new ZodValidationPipe(errorSchema as any);
    expect(() => errorPipe.transform({}, {} as any)).toThrow(
      BadRequestException,
    );
  });
});
