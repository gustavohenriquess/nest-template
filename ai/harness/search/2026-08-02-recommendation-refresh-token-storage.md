---
id: ai.harness.recommendation-refresh-token-storage
title: Recomendação de armazenamento de Refresh Tokens (History Harness)
kind: history
category: harness
status: active
audience:
  - developers
  - ai-agents
tags:
  - history-harness
  - explain
  - auth
  - refresh-token
  - architecture
related: []
---

<!-- ai:doc id="ai.harness.recommendation-refresh-token-storage" category="harness" kind="history" status="active" -->
<!-- ai:tags history-harness explain auth refresh-token architecture -->
<!-- ai:audience developers ai-agents -->

# Recomendação de armazenamento de Refresh Tokens

## Objetivo da Busca
O usuário pediu uma recomendação arquitetural sobre a melhor abordagem para armazenar Refresh Tokens, equilibrando três requisitos simultâneos: necessidade de auditoria, suporte a múltiplos logins simultâneos e alta performance.

## Arquivos Analisados
- Análise conceitual arquitetural (sem necessidade de ler arquivos adicionais).

## Descobertas
- Recomendei a criação de uma tabela relacional de Sessões (`UserSession` ou `UserToken`) no PostgreSQL (via Prisma). Essa tabela permite armazenar metadados essenciais (Device, IP, Revogação) para garantir auditoria profunda e suporta múltiplas linhas por usuário (múltiplos logins).
- Expliquei que a preocupação com "performance" ao usar o BD Relacional para isso é mitigada pelo fato de o Refresh Token ser exigido com baixa frequência (ex: apenas 1 vez a cada 15 minutos por cliente), tornando o custo de I/O negligenciável em comparação com a validação contínua de Access Tokens.

**Solicitado por:** gustavo._henrique@hotmail.com
