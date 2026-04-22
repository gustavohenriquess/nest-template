# Design System & Conventions

In this backend template, the "Design System" refers to the strict standardization of API responses, error handling, and coding conventions. This ensures that frontend applications consuming this API can rely on a highly predictable contract.

## 1. Standardized Error Handling

All unhandled exceptions and HTTP errors are intercepted by the `GlobalExceptionFilter` (`src/core/filters/global-exception.filter.ts`).

### The Error Response Contract
Instead of raw stack traces or varying error structures, the API **always** returns the following JSON envelope upon failure:

```json
{
  "success": false,
  "error": {
    "code": "APP-400",
    "message": "Validation failed",
    "details": ["email is invalid", "age must be positive"]
  },
  "meta": {
    "timestamp": "2026-04-22T12:00:00Z",
    "path": "/v1/users",
    "correlationId": "req-1234-abcd"
  }
}
```
**Benefits:**
- The frontend can simply check `success === false`.
- The `correlationId` maps directly to your OpenTelemetry and Pino logs, making debugging a breeze.

## 2. Standardized Success Responses

Similarly, successful responses are enveloped using `TransformResponseInterceptor`.

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe"
  },
  "meta": {
    "timestamp": "2026-04-22T12:00:00Z"
  }
}
```

*Note: For lists, we use the `PaginatedResponseDto` which replaces `data` with an array and enriches `meta` with pagination details.*

## 3. Domain Errors

We avoid throwing raw `new Error()` inside our application layers. Instead, we use `DomainError` from `src/core/errors/domain.error.ts`. This allows you to attach standardized App Codes (e.g., `APP-404`) that the `GlobalExceptionFilter` can translate into HTTP status codes gracefully.
