---
id: docs.flow.create-user-use-case
title: Create User Use Case Flow
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
  - create
related: []
---

<!-- ai:doc id="docs.flow.create-user-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case users create -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Create User Use Case

Este arquivo documenta o fluxo executado durante a criação de um usuário (User).

```mermaid
flowchart TD
    Start([Início: CreateUserUseCase.execute]) --> CheckEmail{Busca usuário no BD por e-mail}
    
    CheckEmail -- "E-mail já está em uso" --> Err1[Throw ConflictError]
    CheckEmail -- "E-mail não está em uso" --> HashPassword[Faz hash da senha com argon2]
    
    HashPassword --> CreateEntity["Instancia entidade User (status: PENDING)"]
    CreateEntity --> SaveDB[Salva no BD via UserRepository.create]
    SaveDB --> MapResponse[Mapeia para UserResponseDto]
    MapResponse --> End(["Fim: Retorna UserResponseDto"])
```
