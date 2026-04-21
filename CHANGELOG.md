# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### 0.0.2 (2026-04-21)


### Features

* Add GCP Storage service and tests, introduce logging middleware tests, and enhance PubSub error handling tests. ([20d0fad](https://github.com/gustavohenriquess/nest-template/commit/20d0fad7b77b4c688c20d377f8dbd9d53d6d1f93))
* Add Google Cloud Platform (GCP) BigQuery and Pub/Sub integration with a new health check endpoint. ([2de298a](https://github.com/gustavohenriquess/nest-template/commit/2de298ad0dff83517f2b33403ebbd95735b9a75f))
* add graceful shutdown and enterprise hardening tasks to TODO list ([dbaaa9d](https://github.com/gustavohenriquess/nest-template/commit/dbaaa9d80abc94a6fc9a143897ed86d20dc16c6a))
* add Makefile for project automation and update task status in TODO.md ([bfc841a](https://github.com/gustavohenriquess/nest-template/commit/bfc841ac273fe03dd522f421d96adcc4e9fad0c5))
* add OpenTelemetry and observability configuration variables to .env.example ([f5318a3](https://github.com/gustavohenriquess/nest-template/commit/f5318a3cdaa4ce5b7fae4c9b23d5469de71aea5b))
* add roadmap items for CI/CD, security hardening, and performance optimizations to TODO.md ([e621d4c](https://github.com/gustavohenriquess/nest-template/commit/e621d4c418db5da1f189620cc18c41f63b6d61b3))
* add system metrics including memory usage, CPU load, and uptime to health check endpoint ([a3cd5dd](https://github.com/gustavohenriquess/nest-template/commit/a3cd5ddc9e47d3d54f36dc701e435a8f80831994))
* add versioning, IDE standardization, security auditing, and error code catalog tasks to TODO list ([f816d2f](https://github.com/gustavohenriquess/nest-template/commit/f816d2f693e097b0b9a0f1f9fae910851008aaca))
* configure docker hot reload with volume mapping and update makefile commands ([1795122](https://github.com/gustavohenriquess/nest-template/commit/179512217eab1f50b42a25f09f6351be9c4ba263))
* configure pino logger redaction for sensitive fields and add custom serialization masking ([6e7ff85](https://github.com/gustavohenriquess/nest-template/commit/6e7ff85b6b745790c847a6c25eed2a9b096f6166))
* establish initial NestJS project structure with core DDD entities, Zod validation, and a health check module. ([43d7d72](https://github.com/gustavohenriquess/nest-template/commit/43d7d72dc4caad346ab649ac670cce8fd5cebb0d))
* implement 90% test coverage threshold and add CI workflow for coverage validation ([b51cb3d](https://github.com/gustavohenriquess/nest-template/commit/b51cb3db523fd2df7c84bc2dc0b70657596f1b05))
* implement centralized logging with Loki and Grafana integration via OpenTelemetry ([a3cb2c7](https://github.com/gustavohenriquess/nest-template/commit/a3cb2c74dfeade259bd4fe36943361b6c32395b9))
* implement configurable CORS policy with environment validation ([7511662](https://github.com/gustavohenriquess/nest-template/commit/7511662ca1644996f8090eb213fe4ed860ead44e))
* implement correlation ID middleware and custom logger with AsyncLocalStorage support ([3764afe](https://github.com/gustavohenriquess/nest-template/commit/3764afe41789a5248c72818f4e3d7638b920ba8d))
* implement E2E testing infrastructure with database and application helpers ([f5a7c00](https://github.com/gustavohenriquess/nest-template/commit/f5a7c0011a40fa25c64e889e931e4a463473cdc3))
* implement GitHub Actions CI workflows for quality checks, unit tests, and E2E testing ([be45ee4](https://github.com/gustavohenriquess/nest-template/commit/be45ee4bad601a859ff73ef2a1864d1df7ed8c3b))
* implement global exception filter and domain error hierarchy to standardize API error responses ([78ce683](https://github.com/gustavohenriquess/nest-template/commit/78ce683fa580406e78a17412ffc8fd5c778aa105))
* implement global rate limiting using @nestjs/throttler ([521d630](https://github.com/gustavohenriquess/nest-template/commit/521d6305ffe81810f6f9c6f218212e7c8ec26170))
* implement global response interceptor with metadata support and auto-transformation ([23b14fa](https://github.com/gustavohenriquess/nest-template/commit/23b14fa7a956fe2c6017f762299b9a4a2dcb232e))
* implement global Zod validation pipe with schema decorator support ([5cba8dc](https://github.com/gustavohenriquess/nest-template/commit/5cba8dc8e1c24efc237217b0c9a945395c372abb))
* implement helmet middleware for HTTP security hardening ([6e0a31d](https://github.com/gustavohenriquess/nest-template/commit/6e0a31dba8ef76d2359f10341ef6a5fb407d3009))
* implement LifecycleService to handle graceful shutdown and OpenTelemetry SDK termination ([299f582](https://github.com/gustavohenriquess/nest-template/commit/299f5823390b45e0150990571ccefefea6e2312b))
* implement OpenTelemetry distributed tracing with OTLP collector and Jaeger integration ([475f5b4](https://github.com/gustavohenriquess/nest-template/commit/475f5b4b27c3cd3d252d539a269a7a10a71326a1))
* implement Swagger API documentation with standardized response DTOs and health controller annotations ([1ee4cdf](https://github.com/gustavohenriquess/nest-template/commit/1ee4cdf6440bb120fbd8321c489b1d27b8d33d35))
* implement Zod-based environment variable validation and add project roadmap ([7920e87](https://github.com/gustavohenriquess/nest-template/commit/7920e87c5f557943737b983ba4be11f4952e615c))
* integrate husky and lint-staged to enforce code quality on pre-commit ([6e0a290](https://github.com/gustavohenriquess/nest-template/commit/6e0a29032befdf2cdc7b214f2d4f12b59f7fc6f5))
* Integrate NestJS ConfigModule to manage environment variables and configure service providers dynamically. ([460f25b](https://github.com/gustavohenriquess/nest-template/commit/460f25b98adc10911fc5364be58410259f717e9f))
* Introduce Docker Compose setup for PostgreSQL, configure Prisma for database connections, and add multi-database initialization script. ([126f539](https://github.com/gustavohenriquess/nest-template/commit/126f5393d06cf10ec870d99ff13fd51389f0836a))
* Introduce Docker setup and refactor GCP service error handling and integration health checks. ([642d679](https://github.com/gustavohenriquess/nest-template/commit/642d679e3d5f334b2bf63c5607050cc32e161970))
* mark health checks implementation as complete in TODO list ([1466de7](https://github.com/gustavohenriquess/nest-template/commit/1466de742017e49ba4cf7f1907152871f82015fc))
* migrate health checks to @nestjs/terminus with custom indicators for Prisma, BigQuery, PubSub, and Storage ([1dace3b](https://github.com/gustavohenriquess/nest-template/commit/1dace3b46733df0a8d754e96f2309b5902c98a77))
* Refactor health checks to support multiple integrations, introduce Prisma ORM with a dedicated service, and add a global logging middleware. ([38ab46c](https://github.com/gustavohenriquess/nest-template/commit/38ab46c989bf753b00775ad3c16ab9f11b48bfd0))
