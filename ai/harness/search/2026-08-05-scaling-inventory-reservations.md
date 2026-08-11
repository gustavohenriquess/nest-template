---
id: harness.search.scaling-inventory-reservations
title: Análise do Artigo Shopify Scaling Inventory Reservations
kind: context
category: search
status: active
audience:
  - developers
  - ai-agents
tags:
  - shopify
  - mysql
  - redis
  - architecture
  - database
  - search
related: []
---

<!-- ai:doc id="harness.search.scaling-inventory-reservations" category="search" kind="context" status="active" -->
<!-- ai:tags shopify mysql redis architecture database search -->

# Análise do Artigo Shopify Scaling Inventory Reservations

## Objetivo da Busca
Analisar o artigo "We replaced Redis with MySQL for inventory reservations—and it scaled (2026)" da Shopify, extraindo as principais considerações, decisões arquiteturais e lições aprendidas sobre a substituição do Redis por MySQL para lidar com altíssima concorrência.

## Arquivos Analisados
- Artigo web lido remotamente: `https://shopify.engineering/scaling-inventory-reservations`

## Descobertas

O artigo descreve a jornada da Shopify ao abandonar o Redis e adotar o MySQL (com a funcionalidade `SKIP LOCKED`) para gerenciar reservas de inventário em escalas extremas (como na Black Friday de 2025).

### 1. Limitações do Modelo Anterior (Redis)
- **Sistemas separados:** O ledger de inventário estava no MySQL (fonte da verdade) e as reservas temporárias no Redis. Isso quebrava o ACID, gerando cenários de *overselling* (vender acima do estoque) ou *underselling* (falhar em liberar o estoque) se ocorressem falhas entre os dois passos (como deduzir o estoque e falhar em limpar o Redis).
- **Sem suporte nativo multi-location:** O Redis não possuía suporte eficiente e nativo para reservas particionadas por local de inventário.

### 2. A Solução Escalável com MySQL
- **Uma linha por unidade de estoque:** Ao invés de uma única linha com uma coluna `quantity` que geraria contenção e travamentos de banco, adotaram a estratégia de **uma linha de banco de dados para cada unidade física do estoque**.
- **Pool Limitado (Bounded Pool):** Para não colapsar o banco em consultas de varredura (`scan`), o sistema matematicamente mantinha no máximo 1.000 linhas ativas disponíveis por item/location. Se a fila baixasse, um worker a reabastecia através de um lock isolado.
- **`SKIP LOCKED`:** O grande habilitador. Se uma transação travasse uma linha de inventário, transações paralelas simplesmente a ignoravam e seguiam para as próximas unidades disponíveis. Sem espera, reduzindo a contenção.

### 3. Decisões Técnicas-Chave
- **Chave Primária Composta (`shop_id`, `inventory_item_id`, `inventory_group_id`, `id`):** O MySQL (InnoDB) travava tanto o índice secundário quanto o principal na abordagem anterior, o que resultava em 2 *locks* por reserva. Alterar a primary key mitigou isso para 1 *lock*.
- **`READ COMMITTED`:** A equipe percebeu que o padrão `REPEATABLE READ` do MySQL usava os chamados *gap locks* durante o abastecimento da pool de inventário, o que gerava interrupções (*deadlocks*). Mudar a transação para `READ COMMITTED` evitou esses bloqueios, permitindo concorrência livre.
- **Ordem de Travamento Consistente:** Evitaram deadlocks mantendo uma rigorosa ordem linear: a reserva sempre dá um `DELETE` na tabela de unidades antes de um `INSERT` na de reservas. A persistência sempre toca apenas na tabela de reservas.
- **`UNION ALL` (Batching):** Carrinhos de compra com múltiplos itens agrupavam os requerimentos de bloqueio numa única conexão e round-trip (Bate-volta de banco).

### 4. O Real Gargalo: Conexões vs CPU
- Embora se preocupassem com *locks* e eficiência da consulta, a escalabilidade máxima foi barrada na prática pelas **conexões do banco** (Connection Exhaustion).
- Outras rotas do checkout (*não as reservas de inventário*) seguravam as conexões do banco de dados abertas e paralisadas em transações longas.
- **Observabilidade Inovadora:** Eles usaram comentários no SQL (`/* conn_tag:checkout_completion */`) integrados com o ProxySQL para traçar qual domínio de negócio estava segurando as conexões pela maior parte do tempo. Arrumar essas rotas destravou a escalabilidade das reservas de inventário de tabela.

---
**Solicitado por:** gustavo._henrique@hotmail.com
