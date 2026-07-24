---
id: adr.health-module
title: Architecture Decision Record - Health Module
kind: adr
category: architecture
status: active
audience:
  - developers
  - ai-agents
tags:
  - architecture
  - adr
  - health
  - terminus
  - devops
related: []
---

<!-- ai:doc id="adr.health-module" category="architecture" kind="adr" status="active" -->
<!-- ai:tags architecture adr health terminus devops -->
<!-- ai:audience developers ai-agents -->

# ADR: Health Module Architecture

## Contexto
Em ambientes de orquestração modernos (como Kubernetes, Docker Swarm ou Cloud Run), a aplicação necessita expor *endpoints* claros para que os *healthchecks* informem corretamente o estado de "prontidão" (readiness) e "vivacidade" (liveness) da API.

## Decisões Arquiteturais
Para lidar com observabilidade e saúde do sistema, as seguintes decisões foram implementadas no `HealthModule` (em `src/health`):

1. **Uso do @nestjs/terminus**: Foi escolhida a biblioteca oficial do ecossistema NestJS para gerenciar as rotas de *healthcheck*.
2. **Verificações Específicas por Integração**: O módulo consolida e expõe verificações detalhadas do banco de dados relacional (Prisma), Cache em memória (Redis) e serviços em nuvem (PubSub/Storage/BigQuery).
3. **Isolamento de Domínio (Indicators)**: Seguindo o princípio de separação de camadas, a saúde de cada infraestrutura é testada em "Indicators" individuais na pasta `application/indicators`, e orquestrada num Controller unificado em `interface/controllers`.

## Consequências

### Positivas
- **Integração Imediata de DevOps**: Proporciona facilidade para times de SRE e infraestrutura diagnosticarem rapidamente se o serviço está íntegro ou o que exatamente está fora do ar.
- **Modularidade das Dependências**: O código de healthcheck de serviços de infraestrutura (como GCP) está centralizado, evitando espalhar lógicas de "ping" pelo sistema.

### Negativas
- **Falsos Positivos/Negativos**: Se uma verificação for excessivamente rigorosa (ex: timeout curto num Redis ocupado), a infraestrutura (como o K8s) pode matar e reiniciar a aplicação equivocadamente. As configurações dos *pingers* precisam de *fine-tuning* periódico.

<!-- ai:doc-end id="adr.health-module" -->
