---
id: docs.flow.update-user-use-case
title: Update User Use Case Flow
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
  - update
related: []
---

<!-- ai:doc id="docs.flow.update-user-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case users update -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Update User Use Case

Este arquivo documenta o fluxo executado durante a atualização de um usuário (User).

```mermaid
flowchart TD
    Start([Início: UpdateUserUseCase.execute]) --> LogInfo[Gera log de info]
    LogInfo --> CheckID{Busca usuário no BD por ID}
    
    CheckID -- "Usuário não encontrado (null)" --> Err1[Throw EntityNotFoundError]
    CheckID -- "Usuário encontrado" --> CheckEmailChange{O e-mail foi alterado no DTO?}
    
    CheckEmailChange -- "Sim" --> CheckEmailDB{Novo e-mail já existe no BD?}
    CheckEmailDB -- "Sim" --> Err2[Throw ConflictError]
    CheckEmailDB -- "Não" --> CheckPassword
    
    CheckEmailChange -- "Não" --> CheckPassword{A senha foi enviada no DTO?}
    
    CheckPassword -- "Sim" --> HashPassword[Faz hash com argon2] --> UpdateDB
    CheckPassword -- "Não" --> UpdateDB[Atualiza entidade via UserRepository.update]
    
    UpdateDB --> MapResponse[Mapeia para UserResponseDto]
    MapResponse --> End(["Fim: Retorna UserResponseDto"])
```
