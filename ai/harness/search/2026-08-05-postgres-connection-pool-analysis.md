---
id: harness.search.postgres-connection-pool-analysis
title: Análise de Conexões Abertas Desnecessariamente no Postgres
kind: context
category: search
status: active
audience:
  - developers
  - ai-agents
tags:
  - postgres
  - prisma
  - pg-pool
  - connections
  - bottleneck
related: []
---

<!-- ai:doc id="harness.search.postgres-connection-pool-analysis" category="search" kind="context" status="active" -->
<!-- ai:tags postgres prisma pg-pool connections bottleneck -->

# Análise: Conexões Abertas Desnecessariamente no Postgres

## Objetivo da Busca
Investigar a base de código do projeto em busca de anti-padrões ou configurações que estejam retendo conexões abertas com o banco de dados Postgres por mais tempo do que o necessário, visando evitar a "Exaustão de Conexões" (Connection Pool Depletion).

## Arquivos Analisados
- `src/core/infrastructure/persistence/prisma/prisma.service.ts`
- Buscas globais por transações interativas (`$transaction`)
- Buscas por agendamentos paralelos (`@Cron`)

## Descobertas e Considerações Arquiteturais

### 1. Ausência de Transações Interativas Longas (Ponto Positivo)
Não foram encontradas utilizações de `$transaction` englobando múltiplas operações. Isso significa que a aplicação **não** está cometendo o erro clássico de abrir uma transação no banco, fazer uma chamada HTTP externa (ou gerar hash de senha, enviar email, etc) e só depois fechar a transação. O Prisma está adquirindo e liberando conexões do pool adequadamente query por query.

### 2. O Risco Oculto no Prisma com `pg.Pool` (Ponto de Atenção Crítico)
O projeto utiliza o novo `@prisma/adapter-pg` com o driver nativo `pg`, instanciando o pool da seguinte forma:
```typescript
const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
```
**O Problema:** 
Diferente da engine Rust tradicional do Prisma (que lê parâmetros como `?connection_limit=50` na URL do banco), a biblioteca `pg` (node-postgres) ignora esses parâmetros específicos do Prisma. 
Se você não passar explicitamente as configurações para o construtor do `Pool`, ele cai nos padrões silenciosos do `node-postgres`:
1. `max: 10` - Seu pool de conexões está restrito a apenas 10 transações simultâneas por instância de aplicação, o que pode engarrafar o tráfego muito antes do banco de fato sentir a carga.
2. `idleTimeoutMillis: 10000` (10 segundos) - Conexões que não estão fazendo nada ficam "penduradas" no banco de dados por 10 segundos aguardando reúso antes de serem descartadas. Isso literalmente mantém conexões abertas desnecessariamente após um pico de acesso.

**Solução Proposta:**
Configurar as opções do `Pool` explicitamente no `PrismaService` via variáveis de ambiente, definindo um `idleTimeoutMillis` menor (ex: 3000ms a 5000ms) para limpar a sujeira mais rápido, e um limite máximo (`max`) condizente com as instâncias.

---
**Solicitado por:** gustavo._henrique@hotmail.com
