# Testing Strategy

Quality is non-negotiable in an Enterprise application. This template is configured to reject any PR or commit that drops the overall test coverage below 90%.

## 1. Unit Tests (`*.spec.ts`)
Unit tests are co-located with their implementation files. We use `jest` for mocking and assertions.
- Focus on testing isolated business logic in the `domain` and `application` layers.
- Avoid testing framework specifics (like controllers) in unit tests; leave that for E2E.

**Run Unit Tests:**
```bash
npm run test
```

## 2. End-to-End (E2E) Tests (`test/*.e2e-spec.ts`)
E2E tests simulate real HTTP requests against the fully compiled NestJS application. 

### Database Isolation
E2E tests should NEVER run against the development database.
1. The `.env.test` (or dynamic setup) overrides the database URL to point to a test database.
2. We clean the tables before every suite to prevent state leakage between tests.

### Mocking External Providers (GCP)
We don't want tests failing because Google Cloud is down or credentials expired. 
Check `test/utils/e2e-helper.ts`. The `E2EHelper` intercepts the dependency injection tree and swaps real instances of `PubSubService`, `BigQueryService`, and `StorageService` with `jest.fn()` mocks.

**Run E2E Tests:**
```bash
npm run test:e2e
```

## 3. Coverage Gate
To view the coverage report locally:
```bash
npm run test:cov
```
This generates an HTML report in the `coverage/` folder. The GitHub Actions pipeline runs this command automatically and fails the build if the global threshold is missed.
