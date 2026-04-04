# 📝 Template Roadmap & TODO

Lista de melhorias planejadas para elevar o template para um padrão "Enterprise-Ready".

---

## 🛠 Core & Arquitetura
- [x] **Validação de Ambiente (Zod)**
  - [x] Criar `src/core/config/env.schema.ts`.
  - [x] Impedir o boot da aplicação se variáveis obrigatórias estiverem ausentes.
- [ ] **Global Exception Filter**
  - Padronizar respostas de erro (JSON uniforme).
  - Mapear erros de domínio/entidade para status HTTP corretos.
- [x] **Global Response Interceptor**
  - [x] Envelopar sucessos em um padrão consistente (ex: `{ data: ... }`).

## 🔍 Observabilidade & Logs
- [ ] **Correlation IDs (Trace + Log)**
  - Injetar `traceId` nos logs emitidos pelo `Logger` do NestJS.
  - Facilitar a busca de logs no Grafana/Datadog via ID de rastreio.
- [ ] **Monitoramento de Resource Usage**
  - Adicionar métricas de memória/CPU ao Health Check.

## 📖 Documentação & DX
- [ ] **Swagger (OpenAPI) Integration**
  - Configurar `SwaggerModule` no `main.ts`.
  - Adicionar metadados básicos às rotas de saúde.
- [ ] **Makefile / Automação**
  - Criar `Makefile` com comandos: `make setup`, `make test`, `make db-up`, `make prisma-gen`.

## 🧪 Qualidade & Testes
- [ ] **Garantir 100% de Coverage nas Novas Funcionalidades**
  - Testes unitários para filtros e interceptores globais.
  - Testes de validação de schema de variáveis de ambiente.
