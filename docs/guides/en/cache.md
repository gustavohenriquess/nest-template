# Redis Cache Module

This template features a custom, high-performance, Redis-backed global Cache Module built on top of `ioredis` and NestJS Interceptors. It provides decorator-driven caching for HTTP endpoints and a non-blocking namespace versioning strategy for cache invalidation.

The Cache Module is globally registered in `src/app.module.ts` and the services/decorators are exposed under `src/core/cache/`.

---

## ⚙️ Configuration (Environment Variables)

To enable and configure caching, add the following variables to your `.env` file (see examples in `.env.example`):

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `CACHE_ENABLED` | `boolean` | `false` | Master toggle to enable or disable the Redis cache module. |
| `REDIS_HOST` | `string` | `localhost` | Redis instance hostname/IP address. |
| `REDIS_PORT` | `number` | `6379` | Redis instance port. |
| `REDIS_PASSWORD` | `string` | `undefined` | Optional password for Redis authentication. |
| `CACHE_DEFAULT_TTL` | `number` | `60` | Default cache duration (Time To Live) in seconds. |

If `CACHE_ENABLED` is set to `false`, the cache client will not initialize and the global interceptor will bypass caching entirely, directing all traffic directly to your controllers without performance overhead.

---

## 🚀 Key Caching Decorators

Caching is applied declaratively using controller decorators:

### 1. `@Cache()`
Saves endpoint responses in Redis. It can be used without parameters or with customized options:

* `@Cache()` — Uses the controller name as the namespace, with the default TTL.
* `@Cache('custom-key')` — Uses a custom namespace/key prefix.
* `@Cache(120)` — Overrides the default TTL to 120 seconds.
* `@Cache('custom-key', 120)` — Uses a custom namespace and overrides TTL.

#### Example:
```typescript
import { Controller, Get } from '@nestjs/common';
import { Cache } from '@/core/cache/decorators/cache.decorator';

@Controller('users')
export class UsersController {
  @Get()
  @Cache(30) // Caches the response for 30 seconds using namespace "UsersController"
  async getUsers() {
    return this.usersService.findAll();
  }

  @Get('featured')
  @Cache('featured-users', 300) // Custom namespace and TTL of 5 minutes
  async getFeatured() {
    return this.usersService.findFeatured();
  }
}
```

### 2. `@InvalidateCache()`
Invalidates cached entries of a specific namespace.

* `@InvalidateCache()` — Invalidates the current controller's default namespace (i.e. the controller class name).
* `@InvalidateCache('custom-key')` — Invalidates a specific custom namespace (e.g. `'featured-users'`).

#### Example:
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { InvalidateCache } from '@/core/cache/decorators/invalidate-cache.decorator';

@Controller('users')
export class UsersController {
  @Post()
  @InvalidateCache() // Auto-invalidates "UsersController" cache namespace on success
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Post('featured')
  @InvalidateCache('featured-users') // Invalidates the specific "featured-users" cache namespace
  async createFeaturedUser(@Body() dto: CreateUserDto) {
    return this.usersService.createFeatured(dto);
  }
}
```

---

## 🧠 Non-Blocking Cache Invalidation Strategy

Unlike traditional cache invalidation methods that scan Redis using expensive commands like `KEYS` or `SCAN` (which can block the Redis event loop in production), this module uses a **Namespace Versioning** strategy:

1. **Cache Key Structure**:
   Cache keys are generated dynamically in the `CacheInterceptor`:
   ```
   {namespace}:v{version}:{handlerName}:{serializedQueryAndParams}
   ```
   * `namespace`: The cache key or controller name (e.g., `UsersController`).
   * `version`: A counter retrieved from Redis (`version:{namespace}`) defaulting to `0`.
   * `handlerName`: The controller method name (e.g., `getUsers`).
   * `serializedQueryAndParams`: Stringified HTTP request query parameters and route parameters, ensuring different inputs receive uniquely cached results.

2. **How Invalidation Works**:
   When `@InvalidateCache('namespace')` is triggered:
   - It runs an atomic `INCR` operation in Redis: `INCR version:{namespace}`.
   - The namespace version changes (e.g. from `0` to `1`).
   - Subsequent `GET` requests check for cache using the key containing `:v1:`, causing a cache miss.
   - New content is fetched and cached under `:v1:`.
   - The old cache keys containing `:v0:` are left in Redis to expire naturally according to their TTL, without impacting database/application performance.

---

## 📊 API Response Metadata (`cached` flag)

To allow client applications to easily identify if a response was served from the cache, the interceptor pipeline stamps a `cached` boolean property inside the response's `meta` envelope.

- **Cache Hit**: `meta.cached: true` (served from Redis)
- **Cache Miss / Cache Disabled**: `meta.cached: false` (served from database/service)

### Example Response:
```json
{
  "meta": {
    "timestamp": "2026-06-27T02:00:00.000Z",
    "path": "/v1/health/integrations",
    "correlationId": "85ef0db0-9b48-4cb9-994f-a94f31c26b31",
    "filters": {},
    "cached": true
  },
  "data": {
    "status": "ok",
    "info": {
      "prisma_default": { "status": "up" },
      "redis": { "status": "up" }
    }
  }
}
```

This works via cooperation between `CacheInterceptor` (which flags `req.isCached = true` on the NestJS request object on cache hits) and `TransformInterceptor` (which injects the boolean field into the serialized output response wrapper).

---

## 🏥 Redis Health Check Integration

The system health indicators automatically adapt to your cache status. If `CACHE_ENABLED` is true, the `RedisHealthIndicator` is automatically added to the integrations readiness checklist:

* **Endpoint**: `/v1/health/integrations`
* **Behavior**: Pings the Redis client (`ping()`). If Redis fails to respond with `'PONG'`, the readiness check fails, returning a `503 Service Unavailable` status.

---

## 🐳 Docker Compose Integration

A lightweight `redis` service using `redis:7-alpine` is configured inside `docker-compose.yml`. It runs automatically when launching the stack via:

```bash
make start
```
By default, the container maps Redis to port `6379` on the host machine.
