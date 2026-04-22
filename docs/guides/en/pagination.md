# Pagination Utilities

This template provides standardized, safe, and automated pagination utilities out-of-the-box. This ensures all your listing endpoints behave identically and are protected against massive database query attacks.

## 1. Request Validation (`PaginationQueryDto`)

Located in `src/core/dto/pagination-query.dto.ts`, this DTO uses Zod to enforce strict limits.

**Security Constraints:**
- `page`: Must be `1` or higher.
- `limit`: Capped at a maximum of `100` items per request to prevent DoS attacks via massive row fetching.

## 2. Response Wrapping (`PaginatedResponseDto`)

Instead of returning raw arrays, all paginated endpoints must return `PaginatedResponseDto<T>`.

**Automatic Metadata Calculation:**
You don't need to manually calculate if there is a next page. The class provides a static `.create()` factory that handles the math for you.

### Example Usage in a Controller

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/core/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@/core/dto/paginated-response.dto';

@Controller('users')
export class UsersController {
  
  @Get()
  @ApiOkResponse({ type: PaginatedResponseDto }) // Tells Swagger about the response envelope
  async findAll(@Query() query: PaginationQueryDto) {
    
    // 1. Fetch data from DB
    const { data, total } = await this.usersService.findAll(query.page, query.limit);

    // 2. Return using the factory. It auto-generates `totalPages`, `hasNextPage`, etc.
    return PaginatedResponseDto.create(data, total, query.page, query.limit);
  }
}
```

## 3. Expected Response JSON

```json
{
  "data": [
    { "id": 1, "name": "John Doe" }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```
