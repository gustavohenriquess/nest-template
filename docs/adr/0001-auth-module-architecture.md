---
id: adr.auth-module
title: Architecture Decision Record - Auth Module
kind: adr
category: architecture
status: active
audience:
  - developers
  - ai-agents
tags:
  - architecture
  - adr
  - auth
  - security
  - jwt
related: []
---

<!-- ai:doc id="adr.auth-module" category="architecture" kind="adr" status="active" -->
<!-- ai:tags architecture adr auth security jwt -->
<!-- ai:audience developers ai-agents -->

# ADR: Auth Module Architecture

## Contexto
O sistema necessita de um mecanismo robusto, seguro e escalável para autenticar usuários e gerenciar o acesso aos endpoints protegidos. Foi preciso decidir como estruturar a autenticação e gerenciar os segredos de segurança sem acoplar fortemente essas responsabilidades ao módulo de usuários.

## Decisões Arquiteturais
Ao analisar e estruturar o arquivo `src/auth/auth.module.ts`, as seguintes decisões foram tomadas:

1. **Uso de JWT (JSON Web Tokens)**: Optou-se por utilizar JWT para prover uma autenticação *stateless*. O token tem uma expiração padrão configurada para `1d` (1 dia).
2. **Registro Assíncrono do JwtModule**: Foi utilizado o `JwtModule.registerAsync` em conjunto com o `ConfigModule` e `ConfigService`. Essa abordagem garante que os segredos (como o `JWT_SECRET`) sejam carregados de forma segura pelas variáveis de ambiente, prevenindo *hardcoding* e vulnerabilidades de segurança.
3. **Isolamento de Casos de Uso (DDD)**: A lógica de validação de credenciais e geração do token não fica no controller. Foi extraída para o `LoginUseCase`, aderindo ao padrão arquitetural de Use Cases do projeto.
4. **Acoplamento Intencional via UsersModule**: O `AuthModule` importa o `UsersModule` para ter acesso à base de dados de usuários. Isso mantém as fronteiras claras, onde `AuthModule` cuida apenas da segurança e delega a consulta ao módulo dono da entidade `User`.

## Consequências

### Positivas
- **Escalabilidade**: Sendo *stateless*, a aplicação pode escalar horizontalmente sem necessidade de replicar sessões (Session Affinity/Sticky Sessions).
- **Segurança**: Os segredos nunca ficam no código. Eles são injetados dinamicamente no momento da inicialização do módulo.
- **Manutenibilidade**: A separação da lógica no `LoginUseCase` facilita a criação de testes unitários mockando apenas as dependências externas.

### Negativas
- **Revogação de Tokens**: Como o token dura 1 dia e é *stateless*, não há uma maneira imediata de revogar o acesso de um usuário antes da expiração, a não ser que uma infraestrutura de blacklist (ex: no Redis) seja implementada futuramente.

<!-- ai:doc-end id="adr.auth-module" -->
