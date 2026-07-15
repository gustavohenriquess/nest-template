---
id: ai-harness.update-skill
title: Update History Harness Skill
kind: context
category: ai-harness
status: active
audience:
  - developers
  - ai-agents
tags:
  - ai-harness
  - history
  - documentation
related: []
---

<!-- ai:doc id="ai-harness.update-skill" category="ai-harness" kind="context" status="active" -->
<!-- ai:tags ai-harness history documentation -->

# Update History Harness Skill

<!-- ai:section id="ai-harness.update-skill.details" category="ai-harness" tags="history,documentation" -->

- **Objetivo da Mudança:** O usuário solicitou que a skill `history-harness` utilizasse o padrão de documentação estabelecido pela skill `documentation-standard` mantendo o rodapé de "Solicitado por: e-mail do git".
- **Arquivos Modificados/Criados:**
  - `[MODIFICADO] .agents/skills/history-harness/SKILL.md`
- **Racional Técnico:** Atualizei a regra na skill para exigir obrigatoriamente a presença do Frontmatter YAML, das tags de comentário `ai:doc` e `ai:tags` para unificar os padrões de histórico do agente com o padrão global de documentação do repositório.

**Solicitado por:** gustavo._henrique@exemplo.com

<!-- ai:doc-end id="ai-harness.update-skill" -->
