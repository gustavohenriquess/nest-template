---
id: docs.flow.delete-role-use-case
title: Delete Role Use Case Flow
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
  - delete
related: []
---

<!-- ai:doc id="docs.flow.delete-role-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case roles delete -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Delete Role Use Case

Este arquivo documenta o fluxo executado durante a remoção de um perfil (Role).

```mermaid
flowchart TD
    Start([Início: DeleteRoleUseCase.execute]) --> CheckID{Busca perfil no BD por ID}
    
    CheckID -- "Perfil não encontrado (null)" --> Err1[Throw EntityNotFoundError]
    CheckID -- "Perfil encontrado" --> DeleteDB[Remove entidade via RoleRepository.delete]
    
    DeleteDB --> End(["Fim: Retorna void"])
```
