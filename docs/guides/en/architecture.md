# Architecture & Structure

This template enforces a highly decoupled architecture inspired by **Domain-Driven Design (DDD)** and **Clean Architecture**. This ensures the business logic remains isolated from the framework and external infrastructure.

## Folder Structure

The `src/` directory is logically separated by feature domains. Inside each domain, you'll find the following layers:

```text
src/
├── core/                   # Global utilities, interceptors, and DTOs
└── my-feature/
    ├── application/        # Use cases, application services, and external listeners
    ├── domain/             # Business entities, Value Objects, and core logic
    ├── infrastructure/     # Database repositories, external API adapters
    └── interface/          # HTTP Controllers, GraphQL resolvers, WebSocket gateways
```

### The 4 Layers Explained
1. **Interface**: The entry point. Controllers receive HTTP requests, DTOs validate them via Zod, and then they call the Application layer.
2. **Application**: The orchestrator. Services here dictate the "flow" (e.g., fetch from DB -> calculate -> emit event -> return).
3. **Domain**: The heart of the software. Contains pure TypeScript classes (`Entity`, `ValueObject`) with zero dependencies on NestJS or Prisma.
4. **Infrastructure**: The implementation details. Repositories interacting with Prisma, adapters for external APIs, and GCP services live here.

## Benefits of this Pattern
- **Testability**: You can unit test Domain and Application layers without mocking a database.
- **Maintainability**: If you decide to swap REST for GraphQL, you only change the `interface` layer.
- **Scalability**: When the codebase grows to 500+ files, developers immediately know exactly where a specific piece of logic belongs.
