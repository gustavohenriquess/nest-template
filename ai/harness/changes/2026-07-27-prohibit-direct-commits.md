---
id: ai.harness.prohibit-direct-commits
title: Proibição de Commits Diretos
kind: history
category: harness
status: active
audience:
  - developers
  - ai-agents
tags:
  - history-harness
  - rule
  - commits
related: []
---

<!-- ai:doc id="ai.harness.prohibit-direct-commits" category="harness" kind="history" status="active" -->
<!-- ai:tags history-harness rule commits -->
<!-- ai:audience developers ai-agents -->

# Proibição de Commits Diretos

## Objetivo da Mudança
O usuário solicitou que os agentes sejam proibidos de efetuar commits diretamente via terminal após finalizar uma atividade. Em vez disso, o agente deve sugerir ao usuário os comandos exatos de commit, garantindo uma separação granular atômica.

## Arquivos Modificados/Criados
- `[MODIFICADO] .agents/rules/commits.md`
- `[CRIADO] ai/harness/changes/2026-07-27-prohibit-direct-commits.md`

## Racional Técnico
Atualizamos o arquivo de regras de commits (`.agents/rules/commits.md`), adicionando uma restrição severa (Regra #5) que bane o uso autônomo do comando `git commit` pelos agentes. A regra os instrui a sempre fornecerem os blocos de comando de terminal (*snippets*) contendo `git add` com arquivos específicos e o respectivo `git commit`, deixando a execução final para o desenvolvedor humano.

Essa mudança aumenta a segurança, permitindo que o usuário valide todas as alterações e garantindo que arquivos soltos não entrem no contexto de forma desorganizada.

**Solicitado por:** gustavo._henrique@hotmail.com
