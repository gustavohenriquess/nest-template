# Arquitetura e Estrutura

Este template impõe uma arquitetura altamente desacoplada, inspirada no **Domain-Driven Design (DDD)** e na **Clean Architecture**. Isso garante que as regras de negócio permaneçam isoladas do framework web e da infraestrutura externa.

## Estrutura de Pastas

O diretório `src/` é separado logicamente por domínios de negócio (features). Dentro de cada domínio, você encontrará as seguintes camadas:

```text
src/
├── core/                   # Utilitários globais, interceptors e DTOs base
└── my-feature/
    ├── application/        # Casos de uso, serviços orquestradores e listeners
    ├── domain/             # Entidades, Value Objects e lógica core
    ├── infrastructure/     # Repositórios de DB, adaptadores de APIs externas
    └── interface/          # Controllers HTTP, resolvers GraphQL
```

### As 4 Camadas Explicadas
1. **Interface**: A porta de entrada. Recebe requisições HTTP, o DTO valida (via Zod), e então repassa para a camada de Application.
2. **Application**: O orquestrador. Serviços aqui ditam o fluxo (ex: busca no DB -> calcula regra -> emite evento PubSub -> retorna).
3. **Domain**: O coração do software. Contém classes TypeScript puras (`Entity`, `ValueObject`) sem nenhuma dependência do NestJS ou Prisma.
4. **Infrastructure**: Os detalhes de implementação. Repositórios interagindo com o Prisma e adaptadores GCP vivem aqui.

## Benefícios deste Padrão
- **Testabilidade**: Você pode criar testes unitários para Application e Domain sem mockar um banco de dados complexo.
- **Manutenibilidade**: Se você decidir trocar REST por GraphQL, você altera apenas a camada de `interface`.
- **Escalabilidade**: Quando o código passar de 500 arquivos, os desenvolvedores ainda saberão exatamente onde uma lógica específica deve morar.
