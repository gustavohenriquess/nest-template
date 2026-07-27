---
id: docs.flow.update-permission-use-case
title: Update Permission Use Case Flow
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
  - permissions
  - update
related: []
---

<!-- ai:doc id="docs.flow.update-permission-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case permissions update -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Update Permission Use Case

Este arquivo documenta o fluxo executado durante a atualização de uma permissão (Permission).

```mermaid
flowchart TD
    Start([Início: UpdatePermissionUseCase.execute]) --> CheckID{Busca permissão no BD por ID}
    
    CheckID -- "Permissão não encontrada (null)" --> Err1[Throw EntityNotFoundError]
    CheckID -- "Permissão encontrada" --> CheckNameChange{O nome foi alterado no DTO?}
    
    CheckNameChange -- "Sim" --> CheckNameDB{Novo nome já existe no BD?}
    CheckNameDB -- "Sim" --> Err2[Throw ConflictError]
    CheckNameDB -- "Não" --> UpdateDB
    
    CheckNameChange -- "Não" --> UpdateDB[Atualiza entidade via PermissionRepository.update]
    
    UpdateDB --> MapResponse[Mapeia para PermissionResponseDto]
    MapResponse --> End(["Fim: Retorna PermissionResponseDto"])
```
