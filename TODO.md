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
- [ ] **Correlation IDs (Trace + Log)**
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
- [ ] **Garantir 100% de Coverage nas Novas Funcionalidades**
  - Testes unitários para filtros e interceptores globais.
  - Testes de validação de schema de variáveis de ambiente.
