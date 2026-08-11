---
id: harness.search.postgres-vs-redis-auth
title: Análise de Viabilidade - Postgres vs Redis para Blacklist e Refresh Tokens
kind: context
category: search
status: active
audience:
  - developers
  - ai-agents
tags:
  - postgres
  - redis
  - authentication
  - jwt
  - blacklist
  - refresh-token
related: []
---

<!-- ai:doc id="harness.search.postgres-vs-redis-auth" category="search" kind="context" status="active" -->
<!-- ai:tags postgres redis authentication jwt blacklist refresh-token -->

# Análise de Viabilidade: Postgres vs Redis para Blacklist e Refresh Tokens

## Objetivo da Busca
Analisar, à luz do artigo da Shopify sobre a substituição de Redis por MySQL, a viabilidade de utilizar o Postgres (banco relacional principal) em vez do Redis para gerenciar Refresh Tokens e Blacklist de tokens na aplicação.

## Arquivos Analisados
- N/A (Análise arquitetural teórica com base nos preceitos do artigo lido anteriormente).

## Descobertas e Considerações Arquiteturais

A conclusão é que **SIM, é perfeitamente possível e, em muitos casos, recomendável** usar o Postgres para gerenciar refresh tokens e uma blacklist de JWTs no lugar do Redis, especialmente para simplificar a infraestrutura.

Com base nos aprendizados do artigo da Shopify aplicados ao cenário de autenticação:

1. **Vantagem de Consistência (ACID):**
   Manter a blacklist e os refresh tokens no Postgres permite usar transações ACID. Se um usuário redefinir a senha, você pode invalidar todos os refresh tokens dele e adicionar os tokens atuais à blacklist na *mesma transação* em que a senha é atualizada. No modelo com Redis, uma falha de rede entre atualizar o Postgres e limpar o Redis poderia deixar tokens válidos indevidamente (similar ao problema de *oversell* que a Shopify tinha).

2. **O Desafio do TTL (Expiração):**
   - **No Redis:** As chaves expiram sozinhas (TTL nativo).
   - **No Postgres:** Você precisará criar uma coluna `expires_at` (tanto na tabela de Refresh Tokens quanto na de Blacklist). Como o Postgres não apaga as linhas sozinho, você precisará de uma **estratégia de limpeza**: um *Cron Job* (usando o `@Cron()` do NestJS, por exemplo) que roda uma vez por dia rodando `DELETE FROM token_blacklist WHERE expires_at < NOW()`.

3. **Performance e Conexões (A Lição do Gargalo):**
   - Verificar a blacklist em todas as requisições autenticadas gera um volume altíssimo de leituras rápidas (`SELECT 1 FROM blacklist WHERE token = ?`).
   - O Postgres dá conta tranquilamente se a coluna de busca for indexada (um índice único no hash do token).
   - No entanto, a principal lição da Shopify se aplica aqui: **Exaustão de Conexões**. Se a sua aplicação fizer muitas leituras minúsculas e outras rotas pesadas segurarem as conexões abertas, a validação do token pode falhar por falta de conexões (Connection Pool Depletion). É vital utilizar um pooler de conexões bem dimensionado (no Prisma, por exemplo) e garantir que transações não fiquem presas por tempo desnecessário.

4. **Modelagem de Dados Sugerida (Prisma):**
   Em vez de salvar o JWT gigante inteiro na blacklist, é melhor salvar apenas o `jti` (JWT ID) ou um hash SHA-256 do token, o que deixa o índice do Postgres minúsculo e absurdamente rápido para leituras e inserções de blacklist.

**Conclusão:** 
Assim como a Shopify provou que o MySQL aguenta a Black Friday para contenção de estoque, o Postgres consegue suportar checagens de Blacklist/Refresh Token desde que (1) a coluna de busca tenha índice, (2) você limpe os registros expirados passivamente (cron) e (3) preste atenção ao dimensionamento do Pool de conexões.

---
**Solicitado por:** gustavo._henrique@hotmail.com
