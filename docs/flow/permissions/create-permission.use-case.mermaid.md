---
id: docs.flow.create-permission-use-case
title: Create Permission Use Case Flow
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
  - create
related: []
---

<!-- ai:doc id="docs.flow.create-permission-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case permissions create -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Create Permission Use Case

Este arquivo documenta o fluxo executado durante a criação de uma permissão (Permission).

```mermaid
flowchart TD
    Start([Início: CreatePermissionUseCase.execute]) --> CheckName{Busca permissão no BD por nome}
    
    CheckName -- "Permissão já existe" --> Err1[Throw ConflictError]
    CheckName -- "Permissão não existe" --> CreateEntity[Instancia entidade Permission]
    
    CreateEntity --> SaveDB[Salva no BD via PermissionRepository.create]
    SaveDB --> MapResponse[Mapeia para PermissionResponseDto]
    MapResponse --> End(["Fim: Retorna PermissionResponseDto"])
```
