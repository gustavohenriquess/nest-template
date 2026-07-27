---
id: docs.flow.update-role-use-case
title: Update Role Use Case Flow
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
  - update
related: []
---

<!-- ai:doc id="docs.flow.update-role-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case roles update -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Update Role Use Case

Este arquivo documenta o fluxo executado durante a atualização de um perfil (Role).

```mermaid
flowchart TD
    Start([Início: UpdateRoleUseCase.execute]) --> CheckID{Busca perfil no BD por ID}
    
    CheckID -- "Perfil não encontrado (null)" --> Err1[Throw EntityNotFoundError]
    CheckID -- "Perfil encontrado" --> CheckNameChange{O nome foi alterado no DTO?}
    
    CheckNameChange -- "Sim" --> CheckNameDB{Novo nome já existe no BD?}
    CheckNameDB -- "Sim" --> Err2[Throw ConflictError]
    CheckNameDB -- "Não" --> UpdateDB
    
    CheckNameChange -- "Não" --> UpdateDB[Atualiza entidade via RoleRepository.update]
    
    UpdateDB --> MapResponse[Mapeia para RoleResponseDto]
    MapResponse --> End(["Fim: Retorna RoleResponseDto"])
```
