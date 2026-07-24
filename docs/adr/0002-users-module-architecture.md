---
id: adr.users-module
title: Architecture Decision Record - Users Module
kind: adr
category: architecture
status: active
audience:
  - developers
  - ai-agents
tags:
  - architecture
  - adr
  - users
  - ddd
related: []
---

<!-- ai:doc id="adr.users-module" category="architecture" kind="adr" status="active" -->
<!-- ai:tags architecture adr users ddd -->
<!-- ai:audience developers ai-agents -->

# ADR: Users Module Architecture

## Contexto
O sistema precisa de um módulo responsável pelo gerenciamento de usuários, que engloba criação, edição, listagem e remoção segura. O módulo de usuários é o coração da identidade do sistema e deve estar preparado para crescer de forma sustentável, isolando a regra de negócio do acesso a dados.

## Decisões Arquiteturais
Ao desenhar o `UsersModule` (localizado em `src/users`), as seguintes decisões foram tomadas:

1. **Adoção do DDD (Domain-Driven Design)**: A arquitetura do módulo foi dividida em camadas semânticas:
   - `domain`: Contém a `UserEntity` e a interface `UserRepository`, isolando a regra de negócio da infraestrutura.
   - `application`: Onde ficam os Casos de Uso (ex: `CreateUserUseCase`, `UpdateUserUseCase`), orquestrando as regras.
   - `infrastructure`: Onde a persistência se concretiza, utilizando Prisma (`PrismaUserRepository`) para comunicar com o BD.
   - `interface`: Os controladores HTTP (`UsersController`) e DTOs, lidando com a borda de entrada/saída.
2. **Separação do Prisma**: O módulo de banco de dados não é acessado diretamente pelos casos de uso. Eles dependem estritamente da interface `UserRepository`, permitindo mockar o repositório nos testes unitários e trocar o ORM no futuro sem quebrar a regra de negócio.
3. **Exportação**: O módulo exporta provedores e repositórios necessários para que outros módulos (como o `AuthModule`) consigam validar credenciais, sem ferir as barreiras de isolamento.

## Consequências

### Positivas
- **Testabilidade**: Os casos de uso e os controladores são fáceis de testar utilizando *mocks* da interface do repositório.
- **Isolamento**: Regras do negócio (senha hasheada, status do usuário) estão encapsuladas na aplicação/domínio.

### Negativas
- **Verbosidade**: O uso de DDD exige mais arquivos e mapeamentos (DTO para Entidade e Entidade para DTO) do que um modelo mais simples (Controller > Service > Prisma), aumentando o *boilerplate* inicial.

<!-- ai:doc-end id="adr.users-module" -->
