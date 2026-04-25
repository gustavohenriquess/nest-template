# Multi-tenancy and Row-Level Security with Prisma

This guide explains how to implement automatic data filtering based on the logged-in user using **Prisma Extensions** and **RequestContext** (based on `AsyncLocalStorage`).

## 1. The Concept

For Prisma to know who the current user is without passing the `user` object to every function, we use `RequestContext`. It works as an isolated storage per HTTP request.

## 2. Context Infrastructure

### RequestContext (`src/core/infrastructure/context/request-context.ts`)
Centralizes access to the current request data.

```typescript
// Usage example anywhere in the system
const user = RequestContext.user;
console.log(user.sub);
```

### ContextMiddleware (`src/core/infrastructure/context/context.middleware.ts`)
Global middleware that initializes the context lifecycle for every new request.

```typescript
// Automatically registered in AppModule
consumer.apply(ContextMiddleware).forRoutes('*');
```

## 3. Authentication Integration

Context population happens in `JwtStrategy`. Once Passport validates the JWT, the user is injected into the `RequestContext`:

```typescript
// src/core/auth/strategies/jwt.strategy.ts
validate(payload: any) {
  const user = { ... };
  RequestContext.user = user; // Context populated here!
  return user;
}
```

## 4. Implementing RLS with Prisma Extension

Now, your `PrismaService` can use this context to filter data invisibly:

```typescript
// src/core/persistence/prisma/prisma.service.ts
readonly safe = this.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, args, query }) {
        const user = RequestContext.user;

        if (user && ['findMany', 'findFirst', 'count'].includes(operation)) {
          args.where = { ...args.where, tenantId: user.sub };
        }

        return query(args);
      },
    },
  },
});
```

## 5. Advantages and Considerations

### Advantages:
- **Passive Security:** Eliminates the risk of forgetting security filters in new queries.
- **Clean Code:** Removes authorization noise from the business logic in Services.
- **Auditability:** Centralizes all data access rules in one place.

### Considerations:
- **Write Operations:** You can also extend to `create`, `update`, and `delete` to ensure a user doesn't modify others' data.
- **Intentional Bypass:** If you need an administrative query that ignores filters, just use `this.prisma` (the base instance) instead of `this.prisma.safe`.
- **Performance:** Query extensions have a minimal processing cost, which is unnoticeable in most applications.

---
*This pattern ensures security and Clean Code.*
