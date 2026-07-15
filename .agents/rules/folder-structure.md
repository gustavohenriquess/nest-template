# Estrutura de Pastas dos Módulos

Ao criar um novo módulo neste projeto, a estrutura de diretórios deve obrigatoriamente seguir a separação rigorosa de camadas baseada no **Domain-Driven Design (DDD)**:

Abaixo está o esqueleto padrão que deve ser replicado para cada novo módulo:

```text
src/nome-do-modulo/
├── domain/
│   ├── nome.entity.ts          # Regras de negócio puras e estado da entidade
│   └── nome.repository.ts      # Interface do repositório (Contrato)
│
├── application/
│   ├── use-cases/
│   │   ├── create-nome.use-case.ts       # Orquestração do caso de uso
│   │   └── create-nome.use-case.spec.ts  # Teste unitário co-localizado
│   │
├── interface/
│   ├── controllers/
│   │   └── nome.controller.ts  # Endpoints REST e anotações do Swagger
│   ├── dto/
│   │   └── nome.dto.ts         # Schemas do Zod e definições de DTO
│   │
├── infrastructure/
│   ├── persistence/
│   │   └── prisma/
│   │       └── prisma-nome.repository.ts # Implementação concreta com Prisma
│   │
└── nome.module.ts              # Arquivo de injeção de dependências do módulo
```

### Regras Restritas por Camada:

1. **`domain/`**: Nenhuma dependência externa, de banco de dados (Prisma) ou de protocolo HTTP deve existir aqui. Apenas regras de negócio limpas e o contrato de persistência.
2. **`application/`**: Implementa o fluxo da aplicação. Cada ação de negócio é um arquivo UseCase isolado. Injeta o repositório através do contrato (interface), e não da classe concreta.
3. **`interface/`**: Não deve conter regras de negócio, apenas recebimento da requisição HTTP, validação de Zod (DTO), passagem de dados para o UseCase e formatação da resposta.
4. **`infrastructure/`**: Centraliza o código acoplado à tecnologia (Prisma, APIs externas). É a única camada que "conhece" a estrutura do banco de dados e mapeia dados do Prisma para o `domain`.
5. **Testes**: Testes unitários ficam lado a lado com os arquivos (ex: `application/use-cases/*.spec.ts`). Testes ponta a ponta (E2E) vão para a pasta global `test/` na raiz do projeto.
