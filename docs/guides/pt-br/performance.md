# Performance e Otimização

Este template inclui diversas otimizações pré-configuradas para garantir que sua aplicação suporte tráfego em escala corporativa logo de cara.

## Compressão de Resposta (Gzip & Brotli)

Para reduzir drasticamente a largura de banda consumida pela sua API e acelerar o tempo de resposta para o cliente, nós implementamos o middleware `compression` nativamente na inicialização da aplicação (`src/main.ts`).

### Como Funciona

Quando um cliente (como um navegador web ou aplicativo mobile) envia uma requisição HTTP, ele normalmente inclui um cabeçalho `Accept-Encoding` (ex: `Accept-Encoding: gzip, deflate, br`).

Se a carga de resposta (payload) for maior que `1KB`, nosso middleware do NestJS a intercepta e compacta os dados JSON antes de enviá-los pela rede. Isso tem um impacto enorme para:
- Listas paginadas muito grandes (ex: buscando 100 usuários).
- Dados analíticos pesados ou relatórios.
- Respostas complexas de queries GraphQL.

Você não precisa invocar a compactação manualmente nos seus controllers; ela é gerenciada totalmente nos bastidores (behind the scenes) pelo pipeline global.

---

## Rate Limiting (Limitador de Requisições)

Para proteger a aplicação contra ataques de força bruta, tentativas de DDoS e uso abusivo da API, implementamos uma estratégia de limitação de requisições com limite duplo utilizando um guarda global `CustomThrottlerGuard` estendendo a biblioteca `@nestjs/throttler` (registrado em `src/app.module.ts`).

### ⚙️ Configurações de Throttling (Variáveis de Ambiente)

Adicione as seguintes definições no seu arquivo `.env` para customizar as taxas de limite de requisição:

| Variável | Tipo | Padrão | Descrição |
| :--- | :--- | :--- | :--- |
| `THROTTLE_TTL` | `number` | `60000` | O tamanho da janela de tempo em milissegundos (ex: 60 segundos). |
| `THROTTLE_LIMIT` | `number` | `10` | Quantidade máxima de requisições permitidas para clientes anônimos (não autenticados) dentro da janela de tempo. |
| `THROTTLE_LIMIT_AUTHENTICATED` | `number` | `500` | Quantidade máxima de requisições permitidas para clientes autenticados dentro da janela de tempo. |

### 🚀 Estratégia de Limite Duplo

O `CustomThrottlerGuard` detecta dinamicamente o status de autenticação da requisição recebida:

1. **Limite para Clientes Anônimos / Públicos (`global`)**
   - Aplica-se quando a requisição não inclui um token JWT válido.
   - **Limite**: Definido por `THROTTLE_LIMIT` (padrão: 10 requisições / min).
   - **Rastreabilidade**: Controlado através do endereço de IP do cliente.

2. **Limite para Clientes Autenticados (`authenticated`)**
   - Aplica-se quando a requisição inclui um token JWT `Bearer` válido.
   - **Limite**: Definido por `THROTTLE_LIMIT_AUTHENTICATED` (padrão: 500 requisições / min).
   - **Rastreabilidade**: Controlado pelo identificador único do usuário (campo `sub` do payload do JWT). O guard substitui o rastreador por `user:${sub}` para garantir que os limites sejam aplicados por usuário e não por IP (protegendo usuários que compartilham o mesmo IP/NAT).
   - **Pré-processamento do JWT**: Se a carga `user` na requisição do NestJS ainda não tiver sido populada (devido à ordem de execução dos guards no ciclo do NestJS), o guard extrai e decodifica manualmente o token do cabeçalho `Authorization` para identificar a autenticação.

### 🛑 Resposta de Limite Excedido (Headers HTTP)

Quando um cliente excede o limite permitido de requisições, a API retorna o status HTTP `429 Too Many Requests` e adiciona cabeçalhos informativos padrão na resposta para orientar o cliente:

* `X-RateLimit-Remaining: 0` — Sinaliza que não restam requisições permitidas na janela de tempo atual.
* `X-RateLimit-Reset: <segundos>` — O tempo restante em segundos até que o bloqueio expire e a janela de limite seja reiniciada.
* `Retry-After: <segundos>` — Cabeçalho HTTP padrão especificando o tempo de espera necessário em segundos antes de tentar uma nova chamada.
