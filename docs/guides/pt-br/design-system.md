# Design System e Convenções

Neste template backend, o "Design System" se refere à estrita padronização das respostas da API, tratamento de erros e convenções de código. Isso garante que as aplicações frontend que consomem esta API possam confiar em um contrato altamente previsível.

## 1. Tratamento de Erros Padronizado

Todas as exceções não tratadas e erros HTTP são interceptados pelo `GlobalExceptionFilter` (`src/core/filters/global-exception.filter.ts`).

### O Contrato de Resposta de Erro
Em vez de stack traces brutos ou estruturas de erro variáveis, a API **sempre** retorna o seguinte envelope JSON em caso de falha:

```json
{
  "success": false,
  "error": {
    "code": "APP-400",
    "message": "Validation failed",
    "details": ["email is invalid", "age must be positive"]
  },
  "meta": {
    "timestamp": "2026-04-22T12:00:00Z",
    "path": "/v1/users",
    "correlationId": "req-1234-abcd"
  }
}
```
**Benefícios:**
- O frontend pode simplesmente checar `success === false`.
- O `correlationId` mapeia diretamente para os seus logs do OpenTelemetry e Pino, tornando o debug uma tarefa fácil.

## 2. Respostas de Sucesso Padronizadas

Da mesma forma, as respostas bem-sucedidas são envelopadas usando o `TransformResponseInterceptor`.

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe"
  },
  "meta": {
    "timestamp": "2026-04-22T12:00:00Z"
  }
}
```

*Nota: Para listas, usamos o `PaginatedResponseDto` que substitui `data` por um array e enriquece o `meta` com os detalhes de paginação.*

## 3. Erros de Domínio

Nós evitamos lançar `new Error()` brutos dentro das nossas camadas de aplicação. Em vez disso, usamos o `DomainError` localizado em `src/core/errors/domain.error.ts`. Isso permite que você anexe códigos de App padronizados (ex: `APP-404`) que o filtro global consegue traduzir graciosamente para status codes HTTP.
