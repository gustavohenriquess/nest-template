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
