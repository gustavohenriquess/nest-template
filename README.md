# NestJS Enterprise Template 🚀

[![CI Fast Integration](https://github.com/gustavohenriquess/nest-template/actions/workflows/integration.yml/badge.svg)](https://github.com/gustavohenriquess/nest-template/actions/workflows/integration.yml)
[![CI Stable Release](https://github.com/gustavohenriquess/nest-template/actions/workflows/production.yml/badge.svg)](https://github.com/gustavohenriquess/nest-template/actions/workflows/production.yml)

[🇧🇷 Leia em Português](README.pt-BR.md)

A highly opinionated, production-ready NestJS template designed for enterprise-scale applications. It features advanced observability, modular CI/CD pipelines, strict validation, and an architecture inspired by Domain-Driven Design (DDD).

## ⚡ Features Overview
- **Observability**: OpenTelemetry tracing, Pino JSON logging with PII redaction.
- **Resilience & Security**: Rate limiting, Helmet, CORS, and Graceful Shutdown.
- **DX & Automation**: Standardized Changelog, Git hooks (Husky), and a comprehensive `Makefile`.
- **API Standardization**: URI Versioning (`/v1`), Zod validation, and generic pagination utilities.
- **Database & Cloud**: Prisma ORM, GCP integrations (BigQuery, Pub/Sub, Storage) with active terminus health checks.

## 🚀 Quick Start

1. **Clone and Setup**
   ```bash
   git clone https://github.com/gustavohenriquess/nest-template.git my-api
   cd my-api
   cp .env.example .env
   ```

2. **Automated Setup (Docker + Dependencies + Prisma)**
   ```bash
   make setup
   ```

3. **Start the Application**
   ```bash
   make start
   ```

> The API will be available at `http://localhost:3000/v1/health`.  
> Swagger Documentation is available at `http://localhost:3000/docs`.

## 📚 Detailed Documentation

To understand the core design decisions and learn how to use the advanced features, please refer to our detailed guides:

### Architecture & Standards
* [Architecture & Structure](docs/guides/en/architecture.md)
* [Design System & Conventions](docs/guides/en/design-system.md)
* [Testing Strategy](docs/guides/en/testing.md)
* [Observability & Telemetry](docs/guides/en/observability.md)
* [Authentication & Authorization (IAM)](docs/guides/en/authentication.md)
* [Performance & Optimization](docs/guides/en/performance.md)

### Feature Implementations
* [Validation & Zod (`@UseZodSchema`)](docs/guides/en/validation-zod.md)
* [Pagination Utilities](docs/guides/en/pagination.md)
* [The Health Module](docs/guides/en/health-module.md)
* [Prisma & Database](docs/guides/en/prisma-database.md)
* [GCP Integrations](docs/guides/en/gcp-integrations.md)

### DevOps & Automation
* [CI/CD & Release Automation](docs/guides/en/ci-cd-releases.md)
* [Historical Changelogs (Versions)](docs/changelogs/)

---
*Built with ❤️ for modern Node.js ecosystems.*
