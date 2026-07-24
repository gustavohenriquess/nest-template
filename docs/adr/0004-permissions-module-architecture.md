---
id: adr.permissions-module
title: Architecture Decision Record - Permissions Module
kind: adr
category: architecture
status: active
audience:
  - developers
  - ai-agents
tags:
  - architecture
  - adr
  - permissions
  - rbac
  - ddd
related: []
---

<!-- ai:doc id="adr.permissions-module" category="architecture" kind="adr" status="active" -->
<!-- ai:tags architecture adr permissions rbac ddd -->
<!-- ai:audience developers ai-agents -->

# ADR: Permissions Module Architecture

## Contexto
Além dos perfis (Roles), o controle granular do sistema (ex: capacidade de `create:users` ou `delete:posts`) exige a gerência e o mapeamento das Permissões. Foi necessário definir como essas permissões seriam expostas e orquestradas.

## Decisões Arquiteturais
Para o `PermissionsModule` (localizado em `src/permissions`), tomamos as seguintes decisões:

1. **Módulo Isolado de Roles**: Embora intimamente ligado aos Perfis (Roles), as permissões constituem um sub-domínio que pode ser gerenciado de forma isolada, justificando a criação do seu próprio `PermissionsModule`.
2. **Adoção do Padrão DDD**: Novamente, a arquitetura de camadas puras é utilizada. `domain` para a entidade Permission, `application` para os casos de uso, `infrastructure` para Repositório Prisma e `interface` para os Controllers.
3. **Imutabilidade Esperada**: Embora o sistema possua infraestrutura de gestão, normalmente permissões são recursos mais estáticos (criados com base nas features do código). O módulo oferece a ponte para associá-los de forma dinâmica no banco.

## Consequências

### Positivas
- **Granularidade**: Permite a implementação de verificações de acesso estritamente granulares nos *Guards* do NestJS no futuro.
- **Coesão Arquitetural**: Segue o mesmíssimo esqueleto já aplicado em Users e Roles, reduzindo o tempo de entendimento para novos desenvolvedores (ou IA).

### Negativas
- **Risco de Sobrecarga de Requisições**: Ao separar Users, Roles e Permissions nos seus próprios módulos lógicos, operações ricas no banco precisarão ser estruturadas de forma que os repositórios consigam popular a árvore sem causar N+1 ou consultas isoladas excessivas.

<!-- ai:doc-end id="adr.permissions-module" -->
