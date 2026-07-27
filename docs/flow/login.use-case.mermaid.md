---
id: docs.flow.login-use-case
title: Login Use Case Flow
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
  - auth
  - login
related: []
---

<!-- ai:doc id="docs.flow.login-use-case" category="flow" kind="documentation" status="active" -->
<!-- ai:tags flow mermaid use-case auth login -->
<!-- ai:audience developers ai-agents -->

# Fluxo: Login Use Case

Este arquivo documenta o fluxo lógico executado durante a tentativa de login de um usuário na plataforma.

```mermaid
flowchart TD
    Start([Início: LoginUseCase.execute]) --> FindUser{Busca usuário no BD por e-mail}
    
    FindUser -- "Usuário não encontrado (null)" --> Err1[Throw UnauthorizedError]
    FindUser -- "Usuário encontrado" --> VerifyPassword{Verifica hash da senha com argon2}
    
    VerifyPassword -- "Senha inválida" --> Err2[Throw UnauthorizedError]
    VerifyPassword -- "Senha válida" --> CheckStatus{Status do usuário é ACTIVE?}
    
    CheckStatus -- "Não (Inactive / Pending)" --> Err3[Throw ForbiddenError]
    CheckStatus -- "Sim" --> MapPermissions[Mapear roles e permissões do usuário e dos perfis]
    
    MapPermissions --> GeneratePayload[Montar JWT Payload c/ sub, email, roles e permissions]
    GeneratePayload --> SignToken[Assinar token com JwtService]
    SignToken --> End([Fim: Retorna { accessToken }])
```
