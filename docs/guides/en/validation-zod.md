# Global Validation & Zod

This template abandons `class-validator` in favor of an automated validation system based on [Zod](https://zod.dev/). It provides a much more robust, type-safe, and functional approach to schema validation.

Validation is applied globally via the `ZodValidationPipe`, which eliminates the need for manual validation logic in Services or Controllers.

## How it works

The `ZodValidationPipe` is registered globally. During each request (Body, Query, or Param), the pipe checks if the DTO class has an associated Zod schema via custom metadata (`@UseZodSchema()`). If it finds one, it validates the data and returns the clean, strongly-typed object. Otherwise, it lets the data pass without validation.

## Usage Guide

### 1. Define the Schema (The Source of Truth)

Create your pure `z.object()` schema describing the business rules. It is recommended to export it so it can be reused in tests or other places.

```typescript
import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(3).max(100, 'Name is too long'),
  email: z.string().email('Invalid e-mail'),
  password: z.string().min(8, 'Password must have at least 8 characters'),
  age: z.number().int().positive().optional(),
});
```

### 2. The DTO Class (Swagger & Types)

Create a class for the DTO and decorate it with `@UseZodSchema()`. This "tells" the Global Pipe that this class must be validated.
You also add `@ApiProperty()` properties to the class purely for Swagger documentation purposes.

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { UseZodSchema } from '@/core/decorators/zod.decorator';

@UseZodSchema(CreateUserSchema)
export class CreateUserDto {
  @ApiProperty({ description: 'Full name', minLength: 3 })
  name!: string;

  @ApiProperty({ description: 'Valid email address' })
  email!: string;

  @ApiProperty({ description: 'Secure password', minLength: 8 })
  password!: string;

  @ApiProperty({ required: false, description: 'Age in years' })
  age?: number;
}
```

### 3. Use it in the Controller

Now you just need to use the classic NestJS decorators (`@Body`, `@Query`, `@Param`). The validation will occur automatically.

```typescript
@Post()
@ApiOkResponse({ type: UserResponseDto })
async create(@Body() data: CreateUserDto) {
  // If the code reaches here, the data is 100% valid and secure
  return this.usersService.create(data);
}
```

## Error Handling

When a validation fails, the system automatically returns a `400 Bad Request` error with the following structure (processed by the `GlobalExceptionFilter`):

```json
{
  "success": false,
  "error": {
    "code": "APP-400",
    "message": "Validation failed",
    "details": {
      "email": ["Invalid e-mail"],
      "password": ["Password must have at least 8 characters"]
    }
  },
  "meta": {
    "timestamp": "2024-04-20T...",
    "path": "/api/users",
    "correlationId": "req-1234-abcd"
  }
}
```

## Best Practices

> [!TIP]  
> **Always Double-Type**: Try to keep the DTO class interface in sync with the Zod schema. Zod guarantees safety at runtime, and the class guarantees safety at development time.

> [!IMPORTANT]  
> **Optional Fields**: Remember to use `.optional()` in Zod and the `?` modifier in TypeScript for fields that are not mandatory.

> [!NOTE]  
> **Backwards Compatibility**: Routes that do not have the `@UseZodSchema` decorator will continue to work normally without validation, allowing a gradual migration of legacy systems.
