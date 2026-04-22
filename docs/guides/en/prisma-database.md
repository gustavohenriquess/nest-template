# Prisma & Database Strategy

This template uses [Prisma ORM](https://www.prisma.io/) as the primary layer to interact with the PostgreSQL database.

## Architecture & Configuration

The core Prisma service is located at `src/core/infrastructure/persistence/prisma/prisma.service.ts`.
This service implements NestJS lifecycle hooks to automatically connect to the database upon startup and gracefully disconnect upon application shutdown.

### 1. Connecting (`OnModuleInit`)
During startup, `$connect()` is executed. If it fails, the application will crash explicitly, preventing a "zombie" API state where the web server is running but the database is unreachable.

### 2. Disconnecting (`OnModuleDestroy`)
When gracefully shutting down (e.g., via SIGTERM), `$disconnect()` ensures all connection pools are properly closed.

## Working with Prisma

### The Schema
Your data models should be defined in `prisma/schema.prisma`. 
After updating models, you must generate the client:
```bash
npx prisma generate
```

### Migrations
To push changes safely in development:
```bash
npx prisma migrate dev --name <migration-name>
```

For production deployment, the CI/CD pipeline or Docker entrypoint should run:
```bash
npx prisma migrate deploy
```

## E2E Testing with Prisma
We use an isolated database environment for E2E tests to avoid corrupting development data.
1. The `.env` variables point tests to a distinct schema or database.
2. We clean the database tables before each test suite runs to guarantee idempotency.
3. Seeding logic can be added in `test/utils/e2e-helper.ts` to pre-populate necessary testing data.
