# Validação Global com Zod

Esta aplicação utiliza um sistema de validação automatizado baseado em [Zod](https://zod.dev/). A validação é aplicada globalmente através do `ZodValidationPipe`, o que elimina a necessidade de lógica de validação manual nos Services ou Controllers.

## Como Funciona

O `ZodValidationPipe` está registrado globalmente. Durante cada requisição (Body, Query ou Param), o pipe verifica se a classe do DTO possui um esquema Zod associado via metadados. Se encontrar, ele valida os dados e retorna o objeto limpo e tipado. Caso contrário, ele deixa os dados passarem sem validação.

## Guia de Uso

### 1. Definir o Esquema (Schema)

Crie seu esquema Zod descrevendo as regras de negócio. É recomendado exportá-lo para que possa ser reutilizado em testes ou em outros lugares.

```typescript
import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
  age: z.number().min(18, 'A idade mínima é 18 anos').optional(),
});
```

### 2. Vincular ao DTO

Use o decorator `@UseZodSchema()` para associar o esquema à sua classe DTO. Isso é o que "avisa" o Pipe Global que esta classe deve ser validada.

```typescript
import { UseZodSchema } from '@/core/decorators/zod.decorator';

@UseZodSchema(createUserSchema)
export class CreateUserDto {
  email: string;
  password: string;
  age?: number;
}
```

### 3. Usar no Controller

Agora você só precisa usar o decorator clássico do NestJS (`@Body`, `@Query`, `@Param`). A validação ocorrerá automaticamente.

```typescript
@Post()
async create(@Body() data: CreateUserDto) {
  // Se o código chegar aqui, os dados são 100% válidos e seguros
  return this.usersService.create(data);
}
```

## Tratamento de Erros

Quando uma validação falha, o sistema retorna automaticamente um erro `400 Bad Request` com a seguinte estrutura (processada pelo `GlobalExceptionFilter`):

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": {
    "email": ["E-mail inválido"],
    "password": ["A senha deve ter pelo menos 8 caracteres"]
  },
  "timestamp": "2024-04-20T...",
  "path": "/api/users"
}
```

## Boas Práticas

> [!TIP]
> **Sempre Tipagem Dupla**: Tente manter a interface da classe DTO em sincronia com o esquema Zod. O Zod garante a segurança em runtime, e a classe garante a segurança em tempo de desenvolvimento.

> [!IMPORTANT]
> **Campos Opcionais**: Lembre-se de usar `.optional()` no Zod e o modificador `?` no TypeScript para campos que não são obrigatórios.

> [!NOTE]
> **Retrocompatibilidade**: Rotas que não possuem o decorator `@UseZodSchema` continuarão funcionando normalmente sem validação, permitindo uma migração gradual de sistemas legados.
