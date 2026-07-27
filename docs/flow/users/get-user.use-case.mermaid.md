---
id: docs.flow.get-user-use-case
title: Get User Use Case Flow
kind: documentation
category: flow
status: active
audience:
  - developers
  - ai-agents
tags:
  - flow
  - mermaid
  - use-case
  - users
  - get
related: []
---

<!-- ai:doc id="docs.flow.get-user-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case users get -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Get User Use Case

Este arquivo documenta o fluxo executado durante a busca de um único usuário (User) pelo ID.

```mermaid
flowchart TD
    Start([Início: GetUserUseCase.execute]) --> CheckID{Busca usuário no BD por ID}
    
    CheckID -- "Usuário não encontrado (null)" --> Err1[Throw EntityNotFoundError]
    CheckID -- "Usuário encontrado" --> MapResponse[Mapeia para UserResponseDto]
    
    MapResponse --> End(["Fim: Retorna UserResponseDto"])
```
