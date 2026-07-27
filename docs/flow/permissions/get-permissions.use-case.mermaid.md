---
id: docs.flow.get-permissions-use-case
title: Get Permissions Use Case Flow
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
  - list
related: []
---

<!-- ai:doc id="docs.flow.get-permissions-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case permissions list -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Get Permissions Use Case

Este arquivo documenta o fluxo executado durante a listagem paginada de permissões (Permissions).

```mermaid
flowchart TD
    Start([Início: GetPermissionsUseCase.execute]) --> FetchDB[Busca permissions paginadas via PermissionRepository.findAll]
    
    FetchDB --> MapList[Mapeia cada item para PermissionResponseDto]
    MapList --> WrapPagination[Monta resposta no PaginatedResponseDto]
    
    WrapPagination --> End(["Fim: Retorna PaginatedResponseDto<PermissionResponseDto>"])
```
