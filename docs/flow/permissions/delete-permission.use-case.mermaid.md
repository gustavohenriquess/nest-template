---
id: docs.flow.delete-permission-use-case
title: Delete Permission Use Case Flow
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
  - delete
related: []
---

<!-- ai:doc id="docs.flow.delete-permission-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case permissions delete -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Delete Permission Use Case

Este arquivo documenta o fluxo executado durante a remoção de uma permissão (Permission).

```mermaid
flowchart TD
    Start([Início: DeletePermissionUseCase.execute]) --> CheckID{Busca permissão no BD por ID}
    
    CheckID -- "Permissão não encontrada (null)" --> Err1[Throw EntityNotFoundError]
    CheckID -- "Permissão encontrada" --> DeleteDB[Remove entidade via PermissionRepository.delete]
    
    DeleteDB --> End(["Fim: Retorna void"])
```
