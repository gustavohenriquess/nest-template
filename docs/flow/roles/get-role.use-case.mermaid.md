---
id: docs.flow.get-role-use-case
title: Get Role Use Case Flow
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
  - get
related: []
---

<!-- ai:doc id="docs.flow.get-role-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case roles get -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Get Role Use Case

Este arquivo documenta o fluxo executado durante a busca de um único perfil (Role) pelo ID.

```mermaid
flowchart TD
    Start([Início: GetRoleUseCase.execute]) --> CheckID{Busca perfil no BD por ID}
    
    CheckID -- "Perfil não encontrado (null)" --> Err1[Throw EntityNotFoundError]
    CheckID -- "Perfil encontrado" --> MapResponse[Mapeia para RoleResponseDto]
    
    MapResponse --> End(["Fim: Retorna RoleResponseDto"])
```
