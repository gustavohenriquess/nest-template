# Multi-tenancy e Row-Level Security com Prisma

Este guia explica como implementar filtros automáticos de dados baseados no usuário logado utilizando **Prisma Extensions** e **RequestContext** (baseado em `AsyncLocalStorage`).

## 1. O Conceito

Para que o Prisma saiba quem é o usuário atual sem precisarmos passar o objeto `user` em todas as funções, utilizamos o `RequestContext`. Ele funciona como um armazenamento isolado por requisição HTTP.

## 2. Infraestrutura de Contexto

### RequestContext (`src/core/infrastructure/context/request-context.ts`)
Centraliza o acesso aos dados da requisição atual.

```typescript
// Exemplo de uso em qualquer lugar do sistema
const user = RequestContext.user;
console.log(user.sub);
```

### ContextMiddleware (`src/core/infrastructure/context/context.middleware.ts`)
Middleware global que inicializa o ciclo de vida do contexto para cada nova requisição.

```typescript
// Registrado automaticamente no AppModule
consumer.apply(ContextMiddleware).forRoutes('*');
```

## 3. Integração com Autenticação

A alimentação do contexto acontece na `JwtStrategy`. Assim que o Passport valida o JWT, o usuário é injetado no `RequestContext`:

```typescript
// src/core/auth/strategies/jwt.strategy.ts
validate(payload: any) {
  const user = { ... };
  RequestContext.user = user; // Contexto alimentado aqui!
  return user;
}
```

## 4. Implementando RLS com Prisma Extension

Agora, o seu `PrismaService` pode usar esse contexto para filtrar dados de forma invisível:

```typescript
// src/core/persistence/prisma/prisma.service.ts
readonly safe = this.$extends({
  query: {
    $allModels: {
      async $allOperations({ operation, args, query }) {
        const user = RequestContext.user;

        if (user && ['findMany', 'findFirst', 'count'].includes(operation)) {
          args.where = { ...args.where, tenantId: user.sub };
        }

        return query(args);
      },
    },
  },
});
```

## 5. Vantagens e Cuidados

### Vantagens:
- **Segurança Passiva:** Elimina o risco de esquecer filtros de segurança em novas queries.
- **Clean Code:** Remove ruído de autorização da lógica de negócio dos Services.
- **Auditabilidade:** Centraliza todas as regras de acesso a dados em um único lugar.

### Cuidados:
- **Operações de Escrita:** Você também pode estender para `create`, `update` e `delete` para garantir que um usuário não altere dados de terceiros.
- **Bypass Intencional:** Se você precisar de uma query administrativa que ignore os filtros, basta usar `this.prisma` (a instância base) em vez de `this.prisma.safe`.
- **Performance:** Extensões de query têm um custo mínimo de processamento, mas imperceptível na maioria das aplicações.

---
*Este padrão garante segurança e código limpo (Clean Code).*
