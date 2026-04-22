# Utilitários de Paginação

Este template fornece utilitários de paginação padronizados, seguros e automatizados "out-of-the-box". Isso garante que todos os seus endpoints de listagem se comportem de forma idêntica e estejam protegidos contra ataques de consultas massivas ao banco de dados.

## 1. Validação de Requisição (`PaginationQueryDto`)

Localizado em `src/core/dto/pagination-query.dto.ts`, este DTO utiliza Zod para impor limites estritos.

**Restrições de Segurança:**
- `page`: Deve ser `1` ou maior.
- `limit`: Limitado a um máximo de `100` itens por requisição para evitar ataques DoS via carregamento massivo de linhas.

## 2. Envelopamento de Resposta (`PaginatedResponseDto`)

Em vez de retornar arrays brutos, todos os endpoints paginados devem retornar `PaginatedResponseDto<T>`.

**Cálculo Automático de Metadados:**
Você não precisa calcular manualmente se existe uma próxima página. A classe fornece uma fábrica estática `.create()` que lida com a matemática para você.

### Exemplo de Uso em um Controller

```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse } from '@nestjs/swagger';
import { PaginationQueryDto } from '@/core/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@/core/dto/paginated-response.dto';

@Controller('users')
export class UsersController {
  
  @Get()
  @ApiOkResponse({ type: PaginatedResponseDto }) // Informa ao Swagger sobre o envelope
  async findAll(@Query() query: PaginationQueryDto) {
    
    // 1. Busca os dados no DB
    const { data, total } = await this.usersService.findAll(query.page, query.limit);

    // 2. Retorna usando a fábrica. Ela gera `totalPages`, `hasNextPage` automaticamente.
    return PaginatedResponseDto.create(data, total, query.page, query.limit);
  }
}
```

## 3. Resposta JSON Esperada

```json
{
  "data": [
    { "id": 1, "name": "John Doe" }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```
