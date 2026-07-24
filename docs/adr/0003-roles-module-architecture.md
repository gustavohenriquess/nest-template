---
id: adr.roles-module
title: Architecture Decision Record - Roles Module
kind: adr
category: architecture
status: active
audience:
  - developers
  - ai-agents
tags:
  - architecture
  - adr
  - roles
  - rbac
  - ddd
related: []
---

<!-- ai:doc id="adr.roles-module" category="architecture" kind="adr" status="active" -->
<!-- ai:tags architecture adr roles rbac ddd -->
<!-- ai:audience developers ai-agents -->

# ADR: Roles Module Architecture

## Contexto
Para suportar o Controle de Acesso Baseado em Perfis (RBAC - Role Based Access Control), foi necessário estruturar um módulo que definisse e gerenciasse os perfis de acesso (`Roles`) da aplicação, independentemente do gerenciamento direto dos usuários.

## Decisões Arquiteturais
Ao desenhar o `RolesModule` (localizado em `src/roles`), as seguintes decisões foram tomadas:

1. **Separação de Domínio**: Em vez de misturar a gestão de *Roles* dentro do `UsersModule` (o que tornaria aquele módulo inflado), criou-se um módulo e um domínio totalmente isolados.
2. **Arquitetura em Camadas (DDD)**: Assim como os usuários, o módulo obedece às camadas `application`, `domain`, `infrastructure` e `interface`, garantindo consistência com o restante do projeto.
3. **Interface e CRUD Padronizados**: O módulo prevê a orquestração via Casos de Uso específicos para criar, ler, atualizar e excluir papéis (perfis).
4. **Relacionamentos via Banco**: A associação entre usuário e perfil ocorre nas tabelas associativas do Prisma, mas em nível de negócio, `Role` cuida de suas próprias regras e descrições.

## Consequências

### Positivas
- **Responsabilidade Única (SRP)**: O módulo cuida exclusivamente dos perfis.
- **Evolução Independente**: Caso os perfis passem a ter hierarquias avançadas ou restrições complexas, o impacto ocorrerá estritamente neste módulo.

### Negativas
- **Orquestração de Dados**: Quando um usuário precisa ser retornado *com os seus perfis*, há uma certa dependência no carregamento (ex: via `UserRepository`), o que exige atenção no mapeamento para não sobrepor domínios.

<!-- ai:doc-end id="adr.roles-module" -->
