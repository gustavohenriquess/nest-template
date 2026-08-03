---
id: c4.containers
title: C4 Container Diagram
kind: documentation
category: architecture
status: active
audience:
  - developers
  - architects
tags:
  - c4
  - containers
  - architecture
related:
  - path: ./c4-context.md
    label: C4 Context Diagram
    relation: parent
---

<!-- ai:doc id="c4.containers" category="architecture" kind="documentation" status="active" -->
<!-- ai:tags c4 containers architecture -->
<!-- ai:audience developers architects -->

# Container Diagram

Este diagrama (Nível 2) expande as fronteiras internas da API NestJS, detalhando os módulos principais de negócio e infraestrutura.

```mermaid
C4Container
  title Container Diagram - NestJS API

  Person(client, "Client Application", "Consome os endpoints REST")

  System_Boundary(backend, "NestJS API System") {
    Container(authModule, "Auth Module", "NestJS Module", "Gerencia a autenticação, geração de JWT (Access/Refresh) e Blacklist")
    Container(usersModule, "Users Module", "NestJS Module", "Gerencia o ciclo de vida e o perfil dos usuários")
    Container(rbacModule, "RBAC Modules", "NestJS Modules", "Gerencia Perfis (Roles) e Permissões")
    Container(coreModule, "Core Module", "NestJS Module", "Provedor global de Interceptors, Filters, Log (Pino) e OpenTelemetry")
    Container(prisma, "Prisma ORM", "TypeScript", "Camada de acesso a dados abstraída")
  }

  ContainerDb(postgres, "PostgreSQL Database", "PostgreSQL", "Armazena Users, Roles, Permissions e Sessions")
  ContainerDb(redis, "Redis Cache", "Redis", "Mantém cache de alta velocidade e JWT Blacklist")
  Container_Ext(otel, "OTel Collector", "OpenTelemetry", "Backend de observabilidade e métricas")

  Rel(client, authModule, "Autentica via", "JSON/HTTPS")
  Rel(client, usersModule, "Gerencia usuários via", "JSON/HTTPS")
  Rel(client, rbacModule, "Gerencia acessos via", "JSON/HTTPS")

  Rel(authModule, prisma, "Usa para acesso relacional")
  Rel(authModule, redis, "Consulta e grava Blacklist de tokens")
  Rel(usersModule, prisma, "Usa para acesso relacional")
  Rel(rbacModule, prisma, "Usa para acesso relacional")

  Rel(prisma, postgres, "Lê/Grava no banco", "TCP")
  Rel(coreModule, otel, "Exporta traces/metrics", "OTLP/HTTP")
```
