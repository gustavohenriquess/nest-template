import { ZodValidationPipe } from './zod-validation.pipe';
import * as zod from 'zod';
import { BadRequestException, ArgumentMetadata } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UseZodSchema } from '../decorators/zod.decorator';

describe('ZodValidationPipe', () => {
  let pipe: ZodValidationPipe;
  const schema = zod.object({
    name: zod.string(),
  });

  @UseZodSchema(schema)
  class TestDto {
    name: string;
  }

  it('should be defined', () => {
    expect(new ZodValidationPipe()).toBeDefined();
  });

  it('should be instantiated by NestJS (integrations test)', async () => {
    const module = await Test.createTestingModule({
      providers: [ZodValidationPipe],
    }).compile();

    const injectedPipe = module.get(ZodValidationPipe);
    expect(injectedPipe).toBeDefined();
  });

  it('should validate using schema from constructor', () => {
    pipe = new ZodValidationPipe(schema);
    const value = { name: 'test' };
    const metadata: ArgumentMetadata = { type: 'body' };
    expect(pipe.transform(value, metadata)).toEqual(value);
  });

  it('should validate using metadata from metatype', () => {
    pipe = new ZodValidationPipe();
    const value = { name: 'test' };
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: TestDto,
    };
    expect(pipe.transform(value, metadata)).toEqual(value);
  });

  it('should skip validation if no schema is found on metadata or constructor', () => {
    pipe = new ZodValidationPipe();
    const value = { name: 'test' };
    const metadata: ArgumentMetadata = {
      type: 'body',
      metatype: class NoSchema {},
    };
    expect(pipe.transform(value, metadata)).toEqual(value);
  });

  it('should skip validation if metatype is missing', () => {
    pipe = new ZodValidationPipe();
    const value = { name: 'test' };
    const metadata: ArgumentMetadata = { type: 'body' };
    expect(pipe.transform(value, metadata)).toEqual(value);
  });

  it('should throw BadRequestException on validation failure', () => {
    pipe = new ZodValidationPipe(schema);
    const metadata: ArgumentMetadata = { type: 'body' };
    expect(() => pipe.transform({ name: 123 }, metadata)).toThrow(
      BadRequestException,
    );
  });

  it('should throw detailed BadRequestException on ZodError', () => {
    pipe = new ZodValidationPipe(schema);
    const metadata: ArgumentMetadata = { type: 'body' };
    try {
      pipe.transform({ name: 123 }, metadata);
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      const response = (error as BadRequestException).getResponse() as {
        message: string;
        errors: Record<string, string[]>;
      };
      expect(response.message).toBe('Validation failed');
      expect(response.errors).toBeDefined();
    }
  });

  it('should throw generic BadRequestException on unknown error', () => {
    const errorSchema = {
      parse: () => {
        throw new Error('unknown');
      },
    };
    const errorPipe = new ZodValidationPipe(
      errorSchema as unknown as zod.ZodSchema,
    );
    const metadata: ArgumentMetadata = { type: 'body' };
    expect(() => errorPipe.transform({}, metadata)).toThrow(
      BadRequestException,
    );
  });
});
