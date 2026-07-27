---
id: docs.flow.get-roles-use-case
title: Get Roles Use Case Flow
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
  - list
related: []
---

<!-- ai:doc id="docs.flow.get-roles-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case roles list -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Get Roles Use Case

Este arquivo documenta o fluxo executado durante a listagem paginada de perfis (Roles).

```mermaid
flowchart TD
    Start([Início: GetRolesUseCase.execute]) --> FetchDB[Busca roles paginadas via RoleRepository.findAll]
    
    FetchDB --> MapList[Mapeia cada item para RoleResponseDto]
    MapList --> WrapPagination[Monta resposta no PaginatedResponseDto]
    
    WrapPagination --> End(["Fim: Retorna PaginatedResponseDto<RoleResponseDto>"])
```
