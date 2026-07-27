---
id: docs.flow.get-users-use-case
title: Get Users Use Case Flow
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
  - users
  - list
related: []
---

<!-- ai:doc id="docs.flow.get-users-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case users list -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Get Users Use Case

Este arquivo documenta o fluxo executado durante a listagem paginada de usuários (Users).

```mermaid
flowchart TD
    Start([Início: GetUsersUseCase.execute]) --> ExtractPagination[Extrai page e limit do DTO ou valores default]
    
    ExtractPagination --> FetchDB[Busca usuários paginados via UserRepository.findAll]
    FetchDB --> MapList[Mapeia cada item para UserResponseDto]
    MapList --> WrapPagination[Monta resposta no PaginatedResponseDto]
    
    WrapPagination --> End(["Fim: Retorna PaginatedResponseDto<UserResponseDto>"])
```
