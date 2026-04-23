# NestJS Enterprise Template 🚀

[![CI Fast Integration](https://github.com/gustavohenriquess/nest-template/actions/workflows/integration.yml/badge.svg)](https://github.com/gustavohenriquess/nest-template/actions/workflows/integration.yml)
[![CI Stable Release](https://github.com/gustavohenriquess/nest-template/actions/workflows/production.yml/badge.svg)](https://github.com/gustavohenriquess/nest-template/actions/workflows/production.yml)

[🇺🇸 Read in English](README.md)

Um template NestJS altamente opinativo e pronto para produção, projetado para aplicações de escala corporativa. Ele conta com observabilidade avançada, pipelines CI/CD modulares, validação estrita e uma arquitetura inspirada em Domain-Driven Design (DDD).

## ⚡ Visão Geral das Funcionalidades
- **Observabilidade**: Tracing com OpenTelemetry e logs JSON via Pino com ocultação de dados sensíveis (PII).
- **Resiliência e Segurança**: Rate limiting, Helmet, CORS e Graceful Shutdown.
- **DX e Automação**: Changelog padronizado, Git hooks (Husky) e um `Makefile` completo.
- **Padronização de API**: Versionamento nativo (`/v1`), validação com Zod e utilitários genéricos de paginação.
- **Banco de Dados e Nuvem**: Prisma ORM, integrações nativas GCP (BigQuery, Pub/Sub, Storage) com testes de vida ativos via terminus.

## 🚀 Como Iniciar (Quick Start)

1. **Clonar e Configurar**
   ```bash
   git clone https://github.com/gustavohenriquess/nest-template.git my-api
   cd my-api
   cp .env.example .env
   ```

2. **Setup Automatizado (Docker + Dependências + Prisma)**
   ```bash
   make setup
   ```

3. **Iniciar a Aplicação**
   ```bash
   make start
   ```

> A API estará disponível em `http://localhost:3000/v1/health`.  
> A documentação Swagger estará disponível em `http://localhost:3000/docs`.

## 📚 Documentação Detalhada

Para entender as decisões de design e aprender como usar as funcionalidades avançadas, consulte nossos guias detalhados:

### Arquitetura e Padrões
* [Arquitetura e Estrutura](docs/guides/pt-br/architecture.md)
* [Design System e Convenções](docs/guides/pt-br/design-system.md)
* [Estratégia de Testes](docs/guides/pt-br/testing.md)
* [Observabilidade e Telemetria](docs/guides/pt-br/observability.md)
* [Performance e Otimização](docs/guides/pt-br/performance.md)

### Implementação de Módulos
* [Validação e Zod (`@UseZodSchema`)](docs/guides/pt-br/validation-zod.md)
* [Utilitários de Paginação](docs/guides/pt-br/pagination.md)
* [O Módulo de Health](docs/guides/pt-br/health-module.md)
* [Prisma e Banco de Dados](docs/guides/pt-br/prisma-database.md)
* [Integrações GCP](docs/guides/pt-br/gcp-integrations.md)

### DevOps e Automação
* [Pipelines CI/CD e Releases](docs/guides/pt-br/ci-cd-releases.md)
* [Changelogs Históricos (Versões)](docs/changelogs/)

---
*Construído com ❤️ para ecossistemas Node.js modernos.*
