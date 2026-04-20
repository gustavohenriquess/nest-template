# 📝 Template Roadmap & TODO

Lista de melhorias planejadas para elevar o template para um padrão "Enterprise-Ready".

---

## 🛠 Core & Arquitetura
- [x] **Validação de Ambiente (Zod)**
  - [x] Criar `src/core/config/env.schema.ts`.
  - [x] Impedir o boot da aplicação se variáveis obrigatórias estiverem ausentes.
- [x] **Global Exception Filter**
  - [x] Padronizar respostas de erro (JSON uniforme).
  - [x] Mapear erros de domínio/entidade para status HTTP corretos.
- [x] **Global Response Interceptor**
  - [x] Envelopar sucessos em um padrão consistente (ex: `{ data: ... }`).

## 🔍 Observabilidade & Logs
- [x] **Correlation IDs (Trace + Log)**
  - Injetar `traceId` nos logs emitidos pelo `Logger` do NestJS.
  - Facilitar a busca de logs no Grafana/Datadog via ID de rastreio.
- [x] **Monitoramento de Resource Usage**
  - Adicionar métricas de memória/CPU ao Health Check.

## 📖 Documentação & DX
- [x] **Swagger (OpenAPI) Integration**
  - Configurar `SwaggerModule` no `main.ts`.
  - Adicionar metadados básicos às rotas de saúde.
- [x] **Makefile / Automação**
  - Criar `Makefile` com comandos: `make setup`, `make test`, `make db-up`, `make prisma-gen`.
- [x] **Docker Hot Reload**
  - Configurar volumes no `docker-compose.yml`.
  - Habilitar watch mode dentro do container.

## 🧪 Qualidade & Testes
- [x] **Garantir 100% de Coverage nas Novas Funcionalidades**
  - [x] Testes unitários para filtros e interceptores globais.
  - [x] Testes de validação de schema de variáveis de ambiente.
  - [x] Testes de infraestrutura (Tracing, Context, Logger).
- [x] **Shield de Commit (Husky + Lint-staged)**
  - Impedir commits que quebrem o Lint ou falhem nos testes.
  - Otimizar rastro de build com verificações automáticas pré-commit.

## 🛡️ Segurança & Resiliência
- [x] **Security Hardening (Helmet)**
  - Configurar cabeçalhos HTTP seguros para mitigar vulnerabilidades comuns (XSS, Clickjacking).
- [x] **Controle de Origem (CORS)**
  - Implementar política de CORS robusta para permitir apenas domínios autorizados.
- [x] **Rate Limiting (Controlador de Tráfego)**
  - Implementar limite de requisições por IP/User para prevenir abusos e ataques DoS/Brute-force.

## ⚡ Performance & Produção
- [x] **Logging de Alta Performance (Pino)**
  - Migrar para o Pino para logging assíncrono e estruturado (JSON).
  - Integrar o Correlation ID nativamente nos mixins do Pino.
- [x] **Otimização de Imagens Docker**
  - Revisar imagens alpine e garantir usuários não-root para máxima segurança em cluster.
- [x] **Graceful Shutdown (Desligamento Suave)**
  - [x] Implementar `app.enableShutdownHooks()` no `main.ts`.
  - [x] Garantir o fechamento correto do SDK do OpenTelemetry e conexões Prisma.

## 🚀 Enterprise Hardening
- [x] **Redação de Logs (Segurança)**
  - [x] Configurar `redact` no Pino para omitir campos sensíveis (passcodes, tokens, PII).
- [ ] **Validação Global de Entrada (Zod/Pipes)**
  - Implementar um Pipe global para validar todos os inputs da API automaticamente.
- [ ] **Health Checks Reais (Terminus)**
  - Expandir o Health Check para monitorar DB e PubSub ativamente com `@nestjs/terminus`.
- [ ] **Infraestrutura de Testes E2E**
  - Criar helpers para isolamento e seeding de banco de dados nos testes E2E.
- [ ] **Automação de CI/CD (GitHub Actions)**
  - Criar workflows para build, lint e testes automáticos em cada commit.
