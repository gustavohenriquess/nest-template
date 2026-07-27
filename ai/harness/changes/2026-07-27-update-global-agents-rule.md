---
id: ai.harness.update-global-agents-rule
title: Atualização da Regra Global de Skills (History Harness)
kind: history
category: harness
status: active
audience:
  - developers
  - ai-agents
tags:
  - history-harness
  - rule
  - agents
related: []
---

<!-- ai:doc id="ai.harness.update-global-agents-rule" category="harness" kind="history" status="active" -->
<!-- ai:tags history-harness rule agents -->
<!-- ai:audience developers ai-agents -->

# Atualização da Regra Global de Skills (History Harness)

## Objetivo da Mudança
O usuário solicitou que, sempre que qualquer skill for utilizada pelo agente, independente da necessidade, explicação ou atividade, seja criado obrigatoriamente um histórico utilizando a skill `history-harness`.

## Arquivos Modificados/Criados
- `[MODIFICADO] .agents/AGENTS.md`
- `[CRIADO] ai/harness/changes/2026-07-27-update-global-agents-rule.md`

## Racional Técnico
Adicionamos uma **Regra Global de Skills** no índice principal `AGENTS.md`. Como o `AGENTS.md` é injetado sistematicamente no contexto primário do Antigravity IDE, colocar a regra em destaque garante que a instrução de gerar rastreabilidade seja seguida proativamente por mim ou meus subagentes. 

Dessa forma, toda execução de documentação ou orquestração (como o uso das skills `mermaid-flow` ou `domain-modeling`) desencadeará automaticamente o registro num documento deste exato formato, permitindo uma trilha de auditoria viva do que a inteligência artificial tem feito no projeto.

**Solicitado por:** gustavo._henrique@hotmail.com
