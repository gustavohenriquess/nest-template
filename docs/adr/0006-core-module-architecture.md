---
id: adr.core-module
title: Architecture Decision Record - Core Module
kind: adr
category: architecture
status: active
audience:
  - developers
  - ai-agents
tags:
  - architecture
  - adr
  - core
  - shared
related: []
---

<!-- ai:doc id="adr.core-module" category="architecture" kind="adr" status="active" -->
<!-- ai:tags architecture adr core shared -->
<!-- ai:audience developers ai-agents -->

# ADR: Core Module / Layer Architecture

## Contexto
Existem diversos componentes (Filtros de Exceção, Classes Base, Interceptors, Decorators globais, Integrações Genéricas) que não pertencem a um domínio funcional específico (como "User" ou "Auth"), mas que são blocos fundamentais para a estrutura técnica de toda a aplicação. 

## Decisões Arquiteturais
Embora o `Core` em `src/core` não seja necessariamente empacotado em um único `core.module.ts` (na verdade, é uma coleção de bibliotecas e recursos estruturais), as seguintes premissas arquiteturais guiam essa camada:

1. **Shared Kernel / Base Classes**: O Core atua como o *Shared Kernel* do Domain-Driven Design. Ali residem classes abstratas essenciais, como `Entity` e `ValueObject`, das quais todos os outros módulos herdam para estruturar seus modelos lógicos.
2. **Padrões de Interface Transversais**: Respostas paginadas, formatação dos DTOs base de retorno genérico, e interceptors de mutação de *payload* vivem globalmente no Core.
3. **Infraestrutura Genérica**: Configurações transversais (Logger, Serviços de GCP, Estruturas abstratas de Cache, Validações globais com Zod e `env.schema.ts`) encontram-se aqui. Essa é a fundação para que nenhum módulo de negócios reinvente a roda técnica.
4. **Tratamento Global de Erros**: O `GlobalExceptionFilter` está alocado aqui, garantindo que qualquer exceção, independente da camada (DomainError, ZodError, HttpError), receba o tratamento correto e padronizado antes de voltar para o usuário final.

## Consequências

### Positivas
- **Padronização**: A base inteira do projeto compartilha os mesmos padrões semânticos e de formatação. Módulos novos começam robustos estendendo o `Core`.
- **DRY (Don't Repeat Yourself)**: Evita cópias de código ao lidar com exceções comuns, respostas HTTP ou conexões com GCP e infraestrutura base.

### Negativas
- **Acoplamento Global Indesejado**: Um descuido no código pode resultar em regras de negócio específicas (ex: restrições aplicáveis somente a Users) vazando para a camada `Core`, o que acoplaria fortemente toda a aplicação. O Core exige extrema disciplina para conter *apenas* componentes genéricos não atrelados aos domínios.

<!-- ai:doc-end id="adr.core-module" -->
