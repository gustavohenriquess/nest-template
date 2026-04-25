# Multi-tenancy e Row-Level Security com Prisma

Este guia explica como implementar filtros automáticos de dados baseados no usuário logado utilizando **Prisma Extensions** e **AsyncLocalStorage**. Esta abordagem é ideal para sistemas SaaS ou qualquer aplicação onde usuários de diferentes grupos/empresas não podem ver os dados uns dos outros.

## 1. O Conceito

Em vez de adicionar manualmente filtros `where: { tenantId: user.tenantId }` em cada consulta do seu sistema, utilizamos uma extensão do Prisma que intercepta as chamadas ao banco de dados e injeta esses filtros automaticamente.

Para que o Prisma saiba quem é o usuário atual sem precisarmos passar o objeto `user` em todas as funções, utilizamos o `AsyncLocalStorage` do Node.js, que funciona como um "Thread Local Storage" para JavaScript.

## 2. Implementação Passo a Passo

### Passo 1: Criar o Store de Contexto

Crie um arquivo para gerenciar o contexto da requisição.

```typescript
// src/core/infrastructure/context/context.store.ts
import { AsyncLocalStorage } from 'async_hooks';
import { UserSession } from '../../auth/interfaces/user-session.interface';

export const userContext = new AsyncLocalStorage<UserSession>();
```

### Passo 2: Configurar a Extensão no PrismaService

Atualize o seu `PrismaService` para incluir a lógica de filtragem automática.

```typescript
// src/core/persistence/prisma/prisma.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { userContext } from '../../infrastructure/context/context.store';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  // Instância estendida com segurança de dados ativa
  readonly safe = this.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const user = userContext.getStore();

          // Injetar filtro automático em operações de leitura
          if (user && ['findMany', 'findFirst', 'findUnique', 'count'].includes(operation)) {
            args.where = { 
              ...args.where, 
              // Assumindo que suas tabelas possuem um campo 'tenantId' ou 'userId'
              tenantId: user.sub 
            };
          }

          return query(args);
        },
      },
    },
  });

  async onModuleInit() {
    await this.$connect();
  }
}
```

### Passo 3: Criar o Middleware de Contexto

Você precisa de um middleware ou interceptor para "alimentar" o contexto com os dados do usuário logo após a autenticação.

```typescript
// src/core/infrastructure/middleware/context.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { userContext } from '../context/context.store';

@Injectable()
export class ContextMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const user = req.user; // Preenchido anteriormente pelo JwtStrategy/Guard
    
    if (user) {
      userContext.run(user, () => next());
    } else {
      next();
    }
  }
}
```

## 3. Como utilizar no Service

Agora, nos seus services, você utiliza `prisma.safe` em vez de `prisma` puro:

```typescript
@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    // Não precisa de .where({ tenantId }), a extensão cuida disso!
    return this.prisma.safe.product.findMany();
  }
}
```

## 4. Vantagens e Cuidados

### Vantagens:
- **Segurança Passiva:** Elimina o risco de esquecer filtros de segurança em novas queries.
- **Clean Code:** Remove ruído de autorização da lógica de negócio dos Services.
- **Auditabilidade:** Centraliza todas as regras de acesso a dados em um único lugar.

### Cuidados:
- **Operações de Escrita:** Você também pode estender para `create`, `update` e `delete` para garantir que um usuário não altere dados de terceiros.
- **Bypass Intencional:** Se você precisar de uma query administrativa que ignore os filtros, basta usar `this.prisma` (a instância base) em vez de `this.prisma.safe`.
- **Performance:** Extensões de query têm um custo mínimo de processamento, mas imperceptível na maioria das aplicações.

---
*Este guia é um exemplo de implementação para o NestJS Template.*
