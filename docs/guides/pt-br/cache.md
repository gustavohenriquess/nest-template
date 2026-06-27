# Módulo de Cache com Redis

Este template apresenta um módulo de cache global customizado e de alta performance, construído sobre a biblioteca `ioredis` e Interceptors do NestJS. Ele fornece cache declarativo orientado a decoradores (decorators) para endpoints HTTP e uma estratégia não-bloqueante de versionamento de namespaces para invalidação de cache.

O módulo de cache é registrado globalmente no arquivo `src/app.module.ts` e seus serviços/decoradores estão expostos em `src/core/cache/`.

---

## ⚙️ Configuração (Variáveis de Ambiente)

Para habilitar e configurar o cache, adicione as seguintes variáveis no seu arquivo `.env` (veja exemplos em `.env.example`):

| Variável | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `CACHE_ENABLED` | `boolean` | `false` | Chave geral para ativar ou desativar o módulo de cache Redis. |
| `REDIS_HOST` | `string` | `localhost` | Hostname/IP do servidor Redis. |
| `REDIS_PORT` | `number` | `6379` | Porta de conexão do Redis. |
| `REDIS_PASSWORD` | `string` | `undefined` | Senha opcional para autenticação no Redis. |
| `CACHE_DEFAULT_TTL` | `number` | `60` | Tempo de vida (TTL) padrão do cache em segundos. |

Se `CACHE_ENABLED` estiver configurado como `false`, o cliente Redis não inicializará e o interceptor global ignorará completamente o cache, enviando o tráfego direto para as controllers sem nenhum overhead de performance.

---

## 🚀 Decoradores de Cache

O cacheamento de respostas é configurado declarativamente por meio de decoradores nos métodos das controllers:

### 1. `@Cache()`
Armazena a resposta de um endpoint no Redis. Pode ser utilizado sem argumentos ou com parametrização:

* `@Cache()` — Usa o nome do controller como namespace padrão e o TTL padrão configurado.
* `@Cache('custom-key')` — Define um namespace/prefixo de chave customizado.
* `@Cache(120)` — Sobrescreve o TTL para 120 segundos.
* `@Cache('custom-key', 120)` — Define o namespace customizado e sobrescreve o TTL.

#### Exemplo:
```typescript
import { Controller, Get } from '@nestjs/common';
import { Cache } from '@/core/cache/decorators/cache.decorator';

@Controller('users')
export class UsersController {
  @Get()
  @Cache(30) // Cacheia a resposta por 30 segundos utilizando o namespace "UsersController"
  async getUsers() {
    return this.usersService.findAll();
  }

  @Get('featured')
  @Cache('featured-users', 300) // Namespace customizado e TTL de 5 minutos
  async getFeatured() {
    return this.usersService.findFeatured();
  }
}
```

### 2. `@InvalidateCache()`
Invalida o cache associado a um determinado namespace.

* `@InvalidateCache()` — Invalida o cache do namespace padrão do controller atual (nome da classe do controller).
* `@InvalidateCache('custom-key')` — Invalida um namespace customizado específico (ex: `'featured-users'`).

#### Exemplo:
```typescript
import { Controller, Post, Body } from '@nestjs/common';
import { InvalidateCache } from '@/core/cache/decorators/invalidate-cache.decorator';

@Controller('users')
export class UsersController {
  @Post()
  @InvalidateCache() // Invalida o namespace "UsersController" após criação com sucesso
  async createUser(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Post('featured')
  @InvalidateCache('featured-users') // Invalida o namespace customizado específico "featured-users"
  async createFeaturedUser(@Body() dto: CreateUserDto) {
    return this.usersService.createFeatured(dto);
  }
}
```

---

## 🧠 Estratégia de Invalidação Não-Bloqueante

Diferente de métodos tradicionais de invalidação baseados em varredura do banco (como `KEYS` ou `SCAN` no Redis, comandos custosos que podem causar travamentos na thread única do Redis em produção), este módulo adota a estratégia de **Versionamento de Namespaces**:

1. **Estrutura da Chave de Cache**:
   A chave de cache é montada dinamicamente no `CacheInterceptor`:
   ```
   {namespace}:v{version}:{handlerName}:{serializedQueryAndParams}
   ```
   * `namespace`: Nome do controller ou chave customizada (ex: `UsersController`).
   * `version`: Um contador guardado no Redis (`version:{namespace}`) que inicia em `0`.
   * `handlerName`: Nome do método do controller (ex: `getUsers`).
   * `serializedQueryAndParams`: Representação em string dos parâmetros de busca (query params) e de rota (route params) da requisição, garantindo isolamento entre requisições com dados distintos.

2. **Funcionamento da Invalidação**:
   Quando `@InvalidateCache('namespace')` é acionado:
   - Uma operação atômica de incremento `INCR` é enviada ao Redis: `INCR version:{namespace}`.
   - A versão correspondente ao namespace é alterada (ex: de `0` para `1`).
   - As requisições subsequentes de leitura (`GET`) buscarão a chave usando `:v1:`, gerando um cache miss (e forçando a busca do novo dado).
   - O novo dado é cacheado no Redis sob a versão `:v1:`.
   - As chaves antigas com `:v0:` expiram naturalmente de acordo com o TTL configurado, sem a necessidade de comandos lentos de deleção.

---

## 📊 Metadados de Resposta da API (Flag `cached`)

Para permitir que aplicações clientes identifiquem facilmente se uma resposta foi obtida a partir do cache, o fluxo de interceptors adiciona uma propriedade booleana `cached` dentro do objeto `meta` da resposta.

- **Cache Hit (Acerto)**: `meta.cached: true` (retornado diretamente do Redis)
- **Cache Miss (Erro) / Cache Desabilitado**: `meta.cached: false` (processado pela controller/banco)

### Exemplo de Resposta:
```json
{
  "meta": {
    "timestamp": "2026-06-27T02:00:00.000Z",
    "path": "/v1/health/integrations",
    "correlationId": "85ef0db0-9b48-4cb9-994f-a94f31c26b31",
    "filters": {},
    "cached": true
  },
  "data": {
    "status": "ok",
    "info": {
      "prisma_default": { "status": "up" },
      "redis": { "status": "up" }
    }
  }
}
```

Isso funciona em conjunto através do `CacheInterceptor` (que define `req.isCached = true` no objeto de requisição do NestJS quando ocorre um cache hit) e do `TransformInterceptor` (que lê esse valor e injeta o respectivo booleano nos metadados de sucesso formatados).

---

## 🏥 Integração com Endpoint de Health Check

O sistema de health check se adapta automaticamente. Caso a variável `CACHE_ENABLED` seja `true`, o `RedisHealthIndicator` será ativado na lista de readiness da API:

* **Endpoint**: `/v1/health/integrations`
* **Comportamento**: Dispara um ping para o cliente Redis (`ping()`). Se o Redis não responder com `'PONG'`, a verificação falhará e retornará status `503 Service Unavailable`.

---

## 🐳 Integração Docker Compose

Um serviço `redis` leve baseado em `redis:7-alpine` já vem configurado no `docker-compose.yml`. Ele é executado automaticamente ao iniciar o stack pelo comando:

```bash
make start
```
Por padrão, a porta `6379` é mapeada no host local.
