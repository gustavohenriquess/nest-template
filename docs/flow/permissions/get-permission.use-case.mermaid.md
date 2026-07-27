---
id: docs.flow.get-permission-use-case
title: Get Permission Use Case Flow
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
  - get
related: []
---

<!-- ai:doc id="docs.flow.get-permission-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case permissions get -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Get Permission Use Case

Este arquivo documenta o fluxo executado durante a busca de uma única permissão (Permission) pelo ID.

```mermaid
flowchart TD
    Start([Início: GetPermissionUseCase.execute]) --> CheckID{Busca permissão no BD por ID}
    
    CheckID -- "Permissão não encontrada (null)" --> Err1[Throw EntityNotFoundError]
    CheckID -- "Permissão encontrada" --> MapResponse[Mapeia para PermissionResponseDto]
    
    MapResponse --> End(["Fim: Retorna PermissionResponseDto"])
```
