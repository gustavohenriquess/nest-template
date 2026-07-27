---
id: docs.flow.create-role-use-case
title: Create Role Use Case Flow
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
  - roles
  - create
related: []
---

<!-- ai:doc id="docs.flow.create-role-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case roles create -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Create Role Use Case

Este arquivo documenta o fluxo executado durante a criação de um perfil (Role).

```mermaid
flowchart TD
    Start([Início: CreateRoleUseCase.execute]) --> CheckName{Busca perfil no BD por nome}
    
    CheckName -- "Perfil já existe" --> Err1[Throw ConflictError]
    CheckName -- "Perfil não existe" --> CreateEntity[Instancia entidade Role]
    
    CreateEntity --> SaveDB[Salva no BD via RoleRepository.create]
    SaveDB --> MapResponse[Mapeia para RoleResponseDto]
    MapResponse --> End(["Fim: Retorna RoleResponseDto"])
```
