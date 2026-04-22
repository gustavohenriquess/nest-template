# The Health Module

This template integrates `@nestjs/terminus` to provide advanced, enterprise-grade health checks. 

The health endpoints are exposed automatically via `src/health/interface/controllers/health.controller.ts`.

## 1. Liveness Check (`/v1/health`)
This is a lightweight endpoint designed for Kubernetes or Docker liveness probes. It returns instantly without checking external integrations.

**What it checks:**
- Basic memory heap limits (150MB threshold).
- Basic RSS memory usage (150MB threshold).

## 2. Readiness Check (`/v1/health/integrations`)
This is a heavy endpoint designed for load balancer readiness probes. It actively pings all external integrations to ensure the application is truly ready to handle traffic.

**What it checks:**
- **Prisma Database**: Executes a `SELECT 1` against PostgreSQL.
- **BigQuery**: Verifies dataset existence and connectivity.
- **Cloud Storage**: Verifies bucket accessibility.
- **Pub/Sub**: Verifies connectivity to GCP topics.

## Creating Custom Health Indicators

If you add a new external integration (e.g., Redis), you should create a custom indicator.

1. Create `redis.health.ts` in `src/health/application/indicators/`.
2. Extend `HealthIndicator`.
3. Add it to `health-integrations.service.ts`.

```typescript
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';

export class RedisHealthIndicator extends HealthIndicator {
  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    const isUp = await pingRedis();
    const result = this.getStatus(key, isUp);

    if (isUp) return result;
    throw new HealthCheckError('Redis failed', result);
  }
}
```
