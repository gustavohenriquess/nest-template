---
id: c4.context
title: C4 System Context Diagram
kind: documentation
category: architecture
status: active
audience:
  - everyone
tags:
  - c4
  - context
  - architecture
related: []
---

<!-- ai:doc id="c4.context" category="architecture" kind="documentation" status="active" -->
<!-- ai:tags c4 context architecture -->
<!-- ai:audience everyone -->

# System Context Diagram

Este diagrama (Nível 1) exibe o sistema da API NestJS em seu ambiente, destacando os sistemas e atores externos fundamentais com os quais interage.

```mermaid
C4Context
  title System Context - NestJS Backend Template

  Person(client, "Client Application", "Web, Mobile, ou sistema de terceiros consumindo a API REST")
  System(api, "NestJS API", "Sistema backend central fornecendo autenticação, controle de acesso (RBAC) e regras de negócio")
  
  SystemDb(database, "PostgreSQL", "Armazena dados de domínio (Users, Roles, Permissions, Refresh Tokens)")
  SystemDb(redis, "Redis", "Realiza cache em memória e mantém a Blacklist de JWTs revogados")
  System_Ext(telemetry, "OpenTelemetry Collector", "Recebe logs estruturados, métricas e traces distribuídos")

  Rel(client, api, "Consome API via", "HTTPS/REST")
  Rel(api, database, "Lê e grava dados persistentes em", "TCP")
  Rel(api, redis, "Lê e grava dados voláteis em", "TCP")
  Rel(api, telemetry, "Exporta dados de observabilidade para", "OTLP/HTTP")
```
