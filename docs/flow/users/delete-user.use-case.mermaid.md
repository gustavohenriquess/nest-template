---
id: docs.flow.delete-user-use-case
title: Delete User Use Case Flow
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
  - delete
related: []
---

<!-- ai:doc id="docs.flow.delete-user-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case users delete -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Delete User Use Case

Este arquivo documenta o fluxo executado durante a remoção de um usuário (User).

```mermaid
flowchart TD
    Start([Início: DeleteUserUseCase.execute]) --> CheckID{Busca usuário no BD por ID}
    
    CheckID -- "Usuário não encontrado (null)" --> Err1[Throw EntityNotFoundError]
    CheckID -- "Usuário encontrado" --> DeleteDB[Remove entidade via UserRepository.delete]
    
    DeleteDB --> End(["Fim: Retorna void"])
```
